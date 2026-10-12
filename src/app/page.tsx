'use client'

import { useState, useMemo } from 'react'
import { usePopularProducts } from '@/hooks/useProducts'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, ShieldCheck, Clock, Star, Truck, Building2,
  CheckCircle2, FileCheck, Calculator, Award, Layers,
  Check, ShoppingCart, Search, Zap, Copy, CheckCheck,
  Flame, Phone, Mail, HelpCircle, Tag, Gift, Printer,
  Briefcase, ChevronRight, Percent, ThumbsUp, Sparkles,
  Package, CheckCircle
} from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { PRODUCTS } from '@/lib/data'

// ── 1. Données du Calculateur Express Helloprint ─────────────────────────────
interface CalcProduct {
  id: string
  name: string
  spec: string
  leadTime: string
  popularQty: number
  quantities: number[]
  finishes: { id: string; label: string; desc: string; extra: number }[]
  pricing: Record<number, number>
  image: string
  slug: string
}

const CALC_PRODUCTS: Record<string, CalcProduct> = {
  cartes: {
    id: 'cartes',
    name: 'Cartes de Visite 85×55mm',
    spec: 'Papier Couché 350g · Recto/Verso Quadri',
    leadTime: 'Livrable en 24h à 48h',
    popularQty: 500,
    quantities: [100, 250, 500, 1000, 2500],
    finishes: [
      { id: 'standard', label: 'Couché Mat 350g Standard', desc: 'Rendu sobre & soigné', extra: 0 },
      { id: 'brillant', label: 'Pelliculage Brillant Intense', desc: 'Couleurs vives & éclatantes', extra: 1500 },
      { id: 'soft_touch', label: 'Pelliculage Soft Touch (Velours)', desc: 'Toucher soyeux de prestige', extra: 3000 },
      { id: 'vernis_3d', label: 'Vernis Sélectif 3D Relief', desc: 'Relief tactile haute précision', extra: 5000 },
    ],
    pricing: { 100: 4500, 250: 6500, 500: 10500, 1000: 17500, 2500: 36000 },
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop',
    slug: 'carte-de-visite-standard',
  },
  flyers: {
    id: 'flyers',
    name: 'Flyers A5 Commercial (14,8×21cm)',
    spec: 'Papier Couché 135g à 250g · Impression Quadri HD',
    leadTime: 'Livrable en 48h',
    popularQty: 1000,
    quantities: [250, 500, 1000, 2500, 5000],
    finishes: [
      { id: 'standard', label: 'Couché 135g Brillant (Éco)', desc: 'Idéal distribution de masse', extra: 0 },
      { id: 'mat_170', label: 'Couché 170g Satiné (Élégant)', desc: 'Tenue renforcée premium', extra: 2500 },
      { id: 'mat_250', label: 'Couché 250g Semi-Rigide', desc: 'Support cartonné d’exception', extra: 5000 },
    ],
    pricing: { 250: 9500, 500: 14000, 1000: 19500, 2500: 42000, 5000: 72000 },
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop',
    slug: 'flyer-a5-classique',
  },
  rollup: {
    id: 'rollup',
    name: 'Roll-Up Stand Pro 85×200cm',
    spec: 'Structure Aluminium + Housse matelassée incluse',
    leadTime: 'Prêt en 24h chrono',
    popularQty: 2,
    quantities: [1, 2, 5, 10],
    finishes: [
      { id: 'standard', label: 'Bâche PVC 440g Résistante', desc: 'Structure aluminium classique', extra: 0 },
      { id: 'deluxe', label: 'Bâche Anti-Reflet + Pied Lourd Deluxe', desc: 'Stabilité maximale pour salons', extra: 8000 },
    ],
    pricing: { 1: 28000, 2: 52000, 5: 120000, 10: 220000 },
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop',
    slug: 'kakemono-roll-up',
  },
  tshirts: {
    id: 'tshirts',
    name: 'T-Shirts 190g 100% Coton avec Logo',
    spec: 'Sérigraphie ou Broderie Cœur · Tailles S à 3XL',
    leadTime: 'Livrable en 48h à 72h',
    popularQty: 50,
    quantities: [10, 25, 50, 100, 250],
    finishes: [
      { id: 'standard', label: 'Sérigraphie 1 Couleur Face', desc: 'Encre textile haute résistance', extra: 0 },
      { id: 'quadri', label: 'Sérigraphie Quadri Complète', desc: 'Toutes les couleurs du logo', extra: 15000 },
      { id: 'broderie', label: 'Broderie Cœur Haute Précision', desc: 'Finition cousue indélébile', extra: 25000 },
    ],
    pricing: { 10: 45000, 25: 95000, 50: 175000, 100: 320000, 250: 725000 },
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
    slug: 't-shirt-personnalise',
  },
  bache: {
    id: 'bache',
    name: 'Bâche PVC 510g avec Œillets',
    spec: 'Micro-perforée ou Pleine · Spécial climat sahélien',
    leadTime: 'Atelier Ouaga · Prêt en 24h',
    popularQty: 2,
    quantities: [1, 2, 5, 10],
    finishes: [
      { id: 'standard', label: 'Format 2 × 1 mètre (2 m²)', desc: 'Œillets tous les 50cm', extra: 0 },
      { id: 'm3x1', label: 'Format 3 × 1 mètre (3 m²)', desc: 'Banderole promotionnelle', extra: 6500 },
      { id: 'm4x2', label: 'Format 4 × 2 mètres (8 m²)', desc: 'Grand affichage de façade', extra: 32000 },
    ],
    pricing: { 1: 13000, 2: 24000, 5: 55000, 10: 98000 },
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
    slug: 'affiche-a3-premium',
  },
}

