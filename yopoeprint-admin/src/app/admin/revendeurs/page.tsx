'use client'

import { useCallback, useEffect, useState } from 'react'
import { Briefcase, Check, X, PauseCircle, RotateCcw, Mail, Phone } from 'lucide-react'
import { resellersService, ResellerAccount, ResellerStatus } from '@/lib/resellers.service'

const TABS: { id: ResellerStatus | 'all'; label: string }[] = [
  { id: 'pending', label: 'À examiner' },
  { id: 'approved', label: 'Actifs' },
  { id: 'suspended', label: 'Suspendus' },
  { id: 'rejected', label: 'Refusés' },
  { id: 'all', label: 'Tous' },
]

const STATUS_CLS: Record<ResellerStatus, string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  suspended: 'bg-gray-100 text-gray-700 border-gray-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}
const STATUS_LABEL: Record<ResellerStatus, string> = {
  pending: 'À examiner', approved: 'Actif', suspended: 'Suspendu', rejected: 'Refusé',
}
const VOLUME_LABEL = { low: '< 100 000 FCFA/mois', medium: '100 000 – 500 000 FCFA/mois', high: '> 500 000 FCFA/mois' }

const fcfa = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n || 0)} FCFA`

export default function AdminRevendeursPage() {
  const [tab, setTab] = useState<ResellerStatus | 'all'>('pending')
  const [rows, setRows] = useState<ResellerAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async (t: ResellerStatus | 'all') => {
    setLoading(true)
    setError('')
    try {
      setRows(await resellersService.list(t))
    } catch (e: any) {
      setError(e?.message || 'Impossible de charger les revendeurs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(tab) }, [tab, load])

  const decide = async (r: ResellerAccount, action: 'approve' | 'reject' | 'suspend') => {
    const verb = action === 'approve' ? 'valider' : action === 'reject' ? 'refuser' : 'suspendre'
    if (!window.confirm(`${verb.charAt(0).toUpperCase() + verb.slice(1)} le compte revendeur de ${r.companyName} ?`)) return
    setBusyId(r.id)
    try {
      await resellersService.decide(r.id, action)
      await load(tab)
    } catch (e: any) {
      window.alert(e?.message || 'Action impossible')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-blue-deep flex items-center gap-2">
          <Briefcase size={22} /> Revendeurs
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Validez les agences : elles obtiennent −15 % (jusqu&apos;à −20 % selon leur CA payé sur 12 mois) et la livraison en marque blanche.
        </p>
      </div>

      <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl w-fit overflow-x-auto" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-white text-blue-deep shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => load(tab)} className="font-bold underline shrink-0">Réessayer</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-28 rounded-2xl bg-white border border-gray-100 animate-pulse" />)}</div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-sm text-gray-600">
          {tab === 'pending' ? 'Aucune demande à examiner.' : 'Aucun revendeur dans cette catégorie.'}
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-blue-deep text-base">{r.companyName}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_CLS[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                    {r.tier && <span className="text-xs font-semibold text-gray-600">Palier {r.tier.label} (−{r.tier.rate} %)</span>}
                  </div>
                  <p className="text-sm text-gray-700">
                    {r.profile.contactName || `${r.firstName} ${r.lastName}`}
                    {r.profile.volume && <span className="text-gray-500"> · {VOLUME_LABEL[r.profile.volume]}</span>}
                  </p>
                  <p className="text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                    <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1 hover:underline"><Mail size={12} /> {r.email}</a>
                    {(r.profile.phone || r.phone) && (
                      <a href={`tel:${r.profile.phone || r.phone}`} className="inline-flex items-center gap-1 hover:underline"><Phone size={12} /> {r.profile.phone || r.phone}</a>
                    )}
                    {r.appliedAt && <span>Demande du {new Date(r.appliedAt).toLocaleDateString('fr-FR')}</span>}
                    {r.status === 'approved' && <span>CA payé 12 mois : {fcfa(r.revenue12m)}</span>}
                  </p>
                  {r.profile.message && (
                    <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3 mt-2 whitespace-pre-wrap">{r.profile.message}</p>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  {(r.status === 'pending' || r.status === 'rejected' || r.status === 'suspended') && (
                    <button onClick={() => decide(r, 'approve')} disabled={busyId === r.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50">
                      {r.status === 'pending' ? <Check size={14} /> : <RotateCcw size={14} />}
                      {r.status === 'pending' ? 'Valider' : 'Réactiver'}
                    </button>
                  )}
                  {r.status === 'pending' && (
                    <button onClick={() => decide(r, 'reject')} disabled={busyId === r.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-red-200 text-red-700 bg-white hover:bg-red-50 disabled:opacity-50">
                      <X size={14} /> Refuser
                    </button>
                  )}
                  {r.status === 'approved' && (
                    <button onClick={() => decide(r, 'suspend')} disabled={busyId === r.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                      <PauseCircle size={14} /> Suspendre
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
