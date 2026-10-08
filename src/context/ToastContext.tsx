'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, Info, X, LucideIcon } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

// ── Context ───────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextType | null>(null)

// ── Config visuelle par type ──────────────────────────────────────────
const TOAST_CONFIG: Record<ToastType, {
  icon: LucideIcon
  bg: string
  border: string
  iconColor: string
  titleColor: string
}> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-white',
    border: 'border-l-4 border-l-green-500',
    iconColor: 'text-green-500',
    titleColor: 'text-gray-900',
  },
  error: {
    icon: XCircle,
    bg: 'bg-white',
    border: 'border-l-4 border-l-red-500',
    iconColor: 'text-red-500',
    titleColor: 'text-gray-900',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-white',
    border: 'border-l-4 border-l-amber-500',
    iconColor: 'text-amber-500',
    titleColor: 'text-gray-900',
  },
  info: {
    icon: Info,
    bg: 'bg-white',
    border: 'border-l-4 border-l-blue-500',
    iconColor: 'text-blue-500',
    titleColor: 'text-gray-900',
  },
}

// ── Toast Item Component ──────────────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const config = TOAST_CONFIG[toast.type]
  const Icon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className={`relative flex items-start gap-3 w-full max-w-sm px-4 py-3.5 rounded-xl shadow-lg ${config.bg} ${config.border} border border-gray-100`}
    >
      <Icon size={20} className={`${config.iconColor} mt-0.5 shrink-0`} />
      <div className="flex-1 min-w-0 pr-2">
        <p className={`text-sm font-bold leading-snug ${config.titleColor}`}>{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-[2px] rounded-bl-xl ${
          toast.type === 'success' ? 'bg-green-400' :
          toast.type === 'error' ? 'bg-red-400' :
          toast.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
        }`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: (toast.duration || 4000) / 1000, ease: 'linear' }}
      />
    </motion.div>
  )
}

// ── Provider ──────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev.slice(-4), { id, type, title, message, duration }])
    setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  const value: ToastContextType = {
    success: (t, m) => addToast('success', t, m),
    error: (t, m) => addToast('error', t, m),
    warning: (t, m) => addToast('warning', t, m),
    info: (t, m) => addToast('info', t, m),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* ── Toast Container ── */}
      <div
        className="fixed bottom-[80px] md:bottom-6 right-4 z-[9999] flex flex-col gap-2 items-end"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
