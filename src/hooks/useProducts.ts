// src/hooks/useProducts.ts
// Hook React qui gère le state, le chargement et les erreurs pour les produits

'use client'

import { useState, useEffect, useCallback } from 'react'
import { computePrice } from '@/lib/data'
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

 // Same formula as the API, so the price shown is the price charged
 const calculate = useCallback((config: {
 basePrice: number
 minQuantity: number
 quantity: number
 finishExtra?: number
 rectoverso?: boolean
 formatMultiplier?: number
 paperExtra?: number
 }) => {
 setPrice(computePrice(
 config.basePrice,
 config.minQuantity || 1,
 config.quantity || 1,
 config.finishExtra || 0,
 !!config.rectoverso,
 config.formatMultiplier || 1,
 config.paperExtra || 0,
 ))
 }, [])

 return { price, loading: false, calculate }
}
