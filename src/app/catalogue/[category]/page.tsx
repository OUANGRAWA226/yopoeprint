'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, SlidersHorizontal, X, Search, Clock, Banknote } from 'lucide-react'
import { productsService } from '@/lib/products.service'
import { ProductCard } from '@/components/product/ProductCard'

const CATEGORIES: Record<string, { label: string; emoji: string; desc: string }> = {
  flyers: { label: 'Flyers & Dépliants', emoji: '📄', desc: 'Flyers A4, A5, A6 recto/verso pour vos événements' },
  'cartes-de-visite': { label: 'Cartes de visite', emoji: '🪪', desc: 'Cartes standard, premium, pelliculage mat/brillant' },
  cartes: { label: 'Cartes de visite', emoji: '🪪', desc: 'Cartes standard, premium, pelliculage mat/brillant' },
  affiches: { label: 'Affiches & Posters', emoji: '🗓️', desc: 'Affiches A3, A2, A1 en papier couché haute qualité' },
  brochures: { label: 'Brochures', emoji: '📚', desc: 'Brochures 2 et 3 volets, dos collé, agrafées' },
  'roll-up': { label: 'Roll-up & Kakémonos', emoji: '🪧', desc: 'Kakémonos 85×200cm avec structure incluse' },
  goodies: { label: 'Goodies personnalisés', emoji: '🎁', desc: 'Mugs, stylos, tote bags personnalisés' },
  textile: { label: 'Textile imprimé', emoji: '👕', desc: 'T-shirts, casquettes avec impression DTG' },
  evenementiel: { label: 'Événementiel', emoji: '🎊', desc: 'Invitations, programmes, badges nominatifs' },
  signaletique: { label: 'Signalétique & Bâches', emoji: '🪧', desc: 'Bâches PVC 510g grand format, panneaux et enseignes' },
  baches: { label: 'Signalétique & Bâches', emoji: '🪧', desc: 'Bâches PVC 510g grand format, panneaux et enseignes' },
  etiquettes: { label: 'Étiquettes & Stickers', emoji: '🏷️', desc: 'Stickers vinyle, étiquettes en rouleau et packaging' },
  corporate: { label: 'Papeterie Corporate', emoji: '💼', desc: 'En-têtes de lettre, chemises à rabats, blocs-notes' },
}

const SORT_OPTIONS = [
  { value: 'popular', label: 'Popularité' },
  { value: 'price_asc', label: 'Prix ↑' },
  { value: 'price_desc', label: 'Prix ↓' },
  { value: 'newest', label: 'Nouveautés' },
]

const BUDGET_OPTIONS = [
  { label: 'Moins de 10 000 F', value: 'under_10k' },
  { label: '10 000 F - 50 000 F', value: '10k_50k' },
  { label: 'Plus de 50 000 F', value: 'over_50k' },
]

const DELAI_OPTIONS = [
  { label: 'Express 24h', value: '24h' },
  { label: 'Standard 48-72h', value: '48h' },
]