// ── 2. Les 8 Catégories Phares (Photos d'Atelier, Zéro Emojis) ───────────────
const CATEGORIES_GRID = [
  {
    name: 'Cartes de Visite',
    spec: 'Standard, Carrées, Soft Touch, Vernis 3D',
    price: 'Dès 12 500 FCFA',
    href: '/catalogue/cartes',
    img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Flyers & Dépliants',
    spec: 'A6, A5, A4, Dépliants 2 et 3 volets',
    price: 'Dès 8 500 FCFA',
    href: '/catalogue/flyers',
    img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Roll-ups & Salons',
    spec: 'Enrouleurs alu, Photocalls, Stands SIAO',
    price: 'Dès 28 000 FCFA',
    href: '/catalogue/roll-up',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Affiches & Bâches',
    spec: 'A3, A2, A1, Bâches œillets 510g, Panneaux',
    price: 'Dès 6 500 FCFA',
    href: '/catalogue/signaletique',
    img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Brochures & Catalogues',
    spec: 'Agrafées, Dos carré collé, Reliure Wire-O',
    price: 'Dès 45 000 FCFA',
    href: '/catalogue/brochures',
    img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Textile Pro & Vêtements',
    spec: 'T-shirts coton 190g, Polos piqué, Casquettes',
    price: 'Dès 3 500 FCFA',
    href: '/catalogue/textile',
    img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Goodies & Cadeaux VIP',
    spec: 'Stylos laser, Mugs, Gourdes inox, Carnets',
    price: 'Dès 450 FCFA',
    href: '/catalogue/goodies',
    img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Packaging & Sacs Kraft',
    spec: 'Sacs boutiques, Boîtes carton, Stickers',
    price: 'Dès 450 FCFA',
    href: '/catalogue/sacs',
    img: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=500&auto=format&fit=crop',
  },
]

