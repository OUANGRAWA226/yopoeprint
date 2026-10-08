'use client'

import Link from 'next/link'
import { ArrowRight, Search, ChevronRight, LayoutGrid, SlidersHorizontal, Clock, Banknote, X } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from '@/components/product/ProductCard'

const ALL_CATEGORIES = [
  { slug: 'flyers',      label: 'Flyers & Dépliants',     emoji: '📄', count: 12 },
  { slug: 'cartes',      label: 'Cartes de visite',        emoji: '🪪', count: 8 },
  { slug: 'affiches',    label: 'Affiches & Posters',      emoji: '🗓️', count: 10 },
  { slug: 'brochures',   label: 'Brochures',               emoji: '📚', count: 6 },
  { slug: 'roll-up',     label: 'Roll-up & Kakémonos',     emoji: '🪧', count: 5 },
  { slug: 'goodies',     label: 'Goodies personnalisés',   emoji: '🎁', count: 15 },
  { slug: 'textile',     label: 'Textile imprimé',         emoji: '👕', count: 9 },
  { slug: 'evenementiel',label: 'Événementiel',            emoji: '🎊', count: 7 },
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

export default function CataloguePage() {
  const [search, setSearch] = useState('')
  // On charge beaucoup de produits pour permettre un vrai filtrage client
  const { products, loading } = useProducts({ search: search || undefined, limit: 100 })
  
  // -- Filtres State --
  const [filters, setFilters] = useState<{ budget?: string; delai?: string }>({})
  const [showFilters, setShowFilters] = useState(false)

  // Initialize search from URL if present (since Navbar redirects here with ?search=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('search')
    if (q) setSearch(q)
  }, [])

  // Update URL silently when search changes
  useEffect(() => {
    if (search) {
      window.history.replaceState(null, '', `?search=${encodeURIComponent(search)}`)
    } else {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [search])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Filtre Budget
    if (filters.budget === 'under_10k') {
      filtered = filtered.filter(p => p.basePrice < 10000)
    } else if (filters.budget === '10k_50k') {
      filtered = filtered.filter(p => p.basePrice >= 10000 && p.basePrice <= 50000)
    } else if (filters.budget === 'over_50k') {
      filtered = filtered.filter(p => p.basePrice > 50000)
    }

    // Filtre Délai (Simulé)
    if (filters.delai === '24h') {
      filtered = filtered.filter(p => 
        p.badge?.toLowerCase().includes('express') || 
        p.name.toLowerCase().includes('express') || 
        ((p.id || '').charCodeAt(0) % 2 === 0)
      )
    } else if (filters.delai === '48h') {
      filtered = filtered.filter(p => 
        !p.badge?.toLowerCase().includes('express') &&
        !p.name.toLowerCase().includes('express') &&
        ((p.id || '').charCodeAt(0) % 2 !== 0)
      )
    }

    return filtered
  }, [products, filters])

  const clearFilter = (key: string) => {
    setFilters((prev) => { const next = { ...prev }; delete next[key as keyof typeof next]; return next })
  }

  const getFilterLabel = (key: string, val: string) => {
    if (key === 'budget') return BUDGET_OPTIONS.find(o => o.value === val)?.label || val
    if (key === 'delai') return DELAI_OPTIONS.find(o => o.value === val)?.label || val
    return val
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">

      {/* ── Breadcrumb ─────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-medium">Catalogue</span>
        </div>
      </div>

      {/* ── Hero + Search ─────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 pt-6 pb-6 md:pt-10 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="font-display text-2xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Tous nos produits d'impression
          </h1>
          <p className="text-gray-500 text-sm md:text-base mb-6">
            Plus de 200 supports configurables — Livraison partout au Burkina Faso
          </p>

          {/* Search — style Helloprint: gros, plat */}
          <div className="max-w-2xl mx-auto relative flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ex : Flyers, Cartes de visite, Bâches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none
                           bg-[#F8F8F8] border border-gray-200 focus:border-primary focus:bg-white
                           transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold shrink-0
                          border transition-all ${showFilters || Object.keys(filters).length > 0
                            ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filtres</span>
              {Object.keys(filters).length > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
          </div>

          {/* Panneau de filtres global */}
          {showFilters && (
            <>
              {/* Overlay mobile */}
              <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in" 
                onClick={() => setShowFilters(false)} 
              />
              
              {/* Conteneur filtres : Bottom sheet sur mobile, inline sur desktop */}
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 md:static md:z-auto md:bg-white md:border md:border-gray-200 md:rounded-xl md:shadow-sm md:mt-4 md:p-5 md:animate-in md:slide-in-from-top-2 md:max-w-2xl md:mx-auto text-left max-h-[85vh] overflow-y-auto">
                
                {/* Handle mobile pour swipe down (visuel) */}
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden" />
                
                <div className="flex justify-between items-center mb-6 md:hidden">
                  <h3 className="font-display font-bold text-xl text-gray-900">Filtres</h3>
                  <button onClick={() => setShowFilters(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Filtre Délai */}
                  <div>
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">
                      <Clock size={14} className="text-primary" /> Délai de livraison
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {DELAI_OPTIONS.map((opt) => (
                        <button key={opt.value}
                          onClick={() => setFilters((f) => ({ ...f, delai: f.delai === opt.value ? undefined : opt.value }))}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                            ${filters.delai === opt.value
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'}`}
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
                          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                            ${filters.budget === opt.value
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'}`}
                        >{opt.label}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {Object.keys(filters).length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2 items-center flex-wrap">
                    <span className="text-sm font-semibold text-gray-500">Actifs :</span>
                    {Object.entries(filters).map(([key, val]) => (
                      <span key={key} className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg">
                        {getFilterLabel(key, val)}
                        <button onClick={() => clearFilter(key)} className="text-gray-400 hover:text-red-500 transition-colors ml-1"><X size={14} /></button>
                      </span>
                    ))}
                    <button onClick={() => setFilters({})} className="text-sm text-red-500 hover:text-red-700 font-bold ml-2 underline underline-offset-2">
                      Tout effacer
                    </button>
                  </div>
                )}
                
                {/* Bouton Voir les résultats (Mobile uniquement) */}
                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full mt-6 bg-gray-900 text-white font-bold py-4 rounded-xl md:hidden"
                >
                  Voir les {filteredProducts.length} produits
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">

        {/* ── Résultats de recherche ou d'exploration ────────────────── */}
        {(search || Object.keys(filters).length > 0) ? (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg md:text-xl font-bold text-gray-900">
                {search ? `Résultats pour « ${search} »` : 'Résultats filtrés'}
              </h2>
              <button onClick={() => { setSearch(''); setFilters({}) }} className="text-sm font-medium text-gray-500 hover:text-primary flex items-center gap-1">
                ✕ Réinitialiser
              </button>
            </div>

            {loading ? (
              <ProductGridSkeleton />
            ) : filteredProducts.length === 0 ? (
              <EmptyState search={search} onClear={() => { setSearch(''); setFilters({}) }} />
            ) : (
              <ProductGrid products={filteredProducts} />
            )}
          </>

        ) : (
          <>
            {/* ── Catégories — style Helloprint : grid compacte ── */}
            <section className="mb-8 md:mb-12">
              <div className="flex items-end justify-between mb-4 md:mb-5">
                <h2 className="font-display text-base md:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <LayoutGrid size={18} className="text-primary" />
                  Explorer par catégorie
                </h2>
              </div>

              {/* Desktop: grille 4 cols / Mobile: grille 2 cols */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:gap-3">
                {ALL_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/catalogue/${cat.slug}`}
                    className="group bg-white border border-gray-200 rounded-xl
                      flex items-center gap-3 px-4 py-3.5 md:py-4
                      hover:border-primary hover:bg-primary/5
                      active:scale-[0.98] transition-all"
                  >
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-[#F8F8F8] rounded-lg
                      flex items-center justify-center text-xl md:text-2xl shrink-0
                      group-hover:bg-primary/10 transition-colors">
                      {cat.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-xs md:text-sm leading-tight truncate group-hover:text-primary transition-colors">
                        {cat.label}
                      </p>
                      <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">{cat.count} produits</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-primary shrink-0 ml-auto transition-colors hidden md:block" />
                  </Link>
                ))}
              </div>
            </section>

            {/* ── Produits populaires ────────────────── */}
            <section>
              <div className="flex items-end justify-between mb-4 md:mb-5">
                <h2 className="font-display text-base md:text-xl font-bold text-gray-900">
                  Nos meilleures ventes
                </h2>
              </div>

              {loading ? <ProductGridSkeleton /> : <ProductGrid products={filteredProducts.slice(0, 8)} />}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ProductGrid({ products }: { products: any[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {products.map((p) => <ProductCard key={p._id ?? p.id} product={p} />)}
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200">
          <div className="bg-[#F0F0F0] animate-pulse" style={{ aspectRatio: '4/3' }} />
          <div className="p-3 md:p-4 space-y-2">
            <div className="h-3.5 bg-gray-100 animate-pulse rounded w-3/4" />
            <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2 hidden md:block" />
            <div className="h-6 bg-gray-100 animate-pulse rounded w-1/3 mt-3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ search, onClear }: { search: string; onClear: () => void }) {
  return (
    <div className="text-center py-16 md:py-24 bg-white rounded-2xl border border-gray-200">
      <p className="text-4xl md:text-5xl mb-4">🔍</p>
      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Aucun produit trouvé</h3>
      <p className="text-gray-400 text-sm mb-5">
        {search ? `Aucun résultat pour « ${search} »` : "Aucun produit ne correspond à vos filtres."}
      </p>
      <button
        onClick={onClear}
        className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
      >
        Réinitialiser la recherche
      </button>
    </div>
  )
}
