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
    fullName: string
    email: string
    phone: string
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

export const adminOrdersService = {
  // Liste paginée de toutes les commandes
  async getAll(query?: { status?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams()
    if (query?.status && query.status !== 'all') params.append('status', query.status)
    if (query?.page) params.append('page', String(query.page))
    if (query?.limit) params.append('limit', String(query.limit))
    const qs = params.toString()
    return await api.get(`/orders${qs ? `?${qs}` : ''}`)
  },

  // Détail d'une commande
  async getById(id: string): Promise<Order> {
    return await api.get(`/orders/${id}`)
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