// ── 3. Spécial Salons & Événements (Bloc Helloprint Signature) ───────────────
const EXPO_STAND_PACKS = [
  {
    title: 'Roll-Up Deluxe Aluminium 85×200cm',
    spec: 'Pied lourd renforcé, bâche Ferrari anti-reflet, housse',
    price: '38 000 FCFA',
    badge: 'Indispensable',
    href: '/catalogue/roll-up',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=400&auto=format&fit=crop',
  },
  {
    title: 'Photocall Mur d’Image Textile 3×2,3m',
    spec: 'Structure parapluie autoportante, tissu infroissable',
    price: '185 000 FCFA',
    badge: 'Grand Format',
    href: '/catalogue/evenementiel',
    img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=400&auto=format&fit=crop',
  },
  {
    title: 'Comptoir d’Accueil Pliable Personnalisé',
    spec: 'Tablette bois thermoformée, visuel imprimé lavable',
    price: '65 000 FCFA',
    badge: 'Accueil Pro',
    href: '/catalogue/evenementiel',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop',
  },
  {
    title: '100 Badges Tours de Cou Satinés',
    spec: 'Ruban satin quadri 20mm, mousqueton métal + étui',
    price: '45 000 FCFA',
    badge: 'Sécurité VIP',
    href: '/catalogue/goodies',
    img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=400&auto=format&fit=crop',
  },
]

// ── 4. Guide des Papiers & Matières d'Atelier ─────────────────────────────────
const PAPERS_GUIDE = [
  {
    name: 'Couché Mat 350g',
    badge: 'Standard Cartes & Chemises',
    desc: 'Papier rigide de haute tenue, sans reflet gênant à la lumière. Parfait pour les cartes de visite et cartons d’invitation officiels.',
    usage: 'Cartes de visite, chemises à rabats, intercalaires',
  },
  {
    name: 'Couché Brillant 135g & 170g',
    badge: 'Idéal Flyers & Dépliants',
    desc: 'Rendu éclatant mettant en valeur les photographies et couleurs vives. Excellente prise en main pour les prospectus de masse.',
    usage: 'Flyers promotionnels, dépliants 3 volets, affiches A3',
  },
  {
    name: 'Pelliculage Soft Touch (Velours)',
    badge: 'Finition Signature Luxe',
    desc: 'Film thermique mat extra-doux au toucher semblable à la peau de pêche. Anti-traces de doigts et résistant aux frottements.',
    usage: 'Cartes de dirigeants, packagings cosmétiques, menus VIP',
  },
  {
    name: 'Bâche PVC 510g avec Œillets',
    badge: 'Signalétique Extérieure',
    desc: 'Toile enduite ultra-résistante au vent et aux fortes chaleurs sahéliennes. Encres Latex écologiques garanties 3 ans sans décoloration.',
    usage: 'Banderoles chantiers, façades d’immeubles, foires SIAO',
  },
]

// ── 5. Avis Clients d'Entreprises Vérifiés ───────────────────────────────────
const VERIFIED_REVIEWS = [
  {
    name: 'Salimata Kaboré',
    role: 'Responsable Communication, Agence Sahel Media',
    city: 'Ouagadougou',
    rating: 5,
    date: 'Commande du 04 Octobre',
    order: '2 500 Dépliants 3 volets + 2 Roll-ups Deluxe',
    text: 'Commande envoyée avec nos fichiers PDF. Le studio PAO de YopoePrint a corrigé nos fonds perdus et validé le BAT en 45 minutes. Livraison reçue le surlendemain à notre agence de Ouaga 2000. Rendu des couleurs parfait.',
  },
  {
    name: 'Ibrahim Ouedraogo',
    role: 'Directeur Général, Faso BTP & Industrie',
    city: 'Bobo-Dioulasso',
    rating: 5,
    date: 'Commande du 28 Septembre',
    order: '1 000 Cartes de visite Soft Touch + 5 Bâches 3×1m',
    text: 'La finition velours des cartes est tout simplement remarquable. Les factures normalisées avec mentions IFU et TVA ont été reçues immédiatement par email pour notre service comptabilité.',
  },
  {
    name: 'Fatimata Diallo',
    role: 'Coordinatrice Événementielle ONG',
    city: 'Ouagadougou',
    rating: 5,
    date: 'Commande du 22 Septembre',
    order: '50 T-shirts sérigraphiés + 100 Badges tours de cou',
    text: 'Paiement simple via Orange Money sans frais cachés. Les délais de fabrication ont été scrupuleusement respectés pour notre séminaire régional. C’est désormais notre imprimeur de référence.',
  },
]

