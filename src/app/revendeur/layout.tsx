'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthContext } from '@/context/AuthContext'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FileText, 
  PackageSearch,
  Settings,
  LogOut,
  Menu,
  X,
  Briefcase,
  Star
} from 'lucide-react'

const MENU_ITEMS = [
  { href: '/revendeur', icon: LayoutDashboard, label: 'Mon Espace Pro' },
  { href: '/revendeur/commandes', icon: ShoppingBag, label: 'Mes Commandes' },
  { href: '/revendeur/devis', icon: FileText, label: 'Générer un Devis' },
  { href: '/revendeur/marque-blanche', icon: PackageSearch, label: 'Marque Blanche' },
]

export default function RevendeurLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoggedIn, loading, logout } = useAuthContext()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Route protection
  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push('/connexion?redirect=/revendeur')
      }
    }
  }, [loading, isLoggedIn, router])

  if (loading || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* ── SIDEBAR MOBILE BACKDROP ── */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-indigo-950 text-white
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-indigo-950 border-b border-indigo-900/50">
          <Link href="/" className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Briefcase size={20} className="text-blue-400" /> Espace B2B
          </Link>
          <button onClick={closeSidebar} className="lg:hidden text-indigo-300 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* User Info & Tier */}
        <div className="p-6 border-b border-indigo-900/50">
          <p className="font-bold text-sm">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-indigo-300 mt-1 mb-3">Agence de Communication</p>
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 px-3 py-1.5 rounded-lg">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">Palier Gold (-15%)</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-4 text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">Menu Principal</p>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={closeSidebar}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-indigo-200 hover:bg-indigo-900/50 hover:text-white'}
                `}
              >
                <item.icon size={18} className={isActive ? 'text-blue-200' : 'text-indigo-400'} />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-indigo-900/50 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-300 hover:bg-indigo-900/50 hover:text-white transition-colors">
            <Settings size={18} /> Paramètres
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar Mobile */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:hidden shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <span className="font-display font-bold text-gray-900">Espace B2B</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

    </div>
  )
}
