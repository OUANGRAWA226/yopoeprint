'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  PiggyBank, 
  PackageCheck, 
  Clock, 
  ArrowRight,
  TrendingUp,
  PackageSearch
} from 'lucide-react'
import { useEffect } from 'react'
import { resellerService, ResellerStats } from '@/lib/reseller.service'
import { Order } from '@/lib/orders.service'
import { SkeletonDashboard } from '@/components/ui/Skeleton'

function fmt(n: number) { return new Intl.NumberFormat('fr-FR').format(n) }
export default function RevendeurDashboardPage() {
  const [stats, setStats] = useState<ResellerStats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          resellerService.getDashboardStats(),
          resellerService.getActiveOrders()
        ])
        setStats(statsData)
        setOrders(ordersData)
      } catch (err) {
        console.error('Failed to load reseller data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading || !stats) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <SkeletonDashboard kpis={3} />
      </div>
    )
  }

  const KPIS = [
    {
      title: 'Économies Réalisées (Ce mois)',
      value: `${fmt(stats.savingsThisMonth)} F`,
      subtitle: `Grâce à votre remise ${stats.currentTier} (-${stats.discountRate}%)`,
      icon: PiggyBank,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: 'Commandes en cours',
      value: `${stats.activeOrdersCount}`,
      subtitle: 'En production ou expédition',
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    {
      title: 'Total Commandes (Année)',
      value: `${stats.totalOrdersYear}`,
      subtitle: `Soit ${fmt(stats.totalRevenueYear)} F de CA`,
      icon: PackageCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    }
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* ── HEADER ── */}
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Bonjour, Studio XYZ 👋</h1>
        <p className="text-gray-500 text-sm">Voici un résumé de votre activité de revente sur YopoePrint.</p>
      </div>

      {/* ── KPIS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {KPIS.map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">{kpi.title}</p>
              <p className="font-display text-3xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-400 mt-2 font-medium">{kpi.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── PROGRESSION PALIER ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <TrendingUp size={120} />
          </div>
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Votre Progression B2B</h2>
            <p className="text-sm text-gray-500 mb-6">Vous êtes actuellement au palier <strong className="text-yellow-600">{stats.currentTier}</strong>. Plus vous commandez, plus vos tarifs baissent.</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-900">Palier actuel : {stats.currentTier} (-{stats.discountRate}%)</span>
                <span className="text-gray-400">Objectif : {stats.nextTier} (-{stats.nextTierDiscount}%)</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full" 
                  style={{ width: `${stats.progressToNextTier}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-right">Plus que {fmt(stats.amountNeededForNextTier)} F de commandes pour débloquer le niveau {stats.nextTier}.</p>
            </div>
          </div>
        </div>

        {/* ── CALL TO ACTION MARQUE BLANCHE ── */}
        <div className="bg-indigo-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-900/20">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <PackageSearch size={100} />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-indigo-800 rounded-xl flex items-center justify-center mb-4">
              <PackageSearch size={20} className="text-indigo-200" />
            </div>
            <h3 className="font-bold text-lg mb-2">Livraison en Marque Blanche</h3>
            <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
              Expédiez vos impressions directement chez vos clients sans aucune mention de YopoePrint. Nous utiliserons votre logo sur le bordereau.
            </p>
            <Link 
              href="/revendeur/marque-blanche" 
              className="inline-flex items-center justify-center w-full bg-white text-indigo-950 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors"
            >
              Configurer maintenant
            </Link>
          </div>
        </div>

      </div>

      {/* ── COMMANDES EN COURS ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Commandes en cours d'expédition</h2>
          <Link href="/revendeur/commandes" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
            Voir tout l'historique <ArrowRight size={14} />
          </Link>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Aucune commande en cours
                  </td>
                </tr>
              ) : orders.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{c.name || c.id}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">Réf: {c.id}</p>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-gray-900">
                    {c.amount ? fmt(c.amount) : 'N/A'} F
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                      c.status === 'Expédié' || c.status === 'expédié' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {c.status || 'En production'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 text-xs font-medium">
                    {c.date || (c as any).createdAt ? new Date((c as any).createdAt).toLocaleDateString() : 'N/A'}
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
