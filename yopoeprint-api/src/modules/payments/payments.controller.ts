import {
  Controller, Post, Get, Param, Body, Query, UseGuards, HttpCode, HttpStatus, Headers, ParseUUIDPipe,
} from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength, MaxLength } from 'class-validator'
import { Transform } from 'class-transformer'
import { PaymentsService } from './payments.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { AdminGuard, ManagerGuard } from '../../common/guards/admin.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Audit } from '../audit/audit.decorator'

export class MarkPaidDto {
  @ApiProperty({ example: 'Virement BOA du 18/10, réf. 4521' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString() @MinLength(3, { message: 'Indiquez une référence d\'encaissement (3 caractères min.)' }) @MaxLength(120)
  reference: string
}

@ApiTags('Paiements')
@Controller()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('payments/:orderId/init')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialiser un paiement CinetPay pour une commande' })
  initPayment(@Param('orderId') orderId: string, @CurrentUser() user) {
    return this.paymentsService.initPayment(orderId, user.id)
  }

  @Get('payments/:orderId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Statut du paiement d\'une commande' })
  getStatus(@Param('orderId') orderId: string, @CurrentUser() user) {
    return this.paymentsService.getPaymentStatus(orderId, user)
  }

  // CinetPay webhook — no auth guard (CinetPay calls this directly)
  @Post('payments/webhook')
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook CinetPay — ne pas appeler manuellement' })
  webhook(@Body() payload: any, @Headers('x-token') xToken?: string) {
    return this.paymentsService.handleWebhook(payload, xToken)
  }

  // CinetPay pings the notify_url with GET to check availability
  @Get('payments/webhook')
  @SkipThrottle()
  @ApiOperation({ summary: 'Ping de disponibilité du webhook CinetPay' })
  webhookPing() {
    return { status: 'ok' }
  }

  // Réservé au back-office : un client n'a pas à interroger CinetPay sur une transaction quelconque
  @Get('payments/verify/:transactionId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[BACK-OFFICE] Vérifier un paiement auprès de CinetPay' })
  verify(@Param('transactionId') transactionId: string) {
    return this.paymentsService.verifyPayment(transactionId)
  }

  // ─── Admin : rapprochement ───────────────────────────────
  @Get('admin/payments/overview')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[BACK-OFFICE] Synthèse des paiements (7 jours) et points à traiter' })
  overview() {
    return this.paymentsService.overview()
  }

  @Get('admin/payments/issues')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[BACK-OFFICE] Paiements en attente prolongée, échoués, virements à encaisser' })
  issues() {
    return this.paymentsService.issues()
  }

  @Get('admin/payments/events')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[BACK-OFFICE] Journal des paiements' })
  events(@Query('type') type?: string, @Query('orderId') orderId?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.paymentsService.listEvents({ type, orderId, page: Number(page), limit: Number(limit) })
  }

  @Post('admin/payments/:orderId/recheck')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Audit('payment.recheck', 'order')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[BACK-OFFICE] Revérifier le paiement CinetPay d\'une commande' })
  recheck(@Param('orderId', ParseUUIDPipe) orderId: string, @CurrentUser() user) {
    return this.paymentsService.recheck(orderId, user)
  }

  @Post('admin/payments/:orderId/mark-paid')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Audit('payment.manual', 'order')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Enregistrer un encaissement hors CinetPay (virement, espèces)' })
  markPaid(@Param('orderId', ParseUUIDPipe) orderId: string, @Body() dto: MarkPaidDto, @CurrentUser() user) {
    return this.paymentsService.markPaid(orderId, dto.reference, user)
  }
}
