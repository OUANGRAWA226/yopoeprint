'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthContext } from '@/context/AuthContext'
import { ordersService } from '@/lib/orders.service'
import {
  ShoppingBag, Clock, CheckCircle,
  Truck, ArrowRight, Package, ChevronRight,
  FileText, HeadphonesIcon, RefreshCw
} from 'lucide-react'

// ─── Couleurs et labels des statuts ──────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: 'En attente', color: 'text-yellow-700', bg: 'bg-yellow-50', icon: <Clock size={14} /> },
  confirmed: { label: 'Confirmée', color: 'text-blue-700', bg: 'bg-blue-50', icon: <CheckCircle size={14} /> },
  in_production: { label: 'En production', color: 'text-purple-700', bg: 'bg-purple-50', icon: <Package size={14} /> },
  ready: { label: 'Prête', color: 'text-green-700', bg: 'bg-green-50', icon: <CheckCircle size={14} /> },
  shipped: { label: 'Expédiée', color: 'text-blue-600', bg: 'bg-blue-50', icon: <Truck size={14} /> },
  delivered: { label: 'Livrée', color: 'text-green-700', bg: 'bg-green-50', icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Annulée', color: 'text-red-600', bg: 'bg-red-50', icon: <Clock size={14} /> },
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DashboardPage() {
  const { user } = useAuthContext()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, enCours: 0, livrees: 0, depense: 0 })

  useEffect(() => {
    ordersService.getMyOrders({ limit: 5 } as any)
      .then((res) => {
        const data = res.data || []
        setOrders(data.slice(0, 3)) // Show latest 3
        setStats({
          total: res.total || data.length,
          enCours: data.filter((o: any) => !['delivered', 'cancelled'].includes(o.status)).length,
          livrees: data.filter((o: any) => o.status === 'delivered').length,
          depense: data.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 md:space-y-8">

      {/* ── Bienvenue & Actions rapides ────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Banner Welcome */}
        <div className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center shadow-lg">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <ShoppingBag size={120} className="transform translate-x-4 translate-y-8" />
          </div>
          <div className="relative z-10">
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              Bonjour {user?.firstName} 👋
            </h2>
            <p className="text-gray-300 text-sm mb-6 max-w-sm">
              Que souhaitez-vous imprimer aujourd'hui ? Retrouvez tout votre historique et vos avantages ici.
            </p>
            <Link href="/catalogue"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-md active:scale-95"
            >
              Nouvelle commande <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Support Card */}
        <div className="w-full md:w-64 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
            <HeadphonesIcon size={22} />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Besoin d'aide ?</h3>
          <p className="text-xs text-gray-500 mb-4">
            Notre support client est là pour vous assister.
          </p>
          <Link href="/contact" className="text-sm font-semibold text-primary hover:underline underline-offset-4">
            Contacter le support
          </Link>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Commandes passées', value: stats.total, suffix: '', icon: <ShoppingBag size={18} />, color: 'text-gray-900', bg: 'bg-gray-100' },
          { label: 'En cours', value: stats.enCours, suffix: '', icon: <RefreshCw size={18} />, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Livrées', value: stats.livrees, suffix: '', icon: <CheckCircle size={18} />, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total dépensé', value: formatPrice(stats.depense), suffix: ' F', icon: <Package size={18} />, color: 'text-primary', bg: 'bg-primary/10' },
        ].map(({ label, value, suffix, icon, color, bg }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center ${color} mb-4`}>
              {icon}
            </div>
            <p className="font-display text-2xl font-extrabold text-gray-900 mb-1">
              {value}<span className="text-sm font-medium text-gray-500 ml-1">{suffix}</span>
            </p>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Dernières commandes & Devis ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        
        {/* Commandes */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag size={18} className="text-gray-400" />
              Dernières commandes
            </h3>
            <Link href="/mon-compte/commandes" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 px-6 flex-1 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <ShoppingBag size={24} className="text-gray-300" />
              </div>
              <p className="font-bold text-gray-900 mb-1">Aucune commande</p>
              <p className="text-sm text-gray-500 mb-4 max-w-xs">Vous n'avez pas encore passé de commande chez YopoePrint.</p>
              <Link href="/catalogue" className="btn-primary">
                Faire ma première commande
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 flex-1">
              {orders.map((order) => {
                const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                return (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 hover:bg-gray-50/50 transition-colors gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.bg} ${status.color}`}>
                        {status.icon}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm mb-0.5">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.createdAt)} • {order.items?.length || 0} article(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${status.bg} ${status.color} mb-1`}>
                          {status.label}
                        </span>
                        <p className="font-bold text-gray-900 text-sm">
                          {formatPrice(order.total)} FCFA
                        </p>
                      </div>
                      <Link href={`/mon-compte/commandes/${order.id}`} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 hover:border-gray-400 transition-colors shrink-0">
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Actions Rapides / Devis */}
        <div className="space-y-6">
          <Link href="/mon-compte/devis" className="block bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
              <FileText size={22} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Mes devis</h3>
            <p className="text-sm text-gray-500 mb-4">Suivez vos demandes de devis sur mesure et personnalisés.</p>
            <span className="text-xs font-semibold text-primary flex items-center gap-1">
              Accéder <ArrowRight size={14} />
            </span>
          </Link>

          <Link href="/devis" className="block bg-gray-900 rounded-2xl p-6 shadow-md hover:bg-gray-800 transition-colors">
            <h3 className="font-bold text-white text-lg mb-2">Projet sur mesure ?</h3>
            <p className="text-sm text-gray-400 mb-4">
              Vous avez besoin d'une impression spécifique non listée ? Demandez un devis.
            </p>
            <span className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/20 transition-colors">
              Nouveau devis <ArrowRight size={16} />
            </span>
          </Link>
        </div>

      </div>
    </div>
  )
}
