'use client'

import { useState, useEffect, useCallback } from 'react'
import { ordersService, CreateOrderPayload } from '@/lib/orders.service'
import { paymentsService } from '@/lib/payments.service'

// ─── Hook : mes commandes ─────────────────────────────────────
export function useMyOrders() {
 const [orders, setOrders] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)

 const fetch = useCallback(() => {
 setLoading(true)
 ordersService.getMyOrders()
 .then((res) => { 
 // Résultat peut être un tableau ou { data, total }
 const orders = Array.isArray(res) ? res : res.data || []
 setOrders(orders)
 setError(null) 
 })
 .catch((err) => {
 setError(err.message || 'Erreur')
 setOrders([])
 })
 .finally(() => setLoading(false))
 }, [])

 useEffect(() => { fetch() }, [fetch])

 return { orders, loading, error, refetch: fetch }
}

// ─── Hook : créer une commande + payer ────────────────────────
export function useCheckout() {
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)

 const checkout = useCallback(async (orderData: CreateOrderPayload) => {
 setLoading(true)
 setError(null)

 try {
 // 1. Créer la commande
 const order = await ordersService.create(orderData)

 // 2. Initialiser le paiement CinetPay
 const payment = await paymentsService.initPayment(order.id)

 // 3. Rediriger vers la page de paiement CinetPay
 paymentsService.redirectToPayment(payment.paymentUrl)

 return { order, payment }
 } catch (err: any) {
 const msg = err.response?.data?.message || 'Erreur lors de la commande'
 setError(msg)
 throw err
 } finally {
 setLoading(false)
 }
 }, [])

 return { checkout, loading, error }
}

// ─── Hook : suivi public d'une commande ───────────────────────
export function useOrderTracking(orderNumber: string) {
 const [order, setOrder] = useState<any | null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)

 useEffect(() => {
 if (!orderNumber) return
 ordersService.trackOrder(orderNumber)
 .then(setOrder)
 .catch((err) => setError(err.response?.data?.message || 'Commande introuvable'))
 .finally(() => setLoading(false))
 }, [orderNumber])

 return { order, loading, error }
}
