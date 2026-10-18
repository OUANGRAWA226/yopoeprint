import { api } from './api'

// ─── Types (contrat de l'API : yopoeprint-api/src/modules/quotes) ───
export type QuoteStatus = 'new' | 'processing' | 'sent' | 'accepted' | 'rejected'

export interface CreateQuotePayload {
  fullName: string
  email: string
  phone: string
  company?: string
  profile: string
  product: string
  quantity: string
  format?: string
  description: string
  budget: string
  deadline: string
  hasFile?: boolean
  fileDesc?: string
  files?: string[]   // URLs renvoyées par POST /upload
}

export interface Quote {
  id: string
  reference: string
  title: string      // "<produit> — <quantité>"
  details: string    // description du besoin
  status: QuoteStatus
  price?: number     // montant proposé en FCFA
  createdAt: string
  updatedAt?: string
  client: { name: string; email: string; phone: string; company?: string | null }
  profile: string
  product: string
  quantity: string
  format?: string | null
  description: string
  budget: string
  deadline: string
  hasFile: boolean
  fileDesc?: string | null
  files: string[]
  adminNotes?: string | null   // admin uniquement
}

// ─── Quotes Service ───────────────────────────────────────────
export const quotesService = {

  // Créer une demande de devis (connexion facultative)
  async create(data: CreateQuotePayload) {
    return await api.post('/quotes', data)
  },

  // Mes devis (Client)
  async getMyQuotes(): Promise<Quote[]> {
    const data = await api.get('/quotes/my-quotes')
    return Array.isArray(data) ? data : data?.data || []
  },

  // Tous les devis (Admin)
  async getAllQuotes(query?: { status?: string; page?: number; limit?: number }): Promise<Quote[]> {
    const params = new URLSearchParams()
    if (query?.status) params.append('status', query.status)
    if (query?.page) params.append('page', String(query.page))
    params.append('limit', String(query?.limit || 200))
    const data = await api.get(`/quotes?${params.toString()}`)
    return Array.isArray(data) ? data : data?.data || []
  },

  // Détail d'un devis (Admin)
  async getById(id: string): Promise<Quote> {
    return await api.get(`/quotes/${id}`)
  },

  // Changer le statut / chiffrer un devis (Admin)
  async updateStatus(id: string, payload: { status: QuoteStatus; price?: number; adminNotes?: string }): Promise<Quote> {
    return await api.patch(`/quotes/${id}/status`, payload)
  }
}
