import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm'

export enum ProductCategory {
  FLYERS           = 'flyers',
  CARTES_VISITE    = 'cartes-de-visite',
  AFFICHES         = 'affiches',
  BROCHURES        = 'brochures',
  ROLL_UP          = 'roll-up',
  GOODIES          = 'goodies',
  TEXTILE          = 'textile',
  EVENEMENTIEL     = 'evenementiel',
  SIGNALETIQUE     = 'signaletique',
  CORPORATE        = 'corporate',
}

export enum ProductBadge {
  POPULAR = 'popular',
  NEW     = 'new',
  PROMO   = 'promo',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  slug: string

  @Column()
  name: string

  @Column({ type: 'text' })
  description: string

  @Column({ name: 'short_desc' })
  shortDesc: string

  @Column({ type: 'enum', enum: ProductCategory })
  category: ProductCategory

  @Column({ type: 'enum', enum: ProductBadge, nullable: true })
  badge: ProductBadge

  @Column()
  emoji: string

  @Column({ name: 'bg_gradient' })
  bgGradient: string

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string

  // Gallery with multiple images (Recto, Verso, Détail, etc.)
  @Column({ type: 'jsonb', default: [] })
  images: ProductImage[]

  // Base price in FCFA
  @Column({ name: 'base_price', type: 'int' })
  basePrice: number

  @Column({ name: 'min_quantity', type: 'int' })
  minQuantity: number

  // Stored as JSONB for flexibility
  @Column({ type: 'jsonb', default: [] })
  formats: ProductFormat[]

  @Column({ type: 'jsonb', default: [] })
  papers: ProductPaper[]

  @Column({ type: 'jsonb', default: [] })
  quantities: number[]

  @Column({ type: 'jsonb', default: [] })
  finishes: ProductFinish[]

  @Column({ name: 'delivery_days', type: 'int', default: 3 })
  deliveryDays: number

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @Column({ name: 'is_popular', default: false })
  isPopular: boolean

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}

export interface ProductFormat {
  id: string
  label: string
  dimensions: string
  multiplier?: number // price multiplier vs. the base format (default 1)
}

export interface ProductPaper {
  id: string
  label: string
  description: string
  priceExtra?: number // flat surcharge in FCFA (default 0)
}

export interface ProductFinish {
  id: string
  label: string
  value: string
  priceModifier: number
}

export interface ProductImage {
  id: string
  label: string
  description: string
  url: string
  order: number
}
