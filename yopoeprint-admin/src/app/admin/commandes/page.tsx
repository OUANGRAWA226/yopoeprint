'use client'

import { useState } from 'react'
import { Search, Eye, ChevronDown, Download, Filter } from 'lucide-react'
import Link from 'next/link'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:       { label: 'En attente',    cls: 'bg-yellow-100 text-yellow-700' },
  confirmed:     { label: 'Confirmée',     cls: 'bg-blue-100 text-blue-700' },
  in_production: { label: 'En production', cls: 'bg-purple-100 text-purple-700' },
  shipped:       { label: 'Expédiée',      cls: 'bg-indigo-100 text-indigo-700' },
  delivered:     { label: 'Livrée',        cls: 'bg-green-100 text-green-700' },
  cancelled:     { label: 'Annulée',       cls: 'bg-red-100 text-red-600' },
}

const ORDERS = Array.from({ length: 20 }, (_, i) => {
  const statuses = Object.keys(STATUS_MAP)
  return {
    id:      `YP-2025-00${1421 - i}`,
    client:  ['Salimata Kaboré', 'Oumar Traoré', 'Fatimata Diallo', 'Ibrahim Sawadogo', 'Aminata Zongo'][i % 5],
    phone:   '+226 7' + (Math.floor(Math.random() * 9) + 1) + ' ' + Math.floor(Math.random() * 90 + 10) + ' ' + Math.floor(Math.random() * 90 + 10) + ' ' + Math.floor(Math.random() * 90 + 10),
    product: ['Flyer A5 × 1000', 'Carte de visite × 500', 'Roll-up × 2', 'T-shirt × 50', 'Brochure × 200'][i % 5],
    total:   [17000, 12400, 56000, 225000, 92500][i % 5],
    status:  statuses[i % statuses.length],
    payment: ['orange_money', 'moov_money', 'card'][i % 3],
    date:    `${12 - (i % 10)} mars 2025`,
    zone:    ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou'][i % 3],
  }
})

export default function AdminCommandesPage() {
  const [search,    setSearch]    = useState('')
  const [status,    setStatus]    = useState('all')
  const [selected,  setSelected]  = useState<string[]>([])

  const filtered = ORDERS.filter((o) =>
    (status === 'all' || o.status === status) &&
    (!search || o.id.includes(search) || o.client.toLowerCase().includes(search.toLowerCase()))
  )

  const toggleSelect = (id: string) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((o) => o.id))

  return (
    <div className="space-y-5">

      {/* ── Stats statuts ─────────────────────────────────── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {Object.entries(STATUS_MAP).map(([key, { label, cls }]) => {
          const count = ORDERS.filter((o) => o.status === key).length
          return (
            <button key={key}
              onClick={() => setStatus(status === key ? 'all' : key)}
              className={`p-3 rounded-xl border-2 text-center transition-all
                           ${status === key ? 'border-blue-mid bg-blue-pale' : 'bg-white border-gray-100 hover:border-blue-mid/40'}`}>
              <p className="font-display font-bold text-blue-deep text-xl">{count}</p>
              <p className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-1 ${cls}`}>
                {label}
              </p>
            </button>
          )
        })}
      </div>

      {/* ── Toolbar ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="N° commande ou nom client…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl
                       text-sm outline-none focus:border-blue-mid transition-all" />
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 bg-blue-pale px-4 py-2.5 rounded-xl">
            <span className="text-xs font-bold text-blue-mid">{selected.length} sélectionnée(s)</span>
            <select className="text-xs bg-transparent font-bold text-blue-mid outline-none cursor-pointer">
              <option>Changer statut…</option>
              {Object.entries(STATUS_MAP).map(([k, { label }]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>
        )}

        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200
                           rounded-xl text-sm font-medium text-gray-600 hover:border-blue-mid transition-all">
          <Download size={15} /> Exporter CSV
        </button>
      </div>

      {/* ── Table commandes ───────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="accent-blue-mid cursor-pointer" />
                </th>
                {['Commande', 'Client', 'Produit', 'Zone', 'Paiement', 'Total', 'Statut', 'Date', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold
                                          text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((o) => (
                <tr key={o.id}
                  className={`hover:bg-gray-50 transition-colors
                               ${selected.includes(o.id) ? 'bg-blue-pale/50' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(o.id)}
                      onChange={() => toggleSelect(o.id)}
                      className="accent-blue-mid cursor-pointer" />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-mid font-bold whitespace-nowrap">
                    {o.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-medium text-blue-deep">{o.client}</p>
                    <p className="text-[10px] text-gray-400">{o.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{o.product}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{o.zone}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium capitalize">
                      {o.payment.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-mid whitespace-nowrap">
                    {new Intl.NumberFormat('fr-FR').format(o.total)} FCFA
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap
                                      ${STATUS_MAP[o.status]?.cls}`}>
                      {STATUS_MAP[o.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{o.date}</td>
                  <td className="px-4 py-3">
                    <button className="flex items-center gap-1 text-xs text-blue-mid
                                       hover:underline font-medium whitespace-nowrap">
                      <Eye size={13} /> Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-400">
          <span>{filtered.length} commande(s)</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button key={p}
                className={`w-7 h-7 rounded-lg font-bold transition-all
                             ${p === 1 ? 'bg-blue-mid text-white' : 'hover:bg-gray-200 text-gray-500'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
