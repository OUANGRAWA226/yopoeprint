import {
  Injectable, UnauthorizedException, BadRequestException,
  ConflictException, NotFoundException, Logger, ServiceUnavailableException, ForbiddenException,
} from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThan } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { randomBytes, createHash, timingSafeEqual } from 'crypto'
import { User, UserRole, BACK_OFFICE_ROLES } from '../users/user.entity'
import { In } from 'typeorm'
import { RegisterDto, SetupAdminDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, GoogleCompleteDto } from './auth.dto'
import { emailEquals, phoneEquals } from '../../common/identity'
import { MailService } from '../mail/mail.service'
import { SessionsService } from '../sessions/sessions.service'
import { v4 as uuidv4 } from 'uuid'

// Âge minimum pour ouvrir un compte client
const MIN_ACCOUNT_AGE = 13

// « 30d », « 12h », « 15m », « 900s » ou un nombre de secondes (format des durées JWT)
export function durationToMs(value: string | number | undefined, fallback: number): number {
  if (typeof value === 'number') return value * 1000
  const m = /^(\d+)\s*([smhd]?)$/.exec(String(value ?? '').trim())
  if (!m) return fallback
  const unit = { '': 1000, s: 1000, m: 60_000, h: 3600_000, d: 86_400_000 }[m[2]]
  return Number(m[1]) * unit
}

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
    private sessions: SessionsService,
  ) {}

  // ─── Register ─────────────────────────────────────────────
  async register(dto: RegisterDto) {
    return this.createClientAccount({ ...dto, passwordHash: await bcrypt.hash(dto.password, 12), emailVerified: false })
  }

  // ─── Étape 1 de l'inscription : compte existant ? ────────
  // Permet d'orienter vers la connexion ou la création de compte (limité en fréquence par le contrôleur)
  async checkEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email: emailEquals(email) } })
    return { exists: !!user && user.isActive }
  }

  // ─── Continuer avec Google ────────────────────────────────
  // Compte existant (même email) : connexion. Sinon : l'inscription se poursuit à l'étape 3 (profil).
  async googleAuth(credential: string) {
    const google = await this.verifyGoogleCredential(credential)
    const user = await this.userRepo.findOne({ where: { email: emailEquals(google.email) } })
    if (user) {
      if (!user.isActive) throw new UnauthorizedException('Ce compte est désactivé')
      if (!user.emailVerified) await this.userRepo.update(user.id, { emailVerified: true })
      const tokens = await this.issueSession(user)
      return { status: 'logged_in' as const, ...tokens, user: this.sanitizeUser(user) }
    }
    return { status: 'needs_profile' as const, email: google.email, firstName: google.firstName, lastName: google.lastName }
  }

  async googleComplete(dto: GoogleCompleteDto) {
    const google = await this.verifyGoogleCredential(dto.credential)
    // Pas de mot de passe : valeur aléatoire inutilisable ; « Mot de passe oublié » permet d'en définir un
    const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12)
    return this.createClientAccount({ ...dto, email: google.email, passwordHash, emailVerified: true })
  }

  // Création d'un compte client (formulaire ou Google) : unicité, date de naissance, CGV, email de bienvenue
  private async createClientAccount(data: {
    email: string; firstName: string; lastName: string; phone?: string; birthDate: string
    passwordHash: string; emailVerified: boolean
  }) {
    if (await this.userRepo.findOne({ where: { email: emailEquals(data.email) } })) {
      throw new ConflictException('Cet email est déjà utilisé')
    }
    if (data.phone && await this.userRepo.findOne({ where: { phone: phoneEquals(data.phone) } })) {
      throw new ConflictException('Ce numéro de téléphone est déjà utilisé')
    }
    this.assertBirthDate(data.birthDate)

    const user = this.userRepo.create({
      firstName:     data.firstName,
      lastName:      data.lastName,
      email:         data.email,
      phone:         data.phone,
      birthDate:     data.birthDate,
      passwordHash:  data.passwordHash,
      emailVerified: data.emailVerified,
      role:          UserRole.CLIENT,
      loyaltyPoints: 0,
      addresses:     [],
      // Preuve de l'acceptation des CGV et de la politique de confidentialité (case cochée à l'inscription)
      termsAcceptedAt: new Date(),
    })
    await this.userRepo.save(user)

    // Email de bienvenue : un échec d'envoi ne doit pas empêcher l'inscription (journalisé dans admin › Emails)
    this.mailService.sendWelcome(user.email, user.firstName).catch(() => undefined)

    const tokens = await this.issueSession(user)
    return { ...tokens, user: this.sanitizeUser(user) }
  }

  // Date réelle, pas dans le futur, et âge minimum pour ouvrir un compte en ligne
  private assertBirthDate(value: string) {
    const date = new Date(`${value}T00:00:00Z`)
    if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value || date.getUTCFullYear() < 1900) {
      throw new BadRequestException('Date de naissance invalide')
    }
    const minAgeDate = new Date()
    minAgeDate.setUTCFullYear(minAgeDate.getUTCFullYear() - MIN_ACCOUNT_AGE)
    if (date > minAgeDate) {
      throw new BadRequestException(`Vous devez avoir au moins ${MIN_ACCOUNT_AGE} ans pour créer un compte`)
    }
  }

  /**
   * Vérifie le jeton Google auprès de Google (tokeninfo) : destinataire = notre client OAuth,
   * émetteur Google, email vérifié, jeton non expiré. Le contenu envoyé par le navigateur n'est jamais cru tel quel.
   */
  private googleClient: OAuth2Client | null = null

  // Installation du premier administrateur : code ADMIN_SETUP_TOKEN exigé dès qu'il est défini,
  // et obligatoire en production (sans lui, la route est fermée)
  private assertSetupToken(token?: string) {
    const expected = this.configService.get<string>('ADMIN_SETUP_TOKEN')
    if (!expected) {
      if (this.configService.get('app.nodeEnv') === 'production') {
        throw new ForbiddenException('Installation fermée : définissez ADMIN_SETUP_TOKEN sur le serveur')
      }
      return
    }
    const received = Buffer.from(String(token ?? ''), 'utf8')
    const wanted = Buffer.from(expected, 'utf8')
    if (received.length !== wanted.length || !timingSafeEqual(received, wanted)) {
      throw new ForbiddenException('Code d\'installation invalide')
    }
  }

  // Vérification du jeton « Se connecter avec Google » par la librairie officielle de Google :
  // signature (clés publiques de Google), destinataire (notre identifiant client), émetteur et expiration.
  private async verifyGoogleCredential(credential: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID')
    if (!clientId) throw new ServiceUnavailableException('La connexion avec Google n\'est pas encore disponible')
    if (!this.googleClient) {
      // GOOGLE_CERTS_URL : uniquement pour les tests (clés d'un faux Google)
      const certsUrl = this.configService.get<string>('GOOGLE_CERTS_URL')
      this.googleClient = new OAuth2Client({ clientId, ...(certsUrl ? { endpoints: { oauth2FederatedSignonPemCertsUrl: certsUrl } } : {}) })
    }
    let info: Record<string, any> | undefined
    try {
      const ticket = await this.googleClient.verifyIdToken({ idToken: credential, audience: clientId })
      info = ticket.getPayload()
    } catch {
      throw new UnauthorizedException('Connexion Google refusée, réessayez')
    }
    if (!info?.email || info.email_verified !== true) {
      throw new UnauthorizedException('Connexion Google refusée, réessayez')
    }
    return {
      email: String(info.email).trim().toLowerCase(),
      firstName: String(info.given_name || '').slice(0, 50),
      lastName: String(info.family_name || '').slice(0, 50),
    }
  }

  // ─── Setup First Admin (init only) ────────────────────────
  async setupFirstAdmin(dto: SetupAdminDto) {
    this.assertSetupToken(dto.setupToken)

    // Installation unique : refusée dès qu'un compte d'équipe existe
    const adminExists = await this.userRepo.findOne({
      where: { role: In(BACK_OFFICE_ROLES) },
    })

    if (adminExists) {
      throw new ConflictException('Un administrateur existe déjà dans le système')
    }

    // Check email uniqueness
    const existing = await this.userRepo.findOne({ where: { email: emailEquals(dto.email) } })
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé')
    }

    // Check phone uniqueness if provided
    if (dto.phone) {
      const existingPhone = await this.userRepo.findOne({ where: { phone: phoneEquals(dto.phone) } })
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
      role:         UserRole.SUPERADMIN, // le premier compte gère l'équipe et les paramètres
      loyaltyPoints: 0,
      addresses:    [],
    })

    await this.userRepo.save(user)

    // Generate tokens
    const tokens = await this.issueSession(user)

    return {
      ...tokens,
      user: this.sanitizeUser(user),
      message: 'Administrateur créé avec succès! Vous pouvez maintenant vous connecter.',
    }
  }

  // ─── Login ────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: emailEquals(dto.email) } })

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email ou mot de passe incorrect')
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect')
    }

    const tokens = await this.issueSession(user)

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    }
  }

  // ─── Refresh Tokens ───────────────────────────────────────
  // Rotation : chaque renouvellement remplace le jeton de la session. Un ancien jeton
  // présenté à nouveau (copié par un tiers) ferme la session.
  async refreshTokens(refreshToken: string) {
    let payload: { sub?: string; sid?: string; typ?: string }
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      })
    } catch {
      throw new UnauthorizedException('Session expirée. Veuillez vous reconnecter.')
    }
    // Sans « sid » : jeton émis avant les sessions multiples, reconnexion requise
    if (!payload?.sub || !payload.sid || payload.typ !== 'refresh') {
      throw new UnauthorizedException('Session expirée. Veuillez vous reconnecter.')
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } })
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Accès refusé')
    }

    const check = await this.sessions.verify(payload.sid, user.id, refreshToken)
    if (check === 'reused') {
      this.logger.warn(`Jeton de renouvellement réutilisé : session ${payload.sid} fermée (compte ${user.id})`)
    }
    if (check !== 'ok') throw new UnauthorizedException('Session expirée. Veuillez vous reconnecter.')

    return this.signTokens(user, payload.sid)
  }

  // ─── Logout ───────────────────────────────────────────────
  // Ferme uniquement la session de cet appareil
  async logout(userId: string, sessionId?: string) {
    if (sessionId) await this.sessions.revoke(sessionId, userId)
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
    const user = await this.userRepo.findOne({ where: { email: emailEquals(dto.email) } })
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
    })
    await this.sessions.revokeAll(user.id) // déconnecte tous les appareils

    return { message: 'Mot de passe réinitialisé. Vous pouvez vous connecter.' }
  }

  // ─── Helpers ──────────────────────────────────────────────
  private hashResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex')
  }

  // Nouvelle session (connexion, inscription) : une par appareil, sans limite de nombre
  private async issueSession(user: User) {
    const session = await this.sessions.open(user.id, this.refreshTtlMs())
    return this.signTokens(user, session.id)
  }

  // Jetons liés à la session : l'accès (court) et le renouvellement (enregistré, tournant)
  private async signTokens(user: User, sid: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: user.id, email: user.email, role: user.role, sid }, {
        secret:    this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiresIn'),
      }),
      this.jwtService.signAsync({ sub: user.id, sid, typ: 'refresh' }, {
        secret:    this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpires'),
        // Deux renouvellements dans la même seconde donneraient sinon le même jeton
        jwtid:     randomBytes(8).toString('hex'),
      }),
    ])
    await this.sessions.setToken(sid, refreshToken, this.refreshTtlMs())
    return { accessToken, refreshToken }
  }

  private refreshTtlMs() {
    return durationToMs(this.configService.get<string>('jwt.refreshExpires'), 30 * 24 * 3600_000)
  }

  private sanitizeUser(user: User) {
    return {
      id:            user.id,
      email:         user.email,
      firstName:     user.firstName,
      lastName:      user.lastName,
      phone:         user.phone,
      birthDate:     user.birthDate,
      role:          user.role,
      loyaltyPoints: user.loyaltyPoints,
      addresses:     user.addresses,
      companyName:   user.companyName,
      resellerStatus: user.resellerStatus,
      createdAt:     user.createdAt,
    }
  }

  // ─── Validate user (used by Passport) ────────────────────
  async validateUser(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email: emailEquals(email) } })
    if (!user) return null
    const isValid = await bcrypt.compare(password, user.passwordHash)
    return isValid ? user : null
  }

  // ─── System Status ─────────────────────────────────────────
  async getSystemStatus() {
    const adminCount = await this.userRepo.count({ where: { role: In(BACK_OFFICE_ROLES) } })
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
