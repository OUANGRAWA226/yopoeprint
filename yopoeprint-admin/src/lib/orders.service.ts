import { api } from './index'

export interface OrderItem {
  productId: string
  productName: string
  productSlug?: string
  productEmoji?: string
  quantity: number
  format: string
  paper: string
  finish: string
  rectoverso: boolean
  designFileUrl?: string
  unitPrice: number
  totalPrice: number
}

export interface DeliveryAddress {
  fullName: string
  phone: string
  street: string
  neighborhood: string
  city: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  user?: {
    id: string
    firstName: string
    lastName: string
    fullName: string
    email: string
    phone?: string | null
  }
  status: string
  items: OrderItem[]
  subtotal: number
  deliveryCost: number
  discount: number
  total: number
  deliveryAddress: DeliveryAddress
  paymentMethod?: string
  paymentStatus?: string
  paymentTransactionId?: string
  promoCode?: string
  // Marque blanche (revendeurs) : colis neutre, bordereau au nom de l'expéditeur
  whiteLabel?: boolean
  whiteLabelSender?: { companyName: string; phone: string; address: string; email?: string; logoUrl?: string; includeInvoice?: boolean } | null
  internalNotes?: string
  customerNotes?: string
  estimatedDelivery?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
  // BAT Interactif
  batUrl?: string
  batVersoUrl?: string
  batStatus?: 'pending' | 'approved' | 'rejected' | null
  batNotes?: string
  batApprovedAt?: string
  batApprovedBy?: string
  batRejectedReason?: string
  batCorrectionFileUrl?: string
  batHistory?: Array<{
    action: string
    date: string
    notes?: string
    actor?: string
  }>
}

export interface UploadBatPayload {
  batUrl: string
  batVersoUrl?: string
  batNotes?: string
}

export interface OrdersPage {
  data: Order[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface PeriodTotals {
  orders: number
  paidOrders: number
  revenue: number      // FCFA encaissés (commandes payées)
  newClients: number
}

export interface AdminStats {
  days: number
  from: string
  to: string
  current: PeriodTotals & { averageOrder: number }
  previous: PeriodTotals
  bucket: 'day' | 'week'
  revenueSeries: { date: string; revenue: number; orders: number }[]
  paymentBreakdown: { method: string; orders: number; amount: number }[]
  statusCounts: Record<string, number>
  todo: { toConfirm: number; batPending: number; batRejected: number; quotesNew: number }
  recentOrders: Order[]
}

export const adminOrdersService = {
  // Liste paginée de toutes les commandes
  async getAll(query?: { status?: string; batStatus?: string; page?: number; limit?: number; search?: string }): Promise<OrdersPage> {
    const params = new URLSearchParams()
    if (query?.status && query.status !== 'all') params.append('status', query.status)
    if (query?.page) params.append('page', String(query.page))
    if (query?.limit) params.append('limit', String(query.limit))
    if (query?.search) params.append('search', query.search)
    if (query?.batStatus) params.append('batStatus', query.batStatus)
    const qs = params.toString()
    return await api.get(`/orders${qs ? `?${qs}` : ''}`)
  },

  // Indicateurs du tableau de bord
  async getStats(days: 7 | 30 | 90 = 30): Promise<AdminStats> {
    return await api.get(`/orders/admin/stats?days=${days}`)
  },

  // Détail d'une commande (route partagée client / staff)
  async getById(id: string): Promise<Order> {
    return await api.get(`/orders/my-orders/${id}`)
  },

  // Mise à jour du statut
  async updateStatus(id: string, status: string, internalNotes?: string) {
    return await api.patch(`/orders/${id}/status`, { status, internalNotes })
  },

  // Déposer / Assigner un BAT pour le client
  async uploadBat(id: string, payload: UploadBatPayload) {
    return await api.post(`/orders/${id}/bat`, payload)
  },
}
