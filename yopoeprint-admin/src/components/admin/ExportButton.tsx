'use client'

import { useState } from 'react'
import { Download, Loader2, X } from 'lucide-react'
import { adminAuthService } from '@/lib/auth-admin.service'
import { supervisionService } from '@/lib/supervision.service'

const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const btn = 'flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-blue-mid transition-all disabled:opacity-50'

/**
 * Export CSV généré par l'API (toutes les données de la période, pas seulement la page affichée).
 * Données personnelles : réservé aux administrateurs, chaque export est inscrit au journal des actions.
 */
export function ExportButton({ kind }: { kind: 'orders' | 'clients' }) {
  const role = String(adminAuthService.getCurrentUser()?.role || '').toLowerCase()
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState(() => isoDay(new Date(Date.now() - 30 * 24 * 3600_000)))
  const [to, setTo] = useState(() => isoDay(new Date()))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (role !== 'superadmin' && role !== 'admin') return null

  const run = async () => {
    setBusy(true); setError('')
    try {
      if (kind === 'orders') await supervisionService.exportOrders(from, to)
      else await supervisionService.exportClients()
      setOpen(false)
    } catch (e: any) {
      setError(e?.message || 'Export impossible')
    } finally {
      setBusy(false)
    }
  }

  if (kind === 'clients') {
    return (
      <div className="flex flex-col items-end gap-1">
        <button type="button" onClick={run} disabled={busy} className={btn}>
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Exporter CSV
        </button>
        {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      </div>
    )
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={btn}>
        <Download size={15} /> Exporter CSV
      </button>
      {open && (
        <div role="dialog" aria-label="Exporter les commandes" className="absolute right-0 top-full mt-2 z-30 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-blue-deep">Commandes passées entre</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="p-1 text-gray-400 hover:text-gray-700"><X size={15} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-semibold text-gray-700 space-y-1"><span>Du</span>
              <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm" /></label>
            <label className="text-xs font-semibold text-gray-700 space-y-1"><span>Au</span>
              <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm" /></label>
          </div>
          <p className="text-xs text-gray-500">Toutes les commandes de la période (un an maximum), ouvrable dans Excel.</p>
          {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
          <button type="button" onClick={run} disabled={busy || !from || !to}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-deep text-white text-sm font-bold hover:bg-blue-mid disabled:opacity-60">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Télécharger
          </button>
        </div>
      )}
    </div>
  )
}
