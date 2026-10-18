'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Plus,
  Building2,
  Calendar,
  Sparkles,
  PhoneCall,
  X
} from 'lucide-react'
import { quotesService, Quote } from '@/lib/quotes.service'
import { WHATSAPP_URL } from '@/lib/contact'

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string; icon: React.ReactNode }> = {
  new: {
    label: 'Demande reçue',
    bg: 'bg-amber-50',
    color: 'text-amber-800',
    border: 'border-amber-200',
    icon: <Clock size={13} />
  },
  processing: {
    label: 'En analyse atelier',
    bg: 'bg-amber-50',
    color: 'text-amber-800',
    border: 'border-amber-200',
    icon: <Clock size={13} />
  },
  sent: {
    label: 'Proposition prête',
    bg: 'bg-emerald-50',
    color: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: <CheckCircle2 size={13} />
  },
  accepted: {
    label: 'Acceptée',
    bg: 'bg-emerald-50',
    color: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: <CheckCircle2 size={13} />
  },
  rejected: { 
    label: 'Non réalisable', 
    bg: 'bg-rose-50', 
    color: 'text-rose-700', 
    border: 'border-rose-200',
    icon: <XCircle size={13} /> 
  },
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

function formatDate(d?: string) {
  if (!d) return 'Récent'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DevisClientPage() {
  const [devisList, setDevisList] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)

  useEffect(() => {
    const fetchDevis = async () => {
      try {
        const data = await quotesService.getMyQuotes()
        setDevisList(data || [])
      } catch (err) {
        console.error('Erreur lors du chargement des devis', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDevis()
  }, [])

  return (
    <div className="space-y-6">
      
      {/* ── En-tête de page ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-gray-900 tracking-tight">Mes devis sur mesure</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              {devisList.length} demande(s)
            </span>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Suivi des chiffrages personnalisés et validation de commande en 1 clic
          </p>
        </div>
        
        <Link 
          href="/devis" 
          className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-[0.98]"
        >
          <Plus size={16} /> Demander un nouveau devis
        </Link>
      </div>

      {/* ── Liste des devis ───────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 h-48 animate-pulse" />
          ))}
        </div>
      ) : devisList.length === 0 ? (
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm text-center py-16 px-6 max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto">
            <FileText size={28} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Aucun devis en cours</h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Vous préparez un événement, une campagne d'affichage ou un tirage spécial ? Demandez un devis personnalisé, c'est gratuit sous 24h.
            </p>
          </div>
          
          <div className="pt-2">
            <Link 
              href="/devis" 
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <Sparkles size={16} /> Demander un devis gratuit
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devisList.map((devis) => {
            const status = STATUS_CONFIG[devis.status] || STATUS_CONFIG.new
            return (
              <div 
                key={devis.id} 
                className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:border-gray-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{devis.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                        <Calendar size={12} /> Demande déposée le {formatDate(devis.createdAt)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-bold shrink-0 border ${status.bg} ${status.border} ${status.color}`}>
                      {status.icon} {status.label}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {devis.details || 'Aucune précision complémentaire.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    {devis.price ? (
                      <div>
                        <p className="text-2xs text-gray-400 uppercase font-semibold">Montant proposé</p>
                        <p className="font-display font-bold text-gray-900 text-base tabular-nums">
                          {formatPrice(devis.price)} FCFA
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium">
                        Chiffrage en cours par l'atelier
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={() => setSelectedQuote(devis)}
                    className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5"
                  >
                    Détails du devis <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modale de détails du devis ────────────────────── */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-gray-400">Devis {selectedQuote.reference}</span>
                <h3 className="font-display text-xl font-bold text-gray-900 mt-0.5">{selectedQuote.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedQuote(null)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cahier des charges</p>
                <p className="text-gray-800 text-xs sm:text-sm leading-relaxed">{selectedQuote.details}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-400 font-semibold mb-0.5">Date de demande</p>
                  <p className="font-bold text-gray-800">{formatDate(selectedQuote.createdAt)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-400 font-semibold mb-0.5">Proposition de prix</p>
                  <p className="font-bold text-gray-900 tabular-nums text-sm">
                    {selectedQuote.price ? `${formatPrice(selectedQuote.price)} FCFA` : 'En attente de chiffrage'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <a 
                href={`${WHATSAPP_URL}?text=Bonjour%20YopoePrint%2C%20je%20souhaite%20échanger%20sur%20mon%20devis%20%3A%20${encodeURIComponent(selectedQuote.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white py-2.5 px-4 rounded-xl font-bold text-xs transition-colors"
              >
                <PhoneCall size={14} /> Discuter avec un technicien
              </a>
              <button 
                onClick={() => setSelectedQuote(null)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
