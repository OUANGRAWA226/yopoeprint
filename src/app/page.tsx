'use client'

import { useState, useRef, useMemo } from 'react'
import { usePopularProducts } from '@/hooks/useProducts'
import Link from 'next/link'
import {
  ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Clock,
  Star, Truck, Building2, CheckCircle2, FileCheck, Users,
  Calculator, Award, Sparkles, Layers, Printer, Briefcase,
  Phone, Check, ShoppingCart, Search, Zap, HelpCircle,
  ThumbsUp, Tag, HeartHandshake, Eye, Copy, CheckCheck,
  Package, Palette, Flame, ArrowUpRight, BadgePercent
} from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { PRODUCTS } from '@/lib/data'

// ── 1. Configurations de prix en direct pour le Calculateur Express ─────────
interface CalcOption {
  id: string
  name: string
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
    slug: 'carte-de-visite-standard',
    category: 'cartes',
    leadTime: '24h à 48h',
    popularQty: 500,
    quantities: [100, 250, 500, 1000, 2500],
    finishes: [
      { id: 'standard', label: 'Couché Mat 350g', desc: 'Rendu sobre & professionnel', extra: 0 },
      { id: 'brillant', label: 'Pelliculage Brillant', desc: 'Couleurs éclatantes & vives', extra: 1500 },
      { id: 'soft_touch', label: 'Soft Touch (Toucher Velours)', desc: 'Toucher peau de pêche haut de gamme', extra: 2500 },
      { id: 'vernis_3d', label: 'Vernis Sélectif 3D', desc: 'Relief brillant sur logo & textes', extra: 4000 },
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
    slug: 'flyer-a5-classique',
    category: 'flyers',
    leadTime: '48h',
    popularQty: 1000,
    quantities: [250, 500, 1000, 2500, 5000],
    finishes: [
      { id: 'standard', label: 'Papier Couché 135g', desc: 'Léger & percutant pour distribution', extra: 0 },
      { id: 'brillant', label: '170g Couché Brillant', desc: 'Qualité supérieure promotionnelle', extra: 2000 },
      { id: 'mat_250', label: '250g Semi-rigide Mat', desc: 'Support épais cartonné prestige', extra: 4500 },
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
    slug: 'kakemono-roll-up',
    category: 'roll-up',
    leadTime: '24h chrono',
    popularQty: 2,
    quantities: [1, 2, 5, 10],
    finishes: [
      { id: 'standard', label: 'Bâche PVC 440g + Structure Alu', desc: 'Housse de transport rembourrée incluse', extra: 0 },
      { id: 'ferrari', label: 'Toile Anti-reflet HD', desc: 'Rendu photo sans reflet sous spots', extra: 5000 },
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
    slug: 't-shirt-personnalise',
    category: 'textile',
    leadTime: '48h à 72h',
    popularQty: 50,
    quantities: [10, 25, 50, 100, 250],
    finishes: [
      { id: 'standard', label: 'Sérigraphie 1 couleur', desc: 'Marquage résistant aux lavages', extra: 0 },
      { id: 'quadri', label: 'Sérigraphie Quadri complète', desc: 'Toutes les couleurs de votre logo', extra: 15000 },
      { id: 'broderie', label: 'Broderie Cœur Haute Définition', desc: 'Rendu corporate cousu indélébile', extra: 25000 },
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
    slug: 'brochure-3-volets',
    category: 'brochures',
    leadTime: '48h à 72h',
    popularQty: 500,
    quantities: [100, 250, 500, 1000],
    finishes: [
      { id: 'standard', label: 'Satiné 135g plié 3 volets', desc: 'Rendu équilibré doux au toucher', extra: 0 },
      { id: 'mat', label: 'Pelliculage Mat 170g', desc: 'Qualité supérieure de présentation', extra: 4000 },
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
    slug: 'affiche-a3-premium',
    category: 'signaletique',
    leadTime: '24h chrono',
    popularQty: 2,
    quantities: [1, 2, 5, 10],
    finishes: [
      { id: 'standard', label: 'Bâche 510g + Œillets tous les 50cm', desc: 'Idéal façade, portail et clôture', extra: 0 },
      { id: 'ourlet', label: 'Ourlets périmétriques renforcés', desc: 'Résistance maximale aux vents violents', extra: 3000 },
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

// ── 2. Les 8 Univers / Catégories Visuelles d'Achat E-Commerce ───────────────
const ECOMMERCE_CATEGORIES = [
  {
    title: 'Cartes de Visite',
    desc: '350g, Soft Touch, dorure à chaud & vernis sélectif',
    price: 'Dès 4 500 FCFA',
    badge: 'Best-Seller',
    badgeBg: 'bg-emerald-600',
    href: '/catalogue/cartes',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    specs: 'Livrable en 24/48h · BAT offert',
  },
  {
    title: 'Flyers & Dépliants',
    desc: 'Quadri recto/verso haute tenue, formats A6, A5, A4, 3 volets',
    price: 'Dès 8 500 FCFA',
    badge: 'Express 48h',
    badgeBg: 'bg-blue-600',
    href: '/catalogue/flyers',
    img: 'https://images.unsplash.com/photo-1572945753563-80495678363d?auto=format&fit=crop&w=600&q=80',
    specs: 'Dès 250 exemplaires',
  },
  {
    title: 'Roll-up & Kakémonos',
    desc: 'Structures aluminium légères avec housse de protection',
    price: 'Dès 28 000 FCFA',
    badge: 'Salons & Foires',
    badgeBg: 'bg-purple-600',
    href: '/catalogue/roll-up',
    img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80',
    specs: '85×200cm & 100×200cm',
  },
  {
    title: 'Textile d’Entreprise',
    desc: 'Polos piqué 220g brodés, t-shirts sérigraphie 190g, casquettes',
    price: 'Dès 3 500 FCFA',
    badge: 'Tenues Pro',
    badgeBg: 'bg-amber-600',
    href: '/catalogue/textile',
    img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    specs: 'Toutes tailles XS à 4XL',
  },
  {
    title: 'Goodies & Cadeaux d’Affaires',
    desc: 'Stylos métalliques gravés laser, carnets cuir, clés USB, mugs',
    price: 'Dès 450 FCFA/u',
    badge: 'Cadeaux VIP',
    badgeBg: 'bg-rose-600',
    href: '/catalogue/goodies',
    img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    specs: 'Personnalisation laser & quadri',
  },
  {
    title: 'Brochures & Catalogues',
    desc: 'Rapports annuels, bilans d’activité, reliure piqûre ou dos carré collé',
    price: 'Dès 18 500 FCFA',
    badge: 'Institutionnel',
    badgeBg: 'bg-indigo-600',
    href: '/catalogue/brochures',
    img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    specs: 'De 8 à 64 pages',
  },
  {
    title: 'Bâches & Enseignes',
    desc: 'Bâche PVC 510g indéchirable traitée anti-UV avec œillets alu',
    price: 'Dès 16 000 FCFA',
    badge: 'Grand Format',
    badgeBg: 'bg-teal-600',
    href: '/catalogue/signaletique',
    img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
    specs: 'Sur mesure jusqu’à 50 mètres',
  },
  {
    title: 'Affiches & Posters HD',
    desc: 'Formats A3, A2, A1 jusqu’au grand format urbain A0',
    price: 'Dès 1 500 FCFA',
    badge: 'Campagnes',
    badgeBg: 'bg-orange-600',
    href: '/catalogue/affiches',
    img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    specs: 'Papier couché brillant 200g',
  },
]

// ── 3. Guide des Papiers & Finitions (Expérience d'Achat Pro) ────────────────
const FINISHES_GUIDE = [
  {
    name: 'Couché Mat 350g',
    desc: 'Le standard professionnel par excellence. Sans reflet, très rigide, idéal pour des cartes d’affaires sobres et institutionnelles.',
    ideal: 'Cartes collaborateurs, fiches produits',
    color: 'from-slate-700 to-slate-900',
  },
  {
    name: 'Soft Touch (Toucher Velours)',
    desc: 'Pelliculage thermique haut de gamme donnant une sensation de peau de pêche ultra-douce. Effet wow immédiat à la remise en main propre.',
    ideal: 'Dirigeants, professions libérales, VIP',
    color: 'from-purple-900 to-slate-950',
  },
  {
    name: 'Vernis Sélectif 3D en Relief',
    desc: 'Une couche de vernis brillant en surépaisseur déposée avec précision sur votre logo ou nom. Contraste saisissant entre mat et brillance.',
    ideal: 'Marques de prestige, luxe, créateurs',
    color: 'from-amber-700 to-amber-950',
  },
  {
    name: 'Couché Brillant 170g / 200g',
    desc: 'Surface lisse et éclatante qui réfléchit la lumière et fait ressortir la saturation des photographies et des visuels promotionnels.',
    ideal: 'Flyers commerciaux, affiches, menus',
    color: 'from-blue-700 to-blue-950',
  },
]

// ── 4. Avis Clients Vérifiés E-Commerce ──────────────────────────────────────
const REVIEWS = [
  {
    id: 1,
    name: 'Salimata Kaboré',
    role: 'Directrice Marketing, Agence Com Sahel',
    city: 'Ouagadougou',
    rating: 5,
    date: 'Il y a 3 jours',
    product: '1 000 Dépliants 3 volets + 2 Roll-ups',
    text: 'Commande passée un mardi matin en ligne avec nos fichiers PDF. Le studio PAO nous a renvoyé l’épreuve BAT en moins d’une heure. Livraison reçue le jeudi à notre agence. Couleurs fidèles à notre charte graphique !',
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
    text: 'Le toucher velours (Soft Touch) fait immédiatement la différence auprès de nos partenaires d’affaires. La facturation normalisée avec IFU et TVA a été envoyée directement par email pour la comptabilité.',
    verified: true,
  },
  {
    id: 3,
    name: 'Fatimata Diallo',
    role: 'Coordinatrice Événementielle ONG',
    city: 'Ouagadougou',
    rating: 5,
    date: 'Il y a 2 semaines',
    product: '50 T-shirts sérigraphiés + 100 Badges satin',
    text: 'Paiement ultra simple via Orange Money. Délais de confection respectés pour notre colloque régional. C’est le premier site d’impression au Faso avec une telle expérience client !',
    verified: true,
  },
]

export default function Home() {
  const { products: popularProducts, loading: isLoading } = usePopularProducts()
  
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
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* ═══════════════════════════════════════════════════════════
          0. ANNONCE BANDEAU HAUTE VISIBILITÉ E-COMMERCE
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white text-xs py-2.5 px-4 border-b border-white/10 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-300">
              <Flame size={14} className="text-amber-400 shrink-0 animate-bounce" />
              Offre Spéciale : -15% sur votre 1ère commande
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-slate-300">
              <Truck size={13} className="text-emerald-400" />
              Livraison offerte dès <strong>75 000 FCFA</strong> à Ouaga & Bobo
            </span>
            <span className="hidden lg:inline-flex items-center gap-1.5 text-slate-300">
              <Clock size={13} className="text-emerald-400" />
              Tirages express disponibles en 24h
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <button
              onClick={handleCopyPromo}
              className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2.5 py-0.5 rounded-md font-mono border border-white/15 transition-colors cursor-pointer"
              title="Copier le code promo"
            >
              {copiedPromo ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>Code : <strong>YOPPRINT15</strong></span>
              {copiedPromo && <span className="text-emerald-400 text-[10px]">Copié !</span>}
            </button>

            <Link href="/entreprises" className="text-amber-300 hover:text-white font-bold ml-1 transition-colors">
              Espace Entreprises (Facturation DGI) →
            </Link>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          1. HERO RICHE & PROFESSIONNEL : MOTEUR E-COMMERCE & CALCULATEUR LIVE
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-b from-white via-slate-50/70 to-slate-100/90 border-b border-slate-200 overflow-hidden py-8 md:py-14">
        {/* Motif d'arrière plan géométrique d'imprimerie subtil */}
        <div className="absolute inset-0 bg-[radial-gradient(#0E2347_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* ─── Colonne Gauche : Pitch E-Commerce, Autorité & Recherche Rapide ─── */}
            <div className="lg:col-span-6 space-y-5">

              {/* Badges d'autorité et réputation */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-bold text-amber-950 shadow-2xs">
                  <div className="flex text-amber-500 text-xs">
                    {'★★★★★'.split('').map((s, idx) => (
                      <span key={idx}>★</span>
                    ))}
                  </div>
                  <span>4.9/5 · 1 240+ avis vérifiés au Burkina</span>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-600 text-white shadow-xs">
                  🇧🇫 Imprimerie Industrielle N°1 au Faso
                </span>
              </div>

              {/* Titre Principal E-Commerce */}
              <h1 className="font-display font-black text-slate-950 text-3xl sm:text-4xl lg:text-[44px] leading-[1.12] tracking-tight">
                L’imprimerie pro en ligne avec <span className="text-emerald-700 underline decoration-emerald-300 underline-offset-4">tarifs en direct</span> et livraison 48h.
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Cartes de visite, flyers, roll-up, textiles et cadeaux d’affaires. Calculez votre devis en direct, recevez votre <strong>BAT certifié en 300 DPI</strong> et payez en toute sécurité par <strong>Orange Money</strong> ou <strong>Moov Money</strong>.
              </p>

              {/* Barre de Recherche E-Commerce Rapide */}
              <div className="bg-white p-2 rounded-2xl border-2 border-slate-200/90 shadow-md flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 flex items-center">
                  <Search size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Rechercher un produit (ex: Cartes Soft Touch, Flyers A5...)"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-emerald-600 transition-all font-medium"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        window.location.href = `/catalogue?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`
                      }
                    }}
                  />
                </div>
                <Link
                  href="/catalogue"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                >
                  <ShoppingCart size={15} />
                  Commander <ArrowRight size={14} />
                </Link>
              </div>

              {/* Tags Fréquents E-Commerce */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <span className="font-bold text-slate-400">Accès rapide :</span>
                {[
                  { label: '🪪 Cartes 350g', href: '/catalogue/cartes' },
                  { label: '📄 Flyers A5', href: '/catalogue/flyers' },
                  { label: '🪧 Roll-up alu', href: '/catalogue/roll-up' },
                  { label: '👕 Polos brodés', href: '/catalogue/textile' },
                  { label: '🚩 Bâches PVC', href: '/catalogue/signaletique' },
                ].map((tag) => (
                  <Link
                    key={tag.label}
                    href={tag.href}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-600 hover:text-emerald-800 text-slate-700 font-medium transition-colors shadow-2xs"
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>

              {/* 4 Engagements Forts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200/80 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Clock size={13} />
                  </div>
                  <span>Prêt en 24h / 48h</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <ShieldCheck size={13} />
                  </div>
                  <span>BAT 300 DPI offert</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <FileCheck size={13} />
                  </div>
                  <span>Factures DGI (TVA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Award size={13} />
                  </div>
                  <span>Réimpression garantie</span>
                </div>
              </div>

            </div>

            {/* ─── Colonne Droite : Le Widget Calculateur Express E-Commerce Pro ─── */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-2xl overflow-hidden relative">

                {/* Header du Widget Calculateur */}
                <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4.5 px-6 flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold">
                      <Calculator size={18} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm sm:text-base leading-tight">
                        Calculateur de Prix Express
                      </h3>
                      <p className="text-[11px] text-slate-300">
                        Chiffrage net en direct · Contrôle pré-presse inclus
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    Direct Presses
                  </span>
                </div>

                {/* Formulaire interactif en direct */}
                <div className="p-6 space-y-5">
                  
                  {/* Étape 1 : Choix du produit avec mini-vignettes */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                      1. Sélectionnez votre produit d’impression :
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {Object.entries(CALC_PRODUCTS).map(([key, prod]) => {
                        const isSelected = selectedProdKey === key
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleProductChange(key)}
                            className={`p-2 rounded-xl border text-center transition-all ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-600'
                                : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="text-[11px] font-bold block truncate">{prod.name.split(' ')[0]}</span>
                            <span className="text-[9px] text-slate-400 block truncate">{prod.name.split(' ').slice(1).join(' ') || ''}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Étape 2 : Quantité avec remise dégressive visible */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        2. Quantité (Tirage d’impression) :
                      </label>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                        📉 Tarif dégressif avantageux
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {activeProduct.quantities.map((q) => {
                        const isPopular = q === activeProduct.popularQty
                        return (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setSelectedQty(q)}
                            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all relative ${
                              selectedQty === q
                                ? 'bg-slate-950 text-white shadow-sm ring-2 ring-slate-950'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {new Intl.NumberFormat('fr-FR').format(q)} {q > 10 ? 'ex.' : 'pcs'}
                            {isPopular && selectedQty !== q && (
                              <span className="absolute -top-1.5 -right-1 text-[8px] font-black bg-amber-400 text-slate-950 px-1 rounded-full">
                                Top
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Étape 3 : Papier & Finition de prestige */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                      3. Papier & Finition de protection :
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeProduct.finishes.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSelectedFinishId(f.id)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                            selectedFinishId === f.id
                              ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-950 ring-1 ring-emerald-600'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 w-full">
                            <span className="font-bold truncate pr-1">{f.label}</span>
                            {f.extra > 0 ? (
                              <span className="text-[10px] text-emerald-800 shrink-0 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                                +{new Intl.NumberFormat('fr-FR').format(f.extra)} F
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 shrink-0">Inclus</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-normal line-clamp-1 mt-0.5">{f.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Box Résumé Tarifaire & Bouton de Commande Directe ── */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-slate-50 border-2 border-emerald-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Prix Total Net TTC :
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                          BAT 300 DPI Offert
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-display font-black text-2xl sm:text-3xl text-emerald-900 tabular-nums">
                          {new Intl.NumberFormat('fr-FR').format(calculatedPrice.total)}
                        </span>
                        <span className="text-xs font-bold text-emerald-900">FCFA</span>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Soit <strong className="text-slate-900">{calculatedPrice.unitPrice} FCFA</strong> / pièce · Délais d’atelier : <strong>{activeProduct.leadTime}</strong>
                      </p>
                    </div>

                    <Link
                      href={`/produit/${activeProduct.slug}`}
                      className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 active:scale-95 shrink-0"
                    >
                      <ShoppingCart size={16} />
                      Commander & Téléverser mon fichier →
                    </Link>
                  </div>

                </div>

                {/* Footer du widget */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Vous avez déjà une maquette prête ?</span>
                  <Link href="/devis" className="font-bold text-emerald-700 hover:underline">
                    Déposer mon fichier pour vérification express →
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. TRUST BAR E-COMMERCE : 5 ENGAGEMENTS ACHETEUR DU FASO
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6">
            
            <div className="flex items-center gap-3 p-2 bg-slate-50/60 rounded-2xl border border-slate-200/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Livraison 24/48h</h4>
                <p className="text-[11px] text-slate-500">Ouaga, Bobo et provinces</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 bg-slate-50/60 rounded-2xl border border-slate-200/60">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">BAT Numérique 300 DPI</h4>
                <p className="text-[11px] text-slate-500">Contrôle gratuit pré-presse</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 bg-slate-50/60 rounded-2xl border border-slate-200/60">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Orange & Moov Money</h4>
                <p className="text-[11px] text-slate-500">Règlements sécurisés</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 bg-slate-50/60 rounded-2xl border border-slate-200/60">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <FileCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Factures DGI (TVA)</h4>
                <p className="text-[11px] text-slate-500">Conformité fiscale totale</p>
              </div>
            </div>

            <div className="col-span-2 md:col-span-1 flex items-center gap-3 p-2 bg-slate-50/60 rounded-2xl border border-slate-200/60">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Award size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Satisfait ou Réimprimé</h4>
                <p className="text-[11px] text-slate-500">Sérénité absolue garantie</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. GRILLE DES 8 UNIVERS VISUELS D'IMPRESSION E-COMMERCE
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-1">
                Catalogue Général E-Commerce
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950 tracking-tight">
                Acheter par Univers d’Impression
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Découvrez nos supports professionnels prêts à configurer et expédiés directement depuis notre atelier.
              </p>
            </div>

            <Link
              href="/catalogue"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-4 self-start sm:self-auto"
            >
              Voir l’ensemble du catalogue (200+ références) →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {ECOMMERCE_CATEGORIES.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-emerald-600 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo Haute Définition avec Zoom au hover */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cat.img}
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <span className={`absolute top-2.5 left-2.5 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs ${cat.badgeBg}`}>
                      {cat.badge}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {cat.desc}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      {cat.specs}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-slate-100">
                  <span className="font-display font-extrabold text-xs sm:text-sm text-emerald-800">
                    {cat.price}
                  </span>
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-emerald-700 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. GUIDE TECHNIQUE DES PAPIERS & FINITIONS (TRÈS PRO)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              L'Expertise Pré-Presse YopoePrint
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950 tracking-tight">
              Quel papier & finition choisir pour vos supports ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Un bon support graphique sublime l’image de votre marque. Découvrez nos textures professionnelles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FINISHES_GUIDE.map((fg) => (
              <div
                key={fg.name}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className={`h-2.5 w-12 rounded-full bg-gradient-to-r ${fg.color} mb-4`} />
                  <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-emerald-700 transition-colors">
                    {fg.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {fg.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Usage recommandé :</span>
                  <span className="text-xs font-semibold text-slate-800">{fg.ideal}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bandeau d'incitation Kit Échantillons Gratuit */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold shrink-0">
                <Palette size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Vous hésitez encore sur la matière ?</h4>
                <p className="text-xs text-slate-600">Commandez gratuitement notre nuancier d’échantillons papier imprimé et testez le rendu au toucher.</p>
              </div>
            </div>

            <Link
              href="/contact?sujet=echantillons"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shrink-0 active:scale-95"
            >
              Demander mon nuancier gratuit →
            </Link>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. BESTSELLERS & PRODUITS SHOPPABLES IMMÉDIATEMENT
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                  Commandes Fréquentes
                </span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950 tracking-tight">
                Nos Meilleures Ventes du Moment
              </h2>
            </div>

            {/* Onglets rapides e-commerce */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto self-start md:self-auto scrollbar-none shadow-2xs">
              {[
                { id: 'all', label: 'Tout voir' },
                { id: 'cartes', label: 'Cartes' },
                { id: 'flyers', label: 'Flyers' },
                { id: 'grand_format', label: 'Roll-up & Bâches' },
                { id: 'textile', label: 'Textile' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setBestsellerFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    bestsellerFilter === tab.id
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
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
                <div key={i} className="h-[280px] bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBestsellers.map((p: any) => (
                <ProductCard key={p._id ?? p.id} product={p} />
              ))}
            </div>
          )}

          {/* Bannière Deal & Acquisition E-Commerce */}
          <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="inline-block bg-white/20 text-white font-bold text-xs px-3 py-0.5 rounded-full uppercase tracking-wider mb-1">
                🔥 Offre de Bienvenue E-Commerce
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                Bénéficiez de 15% de réduction sur votre 1ère commande
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100">
                Utilisez le code promo <strong className="bg-white/20 px-2 py-0.5 rounded text-white font-mono">YOPPRINT15</strong> lors de la validation du panier.
              </p>
            </div>

            <Link
              href="/catalogue"
              className="px-6 py-3.5 bg-white text-emerald-950 hover:bg-slate-100 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 shrink-0"
            >
              J'en profite maintenant →
            </Link>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. LE TUNNEL D'ACHAT EN 4 ÉTAPES (TUNNEL D'IMPRESSION RASSURANT)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Zéro Prise de Tête
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950 tracking-tight">
              Comment commander en 4 étapes simples ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Même si vous n’avez jamais commandé d’impression en ligne, notre studio vous accompagne pas à pas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Configurez en ligne',
                desc: 'Choisissez votre format, grammage papier et quantité. Le prix net en FCFA s’actualise en direct sans mauvaise surprise.',
                icon: Calculator,
              },
              {
                step: '02',
                title: 'Déposez votre maquette',
                desc: 'Importez votre PDF, PNG ou confiez la mise en page à notre studio graphique. Pas de fichier ? Nous créons votre maquette.',
                icon: Layers,
              },
              {
                step: '03',
                title: 'Validez votre BAT 300 DPI',
                desc: 'Nos experts vérifient les couleurs (CMJN) et fonds perdus. Vous approuvez l’épreuve numérique avant mise sous presse.',
                icon: CheckCircle2,
              },
              {
                step: '04',
                title: 'Livraison express 48h',
                desc: 'Réglez par Orange Money, Moov Money ou virement. Vos cartons d’impression arrivent directement à votre porte.',
                icon: Truck,
              },
            ].map((st) => {
              const Icon = st.icon
              return (
                <div
                  key={st.step}
                  className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200 shadow-xs relative group hover:border-emerald-600 hover:bg-white hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Icon size={20} />
                    </div>
                    <span className="font-mono font-black text-2xl text-slate-300 group-hover:text-emerald-700 transition-colors">
                      {st.step}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    {st.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. SECTION B2B & ENTREPRISES (INTEGRÉE AVEC ELEGANCE)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <Building2 size={13} />
                Solutions Dédiées Entreprises, PME & Institutions
              </div>

              <h2 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight">
                Vous commandez régulièrement ? Ouvrez un Compte Entreprise B2B.
              </h2>

              <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
                Profitez de remises dégressives jusqu’à <strong>-35%</strong>, d’une <strong>facturation normalisée DGI</strong> avec TVA déductible, d’un interlocuteur dédié et de livraisons groupées pour vos agences.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/entreprises"
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
                >
                  Découvrir les offres Entreprises <ArrowRight size={15} />
                </Link>
                <Link
                  href="/devis"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-all"
                >
                  Demande de devis B2B
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="font-bold text-amber-300 block mb-1">Factures Normalisées</span>
                <p className="text-slate-400 text-[11px]">IFU & TVA certifiées conformes pour votre comptabilité.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="font-bold text-amber-300 block mb-1">Tarifs Volumes</span>
                <p className="text-slate-400 text-[11px]">Jusqu’à -35% d’économies sur vos campagnes annuelles.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="font-bold text-amber-300 block mb-1">BAT VIP sous 1h</span>
                <p className="text-slate-400 text-[11px]">Graphiste pré-presse dédié pour vos urgences événementielles.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="font-bold text-amber-300 block mb-1">Multi-Sites Faso</span>
                <p className="text-slate-400 text-[11px]">Expéditions coordonnées à Ouaga, Bobo et succursales.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. AVIS CLIENTS VÉRIFIÉS & RETOURS D'EXPÉRIENCE
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-1">
                Transparence & Avis Réels
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950 tracking-tight">
                Ce que disent nos clients qui commandent en ligne
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex text-amber-500">
                {'★★★★★'.split('').map((s, idx) => (
                  <span key={idx} className="text-sm">★</span>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">4.9 / 5 sur 1 240+ avis</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex text-amber-400 text-sm">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">{rev.date}</span>
                  </div>

                  <p className="text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md mb-3 inline-block">
                    Achat : {rev.product}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic mb-6">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{rev.name}</h4>
                    <p className="text-[11px] text-slate-400">{rev.role} · {rev.city}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Vérifié
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. BANNIÈRE FINALE D'ENGAGEMENT E-COMMERCE
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white py-14 md:py-20 border-t border-emerald-950">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center space-y-6">
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            Prêt à imprimer vos prochains supports ?
          </h2>

          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Rejoignez plus de 5 000 professionnels et particuliers satisfaits au Burkina Faso. Des impressions impeccables livrées à votre porte en 48h.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/catalogue"
              className="px-8 py-4 bg-white text-emerald-950 font-black text-sm sm:text-base rounded-xl transition-all shadow-xl hover:bg-slate-100 active:scale-95 inline-flex items-center gap-2"
            >
              Parcourir le catalogue complet <ArrowRight size={17} />
            </Link>

            <Link
              href="/devis"
              className="px-7 py-4 bg-emerald-950/60 hover:bg-emerald-950 text-white font-bold text-sm sm:text-base rounded-xl border border-emerald-500/50 transition-all"
            >
              Demander un devis personnalisé
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-200">
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
