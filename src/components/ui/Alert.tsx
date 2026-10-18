import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

type Tone = 'error' | 'success' | 'info'

const TONES: Record<Tone, { box: string; icon: string; Icon: typeof Info }> = {
  error:   { box: 'bg-red-50 border-red-200 text-red-800',             icon: 'text-red-600',     Icon: AlertCircle },
  success: { box: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: 'text-emerald-700', Icon: CheckCircle2 },
  info:    { box: 'bg-gray-50 border-gray-200 text-gray-700',          icon: 'text-gray-500',    Icon: Info },
}

/** Message d'état unique pour les formulaires : erreur (annoncée immédiatement), succès ou information. */
export function Alert({ tone = 'error', children, className = '' }: {
  tone?: Tone
  children: React.ReactNode
  className?: string
}) {
  const { box, icon, Icon } = TONES[tone]
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 p-4 border rounded-xl text-sm font-medium ${box} ${className}`}
    >
      <Icon size={18} className={`shrink-0 mt-0.5 ${icon}`} aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
