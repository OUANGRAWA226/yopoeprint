import {
  Controller, Post, Get, Body,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import {
  RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto,
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

  @Post('setup-first-admin')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: '[INIT ONLY] Créer le premier administrateur du système' })
  async setupFirstAdmin(@Body() dto: RegisterDto) {
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
