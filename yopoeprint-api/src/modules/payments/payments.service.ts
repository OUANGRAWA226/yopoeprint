import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import axios from 'axios'
import { Order } from '../orders/order.entity'
import { OrdersService } from '../orders/orders.service'
import { v4 as uuidv4 } from 'uuid'

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
      currency:         'XOF', // Franc CFA BCEAO
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
      await this.ordersService['orderRepo'].update(orderId, {
        cinetpayToken:        data.data.payment_token,
        paymentTransactionId: transactionId,
      })

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
  async handleWebhook(payload: any) {
    const { cpm_trans_id, cpm_result, cpm_error_message, cpm_custom } = payload

    this.logger.log(`Webhook received: ${cpm_trans_id} — result: ${cpm_result}`)

    if (cpm_result !== '00') {
      this.logger.warn(`Payment failed: ${cpm_trans_id} — ${cpm_error_message}`)
      return { status: 'failed' }
    }

    // Verify the payment with CinetPay
    const isValid = await this.verifyPayment(cpm_trans_id)
    if (!isValid) {
      this.logger.error(`Payment verification failed: ${cpm_trans_id}`)
      return { status: 'invalid' }
    }

    // Extract orderId from metadata
    try {
      const metadata = JSON.parse(cpm_custom || '{}')
      if (metadata.orderId) {
        await this.ordersService.confirmPayment(metadata.orderId, cpm_trans_id)
        this.logger.log(`Order confirmed: ${metadata.orderId}`)
      }
    } catch (e) {
      this.logger.error('Error processing webhook metadata:', e)
    }

    return { status: 'success' }
  }

  // ─── Verify payment with CinetPay ─────────────────────────
  async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      const apiKey  = this.configService.get('cinetpay.apiKey')
      const siteId  = this.configService.get('cinetpay.siteId')
      const baseUrl = this.configService.get('cinetpay.baseUrl')

      const response = await axios.post(`${baseUrl}/payment/check`, {
        apikey:         apiKey,
        site_id:        siteId,
        transaction_id: transactionId,
      })

      return response.data.code === '00'
    } catch {
      return false
    }
  }

  // ─── Get payment status ───────────────────────────────────
  async getPaymentStatus(orderId: string) {
    const order = await this.ordersService.findById(orderId)
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
