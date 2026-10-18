import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm'
import { User } from '../users/user.entity'

export enum OrderStatus {
  PENDING       = 'pending',       // En attente de paiement
  CONFIRMED     = 'confirmed',     // Paiement confirmé
  BAT_PENDING   = 'bat_pending',   // Bon à Tirer en attente de validation client
  IN_PRODUCTION = 'in_production', // En cours de production
  READY         = 'ready',         // Prêt, en attente livraison
  SHIPPED       = 'shipped',       // En livraison
  DELIVERED     = 'delivered',     // Livré
  CANCELLED     = 'cancelled',     // Annulé
  REFUNDED      = 'refunded',      // Remboursé
}

export enum PaymentMethod {
  ORANGE_MONEY = 'orange_money',
  MOOV_MONEY   = 'moov_money',
  VISA         = 'visa',
  MASTERCARD   = 'mastercard',
  VIREMENT     = 'virement',
}

export enum PaymentStatus {
  PENDING   = 'pending',
  PAID      = 'paid',
  FAILED    = 'failed',
  REFUNDED  = 'refunded',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // Numéro lisible ex: YP-2025-001234
  @Column({ name: 'order_number', unique: true })
  orderNumber: string

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ name: 'user_id' })
  userId: string

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus

  // Items du panier stockés en JSONB
  @Column({ type: 'jsonb', default: [] })
  items: OrderItem[]

  // Totaux
  @Column({ name: 'subtotal', type: 'int' })
  subtotal: number

  @Column({ name: 'delivery_cost', type: 'int', default: 0 })
  deliveryCost: number

  @Column({ name: 'discount', type: 'int', default: 0 })
  discount: number

  @Column({ name: 'total', type: 'int' })
  total: number

  // Adresse de livraison (snapshot au moment de la commande)
  @Column({ name: 'delivery_address', type: 'jsonb' })
  deliveryAddress: DeliveryAddress

  // Paiement
  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus

  @Column({ name: 'payment_transaction_id', nullable: true })
  paymentTransactionId: string

  @Column({ name: 'cinetpay_token', nullable: true })
  cinetpayToken: string

  // Code promo utilisé
  @Column({ name: 'promo_code', nullable: true })
  promoCode: string

  // Notes internes
  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string

  // Notes du client
  @Column({ name: 'customer_notes', type: 'text', nullable: true })
  customerNotes: string

  // ── Bon À Tirer (BAT) interactif ─────────────────────────
  @Column({ name: 'bat_url', nullable: true })
  batUrl: string

  @Column({ name: 'bat_verso_url', nullable: true })
  batVersoUrl: string

  @Column({ name: 'bat_status', nullable: true, default: null })
  batStatus: 'pending' | 'approved' | 'rejected' | null

  @Column({ name: 'bat_notes', type: 'text', nullable: true })
  batNotes: string

  @Column({ name: 'bat_approved_at', nullable: true })
  batApprovedAt: Date

  @Column({ name: 'bat_approved_by', nullable: true })
  batApprovedBy: string

  @Column({ name: 'bat_rejected_reason', type: 'text', nullable: true })
  batRejectedReason: string

  @Column({ name: 'bat_correction_file_url', nullable: true })
  batCorrectionFileUrl: string

  @Column({ name: 'bat_history', type: 'jsonb', default: [] })
  batHistory: Array<{
    action: string
    date: string
    notes?: string
    actor?: string
  }>

  // Dates
  @Column({ name: 'estimated_delivery', nullable: true })
  estimatedDelivery: Date

  @Column({ name: 'delivered_at', nullable: true })
  deliveredAt: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  productName: string
  productSlug: string
  productEmoji: string
  quantity: number
  format: string
  paper: string
  finish: string
  rectoverso: boolean
  designFileUrl?: string
  unitPrice: number
  totalPrice: number
}

export interface DeliveryAddress {
  fullName: string
  phone: string
  street: string
  neighborhood: string
  city: string
  zone?: string
}
