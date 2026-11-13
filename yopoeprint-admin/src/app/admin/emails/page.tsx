'use client'

import { useCallback, useEffect, useState } from 'react'
import { Mail, Send, XCircle, FlaskConical } from 'lucide-react'
import { supervisionService, EmailLog } from '@/lib/supervision.service'
import { Card, ErrorAlert, InfoBox, LoadingRow, Pager, TableMessage } from '@/components/ui'

const TEMPLATES: Record<string, string> = {
  orderConfirmation: 'Confirmation de commande',
  orderStatusUpdate: 'Suivi de commande',
  batReady: 'BAT disponible',
  batApproved: 'BAT validé',
  batRejected: 'BAT refusé',
  quoteReceived: 'Devis reçu',
  quoteProposal: 'Proposition de devis',
  resellerApplicationReceived: 'Demande revendeur reçue',
  resellerApproved: 'Revendeur accepté',
  passwordReset: 'Mot de passe oublié',
  welcome: 'Bienvenue (inscription)',
}

const STATUS: Record<EmailLog['status'], { label: string; badge: string }> = {
  sent:      { label: 'Envoyé', badge: 'text-bg-success' },
  failed:    { label: 'Échec',  badge: 'text-bg-danger' },
  simulated: { label: 'Simulé', badge: 'text-bg-secondary' },
}

const PAGE_SIZE = 50

export default function EmailsPage() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<{ data: EmailLog[]; total: number; last7d: Record<string, number> } | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setResult(await supervisionService.emails({ status: status || undefined, page, limit: PAGE_SIZE }))
      setError('')
    } catch (e: any) { setError(e?.message || 'Impossible de charger le journal des emails') }
  }, [status, page])

  useEffect(() => { load() }, [load])

  const pages = Math.max(Math.ceil((result?.total || 0) / PAGE_SIZE), 1)
  const l7 = result?.last7d || {}

  return (
    <>
      <div className="row">
        <div className="col-md-4"><InfoBox icon={<Send />} color="success" label="Envoyés (7 jours)" value={result ? l7.sent || 0 : '…'} /></div>
        <div className="col-md-4"><InfoBox icon={<XCircle />} color="danger" label="En échec (7 jours)" value={result ? l7.failed || 0 : '…'} /></div>
        <div className="col-md-4"><InfoBox icon={<FlaskConical />} color="secondary" label="Simulés (7 jours)" value={result ? l7.simulated || 0 : '…'} /></div>
      </div>

      <ErrorAlert message={error} onRetry={load} />

      <Card title="Emails envoyés aux clients" icon={<Mail size={18} />} noPadding
        tools={
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} aria-label="Filtrer par statut"
            className="form-select form-select-sm" style={{ width: 'auto' }}>
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        }
        footer={
          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <small className="text-secondary">
              {result?.total ?? 0} email(s) · « Simulé » : l&apos;API n&apos;a pas de clé Resend, l&apos;email n&apos;est pas parti.
            </small>
            <Pager page={page} pages={pages} onChange={setPage} />
          </div>
        }>
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead><tr><th>Date</th><th>Destinataire</th><th>Email</th><th>Statut</th></tr></thead>
            <tbody>
              {!result ? <LoadingRow colSpan={4} /> : result.data.length === 0 ? (
                <TableMessage colSpan={4}>Aucun email enregistré.</TableMessage>
              ) : result.data.map((m) => (
                <tr key={m.id}>
                  <td className="small text-secondary text-nowrap">{new Date(m.createdAt).toLocaleString('fr-FR')}</td>
                  <td>{m.toEmail}</td>
                  <td>
                    <div className="fw-semibold">{TEMPLATES[m.template] || m.template}</div>
                    <small className="text-secondary">{m.subject}</small>
                  </td>
                  <td>
                    <span className={`badge ${STATUS[m.status]?.badge || 'text-bg-secondary'}`}>{STATUS[m.status]?.label || m.status}</span>
                    {m.error && <div className="small text-danger mt-1" style={{ maxWidth: 260 }}>{m.error}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
