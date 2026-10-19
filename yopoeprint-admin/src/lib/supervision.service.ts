import { api } from './index'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

// Contrats de l'API : yopoeprint-api/src/modules/{supervision,payments,mail}
export interface Alert {
  id: string
  severity: 'high' | 'medium' | 'low'
  count: number
  title: string
  hint: string
  href: string
  sample: string[]
}

export interface PaymentsOverview {
  paidCount7d: number
  paidAmount7d: number
  stale: number
  failed: number
  transfers: number
  anomalies7d: number
}

export interface PaymentIssue {
  reason: 'stale' | 'failed' | 'transfer'
  orderId: string
  orderNumber: string
  customer: string
  email: string | null
  total: number
  paymentMethod: string
  paymentStatus: string
  transactionId: string | null
  createdAt: string
}

export interface PaymentEvent {
  id: string
  orderId: string | null
  orderNumber: string | null
  transactionId: string | null
  type: string
  source: string
  amount: number | null
  message: string | null
  actorEmail: string | null
  createdAt: string
}

export interface EmailLog {
  id: string
  toEmail: string
  subject: string
  template: string
  status: 'sent' | 'failed' | 'simulated'
  providerId: string | null
  error: string | null
  createdAt: string
}

type Page<T> = { data: T[]; total: number; page: number; limit: number }
const qs = (params: Record<string, string | number | undefined>) =>
  Object.entries(params).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')

/** Télécharge un export CSV (requête authentifiée, enregistrement par le navigateur). */
async function download(path: string, fallbackName: string) {
  const token = localStorage.getItem('admin_auth_token')
  const res = await fetch(`${BASE}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.message || `Export impossible (erreur ${res.status})`)
  }
  const name = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') || '')?.[1] || fallbackName
  const url = URL.createObjectURL(await res.blob())
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const supervisionService = {
  alerts: () => api.get<Alert[]>('/admin/alerts'),

  paymentsOverview: () => api.get<PaymentsOverview>('/admin/payments/overview'),
  paymentIssues: () => api.get<PaymentIssue[]>('/admin/payments/issues'),
  paymentEvents: (p: { type?: string; page?: number; limit?: number }) => api.get<Page<PaymentEvent>>(`/admin/payments/events?${qs(p)}`),
  recheckPayment: (orderId: string) => api.post<{ status: string }>(`/admin/payments/${orderId}/recheck`, {}),
  markPaid: (orderId: string, reference: string) => api.post<{ status: string }>(`/admin/payments/${orderId}/mark-paid`, { reference }),

  emails: (p: { status?: string; page?: number; limit?: number }) =>
    api.get<Page<EmailLog> & { last7d: Record<string, number> }>(`/admin/emails?${qs(p)}`),

  exportOrders: (from?: string, to?: string) => download(`/admin/exports/orders.csv?${qs({ from, to })}`, 'commandes.csv'),
  exportClients: () => download('/admin/exports/clients.csv', 'clients.csv'),
}
