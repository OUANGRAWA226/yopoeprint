import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'

// Every CinetPay transaction ever initialised for an order. A retry replaces
// orders.payment_transaction_id, but a late webhook for an earlier attempt
// must still find its order: the lookup goes through this table.
@Entity('payment_transactions')
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index('UQ_payment_transactions_transaction_id', { unique: true })
  @Column({ name: 'transaction_id', type: 'varchar', length: 64 })
  transactionId: string

  @Index('IDX_payment_transactions_order_id')
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
