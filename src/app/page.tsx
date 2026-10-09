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
  Palette, Flame, ArrowUpRight,
  Phone, Mail, HelpCircle, Send,
  Tag, Gift, Printer, Briefcase
} from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { PRODUCTS } from '@/lib/data'

// ── 1. Données du Calculateur Express Hero ───────────────────────────────────
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
    pricing: { 100: 4500, 250: 6200, 500: 9800, 1000: 16500, 2500: 35000 },
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
    pricing: { 250: 9500, 500: 13500, 1000: 18500, 2500: 39000, 5000: 68000 },
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
    pricing: { 1: 28000, 2: 52000, 5: 120000, 10: 220000 },
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
    pricing: { 10: 45000, 25: 95000, 50: 175000, 100: 320000, 250: 725000 },
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
    pricing: { 100: 18500, 250: 29000, 500: 48000, 1000: 82000 },
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
    pricing: { 1: 16000, 2: 30000, 5: 70000, 10: 130000 },
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80',
  },
}

// ── 2. Bannières Événements / Campagnes (Inspiration Helloprint Slider) ────────
const HERO_CAMPAIGNS = [
  {
    title: 'Cadeaux d’Affaires & VIP',
    sub: 'Préparez vos kits de fin d’année & salons',
    cta: 'Découvrir la collection',
    href: '/catalogue/goodies',
    bg: 'bg-gradient-to-r from-slate-900 to-slate-800',
    img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    badge: 'Prestige 2026',
  },
  {
    title: '-15% sur votre 1ère commande',
    sub: 'Avec le code promo officiel YOPPRINT15',
    cta: 'Activer mon code promo',
    href: '/catalogue',
    bg: 'bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    badge: 'Offre Bienvenue',
  },
  {
    title: 'Spécial Salons SIAO & SNC',
    sub: 'Roll-ups, photocalls, badges & comptoirs',
    cta: 'Voir les packs salons',
    href: '/entreprises',
    bg: 'bg-gradient-to-r from-blue-950 to-slate-900',
    img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80',
    badge: 'Salons & Foires',
  },
  {
    title: 'Packaging & Boîtes Kraft',
    sub: 'Sacs shopping et cartons expédition marqués',
    cta: 'Explorer le packaging',
    href: '/catalogue',
    bg: 'bg-gradient-to-r from-amber-950 to-slate-900',
    img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    badge: 'Nouveauté Atelier',
  },
]

// ── 3. Ventes Flash & Offres Promo du Jour (Inspiration Jumia E-Commerce) ─────
const FLASH_DEALS = [
  {
    name: '1 000 Cartes 350g Mat',
    slug: 'carte-de-visite-standard',
    category: 'Cartes de visite',
    oldPrice: 18500,
    newPrice: 14800,
    discount: '-20%',
    leadTime: '24h chrono',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    soldPct: 82,
  },
  {
    name: '500 Flyers A5 Quadri',
    slug: 'flyer-a5-classique',
    category: 'Flyers & Dépliants',
    oldPrice: 15000,
    newPrice: 12500,
    discount: '-17%',
    leadTime: '48h',
    img: 'https://images.unsplash.com/photo-1572945753563-80495678363d?auto=format&fit=crop&w=400&q=80',
    soldPct: 74,
  },
  {
    name: 'Roll-up Pro 85×200 Alu',
    slug: 'kakemono-roll-up',
    category: 'Salons & Foires',
    oldPrice: 32000,
    newPrice: 28000,
    discount: '-12%',
    leadTime: '24h',
    img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=400&q=80',
    soldPct: 91,
  },
  {
    name: '50 T-shirts Sérigraphiés 190g',
    slug: 't-shirt-personnalise',
    category: 'Textile Pro',
    oldPrice: 195000,
    newPrice: 175000,
    discount: '-10%',
    leadTime: '48-72h',
    img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
    soldPct: 65,
  },
  {
    name: 'Bâche PVC 3×1m + Œillets',
    slug: 'affiche-a3-premium',
    category: 'Signalétique',
    oldPrice: 24000,
    newPrice: 19500,
    discount: '-18%',
    leadTime: '24h',
    img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80',
    soldPct: 88,
  },
]

