'use client'

import { useState, useEffect } from 'react'
import {
  Search, Eye, ChevronDown, Download, Filter,
  ShieldCheck, CheckCircle2, AlertTriangle, UploadCloud,
  X, Send, ExternalLink, RefreshCw, FileText
} from 'lucide-react'
import Link from 'next/link'
import { adminOrdersService, Order } from '@/lib/orders.service'
import { cloudinaryService } from '@/lib/cloudinary.service'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:       { label: 'En attente',    cls: 'bg-yellow-100 text-yellow-700' },
  confirmed:     { label: 'Confirmée',     cls: 'bg-blue-100 text-blue-700' },
  bat_pending:   { label: 'BAT à valider', cls: 'bg-amber-100 text-amber-800' },
  in_production: { label: 'En production', cls: 'bg-purple-100 text-purple-700' },
  ready:         { label: 'Prête',         cls: 'bg-emerald-100 text-emerald-700' },
  shipped:       { label: 'Expédiée',      cls: 'bg-indigo-100 text-indigo-700' },
  delivered:     { label: 'Livrée',        cls: 'bg-green-100 text-green-700' },
  cancelled:     { label: 'Annulée',       cls: 'bg-red-100 text-red-600' },
}

const INITIAL_DEMO_ORDERS = Array.from({ length: 15 }, (_, i) => {
  const statuses = Object.keys(STATUS_MAP)
  const status = i === 1 ? 'bat_pending' : statuses[i % statuses.length]
  return {
    id:          `YP-2025-00${1421 - i}`,
    orderNumber: `YP-2025-00${1421 - i}`,
    client:      ['Salimata Kaboré', 'Oumar Traoré', 'Fatimata Diallo', 'Ibrahim Sawadogo', 'Aminata Zongo'][i % 5],
    phone:       '+226 7' + (Math.floor(Math.random() * 9) + 1) + ' ' + Math.floor(Math.random() * 90 + 10) + ' ' + Math.floor(Math.random() * 90 + 10) + ' ' + Math.floor(Math.random() * 90 + 10),
    product:     ['Flyer A5 × 1000', 'Carte de visite × 500', 'Roll-up × 2', 'T-shirt × 50', 'Brochure × 200'][i % 5],
    total:       [17000, 12400, 56000, 225000, 92500][i % 5],
    status,
    payment:     ['orange_money', 'moov_money', 'card'][i % 3],
    date:        `${12 - (i % 10)} mars 2025`,
    zone:        ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou'][i % 3],
    batUrl:      i === 1 ? 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80' : undefined,
    batStatus:   i === 1 ? ('pending' as const) : null,
    batNotes:    i === 1 ? 'Bords perdus de 3mm ajustés par notre studio pré-presse.' : undefined,
  }
})

