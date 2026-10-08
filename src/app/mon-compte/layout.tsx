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
    <div className="min-h-screen bg-[#F8F8F8]">

      {/* ── Header mobile ─────────────────────────────────── */}
      <div className="bg-gray-900 py-6 px-4 md:px-6 relative overflow-hidden">
        {/* Abstract shapes for premium feel */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-orange-400 rounded-2xl flex items-center justify-center font-display text-xl font-bold text-white shadow-lg shrink-0 border border-white/10">
            {initials}
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium mb-0.5">Espace Client</p>
            <h1 className="font-display text-xl font-bold text-white">
              {user?.firstName} {user?.lastName}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <Star size={12} className="text-[#FFD700] fill-[#FFD700]" />
              <span className="text-[#FFD700] text-xs font-semibold">
                {user?.loyaltyPoints || 0} points fidélité
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Layout principal ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 md:gap-8">

          {/* ── Sidebar ───────────────────────────────────── */}
          <aside className="hidden lg:block">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm sticky top-24">
              
              {/* Navigation */}
              <nav className="p-3 space-y-1">
                {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                  const isActive = pathname === href
                  return (
                    <Link key={href} href={href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                        ${isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      <Icon size={18} className={isActive ? 'text-primary' : 'text-gray-400'} />
                      <span className="flex-1">{label}</span>
                      {isActive && <ChevronRight size={14} className="text-primary" />}
                    </Link>
                  )
                })}
              </nav>

              {/* Séparateur */}
              <div className="border-t border-gray-100 p-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all group"
                >
                  <LogOut size={18} className="text-red-400 group-hover:text-red-500 transition-colors" />
                  Se déconnecter
                </button>
              </div>

              {/* Points fidélité */}
              <div className="m-4 p-4 bg-gray-900 rounded-xl relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/20 blur-2xl rounded-full transition-all group-hover:bg-primary/40" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Star size={14} className="text-[#FFD700] fill-[#FFD700]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Club Fidélité</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-white">
                    {user?.loyaltyPoints || 0} <span className="text-sm font-medium text-gray-400">pts</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2 bg-white/10 rounded-lg px-2 py-1.5 inline-block">
                    Soit {Math.floor((user?.loyaltyPoints || 0) / 10) * 100} FCFA de remise
                  </p>
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
