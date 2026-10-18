// ─────────────────────────────────────────────────────────────
// CLIENTS
// src/app/admin/clients/page.tsx
// ─────────────────────────────────────────────────────────────
'use client'

import { useCallback, useEffect, useState } from 'react'
import { Search, Mail, Phone, Eye, X, Loader2 } from 'lucide-react'
import { clientsService, Client, ClientDetail } from '@/lib/clients.service'

const SEG_CLS: Record<string, string> = {
  VIP:      'bg-gold text-blue-deep',
  Actif:    'bg-green-100 text-green-700',
  Nouveau:  'bg-blue-100 text-blue-700',
  Inactif:  'bg-gray-100 text-gray-500',
}

const fcfa = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n || 0)} FCFA`
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
  const [detailLoading, setDetailLoading] = useState(false)

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
    setDetailLoading(true)
    try {
      setDetail(await clientsService.getById(id))
    } catch (e: any) {
      window.alert(e?.message || 'Impossible de charger ce client')
    } finally {
      setDetailLoading(false)
    }
  }

  const toggleActive = async (c: ClientDetail) => {
    try {
      const updated = await clientsService.setActive(c.id, !c.isActive)
      setDetail(updated)
      setClients((cs) => cs.map((x) => x.id === c.id ? { ...x, isActive: updated.isActive } : x))
    } catch (e: any) {
      window.alert(e?.message || 'Modification impossible')
    }
  }

  const count = (seg: string) => clients.filter((c) => c.segment === seg).length

  return (
    <div className="space-y-5">
      {/* Stats (sur la sélection affichée) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Clients',  value: total,           color: 'text-blue-mid' },
          { label: 'VIP',      value: count('VIP'),     color: 'text-yellow-600' },
          { label: 'Actifs',   value: count('Actif'),   color: 'text-green-600' },
          { label: 'Inactifs', value: count('Inactif'), color: 'text-gray-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
            <p className={`font-display text-3xl font-bold ${color}`}>{loading ? '…' : value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Nom, email ou téléphone…" aria-label="Rechercher un client"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl
                       text-sm outline-none focus:border-blue-mid transition-all" />
        </div>
        <select value={segment} onChange={(e) => setSegment(e.target.value)} aria-label="Segment"
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-mid">
          <option value="all">Tous les segments</option>
          {['VIP', 'Actif', 'Nouveau', 'Inactif'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && (
        <div role="alert" className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => load(search.trim(), segment)} className="font-bold underline">Réessayer</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Client', 'Contact', 'Commandes', 'Total payé', 'Segment', 'Inscrit le', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">Chargement des clients…</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                {search || segment !== 'all' ? 'Aucun client ne correspond à cette recherche.' : 'Aucun client inscrit pour le moment.'}
              </td></tr>
            ) : clients.map((c) => {
              const name = `${c.firstName} ${c.lastName}`.trim()
              return (
                <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${c.isActive ? '' : 'opacity-60'}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-mid rounded-xl flex items-center
                                      justify-center text-white font-bold text-sm shrink-0">
                        {`${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-blue-deep">{name}</p>
                        <p className="text-[10px] text-gray-400">{c.city || (c.isActive ? '' : 'Compte désactivé')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail size={11} /> {c.email}
                      </span>
                      {c.phone && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone size={11} /> {c.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-blue-deep text-center">{c.totalOrders}</td>
                  <td className="px-5 py-4 font-bold text-blue-mid whitespace-nowrap">{fcfa(c.totalSpent)}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${SEG_CLS[c.segment]}`}>
                      {c.segment}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{date(c.createdAt)}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => openDetail(c.id)} disabled={detailLoading}
                      className="flex items-center gap-1 text-xs text-blue-mid hover:underline font-medium disabled:opacity-50">
                      <Eye size={13} /> Voir
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Détail client */}
      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            {!detail ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : (
              <>
                <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
                  <div>
                    <h2 className="font-display text-xl font-bold text-gray-900">{detail.firstName} {detail.lastName}</h2>
                    <p className="text-xs text-gray-500 mt-1">{detail.email}{detail.phone ? ` · ${detail.phone}` : ''}</p>
                  </div>
                  <button onClick={() => setDetail(null)} aria-label="Fermer"
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 rounded-xl p-3"><p className="font-bold text-blue-deep">{detail.totalOrders}</p><p className="text-[11px] text-gray-400">commandes</p></div>
                    <div className="bg-gray-50 rounded-xl p-3"><p className="font-bold text-blue-mid">{fcfa(detail.totalSpent)}</p><p className="text-[11px] text-gray-400">payé</p></div>
                    <div className="bg-gray-50 rounded-xl p-3"><p className="font-bold text-gray-700">{date(detail.lastOrderAt)}</p><p className="text-[11px] text-gray-400">dernière commande</p></div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Commandes récentes</p>
                    {detail.orders.length === 0 ? (
                      <p className="text-sm text-gray-400">Aucune commande.</p>
                    ) : (
                      <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl">
                        {detail.orders.slice(0, 10).map((o) => (
                          <li key={o.id} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900">{o.orderNumber}</p>
                              <p className="text-xs text-gray-400 truncate">
                                {o.items.map((i) => `${i.quantity} × ${i.productName}`).join(', ')}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-blue-mid">{fcfa(o.total)}</p>
                              <p className="text-[11px] text-gray-400">{date(o.createdAt)} · {o.status}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {detail.addresses.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Adresses</p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {detail.addresses.map((a) => (
                          <li key={a.id}>{a.street}{a.neighborhood ? `, ${a.neighborhood}` : ''}, {a.city}{a.isDefault ? ' (par défaut)' : ''}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Compte <strong>{detail.isActive ? 'actif' : 'désactivé'}</strong>
                  </span>
                  <button onClick={() => toggleActive(detail)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${detail.isActive
                      ? 'border border-red-200 text-red-600 bg-white hover:bg-red-50'
                      : 'bg-blue-mid text-white hover:opacity-90'}`}>
                    {detail.isActive ? 'Désactiver le compte' : 'Réactiver le compte'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
