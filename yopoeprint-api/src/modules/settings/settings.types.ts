// Paramètres de la plateforme, éditables par le superadmin (table platform_settings).
// Les valeurs par défaut reprennent celles qui étaient codées en dur avant leur passage en base.

export interface DeliveryZoneSetting {
  id: string            // identifiant stable envoyé par la boutique (ex. 'bobo')
  label: string         // libellé affiché au client
  city: string          // ville reportée sur la commande
  price: number         // frais en FCFA
  delay: string         // délai affiché (ex. '3-4j')
  enabled: boolean      // zone proposée au client
  freeEligible: boolean // la livraison offerte s'applique à cette zone
}

export interface ResellerTierSetting {
  id: string
  label: string
  rate: number        // remise en %
  minRevenue: number  // CA payé sur 12 mois glissants (FCFA)
}

export interface PlatformSettings {
  contact: {
    phone: string
    whatsapp: string
    email: string
    address: string
  }
  delivery: {
    freeThreshold: number // livraison offerte à partir de ce sous-total (FCFA), 0 = jamais
    zones: DeliveryZoneSetting[]
  }
  resellerTiers: ResellerTierSetting[]
  maintenance: {
    enabled: boolean // commandes suspendues
    message: string
  }
}

export const DEFAULT_SETTINGS: PlatformSettings = {
  contact: {
    phone: '+22670000000',
    whatsapp: '+22670000000',
    email: 'contact@yopoeprint.bf',
    address: 'Ouagadougou, Burkina Faso',
  },
  delivery: {
    freeThreshold: 75000,
    zones: [
      { id: 'ouaga_centre', label: 'Ouagadougou Centre',     city: 'Ouagadougou',    price: 0,    delay: '24h',       enabled: true, freeEligible: true },
      { id: 'ouaga_periph', label: 'Ouagadougou Périphérie', city: 'Ouagadougou',    price: 1500, delay: '48h',       enabled: true, freeEligible: true },
      { id: 'bobo',         label: 'Bobo-Dioulasso',         city: 'Bobo-Dioulasso', price: 3500, delay: '3-4j',      enabled: true, freeEligible: true },
      { id: 'koudougou',    label: 'Koudougou',              city: 'Koudougou',      price: 3000, delay: '3-4j',      enabled: true, freeEligible: true },
      { id: 'ouahigouya',   label: 'Ouahigouya',             city: 'Ouahigouya',     price: 3500, delay: '4-5j',      enabled: true, freeEligible: true },
      { id: 'other',        label: 'Autre ville',            city: 'Autre ville',    price: 4500, delay: '5-7j',      enabled: true, freeEligible: false },
      { id: 'pickup',       label: 'Retrait atelier (Ouaga)', city: 'Ouagadougou',   price: 0,    delay: 'Sur RDV',   enabled: true, freeEligible: true },
    ],
  },
  resellerTiers: [
    { id: 'partenaire', label: 'Partenaire', rate: 15, minRevenue: 0 },
    { id: 'gold',       label: 'Gold',       rate: 18, minRevenue: 1_000_000 },
    { id: 'platinum',   label: 'Platinum',   rate: 20, minRevenue: 3_000_000 },
  ],
  maintenance: {
    enabled: false,
    message: '',
  },
}
