// src/hooks/useProducts.ts
// Hook React qui gère le state, le chargement et les erreurs pour les produits

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
 Product,
 CreateProductDto,
 UpdateProductDto,
 GetProductsOptions,
 getAllProducts,
 getProductById,
 getProductBySlug,
 createProduct,
 updateProduct,
 toggleProductActive,
 deleteProduct,
 uploadImageToCloudinaryDirect,
} from '@/lib/products.service'

export function useProducts(options: GetProductsOptions = {}) {
 const [products, setProducts] = useState<Product[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [saving, setSaving] = useState(false)
 const [uploadPct, setUploadPct] = useState(0)

 // ── Chargement initial ──────────────────────────────────────
 const fetchProducts = useCallback(async () => {
 setLoading(true)
 setError(null)
 try {
 console.log('[useProducts] Fetching with options:', options)
 const data = await getAllProducts(options)
 console.log('[useProducts] Loaded:', data?.length || 0, 'products')
 setProducts(Array.isArray(data) ? data : [])
 } catch (e: any) {
 console.error('[useProducts] Error:', e)
 setError(e.message || 'Impossible de charger les produits')
 setProducts([])
 } finally {
 setLoading(false)
 }
 }, [JSON.stringify(options)])

 useEffect(() => { fetchProducts() }, [fetchProducts])

 // ── Créer ───────────────────────────────────────────────────
 const create = useCallback(async (
 dto: CreateProductDto,
 imageFile?: File
 ): Promise<Product | null> => {
 setSaving(true)
 setError(null)
 try {
 // 1. Créer le produit en base
 const newProduct = await createProduct(dto)

 // 2. Si image fournie → uploader et mettre à jour imageUrl
 if (imageFile) {
 const imageUrl = await uploadImageToCloudinaryDirect(imageFile, setUploadPct)
 const updated = await updateProduct(newProduct.id, { imageUrl })
 setProducts((ps) => [...ps, updated])
 return updated
 }

 setProducts((ps) => [...ps, newProduct])
 return newProduct
 } catch (e: any) {
 setError(e.message || 'Erreur lors de la création')
 return null
 } finally {
 setSaving(false)
 setUploadPct(0)
 }
 }, [])

 // ── Mettre à jour ────────────────────────────────────────────
 const update = useCallback(async (
 id: string,
 dto: UpdateProductDto,
 imageFile?: File
 ): Promise<Product | null> => {
 setSaving(true)
 setError(null)
 try {
 // 1. Si nouvelle image → uploader d'abord
 if (imageFile) {
 const imageUrl = await uploadImageToCloudinaryDirect(imageFile, setUploadPct)
 dto = { ...dto, imageUrl }
 }

 // 2. Mettre à jour le produit
 const updated = await updateProduct(id, dto)
 setProducts((ps) => ps.map((p) => p.id === id ? updated : p))
 return updated
 } catch (e: any) {
 setError(e.message || 'Erreur lors de la mise à jour')
 return null
 } finally {
 setSaving(false)
 setUploadPct(0)
 }
 }, [])

 // ── Activer / Désactiver ─────────────────────────────────────
 const toggleActive = useCallback(async (id: string, active: boolean) => {
 // Optimistic update (UI réagit immédiatement)
 setProducts((ps) => ps.map((p) => p.id === id ? { ...p, active } : p))
 try {
 await toggleProductActive(id, active)
 } catch (e: any) {
 // Rollback si erreur
 setProducts((ps) => ps.map((p) => p.id === id ? { ...p, active: !active } : p))
 setError(e.message || 'Erreur de mise à jour du statut')
 }
 }, [])

 // ── Supprimer ───────────────────────────────────────────────
 const remove = useCallback(async (id: string): Promise<boolean> => {
 setSaving(true)
 setError(null)
 try {
 await deleteProduct(id)
 setProducts((ps) => ps.filter((p) => p.id !== id))
 return true
 } catch (e: any) {
 setError(e.message || 'Erreur lors de la suppression')
 return false
 } finally {
 setSaving(false)
 }
 }, [])

 return {
 products,
 loading,
 error,
 saving,
 uploadPct,
 fetchProducts,
 create,
 update,
 toggleActive,
 remove,
 }
}

// ── Hook pour un produit unique ────────────────────────────────
export function useProduct(idOrSlug: string | null) {
 const [product, setProduct] = useState<Product | null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)

 useEffect(() => {
 if (!idOrSlug) {
 setProduct(null)
 setLoading(false)
 return
 }

 const fetch = async () => {
 setLoading(true)
 setError(null)
 try {
 // Essayer d'abord comme slug (plus courant dans les URLs)
 let data = await getProductBySlug(idOrSlug)
 console.log('[useProduct] Fetched data for slug:', idOrSlug, data)
 // Si pas trouvé par slug, essayer par ID
 if (!data) {
 data = await getProductById(idOrSlug)
 console.log('[useProduct] Fetched data for ID:', idOrSlug, data)
 }
 setProduct(data)
 } catch (e: any) {
 console.error('[useProduct] Error:', e)
 setError(e.message || 'Impossible de charger le produit')
 } finally {
 setLoading(false)
 }
 }

 fetch()
 }, [idOrSlug])

 return { product, loading, error }
}

