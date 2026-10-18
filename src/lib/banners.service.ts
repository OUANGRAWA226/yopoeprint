// src/lib/banners.service.ts
// Service de gestion dynamique des bannières du carrousel d'accueil
// Connecté au Backoffice / API NestJS avec fallback immédiat

import { api } from './api'

export interface BannerSlide {
  id: string
  title: string
  imageUrl: string
  mobileImageUrl?: string
  linkUrl: string
  badge?: string
  // Texte affiché en HTML par-dessus la photo (accessible, traduisible, net sur mobile).
  // Laisser vide pour une bannière dont l'image porte déjà son propre texte.
  subtitle?: string
  ctaLabel?: string
  altText?: string
  order: number
  active: boolean
  startDate?: string
  endDate?: string
}

// Bannières initiales configurées au format standardisé 1248 × 357 px
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
   * Récupère la liste des bannières actives depuis le backoffice métier (API)
   * Si l'API n'a pas encore de bannières configurées, renvoie les bannières par défaut.
   */
  async getActiveBanners(): Promise<BannerSlide[]> {
    try {
      // 1. Tentative d'appel à l'API du backoffice
      const response = await api.get<BannerSlide[]>('/banners?active=true')
      if (Array.isArray(response) && response.length > 0) {
        return response
          .filter(b => b.active !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
      }
    } catch (err) {
      // Silencieux : fallback transparent
    }

    // 2. Vérification du cache / localStorage partagé avec le backoffice
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('yopoeprint_custom_banners')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
              .filter((b: BannerSlide) => b.active !== false)
              .sort((a: BannerSlide, b: BannerSlide) => (a.order || 0) - (b.order || 0))
          }
        }
      } catch {
        // En cas d'erreur de parse
      }
    }

    return DEFAULT_BANNERS
  },

  /**
   * Récupère une bannière par son ID
   */
  async getBannerById(id: string): Promise<BannerSlide | null> {
    try {
      const banner = await api.get<BannerSlide>(`/banners/${id}`)
      return banner
    } catch {
      return DEFAULT_BANNERS.find(b => b.id === id) || null
    }
  },
}
