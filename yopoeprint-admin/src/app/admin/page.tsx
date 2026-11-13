'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  TrendingUp, ShoppingCart, Users, Wallet, ArrowUpRight, ArrowDownRight, ShieldCheck,
  Printer, CreditCard, FileText, BarChart3, RefreshCw, AlertTriangle, PackageCheck, Truck, CircleDollarSign,
} from 'lucide-react'
import type { ApexOptions } from 'apexcharts'
import { adminOrdersService, AdminStats } from '@/lib/orders.service'
import { AlertsPanel } from '@/components/admin/AlertsPanel'
import { Card, SmallBox, InfoBox, ErrorAlert, LoadingRow, TableMessage } from '@/components/ui'
import { OrderStatusBadge, PAYMENT_METHOD, fcfa, num, dateTimeFr } from '@/components/status'

// Import dynamique d'ApexCharts pour éviter les erreurs SSR (window is not defined)
const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div className="placeholder-box" style={{ height: 290 }} />,
})

type Period = 7 | 30 | 90

// Étapes de l'atelier, dans l'ordre du flux
const PIPELINE = [
  { id: 'confirmed',     label: 'Payées, BAT à préparer', icon: CircleDollarSign, color: 'primary' },
  { id: 'bat_pending',   label: 'BAT chez le client',     icon: ShieldCheck,      color: 'warning' },
  { id: 'in_production', label: 'En production',          icon: Printer,          color: 'info' },
  { id: 'ready',         label: 'Prêtes à livrer',        icon: PackageCheck,     color: 'success' },
  { id: 'shipped',       label: 'En livraison',           icon: Truck,            color: 'secondary' },
] as const

// Évolution vs période précédente ; null si rien à comparer
function delta(current: number, previous: number): number | null {
  if (!previous) return null
  return ((current - previous) / previous) * 100
}

