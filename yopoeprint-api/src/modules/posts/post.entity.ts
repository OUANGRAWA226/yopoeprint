import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

// Article du blog, rédigé en Markdown dans l'admin et rendu en HTML échappé par l'API (markdown.ts)
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 120, unique: true })
  slug: string

  @Column({ length: 160 })
  title: string

  @Column({ length: 300 })
  excerpt: string

  // Markdown
  @Column({ type: 'text' })
  content: string

  @Column({ length: 60 })
  category: string

  @Column({ name: 'author_name', length: 80, default: 'L\'équipe YopoePrint' })
  authorName: string

  @Column({ name: 'cover_url', type: 'text', nullable: true })
  coverUrl: string | null

  @Index()
  @Column({ name: 'is_published', default: false })
  isPublished: boolean

  // Fixée à la première publication (ordre du blog et date affichée)
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
