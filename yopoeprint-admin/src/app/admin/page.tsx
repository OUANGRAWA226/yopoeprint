'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  TrendingUp, ShoppingCart, Users, Wallet,
  ArrowUpRight, ArrowDownRight, ChevronRight, ShieldCheck,
  Printer, CreditCard, FileText, BarChart3, RefreshCw,
  AlertTriangle, PackageCheck, Truck, CircleDollarSign,
} from 'lucide-react'
import type { ApexOptions } from 'apexcharts'
import { adminOrdersService, AdminStats } from '@/lib/orders.service'

// Import dynamique d'ApexCharts pour éviter les erreurs SSR (window is not defined)
const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div className="w-full h-72 rounded-2xl bg-slate-50 animate-pulse" />,
})

type Period = 7 | 30 | 90

const fcfa = (n: number) => `${new Intl.NumberFormat('fr-FR').format(Math.round(n || 0))} FCFA`
const num = (n: number) => new Intl.NumberFormat('fr-FR').format(n || 0)

const PAYMENT_LABELS: Record<string, { label: string; color: string }> = {
  orange_money: { label: 'Orange Money', color: '#ea580c' },
  moov_money:   { label: 'Moov Money',   color: '#0284c7' },
  visa:         { label: 'Visa',         color: '#8b5cf6' },
  mastercard:   { label: 'Mastercard',   color: '#a855f7' },
  virement:     { label: 'Virement',     color: '#64748b' },
}

const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  pending:       { label: 'Paiement en attente', cls: 'bg-yellow-50 text-yellow-800 border-yellow-200/80', dot: 'bg-yellow-500' },
  confirmed:     { label: 'Payée',          cls: 'bg-blue-50 text-blue-700 border-blue-200/80',       dot: 'bg-blue-600' },
  bat_pending:   { label: 'BAT à valider',  cls: 'bg-amber-50 text-amber-800 border-amber-200/80',    dot: 'bg-amber-500' },
  in_production: { label: 'En production',  cls: 'bg-purple-50 text-purple-700 border-purple-200/80', dot: 'bg-purple-600' },
  ready:         { label: 'Prête',          cls: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  shipped:       { label: 'Expédiée',       cls: 'bg-indigo-50 text-indigo-700 border-indigo-200/80', dot: 'bg-indigo-600' },
  delivered:     { label: 'Livrée',         cls: 'bg-slate-100 text-slate-700 border-slate-200/80',   dot: 'bg-slate-500' },
  cancelled:     { label: 'Annulée',        cls: 'bg-red-50 text-red-700 border-red-200/80',          dot: 'bg-red-500' },
  refunded:      { label: 'Remboursée',     cls: 'bg-slate-100 text-slate-600 border-slate-200/80',   dot: 'bg-slate-400' },
}

