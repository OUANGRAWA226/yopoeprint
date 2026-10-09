'use client'

import { useState, useMemo } from 'react'
import { usePopularProducts } from '@/hooks/useProducts'
import Link from 'next/link'
import {
  ArrowRight, ShieldCheck, Clock,
  Star, Truck, Building2, CheckCircle2, FileCheck,
  Calculator, Award, Sparkles, Layers,
  Check, ShoppingCart, Search, Zap,
  Copy, CheckCheck,
  Palette, Flame, ArrowUpRight
} from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { PRODUCTS } from '@/lib/data'

// ── 1. Configurations de prix en direct pour le Calculateur Express ─────────
interface CalcOption {
  id: string
  name: string
  shortName: string
  slug: string
  category: string
  leadTime: string
  quantities: number[]
  finishes: { id: string; label: string; desc: string; extra: number }[]
  pricing: Record<number, number>
  image: string
  popularQty: number
}

const CALC_PRODUCTS: Record<string, CalcOption> = {
  cartes: {
    id: 'cartes',
    name: 'Cartes de Visite',
    shortName: 'Cartes 350g',
    slug: 'carte-de-visite-standard',
    category: 'cartes',
    leadTime: '24h à 48h',
    popularQty: 500,
    quantities: [100, 250, 500, 1000, 2500],
    finishes: [
      { id: 'standard', label: 'Couché Mat 350g', desc: 'Rendu sobre & soigné', extra: 0 },
      { id: 'brillant', label: 'Pelliculage Brillant', desc: 'Couleurs vives & éclatantes', extra: 1500 },
      { id: 'soft_touch', label: 'Soft Touch (Toucher Velours)', desc: 'Toucher soyeux de prestige', extra: 2500 },
      { id: 'vernis_3d', label: 'Vernis Sélectif 3D', desc: 'Relief tactile haute précision', extra: 4000 },
    ],
    pricing: {
      100: 4500,
      250: 6200,
      500: 9800,
      1000: 16500,
      2500: 35000,
    },
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
  },
  flyers: {
    id: 'flyers',
    name: 'Flyers A5 Événementiel',
    shortName: 'Flyers A5',
    slug: 'flyer-a5-classique',
    category: 'flyers',
    leadTime: '48h',
    popularQty: 1000,
    quantities: [250, 500, 1000, 2500, 5000],
    finishes: [
      { id: 'standard', label: 'Couché 135g Satiné', desc: 'Léger & percutant', extra: 0 },
      { id: 'brillant', label: '170g Couché Brillant', desc: 'Tenue renforcée premium', extra: 2000 },
      { id: 'mat_250', label: '250g Semi-rigide Mat', desc: 'Support cartonné d’exception', extra: 4500 },
    ],
    pricing: {
      250: 9500,
      500: 13500,
      1000: 18500,
      2500: 39000,
      5000: 68000,
    },
    image: 'https://images.unsplash.com/photo-1572945753563-80495678363d?auto=format&fit=crop&w=400&q=80',
  },
  rollup: {
    id: 'rollup',
    name: 'Roll-up Pro 85×200cm',
    shortName: 'Roll-up 85×200',
    slug: 'kakemono-roll-up',
    category: 'roll-up',
    leadTime: '24h chrono',
    popularQty: 2,
    quantities: [1, 2, 5, 10],
    finishes: [
      { id: 'standard', label: 'Bâche PVC 440g + Alu', desc: 'Housse de transport rembourrée', extra: 0 },
      { id: 'ferrari', label: 'Toile Anti-reflet HD', desc: 'Rendu optique zéro reflet', extra: 5000 },
    ],
    pricing: {
      1: 28000,
      2: 52000,
      5: 120000,
      10: 220000,
    },
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=400&q=80',
  },
  tshirts: {
    id: 'tshirts',
    name: 'T-shirts 190g Marqués',
    shortName: 'T-shirts 190g',
    slug: 't-shirt-personnalise',
    category: 'textile',
    leadTime: '48h à 72h',
    popularQty: 50,
    quantities: [10, 25, 50, 100, 250],
    finishes: [
      { id: 'standard', label: 'Sérigraphie 1 couleur', desc: 'Encre haute résistance', extra: 0 },
      { id: 'quadri', label: 'Sérigraphie Quadri complète', desc: 'Toutes teintes du logo', extra: 15000 },
      { id: 'broderie', label: 'Broderie Cœur Relief', desc: 'Finition cousue indélébile', extra: 25000 },
    ],
    pricing: {
      10: 45000,
      25: 95000,
      50: 175000,
      100: 320000,
      250: 725000,
    },
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
  },
  brochures: {
    id: 'brochures',
    name: 'Brochures & Dépliants 3V',
    shortName: 'Dépliants 3V',
    slug: 'brochure-3-volets',
    category: 'brochures',
    leadTime: '48h à 72h',
    popularQty: 500,
    quantities: [100, 250, 500, 1000],
    finishes: [
      { id: 'standard', label: 'Satiné 135g plié 3 volets', desc: 'Rendu équilibré', extra: 0 },
      { id: 'mat', label: 'Pelliculage Mat 170g', desc: 'Finition de présentation', extra: 4000 },
      { id: 'brillant', label: 'Pelliculage Brillant 170g', desc: 'Effet glacé magazine', extra: 4000 },
    ],
    pricing: {
      100: 18500,
      250: 29000,
      500: 48000,
      1000: 82000,
    },
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
  },
  bache: {
    id: 'bache',
    name: 'Bâche PVC Indéchirable',
    shortName: 'Bâche PVC',
    slug: 'affiche-a3-premium',
    category: 'signaletique',
    leadTime: '24h chrono',
    popularQty: 2,
    quantities: [1, 2, 5, 10],
    finishes: [
      { id: 'standard', label: 'Bâche 510g + Œillets 50cm', desc: 'Façade et clôture', extra: 0 },
      { id: 'ourlet', label: 'Ourlets renforcés anti-vent', desc: 'Résistance maximale', extra: 3000 },
    ],
    pricing: {
      1: 16000,
      2: 30000,
      5: 70000,
      10: 130000,
    },
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80',
  },
}

