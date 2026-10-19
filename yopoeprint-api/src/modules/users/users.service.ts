import {
  Injectable, NotFoundException, ConflictException, ForbiddenException,
  UnauthorizedException, BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Not, ILike, FindOptionsWhere, In } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { User, UserRole, Address, BACK_OFFICE_ROLES, isBackOffice } from './user.entity'
import { Order, PaymentStatus } from '../orders/order.entity'
import { emailEquals, phoneEquals } from '../../common/identity'
import {
  UpdateProfileDto, ChangePasswordDto, AdminUsersQueryDto, AdminUpdateUserDto,
  CreateTeamMemberDto,
} from './user.dto'

interface OrderStats { totalOrders: number; totalSpent: number; lastOrderAt: Date | null }

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  // ─── Profil (client connecté) ─────────────────────────────
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException('Utilisateur introuvable')

    if (dto.email !== undefined && dto.email !== user.email) {
      const taken = await this.userRepo.findOne({ where: { email: emailEquals(dto.email), id: Not(userId) } })
      if (taken) throw new ConflictException('Cet email est déjà utilisé')
      user.email = dto.email
    }

    if (dto.phone !== undefined && dto.phone !== user.phone) {
      if (dto.phone) {
        const taken = await this.userRepo.findOne({ where: { phone: phoneEquals(dto.phone), id: Not(userId) } })
        if (taken) throw new ConflictException('Ce numéro de téléphone est déjà utilisé')
      }
      user.phone = dto.phone
    }

    if (dto.firstName !== undefined) user.firstName = dto.firstName
    if (dto.lastName  !== undefined) user.lastName  = dto.lastName

    if (dto.addresses !== undefined) {
      const ids = new Set(dto.addresses.map((a) => a.id))
      if (ids.size !== dto.addresses.length) throw new BadRequestException('Identifiants d\'adresse en double')
      // Une seule adresse par défaut : la première cochée, sinon la première de la liste
      const defaultIndex = Math.max(dto.addresses.findIndex((a) => a.isDefault), 0)
      user.addresses = dto.addresses.map((a, i): Address => ({
        id:           a.id,
        label:        a.label,
        labelType:    a.labelType || 'home',
        fullName:     a.fullName,
        phone:        a.phone,
        street:       a.street,
        neighborhood: a.neighborhood || '',
        city:         a.city,
        isDefault:    i === defaultIndex,
      }))
    }

    await this.userRepo.save(user)
    return this.toProfile(user)
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException('Utilisateur introuvable')

    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!ok) throw new UnauthorizedException('Mot de passe actuel incorrect')
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Le nouveau mot de passe doit être différent de l\'actuel')
    }

    await this.userRepo.update(userId, {
      passwordHash:           await bcrypt.hash(dto.newPassword, 12),
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    })
    return { message: 'Mot de passe modifié' }
  }

  // ─── Admin : liste des clients avec statistiques ──────────
  async findAllForAdmin(query: AdminUsersQueryDto) {
    const page  = Math.max(parseInt(query.page  || '1', 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(query.limit || '50', 10) || 50, 1), 200)

    const base: FindOptionsWhere<User> = {}
    const role = query.role || 'client'
    if (role !== 'all') base.role = role as UserRole

    const search = query.search?.trim().replace(/[%_\\]/g, (c) => `\\${c}`)
    const where = search
      ? ['firstName', 'lastName', 'email', 'phone'].map((field) => ({ ...base, [field]: ILike(`%${search}%`) }))
      : base

    const users = await this.userRepo.find({ where, order: { createdAt: 'DESC' } })
    const stats = await this.getOrderStats(users.map((u) => u.id))

    // Le segment est calculé (pas stocké) : filtrage puis pagination en mémoire.
    // Suffisant pour quelques milliers de clients ; à passer en SQL au-delà.
    let rows = users.map((u) => this.toAdminRow(u, stats.get(u.id)))
    if (query.segment && query.segment !== 'all') rows = rows.filter((r) => r.segment === query.segment)

    const skip = (page - 1) * limit
    return { data: rows.slice(skip, skip + limit), total: rows.length, page, limit }
  }

  async findOneForAdmin(id: string) {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) throw new NotFoundException('Utilisateur introuvable')

    const [stats, orders] = await Promise.all([
      this.getOrderStats([id]),
      this.orderRepo.find({ where: { userId: id }, order: { createdAt: 'DESC' }, take: 50 }),
    ])

    return {
      ...this.toAdminRow(user, stats.get(id)),
      addresses: user.addresses || [],
      orders: orders.map((o) => ({
        id:            o.id,
        orderNumber:   o.orderNumber,
        total:         o.total,
        status:        o.status,
        paymentStatus: o.paymentStatus,
        createdAt:     o.createdAt,
        items:         (o.items || []).map((i: any) => ({ productName: i.productName, quantity: i.quantity })),
      })),
    }
  }

  async updateForAdmin(id: string, dto: AdminUpdateUserDto, actor: { id: string; role: string }) {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) throw new NotFoundException('Utilisateur introuvable')
    // Les comptes de l'équipe se gèrent depuis /admin/team (superadmin)
    if (isBackOffice(user.role) && actor.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException("Seul le super administrateur peut modifier un compte de l'équipe")
    }
    const currentUserId = actor.id

    if (dto.isActive !== undefined) {
      if (id === currentUserId && !dto.isActive) {
        throw new BadRequestException('Vous ne pouvez pas désactiver votre propre compte')
      }
      user.isActive = dto.isActive
      if (!dto.isActive) user.refreshToken = null // coupe les sessions en cours au prochain refresh
    }

    await this.userRepo.save(user)
    return this.findOneForAdmin(id)
  }

  // ─── Équipe back-office (superadmin) ──────────────────────
  async listTeam() {
    const users = await this.userRepo.find({
      where: { role: In(BACK_OFFICE_ROLES) },
      order: { createdAt: 'ASC' },
    })
    return users.map((u) => this.toTeamMember(u))
  }

  async createTeamMember(dto: CreateTeamMemberDto) {
    const email = dto.email.trim().toLowerCase()
    if (await this.userRepo.findOne({ where: { email: emailEquals(email) } })) {
      throw new ConflictException('Cet email est déjà utilisé')
    }
    const user = this.userRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email,
      phone: dto.phone || null,
      passwordHash: await bcrypt.hash(dto.password, 12),
      role: dto.role,
      loyaltyPoints: 0,
      addresses: [],
      isActive: true,
    })
    await this.userRepo.save(user)
    return this.toTeamMember(user)
  }

  async setTeamRole(id: string, role: UserRole, actorId: string) {
    if (id === actorId) throw new BadRequestException('Vous ne pouvez pas modifier votre propre rôle')
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) throw new NotFoundException('Utilisateur introuvable')
    if (user.role === UserRole.SUPERADMIN && role !== UserRole.SUPERADMIN) await this.assertNotLastSuperAdmin(id)
    user.role = role
    if (!isBackOffice(role)) user.refreshToken = null // sort de l'équipe : sessions coupées au prochain refresh
    await this.userRepo.save(user)
    return this.toTeamMember(user)
  }

  async setTeamActive(id: string, isActive: boolean, actorId: string) {
    if (id === actorId && !isActive) throw new BadRequestException('Vous ne pouvez pas désactiver votre propre compte')
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user || !isBackOffice(user.role)) throw new NotFoundException("Membre de l'équipe introuvable")
    if (!isActive && user.role === UserRole.SUPERADMIN) await this.assertNotLastSuperAdmin(id)
    user.isActive = isActive
    if (!isActive) user.refreshToken = null
    await this.userRepo.save(user)
    return this.toTeamMember(user)
  }

  private async assertNotLastSuperAdmin(exceptId: string) {
    const others = await this.userRepo.count({
      where: { role: UserRole.SUPERADMIN, isActive: true, id: Not(exceptId) },
    })
    if (!others) throw new BadRequestException('Il doit rester au moins un super administrateur actif')
  }

  private toTeamMember(u: User) {
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }
  }

  // ─── Helpers ──────────────────────────────────────────────
  toProfile(user: User) {
    return {
      id:            user.id,
      email:         user.email,
      firstName:     user.firstName,
      lastName:      user.lastName,
      phone:         user.phone,
      role:          user.role,
      loyaltyPoints: user.loyaltyPoints,
      addresses:     user.addresses,
      companyName:   user.companyName,
      resellerStatus: user.resellerStatus,
      createdAt:     user.createdAt,
    }
  }

  private async getOrderStats(userIds: string[]): Promise<Map<string, OrderStats>> {
    const map = new Map<string, OrderStats>()
    if (!userIds.length) return map

    const rows = await this.orderRepo.createQueryBuilder('o')
      .select('o.user_id', 'userId')
      .addSelect('COUNT(*)', 'totalOrders')
      .addSelect(`COALESCE(SUM(CASE WHEN o.payment_status = :paid THEN o.total ELSE 0 END), 0)`, 'totalSpent')
      .addSelect('MAX(o.created_at)', 'lastOrderAt')
      .where('o.user_id IN (:...userIds)', { userIds })
      .setParameter('paid', PaymentStatus.PAID)
      .groupBy('o.user_id')
      .getRawMany()

    for (const r of rows) {
      map.set(r.userId, {
        totalOrders: Number(r.totalOrders) || 0,
        totalSpent:  Number(r.totalSpent) || 0,
        lastOrderAt: r.lastOrderAt ? new Date(r.lastOrderAt) : null,
      })
    }
    return map
  }

  private toAdminRow(user: User, stats?: OrderStats) {
    const totalOrders = stats?.totalOrders || 0
    const totalSpent  = stats?.totalSpent || 0
    const lastOrderAt = stats?.lastOrderAt || null
    const defaultAddress = (user.addresses || []).find((a) => a.isDefault) || user.addresses?.[0]

    return {
      id:          user.id,
      firstName:   user.firstName,
      lastName:    user.lastName,
      email:       user.email,
      phone:       user.phone,
      role:        user.role,
      city:        defaultAddress?.city,
      isActive:    user.isActive,
      createdAt:   user.createdAt,
      totalOrders,
      totalSpent,
      lastOrderAt,
      segment:     computeSegment(totalOrders, totalSpent, lastOrderAt),
    }
  }
}

// Même règle que computeSegment() côté front (src/lib/clients.service.ts)
function computeSegment(totalOrders: number, totalSpent: number, lastOrderAt: Date | null) {
  if (totalSpent >= 200000 || totalOrders >= 10) return 'VIP'
  if (!lastOrderAt) return 'Nouveau'
  const daysSince = (Date.now() - lastOrderAt.getTime()) / (1000 * 60 * 60 * 24)
  return daysSince > 90 ? 'Inactif' : 'Actif'
}