export default function StorefrontHomePage() {
  const { addItem, openCart } = useCart()
  const { products: apiProducts } = usePopularProducts()

  // Calculateur Express state
  const [calcProdKey, setCalcProdKey] = useState<string>('cartes')
  const currentCalc = CALC_PRODUCTS[calcProdKey]
  const [selectedQty, setSelectedQty] = useState<number>(currentCalc.popularQty)
  const [selectedFinish, setSelectedFinish] = useState<string>(currentCalc.finishes[0].id)
  const [copiedPromo, setCopiedPromo] = useState(false)
  const [bestsellerTab, setBestsellerTab] = useState<'all' | 'cartes' | 'flyers' | 'grand_format' | 'textile'>('all')

  // Changement de produit dans le calculateur
  const handleSelectCalcProduct = (key: string) => {
    setCalcProdKey(key)
    const prod = CALC_PRODUCTS[key]
    setSelectedQty(prod.popularQty)
    setSelectedFinish(prod.finishes[0].id)
  }

  // Calcul du prix exact en FCFA
  const calcBasePrice = currentCalc.pricing[selectedQty] || currentCalc.pricing[currentCalc.quantities[0]] || 10000
  const activeFinishObj = currentCalc.finishes.find(f => f.id === selectedFinish)
  const finishExtra = activeFinishObj ? activeFinishObj.extra : 0
  const calculatedTotal = calcBasePrice + finishExtra
  const unitPrice = Math.round(calculatedTotal / selectedQty)

  // Ajout direct au panier depuis le calculateur
  const handleAddCalculatedToCart = () => {
    addItem({
      productId: currentCalc.id,
      productName: `${currentCalc.name} (${selectedQty} ex.)`,
      formatName: `${selectedQty} exemplaires · ${activeFinishObj?.label || 'Standard'}`,
      price: calculatedTotal,
      quantity: 1,
      options: {
        quantity: selectedQty,
        finish: activeFinishObj?.label,
        leadTime: currentCalc.leadTime,
      },
    })
    openCart()
  }

  // Copie du code promo
  const handleCopyPromo = () => {
    navigator.clipboard.writeText('YOPPRINT15')
    setCopiedPromo(true)
    setTimeout(() => setCopiedPromo(false), 2500)
  }

  // Liste des produits filtrés pour la grille
  const allAvailableProducts = apiProducts && apiProducts.length > 0 ? apiProducts : PRODUCTS
  const filteredProducts = useMemo(() => {
    if (bestsellerTab === 'all') return allAvailableProducts.slice(0, 8)
    return allAvailableProducts.filter((p: any) => {
      const c = (p.category || '').toLowerCase()
      const s = (p.slug || '').toLowerCase()
      if (bestsellerTab === 'cartes') return c.includes('carte') || s.includes('carte')
      if (bestsellerTab === 'flyers') return c.includes('flyer') || c.includes('brochure') || s.includes('flyer')
      if (bestsellerTab === 'grand_format') return c.includes('roll') || c.includes('signal') || c.includes('affiche') || s.includes('roll')
      if (bestsellerTab === 'textile') return c.includes('textile') || s.includes('t-shirt') || s.includes('polo')
      return true
    }).slice(0, 8)
  }, [allAvailableProducts, bestsellerTab])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">

      {/* ═════════════════════════════════════════════════════════════
          0. TOP PROMO BANNER COMMERCIAL
      ═════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-400">
              <Flame size={14} className="text-amber-400 shrink-0" />
              Offre Spéciale : -15% sur votre première commande
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-300">
              <Truck size={13} className="text-emerald-400" />
              Livraison offerte dès 75 000 FCFA à Ouaga et Bobo
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyPromo}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-md font-mono text-[11px] font-bold border border-white/15 transition-all cursor-pointer"
            >
              {copiedPromo ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>Code : <strong>YOPPRINT15</strong></span>
              {copiedPromo && <span className="text-emerald-400 font-sans text-[10px]">Copié !</span>}
            </button>

            <Link href="/entreprises" className="text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors hidden sm:inline">
              Facturation DGI Entreprises →
            </Link>
          </div>

        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          1. HERO COMMERCIAL HELLOPRINT (Bannière E-Commerce Pro)
      ═════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-200 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Colonne Gauche (8/12) : Bannière Principale */}
            <div className="lg:col-span-8 bg-slate-900 rounded-2xl p-6 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-sm">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-900/80" />

              <div className="relative z-10 max-w-xl space-y-4">
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  <Printer size={13} />
                  Imprimerie Industrielle en Ligne au Burkina Faso
                </span>

                <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
                  Vos imprimés professionnels, configurés en 3 minutes.
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  Cartes de visite, flyers, roll-ups de salons, bâches et textile d’équipe. 
                  Tarifs dégressifs directs usine en FCFA, <strong>BAT 300 DPI gratuit</strong> et livraison express à votre bureau.
                </p>
              </div>

              <div className="relative z-10 pt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/catalogue"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <span>Commander en ligne</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/devis"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base px-5 py-3.5 rounded-xl border border-white/20 transition-all flex items-center gap-2"
                >
                  <Calculator size={16} />
                  <span>Demander un devis sur mesure</span>
                </Link>
              </div>

              {/* Rassurance immédiate en bas de bannière */}
              <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-400" /> Fichiers vérifiés par nos graphistes
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-400" /> Expédié sous 24h à 48h
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-400" /> Facturation DGI avec IFU & TVA
                </span>
              </div>
            </div>

            {/* Colonne Droite (4/12) : 2 Encarts Campagnes Empilés */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              
              {/* Encart 1 : Spécial Salons SIAO / SNC */}
              <Link
                href="/catalogue/roll-up"
                className="flex-1 bg-amber-50 border border-amber-200/80 rounded-2xl p-5 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-600 text-white">
                      Événementiel & Salons
                    </span>
                    <span className="text-xs font-bold text-amber-900 font-mono">Dès 28 000 F</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-amber-800 transition-colors">
                    Packs Stands SIAO & Foires Pro
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Roll-ups alu, photocalls parapluie 3×2m, comptoirs d’accueil et badges tours de cou satinés.
                  </p>
                </div>
                <div className="pt-3 flex items-center text-xs font-bold text-amber-800 group-hover:translate-x-1 transition-transform">
                  <span>Voir le matériel de stand</span>
                  <ArrowRight size={14} className="ml-1" />
                </div>
              </Link>

              {/* Encart 2 : Packaging Kraft & Sacs Boutiques */}
              <Link
                href="/catalogue/sacs"
                className="flex-1 bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-700 text-white">
                      Boutiques & E-Commerce
                    </span>
                    <span className="text-xs font-bold text-emerald-900 font-mono">Dès 450 F / sac</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors">
                    Sacs Shopping Kraft & Stickers Bobines
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Personnalisez vos emballages et pochettes aux couleurs exactes de votre charte de marque.
                  </p>
                </div>
                <div className="pt-3 flex items-center text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition-transform">
                  <span>Découvrir le packaging</span>
                  <ArrowRight size={14} className="ml-1" />
                </div>
              </Link>

            </div>

          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          2. BANDEAU DE RÉASSURANCE HELLOPRINT (4 Piliers Concrets)
      ═════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <FileCheck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">BAT Pré-Presse Gratuit</h4>
                <p className="text-xs text-slate-500 mt-0.5">Audit 300 DPI & fonds perdus offert sur chaque commande.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Délais Respectés 24/48h</h4>
                <p className="text-xs text-slate-500 mt-0.5">Production en atelier à Ouaga et expéditions suivies.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <Building2 size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Facturation Conforme DGI</h4>
                <p className="text-xs text-slate-500 mt-0.5">Factures normalisées avec mentions IFU et TVA incluses.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Satisfait ou Réimprimé</h4>
                <p className="text-xs text-slate-500 mt-0.5">Garantie stricte de conformité colorimétrique FOGRA39.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          3. GRILLE DES CATÉGORIES POPULAIRES (Standard Helloprint)
      ═════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                Catalogue Général
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
                Choisissez votre catégorie d'impression
              </h2>
            </div>
            <Link
              href="/catalogue"
              className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
            >
              <span>Voir tout le catalogue (200+ références)</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {CATEGORIES_GRID.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-emerald-600 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={cat.img}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {cat.spec}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 font-mono text-[11px] sm:text-xs">
                      {cat.price}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Configurer →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          4. CALCULATEUR DE PRIX INSTANTANÉ (L'arme n°1 de Helloprint)
      ═════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          <div className="max-w-3xl mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Calculator size={13} /> Chiffrage En Ligne Immédiat
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
              Calculez votre prix exact en 3 clics
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Pas besoin d'attendre un devis par email. Sélectionnez vos options et découvrez immédiatement le montant de votre tirage en FCFA.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            
            {/* Étape 1 : Onglets de choix de produit */}
            <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-slate-200">
              {Object.keys(CALC_PRODUCTS).map((key) => {
                const prod = CALC_PRODUCTS[key]
                const isActive = calcProdKey === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectCalcProduct(key)}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {prod.name.split(' (')[0]}
                  </button>
                )
              })}
            </div>

            {/* Étape 2 : Sélecteur de Quantité & Finition */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                
                {/* Quantité */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    1. Choisissez le tirage (Tarifs dégressifs) :
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {currentCalc.quantities.map((q) => {
                      const isSel = selectedQty === q
                      return (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setSelectedQty(q)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer border ${
                            isSel
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-400'
                          }`}
                        >
                          {new Intl.NumberFormat('fr-FR').format(q)} ex.
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Finitions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    2. Choisissez le papier ou la finition :
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentCalc.finishes.map((f) => {
                      const isSel = selectedFinish === f.id
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSelectedFinish(f.id)}
                          className={`p-3 rounded-xl text-left transition-all cursor-pointer border ${
                            isSel
                              ? 'bg-emerald-50/80 border-emerald-600 ring-1 ring-emerald-600'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-slate-900">{f.label}</span>
                            {f.extra > 0 && (
                              <span className="text-[10px] font-bold text-emerald-700 font-mono">
                                +{new Intl.NumberFormat('fr-FR').format(f.extra)} F
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">{f.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

              </div>

              {/* Colonne Résumé Tarif & Commande Directe */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total TTC Garanti
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {currentCalc.leadTime}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="font-display font-black text-3xl text-slate-900 font-mono leading-none">
                    {new Intl.NumberFormat('fr-FR').format(calculatedTotal)} <span className="text-sm font-sans font-bold text-slate-600">FCFA</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Soit <strong>{unitPrice} FCFA</strong> par exemplaire
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="flex items-center gap-1.5 font-medium">
                    <Check size={14} className="text-emerald-600" /> Produit : {currentCalc.name}
                  </p>
                  <p className="flex items-center gap-1.5 font-medium">
                    <Check size={14} className="text-emerald-600" /> Quantité : {new Intl.NumberFormat('fr-FR').format(selectedQty)} exemplaires
                  </p>
                  <p className="flex items-center gap-1.5 font-medium">
                    <Check size={14} className="text-emerald-600" /> Finition : {activeFinishObj?.label}
                  </p>
                  <p className="flex items-center gap-1.5 font-medium">
                    <Check size={14} className="text-emerald-600" /> Contrôle PAO 300 DPI inclus
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddCalculatedToCart}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart size={16} />
                  <span>Ajouter au panier ({new Intl.NumberFormat('fr-FR').format(calculatedTotal)} F)</span>
                </button>

                <p className="text-[10px] text-center text-slate-400 mt-3">
                  Paiement sécurisé Orange Money, Moov Money ou Virement DGI
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          5. GRILLE DES BESTSELLERS DE L'ATELIER (Fiches E-Commerce)
      ═════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                Produits Populaires
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
                Les meilleures ventes de nos clients
              </h2>
            </div>

            {/* Onglets de filtrage propres */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'Tout voir' },
                { id: 'cartes', label: 'Cartes' },
                { id: 'flyers', label: 'Flyers' },
                { id: 'grand_format', label: 'Roll-ups & Bâches' },
                { id: 'textile', label: 'Textile' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setBestsellerTab(tab.id as any)}
                  className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    bestsellerTab === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((prod: any) => (
              <ProductCard key={prod.slug || prod.id} product={prod} />
            ))}
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          6. SALONS & ÉVÉNEMENTS (Bloc Signature Helloprint)
      ═════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Bannière Stand à gauche */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden shadow-sm">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />

              <div className="relative z-10 space-y-4">
                <span className="inline-block px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950">
                  Spécial Salons SIAO & Foires
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-black text-white leading-tight">
                  Équipez votre stand d’exposition en toute sérénité.
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Tous les supports visuels indispensables pour marquer les esprits lors des salons professionnels, forums d’affaires et conférences internationales.
                </p>
              </div>

              <div className="relative z-10 pt-8">
                <Link
                  href="/entreprises"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-md active:scale-95"
                >
                  <span>Configurer un pack stand sur mesure</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* 4 Produits phares salons à droite */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EXPO_STAND_PACKS.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-white mb-3">
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        sizes="300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-white">
                        {item.badge}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {item.spec}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 font-mono">
                      {item.price}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
                      Configurer →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          7. GUIDE DES MATIÈRES & PAPIERS D'ATELIER (Pédagogie Pro)
      ═════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1 block">
              Savoir-Faire Atelier
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
              Guide des papiers & finitions d'impression
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Chaque papier confère une tenue et une émotion distincte à vos supports. Découvrez les matières travaillées dans notre atelier.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PAPERS_GUIDE.map((mat) => (
              <div
                key={mat.name}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md mb-3 border border-emerald-100">
                    {mat.badge}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mb-1.5">
                    {mat.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {mat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-900">Usages :</span> {mat.usage}
                </div>
              </div>
            ))}
          </div>

          {/* Coffret d'échantillons gratuit pour les entreprises */}
          <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                <Package size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Vous souhaitez toucher les papiers avant de commander ?
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Recevez notre nuancier complet avec échantillons de Couché Mat, Soft Touch, Kraft et Vernis 3D livré gratuitement à votre entreprise.
                </p>
              </div>
            </div>

            <Link
              href="/contact?sujet=echantillons"
              className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all"
            >
              Commander le nuancier d'échantillons gratuit →
            </Link>
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          8. AVIS CLIENTS VÉRIFIÉS (Standard Trustpilot / Avis Faso)
      ═════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex text-amber-400 text-sm leading-none">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-900">4.8 / 5 sur 840 avis vérifiés</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
                Ce que nos clients entreprises disent de nous
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Avis certifiés après validation de commande et livraison d'atelier.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VERIFIED_REVIEWS.map((rev) => (
              <div
                key={rev.name}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex text-amber-500 text-xs">
                      {'★'.repeat(rev.rating)}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{rev.date}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed mb-4 italic">
                    "{rev.text}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-900">{rev.name}</p>
                      <p className="text-[11px] text-slate-500">{rev.role}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {rev.city}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Commande : {rev.order}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          9. ATELIER OUAGADOUGOU & HOTLINE ASSISTANCE
      ═════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Phone size={14} /> Assistance Technique & Équipe Commerciale
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-black text-white leading-tight">
                Besoin d'un conseil d'imprimeur sur vos fichiers ou vos formats ?
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Notre studio pré-presse et notre service commercial à Ouagadougou vous accompagnent par téléphone ou sur WhatsApp. 
                Réponse et analyse de vos maquettes sous 2 heures ouvrées.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-300">
                <span>📍 Atelier Gounghin & Showroom Ouaga 2000</span>
                <span>⏰ Lundi au Samedi : 08h00 — 18h30</span>
                <span>📞 Hotline : +226 70 00 00 00</span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <a
                href="https://wa.me/22670000000?text=Bonjour%20YopoePrint,%20je%20souhaite%20un%20renseignement%20pour%20une%20commande%20d'impression."
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 text-center flex items-center justify-center gap-2"
              >
                <Phone size={16} />
                <span>Échanger sur WhatsApp (+226)</span>
              </a>

              <Link
                href="/devis"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl border border-white/20 transition-all text-center flex items-center justify-center gap-2"
              >
                <Calculator size={16} />
                <span>Déposer une demande de devis</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
