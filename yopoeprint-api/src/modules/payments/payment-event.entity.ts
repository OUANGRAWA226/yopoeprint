import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'

export type PaymentEventType =
  | 'init'              // paiement CinetPay initialisé
  | 'init_failed'       // CinetPay a refusé l'initialisation
  | 'paid'              // paiement accepté et commande confirmée
  | 'refused'           // paiement refusé par CinetPay
  | 'pending'           // vérification : toujours en attente
  | 'amount_mismatch'   // montant ou devise différents de la commande
  | 'check_failed'      // CinetPay injoignable lors de la vérification
  | 'unknown_transaction'
  | 'invalid_signature' // notification à la signature invalide
  | 'manual_paid'       // encaissement saisi dans l'admin (virement, espèces…)

// Journal des paiements : rapprochement CinetPay et anomalies, consultable dans l'admin (Paiements)
@Entity('payment_events')
export class PaymentEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index()
  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null

  @Column({ name: 'order_number', type: 'varchar', length: 40, nullable: true })
  orderNumber: string | null

  @Column({ name: 'transaction_id', type: 'varchar', length: 64, nullable: true })
  transactionId: string | null

  @Index()
  @Column({ type: 'varchar', length: 30 })
  type: PaymentEventType

  // webhook | admin | client
  @Column({ type: 'varchar', length: 12 })
  source: string

  @Column({ type: 'int', nullable: true })
  amount: number | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  message: string | null

  @Column({ name: 'actor_email', type: 'varchar', nullable: true })
  actorEmail: string | null

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
