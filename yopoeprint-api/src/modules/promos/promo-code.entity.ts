import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

export type PromoType = 'percentage' | 'fixed'

// Code promo géré depuis l'admin (Promotions). Les utilisations se comptent sur les commandes
// (colonne orders.promo_code) : aucun compteur à maintenir.
@Entity('promo_codes')
export class PromoCode {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // Toujours en majuscules
  @Column({ length: 30, unique: true })
  code: string

  @Column({ type: 'varchar', length: 12 })
  type: PromoType

  // Pourcentage (1 à 90) ou montant en FCFA
  @Column({ type: 'int' })
  value: number

  @Column({ name: 'min_order', type: 'int', default: 0 })
  minOrder: number

  // null = illimité
  @Column({ name: 'max_uses', type: 'int', nullable: true })
  maxUses: number | null

  @Column({ name: 'once_per_customer', default: false })
  oncePerCustomer: boolean

  @Column({ type: 'varchar', length: 120, nullable: true })
  description: string | null

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  // Code mis en avant sur la boutique (bandeau du menu, accueil) ; un seul à la fois
  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt: Date | null

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt: Date | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
