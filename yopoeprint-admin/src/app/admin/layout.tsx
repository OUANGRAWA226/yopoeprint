'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Tag, FileText, Settings, LogOut, Menu,
  ClipboardList, Image as ImageIcon, Briefcase, ShieldCheck, History, Lock, CreditCard, Mail,
  ExternalLink, ChevronDown, UserCircle,
} from 'lucide-react'
import { adminAuthService } from '@/lib/auth-admin.service'
import { Role, ROLE_LABELS } from '@/lib/platform.service'

const ALL: Role[] = ['superadmin', 'admin', 'staff']
const MANAGERS: Role[] = ['superadmin', 'admin']
const SUPER: Role[] = ['superadmin']

type NavItem = { href: string; icon: React.ReactNode; label: string; roles: Role[] }

// Qui voit quoi : le staff atelier gère commandes, BAT et devis ; l'équipe et le journal sont réservés au superadmin
const NAV_GROUPS: { header: string | null; items: NavItem[] }[] = [
  { header: null, items: [
    { href: '/admin', icon: <LayoutDashboard size={17} />, label: 'Tableau de bord', roles: ALL },
  ] },
  { header: 'Ventes', items: [
    { href: '/admin/commandes', icon: <ShoppingCart size={17} />,  label: 'Commandes', roles: ALL },
    { href: '/admin/devis',     icon: <ClipboardList size={17} />, label: 'Devis',     roles: ALL },
    { href: '/admin/paiements', icon: <CreditCard size={17} />,    label: 'Paiements', roles: ALL },
  ] },
  { header: 'Clients', items: [
    { href: '/admin/clients',    icon: <Users size={17} />,     label: 'Clients',    roles: ALL },
    { href: '/admin/revendeurs', icon: <Briefcase size={17} />, label: 'Revendeurs', roles: ALL },
  ] },
  { header: 'Catalogue & contenu', items: [
    { href: '/admin/produits',   icon: <Package size={17} />,   label: 'Produits',               roles: MANAGERS },
    { href: '/admin/bannieres',  icon: <ImageIcon size={17} />, label: 'Carrousels & bannières', roles: MANAGERS },
    { href: '/admin/promotions', icon: <Tag size={17} />,       label: 'Promotions',             roles: MANAGERS },
    { href: '/admin/blog',       icon: <FileText size={17} />,  label: 'Blog',                   roles: MANAGERS },
  ] },
  { header: 'Administration', items: [
    { href: '/admin/emails',     icon: <Mail size={17} />,        label: 'Emails envoyés',      roles: MANAGERS },
    { href: '/admin/equipe',     icon: <ShieldCheck size={17} />, label: 'Équipe',              roles: SUPER },
    { href: '/admin/journal',    icon: <History size={17} />,     label: 'Journal des actions', roles: SUPER },
    { href: '/admin/parametres', icon: <Settings size={17} />,    label: 'Paramètres',          roles: ALL },
  ] },
]

const NAV = NAV_GROUPS.flatMap((g) => g.items.map((item) => ({ ...item, group: g.header })))
const navItemFor = (pathname: string) =>
  NAV.find((n) => n.href === pathname) ?? NAV.find((n) => n.href !== '/admin' && pathname.startsWith(n.href))

