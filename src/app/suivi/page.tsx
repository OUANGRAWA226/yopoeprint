'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ordersService } from '@/lib/orders.service'
import { useToast } from '@/context/ToastContext'
import { Skeleton } from '@/components/ui/Skeleton'
import {
 Search, Package, CheckCircle, Truck,
 Clock, AlertCircle, MapPin, Phone,
 ChevronRight, RotateCcw, Copy, ShieldCheck, Eye, Sparkles
} from 'lucide-react'
import { BatInteractiveModal } from '@/components/orders/BatInteractiveModal'
import { useContact } from '@/lib/settings.service'

// ─── Config statuts ───────────────────────────────────────────
const STATUSES = [
 {
 key: 'confirmed',
 label: 'Commande confirmée',
 icon: <CheckCircle size={20} />,
 desc: 'Votre commande a été reçue et validée',
 color: 'blue',
 },
 {
 key: 'bat_pending',
 label: 'BAT en validation',
 icon: <ShieldCheck size={20} />,
 desc: 'Épreuve Bon À Tirer en attente de votre accord',
 color: 'amber',
 },
 {
 key: 'in_production',
 label: 'En production',
 icon: <Package size={20} />,
 desc: 'Votre commande est en cours d\'impression',
 color: 'purple',
 },
 {
 key: 'ready',
 label: 'Prête',
 icon: <CheckCircle size={20} />,
 desc: 'Votre commande est prête pour la livraison',
 color: 'green',
 },
 {
 key: 'shipped',
 label: 'En livraison',
 icon: <Truck size={20} />,
 desc: 'Votre commande est en route vers vous',
 color: 'blue',
 },
 {
 key: 'delivered',
 label: 'Livrée',
 icon: <CheckCircle size={20} />,
 desc: 'Votre commande a été livrée avec succès',
 color: 'green',
 },
]

