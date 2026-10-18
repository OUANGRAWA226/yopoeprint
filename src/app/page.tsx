'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePopularProducts } from '@/hooks/useProducts'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, ShieldCheck, Clock, Star, Truck, Building2,
  CheckCircle2, FileCheck, Calculator, Award, Layers,
  Check, ShoppingCart, Search, Zap, Copy, CheckCheck,
  Flame, Phone, Mail, HelpCircle, Tag, Gift, Printer,
  Briefcase, ChevronRight, ChevronLeft, Percent, ThumbsUp, Sparkles,
  Package, CheckCircle, Plus, Timer, ShoppingBag
} from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { PRODUCTS } from '@/lib/data'
import { bannersService, BannerSlide, DEFAULT_BANNERS } from '@/lib/banners.service'
import { ProductScrollRail } from '@/components/product/ProductScrollRail'

// ── 0.1 Ventes Flash de l'Imprimerie (Jumia Style) ──────────────────────────
interface FlashSaleItem {
  id: string
  title: string
  spec: string
  qty: number
  price: number
  oldPrice: number
  discount: string
  rating: number
  reviewsCount: number
  stockCount: number
  stockPercent: number
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
    oldPrice: 14000,
    discount: '-25%',
    rating: 4.9,
    reviewsCount: 128,
    stockCount: 14,
    stockPercent: 78,
    image: '/images/products/cartes-visite.jpg',
    href: '/catalogue/cartes',
  },
  {
    id: 'flash-rollup-alu',
    title: 'Roll-Up Stand Aluminium 85×200cm',
    spec: 'Structure alu renforcée + Housse + Bâche HD',
    qty: 1,
    price: 28000,
    oldPrice: 35000,
    discount: '-20%',
    rating: 4.8,
    reviewsCount: 64,
    stockCount: 8,
    stockPercent: 84,
    image: '/images/products/rollup-salons.jpg',
    href: '/catalogue/roll-up',
  },
  {
    id: 'flash-flyers-a5',
    title: 'Flyers A5 Quadri Recto/Verso (1 000 ex.)',
    spec: 'Papier couché 135g · Impression HD offset',
    qty: 1000,
    price: 19500,
    oldPrice: 26000,
    discount: '-25%',
    rating: 4.9,
    reviewsCount: 95,
    stockCount: 22,
    stockPercent: 62,
    image: '/images/products/flyers-depliants.jpg',
    href: '/catalogue/flyers',
  },
  {
    id: 'flash-sacs-kraft',
    title: 'Sacs Shopping Kraft avec Logo (Lot 100)',
    spec: 'Kraft brun résistant · Poignées torsadées',
    qty: 100,
    price: 36000,
    oldPrice: 45000,
    discount: '-20%',
    rating: 4.7,
    reviewsCount: 42,
    stockCount: 9,
    stockPercent: 81,
    image: '/images/products/packaging-kraft.jpg',
    href: '/catalogue/sacs',
  },
  {
    id: 'flash-bache-pro',
    title: 'Bâche Publicitaire HD 510g (3×1m)',
    spec: 'Oeillets métalliques tous les 50cm · Anti-UV',
    qty: 1,
    price: 22500,
    oldPrice: 30000,
    discount: '-25%',
    rating: 4.8,
    reviewsCount: 51,
    stockCount: 12,
    stockPercent: 70,
    image: '/images/products/affiches-baches.jpg',
    href: '/catalogue/baches',
  },
  {
    id: 'flash-textile-polo',
    title: 'Polos & T-Shirts Sérigraphiés (Lot 20)',
    spec: 'Coton 190g premium · Marquage poitrine',
    qty: 20,
    price: 48000,
    oldPrice: 60000,
    discount: '-20%',
    rating: 4.9,
    reviewsCount: 38,
    stockCount: 6,
    stockPercent: 90,
    image: '/images/products/textile-pro.jpg',
    href: '/catalogue/textile',
  },
]

// ── 0.15 Top Bestsellers Rail (Style Jumia Top Ventes) ──────────────────────
interface RailProduct {
  id: string
  name: string
  category: string
  leadTime: string
  rating: number
  reviewsCount: number
  startingPrice: number
  unitDesc: string
  badge?: string
  badgeColor?: string
  image: string
  href: string
}

