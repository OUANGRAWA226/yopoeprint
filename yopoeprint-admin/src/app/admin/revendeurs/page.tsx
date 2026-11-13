'use client'

import { useCallback, useEffect, useState } from 'react'
import { Briefcase, Check, X, PauseCircle, RotateCcw, Mail, Phone } from 'lucide-react'
import { resellersService, ResellerAccount, ResellerStatus } from '@/lib/resellers.service'
import { Card, ErrorAlert, Spinner } from '@/components/ui'
import { fcfa, dateFr } from '@/components/status'

const TABS: { id: ResellerStatus | 'all'; label: string }[] = [
  { id: 'pending', label: 'À examiner' },
  { id: 'approved', label: 'Actifs' },
  { id: 'suspended', label: 'Suspendus' },
  { id: 'rejected', label: 'Refusés' },
  { id: 'all', label: 'Tous' },
]

const STATUS: Record<ResellerStatus, { label: string; badge: string; card: string }> = {
  pending:   { label: 'À examiner', badge: 'text-bg-warning',   card: 'card-warning' },
  approved:  { label: 'Actif',      badge: 'text-bg-success',   card: 'card-success' },
  suspended: { label: 'Suspendu',   badge: 'text-bg-secondary', card: 'card-secondary' },
  rejected:  { label: 'Refusé',     badge: 'text-bg-danger',    card: 'card-danger' },
}
const VOLUME_LABEL = { low: '< 100 000 FCFA/mois', medium: '100 000 – 500 000 FCFA/mois', high: '> 500 000 FCFA/mois' }

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
    setError('')
    try {
      await resellersService.decide(r.id, action)
      await load(tab)
    } catch (e: any) {
      setError(e?.message || 'Action impossible')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div className="callout callout-info mb-3">
        Les agences validées obtiennent −15 % (jusqu&apos;à −20 % selon leur CA payé sur 12 mois) et la livraison en marque blanche.
      </div>

      <ul className="nav nav-pills mb-3 flex-nowrap overflow-auto" role="tablist">
        {TABS.map((t) => (
          <li key={t.id} className="nav-item">
            <button type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={`nav-link text-nowrap ${tab === t.id ? 'active' : ''}`}>{t.label}</button>
          </li>
        ))}
      </ul>

      <ErrorAlert message={error} onRetry={() => load(tab)} />

      {loading ? (
        <div className="text-center text-secondary py-5"><Spinner className="me-2" />Chargement…</div>
      ) : rows.length === 0 ? (
        <Card title="Revendeurs" icon={<Briefcase size={18} />}>
          <p className="text-center text-secondary py-4 mb-0">
            {tab === 'pending' ? 'Aucune demande à examiner.' : 'Aucun revendeur dans cette catégorie.'}
          </p>
        </Card>
      ) : (
        <div className="row">
          {rows.map((r) => {
            const s = STATUS[r.status]
            const busy = busyId === r.id
            return (
              <div key={r.id} className="col-xl-6">
                <div className={`card card-outline ${s.card} mb-4`}>
                  <div className="card-header">
                    <h3 className="card-title d-inline-flex align-items-center gap-2">
                      <Briefcase size={17} /> {r.companyName}
                    </h3>
                    <div className="card-tools d-flex align-items-center gap-2">
                      {r.tier && <span className="badge text-bg-light">Palier {r.tier.label} (−{r.tier.rate} %)</span>}
                      <span className={`badge ${s.badge}`}>{s.label}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="mb-1 fw-semibold">
                      {r.profile.contactName || `${r.firstName} ${r.lastName}`}
                      {r.profile.volume && <span className="fw-normal text-secondary"> · {VOLUME_LABEL[r.profile.volume]}</span>}
                    </p>
                    <ul className="list-inline small text-secondary mb-2">
                      <li className="list-inline-item"><a href={`mailto:${r.email}`} className="d-inline-flex align-items-center gap-1"><Mail size={12} /> {r.email}</a></li>
                      {(r.profile.phone || r.phone) && (
                        <li className="list-inline-item"><a href={`tel:${r.profile.phone || r.phone}`} className="d-inline-flex align-items-center gap-1"><Phone size={12} /> {r.profile.phone || r.phone}</a></li>
                      )}
                      {r.appliedAt && <li className="list-inline-item">Demande du {dateFr(r.appliedAt)}</li>}
                      {r.status === 'approved' && <li className="list-inline-item">CA payé 12 mois : <b>{fcfa(r.revenue12m)}</b></li>}
                    </ul>
                    {r.profile.message && (
                      <blockquote className="small bg-body-tertiary border-start border-3 px-3 py-2 mb-0" style={{ whiteSpace: 'pre-wrap' }}>{r.profile.message}</blockquote>
                    )}
                  </div>
                  <div className="card-footer d-flex justify-content-end gap-2">
                    {(r.status === 'pending' || r.status === 'rejected' || r.status === 'suspended') && (
                      <button type="button" onClick={() => decide(r, 'approve')} disabled={busy} className="btn btn-success btn-sm d-inline-flex align-items-center gap-1">
                        {busy ? <Spinner /> : r.status === 'pending' ? <Check size={14} /> : <RotateCcw size={14} />}
                        {r.status === 'pending' ? 'Valider' : 'Réactiver'}
                      </button>
                    )}
                    {r.status === 'pending' && (
                      <button type="button" onClick={() => decide(r, 'reject')} disabled={busy} className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1">
                        <X size={14} /> Refuser
                      </button>
                    )}
                    {r.status === 'approved' && (
                      <button type="button" onClick={() => decide(r, 'suspend')} disabled={busy} className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1">
                        <PauseCircle size={14} /> Suspendre
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
