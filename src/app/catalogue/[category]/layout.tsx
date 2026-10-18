import type { Metadata } from 'next'

const CATEGORY_SEO_DATA: Record<
  string,
  { title: string; description: string; canonical: string }
> = {
  'cartes-de-visite': {
    title: 'Cartes de Visite Professionnelles — Imprimerie Burkina Faso | YopoePrint',
    description: 'Imprimez vos cartes de visite haut de gamme à Ouagadougou : couchés 350g, 400g, Soft Touch, dorure or à chaud. Livraison rapide partout au Burkina.',
    canonical: 'https://yopoeprint.bf/catalogue/cartes-de-visite',
  },
  cartes: {
    title: 'Cartes de Visite Professionnelles — Imprimerie Burkina Faso | YopoePrint',
    description: 'Imprimez vos cartes de visite haut de gamme à Ouagadougou : couchés 350g, 400g, Soft Touch, dorure or à chaud. Livraison rapide partout au Burkina.',
    canonical: 'https://yopoeprint.bf/catalogue/cartes-de-visite',
  },
  flyers: {
    title: 'Impression Flyers & Dépliants Publicitaires Ouagadougou | YopoePrint',
    description: 'Flyers A4, A5, A6 et dépliants 2 ou 3 volets à prix fabricant au Burkina Faso. Impression haute définition 300 DPI, contrôle PAO gratuit.',
    canonical: 'https://yopoeprint.bf/catalogue/flyers',
  },
  'roll-up': {
    title: 'Roll-up & Kakémonos Publicitaires Stand & Salons | YopoePrint',
    description: 'Kakémonos roll-up 85×200cm structure aluminium avec housse de transport offerte. Bâche M1 anti-feu certifiée pour foires et événements à Ouagadougou.',
    canonical: 'https://yopoeprint.bf/catalogue/roll-up',
  },
  signaletique: {
    title: 'Bâches Publicitaires & Signalétique Grand Format | YopoePrint',
    description: 'Impression de bâches PVC 510g/m² avec œillets renforcés, panneaux Forex, Dibond et enseignes extérieures au Burkina Faso.',
    canonical: 'https://yopoeprint.bf/catalogue/signaletique',
  },
  baches: {
    title: 'Bâches Publicitaires & Signalétique Grand Format | YopoePrint',
    description: 'Impression de bâches PVC 510g/m² avec œillets renforcés, panneaux Forex, Dibond et enseignes extérieures au Burkina Faso.',
    canonical: 'https://yopoeprint.bf/catalogue/signaletique',
  },
  affiches: {
    title: 'Affiches & Posters Haute Définition A3, A2, A1 | YopoePrint',
    description: 'Affiches promotionnelles et posters événementiels grand format sur papier couché 170g à 250g. Tirage express à Ouagadougou.',
    canonical: 'https://yopoeprint.bf/catalogue/affiches',
  },
  brochures: {
    title: 'Brochures, Catalogues & Plaquettes d\'Entreprise | YopoePrint',
    description: 'Impression de brochures agrafées et dos carré collé pour entreprises, ONG et institutions au Burkina Faso.',
    canonical: 'https://yopoeprint.bf/catalogue/brochures',
  },
  textile: {
    title: 'Textile Imprimé & T-shirts Personnalisés Burkina Faso | YopoePrint',
    description: 'Personnalisation textile en sérigraphie, DTF et broderie : t-shirts, polos, casquettes pour entreprises et événements.',
    canonical: 'https://yopoeprint.bf/catalogue/textile',
  },
  goodies: {
    title: 'Goodies & Objets Publicitaires Personnalisés Ouagadougou | YopoePrint',
    description: 'Stylos, carnets, clés USB, mugs et tote bags personnalisés à votre effigie pour vos campagnes de communication d\'entreprise.',
    canonical: 'https://yopoeprint.bf/catalogue/goodies',
  },
  etiquettes: {
    title: 'Étiquettes Adhésives & Stickers Vinyle Personnalisés | YopoePrint',
    description: 'Stickers découpés à la forme, étiquettes en rouleau et packaging sur mesure résistants à l\'eau et aux frottements.',
    canonical: 'https://yopoeprint.bf/catalogue/etiquettes',
  },
  corporate: {
    title: 'Papeterie Corporate & En-têtes de Lettre | YopoePrint',
    description: 'Papeterie d\'entreprise haut de gamme : papier en-tête, chemises à rabats, enveloppes personnalisées pour une image professionnelle irréprochable.',
    canonical: 'https://yopoeprint.bf/catalogue/corporate',
  },
}

export async function generateMetadata({
  params,
}: {
  params: { category: string }
}): Promise<Metadata> {
  const cat = params.category
  const data =
    CATEGORY_SEO_DATA[cat] || {
      title: `${cat.charAt(0).toUpperCase() + cat.slice(1)} — Catalogue YopoePrint Burkina Faso`,
      description: `Découvrez nos solutions d'impression pour ${cat}. Imprimerie en ligne professionnelle à Ouagadougou.`,
      canonical: `https://yopoeprint.bf/catalogue/${cat}`,
    }

  return {
    title: data.title,
    description: data.description,
    alternates: {
      canonical: data.canonical,
    },
    openGraph: {
      title: data.title,
      description: data.description,
      url: data.canonical,
      siteName: 'YopoePrint',
      images: [
        {
          url: 'https://yopoeprint.bf/images/og-image.jpg',
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },
  }
}

export default function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { category: string }
}) {
  const cat = params.category
  const data = CATEGORY_SEO_DATA[cat] || {
    title: cat,
    canonical: `https://yopoeprint.bf/catalogue/${cat}`,
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
        name: data.title.split('—')[0].trim(),
        item: data.canonical,
      },
    ],
  }

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: data.title,
    url: data.canonical,
    isPartOf: {
      '@type': 'WebSite',
      name: 'YopoePrint',
      url: 'https://yopoeprint.bf',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {children}
    </>
  )
}
