'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp, ShoppingCart, Users, Package,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle,
  Truck, AlertCircle, Eye, ChevronRight
} from 'lucide-react'

// ── Données simulées ──────────────────────────────────────────
const KPI = [
  {
    label:  'CA du mois',
    value:  '2 847 500',
    unit:   'FCFA',
    delta:  '+18%',
    up:     true,
    icon:   <TrendingUp size={22} />,
    color:  'blue',
    sub:    'vs mois dernier',
  },
  {
    label:  'Commandes',
    value:  '143',
    unit:   '',
    delta:  '+12%',
    up:     true,
    icon:   <ShoppingCart size={22} />,
    color:  'gold',
    sub:    'ce mois-ci',
  },
  {
    label:  'Nouveaux clients',
    value:  '38',
    unit:   '',
    delta:  '+5%',
    up:     true,
    icon:   <Users size={22} />,
    color:  'green',
    sub:    'ce mois-ci',
  },
  {
    label:  'Panier moyen',
    value:  '19 913',
    unit:   'FCFA',
    delta:  '-3%',
    up:     false,
    icon:   <Package size={22} />,
    color:  'purple',
    sub:    'vs mois dernier',
  },
]

const COLOR = {
  blue:   { bg: 'bg-blue-pale',     icon: 'bg-blue-mid text-white',     text: 'text-blue-mid' },
  gold:   { bg: 'bg-gold-pale',     icon: 'bg-gold text-blue-deep',     text: 'text-yellow-600' },
  green:  { bg: 'bg-green-50',      icon: 'bg-green-500 text-white',    text: 'text-green-600' },
  purple: { bg: 'bg-purple-50',     icon: 'bg-purple-500 text-white',   text: 'text-purple-600' },
} as const

const RECENT_ORDERS = [
  { id: 'YP-2025-001421', client: 'Salimata Kaboré',   product: 'Flyer A5 × 1000',        total: '17 000',  status: 'delivered',    date: 'Aujourd\'hui' },
  { id: 'YP-2025-001420', client: 'Oumar Traoré',      product: 'Carte de visite × 500',   total: '12 400',  status: 'shipped',      date: 'Aujourd\'hui' },
  { id: 'YP-2025-001419', client: 'Fatimata Diallo',   product: 'Roll-up × 2',             total: '56 000',  status: 'in_production',date: 'Hier' },
  { id: 'YP-2025-001418', client: 'Ibrahim Sawadogo',  product: 'T-shirt × 50',            total: '225 000', status: 'confirmed',    date: 'Hier' },
  { id: 'YP-2025-001417', client: 'Aminata Zongo',     product: 'Brochure 3 volets × 500', total: '92 500',  status: 'pending',      date: '10 mars' },
]

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:       { label: 'En attente',    cls: 'bg-yellow-100 text-yellow-700' },
  confirmed:     { label: 'Confirmée',     cls: 'bg-blue-100 text-blue-700' },
  in_production: { label: 'En production', cls: 'bg-purple-100 text-purple-700' },
  shipped:       { label: 'Expédiée',      cls: 'bg-indigo-100 text-indigo-700' },
  delivered:     { label: 'Livrée',        cls: 'bg-green-100 text-green-700' },
}

const TOP_PRODUCTS = [
  { name: 'Flyer A5 classique',        sales: 42, revenue: '714 000',  pct: 92 },
  { name: 'Carte de visite standard',  sales: 31, revenue: '384 400',  pct: 68 },
  { name: 'Affiche A3 premium',        sales: 18, revenue: '216 000',  pct: 40 },
  { name: 'Kakémono Roll-up',          sales: 12, revenue: '336 000',  pct: 27 },
  { name: 'Brochure 3 volets',         sales: 9,  revenue: '166 500',  pct: 20 },
]

const ALERTS = [
  { icon: <AlertCircle size={16} />, text: '5 commandes en attente de fichier client', cls: 'bg-yellow-50 border-yellow-200 text-yellow-700', link: '/admin/commandes' },
  { icon: <Clock size={16} />,       text: '2 commandes en retard de production',      cls: 'bg-red-50 border-red-200 text-red-600',          link: '/admin/commandes' },
  { icon: <CheckCircle size={16} />, text: '8 nouveaux avis clients à modérer',        cls: 'bg-blue-50 border-blue-200 text-blue-600',        link: '/admin/clients' },
]