// ── 2. Les 8 Univers / Bento Cards d'Achat E-Commerce ───────────────────────
const ECOMMERCE_CATEGORIES = [
  {
    title: 'Cartes de Visite',
    desc: '350g, Soft Touch, dorure à chaud & vernis 3D',
    price: 'Dès 4 500 FCFA',
    badge: 'Best-Seller',
    href: '/catalogue/cartes',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    specs: 'Livrable en 24/48h · BAT offert',
  },
  {
    title: 'Flyers & Dépliants',
    desc: 'Quadri haute fidélité, formats A6, A5, A4, 3 volets',
    price: 'Dès 8 500 FCFA',
    badge: 'Express 48h',
    href: '/catalogue/flyers',
    img: 'https://images.unsplash.com/photo-1572945753563-80495678363d?auto=format&fit=crop&w=600&q=80',
    specs: 'Dès 250 exemplaires',
  },
  {
    title: 'Roll-up & Kakémonos',
    desc: 'Structure aluminium ultra-légère avec housse',
    price: 'Dès 28 000 FCFA',
    badge: 'Salons & Foires',
    href: '/catalogue/roll-up',
    img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80',
    specs: '85×200cm & 100×200cm',
  },
  {
    title: 'Textile d’Entreprise',
    desc: 'Polos piqué 220g brodés, t-shirts sérigraphie 190g',
    price: 'Dès 3 500 FCFA',
    badge: 'Tenues Pro',
    href: '/catalogue/textile',
    img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    specs: 'Toutes tailles XS à 4XL',
  },
  {
    title: 'Goodies & Objets de Marque',
    desc: 'Stylos métalliques gravés laser, carnets cuir, clés USB',
    price: 'Dès 450 FCFA/u',
    badge: 'Cadeaux VIP',
    href: '/catalogue/goodies',
    img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    specs: 'Gravure laser & marquage UV',
  },
  {
    title: 'Brochures & Catalogues',
    desc: 'Rapports annuels, bilans d’activité, dos carré collé',
    price: 'Dès 18 500 FCFA',
    badge: 'Institutionnel',
    href: '/catalogue/brochures',
    img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    specs: 'De 8 à 64 pages',
  },
  {
    title: 'Bâches & Enseignes',
    desc: 'Bâche PVC 510g indéchirable avec œillets inoxydables',
    price: 'Dès 16 000 FCFA',
    badge: 'Grand Format',
    href: '/catalogue/signaletique',
    img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
    specs: 'Sur mesure jusqu’à 50m',
  },
  {
    title: 'Affiches & Posters HD',
    desc: 'Formats A3, A2, A1 jusqu’au grand format urbain A0',
    price: 'Dès 1 500 FCFA',
    badge: 'Campagnes',
    href: '/catalogue/affiches',
    img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    specs: 'Papier couché brillant 200g',
  },
]

// ── 3. Guide des Matériaux & Finitions (Apple Touch) ─────────────────────────
const FINISHES_GUIDE = [
  {
    name: 'Couché Mat 350g',
    badge: 'Standard Industriel',
    desc: 'Pureté sans reflet, rigidité exemplaire. L’élégance sobre conçue pour les échanges d’affaires exigeants.',
    ideal: 'Cartes collaborateurs, fiches de vente',
    gradient: 'from-[#2C2C2E] to-[#1C1C1E]',
  },
  {
    name: 'Soft Touch (Toucher Velours)',
    badge: 'Toucher Peau de Pêche',
    desc: 'Pelliculage thermique à la douceur tactile incomparable. Une sensation physique immédiate dès la remise en main.',
    ideal: 'Dirigeants, signatures de prestige, VIP',
    gradient: 'from-[#3A2A4D] to-[#1F172B]',
  },
  {
    name: 'Vernis Sélectif 3D',
    badge: 'Relief Optique',
    desc: 'Dépôt micrométrique de vernis polymère brillant. Fait émerger vos monogrammes et logotypes au bout des doigts.',
    ideal: 'Marques de luxe, identités visuelles fortes',
    gradient: 'from-[#4A3B18] to-[#251D0B]',
  },
  {
    name: 'Couché Brillant 200g',
    badge: 'Éclat Chromatique',
    desc: 'Surfaçage optique haute saturation. Sublime les visuels publicitaires, la photographie et la profondeur des noirs.',
    ideal: 'Flyers commerciaux, affiches, cartes postales',
    gradient: 'from-[#1A2E44] to-[#0E1A29]',
  },
]

