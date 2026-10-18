import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm'
import { User } from '../users/user.entity'

export enum QuoteStatus {
  NEW        = 'new',        // Demande reçue, à traiter
  PROCESSING = 'processing', // À l'étude par l'atelier
  SENT       = 'sent',       // Proposition envoyée au client
  ACCEPTED   = 'accepted',   // Acceptée par le client
  REJECTED   = 'rejected',   // Refusée / non réalisable
}

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // Référence lisible ex: DEV-2026-K7P4-9XQ2
  @Column({ unique: true })
  reference: string

  // Renseigné quand la demande est faite depuis un compte connecté
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Index()
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null

  // ── Contact ──
  @Column({ name: 'full_name' })
  fullName: string

  @Column()
  email: string

  @Column()
  phone: string

  @Column({ type: 'varchar', nullable: true })
  company: string | null

  @Column()
  profile: string

  // ── Projet ──
  @Column()
  product: string

  @Column()
  quantity: string

  @Column({ type: 'varchar', nullable: true })
  format: string | null

  @Column({ type: 'text' })
  description: string

  @Column()
  budget: string

  @Column()
  deadline: string

  @Column({ name: 'has_file', default: false })
  hasFile: boolean

  @Column({ name: 'file_desc', type: 'text', nullable: true })
  fileDesc: string | null

  // URLs Cloudinary des fichiers joints (via POST /upload)
  @Column({ type: 'jsonb', default: [] })
  files: string[]

  // ── Traitement ──
  @Index()
  @Column({ type: 'enum', enum: QuoteStatus, enumName: 'quote_status', default: QuoteStatus.NEW })
  status: QuoteStatus

  // Montant proposé en FCFA
  @Column({ type: 'int', nullable: true })
  price: number | null

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
