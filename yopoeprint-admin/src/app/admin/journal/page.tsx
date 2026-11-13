'use client'

import { useCallback, useEffect, useState } from 'react'
import { History } from 'lucide-react'
import { platformService, AuditEntry, ROLE_LABELS } from '@/lib/platform.service'
import { Card, ErrorAlert, LoadingRow, Pager, TableMessage } from '@/components/ui'

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
  'banner.create': 'Bannière créée',
  'banner.update': 'Bannière modifiée',
  'banner.delete': 'Bannière supprimée',
  'banner.order': 'Carrousel réordonné',
  'promo.create': 'Code promo créé',
  'promo.update': 'Code promo modifié',
  'promo.delete': 'Code promo supprimé',
  'post.create': 'Article créé',
  'post.update': 'Article modifié',
  'post.delete': 'Article supprimé',
  'payment.recheck': 'Paiement revérifié',
  'payment.manual': 'Encaissement manuel',
  'export.orders': 'Export des commandes',
  'export.clients': 'Export des clients',
}

const FILTERS = [
  { id: '', label: 'Toutes les actions' },
  { id: 'settings', label: 'Paramètres' },
  { id: 'team', label: 'Équipe' },
  { id: 'product', label: 'Produits' },
  { id: 'banner', label: 'Bannières' },
  { id: 'promo', label: 'Codes promo' },
  { id: 'post', label: 'Blog' },
  { id: 'payment', label: 'Paiements' },
  { id: 'export', label: 'Exports' },
  { id: 'order', label: 'Commandes' },
  { id: 'quote', label: 'Devis' },
  { id: 'reseller', label: 'Revendeurs' },
  { id: 'user', label: 'Clients' },
]

// Couleur du badge selon le domaine de l'action
const DOMAIN_BADGE: Record<string, string> = {
  settings: 'text-bg-danger', team: 'text-bg-danger', export: 'text-bg-warning', payment: 'text-bg-warning',
  product: 'text-bg-primary', banner: 'text-bg-info', promo: 'text-bg-info', post: 'text-bg-info',
  order: 'text-bg-success', quote: 'text-bg-success', reseller: 'text-bg-secondary', user: 'text-bg-secondary',
}

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
    <>
      <ErrorAlert message={error} onRetry={load} />

      <Card title="Journal des actions" icon={<History size={18} />} noPadding
        tools={
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1) }} aria-label="Filtrer par type d'action"
            className="form-select form-select-sm" style={{ width: 'auto' }}>
            {FILTERS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        }
        footer={
          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <small className="text-secondary">{total} action(s) · les tentatives refusées ne sont pas inscrites.</small>
            <Pager page={page} pages={pages} onChange={setPage} />
          </div>
        }>
        <div className="table-responsive">
          <table className="table table-striped align-middle mb-0">
            <thead><tr><th>Date</th><th>Auteur</th><th>Action</th><th>Cible</th><th>Détail</th></tr></thead>
            <tbody>
              {loading ? <LoadingRow colSpan={5} /> : rows.length === 0 ? (
                <TableMessage colSpan={5}>Aucune action enregistrée.</TableMessage>
              ) : rows.map((r) => (
                <tr key={r.id}>
                  <td className="small text-secondary text-nowrap">{new Date(r.createdAt).toLocaleString('fr-FR')}</td>
                  <td>
                    <div>{r.actorEmail || '—'}</div>
                    <small className="text-secondary">{ROLE_LABELS[r.actorRole || ''] || r.actorRole}</small>
                  </td>
                  <td className="text-nowrap">
                    <span className={`badge ${DOMAIN_BADGE[r.action.split('.')[0]] || 'text-bg-secondary'}`}>{ACTION_LABELS[r.action] || r.action}</span>
                  </td>
                  <td className="small text-secondary font-mono">{r.targetId ? `${r.targetType || ''} ${r.targetId.slice(0, 8)}` : '—'}</td>
                  <td className="small" style={{ maxWidth: 380 }}>
                    <button type="button" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id}
                      className="btn btn-link btn-sm p-0 text-start text-decoration-none">
                      {summary(r.details)}
                    </button>
                    {open === r.id && r.details && (
                      <pre className="mt-2 p-2 bg-body-tertiary border rounded small mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 260, overflow: 'auto' }}>
                        {JSON.stringify(r.details, null, 2)}
                      </pre>
                    )}
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
