import { Metadata } from 'next'
import { getProductBySlug } from '@/lib/products.service'
import { PRODUCTS } from '@/lib/data'
import { ProductPageClient } from './ProductPageClient'
import Link from 'next/link'

interface Props {
 params: {
 slug: string
 }
}

// ─── DYNAMIC SEO METADATA ─────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const slug = params.slug
 let product: any = await getProductBySlug(slug)
 
 // Fallback sur les données locales
 if (!product) {
 product = PRODUCTS.find((p) => p.slug === slug) || null
 }

 if (!product) {
 return {
 title: 'Produit introuvable | YopoePrint',
 description: 'Ce produit n\'est pas disponible.',
 }
 }

  return {
    title: `${product.name} — Imprimerie en Ligne Burkina Faso | YopoePrint`,
    description: `${product.shortDesc || product.description}. Configurez vos options et commandez en ligne en toute sécurité.`,
    openGraph: {
      title: `${product.name} — YopoePrint`,
      description: product.shortDesc || product.description,
      type: 'article',
      url: `https://yopoeprint.bf/produit/${slug}`,
      siteName: 'YopoePrint',
      images: product.imageUrl ? [
        { 
          url: product.imageUrl,
          width: 1200,
          height: 630,
          alt: product.name
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — YopoePrint`,
      description: product.shortDesc || product.description,
      images: product.imageUrl ? [product.imageUrl] : [],
    }
  }
}

export default async function Page({ params }: Props) {
 const slug = params.slug
 let product: any = await getProductBySlug(slug)

 // Fallback sur les données locales si l'API est déconnectée ou vide
 if (!product) {
 product = PRODUCTS.find((p) => p.slug === slug) || null
 }

 if (!product) {
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="text-center">
 <p className="text-6xl mb-4">📭</p>
 <h2 className="font-display text-2xl font-bold text-foreground mb-2">Produit introuvable</h2>
 <p className="text-gray-400 mb-6">Ce produit n&apos;existe pas ou a été retiré du catalogue.</p>
 <Link href="/catalogue" className="btn-primary">Voir le catalogue →</Link>
 </div>
 </div>
 )
 }

 return <ProductPageClient product={product} />
}
