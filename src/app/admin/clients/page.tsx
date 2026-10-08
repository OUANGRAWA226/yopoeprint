'use client'
// src/app/admin/clients/page.tsx
// Page Clients connectée à NestJS + Supabase

import { useState } from 'react'
import {
 Search, Mail, Phone, Eye, RefreshCw,
 X, AlertCircle, AlertTriangle, CheckCircle,
 ShoppingCart, TrendingUp, MapPin, Calendar,
 Loader2, ChevronDown
} from 'lucide-react'
import { useClients, useClientDetail } from '@/hooks/useClients'
import type { Client } from '@/lib/clients.service'

// ── Constantes ────────────────────────────────────────────────
const SEGMENTS = ['all', 'VIP', 'Actif', 'Nouveau', 'Inactif']

const SEG_CLS: Record<string, string> = {
 VIP: 'bg-yellow-100 text-yellow-700',
 Actif: 'bg-green-100 text-green-700',
 Nouveau: 'bg-blue-100 text-blue-700',
 Inactif: 'bg-gray-100 text-gray-500',
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
 pending: { label: 'En attente', cls: 'bg-yellow-100 text-yellow-700' },
 confirmed: { label: 'Confirmée', cls: 'bg-blue-100 text-blue-700' },
 in_production: { label: 'En production', cls: 'bg-purple-100 text-purple-700' },
 shipped: { label: 'Expédiée', cls: 'bg-indigo-100 text-indigo-700' },
 delivered: { label: 'Livrée', cls: 'bg-green-100 text-green-700' },
 cancelled: { label: 'Annulée', cls: 'bg-red-100 text-red-600' },
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ message, type, onClose }: {
 message: string; type: 'success' | 'error'; onClose: () => void
}) {
 return (
 <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3
 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium
 ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
 {type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
 {message}
 <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
 <X size={14} />
 </button>
 </div>
 )
}

// ── Avatar initiales ──────────────────────────────────────────
function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
 const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
 const COLORS = ['bg-foreground', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-400']
 const color = COLORS[name.charCodeAt(0) % COLORS.length]
 const sz = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }[size]
 return (
 <div className={`${sz} ${color} rounded-xl flex items-center justify-center
 text-white font-bold shrink-0`}>
 {initials}
 </div>
 )
}

