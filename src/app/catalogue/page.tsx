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
  { slug: 'cartes',       label: 'Cartes de visite',        icon: CreditCard, count: 8 },
  { slug: 'flyers',       label: 'Flyers & Dépliants',      icon: FileText,   count: 12 },
  { slug: 'roll-up',      label: 'Roll-up & Salons',        icon: Flag,       count: 5 },
  { slug: 'affiches',     label: 'Affiches & Bâches',       icon: ImageIcon,  count: 10 },
  { slug: 'brochures',    label: 'Brochures & Livrets',     icon: BookOpen,   count: 6 },
  { slug: 'textile',      label: 'Textile Pro & Vêtements', icon: Shirt,      count: 9 },
  { slug: 'goodies',      label: 'Goodies & Cadeaux VIP',   icon: Gift,       count: 15 },
  { slug: 'evenementiel', label: 'Signalétique & Foires',   icon: Sparkles,   count: 7 },
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
  const { products, loading } = useProducts({ search: search || undefined, limit: 100 })
  
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">

      {/* ── Breadcrumb Helloprint ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-emerald-700 transition-colors">Accueil</Link>
          <ChevronRight size={12} className="text-slate-400" />
          <span className="text-slate-900 font-bold">Catalogue Général</span>
        </div>
      </div>

      {/* ── En-tête Commercial du Catalogue ── */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="font-display text-2xl sm:text-4xl font-black text-slate-900 mb-2">
            Tous nos produits d'impression
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mb-6">
            Plus de 200 supports personnalisables avec contrôle PAO 300 DPI offert — Livraison à Ouagadougou, Bobo et provinces.
          </p>

          {/* Recherche & Filtres E-Commerce */}
          <div className="max-w-2xl mx-auto relative flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher cartes, flyers, roll-ups, bâches, t-shirts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-xs sm:text-sm outline-none bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>
            
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold shrink-0 border transition-all cursor-pointer ${
                showFilters || Object.keys(filters).length > 0
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <SlidersHorizontal size={15} />
              <span>Filtres</span>
              {Object.keys(filters).length > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
          </div>

          {/* Panneau de Filtres Pratique */}
          {showFilters && (
            <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-xl text-left max-w-2xl mx-auto animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
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
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
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
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {Object.keys(filters).length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-500">Filtres actifs :</span>
                    {Object.entries(filters).map(([k, v]) => (
                      <span key={k} className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-semibold text-slate-800">
                        {getFilterLabel(k, v)}
                        <button type="button" onClick={() => clearFilter(k)} className="text-slate-400 hover:text-red-500 ml-1">✕</button>
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
            <h2 className="font-display font-black text-lg text-slate-900 mb-4 flex items-center gap-2">
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
                    className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-emerald-600 hover:shadow-xs transition-all flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors shrink-0">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                        {cat.label}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{cat.count} modèles</p>
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
            <h2 className="font-display font-black text-lg text-slate-900">
              {search ? `Résultats pour « ${search} »` : Object.keys(filters).length > 0 ? 'Produits filtrés' : 'Nos supports d’impression'}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {filteredProducts.length} références disponibles
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 animate-pulse">
                  <div className="aspect-[4/3] bg-slate-100 rounded-lg" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-6 bg-slate-100 rounded w-1/3 pt-2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
              <p className="font-bold text-base text-slate-800 mb-1">Aucun produit ne correspond à votre recherche</p>
              <p className="text-xs text-slate-500 mb-4">Essayez d'autres mots-clés ou réinitialisez les filtres.</p>
              <button
                type="button"
                onClick={() => { setSearch(''); setFilters({}) }}
                className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Réinitialiser la recherche
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map((p) => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          )}
        </section>

      </div>

    </div>
  )
}
