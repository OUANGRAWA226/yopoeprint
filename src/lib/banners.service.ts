// src/lib/banners.service.ts
// Bannières du carrousel d'accueil, gérées depuis l'admin (Carrousels & Bannières)

import { api } from './api'

// Formats imposés par l'API : visuel ordinateur obligatoire, version téléphone facultative
export const BANNER_FORMATS = {
  desktop: { width: 1248, height: 357 },
  mobile:  { width: 660,  height: 330 },
} as const

export interface BannerSlide {
  id: string
  title: string
  imageUrl: string
  mobileImageUrl?: string | null
  linkUrl: string
  badge?: string | null
  // Texte affiché en HTML par-dessus la photo (accessible, traduisible, net sur mobile).
  // Laisser vide pour une bannière dont l'image porte déjà son propre texte.
  subtitle?: string | null
  ctaLabel?: string | null
  altText?: string | null
  order: number
  active: boolean
  startDate?: string | null
  endDate?: string | null
}

// Bannières affichées tant qu'aucune n'est publiée depuis l'admin (photos produits recadrées, texte en surimpression)
export const DEFAULT_BANNERS: BannerSlide[] = [
  {
    id: 'hero-cartes-visite',
    title: 'Cartes de visite imprimées à Ouagadougou',
    subtitle: 'Papier 350 g, dorure ou pelliculage. BAT gratuit avant impression.',
    ctaLabel: 'Créer mes cartes',
    imageUrl: '/images/products/cartes-visite.jpg',
    linkUrl: '/catalogue/cartes-de-visite',
    badge: 'Livrées en 48 h',
    altText: 'Pile de cartes de visite imprimées',
    order: 1,
    active: true,
  },
  {
    id: 'hero-salons',
    title: 'Roll-up et stands pour vos salons',
    subtitle: 'SIAO, SNC, foires : structure aluminium, visuel HD et sac de transport.',
    ctaLabel: 'Voir les roll-up',
    imageUrl: '/images/products/rollup-salons.jpg',
    linkUrl: '/catalogue/roll-up',
    badge: 'Événementiel',
    altText: 'Roll-up exposé sur un salon professionnel',
    order: 2,
    active: true,
  },
  {
    id: 'hero-flyers',
    title: 'Flyers et dépliants en couleurs',
    subtitle: 'Prix dégressifs en FCFA, recto ou recto-verso, livraison partout au Burkina.',
    ctaLabel: 'Calculer mon prix',
    imageUrl: '/images/products/flyers-depliants.jpg',
    linkUrl: '/catalogue/flyers',
    badge: 'Prix en FCFA',
    altText: 'Flyers et dépliants imprimés en quadrichromie',
    order: 3,
    active: true,
  },
]

export const bannersService = {
  /**
   * Bannières en cours de diffusion (l'API filtre l'activation et la période, et les trie).
   * Sans bannière publiée ou si l'API est injoignable : bannières par défaut.
   */
  async getActiveBanners(): Promise<BannerSlide[]> {
    try {
      const response = await api.get<BannerSlide[]>('/banners')
      if (Array.isArray(response) && response.length > 0) return response
    } catch {
      // API injoignable : le carrousel garde les bannières par défaut
    }
    return DEFAULT_BANNERS
  },
}
