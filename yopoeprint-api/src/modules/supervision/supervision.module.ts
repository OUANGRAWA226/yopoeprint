import { Controller, Get, Query, Res, UseGuards, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { Response } from 'express'
import { SupervisionService } from './supervision.service'
import { Order } from '../orders/order.entity'
import { Quote } from '../quotes/quote.entity'
import { User } from '../users/user.entity'
import { EmailLog } from '../mail/email-log.entity'
import { PaymentEvent } from '../payments/payment-event.entity'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { AdminGuard, ManagerGuard } from '../../common/guards/admin.guard'
import { Audit } from '../audit/audit.decorator'

@ApiTags('Supervision')
@Controller('admin')
export class SupervisionController {
  constructor(private supervision: SupervisionService) {}

  @Get('alerts')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[BACK-OFFICE] Points à traiter (tableau de bord)' })
  alerts() {
    return this.supervision.alerts()
  }

  // Exports : données personnelles des clients → réservés aux gestionnaires et inscrits au journal
  @Get('exports/orders.csv')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Audit('export.orders', 'export')
  @ApiBearerAuth()
  @ApiQuery({ name: 'from', required: false, example: '2026-10-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-10-31' })
  @ApiOperation({ summary: '[ADMIN] Export CSV des commandes (30 derniers jours par défaut, un an max)' })
  async ordersCsv(@Query('from') from: string, @Query('to') to: string, @Res({ passthrough: true }) res: Response) {
    const { csv, filename } = await this.supervision.ordersCsv(from, to)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return csv
  }

  @Get('exports/clients.csv')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Audit('export.clients', 'export')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Export CSV des comptes clients et de leur CA payé' })
  async clientsCsv(@Res({ passthrough: true }) res: Response) {
    const { csv, filename } = await this.supervision.clientsCsv()
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return csv
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Order, Quote, User, EmailLog, PaymentEvent])],
  controllers: [SupervisionController],
  providers: [SupervisionService],
})
export class SupervisionModule {}
