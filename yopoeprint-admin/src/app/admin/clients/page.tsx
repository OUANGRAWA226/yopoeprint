'use client'

import { useCallback, useEffect, useState } from 'react'
import { Search, Mail, Phone, Eye, Users, Crown, UserCheck, UserX } from 'lucide-react'
import { clientsService, Client, ClientDetail } from '@/lib/clients.service'
import { ExportButton } from '@/components/admin/ExportButton'
import { Card, ErrorAlert, InfoBox, LoadingRow, Modal, Spinner, TableMessage } from '@/components/ui'
import { OrderStatusBadge, fcfa } from '@/components/status'

const SEG_BADGE: Record<string, string> = {
  VIP:     'text-bg-warning',
  Actif:   'text-bg-success',
  Nouveau: 'text-bg-primary',
  Inactif: 'text-bg-secondary',
}

const date = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [segment, setSegment] = useState('all')
  const [detail, setDetail] = useState<ClientDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [toggling, setToggling] = useState(false)

  const load = useCallback(async (q: string, seg: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await clientsService.getAll({ search: q || undefined, segment: seg, limit: 200 })
      setClients(res.data)
      setTotal(res.total)
    } catch (e: any) {
      setError(e?.message || 'Impossible de charger les clients')
    } finally {
      setLoading(false)
    }
  }, [])

  // Recherche côté API, avec un léger délai pendant la frappe
  useEffect(() => {
    const t = setTimeout(() => load(search.trim(), segment), 300)
    return () => clearTimeout(t)
  }, [search, segment, load])

  const openDetail = async (id: string) => {
    setDetail(null); setDetailError(''); setDetailOpen(true)
    try {
      setDetail(await clientsService.getById(id))
    } catch (e: any) {
      setDetailError(e?.message || 'Impossible de charger ce client')
    }
  }

  const toggleActive = async (c: ClientDetail) => {
    if (!window.confirm(c.isActive ? `Désactiver le compte de ${c.firstName} ? Ses sessions seront coupées.` : `Réactiver le compte de ${c.firstName} ?`)) return
    setToggling(true); setDetailError('')
    try {
      const updated = await clientsService.setActive(c.id, !c.isActive)
      setDetail(updated)
      setClients((cs) => cs.map((x) => x.id === c.id ? { ...x, isActive: updated.isActive } : x))
    } catch (e: any) {
      setDetailError(e?.message || 'Modification impossible')
    } finally {
      setToggling(false)
    }
  }

  const closeDetail = useCallback(() => setDetailOpen(false), [])
  const count = (seg: string) => clients.filter((c) => c.segment === seg).length

  return (
    <>
      {/* Indicateurs (sur la sélection affichée) */}
      <div className="row">
        <div className="col-sm-6 col-lg-3"><InfoBox icon={<Users />} color="primary" label="Clients" value={loading ? '…' : total} /></div>
        <div className="col-sm-6 col-lg-3"><InfoBox icon={<Crown />} color="warning" label="VIP" value={loading ? '…' : count('VIP')} /></div>
        <div className="col-sm-6 col-lg-3"><InfoBox icon={<UserCheck />} color="success" label="Actifs" value={loading ? '…' : count('Actif')} /></div>
        <div className="col-sm-6 col-lg-3"><InfoBox icon={<UserX />} color="secondary" label="Inactifs" value={loading ? '…' : count('Inactif')} /></div>
      </div>

      <ErrorAlert message={error} onRetry={() => load(search.trim(), segment)} />

      <Card title="Clients" icon={<Users size={18} />} noPadding
        tools={
          <>
            <div className="input-group input-group-sm" style={{ width: 240 }}>
              <span className="input-group-text"><Search size={13} /></span>
              <input placeholder="Nom, email ou téléphone…" aria-label="Rechercher un client" className="form-control"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select value={segment} onChange={(e) => setSegment(e.target.value)} aria-label="Segment" className="form-select form-select-sm" style={{ width: 'auto' }}>
              <option value="all">Tous les segments</option>
              {['VIP', 'Actif', 'Nouveau', 'Inactif'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <ExportButton kind="clients" />
          </>
        }>
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead>
              <tr><th>Client</th><th>Contact</th><th className="text-center">Commandes</th><th>Total payé</th><th>Segment</th><th>Inscrit le</th><th /></tr>
            </thead>
            <tbody>
              {loading ? <LoadingRow colSpan={7} /> : clients.length === 0 ? (
                <TableMessage colSpan={7}>
                  {search || segment !== 'all' ? 'Aucun client ne correspond à cette recherche.' : 'Aucun client inscrit pour le moment.'}
                </TableMessage>
              ) : clients.map((c) => {
                const name = `${c.firstName} ${c.lastName}`.trim()
                return (
                  <tr key={c.id} className={c.isActive ? '' : 'opacity-50'}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="rounded-circle bg-primary text-white fw-semibold d-inline-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: 34, height: 34, fontSize: '0.8rem' }} aria-hidden="true">
                          {`${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`.toUpperCase()}
                        </span>
                        <div>
                          <div className="fw-semibold">{name}</div>
                          <small className="text-secondary">{c.city || (c.isActive ? '' : 'Compte désactivé')}</small>
                        </div>
                      </div>
                    </td>
                    <td className="small text-secondary">
                      <div className="d-flex align-items-center gap-1"><Mail size={11} /> {c.email}</div>
                      {c.phone && <div className="d-flex align-items-center gap-1"><Phone size={11} /> {c.phone}</div>}
                    </td>
                    <td className="text-center fw-semibold">{c.totalOrders}</td>
                    <td className="fw-semibold tabular-nums text-nowrap">{fcfa(c.totalSpent)}</td>
                    <td><span className={`badge ${SEG_BADGE[c.segment] || 'text-bg-secondary'}`}>{c.segment}</span></td>
                    <td className="small text-secondary text-nowrap">{date(c.createdAt)}</td>
                    <td className="text-end">
                      <button type="button" onClick={() => openDetail(c.id)} className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                        <Eye size={13} /> Voir
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={detailOpen} size="lg" onClose={closeDetail}
        title={detail ? `${detail.firstName} ${detail.lastName}` : 'Fiche client'}
        footer={detail && (
          <div className="d-flex w-100 align-items-center justify-content-between">
            <span className="text-secondary">Compte <strong>{detail.isActive ? 'actif' : 'désactivé'}</strong></span>
            <button type="button" onClick={() => toggleActive(detail)} disabled={toggling}
              className={`btn ${detail.isActive ? 'btn-outline-danger' : 'btn-primary'} d-inline-flex align-items-center gap-2`}>
              {toggling && <Spinner />} {detail.isActive ? 'Désactiver le compte' : 'Réactiver le compte'}
            </button>
          </div>
        )}>
        {detailError && <div role="alert" className="alert alert-danger py-2">{detailError}</div>}
        {!detail ? (!detailError && <div className="text-center text-secondary py-5"><Spinner className="me-2" />Chargement…</div>) : (
          <>
            <p className="text-secondary small">{detail.email}{detail.phone ? ` · ${detail.phone}` : ''}</p>
            <div className="row g-2 text-center mb-4">
              <div className="col-4"><div className="border rounded p-2"><div className="fw-bold fs-5">{detail.totalOrders}</div><small className="text-secondary">commandes</small></div></div>
              <div className="col-4"><div className="border rounded p-2"><div className="fw-bold fs-5 tabular-nums">{fcfa(detail.totalSpent)}</div><small className="text-secondary">payé</small></div></div>
              <div className="col-4"><div className="border rounded p-2"><div className="fw-bold fs-5">{date(detail.lastOrderAt)}</div><small className="text-secondary">dernière commande</small></div></div>
            </div>

            <h6 className="text-uppercase text-secondary small fw-semibold">Commandes récentes</h6>
            {detail.orders.length === 0 ? (
              <p className="text-secondary">Aucune commande.</p>
            ) : (
              <ul className="list-group mb-4">
                {detail.orders.slice(0, 10).map((o) => (
                  <li key={o.id} className="list-group-item d-flex align-items-center justify-content-between gap-3">
                    <div className="min-w-0">
                      <div className="fw-semibold font-mono">{o.orderNumber}</div>
                      <small className="text-secondary d-block text-truncate">{o.items.map((i) => `${i.quantity} × ${i.productName}`).join(', ')}</small>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <div className="fw-semibold tabular-nums">{fcfa(o.total)}</div>
                      <small className="text-secondary">{date(o.createdAt)}</small> <OrderStatusBadge status={o.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {detail.addresses.length > 0 && (
              <>
                <h6 className="text-uppercase text-secondary small fw-semibold">Adresses</h6>
                <ul className="mb-0 small">
                  {detail.addresses.map((a) => (
                    <li key={a.id}>{a.street}{a.neighborhood ? `, ${a.neighborhood}` : ''}, {a.city}{a.isDefault ? ' (par défaut)' : ''}</li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </Modal>
    </>
  )
}
