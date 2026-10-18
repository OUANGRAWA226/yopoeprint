import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Not, In } from 'typeorm'
import { PromoCode } from './promo-code.entity'
import { CreatePromoDto, UpdatePromoDto } from './promo.dto'
import { Order, OrderStatus, PaymentStatus } from '../orders/order.entity'

// Une commande annulée ou remboursée libère le code
const COUNTED = Not(In([OrderStatus.CANCELLED, OrderStatus.REFUNDED]))

export interface PromoView {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrder: number
  maxUses: number | null
  oncePerCustomer: boolean
  description: string | null
  active: boolean
  featured: boolean
  startDate: string | null
  endDate: string | null
  uses: number      // commandes passées avec le code (hors annulées / remboursées)
  paidUses: number  // dont commandes payées
  discountTotal: number // remises accordées sur les commandes payées (FCFA)
}

// Contrat lu par la boutique (src/lib/promo.service.ts)
export interface PromoCheck {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount: number
  description: string | null
  isValid: boolean
  message?: string
}

export const describePromo = (p: Pick<PromoCode, 'type' | 'value'>) =>
  p.type === 'percentage' ? `−${p.value} %` : `−${new Intl.NumberFormat('fr-FR').format(p.value)} FCFA`

@Injectable()
export class PromosService {
  constructor(
    @InjectRepository(PromoCode) private repo: Repository<PromoCode>,
    @InjectRepository(Order) private orders: Repository<Order>,
  ) {}

  // ─── Admin ─────────────────────────────────────────────────
  async list(): Promise<PromoView[]> {
    const promos = await this.repo.find({ order: { createdAt: 'DESC' } })
    const stats: { code: string; uses: string; paid: string; discount: string }[] = await this.orders.createQueryBuilder('o')
      .select('o.promo_code', 'code')
      .addSelect(`COUNT(*) FILTER (WHERE o.status NOT IN ('${OrderStatus.CANCELLED}', '${OrderStatus.REFUNDED}'))`, 'uses')
      .addSelect(`COUNT(*) FILTER (WHERE o.payment_status = '${PaymentStatus.PAID}')`, 'paid')
      .addSelect(`COALESCE(SUM(o.discount) FILTER (WHERE o.payment_status = '${PaymentStatus.PAID}'), 0)`, 'discount')
      .where('o.promo_code IS NOT NULL')
      .groupBy('o.promo_code')
      .getRawMany()
    const byCode = new Map(stats.map((s) => [s.code, s]))
    return promos.map((p) => {
      const s = byCode.get(p.code)
      return this.toView(p, Number(s?.uses) || 0, Number(s?.paid) || 0, Number(s?.discount) || 0)
    })
  }

  async create(dto: CreatePromoDto): Promise<PromoView> {
    if (await this.repo.findOne({ where: { code: dto.code } })) throw new ConflictException(`Le code ${dto.code} existe déjà`)
    const promo = this.repo.create({
      code: dto.code,
      type: dto.type,
      value: dto.value,
      minOrder: dto.minOrder ?? 0,
      maxUses: dto.maxUses ?? null,
      oncePerCustomer: dto.oncePerCustomer ?? false,
      description: dto.description ?? null,
      isActive: dto.active ?? true,
      isFeatured: dto.featured ?? false,
      startsAt: dto.startDate ? new Date(dto.startDate) : null,
      endsAt: dto.endDate ? new Date(dto.endDate) : null,
    })
    this.assertConsistent(promo)
    const saved = await this.save(promo)
    return this.toView(saved, 0, 0, 0)
  }

  async update(id: string, dto: UpdatePromoDto): Promise<PromoView> {
    const promo = await this.findOne(id)
    if (dto.code !== undefined && dto.code !== promo.code) {
      if (await this.countUses(promo.code)) {
        throw new ConflictException('Ce code a déjà servi : créez un nouveau code plutôt que de le renommer')
      }
      if (await this.repo.findOne({ where: { code: dto.code } })) throw new ConflictException(`Le code ${dto.code} existe déjà`)
      promo.code = dto.code
    }
    if (dto.type !== undefined) promo.type = dto.type
    if (dto.value !== undefined) promo.value = dto.value
    if (dto.minOrder !== undefined) promo.minOrder = dto.minOrder
    if (dto.maxUses !== undefined) promo.maxUses = dto.maxUses ?? null
    if (dto.oncePerCustomer !== undefined) promo.oncePerCustomer = dto.oncePerCustomer
    if (dto.description !== undefined) promo.description = dto.description ?? null
    if (dto.active !== undefined) promo.isActive = dto.active
    if (dto.featured !== undefined) promo.isFeatured = dto.featured
    if (dto.startDate !== undefined) promo.startsAt = dto.startDate ? new Date(dto.startDate) : null
    if (dto.endDate !== undefined) promo.endsAt = dto.endDate ? new Date(dto.endDate) : null
    this.assertConsistent(promo)
    await this.save(promo)
    return (await this.list()).find((p) => p.id === id)!
  }

