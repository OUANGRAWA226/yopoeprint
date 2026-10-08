'use client'

import { FileText, RotateCw, CheckCircle2, Package, Clock, Truck, Star, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ordersService } from '@/lib/orders.service'
import { SkeletonOrderCard } from '@/components/ui/Skeleton'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { useToast } from '@/context/ToastContext'

export default function CompteCommandes() {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [reordering, setReordering] = useState<string | null>(null)
  const [reviewTarget, setReviewTarget] = useState<{ orderId: string; orderNumber: string } | null>(null)
  const toast = useToast()
  
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersService.getMyOrders()
        // Gérer la réponse paginée { data: [...] } ou le tableau direct
        setOrders(Array.isArray(data) ? data : data.data || [])
      } catch (err) {
        console.error('Erreur lors du chargement des commandes', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const handleDownload = (id: string) => {
    setDownloading(id)
    setTimeout(() => setDownloading(null), 1500)
  }

  const handleReorder = (id: string) => {
    setReordering(id)
    setTimeout(() => {
      setReordering(null)
      toast.success('Articles ajoutés au panier !', 'Vous pouvez finaliser votre commande.')
    }, 1000)
  }

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'pending': return { label: 'En attente', color: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: Clock }
      case 'in_progress': return { label: 'En Impression', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: RotateCw }
      case 'shipped': return { label: 'Expédié', color: 'bg-purple-50 text-purple-700 border-purple-100', icon: Truck }
      case 'delivered': return { label: 'Livré', color: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle2 }
      default: return { label: 'Inconnu', color: 'bg-gray-50 text-gray-700 border-gray-100', icon: Package }
    }
  }

  return (
    <>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-extrabold text-gray-900">Historique des Commandes</h1>
      
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <SkeletonOrderCard key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="font-bold text-gray-900">Aucune commande trouvée.</p>
            <p className="text-sm text-gray-500 mt-1">Vos futures commandes apparaîtront ici.</p>
          </div>
        ) : orders.map((order) => {
          const statusCfg = getStatusConfig(order.status)
          const StatusIcon = statusCfg.icon
          
          return (
            <div key={order.id || order._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
              
              {/* Header Commande */}
              <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-0.5">N° Commande</p>
                    <p className="font-bold text-gray-900">{order.id || order.orderNumber || order._id}</p>
                  </div>
                  <div className="hidden md:block w-px h-8 bg-gray-200"></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-0.5">Date</p>
                    <p className="font-semibold text-gray-700 text-sm">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : order.date}
                    </p>
                  </div>
                  <div className="hidden md:block w-px h-8 bg-gray-200"></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-0.5">Total</p>
                    <p className="font-bold text-primary">{new Intl.NumberFormat('fr-FR').format(order.total)} FCFA</p>
                  </div>
                </div>

                <div className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 w-fit ${statusCfg.color}`}>
                  <StatusIcon size={14} className={order.status === 'in_progress' ? 'animate-spin' : ''} />
                  {statusCfg.label}
                </div>
              </div>

              {/* Contenu Commande */}
              <div className="p-4 md:p-5">
                <div className="space-y-3 mb-6">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg shrink-0">
                        📦
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {item.name || item.product?.name} <span className="text-gray-400 font-medium">x{item.quantity}</span>
                        </p>
                        <p className="text-xs text-gray-500">{item.desc || item.product?.shortDesc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleDownload(order.id || order._id)}
                    disabled={downloading === (order.id || order._id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {downloading === (order.id || order._id) ? (
                      <RotateCw size={16} className="animate-spin" />
                    ) : (
                      <FileText size={16} />
                    )}
                    {downloading === (order.id || order._id) ? 'Génération...' : 'Facture PDF'}
                  </button>

                  {/* Bouton avis — visible uniquement sur les commandes livrées */}
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => setReviewTarget({ orderId: order.id || order._id, orderNumber: order.orderNumber || order.id || order._id })}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      Laisser un avis
                    </button>
                  )}

                  <button 
                    onClick={() => handleReorder(order.id || order._id)}
                    disabled={reordering === (order.id || order._id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors ml-auto"
                  >
                    {reordering === (order.id || order._id) ? (
                      <RotateCw size={16} className="animate-spin" />
                    ) : (
                      <RotateCw size={16} />
                    )}
                    {reordering === (order.id || order._id) ? 'Ajout en cours...' : 'Re-commander'}
                  </button>
                </div>
              </div>

            </div>
          )
        })}
      </div>
    </div>

      {/* Modal avis client */}
      {reviewTarget && (
        <ReviewForm
          isOpen={true}
          onClose={() => setReviewTarget(null)}
          orderId={reviewTarget.orderId}
          orderNumber={reviewTarget.orderNumber}
        />
      )}
    </>
  )
}
