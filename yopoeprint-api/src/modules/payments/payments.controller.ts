import {
  Controller, Get, Post, Body, Param,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { PaymentsService } from './payments.service'
import { JwtAuthGuard }  from '../../common/guards/jwt-auth.guard'
import { CurrentUser }   from '../../common/decorators/current-user.decorator'

@ApiTags('Paiements')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // ── Init payment (authenticated) ──────────────────────────
  @Post(':orderId/init')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialiser un paiement CinetPay pour une commande' })
  initPayment(@Param('orderId') orderId: string, @CurrentUser() user) {
    return this.paymentsService.initPayment(orderId, user.id)
  }

  // ── Get payment status ────────────────────────────────────
  @Get(':orderId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Statut du paiement d\'une commande' })
  getStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentStatus(orderId)
  }

  // ── CinetPay Webhook (called by CinetPay server) ──────────
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook CinetPay — ne pas appeler manuellement' })
  webhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(payload)
  }

  // ── Manual verify ─────────────────────────────────────────
  @Get('verify/:transactionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vérifier manuellement un paiement' })
  verify(@Param('transactionId') transactionId: string) {
    return this.paymentsService.verifyPayment(transactionId)
  }
}
