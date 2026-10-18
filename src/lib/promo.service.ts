import { api } from './api'

export interface PromoCodeResult {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount?: number
  description?: string
  isValid: boolean
}

export const FALLBACK_PROMOS: Record<string, { type: 'percentage' | 'fixed'; value: number; desc: string }> = {
  YOPPRINT15: { type: 'percentage', value: 15, desc: '15% de réduction immédiate' },
  YOPOE10:    { type: 'percentage', value: 10, desc: '10% de réduction de bienvenue' },
  BURKINA:    { type: 'percentage', value: 15, desc: '15% spécial Burkina Faso' },
  PROMO20:    { type: 'percentage', value: 20, desc: '20% de remise exceptionnelle' },
}

export const promoService = {
  async validate(code: string, orderTotal: number): Promise<PromoCodeResult> {
    const cleanCode = code.trim().toUpperCase()
    try {
      const res = await api.post('/promos/validate', { code: cleanCode, orderTotal })
      if (res && res.data) return res.data
      if (res && (res as any).isValid !== undefined) return res as any
    } catch {
      // Fallback gracieux sur les codes locaux
    }

    if (FALLBACK_PROMOS[cleanCode]) {
      const p = FALLBACK_PROMOS[cleanCode]
      return {
        code: cleanCode,
        discountType: p.type,
        discountValue: p.value,
        description: p.desc,
        isValid: true,
      }
    }

    return {
      code: cleanCode,
      discountType: 'percentage',
      discountValue: 0,
      isValid: false,
    }
  },
}

/**
 * Calcule le montant de la remise à partir d'un résultat de code promo
 */
export function computeDiscount(promo: PromoCodeResult | null | undefined, total: number): number {
  if (!promo || !promo.isValid) return 0
  if (promo.discountType === 'percentage') {
    return Math.round(total * (promo.discountValue / 100))
  }
  return Math.min(promo.discountValue, total)
}