// ── Modal détail client ───────────────────────────────────────
function ClientDetailModal({ clientId, onClose }: { clientId: string; onClose: () => void }) {
 const { client, loading, error } = useClientDetail(clientId)

 return (
 <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
 flex items-center justify-center p-4" onClick={onClose}>
 <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh]
 overflow-hidden flex flex-col"
 onClick={(e) => e.stopPropagation()}>

 {/* Header */}
 <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
 <h2 className="font-display text-xl font-bold text-foreground">Fiche client</h2>
 <button onClick={onClose}
 className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center
 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
 <X size={16} />
 </button>
 </div>

 <div className="flex-1 overflow-y-auto p-6">
 {loading && (
 <div className="flex items-center justify-center py-16">
 <Loader2 size={32} className="animate-spin text-foreground" />
 </div>
 )}

 {error && (
 <div className="flex items-center gap-3 bg-red-50 border border-red-200
 text-red-700 px-4 py-3 rounded-xl text-sm">
 <AlertCircle size={16} /> {error}
 </div>
 )}

 {client && !loading && (
 <div className="space-y-6">

 {/* Profil */}
 <div className="flex items-start gap-4">
 <Avatar name={`${client.firstName} ${client.lastName}`} size="lg" />
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-1">
 <h3 className="font-display font-bold text-foreground text-xl">
 {client.firstName} {client.lastName}
 </h3>
 <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold
 ${SEG_CLS[client.segment] || 'bg-gray-100 text-gray-500'}`}>
 {client.segment}
 </span>
 </div>
 <div className="flex flex-wrap gap-3 text-sm text-gray-500">
 <span className="flex items-center gap-1.5">
 <Mail size={13} /> {client.email}
 </span>
 {client.phone && (
 <span className="flex items-center gap-1.5">
 <Phone size={13} /> {client.phone}
 </span>
 )}
 {client.city && (
 <span className="flex items-center gap-1.5">
 <MapPin size={13} /> {client.city}
 </span>
 )}
 <span className="flex items-center gap-1.5">
 <Calendar size={13} />
 Inscrit le {new Date(client.createdAt).toLocaleDateString('fr-FR')}
 </span>
 </div>
 </div>
 </div>

 {/* KPIs client */}
 <div className="grid grid-cols-3 gap-3">
 <div className="bg-secondary rounded-xl p-4 text-center">
 <p className="font-display font-bold text-foreground text-2xl">
 {client.totalOrders}
 </p>
 <p className="text-xs text-gray-500 mt-0.5">Commandes</p>
 </div>
 <div className="bg-primary rounded-xl p-4 text-center">
 <p className="font-display font-bold text-yellow-600 text-2xl">
 {new Intl.NumberFormat('fr-FR').format(client.totalSpent)}
 </p>
 <p className="text-xs text-gray-500 mt-0.5">FCFA dépensés</p>
 </div>
 <div className="bg-green-50 rounded-xl p-4 text-center">
 <p className="font-display font-bold text-green-600 text-2xl">
 {client.totalOrders > 0
 ? new Intl.NumberFormat('fr-FR').format(Math.round(client.totalSpent / client.totalOrders))
 : '—'}
 </p>
 <p className="text-xs text-gray-500 mt-0.5">Panier moyen (FCFA)</p>
 </div>
 </div>

 {/* Historique commandes */}
 {client.orders && client.orders.length > 0 && (
 <div>
 <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
 <ShoppingCart size={16} /> Historique des commandes
 </h4>
 <div className="space-y-2">
 {client.orders.map((o) => (
 <div key={o.id}
 className="flex items-center justify-between bg-gray-50
 rounded-xl px-4 py-3 border border-gray-100">
 <div>
 <p className="font-mono text-xs text-foreground font-bold">{o.id}</p>
 <p className="text-xs text-gray-500 mt-0.5">
 {o.items?.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
 </p>
 </div>
 <div className="text-right">
 <p className="font-bold text-foreground text-sm">
 {new Intl.NumberFormat('fr-FR').format(o.total)} FCFA
 </p>
 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
 ${STATUS_MAP[o.status]?.cls || 'bg-gray-100 text-gray-500'}`}>
 {STATUS_MAP[o.status]?.label || o.status}
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Adresses */}
 {client.addresses && client.addresses.length > 0 && (
 <div>
 <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
 <MapPin size={16} /> Adresses enregistrées
 </h4>
 <div className="grid grid-cols-2 gap-3">
 {client.addresses.map((a) => (
 <div key={a.id}
 className={`rounded-xl p-4 border-2 text-sm
 ${a.isDefault
 ? 'border-border bg-secondary'
 : 'border-gray-100 bg-gray-50'}`}>
 <div className="flex items-center justify-between mb-1">
 <p className="font-bold text-foreground">{a.label}</p>
 {a.isDefault && (
 <span className="text-[10px] font-bold text-foreground">Par défaut</span>
 )}
 </div>
 <p className="text-gray-500 text-xs">{a.address}</p>
 <p className="text-gray-500 text-xs">{a.city}</p>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 )
}

// ── Page principale ───────────────────────────────────────────
export default function AdminClientsPage() {
 const {
 clients, total, loading, error, stats,
 fetchClients, applyFilters, updateSegment, toggleActive,
 } = useClients()

 const [search, setSearch] = useState('')
 const [segment, setSegment] = useState('all')
 const [detailId, setDetailId] = useState<string | null>(null)
 const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

 const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
 setToast({ msg, type })
 setTimeout(() => setToast(null), 3500)
 }

 // Recherche avec debounce simple
 const handleSearch = (val: string) => {
 setSearch(val)
 applyFilters({ search: val })
 }

 const handleSegment = (seg: string) => {
 setSegment(seg)
 applyFilters({ segment: seg })
 }

 const handleSegmentChange = async (clientId: string, newSeg: string) => {
 await updateSegment(clientId, newSeg)
 showToast('Segment mis à jour ✓')
 }

 return (
 <div className="space-y-5">

 {/* ── Erreur API ────────────────────────────────────── */}
 {error && (
 <div className="flex items-center gap-3 bg-red-50 border border-red-200
 text-red-700 px-4 py-3 rounded-xl text-sm">
 <AlertCircle size={16} />
 <span className="flex-1">{error}</span>
 <button onClick={() => fetchClients()}
 className="flex items-center gap-1 font-bold hover:underline">
 <RefreshCw size={13} /> Réessayer
 </button>
 </div>
 )}

 {/* ── KPIs ──────────────────────────────────────────── */}
 <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
 {[
 { label: 'Total clients', value: loading ? '…' : total, color: 'text-foreground', bg: 'bg-secondary' },
 { label: 'VIP', value: loading ? '…' : stats.vip, color: 'text-yellow-600', bg: 'bg-yellow-50' },
 { label: 'Actifs', value: loading ? '…' : stats.actif, color: 'text-green-600', bg: 'bg-green-50' },
 { label: 'Nouveaux', value: loading ? '…' : stats.nouveau, color: 'text-blue-600', bg: 'bg-blue-50' },
 { label: 'Inactifs', value: loading ? '…' : stats.inactif, color: 'text-gray-400', bg: 'bg-gray-50' },
 ].map(({ label, value, color, bg }) => (
 <div key={label} className={`${bg} rounded-xl p-4 text-center border border-white`}>
 <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
 <p className="text-xs text-gray-400 mt-1">{label}</p>
 </div>
 ))}
 </div>

 {/* CA total clients */}
 <div className="bg-foreground rounded-xl px-5 py-4 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
 <TrendingUp size={18} className="text-foreground" />
 </div>
 <div>
 <p className="text-xs text-white/60">Revenus totaux générés par les clients</p>
 <p className="font-display font-bold text-primary text-xl">
 {loading ? '…' : new Intl.NumberFormat('fr-FR').format(stats.revenue)} FCFA
 </p>
 </div>
 </div>
 <p className="text-xs text-white/40">{total} clients enregistrés</p>
 </div>

 {/* ── Toolbar ───────────────────────────────────────── */}
 <div className="flex items-center gap-3 flex-wrap">
 {/* Recherche */}
 <div className="relative flex-1 min-w-48">
 <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
 <input placeholder="Nom, email, téléphone…"
 value={search} onChange={(e) => handleSearch(e.target.value)}
 className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl
 text-sm outline-none focus:border-border transition-all" />
 </div>

 {/* Filtre segment */}
 <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
 {SEGMENTS.map((seg) => (
 <button key={seg} onClick={() => handleSegment(seg)}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
 ${segment === seg
 ? 'bg-white text-foreground shadow-sm'
 : 'text-gray-400 hover:text-gray-600'}`}>
 {seg === 'all' ? 'Tous' : seg}
 </button>
 ))}
 </div>

 {/* Refresh */}
 <button onClick={() => fetchClients()} disabled={loading}
 className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400
 hover:text-foreground hover:border-border transition-all">
 <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
 </button>
 </div>

 {/* ── Skeleton ──────────────────────────────────────── */}
 {loading && (
 <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
 {Array.from({ length: 6 }).map((_, i) => (
 <div key={i} className="flex items-center gap-4 px-5 py-4 border-b
 border-gray-50 animate-pulse">
 <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
 <div className="flex-1 space-y-2">
 <div className="h-3 bg-gray-100 rounded w-1/3" />
 <div className="h-3 bg-gray-100 rounded w-1/2" />
 </div>
 <div className="h-3 bg-gray-100 rounded w-16" />
 <div className="h-3 bg-gray-100 rounded w-20" />
 </div>
 ))}
 </div>
 )}

 {/* ── Table clients ─────────────────────────────────── */}
 {!loading && (
 <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="bg-gray-50 border-b border-gray-100">
 {['Client', 'Contact', 'Ville', 'Commandes', 'Total dépensé', 'Segment', 'Inscrit', ''].map((h) => (
 <th key={h} className="text-left px-5 py-3 text-xs font-bold
 text-gray-400 uppercase tracking-wide whitespace-nowrap">
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {clients.length === 0 ? (
 <tr>
 <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
 Aucun client trouvé
 </td>
 </tr>
 ) : clients.map((c) => (
 <tr key={c.id} className="hover:bg-gray-50 transition-colors group">

 {/* Nom */}
 <td className="px-5 py-4">
 <div className="flex items-center gap-3">
 <Avatar name={`${c.firstName} ${c.lastName}`} size="sm" />
 <div>
 <p className="font-bold text-foreground">
 {c.firstName} {c.lastName}
 </p>
 <p className="text-[10px] text-gray-400 font-mono">
 {c.id.slice(0, 8)}…
 </p>
 </div>
 </div>
 </td>

 {/* Contact */}
 <td className="px-5 py-4">
 <div className="space-y-0.5">
 <p className="flex items-center gap-1.5 text-xs text-gray-500">
 <Mail size={11} /> {c.email}
 </p>
 {c.phone && (
 <p className="flex items-center gap-1.5 text-xs text-gray-500">
 <Phone size={11} /> {c.phone}
 </p>
 )}
 </div>
 </td>

 {/* Ville */}
 <td className="px-5 py-4 text-xs text-gray-400">
 {c.city || '—'}
 </td>

 {/* Commandes */}
 <td className="px-5 py-4 text-center">
 <span className="font-bold text-foreground">{c.totalOrders}</span>
 </td>

 {/* Total */}
 <td className="px-5 py-4 font-bold text-foreground whitespace-nowrap">
 {new Intl.NumberFormat('fr-FR').format(c.totalSpent)} FCFA
 </td>

 {/* Segment — modifiable */}
 <td className="px-5 py-4">
 <div className="relative">
 <select
 value={c.segment}
 onChange={(e) => handleSegmentChange(c.id, e.target.value)}
 className={`appearance-none pl-2.5 pr-6 py-1 rounded-full text-[10px]
 font-bold cursor-pointer border-0 outline-none
 ${SEG_CLS[c.segment] || 'bg-gray-100 text-gray-500'}`}>
 {['VIP', 'Actif', 'Nouveau', 'Inactif'].map((s) => (
 <option key={s} value={s}>{s}</option>
 ))}
 </select>
 <ChevronDown size={10} className="absolute right-1.5 top-1/2
 -translate-y-1/2 pointer-events-none" />
 </div>
 </td>

 {/* Date */}
 <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
 {new Date(c.createdAt).toLocaleDateString('fr-FR')}
 </td>

 {/* Action */}
 <td className="px-5 py-4">
 <button onClick={() => setDetailId(c.id)}
 className="flex items-center gap-1.5 text-xs text-foreground
 font-medium hover:underline opacity-0 group-hover:opacity-100
 transition-opacity whitespace-nowrap">
 <Eye size={13} /> Voir fiche
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Footer table */}
 <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center
 justify-between text-xs text-gray-400">
 <span>{clients.length} client(s) affiché(s) sur {total}</span>
 {total > clients.length && (
 <button onClick={() => applyFilters({ limit: (clients.length || 50) + 50 })}
 className="text-foreground font-bold hover:underline">
 Charger plus
 </button>
 )}
 </div>
 </div>
 )}

 {/* ── Modal détail ──────────────────────────────────── */}
 {detailId && (
 <ClientDetailModal clientId={detailId} onClose={() => setDetailId(null)} />
 )}

 {/* ── Toast ─────────────────────────────────────────── */}
 {toast && (
 <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
 )}
 </div>
 )
}
