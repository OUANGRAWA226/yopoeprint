import { MetadataRoute } from 'next'
import { PRODUCTS } from '@/lib/data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://yopoeprint.bf'
  const currentDate = new Date().toISOString()

  // 1. Pages maîtresses
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalogue`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/devis`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guide-impression`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/entreprises`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/a-propos`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/suivi`,
      lastModified: currentDate,
      changeFrequency: 'always',
      priority: 0.6,
    },
  ]

  // 2. Catégories du catalogue
  const categories = [
    'cartes-de-visite',
    'flyers',
    'roll-up',
    'signaletique',
    'affiches',
    'brochures',
    'textile',
    'goodies',
    'etiquettes',
    'corporate',
  ]

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/catalogue/${cat}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  // 3. Fiches produits individuelles
  const productPages: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${baseUrl}/produit/${product.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
