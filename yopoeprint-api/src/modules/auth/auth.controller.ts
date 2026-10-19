import {
  Controller, Post, Get, Body,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import {
  RegisterDto, SetupAdminDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto,
  CheckEmailDto, GoogleAuthDto, GoogleCompleteDto,
} from './auth.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { AdminGuard } from '../../common/guards/admin.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Throttle } from '@nestjs/throttler'

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Créer un nouveau compte client' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  // Étape 1 de l'inscription (connexion ou création). Limité pour freiner l'énumération des adresses.
  @Post('check-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Indique si une adresse a déjà un compte (étape 1 de l\'inscription)' })
  checkEmail(@Body() dto: CheckEmailDto) {
    return this.authService.checkEmail(dto.email)
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Continuer avec Google : connexion si le compte existe, sinon profil à compléter' })
  google(@Body() dto: GoogleAuthDto) {
    return this.authService.googleAuth(dto.credential)
  }

  @Post('google/complete')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Créer le compte d\'un nouvel utilisateur Google (profil de l\'étape 3)' })
  googleComplete(@Body() dto: GoogleCompleteDto) {
    return this.authService.googleComplete(dto)
  }

  @Post('setup-first-admin')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: '[INIT ONLY] Créer le premier administrateur du système' })
  async setupFirstAdmin(@Body() dto: SetupAdminDto) {
    return this.authService.setupFirstAdmin(dto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentatives/minute
  @ApiOperation({ summary: 'Se connecter' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Renouveler le token d\'accès' })
  async refresh(@Body() dto: RefreshTokenDto) {
    // userId is read from the refresh token itself, verified with the refresh secret
    return this.authService.refreshTokens(dto.refreshToken)
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 15 * 60_000 } }) // 3 demandes / 15 min / IP
  @ApiOperation({ summary: 'Recevoir un lien de réinitialisation du mot de passe' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto)
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 15 * 60_000 } })
  @ApiOperation({ summary: 'Définir un nouveau mot de passe avec le jeton reçu par email' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto)
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Se déconnecter' })
  async logout(@CurrentUser() user) {
    return this.authService.logout(user.id)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir le profil de l\'utilisateur connecté' })
  async getMe(@CurrentUser() user) {
    return this.authService.getMe(user.id)
  }

  @Get('system-status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Vérifier l\'état du système' })
  async getSystemStatus() {
    return this.authService.getSystemStatus()
  }
}
