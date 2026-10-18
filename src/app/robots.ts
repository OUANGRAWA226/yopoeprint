import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/commande/',
          '/panier/',
          '/mon-compte/',
          '/compte/',
          '/connexion/',
          '/inscription/',
        ],
      },
    ],
    sitemap: 'https://yopoeprint.bf/sitemap.xml',
  }
}
