'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, ShoppingBag, FolderOpen, Settings, LogOut } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Vue d\'ensemble', href: '/compte', icon: User },
  { label: 'Mes Commandes', href: '/compte/commandes', icon: ShoppingBag },
  { label: 'Mes Fichiers', href: '/compte/fichiers', icon: FolderOpen },
  { label: 'Paramètres', href: '/compte/parametres', icon: Settings },
]

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#F8F8F8] py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  JD
                </div>
                <h2 className="font-display font-bold text-gray-900 text-lg">John Doe</h2>
                <p className="text-gray-500 text-sm">Client Premium</p>
              </div>
              
              <nav className="p-3 space-y-1">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all
                        ${isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      <Icon size={18} className={isActive ? 'text-primary' : 'text-gray-400'} />
                      {link.label}
                    </Link>
                  )
                })}

                <div className="pt-4 mt-4 border-t border-gray-100">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-all">
                    <LogOut size={18} />
                    Déconnexion
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {children}
          </div>
        </div>

      </div>
    </div>
  )
}