// ── 4. Produits Exposition & Salons (Bloc Signature Helloprint) ───────────────
const EXPO_PRODUCTS = [
  { label: 'Comptoir d’accueil pliable', price: 'Dès 45 000 F', href: '/catalogue/evenementiel', emoji: '🏢' },
  { label: 'Photocall / Mur d’image 3×2m', price: 'Dès 85 000 F', href: '/catalogue/evenementiel', emoji: '📸' },
  { label: 'Stand Parapluie Textile', price: 'Dès 120 000 F', href: '/catalogue/evenementiel', emoji: '🎪' },
  { label: 'Présentoir de table / Chevalet', price: 'Dès 6 500 F', href: '/catalogue/signaletique', emoji: '📋' },
  { label: 'Brochures agrafées A4', price: 'Dès 18 500 F', href: '/catalogue/brochures', emoji: '📚' },
  { label: 'Badges VIP + Tours de cou', price: 'Dès 650 F/u', href: '/catalogue/goodies', emoji: '🪪' },
]

// ── 5. Nouveaux Produits & Tendance (Inspiration Helloprint & Jumia) ───────────
const NEW_PRODUCTS = [
  {
    name: 'Oriflamme Plume 2.80m',
    desc: 'Mât alu + embase bouée d’eau',
    price: '38 000 FCFA',
    badge: 'Nouveau',
    img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    slug: 'kakemono-roll-up',
  },
  {
    name: 'Gobelets Isothermes Gravés',
    desc: 'Inox double paroi 500ml',
    price: '4 500 FCFA',
    badge: 'Tendance',
    img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',
    slug: 'tote-bag-coton',
  },
  {
    name: 'Sacs Cabas Tissu Faso',
    desc: 'Coton bio tissé 240g durable',
    price: '2 200 FCFA',
    badge: 'Éco-responsable',
    img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    slug: 'tote-bag-coton',
  },
  {
    name: 'Stylos Métalliques Laser',
    desc: 'Corps aluminium finition satin',
    price: '450 FCFA',
    badge: 'Best-Seller',
    img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
    slug: 'carte-de-visite-standard',
  },
]

// ── 6. Papiers & Finitions ───────────────────────────────────────────────────
const FINISHES_GUIDE = [
  {
    name: 'Couché Mat 350g',
    badge: 'Standard Industriel',
    desc: 'Pureté sans reflet, rigidité exemplaire. Idéal pour cartes d’affaires et fiches de présentation.',
    ideal: 'Cartes collaborateurs, fiches de vente',
    gradient: 'from-[#2C2C2E] to-[#1C1C1E]',
  },
  {
    name: 'Soft Touch (Toucher Velours)',
    badge: 'Toucher Peau de Pêche',
    desc: 'Pelliculage thermique à la douceur tactile incomparable. Sensation immédiate à la remise en main.',
    ideal: 'Dirigeants, signatures de prestige, VIP',
    gradient: 'from-[#3A2A4D] to-[#1F172B]',
  },
  {
    name: 'Vernis Sélectif 3D',
    badge: 'Relief Tactile',
    desc: 'Dépôt polymère brillant haute précision. Fait ressortir vos logos et monogrammes au toucher.',
    ideal: 'Marques de luxe, identités visuelles fortes',
    gradient: 'from-[#4A3B18] to-[#251D0B]',
  },
  {
    name: 'Couché Brillant 200g',
    badge: 'Éclat Chromatique',
    desc: 'Surfaçage optique haute saturation. Fait rayonner les photos, couleurs vives et aplats profonds.',
    ideal: 'Flyers commerciaux, affiches, menus',
    gradient: 'from-[#1A2E44] to-[#0E1A29]',
  },
]

