import { Injectable, BadRequestException, ConflictException, ForbiddenException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In, Not, IsNull, LessThan, MoreThan } from 'typeorm'
import axios from 'axios'
import { createHmac, timingSafeEqual } from 'crypto'
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from '../orders/order.entity'
import { OrdersService } from '../orders/orders.service'
import { PaymentEvent, PaymentEventType } from './payment-event.entity'
import { v4 as uuidv4 } from 'uuid'

const PAYMENT_CURRENCY = 'XOF' // Franc CFA BCEAO

// Fields concatenated (in this order) to compute CinetPay's x-token HMAC
const CINETPAY_TOKEN_FIELDS = [
  'cpm_site_id', 'cpm_trans_id', 'cpm_trans_date', 'cpm_amount', 'cpm_currency',
  'signature', 'payment_method', 'cel_phone_num', 'cpm_phone_prefixe',
  'cpm_language', 'cpm_version', 'cpm_payment_config', 'cpm_page_action',
  'cpm_custom', 'cpm_designation', 'cpm_error_message',
]

// Un paiement initialisé et toujours en attente au-delà de ce délai est signalé dans l'admin
const STALE_PAYMENT_MINUTES = 30
const CLOSED_ORDER = [OrderStatus.CANCELLED, OrderStatus.REFUNDED]

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

