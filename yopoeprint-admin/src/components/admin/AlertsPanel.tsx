'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, AlertCircle, Info, ChevronRight, CheckCircle2 } from 'lucide-react'
import { supervisionService, Alert } from '@/lib/supervision.service'

const TONE: Record<Alert['severity'], { box: string; icon: string; Icon: typeof Info }> = {
  high:   { box: 'border-red-200 bg-red-50/60',     icon: 'text-red-600',   Icon: AlertTriangle },
  medium: { box: 'border-amber-200 bg-amber-50/60', icon: 'text-amber-600', Icon: AlertCircle },
  low:    { box: 'border-slate-200 bg-white',       icon: 'text-slate-500', Icon: Info },
}

/** Retards et anomalies calculés par l'API (GET /admin/alerts), du plus urgent au moins urgent. */
export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    supervisionService.alerts().then(setAlerts).catch(() => setError(true))
  }, [])

  if (error) return null
  if (alerts === null) return <div className="h-16 rounded-2xl bg-white border border-slate-200/70 animate-pulse" aria-busy="true" />
  if (alerts.length === 0) {
    return (
      <p className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 text-sm text-emerald-800">
        <CheckCircle2 size={16} /> Aucun retard ni anomalie à signaler.
      </p>
    )
  }

  return (
    <section aria-labelledby="alerts-title" className="space-y-2">
      <h2 id="alerts-title" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alertes</h2>
      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {alerts.map((a) => {
          const { box, icon, Icon } = TONE[a.severity]
          return (
            <li key={a.id}>
              <Link href={a.href} className={`flex items-start gap-3 p-3.5 rounded-2xl border hover:border-blue-mid/40 transition-colors ${box}`}>
                <Icon size={18} className={`shrink-0 mt-0.5 ${icon}`} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-blue-deep">
                    <span className="tabular-nums">{a.count}</span> · {a.title}
                  </span>
                  <span className="block text-xs text-slate-600">{a.hint}</span>
                  {a.sample.length > 0 && (
                    <span className="block text-xs text-slate-500 font-mono mt-0.5 truncate">
                      {a.sample.join(' · ')}{a.count > a.sample.length ? ' …' : ''}
                    </span>
                  )}
                </span>
                <ChevronRight size={16} className="text-slate-300 shrink-0 mt-0.5" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