// Classes du <body> attendues par AdminLTE 4 (barre latérale fixe, dépliée à partir de lg)
const BODY_CLASSES = ['layout-fixed', 'sidebar-expand-lg', 'sidebar-mini', 'bg-body-tertiary']
const LG = 992
const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLLIElement>(null)

  // Vérifier l'authentification au montage
  useEffect(() => {
    if (!adminAuthService.isAuthenticated()) {
      router.push('/login')
    } else {
      setIsAuthenticated(true)
      setUser(adminAuthService.getCurrentUser())
    }
  }, [router])

  // Mise en page AdminLTE sur <body>, retirée en quittant l'admin (page de connexion)
  useEffect(() => {
    document.body.classList.add(...BODY_CLASSES)
    try {
      if (localStorage.getItem('yp.sidebar') === 'collapsed' && window.innerWidth >= LG) document.body.classList.add('sidebar-collapse')
    } catch { /* stockage indisponible */ }
    return () => document.body.classList.remove(...BODY_CLASSES, 'sidebar-collapse', 'sidebar-open')
  }, [])

  // Sur mobile, le tiroir se referme à chaque changement de page
  useEffect(() => {
    document.body.classList.remove('sidebar-open')
    setMenuOpen(false)
  }, [pathname])

  // Menu utilisateur : fermeture au clic extérieur et sur Échap
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey) }
  }, [menuOpen])

  // Bouton ☰ : réduit la barre (desktop) ou ouvre le tiroir (mobile)
  const toggleSidebar = useCallback(() => {
    const body = document.body
    if (window.innerWidth >= LG) {
      const collapsed = body.classList.toggle('sidebar-collapse')
      try { localStorage.setItem('yp.sidebar', collapsed ? 'collapsed' : 'open') } catch { /* rien */ }
    } else {
      body.classList.toggle('sidebar-open')
    }
  }, [])

  const logout = async () => {
    await adminAuthService.logout()
    router.push('/login')
  }

  const role = String(user?.role || '').toLowerCase() as Role
  const current = navItemFor(pathname)
  const allowed = !current || current.roles.includes(role)
  const pageTitle = current?.label ?? 'Tableau de bord'
  const initial = user?.firstName?.charAt(0)?.toUpperCase() || 'A'
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Administrateur'

  return (
    <div className="app-wrapper">
      {/* ── Navbar ───────────────────────────────────────── */}
      <nav className="app-header navbar navbar-expand bg-body" aria-label="Barre supérieure">
        <div className="container-fluid">
          <ul className="navbar-nav">
            <li className="nav-item">
              <button type="button" className="nav-link btn btn-link" onClick={toggleSidebar} aria-label="Afficher ou réduire le menu">
                <Menu size={20} />
              </button>
            </li>
            <li className="nav-item d-none d-md-block">
              <Link href="/admin" className="nav-link">Tableau de bord</Link>
            </li>
            <li className="nav-item d-none d-md-block">
              <a href={STORE_URL} target="_blank" rel="noreferrer" className="nav-link d-inline-flex align-items-center gap-1">
                Voir la boutique <ExternalLink size={13} />
              </a>
            </li>
          </ul>

          <ul className="navbar-nav ms-auto">
            <li ref={menuRef} className={`nav-item dropdown user-menu ${menuOpen ? 'show' : ''}`}>
              <button type="button" className="nav-link btn btn-link d-flex align-items-center gap-2"
                aria-expanded={menuOpen} aria-haspopup="menu" aria-label={`Menu du compte de ${fullName}`} onClick={() => setMenuOpen((o) => !o)}>
                <span className="user-avatar" aria-hidden="true">{initial}</span>
                <span className="d-none d-md-inline">{fullName}</span>
                <ChevronDown size={14} className="d-none d-md-inline" />
              </button>
              <ul className={`dropdown-menu dropdown-menu-lg dropdown-menu-end ${menuOpen ? 'show' : ''}`} role="menu"
                style={menuOpen ? { right: 0, left: 'auto' } : undefined}>
                <li className="user-header text-bg-primary">
                  <span className="user-avatar mx-auto mb-2 bg-navy" style={{ width: 64, height: 64, fontSize: '1.6rem' }} aria-hidden="true">{initial}</span>
                  <p className="mb-0">
                    {fullName}
                    <small>{ROLE_LABELS[role] || role}{user?.email ? ` · ${user.email}` : ''}</small>
                  </p>
                </li>
                <li className="user-footer d-flex justify-content-between">
                  {role === 'superadmin' || role === 'admin' || role === 'staff' ? (
                    <Link href="/admin/parametres" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1">
                      <UserCircle size={15} /> Paramètres
                    </Link>
                  ) : <span />}
                  <button type="button" onClick={logout} className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1">
                    <LogOut size={15} /> Déconnexion
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>

      {/* ── Barre latérale ───────────────────────────────── */}
      <aside className="app-sidebar shadow" data-bs-theme="dark">
        <div className="sidebar-brand">
          <Link href="/admin" className="brand-link d-flex align-items-center gap-2">
            <span className="brand-mark" aria-hidden="true">Y</span>
            <span className="brand-text fw-semibold">Yopoe<span className="text-gold">Print</span></span>
          </Link>
        </div>
        <div className="sidebar-wrapper">
          <div className="user-panel d-flex align-items-center gap-2 px-3 py-3">
            <span className="avatar" aria-hidden="true">{initial}</span>
            <div className="user-info min-w-0">
              <div className="text-white text-truncate small fw-semibold">{fullName}</div>
              <div className="text-white-50 small">{ROLE_LABELS[role] || role}</div>
            </div>
          </div>
          <nav className="mt-2" aria-label="Administration">
            <ul className="nav sidebar-menu flex-column" role="list">
              {NAV_GROUPS.map((group) => {
                const items = group.items.filter((n) => n.roles.includes(role))
                if (!items.length) return null
                return [
                  group.header && <li key={`h-${group.header}`} className="nav-header">{group.header.toUpperCase()}</li>,
                  ...items.map(({ href, icon, label }) => {
                    const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
                    return (
                      <li key={href} className="nav-item">
                        <Link href={href} className={`nav-link ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined} title={label}>
                          <span className="nav-icon">{icon}</span>
                          <p>{label}</p>
                        </Link>
                      </li>
                    )
                  }),
                ]
              })}
              <li className="nav-header">SESSION</li>
              <li className="nav-item">
                <button type="button" onClick={logout} className="nav-link w-100 text-start border-0 bg-transparent" title="Déconnexion">
                  <span className="nav-icon"><LogOut size={17} /></span>
                  <p>Déconnexion</p>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* ── Contenu ──────────────────────────────────────── */}
      <main className="app-main">
        <div className="app-content-header">
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-6"><h3 className="mb-0">{pageTitle}</h3></div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-end mb-0">
                  <li className="breadcrumb-item"><Link href="/admin">Accueil</Link></li>
                  {current?.group && <li className="breadcrumb-item">{current.group}</li>}
                  {pathname !== '/admin' && <li className="breadcrumb-item active" aria-current="page">{pageTitle}</li>}
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="app-content">
          <div className="container-fluid">
            {/* Pas de rendu (ni d'appels API) avant la vérification de la session */}
            {!isAuthenticated ? (
              <div className="d-flex align-items-center justify-content-center text-secondary py-5">
                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" /> Vérification de la session…
              </div>
            ) : allowed ? children : (
              <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                  <div className="card card-outline card-danger mt-4 text-center">
                    <div className="card-body py-5">
                      <Lock size={30} className="text-secondary mb-3" />
                      <h4 className="text-navy">Accès réservé</h4>
                      <p className="text-secondary">Cette page n&apos;est pas accessible avec le rôle « {ROLE_LABELS[role] || role} ».</p>
                      <Link href="/admin" className="btn btn-primary">Retour au tableau de bord</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="app-footer small">
        <div className="float-end d-none d-sm-inline text-secondary">Back-office</div>
        <strong>YopoePrint</strong> <span className="text-secondary">— imprimerie en ligne</span>
      </footer>

      {/* Fond sombre du tiroir mobile : un clic le referme */}
      <div className="sidebar-overlay" onClick={() => document.body.classList.remove('sidebar-open')} aria-hidden="true" />
    </div>
  )
}
