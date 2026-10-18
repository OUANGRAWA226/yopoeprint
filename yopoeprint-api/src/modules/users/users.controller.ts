import {
  Controller, Post, Get, Patch,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User, UserRole } from './user.entity'
import { UsersService } from './users.service'
import { AdminUsersQueryDto, AdminUpdateUserDto } from './user.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { AdminGuard } from '../../common/guards/admin.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import * as bcrypt from 'bcryptjs'

@ApiTags('Administration - Utilisateurs')
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private usersService: UsersService,
  ) {}

  /**
   * Créer un nouvel administrateur (admin uniquement)
   */
  @Post('create-admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[ADMIN] Créer un nouvel administrateur' })
  async createAdmin(@Body() dto: {
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
  }) {
    // Vérifier si l'email existe déjà
    const existing = await this.userRepo.findOne({ where: { email: dto.email } })
    if (existing) {
      return {
        success: false,
        message: 'Cet email est déjà utilisé',
        user: null,
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12)

    // Créer l'admin
    const user = this.userRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: UserRole.ADMIN,
      loyaltyPoints: 0,
      addresses: [],
      isActive: true,
    })

    await this.userRepo.save(user)

    return {
      success: true,
      message: 'Administrateur créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    }
  }

  /**
   * Obtenir tous les utilisateurs (admin uniquement)
   */
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Lister les utilisateurs (clients par défaut) avec leurs statistiques' })
  findAll(@Query() query: AdminUsersQueryDto) {
    return this.usersService.findAllForAdmin(query)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Détail d\'un utilisateur, ses adresses et ses commandes' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOneForAdmin(id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Activer / désactiver un utilisateur' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
    @CurrentUser() currentUser,
  ) {
    return this.usersService.updateForAdmin(id, dto, currentUser.id)
  }

  /**
   * Promouvoir un utilisateur en admin
   */
  @Patch(':id/promote-admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Promouvoir un utilisateur en administrateur' })
  async promoteToAdmin(@Param('id') id: string) {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) {
      return { success: false, message: 'Utilisateur introuvable' }
    }

    user.role = UserRole.ADMIN
    await this.userRepo.save(user)

    return {
      success: true,
      message: 'Utilisateur promu en administrateur',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    }
  }

  /**
   * Désactiver un utilisateur
   */
  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Désactiver un utilisateur' })
  async deactivate(@Param('id') id: string) {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) {
      return { success: false, message: 'Utilisateur introuvable' }
    }

    user.isActive = false
    await this.userRepo.save(user)

    return {
      success: true,
      message: 'Utilisateur désactivé',
    }
  }
}
