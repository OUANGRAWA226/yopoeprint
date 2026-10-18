import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { ResellerService } from './reseller.service'
import {
  ResellerApplyDto, UpdateWhiteLabelDto, AdminResellerQueryDto, AdminResellerDecisionDto,
} from './reseller.dto'
import { JwtAuthGuard }   from '../../common/guards/jwt-auth.guard'
import { AdminGuard }     from '../../common/guards/admin.guard'
import { ResellerGuard }  from '../../common/guards/reseller.guard'
import { CurrentUser }    from '../../common/decorators/current-user.decorator'

@ApiTags('Revendeurs')
@Controller('reseller')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ResellerController {
  constructor(private resellerService: ResellerService) {}

  @Post('apply')
  @Throttle({ default: { limit: 5, ttl: 60 * 60_000 } })
  @ApiOperation({ summary: 'Demander à devenir revendeur (compte client connecté)' })
  apply(@CurrentUser() user, @Body() dto: ResellerApplyDto) {
    return this.resellerService.apply(user.id, dto)
  }

  @Get('me')
  @ApiOperation({ summary: 'Statut revendeur, palier et identité marque blanche' })
  me(@CurrentUser() user) {
    return this.resellerService.getMe(user.id)
  }

  @Get('stats')
  @UseGuards(ResellerGuard)
  @ApiOperation({ summary: '[REVENDEUR] Indicateurs du tableau de bord' })
  stats(@CurrentUser() user) {
    return this.resellerService.getStats(user.id)
  }

  @Patch('white-label')
  @UseGuards(ResellerGuard)
  @ApiOperation({ summary: '[REVENDEUR] Identité d\'expédition en marque blanche' })
  updateWhiteLabel(@CurrentUser() user, @Body() dto: UpdateWhiteLabelDto) {
    return this.resellerService.updateWhiteLabel(user.id, dto)
  }
}

@ApiTags('Administration - Revendeurs')
@Controller('admin/resellers')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminResellerController {
  constructor(private resellerService: ResellerService) {}

  @Get()
  @ApiOperation({ summary: '[ADMIN] Demandes et comptes revendeurs' })
  list(@Query() query: AdminResellerQueryDto) {
    return this.resellerService.listForAdmin(query)
  }

  @Patch(':id')
  @ApiOperation({ summary: '[ADMIN] Valider, refuser ou suspendre un revendeur' })
  decide(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AdminResellerDecisionDto) {
    return this.resellerService.decide(id, dto.action)
  }
}
