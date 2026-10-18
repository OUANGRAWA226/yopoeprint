import { api } from './index'

// Contrat de l'API : yopoeprint-api/src/modules/promos
export interface Promo {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrder: number
  maxUses: number | null
  oncePerCustomer: boolean
  description: string | null
  active: boolean
  featured: boolean
  startDate: string | null
  endDate: string | null
  uses: number          // commandes passées avec le code (hors annulées / remboursées)
  paidUses: number      // dont payées
  discountTotal: number // remises accordées sur les commandes payées (FCFA)
}

export type PromoInput = Omit<Promo, 'id' | 'uses' | 'paidUses' | 'discountTotal'>

export const promosService = {
  list: () => api.get<Promo[]>('/admin/promos'),
  create: (data: PromoInput) => api.post<Promo>('/admin/promos', data),
  update: (id: string, data: Partial<PromoInput>) => api.patch<Promo>(`/admin/promos/${id}`, data),
  remove: (id: string) => api.delete(`/admin/promos/${id}`),
}