// ── 7. Avis Clients Vérifiés (Style Trustpilot / Avis Faso) ──────────────────
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

  // State pour le Calculateur Express
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

  // Source unifiée de produits
  const allAvailableProducts = useMemo(() => {
    if (popularProducts && popularProducts.length > 0) return popularProducts
    return PRODUCTS
  }, [popularProducts])

  // Filtrage réactif par onglet
  const filteredBestsellers = useMemo(() => {
    if (bestsellerFilter === 'all') return allAvailableProducts.slice(0, 10)
    const filtered = allAvailableProducts.filter((p: any) => {
      const cat = (p.category || '').toLowerCase()
      const slug = (p.slug || '').toLowerCase()
      const name = (p.name || '').toLowerCase()
      if (bestsellerFilter === 'cartes') return cat.includes('carte') || slug.includes('carte') || name.includes('carte')
      if (bestsellerFilter === 'flyers') return cat.includes('flyer') || cat.includes('brochure') || slug.includes('flyer') || slug.includes('brochure')
      if (bestsellerFilter === 'grand_format') return cat.includes('roll') || cat.includes('signal') || cat.includes('affiche') || slug.includes('roll') || slug.includes('bache')
      if (bestsellerFilter === 'textile') return cat.includes('textile') || slug.includes('t-shirt') || slug.includes('polo') || slug.includes('tote') || cat.includes('goodies')
      return true
    })
    return filtered.length > 0 ? filtered.slice(0, 10) : allAvailableProducts.slice(0, 10)
  }, [allAvailableProducts, bestsellerFilter])

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] selection:bg-[#1D1D1F] selection:text-white antialiased">

      {/* ═══════════════════════════════════════════════════════════
          0. TOP BANDEAU COMMERCIAL E-COMMERCE HAUTE VISIBILITÉ
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-[#1D1D1F] text-white text-xs py-2 px-4 border-b border-white/[0.08] sticky top-0 z-40 backdrop-blur-xl bg-opacity-95">
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
              <ShieldCheck size={13} className="text-emerald-400" />
              Orange Money · Moov Money · Factures DGI
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <button
              onClick={handleCopyPromo}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-full font-mono border border-white/10 transition-all cursor-pointer active:scale-95"
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
          1. HERO CARROUSEL / QUAD-BANNERS (STYLE HELLOPRINT HERO)
      ═══════════════════════════════════════════════════════════ */}
      <section className="pt-4 pb-6 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {HERO_CAMPAIGNS.map((camp, idx) => (
            <Link
              key={camp.title}
              href={camp.href}
              className={`relative rounded-[24px] overflow-hidden p-6 text-white flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-xl transition-all duration-300 group border border-black/[0.06] ${camp.bg}`}
            >
              {/* Image en fond avec overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 group-hover:opacity-40 transition-all duration-500"
                style={{ backgroundImage: `url(${camp.img})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              <div className="relative z-10">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md text-white mb-2">
                  {camp.badge}
                </span>
                <h3 className="font-display font-bold text-lg text-white leading-tight">
                  {camp.title}
                </h3>
                <p className="text-xs text-white/80 mt-1 line-clamp-2">
                  {camp.sub}
                </p>
              </div>

              <div className="relative z-10 pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/20 group-hover:bg-emerald-600 px-3.5 py-1.5 rounded-full backdrop-blur-md transition-colors">
                  {camp.cta} <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. ACCÈS RAPIDE PAR FAMILLES (PILL BAR HELLOPRINT & JUMIA)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-3 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-[24px] p-3 border border-black/[0.06] shadow-xs flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          {[
            { label: 'Cartes de Visite', icon: '🪪', href: '/catalogue/cartes' },
            { label: 'Flyers & Dépliants', icon: '📄', href: '/catalogue/flyers' },
            { label: 'Roll-up & Salons', icon: '🪧', href: '/catalogue/roll-up' },
            { label: 'Textile & T-shirts', icon: '👕', href: '/catalogue/textile' },
            { label: 'Goodies & Cadeaux', icon: '🎁', href: '/catalogue/goodies' },
            { label: 'Brochures & Livrets', icon: '📚', href: '/catalogue/brochures' },
            { label: 'Bâches PVC & Enseignes', icon: '🚩', href: '/catalogue/signaletique' },
            { label: 'Affiches & Posters', icon: '🗓️', href: '/catalogue/affiches' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl hover:bg-[#F5F5F7] transition-all whitespace-nowrap text-xs font-semibold text-[#1D1D1F] shrink-0 active:scale-95"
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. VENTES FLASH E-COMMERCE (INSPIRATION JUMIA EXPRESS)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-6 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-[28px] border border-black/[0.06] p-6 shadow-sm overflow-hidden">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-black/[0.05]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
                <Flame size={22} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-extrabold text-xl text-[#1D1D1F]">
                    Ventes Flash de la Semaine
                  </h2>
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Jusqu'à -20%
                  </span>
                </div>
                <p className="text-xs text-[#86868B]">
                  Tarifs directs usine valables dans la limite des créneaux atelier disponibles.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#86868B]">
              <span>Délais :</span>
              <span className="bg-[#F5F5F7] px-2.5 py-1 rounded-full text-emerald-800 font-bold border border-black/[0.05]">
                Expédié en 24/48h
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {FLASH_DEALS.map((deal) => (
              <Link
                key={deal.name}
                href={`/produit/${deal.slug}`}
                className="group flex flex-col justify-between bg-[#F5F5F7] hover:bg-white rounded-2xl p-3.5 border border-black/[0.05] hover:border-black/[0.1] hover:shadow-md transition-all duration-300 relative"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={deal.img}
                      alt={deal.name}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 bg-rose-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                      {deal.discount}
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider block">
                    {deal.category}
                  </span>
                  <h3 className="font-bold text-xs text-[#1D1D1F] line-clamp-2 mt-0.5 group-hover:text-emerald-700 transition-colors">
                    {deal.name}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-black/[0.04]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-extrabold text-sm text-[#1D1D1F]">
                      {new Intl.NumberFormat('fr-FR').format(deal.newPrice)} F
                    </span>
                    <span className="text-[11px] text-[#86868B] line-through font-normal">
                      {new Intl.NumberFormat('fr-FR').format(deal.oldPrice)} F
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${deal.soldPct}%` }} />
                  </div>
                  <span className="text-[9px] text-[#86868B] block text-right mt-0.5 font-medium">
                    {deal.soldPct}% réservé
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. LE CALCULATEUR EXPRESS PRO (MOTEUR WEB-TO-PRINT)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-8 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-[32px] border border-black/[0.07] p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Pitch calculateur */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Calculator size={13} />
                Calculateur Tarifaire en Direct
              </div>

              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1D1D1F] leading-tight">
                Estimez et commandez vos impressions sans devis d’attente.
              </h2>

              <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed">
                Choisissez votre produit, tirage et finitions. Obtenez instantanément votre tarif net en FCFA, votre Bon À Tirer certifié en 300 DPI et la date d’expédition.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-[#1D1D1F]">
                <div className="p-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
                  <span className="text-emerald-700 block mb-0.5">✓ BAT 300 DPI Offert</span>
                  <p className="text-[11px] text-[#86868B] font-normal">Contrôle studio inclus</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
                  <span className="text-emerald-700 block mb-0.5">✓ Facture Normalisée DGI</span>
                  <p className="text-[11px] text-[#86868B] font-normal">IFU & TVA certifiées</p>
                </div>
              </div>
            </div>

            {/* Formulaire interactif */}
            <div className="lg:col-span-7 bg-[#F5F5F7] rounded-[24px] p-6 border border-black/[0.05] space-y-4">
              
              {/* Choix support */}
              <div>
                <label className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider block mb-2">
                  1. Choisir le produit :
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 bg-white p-1 rounded-2xl border border-black/[0.05]">
                  {Object.entries(CALC_PRODUCTS).map(([key, prod]) => {
                    const isSelected = selectedProdKey === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleProductChange(key)}
                        className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1D1D1F] text-white font-bold shadow-xs'
                            : 'text-[#86868B] hover:text-[#1D1D1F]'
                        }`}
                      >
                        <span className="text-[11px] block truncate">{prod.shortName}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Choix quantité */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                    2. Quantité (Tirage d'impression) :
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    Tarif dégressif avantageux
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 bg-white p-1 rounded-2xl border border-black/[0.05]">
                  {activeProduct.quantities.map((q) => {
                    const isSelected = selectedQty === q
                    return (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setSelectedQty(q)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'text-[#86868B] hover:text-[#1D1D1F]'
                        }`}
                      >
                        {new Intl.NumberFormat('fr-FR').format(q)} {q > 10 ? 'ex.' : 'pcs'}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Finition */}
              <div>
                <label className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider block mb-2">
                  3. Finition & Matière :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeProduct.finishes.map((f) => {
                    const isSelected = selectedFinishId === f.id
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedFinishId(f.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'border-[#1D1D1F] bg-white text-[#1D1D1F] ring-1 ring-[#1D1D1F] shadow-xs'
                            : 'border-black/[0.08] bg-white/70 text-[#86868B] hover:bg-white hover:text-[#1D1D1F]'
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

              {/* Box Total & CTA */}
              <div className="p-4 rounded-2xl bg-white border border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block">
                    Total Net TTC :
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-display font-black text-2xl sm:text-3xl text-[#1D1D1F] tabular-nums">
                      {new Intl.NumberFormat('fr-FR').format(calculatedPrice.total)}
                    </span>
                    <span className="text-xs font-bold text-[#86868B]">FCFA</span>
                  </div>
                  <p className="text-[11px] text-[#86868B]">
                    Soit <strong className="text-[#1D1D1F]">{calculatedPrice.unitPrice} FCFA</strong> / pièce · Délais : <strong>{activeProduct.leadTime}</strong>
                  </p>
                </div>

                <Link
                  href={`/produit/${activeProduct.slug}`}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 shrink-0"
                >
                  <ShoppingCart size={15} />
                  Commander ce tirage →
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. LES BESTSELLERS DU FASO (DOUBLE GRILLE 10 PRODUITS HELLOPRINT)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-10 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                Les Incontournables
              </span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1D1D1F]">
              Nos Meilleures Ventes du Moment
            </h2>
          </div>

          {/* Onglets rapides */}
          <div className="bg-[#E8E8ED] p-1 rounded-full inline-flex border border-black/[0.04] self-start md:self-auto overflow-x-auto scrollbar-none">
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
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  bestsellerFilter === tab.id
                    ? 'bg-white text-[#1D1D1F] shadow-xs'
                    : 'text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (!popularProducts || popularProducts.length === 0) ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-[280px] bg-white rounded-2xl border border-black/[0.05] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {filteredBestsellers.map((p: any) => (
              <ProductCard key={p._id ?? p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. FOCUS SALONS & EXPOSITIONS (BLOC SIGNATURE HELLOPRINT)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-10 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-[32px] border border-black/[0.06] p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* Carte Visuelle Grande Gauche */}
            <div className="lg:col-span-5 relative rounded-[24px] overflow-hidden p-8 text-white flex flex-col justify-between min-h-[340px] bg-slate-900 group">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-45 group-hover:scale-105 transition-all duration-500"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 mb-3">
                  Salons & Foires du Faso
                </span>
                <h3 className="font-display font-extrabold text-2xl text-white leading-tight">
                  Exposition & Événementiel
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Tout pour équiper votre stand au SIAO, à la SNC, aux forums ministériels et salons d’entreprises en 48h.
                </p>
              </div>

              <div className="relative z-10 pt-6">
                <Link
                  href="/entreprises"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-all shadow-md active:scale-95"
                >
                  Voir tous les produits salons <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Grille 2x3 de mini-cartes de produits pour événements */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {EXPO_PRODUCTS.map((prod) => (
                <Link
                  key={prod.label}
                  href={prod.href}
                  className="p-4 rounded-2xl bg-[#F5F5F7] hover:bg-white border border-black/[0.05] hover:border-black/[0.1] hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{prod.emoji}</span>
                  <div>
                    <h4 className="font-bold text-xs text-[#1D1D1F] group-hover:text-emerald-700 transition-colors leading-snug">
                      {prod.label}
                    </h4>
                    <span className="text-[11px] font-semibold text-emerald-800 block mt-1">
                      {prod.price}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. DÉCOUVREZ LES NOUVEAUX PRODUITS (HELLOPRINT CAROUSEL)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-8 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#1D1D1F]">
              Découvrez les Nouveaux Produits
            </h2>
            <p className="text-xs text-[#86868B]">
              Les dernières innovations d'impression ajoutées à notre atelier.
            </p>
          </div>
          <Link href="/catalogue" className="text-xs font-bold text-emerald-700 hover:underline">
            Voir tout →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {NEW_PRODUCTS.map((item) => (
            <Link
              key={item.name}
              href={`/produit/${item.slug}`}
              className="bg-white rounded-[24px] border border-black/[0.06] p-4 hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F5F5F7] mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                </div>

                <h3 className="font-bold text-xs sm:text-sm text-[#1D1D1F] group-hover:text-emerald-700 transition-colors">
                  {item.name}
                </h3>
                <p className="text-[11px] text-[#86868B] mt-0.5 line-clamp-1">
                  {item.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-black/[0.04] flex items-center justify-between">
                <span className="font-extrabold text-xs sm:text-sm text-[#1D1D1F]">
                  {item.price}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 group-hover:underline">
                  Configurer →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. GUIDE DES MATIÈRES & FINITIONS (APPLE CRAFT)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-[32px] border border-black/[0.06] p-6 sm:p-10 shadow-sm">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              L'Art du Toucher
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1D1D1F]">
              Quel papier & finition choisir pour votre marque ?
            </h2>
            <p className="text-xs sm:text-sm text-[#86868B]">
              Le papier est le premier contact physique entre votre client et votre entreprise.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FINISHES_GUIDE.map((fg) => (
              <div
                key={fg.name}
                className="bg-[#F5F5F7] rounded-2xl p-6 border border-black/[0.04] hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`h-2.5 w-14 rounded-full bg-gradient-to-r ${fg.gradient} mb-4 shadow-2xs`} />
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                    {fg.badge}
                  </span>
                  <h3 className="font-bold text-[#1D1D1F] text-base mb-2">
                    {fg.name}
                  </h3>
                  <p className="text-xs text-[#86868B] leading-relaxed mb-4">
                    {fg.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/[0.05]">
                  <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block">Usage idéal :</span>
                  <span className="text-xs font-semibold text-[#1D1D1F] mt-0.5 block">{fg.ideal}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Coffret nuancier offert */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold shrink-0">
                <Palette size={22} />
              </div>
              <div>
                <h4 className="font-bold text-[#1D1D1F] text-sm">Vous hésitez encore sur la texture du papier ?</h4>
                <p className="text-xs text-slate-600">Commandez gratuitement notre nuancier d’échantillons imprimés livré à votre adresse.</p>
              </div>
            </div>

            <Link
              href="/contact?sujet=echantillons"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shrink-0 active:scale-95"
            >
              Demander le nuancier gratuit →
            </Link>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. AVIS CLIENTS VÉRIFIÉS (STYLE TRUSTPILOT 5 ÉTOILES)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-10 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-1">
              Preuve Sociale & Témoignages
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1D1D1F]">
              Ce que disent nos clients au Burkina
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex text-emerald-500 text-sm">
              {'★★★★★'.split('').map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <span className="text-xs font-bold text-[#1D1D1F]">4.9 / 5 sur 1 240+ avis</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-emerald-500 text-sm">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span className="text-[11px] text-[#86868B]">{rev.date}</span>
                </div>

                <p className="text-[11px] font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md mb-3 inline-block">
                  Achat : {rev.product}
                </p>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-5">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#1D1D1F]">{rev.name}</h4>
                  <p className="text-[11px] text-[#86868B]">{rev.role} · {rev.city}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Vérifié
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. BLOC CONFIANCE ATELIER & PROMESSE (HELLOPRINT STYLE)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-8 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Équipe à votre écoute */}
          <div className="bg-emerald-900 text-white rounded-[28px] p-7 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-1">
                Conseil Technique Direct
              </span>
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                Une équipe d’imprimeurs à votre écoute
              </h3>
              <p className="text-xs text-emerald-100 mt-2 leading-relaxed max-w-md">
                Un doute sur la résolution 300 DPI, les fonds perdus ou le type de papier ? Nos techniciens pré-presse sont joignables directement par téléphone et WhatsApp.
              </p>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="px-5 py-2.5 bg-white text-emerald-950 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              >
                <Phone size={13} /> Parler à un conseiller
              </Link>
              <Link
                href="/devis"
                className="px-4 py-2.5 bg-emerald-950/60 hover:bg-emerald-950 text-white font-semibold text-xs rounded-xl border border-emerald-500/40 transition-all"
              >
                Déposer un fichier pour contrôle
              </Link>
            </div>
          </div>

          {/* Nos engagements */}
          <div className="bg-slate-900 text-white rounded-[28px] p-7 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Sérénité Garantie
              </span>
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                Nos 3 Promesses d’Atelier
              </h3>
              <div className="space-y-2.5 mt-3 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                  <span><strong>Satisfait ou Réimprimé</strong> en cas de défaut d’atelier.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                  <span><strong>BAT numérique 300 DPI gratuit</strong> validé avant impression.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                  <span><strong>Facture normalisée DGI</strong> délivrée avec IFU et TVA.</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/entreprises"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white transition-colors"
              >
                En savoir plus sur nos garanties d’entreprise →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          11. BANNIÈRE NEWSLETTER (STYLE HELLOPRINT EMAIL ACQUISITION)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-10 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-[32px] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="inline-block bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
              🎁 Bon d'Achat Offert
            </span>
            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white">
              Inscrivez-vous et recevez 5 000 FCFA de remise
            </h3>
            <p className="text-xs text-emerald-100 max-w-md">
              Restez informé de nos nouveaux papiers, promotions flash et offres exclusives pour professionnels.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
            <input
              type="email"
              placeholder="Votre adresse email professionnelle"
              className="px-4 py-3 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm outline-none min-w-[260px] font-medium"
            />
            <button
              type="button"
              className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95"
            >
              M'inscrire
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          12. SEO CONTENT FOOTER (STYLE HELLOPRINT EXPLICATIF)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 px-4 md:px-6 max-w-7xl mx-auto border-t border-black/[0.06] text-xs text-slate-500 leading-relaxed">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Cartes & Papeterie</h4>
            <ul className="space-y-1 text-[11px]">
              <li><Link href="/catalogue/cartes" className="hover:text-emerald-700">Cartes de visite 350g</Link></li>
              <li><Link href="/catalogue/cartes" className="hover:text-emerald-700">Cartes Soft Touch velours</Link></li>
              <li><Link href="/catalogue/cartes" className="hover:text-emerald-700">Cartes Vernis 3D en relief</Link></li>
              <li><Link href="/catalogue/papeterie" className="hover:text-emerald-700">Têtes de lettre & Enveloppes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Flyers & Dépliants</h4>
            <ul className="space-y-1 text-[11px]">
              <li><Link href="/catalogue/flyers" className="hover:text-emerald-700">Flyers A6 promotionnels</Link></li>
              <li><Link href="/catalogue/flyers" className="hover:text-emerald-700">Flyers A5 événementiels</Link></li>
              <li><Link href="/catalogue/flyers" className="hover:text-emerald-700">Dépliants 3 volets 135g/170g</Link></li>
              <li><Link href="/catalogue/brochures" className="hover:text-emerald-700">Brochures agrafées A4</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Grand Format & Salons</h4>
            <ul className="space-y-1 text-[11px]">
              <li><Link href="/catalogue/roll-up" className="hover:text-emerald-700">Roll-up Pro 85×200cm</Link></li>
              <li><Link href="/catalogue/signaletique" className="hover:text-emerald-700">Bâches PVC avec œillets</Link></li>
              <li><Link href="/catalogue/affiches" className="hover:text-emerald-700">Affiches grand format A0/A1</Link></li>
              <li><Link href="/catalogue/evenementiel" className="hover:text-emerald-700">Photocalls & Totems</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Textile & Objets VIP</h4>
            <ul className="space-y-1 text-[11px]">
              <li><Link href="/catalogue/textile" className="hover:text-emerald-700">Polos piqué brodés 220g</Link></li>
              <li><Link href="/catalogue/textile" className="hover:text-emerald-700">T-shirts sérigraphiés 190g</Link></li>
              <li><Link href="/catalogue/goodies" className="hover:text-emerald-700">Stylos métalliques gravés</Link></li>
              <li><Link href="/catalogue/goodies" className="hover:text-emerald-700">Tote bags coton bio</Link></li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/[0.05] space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">
            YopoePrint — L’imprimerie industrielle en ligne de référence au Burkina Faso
          </h3>
          <p>
            YopoePrint est la première plateforme d'impression professionnelle en ligne au Burkina Faso. De Ouagadougou à Bobo-Dioulasso et dans les 45 provinces, nous accompagnons les entreprises, PME, institutions, agences de communication et créateurs dans la production de leurs supports de communication papier, textile, grand format et cadeaux d'affaires.
          </p>
          <p>
            Bénéficiez d’un contrôle technique gratuit de vos fichiers (BAT 300 DPI), d'une facturation normalisée conforme aux exigences de la DGI avec IFU et TVA déductible, et de paiements sécurisés instantanés par Orange Money, Moov Money et virements d'affaires.
          </p>
        </div>
      </section>

    </div>
  )
}