const COLOR_MAP: Record<string, { bg: string; text: string; ring: string; line: string }> = {
 blue: { bg: 'bg-foreground', text: 'text-foreground', ring: 'ring-primary/20', line: 'bg-foreground' },
 amber: { bg: 'bg-amber-500', text: 'text-amber-500', ring: 'ring-amber-500/20', line: 'bg-amber-400' },
 purple: { bg: 'bg-purple-500', text: 'text-purple-500', ring: 'ring-purple-500/20', line: 'bg-purple-400' },
 green: { bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-500/20', line: 'bg-green-400' },
}

function formatPrice(n: number) {
 return new Intl.NumberFormat('fr-FR').format(n)
}
function formatDate(d: string) {
 return new Date(d).toLocaleDateString('fr-FR', {
 day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
 })
}
function formatDateShort(d: string) {
 return new Date(d).toLocaleDateString('fr-FR', {
 day: '2-digit', month: 'short', year: 'numeric'
 })
}

// ─── Barre de progression ─────────────────────────────────────
function ProgressTimeline({ status, history }: { status: string; history?: any[] }) {
 const currentIdx = STATUSES.findIndex((s) => s.key === status)

 return (
 <div className="space-y-0">
 {STATUSES.map((s, i) => {
 const done = i <= currentIdx
 const current = i === currentIdx
 const colors = COLOR_MAP[s.color]

 return (
 <div key={s.key} className="flex gap-4">
 {/* Ligne verticale + cercle */}
 <div className="flex flex-col items-center">
 <div className={`w-10 h-10 rounded-full flex items-center justify-center
 shrink-0 transition-all z-10
 ${done
 ? `${colors.bg} text-white ${current ? `ring-4 ${colors.ring}` : ''}`
 : 'bg-gray-100 text-gray-300'}`}>
 {done && !current
 ? <CheckCircle size={18} />
 : <span className={done ? 'text-white' : 'text-gray-300'}>{s.icon}</span>
 }
 </div>
 {i < STATUSES.length - 1 && (
 <div className={`w-0.5 flex-1 my-1 rounded-full min-h-[32px] transition-all
 ${i < currentIdx ? colors.line : 'bg-gray-100'}`} />
 )}
 </div>

 {/* Contenu */}
 <div className={`pb-6 flex-1 ${i === STATUSES.length - 1 ? 'pb-0' : ''}`}>
 <div className="flex items-start justify-between gap-2 mt-1.5">
 <div>
 <p className={`font-bold text-sm ${done ? 'text-foreground' : 'text-gray-300'}`}>
 {s.label}
 </p>
 <p className={`text-xs mt-0.5 ${done ? 'text-gray-400' : 'text-gray-200'}`}>
 {s.desc}
 </p>
 {/* Date depuis l'historique */}
 {history && done && (
 <p className={`text-2xs mt-1 font-medium ${colors.text}`}>
 {history.find((h: any) => h.status === s.key)?.date
 ? formatDate(history.find((h: any) => h.status === s.key).date)
 : current ? 'En cours…' : ''}
 </p>
 )}
 </div>
 {current && (
 <span className={`shrink-0 px-2 py-0.5 rounded-full text-2xs font-bold
 ${colors.bg} text-white`}>
 En cours
 </span>
 )}
 </div>
 </div>
 </div>
 )
 })}
 </div>
 )
}

// ─── Page principale ──────────────────────────────────────────
function SuiviContent() {
  const contact = useContact()
 const [input, setInput] = useState('')
 const [order, setOrder] = useState<any | null>(null)
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')
 const [searched, setSearched] = useState(false)
 const [isBatModalOpen, setIsBatModalOpen] = useState(false)
 const searchParams = useSearchParams()
 const toast = useToast()

 const handleBatSuccess = () => {
   if (order?.orderNumber) {
     handleSearchWithValue(order.orderNumber)
   }
 }

 // Auto-recherche si ?ref= est dans l'URL (ex: depuis email de confirmation)
 useEffect(() => {
 const ref = searchParams.get('ref')
 if (ref) {
 setInput(ref.toUpperCase())
 handleSearchWithValue(ref.toUpperCase())
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [])

 const handleSearchWithValue = async (value: string) => {
 const num = value.trim().toUpperCase()
 if (!num) { setError('Entrez un numéro de commande'); return }

 setLoading(true); setError(''); setOrder(null); setSearched(true)
 try {
 const data = await ordersService.trackOrder(num)
 setOrder(data)
 toast.success('Commande trouvée !', `Suivi de la commande ${num}`)
 } catch (err: any) {
 if (err.response?.status === 404) {
 setError(`Aucune commande trouvée pour le numéro "${num}". Vérifiez votre email de confirmation.`)
 toast.error('Commande introuvable', 'Vérifiez le numéro dans votre email de confirmation.')
 } else {
 setError('Erreur de connexion. Réessayez dans quelques instants.')
 toast.error('Erreur de connexion', 'Le serveur ne répond pas. Réessayez.')
 }
 } finally {
 setLoading(false)
 }
 }

 const handleSearch = () => handleSearchWithValue(input)

 const handleReset = () => {
   setInput('')
   setOrder(null)
   setError('')
   setSearched(false)
 }

 const copyRef = () => {
 if (order?.orderNumber) {
 navigator.clipboard.writeText(order.orderNumber).catch(() => {})
 toast.success('Copié !', `${order.orderNumber} est dans votre presse-papiers.`)
 }
 }

 return (
 <div className="min-h-screen bg-gray-50">

 {/* ── Hero ──────────────────────────────────────────── */}
 <div className="bg-gray-900 py-14">
 <div className="max-w-2xl mx-auto px-6 text-center">
 <div className="gold-bar mx-auto" />
 <h1 className="font-display text-4xl font-extrabold text-white mt-3 mb-3">
 Suivi de commande
 </h1>
 <p className="text-white/65 text-lg">
 Entrez votre numéro de commande pour suivre l&apos;avancement en temps réel
 </p>

 {/* Barre de recherche */}
 <div className="mt-8 flex gap-3 max-w-lg mx-auto">
 <div className="relative flex-1">
 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
 <input
 type="text"
 placeholder="Ex: YP-2025-001234"
 value={input}
 onChange={(e) => setInput(e.target.value.toUpperCase())}
 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
 className="w-full pl-11 pr-4 py-4 rounded-xl text-sm outline-none
 bg-white border-2 border-transparent focus:border-primary
 shadow-lg font-mono tracking-wide transition-all"
 />
 </div>
 <button
 onClick={handleSearch}
 disabled={loading}
 className="bg-primary text-foreground px-6 py-4 rounded-xl font-bold
 text-sm hover:bg-primary transition-all shadow-elevation
 disabled:opacity-60 flex items-center gap-2 shrink-0"
 >
 {loading ? (
 <span className="w-5 h-5 border-2 border-border/30
 border-t-blue-deep rounded-full animate-spin" />
 ) : (
 <><Search size={16} /> Rechercher</>
 )}
 </button>
 </div>

 {/* Indication numéro */}
 <p className="text-white/70 text-xs mt-3">
 Vous trouverez votre numéro dans l&apos;email de confirmation reçu après votre commande
 </p>
 </div>
 </div>

 <div className="max-w-4xl mx-auto px-6 py-10">

 {/* ── Loading Skeleton ─────────────────────── */}
 {loading && (
 <div className="space-y-6 animate-pulse">
 <div className="bg-white border border-gray-100 rounded-2xl p-6">
 <div className="flex justify-between mb-6">
 <div className="space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-7 w-48" /><Skeleton className="h-3 w-24" /></div>
 <div className="space-y-2 text-right"><Skeleton className="h-3 w-16 ml-auto" /><Skeleton className="h-7 w-32" /></div>
 </div>
 <div className="space-y-6 pt-4 border-t border-gray-50">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="flex gap-4">
 <Skeleton className="w-10 h-10 rounded-full shrink-0" />
 <div className="flex-1 space-y-1 pt-1">
 <Skeleton className="h-4 w-32" />
 <Skeleton className="h-3 w-48" />
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* ── Erreur ──────────────────────────────────────── */}
 {!loading && error && (
 <div className="bg-red-50 border border-red-100 rounded-2xl p-5
 flex items-start gap-4 mb-8">
 <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
 <div className="flex-1">
 <p className="font-bold text-red-600 text-sm">Commande introuvable</p>
 <p className="text-red-500 text-sm mt-1">{error}</p>
 </div>
 <button onClick={() => { setOrder(null); setInput(''); setError(''); setSearched(false) }}
 className="text-red-400 hover:text-red-600 shrink-0">
 <RotateCcw size={16} />
 </button>
 </div>
 )}

 {/* ── Résultat ────────────────────────────────────── */}
 {!loading && order && (
 <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 animate-fadeInUp">

 {/* Colonne principale */}
 <div className="space-y-5">

 {/* En-tête commande */}
 <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-6">
 <div className="flex items-start justify-between mb-4">
 <div>
 <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-1">
 Numéro de commande
 </p>
 <div className="flex items-center gap-2">
 <p className="font-mono font-bold text-foreground text-xl">
 {order.orderNumber}
 </p>
 <button onClick={copyRef} title="Copier" className="text-gray-300 hover:text-primary transition-colors">
 <Copy size={14} />
 </button>
 </div>
 <p className="text-gray-600 text-xs mt-1">
 Commandé le {formatDateShort(order.createdAt)}
 </p>
 </div>
 <div className="text-right">
 <p className="text-xs text-gray-400 mb-1">Total</p>
 <p className="font-display font-bold text-foreground text-xl">
 {formatPrice(order.total)} FCFA
 </p>
 {order.estimatedDelivery && (
 <p className="text-xs text-green-600 font-medium mt-1">
 🚚 Livraison estimée : {formatDateShort(order.estimatedDelivery)}
 </p>
 )}
 </div>
 </div>

 {/* Alerte statut annulé */}
 {order.status === 'cancelled' && (
 <div className="bg-red-50 border border-red-100 rounded-xl p-4
 flex items-start gap-3 mb-4">
 <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
 <div>
 <p className="font-bold text-red-600 text-sm">Commande annulée</p>
 <p className="text-red-500 text-xs mt-0.5">
 Contactez-nous au {contact.phoneDisplay} pour plus d&apos;informations.
 </p>
 </div>
 </div>
 )}

 {/* Message livraison */}
 {order.status === 'delivered' && (
 <div className="bg-green-50 border border-green-100 rounded-xl p-4
 flex items-start gap-3 mb-4">
 <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
 <div>
 <p className="font-bold text-green-700 text-sm">
 Commande livrée 🎉
 </p>
 <p className="text-green-600 text-xs mt-0.5">
 Livrée le {order.deliveredAt ? formatDateShort(order.deliveredAt) : '—'}.
 Nous espérons que vous êtes satisfait !
 </p>
 </div>
 </div>
 )}

 {/* Bannière Bon À Tirer (BAT) interactif */}
 {(order.batUrl || order.status === 'bat_pending') && (
 <div className="mb-6">
   {order.batStatus === 'approved' ? (
     <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
       <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
           <CheckCircle size={20} />
         </div>
         <div>
           <p className="font-bold text-emerald-950 text-sm">Bon À Tirer (BAT) Validé ✅</p>
           <p className="text-emerald-700 text-xs mt-0.5">Votre accord a été enregistré. Vos fichiers sont en cours de tirage.</p>
         </div>
       </div>
       <button
         onClick={() => setIsBatModalOpen(true)}
         className="px-4 py-2 bg-white border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors shrink-0"
       >
         Revoir le BAT
       </button>
     </div>
   ) : order.batStatus === 'rejected' ? (
     <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
       <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
           <AlertCircle size={20} />
         </div>
         <div>
           <p className="font-bold text-amber-950 text-sm">Modifications demandées sur le BAT 🛠️</p>
           <p className="text-amber-700 text-xs mt-0.5">Notre atelier graphique corrige votre épreuve selon vos consignes.</p>
         </div>
       </div>
       <button
         onClick={() => setIsBatModalOpen(true)}
         className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors shrink-0"
       >
         Consulter l&apos;épreuve
       </button>
     </div>
   ) : (
     <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-5 shadow-xl border border-blue-500/30">
       <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-start gap-3.5">
           <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0 shadow-inner">
             <ShieldCheck size={24} />
           </div>
           <div>
             <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-amber-400 text-gray-900 mb-1.5">
               <Sparkles size={11} /> Action requise de votre part
             </div>
             <h3 className="font-bold text-white text-base">Votre Bon À Tirer (BAT) est prêt !</h3>
             <p className="text-white/70 text-xs mt-0.5 leading-relaxed max-w-lg">
               Vérifiez vos repères de coupe, textes et visuels sur notre visualiseur haute définition pour lancer l&apos;impression.
             </p>
           </div>
         </div>
         <button
           onClick={() => setIsBatModalOpen(true)}
           className="px-5 py-3.5 bg-primary text-gray-900 rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-lg shrink-0 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
         >
           <Eye size={16} /> Examiner & Valider mon BAT →
         </button>
       </div>
     </div>
   )}
 </div>
 )}

 {/* Timeline */}
 {!['cancelled', 'pending'].includes(order.status) && (
 <ProgressTimeline
 status={order.status}
 history={order.statusHistory}
 />
 )}
 </div>

 {/* Produits commandés */}
 <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
 <div className="px-6 py-4 border-b border-gray-50">
 <h3 className="font-bold text-foreground">Produits commandés</h3>
 </div>
 <div className="divide-y divide-gray-50">
 {(order.items || []).map((item: any, i: number) => (
 <div key={i} className="flex items-center gap-4 px-6 py-4">
 <div className="w-12 h-12 bg-secondary rounded-xl flex items-center
 justify-center text-2xl shrink-0">
 {item.emoji || '📦'}
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-bold text-foreground text-sm truncate">
 {item.productName}
 </p>
 <p className="text-xs text-gray-400 mt-0.5">
 {item.formatId && `Format : ${item.formatId} · `}
 Qté : {new Intl.NumberFormat('fr-FR').format(item.quantity)}
 {item.rectoverso ? ' · Recto/Verso' : ' · Recto'}
 </p>
 </div>
 <p className="font-bold text-foreground text-sm shrink-0">
 {formatPrice(item.price)} FCFA
 </p>
 </div>
 ))}
 </div>

 {/* Total */}
 <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
 <div className="flex items-center justify-between text-sm mb-1.5">
 <span className="text-gray-500">Sous-total</span>
 <span className="font-medium">{formatPrice(order.subtotal || 0)} FCFA</span>
 </div>
 <div className="flex items-center justify-between text-sm mb-2">
 <span className="text-gray-500">Livraison</span>
 <span className={order.deliveryCost === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
 {order.deliveryCost === 0 ? '🎁 Offerte' : `${formatPrice(order.deliveryCost)} FCFA`}
 </span>
 </div>
 {order.discount > 0 && (
 <div className="flex items-center justify-between text-sm mb-2">
 <span className="text-gray-500">Réduction</span>
 <span className="text-green-600 font-medium">
 -{formatPrice(order.discount)} FCFA
 </span>
 </div>
 )}
 <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-2">
 <span className="font-bold text-foreground">Total</span>
 <span className="font-display font-bold text-foreground text-lg">
 {formatPrice(order.total)} FCFA
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Colonne latérale */}
 <aside className="space-y-4">

 {/* Adresse de livraison */}
 {order.deliveryAddress && (
 <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-5">
 <div className="flex items-center gap-2 mb-3">
 <MapPin size={16} className="text-primary" />
 <h3 className="font-bold text-foreground text-sm">Adresse de livraison</h3>
 </div>
 <div className="text-sm text-gray-600 space-y-0.5">
 <p className="font-bold text-foreground">
 {order.deliveryAddress.fullName}
 </p>
 <p>{order.deliveryAddress.phone}</p>
 {order.deliveryAddress.street && (
 <p>{order.deliveryAddress.street}</p>
 )}
 <p>
 {order.deliveryAddress.neighborhood && `${order.deliveryAddress.neighborhood}, `}
 {order.deliveryAddress.city}
 </p>
 </div>
 </div>
 )}

 {/* Paiement */}
 <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-5">
 <h3 className="font-bold text-foreground text-sm mb-3">Paiement</h3>
 <div className="space-y-2">
 <div className="flex items-center justify-between text-sm">
 <span className="text-gray-400">Mode</span>
 <span className="font-medium text-foreground capitalize">
 {order.paymentMethod?.replace('_', ' ') || '—'}
 </span>
 </div>
 <div className="flex items-center justify-between text-sm">
 <span className="text-gray-400">Statut</span>
 <span className={`px-2 py-0.5 rounded-full text-2xs font-bold
 ${order.paymentStatus === 'paid'
 ? 'bg-green-100 text-green-700'
 : order.paymentStatus === 'pending'
 ? 'bg-yellow-100 text-yellow-700'
 : 'bg-gray-100 text-gray-500'}`}>
 {order.paymentStatus === 'paid' ? '✓ Payé' :
 order.paymentStatus === 'pending' ? 'En attente' : order.paymentStatus}
 </span>
 </div>
 </div>
 </div>

 {/* Besoin d'aide */}
 <div className="bg-secondary border border-border/20 rounded-2xl p-5">
 <h3 className="font-bold text-foreground text-sm mb-3">
 Un problème ?
 </h3>
 <p className="text-gray-500 text-xs mb-4 leading-relaxed">
 Notre équipe est disponible pour vous aider du lundi au samedi de 8h à 18h.
 </p>
 <a href={`tel:${contact.phone}`}
 className="flex items-center gap-2 bg-foreground text-white px-4 py-2.5
 rounded-xl text-sm font-bold hover:bg-foreground transition-all">
 <Phone size={14} />
 {contact.phoneDisplay}
 </a>
 </div>

 {/* Nouvelle recherche */}
 <button onClick={handleReset}
 className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
 border-2 border-gray-200 text-sm font-medium text-gray-500
 hover:border-border hover:text-foreground transition-all">
 <RotateCcw size={14} />
 Suivre une autre commande
 </button>
 </aside>
 </div>
 )}

 {/* ── État initial (pas encore recherché) ─────────── */}
 {!searched && !order && (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
 {[
 { icon: '📧', title: 'Où trouver mon numéro ?', desc: 'Dans l\'email de confirmation envoyé après votre commande. Format : YP-2025-XXXXXX' },
 { icon: '📱', title: 'Suivi par SMS', desc: 'Vous recevez automatiquement un SMS à chaque changement de statut de votre commande' },
 { icon: '🕐', title: 'Délais de production', desc: 'Standard : 24-48h à Ouaga. Régions : 3-5 jours ouvrés. Express disponible avec supplément' },
 ].map(({ icon, title, desc }) => (
 <div key={title}
 className="bg-white border border-gray-100 rounded-2xl shadow-card p-6 text-center">
 <div className="text-4xl mb-3">{icon}</div>
 <h3 className="font-bold text-foreground text-sm mb-2">{title}</h3>
 <p className="text-gray-600 text-xs leading-relaxed">{desc}</p>
 </div>
 ))}
 </div>
 )}

 {/* Modal BAT Interactif */}
 {order && (order.batUrl || order.status === 'bat_pending') && (
   <BatInteractiveModal
     isOpen={isBatModalOpen}
     onClose={() => setIsBatModalOpen(false)}
     orderId={order.id || order._id}
     orderNumber={order.orderNumber}
     batUrl={order.batUrl}
     batVersoUrl={order.batVersoUrl}
     batStatus={order.batStatus}
     batNotes={order.batNotes}
     batApprovedAt={order.batApprovedAt}
     isPublicMode={true}
     onSuccess={handleBatSuccess}
   />
 )}

 </div>
 </div>
 )
}

export default function SuiviPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SuiviContent />
    </Suspense>
  )
}
