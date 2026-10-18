'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthContext } from '@/context/AuthContext'
import { resellerService, ResellerMe } from '@/lib/reseller.service'
import {
  LayoutDashboard, ShoppingBag, PackageSearch, Settings, LogOut, Menu, X, Briefcase, Star, Clock, Store,
} from 'lucide-react'

const MENU_ITEMS = [
  { href: '/revendeur', icon: LayoutDashboard, label: 'Mon espace' },
  { href: '/revendeur/marque-blanche', icon: PackageSearch, label: 'Marque blanche' },
  { href: '/mon-compte/commandes', icon: ShoppingBag, label: 'Mes commandes' },
  { href: '/catalogue', icon: Store, label: 'Commander' },
]

// Écran affiché tant que le compte n'est pas un revendeur validé
function StatusScreen({ me }: { me: ResellerMe }) {
  const content = {
    pending: {
      title: 'Demande en cours d\'examen',
      text: `Votre demande pour ${me.companyName || 'votre agence'} a bien été reçue. Nous vous répondons par email sous 24 h ouvrées ; la remise s'appliquera dès la validation.`,
    },
    rejected: {
      title: 'Demande non retenue',
      text: 'Votre demande de compte revendeur n\'a pas été retenue. Contactez-nous pour en discuter.',
    },
    suspended: {
      title: 'Compte revendeur suspendu',
      text: 'Votre accès revendeur est suspendu. Contactez-nous pour le réactiver.',
    },
  }[me.status as 'pending' | 'rejected' | 'suspended']

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center mx-auto">
          {me.status === 'pending' ? <Clock size={26} /> : <Briefcase size={26} />}
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900">{content?.title || 'Espace réservé aux revendeurs'}</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          {content?.text || `Agences et graphistes : profitez de −${me.tiers?.[0]?.rate ?? 15} % sur tout le catalogue et de la livraison en marque blanche.`}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          {!me.status && <Link href="/revendeurs" className="btn-primary">Devenir revendeur</Link>}
          {(me.status === 'rejected' || me.status === 'suspended') && <Link href="/contact" className="btn-primary">Nous contacter</Link>}
          <Link href="/" className="btn-outline">Retour à la boutique</Link>
        </div>
      </div>
    </div>
  )
}

export default function RevendeurLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoggedIn, loading, logout } = useAuthContext()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [me, setMe] = useState<ResellerMe | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (loading) return
    if (!isLoggedIn) {
      router.push('/connexion?redirect=/revendeur')
      return
    }
    resellerService.getMe().then(setMe).catch((e) => setError(e?.message || 'Espace revendeur indisponible'))
  }, [loading, isLoggedIn, router])

  if (error) {
    return <div className="min-h-screen flex items-center justify-center p-6 text-sm text-red-700" role="alert">{error}</div>
  }
  if (loading || !isLoggedIn || !me) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" aria-busy="true">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }
  if (!me.isReseller) return <StatusScreen me={me} />

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={closeSidebar} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <Link href="/" className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Briefcase size={20} className="text-emerald-400" /> Espace revendeur
          </Link>
          <button onClick={closeSidebar} aria-label="Fermer le menu" className="lg:hidden text-gray-300 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 border-b border-white/10">
          <p className="font-bold text-sm">{me.companyName}</p>
          {me.tier && (
            <div className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg">
              <Star size={14} className="text-amber-300" />
              <span className="text-xs font-bold text-white">Palier {me.tier.label} (−{me.tier.rate} %)</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1" aria-label="Espace revendeur">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={closeSidebar}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive ? 'bg-white/15 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
                <item.icon size={18} className={isActive ? 'text-emerald-400' : 'text-gray-400'} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <Link href="/mon-compte/profil" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white">
            <Settings size={18} /> Mon profil
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/10">
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:hidden shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} aria-label="Ouvrir le menu"
            className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Menu size={20} />
          </button>
          <span className="ml-2 font-display font-bold text-gray-900">Espace revendeur</span>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  )
}