// ── 4. Avis Clients Vérifiés ────────────────────────────────────────────────
const REVIEWS = [
  {
    id: 1,
    name: 'Salimata Kaboré',
    role: 'Directrice Marketing, Agence Com Sahel',
    city: 'Ouagadougou',
    rating: 5,
    date: 'Il y a 3 jours',
    product: '1 000 Dépliants 3 volets + 2 Roll-ups',
    text: 'Commande passée en ligne avec nos fichiers vectoriels. Le studio PAO nous a renvoyé l’épreuve BAT certifiée en moins d’une heure. Livraison reçue le jeudi à notre agence. Fidélité colorimétrique absolue.',
    verified: true,
  },
  {
    id: 2,
    name: 'Ibrahim Sawadogo',
    role: 'Gérant, Faso BTP & Architecture',
    city: 'Bobo-Dioulasso',
    rating: 5,
    date: 'Il y a 1 semaine',
    product: '500 Cartes de visite Soft Touch',
    text: 'Le toucher velours fait immédiatement sensation auprès de nos partenaires. La facture normalisée avec IFU et TVA a été expédiée instantanément pour la comptabilité.',
    verified: true,
  },
  {
    id: 3,
    name: 'Fatimata Diallo',
    role: 'Coordinatrice Événementielle ONG',
    city: 'Ouagadougou',
    rating: 5,
    date: 'Il y a 2 semaines',
    product: '50 T-shirts sérigraphiés + 100 Badges',
    text: 'Paiement instantané via Orange Money. Délais d’atelier scrupuleusement tenus pour notre colloque régional. Une expérience fluide et sans aucune friction.',
    verified: true,
  },
]

