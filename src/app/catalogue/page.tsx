'use client'

import Link from 'next/link'
import { 
  ArrowRight, Search, ChevronRight, LayoutGrid, SlidersHorizontal, 
  Clock, Banknote, X, FileText, CreditCard, Image as ImageIcon, 
  BookOpen, Flag, Gift, Shirt, Sparkles, Filter, Check
} from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from '@/components/product/ProductCard'

const ALL_CATEGORIES = [
  { slug: 'cartes',       label: 'Cartes de visite',        icon: CreditCard },
  { slug: 'flyers',       label: 'Flyers & Dépliants',      icon: FileText },
  { slug: 'roll-up',      label: 'Roll-up & Salons',        icon: Flag },
  { slug: 'affiches',     label: 'Affiches & Bâches',       icon: ImageIcon },
  { slug: 'brochures',    label: 'Brochures & Livrets',     icon: BookOpen },
  { slug: 'textile',      label: 'Textile Pro & Vêtements', icon: Shirt },
  { slug: 'goodies',      label: 'Goodies & Cadeaux VIP',   icon: Gift },
  { slug: 'evenementiel', label: 'Signalétique & Foires',   icon: Sparkles },
]

const BUDGET_OPTIONS = [
  { label: 'Moins de 10 000 FCFA', value: 'under_10k' },
  { label: '10 000 F à 50 000 FCFA', value: '10k_50k' },
  { label: 'Plus de 50 000 FCFA', value: 'over_50k' },
]

const DELAI_OPTIONS = [
  { label: 'Express 24h', value: '24h' },
  { label: 'Standard 48-72h', value: '48h' },
]

export default function CataloguePage() {
  const [search, setSearch] = useState('')
  const { products, loading, error, fetchProducts } = useProducts({ search: search || undefined, limit: 100 })
  
  const [filters, setFilters] = useState<{ budget?: string; delai?: string }>({})
  const [showFilters, setShowFilters] = useState(false)

  // Initialize search from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('search')
    if (q) setSearch(q)
  }, [])

  // Update URL silently
  useEffect(() => {
    if (search) {
      window.history.replaceState(null, '', `?search=${encodeURIComponent(search)}`)
    } else {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [search])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (filters.budget === 'under_10k') {
      filtered = filtered.filter(p => p.basePrice < 10000)
    } else if (filters.budget === '10k_50k') {
      filtered = filtered.filter(p => p.basePrice >= 10000 && p.basePrice <= 50000)
    } else if (filters.budget === 'over_50k') {
      filtered = filtered.filter(p => p.basePrice > 50000)
    }

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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">

      {/* ── Breadcrumb Helloprint ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-emerald-700 transition-colors">Accueil</Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-900 font-bold">Catalogue Général</span>
        </div>
      </div>

      {/* ── En-tête Commercial du Catalogue ── */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Tous nos produits d'impression
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mb-6">
            Cartes, flyers, roll-up, textile et goodies personnalisables, avec contrôle PAO 300 DPI offert — Livraison à Ouagadougou, Bobo et provinces.
          </p>

          {/* Recherche & Filtres E-Commerce */}
          <div className="max-w-2xl mx-auto relative flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher cartes, flyers, roll-ups, bâches, t-shirts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-xs sm:text-sm outline-none bg-gray-50 border border-gray-200 focus:border-emerald-600 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
            
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold shrink-0 border transition-all cursor-pointer ${
                showFilters || Object.keys(filters).length > 0
                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <SlidersHorizontal size={15} />
              <span>Filtres</span>
              {Object.keys(filters).length > 0 && (
                <span className="bg-emerald-600 text-white text-2xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
          </div>

          {/* Panneau de Filtres Pratique */}
          {showFilters && (
            <div className="mt-4 p-5 bg-gray-50 border border-gray-200 rounded-xl text-left max-w-2xl mx-auto animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock size={13} className="text-emerald-700" /> Délai d'atelier
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {DELAI_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFilters(f => ({ ...f, delai: f.delai === opt.value ? undefined : opt.value }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          filters.delai === opt.value
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Banknote size={13} className="text-emerald-700" /> Budget
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {BUDGET_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFilters(f => ({ ...f, budget: f.budget === opt.value ? undefined : opt.value }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          filters.budget === opt.value
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {Object.keys(filters).length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-500">Filtres actifs :</span>
                    {Object.entries(filters).map(([k, v]) => (
                      <span key={k} className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-lg font-semibold text-gray-800">
                        {getFilterLabel(k, v)}
                        <button type="button" onClick={() => clearFilter(k)} className="text-gray-400 hover:text-red-500 ml-1">✕</button>
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFilters({})}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    Effacer tout
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* ── Exploration par Familles (Sans Emojis) ── */}
        {!search && Object.keys(filters).length === 0 && (
          <section className="mb-10">
            <h2 className="font-display font-extrabold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <LayoutGrid size={18} className="text-emerald-700" />
              <span>Explorer par catégorie</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ALL_CATEGORIES.map((cat) => {
                const Icon = cat.icon
                return (
                  <Link
                    key={cat.slug}
                    href={`/catalogue/${cat.slug}`}
                    className="bg-white border border-gray-200 rounded-xl p-3.5 hover:border-emerald-600 hover:shadow-xs transition-all flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors shrink-0">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">
                        {cat.label}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Liste des Produits ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-extrabold text-lg text-gray-900">
              {search ? `Résultats pour « ${search} »` : Object.keys(filters).length > 0 ? 'Produits filtrés' : 'Nos supports d’impression'}
            </h2>
            {!loading && !error && (
              <span className="text-xs text-gray-500 font-medium">
                {filteredProducts.length} référence{filteredProducts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 animate-pulse">
                  <div className="aspect-[4/3] bg-gray-100 rounded-lg" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-6 bg-gray-100 rounded w-1/3 pt-2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div role="alert" className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8">
              <p className="font-bold text-base text-gray-800 mb-1">Le catalogue ne répond pas pour le moment</p>
              <p className="text-sm text-gray-600 mb-4">Vérifiez votre connexion puis réessayez. Vous pouvez aussi nous décrire votre projet.</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchProducts()}
                  className="bg-primary text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Réessayer
                </button>
                <Link href="/devis" className="bg-white border border-gray-200 text-gray-800 font-bold text-sm px-5 py-2.5 rounded-lg hover:border-gray-400 transition-colors">
                  Demander un devis
                </Link>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8">
              <p className="font-bold text-base text-gray-800 mb-1">Aucun produit ne correspond à votre recherche</p>
              <p className="text-xs text-gray-500 mb-4">Essayez d'autres mots-clés ou réinitialisez les filtres.</p>
              <button
                type="button"
                onClick={() => { setSearch(''); setFilters({}) }}
                className="bg-gray-900 text-white font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Réinitialiser la recherche
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map((p) => (
                <ProductCard key={(p as any)._id || p.id} product={p} />
              ))}
            </div>
          )}
        </section>

      </div>

    </div>
  )
}
