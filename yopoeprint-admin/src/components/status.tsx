// Libellés et couleurs (badges Bootstrap) partagés par les pages du back-office

export const ORDER_STATUS: Record<string, { label: string; badge: string }> = {
  pending:       { label: 'Paiement en attente', badge: 'text-bg-warning' },
  confirmed:     { label: 'Payée',               badge: 'text-bg-primary' },
  bat_pending:   { label: 'BAT à valider',       badge: 'text-bg-warning' },
  in_production: { label: 'En production',       badge: 'text-bg-info' },
  ready:         { label: 'Prête',               badge: 'text-bg-success' },
  shipped:       { label: 'Expédiée',            badge: 'text-bg-primary' },
  delivered:     { label: 'Livrée',              badge: 'text-bg-secondary' },
  cancelled:     { label: 'Annulée',             badge: 'text-bg-danger' },
  refunded:      { label: 'Remboursée',          badge: 'text-bg-dark' },
}

export function OrderStatusBadge({ status }: { status: string }) {
  const s = ORDER_STATUS[status] || { label: status, badge: 'text-bg-secondary' }
  return <span className={`badge ${s.badge}`}>{s.label}</span>
}

export const PAYMENT_METHOD: Record<string, { label: string; color: string }> = {
  orange_money: { label: 'Orange Money', color: '#ea580c' },
  moov_money:   { label: 'Moov Money',   color: '#0284c7' },
  visa:         { label: 'Visa',         color: '#6f42c1' },
  mastercard:   { label: 'Mastercard',   color: '#a855f7' },
  virement:     { label: 'Virement',     color: '#6c757d' },
}

export const fcfa = (n: number) => `${new Intl.NumberFormat('fr-FR').format(Math.round(n || 0))} FCFA`
export const num = (n: number) => new Intl.NumberFormat('fr-FR').format(n || 0)
export const dateFr = (iso: string | Date) => new Date(iso).toLocaleDateString('fr-FR')
export const dateTimeFr = (iso: string | Date) =>
  new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
