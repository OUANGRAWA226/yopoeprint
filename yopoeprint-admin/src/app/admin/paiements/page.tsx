'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, RefreshCw, CheckCircle2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { adminAuthService } from '@/lib/auth-admin.service'
import { supervisionService, PaymentsOverview, PaymentIssue, PaymentEvent } from '@/lib/supervision.service'

const fcfa = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n || 0)} FCFA`
const input = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-mid'

const REASON: Record<PaymentIssue['reason'], { label: string; cls: string; hint: string }> = {
  stale:    { label: 'En attente', cls: 'bg-amber-50 text-amber-800', hint: 'Paiement lancé il y a plus de 30 min, sans notification de CinetPay.' },
  failed:   { label: 'Échoué',     cls: 'bg-red-50 text-red-700',     hint: 'Refusé par CinetPay : le client peut relancer le paiement.' },
  transfer: { label: 'Virement',   cls: 'bg-blue-50 text-blue-800',   hint: 'À rapprocher du relevé bancaire puis marquer payé.' },
}

const EVENT: Record<string, { label: string; cls: string }> = {
  init:                { label: 'Paiement lancé',         cls: 'bg-gray-100 text-gray-700' },
  init_failed:         { label: 'Lancement refusé',       cls: 'bg-red-50 text-red-700' },
  paid:                { label: 'Payé (CinetPay)',        cls: 'bg-emerald-50 text-emerald-800' },
  manual_paid:         { label: 'Encaissé (manuel)',      cls: 'bg-emerald-50 text-emerald-800' },
  refused:             { label: 'Refusé',                 cls: 'bg-red-50 text-red-700' },
  pending:             { label: 'Toujours en attente',    cls: 'bg-amber-50 text-amber-800' },
  amount_mismatch:     { label: 'Montant incohérent',     cls: 'bg-red-100 text-red-800' },
  check_failed:        { label: 'CinetPay injoignable',   cls: 'bg-amber-50 text-amber-800' },
  unknown_transaction: { label: 'Transaction inconnue',   cls: 'bg-red-100 text-red-800' },
  invalid_signature:   { label: 'Signature invalide',     cls: 'bg-red-100 text-red-800' },
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

  const pages = Math.max(Math.ceil((events?.total || 0) / PAGE_SIZE), 1)
  const cards: [string, string, string?][] = overview ? [
    ['Encaissé sur 7 jours', fcfa(overview.paidAmount7d), `${overview.paidCount7d} paiement(s)`],
    ['Virements à encaisser', String(overview.transfers)],
    ['Paiements en attente', String(overview.stale), 'plus de 30 min'],
    ['Paiements échoués', String(overview.failed), '30 derniers jours'],
    ['Anomalies (7 jours)', String(overview.anomalies7d), 'montant, signature, transaction'],
  ] : []

  return (
    <div className="max-w-6xl space-y-5">
      <p className="text-sm text-gray-600 max-w-3xl">
        Rapprochement des paiements CinetPay et des encaissements hors ligne. Revérifiez un paiement resté en attente
        (notification perdue) ou enregistrez un virement reçu.
      </p>

      {error && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
      {notice && <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">{notice}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {overview === null
          ? [0, 1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-2xl bg-white border border-gray-100 animate-pulse" />)
          : cards.map(([label, value, sub]) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl shadow-card p-4">
              <p className="text-xs text-gray-600">{label}</p>
              <p className="font-display text-xl font-bold text-blue-deep tabular-nums mt-1">{value}</p>
              {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
            </div>
          ))}
      </div>

      <section className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
        <h2 className="px-5 py-3 border-b border-gray-100 font-bold text-sm text-gray-900">À traiter</h2>
        {issues === null ? (
          <div className="p-8 text-center text-gray-500 text-sm"><Loader2 className="animate-spin mx-auto mb-2 text-blue-mid" size={20} />Chargement…</div>
        ) : issues.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-600">Aucun paiement en attente de traitement.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Commande</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Montant</th>
                  <th className="px-4 py-3">Situation</th><th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {issues.map((i) => (
                  <tr key={`${i.reason}-${i.orderId}`} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-mono font-bold text-gray-900">{i.orderNumber}</p>
                      <p className="text-xs text-gray-500">{new Date(i.createdAt).toLocaleString('fr-FR')}</p>
                    </td>
                    <td className="px-4 py-3"><p className="text-gray-900">{i.customer}</p><p className="text-xs text-gray-500">{i.email}</p></td>
                    <td className="px-4 py-3 font-bold tabular-nums whitespace-nowrap">{fcfa(i.total)}</td>
                    <td className="px-4 py-3 max-w-[260px]">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${REASON[i.reason].cls}`}>{REASON[i.reason].label}</span>
                      <p className="text-xs text-gray-600 mt-1">{REASON[i.reason].hint}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-end gap-1.5">
                        {i.transactionId && !i.transactionId.startsWith('MANUEL:') && (
                          <button onClick={() => recheck(i)} disabled={busy === i.orderId}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap">
                            {busy === i.orderId ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Revérifier CinetPay
                          </button>
                        )}
                        {isManager && i.reason !== 'stale' && (
                          <button onClick={() => { setReference(''); setMarking(i) }} disabled={busy === i.orderId}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-deep text-white text-xs font-bold hover:bg-blue-mid disabled:opacity-50 whitespace-nowrap">
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
        )}
      </section>

      <section className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold text-sm text-gray-900">Journal des paiements</h2>
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1) }} aria-label="Filtrer le journal"
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="">Tous les évènements</option>
            {Object.entries(EVENT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Date</th><th className="px-4 py-3">Évènement</th><th className="px-4 py-3">Commande</th>
                <th className="px-4 py-3">Montant</th><th className="px-4 py-3">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!events ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Chargement…</td></tr>
              ) : events.data.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Aucun évènement.</td></tr>
              ) : events.data.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap">{new Date(e.createdAt).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${(EVENT[e.type] || EVENT.init).cls}`}>{EVENT[e.type]?.label || e.type}</span></td>
                  <td className="px-4 py-2.5 font-mono text-xs">{e.orderNumber || '—'}<span className="block text-gray-500">{e.transactionId}</span></td>
                  <td className="px-4 py-2.5 tabular-nums whitespace-nowrap">{e.amount !== null ? fcfa(e.amount) : '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-700">
                    {e.message || '—'}
                    {e.actorEmail && <span className="block text-gray-500">par {e.actorEmail}</span>}
                    <span className="block text-gray-400">{e.source === 'webhook' ? 'notification CinetPay' : e.source === 'admin' ? 'admin' : 'client'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
          <span>{events?.total ?? 0} évènement(s){pages > 1 ? ` · page ${page} / ${pages}` : ''}</span>
          {pages > 1 && (
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page <= 1} aria-label="Page précédente" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 disabled:opacity-40"><ChevronLeft size={15} /></button>
              <button onClick={() => setPage((p) => Math.min(p + 1, pages))} disabled={page >= pages} aria-label="Page suivante" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 disabled:opacity-40"><ChevronRight size={15} /></button>
            </div>
          )}
        </div>
      </section>

      {marking && (
        <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto" onClick={() => !busy && setMarking(null)}>
          <div className="min-h-full flex items-center justify-center p-4">
            <form onSubmit={markPaid} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="mark-paid-title"
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 id="mark-paid-title" className="font-display text-lg font-bold text-blue-deep">Enregistrer l&apos;encaissement</h2>
                <button type="button" onClick={() => setMarking(null)} aria-label="Fermer" className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"><X size={16} /></button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-700">
                  Commande <strong className="font-mono">{marking.orderNumber}</strong> — {marking.customer} — <strong>{fcfa(marking.total)}</strong>.
                  Ne confirmez qu&apos;après avoir constaté l&apos;encaissement du montant complet.
                </p>
                <label className="text-xs font-semibold text-gray-700 space-y-1 block">
                  <span>Référence de l&apos;encaissement * (banque, date, n° d&apos;opération…)</span>
                  <input required minLength={3} maxLength={120} autoFocus className={input} value={reference} onChange={(e) => setReference(e.target.value)}
                    placeholder="Virement BOA du 18/10, réf. 4521" />
                </label>
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                <button type="button" onClick={() => setMarking(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold">Annuler</button>
                <button type="submit" disabled={!!busy} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-deep text-white text-sm font-bold hover:bg-blue-mid disabled:opacity-60">
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Confirmer le paiement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
