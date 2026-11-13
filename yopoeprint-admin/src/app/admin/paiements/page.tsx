'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, CheckCircle2, Wallet, Landmark, Clock, XCircle, ShieldAlert, ListChecks, ScrollText } from 'lucide-react'
import { adminAuthService } from '@/lib/auth-admin.service'
import { supervisionService, PaymentsOverview, PaymentIssue, PaymentEvent } from '@/lib/supervision.service'
import { Card, ErrorAlert, InfoBox, LoadingRow, Modal, Pager, Spinner, TableMessage } from '@/components/ui'
import { fcfa } from '@/components/status'

const REASON: Record<PaymentIssue['reason'], { label: string; badge: string; hint: string }> = {
  stale:    { label: 'En attente', badge: 'text-bg-warning', hint: 'Paiement lancé il y a plus de 30 min, sans notification de CinetPay.' },
  failed:   { label: 'Échoué',     badge: 'text-bg-danger',  hint: 'Refusé par CinetPay : le client peut relancer le paiement.' },
  transfer: { label: 'Virement',   badge: 'text-bg-info',    hint: 'À rapprocher du relevé bancaire puis marquer payé.' },
}

const EVENT: Record<string, { label: string; badge: string }> = {
  init:                { label: 'Paiement lancé',       badge: 'text-bg-light' },
  init_failed:         { label: 'Lancement refusé',     badge: 'text-bg-danger' },
  paid:                { label: 'Payé (CinetPay)',      badge: 'text-bg-success' },
  manual_paid:         { label: 'Encaissé (manuel)',    badge: 'text-bg-success' },
  refused:             { label: 'Refusé',               badge: 'text-bg-danger' },
  pending:             { label: 'Toujours en attente',  badge: 'text-bg-warning' },
  amount_mismatch:     { label: 'Montant incohérent',   badge: 'text-bg-danger' },
  check_failed:        { label: 'CinetPay injoignable', badge: 'text-bg-warning' },
  unknown_transaction: { label: 'Transaction inconnue', badge: 'text-bg-danger' },
  invalid_signature:   { label: 'Signature invalide',   badge: 'text-bg-danger' },
  duplicate_payment:   { label: 'Payé deux fois',       badge: 'text-bg-danger' },
}

const RESULT: Record<string, string> = {
  success: 'Paiement confirmé : la commande est payée.',
  pending: 'CinetPay indique que le paiement est toujours en attente.',
  failed: 'CinetPay indique que le paiement a été refusé.',
  amount_mismatch: 'Montant payé différent de la commande : commande non confirmée, à vérifier.',
  check_failed: 'CinetPay ne répond pas : réessayez dans un instant.',
  already_paid: 'La commande était déjà payée.',
}

const PAGE_SIZE = 30

