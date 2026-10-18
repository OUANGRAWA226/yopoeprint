import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Post } from './post.entity'
import { CreatePostDto, UpdatePostDto } from './post.dto'
import { renderMarkdown, readMinutes } from './markdown'

// Contrat lu par la boutique (src/lib/blog.service.ts) : contenu déjà rendu en HTML échappé
export interface PublicPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  date: string
  publishedAt: string | null
  readTime: string
  imageUrl: string | null
}

// Vue admin : Markdown brut et brouillons
export interface AdminPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  imageUrl: string | null
  published: boolean
  publishedAt: string | null
  updatedAt: string
  readMinutes: number
}

const DATE_FR = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

@Injectable()
export class PostsService {
  constructor(@InjectRepository(Post) private repo: Repository<Post>) {}

  async listPublished(): Promise<PublicPost[]> {
    const posts = await this.repo.find({ where: { isPublished: true }, order: { publishedAt: 'DESC' } })
    return posts.map((p) => this.toPublic(p))
  }

  async findPublished(slug: string): Promise<PublicPost> {
    const post = await this.repo.findOne({ where: { slug, isPublished: true } })
    if (!post) throw new NotFoundException('Article introuvable')
    return this.toPublic(post)
  }

  async listAll(): Promise<AdminPost[]> {
    const posts = await this.repo.find({ order: { updatedAt: 'DESC' } })
    return posts.map((p) => this.toAdmin(p))
  }

  async create(dto: CreatePostDto): Promise<AdminPost> {
    await this.assertSlugFree(dto.slug)
    const post = this.repo.create({
      slug: dto.slug,
      title: dto.title,
      excerpt: dto.excerpt,
      content: dto.content,
      category: dto.category,
      authorName: dto.author || 'L\'équipe YopoePrint',
      coverUrl: dto.imageUrl ?? null,
      isPublished: !!dto.published,
      publishedAt: dto.published ? new Date() : null,
    })
    return this.toAdmin(await this.repo.save(post))
  }

  async update(id: string, dto: UpdatePostDto): Promise<AdminPost> {
    const post = await this.findOne(id)
    if (dto.slug !== undefined && dto.slug !== post.slug) {
      await this.assertSlugFree(dto.slug)
      post.slug = dto.slug
    }
    if (dto.title !== undefined) post.title = dto.title
    if (dto.excerpt !== undefined) post.excerpt = dto.excerpt
    if (dto.content !== undefined) post.content = dto.content
    if (dto.category !== undefined) post.category = dto.category
    if (dto.author !== undefined) post.authorName = dto.author || 'L\'équipe YopoePrint'
    if (dto.imageUrl !== undefined) post.coverUrl = dto.imageUrl ?? null
    if (dto.published !== undefined) {
      post.isPublished = dto.published
      // La date de publication reste celle de la première mise en ligne
      if (dto.published && !post.publishedAt) post.publishedAt = new Date()
    }
    return this.toAdmin(await this.repo.save(post))
  }

  async remove(id: string) {
    const post = await this.findOne(id)
    await this.repo.remove(post)
    return { id, deleted: true }
  }

  private async assertSlugFree(slug: string) {
    if (await this.repo.findOne({ where: { slug } })) throw new ConflictException('Un article utilise déjà cette adresse')
  }

  private async findOne(id: string) {
    const post = await this.repo.findOne({ where: { id } })
    if (!post) throw new NotFoundException('Article introuvable')
    return post
  }

  private toPublic(p: Post): PublicPost {
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: renderMarkdown(p.content),
      category: p.category,
      author: p.authorName,
      date: p.publishedAt ? DATE_FR.format(p.publishedAt) : '',
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
      readTime: `${readMinutes(p.content)} min`,
      imageUrl: p.coverUrl,
    }
  }

  private toAdmin(p: Post): AdminPost {
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      category: p.category,
      author: p.authorName,
      imageUrl: p.coverUrl,
      published: p.isPublished,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
      updatedAt: p.updatedAt.toISOString(),
      readMinutes: readMinutes(p.content),
    }
  }
}