const TOP_BESTSELLERS_RAIL: RailProduct[] = [
  {
    id: 'rail-cartes-350g',
    name: 'Cartes de Visite 350g Couché Mat',
    category: 'Carterie Pro',
    leadTime: 'Livrable en 24h',
    rating: 4.9,
    reviewsCount: 184,
    startingPrice: 8500,
    unitDesc: 'les 250 cartes',
    badge: 'N°1 Ventes',
    badgeColor: 'bg-emerald-600',
    image: '/images/products/cartes-visite.jpg',
    href: '/catalogue/cartes',
  },
  {
    id: 'rail-flyers-a5',
    name: 'Flyers A5 Quadri Recto/Verso',
    category: 'Publicité Papier',
    leadTime: 'Livrable en 48h',
    rating: 4.8,
    reviewsCount: 142,
    startingPrice: 14000,
    unitDesc: 'les 500 flyers',
    badge: 'Populaire',
    badgeColor: 'bg-blue-600',
    image: '/images/products/flyers-depliants.jpg',
    href: '/catalogue/flyers',
  },
  {
    id: 'rail-rollup-stand',
    name: 'Roll-Up Stand Aluminium 85×200cm',
    category: 'Salons & Foires',
    leadTime: 'Prêt en 24h',
    rating: 4.9,
    reviewsCount: 96,
    startingPrice: 28000,
    unitDesc: 'structure + housse',
    badge: 'Événementiel',
    badgeColor: 'bg-purple-600',
    image: '/images/products/rollup-salons.jpg',
    href: '/catalogue/roll-up',
  },
  {
    id: 'rail-bache-510g',
    name: 'Bâche Publicitaire HD Oeillets 510g',
    category: 'Grand Format',
    leadTime: 'Livrable en 48h',
    rating: 4.8,
    reviewsCount: 68,
    startingPrice: 18500,
    unitDesc: 'dès 2×1 mètres',
    badge: 'Résistant UV',
    badgeColor: 'bg-amber-600',
    image: '/images/products/affiches-baches.jpg',
    href: '/catalogue/baches',
  },
  {
    id: 'rail-sacs-kraft',
    name: 'Sacs Shopping Kraft avec Poignées',
    category: 'Packaging Boutique',
    leadTime: 'Sous 4 jours',
    rating: 4.7,
    reviewsCount: 54,
    startingPrice: 22000,
    unitDesc: 'le lot de 50 sacs',
    badge: 'Écologique',
    badgeColor: 'bg-emerald-700',
    image: '/images/products/packaging-kraft.jpg',
    href: '/catalogue/sacs',
  },
  {
    id: 'rail-tshirt-polo',
    name: 'T-Shirts & Polos Personnalisés Coton',
    category: 'Textile Entreprise',
    leadTime: 'Sous 3 à 5 jours',
    rating: 4.9,
    reviewsCount: 77,
    startingPrice: 24000,
    unitDesc: 'le pack de 10 pièces',
    badge: 'Marquage HD',
    badgeColor: 'bg-rose-600',
    image: '/images/products/textile-pro.jpg',
    href: '/catalogue/textile',
  },
  {
    id: 'rail-depliants-3volets',
    name: 'Dépliants 3 Volets A4 Plié Format DL',
    category: 'Plaquettes Pro',
    leadTime: 'Livrable en 48h',
    rating: 4.8,
    reviewsCount: 45,
    startingPrice: 25000,
    unitDesc: 'les 250 plaquettes',
    badge: 'Finition Mat',
    badgeColor: 'bg-indigo-600',
    image: '/images/products/brochures-catalogues.jpg',
    href: '/catalogue/depliants',
  },
  {
    id: 'rail-goodies-mugs',
    name: 'Mugs Céramique & Gourdes Isothermes',
    category: 'Goodies Cadeaux',
    leadTime: 'Sous 72h',
    rating: 4.9,
    reviewsCount: 62,
    startingPrice: 17500,
    unitDesc: 'lot de 10 unités',
    badge: 'Cadeau VIP',
    badgeColor: 'bg-teal-600',
    image: '/images/products/goodies-vip.jpg',
    href: '/catalogue/goodies',
  },
]

// ── 0.2 Tuiles Catégories Essentielles (Inspiration Jumia) ───────────────────
interface EssentialTile {
  id: string
  title: string
  badgeText: string
  description: string
  gradient: string
  textColor: string
  image: string
  href: string
}

