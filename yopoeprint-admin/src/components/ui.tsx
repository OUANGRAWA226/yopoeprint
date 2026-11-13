'use client'

// Composants AdminLTE 4 partagés par les pages du back-office (balisage officiel, React pur)
import { ReactNode, useEffect, useId } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, X } from 'lucide-react'

type Variant = 'primary' | 'navy' | 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'

/** Carte AdminLTE : en-tête (titre, icône, outils à droite), corps, pied. */
export function Card({
  title, icon, tools, children, footer, variant = 'primary', outline = true,
  bodyClassName = '', noPadding = false, className = '', id,
}: {
  title?: ReactNode
  icon?: ReactNode
  tools?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  variant?: Variant
  outline?: boolean
  bodyClassName?: string
  noPadding?: boolean
  className?: string
  id?: string
}) {
  return (
    <div id={id} className={`card card-${variant} ${outline ? 'card-outline' : ''} mb-4 ${className}`}>
      {(title || tools) && (
        <div className="card-header">
          {title && (
            <h3 className="card-title d-inline-flex align-items-center gap-2">
              {icon}{title}
            </h3>
          )}
          {tools && <div className="card-tools d-flex align-items-center gap-2">{tools}</div>}
        </div>
      )}
      {children !== undefined && <div className={`card-body ${noPadding ? 'p-0' : ''} ${bodyClassName}`}>{children}</div>}
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  )
}

/** Tuile KPI « small-box » (valeur, libellé, icône, lien de pied). */
export function SmallBox({
  value, label, icon, color = 'navy', href, linkText = 'Voir le détail', extra,
}: {
  value: ReactNode
  label: ReactNode
  icon: ReactNode
  color?: 'navy' | 'gold' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
  href?: string
  linkText?: string
  extra?: ReactNode
}) {
  const light = color === 'gold' || color === 'warning'
  return (
    <div className={`small-box text-bg-${color}`}>
      <div className="inner">
        <h3 className="tabular-nums text-truncate">{value}</h3>
        <p className="mb-1">{label}</p>
        {extra}
      </div>
      <span className="small-box-icon" aria-hidden="true">{icon}</span>
      {href && (
        <Link href={href}
          className={`small-box-footer ${light ? 'link-dark' : 'link-light'} link-underline-opacity-0 link-underline-opacity-50-hover`}>
          {linkText} →
        </Link>
      )}
    </div>
  )
}

/** Boîte d'information « info-box » (icône colorée, libellé, nombre). */
export function InfoBox({
  icon, label, value, color = 'primary', href, muted = false, children,
}: {
  icon: ReactNode
  label: ReactNode
  value: ReactNode
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
  href?: string
  muted?: boolean
  children?: ReactNode
}) {
  const body = (
    <div className={`info-box mb-3 ${muted ? 'opacity-75' : ''}`}>
      <span className={`info-box-icon text-bg-${color} shadow-sm`} aria-hidden="true">{icon}</span>
      <div className="info-box-content">
        <span className="info-box-text text-wrap">{label}</span>
        <span className="info-box-number tabular-nums">{value}</span>
        {children}
      </div>
    </div>
  )
  return href ? <Link href={href} className="text-reset text-decoration-none d-block">{body}</Link> : body
}

/** Message d'erreur avec bouton « Réessayer ». */
export function ErrorAlert({ message, onRetry, className = '' }: { message: string; onRetry?: () => void; className?: string }) {
  if (!message) return null
  return (
    <div role="alert" className={`alert alert-danger d-flex align-items-center justify-content-between gap-3 ${className}`}>
      <span className="d-inline-flex align-items-center gap-2"><AlertTriangle size={16} aria-hidden="true" />{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1">
          <RefreshCw size={13} /> Réessayer
        </button>
      )}
    </div>
  )
}

export function Spinner({ className = '' }: { className?: string }) {
  return <span className={`spinner-border spinner-border-sm ${className}`} role="status" aria-hidden="true" />
}

/** Ligne de tableau d'attente ou de liste vide. */
export function TableMessage({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center text-secondary py-5">{children}</td>
    </tr>
  )
}

export function LoadingRow({ colSpan }: { colSpan: number }) {
  return <TableMessage colSpan={colSpan}><Spinner className="me-2" />Chargement…</TableMessage>
}

/** Fenêtre modale Bootstrap contrôlée par React (Échap et clic sur le fond la ferment). */
export function Modal({
  open, title, onClose, children, footer, size,
}: {
  open: boolean
  title: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'lg' | 'xl'
}) {
  const titleId = useId()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
        <div className={`modal-dialog modal-dialog-scrollable modal-dialog-centered ${size ? `modal-${size}` : ''}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id={titleId}>{title}</h5>
              <button type="button" className="btn-close" aria-label="Fermer" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  )
}

/** Bouton de fermeture discret (cartes, panneaux). */
export function CloseButton({ onClick, label = 'Fermer' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="btn btn-tool" aria-label={label} onClick={onClick}><X size={16} /></button>
  )
}

/** Pagination Bootstrap (pages numérotées à partir de 1). */
export function Pager({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null
  const around = [page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages)
  const items = Array.from(new Set([1, ...around, pages])).sort((a, b) => a - b)
  return (
    <nav aria-label="Pagination">
      <ul className="pagination pagination-sm m-0">
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(page - 1)} disabled={page <= 1}>«</button>
        </li>
        {items.map((p, i) => (
          <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
            {i > 0 && p - items[i - 1] > 1 && <span className="page-link border-0 bg-transparent">…</span>}
            <button className="page-link" onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}>{p}</button>
          </li>
        ))}
        <li className={`page-item ${page >= pages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(page + 1)} disabled={page >= pages}>»</button>
        </li>
      </ul>
    </nav>
  )
}
