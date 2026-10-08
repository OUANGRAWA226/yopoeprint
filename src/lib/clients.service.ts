// src/lib/clients.service.ts
// Toutes les opérations clients connectées à NestJS + Supabase

import { api } from './api'

// ── Types ─────────────────────────────────────────────────────

export interface Client {
 id: string
 firstName: string
 lastName: string
 email: string
 phone?: string
 city?: string
 totalOrders: number
 totalSpent: number
 segment: 'VIP' | 'Actif' | 'Nouveau' | 'Inactif'
 isActive: boolean
 createdAt: string
 lastOrderAt?: string
}

export interface ClientDetail extends Client {
 orders: ClientOrder[]
 addresses: ClientAddress[]
}

export interface ClientOrder {
 id: string
 total: number
 status: string
 createdAt: string
 items: { productName: string; quantity: number }[]
}

export interface ClientAddress {
 id: string
 label: string
 address: string
 city: string
 isDefault: boolean
}

export interface ClientsResponse {
 data: Client[]
 total: number
 page: number
 limit: number
}

export interface ClientFilters {
 search?: string
 segment?: string
 page?: number
 limit?: number
}

// ── Fonctions API ─────────────────────────────────────────────

/** Récupère la liste paginée des clients */
export async function getAllClients(filters: ClientFilters = {}): Promise<ClientsResponse> {
 const params = new URLSearchParams()
 if (filters.search) params.set('search', filters.search)
 if (filters.segment && filters.segment !== 'all') params.set('segment', filters.segment)
 params.set('page', String(filters.page || 1))
 params.set('limit', String(filters.limit || 50))

 const res = await api.get(`/users?${params.toString()}`)

 // Adapter selon la réponse du backend
 // Si le backend retourne { data, total, page, limit } :
 if (res.data && Array.isArray(res.data)) {
 return { data: res.data, total: res.total || res.data.length, page: res.page || 1, limit: res.limit || 50 }
 }
 // Si le backend retourne directement un tableau :
 if (Array.isArray(res)) {
 return { data: res, total: res.length, page: 1, limit: 50 }
 }
 return res
}

/** Récupère le détail d'un client avec ses commandes */
export async function getClientById(id: string): Promise<ClientDetail> {
 const res = await api.get(`/users/${id}`)
 return res.data ? res.data : res
}

/** Met à jour un client (segment, statut actif…) */
export async function updateClient(id: string, data: Partial<Client>): Promise<Client> {
 const res = await api.patch(`/users/${id}`, data)
 return res.data ? res.data : res
}

/** Désactive un client */
export async function deactivateClient(id: string): Promise<Client> {
 return updateClient(id, { isActive: false })
}

/** Active un client */
export async function activateClient(id: string): Promise<Client> {
 return updateClient(id, { isActive: true })
}

/** Calcule le segment automatiquement selon les achats */
export function computeSegment(totalOrders: number, totalSpent: number, lastOrderAt?: string): string {
 if (totalSpent >= 200000 || totalOrders >= 10) return 'VIP'
 if (!lastOrderAt) return 'Nouveau'
 const daysSince = (Date.now() - new Date(lastOrderAt).getTime()) / (1000 * 60 * 60 * 24)
 if (daysSince > 90) return 'Inactif'
 return 'Actif'
}