// ── Hook pour les produits populaires ───────────────────────────
export function usePopularProducts(limit = 6) {
 const [products, setProducts] = useState<Product[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)

 useEffect(() => {
 const fetch = async () => {
 setLoading(true)
 setError(null)
 try {
 const all = await getAllProducts()
 // Filtrer les produits actifs et avec badge "popular"
 const popular = all
 .filter((p) => p.active && (p.badge === 'popular' || p.badge === 'trending'))
 .slice(0, limit)
 setProducts(popular)
 } catch (e: any) {
 setError(e.message || 'Impossible de charger les produits populaires')
 } finally {
 setLoading(false)
 }
 }

 fetch()
 }, [limit])

 return { products, loading, error }
}

// ── Hook pour calculer les prix ────────────────────────────────
export function usePriceCalculator() {
 const [price, setPrice] = useState<{ unitPrice: number; total: number } | null>(null)
 const [loading, setLoading] = useState(false)

  const calculate = useCallback((config: {
    productId?: string
    basePrice?: number
    quantity?: number
    formatId?: string
    paperId?: string
    finishId?: string
    rectoverso?: boolean
    paperExtra?: number
    finishExtra?: number
    formatMultiplier?: number
  }) => {
    setLoading(true)
    try {
      const basePrice = config.basePrice || 0
      const quantity = config.quantity || 1
      
      let unitPrice = basePrice
      
      // Ajout des coûts liés aux options
      if (config.paperExtra) {
        unitPrice += config.paperExtra
      }
      
      if (config.finishExtra) {
        unitPrice += config.finishExtra
      }

      // Multiplicateur de format (optionnel)
      if (config.formatMultiplier) {
        unitPrice *= config.formatMultiplier
      }
      
      // Surcoût impression Recto-Verso (ex: +40%)
      if (config.rectoverso) {
        unitPrice *= 1.4 
      }
      
      // DÉGRESSIVITÉ SUR LA QUANTITÉ (Tiered Pricing)
      // Plus la quantité est grande, plus la remise au prix unitaire est forte
      let discount = 0
      if (quantity >= 500) {
        discount = 0.20 // -20%
      } else if (quantity >= 250) {
        discount = 0.10 // -10%
      } else if (quantity >= 100) {
        discount = 0.05 // -5%
      }

      // Application de la remise au prix unitaire
      unitPrice = unitPrice * (1 - discount)

      // Arrondir le prix unitaire
      unitPrice = Math.round(unitPrice)
      
      const total = unitPrice * quantity
      
      setPrice({ unitPrice, total })
      console.log('[usePriceCalculator] Calculated:', { unitPrice, total, discount, config })
 } catch (e: any) {
 console.error('[usePriceCalculator] Error:', e)
 setPrice(null)
 } finally {
 setLoading(false)
 }
 }, [])

 return { price, loading, calculate }
}
