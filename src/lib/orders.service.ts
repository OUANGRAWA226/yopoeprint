import { api } from './api'

// ─── Types ────────────────────────────────────────────────────
export interface OrderItemPayload {
 productId: string
 quantity: number
 formatId: string
 paperId: string
 finishId: string
 rectoverso: boolean
 designFileUrl?: string
}

export interface DeliveryAddress {
 fullName: string
 phone: string
 street: string
 neighborhood: string
 city: string
}

export interface CreateOrderPayload {
 items: OrderItemPayload[]
 deliveryAddress: DeliveryAddress
 paymentMethod: 'orange_money' | 'moov_money' | 'visa' | 'mastercard' | 'virement'
 promoCode?: string
 customerNotes?: string
}

export interface Order {
  id: string
  name?: string
  amount: number
  status: string
  date?: string
  createdAt?: string
  items?: any[]
}

// ─── Orders Service ───────────────────────────────────────────
export const ordersService = {

 // Créer une commande
 async create(data: CreateOrderPayload) {
 return await api.post('/orders', data)
 },

  // Mes commandes
  async getMyOrders(query?: { status?: string; page?: number }) {
    const params = new URLSearchParams()
    if (query?.status) params.append('status', query.status)
    if (query?.page) params.append('page', String(query.page))
    const queryString = params.toString()
    const path = `/orders/my-orders${queryString ? `?${queryString}` : ''}`
    return await api.get(path)
  },

  // Toutes les commandes (Admin)
  async getAllOrders(query?: { status?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams()
    if (query?.status) params.append('status', query.status)
    if (query?.page) params.append('page', String(query.page))
    if (query?.limit) params.append('limit', String(query.limit))
    const queryString = params.toString()
    const path = `/orders${queryString ? `?${queryString}` : ''}`
    const data = await api.get(path)
    return Array.isArray(data) ? data : data?.data || []
  },

 // Détail d'une commande
 async getById(id: string) {
 return await api.get(`/orders/my-orders/${id}`)
 },

 // Suivi public (sans connexion) par numéro de commande
 async trackOrder(orderNumber: string) {
 return await api.get(`/orders/track/${orderNumber}`)
 },
}
