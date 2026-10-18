import { Controller, Get, Put, Body, UseGuards, Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { PlatformSettingsRow } from './platform-settings.entity'
import { SettingsService } from './settings.service'
import { UpdateSettingsDto } from './settings.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { AdminGuard, SuperAdminGuard } from '../../common/guards/admin.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Audit } from '../audit/audit.decorator'

@ApiTags('Paramètres')
@Controller()
export class SettingsController {
  constructor(private settings: SettingsService) {}

  @Get('settings/public')
  @ApiOperation({ summary: 'Paramètres utiles à la boutique (zones, paliers, contact, maintenance)' })
  getPublic() {
    return this.settings.getPublic()
  }

  @Get('admin/settings')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[BACK-OFFICE] Paramètres de la plateforme (lecture)' })
  get() {
    return this.settings.getWithMeta()
  }

  @Put('admin/settings')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Audit('settings.update', 'settings')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[SUPERADMIN] Modifier les paramètres de la plateforme' })
  update(@Body() dto: UpdateSettingsDto, @CurrentUser() actor) {
    return this.settings.update(dto, actor.id)
  }
}

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PlatformSettingsRow])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