// Étapes de l'atelier, dans l'ordre du flux
const PIPELINE = [
  { id: 'confirmed',     label: 'Payées, BAT à préparer', icon: CircleDollarSign, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { id: 'bat_pending',   label: 'BAT chez le client',     icon: ShieldCheck,      color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { id: 'in_production', label: 'En production',          icon: Printer,          color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { id: 'ready',         label: 'Prêtes à livrer',        icon: PackageCheck,     color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: 'shipped',       label: 'En livraison',           icon: Truck,            color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
]

// Évolution vs période précédente ; null si rien à comparer
function delta(current: number, previous: number): number | null {
  if (!previous) return null
  return ((current - previous) / previous) * 100
}

function DeltaBadge({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-[11px] font-semibold text-slate-400">—</span>
  }
  const up = value >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
      up ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70' : 'bg-red-50 text-red-700 border-red-200/70'
    }`}>
      {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {`${up ? '+' : ''}${value.toFixed(1).replace('.', ',')} %`}
    </span>
  )
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>(30)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (p: Period) => {
    setLoading(true)
    setError('')
    try {
      setStats(await adminOrdersService.getStats(p))
    } catch (e: any) {
      setError(e?.message || 'Impossible de charger les indicateurs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(period) }, [period, load])

  const periodLabel = period === 7 ? '7 derniers jours' : period === 30 ? '30 derniers jours' : '3 derniers mois'

  const kpis = useMemo(() => {
    if (!stats) return []
    const { current, previous } = stats
    return [
      { id: 'ca', label: 'CA encaissé', value: fcfa(current.revenue), icon: TrendingUp,
        delta: delta(current.revenue, previous.revenue), sub: `${num(current.paidOrders)} commande(s) payée(s)` },
      { id: 'orders', label: 'Commandes passées', value: num(current.orders), icon: ShoppingCart,
        delta: delta(current.orders, previous.orders), sub: `${num(previous.orders)} sur la période précédente` },
      { id: 'basket', label: 'Panier moyen', value: fcfa(current.averageOrder), icon: Wallet,
        delta: delta(current.averageOrder, previous.paidOrders ? previous.revenue / previous.paidOrders : 0), sub: 'Sur les commandes payées' },
      { id: 'clients', label: 'Nouveaux clients', value: num(current.newClients), icon: Users,
        delta: delta(current.newClients, previous.newClients), sub: 'Comptes créés sur la période' },
    ]
  }, [stats])

  const todo = stats ? [
    { label: 'Commandes payées à préparer', count: stats.todo.toConfirm, href: '/admin/commandes?status=confirmed', icon: CircleDollarSign, tone: 'text-blue-700 bg-blue-50' },
    { label: 'BAT à corriger (refusés)',     count: stats.todo.batRejected, href: '/admin/commandes?bat=rejected', icon: AlertTriangle, tone: 'text-red-700 bg-red-50' },
    { label: 'BAT en attente du client',     count: stats.todo.batPending, href: '/admin/commandes?status=bat_pending&bat=pending', icon: ShieldCheck, tone: 'text-amber-700 bg-amber-50' },
    { label: 'Nouvelles demandes de devis',  count: stats.todo.quotesNew, href: '/admin/devis', icon: FileText, tone: 'text-purple-700 bg-purple-50' },
  ] : []

  const chart = useMemo(() => {
    if (!stats) return null
    const fmtDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', timeZone: 'UTC',
    })
    return {
      series: [{ name: 'CA encaissé', data: stats.revenueSeries.map((p) => p.revenue) }],
      options: {
        chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit', animations: { enabled: false }, zoom: { enabled: false } },
        stroke: { width: 2.5, curve: 'smooth' },
        colors: ['#0E2347'],
        fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0.02, stops: [0, 100] } },
        dataLabels: { enabled: false },
        labels: stats.revenueSeries.map((p) => (stats.bucket === 'week' ? `Sem. du ${fmtDate(p.date)}` : fmtDate(p.date))),
        grid: { borderColor: '#f1f5f9', strokeDashArray: 3 },
        xaxis: {
          axisBorder: { show: false }, axisTicks: { show: false },
          tickAmount: Math.min(stats.revenueSeries.length, 8),
          labels: { rotate: 0, hideOverlappingLabels: true, style: { colors: '#64748b', fontSize: '11px' } },
        },
        yaxis: {
          min: 0,
          labels: {
            style: { colors: '#64748b', fontSize: '11px' },
            formatter: (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${Math.round(v)}`),
          },
        },
        tooltip: { y: { formatter: (v: number) => fcfa(v) } },
      } as ApexOptions,
    }
  }, [stats])

  const payments = stats?.paymentBreakdown || []
  const paymentsTotal = payments.reduce((s, p) => s + p.amount, 0)
  const pipelineTotal = stats ? PIPELINE.reduce((s, p) => s + (stats.statusCounts[p.id] || 0), 0) : 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-blue-deep tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-1">Ventes et atelier sur les {periodLabel}.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/50" role="group" aria-label="Période">
            {([7, 30, 90] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)} aria-pressed={period === p}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  period === p ? 'bg-white text-blue-deep shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}>
                {p === 90 ? '3 mois' : `${p} jours`}
              </button>
            ))}
          </div>
          <button onClick={() => load(period)} disabled={loading} aria-label="Actualiser"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-blue-deep disabled:opacity-50">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => load(period)} className="font-bold underline shrink-0">Réessayer</button>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {!stats
          ? Array.from({ length: 4 }, (_, i) => <div key={i} className="h-36 rounded-2xl bg-white border border-slate-200/70 animate-pulse" />)
          : kpis.map((k) => {
            const Icon = k.icon
            return (
              <div key={k.id} className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-deep/5 text-blue-deep">
                    <Icon size={19} />
                  </div>
                  <DeltaBadge value={k.delta} />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{k.label}</p>
                <p className="text-2xl font-extrabold text-blue-deep tracking-tight tabular-nums mt-1">{k.value}</p>
                <p className="text-xs text-slate-500 mt-2">{k.sub}</p>
              </div>
            )
          })}
      </div>

      {/* ── À traiter ── */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {todo.map((t) => {
            const Icon = t.icon
            return (
              <Link key={t.label} href={t.href}
                className={`flex items-center gap-3 p-4 rounded-2xl border bg-white transition-colors hover:border-blue-mid/40 ${
                  t.count ? 'border-slate-200/80' : 'border-slate-100 opacity-70'
                }`}>
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.tone}`}><Icon size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-extrabold text-blue-deep tabular-nums">{t.count}</span>
                  <span className="block text-xs text-slate-500 leading-snug">{t.label}</span>
                </span>
                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </Link>
            )
          })}
        </div>
      )}

      {/* ── CA + paiements ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-deep/5 text-blue-deep flex items-center justify-center"><BarChart3 size={18} /></div>
            <div>
              <h2 className="font-bold text-blue-deep text-base">Chiffre d&apos;affaires encaissé</h2>
              <p className="text-xs text-slate-500">Commandes payées, par {stats?.bucket === 'week' ? 'semaine' : 'jour'} de commande</p>
            </div>
          </div>
          {!stats || !chart ? (
            <div className="h-72 rounded-xl bg-slate-50 animate-pulse" />
          ) : stats.current.revenue === 0 ? (
            <div className="h-72 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center px-6">
              <BarChart3 size={28} className="text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">Aucun encaissement sur les {periodLabel}</p>
              <p className="text-xs text-slate-400 mt-1">La courbe apparaîtra dès le premier paiement confirmé.</p>
            </div>
          ) : (
            <Chart options={chart.options} series={chart.series} type="area" height={290} />
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center"><CreditCard size={18} /></div>
            <div>
              <h2 className="font-bold text-blue-deep text-base">Moyens de paiement</h2>
              <p className="text-xs text-slate-500">Montants encaissés sur la période</p>
            </div>
          </div>
          {!stats ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-9 rounded-lg bg-slate-50 animate-pulse" />)}</div>
          ) : payments.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">Aucun paiement sur la période.</p>
          ) : (
            <ul className="space-y-4">
              {payments.map((p) => {
                const meta = PAYMENT_LABELS[p.method] || { label: p.method, color: '#94a3b8' }
                const share = paymentsTotal ? (p.amount / paymentsTotal) * 100 : 0
                return (
                  <li key={p.method}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="flex items-center gap-2 font-medium text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                        {meta.label}
                      </span>
                      <span className="font-bold text-blue-deep tabular-nums">{fcfa(p.amount)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: meta.color }} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{Math.round(share)} % · {num(p.orders)} commande(s)</p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Atelier ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center"><Printer size={18} /></div>
            <div>
              <h2 className="font-bold text-blue-deep text-base">Commandes en cours à l&apos;atelier</h2>
              <p className="text-xs text-slate-500">Toutes périodes confondues</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">{num(pipelineTotal)} en cours</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {PIPELINE.map((p) => {
            const Icon = p.icon
            const count = stats?.statusCounts[p.id] || 0
            return (
              <Link key={p.id} href={`/admin/commandes?status=${p.id}`}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-blue-mid/40 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border mb-2.5 ${p.color}`}><Icon size={16} /></div>
                <p className="text-2xl font-extrabold text-blue-deep tabular-nums">{stats ? count : '…'}</p>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">{p.label}</p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Dernières commandes ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-blue-deep text-base">Dernières commandes</h2>
          <Link href="/admin/commandes" className="text-xs font-bold text-blue-mid hover:underline inline-flex items-center gap-1">
            Toutes les commandes <ChevronRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">N° commande</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Articles</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!stats ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Chargement…</td></tr>
              ) : stats.recentOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">Aucune commande pour le moment.</td></tr>
              ) : stats.recentOrders.map((o) => {
                const s = STATUS_MAP[o.status] || { label: o.status, cls: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' }
                return (
                  <tr key={o.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-blue-mid whitespace-nowrap">{o.orderNumber}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{o.user?.fullName || o.deliveryAddress?.fullName || '—'}</p>
                      <p className="text-[11px] text-slate-500">{o.deliveryAddress?.city}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 max-w-[260px] truncate">
                      {o.items?.map((i) => `${num(i.quantity)} × ${i.productName}`).join(', ')}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-blue-deep tabular-nums whitespace-nowrap">{fcfa(o.total)}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${s.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
