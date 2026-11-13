'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, AlertCircle, Info, ChevronRight, CheckCircle2 } from 'lucide-react'
import { supervisionService, Alert } from '@/lib/supervision.service'

// Callouts AdminLTE : rouge (urgent), jaune (à surveiller), bleu (information)
const TONE: Record<Alert['severity'], { callout: string; Icon: typeof Info; icon: string }> = {
  high:   { callout: 'callout-danger',  Icon: AlertTriangle, icon: 'text-danger' },
  medium: { callout: 'callout-warning', Icon: AlertCircle,   icon: 'text-warning' },
  low:    { callout: 'callout-info',    Icon: Info,          icon: 'text-info' },
}

/** Retards et anomalies calculés par l'API (GET /admin/alerts), du plus urgent au moins urgent. */
export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    supervisionService.alerts().then(setAlerts).catch(() => setError(true))
  }, [])

  if (error) return null
  if (alerts === null) return <div className="placeholder-box mb-4" style={{ height: 64 }} aria-busy="true" />
  if (alerts.length === 0) {
    return (
      <div className="callout callout-success mb-4 d-flex align-items-center gap-2">
        <CheckCircle2 size={17} className="text-success" /> Aucun retard ni anomalie à signaler.
      </div>
    )
  }

  return (
    <section aria-labelledby="alerts-title" className="mb-2">
      <h2 id="alerts-title" className="h6 text-uppercase text-secondary fw-semibold">Alertes</h2>
      <div className="row">
        {alerts.map((a) => {
          const { callout, Icon, icon } = TONE[a.severity]
          return (
            <div key={a.id} className="col-lg-6">
              <Link href={a.href} className="text-reset text-decoration-none d-block">
                <div className={`callout ${callout} mb-3 d-flex align-items-start gap-3`}>
                  <Icon size={18} className={`flex-shrink-0 mt-1 ${icon}`} aria-hidden="true" />
                  <div className="min-w-0 flex-grow-1">
                    <h5 className="mb-1 fs-6"><span className="tabular-nums">{a.count}</span> · {a.title}</h5>
                    <p className="mb-0 small text-secondary">{a.hint}</p>
                    {a.sample.length > 0 && (
                      <p className="mb-0 small font-mono text-truncate text-secondary">
                        {a.sample.join(' · ')}{a.count > a.sample.length ? ' …' : ''}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-secondary flex-shrink-0 mt-1" />
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}
