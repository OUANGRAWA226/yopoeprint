'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { usePublicSettings } from '@/lib/settings.service'

// Bandeau affiché sur toute la boutique quand le superadmin suspend les commandes (admin › Paramètres)
function MaintenanceBanner() {
  const maintenance = usePublicSettings().settings?.maintenance
  if (!maintenance?.enabled) return null
  return (
    <div role="status" className="bg-amber-100 text-amber-950 text-sm text-center px-4 py-2.5 border-b border-amber-200">
      <strong>Commandes momentanément suspendues.</strong>{' '}
      {maintenance.message || 'Le catalogue reste consultable ; revenez bientôt pour commander.'}
    </div>
  )
}

export function ConditionalUI({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // On cache le header public sur l'administration et les pages d'auth (qui ont leur propre layout)
  const isHidden = pathname?.startsWith('/admin') || 
                   pathname?.startsWith('/connexion') || 
                   pathname?.startsWith('/inscription') || 
                   pathname?.startsWith('/mot-de-passe-oublie') ||
                   pathname === '/revendeur' || !!pathname?.startsWith('/revendeur/')

  return (
    <>
      {/* Lien d'évitement : premier élément atteint au clavier, visible seulement au focus */}
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-white focus:text-gray-900 focus:font-bold focus:text-sm focus:px-4 focus:py-2.5 focus:rounded-xl focus:shadow-lg"
      >
        Aller au contenu
      </a>

      {!pathname?.startsWith('/admin') && <MaintenanceBanner />}
      {!isHidden && <Navbar />}
      {!isHidden && <CartDrawer />}

      <main id="contenu" tabIndex={-1} className="flex-1 outline-none">{children}</main>
      
      {!isHidden && <Footer />}
    </>
  )
}
