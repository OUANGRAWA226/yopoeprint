import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import '@/styles/globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { ToastProvider } from '@/context/ToastContext'
import { ConditionalUI } from '@/components/layout/ConditionalUI'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://yopoeprint.bf'),
  title: 'YopoePrint — Imprimerie en ligne au Burkina Faso',
  description: "Commandez vos flyers, cartes de visite, bâches et bien plus. Qualité premium, livraison rapide, paiement Orange Money & Moov.",
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://yopoeprint.bf',
    siteName: 'YopoePrint',
    title: 'YopoePrint — L\'imprimerie en ligne n°1 au Burkina Faso',
    description: 'Imprimez tous vos supports de communication au Burkina Faso avec livraison rapide et paiement par Mobile Money.',
    images: [
      {
        url: 'https://yopoeprint.bf/images/og-image.jpg', // Placeholder
        width: 1200,
        height: 630,
        alt: 'YopoePrint - Imprimerie en ligne',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YopoePrint — Imprimerie en ligne',
    description: 'Commandez en ligne et faites-vous livrer partout au Burkina Faso.',
    images: ['https://yopoeprint.bf/images/og-image.jpg'],
  },
}

export const viewport = {
  themeColor: '#008537',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
}

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'YopoePrint',
  image: 'https://yopoeprint.bf/images/og-image.jpg',
  url: 'https://yopoeprint.bf',
  telephone: '+226 70 00 00 00',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Avenue Kwamé N\'Krumah',
    addressLocality: 'Ouagadougou',
    addressRegion: 'Kadiogo',
    postalCode: '01 BP',
    addressCountry: 'BF',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 12.3714,
    longitude: -1.5197,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '18:30',
    },
  ],
  paymentAccepted: 'Orange Money, Moov Money, Carte Bancaire, Virement, Espèces',
  currenciesAccepted: 'XOF',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${poppins.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body className="antialiased text-foreground bg-background">
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <ConditionalUI>
                {children}
              </ConditionalUI>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
