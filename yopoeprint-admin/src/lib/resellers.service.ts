import { api } from './index'

// Contrat de l'API : GET/PATCH /admin/resellers (yopoeprint-api/src/modules/reseller)
export type ResellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export interface ResellerAccount {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  companyName: string | null
  status: ResellerStatus
  appliedAt: string | null
  profile: { contactName?: string; phone?: string; volume?: 'low' | 'medium' | 'high'; message?: string }
  revenue12m: number
  tier: { label: string; rate: number } | null
}

export const resellersService = {
  async list(status: ResellerStatus | 'all' = 'all'): Promise<ResellerAccount[]> {
    return api.get(`/admin/resellers?status=${status}`)
  },

  async decide(id: string, action: 'approve' | 'reject' | 'suspend'): Promise<{ id: string; status: ResellerStatus; role: string }> {
    return api.patch(`/admin/resellers/${id}`, { action })
  },
}
