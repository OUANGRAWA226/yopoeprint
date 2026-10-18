import { api } from './index'

// Contrat de l'API : GET/PATCH /admin/users (yopoeprint-api/src/modules/users)
export type ClientSegment = 'VIP' | 'Actif' | 'Nouveau' | 'Inactif'

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  city?: string
  role: string
  isActive: boolean
  createdAt: string
  totalOrders: number
  totalSpent: number        // commandes payées, en FCFA
  lastOrderAt?: string | null
  segment: ClientSegment
}

export interface ClientDetail extends Client {
  addresses: { id: string; fullName: string; phone: string; street: string; neighborhood?: string; city: string; isDefault: boolean }[]
  orders: {
    id: string
    orderNumber: string
    total: number
    status: string
    paymentStatus: string
    createdAt: string
    items: { productName: string; quantity: number }[]
  }[]
}

export interface ClientsResponse {
  data: Client[]
  total: number
  page: number
  limit: number
}

export const clientsService = {
  async getAll(filters: { search?: string; segment?: string; page?: number; limit?: number } = {}): Promise<ClientsResponse> {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.segment && filters.segment !== 'all') params.set('segment', filters.segment)
    params.set('page', String(filters.page || 1))
    params.set('limit', String(filters.limit || 50))
    return api.get(`/admin/users?${params.toString()}`)
  },

  async getById(id: string): Promise<ClientDetail> {
    return api.get(`/admin/users/${id}`)
  },

  async setActive(id: string, isActive: boolean): Promise<ClientDetail> {
    return api.patch(`/admin/users/${id}`, { isActive })
  },
}