export default function PaiementsPage() {
  const isManager = ['superadmin', 'admin'].includes(String(adminAuthService.getCurrentUser()?.role || '').toLowerCase())
  const [overview, setOverview] = useState<PaymentsOverview | null>(null)
  const [issues, setIssues] = useState<PaymentIssue[] | null>(null)
  const [events, setEvents] = useState<{ data: PaymentEvent[]; total: number } | null>(null)
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [marking, setMarking] = useState<PaymentIssue | null>(null)
  const [reference, setReference] = useState('')

  const loadTop = useCallback(async () => {
    try {
      const [o, i] = await Promise.all([supervisionService.paymentsOverview(), supervisionService.paymentIssues()])
      setOverview(o); setIssues(i); setError('')
    } catch (e: any) { setError(e?.message || 'Impossible de charger les paiements') }
  }, [])

  const loadEvents = useCallback(async () => {
    try { setEvents(await supervisionService.paymentEvents({ type: type || undefined, page, limit: PAGE_SIZE })) }
    catch (e: any) { setError(e?.message || 'Impossible de charger le journal') }
  }, [type, page])

  useEffect(() => { loadTop() }, [loadTop])
  useEffect(() => { loadEvents() }, [loadEvents])

  const recheck = async (i: PaymentIssue) => {
    setBusy(i.orderId); setError(''); setNotice('')
    try {
      const r = await supervisionService.recheckPayment(i.orderId)
      setNotice(`${i.orderNumber} — ${RESULT[r.status] || r.status}`)
      await Promise.all([loadTop(), loadEvents()])
    } catch (e: any) { setError(e?.message || 'Vérification impossible') } finally { setBusy(null) }
  }

  const markPaid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!marking) return
    setBusy(marking.orderId); setError(''); setNotice('')
    try {
      await supervisionService.markPaid(marking.orderId, reference.trim())
      setNotice(`${marking.orderNumber} — encaissement enregistré, la commande est payée.`)
      setMarking(null); setReference('')
      await Promise.all([loadTop(), loadEvents()])
    } catch (err: any) { setError(err?.message || 'Enregistrement impossible') } finally { setBusy(null) }
  }

  const closeMarking = useCallback(() => { if (!busy) setMarking(null) }, [busy])
  const pages = Math.max(Math.ceil((events?.total || 0) / PAGE_SIZE), 1)
  const v = (n: number | undefined) => (overview ? n ?? 0 : '…')

  return (
    <>
      <div className="callout callout-info mb-3">
        Rapprochement des paiements CinetPay et des encaissements hors ligne. Revérifiez un paiement resté en attente
        (notification perdue) ou enregistrez un virement reçu.
      </div>

      <ErrorAlert message={error} />
      {notice && <div role="status" className="alert alert-success">{notice}</div>}

      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-5">
        <div className="col">
          <InfoBox icon={<Wallet />} color="success" label="Encaissé sur 7 jours" value={overview ? fcfa(overview.paidAmount7d) : '…'}>
            {overview && <span className="progress-description small text-secondary">{overview.paidCount7d} paiement(s)</span>}
          </InfoBox>
        </div>
        <div className="col"><InfoBox icon={<Landmark />} color="info" label="Virements à encaisser" value={v(overview?.transfers)} /></div>
        <div className="col"><InfoBox icon={<Clock />} color="warning" label="En attente (+30 min)" value={v(overview?.stale)} /></div>
        <div className="col"><InfoBox icon={<XCircle />} color="danger" label="Échoués (30 jours)" value={v(overview?.failed)} /></div>
        <div className="col"><InfoBox icon={<ShieldAlert />} color="secondary" label="Anomalies (7 jours)" value={v(overview?.anomalies7d)} /></div>
      </div>

      <Card title="À traiter" icon={<ListChecks size={18} />} variant="warning" noPadding>
        <div className="table-responsive">
          <table className="table table-striped align-middle mb-0">
            <thead><tr><th>Commande</th><th>Client</th><th>Montant</th><th>Situation</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
              {issues === null ? <LoadingRow colSpan={5} /> : issues.length === 0 ? (
                <TableMessage colSpan={5}>Aucun paiement en attente de traitement.</TableMessage>
              ) : issues.map((i) => (
                <tr key={`${i.reason}-${i.orderId}`}>
                  <td>
                    <div className="font-mono fw-semibold">{i.orderNumber}</div>
                    <small className="text-secondary">{new Date(i.createdAt).toLocaleString('fr-FR')}</small>
                  </td>
                  <td><div>{i.customer}</div><small className="text-secondary">{i.email}</small></td>
                  <td className="fw-semibold tabular-nums text-nowrap">{fcfa(i.total)}</td>
                  <td style={{ maxWidth: 280 }}>
                    <span className={`badge ${REASON[i.reason].badge}`}>{REASON[i.reason].label}</span>
                    <div className="small text-secondary mt-1">{REASON[i.reason].hint}</div>
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex flex-column align-items-end gap-1">
                      {i.transactionId && !i.transactionId.startsWith('MANUEL:') && (
                        <button type="button" onClick={() => recheck(i)} disabled={busy === i.orderId}
                          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 text-nowrap">
                          {busy === i.orderId ? <Spinner /> : <RefreshCw size={13} />} Revérifier CinetPay
                        </button>
                      )}
                      {isManager && i.reason !== 'stale' && (
                        <button type="button" onClick={() => { setReference(''); setMarking(i) }} disabled={busy === i.orderId}
                          className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 text-nowrap">
                          <CheckCircle2 size={13} /> Marquer payé
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Journal des paiements" icon={<ScrollText size={18} />} noPadding
        tools={
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1) }} aria-label="Filtrer le journal"
            className="form-select form-select-sm" style={{ width: 'auto' }}>
            <option value="">Tous les évènements</option>
            {Object.entries(EVENT).map(([k, ev]) => <option key={k} value={k}>{ev.label}</option>)}
          </select>
        }
        footer={
          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <small className="text-secondary">{events?.total ?? 0} évènement(s)</small>
            <Pager page={page} pages={pages} onChange={setPage} />
          </div>
        }>
        <div className="table-responsive">
          <table className="table table-sm table-striped align-middle mb-0">
            <thead><tr><th className="ps-3">Date</th><th>Évènement</th><th>Commande</th><th>Montant</th><th>Détail</th></tr></thead>
            <tbody>
              {!events ? <LoadingRow colSpan={5} /> : events.data.length === 0 ? (
                <TableMessage colSpan={5}>Aucun évènement.</TableMessage>
              ) : events.data.map((e) => (
                <tr key={e.id}>
                  <td className="ps-3 small text-secondary text-nowrap">{new Date(e.createdAt).toLocaleString('fr-FR')}</td>
                  <td><span className={`badge ${(EVENT[e.type] || EVENT.init).badge}`}>{EVENT[e.type]?.label || e.type}</span></td>
                  <td className="font-mono small">{e.orderNumber || '—'}<div className="text-secondary">{e.transactionId}</div></td>
                  <td className="tabular-nums text-nowrap">{e.amount !== null ? fcfa(e.amount) : '—'}</td>
                  <td className="small">
                    {e.message || '—'}
                    {e.actorEmail && <div className="text-secondary">par {e.actorEmail}</div>}
                    <div className="text-secondary opacity-75">{e.source === 'webhook' ? 'notification CinetPay' : e.source === 'admin' ? 'admin' : 'client'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!marking} title="Enregistrer l'encaissement" onClose={closeMarking}
        footer={
          <>
            <button type="button" onClick={closeMarking} className="btn btn-outline-secondary">Annuler</button>
            <button type="submit" form="mark-paid-form" disabled={!!busy} className="btn btn-primary d-inline-flex align-items-center gap-2">
              {busy ? <Spinner /> : <CheckCircle2 size={15} />} Confirmer le paiement
            </button>
          </>
        }>
        {marking && (
          <form id="mark-paid-form" onSubmit={markPaid}>
            <p>
              Commande <strong className="font-mono">{marking.orderNumber}</strong> — {marking.customer} — <strong>{fcfa(marking.total)}</strong>.
            </p>
            <div className="callout callout-warning small">Ne confirmez qu&apos;après avoir constaté l&apos;encaissement du montant complet.</div>
            <label htmlFor="ref" className="form-label">Référence de l&apos;encaissement * <small className="text-secondary">(banque, date, n° d&apos;opération…)</small></label>
            <input id="ref" required minLength={3} maxLength={120} autoFocus className="form-control" value={reference}
              onChange={(e) => setReference(e.target.value)} placeholder="Virement BOA du 18/10, réf. 4521" />
          </form>
        )}
      </Modal>
    </>
  )
}
