import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'

// Journal des emails transactionnels (admin › Emails) : envoyés, en échec ou simulés (sans clé Resend)
@Entity('email_logs')
export class EmailLog {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'to_email', type: 'varchar' })
  toEmail: string

  @Column({ type: 'varchar', length: 200 })
  subject: string

  // Méthode d'envoi (orderConfirmation, batReady, passwordReset…)
  @Index()
  @Column({ type: 'varchar', length: 40 })
  template: string

  // sent | failed | simulated
  @Index()
  @Column({ type: 'varchar', length: 12 })
  status: string

  @Column({ name: 'provider_id', type: 'varchar', nullable: true })
  providerId: string | null

  @Column({ type: 'varchar', length: 300, nullable: true })
  error: string | null

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
