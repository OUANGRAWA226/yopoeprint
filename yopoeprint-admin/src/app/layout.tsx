import type { Metadata } from 'next'
import { Source_Sans_3 } from 'next/font/google'
import 'admin-lte/dist/css/adminlte.min.css'
import './globals.css'

// Police d'AdminLTE 4
const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-source-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'YopoePrint Admin',
  description: 'Back office YopoePrint',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-bs-theme="light" className={sourceSans.variable}>
      <body>{children}</body>
    </html>
  )
}
