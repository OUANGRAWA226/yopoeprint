'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search, Download, ShieldCheck, CheckCircle2, AlertTriangle, UploadCloud,
  X, Send, ExternalLink, RefreshCw, ShoppingCart,
} from 'lucide-react'
import { adminOrdersService, Order } from '@/lib/orders.service'
import { uploadMedia } from '@/lib/media.service'
import { ExportButton } from '@/components/admin/ExportButton'
import { Card, ErrorAlert, LoadingRow, Modal, Pager, Spinner, TableMessage } from '@/components/ui'
import { ORDER_STATUS, OrderStatusBadge, PAYMENT_METHOD, fcfa } from '@/components/status'

const PAGE_SIZE = 50

// Ligne affichée dans le tableau et dans la modale BAT
interface Row {
  id: string
  orderNumber: string
  client: string
  phone: string
  product: string
  total: number
  status: string
  payment?: string
  paymentStatus?: string
  date: string
  zone: string
  batUrl?: string
  batVersoUrl?: string
  batStatus?: 'pending' | 'approved' | 'rejected' | null
  batNotes?: string
  batApprovedAt?: string
  batRejectedReason?: string
  batCorrectionFileUrl?: string
  whiteLabelSender?: Order['whiteLabelSender']
}

const toRow = (o: Order): Row => ({
  id:          o.id,
  orderNumber: o.orderNumber,
  client:      o.user?.fullName || o.deliveryAddress?.fullName || '—',
  phone:       o.deliveryAddress?.phone || o.user?.phone || '—',
  product:     (o.items || []).map((it) => `${new Intl.NumberFormat('fr-FR').format(it.quantity)} × ${it.productName}`).join(', '),
  total:       o.total || 0,
  status:      o.status,
  payment:     o.paymentMethod,
  paymentStatus: o.paymentStatus,
  date:        new Date(o.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
  zone:        o.deliveryAddress?.city || '—',
  batUrl:      o.batUrl,
  batVersoUrl: o.batVersoUrl,
  batStatus:   o.batStatus,
  batNotes:    o.batNotes,
  batApprovedAt: o.batApprovedAt,
  batRejectedReason: o.batRejectedReason,
  batCorrectionFileUrl: o.batCorrectionFileUrl,
  whiteLabelSender: o.whiteLabel ? o.whiteLabelSender : null,
})

function BatBadge({ o }: { o: Row }) {
  if (o.batStatus === 'approved') return <span className="badge text-bg-success d-inline-flex align-items-center gap-1"><CheckCircle2 size={11} /> Validé</span>
  if (o.batStatus === 'rejected') return <span className="badge text-bg-warning d-inline-flex align-items-center gap-1"><AlertTriangle size={11} /> À corriger</span>
  if (o.batUrl || o.status === 'bat_pending') return <span className="badge text-bg-info d-inline-flex align-items-center gap-1"><ShieldCheck size={11} /> En attente</span>
  return <span className="small text-secondary">Non déposé</span>
}

export default function AdminCommandesPage() {
  return (
    <Suspense fallback={<div className="text-center text-secondary py-5"><Spinner className="me-2" />Chargement…</div>}>
      <CommandesContent />
    </Suspense>
  )
}

function CommandesContent() {
  const router = useRouter()
  const params = useSearchParams()
  const status = params.get('status') || 'all'
  const bat = params.get('bat') || ''

  const [orders,    setOrders]    = useState<Row[]>([])
  const [total,     setTotal]     = useState(0)
  const [page,      setPage]      = useState(1)
  const [counts,    setCounts]    = useState<Record<string, number> | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  // ?q= : ouverture directe d'une commande depuis le tableau de bord
  const [search,    setSearch]    = useState(() => params.get('q') || '')
  const [selected,  setSelected]  = useState<string[]>([])
  const [bulkSaving, setBulkSaving] = useState(false)

  // Modale BAT
  const [batModalOrder, setBatModalOrder] = useState<Row | null>(null)
  const [batUrlInput, setBatUrlInput] = useState('')
  const [batVersoUrlInput, setBatVersoUrlInput] = useState('')
  const [batNotesInput, setBatNotesInput] = useState('')
  const [uploadingBat, setUploadingBat] = useState(false)
  const [savingBat, setSavingBat] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [res, stats] = await Promise.all([
        adminOrdersService.getAll({
          status, batStatus: bat || undefined, page, limit: PAGE_SIZE, search: search.trim() || undefined,
        }),
        adminOrdersService.getStats(30),
      ])
      setOrders(res.data.map(toRow))
      setTotal(res.total)
      setCounts(stats.statusCounts)
      setSelected([])
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger les commandes')
    } finally {
      setLoading(false)
    }
  }, [status, bat, page, search])

  // Recherche côté API, avec un léger délai pendant la frappe
  useEffect(() => {
    const t = setTimeout(loadOrders, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [loadOrders, search])

  const setFilter = (next: { status?: string; bat?: string }) => {
    const q = new URLSearchParams()
    if (next.status && next.status !== 'all') q.set('status', next.status)
    if (next.bat) q.set('bat', next.bat)
    const qs = q.toString()
    setPage(1)
    router.replace(`/admin/commandes${qs ? `?${qs}` : ''}`)
  }

  const applyBulkStatus = async (newStatus: string) => {
    if (!newStatus || !selected.length) return
    if (!window.confirm(`Passer ${selected.length} commande(s) au statut « ${ORDER_STATUS[newStatus]?.label} » ? Les clients concernés sont prévenus par email.`)) return
    setBulkSaving(true)
    const results = await Promise.allSettled(selected.map((id) => adminOrdersService.updateStatus(id, newStatus)))
    setBulkSaving(false)
    const failed = results.filter((r) => r.status === 'rejected').length
    if (failed) setError(`${failed} commande(s) n'ont pas pu être mises à jour.`)
    loadOrders()
  }

  const openBatModal = (order: Row) => {
    setBatModalOrder(order)
    setBatUrlInput(order.batUrl || '')
    setBatVersoUrlInput(order.batVersoUrl || '')
    setBatNotesInput(order.batNotes || '')
    setFeedbackMsg(null)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isVerso = false) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadingBat(true)
    try {
      const url = await uploadMedia(file, 'bat')
      if (isVerso) setBatVersoUrlInput(url)
      else setBatUrlInput(url)
      setFeedbackMsg({ type: 'success', text: 'Maquette BAT chargée.' })
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Erreur lors du chargement du fichier.' })
    } finally {
      setUploadingBat(false)
    }
  }

  const handleSaveBat = async () => {
    if (!batModalOrder) return
    if (!batUrlInput.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Veuillez saisir ou envoyer l\'épreuve BAT.' })
      return
    }
    setSavingBat(true)
    setFeedbackMsg(null)
    try {
      const updated: Order = await adminOrdersService.uploadBat(batModalOrder.id, {
        batUrl: batUrlInput.trim(),
        batVersoUrl: batVersoUrlInput.trim() || undefined,
        batNotes: batNotesInput.trim() || undefined,
      })
      setOrders((prev) => prev.map((o) => (o.id === batModalOrder.id ? toRow(updated) : o)))
      setFeedbackMsg({ type: 'success', text: 'BAT envoyé au client ! Statut passé à « BAT à valider ».' })
      setTimeout(() => setBatModalOrder(null), 1200)
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Impossible d\'enregistrer le BAT.' })
    } finally {
      setSavingBat(false)
    }
  }

  const closeBat = useCallback(() => { if (!savingBat) setBatModalOrder(null) }, [savingBat])
  const toggleSelect = (id: string) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])
  const toggleAll = () => setSelected(selected.length === orders.length ? [] : orders.map((o) => o.id))

  const pages = Math.max(Math.ceil(total / PAGE_SIZE), 1)
  const filterLabel = bat === 'rejected' ? 'BAT à corriger' : bat === 'pending' ? 'BAT en attente du client' : ORDER_STATUS[status]?.label

  return (
    <>
      {/* ── Compteurs par statut (filtre rapide) ── */}
      <div className="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Filtrer par statut">
        {Object.entries(ORDER_STATUS).filter(([k]) => k !== 'refunded').map(([key, { label }]) => {
          const active = status === key
          return (
            <button key={key} type="button" onClick={() => setFilter({ status: active ? 'all' : key })} aria-pressed={active}
              className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline-secondary'} d-inline-flex align-items-center gap-2`}>
              {label}
              <span className={`badge rounded-pill ${active ? 'text-bg-light' : 'text-bg-secondary'} tabular-nums`}>{counts ? counts[key] ?? 0 : '…'}</span>
            </button>
          )
        })}
      </div>

      <ErrorAlert message={error} onRetry={loadOrders} />

      <Card title="Commandes" icon={<ShoppingCart size={18} />} noPadding
        tools={
          <>
            <div className="input-group input-group-sm" style={{ width: 280 }}>
              <span className="input-group-text"><Search size={13} /></span>
              <input placeholder="N° commande, nom, email ou téléphone…" aria-label="Rechercher une commande" className="form-control"
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
            </div>
            {(status !== 'all' || bat) && (
              <button type="button" onClick={() => setFilter({})} aria-label="Retirer le filtre" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 text-nowrap">
                {filterLabel} <X size={13} />
              </button>
            )}
            <button type="button" onClick={loadOrders} className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" aria-label="Actualiser">
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
            <ExportButton kind="orders" />
          </>
        }
        footer={
          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <small className="text-secondary">{total} commande(s)</small>
            <Pager page={page} pages={pages} onChange={setPage} />
          </div>
        }>
        {selected.length > 0 && (
          <div className="d-flex align-items-center gap-2 px-3 py-2 bg-primary-subtle border-bottom">
            <span className="small fw-semibold">{selected.length} sélectionnée(s)</span>
            <select value="" disabled={bulkSaving} onChange={(e) => applyBulkStatus(e.target.value)}
              aria-label="Changer le statut des commandes sélectionnées" className="form-select form-select-sm" style={{ width: 'auto' }}>
              <option value="">{bulkSaving ? 'Mise à jour…' : 'Changer le statut…'}</option>
              {Object.entries(ORDER_STATUS).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </div>
        )}
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input type="checkbox" className="form-check-input" aria-label="Tout sélectionner"
                    checked={selected.length === orders.length && orders.length > 0} onChange={toggleAll} />
                </th>
                <th>Commande</th><th>Client</th><th>Articles</th><th>Paiement</th><th>Total</th><th>Statut</th><th>BAT</th><th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !orders.length ? <LoadingRow colSpan={9} /> : !orders.length ? (
                <TableMessage colSpan={9}>
                  {search || status !== 'all' || bat ? 'Aucune commande ne correspond à ces critères.' : 'Aucune commande pour le moment.'}
                </TableMessage>
              ) : orders.map((o) => (
                <tr key={o.id} className={selected.includes(o.id) ? 'table-active' : ''}>
                  <td>
                    <input type="checkbox" className="form-check-input" checked={selected.includes(o.id)} aria-label={`Sélectionner ${o.orderNumber}`}
                      onChange={() => toggleSelect(o.id)} />
                  </td>
                  <td className="text-nowrap">
                    <div className="font-mono small fw-semibold">{o.orderNumber}</div>
                    <small className="text-secondary">{o.date}</small>
                  </td>
                  <td className="text-nowrap">
                    <div className="fw-semibold">{o.client}</div>
                    <small className="text-secondary">{o.phone} · {o.zone}</small>
                    {o.whiteLabelSender && (
                      <div>
                        <span className="badge text-bg-dark"
                          title={`Colis neutre — expéditeur : ${o.whiteLabelSender.companyName}, ${o.whiteLabelSender.address}, ${o.whiteLabelSender.phone}${o.whiteLabelSender.includeInvoice ? ' — facture du revendeur à joindre' : ''}`}>
                          Marque blanche · {o.whiteLabelSender.companyName}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="small text-secondary text-truncate" style={{ maxWidth: 220 }} title={o.product}>{o.product}</td>
                  <td className="text-nowrap">
                    <span className="badge text-bg-light">{PAYMENT_METHOD[o.payment || '']?.label || '—'}</span>
                    {o.paymentStatus && o.paymentStatus !== 'paid' && (
                      <div className={`small ${o.paymentStatus === 'failed' ? 'text-danger' : 'text-secondary'}`}>
                        {o.paymentStatus === 'failed' ? 'Échec du paiement' : 'Non payée'}
                      </div>
                    )}
                  </td>
                  <td className="fw-semibold tabular-nums text-nowrap">{fcfa(o.total)}</td>
                  <td><OrderStatusBadge status={o.status} /></td>
                  <td className="text-nowrap"><BatBadge o={o} /></td>
                  <td className="text-end text-nowrap">
                    <button type="button" onClick={() => openBatModal(o)} title={o.batUrl ? 'Gérer le BAT' : 'Déposer le BAT'}
                      aria-label={`${o.batUrl ? 'Gérer' : 'Déposer'} le BAT de ${o.orderNumber}`}
                      className={`btn btn-sm ${o.batUrl ? 'btn-outline-primary' : 'btn-primary'} d-inline-flex align-items-center gap-1`}>
                      <ShieldCheck size={13} /> BAT
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Modale de gestion du BAT ── */}
      <Modal open={!!batModalOrder} size="lg" onClose={closeBat}
        title={batModalOrder && (
          <span className="d-inline-flex align-items-center gap-2">
            <ShieldCheck size={18} /> Bon à tirer — <span className="font-mono">{batModalOrder.orderNumber || batModalOrder.id}</span>
          </span>
        )}
        footer={
          <>
            <button type="button" onClick={closeBat} className="btn btn-outline-secondary">Fermer</button>
            <button type="button" onClick={handleSaveBat} disabled={savingBat || uploadingBat} className="btn btn-primary d-inline-flex align-items-center gap-2">
              {savingBat ? <Spinner /> : <Send size={14} />} Envoyer le BAT au client
            </button>
          </>
        }>
        {batModalOrder && (
          <>
            <div className="d-flex align-items-center justify-content-between gap-3 border rounded p-2 mb-3 bg-body-tertiary small">
              <div className="min-w-0">
                <div className="fw-semibold">{batModalOrder.client}</div>
                <div className="text-secondary text-truncate">{batModalOrder.product}</div>
              </div>
              <OrderStatusBadge status={batModalOrder.status} />
            </div>

            {batModalOrder.batStatus === 'approved' && (
              <div className="callout callout-success small">
                <div className="fw-semibold d-flex align-items-center gap-1"><CheckCircle2 size={15} /> BAT approuvé et signé par le client</div>
                Épreuve validée pour impression le {batModalOrder.batApprovedAt ? new Date(batModalOrder.batApprovedAt).toLocaleDateString('fr-FR') : 'récemment'}.
              </div>
            )}

            {batModalOrder.batStatus === 'rejected' && (
              <div className="callout callout-warning small">
                <div className="fw-semibold d-flex align-items-center gap-1 mb-1"><AlertTriangle size={15} /> Le client a demandé des modifications :</div>
                <blockquote className="fst-italic bg-body border rounded p-2 mb-2">&ldquo;{batModalOrder.batRejectedReason || 'Corrections demandées.'}&rdquo;</blockquote>
                {batModalOrder.batCorrectionFileUrl && (
                  <a href={batModalOrder.batCorrectionFileUrl} target="_blank" rel="noreferrer" className="d-inline-flex align-items-center gap-1 fw-semibold">
                    <Download size={13} /> Télécharger le fichier correctif fourni par le client
                  </a>
                )}
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="bat-recto" className="form-label">Épreuve BAT (recto ou principale) <span className="text-danger">*</span></label>
              <div className="input-group">
                <input id="bat-recto" type="url" className="form-control font-mono small" value={batUrlInput}
                  onChange={(e) => setBatUrlInput(e.target.value)} placeholder="https://res.cloudinary.com/.../bat-recto.png" />
                <label className="btn btn-outline-secondary d-inline-flex align-items-center gap-1 mb-0">
                  <UploadCloud size={14} /> Envoyer
                  <input type="file" onChange={(e) => handleFileUpload(e, false)} accept="image/png,image/jpeg,.pdf" className="d-none" />
                </label>
              </div>
              {uploadingBat && <div className="form-text d-flex align-items-center gap-1"><Spinner /> Envoi vers Cloudinary…</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="bat-verso" className="form-label">Épreuve BAT (verso, facultatif)</label>
              <div className="input-group">
                <input id="bat-verso" type="url" className="form-control font-mono small" value={batVersoUrlInput}
                  onChange={(e) => setBatVersoUrlInput(e.target.value)} placeholder="https://res.cloudinary.com/.../bat-verso.png" />
                <label className="btn btn-outline-secondary d-inline-flex align-items-center gap-1 mb-0">
                  <UploadCloud size={14} /> Envoyer
                  <input type="file" onChange={(e) => handleFileUpload(e, true)} accept="image/png,image/jpeg,.pdf" className="d-none" />
                </label>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="bat-notes" className="form-label">Consignes et notes pré-presse pour le client</label>
              <textarea id="bat-notes" rows={3} className="form-control" value={batNotesInput} onChange={(e) => setBatNotesInput(e.target.value)}
                placeholder="Ex : bords perdus ajustés de 3 mm. Vérifiez attentivement l'orthographe du numéro de téléphone avant validation…" />
            </div>

            {batUrlInput && (
              <div className="d-flex align-items-center justify-content-between gap-2 small border rounded p-2 mb-3">
                <span className="text-secondary text-truncate">Aperçu : {batUrlInput}</span>
                <a href={batUrlInput} target="_blank" rel="noreferrer" className="d-inline-flex align-items-center gap-1 fw-semibold flex-shrink-0">
                  <ExternalLink size={13} /> Tester le lien
                </a>
              </div>
            )}

            {feedbackMsg && (
              <div role={feedbackMsg.type === 'error' ? 'alert' : 'status'} className={`alert ${feedbackMsg.type === 'success' ? 'alert-success' : 'alert-danger'} py-2 mb-0`}>
                {feedbackMsg.text}
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  )
}
