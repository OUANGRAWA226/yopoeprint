// Adresse publique de la boutique : SEO (canonical, sitemap, Open Graph) et liens absolus.
// Aucun domaine n'est encore choisi : NEXT_PUBLIC_SITE_URL est obligatoire en production
// (même valeur que le FRONTEND_URL de l'API). Par défaut : le serveur de dev local.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')

// Nom d'hôte affiché dans les documents (pied de devis…), ex. « www.exemple.bf »
export const SITE_HOST = new URL(SITE_URL).host

// Image de partage générée par src/app/opengraph-image.tsx
export const OG_IMAGE_URL = `${SITE_URL}/opengraph-image`
