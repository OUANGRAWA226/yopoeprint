'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  TrendingUp, 
  TrendingDown,
  ShoppingBag, 
  AlertCircle,
  ArrowRight,
  Clock,
  MoreHorizontal,
  Download,
  Calendar as CalendarIcon
} from 'lucide-react'

import { ordersService } from '@/lib/orders.service'
import { SkeletonDashboard } from '@/components/ui/Skeleton'

// ─── UTILS ──────────────────────────────────────────────────────────
function fmt(n: number) { return new Intl.NumberFormat('fr-FR').format(n) }

// ─── MOCK DATA (Chart & Trends) ────────────────────────────────────
const CHART_DATA = [
  { day: 'Lun', value: 120000 },
  { day: 'Mar', value: 250000 },
  { day: 'Mer', value: 180000 },
  { day: 'Jeu', value: 380000 },
  { day: 'Ven', value: 420000 },
  { day: 'Sam', value: 150000 },
  { day: 'Dim', value: 90000 },
]

const KPIS = [
  {
    title: 'Chiffre d\'Affaires',
    value: '1 590 000 F',
    trend: '+12.5%',
    isPositive: true,
    data: [20, 35, 25, 60, 80, 40, 50] // Points pour sparkline
  },
  {
    title: 'Commandes',
    value: '142',
    trend: '+5.2%',
    isPositive: true,
    data: [10, 15, 12, 25, 30, 15, 8]
  },
  {
    title: 'Panier Moyen (AOV)',
    value: '11 197 F',
    trend: '-2.1%',
    isPositive: false,
    data: [45, 40, 42, 38, 35, 40, 42]
  },
  {
    title: 'Taux de Conversion',
    value: '3.8%',
    trend: '+0.4%',
    isPositive: true,
    data: [2, 3, 2.5, 4, 4.5, 3, 3.5]
  }
]

// ─── COMPONENTS ─────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  // Transform data to SVG coordinates (0-100 width, 0-40 height)
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 40 - ((val - min) / range) * 35 // Keep 5px padding from top
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox="0 0 100 40" className="w-20 h-10 overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

function TrendBadge({ trend, isPositive }: { trend: string, isPositive: boolean }) {
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
      isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {trend}
    </span>
  )
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await ordersService.getAllOrders({ limit: 10 })
        setOrders(data)
      } catch (err) {
        console.error('Erreur chargement admin', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const advanceStatus = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    // Placeholder function for UI demonstration
    // Real implementation should call ordersService.updateStatus
    setOrders(orders.map(o => {
      const oid = o.id || o._id
      if (oid === id) {
        if (o.status === 'fichiers attendus') return { ...o, status: 'payé' }
        if (o.status === 'payé') return { ...o, status: 'en impression' }
        if (o.status === 'en impression') return { ...o, status: 'expédié' }
        if (o.status === 'expédié') return { ...o, status: 'livré' }
      }
      return o
    }))
  }

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <SkeletonDashboard kpis={4} />
      </div>
    )
  }

  const maxChartValue = Math.max(...CHART_DATA.map(d => d.value))

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Vue d'ensemble</h1>
          <p className="text-gray-500 text-sm">Performances et actions requises pour YopoePrint.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
            <CalendarIcon size={16} className="text-gray-400" />
            Les 7 derniers jours
          </div>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* ── KPIS (Style Stripe) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
              <TrendBadge trend={kpi.trend} isPositive={kpi.isPositive} />
            </div>
            <div className="flex items-end justify-between relative z-10">
              <p className="font-display text-3xl font-bold text-gray-900 tracking-tight">{kpi.value}</p>
              <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                <Sparkline data={kpi.data} color={kpi.isPositive ? '#10B981' : '#EF4444'} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── MAIN CHART (Revenus) ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-bold text-gray-900">Revenus de la semaine</h2>
              <p className="text-sm text-gray-500">Comparé à la semaine dernière</p>
            </div>
            <button className="text-gray-400 hover:text-gray-900 transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Bar Chart CSS */}
          <div className="h-64 flex items-end justify-between gap-2 mt-4">
            {CHART_DATA.map((data, i) => {
              const heightPct = (data.value / maxChartValue) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative">
                  
                  {/* Tooltip */}
                  <div className="absolute -top-12 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {fmt(data.value)} F
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                  </div>

                  {/* Bar */}
                  <div className="w-full relative rounded-t-lg bg-gray-100 group-hover:bg-gray-200 transition-colors flex items-end h-full">
                    <div 
                      className="w-full rounded-t-lg bg-primary/90 group-hover:bg-primary transition-all duration-700 ease-out animate-in slide-in-from-bottom"
                      style={{ height: `${heightPct}%`, animationDelay: `${i * 50}ms` }}
                    />
                  </div>
                  
                  {/* Label */}
                  <span className="text-xs font-bold text-gray-400 group-hover:text-gray-900 transition-colors">
                    {data.day}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── ACTIONABLE INSIGHTS (Alertes) ── */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                Actions Requises
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              
              <div className="p-5 hover:bg-gray-50 transition-colors cursor-pointer group flex gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-orange-600">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">4 Fichiers manquants</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Des commandes sont payées mais en attente des fichiers du client pour lancer la production.
                  </p>
                  <span className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1">Voir les commandes <ArrowRight size={12} /></span>
                </div>
              </div>

              <div className="p-5 hover:bg-gray-50 transition-colors cursor-pointer group flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">2 Devis en attente</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    De nouvelles demandes de devis sur-mesure nécessitent une réponse.
                  </p>
                  <span className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1">Traiter les devis <ArrowRight size={12} /></span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ── COMMANDES RÉCENTES (Style Table Clean) ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Activité Récente</h2>
          <Link href="/admin/commandes" className="text-sm font-bold text-primary hover:underline">
            Voir toutes les commandes
          </Link>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Client</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Montant</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Statut</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Aucune commande récente
                  </td>
                </tr>
              ) : orders.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{c.client?.name || c.user?.firstName || c.name || 'Client Inconnu'}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{c.id || c._id}</p>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-gray-900">
                    {fmt(c.amount)} F
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      c.status === 'payé' ? 'bg-indigo-100 text-indigo-700' :
                      c.status === 'en impression' ? 'bg-blue-100 text-blue-700' :
                      c.status === 'fichiers attendus' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex flex-col items-end gap-1">
                    <span className="text-gray-500 text-xs font-medium">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : c.date}
                    </span>
                    <button 
                      onClick={(e) => advanceStatus(e, c.id || c._id)}
                      disabled={c.status === 'livré' || c.status === 'delivered'}
                      className="text-xs font-bold text-primary hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Avancer <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
