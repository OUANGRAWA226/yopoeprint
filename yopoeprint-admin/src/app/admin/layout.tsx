'use client'

import { useState, useEffect } from 'react'
import Link          from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { adminAuthService } from '@/lib/auth-admin.service'
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Tag, FileText, Settings, LogOut, Menu, X,
  ChevronRight, Bell, Search, ClipboardList
} from 'lucide-react'

const NAV = [
  { href: '/admin',            icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { href: '/admin/produits',   icon: <Package size={18} />,         label: 'Produits' },
  { href: '/admin/commandes',  icon: <ShoppingCart size={18} />,    label: 'Commandes' },
  { href: '/admin/devis',      icon: <ClipboardList size={18} />,    label: 'Devis' },
  { href: '/admin/clients',    icon: <Users size={18} />,           label: 'Clients' },
  { href: '/admin/promotions', icon: <Tag size={18} />,             label: 'Promotions' },
  { href: '/admin/blog',       icon: <FileText size={18} />,        label: 'Blog' },
  { href: '/admin/parametres', icon: <Settings size={18} />,        label: 'Paramètres' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifications] = useState(3)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Vérifier l'authentification au montage
  useEffect(() => {
    const authenticated = adminAuthService.isAuthenticated()
    if (!authenticated) {
      router.push('/login')
    } else {
      setIsAuthenticated(true)
      setUser(adminAuthService.getCurrentUser())
    }
  }, [router])

  const pageTitle = NAV.find((n) => n.href === pathname)?.label
    ?? NAV.find((n) => pathname.startsWith(n.href) && n.href !== '/admin')?.label
    ?? 'Dashboard'

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} shrink-0 bg-blue-deep
                         flex flex-col transition-all duration-300 relative z-20`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          {sidebarOpen && (
            <Link href="/" className="font-display text-xl font-bold text-white">
              Yopoe<span className="text-gold">Print</span>
            </Link>
          )}
          <button onClick={() => setSidebarOpen((s) => !s)}
            className={`${sidebarOpen ? 'ml-auto' : 'mx-auto'} w-8 h-8 flex items-center
                         justify-center rounded-lg hover:bg-white/10 text-white/60
                         hover:text-white transition-all`}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV.map(({ href, icon, label }) => {
            const active = href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                             font-medium text-sm transition-all group
                             ${active
                               ? 'bg-white/15 text-white'
                               : 'text-white/55 hover:bg-white/10 hover:text-white'}`}>
                <span className={`shrink-0 ${active ? 'text-gold' : 'group-hover:text-gold transition-colors'}`}>
                  {icon}
                </span>
                {sidebarOpen && <span>{label}</span>}
                {sidebarOpen && active && (
                  <ChevronRight size={14} className="ml-auto text-gold" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bas sidebar */}
        <div className="px-2 py-4 border-t border-white/10 space-y-1">
          <Link href="/admin/parametres"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/55
                       hover:bg-white/10 hover:text-white text-sm transition-all">
            <Settings size={18} className="shrink-0" />
            {sidebarOpen && 'Paramètres'}
          </Link>
          <button
            onClick={() => {
              adminAuthService.logout()
              router.push('/login')
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                       text-white/55 hover:bg-red-500/20 hover:text-red-300
                       text-sm transition-all">
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && 'Déconnexion'}
          </button>
        </div>
      </aside>

      {/* ── Contenu principal ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar admin */}
        <header className="bg-white border-b border-gray-100 px-6 py-4
                           flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="font-display text-xl font-bold text-blue-deep">{pageTitle}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Recherche rapide */}
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Rechercher…"
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl
                           text-sm outline-none focus:border-blue-mid focus:bg-white
                           transition-all w-48 focus:w-64" />
            </div>
            {/* Notifs */}
            <button className="relative w-9 h-9 bg-gray-50 border border-gray-200
                               rounded-xl flex items-center justify-center
                               hover:bg-blue-pale transition-colors">
              <Bell size={16} className="text-gray-500" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full
                                 text-white text-[9px] font-bold flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            {/* Avatar */}
            <div className="w-9 h-9 bg-blue-mid rounded-xl flex items-center
                            justify-content text-white text-sm font-bold
                            flex items-center justify-center">
              {user?.firstName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
