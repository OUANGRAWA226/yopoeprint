import {
  Controller, Get, Post, Patch,
  Body, Param, Query, UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { OrdersService } from './orders.service'
import {
  CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto, AttachDesignFileDto, AdminStatsQueryDto,
  UploadBatDto, ApproveBatDto, RejectBatDto,
} from './order.dto'
import { JwtAuthGuard }  from '../../common/guards/jwt-auth.guard'
import { AdminGuard }    from '../../common/guards/admin.guard'
import { CurrentUser }   from '../../common/decorators/current-user.decorator'

@ApiTags('Commandes')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // ── Public: track by order number ─────────────────────────
  @Get('track/:orderNumber')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // anti-énumération
  @ApiOperation({ summary: 'Suivre une commande (sans connexion)' })
  track(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber)
  }

  @Post('track/:orderNumber/bat/approve')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // anti-énumération
  @ApiOperation({ summary: 'Valider le BAT depuis le lien de suivi public' })
  trackApproveBat(
    @Param('orderNumber') orderNumber: string,
    @Body() dto: ApproveBatDto,
  ) {
    return this.ordersService.approveBatByOrderNumber(orderNumber, dto)
  }

  @Post('track/:orderNumber/bat/reject')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // anti-énumération
  @ApiOperation({ summary: 'Demander des corrections BAT depuis le lien de suivi public' })
  trackRejectBat(
    @Param('orderNumber') orderNumber: string,
    @Body() dto: RejectBatDto,
  ) {
    return this.ordersService.rejectBatByOrderNumber(orderNumber, dto)
  }

  // ── Authenticated client routes ────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une commande' })
  create(@CurrentUser() user, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto)
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mes commandes' })
  myOrders(@CurrentUser() user, @Query() query: OrderQueryDto) {
    return this.ordersService.findByUser(user.id, query)
  }

  @Get('my-orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Détail d\'une commande' })
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.ordersService.findByIdForUser(id, user)
  }

  @Patch('my-orders/:id/design-file')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Joindre le fichier d'impression aux articles qui n'en ont pas" })
  attachDesignFile(@Param('id') id: string, @CurrentUser() user, @Body() dto: AttachDesignFileDto) {
    return this.ordersService.attachDesignFile(id, user, dto.designFileUrl)
  }

  @Post(':id/bat/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Valider le BAT (Client connecté)' })
  approveBat(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() dto: ApproveBatDto,
  ) {
    return this.ordersService.approveBat(id, user, dto)
  }

  @Post(':id/bat/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Demander des corrections sur le BAT (Client connecté)' })
  rejectBat(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() dto: RejectBatDto,
  ) {
    return this.ordersService.rejectBat(id, user, dto)
  }

  // ── Admin routes ───────────────────────────────────────────

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Indicateurs du tableau de bord (CA, commandes, paiements, atelier)' })
  adminStats(@Query() query: AdminStatsQueryDto) {
    return this.ordersService.getAdminStats(query.days)
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Toutes les commandes' })
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query)
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Mettre à jour le statut d\'une commande' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto)
  }

  @Post(':id/bat')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Déposer / Mettre à disposition le BAT client' })
  uploadBat(
    @Param('id') id: string,
    @Body() dto: UploadBatDto,
  ) {
    return this.ordersService.uploadBat(id, dto)
  }
}

