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

// ─── HELPER : Normalisation universelle des options de configuration ─────────
// Garantit que N'IMPORTE QUEL produit (actuel ou futur, en base ou local) possède
// des formats, matières, quantités et finitions complets et opérationnels.
function normalizeProduct(rawProduct: any, slug: string): any {
  if (!rawProduct) return null

  const cat = (rawProduct.category || '').toLowerCase()
  const s = slug.toLowerCase()

  // 1. Formats intelligents selon catégorie si non renseignés
  let formats = rawProduct.formats
  if (!formats || formats.length === 0) {
    if (cat === 'flyers') {
      formats = [
        { id: 'a6', label: 'A6 (105×148 mm)', dimensions: '105×148 mm' },
        { id: 'a5', label: 'A5 (148×210 mm)', dimensions: '148×210 mm · Standard' },
        { id: 'a4', label: 'A4 (210×297 mm)', dimensions: '210×297 mm' },
        { id: 'a3', label: 'A3 (297×420 mm)', dimensions: '297×420 mm' },
      ]
    } else if (cat === 'cartes-de-visite') {
      formats = [
        { id: 'standard', label: 'Standard (85×55 mm)', dimensions: '85×55 mm · Portefeuille' },
        { id: 'carre', label: 'Carré (55×55 mm)', dimensions: '55×55 mm · Moderne' },
        { id: 'mini', label: 'Mini (70×45 mm)', dimensions: '70×45 mm · Compact' },
      ]
    } else if (cat === 'affiches') {
      formats = [
        { id: 'a3', label: 'A3 (297×420 mm)', dimensions: '297×420 mm' },
        { id: 'a2', label: 'A2 (420×594 mm)', dimensions: '420×594 mm' },
        { id: 'a1', label: 'A1 (594×841 mm)', dimensions: '594×841 mm' },
        { id: '60x80', label: '60×80 cm', dimensions: '600×800 mm' },
      ]
    } else if (cat === 'brochures') {
      formats = [
        { id: 'a4-3v', label: 'A4 — 3 volets', dimensions: 'A4 plié en 3' },
        { id: 'a4-2v', label: 'A4 — 2 volets', dimensions: 'A4 plié en 2' },
        { id: 'a3-3v', label: 'A3 — 3 volets', dimensions: 'A3 plié en 3' },
      ]
    } else if (cat === 'roll-up' || s.includes('roll-up') || s.includes('kakemono')) {
      formats = [
        { id: '85x200', label: '85×200 cm (Standard)', dimensions: '850×2000 mm · Le + vendu', multiplier: 1.0 },
        { id: '60x160', label: '60×160 cm (Compact)', dimensions: '600×1600 mm · Idéal petits stands', multiplier: 0.85 },
        { id: '100x200', label: '100×200 cm (Grand)', dimensions: '1000×2000 mm · Forte visibilité', multiplier: 1.25 },
        { id: '120x200', label: '120×200 cm (Géant XL)', dimensions: '1200×2000 mm · Impact maximal', multiplier: 1.55 },
      ]
    } else if (cat === 'textile') {
      formats = [
        { id: 's', label: 'Taille S', dimensions: 'Tour poitrine: 88-92cm' },
        { id: 'm', label: 'Taille M', dimensions: 'Tour poitrine: 92-96cm' },
        { id: 'l', label: 'Taille L', dimensions: 'Tour poitrine: 96-100cm' },
        { id: 'xl', label: 'Taille XL', dimensions: 'Tour poitrine: 100-104cm' },
        { id: 'xxl', label: 'Taille XXL', dimensions: 'Tour poitrine: 104-108cm' },
      ]
    } else if (cat === 'goodies') {
      formats = [
        { id: '38x42', label: '38×42 cm (Standard)', dimensions: 'Anses 65 cm' },
        { id: '42x48', label: '42×48 cm (Grand)', dimensions: 'Anses renforcées' },
      ]
    } else if (cat === 'signaletique') {
      formats = [
        { id: 'rond-4', label: 'Rond Ø4cm', dimensions: 'Diamètre 40 mm' },
        { id: 'rond-6', label: 'Rond Ø6cm', dimensions: 'Diamètre 60 mm' },
        { id: 'rect-5x3', label: 'Rectangle 5×3', dimensions: '50×30 mm' },
        { id: 'rect-9x5', label: 'Rectangle 9×5', dimensions: '90×50 mm' },
      ]
    } else {
      formats = [
        { id: 'standard', label: 'Format Standard', dimensions: 'Dimension standard' },
        { id: 'large', label: 'Grand Format', dimensions: 'Dimension supérieure' },
      ]
    }
  }

  // 2. Matières intelligentes selon catégorie si non renseignées
  let papers = rawProduct.papers
  if (!papers || papers.length === 0) {
    if (cat === 'cartes-de-visite') {
      papers = [
        { id: 'couche-350', label: 'Couché mat 350g', description: 'Standard professionnel rigide' },
        { id: 'couche-400', label: 'Couché brillant 400g', description: 'Épais, éclatant & ferme' },
        { id: 'soft-touch', label: 'Soft Touch 400g', description: 'Toucher velours unique prestige', priceExtra: 2000 },
      ]
    } else if (cat === 'roll-up' || s.includes('roll-up') || s.includes('kakemono')) {
      papers = [
        { id: 'bache-510g', label: 'Bâche PVC 510g/m² M1 Anti-feu', description: 'Norme ERP foires & salons, indéchirable, lessivable' },
        { id: 'toile-ferrari', label: 'Toile Ferrari Décolit 325g Anti-curling', description: 'Sans rebiquage sur les bords, dos gris occultant, rendu mat prestige', priceExtra: 5000 },
        { id: 'textile-infroissable', label: 'Tissu Polyester 220g Infroissable', description: 'Toucher textile noble, zéro reflet sous les caméras et flashs', priceExtra: 7500 },
      ]
    } else if (cat === 'affiches') {
      papers = [
        { id: 'couche-200', label: 'Couché brillant 200g', description: 'Couleurs éclatantes, standard pro' },
        { id: 'couche-250', label: 'Couché brillant 250g', description: 'Rigide, finition galerie' },
        { id: 'bache', label: 'Bâche PVC 440g', description: 'Résistant pour extérieur et vitrine' },
      ]
    } else if (cat === 'brochures') {
      papers = [
        { id: 'satine-135', label: 'Satiné 135g', description: 'Toucher doux, souple et élégant' },
        { id: 'satine-170', label: 'Satiné 170g', description: 'Épais, tenue en main premium' },
        { id: 'couche-mat', label: 'Couché mat 150g', description: 'Rendu élégant sans reflet' },
      ]
    } else if (cat === 'textile') {
      papers = [
        { id: 'coton-180', label: 'Coton peigné 180g blanc', description: 'Classique doux, respirant et résistant' },
        { id: 'coton-noir', label: 'Coton peigné 180g noir', description: 'Impression spéciale fond sombre' },
      ]
    } else if (cat === 'goodies') {
      papers = [
        { id: 'coton-140', label: 'Coton naturel 140g', description: 'Standard écologique' },
        { id: 'coton-180', label: 'Coton épais 180g', description: 'Résistant et robuste' },
      ]
    } else if (cat === 'signaletique') {
      papers = [
        { id: 'papier-brillant', label: 'Papier brillant', description: 'Couleurs vives, usage standard' },
        { id: 'papier-mat', label: 'Papier mat', description: 'Rendu doux et élégant' },
        { id: 'resistant-eau', label: 'PP étanche résistant eau', description: 'Frigo, extérieur et humidité' },
      ]
    } else {
      papers = [
        { id: 'standard', label: 'Papier couché 135g', description: 'Standard professionnel' },
        { id: 'premium', label: 'Papier couché 250g', description: 'Épais et résistant' },
      ]
    }
  }

  // 3. Quantités par défaut
  let quantities = rawProduct.quantities
  if (!quantities || quantities.length === 0) {
    if (cat === 'roll-up' || s.includes('roll-up') || s.includes('kakemono')) {
      quantities = [1, 2, 3, 5, 10, 20]
    } else if (cat === 'textile') {
      quantities = [1, 5, 10, 25, 50, 100]
    } else if (cat === 'cartes-de-visite') {
      quantities = [100, 250, 500, 1000]
    } else if (cat === 'flyers') {
      quantities = [250, 500, 1000, 2500, 5000]
    } else if (cat === 'affiches') {
      quantities = [10, 25, 50, 100, 250]
    } else if (cat === 'brochures') {
      quantities = [100, 200, 500, 1000]
    } else if (cat === 'goodies') {
      quantities = [20, 50, 100, 250, 500]
    } else if (cat === 'signaletique') {
      quantities = [500, 1000, 2500, 5000]
    } else {
      quantities = [10, 25, 50, 100, 250]
    }
  }

  // 4. Finitions par défaut
  let finishes = rawProduct.finishes
  if (!finishes || finishes.length === 0) {
    if (cat === 'roll-up' || s.includes('roll-up') || s.includes('kakemono')) {
      finishes = [
        { id: 'none', label: 'Structure Standard Aluminium', value: 'none', priceModifier: 0 },
        { id: 'structure-pro', label: 'Structure Renforcée Pro (Pieds lestés)', value: 'structure-pro', priceModifier: 4500 },
      ]
    } else if (cat === 'cartes-de-visite' || cat === 'flyers' || cat === 'brochures') {
      finishes = [
        { id: 'none', label: 'Sans finition', value: 'none', priceModifier: 0 },
        { id: 'mat', label: 'Pelliculage mat', value: 'mat', priceModifier: 2000 },
        { id: 'brillant', label: 'Pelliculage brillant', value: 'brillant', priceModifier: 2000 },
      ]
    } else if (cat === 'textile') {
      finishes = [
        { id: 'dtg', label: 'Impression DTG', value: 'dtg', priceModifier: 0 },
        { id: 'serigraphie', label: 'Sérigraphie', value: 'serigraphie', priceModifier: 2000 },
        { id: 'broderie', label: 'Broderie', value: 'broderie', priceModifier: 5000 },
      ]
    } else {
      finishes = [
        { id: 'none', label: 'Sans finition', value: 'none', priceModifier: 0 }
      ]
    }
  }

  return {
    ...rawProduct,
    formats,
    papers,
    quantities,
    finishes,
    deliveryDays: rawProduct.deliveryDays || 2,
    basePrice: rawProduct.basePrice || 5000,
  }
}

