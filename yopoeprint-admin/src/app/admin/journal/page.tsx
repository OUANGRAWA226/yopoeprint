'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { platformService, AuditEntry, ROLE_LABELS } from '@/lib/platform.service'

const ACTION_LABELS: Record<string, string> = {
  'product.create': 'Produit créé',
  'product.update': 'Produit modifié',
  'product.delete': 'Produit retiré',
  'product.image': 'Image produit',
  'product.toggle': 'Produit activé/désactivé',
  'order.status': 'Statut de commande',
  'order.bat': 'BAT déposé',
  'quote.status': 'Devis mis à jour',
  'user.update': 'Client modifié',
  'reseller.decide': 'Décision revendeur',
  'team.create': 'Membre ajouté',
  'team.role': 'Rôle modifié',
  'team.active': 'Membre activé/désactivé',
  'settings.update': 'Paramètres modifiés',
}

const FILTERS = [
  { id: '', label: 'Toutes les actions' },
  { id: 'settings', label: 'Paramètres' },
  { id: 'team', label: 'Équipe' },
  { id: 'product', label: 'Produits' },
  { id: 'order', label: 'Commandes' },
  { id: 'quote', label: 'Devis' },
  { id: 'reseller', label: 'Revendeurs' },
  { id: 'user', label: 'Clients' },
]

const PAGE_SIZE = 50

// Résumé lisible des données envoyées (sans les objets volumineux)
function summary(details: AuditEntry['details']) {
  if (!details) return '—'
  return Object.entries(details)
    .filter(([, v]) => v !== null && v !== undefined && typeof v !== 'object')
    .slice(0, 4)
    .map(([k, v]) => `${k} : ${String(v)}`)
    .join(' · ') || 'Données détaillées'
}

export default function JournalPage() {
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await platformService.auditLogs({ action: filter || undefined, page, limit: PAGE_SIZE })
      setRows(r.data)
      setTotal(r.total)
      setError('')
    } catch (e: any) {
      setError(e?.message || 'Impossible de charger le journal')
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => { load() }, [load])

  const pages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  return (
    <div className="max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">Actions sensibles réalisées depuis le back-office (les tentatives refusées ne sont pas inscrites).</p>
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1) }} aria-label="Filtrer par type d'action"
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
          {FILTERS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
      </div>

      {error && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3">Date</th><th className="px-4 py-3">Auteur</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Cible</th><th className="px-4 py-3">Détail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Chargement…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Aucune action enregistrée.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{new Date(r.createdAt).toLocaleString('fr-FR')}</td>
                <td className="px-4 py-3">
                  <p className="text-gray-900">{r.actorEmail || '—'}</p>
                  <p className="text-xs text-gray-500">{ROLE_LABELS[r.actorRole || ''] || r.actorRole}</p>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{ACTION_LABELS[r.action] || r.action}</td>
                <td className="px-4 py-3 text-xs text-gray-600 font-mono">{r.targetId ? `${r.targetType || ''} ${r.targetId.slice(0, 8)}` : '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-700 max-w-[360px]">
                  <button onClick={() => setOpen(open === r.id ? null : r.id)} className="text-left hover:underline" aria-expanded={open === r.id}>
                    {summary(r.details)}
                  </button>
                  {open === r.id && r.details && (
                    <pre className="mt-2 p-2 bg-gray-50 rounded-lg text-[11px] whitespace-pre-wrap break-all max-h-64 overflow-auto">{JSON.stringify(r.details, null, 2)}</pre>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
          <span>{total} action(s){pages > 1 ? ` · page ${page} / ${pages}` : ''}</span>
          {pages > 1 && (
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page <= 1} aria-label="Page précédente"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 disabled:opacity-40"><ChevronLeft size={15} /></button>
              <button onClick={() => setPage((p) => Math.min(p + 1, pages))} disabled={page >= pages} aria-label="Page suivante"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 disabled:opacity-40"><ChevronRight size={15} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
