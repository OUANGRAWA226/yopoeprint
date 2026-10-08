import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Order, OrderStatus, PaymentStatus, OrderItem } from './order.entity'
import { User } from '../users/user.entity'
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './order.dto'
import { ProductsService } from '../products/products.service'
import { MailService } from '../mail/mail.service'

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private productsService: ProductsService,
    private mailService: MailService,
  ) {}

  // ─── Create order ─────────────────────────────────────────
  async create(userId: string, dto: CreateOrderDto) {
    // Build order items with real prices
    const items: OrderItem[] = []
    let subtotal = 0

    for (const itemDto of dto.items) {
      const product = await this.productsService.findById(itemDto.productId)

      const finish      = product.finishes.find((f) => f.id === itemDto.finishId)
      const format      = product.formats.find((f)  => f.id === itemDto.formatId)
      const paper       = product.papers.find((p)   => p.id === itemDto.paperId)

      const { total, unitPrice } = this.productsService.computePrice(
        product.basePrice,
        product.minQuantity,
        itemDto.quantity,
        finish?.priceModifier || 0,
        itemDto.rectoverso,
      )

      items.push({
        productId:     product.id,
        productName:   product.name,
        productSlug:   product.slug,
        productEmoji:  product.emoji,
        quantity:      itemDto.quantity,
        format:        format?.label || itemDto.formatId,
        paper:         paper?.label  || itemDto.paperId,
        finish:        finish?.label || itemDto.finishId,
        rectoverso:    itemDto.rectoverso,
        designFileUrl: itemDto.designFileUrl,
        unitPrice,
        totalPrice:    total,
      })

      subtotal += total
    }

    // Delivery cost (free above 75 000 FCFA)
    const deliveryCost = subtotal >= 75000 ? 0 : 2000

    // Apply promo code (placeholder — à enrichir)
    let discount = 0
    if (dto.promoCode) {
      discount = await this.applyPromoCode(dto.promoCode, subtotal)
    }

    const total = subtotal + deliveryCost - discount

    // Generate readable order number
    const orderNumber = await this.generateOrderNumber()

    // Estimated delivery (production days + 1 delivery day)
    const maxDeliveryDays = Math.max(...items.map(async (i) => {
      const p = await this.productsService.findById(i.productId)
      return p.deliveryDays
    }).map(() => 3)) // simplified
    const estimatedDelivery = new Date()
    estimatedDelivery.setDate(estimatedDelivery.getDate() + maxDeliveryDays + 1)

    const order = this.orderRepo.create({
      orderNumber,
      userId,
      status:          OrderStatus.PENDING,
      items,
      subtotal,
      deliveryCost,
      discount,
      total,
      deliveryAddress: dto.deliveryAddress,
      paymentMethod:   dto.paymentMethod,
      paymentStatus:   PaymentStatus.PENDING,
      promoCode:       dto.promoCode,
      customerNotes:   dto.customerNotes,
      estimatedDelivery,
    })

    const savedOrder = await this.orderRepo.save(order)

    // Envoyer l'email de confirmation (si l'utilisateur a un compte)
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } })
      if (user && user.email) {
        await this.mailService.sendOrderConfirmation(user.email, orderNumber, total)
      }
    } catch (err) {
      console.error('Erreur silencieuse lors de lenvoi email de confirmation', err)
    }

    return savedOrder
  }

  // ─── Get all orders (admin) ───────────────────────────────
  async findAll(query: OrderQueryDto) {
    const page  = parseInt(query.page  || '1', 10)
    const limit = parseInt(query.limit || '20', 10)
    const skip  = (page - 1) * limit

    const where: any = {}
    if (query.status) where.status = query.status

    const [data, total] = await this.orderRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    })

    return { data, total, page, limit, hasMore: skip + data.length < total }
  }

  // ─── Get user's orders ────────────────────────────────────
  async findByUser(userId: string, query: OrderQueryDto) {
    const page  = parseInt(query.page  || '1', 10)
    const limit = parseInt(query.limit || '10', 10)
    const skip  = (page - 1) * limit

    const where: any = { userId }
    if (query.status) where.status = query.status

    const [data, total] = await this.orderRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    })

    return { data, total, page, limit, hasMore: skip + data.length < total }
  }

  // ─── Get order by ID ──────────────────────────────────────
  async findById(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['user'],
    })
    if (!order) throw new NotFoundException('Commande introuvable')
    return order
  }

  // ─── Get order by number (public tracking) ────────────────
  async findByOrderNumber(orderNumber: string) {
    const order = await this.orderRepo.findOne({ where: { orderNumber } })
    if (!order) throw new NotFoundException('Commande introuvable')
    // Return limited info for public tracking
    return {
      orderNumber:    order.orderNumber,
      status:         order.status,
      paymentStatus:  order.paymentStatus,
      estimatedDelivery: order.estimatedDelivery,
      createdAt:      order.createdAt,
      items:          order.items.map((i) => ({
        productName:  i.productName,
        quantity:     i.quantity,
        totalPrice:   i.totalPrice,
      })),
    }
  }

  // ─── Update order status (admin) ──────────────────────────
  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.findById(id)

    await this.orderRepo.update(id, {
      status:        dto.status,
      internalNotes: dto.internalNotes || order.internalNotes,
      ...(dto.status === OrderStatus.DELIVERED && { deliveredAt: new Date() }),
    })

    const updatedOrder = await this.findById(id)

    // Envoyer l'email de mise à jour de statut (si pertinent)
    try {
      const user = await this.userRepo.findOne({ where: { id: order.userId } })
      if (user && user.email && ['in_production', 'ready', 'shipped', 'delivered'].includes(dto.status)) {
        await this.mailService.sendOrderStatusUpdate(user.email, order.orderNumber, dto.status)
      }
    } catch (err) {
      console.error('Erreur silencieuse lors de lenvoi email de statut', err)
    }

    return updatedOrder
  }

  // ─── Confirm payment ──────────────────────────────────────
  async confirmPayment(orderId: string, transactionId: string) {
    await this.orderRepo.update(orderId, {
      paymentStatus:        PaymentStatus.PAID,
      paymentTransactionId: transactionId,
      status:               OrderStatus.CONFIRMED,
    })
    return this.findById(orderId)
  }

  // ─── Helpers ──────────────────────────────────────────────
  private async generateOrderNumber(): Promise<string> {
    const year  = new Date().getFullYear()
    const count = await this.orderRepo.count()
    const seq   = String(count + 1).padStart(6, '0')
    return `YP-${year}-${seq}`
  }

  private async applyPromoCode(code: string, subtotal: number): Promise<number> {
    // Placeholder: to be replaced with a PromoCode entity
    const promoCodes: Record<string, number> = {
      'PROMO10':   0.10,
      'WELCOME15': 0.15,
      'BF2025':    0.20,
    }
    const rate = promoCodes[code.toUpperCase()]
    if (!rate) throw new BadRequestException('Code promo invalide')
    return Math.round(subtotal * rate)
  }
}
