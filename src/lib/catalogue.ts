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
  papers: { id: string; label: string; description?: string; priceExtra?: number }[]
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

// ─── Blocs de l'accueil tirés du catalogue ─────────────────────────────────

// Libellés des catégories de l'API (product.entity.ts), dans l'ordre d'affichage
export const CATEGORY_LABELS: Record<string, string> = {
  'cartes-de-visite': 'Cartes de visite',
  'flyers': 'Flyers & dépliants',
  'roll-up': 'Roll-ups & salons',
  'affiches': 'Affiches & posters',
  'signaletique': 'Signalétique & bâches',
  'brochures': 'Brochures & catalogues',
  'evenementiel': 'Événementiel',
  'textile': 'Textile pro',
  'goodies': 'Goodies & cadeaux',
  'corporate': 'Papeterie d\'entreprise',
}

const BADGE_LABELS: Record<string, string> = { popular: 'Populaire', new: 'Nouveau', promo: 'Promo' }
const fcfa = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n)} FCFA`

/** Une carte par catégorie ayant des produits : prix d'appel réel et exemples de produits. */
export function categoryCards(products: CatalogueProduct[] | null) {
  return Object.keys(CATEGORY_LABELS).flatMap((category) => {
    const inCat = (products ?? []).filter((p) => p.category === category)
    if (!inCat.length) return []
    return [{
      name: CATEGORY_LABELS[category],
      spec: inCat.slice(0, 3).map((p) => p.name).join(', '),
      // Prix d'appel : la plus petite quantité proposée de chaque produit, configuration de base
      price: `Dès ${fcfa(Math.min(...inCat.map((p) => priceFor(p, p.quantities?.[0] || p.minQuantity))))}`,
      href: `/catalogue/${category}`,
      img: productImage(inCat[0]),
    }]
  })
}

/** Produits pour les salons (roll-ups et événementiel), 4 au plus. */
export function eventCards(products: CatalogueProduct[] | null) {
  return (products ?? [])
    .filter((p) => p.category === 'roll-up' || p.category === 'evenementiel')
    .slice(0, 4)
    .map((p) => ({
      title: p.name,
      spec: p.shortDesc,
      price: `${fcfa(priceFor(p))} · ${new Intl.NumberFormat('fr-FR').format(referenceQuantity(p))} ex.`,
      badge: (p.badge && BADGE_LABELS[p.badge]) || CATEGORY_LABELS[p.category],
      href: `/produit/${p.slug}`,
      img: productImage(p),
    }))
}

/**
 * Guide des papiers : papiers saisis sur les produits (libellé et description de l'admin),
 * avec les produits qui les proposent. Les papiers sans description sont ignorés.
 */
export function papersGuide(products: CatalogueProduct[] | null) {
  const byLabel = new Map<string, { name: string; desc: string; products: string[] }>()
  for (const p of products ?? []) {
    for (const paper of p.papers ?? []) {
      const desc = (paper.description || '').trim()
      if (!desc) continue
      const key = paper.label.trim().toLowerCase()
      const entry = byLabel.get(key) ?? { name: paper.label.trim(), desc, products: [] }
      if (!entry.products.includes(p.name)) entry.products.push(p.name)
      byLabel.set(key, entry)
    }
  }
  return [...byLabel.values()]
    .sort((a, b) => b.products.length - a.products.length)
    .slice(0, 4)
    .map((e) => ({
      name: e.name,
      badge: `${e.products.length} produit${e.products.length > 1 ? 's' : ''}`,
      desc: e.desc,
      usage: e.products.slice(0, 3).join(', '),
    }))
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
