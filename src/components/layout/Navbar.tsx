'use client'

import Link from 'next/link'
import { Search, ShoppingCart, User, X, ChevronRight, LogOut, Menu, ArrowRight, LayoutGrid, Loader2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuthContext } from '@/context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { productsService } from '@/lib/products.service'

// ─── Data Structure ───────────────────────────────────────────────────────────
const NAV_DATA = [
  {
    label: 'Flyers & Dépliants',
    href: '/catalogue/flyers',
    emoji: '📄',
    subCols: [
      {
        title: 'Formats standards',
        items: [
          { label: 'Flyer A6 (10×15cm)', href: '/catalogue/flyers' },
          { label: 'Flyer A5 (14,8×21cm)', href: '/catalogue/flyers' },
          { label: 'Flyer A4 (21×29,7cm)', href: '/catalogue/flyers' },
          { label: 'Dépliant 3 volets', href: '/catalogue/flyers' },
        ],
      },
      {
        title: 'Formats spéciaux',
        items: [
          { label: 'Flyer Carré 15×15', href: '/catalogue/flyers' },
          { label: 'DL (10×21cm)', href: '/catalogue/flyers' },
          { label: 'Flyer grand format', href: '/catalogue/affiches' },
        ],
      },
    ],
    featured: { emoji: '📄', text: 'Flyers en 48h', sub: 'Dès 100 exemplaires', href: '/catalogue/flyers' },
  },
  {
    label: 'Cartes de visite',
    href: '/catalogue/cartes',
    emoji: '🪪',
    subCols: [
      {
        title: 'Formats & Matières',
        items: [
          { label: 'Carte standard 85×55mm', href: '/catalogue/cartes' },
          { label: 'Carte Square 55×55mm', href: '/catalogue/cartes' },
          { label: 'Carte Premium 350g', href: '/catalogue/cartes' },
          { label: 'Carte Soft Touch', href: '/catalogue/cartes' },
        ],
      },
      {
        title: 'Finitions',
        items: [
          { label: 'Pelliculage Mat', href: '/catalogue/cartes' },
          { label: 'Pelliculage Brillant', href: '/catalogue/cartes' },
          { label: 'Vernis Sélectif 3D', href: '/catalogue/cartes' },
          { label: 'Dorure à chaud', href: '/catalogue/cartes' },
        ],
      },
    ],
    featured: { emoji: '🪪', text: 'Cartes premium', sub: 'Finitions exclusives', href: '/catalogue/cartes' },
  },
  {
    label: 'Affiches & Signalétique',
    href: '/catalogue/affiches',
    emoji: '🗓️',
    subCols: [
      {
        title: 'Affiches papier',
        items: [
          { label: 'Affiche A3 (29,7×42)', href: '/catalogue/affiches' },
          { label: 'Affiche A2 (42×59,4)', href: '/catalogue/affiches' },
          { label: 'Affiche A1 (59,4×84)', href: '/catalogue/affiches' },
          { label: 'Affiche A0 (84×118,9)', href: '/catalogue/affiches' },
        ],
      },
      {
        title: 'Signalétique',
        items: [
          { label: 'Panneau Akilux', href: '/catalogue/signaletique' },
          { label: 'Panneau Forex', href: '/catalogue/signaletique' },
          { label: 'Bâches & Banderoles', href: '/catalogue/signaletique' },
          { label: 'Adhésifs vitrine', href: '/catalogue/signaletique' },
        ],
      },
    ],
    featured: { emoji: '🗓️', text: 'Grand format', sub: 'Impression éco-solvant', href: '/catalogue/affiches' },
  },
  {
    label: 'Brochures & Livrets',
    href: '/catalogue/brochures',
    emoji: '📚',
    subCols: [
      {
        title: 'Reliures',
        items: [
          { label: 'Brochure agrafée', href: '/catalogue/brochures' },
          { label: 'Dos carré collé', href: '/catalogue/brochures' },
          { label: 'À spirale', href: '/catalogue/brochures' },
          { label: 'Catalogue produits', href: '/catalogue/brochures' },
        ],
      },
      {
        title: 'Formats',
        items: [
          { label: 'A5 (8 à 64 pages)', href: '/catalogue/brochures' },
          { label: 'A4 (4 à 80 pages)', href: '/catalogue/brochures' },
          { label: 'Carré 210×210', href: '/catalogue/brochures' },
        ],
      },
    ],
    featured: { emoji: '📚', text: 'Catalogues pro', sub: 'Jusqu\'à 200 pages', href: '/catalogue/brochures' },
  },
  {
    label: 'Roll-up & Kakémonos',
    href: '/catalogue/roll-up',
    emoji: '🪧',
    subCols: [
      {
        title: 'Kakémonos',
        items: [
          { label: 'Roll-up 85×200cm', href: '/catalogue/roll-up' },
          { label: 'Roll-up 100×200cm', href: '/catalogue/roll-up' },
          { label: 'Roll-up premium', href: '/catalogue/roll-up' },
          { label: 'X-Banner & L-Banner', href: '/catalogue/roll-up' },
        ],
      },
      {
        title: 'Totem & Présentoirs',
        items: [
          { label: 'Photocall / Mur image', href: '/catalogue/evenementiel' },
          { label: 'Totem publicitaire', href: '/catalogue/signaletique' },
          { label: 'Porte-brochure', href: '/catalogue/papeterie' },
        ],
      },
    ],
    featured: { emoji: '🪧', text: 'Kakémono express', sub: 'Structure incluse', href: '/catalogue/roll-up' },
  },
  {
    label: 'Textile imprimé',
    href: '/catalogue/textile',
    emoji: '👕',
    subCols: [
      {
        title: 'Vêtements',
        items: [
          { label: 'T-shirts personnalisés', href: '/catalogue/textile' },
          { label: 'Polos brodés', href: '/catalogue/textile' },
          { label: 'Sweats & Hoodies', href: '/catalogue/textile' },
          { label: 'Vêtements de travail', href: '/catalogue/textile' },
        ],
      },
      {
        title: 'Accessoires',
        items: [
          { label: 'Casquettes & Bonnets', href: '/catalogue/textile' },
          { label: 'Tote bags coton', href: '/catalogue/sacs' },
          { label: 'Tabliers personnalisés', href: '/catalogue/textile' },
        ],
      },
    ],
    featured: { emoji: '👕', text: 'Textile pro', sub: 'Sérigraphie & DTG', href: '/catalogue/textile' },
  },
  {
    label: 'Goodies & Objets',
    href: '/catalogue/goodies',
    emoji: '🎁',
    subCols: [
      {
        title: 'Objets populaires',
        items: [
          { label: 'Stylos personnalisés', href: '/catalogue/goodies' },
          { label: 'Mugs & Tasses', href: '/catalogue/goodies' },
          { label: 'Clés USB', href: '/catalogue/goodies' },
          { label: 'Lanyards & Badges', href: '/catalogue/goodies' },
        ],
      },
      {
        title: 'Premium',
        items: [
          { label: 'Gourdes & Bouteilles', href: '/catalogue/goodies' },
          { label: 'Carnets & Agendas', href: '/catalogue/goodies' },
          { label: 'Powerbanks', href: '/catalogue/goodies' },
        ],
      },
    ],
    featured: { emoji: '🎁', text: 'Goodies Express', sub: 'Livraison 48h', href: '/catalogue/goodies' },
  },
  {
    label: 'Stickers & Étiquettes',
    href: '/catalogue/etiquettes',
    emoji: '🏷️',
    subCols: [
      {
        title: 'Stickers',
        items: [
          { label: 'Autocollants A4', href: '/catalogue/etiquettes' },
          { label: 'Stickers découpe spéciale', href: '/catalogue/etiquettes' },
          { label: 'Stickers sol & vitrine', href: '/catalogue/signaletique' },
        ],
      },
      {
        title: 'Étiquettes',
        items: [
          { label: 'Étiquettes en rouleau', href: '/catalogue/etiquettes' },
          { label: 'Étiquettes produits', href: '/catalogue/etiquettes' },
          { label: 'QR Code personnalisé', href: '/catalogue/etiquettes' },
        ],
      },
    ],
    featured: { emoji: '🏷️', text: 'Stickers pro', sub: 'Toutes formes', href: '/catalogue/etiquettes' },
  },
]

