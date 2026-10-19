import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In, Not, IsNull, LessThan, MoreThan, Between } from 'typeorm'
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from '../orders/order.entity'
import { Quote, QuoteStatus } from '../quotes/quote.entity'
import { User } from '../users/user.entity'
import { EmailLog } from '../mail/email-log.entity'
import { PaymentEvent } from '../payments/payment-event.entity'

const HOUR = 3600_000
const ago = (hours: number) => new Date(Date.now() - hours * HOUR)
const CLOSED = [OrderStatus.CANCELLED, OrderStatus.REFUNDED]
const DONE = [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REFUNDED]

export interface Alert {
  id: string
  severity: 'high' | 'medium' | 'low'
  count: number
  title: string
  hint: string
  href: string
  sample: string[]
}

const STATUS_FR: Record<string, string> = {
  pending: 'En attente de paiement', confirmed: 'Payée', bat_pending: 'BAT envoyé', in_production: 'En production',
  ready: 'Prête', shipped: 'En livraison', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
}
const PAYMENT_FR: Record<string, string> = { pending: 'En attente', paid: 'Payé', failed: 'Échoué', refunded: 'Remboursé' }
const METHOD_FR: Record<string, string> = {
  orange_money: 'Orange Money', moov_money: 'Moov Money', visa: 'Visa', mastercard: 'Mastercard', virement: 'Virement',
}

// CSV pour Excel (France / Afrique francophone) : séparateur « ; », BOM UTF-8, fins de ligne CRLF.
// Une cellule commençant par = + - @ est préfixée d'une apostrophe (pas de formule exécutée à l'ouverture),
// sauf un simple numéro (+226 70 12 34 56, -1500) qui ne peut rien exécuter et reste lisible.
function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(s) && !/^[+-][\d\s.()]+$/.test(s)) s = `'${s}`
  return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const toCsv = (header: string[], rows: unknown[][]) =>
  '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(';')).join('\r\n') + '\r\n'

const dateFr = (d?: Date | null) => (d ? new Date(d).toLocaleDateString('fr-FR', { timeZone: 'Africa/Ouagadougou' }) : '')

@Injectable()
export class SupervisionService {
  constructor(
    @InjectRepository(Order) private orders: Repository<Order>,
    @InjectRepository(Quote) private quotes: Repository<Quote>,
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(EmailLog) private emails: Repository<EmailLog>,
    @InjectRepository(PaymentEvent) private payments: Repository<PaymentEvent>,
  ) {}

  /** Points qui demandent une action, du plus urgent au moins urgent (alertes vides omises). */
  async alerts(): Promise<Alert[]> {
    const [paidIdle, batWaiting, late, quotesNew, resellers, transfers, stalePayments, anomalies, emailsFailed] = await Promise.all([
      this.orders.find({ where: { status: OrderStatus.CONFIRMED, updatedAt: LessThan(ago(24)) }, order: { updatedAt: 'ASC' }, take: 50 }),
      this.orders.find({ where: { status: OrderStatus.BAT_PENDING, updatedAt: LessThan(ago(48)) }, order: { updatedAt: 'ASC' }, take: 50 }),
      this.orders.find({
        where: { paymentStatus: PaymentStatus.PAID, status: Not(In(DONE)), estimatedDelivery: LessThan(new Date()) },
        order: { estimatedDelivery: 'ASC' }, take: 50,
      }),
      this.quotes.find({ where: { status: QuoteStatus.NEW, createdAt: LessThan(ago(24)) }, order: { createdAt: 'ASC' }, take: 50 }),
      this.users.find({ where: { resellerStatus: 'pending', resellerAppliedAt: LessThan(ago(48)) } as any, order: { resellerAppliedAt: 'ASC' } as any, take: 50 }),
      this.orders.find({ where: { paymentMethod: PaymentMethod.VIREMENT, paymentStatus: PaymentStatus.PENDING, status: Not(In(CLOSED)) }, take: 50 }),
      this.orders.count({
        where: { paymentStatus: PaymentStatus.PENDING, paymentTransactionId: Not(IsNull()), status: Not(In(CLOSED)), createdAt: LessThan(ago(0.5)) },
      }),
      this.payments.count({ where: { type: In(['amount_mismatch', 'invalid_signature', 'unknown_transaction']), createdAt: MoreThan(ago(24 * 7)) } as any }),
      this.emails.count({ where: { status: 'failed', createdAt: MoreThan(ago(24 * 7)) } }),
    ])

    const alerts: Alert[] = [
      {
        id: 'payment-anomalies', severity: 'high', count: anomalies,
        title: 'Anomalies de paiement (7 jours)',
        hint: 'Montant différent de la commande, signature invalide ou transaction inconnue : à vérifier dans le journal.',
        href: '/admin/paiements', sample: [],
      },
      {
        id: 'paid-idle', severity: 'high', count: paidIdle.length,
        title: 'Commandes payées sans suite depuis plus de 24 h',
        hint: 'Préparez le BAT ou lancez la production.',
        href: '/admin/commandes', sample: paidIdle.slice(0, 3).map((o) => o.orderNumber),
      },
      {
        id: 'late', severity: 'high', count: late.length,
        title: 'Commandes en retard sur la date de livraison annoncée',
        hint: 'Prévenez le client ou mettez la commande à jour.',
        href: '/admin/commandes', sample: late.slice(0, 3).map((o) => `${o.orderNumber} (prévue le ${dateFr(o.estimatedDelivery)})`),
      },
      {
        id: 'transfers', severity: 'medium', count: transfers.length,
        title: 'Virements à encaisser',
        hint: 'Rapprochez les virements reçus puis marquez les commandes payées.',
        href: '/admin/paiements', sample: transfers.slice(0, 3).map((o) => o.orderNumber),
      },
      {
        id: 'stale-payments', severity: 'medium', count: stalePayments,
        title: 'Paiements CinetPay en attente depuis plus de 30 min',
        hint: 'Notification peut-être perdue : revérifiez auprès de CinetPay.',
        href: '/admin/paiements', sample: [],
      },
      {
        id: 'quotes', severity: 'medium', count: quotesNew.length,
        title: 'Demandes de devis sans réponse depuis plus de 24 h',
        hint: 'Le client attend une proposition.',
        href: '/admin/devis', sample: quotesNew.slice(0, 3).map((q) => `${q.reference} — ${q.fullName}`),
      },
      {
        id: 'bat-waiting', severity: 'low', count: batWaiting.length,
        title: 'BAT en attente de validation client depuis plus de 48 h',
        hint: 'Relancez le client pour ne pas bloquer la production.',
        href: '/admin/commandes', sample: batWaiting.slice(0, 3).map((o) => o.orderNumber),
      },
      {
        id: 'resellers', severity: 'low', count: resellers.length,
        title: 'Demandes revendeur en attente depuis plus de 48 h',
        hint: 'Acceptez ou refusez la demande.',
        href: '/admin/revendeurs', sample: resellers.slice(0, 3).map((u) => u.companyName || u.email),
      },
      {
        id: 'emails', severity: 'low', count: emailsFailed,
        title: 'Emails en échec (7 jours)',
        hint: 'Vérifiez la configuration Resend et les adresses concernées.',
        href: '/admin/emails', sample: [],
      },
    ]
    return alerts.filter((a) => a.count > 0)
  }

