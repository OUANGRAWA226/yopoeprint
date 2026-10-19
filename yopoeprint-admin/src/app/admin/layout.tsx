'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Tag, FileText, Settings, LogOut, Menu, X,
  ChevronRight, ClipboardList, Image as ImageIcon, Briefcase, ShieldCheck, History, Lock, CreditCard, Mail,
} from 'lucide-react'
import { adminAuthService } from '@/lib/auth-admin.service'
import { Role, ROLE_LABELS } from '@/lib/platform.service'

const ALL: Role[] = ['superadmin', 'admin', 'staff']
const MANAGERS: Role[] = ['superadmin', 'admin']
const SUPER: Role[] = ['superadmin']

// Qui voit quoi : le staff atelier gère commandes, BAT et devis ; l'équipe et le journal sont réservés au superadmin
const NAV: { href: string; icon: React.ReactNode; label: string; roles: Role[] }[] = [
  { href: '/admin',            icon: <LayoutDashboard size={18} />, label: 'Dashboard',              roles: ALL },
  { href: '/admin/commandes',  icon: <ShoppingCart size={18} />,    label: 'Commandes',              roles: ALL },
  { href: '/admin/devis',      icon: <ClipboardList size={18} />,   label: 'Devis',                  roles: ALL },
  { href: '/admin/paiements',  icon: <CreditCard size={18} />,      label: 'Paiements',              roles: ALL },
  { href: '/admin/clients',    icon: <Users size={18} />,           label: 'Clients',                roles: ALL },
  { href: '/admin/revendeurs', icon: <Briefcase size={18} />,       label: 'Revendeurs',             roles: ALL },
  { href: '/admin/produits',   icon: <Package size={18} />,         label: 'Produits',               roles: MANAGERS },
  { href: '/admin/bannieres',  icon: <ImageIcon size={18} />,       label: 'Carrousels & Bannières', roles: MANAGERS },
  { href: '/admin/promotions', icon: <Tag size={18} />,             label: 'Promotions',             roles: MANAGERS },
  { href: '/admin/blog',       icon: <FileText size={18} />,        label: 'Blog',                   roles: MANAGERS },
  { href: '/admin/emails',     icon: <Mail size={18} />,            label: 'Emails envoyés',         roles: MANAGERS },
  { href: '/admin/equipe',     icon: <ShieldCheck size={18} />,     label: 'Équipe',                 roles: SUPER },
  { href: '/admin/journal',    icon: <History size={18} />,         label: 'Journal des actions',    roles: SUPER },
  { href: '/admin/parametres', icon: <Settings size={18} />,        label: 'Paramètres',             roles: ALL },
]

const navItemFor = (pathname: string) =>
  NAV.find((n) => n.href === pathname) ?? NAV.find((n) => n.href !== '/admin' && pathname.startsWith(n.href))

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
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

  const role = String(user?.role || '').toLowerCase() as Role
  const visibleNav = NAV.filter((n) => n.roles.includes(role))
  const current = navItemFor(pathname)
  const allowed = !current || current.roles.includes(role)
  const pageTitle = current?.label ?? 'Dashboard'

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} shrink-0 bg-blue-deep
                         flex flex-col transition-all duration-300 relative z-20`}>

        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          {sidebarOpen && (
            <Link href="/" className="font-display text-xl font-bold text-white">
              Yopoe<span className="text-gold">Print</span>
            </Link>
          )}
          <button onClick={() => setSidebarOpen((s) => !s)} aria-label={sidebarOpen ? 'Réduire le menu' : 'Ouvrir le menu'}
            className={`${sidebarOpen ? 'ml-auto' : 'mx-auto'} w-8 h-8 flex items-center
                         justify-center rounded-lg hover:bg-white/10 text-white/60
                         hover:text-white transition-all`}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto" aria-label="Administration">
          {visibleNav.map(({ href, icon, label }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
            return (
              <Link key={href} href={href} title={sidebarOpen ? undefined : label}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                             font-medium text-sm transition-all group
                             ${active
                               ? 'bg-white/15 text-white'
                               : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <span className={`shrink-0 ${active ? 'text-gold' : 'group-hover:text-gold transition-colors'}`}>
                  {icon}
                </span>
                {sidebarOpen && <span>{label}</span>}
                {sidebarOpen && active && <ChevronRight size={14} className="ml-auto text-gold" />}
              </Link>
            )
          })}
        </nav>

        <div className="px-2 py-4 border-t border-white/10">
          <button
            onClick={() => {
              adminAuthService.logout()
              router.push('/login')
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                       text-white/70 hover:bg-red-500/20 hover:text-red-200
                       text-sm transition-all">
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && 'Déconnexion'}
          </button>
        </div>
      </aside>

      {/* ── Contenu principal ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4
                           flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="font-display text-xl font-bold text-blue-deep">{pageTitle}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">{ROLE_LABELS[role] || role}</p>
            </div>
            <div className="w-9 h-9 bg-blue-mid rounded-xl text-white text-sm font-bold flex items-center justify-center">
              {user?.firstName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {/* Pas de rendu (ni d'appels API) avant la vérification de la session */}
          {!isAuthenticated ? (
            <div className="h-64 flex items-center justify-center text-sm text-gray-500">Vérification de la session…</div>
          ) : allowed ? children : (
            <div className="max-w-md mx-auto mt-16 bg-white border border-gray-100 rounded-2xl p-8 text-center space-y-3">
              <Lock size={28} className="mx-auto text-gray-400" />
              <h2 className="font-display text-xl font-bold text-blue-deep">Accès réservé</h2>
              <p className="text-sm text-gray-600">
                Cette page n&apos;est pas accessible avec le rôle « {ROLE_LABELS[role] || role} ».
              </p>
              <Link href="/admin" className="inline-block text-sm font-bold text-blue-mid hover:underline">Retour au tableau de bord</Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
