import {
  Controller, Post, Get, Body, Delete,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { RegisterDto, LoginDto, RefreshTokenDto } from './auth.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Throttle } from '@nestjs/throttler'

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Créer un nouveau compte client' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('setup-first-admin')
  @HttpCode(HttpStatus.OK)
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
  @ApiOperation({ summary: 'Renouveler le token d\'accès' })
  async refresh(@Body() dto: RefreshTokenDto, @Request() req) {
    // userId from a limited JWT
    return this.authService.refreshTokens(req.user?.sub, dto.refreshToken)
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
  @ApiOperation({ summary: 'Vérifier l\'état du système (dev only)' })
  async getSystemStatus() {
    return this.authService.getSystemStatus()
  }

  @Delete('reset-admins')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[DEV ONLY] Supprimer tous les admins pour reconfiguration' })
  async resetAdmins() {
    return this.authService.resetAdmins()
  }
}