// ─── DYNAMIC SEO METADATA ─────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug
  let product: any = await getProductBySlug(slug)
  const localProduct = PRODUCTS.find((p) => p.slug === slug) || null

  if (product && localProduct) {
    product = { ...localProduct, ...product }
  } else if (!product && localProduct) {
    product = localProduct
  }

  product = normalizeProduct(product, slug)

  if (!product) {
    return {
      title: 'Produit introuvable | YopoePrint',
      description: 'Ce produit n\'est pas disponible.',
    }
  }

  return {
    title: `${product.name} — Imprimerie en Ligne Burkina Faso | YopoePrint`,
    description: `${product.shortDesc || product.description || 'Impression haute qualité à Ouagadougou'}. Configurez vos options et commandez en ligne en toute sécurité.`,
    alternates: {
      canonical: `https://yopoeprint.bf/produit/${slug}`,
    },
    openGraph: {
      title: `${product.name} — YopoePrint Burkina Faso`,
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
  const localProduct = PRODUCTS.find((p) => p.slug === slug) || null

  // Fallback et fusion des options avec les données locales si l'API a des champs vides
  if (product && localProduct) {
    product = {
      ...localProduct,
      ...product,
      name: product.name || localProduct.name,
      description: product.description || localProduct.description,
      shortDesc: product.shortDesc || localProduct.shortDesc,
      basePrice: product.basePrice || localProduct.basePrice,
      formats: (product.formats && product.formats.length > 0) ? product.formats : localProduct.formats,
      papers: (product.papers && product.papers.length > 0) ? product.papers : localProduct.papers,
      finishes: (product.finishes && product.finishes.length > 0) ? product.finishes : localProduct.finishes,
      quantities: (product.quantities && product.quantities.length > 0) ? product.quantities : localProduct.quantities,
      deliveryDays: product.deliveryDays || localProduct.deliveryDays,
      badge: product.badge || localProduct.badge,
      imageUrl: product.imageUrl || localProduct.imageUrl,
    }
  } else if (!product && localProduct) {
    product = localProduct
  }

  // Normalisation universelle : pour TOUS les produits et catégories actuels et futurs
  product = normalizeProduct(product, slug)

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

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDesc || product.description || `Impression personnalisée de ${product.name} à Ouagadougou, Burkina Faso.`,
    image: product.imageUrl ? [product.imageUrl] : ['https://yopoeprint.bf/images/og-image.jpg'],
    sku: product.slug,
    mpn: product.slug,
    brand: {
      '@type': 'Brand',
      name: 'YopoePrint',
    },
    offers: {
      '@type': 'Offer',
      url: `https://yopoeprint.bf/produit/${slug}`,
      priceCurrency: 'XOF',
      price: product.basePrice || 12500,
      priceValidUntil: '2028-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'YopoePrint Burkina Faso',
      },
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://yopoeprint.bf',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Catalogue',
        item: 'https://yopoeprint.bf/catalogue',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category || 'Impression',
        item: `https://yopoeprint.bf/catalogue/${product.category || 'all'}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `https://yopoeprint.bf/produit/${slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductPageClient product={product} />
    </>
  )
}
