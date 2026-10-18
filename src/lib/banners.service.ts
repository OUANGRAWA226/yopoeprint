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
  altText?: string
  order: number
  active: boolean
  startDate?: string
  endDate?: string
}

// Bannières initiales configurées au format standardisé 1248 × 357 px
export const DEFAULT_BANNERS: BannerSlide[] = [
  {
    id: 'banner-promo-atelier',
    title: 'Offre Spéciale Atelier : Impression Offset & Numérique HD',
    imageUrl: '/images/banners/banner-promo-atelier.jpg',
    linkUrl: '/catalogue',
    badge: 'Offre Atelier',
    altText: 'YopoePrint - Cartes de visite, Roll-up et flyers haute définition',
    order: 1,
    active: true,
  },
  {
    id: 'banner-pack-salons',
    title: 'Pack Salons & Foires : SIAO, SNC et Événements Pro',
    imageUrl: '/images/banners/banner-pack-salons.jpg',
    linkUrl: '/catalogue/roll-up',
    badge: 'Spécial SIAO & SNC',
    altText: 'Stands d’exposition, roll-ups aluminium et comptoirs événementiels',
    order: 2,
    active: true,
  },
  {
    id: 'banner-cartes-luxe',
    title: 'Cartes de Visite Prestige : Dorure à Chaud & Vernis 3D',
    imageUrl: '/images/banners/banner-cartes-luxe.jpg',
    linkUrl: '/catalogue/cartes',
    badge: 'Finitions Luxe',
    altText: 'Cartes de visite 350g et 450g avec dorure or et finitions velours',
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
