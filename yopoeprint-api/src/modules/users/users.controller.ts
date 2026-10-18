import {
  Controller, Post, Get, Patch,
  Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { UsersService } from './users.service'
import {
  AdminUsersQueryDto, AdminUpdateUserDto,
  CreateTeamMemberDto, SetTeamRoleDto, SetTeamActiveDto,
} from './user.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { AdminGuard, ManagerGuard, SuperAdminGuard } from '../../common/guards/admin.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Audit } from '../audit/audit.decorator'

@ApiTags('Administration - Utilisateurs')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '[BACK-OFFICE] Lister les utilisateurs (clients par défaut) avec leurs statistiques' })
  findAll(@Query() query: AdminUsersQueryDto) {
    return this.usersService.findAllForAdmin(query)
  }

  @Get(':id')
  @ApiOperation({ summary: "[BACK-OFFICE] Détail d'un utilisateur, ses adresses et ses commandes" })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOneForAdmin(id)
  }

  @Patch(':id')
  @UseGuards(ManagerGuard)
  @Audit('user.update', 'user')
  @ApiOperation({ summary: '[ADMIN] Activer / désactiver un client' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
    @CurrentUser() actor,
  ) {
    return this.usersService.updateForAdmin(id, dto, actor)
  }
}

@ApiTags('Administration - Équipe')
@Controller('admin/team')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@ApiBearerAuth()
export class TeamController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '[SUPERADMIN] Comptes du back-office' })
  list() {
    return this.usersService.listTeam()
  }

  @Post()
  @Audit('team.create', 'user')
  @ApiOperation({ summary: '[SUPERADMIN] Créer un compte superadmin, admin ou staff' })
  create(@Body() dto: CreateTeamMemberDto) {
    return this.usersService.createTeamMember(dto)
  }

  @Patch(':id/role')
  @Audit('team.role', 'user')
  @ApiOperation({ summary: "[SUPERADMIN] Changer le rôle d'un membre (client = retirer de l'équipe)" })
  setRole(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SetTeamRoleDto, @CurrentUser() actor) {
    return this.usersService.setTeamRole(id, dto.role, actor.id)
  }

  @Patch(':id/active')
  @Audit('team.active', 'user')
  @ApiOperation({ summary: "[SUPERADMIN] Activer / désactiver un membre de l'équipe" })
  setActive(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SetTeamActiveDto, @CurrentUser() actor) {
    return this.usersService.setTeamActive(id, dto.isActive, actor.id)
  }
}
