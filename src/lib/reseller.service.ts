import { api } from './api'

// Contrat de l'API : yopoeprint-api/src/modules/reseller
export type ResellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | null

export interface ResellerTierInfo {
  id: 'partenaire' | 'gold' | 'platinum'
  label: string
  rate: number            // remise en %
  minRevenue?: number     // CA payé sur 12 mois pour l'atteindre (FCFA)
}

export interface WhiteLabelSender {
  companyName: string
  phone: string
  address: string
  email?: string
  logoUrl?: string
  includeInvoice?: boolean
}

export interface ResellerMe {
  status: ResellerStatus
  companyName: string | null
  appliedAt: string | null
  isReseller: boolean
  tier: ResellerTierInfo | null
  whiteLabel: WhiteLabelSender | null
  tiers: ResellerTierInfo[]
}

export interface ResellerStats {
  companyName: string | null
  tier: ResellerTierInfo
  nextTier: ResellerTierInfo | null
  progressToNextTier: number
  amountNeededForNextTier: number
  revenue12m: number
  paidOrders12m: number
  savingsThisMonth: number
  savings12m: number
  activeOrdersCount: number
  whiteLabelConfigured: boolean
}

export interface ResellerApplication {
  companyName: string
  contactName?: string
  phone: string
  volume: 'low' | 'medium' | 'high'
  message?: string
}

export const resellerService = {
  async getMe(): Promise<ResellerMe> {
    return api.get('/reseller/me')
  },

  async apply(data: ResellerApplication): Promise<ResellerMe> {
    return api.post('/reseller/apply', data)
  },

  async getStats(): Promise<ResellerStats> {
    return api.get('/reseller/stats')
  },

  async updateWhiteLabel(sender: WhiteLabelSender): Promise<{ whiteLabel: WhiteLabelSender }> {
    return api.patch('/reseller/white-label', { sender })
  },
}
