import { ResellerTierSetting } from '../settings/settings.types'

// Paliers du programme revendeur, calculés sur le chiffre d'affaires PAYÉ des 12 derniers mois.
// Les paliers eux-mêmes sont des paramètres de la plateforme (SettingsService.resellerTiers()).
export function tierFor(revenue12m: number, tiers: ResellerTierSetting[]) {
  const sorted = [...tiers].sort((a, b) => a.minRevenue - b.minRevenue)
  let index = 0
  sorted.forEach((t, i) => { if (revenue12m >= t.minRevenue) index = i })
  const current = sorted[index]
  const next = sorted[index + 1] || null
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
