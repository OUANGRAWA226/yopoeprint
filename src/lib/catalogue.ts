'use client'

import { useEffect, useState } from 'react'
import { api } from './api'
import { computePrice } from './data'

// Produit tel que renvoyé par GET /products (yopoeprint-api/src/modules/products/product.entity.ts)
export interface CatalogueProduct {
  id: string
  slug: string
  name: string
  shortDesc: string
  category: string
  badge: 'popular' | 'new' | 'promo' | null
  imageUrl: string | null
  images: { url: string; order: number }[]
  basePrice: number
  minQuantity: number
  formats: { id: string; label: string; multiplier?: number }[]
  papers: { id: string; label: string; priceExtra?: number }[]
  quantities: number[]
  finishes: { id: string; label: string; priceModifier: number }[]
  deliveryDays: number
  isPopular: boolean
  sortOrder: number
  isHomeOffer: boolean
  inCalculator: boolean
  offerQuantity: number | null
}

// Photo d'atelier de la catégorie quand le produit n'a pas encore d'image
const CATEGORY_IMAGES: Record<string, string> = {
  'flyers': '/images/products/flyers-depliants.jpg',
  'cartes-de-visite': '/images/products/cartes-visite.jpg',
  'affiches': '/images/products/affiches-baches.jpg',
  'signaletique': '/images/products/affiches-baches.jpg',
  'brochures': '/images/products/brochures-catalogues.jpg',
  'roll-up': '/images/products/rollup-salons.jpg',
  'evenementiel': '/images/products/rollup-salons.jpg',
  'textile': '/images/products/textile-pro.jpg',
  'goodies': '/images/products/goodies-vip.jpg',
  'corporate': '/images/products/packaging-kraft.jpg',
}

export function productImage(p: Pick<CatalogueProduct, 'imageUrl' | 'images' | 'category'>): string {
  const gallery = [...(p.images || [])].sort((a, b) => a.order - b.order)[0]?.url
  return p.imageUrl || gallery || CATEGORY_IMAGES[p.category] || '/images/products/flyers-depliants.jpg'
}

/** Quantité du prix affiché : celle choisie dans l'admin, sinon la première proposée sur la fiche produit. */
export function referenceQuantity(p: CatalogueProduct): number {
  return p.offerQuantity || p.quantities?.[0] || p.minQuantity
}

/**
 * Prix pour la configuration par défaut de la fiche produit (premier format, papier et finition),
 * avec la formule de l'API : le montant affiché est celui facturé pour cette configuration.
 */
export function priceFor(p: CatalogueProduct, quantity = referenceQuantity(p), finishId?: string): number {
  const finish = (finishId && p.finishes?.find((f) => f.id === finishId)) || p.finishes?.[0]
  return computePrice(
    p.basePrice,
    p.minQuantity,
    quantity,
    finish?.priceModifier || 0,
    false,
    p.formats?.[0]?.multiplier || 1,
    p.papers?.[0]?.priceExtra || 0,
  ).total
}

// Une seule requête par visite, partagée par l'accueil et le méga-menu
let pending: Promise<CatalogueProduct[]> | null = null

export function fetchCatalogue(): Promise<CatalogueProduct[]> {
  if (!pending) {
    pending = api.get<CatalogueProduct[] | { data: CatalogueProduct[] }>('/products?limit=200')
      .then((r) => (Array.isArray(r) ? r : r.data || []))
      .catch((e) => { pending = null; throw e })
  }
  return pending
}

/** Produits actifs du catalogue, triés comme dans l'admin ; `null` pendant le chargement. */
export function useCatalogue() {
  const [products, setProducts] = useState<CatalogueProduct[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true
    fetchCatalogue()
      .then((p) => { if (alive) setProducts(p) })
      .catch(() => { if (alive) { setError(true); setProducts([]) } })
    return () => { alive = false }
  }, [])

  return { products, error }
}