const ESSENTIAL_TILES: EssentialTile[] = [
  {
    id: 'bestsellers',
    title: 'Meilleures Ventes',
    badgeText: 'QUALITÉ PRO',
    description: 'Cartes dorure & Flyers',
    gradient: 'from-amber-500 via-orange-500 to-amber-600',
    textColor: 'text-amber-950',
    image: '/images/products/cartes-visite.jpg',
    href: '/catalogue',
  },
  {
    id: 'destockage',
    title: 'Déstockage Atelier',
    badgeText: 'JUSQU\'À -40%',
    description: 'Fins de séries papier',
    gradient: 'from-rose-500 via-red-600 to-rose-700',
    textColor: 'text-rose-950',
    image: '/images/products/brochures-catalogues.jpg',
    href: '/catalogue',
  },
  {
    id: 'salons',
    title: 'Salons & Foires',
    badgeText: 'SIAO & SNC',
    description: 'Roll-ups, stands & bâches',
    gradient: 'from-purple-600 via-indigo-600 to-violet-700',
    textColor: 'text-purple-950',
    image: '/images/products/rollup-salons.jpg',
    href: '/catalogue/roll-up',
  },
  {
    id: 'packaging',
    title: 'Packaging Kraft',
    badgeText: 'DÈS 450 F/U',
    description: 'Sacs boutiques & boîtes',
    gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
    textColor: 'text-emerald-950',
    image: '/images/products/packaging-kraft.jpg',
    href: '/catalogue/sacs',
  },
  {
    id: 'entreprises',
    title: 'Espace Entreprises',
    badgeText: 'FACTURES DGI',
    description: 'e-Sintax & Devis sous 2h',
    gradient: 'from-blue-600 via-sky-600 to-blue-700',
    textColor: 'text-blue-950',
    image: '/images/products/cartes-visite.jpg',
    href: '/entreprises',
  },
  {
    id: 'textile',
    title: 'Textile & Goodies',
    badgeText: 'PERSONNALISÉ',
    description: 'Polos, casquettes, stylos',
    gradient: 'from-fuchsia-600 via-pink-600 to-rose-600',
    textColor: 'text-fuchsia-950',
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
  const router = useRouter()
  const { products: apiProducts } = usePopularProducts()

  // Calculateur Express state
  const [calcProdKey, setCalcProdKey] = useState<string>('cartes')
  const currentCalc = CALC_PRODUCTS[calcProdKey]
  const [selectedQty, setSelectedQty] = useState<number>(currentCalc.popularQty)
  const [selectedFinish, setSelectedFinish] = useState<string>(currentCalc.finishes[0].id)
  const [copiedPromo, setCopiedPromo] = useState(false)
  const [bestsellerTab, setBestsellerTab] = useState<'all' | 'cartes' | 'flyers' | 'grand_format' | 'textile'>('all')

  // Bannières Dynamiques Carrousel Hero (Uploadées depuis le Backoffice)
  const [banners, setBanners] = useState<BannerSlide[]>(DEFAULT_BANNERS)
  const [heroSlide, setHeroSlide] = useState(0)
  const [isCarouselHovered, setIsCarouselHovered] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 13, seconds: 17 })

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

  // Compte à rebours temps réel (décrément chaque seconde)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return { hours: 8, minutes: 13, seconds: 17 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Rotation automatique du carrousel (5.5 secondes, pause quand la souris survole)
  useEffect(() => {
    if (isCarouselHovered || banners.length <= 1) return
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
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased">

      {/* ═════════════════════════════════════════════════════════════
          1. GRANDE BANNIÈRE CARROUSEL HERO (1248 × 357 PX)
             Bannières visuelles graphiques uploadées depuis le Backoffice
      ═════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[1248px] mx-auto px-2 sm:px-4 pt-4 sm:pt-6 pb-3">
        <div 
          className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-slate-200/60 bg-slate-950 group"
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
        >
          {/* Conteneur dimension standard e-commerce : 1248 × 357 px */}
          <div className="relative w-full h-[160px] sm:h-[240px] md:h-[357px] max-h-[357px] overflow-hidden">
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
                    title={banner.title}
                  >
                    <Image
                      src={banner.imageUrl}
                      alt={banner.altText || banner.title || 'Bannière YopoePrint'}
                      fill
                      priority={idx === 0}
                      unoptimized
                      className="object-cover object-center w-full h-full"
                      sizes="(max-width: 1248px) 100vw, 1248px"
                    />
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
                    ? 'w-5 h-1.5 bg-slate-900 shadow-xs'
                    : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
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
        {/* Conteneur Rouge Carmin Jumia */}
        <div className="bg-[#b81d24] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg text-white">
          
          {/* En-tête Ventes Flash */}
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h2 className="font-display text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                <span>Ventes Flash</span>
                <span className="font-normal opacity-90 text-white/90">| Chaque jour</span>
              </h2>

              {/* Compte à Rebours Pill Blanc Jumia */}
              <div className="inline-flex items-center gap-1.5 bg-white text-slate-900 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold shadow-xs mt-1">
                <Clock size={12} className="text-red-600" />
                <span>
                  {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>

            {/* Bouton Pill Blanc Flèche Suivante */}
            <Link
              href="/catalogue"
              className="w-10 sm:w-11 h-6 sm:h-6.5 bg-white text-red-700 hover:bg-slate-100 rounded-full flex items-center justify-center font-black text-sm shadow-sm transition-transform active:scale-95"
              aria-label="Voir toutes les ventes flash"
            >
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Rangée de Produits en Défilement Horizontal avec Boutons Fléchés Desktop & Swipe Mobile */}
          <ProductScrollRail trackClassName="gap-2.5 sm:gap-3">
            {FLASH_SALE_ITEMS.map((item) => (
              <div
                key={item.id}
                className="w-[148px] sm:w-[168px] md:w-[185px] shrink-0 snap-start bg-white text-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between group transition-all"
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
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
                    Atelier
                  </span>

                  {/* Bouton Rond Noir (+) Style Jumia Mobile */}
                  <button
                    onClick={(e) => handleQuickAddFlash(e, item)}
                    className="absolute top-2 right-2 w-7 h-7 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md active:scale-90 transition-transform cursor-pointer"
                    title="Configurer"
                    aria-label={`Configurer ${item.title}`}
                  >
                    <Plus size={15} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Jauge / Barre de Stock Jumia (Texte + Barre de progression) */}
                <div className="bg-[#fffbeb] px-2 py-1 border-t border-amber-100/70">
                  <div className="text-[10px] font-bold text-amber-800 leading-none">
                    {item.stockCount} articles en stock
                  </div>
                  <div className="w-full h-1 bg-amber-200/80 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.stockPercent}%` }}
                    />
                  </div>
                </div>

                {/* Corps de Carte Produit */}
                <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1 gap-1">
                  {/* Titre Produit (2 lignes max) */}
                  <Link href={item.href}>
                    <h3 className="font-semibold text-[11px] sm:text-xs text-slate-900 line-clamp-2 leading-tight hover:text-red-700 min-h-[30px]">
                      {item.title}
                    </h3>
                  </Link>

                  {/* Avis Étoiles */}
                  <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                    <span>★ {item.rating}</span>
                    <span className="text-slate-400 font-normal">({item.reviewsCount})</span>
                  </div>

                  {/* Prix en FCFA & Réduction */}
                  <div className="pt-0.5">
                    <div className="font-mono font-black text-xs sm:text-sm text-slate-950">
                      {item.price.toLocaleString('fr-FR')} FCFA
                    </div>
                    <div className="flex items-center justify-between gap-1 text-[10px] pt-0.5">
                      <span className="text-slate-400 line-through font-mono text-[10px]">
                        {item.oldPrice.toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className="bg-[#059669] text-white text-[9px] font-black px-1.5 py-0.5 rounded font-mono">
                        {item.discount}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </ProductScrollRail>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          3. TROUVEZ TOUS VOS SUPPORTS ESSENTIELS (TUILES COLORÉES JUMIA)
      ═════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        
        {/* Titre et Sous-titre Chauds Style Jumia */}
        <div className="mb-3">
          <h2 className="font-display text-xl sm:text-2xl font-black text-amber-600 tracking-tight">
            Trouvez tous vos supports essentiels
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Des articles d'impression professionnelle aux meilleurs tarifs du Burkina
          </p>
        </div>

        {/* Grille des 6 Tuiles Colorées Raccourcis */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ESSENTIAL_TILES.map((tile) => (
            <Link
              key={tile.id}
              href={tile.href}
              className={`group relative rounded-2xl p-3.5 bg-gradient-to-br ${tile.gradient} text-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[160px] overflow-hidden`}
            >
              {/* Fond décoratif doux */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />

              {/* Titre & Flèche */}
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-extrabold text-white leading-tight">
                    {tile.title}
                  </h3>
                  <ChevronRight size={14} className="text-white/80 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-white/80 mt-1 leading-snug">
                  {tile.description}
                </p>
              </div>

              {/* Image d'illustration miniature & Badge Capsule Blanc */}
              <div className="relative z-10 flex flex-col items-center gap-2 pt-2">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md border border-white/30 bg-white/20">
                  <Image
                    src={tile.image}
                    alt={tile.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <span className="w-full text-center text-[10px] font-black tracking-wider uppercase bg-white text-slate-900 px-2 py-1 rounded-full shadow-sm group-hover:bg-amber-300 transition-colors">
                  {tile.badgeText}
                </span>
              </div>

            </Link>
          ))}
        </div>

      </section>

      {/* ═════════════════════════════════════════════════════════════
          3.5 RAIL DÉROULANT : NOS MEILLEURES VENTES D'IMPRIMERIE (STYLE JUMIA)
      ═════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/80">
          
          {/* En-tête de Section */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                  Sélection Atelier
                </span>
                <span className="hidden sm:inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Top 8 Commandés
                </span>
              </div>
              <h2 className="font-display text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                Nos Meilleures Ventes d'Imprimerie
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Les supports les plus plébiscités par nos clients à Ouagadougou et partout au Burkina
              </p>
            </div>
            
            <Link
              href="/catalogue"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group shrink-0 transition-colors"
            >
              <span className="hidden sm:inline">Tout le catalogue</span>
              <span className="sm:hidden">Voir tout</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Rail Scrollable avec boutons fléchés latéraux Desktop et Swipe Mobile */}
          <ProductScrollRail trackClassName="gap-3 sm:gap-4">
            {TOP_BESTSELLERS_RAIL.map((prod) => (
              <div
                key={prod.id}
                className="w-[160px] sm:w-[190px] md:w-[220px] shrink-0 snap-start bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-emerald-500/60 transition-all duration-300 group flex flex-col justify-between overflow-hidden"
              >
                {/* Zone Photo Produit */}
                <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                  <Link href={prod.href} className="relative w-full h-full block">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="220px"
                    />
                  </Link>

                  {/* Badge d'atelier */}
                  {prod.badge && (
                    <span className={`absolute top-2 left-2 ${prod.badgeColor || 'bg-slate-900'} text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs tracking-wider`}>
                      {prod.badge}
                    </span>
                  )}

                  {/* Délai d'atelier */}
                  <span className="absolute bottom-2 left-2 bg-slate-950/75 backdrop-blur-xs text-white text-[9px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Clock size={10} className="text-emerald-400" />
                    <span>{prod.leadTime}</span>
                  </span>
                </div>

                {/* Corps de Carte Produit */}
                <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
                      {prod.category}
                    </span>
                    <Link href={prod.href}>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 min-h-[34px] leading-snug">
                        {prod.name}
                      </h3>
                    </Link>
                  </div>

                  {/* Avis & Étoiles */}
                  <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                    <span>★ {prod.rating}</span>
                    <span className="text-slate-400 font-normal">({prod.reviewsCount})</span>
                  </div>

                  {/* Prix en FCFA */}
                  <div className="pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium block leading-none">Dès</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-mono font-black text-sm sm:text-base text-slate-950">
                        {new Intl.NumberFormat('fr-FR').format(prod.startingPrice)}
                      </span>
                      <span className="text-[11px] font-bold text-slate-700">FCFA</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                      {prod.unitDesc}
                    </span>
                  </div>

                  {/* Bouton Action Rapide */}
                  <Link
                    href={prod.href}
                    className="w-full mt-1 py-2 px-3 rounded-xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
                  >
                    <span>Configurer</span>
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

              </div>
            ))}
          </ProductScrollRail>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          4. BANDEAU DE RÉASSURANCE HELLOPRINT (4 Piliers Concrets)
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
                  <span>Configurer et commander</span>
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
                style={{ backgroundImage: `url('/images/products/rollup-salons.jpg')` }}
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