export default function AdminCommandesPage() {
  const [orders,    setOrders]    = useState<any[]>(INITIAL_DEMO_ORDERS)
  const [loading,   setLoading]   = useState(false)
  const [search,    setSearch]    = useState('')
  const [status,    setStatus]    = useState('all')
  const [selected,  setSelected]  = useState<string[]>([])

  // Modal BAT
  const [batModalOrder, setBatModalOrder] = useState<any | null>(null)
  const [batUrlInput, setBatUrlInput] = useState('')
  const [batVersoUrlInput, setBatVersoUrlInput] = useState('')
  const [batNotesInput, setBatNotesInput] = useState('')
  const [uploadingBat, setUploadingBat] = useState(false)
  const [savingBat, setSavingBat] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Charger les commandes depuis l'API si disponible
  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await adminOrdersService.getAll()
      if (res && (Array.isArray(res) || res.data)) {
        const list = Array.isArray(res) ? res : res.data
        if (list.length > 0) {
          const formatted = list.map((o: any) => ({
            id:          o.id,
            orderNumber: o.orderNumber || o.id,
            client:      o.user?.fullName || o.deliveryAddress?.fullName || 'Client',
            phone:       o.user?.phone || o.deliveryAddress?.phone || '—',
            product:     o.items?.map((it: any) => it.productName).join(', ') || 'Articles',
            total:       o.total || 0,
            status:      o.status || 'pending',
            payment:     o.paymentMethod || 'orange_money',
            date:        new Date(o.createdAt || Date.now()).toLocaleDateString('fr-FR'),
            zone:        o.deliveryAddress?.city || 'Ouagadougou',
            batUrl:      o.batUrl,
            batVersoUrl: o.batVersoUrl,
            batStatus:   o.batStatus,
            batNotes:    o.batNotes,
            batApprovedAt: o.batApprovedAt,
            batRejectedReason: o.batRejectedReason,
            batCorrectionFileUrl: o.batCorrectionFileUrl,
          }))
          setOrders(formatted)
        }
      }
    } catch (err) {
      // Fallback gracieux aux données démo
      console.warn('Backend API non joignable, affichage du mode démo:', err)
    } finally {
      setLoading(false)
    }
  }

  const openBatModal = (order: any) => {
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
    if (!batUrlInput.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Veuillez saisir ou uploader une URL de maquette BAT.' })
      return
    }

    setSavingBat(true)
    setFeedbackMsg(null)
    try {
      // Tenter d'appeler l'API NestJS
      try {
        await adminOrdersService.uploadBat(batModalOrder.id, {
          batUrl: batUrlInput.trim(),
          batVersoUrl: batVersoUrlInput.trim() || undefined,
          batNotes: batNotesInput.trim() || undefined,
        })
      } catch (apiErr) {
        console.warn('API NestJS locale hors ligne, mise à jour de l\'état local:', apiErr)
      }

      // Mettre à jour localement
      setOrders((prev) => prev.map((o) => {
        if (o.id === batModalOrder.id) {
          return {
            ...o,
            status: 'bat_pending',
            batUrl: batUrlInput.trim(),
            batVersoUrl: batVersoUrlInput.trim() || undefined,
            batNotes: batNotesInput.trim() || undefined,
            batStatus: 'pending',
          }
        }
        return o
      }))

      setFeedbackMsg({ type: 'success', text: 'BAT envoyé au client ! Statut passé à "BAT à valider".' })
      setTimeout(() => {
        setBatModalOrder(null)
      }, 1200)
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Impossible d\'enregistrer le BAT.' })
    } finally {
      setSavingBat(false)
    }
  }

  const filtered = orders.filter((o) =>
    (status === 'all' || o.status === status) &&
    (!search || (o.id || '').includes(search) || (o.client || '').toLowerCase().includes(search.toLowerCase()))
  )

  const toggleSelect = (id: string) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((o) => o.id))

  return (
    <div className="space-y-5">

      {/* ── Stats statuts ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
        {Object.entries(STATUS_MAP).map(([key, { label, cls }]) => {
          const count = orders.filter((o) => o.status === key).length
          return (
            <button key={key}
              onClick={() => setStatus(status === key ? 'all' : key)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                status === key ? 'border-blue-mid bg-blue-pale' : 'bg-white border-gray-100 hover:border-blue-mid/40'
              }`}
            >
              <p className="font-display font-bold text-blue-deep text-lg">{count}</p>
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
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-mid transition-all" />
        </div>

        <button
          onClick={loadOrders}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:border-blue-mid transition-all"
          title="Rafraîchir"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>

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

        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-blue-mid transition-all">
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
                {['Commande', 'Client', 'Produit', 'Paiement', 'Total', 'Statut', 'BAT', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((o) => (
                <tr key={o.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    selected.includes(o.id) ? 'bg-blue-pale/50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(o.id)}
                      onChange={() => toggleSelect(o.id)}
                      className="accent-blue-mid cursor-pointer" />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-mid font-bold whitespace-nowrap">
                    {o.orderNumber || o.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-medium text-blue-deep">{o.client}</p>
                    <p className="text-[10px] text-gray-400">{o.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs max-w-[200px] truncate">{o.product}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium capitalize">
                      {o.payment?.replace('_', ' ') || 'OM'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-mid whitespace-nowrap">
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
                        <AlertTriangle size={12} /> Rejeté
                      </span>
                    ) : o.batUrl || o.status === 'bat_pending' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        <ShieldCheck size={12} /> En attente
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-medium">Non assigné</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{o.date}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openBatModal(o)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                          o.batUrl
                            ? 'bg-blue-pale text-blue-mid hover:bg-blue-mid hover:text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-blue-mid hover:text-white'
                        }`}
                        title="Gérer et déposer le Bon À Tirer"
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
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-400">
          <span>{filtered.length} commande(s)</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button key={p}
                className={`w-7 h-7 rounded-lg font-bold transition-all ${
                  p === 1 ? 'bg-blue-mid text-white' : 'hover:bg-gray-200 text-gray-500'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
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
