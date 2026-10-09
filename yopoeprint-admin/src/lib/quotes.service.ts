import { api } from './index'

// ─── Types ────────────────────────────────────────────────────
export interface QuoteItem {
  name: string
  description: string
  quantity: number
}

export interface CreateQuotePayload {
  title: string
  details: string
  items?: QuoteItem[]
}

export interface Quote {
  id: string
  title: string
  details: string
  status: 'pending' | 'processed' | 'rejected'
  price?: number
  createdAt: string
  items?: QuoteItem[]
}

// ─── Quotes Service ───────────────────────────────────────────
export const quotesService = {
  // Créer un devis
  async create(data: CreateQuotePayload) {
    return await api.post('/quotes', data)
  },

  // Mes devis (Client)
  async getMyQuotes(): Promise<Quote[]> {
    const data = await api.get('/quotes/my-quotes')
    return Array.isArray(data) ? data : data?.data || []
  },

  // Tous les devis (Admin)
  async getAllQuotes(query?: { status?: string; page?: number }): Promise<Quote[]> {
    const params = new URLSearchParams()
    if (query?.status) params.append('status', query.status)
    if (query?.page) params.append('page', String(query.page))
    const queryString = params.toString()
    
    const data = await api.get(`/quotes${queryString ? `?${queryString}` : ''}`)
    return Array.isArray(data) ? data : data?.data || []
  },

  // Détail d'un devis
  async getById(id: string): Promise<Quote> {
    return await api.get(`/quotes/${id}`)
  },

  // Mettre à jour un devis (Admin)
  async updateStatus(id: string, payload: { status: string; price?: number }) {
    return await api.patch(`/quotes/${id}/status`, payload)
  }
}
