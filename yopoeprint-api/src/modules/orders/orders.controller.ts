import {
  Controller, Get, Post, Patch,
  Body, Param, Query, UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { OrdersService } from './orders.service'
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './order.dto'
import { JwtAuthGuard }  from '../../common/guards/jwt-auth.guard'
import { AdminGuard }    from '../../common/guards/admin.guard'
import { CurrentUser }   from '../../common/decorators/current-user.decorator'

@ApiTags('Commandes')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // ── Public: track by order number ─────────────────────────
  @Get('track/:orderNumber')
  @ApiOperation({ summary: 'Suivre une commande (sans connexion)' })
  track(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber)
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
  findOne(@Param('id') id: string) {
    return this.ordersService.findById(id)
  }

  // ── Admin routes ───────────────────────────────────────────

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
}
