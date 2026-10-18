import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { createHmac, timingSafeEqual } from 'crypto'
import { PaymentStatus } from '../orders/order.entity'
import { OrdersService } from '../orders/orders.service'
import { v4 as uuidv4 } from 'uuid'

const PAYMENT_CURRENCY = 'XOF' // Franc CFA BCEAO

// Fields concatenated (in this order) to compute CinetPay's x-token HMAC
const CINETPAY_TOKEN_FIELDS = [
  'cpm_site_id', 'cpm_trans_id', 'cpm_trans_date', 'cpm_amount', 'cpm_currency',
  'signature', 'payment_method', 'cel_phone_num', 'cpm_phone_prefixe',
  'cpm_language', 'cpm_version', 'cpm_payment_config', 'cpm_page_action',
  'cpm_custom', 'cpm_designation', 'cpm_error_message',
]

interface CinetPayCheckResult {
  code:      string
  status?:   string // ACCEPTED | REFUSED | PENDING ...
  amount?:   number
  currency?: string
}

export interface InitPaymentResult {
  paymentUrl:   string
  transactionId: string
  token:        string
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name)

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
  ) {}

  // ─── Initialize CinetPay Payment ─────────────────────────
  async initPayment(orderId: string, userId: string): Promise<InitPaymentResult> {
    const order = await this.ordersService.findById(orderId)

    // Security: ensure the order belongs to the user
    if (order.userId !== userId) {
      throw new BadRequestException('Accès refusé à cette commande')
    }
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Cette commande est déjà payée')
    }

    const transactionId = `YP-${uuidv4().replace(/-/g, '').toUpperCase().slice(0, 12)}`
    const frontendUrl   = this.configService.get('app.frontendUrl')
    const apiKey        = this.configService.get('cinetpay.apiKey')
    const siteId        = this.configService.get('cinetpay.siteId')
    const baseUrl       = this.configService.get('cinetpay.baseUrl')

    const payload = {
      apikey:           apiKey,
      site_id:          siteId,
      transaction_id:   transactionId,
      amount:           order.total,
      currency:         PAYMENT_CURRENCY,
      description:      `Commande YopoePrint ${order.orderNumber}`,
      customer_name:    order.deliveryAddress.fullName,
      customer_phone:   order.deliveryAddress.phone,
      customer_email:   order.user?.email || 'client@yopoeprint.bf',
      customer_address: order.deliveryAddress.street,
      customer_city:    order.deliveryAddress.city,
      customer_country: 'BF', // Burkina Faso
      customer_state:   'BF',
      customer_zip:     '00000',
      notify_url:       `${this.getBackendUrl()}/api/v1/payments/webhook`,
      return_url:       `${frontendUrl}/commande/confirmation?orderId=${orderId}`,
      cancel_url:       `${frontendUrl}/panier?cancelled=true`,
      channels:         'ALL', // Orange Money + Moov + Visa/Mastercard
      metadata:         JSON.stringify({ orderId, userId }),
      lang:             'fr',
    }

    try {
      const response = await axios.post(`${baseUrl}/payment`, payload)
      const data = response.data

      if (data.code !== '201') {
        this.logger.error('CinetPay error:', data)
        throw new BadRequestException(`Erreur paiement: ${data.message}`)
      }

      // Save token on order
      await this.ordersService.setPaymentInit(orderId, data.data.payment_token, transactionId)

      this.logger.log(`Payment initiated: ${transactionId} for order ${order.orderNumber}`)

      return {
        paymentUrl:    data.data.payment_url,
        transactionId,
        token:         data.data.payment_token,
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      this.logger.error('CinetPay request failed:', error.message)
      throw new BadRequestException('Impossible d\'initialiser le paiement. Réessayez.')
    }
  }

  // ─── CinetPay Webhook ─────────────────────────────────────
  // The payload is never trusted: the order is looked up by the transaction ID
  // we generated at init, and amount/currency/status come from /payment/check.
  async handleWebhook(payload: any, xToken?: string) {
    this.verifyWebhookToken(payload, xToken)

    const transactionId = typeof payload?.cpm_trans_id === 'string' ? payload.cpm_trans_id : ''
    if (!transactionId) {
      throw new BadRequestException('cpm_trans_id manquant')
    }

    this.logger.log(`Webhook received: ${transactionId}`)

    const order = await this.ordersService.findByPaymentTransactionId(transactionId)
    if (!order) {
      this.logger.warn(`Webhook for unknown transaction: ${transactionId}`)
      return { status: 'unknown_transaction' }
    }

    // Idempotency: replayed or duplicate notifications are no-ops
    if (order.paymentStatus === PaymentStatus.PAID) {
      return { status: 'already_paid' }
    }

    const check = await this.checkTransaction(transactionId)
    if (!check || check.code !== '00' || check.status !== 'ACCEPTED') {
      this.logger.warn(`Payment not accepted: ${transactionId} — ${check?.status ?? 'check failed'}`)
      if (check?.status === 'REFUSED') {
        await this.ordersService.markPaymentFailed(order.id)
      }
      return { status: 'failed' }
    }

    if (check.amount !== order.total || check.currency !== PAYMENT_CURRENCY) {
      this.logger.error(
        `Payment mismatch for ${order.orderNumber}: paid ${check.amount} ${check.currency}, ` +
        `expected ${order.total} ${PAYMENT_CURRENCY}`,
      )
      return { status: 'amount_mismatch' }
    }

    const confirmed = await this.ordersService.confirmPayment(order.id, transactionId)
    if (!confirmed) return { status: 'already_paid' }

    this.logger.log(`Order confirmed: ${order.orderNumber} (${transactionId})`)
    return { status: 'success' }
  }

  // ─── Verify CinetPay x-token HMAC ─────────────────────────
  private verifyWebhookToken(payload: any, xToken?: string) {
    const secretKey = this.configService.get<string>('cinetpay.secretKey')
    if (!secretKey) {
      this.logger.warn('CINETPAY_SECRET_KEY absent : en-tête x-token non vérifié')
      return
    }

    const data = CINETPAY_TOKEN_FIELDS.map((field) => payload?.[field] ?? '').join('')
    const expected = createHmac('sha256', secretKey).update(data).digest('hex')

    const received = Buffer.from(String(xToken ?? ''), 'utf8')
    const wanted   = Buffer.from(expected, 'utf8')
    if (received.length !== wanted.length || !timingSafeEqual(received, wanted)) {
      this.logger.warn(`Invalid x-token on webhook ${payload?.cpm_trans_id ?? ''}`)
      throw new ForbiddenException('Signature du webhook invalide')
    }
  }

  // ─── Check a transaction with CinetPay ────────────────────
  private async checkTransaction(transactionId: string): Promise<CinetPayCheckResult | null> {
    try {
      const apiKey  = this.configService.get('cinetpay.apiKey')
      const siteId  = this.configService.get('cinetpay.siteId')
      const baseUrl = this.configService.get('cinetpay.baseUrl')

      const response = await axios.post(`${baseUrl}/payment/check`, {
        apikey:         apiKey,
        site_id:        siteId,
        transaction_id: transactionId,
      })

      const { code, data } = response.data ?? {}
      return {
        code:     String(code),
        status:   data?.status,
        amount:   data?.amount !== undefined ? Number(data.amount) : undefined,
        currency: data?.currency,
      }
    } catch (error) {
      this.logger.error(`CinetPay check failed for ${transactionId}: ${error.message}`)
      return null
    }
  }

  // ─── Verify payment with CinetPay ─────────────────────────
  async verifyPayment(transactionId: string): Promise<boolean> {
    const check = await this.checkTransaction(transactionId)
    return check?.code === '00' && check.status === 'ACCEPTED'
  }

  // ─── Get payment status ───────────────────────────────────
  async getPaymentStatus(orderId: string, user: { id: string; role?: string }) {
    const order = await this.ordersService.findByIdForUser(orderId, user)
    return {
      orderId:       order.id,
      orderNumber:   order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus:   order.status,
      total:         order.total,
      currency:      'FCFA',
    }
  }

  private getBackendUrl(): string {
    const port = this.configService.get('app.port') || 3001
    return process.env.BACKEND_URL || `http://localhost:${port}`
  }
}
