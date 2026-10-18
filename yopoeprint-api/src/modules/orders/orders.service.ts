import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository, QueryFailedError, Brackets } from 'typeorm'
import { randomInt } from 'crypto'
import { Order, OrderStatus, PaymentStatus, OrderItem } from './order.entity'
import { User, UserRole } from '../users/user.entity'
import {
  CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto,
  UploadBatDto, ApproveBatDto, RejectBatDto,
} from './order.dto'
import { ProductsService } from '../products/products.service'
import { DELIVERY_ZONES, computeDeliveryCost } from './delivery'
import { MailService } from '../mail/mail.service'
import { Quote, QuoteStatus } from '../quotes/quote.entity'

const DAY_MS = 24 * 60 * 60 * 1000

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Quote)
    private quoteRepo: Repository<Quote>,
    private productsService: ProductsService,
    private mailService: MailService,
  ) {}

  // ─── Create order ─────────────────────────────────────────
  async create(userId: string, dto: CreateOrderDto) {
    // Build order items with real prices
    if (dto.deliveryZone !== 'pickup' && !dto.deliveryAddress.street?.trim()) {
      throw new BadRequestException('Adresse de livraison (rue ou secteur) requise')
    }

    const items: OrderItem[] = []
    let subtotal = 0
    let maxProductionDays = 0

    for (const itemDto of dto.items) {
      const product = await this.productsService.findById(itemDto.productId)
      maxProductionDays = Math.max(maxProductionDays, product.deliveryDays || 0)

      const finish      = product.finishes.find((f) => f.id === itemDto.finishId)
      const format      = product.formats.find((f)  => f.id === itemDto.formatId)
      const paper       = product.papers.find((p)   => p.id === itemDto.paperId)

      const { total, unitPrice } = this.productsService.computePrice(
        product.basePrice,
        product.minQuantity,
        itemDto.quantity,
        finish?.priceModifier || 0,
        itemDto.rectoverso,
        format?.multiplier || 1,
        paper?.priceExtra || 0,
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

    const deliveryCost = computeDeliveryCost(dto.deliveryZone, subtotal)
    const deliveryAddress = {
      ...dto.deliveryAddress,
      street:       dto.deliveryAddress.street?.trim() || (dto.deliveryZone === 'pickup' ? 'Retrait atelier' : ''),
      neighborhood: dto.deliveryAddress.neighborhood || '',
      city:         DELIVERY_ZONES[dto.deliveryZone].city,
      zone:         dto.deliveryZone,
    }

    // Apply promo code (placeholder — à enrichir)
    let discount = 0
    if (dto.promoCode) {
      discount = await this.applyPromoCode(dto.promoCode, subtotal)
    }

    const total = subtotal + deliveryCost - discount

    // Generate readable, non-guessable order number
    let orderNumber = this.generateOrderNumber()

    // Estimated delivery (production days + 1 delivery day)
    const estimatedDelivery = new Date()
    estimatedDelivery.setDate(estimatedDelivery.getDate() + (maxProductionDays || 3) + 1)

    const orderData = {
      orderNumber,
      userId,
      status:          OrderStatus.PENDING,
      items,
      subtotal,
      deliveryCost,
      discount,
      total,
      deliveryAddress,
      paymentMethod:   dto.paymentMethod,
      paymentStatus:   PaymentStatus.PENDING,
      promoCode:       dto.promoCode,
      customerNotes:   dto.customerNotes,
      estimatedDelivery,
    }

    // Retry on the (very unlikely) unique-constraint collision of the random suffix
    let savedOrder: Order
    for (let attempt = 1; ; attempt++) {
      try {
        savedOrder = await this.orderRepo.save(this.orderRepo.create({ ...orderData, orderNumber }))
        break
      } catch (err) {
        const isUniqueViolation = err instanceof QueryFailedError && (err as any).driverError?.code === '23505'
        if (!isUniqueViolation || attempt >= 5) throw err
        orderNumber = this.generateOrderNumber()
      }
    }

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
    const page  = Math.max(parseInt(query.page  || '1', 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(query.limit || '20', 10) || 20, 1), 200)
    const skip  = (page - 1) * limit

    const qb = this.orderRepo.createQueryBuilder('o')
      .leftJoinAndSelect('o.user', 'user')
      .orderBy('o.createdAt', 'DESC')
      .skip(skip)
      .take(limit)

    if (query.status) qb.andWhere('o.status = :status', { status: query.status })
    if (query.batStatus) qb.andWhere('o.bat_status = :batStatus', { batStatus: query.batStatus })

    const search = query.search?.trim().replace(/[%_\\]/g, (c) => `\\${c}`)
    if (search) {
      qb.andWhere(new Brackets((w) => {
        w.where('o.order_number ILIKE :q', { q: `%${search}%` })
          .orWhere(`(user.first_name || ' ' || user.last_name) ILIKE :q`)
          .orWhere('user.email ILIKE :q')
          .orWhere('user.phone ILIKE :q')
          .orWhere(`o.delivery_address->>'fullName' ILIKE :q`)
      }))
    }

    const [orders, total] = await qb.getManyAndCount()
    const data = orders.map((o) => this.withSafeUser(o))

    return { data, total, page, limit, hasMore: skip + data.length < total }
  }

  // ─── Tableau de bord admin ────────────────────────────────
  async getAdminStats(daysParam?: string) {
    const days = [7, 30, 90].includes(Number(daysParam)) ? Number(daysParam) : 30
    const now = new Date()
    const from = new Date(now.getTime() - days * DAY_MS)
    const prevFrom = new Date(from.getTime() - days * DAY_MS)
    const paid = PaymentStatus.PAID

    // Totaux de la période et de la période précédente (même durée) pour les évolutions
    const periodTotals = async (start: Date, end: Date) => {
      const r = await this.orderRepo.createQueryBuilder('o')
        .select('COUNT(*)', 'orders')
        .addSelect(`COUNT(*) FILTER (WHERE o.payment_status = :paid)`, 'paidOrders')
        .addSelect(`COALESCE(SUM(o.total) FILTER (WHERE o.payment_status = :paid), 0)`, 'revenue')
        .where('o.created_at >= :start AND o.created_at < :end', { start, end })
        .setParameter('paid', paid)
        .getRawOne()
      const newClients = await this.userRepo.createQueryBuilder('u')
        .where('u.role = :role AND u.created_at >= :start AND u.created_at < :end', { role: UserRole.CLIENT, start, end })
        .getCount()
      return {
        orders:     Number(r.orders) || 0,
        paidOrders: Number(r.paidOrders) || 0,
        revenue:    Number(r.revenue) || 0,
        newClients,
      }
    }

    const [current, previous] = await Promise.all([periodTotals(from, now), periodTotals(prevFrom, from)])

    // Chiffre d'affaires encaissé par jour (par semaine sur 90 jours)
    const bucket = days === 90 ? 'week' : 'day'
    const seriesRows = await this.orderRepo.createQueryBuilder('o')
      .select(`to_char(date_trunc('${bucket}', o.created_at), 'YYYY-MM-DD')`, 'bucket')
      .addSelect('COALESCE(SUM(o.total), 0)', 'revenue')
      .addSelect('COUNT(*)', 'orders')
      .where('o.created_at >= :from AND o.payment_status = :paid', { from, paid })
      .groupBy('bucket')
      .orderBy('bucket', 'ASC')
      .getRawMany()
    const byBucket = new Map(seriesRows.map((r) => [r.bucket as string, r]))
    const revenueSeries: { date: string; revenue: number; orders: number }[] = []
    const cursor = new Date(from)
    cursor.setUTCHours(0, 0, 0, 0)
    if (bucket === 'week') cursor.setUTCDate(cursor.getUTCDate() - ((cursor.getUTCDay() + 6) % 7)) // lundi
    while (cursor <= now) {
      const key = cursor.toISOString().slice(0, 10)
      const row = byBucket.get(key)
      revenueSeries.push({ date: key, revenue: Number(row?.revenue) || 0, orders: Number(row?.orders) || 0 })
      cursor.setUTCDate(cursor.getUTCDate() + (bucket === 'week' ? 7 : 1))
    }

    // Répartition des encaissements par moyen de paiement
    const paymentRows = await this.orderRepo.createQueryBuilder('o')
      .select('o.payment_method', 'method')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(o.total), 0)', 'amount')
      .where('o.created_at >= :from AND o.payment_status = :paid', { from, paid })
      .groupBy('o.payment_method')
      .getRawMany()
    const paymentBreakdown = paymentRows
      .map((r) => ({ method: r.method || 'inconnu', orders: Number(r.orders) || 0, amount: Number(r.amount) || 0 }))
      .sort((a, b) => b.amount - a.amount)

    // Commandes en cours, tous âges confondus (charge de l'atelier)
    const statusRows = await this.orderRepo.createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.status')
      .getRawMany()
    const statusCounts = Object.fromEntries(Object.values(OrderStatus).map((s) => [s, 0])) as Record<OrderStatus, number>
    for (const r of statusRows) statusCounts[r.status as OrderStatus] = Number(r.count) || 0

    // À traiter maintenant
    const [batPending, batRejected, quotesNew] = await Promise.all([
      this.orderRepo.count({ where: { status: OrderStatus.BAT_PENDING, batStatus: 'pending' } }),
      this.orderRepo.count({ where: { status: OrderStatus.BAT_PENDING, batStatus: 'rejected' } }),
      this.quoteRepo.count({ where: { status: QuoteStatus.NEW } }),
    ])

    const recent = await this.orderRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 8,
    })

    return {
      days,
      from,
      to: now,
      current: { ...current, averageOrder: current.paidOrders ? Math.round(current.revenue / current.paidOrders) : 0 },
      previous,
      revenueSeries,
      bucket,
      paymentBreakdown,
      statusCounts,
      todo: {
        toConfirm:   statusCounts[OrderStatus.CONFIRMED],   // payées, BAT à préparer
        batPending,                                         // en attente du client
        batRejected,                                        // corrections demandées
        quotesNew,
      },
      recentOrders: recent.map((o) => this.withSafeUser(o)),
    }
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
    return this.withSafeUser(order)
  }

  // La relation `user` chargée par TypeORM contient passwordHash, refreshToken, jeton de
  // réinitialisation… Toute commande renvoyée par l'API ne doit exposer que ces champs-là.
  private withSafeUser(order: Order): Order {
    if (!order?.user) return order
    const u = order.user
    order.user = {
      id:        u.id,
      firstName: u.firstName,
      lastName:  u.lastName,
      fullName:  `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
      email:     u.email,
      phone:     u.phone,
    } as unknown as User
    return order
  }

  // ─── Get order by ID, restricted to its owner (or staff) ───
  async findByIdForUser(id: string, user: { id: string; role?: string }) {
    const order = await this.findById(id)
    const isStaff = user.role === UserRole.ADMIN || user.role === UserRole.STAFF
    if (!isStaff && order.userId !== user.id) {
      // 404 rather than 403 so order IDs cannot be probed
      throw new NotFoundException('Commande introuvable')
    }
    return order
  }

  // ─── Attach a late design file (customer) ─────────────────
  async attachDesignFile(id: string, user: { id: string; role?: string }, designFileUrl: string) {
    const order = await this.findByIdForUser(id, user)
    const items = order.items.map((item) => ({
      ...item,
      designFileUrl: item.designFileUrl || designFileUrl,
    }))
    await this.orderRepo.update(id, { items })
    return this.findById(id)
  }

  // ─── Get order by CinetPay transaction ID (webhook) ───────
  async findByPaymentTransactionId(transactionId: string) {
    return this.orderRepo.findOne({ where: { paymentTransactionId: transactionId } })
  }

  // ─── Get order by number (public tracking) ────────────────
  async findByOrderNumber(orderNumber: string) {
    const order = await this.orderRepo.findOne({ where: { orderNumber } })
    if (!order) throw new NotFoundException('Commande introuvable')
    // Return tracking info including BAT data
    return {
      id:                   order.id,
      orderNumber:          order.orderNumber,
      status:               order.status,
      paymentStatus:        order.paymentStatus,
      paymentMethod:        order.paymentMethod,
      estimatedDelivery:    order.estimatedDelivery,
      deliveredAt:          order.deliveredAt,
      createdAt:            order.createdAt,
      subtotal:             order.subtotal,
      deliveryCost:         order.deliveryCost,
      discount:             order.discount,
      total:                order.total,
      deliveryAddress:      order.deliveryAddress,
      // BAT fields
      batUrl:               order.batUrl,
      batVersoUrl:          order.batVersoUrl,
      batStatus:            order.batStatus,
      batNotes:             order.batNotes,
      batApprovedAt:        order.batApprovedAt,
      batApprovedBy:        order.batApprovedBy,
      batRejectedReason:    order.batRejectedReason,
      batCorrectionFileUrl: order.batCorrectionFileUrl,
      batHistory:           order.batHistory,
      items:                order.items.map((i) => ({
        productName:  i.productName,
        productId:    i.productId,
        productEmoji: i.productEmoji,
        format:       i.format,
        paper:        i.paper,
        finish:       i.finish,
        rectoverso:   i.rectoverso,
        quantity:     i.quantity,
        totalPrice:   i.totalPrice,
      })),
    }
  }

  // ─── BAT: Déposer / Assigner un BAT (Admin) ───────────────
  async uploadBat(id: string, dto: UploadBatDto) {
    const order = await this.findById(id)

    const historyEntry = {
      action: 'bat_submitted',
      date: new Date().toISOString(),
      notes: dto.batNotes || 'BAT déposé par l\'atelier pré-presse',
    }

    const batHistory = Array.isArray(order.batHistory) ? [...order.batHistory, historyEntry] : [historyEntry]

    await this.orderRepo.update(id, {
      batUrl: dto.batUrl,
      batVersoUrl: dto.batVersoUrl || null,
      batNotes: dto.batNotes || null,
      batStatus: 'pending',
      status: OrderStatus.BAT_PENDING,
      batHistory,
    })

    const updated = await this.findById(id)

    try {
      const user = await this.userRepo.findOne({ where: { id: order.userId } })
      if (user && user.email) {
        await this.mailService.sendBatReadyEmail(user.email, order.orderNumber, dto.batNotes)
      }
    } catch (err) {
      console.error('Erreur silencieuse notification email BAT prêt', err)
    }

    return updated
  }

  // ─── BAT: Valider le BAT (Client ou Admin) ────────────────
  async approveBat(id: string, user: { id: string; role?: string }, dto: ApproveBatDto) {
    const order = await this.findById(id)

    if (user.role !== 'admin' && order.userId !== user.id) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à valider ce BAT')
    }

    if (!order.batUrl) {
      throw new BadRequestException('Aucun BAT n\'a été généré pour cette commande')
    }

    const historyEntry = {
      action: 'bat_approved',
      date: new Date().toISOString(),
      notes: dto.comments || 'BAT approuvé pour impression',
      actor: user.id,
    }

    const batHistory = Array.isArray(order.batHistory) ? [...order.batHistory, historyEntry] : [historyEntry]

    await this.orderRepo.update(id, {
      batStatus: 'approved',
      batApprovedAt: new Date(),
      batApprovedBy: user.id,
      status: OrderStatus.IN_PRODUCTION, // Passe directement en impression
      batHistory,
    })

    const updated = await this.findById(id)

    try {
      const customer = await this.userRepo.findOne({ where: { id: order.userId } })
      if (customer && customer.email) {
        await this.mailService.sendBatApprovedEmail(customer.email, order.orderNumber)
      }
    } catch (err) {
      console.error('Erreur silencieuse email BAT approuvé', err)
    }

    return updated
  }

  // ─── BAT: Refuser / Demander corrections (Client) ─────────
  async rejectBat(id: string, user: { id: string; role?: string }, dto: RejectBatDto) {
    const order = await this.findById(id)

    if (user.role !== 'admin' && order.userId !== user.id) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à refuser ce BAT')
    }

    if (!dto.reason || dto.reason.trim().length === 0) {
      throw new BadRequestException('Veuillez préciser la raison de votre refus ou vos corrections')
    }

    const historyEntry = {
      action: 'bat_rejected',
      date: new Date().toISOString(),
      notes: dto.reason,
      actor: user.id,
    }

    const batHistory = Array.isArray(order.batHistory) ? [...order.batHistory, historyEntry] : [historyEntry]

    await this.orderRepo.update(id, {
      batStatus: 'rejected',
      batRejectedReason: dto.reason,
      batCorrectionFileUrl: dto.correctionFileUrl || null,
      batHistory,
    })

    const updated = await this.findById(id)

    try {
      const customer = await this.userRepo.findOne({ where: { id: order.userId } })
      if (customer && customer.email) {
        await this.mailService.sendBatRejectedEmail(customer.email, order.orderNumber, dto.reason)
      }
    } catch (err) {
      console.error('Erreur silencieuse email BAT rejeté', err)
    }

    return updated
  }

  // ─── BAT via numéro de commande (Suivi public) ────────────
  // Lien public : pas de coordonnées client dans la réponse
  async approveBatByOrderNumber(orderNumber: string, dto: ApproveBatDto) {
    const order = await this.findOrderForPublicBat(orderNumber)
    const { user: _user, ...updated } = await this.approveBat(order.id, { id: order.userId, role: 'customer' }, dto)
    return updated
  }

  async rejectBatByOrderNumber(orderNumber: string, dto: RejectBatDto) {
    const order = await this.findOrderForPublicBat(orderNumber)
    const { user: _user, ...updated } = await this.rejectBat(order.id, { id: order.userId, role: 'customer' }, dto)
    return updated
  }

  // Legacy sequential numbers (YP-2025-000123) are guessable: their BAT can only
  // be handled from the authenticated customer area, not from the public link.
  private async findOrderForPublicBat(orderNumber: string) {
    if (OrdersService.LEGACY_ORDER_NUMBER.test(orderNumber)) {
      throw new ForbiddenException('Connectez-vous à votre espace client pour valider ce BAT')
    }
    const order = await this.orderRepo.findOne({ where: { orderNumber } })
    if (!order) throw new NotFoundException('Commande introuvable')
    return order
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

  // ─── Save CinetPay init data ──────────────────────────────
  async setPaymentInit(orderId: string, cinetpayToken: string, transactionId: string) {
    await this.orderRepo.update(orderId, { cinetpayToken, paymentTransactionId: transactionId })
  }

  // ─── Confirm payment (idempotent) ─────────────────────────
  // Returns true only for the call that actually flipped the order to PAID,
  // so concurrent/replayed webhooks cannot confirm twice.
  async confirmPayment(orderId: string, transactionId: string): Promise<boolean> {
    const result = await this.orderRepo.update(
      { id: orderId, paymentStatus: Not(PaymentStatus.PAID) },
      {
        paymentStatus:        PaymentStatus.PAID,
        paymentTransactionId: transactionId,
        status:               OrderStatus.CONFIRMED,
      },
    )
    return (result.affected ?? 0) > 0
  }

  async markPaymentFailed(orderId: string) {
    await this.orderRepo.update(
      { id: orderId, paymentStatus: PaymentStatus.PENDING },
      { paymentStatus: PaymentStatus.FAILED },
    )
  }

  // ─── Helpers ──────────────────────────────────────────────
  private static readonly LEGACY_ORDER_NUMBER = /^YP-\d{4}-\d{6}$/
  // Crockford-like alphabet: no 0/O/1/I/L to stay readable over the phone
  private static readonly ORDER_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

  // YP-2025-7KQ4-M9XC : 8 random chars (~39 bits), not derived from a counter
  private generateOrderNumber(): string {
    const year = new Date().getFullYear()
    const alphabet = OrdersService.ORDER_ALPHABET
    let rand = ''
    for (let i = 0; i < 8; i++) rand += alphabet[randomInt(alphabet.length)]
    return `YP-${year}-${rand.slice(0, 4)}-${rand.slice(4)}`
  }

  private async applyPromoCode(code: string, subtotal: number): Promise<number> {
    // Placeholder: to be replaced with a PromoCode entity
    // Must match FALLBACK_PROMOS in src/lib/promo.service.ts (codes advertised on the storefront)
    const promoCodes: Record<string, number> = {
      'YOPPRINT15': 0.15,
      'YOPOE10':    0.10,
      'BURKINA':    0.15,
      'PROMO20':    0.20,
    }
    const rate = promoCodes[code.toUpperCase()]
    if (!rate) throw new BadRequestException('Code promo invalide')
    return Math.round(subtotal * rate)
  }
}
