import {
  Injectable, NotFoundException, ConflictException, BadRequestException, Logger,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Not, In, IsNull } from 'typeorm'
import { User, UserRole } from '../users/user.entity'
import { Order, OrderStatus, PaymentStatus } from '../orders/order.entity'
import { MailService } from '../mail/mail.service'
import { RESELLER_TIERS, tierFor } from './reseller-tiers'
import { ResellerApplyDto, UpdateWhiteLabelDto, AdminResellerQueryDto } from './reseller.dto'

const YEAR_MS = 365 * 24 * 60 * 60 * 1000

@Injectable()
export class ResellerService {
  private readonly logger = new Logger(ResellerService.name)

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    private mailService: MailService,
  ) {}

  // ─── Candidature (client connecté) ────────────────────────
  async apply(userId: string, dto: ResellerApplyDto) {
    const user = await this.getUser(userId)
    if (user.role === UserRole.ADMIN || user.role === UserRole.STAFF) {
      throw new BadRequestException('Un compte administrateur ne peut pas devenir revendeur')
    }
    if (user.resellerStatus === 'approved') throw new ConflictException('Votre compte revendeur est déjà actif')
    if (user.resellerStatus === 'pending') throw new ConflictException('Votre demande est déjà en cours d\'examen')
    if (user.resellerStatus === 'suspended') {
      throw new ConflictException('Votre compte revendeur est suspendu : contactez-nous')
    }

    user.companyName = dto.companyName
    user.resellerStatus = 'pending'
    user.resellerAppliedAt = new Date()
    user.resellerProfile = {
      ...(user.resellerProfile || {}),
      contactName: dto.contactName,
      phone: dto.phone,
      volume: dto.volume,
      message: dto.message,
    }
    await this.userRepo.save(user)

    try {
      await this.mailService.sendResellerApplicationReceived(user.email, user.firstName, dto.companyName)
    } catch (err: any) {
      this.logger.warn(`Accusé de réception revendeur non envoyé : ${err?.message || err}`)
    }
    return this.getMe(userId)
  }

  // ─── Statut du compte (tout utilisateur connecté) ─────────
  async getMe(userId: string) {
    const user = await this.getUser(userId)
    const isReseller = user.role === UserRole.RESELLER
    const revenue = isReseller ? await this.paidRevenue12m(userId) : 0
    const tier = isReseller ? tierFor(revenue) : null
    return {
      status: user.resellerStatus,
      companyName: user.companyName,
      appliedAt: user.resellerAppliedAt,
      isReseller,
      tier: tier ? { id: tier.current.id, label: tier.current.label, rate: tier.current.rate } : null,
      whiteLabel: user.resellerProfile?.sender || null,
      tiers: RESELLER_TIERS,
    }
  }

  // ─── Tableau de bord (revendeur) ──────────────────────────
  async getStats(userId: string) {
    const user = await this.getUser(userId)
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearAgo = new Date(now.getTime() - YEAR_MS)
    const paid = PaymentStatus.PAID

    const sums = await this.orderRepo.createQueryBuilder('o')
      .select(`COALESCE(SUM(o.discount) FILTER (WHERE o.payment_status = :paid AND o.created_at >= :monthStart), 0)`, 'savingsMonth')
      .addSelect(`COALESCE(SUM(o.discount) FILTER (WHERE o.payment_status = :paid AND o.created_at >= :yearAgo), 0)`, 'savingsYear')
      .addSelect(`COALESCE(SUM(o.total) FILTER (WHERE o.payment_status = :paid AND o.created_at >= :yearAgo), 0)`, 'revenue12m')
      .addSelect(`COUNT(*) FILTER (WHERE o.payment_status = :paid AND o.created_at >= :yearAgo)`, 'orders12m')
      .where('o.user_id = :userId', { userId })
      .setParameters({ paid, monthStart, yearAgo })
      .getRawOne()

    const activeOrders = await this.orderRepo.count({
      where: {
        userId,
        status: Not(In([OrderStatus.PENDING, OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REFUNDED])),
      },
    })

    const revenue12m = Number(sums.revenue12m) || 0
    const tier = tierFor(revenue12m)

    return {
      companyName: user.companyName,
      tier: { id: tier.current.id, label: tier.current.label, rate: tier.current.rate },
      nextTier: tier.next ? { id: tier.next.id, label: tier.next.label, rate: tier.next.rate, minRevenue: tier.next.minRevenue } : null,
      progressToNextTier: tier.progressToNext,
      amountNeededForNextTier: tier.amountToNext,
      revenue12m,
      paidOrders12m: Number(sums.orders12m) || 0,
      savingsThisMonth: Number(sums.savingsMonth) || 0,
      savings12m: Number(sums.savingsYear) || 0,
      activeOrdersCount: activeOrders,
      whiteLabelConfigured: !!user.resellerProfile?.sender,
    }
  }

  // ─── Identité marque blanche (revendeur) ──────────────────
  async updateWhiteLabel(userId: string, dto: UpdateWhiteLabelDto) {
    const user = await this.getUser(userId)
    user.resellerProfile = { ...(user.resellerProfile || {}), sender: { ...dto.sender } }
    await this.userRepo.save(user)
    return { whiteLabel: user.resellerProfile.sender }
  }

  // ─── Remise appliquée à une commande ──────────────────────
  // null si l'utilisateur n'est pas un revendeur actif
  async discountFor(userId: string): Promise<{ rate: number; tier: string; sender: User['resellerProfile']['sender'] | null } | null> {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user || user.role !== UserRole.RESELLER || user.resellerStatus !== 'approved') return null
    const tier = tierFor(await this.paidRevenue12m(userId)).current
    return { rate: tier.rate, tier: tier.label, sender: user.resellerProfile?.sender || null }
  }

  // ─── Admin ────────────────────────────────────────────────
  async listForAdmin(query: AdminResellerQueryDto) {
    const status = query.status && query.status !== 'all' ? query.status : null
    const users = await this.userRepo.find({
      where: status ? { resellerStatus: status as any } : { resellerStatus: Not(IsNull()) },
      order: { resellerAppliedAt: 'DESC' },
    })
    const revenues = await this.revenueByUser(users.map((u) => u.id))
    return users
      .map((u) => {
        const revenue = revenues.get(u.id) || 0
        const tier = tierFor(revenue).current
        return {
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone,
          companyName: u.companyName,
          status: u.resellerStatus,
          appliedAt: u.resellerAppliedAt,
          profile: {
            contactName: u.resellerProfile?.contactName,
            phone: u.resellerProfile?.phone,
            volume: u.resellerProfile?.volume,
            message: u.resellerProfile?.message,
          },
          revenue12m: revenue,
          tier: u.resellerStatus === 'approved' ? { label: tier.label, rate: tier.rate } : null,
        }
      })
  }

  async decide(id: string, action: 'approve' | 'reject' | 'suspend') {
    const user = await this.getUser(id)
    if (!user.resellerStatus) throw new BadRequestException('Cet utilisateur n\'a pas demandé à devenir revendeur')
    if (user.role === UserRole.ADMIN || user.role === UserRole.STAFF) {
      throw new BadRequestException('Un compte administrateur ne peut pas être revendeur')
    }

    if (action === 'approve') {
      user.resellerStatus = 'approved'
      user.role = UserRole.RESELLER
    } else if (action === 'reject') {
      if (user.resellerStatus === 'approved') throw new BadRequestException('Compte déjà validé : utilisez la suspension')
      user.resellerStatus = 'rejected'
      user.role = UserRole.CLIENT
    } else {
      user.resellerStatus = 'suspended'
      user.role = UserRole.CLIENT
    }
    await this.userRepo.save(user)

    if (action === 'approve') {
      try {
        await this.mailService.sendResellerApproved(user.email, user.firstName, user.companyName || '', RESELLER_TIERS[0].rate)
      } catch (err: any) {
        this.logger.warn(`Email d'activation revendeur non envoyé : ${err?.message || err}`)
      }
    }
    return { id: user.id, status: user.resellerStatus, role: user.role }
  }

  // ─── Helpers ──────────────────────────────────────────────
  private async getUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) throw new NotFoundException('Utilisateur introuvable')
    return user
  }

  private async paidRevenue12m(userId: string) {
    return (await this.revenueByUser([userId])).get(userId) || 0
  }

  private async revenueByUser(userIds: string[]) {
    const map = new Map<string, number>()
    if (!userIds.length) return map
    const rows = await this.orderRepo.createQueryBuilder('o')
      .select('o.user_id', 'userId')
      .addSelect('COALESCE(SUM(o.total), 0)', 'revenue')
      .where('o.user_id IN (:...userIds)', { userIds })
      .andWhere('o.payment_status = :paid', { paid: PaymentStatus.PAID })
      .andWhere('o.created_at >= :since', { since: new Date(Date.now() - YEAR_MS) })
      .groupBy('o.user_id')
      .getRawMany()
    for (const r of rows) map.set(r.userId, Number(r.revenue) || 0)
    return map
  }
}