// ── Sparkline SVG simple ──────────────────────────────────────
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const w = 80, h = 32
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / (max - min || 1)) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState<'7j' | '30j' | '90j'>('30j')

  return (
    <div className="space-y-6">

      {/* ── Alertes ───────────────────────────────────────── */}
      <div className="space-y-2">
        {ALERTS.map((a) => (
          <Link key={a.text} href={a.link}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border
                        text-sm font-medium hover:opacity-80 transition-opacity ${a.cls}`}>
            {a.icon}
            <span className="flex-1">{a.text}</span>
            <ChevronRight size={14} />
          </Link>
        ))}
      </div>

      {/* ── KPIs ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI.map((k) => {
          const c = COLOR[k.color as keyof typeof COLOR]
          return (
            <div key={k.label} className={`${c.bg} rounded-2xl p-5`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.icon}`}>
                  {k.icon}
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-bold
                                  ${k.up ? 'text-green-600' : 'text-red-500'}`}>
                  {k.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {k.delta}
                </span>
              </div>
              <p className={`font-display text-2xl font-bold ${c.text}`}>
                {k.value}
                {k.unit && <span className="text-sm font-sans font-normal ml-1">{k.unit}</span>}
              </p>
              <p className="text-xs text-gray-500 mt-1">{k.label} · {k.sub}</p>
            </div>
          )
        })}
      </div>

      {/* ── Graphique CA + Top produits ───────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">

        {/* Graphique CA simulé */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-blue-deep">Évolution du CA</h3>
              <p className="text-xs text-gray-400 mt-0.5">Chiffre d'affaires quotidien (FCFA)</p>
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {(['7j', '30j', '90j'] as const).map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all
                               ${period === p
                                 ? 'bg-white text-blue-mid shadow-sm'
                                 : 'text-gray-400 hover:text-gray-600'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Barres simulées */}
          <div className="flex items-end gap-1.5 h-40">
            {Array.from({ length: period === '7j' ? 7 : period === '30j' ? 30 : 90 }).map((_, i) => {
              const h = 20 + Math.random() * 80
              return (
                <div key={i} className="flex-1 group relative">
                  <div
                    className="w-full bg-blue-pale hover:bg-blue-mid rounded-sm
                               transition-colors cursor-pointer"
                    style={{ height: `${h}%` }}
                  />
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
            <span>Début période</span>
            <span className="font-bold text-blue-deep">
              Total : 2 847 500 FCFA
            </span>
            <span>Aujourd'hui</span>
          </div>
        </div>

        {/* Top produits */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
          <h3 className="font-bold text-blue-deep mb-4">Top produits</h3>
          <div className="space-y-4">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-blue-pale rounded-full flex items-center
                                     justify-center text-[10px] font-bold text-blue-mid">
                      {i + 1}
                    </span>
                    <span className="text-xs font-medium text-blue-deep truncate max-w-[140px]">
                      {p.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-blue-mid">{p.sales} cmd</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-mid rounded-full transition-all"
                       style={{ width: `${p.pct}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{p.revenue} FCFA</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Commandes récentes ────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-blue-deep">Commandes récentes</h3>
          <Link href="/admin/commandes"
            className="text-xs text-blue-mid font-bold hover:underline flex items-center gap-1">
            Voir tout <ChevronRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Commande', 'Client', 'Produit', 'Total', 'Statut', 'Date', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold
                                          text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {RECENT_ORDERS.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-blue-mid font-bold">
                    {o.id}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-blue-deep whitespace-nowrap">
                    {o.client}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                    {o.product}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-blue-mid whitespace-nowrap">
                    {o.total} FCFA
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold
                                      ${STATUS_MAP[o.status]?.cls}`}>
                      {STATUS_MAP[o.status]?.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                    {o.date}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/commandes/${o.id}`}
                      className="flex items-center gap-1 text-xs text-blue-mid
                                 hover:underline font-medium">
                      <Eye size={13} /> Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
