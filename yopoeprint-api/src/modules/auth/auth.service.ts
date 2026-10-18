import {
  Injectable, UnauthorizedException, BadRequestException,
  ConflictException, NotFoundException, Logger,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThan } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { randomBytes, createHash } from 'crypto'
import { User, UserRole } from '../users/user.entity'
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './auth.dto'
import { MailService } from '../mail/mail.service'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  private static readonly RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 h

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  // ─── Register ─────────────────────────────────────────────
  async register(dto: RegisterDto) {
    // Check email uniqueness
    const existing = await this.userRepo.findOne({ where: { email: dto.email } })
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé')
    }

    // Check phone uniqueness if provided
    if (dto.phone) {
      const existingPhone = await this.userRepo.findOne({ where: { phone: dto.phone } })
      if (existingPhone) {
        throw new ConflictException('Ce numéro de téléphone est déjà utilisé')
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12)

    // Create user
    const user = this.userRepo.create({
      firstName:    dto.firstName,
      lastName:     dto.lastName,
      email:        dto.email,
      phone:        dto.phone,
      passwordHash,
      role:         UserRole.CLIENT,
      loyaltyPoints: 0,
      addresses:    [],
    })

    await this.userRepo.save(user)

    // Generate tokens
    const tokens = await this.generateTokens(user)
    await this.storeRefreshToken(user.id, tokens.refreshToken)

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    }
  }

  // ─── Setup First Admin (init only) ────────────────────────
  async setupFirstAdmin(dto: RegisterDto) {
    // Check if any admin already exists
    const adminExists = await this.userRepo.findOne({ 
      where: { role: UserRole.ADMIN } 
    })

    if (adminExists) {
      throw new ConflictException('Un administrateur existe déjà dans le système')
    }

    // Check email uniqueness
    const existing = await this.userRepo.findOne({ where: { email: dto.email } })
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé')
    }

    // Check phone uniqueness if provided
    if (dto.phone) {
      const existingPhone = await this.userRepo.findOne({ where: { phone: dto.phone } })
      if (existingPhone) {
        throw new ConflictException('Ce numéro de téléphone est déjà utilisé')
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12)

    // Create ADMIN user
    const user = this.userRepo.create({
      firstName:    dto.firstName,
      lastName:     dto.lastName,
      email:        dto.email,
      phone:        dto.phone,
      passwordHash,
      role:         UserRole.ADMIN, // ← CREATE AS ADMIN
      loyaltyPoints: 0,
      addresses:    [],
    })

    await this.userRepo.save(user)

    // Generate tokens
    const tokens = await this.generateTokens(user)
    await this.storeRefreshToken(user.id, tokens.refreshToken)

    return {
      ...tokens,
      user: this.sanitizeUser(user),
      message: 'Administrateur créé avec succès! Vous pouvez maintenant vous connecter.',
    }
  }

  // ─── Login ────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } })

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email ou mot de passe incorrect')
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect')
    }

    const tokens = await this.generateTokens(user)
    await this.storeRefreshToken(user.id, tokens.refreshToken)

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    }
  }

  // ─── Refresh Tokens ───────────────────────────────────────
  async refreshTokens(refreshToken: string) {
    let payload: { sub?: string; typ?: string }
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      })
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré')
    }
    if (!payload?.sub || payload.typ !== 'refresh') {
      throw new UnauthorizedException('Token invalide')
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } })

    if (!user || !user.isActive || !user.refreshToken) {
      throw new UnauthorizedException('Accès refusé')
    }

    // Must match the last issued refresh token (rotation; logout revokes it)
    const matches = await bcrypt.compare(refreshToken, user.refreshToken)
    if (!matches) throw new UnauthorizedException('Token invalide')

    const tokens = await this.generateTokens(user)
    await this.storeRefreshToken(user.id, tokens.refreshToken)

    return tokens
  }

  // ─── Logout ───────────────────────────────────────────────
  async logout(userId: string) {
    await this.userRepo.update(userId, { refreshToken: null })
    return { message: 'Déconnecté avec succès' }
  }

  // ─── Get current user ────────────────────────────────────
  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException('Utilisateur introuvable')
    return this.sanitizeUser(user)
  }

  // ─── Forgot password ──────────────────────────────────────
  // Réponse identique que le compte existe ou non (pas d'énumération des emails)
  async forgotPassword(dto: ForgotPasswordDto) {
    const message = 'Si un compte est associé à cette adresse, un email de réinitialisation vient d\'être envoyé.'
    const user = await this.userRepo.findOne({ where: { email: dto.email.trim() } })
    if (!user || !user.isActive) return { message }

    const token = randomBytes(32).toString('hex')
    await this.userRepo.update(user.id, {
      passwordResetTokenHash: this.hashResetToken(token),
      passwordResetExpiresAt: new Date(Date.now() + AuthService.RESET_TOKEN_TTL_MS),
    })

    const frontendUrl = (this.configService.get<string>('app.frontendUrl') || 'http://localhost:3000').replace(/\/+$/, '')
    const resetUrl = `${frontendUrl}/reinitialiser-mot-de-passe?token=${token}`
    try {
      await this.mailService.sendPasswordReset(user.email, user.firstName, resetUrl)
    } catch (err: any) {
      this.logger.error(`Email de réinitialisation non envoyé : ${err?.message || err}`)
    }

    return { message }
  }

  // ─── Reset password (jeton à usage unique) ────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepo.findOne({
      where: {
        passwordResetTokenHash: this.hashResetToken(dto.token),
        passwordResetExpiresAt: MoreThan(new Date()),
      },
    })
    if (!user || !user.isActive) {
      throw new BadRequestException('Lien de réinitialisation invalide ou expiré. Faites une nouvelle demande.')
    }

    await this.userRepo.update(user.id, {
      passwordHash:           await bcrypt.hash(dto.newPassword, 12),
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      refreshToken:           null, // déconnecte les autres sessions
    })

    return { message: 'Mot de passe réinitialisé. Vous pouvez vous connecter.' }
  }

  // ─── Helpers ──────────────────────────────────────────────
  private hashResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex')
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret:    this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiresIn'),
      }),
      this.jwtService.signAsync({ ...payload, typ: 'refresh' }, {
        secret:    this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpires'),
      }),
    ])

    return { accessToken, refreshToken }
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const hashedRefresh = await bcrypt.hash(refreshToken, 10)
    await this.userRepo.update(userId, { refreshToken: hashedRefresh })
  }

  private sanitizeUser(user: User) {
    return {
      id:            user.id,
      email:         user.email,
      firstName:     user.firstName,
      lastName:      user.lastName,
      phone:         user.phone,
      role:          user.role,
      loyaltyPoints: user.loyaltyPoints,
      addresses:     user.addresses,
      createdAt:     user.createdAt,
    }
  }

  // ─── Validate user (used by Passport) ────────────────────
  async validateUser(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } })
    if (!user) return null
    const isValid = await bcrypt.compare(password, user.passwordHash)
    return isValid ? user : null
  }

  // ─── System Status ─────────────────────────────────────────
  async getSystemStatus() {
    const adminCount = await this.userRepo.count({ where: { role: UserRole.ADMIN } })
    const clientCount = await this.userRepo.count({ where: { role: UserRole.CLIENT } })
    const totalUsers = await this.userRepo.count()

    return {
      initialized: adminCount > 0,
      adminCount,
      clientCount,
      totalUsers,
      message: adminCount > 0 
        ? `Système initialisé. ${adminCount} administrateur(s) trouvé(s).`
        : 'Système non initialisé. Créez un administrateur pour commencer.',
    }
  }
}
