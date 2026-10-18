'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, ShieldCheck, Clock, Truck, Building2,
  CheckCircle2, FileCheck, Calculator, Award, Layers,
  Check, ShoppingCart, Search, Zap, Copy, CheckCheck,
  Flame, Phone, Mail, HelpCircle, Tag, Gift, Printer,
  Briefcase, ChevronRight, ChevronLeft, Percent, ThumbsUp, Sparkles,
  Package, CheckCircle, Plus, Timer, ShoppingBag
} from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { bannersService, BannerSlide, DEFAULT_BANNERS } from '@/lib/banners.service'
import { ProductScrollRail } from '@/components/product/ProductScrollRail'
import { CONTACT_PHONE_DISPLAY, WHATSAPP_URL } from '@/lib/contact'

// ── 0.1 Ventes Flash de l'Imprimerie (Jumia Style) ──────────────────────────
interface FlashSaleItem {
  id: string
  title: string
  spec: string
  qty: number
  price: number
  image: string
  href: string
}

const FLASH_SALE_ITEMS: FlashSaleItem[] = [
  {
    id: 'flash-cartes-dorure',
    title: 'Cartes de Visite 350g Dorure à Chaud',
    spec: '500 cartes · 85×55mm · Soft Touch',
    qty: 500,
    price: 10500,
    image: '/images/products/cartes-visite.jpg',
    href: '/catalogue/cartes',
  },
  {
    id: 'flash-rollup-alu',
    title: 'Roll-Up Stand Aluminium 85×200cm',
    spec: 'Structure alu renforcée + Housse + Bâche HD',
    qty: 1,
    price: 28000,
    image: '/images/products/rollup-salons.jpg',
    href: '/catalogue/roll-up',
  },
  {
    id: 'flash-flyers-a5',
    title: 'Flyers A5 Quadri Recto/Verso (1 000 ex.)',
    spec: 'Papier couché 135g · Impression HD offset',
    qty: 1000,
    price: 19500,
    image: '/images/products/flyers-depliants.jpg',
    href: '/catalogue/flyers',
  },
  {
    id: 'flash-sacs-kraft',
    title: 'Sacs Shopping Kraft avec Logo (Lot 100)',
    spec: 'Kraft brun résistant · Poignées torsadées',
    qty: 100,
    price: 36000,
    image: '/images/products/packaging-kraft.jpg',
    href: '/catalogue/sacs',
  },
  {
    id: 'flash-bache-pro',
    title: 'Bâche Publicitaire HD 510g (3×1m)',
    spec: 'Oeillets métalliques tous les 50cm · Anti-UV',
    qty: 1,
    price: 22500,
    image: '/images/products/affiches-baches.jpg',
    href: '/catalogue/baches',
  },
  {
    id: 'flash-textile-polo',
    title: 'Polos & T-Shirts Sérigraphiés (Lot 20)',
    spec: 'Coton 190g premium · Marquage poitrine',
    qty: 20,
    price: 48000,
    image: '/images/products/textile-pro.jpg',
    href: '/catalogue/textile',
  },
]

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
    image: '/images/products/cartes-visite.jpg',
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
    image: '/images/products/flyers-depliants.jpg',
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
    image: '/images/products/rollup-salons.jpg',
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
    image: '/images/products/textile-pro.jpg',
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
    image: '/images/products/affiches-baches.jpg',
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
    img: '/images/products/cartes-visite.jpg',
  },
  {
    name: 'Flyers & Dépliants',
    spec: 'A6, A5, A4, Dépliants 2 et 3 volets',
    price: 'Dès 8 500 FCFA',
    href: '/catalogue/flyers',
    img: '/images/products/flyers-depliants.jpg',
  },
  {
    name: 'Roll-ups & Salons',
    spec: 'Enrouleurs alu, Photocalls, Stands SIAO',
    price: 'Dès 28 000 FCFA',
    href: '/catalogue/roll-up',
    img: '/images/products/rollup-salons.jpg',
  },
  {
    name: 'Affiches & Bâches',
    spec: 'A3, A2, A1, Bâches œillets 510g, Panneaux',
    price: 'Dès 6 500 FCFA',
    href: '/catalogue/signaletique',
    img: '/images/products/affiches-baches.jpg',
  },
  {
    name: 'Brochures & Catalogues',
    spec: 'Agrafées, Dos carré collé, Reliure Wire-O',
    price: 'Dès 45 000 FCFA',
    href: '/catalogue/brochures',
    img: '/images/products/brochures-catalogues.jpg',
  },
  {
    name: 'Textile Pro & Vêtements',
    spec: 'T-shirts coton 190g, Polos piqué, Casquettes',
    price: 'Dès 3 500 FCFA',
    href: '/catalogue/textile',
    img: '/images/products/textile-pro.jpg',
  },
  {
    name: 'Goodies & Cadeaux VIP',
    spec: 'Stylos laser, Mugs, Gourdes inox, Carnets',
    price: 'Dès 450 FCFA',
    href: '/catalogue/goodies',
    img: '/images/products/goodies-vip.jpg',
  },
  {
    name: 'Packaging & Sacs Kraft',
    spec: 'Sacs boutiques, Boîtes carton, Stickers',
    price: 'Dès 450 FCFA',
    href: '/catalogue/sacs',
    img: '/images/products/packaging-kraft.jpg',
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
    img: '/images/products/rollup-salons.jpg',
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
    img: '/images/products/goodies-vip.jpg',
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
export default function StorefrontHomePage() {
  const router = useRouter()

  // Calculateur Express state
  const [calcProdKey, setCalcProdKey] = useState<string>('cartes')
  const currentCalc = CALC_PRODUCTS[calcProdKey]
  const [selectedQty, setSelectedQty] = useState<number>(currentCalc.popularQty)
  const [selectedFinish, setSelectedFinish] = useState<string>(currentCalc.finishes[0].id)
  const [copiedPromo, setCopiedPromo] = useState(false)

  // Bannières Dynamiques Carrousel Hero (Uploadées depuis le Backoffice)
  const [banners, setBanners] = useState<BannerSlide[]>(DEFAULT_BANNERS)
  const [heroSlide, setHeroSlide] = useState(0)
  const [isCarouselHovered, setIsCarouselHovered] = useState(false)

  // Chargement asynchrone des bannières publiées par le backoffice métier
  useEffect(() => {
    let isMounted = true
    bannersService.getActiveBanners().then((loadedBanners) => {
      if (isMounted && loadedBanners && loadedBanners.length > 0) {
        setBanners(loadedBanners)
      }
    })
    return () => { isMounted = false }
  }, [])

  // Rotation automatique du carrousel (5.5 secondes) : en pause au survol ou au focus clavier,
  // et désactivée si l'utilisateur a demandé moins d'animations
  useEffect(() => {
    if (isCarouselHovered || banners.length <= 1) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const slideTimer = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % banners.length)
    }, 5500)
    return () => clearInterval(slideTimer)
  }, [isCarouselHovered, banners.length])

  // Les offres flash ne sont pas des produits commandables tels quels :
  // on renvoie vers la page où le client configure et dépose son fichier
  const handleQuickAddFlash = (e: React.MouseEvent, item: FlashSaleItem) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(item.href)
  }

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

  // Le calculateur donne une estimation : la commande se finalise sur la fiche produit
  const handleAddCalculatedToCart = () => {
    router.push(`/produit/${currentCalc.slug}`)
  }

  // Copie du code promo
  const handleCopyPromo = () => {
    navigator.clipboard.writeText('YOPPRINT15')
    setCopiedPromo(true)
    setTimeout(() => setCopiedPromo(false), 2500)
  }


  return (
    <div className="min-h-screen bg-gray-100/70 text-gray-900 font-sans antialiased">

      {/* ═════════════════════════════════════════════════════════════
          1. GRANDE BANNIÈRE CARROUSEL HERO (1248 × 357 PX)
             Bannières visuelles graphiques uploadées depuis le Backoffice
      ═════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[1248px] mx-auto px-2 sm:px-4 pt-4 sm:pt-6 pb-3">
        {/* Proposition de valeur — texte réel (SEO, lecteurs d'écran), pas dans l'image */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 px-1 mb-3 sm:mb-4">
          <div>
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Imprimerie en ligne au Burkina Faso
            </h1>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Cartes de visite, flyers, roll-up et bâches imprimés à Ouagadougou. Prix en FCFA, BAT gratuit avant impression, livraison partout au Burkina.
            </p>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline shrink-0"
          >
            Voir le catalogue <ArrowRight size={15} />
          </Link>
        </div>

        <div
          className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-gray-200/60 bg-gray-200 group"
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
          onFocusCapture={() => setIsCarouselHovered(true)}
          onBlurCapture={() => setIsCarouselHovered(false)}
        >
          {/* Conteneur dimension standard e-commerce : 1248 × 357 px (plus haut sur mobile pour le texte) */}
          <div className="relative w-full h-[240px] sm:h-[280px] md:h-[357px] max-h-[357px] overflow-hidden">
            {banners.map((banner, idx) => {
              const isActive = heroSlide === idx
              return (
                <div
                  key={banner.id || idx}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                    isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <Link
                    href={banner.linkUrl || '/catalogue'}
                    className="block w-full h-full relative cursor-pointer"
                    tabIndex={isActive ? 0 : -1}
                    aria-hidden={!isActive}
                  >
                    <Image
                      src={banner.imageUrl}
                      alt={banner.ctaLabel ? '' : (banner.altText || banner.title || 'Bannière YopoePrint')}
                      fill
                      priority={idx === 0}
                      className="object-cover object-center w-full h-full"
                      sizes="(max-width: 1248px) 100vw, 1248px"
                    />
                    {banner.ctaLabel && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/85 via-gray-950/55 to-gray-950/0" />
                        <div className="absolute inset-0 flex flex-col justify-center gap-2 sm:gap-3 px-5 sm:px-10 md:px-14 max-w-[36rem]">
                          {banner.badge && (
                            <span className="self-start text-xs font-bold uppercase tracking-wider text-white bg-primary px-2.5 py-1 rounded-lg">
                              {banner.badge}
                            </span>
                          )}
                          <p className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
                            {banner.title}
                          </p>
                          {banner.subtitle && (
                            <p className="text-sm sm:text-base text-white/85 leading-snug">{banner.subtitle}</p>
                          )}
                          <span className="self-start mt-1 inline-flex items-center gap-1.5 bg-primary text-white text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-md group-hover:bg-primary/90 transition-colors">
                            {banner.ctaLabel} <ArrowRight size={16} />
                          </span>
                        </div>
                      </>
                    )}
                  </Link>
                </div>
              )
            })}

            {/* Boutons de navigation Précédent / Suivant (Desktop) */}
            {banners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setHeroSlide((prev) => (prev - 1 + banners.length) % banners.length)
                  }}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 hover:bg-black/75 text-white hidden sm:flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-lg active:scale-95"
                  aria-label="Bannière précédente"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setHeroSlide((prev) => (prev + 1) % banners.length)
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 hover:bg-black/75 text-white hidden sm:flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-lg active:scale-95"
                  aria-label="Bannière suivante"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Indicateurs de pagination Carrousel Externes (Style Jumia Mobile) */}
        {banners.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-2 pb-1">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setHeroSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  heroSlide === idx
                    ? 'w-5 h-1.5 bg-gray-900 shadow-xs'
                    : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Aller à la bannière ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ═════════════════════════════════════════════════════════════
          2. VENTES FLASH | CHAQUE JOUR (STYLE JUMIA PUR)
      ═════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2">
        {/* Bloc sombre neutre : la couleur d'action (vert) reste réservée aux boutons */}
        <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg text-white">
          
          {/* En-tête Ventes Flash */}
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h2 className="font-display text-base sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>Offres de l'atelier</span>
              </h2>
              <p className="text-xs text-white/80 mt-0.5">Prix de départ indicatifs, calculés au plus juste sur la fiche produit</p>

            </div>

            <Link
              href="/catalogue"
              className="shrink-0 inline-flex items-center gap-1 h-9 px-3.5 bg-white text-gray-900 hover:bg-gray-100 rounded-full font-bold text-xs shadow-sm transition-colors"
            >
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>

          {/* Rangée de Produits en Défilement Horizontal avec Boutons Fléchés Desktop & Swipe Mobile */}
          <ProductScrollRail trackClassName="gap-2.5 sm:gap-3">
            {FLASH_SALE_ITEMS.map((item) => (
              <div
                key={item.id}
                className="w-[148px] sm:w-[168px] md:w-[185px] shrink-0 snap-start bg-white text-gray-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between group transition-all"
              >
                {/* Zone Photo Produit */}
                <div className="relative aspect-square w-full bg-white p-2 flex items-center justify-center">
                  <Link href={item.href} className="relative w-full h-full block">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      sizes="185px"
                    />
                  </Link>

                  {/* Badge Atelier Top-Left (Style Jumia Express) */}
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-2xs font-extrabold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
                    Atelier
                  </span>

                  {/* Bouton Rond Noir (+) Style Jumia Mobile */}
                  <button
                    onClick={(e) => handleQuickAddFlash(e, item)}
                    className="absolute top-2 right-2 w-7 h-7 bg-gray-900/90 hover:bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md active:scale-90 transition-transform cursor-pointer"
                    title="Configurer"
                    aria-label={`Configurer ${item.title}`}
                  >
                    <Plus size={15} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Corps de Carte Produit */}
                <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1 gap-1">
                  {/* Titre Produit (2 lignes max) */}
                  <Link href={item.href}>
                    <h3 className="font-semibold text-2xs sm:text-xs text-gray-900 line-clamp-2 leading-tight hover:text-primary min-h-[30px]">
                      {item.title}
                    </h3>
                  </Link>

                  {/* Prix en FCFA & Réduction */}
                  <div className="pt-0.5">
                    <span className="text-2xs text-gray-500 font-medium block leading-none">Dès</span>
                    <div className="tabular-nums font-extrabold text-xs sm:text-sm text-gray-950">
                      {item.price.toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </ProductScrollRail>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          4. BANDEAU DE RÉASSURANCE HELLOPRINT (4 Piliers Concrets)
      ═════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <FileCheck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-gray-900">BAT Pré-Presse Gratuit</h4>
                <p className="text-xs text-gray-500 mt-0.5">Audit 300 DPI & fonds perdus offert sur chaque commande.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-gray-900">Délais Respectés 24/48h</h4>
                <p className="text-xs text-gray-500 mt-0.5">Production en atelier à Ouaga et expéditions suivies.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <Building2 size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-gray-900">Facturation Conforme DGI</h4>
                <p className="text-xs text-gray-500 mt-0.5">Factures normalisées avec mentions IFU et TVA incluses.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-gray-900">Satisfait ou Réimprimé</h4>
                <p className="text-xs text-gray-500 mt-0.5">Garantie stricte de conformité colorimétrique FOGRA39.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          3. GRILLE DES CATÉGORIES POPULAIRES (Standard Helloprint)
      ═════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                Catalogue Général
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900">
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
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-emerald-600 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
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
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-2xs text-gray-500 mt-0.5 line-clamp-1">
                      {cat.spec}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900 tabular-nums text-2xs sm:text-xs">
                      {cat.price}
                    </span>
                    <span className="text-2xs font-semibold text-emerald-700 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
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
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          <div className="max-w-3xl mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Calculator size={13} /> Chiffrage En Ligne Immédiat
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900">
              Calculez votre prix exact en 3 clics
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Pas besoin d'attendre un devis par email. Sélectionnez vos options et découvrez immédiatement le montant de votre tirage en FCFA.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8">
            
            {/* Étape 1 : Onglets de choix de produit */}
            <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-gray-200">
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
                        ? 'bg-gray-900 text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
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
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
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
                              ? 'bg-emerald-700 border-emerald-700 text-white shadow-xs'
                              : 'bg-white border-gray-200 text-gray-800 hover:border-gray-400'
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
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
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
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-gray-900">{f.label}</span>
                            {f.extra > 0 && (
                              <span className="text-2xs font-bold text-emerald-700 tabular-nums">
                                +{new Intl.NumberFormat('fr-FR').format(f.extra)} F
                              </span>
                            )}
                          </div>
                          <p className="text-2xs text-gray-500">{f.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

              </div>

              {/* Colonne Résumé Tarif & Commande Directe */}
              <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Total TTC Garanti
                  </span>
                  <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                    {currentCalc.leadTime}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="font-display font-extrabold text-3xl text-gray-900 tabular-nums leading-none">
                    {new Intl.NumberFormat('fr-FR').format(calculatedTotal)} <span className="text-sm font-sans font-bold text-gray-600">FCFA</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Soit <strong>{unitPrice} FCFA</strong> par exemplaire
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
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
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart size={16} />
                  <span>Configurer et commander</span>
                </button>

                <p className="text-2xs text-center text-gray-500 mt-3">
                  Paiement sécurisé Orange Money, Moov Money ou Virement DGI
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          6. SALONS & ÉVÉNEMENTS (Bloc Signature Helloprint)
      ═════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Bannière Stand à gauche */}
            <div className="lg:col-span-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden shadow-sm">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: `url('/images/products/rollup-salons.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/80 to-transparent" />

              <div className="relative z-10 space-y-4">
                <span className="inline-block px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-amber-500 text-gray-950">
                  Spécial Salons SIAO & Foires
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  Équipez votre stand d’exposition en toute sérénité.
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                  Tous les supports visuels indispensables pour marquer les esprits lors des salons professionnels, forums d’affaires et conférences internationales.
                </p>
              </div>

              <div className="relative z-10 pt-8">
                <Link
                  href="/entreprises"
                  className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-md active:scale-95"
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
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between group"
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
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-2xs font-bold bg-gray-900 text-white">
                        {item.badge}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-2xs text-gray-500 mt-1 line-clamp-2">
                      {item.spec}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900 tabular-nums">
                      {item.price}
                    </span>
                    <span className="text-2xs font-bold text-emerald-700 flex items-center gap-0.5">
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
      <section className="py-12 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1 block">
              Savoir-Faire Atelier
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900">
              Guide des papiers & finitions d'impression
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Chaque papier confère une tenue et une émotion distincte à vos supports. Découvrez les matières travaillées dans notre atelier.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PAPERS_GUIDE.map((mat) => (
              <div
                key={mat.name}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block text-2xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg mb-3 border border-emerald-100">
                    {mat.badge}
                  </span>
                  <h3 className="font-bold text-sm text-gray-900 mb-1.5">
                    {mat.name}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">
                    {mat.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 text-2xs text-gray-600">
                  <span className="font-semibold text-gray-900">Usages :</span> {mat.usage}
                </div>
              </div>
            ))}
          </div>

          {/* Coffret d'échantillons gratuit pour les entreprises */}
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                <Package size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  Vous souhaitez toucher les papiers avant de commander ?
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Recevez notre nuancier complet avec échantillons de Couché Mat, Soft Touch, Kraft et Vernis 3D livré gratuitement à votre entreprise.
                </p>
              </div>
            </div>

            <Link
              href="/contact?sujet=echantillons"
              className="shrink-0 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all"
            >
              Commander le nuancier d'échantillons gratuit →
            </Link>
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          9. ATELIER OUAGADOUGOU & HOTLINE ASSISTANCE
      ═════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Phone size={14} /> Assistance Technique & Équipe Commerciale
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                Besoin d'un conseil d'imprimeur sur vos fichiers ou vos formats ?
              </h2>
              <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
                Notre studio pré-presse et notre service commercial à Ouagadougou vous accompagnent par téléphone ou sur WhatsApp. 
                Réponse et analyse de vos maquettes sous 2 heures ouvrées.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-gray-300">
                <span>📍 Atelier Gounghin & Showroom Ouaga 2000</span>
                <span>⏰ Lundi au Samedi : 08h00 — 18h30</span>
                <span>📞 Hotline : {CONTACT_PHONE_DISPLAY}</span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <a
                href={`${WHATSAPP_URL}?text=Bonjour%20YopoePrint,%20je%20souhaite%20un%20renseignement%20pour%20une%20commande%20d'impression.`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 text-center flex items-center justify-center gap-2"
              >
                <Phone size={16} />
                <span>Échanger sur WhatsApp</span>
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
