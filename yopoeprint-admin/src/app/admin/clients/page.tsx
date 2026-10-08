// ─────────────────────────────────────────────────────────────
// CLIENTS
// src/app/admin/clients/page.tsx
// ─────────────────────────────────────────────────────────────
'use client'

import { useState } from 'react'
import { Search, Mail, Phone, Eye } from 'lucide-react'

const CLIENTS = Array.from({ length: 12 }, (_, i) => ({
  id:       `CLI-${1000 + i}`,
  name:     ['Salimata Kaboré', 'Oumar Traoré', 'Fatimata Diallo', 'Ibrahim Sawadogo', 'Aminata Zongo', 'Moussa Compaoré'][i % 6],
  email:    `client${i + 1}@example.bf`,
  phone:    `+226 7${i} 00 00 0${i}`,
  orders:   Math.floor(Math.random() * 15) + 1,
  total:    Math.floor(Math.random() * 500000) + 50000,
  segment:  ['VIP', 'Actif', 'Nouveau', 'Inactif'][i % 4],
  joined:   `${(i % 28) + 1} mars 2025`,
}))

const SEG_CLS: Record<string, string> = {
  VIP:      'bg-gold text-blue-deep',
  Actif:    'bg-green-100 text-green-700',
  Nouveau:  'bg-blue-100 text-blue-700',
  Inactif:  'bg-gray-100 text-gray-500',
}

export default function AdminClientsPage() {
  const [search, setSearch] = useState('')
  const filtered = CLIENTS.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.includes(search)
  )

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total clients',  value: CLIENTS.length,                              color: 'text-blue-mid' },
          { label: 'VIP',            value: CLIENTS.filter((c) => c.segment === 'VIP').length,     color: 'text-yellow-600' },
          { label: 'Actifs ce mois', value: CLIENTS.filter((c) => c.segment === 'Actif').length,   color: 'text-green-600' },
          { label: 'Inactifs',       value: CLIENTS.filter((c) => c.segment === 'Inactif').length, color: 'text-gray-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
            <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input placeholder="Rechercher un client…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl
                     text-sm outline-none focus:border-blue-mid transition-all" />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Client', 'Contact', 'Commandes', 'Total dépensé', 'Segment', 'Inscrit le', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-mid rounded-xl flex items-center
                                    justify-center text-white font-bold text-sm shrink-0">
                      {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-blue-deep">{c.name}</p>
                      <p className="text-[10px] text-gray-400">{c.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail size={11} /> {c.email}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone size={11} /> {c.phone}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 font-bold text-blue-deep text-center">{c.orders}</td>
                <td className="px-5 py-4 font-bold text-blue-mid">
                  {new Intl.NumberFormat('fr-FR').format(c.total)} FCFA
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${SEG_CLS[c.segment]}`}>
                    {c.segment}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-gray-400">{c.joined}</td>
                <td className="px-5 py-4">
                  <button className="flex items-center gap-1 text-xs text-blue-mid hover:underline font-medium">
                    <Eye size={13} /> Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
