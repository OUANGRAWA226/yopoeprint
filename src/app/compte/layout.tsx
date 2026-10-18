'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, ShoppingBag, FolderOpen, Settings, LogOut, ShieldCheck, ChevronRight } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Vue d’ensemble', href: '/compte', icon: User },
  { label: 'Mes Commandes', href: '/compte/commandes', icon: ShoppingBag },
  { label: 'Mes Fichiers & BAT', href: '/compte/fichiers', icon: FolderOpen },
  { label: 'Paramètres du compte', href: '/compte/parametres', icon: Settings },
]

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-100 text-foreground py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Cupertino */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden sticky top-24">
              
              {/* Profile Card Header */}
              <div className="p-6 border-b border-black/5 bg-gradient-to-b from-gray-50/80 to-white">
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-foreground text-white flex items-center justify-center text-xl font-extrabold shadow-xs">
                    YP
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-foreground text-base leading-snug">Mon Espace Client</h2>
                    <span className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                      <ShieldCheck size={12} /> Compte Professionnel
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Ouagadougou, Burkina Faso</p>
              </div>
              
              {/* Navigation Links */}
              <nav className="p-3 space-y-1">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                        isActive 
                          ? 'bg-foreground text-white shadow-xs' 
                          : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={isActive ? 'text-primary' : 'text-gray-400'} />
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight size={14} className={isActive ? 'text-gray-400' : 'text-gray-300 opacity-60'} />
                    </Link>
                  )
                })}

                <div className="pt-3 mt-3 border-t border-black/5">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50/70 transition-all">
                    <LogOut size={16} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </nav>

            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {children}
          </div>

        </div>

      </div>
    </div>
  )
}
