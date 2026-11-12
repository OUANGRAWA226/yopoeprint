// Adresse publique de la boutique : SEO (canonical, sitemap, Open Graph) et liens absolus.
// À définir en production (NEXT_PUBLIC_SITE_URL), identique au FRONTEND_URL de l'API.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://yopoeprint.bf').replace(/\/+$/, '')

// Image de partage générée par src/app/opengraph-image.tsx
export const OG_IMAGE_URL = `${SITE_URL}/opengraph-image`
