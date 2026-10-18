'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthContext } from '@/context/AuthContext'
import { ordersService } from '@/lib/orders.service'
import {
  ShoppingBag, 
  Clock, 
  CheckCircle2,
  Truck, 
  ArrowRight, 
  Package, 
  ChevronRight,
  FileText, 
  HeadphonesIcon, 
  RefreshCw,
  PlusCircle,
  FileCheck,
  Building,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import { useContact } from '@/lib/settings.service'

// ─── Statuts normalisés ──────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  pending: { 
    label: 'En attente', 
    color: 'text-amber-800', 
    bg: 'bg-amber-50', 
    border: 'border-amber-200',
    icon: <Clock size={13} /> 
  },
  confirmed: { 
    label: 'Validée', 
    color: 'text-blue-700', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200',
    icon: <CheckCircle2 size={13} /> 
  },
  in_production: { 
    label: 'En presse', 
    color: 'text-purple-700', 
    bg: 'bg-purple-50', 
    border: 'border-purple-200',
    icon: <Package size={13} /> 
  },
  ready: { 
    label: 'Prête en atelier', 
    color: 'text-emerald-700', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200',
    icon: <CheckCircle2 size={13} /> 
  },
  shipped: { 
    label: 'En livraison', 
    color: 'text-sky-700', 
    bg: 'bg-sky-50', 
    border: 'border-sky-200',
    icon: <Truck size={13} /> 
  },
  delivered: { 
    label: 'Livrée', 
    color: 'text-emerald-800', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200',
    icon: <CheckCircle2 size={13} /> 
  },
  cancelled: { 
    label: 'Annulée', 
    color: 'text-rose-700', 
    bg: 'bg-rose-50', 
    border: 'border-rose-200',
    icon: <Clock size={13} /> 
  },
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DashboardPage() {
  const contact = useContact()
  const { user } = useAuthContext()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, enCours: 0, livrees: 0, depense: 0 })

  useEffect(() => {
    ordersService.getMyOrders({ limit: 5 } as any)
      .then((res) => {
        const data = res.data || []
        setOrders(data.slice(0, 4))
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

  const displayName = user?.firstName ? `${user.firstName}` : 'Client'

  return (
    <div className="space-y-6 md:space-y-8">

      {/* ── BANNIÈRE COMPTE CLIENT ARCHITECTURALE ── */}
      <div className="relative bg-gray-900 rounded-2xl p-6 sm:p-8 text-white border border-gray-800 shadow-lg overflow-hidden">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none" 
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-800 text-2xs font-semibold text-gray-300 border border-gray-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Espace Client Pro • Burkina Faso</span>
            </div>
            
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Bonjour {displayName} 👋
            </h2>
            
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Bienvenue sur votre tableau de bord. Retrouvez vos bons à tirer (BAT), 
              suivez vos impressions en cours et téléchargez vos factures certifiées DGI.
            </p>
          </div>

          {/* Actions Rapides */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <Link 
              href="/catalogue"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <PlusCircle size={16} />
              <span>Nouvelle impression</span>
            </Link>
            <Link 
              href="/devis"
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all"
            >
              <FileText size={16} />
              <span>Demander un devis</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── STATISTIQUES EN 4 COLONNES ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Commandes totales', 
            value: stats.total, 
            suffix: '', 
            icon: <ShoppingBag size={18} />, 
            color: 'text-gray-900', 
            bg: 'bg-gray-100',
            border: 'border-gray-200'
          },
          { 
            label: 'En production', 
            value: stats.enCours, 
            suffix: '', 
            icon: <RefreshCw size={18} className={stats.enCours > 0 ? 'animate-spin' : ''} />, 
            color: 'text-primary', 
            bg: 'bg-primary/10',
            border: 'border-primary/20'
          },
          { 
            label: 'Livrées avec succès', 
            value: stats.livrees, 
            suffix: '', 
            icon: <CheckCircle2 size={18} />, 
            color: 'text-emerald-700', 
            bg: 'bg-emerald-50',
            border: 'border-emerald-200'
          },
          { 
            label: 'Volume d\'impression', 
            value: formatPrice(stats.depense), 
            suffix: ' FCFA', 
            icon: <Package size={18} />, 
            color: 'text-gray-900', 
            bg: 'bg-amber-50',
            border: 'border-amber-200'
          },
        ].map(({ label, value, suffix, icon, color, bg, border }) => (
          <div 
            key={label} 
            className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
              <div className={`w-8 h-8 ${bg} ${border} border rounded-lg flex items-center justify-center ${color}`}>
                {icon}
              </div>
            </div>
            
            <p className="font-display text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight tabular-nums">
              {value}
              {suffix && <span className="text-xs font-semibold text-gray-500 ml-1">{suffix}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* ── DERNIÈRES COMMANDES & CARTE CONSEILLER ATELIER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
        
        {/* Colonne Gauche : Dernières commandes */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          
          <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-200/70 flex items-center justify-center text-gray-700">
                <ShoppingBag size={16} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Commandes récentes</h3>
                <p className="text-2xs text-gray-500">Historique et statut en direct</p>
              </div>
            </div>
            
            <Link 
              href="/mon-compte/commandes" 
              className="text-xs text-primary font-bold hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              Voir tout l'historique <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 px-6 flex-1 flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mb-3">
                <ShoppingBag size={24} />
              </div>
              <p className="font-bold text-gray-900 text-base mb-1">Aucune commande pour le moment</p>
              <p className="text-xs text-gray-500 mb-5 max-w-xs leading-relaxed">
                Vos cartes de visite, flyers, affiches ou bâches commandées s'afficheront ici.
              </p>
              <Link 
                href="/catalogue" 
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-sm"
              >
                Explorer le catalogue d'impression
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 flex-1">
              {orders.map((order) => {
                const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                return (
                  <div 
                    key={order.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 hover:bg-gray-50/70 transition-colors gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${status.bg} ${status.border} ${status.color}`}>
                        {status.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-sm font-mono tracking-tight">
                            {order.orderNumber}
                          </p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold border ${status.bg} ${status.border} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(order.createdAt)} • {order.items?.length || 1} article(s)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="text-left sm:text-right">
                        <p className="font-bold text-gray-900 text-sm tabular-nums">
                          {formatPrice(order.total)} FCFA
                        </p>
                        <p className="text-2xs text-gray-500">TTC • Facture DGI</p>
                      </div>
                      
                      <Link 
                        href={`/mon-compte/commandes/${order.id}`} 
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors shrink-0"
                        title="Détails de la commande"
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Colonne Droite : Cartes d'action & Support Pro */}
        <div className="space-y-4">
          
          {/* Suivi des Devis */}
          <Link 
            href="/mon-compte/devis" 
            className="block bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
                <FileText size={18} />
              </div>
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                Accéder <ArrowRight size={13} />
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">Mes devis personnalisés</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Consultez les propositions tarifaires reçues et confirmez vos commandes en 1 clic.
            </p>
          </Link>

          {/* Assistance Technique Atelier */}
          <div className="bg-gray-900 rounded-2xl p-5 text-white border border-gray-800 shadow-sm relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <HeadphonesIcon size={14} />
                </div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Support Atelier</span>
              </div>
              
              <h4 className="font-bold text-white text-sm">Une question sur vos fichiers ?</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Nos graphistes pré-presse vérifient gratuitement vos fichiers PAO avant impression.
              </p>
              
              <div className="pt-1 flex flex-col gap-2">
                <a 
                  href={`${contact.whatsappUrl}?text=Bonjour%20YopoePrint%2C%20j%27ai%20une%20question%20sur%20mes%20commandes%20d%27impression.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Contacter sur WhatsApp ({contact.phoneDisplay})
                </a>
                <Link 
                  href="/contact" 
                  className="w-full inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-xl text-xs font-semibold transition-colors"
                >
                  Envoyer un message classique
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
