// Paliers du programme revendeur, calculés sur le chiffre d'affaires PAYÉ des 12 derniers mois.
// Le palier d'entrée correspond à la promesse affichée sur /revendeurs (« 15 % dès la première commande »).
export interface ResellerTier {
  id: 'partenaire' | 'gold' | 'platinum'
  label: string
  rate: number          // remise en %
  minRevenue: number    // CA payé sur 12 mois glissants (FCFA)
}

export const RESELLER_TIERS: ResellerTier[] = [
  { id: 'partenaire', label: 'Partenaire', rate: 15, minRevenue: 0 },
  { id: 'gold',       label: 'Gold',       rate: 18, minRevenue: 1_000_000 },
  { id: 'platinum',   label: 'Platinum',   rate: 20, minRevenue: 3_000_000 },
]

export function tierFor(revenue12m: number) {
  let index = 0
  RESELLER_TIERS.forEach((t, i) => { if (revenue12m >= t.minRevenue) index = i })
  const current = RESELLER_TIERS[index]
  const next = RESELLER_TIERS[index + 1] || null
  const progress = next
    ? Math.min(100, Math.round(((revenue12m - current.minRevenue) / (next.minRevenue - current.minRevenue)) * 100))
    : 100
  return {
    current,
    next,
    progressToNext: progress,
    amountToNext: next ? Math.max(0, next.minRevenue - revenue12m) : 0,
  }
}
