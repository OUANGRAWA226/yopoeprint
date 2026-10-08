import { api } from './api'

export interface PromoCodeResult {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount?: number
  description?: string
  isValid: boolean
}

export const promoService = {
  async validate(code: string, orderTotal: number): Promise<PromoCodeResult> {
    return await api.post('/promos/validate', { code, orderTotal })
  },
}

/**
 * Calcule le montant de la remise à partir d'un résultat de code promo
 */
export function computeDiscount(promo: PromoCodeResult, total: number): number {
  if (!promo.isValid) return 0
  if (promo.discountType === 'percentage') {
    return Math.round(total * (promo.discountValue / 100))
  }
  return Math.min(promo.discountValue, total)
}
