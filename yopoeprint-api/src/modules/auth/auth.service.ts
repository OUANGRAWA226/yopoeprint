import {
  Injectable, UnauthorizedException,
  ConflictException, NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { User, UserRole } from '../users/user.entity'
import { RegisterDto, LoginDto } from './auth.dto'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
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

    // Save hashed refresh token
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 10)
    await this.userRepo.update(user.id, { refreshToken: hashedRefresh })

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    }
  }

  // ─── Refresh Tokens ───────────────────────────────────────
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } })

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Accès refusé')
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshToken)
    if (!matches) throw new UnauthorizedException('Token invalide')

    const tokens = await this.generateTokens(user)
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 10)
    await this.userRepo.update(user.id, { refreshToken: hashedRefresh })

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

  // ─── Helpers ──────────────────────────────────────────────
  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret:    this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret:    this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpires'),
      }),
    ])

    return { accessToken, refreshToken }
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

  // ─── Reset Admins (dev only) ──────────────────────────────
  async resetAdmins() {
    if (this.configService.get('app.nodeEnv') !== 'development') {
      throw new Error('Cette action est réservée au développement')
    }

    const admins = await this.userRepo.find({ where: { role: UserRole.ADMIN } })
    
    for (const admin of admins) {
      await this.userRepo.remove(admin)
    }

    return {
      success: true,
      message: `${admins.length} administrateur(s) supprimé(s). Vous pouvez maintenant créer un nouveau compte admin.`,
      deletedAdmins: admins.length,
    }
  }
}
