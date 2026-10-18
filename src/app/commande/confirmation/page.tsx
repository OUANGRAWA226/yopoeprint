'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib'
import { useCart } from '@/context/CartContext'
import { uploadService } from '@/lib/upload.service'
import { CheckCircle, Clock, Truck, Phone, ArrowRight, FileWarning, UploadCloud, FileCheck, MapPin, Download, FileText, Printer } from 'lucide-react'
import { DevisPdfGenerator } from '@/components/checkout/DevisPdfGenerator'

function fmt(n: number) { return new Intl.NumberFormat('fr-FR').format(n) }

// Maps the API order (items: format, paper, finish, totalPrice, designFileUrl…)
// to the shape this page and DevisPdfGenerator display
function toViewOrder(order: any) {
  return {
    ...order,
    items: (order.items || []).map((it: any) => ({
      ...it,
      emoji: it.productEmoji,
      formatId: it.format,
      formatLabel: it.format,
      paperId: it.paper,
      paperLabel: it.paper,
      finition: it.finish,
      price: it.totalPrice,
      fileUrl: it.designFileUrl,
    })),
  }
}

function ConfirmationDetails() {
  const params = useSearchParams()
  const orderId = params.get('orderId')
  const { clearCart } = useCart()

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ── ÉTATS D'UPLOAD ──
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(10) // Démarrage

    try {
      // Fake progress interval while uploading
      const interval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 15, 90))
      }, 500)

      // Upload réel
      const res = await uploadService.uploadFile(file, 'orders')
      
      clearInterval(interval)
      setUploadProgress(100)

      // Mise à jour de la commande via l'API
      await api.patch(`/orders/my-orders/${orderId}/design-file`, {
        designFileUrl: res.url,
      })

      setTimeout(() => {
        setIsUploading(false)
        setUploadSuccess(true)
        setOrder((prevOrder: any) => {
          if (!prevOrder) return prevOrder
          return {
            ...prevOrder,
            items: prevOrder.items?.map((item: any) => ({ ...item, fileUrl: item.fileUrl || res.url }))
          }
        })
      }, 500)
    } catch (err) {
      console.error(err)
      setIsUploading(false)
      setError('Erreur lors de l\'upload du fichier')
    }
  }

  useEffect(() => {
    if (!orderId) { setError('Numéro de commande manquant'); setLoading(false); return }
    api.get(`/orders/my-orders/${orderId}`)
      .then((r) => {
        setOrder(toViewOrder(r))
        // The order now exists server-side: the cart has been converted
        clearCart()
      })
      .catch(() => setError('Impossible de charger la commande'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center animate-in fade-in duration-500">
          <span className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin block mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Préparation de votre reçu…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Une erreur est survenue</h2>
          <p className="text-gray-500 mb-8">{error}</p>
          <Link href="/mon-compte/commandes" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-primary transition-colors">
            Voir mes commandes
          </Link>
        </div>
      </div>
    )
  }

  const hasMissingFiles = order?.items?.some((item: any) => !item.fileUrl)

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-20">

      {/* ── HERO SUCCÈS ────────────────────────────────────────── */}
      <div className="bg-[#10B981] pt-16 pb-24 relative overflow-hidden">
        {/* Confetti / Pattern simulation */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
        
        <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-black/10 animate-in zoom-in duration-500 delay-150">
            <CheckCircle size={48} className="text-[#10B981]" />
          </div>
          <h1 className="font-display text-4xl font-extrabold text-white mb-3 tracking-tight animate-in slide-in-from-bottom-4 duration-500 delay-300">
            Commande validée ! 🎉
          </h1>
          <p className="text-white/90 text-lg font-medium max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-500 delay-500">
            Merci pour votre confiance. Votre numéro de commande est le <strong className="font-mono bg-white/20 px-2 py-1 rounded ml-1">{order.orderNumber}</strong>.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-12 relative z-20 space-y-6">

        {/* ── FICHIERS MANQUANTS (ALERTE & UPLOAD) ────────────────────────── */}
        {hasMissingFiles && !uploadSuccess && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center md:items-start gap-5 animate-in slide-in-from-bottom-4 duration-500 delay-700">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
              <FileWarning size={28} className="text-orange-500" />
            </div>
            <div className="flex-1 text-center md:text-left w-full">
              <h2 className="text-lg font-bold text-orange-900 mb-1">Fichiers d'impression manquants</h2>
              <p className="text-sm text-orange-700 mb-4">
                Nous avons bien reçu votre paiement, mais il nous manque vos visuels pour lancer la production.
              </p>
              
              {isUploading ? (
                <div className="bg-white rounded-xl p-4 border border-orange-200 space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold text-orange-900">
                    <span>Envoi en cours...</span>
                    <span>{Math.min(uploadProgress, 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-orange-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-orange-600 font-medium text-center">Veuillez ne pas fermer cette page.</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <label className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-500/20 active:scale-[0.98]">
                    <UploadCloud size={16} /> Sélectionner mes fichiers
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.ai,.psd,.jpg,.jpeg,.png,.zip" 
                      onChange={handleFileUpload} 
                    />
                  </label>
                  <a
                    href={`https://wa.me/22670000000?text=${encodeURIComponent(`Bonjour YopoePrint, voici mes fichiers pour ma commande ${order?.orderNumber || ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:bg-[#20ba59] transition-colors inline-flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>💬</span> Envoyer par WhatsApp
                  </a>
                  <Link href="/guide-impression" className="px-5 py-2.5 bg-white border border-orange-200 text-orange-700 rounded-xl font-bold text-sm hover:bg-orange-100 transition-colors inline-flex items-center justify-center">
                    Guide technique
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SUCCÈS UPLOAD ────────────────────────── */}
        {uploadSuccess && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center gap-5 animate-in slide-in-from-top-4 duration-500">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <FileCheck size={28} className="text-green-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-lg font-bold text-green-900 mb-1">Fichiers reçus avec succès !</h2>
              <p className="text-sm text-green-700">
                Vos fichiers sont en cours de vérification par notre équipe prépresse. La production commencera très bientôt.
              </p>
            </div>
          </div>
        )}

        {/* ── PROCHAINES ÉTAPES (STEPPER) ────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-display text-lg font-bold text-gray-900 mb-6">Suivi de la commande</h2>
          
          <div className="relative">
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-100" />
            
            <div className="space-y-6">
              {/* Étape 1 : Paiement */}
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 border-4 border-white flex items-center justify-center shrink-0 z-10">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-gray-900 text-sm">Paiement validé</h3>
                  <p className="text-xs text-gray-500 mt-1">Votre paiement a été reçu avec succès.</p>
                </div>
              </div>

              {/* Étape 2 : Fichiers */}
              <div className="relative flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center shrink-0 z-10
                  ${hasMissingFiles ? 'bg-orange-100' : 'bg-green-100'}`}>
                  {hasMissingFiles ? <FileWarning size={20} className="text-orange-500" /> : <FileCheck size={20} className="text-green-600" />}
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-gray-900 text-sm">Validation des fichiers</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {hasMissingFiles ? 'En attente de vos fichiers pour vérification prépresse.' : 'Fichiers validés par notre équipe.'}
                  </p>
                </div>
              </div>

              {/* Étape 3 : Production */}
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center shrink-0 z-10">
                  <Clock size={20} className="text-gray-400" />
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-gray-400 text-sm">Impression & Façonnage</h3>
                  <p className="text-xs text-gray-400 mt-1">La magie opère dans nos ateliers.</p>
                </div>
              </div>

              {/* Étape 4 : Livraison */}
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center shrink-0 z-10">
                  <Truck size={20} className="text-gray-400" />
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-gray-400 text-sm">Expédition</h3>
                  <p className="text-xs text-gray-400 mt-1">Votre commande est en route vers vous.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── REÇU DIGITAL ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          {/* Bordure crantée style ticket en haut */}
          <div className="h-3 w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCI+PHBhdGggZD0iTTAgMTBsMTAtMTAgMTAgMTB6IiBmaWxsPSIjRjhGOEY4Ii8+PC9zdmc+')] bg-repeat-x rotate-180" />
          
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900 mb-1">Reçu de commande</h2>
                <p className="text-sm text-gray-500 font-mono">{order.orderNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(true)}
                  className="px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs"
                  title="Télécharger la facture ou devis officiel"
                >
                  <FileText size={15} />
                  <span>Facture PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                  title="Imprimer cette page"
                >
                  <Printer size={16} />
                </button>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-gray-200 py-4 mb-4 space-y-4">
              {(order.items || []).map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{item.emoji || '📦'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{fmt(item.quantity)} ex. • {item.formatId}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-gray-900 text-sm">{fmt(item.price)} F</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Sous-total</span>
                <span className="font-mono">{fmt(order.total)} F</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Frais de livraison</span>
                <span className="font-mono">Inclus</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
              <span className="font-bold text-gray-900 uppercase tracking-widest text-xs">Total payé</span>
              <span className="font-display font-extrabold text-primary text-2xl">
                {fmt(order.total)} <span className="text-base">FCFA</span>
              </span>
            </div>

            {order.shippingAddress && (
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-start gap-3">
                <MapPin size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Adresse de livraison</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {order.shippingAddress.fullName}<br />
                    {order.shippingAddress.street}<br />
                    {order.shippingAddress.city}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Bordure crantée style ticket en bas */}
          <div className="h-3 w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCI+PHBhdGggZD0iTTAgMTBsMTAtMTAgMTAgMTB6IiBmaWxsPSIjRjhGOEY4Ii8+PC9zdmc+')] bg-repeat-x" />
        </div>

        {/* ── ACTIONS & AIDE ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/catalogue" className="px-6 py-4 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold text-sm hover:border-primary hover:text-primary transition-all text-center flex items-center justify-center gap-2 shadow-xs">
            Continuer mes achats <ArrowRight size={16} />
          </Link>
          <a href="tel:+22670000000" className="px-6 py-4 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all text-center flex items-center justify-center gap-2 shadow-xs">
            <Phone size={16} /> Besoin d'aide ? (+226 70 00 00 00)
          </a>
        </div>

      </div>

      {order && (
        <DevisPdfGenerator
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          items={order.items?.map((it: any) => ({
            id: it.id || String(Math.random()),
            productId: it.productId || 'prod',
            productName: it.productName || 'Article imprimé',
            emoji: it.emoji || '📦',
            formatId: it.formatId || 'Standard',
            formatLabel: it.formatLabel || it.formatId || 'Standard',
            paperId: it.paperId || '',
            paperLabel: it.paperLabel || it.paperId || '',
            quantity: it.quantity || 1,
            rectoverso: !!it.rectoverso,
            finition: it.finition || 'Standard',
            price: it.price || 0,
            unitPrice: Math.round((it.price || 0) / (it.quantity || 1)),
          })) || []}
          total={order.total || 0}
          clientInfo={{
            name: order.shippingAddress?.fullName || 'Client YopoePrint',
            phone: order.shippingAddress?.phone || '',
          }}
        />
      )}
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <span className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin block mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Chargement…</p>
        </div>
      </div>
    }>
      <ConfirmationDetails />
    </Suspense>
  )
}
