'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Send, Eye, Paperclip, ClipboardList, Inbox, Clock, CheckCircle, XCircle } from 'lucide-react'
import { quotesService, Quote, QuoteStatus } from '@/lib/quotes.service'
import { Card, ErrorAlert, InfoBox, LoadingRow, Modal, Spinner, TableMessage } from '@/components/ui'

const STATUSES = [
  { id: 'all', label: 'Toutes les demandes' },
  { id: 'new', label: 'Nouvelles demandes' },
  { id: 'processing', label: 'En cours de traitement' },
  { id: 'sent', label: 'Devis envoyé' },
  { id: 'accepted', label: 'Accepté' },
  { id: 'rejected', label: 'Refusé' },
]

const STATUS_BADGE: Record<string, { label: string; badge: string }> = {
  new:        { label: 'Nouveau',          badge: 'text-bg-primary' },
  processing: { label: 'À l\'étude',       badge: 'text-bg-warning' },
  sent:       { label: 'Envoyé au client', badge: 'text-bg-info' },
  accepted:   { label: 'Accepté',          badge: 'text-bg-success' },
  rejected:   { label: 'Refusé',           badge: 'text-bg-danger' },
}

export default function AdminDevisPage() {
  const [devis, setDevis] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedDevis, setSelectedDevis] = useState<Quote | null>(null)
  const [priceInput, setPriceInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  const fetchDevis = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setDevis(await quotesService.getAllQuotes())
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger les demandes de devis')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDevis() }, [fetchDevis])

  const applyUpdate = (updated: Quote) => {
    setDevis((list) => list.map((d) => d.id === updated.id ? updated : d))
    setSelectedDevis((s) => s?.id === updated.id ? updated : s)
  }

  const handleStatusChange = async (id: string, newStatus: QuoteStatus) => {
    setError('')
    try {
      applyUpdate(await quotesService.updateStatus(id, { status: newStatus }))
    } catch (err: any) {
      setError(`Statut non modifié : ${err?.message || 'API indisponible'}`)
    }
  }

  const openDevis = (d: Quote) => {
    setSelectedDevis(d)
    setModalError('')
    setPriceInput(d.price ? String(d.price) : '')
  }

  // Enregistre le montant et marque le devis "envoyé" (le client est prévenu par email)
  const sendProposal = async () => {
    if (!selectedDevis) return
    const price = parseInt(priceInput.replace(/\s/g, ''), 10)
    if (!Number.isFinite(price) || price <= 0) {
      setModalError('Indiquez un montant en FCFA.')
      return
    }
    setSaving(true); setModalError('')
    try {
      applyUpdate(await quotesService.updateStatus(selectedDevis.id, { status: 'sent', price }))
    } catch (err: any) {
      setModalError(`Proposition non enregistrée : ${err?.message || 'API indisponible'}`)
    } finally {
      setSaving(false)
    }
  }

  const closeModal = useCallback(() => setSelectedDevis(null), [])

  const filteredDevis = devis.filter((d) => {
    const matchStatus = filter === 'all' || d.status === filter
    const q = search.toLowerCase()
    const matchSearch = search === '' ||
      d.reference.toLowerCase().includes(q) ||
      d.client.name.toLowerCase().includes(q) ||
      (d.client.company || '').toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const count = (s: string) => devis.filter((d) => d.status === s).length
  const badge = (s: string) => {
    const b = STATUS_BADGE[s] || { label: s, badge: 'text-bg-secondary' }
    return <span className={`badge ${b.badge}`}>{b.label}</span>
  }

  return (
    <>
      <div className="row">
        <div className="col-sm-6 col-lg-3"><InfoBox icon={<Inbox />} color="primary" label="Nouvelles demandes" value={loading ? '…' : count('new')} /></div>
        <div className="col-sm-6 col-lg-3"><InfoBox icon={<Clock />} color="warning" label="À l'étude" value={loading ? '…' : count('processing')} /></div>
        <div className="col-sm-6 col-lg-3"><InfoBox icon={<CheckCircle />} color="success" label="Acceptés" value={loading ? '…' : count('accepted')} /></div>
        <div className="col-sm-6 col-lg-3"><InfoBox icon={<XCircle />} color="danger" label="Refusés" value={loading ? '…' : count('rejected')} /></div>
      </div>

      <ErrorAlert message={error} onRetry={fetchDevis} />

      <Card title="Demandes de devis" icon={<ClipboardList size={18} />} noPadding
        tools={
          <>
            <div className="input-group input-group-sm" style={{ width: 260 }}>
              <span className="input-group-text"><Search size={13} /></span>
              <input type="text" placeholder="Référence, client, sujet…" aria-label="Rechercher une demande" className="form-control"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrer par statut" className="form-select form-select-sm" style={{ width: 'auto' }}>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </>
        }>
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead><tr><th>Réf. &amp; date</th><th>Client</th><th>Sujet de la demande</th><th>Statut</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
              {loading ? <LoadingRow colSpan={5} /> : filteredDevis.length === 0 ? (
                <TableMessage colSpan={5}>Aucune demande de devis trouvée.</TableMessage>
              ) : filteredDevis.map((d) => (
                <tr key={d.id}>
                  <td className="text-nowrap">
                    <div className="fw-semibold font-mono">{d.reference}</div>
                    <small className="text-secondary">{new Date(d.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</small>
                  </td>
                  <td>
                    <div className="fw-semibold">{d.client.name}</div>
                    <small className="text-secondary">{d.client.company || d.client.phone}</small>
                  </td>
                  <td style={{ maxWidth: 340 }}>
                    <div className="text-truncate">{d.title}</div>
                    {d.files && d.files.length > 0 && (
                      <span className="badge text-bg-light d-inline-flex align-items-center gap-1"><Paperclip size={10} /> {d.files.length} fichier(s)</span>
                    )}
                  </td>
                  <td>{badge(d.status)}</td>
                  <td className="text-end">
                    <div className="d-inline-flex align-items-center gap-2">
                      <select value={d.status} onChange={(e) => handleStatusChange(d.id, e.target.value as QuoteStatus)}
                        aria-label={`Statut de ${d.reference}`} className="form-select form-select-sm" style={{ width: 'auto' }}>
                        <option value="new">À traiter</option>
                        <option value="processing">En étude</option>
                        <option value="sent">Envoyé au client</option>
                        <option value="accepted">Devis accepté</option>
                        <option value="rejected">Devis refusé</option>
                      </select>
                      <button type="button" onClick={() => openDevis(d)} title="Lire la demande" aria-label={`Lire la demande ${d.reference}`}
                        className="btn btn-sm btn-outline-primary"><Eye size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!selectedDevis} size="lg" onClose={closeModal}
        title={selectedDevis ? <>Demande <span className="font-mono">{selectedDevis.reference}</span></> : ''}
        footer={selectedDevis && (
          <div className="d-flex w-100 align-items-center justify-content-between">
            <span className="text-secondary">Statut : {badge(selectedDevis.status)}</span>
            <button type="button" onClick={closeModal} className="btn btn-outline-secondary">Fermer</button>
          </div>
        )}>
        {selectedDevis && (
          <>
            <p className="small text-secondary">Reçue le {new Date(selectedDevis.createdAt).toLocaleString('fr-FR')}</p>

            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <div className="callout callout-info h-100 mb-0">
                  <h6 className="text-uppercase small text-secondary mb-1">Client</h6>
                  <div className="fw-semibold">{selectedDevis.client.name}</div>
                  {selectedDevis.client.company && <div className="small">{selectedDevis.client.company}</div>}
                  <small className="text-secondary">{selectedDevis.profile}</small>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="callout callout-info h-100 mb-0">
                  <h6 className="text-uppercase small text-secondary mb-1">Contact</h6>
                  <a href={`mailto:${selectedDevis.client.email}`} className="d-block small">{selectedDevis.client.email}</a>
                  <a href={`tel:${selectedDevis.client.phone}`} className="d-block small">{selectedDevis.client.phone}</a>
                </div>
              </div>
            </div>

            <h5 className="text-navy">{selectedDevis.title}</h5>
            <div className="border rounded p-3 bg-body-tertiary small mb-3" style={{ whiteSpace: 'pre-wrap' }}>{selectedDevis.description}</div>

            <div className="row g-2 mb-3">
              {[
                ['Quantité', selectedDevis.quantity],
                ['Format', selectedDevis.format || '—'],
                ['Budget', selectedDevis.budget],
                ['Délai', selectedDevis.deadline],
              ].map(([k, v]) => (
                <div key={k} className="col-6 col-md-3">
                  <div className="border rounded p-2 h-100">
                    <small className="text-secondary d-block">{k}</small>
                    <span className="fw-semibold">{v}</span>
                  </div>
                </div>
              ))}
            </div>
            {selectedDevis.hasFile && selectedDevis.fileDesc && (
              <p className="small text-secondary"><strong>Fichiers annoncés :</strong> {selectedDevis.fileDesc}</p>
            )}

            {selectedDevis.files && selectedDevis.files.length > 0 && (
              <>
                <h6 className="text-uppercase small text-secondary">Fichiers joints ({selectedDevis.files.length})</h6>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {selectedDevis.files.map((url, i) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1">
                      <Paperclip size={13} /> {decodeURIComponent(url.split('/').pop() || `Fichier ${i + 1}`)}
                    </a>
                  ))}
                </div>
              </>
            )}

            <div className="card card-outline card-gold mb-0">
              <div className="card-body">
                <label htmlFor="quote-price" className="form-label fw-semibold">Montant proposé (FCFA)</label>
                <div className="input-group">
                  <input id="quote-price" inputMode="numeric" placeholder="Ex : 185000" className="form-control"
                    value={priceInput} onChange={(e) => setPriceInput(e.target.value)} />
                  <button type="button" onClick={sendProposal} disabled={saving} className="btn btn-primary d-inline-flex align-items-center gap-2">
                    {saving ? <Spinner /> : <Send size={15} />} Envoyer la proposition
                  </button>
                </div>
                <div className="form-text">Passe le devis en « Envoyé au client » et prévient le client par email.</div>
                {modalError && <div role="alert" className="alert alert-danger mt-2 mb-0 py-2">{modalError}</div>}
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  )
}
