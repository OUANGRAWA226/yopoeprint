import { api } from './api'

// ─── Payments Service ─────────────────────────────────────────
export const paymentsService = {

 // Initialiser un paiement CinetPay → retourne l'URL de paiement
 async initPayment(orderId: string): Promise<{ paymentUrl: string; transactionId: string }> {
 const response = await api.post(`/payments/${orderId}/init`, {})
 return response
 },

 // Statut du paiement d'une commande
 async getStatus(orderId: string) {
 const response = await api.get(`/payments/${orderId}/status`)
 return response
 },

 // Vérifier manuellement une transaction
 async verify(transactionId: string) {
 const response = await api.get(`/payments/verify/${transactionId}`)
 return response
 },

 // Rediriger vers CinetPay pour payer
 redirectToPayment(paymentUrl: string) {
 window.location.href = paymentUrl
 },
}
