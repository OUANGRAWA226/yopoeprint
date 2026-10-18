// Delivery zones — must stay in sync with ZONES in src/app/commande/page.tsx (storefront)
export const DELIVERY_ZONES = {
  ouaga_centre: { city: 'Ouagadougou',    price: 0 },
  ouaga_periph: { city: 'Ouagadougou',    price: 1500 },
  bobo:         { city: 'Bobo-Dioulasso', price: 3500 },
  koudougou:    { city: 'Koudougou',      price: 3000 },
  ouahigouya:   { city: 'Ouahigouya',     price: 3500 },
  other:        { city: 'Autre ville',    price: 4500 },
  pickup:       { city: 'Ouagadougou',    price: 0 },
} as const

export type DeliveryZoneId = keyof typeof DELIVERY_ZONES

export const DELIVERY_ZONE_IDS = Object.keys(DELIVERY_ZONES) as DeliveryZoneId[]

// Free delivery above this subtotal, except for "other" (outside the network)
export const FREE_DELIVERY_THRESHOLD = 75000

export function computeDeliveryCost(zone: DeliveryZoneId, subtotal: number): number {
  if (subtotal >= FREE_DELIVERY_THRESHOLD && zone !== 'other') return 0
  return DELIVERY_ZONES[zone].price
}