export default function CategoryPage() {
  const params = useParams()
  const rawCategory = (params.category as string) || ''
  const category = rawCategory === 'cartes' ? 'cartes-de-visite' : rawCategory === 'baches' ? 'signaletique' : rawCategory

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('popular')
  const [filters, setFilters] = useState<{ budget?: string; delai?: string }>({})
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  const catInfo = CATEGORIES[category] || CATEGORIES[rawCategory] || { label: category, emoji: '📦', desc: '' }

  useEffect(() => {
    setLoading(true)
    setLoadError(false)
    productsService.getAll({ category, search: search || undefined, page, limit: 100 })
      .then((res) => { setProducts(res.data || []); setTotal(res.total || 0) })
      .catch(() => { setProducts([]); setLoadError(true) })
      .finally(() => setLoading(false))
  }, [category, search, page, reloadKey])

  // Filtrage côté client pour le Budget et le Délai (mock)
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Tri basique
    if (sort === 'price_asc') filtered.sort((a, b) => a.basePrice - b.basePrice)
    if (sort === 'price_desc') filtered.sort((a, b) => b.basePrice - a.basePrice)

    // Filtre Budget
    if (filters.budget === 'under_10k') {
      filtered = filtered.filter(p => p.basePrice < 10000)
    } else if (filters.budget === '10k_50k') {
      filtered = filtered.filter(p => p.basePrice >= 10000 && p.basePrice <= 50000)
    } else if (filters.budget === 'over_50k') {
      filtered = filtered.filter(p => p.basePrice > 50000)
    }

    // Filtre Délai (Simulé : on associe pseudo-aléatoirement l'express à certains ID ou badges)
    if (filters.delai === '24h') {
      filtered = filtered.filter(p => 
        p.badge?.toLowerCase().includes('express') || 
        p.name.toLowerCase().includes('express') || 
        ((p.id || p._id || '').charCodeAt(0) % 2 === 0) // mock logique pour en laisser
      )
    } else if (filters.delai === '48h') {
      filtered = filtered.filter(p => 
        !p.badge?.toLowerCase().includes('express') &&
        !p.name.toLowerCase().includes('express') &&
        ((p.id || p._id || '').charCodeAt(0) % 2 !== 0) // mock logique inverse
      )
    }

    return filtered
  }, [products, sort, filters])

  const clearFilter = (key: string) => {
    setFilters((prev) => { const next = { ...prev }; delete next[key as keyof typeof next]; return next })
  }

  const getFilterLabel = (key: string, val: string) => {
    if (key === 'budget') return BUDGET_OPTIONS.find(o => o.value === val)?.label || val
    if (key === 'delai') return DELAI_OPTIONS.find(o => o.value === val)?.label || val
    return val
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header catégorie ── */}
      <div className="bg-white pt-4 pb-4 md:pt-7 md:pb-7 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3 md:mb-5">
            <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
            <ChevronRight size={12} />
            <Link href="/catalogue" className="hover:text-primary transition-colors">Catalogue</Link>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-medium truncate">{catInfo.label}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl md:text-3xl border border-gray-200 shrink-0">
              {catInfo.emoji}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-xl md:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">{catInfo.label}</h1>
              <p className="text-gray-600 text-xs md:text-sm mt-0.5 truncate md:whitespace-normal">{catInfo.desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Barre recherche + tri + filtres ── */}
      <div className="bg-white border-b border-gray-100 sticky top-[56px] md:top-14 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-2 md:gap-3">

          <div className="relative flex-1 min-w-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder={`Rechercher dans ${catInfo.label.toLowerCase()}...`}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200
                         rounded-xl outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="hidden md:block px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl
                       outline-none focus:border-primary cursor-pointer text-gray-700 shrink-0"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl text-sm font-medium shrink-0
                        border transition-all ${showFilters || Object.keys(filters).length > 0
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'}`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filtres</span>
            {Object.keys(filters).length > 0 && (
              <span className="bg-primary text-white text-2xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {Object.keys(filters).length}
              </span>
            )}
          </button>
        </div>

        {/* Panneau des filtres avancés */}
        {showFilters && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 md:px-6 py-4 md:py-6 shadow-inner animate-in slide-in-from-top-2">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              
              {/* Filtre Délai */}
              <div>
                <p className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">
                  <Clock size={14} className="text-primary" /> Délai de livraison
                </p>
                <div className="flex gap-2 flex-wrap">
                  {DELAI_OPTIONS.map((opt) => (
                    <button key={opt.value}
                      onClick={() => setFilters((f) => ({ ...f, delai: f.delai === opt.value ? undefined : opt.value }))}
                      className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all min-h-[36px]
                        ${filters.delai === opt.value
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Filtre Budget */}
              <div>
                <p className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">
                  <Banknote size={14} className="text-primary" /> Budget
                </p>
                <div className="flex gap-2 flex-wrap">
                  {BUDGET_OPTIONS.map((opt) => (
                    <button key={opt.value}
                      onClick={() => setFilters((f) => ({ ...f, budget: f.budget === opt.value ? undefined : opt.value }))}
                      className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all min-h-[36px]
                        ${filters.budget === opt.value
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>

            </div>

            {Object.keys(filters).length > 0 && (
              <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-gray-200 flex gap-2 items-center flex-wrap">
                <span className="text-xs font-semibold text-gray-500">Filtres actifs :</span>
                {Object.entries(filters).map(([key, val]) => (
                  <span key={key} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                    {getFilterLabel(key, val)}
                    <button onClick={() => clearFilter(key)} className="text-gray-400 hover:text-red-500 transition-colors ml-1"><X size={12} /></button>
                  </span>
                ))}
                <button onClick={() => setFilters({})} className="text-xs text-red-500 hover:text-red-700 font-bold ml-2 underline underline-offset-2">
                  Réinitialiser
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Grille produits ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gray-100 animate-pulse" style={{ aspectRatio: '4/3' }} />
                <div className="p-3 md:p-4 space-y-2">
                  <div className="h-3.5 bg-gray-100 animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2 hidden md:block" />
                  <div className="h-6 bg-gray-100 animate-pulse rounded w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>

        ) : loadError ? (
          <div role="alert" className="text-center py-16 md:py-24 bg-white rounded-2xl border border-gray-100 shadow-sm px-6">
            <h3 className="font-display text-lg md:text-xl font-bold text-gray-900 mb-2">Le catalogue ne répond pas pour le moment</h3>
            <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
              Vérifiez votre connexion puis réessayez. Vous pouvez aussi nous décrire votre projet.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={() => setReloadKey((k) => k + 1)} className="btn-primary">Réessayer</button>
              <Link href="/devis" className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-800 hover:border-gray-400">
                Demander un devis
              </Link>
            </div>
          </div>

        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 md:py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-4xl md:text-5xl mb-4">📭</div>
            <h3 className="font-display text-lg md:text-xl font-bold text-gray-900 mb-2">Aucun produit ne correspond</h3>
            <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
              Nous n'avons trouvé aucun produit correspondant à vos filtres actuels ou à votre recherche.
            </p>
            <button onClick={() => { setSearch(''); setFilters({}) }} className="btn-primary mx-auto">
              Effacer tous les filtres
            </button>
          </div>

        ) : (
          <>
            <div className="mb-4">
              <span className="text-xs md:text-sm text-gray-500 font-semibold bg-gray-100 px-3 py-1.5 rounded-lg">
                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id ?? product.id} product={product} />
              ))}
            </div>

            {/* Pagination basique (inutile en mode filtre client si on affiche tout, mais conservé pour l'UI) */}
            {filteredProducts.length >= 100 && (
              <div className="flex justify-center gap-2 mt-8 md:mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-all min-h-[48px]"
                >← Préc.</button>
                <span className="px-4 py-3 text-sm text-gray-400 font-medium flex items-center">
                  Page {page}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-all min-h-[48px]"
                >Suiv. →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Autres catégories ── */}
      <div className="bg-white border-t border-gray-100 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h3 className="font-display text-base md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
            Explorer d'autres catégories
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-4">
            {Object.entries(CATEGORIES)
              .filter(([slug]) => slug !== category)
              .slice(0, 6)
              .map(([slug, info]) => (
                <Link
                  key={slug}
                  href={`/catalogue/${slug}`}
                  className="flex flex-col items-center gap-2 p-3 md:p-4 bg-gray-50 border
                             border-gray-100 rounded-xl text-xs md:text-sm font-medium text-gray-700
                             hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-center active:scale-95"
                >
                  <span className="text-2xl">{info.emoji}</span>
                  <span className="line-clamp-2 leading-tight">{info.label}</span>
                </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
