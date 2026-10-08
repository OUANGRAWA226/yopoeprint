'use client'

import Link from 'next/link'
import { Home, Grid, FileText, ShoppingCart, User } from 'lucide-react'
import { useCartStore } from '@/hooks/useCart'
import { usePathname } from 'next/navigation'

export function BottomTabBar() {
  const itemCount = useCartStore((s) => s.itemCount)
  const pathname = usePathname()

  const tabs = [
    { label: 'Accueil',   icon: Home,         href: '/' },
    { label: 'Catalogue', icon: Grid,         href: '/catalogue' },
    { label: 'Devis',     icon: FileText,     href: '/devis' },
    { label: 'Panier',    icon: ShoppingCart, href: '/panier', badge: itemCount },
    { label: 'Compte',    icon: User,         href: '/connexion' },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch">
        {tabs.map(({ label, icon: Icon, href, badge }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 min-h-[60px] transition-colors active:scale-95
                ${isActive ? 'text-primary' : 'text-gray-500'}`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {badge && badge > 0 && (
                  <span className="absolute -top-2 -right-3 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-t-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
