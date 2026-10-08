'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Clock, CheckCircle, XCircle, ArrowRight, Plus } from 'lucide-react'

import { quotesService, Quote } from '@/lib/quotes.service'
import { useEffect } from 'react'

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'En cours d\'analyse', bg: 'bg-yellow-50', color: 'text-yellow-700', icon: <Clock size={14} /> },
  processed: { label: 'Devis reçu', bg: 'bg-green-50', color: 'text-green-700', icon: <CheckCircle size={14} /> },
  rejected: { label: 'Refusé', bg: 'bg-red-50', color: 'text-red-600', icon: <XCircle size={14} /> },
}

export default function DevisClientPage() {
  const [devisList, setDevisList] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDevis = async () => {
      try {
        const data = await quotesService.getMyQuotes()
        setDevisList(data)
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
      {/* ── En-tête ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Mes devis</h2>
          <p className="text-gray-500 text-sm mt-1">Suivez l'état de vos demandes sur mesure</p>
        </div>
        <Link href="/devis" className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm">
          <Plus size={16} /> Nouveau devis
        </Link>
      </div>

      {/* ── Liste des devis ───────────────────────────────── */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Chargement de vos devis...</div>
      ) : devisList.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm text-center py-16 px-6">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-gray-300" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Aucun devis en cours</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Vous avez un projet spécifique d'impression ? Demandez un devis personnalisé, c'est gratuit.
          </p>
          <Link href="/devis" className="btn-primary inline-flex">
            Demander un devis
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devisList.map((devis) => {
            const status = STATUS_CONFIG[devis.status]
            return (
              <div key={devis.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-[15px]">{devis.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Demande du {devis.createdAt ? new Date(devis.createdAt).toLocaleDateString('fr-FR') : 'Récent'}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${status?.bg || 'bg-gray-50'} ${status?.color || 'text-gray-700'}`}>
                    {status?.icon} {status?.label || devis.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-5 flex-1 line-clamp-2">
                  {devis.details}
                </p>
                
                <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
                  <div>
                    {devis.price ? (
                      <p className="font-bold text-gray-900 text-sm">
                        {new Intl.NumberFormat('fr-FR').format(devis.price)} FCFA
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Prix en attente</p>
                    )}
                  </div>
                  <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    Voir détails <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
