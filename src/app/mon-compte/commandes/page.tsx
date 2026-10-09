'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ordersService } from '@/lib/orders.service'
import {
  ShoppingBag, Clock, CheckCircle, Truck,
  Package, ChevronRight, Search, Filter,
  ArrowRight, ShieldCheck, Eye, Sparkles
} from 'lucide-react'
import { BatInteractiveModal } from '@/components/orders/BatInteractiveModal'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'En attente', color: 'text-yellow-700', bg: 'bg-yellow-50' },
  confirmed: { label: 'Confirmée', color: 'text-blue-700', bg: 'bg-blue-50' },
  bat_pending: { label: 'BAT à valider', color: 'text-amber-800', bg: 'bg-amber-100 border border-amber-200' },
  in_production: { label: 'En production', color: 'text-purple-700', bg: 'bg-purple-50'},
  ready: { label: 'Prête', color: 'text-green-700', bg: 'bg-green-50' },
  shipped: { label: 'Expédiée', color: 'text-blue-600', bg: 'bg-blue-50' },
  delivered: { label: 'Livrée', color: 'text-green-700', bg: 'bg-green-50' },
  cancelled: { label: 'Annulée', color: 'text-red-600', bg: 'bg-red-50' },
  refunded: { label: 'Remboursée', color: 'text-gray-600', bg: 'bg-gray-100' },
}

// Étapes de progression de la commande
const ORDER_STEPS = ['confirmed', 'bat_pending', 'in_production', 'ready', 'shipped', 'delivered']

