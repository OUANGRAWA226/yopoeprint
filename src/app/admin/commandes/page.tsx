'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  Clock, 
  Truck, 
  FileWarning, 
  Printer,
  ChevronDown,
  Eye
} from 'lucide-react'

function fmt(n: number) { return new Intl.NumberFormat('fr-FR').format(n) }

const STATUSES = [
  { id: 'all', label: 'Toutes les commandes' },
  { id: 'pending', label: 'En attente de paiement' },
  { id: 'paid', label: 'Paiement validé (Attente fichiers)' },
  { id: 'printing', label: 'En cours d\'impression' },
  { id: 'shipped', label: 'Expédiée / Terminée' }
]

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = () => {
    setLoading(true)
    api.get('/orders')
      .then(res => setOrders(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      await api.patch(`/orders/${orderId}`, { status: newStatus })
      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut')
    } finally {
      setUpdatingId(null)
    }
  }

  // Derived data
  const filteredOrders = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter
    const matchSearch = search === '' || 
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.shippingAddress?.fullName || '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const getStatusBadge = (status: string, hasMissingFiles: boolean) => {
    if (status === 'shipped' || status === 'delivered') return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700"><CheckCircle size={14} /> Terminée</span>
    if (status === 'printing') return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700"><Printer size={14} /> Impression</span>
    if (status === 'paid' && hasMissingFiles) return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-700"><FileWarning size={14} /> Fichiers requis</span>
    if (status === 'paid' && !hasMissingFiles) return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-100 text-indigo-700"><CheckCircle size={14} /> Prêt à imprimer</span>
    return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600"><Clock size={14} /> En attente</span>
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* ── HEADER & ACTIONS ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Gestion des Commandes</h1>
          <p className="text-gray-500 text-sm">Gérez le flux de production et mettez à jour les statuts.</p>
        </div>
      </div>

      {/* ── TOOLBAR (FILTRES) ── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Chercher par N° de commande ou nom du client..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
          />
        </div>
        <div className="relative">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none w-full sm:w-64 pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer"
          >
            {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ── TABLEAU DES COMMANDES ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Commande</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Client</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Articles</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Total</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Statut actuel</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <span className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin inline-block"></span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucune commande trouvée.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const hasMissingFiles = order.items?.some((i: any) => !i.fileUrl)
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                      
                      {/* Commande */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{order.orderNumber}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </td>

                      {/* Client */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{order.shippingAddress?.fullName || 'Client Anonyme'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{order.shippingAddress?.city || 'Non renseignée'}</p>
                      </td>

                      {/* Articles */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {order.items?.slice(0, 3).map((item: any, i: number) => (
                              <div key={i} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm shadow-sm z-10" title={item.productName}>
                                {item.emoji || '📦'}
                              </div>
                            ))}
                            {(order.items?.length || 0) > 3 && (
                              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm z-0">
                                +{(order.items?.length || 0) - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 font-medium ml-2">{order.items?.length || 0} art.</span>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4">
                        <p className="font-mono font-bold text-gray-900">{fmt(order.total)} F</p>
                      </td>

                      {/* Statut actuel */}
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status || 'pending', hasMissingFiles)}
                      </td>

                      {/* Actions (Update Status) */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Sélecteur de statut rapide */}
                          <div className="relative">
                            <select
                              value={order.status || 'pending'}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              disabled={updatingId === order.id}
                              className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer disabled:opacity-50"
                            >
                              <option value="pending">Attente Paiement</option>
                              <option value="paid">Payée (Attente Fichiers)</option>
                              <option value="printing">Lancer l'impression</option>
                              <option value="shipped">Marquer Expédiée</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>

                          {/* Bouton Voir détails */}
                          <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Voir les détails">
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
