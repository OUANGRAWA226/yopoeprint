'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PiggyBank, PackageCheck, Clock, ArrowRight, TrendingUp, PackageSearch, ShoppingBag } from 'lucide-react'
import { api } from '@/lib/api'
import { resellerService, ResellerStats } from '@/lib/reseller.service'
import { SkeletonDashboard } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n || 0)

const STATUS_LABELS: Record<string, string> = {
  pending: 'Paiement en attente', confirmed: 'Payée', bat_pending: 'BAT à valider',
  in_production: 'En production', ready: 'Prête', shipped: 'Expédiée',
  delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
}

interface RecentOrder {
  id: string
  orderNumber: string
  total: number
  discount: number
  status: string
  whiteLabel?: boolean
  createdAt: string
  items: { productName: string; quantity: number }[]
}

export default function RevendeurDashboardPage() {
  const [stats, setStats] = useState<ResellerStats | null>(null)
  const [orders, setOrders] = useState<RecentOrder[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([resellerService.getStats(), api.get('/orders/my-orders?limit=8')])
      .then(([s, o]) => {
        setStats(s)
        setOrders(Array.isArray(o) ? o : o?.data || [])
      })
      .catch((e) => setError(e?.message || 'Impossible de charger votre espace revendeur'))
  }, [])

  if (error) return <div className="max-w-5xl mx-auto"><Alert>{error}</Alert></div>
  if (!stats) {
    return <div className="max-w-5xl mx-auto"><SkeletonDashboard kpis={3} /></div>
  }

  const kpis = [
    { title: 'Économies ce mois-ci', value: `${fmt(stats.savingsThisMonth)} FCFA`, sub: `${fmt(stats.savings12m)} FCFA sur 12 mois`, icon: PiggyBank },
    { title: 'Commandes en cours', value: fmt(stats.activeOrdersCount), sub: 'Payées, au BAT, en production ou en livraison', icon: Clock },
    { title: 'Commandes payées (12 mois)', value: fmt(stats.paidOrders12m), sub: `${fmt(stats.revenue12m)} FCFA réglés`, icon: PackageCheck },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">{stats.companyName || 'Mon espace revendeur'}</h1>
          <p className="text-gray-600 text-sm">
            Palier <strong>{stats.tier.label}</strong> : −{stats.tier.rate} % appliqués automatiquement à chaque commande.
          </p>
        </div>
        <Link href="/catalogue" className="btn-primary self-start sm:self-auto">
          <ShoppingBag size={16} /> Nouvelle commande
        </Link>
      </div>

      {/* ── Indicateurs ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <div key={k.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-700 mb-4">
              <k.icon size={22} />
            </div>
            <p className="text-sm font-bold text-gray-600 mb-1">{k.title}</p>
            <p className="font-display text-3xl font-bold text-gray-900 tabular-nums">{k.value}</p>
            <p className="text-xs text-gray-500 mt-2">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Progression de palier ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-emerald-700" />
            <h2 className="text-lg font-bold text-gray-900">Votre palier</h2>
          </div>
          {stats.nextTier ? (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Le palier est calculé sur vos commandes payées des 12 derniers mois.
              </p>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-gray-900">{stats.tier.label} (−{stats.tier.rate} %)</span>
                <span className="text-gray-600">{stats.nextTier.label} (−{stats.nextTier.rate} %)</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden" role="progressbar"
                aria-valuemin={0} aria-valuemax={100} aria-valuenow={stats.progressToNextTier}
                aria-label={`Progression vers le palier ${stats.nextTier.label}`}>
                <div className="h-full bg-primary rounded-full" style={{ width: `${stats.progressToNextTier}%` }} />
              </div>
              <p className="text-xs text-gray-600 text-right mt-2">
                Encore {fmt(stats.amountNeededForNextTier)} FCFA de commandes payées pour passer {stats.nextTier.label}.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-600">
              Vous êtes au palier le plus élevé : −{stats.tier.rate} % sur toutes vos commandes.
            </p>
          )}
        </div>

        {/* ── Marque blanche ── */}
        <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 text-white">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
            <PackageSearch size={20} className="text-emerald-400" />
          </div>
          <h3 className="font-bold text-lg mb-2">Livraison en marque blanche</h3>
          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            {stats.whiteLabelConfigured
              ? 'Votre identité d\'expéditeur est prête : cochez l\'option au moment de commander.'
              : 'Expédiez chez vos clients sans mention de YopoePrint : renseignez d\'abord votre identité d\'expéditeur.'}
          </p>
          <Link href="/revendeur/marque-blanche"
            className="inline-flex items-center justify-center w-full bg-white text-gray-900 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
            {stats.whiteLabelConfigured ? 'Modifier mon identité' : 'Configurer maintenant'}
          </Link>
        </div>
      </div>

      {/* ── Dernières commandes ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Dernières commandes</h2>
          <Link href="/mon-compte/commandes" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
            Tout l&apos;historique <ArrowRight size={14} />
          </Link>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr><td className="px-6 py-8 text-center text-gray-600">
                  Aucune commande pour le moment. <Link href="/catalogue" className="font-bold text-primary hover:underline">Parcourir le catalogue</Link>
                </td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900 font-mono text-xs">{o.orderNumber}</p>
                    <p className="text-xs text-gray-600 mt-0.5 truncate max-w-[260px]">
                      {o.items?.map((i) => `${fmt(i.quantity)} × ${i.productName}`).join(', ')}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-bold text-gray-900 tabular-nums">{fmt(o.total)} FCFA</p>
                    {o.discount > 0 && <p className="text-xs text-emerald-700">−{fmt(o.discount)} FCFA de remise</p>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-700">
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                    {o.whiteLabel && <span className="ml-2 text-xs font-semibold text-gray-600">Marque blanche</span>}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600 text-xs whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString('fr-FR')}
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