  // ─── Exports CSV ─────────────────────────────────────────
  private range(from?: string, to?: string) {
    const end = to ? new Date(`${to}T23:59:59.999`) : new Date()
    const start = from ? new Date(`${from}T00:00:00`) : new Date(end.getTime() - 30 * 24 * HOUR)
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) throw new BadRequestException('Période invalide (format AAAA-MM-JJ)')
    if (end.getTime() - start.getTime() > 367 * 24 * HOUR) throw new BadRequestException('Période limitée à un an')
    return { start, end }
  }

  async ordersCsv(from?: string, to?: string) {
    const { start, end } = this.range(from, to)
    const rows = await this.orders.find({ where: { createdAt: Between(start, end) }, relations: ['user'], order: { createdAt: 'ASC' } })
    const csv = toCsv(
      ['N° commande', 'Date', 'Client', 'Email', 'Téléphone', 'Statut', 'Paiement', 'Moyen de paiement', 'Sous-total (FCFA)',
        'Remise (FCFA)', 'Code promo', 'Livraison (FCFA)', 'Total (FCFA)', 'Zone', 'Ville', 'Référence de paiement', 'Livrée le'],
      rows.map((o) => [
        o.orderNumber, dateFr(o.createdAt),
        o.user ? `${o.user.firstName} ${o.user.lastName}`.trim() : o.deliveryAddress?.fullName,
        o.user?.email ?? '', o.deliveryAddress?.phone ?? o.user?.phone ?? '',
        STATUS_FR[o.status] ?? o.status, PAYMENT_FR[o.paymentStatus] ?? o.paymentStatus, METHOD_FR[o.paymentMethod] ?? o.paymentMethod,
        o.subtotal, o.discount, o.promoCode ?? '', o.deliveryCost, o.total,
        o.deliveryAddress?.zone ?? '', o.deliveryAddress?.city ?? '', o.paymentTransactionId ?? '', dateFr(o.deliveredAt),
      ]),
    )
    return { csv, filename: `commandes_${start.toISOString().slice(0, 10)}_${end.toISOString().slice(0, 10)}.csv`, count: rows.length }
  }

  async clientsCsv() {
    const users = await this.users.find({ order: { createdAt: 'ASC' } })
    const stats: { user_id: string; paid: string; revenue: string; last: Date }[] = await this.orders.createQueryBuilder('o')
      .select('o.user_id', 'user_id')
      .addSelect(`COUNT(*) FILTER (WHERE o.payment_status = '${PaymentStatus.PAID}')`, 'paid')
      .addSelect(`COALESCE(SUM(o.total) FILTER (WHERE o.payment_status = '${PaymentStatus.PAID}'), 0)`, 'revenue')
      .addSelect('MAX(o.created_at)', 'last')
      .groupBy('o.user_id').getRawMany()
    const byUser = new Map(stats.map((s) => [s.user_id, s]))
    const csv = toCsv(
      ['Prénom', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Société', 'Statut revendeur', 'Actif', 'Inscrit le',
        'Commandes payées', 'CA payé (FCFA)', 'Dernière commande'],
      users.map((u) => {
        const s = byUser.get(u.id)
        return [
          u.firstName, u.lastName, u.email, u.phone ?? '', u.role, (u as any).companyName ?? '', (u as any).resellerStatus ?? '',
          u.isActive ? 'oui' : 'non', dateFr(u.createdAt), Number(s?.paid) || 0, Number(s?.revenue) || 0, dateFr(s?.last),
        ]
      }),
    )
    return { csv, filename: `clients_${new Date().toISOString().slice(0, 10)}.csv`, count: users.length }
  }
}
