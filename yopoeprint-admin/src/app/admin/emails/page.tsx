'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supervisionService, EmailLog } from '@/lib/supervision.service'

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
}

const STATUS: Record<EmailLog['status'], { label: string; cls: string }> = {
  sent:      { label: 'Envoyé',  cls: 'bg-emerald-50 text-emerald-800' },
  failed:    { label: 'Échec',   cls: 'bg-red-50 text-red-700' },
  simulated: { label: 'Simulé',  cls: 'bg-gray-100 text-gray-700' },
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
    <div className="max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600 max-w-2xl">
          Emails envoyés automatiquement aux clients. « Simulé » : l&apos;API n&apos;a pas de clé Resend, l&apos;email n&apos;est pas parti.
          {result && <> Sur 7 jours : <strong>{l7.sent || 0}</strong> envoyé(s), <strong className={l7.failed ? 'text-red-700' : ''}>{l7.failed || 0}</strong> en échec{l7.simulated ? <>, <strong>{l7.simulated}</strong> simulé(s)</> : null}.</>}
        </p>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} aria-label="Filtrer par statut"
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {error && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Date</th><th className="px-4 py-3">Destinataire</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!result ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-500">Chargement…</td></tr>
              ) : result.data.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-500">Aucun email enregistré.</td></tr>
              ) : result.data.map((m) => (
                <tr key={m.id} className="align-top">
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{new Date(m.createdAt).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3 text-gray-900">{m.toEmail}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{TEMPLATES[m.template] || m.template}</p>
                    <p className="text-xs text-gray-600">{m.subject}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS[m.status]?.cls || ''}`}>{STATUS[m.status]?.label || m.status}</span>
                    {m.error && <p className="text-xs text-red-700 mt-1 max-w-[260px]">{m.error}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
          <span>{result?.total ?? 0} email(s){pages > 1 ? ` · page ${page} / ${pages}` : ''}</span>
          {pages > 1 && (
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page <= 1} aria-label="Page précédente" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 disabled:opacity-40"><ChevronLeft size={15} /></button>
              <button onClick={() => setPage((p) => Math.min(p + 1, pages))} disabled={page >= pages} aria-label="Page suivante" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 disabled:opacity-40"><ChevronRight size={15} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
