import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

// Bannière du carrousel d'accueil de la boutique
@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 120 })
  title: string

  // Texte posé par-dessus l'image ; vide si le visuel porte déjà son propre texte
  @Column({ type: 'varchar', length: 200, nullable: true })
  subtitle: string | null

  @Column({ type: 'varchar', length: 40, nullable: true })
  badge: string | null

  @Column({ name: 'cta_label', type: 'varchar', length: 40, nullable: true })
  ctaLabel: string | null

  @Column({ name: 'alt_text', type: 'varchar', length: 200, nullable: true })
  altText: string | null

  // Visuel 1248 × 357 px, contrôlé à l'envoi (BANNER_FORMATS)
  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string

  // Version téléphone facultative (660 × 330 px)
  @Column({ name: 'mobile_image_url', type: 'text', nullable: true })
  mobileImageUrl: string | null

  @Column({ name: 'link_url', length: 300 })
  linkUrl: string

  @Index()
  @Column({ type: 'int', default: 0 })
  position: number

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt: Date | null

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt: Date | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
