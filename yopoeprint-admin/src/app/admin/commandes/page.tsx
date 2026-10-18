'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search, Download,
  ShieldCheck, CheckCircle2, AlertTriangle, UploadCloud,
  X, Send, ExternalLink, RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { adminOrdersService, Order } from '@/lib/orders.service'
import { cloudinaryService } from '@/lib/cloudinary.service'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:       { label: 'Paiement en attente', cls: 'bg-yellow-100 text-yellow-700' },
  confirmed:     { label: 'Payée',         cls: 'bg-blue-100 text-blue-700' },
  bat_pending:   { label: 'BAT à valider', cls: 'bg-amber-100 text-amber-800' },
  in_production: { label: 'En production', cls: 'bg-purple-100 text-purple-700' },
  ready:         { label: 'Prête',         cls: 'bg-emerald-100 text-emerald-700' },
  shipped:       { label: 'Expédiée',      cls: 'bg-indigo-100 text-indigo-700' },
  delivered:     { label: 'Livrée',        cls: 'bg-green-100 text-green-700' },
  cancelled:     { label: 'Annulée',       cls: 'bg-red-100 text-red-600' },
  refunded:      { label: 'Remboursée',    cls: 'bg-gray-100 text-gray-600' },
}

const PAYMENT_LABELS: Record<string, string> = {
  orange_money: 'Orange Money', moov_money: 'Moov Money', visa: 'Visa', mastercard: 'Mastercard', virement: 'Virement',
}

const PAGE_SIZE = 50

// Ligne affichée dans le tableau et dans la modale BAT
interface Row {
  id: string
  orderNumber: string
  client: string
  phone: string
  product: string
  total: number
  status: string
  payment?: string
  paymentStatus?: string
  date: string
  zone: string
  batUrl?: string
  batVersoUrl?: string
  batStatus?: 'pending' | 'approved' | 'rejected' | null
  batNotes?: string
  batApprovedAt?: string
  batRejectedReason?: string
  batCorrectionFileUrl?: string
}