  async remove(id: string) {
    const promo = await this.findOne(id)
    if (await this.countUses(promo.code)) {
      throw new ConflictException('Ce code figure sur des commandes : désactivez-le au lieu de le supprimer')
    }
    await this.repo.remove(promo)
    return { id, deleted: true }
  }

  // ─── Boutique ──────────────────────────────────────────────
  /** Code mis en avant sur la boutique, s'il est actif et dans sa période. */
  async featured() {
    const promo = await this.repo.findOne({ where: { isFeatured: true, isActive: true } })
    if (!promo || !this.inPeriod(promo)) return null
    return {
      code: promo.code,
      type: promo.type,
      value: promo.value,
      minOrder: promo.minOrder,
      label: promo.description || describePromo(promo),
    }
  }

  /** Vérification depuis le panier : ne lève pas d'erreur, renvoie isValid et la raison. */
  async check(code: string, subtotal: number, userId?: string): Promise<PromoCheck> {
    const promo = await this.repo.findOne({ where: { code } })
    const base: PromoCheck = {
      code,
      discountType: promo?.type ?? 'percentage',
      discountValue: promo?.value ?? 0,
      minOrderAmount: promo?.minOrder ?? 0,
      description: promo?.description ?? null,
      isValid: false,
    }
    try {
      await this.evaluate(code, subtotal, userId)
      return { ...base, isValid: true }
    } catch (e: any) {
      return { ...base, message: e?.message || 'Code promo invalide' }
    }
  }

  /**
   * Montant de la remise pour une commande ; lève une erreur explicite si le code ne s'applique pas.
   * Le compte des utilisations se fait sur les commandes (hors annulées / remboursées).
   */
  async evaluate(code: string, subtotal: number, userId?: string): Promise<{ promo: PromoCode; discount: number }> {
    const promo = await this.repo.findOne({ where: { code: code.trim().toUpperCase() } })
    if (!promo || !promo.isActive) throw new BadRequestException('Code promo invalide')
    const now = Date.now()
    if (promo.startsAt && promo.startsAt.getTime() > now) throw new BadRequestException('Ce code n\'est pas encore valable')
    if (promo.endsAt && promo.endsAt.getTime() <= now) throw new BadRequestException('Ce code a expiré')
    if (subtotal < promo.minOrder) {
      throw new BadRequestException(`Ce code s'applique dès ${new Intl.NumberFormat('fr-FR').format(promo.minOrder)} FCFA d'achat`)
    }
    if (promo.maxUses !== null && (await this.countUses(promo.code)) >= promo.maxUses) {
      throw new BadRequestException('Ce code a atteint son nombre maximal d\'utilisations')
    }
    if (promo.oncePerCustomer && userId && (await this.countUses(promo.code, userId))) {
      throw new BadRequestException('Vous avez déjà utilisé ce code')
    }
    const discount = promo.type === 'percentage'
      ? Math.round((subtotal * promo.value) / 100)
      : Math.min(promo.value, subtotal)
    return { promo, discount }
  }

  // ─── Interne ───────────────────────────────────────────────
  private countUses(code: string, userId?: string) {
    return this.orders.count({ where: { promoCode: code, status: COUNTED, ...(userId ? { userId } : {}) } })
  }

  private inPeriod(p: PromoCode) {
    const now = Date.now()
    return (!p.startsAt || p.startsAt.getTime() <= now) && (!p.endsAt || p.endsAt.getTime() > now)
  }

  private assertConsistent(p: PromoCode) {
    if (p.type === 'percentage' && p.value > 90) throw new BadRequestException('Une remise en pourcentage ne peut dépasser 90 %')
    if (p.startsAt && p.endsAt && p.endsAt <= p.startsAt) throw new BadRequestException('La date de fin doit suivre la date de début')
  }

  // Un seul code mis en avant : le nouveau remplace l'ancien
  private async save(promo: PromoCode) {
    return this.repo.manager.transaction(async (em) => {
      if (promo.isFeatured) {
        await em.createQueryBuilder().update(PromoCode).set({ isFeatured: false })
          .where('is_featured = true' + (promo.id ? ' AND id <> :id' : ''), { id: promo.id }).execute()
      }
      return em.save(promo)
    })
  }

  private async findOne(id: string) {
    const promo = await this.repo.findOne({ where: { id } })
    if (!promo) throw new NotFoundException('Code promo introuvable')
    return promo
  }

  private toView(p: PromoCode, uses: number, paidUses: number, discountTotal: number): PromoView {
    return {
      id: p.id,
      code: p.code,
      type: p.type,
      value: p.value,
      minOrder: p.minOrder,
      maxUses: p.maxUses,
      oncePerCustomer: p.oncePerCustomer,
      description: p.description,
      active: p.isActive,
      featured: p.isFeatured,
      startDate: p.startsAt ? p.startsAt.toISOString() : null,
      endDate: p.endsAt ? p.endsAt.toISOString() : null,
      uses,
      paidUses,
      discountTotal,
    }
  }
}