function formatPrice(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ─── Barre de progression commande ───────────────────────────
function OrderProgress({ status }: { status: string }) {
  const currentStep = ORDER_STEPS.indexOf(status)
  if (currentStep === -1) return null

  const labels = ['Confirmée', 'BAT', 'Production', 'Prête', 'Expédiée', 'Livrée']

  return (
    <div className="mt-4 px-1">
      <div className="flex items-center gap-0">
        {ORDER_STEPS.map((step, i) => {
          const done = i <= currentStep
          const current = i === currentStep
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all z-10
                ${done
                  ? current
                    ? 'bg-primary text-white ring-4 ring-primary/20 shadow-sm'
                    : 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                {done && !current ? <CheckCircle size={14} /> : i + 1}
              </div>
              {i < ORDER_STEPS.length - 1 && (
                <div className={`h-1 flex-1 mx-[-2px] rounded-full transition-all duration-500
                  ${i < currentStep ? 'bg-green-400' : 'bg-gray-100'}`} />
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-2">
        {labels.map((l, i) => (
          <span key={l} className={`text-[10px] font-bold ${i <= currentStep ? 'text-gray-900' : 'text-gray-300'}`}>
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function CommandesPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedBatOrder, setSelectedBatOrder] = useState<any | null>(null)

  const reloadOrders = () => {
    ordersService.getMyOrders()
      .then((res) => setOrders(res.data || []))
      .catch(() => {})
  }

  useEffect(() => {
    ordersService.getMyOrders()
      .then((res) => setOrders(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Filtrer les commandes
  const filtered = orders.filter((o) => {
    const matchStatus = filter === 'all' || 
                        (filter === 'in_progress' && !['delivered', 'cancelled', 'refunded'].includes(o.status)) ||
                        o.status === filter
    const matchSearch = !search ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="space-y-6">

      {/* ── En-tête ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Mes commandes</h2>
          <p className="text-gray-500 text-sm mt-1">{orders.length} commande{orders.length > 1 ? 's' : ''} au total</p>
        </div>
        <Link href="/catalogue" className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm">
          Nouvelle commande <ArrowRight size={16} />
        </Link>
      </div>

      {/* ── Filtres ───────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Recherche */}
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="N° de commande…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all"
          />
        </div>

        {/* Filtres statut */}
        <div className="flex gap-2 flex-wrap flex-1 md:justify-end">
          {[
            { value: 'all', label: 'Toutes' },
            { value: 'bat_pending', label: '🎨 BAT à valider' },
            { value: 'in_progress', label: 'En cours' },
            { value: 'delivered', label: 'Livrées' },
            { value: 'cancelled', label: 'Annulées' },
          ].map(({ value, label }) => (
            <button key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
                ${filter === value
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* ── Liste commandes ───────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-48 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm text-center py-16 px-6">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={24} className="text-gray-300" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Aucune commande trouvée</h3>
          <p className="text-sm text-gray-500 mb-6">
            {filter !== 'all' ? 'Essayez de modifier vos filtres de recherche.' : "Vous n'avez pas encore passé de commande."}
          </p>
          <Link href="/catalogue" className="btn-primary inline-flex">
            Découvrir nos produits
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            const items = order.items || []

            return (
              <div key={order.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row">

                {/* Left block: Info & Items */}
                <div className="flex-1 p-5 md:p-6 border-b md:border-b-0 md:border-r border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-extrabold text-gray-900 text-base">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Passée le {formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="space-y-2 mb-2">
                    {items.slice(0, 3).map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-lg shrink-0">
                          {item.emoji || '📦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{item.productName}</p>
                          <p className="text-[11px] text-gray-500">{item.formatLabel} • {item.finition}</p>
                        </div>
                        <p className="text-xs font-semibold text-gray-500 shrink-0">
                          x{new Intl.NumberFormat('fr-FR').format(item.quantity)}
                        </p>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <p className="text-[11px] text-primary font-bold mt-2 ml-14">
                        + {items.length - 3} autre(s) produit(s)
                      </p>
                    )}
                  </div>
                </div>

                {/* Right block: Progress & Actions */}
                <div className="w-full md:w-80 bg-gray-50/50 p-5 md:p-6 flex flex-col justify-between">
                  <div className="mb-6">
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total</span>
                      <span className="font-display font-extrabold text-gray-900 text-xl leading-none">
                        {formatPrice(order.total)} <span className="text-sm font-normal text-gray-500">FCFA</span>
                      </span>
                    </div>
                    {!['cancelled','refunded','pending'].includes(order.status) && (
                      <OrderProgress status={order.status} />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {/* Bouton BAT si disponible */}
                    {(order.batUrl || order.status === 'bat_pending') && (
                      <button
                        onClick={() => setSelectedBatOrder(order)}
                        className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                          order.batStatus === 'approved'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : order.batStatus === 'rejected'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 shadow-md'
                        }`}
                      >
                        <ShieldCheck size={14} />
                        {order.batStatus === 'approved'
                          ? 'Consulter le BAT (Validé)'
                          : order.batStatus === 'rejected'
                          ? 'BAT en correction'
                          : 'Examiner et Valider mon BAT →'}
                      </button>
                    )}

                    <div className="flex gap-2">
                      <Link href={`/suivi?ref=${order.orderNumber || order.id}`} className="flex-1 bg-white border border-gray-200 text-gray-900 font-bold text-xs py-2.5 rounded-xl text-center hover:border-gray-300 transition-colors">
                        Suivi détaillé
                      </Link>
                      <button className="flex-1 bg-primary text-white font-bold text-xs py-2.5 rounded-xl text-center hover:bg-primary/90 transition-colors">
                        Recommander
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* Modal BAT Interactif */}
      {selectedBatOrder && (
        <BatInteractiveModal
          isOpen={true}
          onClose={() => setSelectedBatOrder(null)}
          orderId={selectedBatOrder.id || selectedBatOrder._id}
          orderNumber={selectedBatOrder.orderNumber || selectedBatOrder.id}
          batUrl={selectedBatOrder.batUrl}
          batVersoUrl={selectedBatOrder.batVersoUrl}
          batStatus={selectedBatOrder.batStatus}
          batNotes={selectedBatOrder.batNotes}
          batApprovedAt={selectedBatOrder.batApprovedAt}
          onSuccess={() => {
            reloadOrders()
            setSelectedBatOrder(null)
          }}
        />
      )}
    </div>
  )
}
