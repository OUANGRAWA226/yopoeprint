// src/lib/products.service.ts
// Toutes les opérations produits connectées à NestJS + Supabase

import { api } from './api'

export interface Product {
 id: string
 slug: string
 name: string
 shortDesc: string
 description: string
 category: string
 basePrice: number
 minQuantity: number
 badge?: string
 active: boolean
 imageUrl?: string
 images?: Array<{ id: string; label: string; description: string; url: string; order: number }>
 emoji: string
 createdAt?: string
 updatedAt?: string
}

export interface CreateProductDto {
 name: string
 slug: string
 shortDesc: string
 description: string
 category: string
 basePrice: number
 minQuantity: number
 badge?: string
 active: boolean
 imageUrl?: string
 images?: Array<{ id: string; label: string; description: string; url: string; order: number }>
 emoji: string
}

export type UpdateProductDto = Partial<CreateProductDto>

// ── Lecture ───────────────────────────────────────────────────

export interface GetProductsOptions {
 search?: string
 limit?: number
 category?: string
 includeInactive?: boolean
}

/** Récupère tous les produits (admin : actifs + inactifs) */
export async function getAllProducts(options: GetProductsOptions = {}): Promise<Product[]> {
 const { search, limit = 200, category, includeInactive = true } = options
 
 const params = new URLSearchParams()
 params.append('limit', limit.toString())
 
 if (includeInactive) params.append('includeInactive', 'true')
 if (search) params.append('search', search)
 if (category) params.append('category', category)
 
 const data = await api.get<Product[] | { data: Product[]; total: number }>(`/products?${params.toString()}`)
 // Le backend peut retourner un tableau direct ou { data, total }
 return Array.isArray(data) ? data : data.data
}

/** Récupère un produit par son ID */
export async function getProductById(id: string): Promise<Product> {
 return api.get<Product>(`/products/${id}`)
}

/** Récupère un produit par son slug */
export async function getProductBySlug(slug: string): Promise<Product | null> {
 try {
 const all = await getAllProducts()
 const found = all.find((p) => p.slug === slug)
 return found || null
 } catch {
 return null
 }
}

// ── Création ──────────────────────────────────────────────────

/** Crée un nouveau produit */
export async function createProduct(dto: CreateProductDto): Promise<Product> {
 return api.post<Product>('/products', dto)
}

// ── Mise à jour ───────────────────────────────────────────────

/** Met à jour un produit existant */
export async function updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
 return api.patch<Product>(`/products/${id}`, dto)
}

/** Active ou désactive un produit */
export async function toggleProductActive(id: string, active: boolean): Promise<Product> {
 return api.patch<Product>(`/products/${id}`, { active })
}

// ── Suppression ───────────────────────────────────────────────

/** Supprime définitivement un produit */
export async function deleteProduct(id: string): Promise<void> {
 return api.delete(`/products/${id}`)
}

// ── Upload image ──────────────────────────────────────────────

/**
 * Upload une image produit via l'API.
 * Le backend doit exposer POST /products/:id/image (multipart/form-data)
 * et retourner { imageUrl: string }
 */
export async function uploadProductImage(
 productId: string,
 file: File
): Promise<{ imageUrl: string }> {
 const formData = new FormData()
 formData.append('image', file)
 return api.upload<{ imageUrl: string }>(`/products/${productId}/image`, formData)
}

/**
 * Service wrapper pour les opérations produits
 * Fourni une interface cohérente avec pagination et filtrage
 */
export const productsService = {
 async getAll(query?: {
 category?: string
 search?: string
 page?: number
 limit?: number
 includeInactive?: boolean
 }) {
 try {
 const params = new URLSearchParams()
 if (query?.category) params.append('category', query.category)
 if (query?.search) params.append('search', query.search)
 if (query?.page) params.append('page', String(query.page))
 if (query?.limit) params.append('limit', String(query.limit || 12))
 if (query?.includeInactive) params.append('includeInactive', 'true')

 const path = `/products?${params.toString()}`
 const result = await api.get<{
 data: Product[]
 total: number
 }>(path)

 // Si le backend retourne directement un tableau, le wrapper
 if (Array.isArray(result)) {
 return { data: result, total: result.length }
 }
 return result
 } catch (error) {
 console.error('Error fetching products:', error)
 return { data: [], total: 0 }
 }
 },
}