export default function Home() {
  const { products: popularProducts, loading: isLoading } = usePopularProducts(12)
  
  // State pour le Calculateur Express Hero
  const [selectedProdKey, setSelectedProdKey] = useState<string>('cartes')
  const activeProduct = CALC_PRODUCTS[selectedProdKey] || CALC_PRODUCTS.cartes
  const [selectedQty, setSelectedQty] = useState<number>(activeProduct.popularQty)
  const [selectedFinishId, setSelectedFinishId] = useState<string>(activeProduct.finishes[0].id)

  // Code promo copié feedback
  const [copiedPromo, setCopiedPromo] = useState(false)
  const handleCopyPromo = () => {
    navigator.clipboard.writeText('YOPPRINT15')
    setCopiedPromo(true)
    setTimeout(() => setCopiedPromo(false), 2000)
  }

  // Recalculer la quantité par défaut si le produit change
  const handleProductChange = (key: string) => {
    setSelectedProdKey(key)
    const prod = CALC_PRODUCTS[key]
    if (prod) {
      setSelectedQty(prod.popularQty || prod.quantities[1])
      setSelectedFinishId(prod.finishes[0].id)
    }
  }

  // Calcul du prix en temps réel
  const calculatedPrice = useMemo(() => {
    const base = activeProduct.pricing[selectedQty] || activeProduct.pricing[activeProduct.quantities[0]] || 5000
    const finish = activeProduct.finishes.find(f => f.id === selectedFinishId)
    const extra = finish ? finish.extra : 0
    const total = base + extra
    const unitPrice = Math.round(total / selectedQty)
    return { total, unitPrice }
  }, [activeProduct, selectedQty, selectedFinishId])

  // Filtre catégorie pour la grille bestsellers
  const [bestsellerFilter, setBestsellerFilter] = useState<'all' | 'cartes' | 'flyers' | 'grand_format' | 'textile'>('all')

  // Source unifiée de produits (API ou fallback local de haute qualité)
  const allAvailableProducts = useMemo(() => {
    if (popularProducts && popularProducts.length > 0) {
      return popularProducts
    }
    return PRODUCTS
  }, [popularProducts])

  // Filtrage réactif par onglet
  const filteredBestsellers = useMemo(() => {
    if (bestsellerFilter === 'all') {
      return allAvailableProducts.slice(0, 8)
    }
    const filtered = allAvailableProducts.filter((p: any) => {
      const cat = (p.category || '').toLowerCase()
      const slug = (p.slug || '').toLowerCase()
      const name = (p.name || '').toLowerCase()
      if (bestsellerFilter === 'cartes') return cat.includes('carte') || slug.includes('carte') || name.includes('carte')
      if (bestsellerFilter === 'flyers') return cat.includes('flyer') || cat.includes('brochure') || slug.includes('flyer') || slug.includes('brochure')
      if (bestsellerFilter === 'grand_format') return cat.includes('roll') || cat.includes('signal') || cat.includes('affiche') || slug.includes('roll') || slug.includes('bache') || slug.includes('affiche')
      if (bestsellerFilter === 'textile') return cat.includes('textile') || slug.includes('t-shirt') || slug.includes('polo') || slug.includes('tote') || cat.includes('goodies')
      return true
    })
    return filtered.length > 0 ? filtered.slice(0, 8) : allAvailableProducts.slice(0, 8)
  }, [allAvailableProducts, bestsellerFilter])

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] selection:bg-[#1D1D1F] selection:text-white antialiased">

      {/* ═══════════════════════════════════════════════════════════
          0. APPLE-STYLE TOP PROMO BANNER (FROSTED OBSIDIAN)
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-[#1D1D1F] text-white text-xs py-2.5 px-4 border-b border-white/[0.08] sticky top-0 z-40 backdrop-blur-xl bg-opacity-95">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Offre Spéciale : -15% sur votre première commande
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[#86868B]">
              <Truck size={13} className="text-white/80" />
              Livraison offerte dès <strong>75 000 FCFA</strong> à Ouaga & Bobo
            </span>
            <span className="hidden lg:inline-flex items-center gap-1.5 text-[#86868B]">
              <Clock size={13} className="text-white/80" />
              Délais express 24h & 48h
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-medium">
            <button
              onClick={handleCopyPromo}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white px-2.5 py-1 rounded-full font-mono border border-white/10 transition-all cursor-pointer active:scale-95"
              title="Copier le code promo"
            >
              {copiedPromo ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>Code : <strong className="text-white">YOPPRINT15</strong></span>
              {copiedPromo && <span className="text-emerald-400 text-[10px]">Copié</span>}
            </button>

            <Link
              href="/entreprises"
              className="text-[#86868B] hover:text-white transition-colors flex items-center gap-1"
            >
              Espace Entreprises (Facturation DGI) →
            </Link>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          1. HERO APPLE KEYNOTE : TYPOGRAPHIE SCULPTÉE & BENTO CALCULATOR
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden border-b border-black/[0.05]">
        {/* Lueur d'ambiance ultra douce type Apple Studio */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-radial from-emerald-500/[0.07] via-blue-500/[0.03] to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* ─── Colonne Gauche : Clarté, Typographie & Recherche Spotlight ─── */}
            <div className="lg:col-span-6 space-y-6">

              {/* Pill badge épuré */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-xs font-semibold text-[#1D1D1F]">
                <span className="flex text-amber-500 text-xs">
                  {'★★★★★'.split('').map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </span>
                <span className="text-[#86868B]">|</span>
                <span>4.9/5 · 1 240+ entreprises au Faso</span>
              </div>

              {/* Titre Apple monumental */}
              <div className="space-y-2">
                <h1 className="font-display font-semibold text-[#1D1D1F] text-4xl sm:text-5xl lg:text-[54px] leading-[1.08] tracking-[-0.03em]">
                  Imprimez en grand.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900">
                    Précision industrielle.
                  </span>
                </h1>
                <p className="text-[#86868B] text-base sm:text-lg leading-relaxed max-w-xl font-normal pt-2">
                  Cartes de prestige, dépliants événementiels, roll-up et textiles d’entreprise. Tarifs en direct, <strong>Bon À Tirer certifié en 300 DPI</strong> et livraison 48h sur tout le Burkina.
                </p>
              </div>

              {/* Barre de Recherche type macOS Spotlight */}
              <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl border border-black/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row gap-2 transition-all focus-within:shadow-[0_12px_32px_rgba(0,0,0,0.09)] focus-within:border-black/20">
                <div className="relative flex-1 flex items-center">
                  <Search size={18} className="absolute left-3.5 text-[#86868B] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Rechercher un support (ex: Cartes Soft Touch, Flyers A5, Roll-up...)"
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-sm text-[#1D1D1F] placeholder:text-[#86868B] outline-none font-medium"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        window.location.href = `/catalogue?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`
                      }
                    }}
                  />
                </div>
                <Link
                  href="/catalogue"
                  className="px-6 py-3 bg-[#1D1D1F] hover:bg-[#2C2C2E] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] shrink-0 shadow-sm"
                >
                  <ShoppingCart size={15} />
                  Commander <ArrowRight size={14} />
                </Link>
              </div>

              {/* Quick Tags sous Spotlight */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#86868B]">
                <span className="font-semibold text-[#86868B]">Suggestions :</span>
                {[
                  { label: 'Cartes 350g', href: '/catalogue/cartes' },
                  { label: 'Flyers A5', href: '/catalogue/flyers' },
                  { label: 'Roll-up Alu', href: '/catalogue/roll-up' },
                  { label: 'Polos Brodés', href: '/catalogue/textile' },
                  { label: 'Bâche PVC', href: '/catalogue/signaletique' },
                ].map((tag) => (
                  <Link
                    key={tag.label}
                    href={tag.href}
                    className="px-3 py-1 rounded-full bg-white/80 hover:bg-white border border-black/[0.06] text-[#1D1D1F] font-medium transition-all hover:shadow-xs active:scale-95"
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>

              {/* Mini-spécifications Apple Keynote */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-black/[0.06] text-xs font-semibold text-[#1D1D1F]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                    <Clock size={14} />
                  </div>
                  <span>Prêt en 24h / 48h</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-700 flex items-center justify-center shrink-0">
                    <ShieldCheck size={14} />
                  </div>
                  <span>BAT 300 DPI Offert</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-700 flex items-center justify-center shrink-0">
                    <FileCheck size={14} />
                  </div>
                  <span>Factures DGI (TVA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
                    <Award size={14} />
                  </div>
                  <span>Réimpression garantie</span>
                </div>
              </div>

            </div>

            {/* ─── Colonne Droite : Le Widget Calculateur Façon Matériel Apple ─── */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-[32px] border border-black/[0.07] shadow-[0_24px_70px_-20px_rgba(0,0,0,0.08)] overflow-hidden relative transition-all">

                {/* Header du Widget type macOS Titlebar */}
                <div className="px-6 py-4.5 bg-gradient-to-b from-[#FAFAFC] to-[#F5F5F7] border-b border-black/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center shadow-xs text-[#1D1D1F]">
                      <Calculator size={16} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1D1D1F] text-sm leading-tight">
                        Calculateur Direct Atelier
                      </h3>
                      <p className="text-[11px] text-[#86868B]">
                        Tarifs nets instantanés · Contrôle pré-presse inclus
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Direct Presses
                  </span>
                </div>

                {/* Formulaire interactif Cupertino */}
                <div className="p-6 sm:p-7 space-y-5">
                  
                  {/* Segmented Control 1 : Produit */}
                  <div>
                    <label className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider block mb-2">
                      1. Support d’impression :
                    </label>
                    <div className="bg-[#F5F5F7] p-1 rounded-2xl grid grid-cols-3 sm:grid-cols-6 gap-1 border border-black/[0.04]">
                      {Object.entries(CALC_PRODUCTS).map(([key, prod]) => {
                        const isSelected = selectedProdKey === key
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleProductChange(key)}
                            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-white text-[#1D1D1F] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                                : 'text-[#86868B] hover:text-[#1D1D1F]'
                            }`}
                          >
                            <span className="text-[11px] block truncate">{prod.shortName}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Segmented Control 2 : Tirage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                        2. Quantité (Tirage) :
                      </label>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Remise volume incluse
                      </span>
                    </div>

                    <div className="bg-[#F5F5F7] p-1 rounded-2xl grid grid-cols-4 sm:grid-cols-5 gap-1 border border-black/[0.04]">
                      {activeProduct.quantities.map((q) => {
                        const isSelected = selectedQty === q
                        const isPopular = q === activeProduct.popularQty
                        return (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setSelectedQty(q)}
                            className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                              isSelected
                                ? 'bg-[#1D1D1F] text-white shadow-xs'
                                : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-white/50'
                            }`}
                          >
                            {new Intl.NumberFormat('fr-FR').format(q)} {q > 10 ? 'ex.' : 'pcs'}
                            {isPopular && !isSelected && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Options 3 : Finitions & Papiers */}
                  <div>
                    <label className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider block mb-2">
                      3. Papier & Finition de protection :
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeProduct.finishes.map((f) => {
                        const isSelected = selectedFinishId === f.id
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setSelectedFinishId(f.id)}
                            className={`p-3 rounded-2xl border text-left text-xs transition-all flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? 'border-[#1D1D1F] bg-white text-[#1D1D1F] ring-1 ring-[#1D1D1F] shadow-xs'
                                : 'border-black/[0.08] bg-[#FAFAFC] text-[#86868B] hover:bg-white hover:text-[#1D1D1F]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 w-full">
                              <span className="font-semibold truncate pr-1 text-[#1D1D1F]">{f.label}</span>
                              {f.extra > 0 ? (
                                <span className="text-[10px] text-emerald-800 shrink-0 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                  +{new Intl.NumberFormat('fr-FR').format(f.extra)} F
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#86868B] shrink-0 font-medium">Inclus</span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#86868B] font-normal line-clamp-1 mt-0.5">{f.desc}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* ── Box Résumé Tarifaire Apple Bento ── */}
                  <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                          Total Net TTC :
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                          BAT 300 DPI Offert
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-display font-semibold text-3xl sm:text-4xl text-[#1D1D1F] tracking-tight tabular-nums">
                          {new Intl.NumberFormat('fr-FR').format(calculatedPrice.total)}
                        </span>
                        <span className="text-xs font-bold text-[#86868B]">FCFA</span>
                      </div>

                      <p className="text-[11px] text-[#86868B] mt-0.5 font-medium">
                        Soit <strong className="text-[#1D1D1F]">{calculatedPrice.unitPrice} FCFA</strong> / pièce · Délais : <strong>{activeProduct.leadTime}</strong>
                      </p>
                    </div>

                    <Link
                      href={`/produit/${activeProduct.slug}`}
                      className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-full transition-all text-center flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(4,120,87,0.3)] active:scale-[0.98] shrink-0 cursor-pointer"
                    >
                      <ShoppingCart size={16} />
                      Commander & Téléverser →
                    </Link>
                  </div>

                </div>

                {/* Footer du widget type barreau inférieur */}
                <div className="px-6 py-3 bg-[#FAFAFC] border-t border-black/[0.05] flex items-center justify-between text-[11px] text-[#86868B]">
                  <span>Maquette déjà prête ?</span>
                  <Link href="/devis" className="font-semibold text-emerald-700 hover:text-emerald-900 transition-colors">
                    Vérification pré-presse express →
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. TRUST BAR BENTO : LES 5 ENGAGEMENTS CUPERTINO
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-8 bg-white border-b border-black/[0.05]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            
            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex items-center gap-3 transition-all hover:bg-white hover:shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-white border border-black/[0.06] text-emerald-700 flex items-center justify-center shadow-2xs shrink-0">
                <Truck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#1D1D1F]">Livraison 24/48h</h4>
                <p className="text-[11px] text-[#86868B]">Ouaga, Bobo et provinces</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex items-center gap-3 transition-all hover:bg-white hover:shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-white border border-black/[0.06] text-blue-700 flex items-center justify-center shadow-2xs shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#1D1D1F]">BAT Numérique 300 DPI</h4>
                <p className="text-[11px] text-[#86868B]">Contrôle pré-presse offert</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex items-center gap-3 transition-all hover:bg-white hover:shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-white border border-black/[0.06] text-orange-600 flex items-center justify-center shadow-2xs shrink-0">
                <Zap size={18} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#1D1D1F]">Orange & Moov Money</h4>
                <p className="text-[11px] text-[#86868B]">Paiements sans friction</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex items-center gap-3 transition-all hover:bg-white hover:shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-white border border-black/[0.06] text-purple-700 flex items-center justify-center shadow-2xs shrink-0">
                <FileCheck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#1D1D1F]">Factures DGI (TVA)</h4>
                <p className="text-[11px] text-[#86868B]">IFU officiel certifié</p>
              </div>
            </div>

            <div className="col-span-2 md:col-span-1 p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex items-center gap-3 transition-all hover:bg-white hover:shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-white border border-black/[0.06] text-amber-600 flex items-center justify-center shadow-2xs shrink-0">
                <Award size={18} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#1D1D1F]">Satisfait ou Réimprimé</h4>
                <p className="text-[11px] text-[#86868B]">Sérénité d’atelier</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. LES 8 UNIVERS VISUELS BENTO D'IMPRESSION
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold text-[#86868B] uppercase tracking-widest block mb-1">
                Gamme Complète
              </span>
              <h2 className="font-display font-semibold text-2xl sm:text-4xl text-[#1D1D1F] tracking-tight">
                Acheter par univers d’impression
              </h2>
              <p className="text-sm text-[#86868B] mt-1 font-normal">
                Chaque support est usiné avec les meilleurs standards de colorimétrie et de découpe.
              </p>
            </div>

            <Link
              href="/catalogue"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
            >
              Consulter les 200+ références →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {ECOMMERCE_CATEGORIES.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group bg-white rounded-[28px] border border-black/[0.06] overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo Haute Définition avec coin arrondi intérieur */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F5F5F7]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cat.img}
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <span className="absolute top-3 left-3 text-[#1D1D1F] text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.05] shadow-xs">
                      {cat.badge}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-[#1D1D1F] text-base group-hover:text-emerald-700 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-[#86868B] line-clamp-1 mt-1 font-normal">
                      {cat.desc}
                    </p>
                    <p className="text-[10px] text-[#86868B] font-medium mt-1.5">
                      {cat.specs}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-black/[0.04]">
                  <span className="font-semibold text-xs sm:text-sm text-[#1D1D1F]">
                    {cat.price}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-[#F5F5F7] text-[#1D1D1F] group-hover:bg-[#1D1D1F] group-hover:text-white flex items-center justify-center transition-all">
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. GUIDE DES MATÉRIAUX & FINITIONS (APPLE MATERIALS)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white border-y border-black/[0.05]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-widest">
              L'Art du Toucher
            </span>
            <h2 className="font-display font-semibold text-2xl sm:text-4xl text-[#1D1D1F] tracking-tight">
              Matériaux & finitions d’exception
            </h2>
            <p className="text-sm text-[#86868B]">
              Le papier n’est pas un simple support, c’est le premier contact physique entre votre marque et vos clients.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FINISHES_GUIDE.map((fg) => (
              <div
                key={fg.name}
                className="bg-[#F5F5F7] rounded-[28px] p-7 border border-black/[0.04] hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] hover:border-black/[0.08] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className={`h-2.5 w-14 rounded-full bg-gradient-to-r ${fg.gradient} mb-5 shadow-2xs`} />
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                    {fg.badge}
                  </span>
                  <h3 className="font-semibold text-[#1D1D1F] text-lg mb-2">
                    {fg.name}
                  </h3>
                  <p className="text-xs text-[#86868B] leading-relaxed mb-6 font-normal">
                    {fg.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/[0.05]">
                  <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider block">Usage idéal</span>
                  <span className="text-xs font-semibold text-[#1D1D1F] mt-0.5 block">{fg.ideal}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bandeau Coffret Échantillons Gratuit façon Apple Pack */}
          <div className="mt-10 p-7 sm:p-8 rounded-[28px] bg-[#F5F5F7] border border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-black/[0.07] text-[#1D1D1F] flex items-center justify-center shadow-xs shrink-0">
                <Palette size={22} />
              </div>
              <div>
                <h4 className="font-semibold text-[#1D1D1F] text-base">Vous souhaitez toucher les papiers avant de choisir ?</h4>
                <p className="text-xs text-[#86868B] mt-0.5 font-normal">Nous vous expédions gratuitement notre nuancier d’échantillons imprimés dans votre boîte aux lettres.</p>
              </div>
            </div>

            <Link
              href="/contact?sujet=echantillons"
              className="px-6 py-3.5 bg-[#1D1D1F] hover:bg-[#2C2C2E] text-white font-semibold text-xs sm:text-sm rounded-full transition-all shrink-0 active:scale-95 shadow-xs"
            >
              Commander le coffret gratuit →
            </Link>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. BESTSELLERS AVEC SEGMENTED CONTROL FLOTTANT
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold text-[#86868B] uppercase tracking-widest block mb-1">
                Choix Populaires
              </span>
              <h2 className="font-display font-semibold text-2xl sm:text-4xl text-[#1D1D1F] tracking-tight">
                Les tirages les plus demandés
              </h2>
            </div>

            {/* Segmented Control iOS pour filtrer */}
            <div className="bg-[#E8E8ED] p-1 rounded-full inline-flex border border-black/[0.04] self-start md:self-auto overflow-x-auto scrollbar-none">
              {[
                { id: 'all', label: 'Tout' },
                { id: 'cartes', label: 'Cartes' },
                { id: 'flyers', label: 'Flyers' },
                { id: 'grand_format', label: 'Roll-up & Bâches' },
                { id: 'textile', label: 'Textile' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setBestsellerFilter(tab.id as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    bestsellerFilter === tab.id
                      ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                      : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading && (!popularProducts || popularProducts.length === 0) ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[280px] bg-white rounded-[24px] border border-black/[0.05] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBestsellers.map((p: any) => (
                <ProductCard key={p._id ?? p.id} product={p} />
              ))}
            </div>
          )}

          {/* Bannière Deal Apple Minimalist Chic */}
          <div className="mt-12 p-8 sm:p-10 rounded-[32px] bg-[#1D1D1F] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="space-y-1 text-center md:text-left z-10">
              <span className="inline-block text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
                Offre de bienvenue
              </span>
              <h3 className="font-display font-semibold text-2xl sm:text-3xl text-white tracking-tight">
                15% de remise immédiate sur votre commande.
              </h3>
              <p className="text-xs sm:text-sm text-[#86868B]">
                Saisissez le code <strong className="text-white font-mono bg-white/10 px-2 py-0.5 rounded-full">YOPPRINT15</strong> à l'étape du panier.
              </p>
            </div>

            <Link
              href="/catalogue"
              className="px-7 py-3.5 bg-white text-[#1D1D1F] hover:bg-[#F5F5F7] font-semibold text-xs sm:text-sm rounded-full transition-all shadow-md active:scale-95 shrink-0 z-10"
            >
              En profiter maintenant →
            </Link>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. LE TUNNEL EN 4 ÉTAPES FLUIDES (APPLE STEP-BY-STEP)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white border-b border-black/[0.05]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-widest">
              Fluidité Totale
            </span>
            <h2 className="font-display font-semibold text-2xl sm:text-4xl text-[#1D1D1F] tracking-tight">
              Commander en 4 étapes simples
            </h2>
            <p className="text-sm text-[#86868B]">
              De la configuration numérique jusqu’à la réception de vos colis au bureau.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Configurez en ligne',
                desc: 'Sélectionnez format, papier et tirage. Votre devis en FCFA s’ajuste en direct avec dégressivité garantie.',
                icon: Calculator,
              },
              {
                step: '02',
                title: 'Déposez votre fichier',
                desc: 'Téléversez votre PDF ou confiez la mise en page à nos graphistes si vous ne disposez pas encore de visuel.',
                icon: Layers,
              },
              {
                step: '03',
                title: 'Validez votre BAT 300 DPI',
                desc: 'Notre studio contrôle les marges de découpe et le profil CMJN. Vous approuvez l’épreuve avant le lancement.',
                icon: CheckCircle2,
              },
              {
                step: '04',
                title: 'Livraison express 48h',
                desc: 'Réglez par Orange Money, Moov Money ou virement. Vos impressions arrivent soignées et conditionnées.',
                icon: Truck,
              },
            ].map((st) => {
              const Icon = st.icon
              return (
                <div
                  key={st.step}
                  className="bg-[#F5F5F7] rounded-[28px] p-7 border border-black/[0.04] transition-all hover:bg-white hover:shadow-xs hover:border-black/[0.07] group"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-black/[0.06] text-[#1D1D1F] flex items-center justify-center font-semibold shadow-2xs">
                      <Icon size={18} />
                    </div>
                    <span className="font-mono text-xl text-[#86868B]/40 group-hover:text-[#1D1D1F] transition-colors">
                      {st.step}
                    </span>
                  </div>

                  <h3 className="font-semibold text-[#1D1D1F] text-base mb-2">
                    {st.title}
                  </h3>

                  <p className="text-xs text-[#86868B] leading-relaxed font-normal">
                    {st.desc}
                  </p>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. SECTION PRO : ENTREPRISES & FACTURATION DGI (TITANIUM / SPACE BLACK)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-[#121214] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.07] text-white/90 border border-white/[0.1] text-xs font-semibold">
                <Building2 size={13} className="text-emerald-400" />
                YopoePrint Pro · Entreprises & Institutions
              </div>

              <h2 className="font-display font-semibold text-3xl sm:text-5xl text-white tracking-tight">
                Pour les organisations qui exigent l’irréprochable.
              </h2>

              <p className="text-[#86868B] text-sm sm:text-base leading-relaxed font-normal max-w-xl">
                Bénéficiez de remises volumes jusqu’à <strong>-35%</strong>, d’une <strong>facturation normalisée DGI</strong> avec TVA déductible, d’un interlocuteur dédié et d’expéditions groupées sur vos succursales.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Link
                  href="/entreprises"
                  className="px-7 py-3.5 bg-white text-[#121214] hover:bg-[#F5F5F7] font-semibold text-xs sm:text-sm rounded-full transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
                >
                  Découvrir les offres Pro <ArrowRight size={15} />
                </Link>
                <Link
                  href="/devis"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm rounded-full border border-white/15 transition-all"
                >
                  Demande de devis B2B
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3.5 text-xs">
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-md">
                <span className="font-semibold text-white block mb-1">Factures Normalisées</span>
                <p className="text-[#86868B] text-[11px] leading-relaxed">IFU & TVA certifiées conformes pour votre bilan comptable.</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-md">
                <span className="font-semibold text-white block mb-1">Tarifs Volumes</span>
                <p className="text-[#86868B] text-[11px] leading-relaxed">Jusqu’à -35% d’économies sur vos campagnes annuelles.</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-md">
                <span className="font-semibold text-white block mb-1">BAT Prioritaire 1h</span>
                <p className="text-[#86868B] text-[11px] leading-relaxed">Graphiste pré-presse dédié pour vos échéances urgentes.</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-md">
                <span className="font-semibold text-white block mb-1">Multi-Sites Faso</span>
                <p className="text-[#86868B] text-[11px] leading-relaxed">Livraisons dispatchées à Ouaga, Bobo et succursales.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. AVIS CLIENTS & RETOURS D'EXPÉRIENCE
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 border-t border-black/[0.05]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-semibold text-[#86868B] uppercase tracking-widest block mb-1">
                Témoignages Vérifiés
              </span>
              <h2 className="font-display font-semibold text-2xl sm:text-4xl text-[#1D1D1F] tracking-tight">
                La parole à ceux qui nous font confiance
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex text-amber-500">
                {'★★★★★'.split('').map((_, idx) => (
                  <span key={idx} className="text-sm">★</span>
                ))}
              </div>
              <span className="text-xs font-semibold text-[#1D1D1F]">4.9 / 5 sur 1 240+ avis</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-[28px] p-7 border border-black/[0.06] shadow-2xs flex flex-col justify-between hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex text-amber-400 text-sm">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <span className="text-[11px] text-[#86868B]">{rev.date}</span>
                  </div>

                  <p className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full mb-3.5 inline-block">
                    Achat : {rev.product}
                  </p>

                  <p className="text-xs sm:text-sm text-[#1D1D1F] leading-relaxed font-normal mb-6">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-black/[0.04] flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[#1D1D1F] text-xs sm:text-sm">{rev.name}</h4>
                    <p className="text-[11px] text-[#86868B]">{rev.role} · {rev.city}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F5F7] text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Vérifié
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. BANNIÈRE FINALE APPLE MINIMALISTE & PUISSANTE
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 md:py-24 border-t border-black/[0.05]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center space-y-6">
          <h2 className="font-display font-semibold text-3xl sm:text-5xl text-[#1D1D1F] tracking-tight">
            Donnez vie à vos projets d’impression.
          </h2>

          <p className="text-[#86868B] text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-normal">
            Plus de 5 000 professionnels et créateurs font confiance à nos ateliers. Expédition soignée dans les 45 provinces du Faso.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/catalogue"
              className="px-8 py-4 bg-[#1D1D1F] hover:bg-[#2C2C2E] text-white font-semibold text-sm rounded-full transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
            >
              Parcourir le catalogue complet <ArrowRight size={16} />
            </Link>

            <Link
              href="/devis"
              className="px-7 py-4 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] font-semibold text-sm rounded-full border border-black/[0.06] transition-all"
            >
              Demander un devis sur mesure
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#86868B] font-medium">
            <span>✓ Contrôle technique gratuit</span>
            <span>✓ Épreuve numérique certifiée</span>
            <span>✓ Orange Money & Moov Money</span>
            <span>✓ Expédition dans tout le Burkina</span>
          </div>
        </div>
      </section>

    </div>
  )
}
