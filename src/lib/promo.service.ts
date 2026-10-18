'use client'

import { useEffect, useState } from 'react'
import { api } from './api'

// Contrat de l'API : POST /promos/validate et GET /promos/featured (yopoeprint-api/src/modules/promos).
// Les codes sont gérés dans l'admin (Promotions) ; l'API revérifie tout à la commande.
export interface PromoCodeResult {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount?: number
  description?: string | null
  isValid: boolean
  message?: string // raison du refus (expiré, minimum non atteint…)
}

export interface FeaturedPromo {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrder: number
  label: string
}

export const promoService = {
  async validate(code: string, orderTotal: number): Promise<PromoCodeResult> {
    const cleanCode = code.trim().toUpperCase()
    const res = await api.post<PromoCodeResult>('/promos/validate', { code: cleanCode, orderTotal: Math.round(orderTotal) })
    return { ...res, code: res.code || cleanCode }
  },
}

/**
 * Calcule le montant de la remise à partir d'un résultat de code promo
 * (0 si le panier est redescendu sous le minimum depuis l'application du code).
 */
export function computeDiscount(promo: PromoCodeResult | null | undefined, total: number): number {
  if (!promo || !promo.isValid) return 0
  if (promo.minOrderAmount && total < promo.minOrderAmount) return 0
  if (promo.discountType === 'percentage') {
    return Math.round(total * (promo.discountValue / 100))
  }
  return Math.min(promo.discountValue, total)
}

// Une requête par visite, partagée par le menu et l'accueil
let featuredPending: Promise<FeaturedPromo | null> | null = null

/** Code mis en avant dans l'admin (Promotions › Afficher sur la boutique), `null` s'il n'y en a pas. */
export function useFeaturedPromo(): FeaturedPromo | null {
  const [promo, setPromo] = useState<FeaturedPromo | null>(null)
  useEffect(() => {
    let alive = true
    if (!featuredPending) {
      featuredPending = api.get<FeaturedPromo | null>('/promos/featured')
        .then((p) => (p && (p as FeaturedPromo).code ? (p as FeaturedPromo) : null))
        .catch(() => { featuredPending = null; return null })
    }
    featuredPending.then((p) => { if (alive) setPromo(p) })
    return () => { alive = false }
  }, [])
  return promo
}
