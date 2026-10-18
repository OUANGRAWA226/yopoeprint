'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'

export function ConditionalUI({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // On cache le header public sur l'administration et les pages d'auth (qui ont leur propre layout)
  const isHidden = pathname?.startsWith('/admin') || 
                   pathname?.startsWith('/connexion') || 
                   pathname?.startsWith('/inscription') || 
                   pathname?.startsWith('/mot-de-passe-oublie') ||
                   pathname?.startsWith('/revendeur')

  return (
    <>
      {!isHidden && <Navbar />}
      {!isHidden && <CartDrawer />}
      
      <main className="flex-1">{children}</main>
      
      {!isHidden && <Footer />}
    </>
  )
}