// ─── Component ─────────────────────────────────────────────────────────────────
export function Navbar() {
  const { itemCount, openCart } = useCart()
  const { user, isLoggedIn, logout } = useAuthContext()
  const pathname = usePathname()
  const router = useRouter()

  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMega, setActiveMega] = useState<number | null>(null)
  const [allProductsHover, setAllProductsHover] = useState(false)
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Search State ───────────────────────────────────────────────────────────
  const [navSearch, setNavSearch] = useState('')
  const [debouncedNavSearch, setDebouncedNavSearch] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [navSearchResults, setNavSearchResults] = useState<any[]>([])
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const [searchFocused, setSearchFocused] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedNavSearch(navSearch), 300)
    return () => clearTimeout(timer)
  }, [navSearch])

  // Fetch API on debounced term
  useEffect(() => {
    if (!debouncedNavSearch.trim()) {
      setNavSearchResults([])
      setSearchLoading(false)
      return
    }
    setSearchLoading(true)
    productsService.getAll({ search: debouncedNavSearch, limit: 5 })
      .then(res => setNavSearchResults(res.data || []))
      .catch(() => setNavSearchResults([]))
      .finally(() => setSearchLoading(false))
  }, [debouncedNavSearch])

  // Close desktop search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (navSearch.trim()) {
      router.push(`/catalogue?search=${encodeURIComponent(navSearch)}`)
      setSearchFocused(false)
      setSearchOpen(false)
    }
  }


  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchOpen(false)
    setActiveMega(null)
  }, [pathname])

  useEffect(() => {
    if (mobileMenuOpen || searchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen, searchOpen])

  const handleCatEnter = (idx: number) => {
    if (megaTimer.current) clearTimeout(megaTimer.current)
    setActiveMega(idx)
    setAllProductsHover(false)
  }
  const handleCatLeave = () => {
    megaTimer.current = setTimeout(() => setActiveMega(null), 150)
  }
  const handleMegaEnter = () => {
    if (megaTimer.current) clearTimeout(megaTimer.current)
  }
  const handleMegaLeave = () => {
    megaTimer.current = setTimeout(() => setActiveMega(null), 150)
  }

  const activeCat = activeMega !== null ? NAV_DATA[activeMega] : null

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          TOP HEADER — Logo + Search + Account + Cart
      ══════════════════════════════════════════════════════ */}
      <header className="bg-[#1D1D1F]/95 backdrop-blur-xl sticky top-0 z-50 border-b border-white/[0.08]">
        {/* Row 1: Logo / Search / Icons */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center h-14 gap-2 md:gap-5">

          {/* Logo */}
          <Link href="/" className="font-display text-xl md:text-2xl font-semibold text-white tracking-tight shrink-0 mr-1 md:mr-3">
            Yopoe<span className="text-emerald-400">Print</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl relative" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Rechercher un produit…"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full bg-white/[0.08] border border-white/[0.12] rounded-full py-2 pl-4 pr-12 text-sm text-white placeholder:text-[#86868B] outline-none focus:border-white/30 focus:bg-white/[0.12] transition-all"
              />
              <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 transition-colors">
                {searchLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              </button>
            </form>

            {/* Dropdown de recherche intelligent */}
            {searchFocused && navSearch.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[60]">
                {searchLoading ? (
                  <div className="p-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Loader2 size={16} className="animate-spin text-primary" /> Recherche en cours...
                  </div>
                ) : navSearchResults.length > 0 ? (
                  <div className="py-2 max-h-96 overflow-y-auto scrollbar-none">
                    {navSearchResults.map((p) => (
                      <Link key={p.id || p._id} href={`/produit/${p.slug}`} onClick={() => { setSearchFocused(false); setNavSearch('') }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors group">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl shrink-0 group-hover:bg-primary/10 transition-colors">
                          {p.emoji || '📦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">{p.name}</p>
                          <p className="text-xs text-gray-500 truncate">{p.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-gray-400 block">À partir de</span>
                          <span className="text-sm font-bold text-gray-900">{new Intl.NumberFormat('fr-FR').format(p.basePrice)} F</span>
                        </div>
                      </Link>
                    ))}
                    <button onClick={handleSearchSubmit}
                      className="w-full block text-center text-xs font-bold text-primary hover:bg-gray-50 py-3 border-t border-gray-100 mt-2 transition-colors">
                      Voir tous les résultats
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Aucun résultat pour "{navSearch}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop: Account + Cart */}
          <div className="hidden md:flex items-center gap-4 ml-auto shrink-0 text-gray-300">
            {isLoggedIn ? (
              <>
                <Link href="/mon-compte" className="flex flex-col items-center gap-0.5 hover:text-white transition-colors">
                  <User size={18} />
                  <span className="text-[10px] font-semibold">{user?.firstName}</span>
                </Link>
                <button onClick={logout} className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-white transition-colors">
                  <LogOut size={18} />
                  <span className="text-[10px] font-semibold">Quitter</span>
                </button>
              </>
            ) : (
              <Link href="/connexion" className="flex flex-col items-center gap-0.5 hover:text-white transition-colors">
                <User size={18} />
                <span className="text-[10px] font-semibold">Connexion</span>
              </Link>
            )}
            <button onClick={openCart} className="relative flex flex-col items-center gap-0.5 hover:text-white transition-colors">
              <div className="relative">
                <ShoppingCart size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold">Panier</span>
            </button>
          </div>

          {/* Mobile: right icons */}
          <div className="flex md:hidden items-center gap-0.5 ml-auto">
            <button onClick={() => setSearchOpen(true)} className="w-11 h-11 flex items-center justify-center text-gray-300 hover:text-white active:bg-white/10 rounded-xl transition-colors" aria-label="Rechercher">
              <Search size={21} />
            </button>
            <button onClick={openCart} className="relative w-11 h-11 flex items-center justify-center text-gray-300 hover:text-white active:bg-white/10 rounded-xl transition-colors">
              <ShoppingCart size={21} />
              {itemCount > 0 && (
                <span className="absolute top-1.5 right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
            <button onClick={() => setMobileMenuOpen(true)} className="w-11 h-11 flex items-center justify-center text-gray-300 hover:text-white active:bg-white/10 rounded-xl transition-colors" aria-label="Menu">
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            ROW 2: CATEGORY NAV BAR (Desktop) + scroll (Mobile)
            Desktop → hover triggers mega menu
            Mobile  → simple scroll (no mega)
        ══════════════════════════════════════════════════════ */}
        <nav className="border-t border-white/[0.08] bg-[#161617]/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-stretch">

            {/* ── "Tous les produits" with mega on hover ── */}
            <div
              className="relative hidden md:flex shrink-0"
              onMouseEnter={() => { setAllProductsHover(true); setActiveMega(null) }}
              onMouseLeave={() => setAllProductsHover(false)}
            >
              <Link
                href="/catalogue"
                className="flex items-center gap-2 py-2.5 px-3.5 text-[12.5px] font-semibold text-white bg-white/[0.08] hover:bg-emerald-600 transition-all border-r border-white/10 shrink-0"
              >
                <LayoutGrid size={15} />
                <span>Tous les produits</span>
              </Link>

              {/* All-products mega: shows Apple bento grid of categories */}
              {allProductsHover && (
                <div
                  className="absolute left-0 top-full z-50 w-[680px] bg-[#1D1D1F]/98 backdrop-blur-2xl border border-white/[0.1] rounded-[28px] shadow-[0_30px_70px_rgba(0,0,0,0.55)] p-5 overflow-hidden text-white transition-all animate-in fade-in slide-in-from-top-1 duration-200"
                  onMouseEnter={() => setAllProductsHover(true)}
                  onMouseLeave={() => setAllProductsHover(false)}
                >
                  <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-white/[0.08]">
                    <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                      Catalogue Général YopoePrint
                    </span>
                    <Link
                      href="/catalogue"
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                    >
                      Voir tout le catalogue (200+ références) <ArrowRight size={13} />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {NAV_DATA.map((cat) => (
                      <Link
                        key={cat.href}
                        href={cat.href}
                        className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.04] hover:border-white/[0.12] transition-all group"
                      >
                        <span className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-xl group-hover:scale-105 transition-transform shrink-0">
                          {cat.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="text-[13px] font-semibold text-white/95 group-hover:text-emerald-400 transition-colors block truncate">
                            {cat.label}
                          </span>
                          <span className="text-[11px] text-[#86868B] block truncate font-normal">
                            {cat.featured.sub}
                          </span>
                        </div>
                        <ChevronRight size={14} className="text-[#86868B] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    ))}
                  </div>

                  <div className="mt-3.5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#86868B]">
                    <Link href="/entreprises" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Espace Entreprises (Factures DGI)
                    </Link>
                    <Link href="/devis" className="hover:text-white transition-colors font-medium">
                      Devis personnalisé express →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ── Category tabs with hover mega menus ── */}
            <div
              className="flex items-stretch overflow-x-auto scrollbar-none flex-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {NAV_DATA.map((cat, idx) => {
                const isActive = pathname.includes(cat.href.split('/catalogue/')[1] || '___')
                return (
                  <div
                    key={cat.href}
                    className="relative shrink-0 hidden md:flex"
                    onMouseEnter={() => handleCatEnter(idx)}
                    onMouseLeave={handleCatLeave}
                  >
                    <Link
                      href={cat.href}
                      className={`flex items-center gap-1.5 py-2.5 px-3 text-[12.5px] font-medium whitespace-nowrap transition-all border-b-2
                        ${isActive
                          ? 'text-emerald-400 border-emerald-400 font-semibold'
                          : 'text-white/70 hover:text-white border-transparent hover:border-white/30'}`}
                    >
                      {cat.label}
                    </Link>
                  </div>
                )
              })}

              {/* Mobile: all categories scrollable */}
              <div className="flex md:hidden items-stretch overflow-x-auto">
                <Link href="/catalogue" className="shrink-0 flex items-center gap-1.5 py-2 px-2.5 text-[12px] font-bold text-emerald-400 whitespace-nowrap border-r border-white/10">
                  Tous
                </Link>
                {NAV_DATA.map((cat) => {
                  const isActive = pathname.includes(cat.href.split('/catalogue/')[1] || '___')
                  return (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className={`shrink-0 flex items-center py-2 px-2.5 text-[12px] font-medium whitespace-nowrap transition-colors border-b-2
                        ${isActive ? 'text-emerald-400 border-emerald-400' : 'text-gray-400 hover:text-gray-200 border-transparent'}`}
                    >
                      {cat.label}
                    </Link>
                  )
                })}
              </div>

              {/* Entreprises B2B Link */}
              <Link
                href="/entreprises"
                className="shrink-0 hidden lg:flex items-center ml-auto py-2.5 px-3.5 text-[12px] font-bold text-amber-400 hover:text-white border-l border-white/10 whitespace-nowrap transition-colors gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Espace Entreprises
              </Link>

              {/* Devis CTA */}
              <Link href="/devis" className="shrink-0 hidden md:flex items-center lg:ml-0 ml-auto py-2.5 px-3.5 text-[12px] font-bold text-emerald-400 hover:text-white border-l border-white/10 whitespace-nowrap transition-colors">
                Devis gratuit →
              </Link>
            </div>
          </div>

          {/* ══ MEGA MENU DROPDOWN APPLE LIQUID GLASS (Desktop only) ══ */}
          {activeCat && (
            <>
              {/* Fond estompé Apple */}
              <div
                className="fixed inset-0 top-[110px] bg-black/40 backdrop-blur-xs z-40 pointer-events-none transition-opacity duration-200"
              />

              <div
                className="hidden md:block absolute left-0 right-0 z-50 bg-[#1D1D1F]/98 backdrop-blur-2xl border-t border-b border-white/[0.08] shadow-[0_30px_70px_rgba(0,0,0,0.55)] text-white transition-all animate-in fade-in slide-in-from-top-1 duration-200"
                onMouseEnter={handleMegaEnter}
                onMouseLeave={handleMegaLeave}
              >
                <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-8">

                  {/* Left: Category Card Bento */}
                  <div className="col-span-3 border-r border-white/[0.08] pr-8 flex flex-col justify-between">
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-3xl shadow-xs mb-4">
                        {activeCat.emoji}
                      </div>
                      <h3 className="font-display font-semibold text-white text-xl leading-tight">
                        {activeCat.label}
                      </h3>
                      <p className="text-xs text-[#86868B] mt-1.5 font-normal leading-relaxed">
                        Confection industrielle certifiée 300 DPI avec contrôle PAO offert avant mise sous presse.
                      </p>
                    </div>

                    <div className="space-y-2 mt-6">
                      <Link
                        href={activeCat.href}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-3 rounded-full transition-all w-full justify-center shadow-xs active:scale-95"
                      >
                        Voir tout dans {activeCat.label} <ArrowRight size={14} />
                      </Link>
                      <Link
                        href="/devis"
                        className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-white font-medium transition-colors justify-center w-full pt-1"
                      >
                        Demander un chiffrage sur mesure →
                      </Link>
                    </div>
                  </div>

                  {/* Center: Sub-columns */}
                  <div className="col-span-6 grid grid-cols-2 gap-8 py-1">
                    {activeCat.subCols.map((col) => (
                      <div key={col.title}>
                        <h4 className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-3.5">
                          {col.title}
                        </h4>
                        <ul className="space-y-1">
                          {col.items.map((item) => (
                            <li key={item.label}>
                              <Link
                                href={item.href}
                                className="flex items-center justify-between px-3 py-2 rounded-xl text-[13.5px] text-white/85 hover:text-white hover:bg-white/[0.06] transition-all group font-medium"
                              >
                                <span>{item.label}</span>
                                <ChevronRight size={13} className="text-[#86868B] group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Right: Featured card Bento Apple */}
                  <div className="col-span-3">
                    <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] rounded-[24px] p-6 flex flex-col items-center text-center h-full justify-between backdrop-blur-md relative overflow-hidden group">
                      <div className="w-full flex flex-col items-center">
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3 self-center">
                          Offre Vedette
                        </span>
                        <span className="text-5xl mb-3 transform group-hover:scale-105 transition-transform duration-300">
                          {activeCat.featured.emoji}
                        </span>
                        <h4 className="font-semibold text-white text-base mb-1 tracking-tight">
                          {activeCat.featured.text}
                        </h4>
                        <p className="text-[#86868B] text-xs font-normal">{activeCat.featured.sub}</p>
                      </div>

                      <div className="w-full space-y-2 mt-4">
                        <Link
                          href={activeCat.featured.href}
                          className="w-full py-2.5 bg-white text-[#1D1D1F] hover:bg-[#F5F5F7] font-semibold text-xs rounded-full transition-all text-center block shadow-xs active:scale-95"
                        >
                          Configurer le produit →
                        </Link>
                        <Link
                          href="/devis"
                          className="text-[11px] text-[#86868B] hover:text-white transition-colors block text-center"
                        >
                          Ou demander un devis gratuit
                        </Link>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}
        </nav>
      </header>

      {/* ══════════════════════════════════════════════════════
          MOBILE: SEARCH FULLSCREEN OVERLAY
      ══════════════════════════════════════════════════════ */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-gray-900/98 md:hidden flex flex-col">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Flyers, Cartes, Bâches..."
                autoFocus
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 outline-none focus:border-primary"
              />
              {searchLoading && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
            </div>
            <button type="button" onClick={() => setSearchOpen(false)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 text-gray-300">
              <X size={20} />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto">
            {navSearch.trim().length > 0 ? (
              <div className="p-4">
                {navSearchResults.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Résultats</p>
                    {navSearchResults.map((p) => (
                      <Link key={p.id || p._id} href={`/produit/${p.slug}`} onClick={() => { setSearchOpen(false); setNavSearch('') }}
                        className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 active:bg-white/10 transition-colors">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-xl shrink-0">
                          {p.emoji || '📦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{p.name}</p>
                          <p className="text-[11px] text-gray-400 truncate">{p.category}</p>
                        </div>
                        <span className="text-sm font-bold text-primary shrink-0">{new Intl.NumberFormat('fr-FR').format(p.basePrice)} F</span>
                      </Link>
                    ))}
                    <button onClick={handleSearchSubmit} className="w-full mt-4 py-3 bg-primary text-white font-bold rounded-xl text-sm">
                      Voir tous les résultats
                    </button>
                  </div>
                ) : !searchLoading ? (
                  <div className="text-center py-10">
                    <p className="text-3xl mb-2">🔍</p>
                    <p className="text-white font-bold">Aucun produit trouvé</p>
                    <p className="text-gray-400 text-sm mt-1">Essayez d'autres mots-clés</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <div className="px-4 pt-5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Populaires</p>
                  <div className="flex flex-wrap gap-2">
                    {['Flyers', 'Cartes de visite', 'Bâche', 'Roll-up', 'T-shirt', 'Kakémono'].map((q) => (
                      <button key={q} onClick={() => setNavSearch(q)} className="px-4 py-2 bg-white/10 text-gray-300 text-sm rounded-full font-medium active:bg-white/20 transition-colors border border-white/10">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-4 pt-6 pb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Catégories</p>
                  <div className="grid grid-cols-2 gap-2">
                    {NAV_DATA.map((cat) => (
                      <Link key={cat.href} href={cat.href} onClick={() => setSearchOpen(false)}
                        className="flex items-center px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:border-primary/50 transition-colors"
                      >
                        <span className="text-sm font-medium truncate">{cat.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MOBILE: SLIDE-IN DRAWER MENU
      ══════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/60 md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 z-[70] w-[85vw] max-w-sm bg-[#1D1D1F]/98 backdrop-blur-2xl border-l border-white/[0.08] md:hidden flex flex-col shadow-2xl">

            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <span className="font-display text-lg font-bold text-white">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-gray-300">
                <X size={20} />
              </button>
            </div>

            <div className="px-5 py-4 border-b border-white/10">
              {isLoggedIn ? (
                <div className="flex items-center justify-between">
                  <Link href="/mon-compte" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{user?.firstName}</p>
                      <p className="text-gray-400 text-xs">Mon compte</p>
                    </div>
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false) }} className="text-gray-400 hover:text-white">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link href="/connexion" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 py-1">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <User size={20} className="text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">Se connecter</p>
                    <p className="text-gray-400 text-xs">Accéder à mon compte</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-500" />
                </Link>
              )}
            </div>

            <nav className="flex-1 overflow-y-auto py-3">
              <p className="px-5 text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Produits</p>
              {NAV_DATA.map((cat) => (
                <Link key={cat.href} href={cat.href} onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-5 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-medium flex-1">{cat.label}</span>
                  <ChevronRight size={14} className="text-gray-600" />
                </Link>
              ))}

              <div className="h-px bg-white/10 my-3 mx-5" />
              <p className="px-5 text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Services</p>
              {[
                { label: '🏢 Espace Entreprises & B2B', href: '/entreprises' },
                { label: 'Demander un devis', href: '/devis' },
                { label: 'Suivre ma commande', href: '/suivi' },
                { label: 'Aide & FAQ', href: '/faq' },
                { label: 'Nous contacter', href: '/contact' },
              ].map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-5 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-5 border-t border-white/10">
              <Link href="/devis" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-full text-sm active:scale-95 transition-all shadow-xs"
              >
                Devis gratuit →
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}
