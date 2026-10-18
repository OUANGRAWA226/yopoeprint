'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/context/AuthContext'
import {
  LayoutDashboard, ShoppingBag, FileText,
  MapPin, User, LogOut, ChevronRight, Star
} from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'

const NAV_ITEMS = [
  { href: '/mon-compte', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/mon-compte/commandes', icon: ShoppingBag, label: 'Mes commandes' },
  { href: '/mon-compte/devis', icon: FileText, label: 'Mes devis' },
  { href: '/mon-compte/adresses', icon: MapPin, label: 'Mes adresses' },
  { href: '/mon-compte/profil', icon: User, label: 'Mon profil' },
]

export default function MonCompteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoggedIn, loading, logout } = useAuthContext()

  // Rediriger si non connecté
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/connexion?redirect=/mon-compte')
    }
  }, [loading, isLoggedIn, router])

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      {/* Skeleton du header */}
      <div className="bg-gray-900 py-6 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-2xl bg-white/10" />
          <div>
            <Skeleton className="h-3 w-24 mb-2 bg-white/10" />
            <Skeleton className="h-6 w-40 bg-white/10" />
          </div>
        </div>
      </div>
      {/* Skeleton du contenu */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar skeleton */}
        <div className="hidden lg:block bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
        </div>
        {/* Content skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  if (!isLoggedIn) return null

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  // Initiales de l'utilisateur
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50/60">

      {/* ── Header Espace Client Slate-950 ────────────────── */}
      <div className="bg-slate-950 py-7 px-4 md:px-6 relative overflow-hidden border-b border-slate-800">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none" 
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '28px 28px'
          }}
        />
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-orange-500 rounded-2xl flex items-center justify-center font-display text-xl font-extrabold text-white shadow-lg shrink-0 border border-white/10 tracking-tight">
              {initials || 'YP'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Espace Client</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Compte vérifié
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Compte Professionnel'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {user?.email || 'client@yopoeprint.bf'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="font-bold text-white">{user?.loyaltyPoints || 0}</span> points fidélité
            </div>
            <Link 
              href="/catalogue"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-sm"
            >
              Imprimer <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Layout principal ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 md:gap-8">

          {/* ── Sidebar ───────────────────────────────────── */}
          <aside className="hidden lg:block">
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm sticky top-24">
              
              {/* Navigation */}
              <nav className="p-3 space-y-1">
                {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                  const isActive = pathname === href
                  return (
                    <Link key={href} href={href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all
                        ${isActive
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      <Icon size={17} className={isActive ? 'text-primary' : 'text-slate-400'} />
                      <span className="flex-1 text-xs sm:text-sm">{label}</span>
                      {isActive && <ChevronRight size={14} className="text-slate-400" />}
                    </Link>
                  )
                })}
              </nav>

              {/* Séparateur */}
              <div className="border-t border-slate-100 p-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all group"
                >
                  <LogOut size={16} className="text-rose-400 group-hover:text-rose-600 transition-colors" />
                  Se déconnecter
                </button>
              </div>

              {/* Points fidélité */}
              <div className="m-3 p-4 bg-slate-950 rounded-xl relative overflow-hidden border border-slate-800">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Programme Privilège</span>
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                  </div>
                  <p className="font-display text-xl font-bold text-white font-mono">
                    {user?.loyaltyPoints || 0} <span className="text-xs font-normal text-slate-400">pts</span>
                  </p>
                  <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Remise disponible :</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {Math.floor((user?.loyaltyPoints || 0) / 10) * 100} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Contenu principal ──────────────────────────── */}
          <main className="min-w-0">
            {/* Mobile Nav (Dropdown like or horizontal scroll) */}
            <div className="lg:hidden mb-6 overflow-x-auto scrollbar-none flex gap-2">
              {NAV_ITEMS.map(({ href, label }) => {
                const isActive = pathname === href
                return (
                  <Link key={href} href={href}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border
                      ${isActive ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}
                  >
                    {label}
                  </Link>
                )
              })}
            </div>
            
            {children}
          </main>

        </div>
      </div>
    </div>
  )
}
