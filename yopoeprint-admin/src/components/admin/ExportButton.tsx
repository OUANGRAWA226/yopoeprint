'use client'

import { useEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import { adminAuthService } from '@/lib/auth-admin.service'
import { supervisionService } from '@/lib/supervision.service'
import { Spinner } from '@/components/ui'

const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

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
  const ref = useRef<HTMLDivElement>(null)

  // Fermeture du menu au clic extérieur et sur Échap
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey) }
  }, [open])

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
      <span className="d-inline-flex flex-column align-items-end">
        <button type="button" onClick={run} disabled={busy} className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1">
          {busy ? <Spinner /> : <Download size={14} />} Exporter CSV
        </button>
        {error && <small role="alert" className="text-danger">{error}</small>}
      </span>
    )
  }

  return (
    <div ref={ref} className={`dropdown ${open ? 'show' : ''}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 dropdown-toggle">
        <Download size={14} /> Exporter CSV
      </button>
      <div className={`dropdown-menu dropdown-menu-end p-3 ${open ? 'show' : ''}`} style={{ width: 290, right: 0, left: 'auto' }}
        role="dialog" aria-label="Exporter les commandes">
        <p className="fw-semibold mb-2">Commandes passées entre</p>
        <div className="row g-2 mb-2">
          <div className="col-6">
            <label className="form-label small mb-1" htmlFor="exp-from">Du</label>
            <input id="exp-from" type="date" className="form-control form-control-sm" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="col-6">
            <label className="form-label small mb-1" htmlFor="exp-to">Au</label>
            <input id="exp-to" type="date" className="form-control form-control-sm" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <p className="form-text mt-0">Toutes les commandes de la période (un an maximum), ouvrable dans Excel.</p>
        {error && <div role="alert" className="alert alert-danger py-1 px-2 small">{error}</div>}
        <div className="d-grid">
          <button type="button" onClick={run} disabled={busy || !from || !to} className="btn btn-primary btn-sm d-inline-flex align-items-center justify-content-center gap-1">
            {busy ? <Spinner /> : <Download size={14} />} Télécharger
          </button>
        </div>
      </div>
    </div>
  )
}
