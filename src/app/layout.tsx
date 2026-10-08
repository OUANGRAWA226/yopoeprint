import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
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

export const metadata: Metadata = {
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
  themeColor: '#FF6B00',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={poppins.variable}>
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