function Delta({ value }: { value: number | null }) {
  if (value === null) return <small className="opacity-75">— vs période précédente</small>
  const up = value >= 0
  return (
    <small className="d-inline-flex align-items-center gap-1 fw-semibold">
      {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {`${up ? '+' : ''}${value.toFixed(1).replace('.', ',')} %`}
      <span className="fw-normal opacity-75">vs période précédente</span>
    </small>
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
      { id: 'ca', label: `CA encaissé · ${num(current.paidOrders)} commande(s) payée(s)`, value: fcfa(current.revenue), icon: <TrendingUp />,
        delta: delta(current.revenue, previous.revenue), color: 'navy' as const, href: '/admin/paiements' },
      { id: 'orders', label: 'Commandes passées', value: num(current.orders), icon: <ShoppingCart />,
        delta: delta(current.orders, previous.orders), color: 'gold' as const, href: '/admin/commandes' },
      { id: 'basket', label: 'Panier moyen (commandes payées)', value: fcfa(current.averageOrder), icon: <Wallet />,
        delta: delta(current.averageOrder, previous.paidOrders ? previous.revenue / previous.paidOrders : 0), color: 'primary' as const, href: undefined },
      { id: 'clients', label: 'Nouveaux clients', value: num(current.newClients), icon: <Users />,
        delta: delta(current.newClients, previous.newClients), color: 'success' as const, href: '/admin/clients' },
    ]
  }, [stats])

  const todo = stats ? [
    { label: 'Commandes payées à préparer', count: stats.todo.toConfirm,   href: '/admin/commandes?status=confirmed', icon: <CircleDollarSign />, color: 'primary' as const },
    { label: 'BAT à corriger (refusés)',     count: stats.todo.batRejected, href: '/admin/commandes?bat=rejected', icon: <AlertTriangle />, color: 'danger' as const },
    { label: 'BAT en attente du client',     count: stats.todo.batPending,  href: '/admin/commandes?status=bat_pending&bat=pending', icon: <ShieldCheck />, color: 'warning' as const },
    { label: 'Nouvelles demandes de devis',  count: stats.todo.quotesNew,   href: '/admin/devis', icon: <FileText />, color: 'info' as const },
  ] : []

  const chart = useMemo(() => {
    if (!stats) return null
    const fmtDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    return {
      series: [{ name: 'CA encaissé', data: stats.revenueSeries.map((p) => p.revenue) }],
      options: {
        chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit', animations: { enabled: false }, zoom: { enabled: false } },
        stroke: { width: 2.5, curve: 'smooth' },
        colors: ['#1a3a6b'],
        fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] } },
        dataLabels: { enabled: false },
        labels: stats.revenueSeries.map((p) => (stats.bucket === 'week' ? `Sem. du ${fmtDate(p.date)}` : fmtDate(p.date))),
        grid: { borderColor: '#e9ecef', strokeDashArray: 3 },
        xaxis: {
          axisBorder: { show: false }, axisTicks: { show: false },
          tickAmount: Math.min(stats.revenueSeries.length, 8),
          labels: { rotate: 0, hideOverlappingLabels: true, style: { colors: '#6c757d', fontSize: '11px' } },
        },
        yaxis: {
          min: 0,
          labels: {
            style: { colors: '#6c757d', fontSize: '11px' },
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
    <>
      {/* ── Période ── */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <p className="text-secondary mb-0">Ventes et atelier sur les {periodLabel}.</p>
        <div className="d-flex align-items-center gap-2">
          <div className="btn-group btn-group-sm" role="group" aria-label="Période">
            {([7, 30, 90] as const).map((p) => (
              <button key={p} type="button" onClick={() => setPeriod(p)} aria-pressed={period === p}
                className={`btn ${period === p ? 'btn-primary' : 'btn-outline-primary'}`}>
                {p === 90 ? '3 mois' : `${p} jours`}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => load(period)} disabled={loading} aria-label="Actualiser" className="btn btn-sm btn-outline-secondary">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={() => load(period)} />

      {/* ── KPIs ── */}
      <div className="row">
        {!stats
          ? Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="col-lg-3 col-sm-6"><div className="placeholder-box mb-4" style={{ height: 132 }} /></div>
            ))
          : kpis.map((k) => (
              <div key={k.id} className="col-lg-3 col-sm-6">
                <SmallBox value={k.value} label={k.label} icon={k.icon} color={k.color} href={k.href} extra={<Delta value={k.delta} />} />
              </div>
            ))}
      </div>

      {/* ── À traiter ── */}
      {stats && (
        <div className="row">
          {todo.map((t) => (
            <div key={t.label} className="col-lg-3 col-sm-6">
              <InfoBox icon={t.icon} label={t.label} value={t.count} color={t.color} href={t.href} muted={!t.count} />
            </div>
          ))}
        </div>
      )}

      {/* ── Alertes (retards, anomalies de paiement, emails en échec) ── */}
      <AlertsPanel />

      {/* ── CA + paiements ── */}
      <div className="row">
        <div className="col-xl-8">
          <Card title="Chiffre d'affaires encaissé" icon={<BarChart3 size={18} />}
            tools={<span className="badge text-bg-light">Par {stats?.bucket === 'week' ? 'semaine' : 'jour'} de commande</span>}>
            {!stats || !chart ? (
              <div className="placeholder-box" style={{ height: 290 }} />
            ) : stats.current.revenue === 0 ? (
              <div className="text-center text-secondary py-5">
                <BarChart3 size={30} className="mb-2 opacity-50" />
                <p className="fw-semibold mb-1">Aucun encaissement sur les {periodLabel}</p>
                <p className="small mb-0">La courbe apparaîtra dès le premier paiement confirmé.</p>
              </div>
            ) : (
              <Chart options={chart.options} series={chart.series} type="area" height={290} />
            )}
          </Card>
        </div>

        <div className="col-xl-4">
          <Card title="Moyens de paiement" icon={<CreditCard size={18} />} variant="gold">
            {!stats ? (
              <div className="placeholder-box" style={{ height: 160 }} />
            ) : payments.length === 0 ? (
              <p className="text-secondary text-center py-5 mb-0">Aucun paiement sur la période.</p>
            ) : (
              payments.map((p) => {
                const meta = PAYMENT_METHOD[p.method] || { label: p.method, color: '#adb5bd' }
                const share = paymentsTotal ? (p.amount / paymentsTotal) * 100 : 0
                return (
                  <div key={p.method} className="progress-group mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold">{meta.label}</span>
                      <span className="tabular-nums"><b>{fcfa(p.amount)}</b></span>
                    </div>
                    <div className="progress" style={{ height: 6 }} role="progressbar" aria-label={meta.label} aria-valuenow={Math.round(share)} aria-valuemin={0} aria-valuemax={100}>
                      <div className="progress-bar" style={{ width: `${share}%`, backgroundColor: meta.color }} />
                    </div>
                    <small className="text-secondary">{Math.round(share)} % · {num(p.orders)} commande(s)</small>
                  </div>
                )
              })
            )}
          </Card>
        </div>
      </div>

      {/* ── Atelier ── */}
      <Card title="Commandes en cours à l'atelier" icon={<Printer size={18} />}
        tools={<span className="badge text-bg-secondary">{num(pipelineTotal)} en cours · toutes périodes</span>}>
        <div className="row g-3">
          {PIPELINE.map((p) => {
            const Icon = p.icon
            return (
              <div key={p.id} className="col-6 col-md">
                <InfoBox icon={<Icon />} label={p.label} value={stats ? stats.statusCounts[p.id] || 0 : '…'} color={p.color}
                  href={`/admin/commandes?status=${p.id}`} />
              </div>
            )
          })}
        </div>
      </Card>

      {/* ── Dernières commandes ── */}
      <Card title="Dernières commandes" icon={<ShoppingCart size={18} />} noPadding
        tools={<Link href="/admin/commandes" className="btn btn-sm btn-outline-primary">Toutes les commandes</Link>}>
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead>
              <tr><th>N° commande</th><th>Client</th><th>Articles</th><th>Total</th><th>Statut</th><th>Date</th></tr>
            </thead>
            <tbody>
              {!stats ? <LoadingRow colSpan={6} /> : stats.recentOrders.length === 0 ? (
                <TableMessage colSpan={6}>Aucune commande pour le moment.</TableMessage>
              ) : stats.recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="font-mono small fw-semibold text-nowrap">
                    <Link href={`/admin/commandes?q=${encodeURIComponent(o.orderNumber)}`}>{o.orderNumber}</Link>
                  </td>
                  <td className="text-nowrap">
                    <div className="fw-semibold">{o.user?.fullName || o.deliveryAddress?.fullName || '—'}</div>
                    <small className="text-secondary">{o.deliveryAddress?.city}</small>
                  </td>
                  <td className="small text-secondary text-truncate" style={{ maxWidth: 260 }}>
                    {o.items?.map((i) => `${num(i.quantity)} × ${i.productName}`).join(', ')}
                  </td>
                  <td className="fw-semibold tabular-nums text-nowrap">{fcfa(o.total)}</td>
                  <td><OrderStatusBadge status={o.status} /></td>
                  <td className="small text-secondary text-nowrap">{dateTimeFr(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