type Actor = { id?: string; email?: string } | undefined

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name)

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
    @InjectRepository(PaymentEvent) private events: Repository<PaymentEvent>,
    @InjectRepository(Order) private orders: Repository<Order>,
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
        await this.log('init_failed', 'client', { order, transactionId, message: data?.message })
        throw new BadRequestException(`Erreur paiement: ${data.message}`)
      }

      // Save token on order
      await this.ordersService.setPaymentInit(orderId, data.data.payment_token, transactionId)
      await this.log('init', 'client', { order, transactionId })

      this.logger.log(`Payment initiated: ${transactionId} for order ${order.orderNumber}`)

      return {
        paymentUrl:    data.data.payment_url,
        transactionId,
        token:         data.data.payment_token,
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      this.logger.error('CinetPay request failed:', error.message)
      await this.log('init_failed', 'client', { order, transactionId, message: `CinetPay injoignable : ${error.message}` })
      throw new BadRequestException('Impossible d\'initialiser le paiement. Réessayez.')
    }
  }

  // ─── CinetPay Webhook ─────────────────────────────────────
  // The payload is never trusted: the order is looked up by the transaction ID
  // we generated at init, and amount/currency/status come from /payment/check.
  async handleWebhook(payload: any, xToken?: string) {
    const transactionId = typeof payload?.cpm_trans_id === 'string' ? payload.cpm_trans_id : ''
    try {
      this.verifyWebhookToken(payload, xToken)
    } catch (e) {
      await this.log('invalid_signature', 'webhook', { transactionId: transactionId || null, message: 'Signature x-token invalide' })
      throw e
    }

    if (!transactionId) {
      throw new BadRequestException('cpm_trans_id manquant')
    }

    this.logger.log(`Webhook received: ${transactionId}`)

    const order = await this.ordersService.findByPaymentTransactionId(transactionId)
    if (!order) {
      this.logger.warn(`Webhook for unknown transaction: ${transactionId}`)
      await this.log('unknown_transaction', 'webhook', { transactionId })
      return { status: 'unknown_transaction' }
    }

    return this.reconcile(order, transactionId, 'webhook')
  }

  /**
   * Interroge CinetPay (/payment/check) et applique le résultat à la commande.
   * Partagé par le webhook et la revérification depuis l'admin.
   */
  private async reconcile(order: Order, transactionId: string, source: 'webhook' | 'admin', actor?: Actor) {
    // Idempotency: replayed or duplicate notifications are no-ops
    if (order.paymentStatus === PaymentStatus.PAID) {
      return { status: 'already_paid' }
    }

    const check = await this.checkTransaction(transactionId)
    if (!check) {
      await this.log('check_failed', source, { order, transactionId, actor, message: 'CinetPay injoignable' })
      return { status: 'check_failed' }
    }
    if (check.code !== '00' || check.status !== 'ACCEPTED') {
      this.logger.warn(`Payment not accepted: ${transactionId} — ${check.status ?? check.code}`)
      if (check.status === 'REFUSED') {
        await this.ordersService.markPaymentFailed(order.id)
        await this.log('refused', source, { order, transactionId, actor, message: 'Refusé par CinetPay' })
        return { status: 'failed' }
      }
      await this.log('pending', source, { order, transactionId, actor, message: `CinetPay : ${check.status ?? `code ${check.code}`}` })
      return { status: 'pending' }
    }

    if (check.amount !== order.total || check.currency !== PAYMENT_CURRENCY) {
      this.logger.error(
        `Payment mismatch for ${order.orderNumber}: paid ${check.amount} ${check.currency}, ` +
        `expected ${order.total} ${PAYMENT_CURRENCY}`,
      )
      await this.log('amount_mismatch', source, {
        order, transactionId, actor, amount: check.amount ?? null,
        message: `Payé ${check.amount} ${check.currency}, attendu ${order.total} ${PAYMENT_CURRENCY}`,
      })
      return { status: 'amount_mismatch' }
    }

    const confirmed = await this.ordersService.confirmPayment(order.id, transactionId)
    if (!confirmed) return { status: 'already_paid' }

    await this.log('paid', source, { order, transactionId, actor, amount: order.total })
    this.logger.log(`Order confirmed: ${order.orderNumber} (${transactionId})`)
    return { status: 'success' }
  }

  // ─── Admin : rapprochement ─────────────────────────────────
  /** Commandes dont le paiement demande une action : en attente prolongée, échoué, virement non encaissé. */
  async issues() {
    const staleBefore = new Date(Date.now() - STALE_PAYMENT_MINUTES * 60_000)
    const since = new Date(Date.now() - 30 * 24 * 3600_000)
    const open = Not(In(CLOSED_ORDER))
    const [stale, failed, transfers] = await Promise.all([
      this.orders.find({
        where: { paymentStatus: PaymentStatus.PENDING, paymentTransactionId: Not(IsNull()), status: open, createdAt: LessThan(staleBefore) },
        relations: ['user'], order: { createdAt: 'DESC' }, take: 100,
      }),
      this.orders.find({
        where: { paymentStatus: PaymentStatus.FAILED, status: open, createdAt: MoreThan(since) },
        relations: ['user'], order: { createdAt: 'DESC' }, take: 100,
      }),
      this.orders.find({
        where: { paymentStatus: PaymentStatus.PENDING, paymentMethod: PaymentMethod.VIREMENT, status: open },
        relations: ['user'], order: { createdAt: 'DESC' }, take: 100,
      }),
    ])
    const view = (o: Order, reason: 'stale' | 'failed' | 'transfer') => ({
      reason,
      orderId: o.id,
      orderNumber: o.orderNumber,
      customer: o.user ? `${o.user.firstName} ${o.user.lastName}`.trim() : o.deliveryAddress?.fullName,
      email: o.user?.email ?? null,
      total: o.total,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      transactionId: o.paymentTransactionId ?? null,
      createdAt: o.createdAt.toISOString(),
    })
    return [...stale.map((o) => view(o, 'stale')), ...failed.map((o) => view(o, 'failed')), ...transfers.map((o) => view(o, 'transfer'))]
  }

  /** Synthèse des 7 derniers jours pour l'en-tête de la page Paiements. */
  async overview() {
    const since = new Date(Date.now() - 7 * 24 * 3600_000)
    // Encaissements datés par le journal (CinetPay confirmé ou saisie manuelle)
    const paid = await this.events.createQueryBuilder('e')
      .select('COUNT(*)', 'count').addSelect('COALESCE(SUM(e.amount), 0)', 'amount')
      .where('e.type IN (:...types)', { types: ['paid', 'manual_paid'] })
      .andWhere('e.created_at >= :since', { since })
      .getRawOne()
    const anomalies = await this.events.count({
      where: { type: In(['amount_mismatch', 'invalid_signature', 'check_failed', 'unknown_transaction'] as PaymentEventType[]), createdAt: MoreThan(since) },
    })
    const issues = await this.issues()
    return {
      paidCount7d: Number(paid?.count) || 0,
      paidAmount7d: Number(paid?.amount) || 0,
      stale: issues.filter((i) => i.reason === 'stale').length,
      failed: issues.filter((i) => i.reason === 'failed').length,
      transfers: issues.filter((i) => i.reason === 'transfer').length,
      anomalies7d: anomalies,
    }
  }

  async listEvents(query: { type?: string; orderId?: string; page?: number; limit?: number }) {
    const page = Math.max(Number(query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 200)
    const where: any = {}
    if (query.type) where.type = query.type
    if (query.orderId) where.orderId = query.orderId
    const [data, total] = await this.events.findAndCount({ where, order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit })
    return { data, total, page, limit }
  }

  /** Revérifie auprès de CinetPay un paiement dont la notification n'est pas arrivée. */
  async recheck(orderId: string, actor: Actor) {
    const order = await this.ordersService.findById(orderId)
    if (!order.paymentTransactionId) throw new BadRequestException('Aucun paiement CinetPay n\'a été initialisé pour cette commande')
    if (order.paymentStatus === PaymentStatus.PAID) throw new ConflictException('Cette commande est déjà payée')
    return this.reconcile(order, order.paymentTransactionId, 'admin', actor)
  }

  /** Encaissement hors CinetPay (virement, espèces au retrait…), saisi par un gestionnaire. */
  async markPaid(orderId: string, reference: string, actor: Actor) {
    const order = await this.ordersService.findById(orderId)
    if (order.paymentStatus === PaymentStatus.PAID) throw new ConflictException('Cette commande est déjà payée')
    if (CLOSED_ORDER.includes(order.status)) throw new BadRequestException('Commande annulée ou remboursée')
    const ref = `MANUEL:${reference}`.slice(0, 64)
    await this.ordersService.confirmPayment(order.id, ref)
    await this.log('manual_paid', 'admin', { order, transactionId: ref, actor, amount: order.total, message: reference })
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

  // Le journal ne doit jamais bloquer un paiement : une erreur d'écriture est seulement tracée
  private async log(
    type: PaymentEventType,
    source: 'webhook' | 'admin' | 'client',
    data: { order?: Order; transactionId?: string | null; actor?: Actor; amount?: number | null; message?: string | null },
  ) {
    try {
      await this.events.insert({
        type,
        source,
        orderId: data.order?.id ?? null,
        orderNumber: data.order?.orderNumber ?? null,
        transactionId: data.transactionId ?? null,
        amount: data.amount ?? data.order?.total ?? null,
        message: data.message ? String(data.message).slice(0, 255) : null,
        actorEmail: data.actor?.email ?? null,
      })
    } catch (e: any) {
      this.logger.error(`Journal des paiements : ${e?.message || e}`)
    }
  }

  private getBackendUrl(): string {
    const port = this.configService.get('app.port') || 3001
    return process.env.BACKEND_URL || `http://localhost:${port}`
  }
}