const toRow = (o: Order): Row => ({
  id:          o.id,
  orderNumber: o.orderNumber,
  client:      o.user?.fullName || o.deliveryAddress?.fullName || '—',
  phone:       o.deliveryAddress?.phone || o.user?.phone || '—',
  product:     (o.items || []).map((it) => `${new Intl.NumberFormat('fr-FR').format(it.quantity)} × ${it.productName}`).join(', '),
  total:       o.total || 0,
  status:      o.status,
  payment:     o.paymentMethod,
  paymentStatus: o.paymentStatus,
  date:        new Date(o.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
  zone:        o.deliveryAddress?.city || '—',
  batUrl:      o.batUrl,
  batVersoUrl: o.batVersoUrl,
  batStatus:   o.batStatus,
  batNotes:    o.batNotes,
  batApprovedAt: o.batApprovedAt,
  batRejectedReason: o.batRejectedReason,
  batCorrectionFileUrl: o.batCorrectionFileUrl,
})

// Export CSV (séparateur ; pour Excel en français)
function downloadCsv(rows: Row[]) {
  const header = ['N° commande', 'Client', 'Téléphone', 'Ville', 'Articles', 'Total FCFA', 'Statut', 'Paiement', 'Date']
  const esc = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = rows.map((r) => [
    r.orderNumber, r.client, r.phone, r.zone, r.product, r.total,
    STATUS_MAP[r.status]?.label || r.status, PAYMENT_LABELS[r.payment || ''] || r.payment || '', r.date,
  ].map(esc).join(';'))
  const blob = new Blob(['﻿' + [header.map(esc).join(';'), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminCommandesPage() {
  return (
    <Suspense fallback={<div className="h-64 rounded-2xl bg-white border border-gray-100 animate-pulse" />}>
      <CommandesContent />
    </Suspense>
  )
}

function CommandesContent() {
  const router = useRouter()
  const params = useSearchParams()
  const status = params.get('status') || 'all'
  const bat = params.get('bat') || ''

  const [orders,    setOrders]    = useState<Row[]>([])
  const [total,     setTotal]     = useState(0)
  const [page,      setPage]      = useState(1)
  const [counts,    setCounts]    = useState<Record<string, number> | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [search,    setSearch]    = useState('')
  const [selected,  setSelected]  = useState<string[]>([])
  const [bulkSaving, setBulkSaving] = useState(false)

  // Modal BAT
  const [batModalOrder, setBatModalOrder] = useState<Row | null>(null)
  const [batUrlInput, setBatUrlInput] = useState('')
  const [batVersoUrlInput, setBatVersoUrlInput] = useState('')
  const [batNotesInput, setBatNotesInput] = useState('')
  const [uploadingBat, setUploadingBat] = useState(false)
  const [savingBat, setSavingBat] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [res, stats] = await Promise.all([
        adminOrdersService.getAll({
          status, batStatus: bat || undefined, page, limit: PAGE_SIZE, search: search.trim() || undefined,
        }),
        adminOrdersService.getStats(30),
      ])
      setOrders(res.data.map(toRow))
      setTotal(res.total)
      setCounts(stats.statusCounts)
      setSelected([])
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger les commandes')
    } finally {
      setLoading(false)
    }
  }, [status, bat, page, search])

  // Recherche côté API, avec un léger délai pendant la frappe
  useEffect(() => {
    const t = setTimeout(loadOrders, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [loadOrders, search])

  const setFilter = (next: { status?: string; bat?: string }) => {
    const q = new URLSearchParams()
    if (next.status && next.status !== 'all') q.set('status', next.status)
    if (next.bat) q.set('bat', next.bat)
    const qs = q.toString()
    setPage(1)
    router.replace(`/admin/commandes${qs ? `?${qs}` : ''}`)
  }

  const applyBulkStatus = async (newStatus: string) => {
    if (!newStatus || !selected.length) return
    if (!window.confirm(`Passer ${selected.length} commande(s) au statut « ${STATUS_MAP[newStatus]?.label} » ? Les clients concernés sont prévenus par email.`)) return
    setBulkSaving(true)
    const results = await Promise.allSettled(selected.map((id) => adminOrdersService.updateStatus(id, newStatus)))
    setBulkSaving(false)
    const failed = results.filter((r) => r.status === 'rejected').length
    if (failed) window.alert(`${failed} commande(s) n'ont pas pu être mises à jour.`)
    loadOrders()
  }

  const openBatModal = (order: Row) => {
    setBatModalOrder(order)
    setBatUrlInput(order.batUrl || '')
    setBatVersoUrlInput(order.batVersoUrl || '')
    setBatNotesInput(order.batNotes || '')
    setFeedbackMsg(null)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isVerso = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingBat(true)
    try {
      const url = await cloudinaryService.uploadImage(file)
      if (isVerso) {
        setBatVersoUrlInput(url)
      } else {
        setBatUrlInput(url)
      }
      setFeedbackMsg({ type: 'success', text: 'Maquette BAT chargée avec succès sur Cloudinary.' })
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Erreur lors du chargement du fichier.' })
    } finally {
      setUploadingBat(false)
    }
  }

  const handleSaveBat = async () => {
    if (!batModalOrder) return
    if (!batUrlInput.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Veuillez saisir ou uploader une URL de maquette BAT.' })
      return
    }

    setSavingBat(true)
    setFeedbackMsg(null)
    try {
      const updated: Order = await adminOrdersService.uploadBat(batModalOrder.id, {
        batUrl: batUrlInput.trim(),
        batVersoUrl: batVersoUrlInput.trim() || undefined,
        batNotes: batNotesInput.trim() || undefined,
      })
      setOrders((prev) => prev.map((o) => (o.id === batModalOrder.id ? toRow(updated) : o)))
      setFeedbackMsg({ type: 'success', text: 'BAT envoyé au client ! Statut passé à "BAT à valider".' })
      setTimeout(() => setBatModalOrder(null), 1200)
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Impossible d\'enregistrer le BAT.' })
    } finally {
      setSavingBat(false)
    }
  }

  const toggleSelect = (id: string) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])

  const toggleAll = () =>
    setSelected(selected.length === orders.length ? [] : orders.map((o) => o.id))

  const pages = Math.max(Math.ceil(total / PAGE_SIZE), 1)
  const filterLabel = bat === 'rejected' ? 'BAT à corriger' : bat === 'pending' ? 'BAT en attente du client' : STATUS_MAP[status]?.label

  return (
    <div className="space-y-5">

      {/* ── Compteurs par statut (toutes commandes) ───────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {Object.entries(STATUS_MAP).filter(([k]) => k !== 'refunded').map(([key, { label, cls }]) => (
          <button key={key}
            onClick={() => setFilter({ status: status === key ? 'all' : key })}
            aria-pressed={status === key}
            className={`p-3 rounded-xl border-2 text-center transition-all ${
              status === key ? 'border-blue-mid bg-blue-pale' : 'bg-white border-gray-100 hover:border-blue-mid/40'
            }`}
          >
            <p className="font-display font-bold text-blue-deep text-lg tabular-nums">{counts ? counts[key] ?? 0 : '…'}</p>
            <p className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-1 ${cls}`}>
              {label}
            </p>
          </button>
        ))}
      </div>

      {/* ── Toolbar ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="N° commande, nom, email ou téléphone…" aria-label="Rechercher une commande"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-mid transition-all" />
        </div>

        {(status !== 'all' || bat) && (
          <button onClick={() => setFilter({})} aria-label="Retirer le filtre"
            className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-pale text-blue-mid rounded-xl text-xs font-bold">
            {filterLabel} <X size={13} />
          </button>
        )}

        <button
          onClick={loadOrders}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:border-blue-mid transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 bg-blue-pale px-4 py-2.5 rounded-xl">
            <span className="text-xs font-bold text-blue-mid">{selected.length} sélectionnée(s)</span>
            <select value="" disabled={bulkSaving} onChange={(e) => applyBulkStatus(e.target.value)}
              aria-label="Changer le statut des commandes sélectionnées"
              className="text-xs bg-transparent font-bold text-blue-mid outline-none cursor-pointer">
              <option value="">{bulkSaving ? 'Mise à jour…' : 'Changer statut…'}</option>
              {Object.entries(STATUS_MAP).map(([k, { label }]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>
        )}

        <button onClick={() => downloadCsv(orders)} disabled={!orders.length}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-blue-mid transition-all disabled:opacity-50">
          <Download size={15} /> Exporter CSV
        </button>
      </div>

      {error && (
        <div role="alert" className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={loadOrders} className="font-bold underline shrink-0">Réessayer</button>
        </div>
      )}

      {/* ── Table commandes ───────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" aria-label="Tout sélectionner"
                    checked={selected.length === orders.length && orders.length > 0}
                    onChange={toggleAll}
                    className="accent-blue-mid cursor-pointer" />
                </th>
                {['Commande', 'Client', 'Articles', 'Paiement', 'Total', 'Statut', 'BAT', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && !orders.length ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">Chargement des commandes…</td></tr>
              ) : !orders.length ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                  {search || status !== 'all' || bat ? 'Aucune commande ne correspond à ces critères.' : 'Aucune commande pour le moment.'}
                </td></tr>
              ) : orders.map((o) => (
                <tr key={o.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    selected.includes(o.id) ? 'bg-blue-pale/50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(o.id)} aria-label={`Sélectionner ${o.orderNumber}`}
                      onChange={() => toggleSelect(o.id)}
                      className="accent-blue-mid cursor-pointer" />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-mid font-bold whitespace-nowrap">
                    {o.orderNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-medium text-blue-deep">{o.client}</p>
                    <p className="text-[11px] text-gray-500">{o.phone} · {o.zone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[220px] truncate" title={o.product}>{o.product}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      {PAYMENT_LABELS[o.payment || ''] || '—'}
                    </span>
                    {o.paymentStatus && o.paymentStatus !== 'paid' && (
                      <p className="text-[10px] text-gray-500 mt-0.5">{o.paymentStatus === 'failed' ? 'Échec du paiement' : 'Non payée'}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-mid whitespace-nowrap tabular-nums">
                    {new Intl.NumberFormat('fr-FR').format(o.total)} FCFA
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                      STATUS_MAP[o.status]?.cls || 'bg-gray-100 text-gray-600'
                    }`}>
                      {STATUS_MAP[o.status]?.label || o.status}
                    </span>
                  </td>
                  {/* Colonne BAT status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {o.batStatus === 'approved' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={12} /> Validé
                      </span>
                    ) : o.batStatus === 'rejected' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <AlertTriangle size={12} /> À corriger
                      </span>
                    ) : o.batUrl || o.status === 'bat_pending' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        <ShieldCheck size={12} /> En attente
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-500 font-medium">Non déposé</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{o.date}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openBatModal(o)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                          o.batUrl
                            ? 'bg-blue-pale text-blue-mid hover:bg-blue-mid hover:text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-blue-mid hover:text-white'
                        }`}
                      >
                        <ShieldCheck size={13} />
                        {o.batUrl ? 'Gérer BAT' : 'Déposer BAT'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>{total} commande(s){pages > 1 ? ` · page ${page} / ${pages}` : ''}</span>
          {pages > 1 && (
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page <= 1 || loading}
                aria-label="Page précédente" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 disabled:opacity-40">
                <ChevronLeft size={15} />
              </button>
              <button onClick={() => setPage((p) => Math.min(p + 1, pages))} disabled={page >= pages || loading}
                aria-label="Page suivante" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 disabled:opacity-40">
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Gestion du BAT ─────────────────────────── */}
      {batModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 bg-blue-deep text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-blue-200">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">Gestion du Bon À Tirer (BAT)</h3>
                  <p className="text-xs text-blue-200 font-mono">Commande {batModalOrder.orderNumber || batModalOrder.id}</p>
                </div>
              </div>
              <button
                onClick={() => setBatModalOrder(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Order quick recap */}
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200/80 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-900">{batModalOrder.client}</p>
                  <p className="text-gray-500">{batModalOrder.product}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${STATUS_MAP[batModalOrder.status]?.cls}`}>
                    {STATUS_MAP[batModalOrder.status]?.label}
                  </span>
                </div>
              </div>

              {/* BAT Current Audit State */}
              {batModalOrder.batStatus === 'approved' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <CheckCircle2 size={15} /> BAT approuvé et signé par le client
                  </p>
                  <p className="text-emerald-700">
                    Cette épreuve a été validée pour impression le {batModalOrder.batApprovedAt ? new Date(batModalOrder.batApprovedAt).toLocaleDateString('fr-FR') : 'récemment'}.
                  </p>
                </div>
              )}

              {batModalOrder.batStatus === 'rejected' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
                  <p className="font-bold flex items-center gap-1.5 text-amber-950">
                    <AlertTriangle size={15} /> Le client a demandé des modifications :
                  </p>
                  <p className="italic bg-white/80 p-2.5 rounded-lg border border-amber-200">
                    &ldquo;{batModalOrder.batRejectedReason || 'Corrections demandées.'}&rdquo;
                  </p>
                  {batModalOrder.batCorrectionFileUrl && (
                    <a
                      href={batModalOrder.batCorrectionFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-amber-800 hover:underline"
                    >
                      <Download size={13} /> Télécharger le fichier correctif fourni par le client
                    </a>
                  )}
                </div>
              )}

              {/* Input BAT Recto */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  URL de l&apos;épreuve BAT (Recto ou principal) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={batUrlInput}
                    onChange={(e) => setBatUrlInput(e.target.value)}
                    placeholder="https://res.cloudinary.com/.../bat-recto.png"
                    className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-mid font-mono"
                  />
                  <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                    <UploadCloud size={14} />
                    <span>Uploader</span>
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, false)}
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                  </label>
                </div>
                {uploadingBat && <p className="text-[11px] text-blue-mid animate-pulse">Chargement en cours vers Cloudinary...</p>}
              </div>

              {/* Input BAT Verso */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  URL de l&apos;épreuve BAT (Verso - optionnel)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={batVersoUrlInput}
                    onChange={(e) => setBatVersoUrlInput(e.target.value)}
                    placeholder="https://res.cloudinary.com/.../bat-verso.png"
                    className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-mid font-mono"
                  />
                  <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                    <UploadCloud size={14} />
                    <span>Uploader</span>
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, true)}
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Input BAT Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Consignes et notes pré-presse pour le client
                </label>
                <textarea
                  rows={3}
                  value={batNotesInput}
                  onChange={(e) => setBatNotesInput(e.target.value)}
                  placeholder="Ex: Bords perdus ajustés de 3mm. Veuillez vérifier attentivement l'orthographe du numéro de téléphone avant validation..."
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-mid transition-all resize-none"
                />
              </div>

              {/* Quick Preview Link */}
              {batUrlInput && (
                <div className="flex items-center justify-between p-3 bg-blue-pale/50 rounded-xl border border-blue-mid/20 text-xs">
                  <span className="text-gray-600 truncate max-w-[320px]">Aperçu : {batUrlInput}</span>
                  <a
                    href={batUrlInput}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-mid font-bold hover:underline shrink-0"
                  >
                    <ExternalLink size={13} /> Tester le lien
                  </a>
                </div>
              )}

              {/* Feedback Alert */}
              {feedbackMsg && (
                <div className={`p-3 rounded-xl text-xs font-medium ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {feedbackMsg.text}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setBatModalOrder(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-white transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={handleSaveBat}
                disabled={savingBat || uploadingBat}
                className="px-5 py-2.5 bg-blue-mid hover:bg-blue-deep text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {savingBat ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={14} /> Envoyer le BAT au client
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
