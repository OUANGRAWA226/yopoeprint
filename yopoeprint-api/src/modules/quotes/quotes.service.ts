import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, QueryFailedError } from 'typeorm'
import { randomInt } from 'crypto'
import { Quote, QuoteStatus } from './quote.entity'
import { CreateQuoteDto, UpdateQuoteStatusDto, QuoteQueryDto } from './quote.dto'
import { MailService } from '../mail/mail.service'

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name)
  // Sans caractères ambigus (0/O, 1/I/L)
  private static readonly REF_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

  constructor(
    @InjectRepository(Quote)
    private quoteRepo: Repository<Quote>,
    private mailService: MailService,
  ) {}

  // ─── Create (public, compte facultatif) ───────────────────
  async create(dto: CreateQuoteDto, userId: string | null) {
    const data = {
      userId,
      fullName:    dto.fullName,
      email:       dto.email.toLowerCase(),
      phone:       dto.phone,
      company:     dto.company || null,
      profile:     dto.profile,
      product:     dto.product,
      quantity:    dto.quantity,
      format:      dto.format || null,
      description: dto.description,
      budget:      dto.budget,
      deadline:    dto.deadline,
      hasFile:     !!dto.hasFile || !!dto.files?.length,
      fileDesc:    dto.fileDesc || null,
      files:       dto.files || [],
      status:      QuoteStatus.NEW,
    }

    // Retry on the (very unlikely) unique-constraint collision of the random reference
    let saved: Quote
    for (let attempt = 1; ; attempt++) {
      try {
        saved = await this.quoteRepo.save(this.quoteRepo.create({ ...data, reference: this.generateReference() }))
        break
      } catch (err) {
        const isUniqueViolation = err instanceof QueryFailedError && (err as any).driverError?.code === '23505'
        if (!isUniqueViolation || attempt >= 5) throw err
      }
    }

    try {
      await this.mailService.sendQuoteReceived(saved.email, saved.fullName, saved.reference, saved.product)
    } catch (err: any) {
      this.logger.warn(`Email d'accusé de réception du devis ${saved.reference} non envoyé : ${err?.message || err}`)
    }

    return {
      id:        saved.id,
      reference: saved.reference,
      status:    saved.status,
      createdAt: saved.createdAt,
      message:   'Demande de devis enregistrée',
    }
  }

  // ─── Mes devis (client) ───────────────────────────────────
  async findByUser(userId: string) {
    const quotes = await this.quoteRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    })
    return quotes.map((q) => this.toResponse(q, false))
  }

  // ─── Tous les devis (admin) ───────────────────────────────
  async findAll(query: QuoteQueryDto) {
    const page  = Math.max(parseInt(query.page  || '1', 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(query.limit || '50', 10) || 50, 1), 200)
    const skip  = (page - 1) * limit

    const where: any = {}
    if (query.status) where.status = query.status

    const [quotes, total] = await this.quoteRepo.findAndCount({
      where,
      skip,
      take:  limit,
      order: { createdAt: 'DESC' },
    })

    const data = quotes.map((q) => this.toResponse(q, true))
    return { data, total, page, limit, hasMore: skip + data.length < total }
  }

  // ─── Détail (admin) ───────────────────────────────────────
  async findOne(id: string) {
    const quote = await this.quoteRepo.findOne({ where: { id } })
    if (!quote) throw new NotFoundException('Devis introuvable')
    return this.toResponse(quote, true)
  }

  // ─── Changement de statut / chiffrage (admin) ─────────────
  async updateStatus(id: string, dto: UpdateQuoteStatusDto) {
    const quote = await this.quoteRepo.findOne({ where: { id } })
    if (!quote) throw new NotFoundException('Devis introuvable')

    const wasSent = quote.status === QuoteStatus.SENT
    quote.status = dto.status
    if (dto.price !== undefined)      quote.price = dto.price
    if (dto.adminNotes !== undefined) quote.adminNotes = dto.adminNotes || null
    await this.quoteRepo.save(quote)

    // Prévenir le client quand la proposition chiffrée part
    if (quote.status === QuoteStatus.SENT && !wasSent && quote.price) {
      try {
        await this.mailService.sendQuoteProposal(quote.email, quote.fullName, quote.reference, quote.price)
      } catch (err: any) {
        this.logger.warn(`Email de proposition du devis ${quote.reference} non envoyé : ${err?.message || err}`)
      }
    }

    return this.toResponse(quote, true)
  }

  // ─── Helpers ──────────────────────────────────────────────
  private toResponse(q: Quote, forAdmin: boolean) {
    return {
      id:          q.id,
      reference:   q.reference,
      title:       `${q.product} — ${q.quantity}`,
      details:     q.description,
      status:      q.status,
      price:       q.price ?? undefined,
      createdAt:   q.createdAt,
      updatedAt:   q.updatedAt,
      client:      { name: q.fullName, email: q.email, phone: q.phone, company: q.company },
      profile:     q.profile,
      product:     q.product,
      quantity:    q.quantity,
      format:      q.format,
      description: q.description,
      budget:      q.budget,
      deadline:    q.deadline,
      hasFile:     q.hasFile,
      fileDesc:    q.fileDesc,
      files:       q.files,
      ...(forAdmin ? { userId: q.userId, adminNotes: q.adminNotes } : {}),
    }
  }

  private generateReference(): string {
    const year = new Date().getFullYear()
    const alphabet = QuotesService.REF_ALPHABET
    let rand = ''
    for (let i = 0; i < 8; i++) rand += alphabet[randomInt(alphabet.length)]
    return `DEV-${year}-${rand.slice(0, 4)}-${rand.slice(4)}`
  }
}
