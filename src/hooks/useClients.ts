'use client'
// src/hooks/useClients.ts

import { useState, useEffect, useCallback } from 'react'
import {
 Client, ClientDetail, ClientFilters,
 getAllClients, getClientById, updateClient,
} from '@/lib/clients.service'

export function useClients() {
 const [clients, setClients] = useState<Client[]>([])
 const [total, setTotal] = useState(0)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [saving, setSaving] = useState(false)
 const [filters, setFilters] = useState<ClientFilters>({ page: 1, limit: 50 })

 // ── Chargement ───────────────────────────────────────────────
 const fetchClients = useCallback(async (f?: ClientFilters) => {
 setLoading(true)
 setError(null)
 try {
 const res = await getAllClients(f || filters)
 setClients(res.data)
 setTotal(res.total)
 } catch (e: any) {
 setError(e.message || 'Impossible de charger les clients')
 } finally {
 setLoading(false)
 }
 }, [filters])

 useEffect(() => { fetchClients() }, [])

 // ── Recherche / Filtres ──────────────────────────────────────
 const applyFilters = useCallback((newFilters: Partial<ClientFilters>) => {
 const merged = { ...filters, ...newFilters, page: 1 }
 setFilters(merged)
 fetchClients(merged)
 }, [filters, fetchClients])

 // ── Mise à jour segment ──────────────────────────────────────
 const updateSegment = useCallback(async (id: string, segment: string) => {
 // Optimistic update
 setClients((cs) => cs.map((c) => c.id === id ? { ...c, segment: segment as any } : c))
 try {
 await updateClient(id, { segment: segment as any })
 } catch (e: any) {
 setError(e.message)
 fetchClients() // rollback
 }
 }, [])

 // ── Toggle actif ─────────────────────────────────────────────
 const toggleActive = useCallback(async (id: string, isActive: boolean) => {
 setClients((cs) => cs.map((c) => c.id === id ? { ...c, isActive } : c))
 try {
 await updateClient(id, { isActive })
 } catch (e: any) {
 setError(e.message)
 fetchClients()
 }
 }, [])

 // ── Stats calculées ──────────────────────────────────────────
 const stats = {
 total: total,
 vip: clients.filter((c) => c.segment === 'VIP').length,
 actif: clients.filter((c) => c.segment === 'Actif').length,
 nouveau: clients.filter((c) => c.segment === 'Nouveau').length,
 inactif: clients.filter((c) => c.segment === 'Inactif').length,
 revenue: clients.reduce((acc, c) => acc + (c.totalSpent || 0), 0),
 }

 return {
 clients, total, loading, error, saving, stats,
 fetchClients, applyFilters, updateSegment, toggleActive,
 }
}

// ── Hook détail client ────────────────────────────────────────
export function useClientDetail(id: string | null) {
 const [client, setClient] = useState<ClientDetail | null>(null)
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)

 useEffect(() => {
 if (!id) return
 setLoading(true)
 setError(null)
 getClientById(id)
 .then(setClient)
 .catch((e) => setError(e.message))
 .finally(() => setLoading(false))
 }, [id])

 return { client, loading, error }
}
