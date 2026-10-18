'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Search, ShoppingCart, User, X, ChevronRight, LogOut,
  Menu, ArrowRight, LayoutGrid, Loader2, FileText, CreditCard,
  Image as ImageIcon, BookOpen, Flag, Shirt, Gift, Box,
  Sparkles, CheckCircle2, ShieldCheck, Phone, Clock, Percent,
  Zap, Truck, ChevronDown, FileCheck, Flame, Copy, CheckCheck,
  Heart, Package, Tag, HelpCircle
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuthContext } from '@/context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { productsService } from '@/lib/products.service'
import { Logo } from '@/components/shared/Logo'
import { CONTACT_PHONE_DISPLAY } from '@/lib/contact'

// ─── Structure de Données E-Commerce Professionnelle (Standard Helloprint & Jumia) ───
export interface NavCategory {
  id: string
  label: string
  href: string
  icon: any
  startingPrice: string
  columns: {
    title: string
    items: {
      label: string
      href: string
      price?: string
      badge?: string
      isNew?: boolean
    }[]
  }[]
  featured: {
    badge: string
    title: string
    subtitle: string
    price: string
    oldPrice?: string
    discount?: string
    delivery: string
    href: string
    imageUrl: string
  }
}

const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'flyers',
    label: 'Flyers & Dépliants',
    href: '/catalogue/flyers',
    icon: FileText,
    startingPrice: '8 500 F',
    columns: [
      {
        title: 'Formats Standards',
        items: [
          { label: 'Flyer A6 (10 × 15 cm)', href: '/catalogue/flyers', price: 'Dès 8 500 F', badge: 'Éco' },
          { label: 'Flyer A5 (14,8 × 21 cm)', href: '/catalogue/flyers', price: 'Dès 12 000 F', badge: 'Top Vente' },
          { label: 'Flyer A4 (21 × 29,7 cm)', href: '/catalogue/flyers', price: 'Dès 18 500 F' },
          { label: 'Format DL (10 × 21 cm)', href: '/catalogue/flyers', price: 'Dès 10 500 F' },
          { label: 'Flyer Carré (15 × 15 cm)', href: '/catalogue/flyers', price: 'Dès 14 000 F' },
        ],
      },
      {
        title: 'Dépliants & Plis',
        items: [
          { label: 'Dépliant 2 volets (1 pli central)', href: '/catalogue/flyers', price: 'Dès 22 000 F' },
          { label: 'Dépliant 3 volets (2 plis roulés)', href: '/catalogue/flyers', price: 'Dès 28 000 F', badge: 'Bestseller' },
          { label: 'Dépliant 3 volets (plis accordéon)', href: '/catalogue/flyers', price: 'Dès 28 000 F' },
          { label: 'Dépliant 4 volets (3 plis fenêtre)', href: '/catalogue/flyers', price: 'Dès 38 000 F' },
        ],
      },
      {
        title: 'Papiers & Finitions',
        items: [
          { label: 'Couché Brillant 135g (Événements)', href: '/catalogue/flyers' },
          { label: 'Couché Mat 170g (Élégant)', href: '/catalogue/flyers' },
          { label: 'Couché Semi-Rigide 250g', href: '/catalogue/flyers' },
          { label: 'Couché Carte 350g Mat', href: '/catalogue/flyers' },
          { label: 'Pelliculage Soft Touch velours', href: '/catalogue/flyers', badge: 'VIP' },
        ],
      },
    ],
    featured: {
      badge: 'Offre Flash de la Semaine',
      title: 'Pack 1 000 Flyers A5 Quadri Recto-Verso',
      subtitle: 'Papier couché brillant 135g haute tenue. Calibrage CMJN FOGRA39 garanti.',
      price: '28 500 FCFA',
      oldPrice: '35 000 FCFA',
      discount: '-18%',
      delivery: 'Expédié sous 48h à Ouaga',
      href: '/catalogue/flyers',
      imageUrl: '/images/products/flyers-depliants.jpg',
    },
  },
  {
    id: 'cartes',
    label: 'Cartes de Visite',
    href: '/catalogue/cartes',
    icon: CreditCard,
    startingPrice: '12 500 F',
    columns: [
      {
        title: 'Formats & Découpes',
        items: [
          { label: 'Carte Standard 85 × 55 mm', href: '/catalogue/cartes', price: 'Dès 12 500 F', badge: 'Top Vente' },
          { label: 'Format Carré Square 55 × 55 mm', href: '/catalogue/cartes', price: 'Dès 16 000 F' },
          { label: 'Format Carte Bancaire 85 × 54 mm', href: '/catalogue/cartes', price: 'Dès 14 000 F' },
          { label: 'Coins Arrondis (Rayon 4mm)', href: '/catalogue/cartes', price: '+2 500 F' },
          { label: 'Carte Double Pliée 85 × 110 mm', href: '/catalogue/cartes', price: 'Dès 25 000 F' },
        ],
      },
      {
        title: 'Finitions Prestige',
        items: [
          { label: 'Pelliculage Mat Velours (Soft Touch)', href: '/catalogue/cartes', badge: 'Signature' },
          { label: 'Vernis Sélectif 3D Brillant', href: '/catalogue/cartes', badge: 'Relief' },
          { label: 'Dorure à Chaud Or Métallisé', href: '/catalogue/cartes' },
          { label: 'Dorure Argent & Holographique', href: '/catalogue/cartes' },
          { label: 'Pelliculage Brillant Anti-Rayures', href: '/catalogue/cartes' },
        ],
      },
      {
        title: 'Matières Spéciales',
        items: [
          { label: 'Papier Couché 350g Extra-Blanc', href: '/catalogue/cartes' },
          { label: 'Papier Couché 450g Ultra-Épais', href: '/catalogue/cartes' },
          { label: 'Kraft Naturel Recyclé 300g', href: '/catalogue/cartes', badge: 'Éco' },
          { label: 'PVC Plastique Transparent indéchirable', href: '/catalogue/cartes' },
        ],
      },
    ],
    featured: {
      badge: 'Pack Prestige Entreprise',
      title: '500 Cartes 350g Soft Touch + Vernis 3D',
      subtitle: 'Effet tactile soyeux et logos en surbrillance relief 3D. Le choix des dirigeants.',
      price: '32 000 FCFA',
      oldPrice: '40 000 FCFA',
      discount: '-20%',
      delivery: 'Livrable en 48h au bureau',
      href: '/catalogue/cartes',
      imageUrl: '/images/products/cartes-visite.jpg',
    },
  },
  {
    id: 'affiches',
    label: 'Affiches & Bâches',
    href: '/catalogue/affiches',
    icon: ImageIcon,
    startingPrice: '4 500 F',
    columns: [
      {
        title: 'Affiches Papier HD',
        items: [
          { label: 'Affiche A3 (29,7 × 42 cm)', href: '/catalogue/affiches', price: 'Dès 4 500 F' },
          { label: 'Affiche A2 (42 × 59,4 cm)', href: '/catalogue/affiches', price: 'Dès 9 000 F' },
          { label: 'Affiche A1 (59,4 × 84,1 cm)', href: '/catalogue/affiches', price: 'Dès 16 000 F', badge: 'Événement' },
          { label: 'Affiche A0 (84,1 × 118,9 cm)', href: '/catalogue/affiches', price: 'Dès 25 000 F' },
          { label: 'Affiche Abribus & Métro (120 × 176 cm)', href: '/catalogue/affiches', price: 'Dès 38 000 F' },
        ],
      },
      {
        title: 'Bâches & Banderoles',
        items: [
          { label: 'Bâche PVC 510g avec Œillets tous les 50cm', href: '/catalogue/signaletique', price: 'Dès 6 500 F/m²', badge: 'Robuste' },
          { label: 'Bâche Micro-Perforée Mesh (Anti-Vent)', href: '/catalogue/signaletique', price: 'Dès 8 500 F/m²' },
          { label: 'Bâche Écologique Sans PVC', href: '/catalogue/signaletique', price: 'Dès 10 500 F/m²' },
          { label: 'Banderole Événementielle Corde & Fourreau', href: '/catalogue/signaletique' },
        ],
      },
      {
        title: 'Panneaux Rigides',
        items: [
          { label: 'Panneau Akilux Alvéolaire (Chantiers & Immo)', href: '/catalogue/signaletique', price: 'Dès 7 500 F' },
          { label: 'Panneau Forex PVC expansé 3mm / 5mm', href: '/catalogue/signaletique', price: 'Dès 14 000 F' },
          { label: 'Panneau Alu Dibond Métallique 3mm', href: '/catalogue/signaletique', price: 'Dès 28 000 F', badge: 'Prestige' },
          { label: 'Adhésif Vinyle Vitrine & Façade', href: '/catalogue/signaletique' },
        ],
      },
    ],
    featured: {
      badge: 'Grand Format Événementiel',
      title: 'Bâche PVC 510g Haute Résistance 3×1m',
      subtitle: 'Encres Latex résistantes aux fortes chaleurs sahéliennes et UV sans décoloration.',
      price: '19 500 FCFA',
      oldPrice: '24 000 FCFA',
      discount: '-18%',
      delivery: 'Atelier Ouaga · Prêt en 24h',
      href: '/catalogue/signaletique',
      imageUrl: '/images/products/affiches-baches.jpg',
    },
  },
  {
    id: 'roll-up',
    label: 'Roll-ups & Salons',
    href: '/catalogue/roll-up',
    icon: Flag,
    startingPrice: '28 000 F',
    columns: [
      {
        title: 'Kakémonos & Enrouleurs',
        items: [
          { label: 'Roll-Up Standard 85 × 200 cm', href: '/catalogue/roll-up', price: '28 000 F', badge: 'Top Vente' },
          { label: 'Roll-Up Large 100 × 200 cm', href: '/catalogue/roll-up', price: '38 000 F' },
          { label: 'Roll-Up Géant 120 × 200 cm', href: '/catalogue/roll-up', price: '48 000 F' },
          { label: 'Roll-Up Deluxe Aluminium Pied Lourd', href: '/catalogue/roll-up', price: '45 000 F', badge: 'VIP' },
          { label: 'Recharge Visuel Seul (Sans structure)', href: '/catalogue/roll-up', price: '16 000 F' },
        ],
      },
      {
        title: 'Stands d’Exposition & Salons',
        items: [
          { label: 'Photocall Stand Parapluie Tissu 3 × 2,3m', href: '/catalogue/evenementiel', price: '185 000 F', badge: 'Complet' },
          { label: 'Comptoir d’Accueil Pliable Personnalisé', href: '/catalogue/evenementiel', price: '65 000 F' },
          { label: 'Porte-Brochures Zig-Zag Aluminium', href: '/catalogue/papeterie', price: '35 000 F' },
          { label: 'Chevalet de Trottoir Double Face', href: '/catalogue/signaletique', price: '42 000 F' },
        ],
      },
      {
        title: 'Drapeaux & Signalétique Extérieure',
        items: [
          { label: 'Oriflamme Beach Flag Plume 2,80m', href: '/catalogue/evenementiel', price: '55 000 F' },
          { label: 'Oriflamme Goutte d’Eau 3,40m', href: '/catalogue/evenementiel', price: '68 000 F' },
          { label: 'Pied Platine Acier 10kg & Bouée de Lestage', href: '/catalogue/evenementiel' },
          { label: 'Badges Tours de Cou Satinés Personnalisés', href: '/catalogue/goodies', price: 'Dès 450 F/u' },
        ],
      },
    ],
    featured: {
      badge: 'Pack Spécial Salons Pro',
      title: 'Kit Stand Pro : 2 Roll-Ups 85×200 + 1 000 Dépliants',
      subtitle: 'Comprend 2 structures complètes avec housses de transport matelassées et 1 000 brochures 3 volets.',
      price: '84 000 FCFA',
      oldPrice: '98 000 FCFA',
      discount: '-15%',
      delivery: 'Livrable en 48h chrono',
      href: '/catalogue/roll-up',
      imageUrl: '/images/products/rollup-salons.jpg',
    },
  },
  {
    id: 'brochures',
    label: 'Brochures & Livrets',
    href: '/catalogue/brochures',
    icon: BookOpen,
    startingPrice: '45 000 F',
    columns: [
      {
        title: 'Reliures & Façonnages',
        items: [
          { label: 'Brochure Agrafée 2 Points Métal', href: '/catalogue/brochures', price: 'Dès 45 000 F', badge: 'Standard' },
          { label: 'Dos Carré Collé PUR (Effet Livre)', href: '/catalogue/brochures', price: 'Dès 95 000 F', badge: 'Prestige' },
          { label: 'Reliure Spirale Wire-O Métallique', href: '/catalogue/brochures', price: 'Dès 55 000 F' },
          { label: 'Rapports d’Activités & Bilans Annuels', href: '/catalogue/brochures' },
          { label: 'Magazines Périodiques & Bulletins', href: '/catalogue/brochures' },
        ],
      },
      {
        title: 'Formats Courants',
        items: [
          { label: 'Format A4 Fermé (8 à 64 pages)', href: '/catalogue/brochures' },
          { label: 'Format A5 Fermé (8 à 48 pages)', href: '/catalogue/brochures', badge: 'Populaire' },
          { label: 'Format Carré 21 × 21 cm', href: '/catalogue/brochures' },
          { label: 'Format Paysage à l’Italienne', href: '/catalogue/brochures' },
        ],
      },
      {
        title: 'Options de Couverture',
        items: [
          { label: 'Couverture 300g Couché avec Vernis 3D', href: '/catalogue/brochures' },
          { label: 'Pelliculage Mat Velours Anti-Rayures', href: '/catalogue/brochures' },
          { label: 'Pages Intérieures Couché Brillant 135g', href: '/catalogue/brochures' },
          { label: 'Pages Intérieures Couché Mat 170g', href: '/catalogue/brochures' },
        ],
      },
    ],
    featured: {
      badge: 'Corporate B2B',
      title: '100 Catalogues A4 de 16 Pages Couverture 300g',
      subtitle: 'Brochage 2 points métal, quadrichromie intégrale offset haute définition certifiée DGI.',
      price: '115 000 FCFA',
      oldPrice: '135 000 FCFA',
      discount: '-15%',
      delivery: 'Expédié en 3 à 5 jours',
      href: '/catalogue/brochures',
      imageUrl: '/images/products/brochures-catalogues.jpg',
    },
  },
  {
    id: 'textile',
    label: 'Textile Pro & Vêtements',
    href: '/catalogue/textile',
    icon: Shirt,
    startingPrice: '3 500 F',
    columns: [
      {
        title: 'Vêtements Corporate',
        items: [
          { label: 'T-Shirts Coton Peigné 190g Quadri', href: '/catalogue/textile', price: 'Dès 3 500 F/u', badge: 'Top Vente' },
          { label: 'Polos Piqué 220g avec Broderie Cœur', href: '/catalogue/textile', price: 'Dès 6 500 F/u', badge: 'Prestige' },
          { label: 'Sweats à Capuche & Hoodies Épais', href: '/catalogue/textile', price: 'Dès 12 500 F/u' },
          { label: 'Chemises Homme & Femme Broderie', href: '/catalogue/textile', price: 'Dès 11 000 F/u' },
        ],
      },
      {
        title: 'Tenues de Travail & Sécurité',
        items: [
          { label: 'Gilets Haute Visibilité Marqués', href: '/catalogue/textile', price: 'Dès 2 500 F/u', badge: 'Sécurité' },
          { label: 'Combinaisons & Blouses d’Atelier', href: '/catalogue/textile', price: 'Dès 15 000 F/u' },
          { label: 'Casquettes 6 Panneaux Broderie Relief', href: '/catalogue/textile', price: 'Dès 3 000 F/u' },
          { label: 'Tabliers Serveur & Cuisine Marqués', href: '/catalogue/textile', price: 'Dès 4 500 F/u' },
        ],
      },
      {
        title: 'Techniques de Marquage',
        items: [
          { label: 'Sérigraphie Directe (Grands volumes)', href: '/catalogue/textile' },
          { label: 'Broderie Industrielle Fil Haute Résistance', href: '/catalogue/textile' },
          { label: 'Impression Numérique Directe DTG', href: '/catalogue/textile' },
          { label: 'Transfert DTF Découpe Haute Définition', href: '/catalogue/textile' },
        ],
      },
    ],
    featured: {
      badge: 'Pack Équipe Pro',
      title: 'Lot de 50 T-Shirts 100% Coton avec Logo',
      subtitle: 'Marquage quadri grand format face avant ou broderie cœur. Coton peigné doux 190g.',
      price: '145 000 FCFA',
      oldPrice: '175 000 FCFA',
      discount: '-17%',
      delivery: 'Production express sous 72h',
      href: '/catalogue/textile',
      imageUrl: '/images/products/textile-pro.jpg',
    },
  },
  {
    id: 'goodies',
    label: 'Goodies & Cadeaux VIP',
    href: '/catalogue/goodies',
    icon: Gift,
    startingPrice: '350 F',
    columns: [
      {
        title: 'Papeterie & Écriture',
        items: [
          { label: 'Stylos Métal avec Gravure Laser', href: '/catalogue/goodies', price: 'Dès 650 F/u', badge: 'VIP' },
          { label: 'Stylos Bille Plastique Quadri', href: '/catalogue/goodies', price: 'Dès 350 F/u', badge: 'Éco' },
          { label: 'Carnets de Notes Cuir PU avec Élastique', href: '/catalogue/goodies', price: 'Dès 2 800 F/u' },
          { label: 'Bloc-Notes & Agendas Millésimés', href: '/catalogue/goodies', price: 'Dès 4 500 F/u' },
        ],
      },
      {
        title: 'Boissons & Lifestyle',
        items: [
          { label: 'Mugs Céramique Personnalisés 330ml', href: '/catalogue/goodies', price: 'Dès 2 500 F/u', badge: 'Bestseller' },
          { label: 'Gourdes Isothermes Inox 500ml Gravées', href: '/catalogue/goodies', price: 'Dès 6 500 F/u' },
          { label: 'Gobelets Réutilisables Éco-Cup', href: '/catalogue/goodies', price: 'Dès 450 F/u' },
          { label: 'Tote Bags Coton Épais 280g Sérigraphiés', href: '/catalogue/sacs', price: 'Dès 1 500 F/u' },
        ],
      },
      {
        title: 'High-Tech & Badges',
        items: [
          { label: 'Clés USB Métalliques Gravées 16/32 Go', href: '/catalogue/goodies', price: 'Dès 4 500 F/u' },
          { label: 'Batteries Externes Powerbank 10 000 mAh', href: '/catalogue/goodies', price: 'Dès 12 000 F/u' },
          { label: 'Tours de Cou & Lanyards Satinés', href: '/catalogue/goodies', price: 'Dès 450 F/u' },
          { label: 'Porte-Clés Métal Découpe Laser', href: '/catalogue/goodies', price: 'Dès 1 200 F/u' },
        ],
      },
    ],
    featured: {
      badge: 'Cadeau de Fin d’Année',
      title: 'Coffret VIP : Gourde Inox + Carnet Cuir + Stylo Laser',
      subtitle: 'Présentation sous boîte aimantée noire satinée avec mousse thermo-découpée personnalisée.',
      price: '18 500 FCFA',
      oldPrice: '22 000 FCFA',
      discount: '-16%',
      delivery: 'Dès 25 exemplaires livrés sous 5j',
      href: '/catalogue/goodies',
      imageUrl: '/images/products/goodies-vip.jpg',
    },
  },
  {
    id: 'packaging',
    label: 'Stickers & Packaging',
    href: '/catalogue/etiquettes',
    icon: Box,
    startingPrice: '5 500 F',
    columns: [
      {
        title: 'Stickers & Autocollants',
        items: [
          { label: 'Stickers Découpe à la Forme (Kiss-Cut)', href: '/catalogue/etiquettes', price: 'Dès 8 500 F', badge: 'Tendance' },
          { label: 'Stickers Planche A4 / A5 Multi-Poses', href: '/catalogue/etiquettes', price: 'Dès 5 500 F' },
          { label: 'Étiquettes Produits en Rouleaux Bobines', href: '/catalogue/etiquettes', price: 'Dès 18 000 F', badge: 'Industriel' },
          { label: 'Stickers Vinyle Résistant Eau & Huile', href: '/catalogue/etiquettes' },
        ],
      },
      {
        title: 'Packaging & Boîtes Carton',
        items: [
          { label: 'Boîtes d’Expédition E-Commerce Kraft', href: '/catalogue/etiquettes', price: 'Dès 850 F/u' },
          { label: 'Pochettes Shopping Papier Kraft Corde', href: '/catalogue/sacs', price: 'Dès 450 F/u', badge: 'Boutique' },
          { label: 'Étuis Pliants Cosmétiques & Pharmacie', href: '/catalogue/etiquettes' },
          { label: 'Papier de Soie Imprimé au Logo', href: '/catalogue/etiquettes' },
        ],
      },
      {
        title: 'Signalétique Adhésive',
        items: [
          { label: 'Adhésifs Grand Format Sol Antidérapant', href: '/catalogue/signaletique' },
          { label: 'Lettrage Découpé Vitrine Micro-Perforé', href: '/catalogue/signaletique' },
          { label: 'Magnétiques pour Portières de Véhicules', href: '/catalogue/signaletique', price: 'Dès 14 000 F/paire' },
          { label: 'Ruban Adhésif Scotch Personnalisé', href: '/catalogue/etiquettes' },
        ],
      },
    ],
    featured: {
      badge: 'Packaging Artisanal',
      title: '500 Sacs Kraft Cordelettes + 1 000 Stickers Vinyle',
      subtitle: 'La panoplie complète pour valoriser vos colis e-commerce et boutiques physiques.',
      price: '89 000 FCFA',
      oldPrice: '105 000 FCFA',
      discount: '-15%',
      delivery: 'Expédié sous 4 jours ouvrés',
      href: '/catalogue/etiquettes',
      imageUrl: '/images/products/packaging-kraft.jpg',
    },
  },
]

export function Navbar() {
  const { itemCount, openCart } = useCart()
  const { user, isLoggedIn, logout } = useAuthContext()
  const pathname = usePathname()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMega, setActiveMega] = useState<number | null>(null)
  const [allProductsOpen, setAllProductsOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [copiedPromo, setCopiedPromo] = useState(false)
  const [masterCatIndex, setMasterCatIndex] = useState<number>(0)
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const masterTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const moreTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopyPromo = () => {
    navigator.clipboard.writeText('YOPPRINT15')
    setCopiedPromo(true)
    setTimeout(() => setCopiedPromo(false), 2200)
  }

  // ─── Search State ───────────────────────────────────────────────────────────
  const [navSearch, setNavSearch] = useState('')
  const [debouncedNavSearch, setDebouncedNavSearch] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [navSearchResults, setNavSearchResults] = useState<any[]>([])
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const [searchFocused, setSearchFocused] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedNavSearch(navSearch), 250)
    return () => clearTimeout(timer)
  }, [navSearch])

  // Fetch API on debounced term
  useEffect(() => {
    if (!debouncedNavSearch.trim()) {
      setNavSearchResults([])
      setSearchLoading(false)
      return
    }
    setSearchLoading(true)
    productsService.getAll({ search: debouncedNavSearch, limit: 5 })
      .then(res => setNavSearchResults(res.data || []))
      .catch(() => setNavSearchResults([]))
      .finally(() => setSearchLoading(false))
  }, [debouncedNavSearch])

  // Close desktop search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (navSearch.trim()) {
      router.push(`/catalogue?search=${encodeURIComponent(navSearch)}`)
      setSearchFocused(false)
      setSearchOpen(false)
    }
  }

  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchOpen(false)
    setActiveMega(null)
    setAllProductsOpen(false)
    setMoreMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileMenuOpen || searchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen, searchOpen])

  // ─── Master Menu "Tous les Produits" & Mega Menu Hover Handlers ─────────
  const handleMasterEnter = () => {
    if (masterTimer.current) clearTimeout(masterTimer.current)
    if (megaTimer.current) clearTimeout(megaTimer.current)
    if (moreTimer.current) clearTimeout(moreTimer.current)
    setActiveMega(null)
    setMoreMenuOpen(false)
    setAllProductsOpen(true)
  }

  const handleMasterLeave = () => {
    masterTimer.current = setTimeout(() => setAllProductsOpen(false), 260)
  }

  const handleCatEnter = (idx: number) => {
    if (megaTimer.current) clearTimeout(megaTimer.current)
    if (masterTimer.current) clearTimeout(masterTimer.current)
    if (moreTimer.current) clearTimeout(moreTimer.current)
    setAllProductsOpen(false)
    setMoreMenuOpen(false)
    setActiveMega(idx)
  }

  const handleCatLeave = () => {
    megaTimer.current = setTimeout(() => setActiveMega(null), 260)
  }

  const handleMoreEnter = () => {
    if (moreTimer.current) clearTimeout(moreTimer.current)
    if (megaTimer.current) clearTimeout(megaTimer.current)
    if (masterTimer.current) clearTimeout(masterTimer.current)
    setActiveMega(null)
    setAllProductsOpen(false)
    setMoreMenuOpen(true)
  }

  const handleMoreLeave = () => {
    moreTimer.current = setTimeout(() => setMoreMenuOpen(false), 260)
  }

  const handleMegaEnter = () => {
    if (megaTimer.current) clearTimeout(megaTimer.current)
  }

  const handleMegaLeave = () => {
    megaTimer.current = setTimeout(() => setActiveMega(null), 260)
  }

  const activeCategory = activeMega !== null ? NAV_CATEGORIES[activeMega] : null

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          MOBILE HEADER (STYLE JUMIA WEB MOBILE)
      ══════════════════════════════════════════════════════ */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200/80 shadow-xs">
        {/* Ligne 1 : Hamburger + Logo Centré + Compte & Panier */}
        <div className="px-3 h-13 flex items-center justify-between">
          {/* Menu Hamburger Gauche */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 text-gray-800 hover:bg-gray-100 rounded-lg active:scale-95 transition-transform"
            aria-label="Ouvrir le menu"
          >
            <Menu size={23} />
          </button>

          {/* Logo YopoePrint */}
          <Logo theme="light" size="sm" showSubtitle={false} />

          {/* Actions Droite : Compte & Panier */}
          <div className="flex items-center gap-1">
            <Link
              href={mounted && isLoggedIn ? "/mon-compte" : "/connexion"}
              className="p-1.5 text-gray-800 hover:bg-gray-100 rounded-lg active:scale-95 transition-transform"
              aria-label="Mon compte"
            >
              <User size={22} />
            </Link>

            <button
              onClick={openCart}
              className="p-1.5 text-gray-800 hover:bg-gray-100 rounded-lg relative active:scale-95 transition-transform"
              aria-label="Panier"
            >
              <ShoppingCart size={22} />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-gray-950 text-2xs font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Ligne 2 : Barre de Recherche Pleine Largeur (Style Jumia Mobile) */}
        <div className="px-3 pb-2.5">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex items-center bg-gray-100/90 rounded-xl px-3.5 py-2 border border-gray-200/70 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <Search size={16} className="text-gray-400 shrink-0 mr-2.5" />
              <input
                type="text"
                placeholder="Cherchez sur YopoePrint"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full bg-transparent text-xs text-gray-900 placeholder:text-gray-400 outline-none font-medium"
              />
            </div>

            {/* Dropdown de Résultats Prédictifs Mobile */}
            {searchFocused && navSearch.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60] text-gray-900">
                {searchLoading ? (
                  <div className="p-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Loader2 size={14} className="animate-spin text-emerald-600" />
                    <span>Recherche...</span>
                  </div>
                ) : navSearchResults.length > 0 ? (
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {navSearchResults.slice(0, 5).map((prod) => (
                      <Link
                        key={prod.id || prod._id}
                        href={`/produit/${prod.slug}`}
                        onClick={() => { setSearchFocused(false); setNavSearch('') }}
                        className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                      >
                        <span className="font-bold text-xs text-gray-900 truncate max-w-[200px]">{prod.name}</span>
                        <span className="font-bold text-xs text-emerald-600 tabular-nums">
                          {new Intl.NumberFormat('fr-FR').format(prod.basePrice)} F
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </form>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          HEADER PRINCIPAL DESKTOP (Standard Apple & Helloprint)
      ══════════════════════════════════════════════════════ */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-gray-200/90 shadow-xs transition-colors">
        
        {/* LIGNE 0 : TOP BAR ANNONCES & SERVICE ATELIER (High Header en couleur) */}
        <div className="bg-primary text-white text-xs py-1.5 px-4 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Gauche : Réassurance logistique atelier Ouaga & Bobo */}
            <div className="flex items-center gap-3 text-2xs text-emerald-50">
              <span className="inline-flex items-center gap-1.5 text-white font-medium">
                <Truck size={13} className="text-white shrink-0" />
                <span>Livraison offerte dès <strong className="font-bold underline decoration-white/40">75 000 FCFA</strong> à Ouaga et Bobo</span>
              </span>
            </div>

            {/* Droite : Code Promo 1-Click + Contact Hotline */}
            <div className="flex items-center gap-4 text-2xs">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-semibold inline-flex items-center gap-1">
                  <Flame size={12} className="text-amber-200 shrink-0 fill-amber-300" />
                  -15% 1ère commande :
                </span>
                <button
                  type="button"
                  onClick={handleCopyPromo}
                  title="Cliquer pour copier le code promo"
                  className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 active:scale-95 text-white px-2 py-0.5 rounded font-mono font-bold border border-white/30 transition-all cursor-pointer shadow-2xs"
                >
                  {copiedPromo ? (
                    <>
                      <CheckCheck size={11} className="text-white" />
                      <span className="text-white font-sans font-bold">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} className="text-emerald-100" />
                      <span>YOPPRINT15</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* LIGNE 1 : LOGO ORIGINAL + RECHERCHE CENTRALE + ACTIONS UTILISATEUR */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
            
            {/* Logo YopoePrint ORIGINAL (Vert & Noir sur fond blanc) */}
            <Logo theme="light" size="md" />

            {/* Recherche Prédictive E-Commerce (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4 relative" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <div className="relative flex items-center">
                  <Search size={16} className="absolute left-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Rechercher cartes, flyers, roll-up, bâches, t-shirts…"
                    value={navSearch}
                    onChange={(e) => setNavSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    className="w-full bg-gray-100 hover:bg-gray-100/80 focus:bg-white text-gray-900 placeholder:text-gray-400 focus:placeholder:text-gray-400 rounded-full py-2.5 pl-11 pr-24 text-xs sm:text-sm border border-gray-200/90 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all duration-200 shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary hover:bg-emerald-800 text-white font-bold px-3.5 py-1.5 rounded-full text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    {searchLoading ? <Loader2 size={13} className="animate-spin" /> : <span>Trouver</span>}
                  </button>
                </div>
              </form>

              {/* Dropdown de Résultats Prédictifs */}
              {searchFocused && navSearch.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-gray-200 overflow-hidden z-[60] text-gray-900 animate-in fade-in slide-in-from-top-1">
                  {searchLoading ? (
                    <div className="p-5 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                      <Loader2 size={15} className="animate-spin text-primary" />
                      <span>Recherche des produits en atelier...</span>
                    </div>
                  ) : navSearchResults.length > 0 ? (
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100 text-2xs font-bold uppercase tracking-wider text-gray-400">
                        Suggestions immédiates
                      </div>
                      {navSearchResults.map((prod) => (
                        <Link
                          key={prod.id || prod._id}
                          href={`/produit/${prod.slug}`}
                          onClick={() => { setSearchFocused(false); setNavSearch('') }}
                          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-lg shrink-0 group-hover:bg-emerald-50">
                              {prod.emoji || '📦'}
                            </div>
                            <div>
                              <p className="font-bold text-xs text-gray-900 group-hover:text-primary transition-colors">
                                {prod.name}
                              </p>
                              <p className="text-2xs text-gray-500">{prod.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xs text-gray-400 block font-medium">Dès</span>
                            <span className="font-bold text-xs text-primary tabular-nums">
                              {new Intl.NumberFormat('fr-FR').format(prod.basePrice)} FCFA
                            </span>
                          </div>
                        </Link>
                      ))}
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full text-center text-xs font-bold text-primary hover:text-emerald-800 bg-gray-50 hover:bg-gray-100 py-3 border-t border-gray-100 transition-colors cursor-pointer"
                      >
                        Voir tous les résultats pour "{navSearch}" →
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-gray-500">
                      <p className="font-bold text-gray-800 mb-1">Aucun résultat trouvé pour "{navSearch}"</p>
                      <p className="text-2xs text-gray-500">Essayez avec "cartes", "flyers", "roll-up" ou "bâche".</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions Droite : Devis B2B + Mon Compte + Panier */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Bouton Devis Express B2B */}
              <Link
                href="/devis"
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100/80 text-primary text-xs font-bold border border-emerald-200/80 hover:border-emerald-300 transition-all shadow-2xs"
              >
                <Zap size={14} className="text-amber-500 fill-amber-500" />
                <span>Devis sous 2h</span>
              </Link>

              {/* Espace Client */}
              {mounted && isLoggedIn ? (
                <div className="hidden sm:flex items-center gap-2 pl-2">
                  <Link
                    href="/mon-compte"
                    className="flex items-center gap-2 py-1.5 px-3 rounded-full hover:bg-gray-100 text-gray-800 text-xs font-semibold transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-primary flex items-center justify-center font-bold text-xs border border-emerald-200">
                      {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                    </div>
                    <span className="max-w-[100px] truncate">{user?.firstName || 'Mon Compte'}</span>
                  </Link>
                  <button
                    onClick={logout}
                    title="Déconnexion"
                    className="p-2 text-gray-400 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/connexion"
                  className="hidden sm:flex items-center gap-1.5 py-1.5 px-3.5 rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 text-xs font-semibold transition-colors border border-gray-200/80"
                >
                  <User size={15} className="text-gray-500" />
                  <span>Connexion</span>
                </Link>
              )}

              {/* Panier Interactif */}
              <button
                onClick={openCart}
                className="relative flex items-center gap-2 py-2 px-4 rounded-full bg-primary hover:bg-emerald-800 text-white font-extrabold text-xs transition-all shadow-sm hover:shadow active:scale-95 ml-1 cursor-pointer"
              >
                <ShoppingCart size={15} />
                <span className="hidden sm:inline">Panier</span>
                {mounted && itemCount > 0 && (
                  <span className="bg-white text-primary text-2xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* LIGNE 2 : BARRE DE CATÉGORIES (Fond Blanc, Sans Collision, Avec Dropdown Plus) */}
        <nav className="border-t border-gray-100 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
            
            <div className="flex items-center py-0 flex-1 min-w-0">
              
              {/* TRIGGER MEGA CATALOGUE COMPLET : "Tous les Produits" */}
              <div
                className="relative shrink-0"
                onMouseEnter={handleMasterEnter}
                onMouseLeave={handleMasterLeave}
              >
                <button
                  type="button"
                  onClick={() => setAllProductsOpen(!allProductsOpen)}
                  className={`flex items-center gap-2 py-2.5 px-4 text-xs font-extrabold transition-all border-r border-gray-200 shrink-0 cursor-pointer ${
                    allProductsOpen
                      ? 'bg-primary text-white'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  <LayoutGrid size={15} />
                  <span>Tous les Produits</span>
                  <ChevronDown size={13} className={`transition-transform duration-200 ${allProductsOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* ONGLETS DES CATÉGORIES (Responsive & Sans collision) */}
              <div className="hidden lg:flex items-center min-w-0">
                {/* 1. Catégories toujours visibles sur lg+ (0 à 4 : Flyers, Cartes, Affiches, Roll-ups, Brochures) */}
                {NAV_CATEGORIES.slice(0, 5).map((cat, idx) => {
                  const isActive = activeMega === idx
                  const isCurrentRoute = pathname.includes(cat.href.replace('/catalogue/', ''))
                  return (
                    <div
                      key={cat.id}
                      className="relative shrink-0"
                      onMouseEnter={() => handleCatEnter(idx)}
                      onMouseLeave={handleCatLeave}
                    >
                      <Link
                        href={cat.href}
                        className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                          isActive
                            ? 'text-primary border-primary bg-emerald-50/60 font-bold'
                            : isCurrentRoute
                              ? 'text-primary border-primary font-bold'
                              : 'text-gray-700 hover:text-primary border-transparent hover:border-primary'
                        }`}
                      >
                        <span>{cat.label}</span>
                      </Link>
                    </div>
                  )
                })}

                {/* 2. Catégorie 5 (Textile Pro) visible dès xl (>= 1280px) */}
                <div
                  className="relative shrink-0 hidden xl:block"
                  onMouseEnter={() => handleCatEnter(5)}
                  onMouseLeave={handleCatLeave}
                >
                  <Link
                    href={NAV_CATEGORIES[5].href}
                    className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                      activeMega === 5
                        ? 'text-primary border-primary bg-emerald-50/60 font-bold'
                        : pathname.includes(NAV_CATEGORIES[5].href.replace('/catalogue/', ''))
                          ? 'text-primary border-primary font-bold'
                          : 'text-gray-700 hover:text-primary border-transparent hover:border-primary'
                    }`}
                  >
                    <span>{NAV_CATEGORIES[5].label}</span>
                  </Link>
                </div>

                {/* 3. Catégorie 6 (Goodies VIP) visible dès xl (>= 1280px) */}
                <div
                  className="relative shrink-0 hidden xl:block"
                  onMouseEnter={() => handleCatEnter(6)}
                  onMouseLeave={handleCatLeave}
                >
                  <Link
                    href={NAV_CATEGORIES[6].href}
                    className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                      activeMega === 6
                        ? 'text-primary border-primary bg-emerald-50/60 font-bold'
                        : pathname.includes(NAV_CATEGORIES[6].href.replace('/catalogue/', ''))
                          ? 'text-primary border-primary font-bold'
                          : 'text-gray-700 hover:text-primary border-transparent hover:border-primary'
                    }`}
                  >
                    <span>{NAV_CATEGORIES[6].label}</span>
                  </Link>
                </div>

                {/* 4. Catégorie 7 (Stickers & Packaging) visible dès 2xl (>= 1536px) */}
                <div
                  className="relative shrink-0 hidden 2xl:block"
                  onMouseEnter={() => handleCatEnter(7)}
                  onMouseLeave={handleCatLeave}
                >
                  <Link
                    href={NAV_CATEGORIES[7].href}
                    className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                      activeMega === 7
                        ? 'text-primary border-primary bg-emerald-50/60 font-bold'
                        : pathname.includes(NAV_CATEGORIES[7].href.replace('/catalogue/', ''))
                          ? 'text-primary border-primary font-bold'
                          : 'text-gray-700 hover:text-primary border-transparent hover:border-primary'
                    }`}
                  >
                    <span>{NAV_CATEGORIES[7].label}</span>
                  </Link>
                </div>

                {/* 5. Dropdown "Autres supports ▾" (Visible sous 2xl pour les catégories non affichées) */}
                <div
                  className="relative shrink-0 2xl:hidden"
                  onMouseEnter={handleMoreEnter}
                  onMouseLeave={handleMoreLeave}
                >
                  <button
                    type="button"
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                      moreMenuOpen
                        ? 'text-primary border-primary bg-emerald-50/60 font-bold'
                        : 'text-gray-700 hover:text-primary border-transparent hover:border-primary'
                    }`}
                  >
                    <span>Autres supports</span>
                    <ChevronDown size={12} className={`transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Panneau Déroulant "Autres supports" */}
                  {moreMenuOpen && (
                    <div
                      className="absolute top-full left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 text-gray-800 animate-in fade-in slide-in-from-top-1 duration-150"
                      onMouseEnter={handleMoreEnter}
                      onMouseLeave={handleMoreLeave}
                    >
                      {/* Textile (si sous xl) */}
                      <Link
                        href={NAV_CATEGORIES[5].href}
                        onClick={() => setMoreMenuOpen(false)}
                        onMouseEnter={() => handleCatEnter(5)}
                        className="xl:hidden flex items-center justify-between px-3.5 py-2 text-xs hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Shirt size={14} className="text-primary" />
                          <span className="font-medium">{NAV_CATEGORIES[5].label}</span>
                        </div>
                        <ChevronRight size={13} className="text-gray-400" />
                      </Link>
                      {/* Goodies (si sous xl) */}
                      <Link
                        href={NAV_CATEGORIES[6].href}
                        onClick={() => setMoreMenuOpen(false)}
                        onMouseEnter={() => handleCatEnter(6)}
                        className="xl:hidden flex items-center justify-between px-3.5 py-2 text-xs hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Gift size={14} className="text-primary" />
                          <span className="font-medium">{NAV_CATEGORIES[6].label}</span>
                        </div>
                        <ChevronRight size={13} className="text-gray-400" />
                      </Link>
                      {/* Packaging (si sous 2xl) */}
                      <Link
                        href={NAV_CATEGORIES[7].href}
                        onClick={() => setMoreMenuOpen(false)}
                        onMouseEnter={() => handleCatEnter(7)}
                        className="flex items-center justify-between px-3.5 py-2 text-xs hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Box size={14} className="text-primary" />
                          <span className="font-medium">{NAV_CATEGORIES[7].label}</span>
                        </div>
                        <ChevronRight size={13} className="text-gray-400" />
                      </Link>

                      <div className="border-t border-gray-100 my-1 pt-1">
                        <Link
                          href="/catalogue"
                          onClick={() => setMoreMenuOpen(false)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-2xs font-bold text-primary hover:text-emerald-800 transition-colors"
                        >
                          <span>Voir tout le catalogue ({NAV_CATEGORIES.length} univers)</span>
                          <ArrowRight size={11} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* ════════════════════════════════════════════════════════════════════
              MASTER MEGA CATALOGUE DÉROULANT STYLE JUMIA (DOUBLE VOLET)
          ════════════════════════════════════════════════════════════════════ */}
          {allProductsOpen && (
            <>
              {/* Scrim Overlay transparent */}
              <div
                className="fixed inset-0 top-[138px] bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-200 pointer-events-none"
              />

              <div className="hidden lg:block absolute left-0 right-0 top-full z-50 pointer-events-none">
                <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
                  <div
                    className="absolute left-4 md:left-6 top-0 z-50 w-[960px] max-w-[calc(100vw-3rem)] bg-white rounded-b-3xl shadow-[0_30px_80px_rgba(0,0,0,0.25)] border border-gray-200/90 text-gray-900 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 pointer-events-auto"
                    onMouseEnter={handleMasterEnter}
                    onMouseLeave={handleMasterLeave}
                  >
                    {/* EN-TÊTE ÉPURÉ */}
                    <div className="flex items-center justify-between px-6 py-3.5 bg-gray-50 border-b border-gray-200/80">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-display font-extrabold text-xs uppercase tracking-wider text-gray-900">
                          Catalogue Industriel de l'Atelier
                        </span>
                        <span className="text-gray-400 text-xs">•</span>
                        <span className="text-xs text-gray-500 font-medium">
                          Tarifs direct usine en FCFA
                        </span>
                      </div>
                      <Link
                        href="/catalogue"
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
                      >
                        <span>Tout le catalogue ({NAV_CATEGORIES.length} univers)</span>
                        <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    {/* CORPS : DOUBLE VOLET (SIDEBAR GAUCHE + PANNEAU CONTENU DROIT) */}
                    <div className="flex items-stretch min-h-[440px]">
                      
                      {/* 1. VOLET GAUCHE : LISTE DES RAYONS AVEC ICÔNES ET INDICATEURS */}
                      <div className="w-[300px] shrink-0 bg-gray-50/90 p-2.5 border-r border-gray-200/80 space-y-1">
                        {NAV_CATEGORIES.map((cat, idx) => {
                          const Icon = cat.icon
                          const isSelected = masterCatIndex === idx
                          return (
                            <button
                              key={cat.id}
                              onMouseEnter={() => setMasterCatIndex(idx)}
                              onClick={() => setMasterCatIndex(idx)}
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-white text-emerald-950 shadow-xs border border-gray-200/90 font-bold'
                                  : 'text-gray-700 hover:bg-gray-100/90 hover:text-gray-900 font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-emerald-700 text-white shadow-2xs'
                                    : 'bg-white text-gray-600 border border-gray-200'
                                }`}>
                                  <Icon size={14} />
                                </div>
                                <span className="text-xs truncate">{cat.label}</span>
                              </div>
                              <ChevronRight size={13} className={`shrink-0 ml-1 transition-transform ${isSelected ? 'text-emerald-600 translate-x-0.5' : 'text-gray-400'}`} />
                            </button>
                          )
                        })}
                      </div>

                      {/* 2. VOLET DROIT DYNAMIQUE : SOUS-FORMATS + ENCART VEDETTE DE LA CATÉGORIE ACTIVE */}
                      {(() => {
                        const activeCatData = NAV_CATEGORIES[masterCatIndex] || NAV_CATEGORIES[0]
                        return (
                          <div className="flex-1 p-6 bg-white flex flex-col justify-between">
                            
                            <div>
                              {/* Titre de rayon et tarif direct */}
                              <div className="flex items-center justify-between pb-3 mb-5 border-b border-gray-100">
                                <div>
                                  <h3 className="font-display font-extrabold text-base text-gray-950">
                                    {activeCatData.label}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    Production en atelier à Ouagadougou · Papier certifié et finitions offset
                                  </p>
                                </div>
                                <Link
                                  href={activeCatData.href}
                                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
                                >
                                  <span>Voir tous les modèles</span>
                                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                              </div>

                              {/* Grille Formats (7/12) + Carte Promo (5/12) */}
                              <div className="grid grid-cols-12 gap-6 items-start">
                                
                                {/* Colonnes de liens Formats et Papiers */}
                                <div className="col-span-7 grid grid-cols-2 gap-5 divide-x divide-gray-100">
                                  {activeCatData.columns.slice(0, 2).map((col, cIdx) => (
                                    <div key={cIdx} className={cIdx > 0 ? 'pl-5' : ''}>
                                      <h4 className="font-extrabold text-2xs uppercase tracking-wider text-gray-400 mb-3">
                                        {col.title}
                                      </h4>
                                      <ul className="space-y-1.5">
                                        {col.items.slice(0, 5).map((item, iIdx) => (
                                          <li key={iIdx}>
                                            <Link
                                              href={item.href}
                                              className="group/item flex items-center text-xs text-gray-700 hover:text-emerald-700 hover:font-bold transition-colors py-0.5"
                                            >
                                              <span className="truncate group-hover/item:translate-x-0.5 transition-transform">
                                                {item.label}
                                              </span>
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>

                                {/* Carte Encart Produit Vedette */}
                                <div className="col-span-5 bg-gray-50 rounded-2xl border border-gray-200/80 p-3.5 flex flex-col justify-between group">
                                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-gray-100 mb-2.5">
                                    <Image
                                      src={activeCatData.featured.imageUrl}
                                      alt={activeCatData.featured.title}
                                      fill
                                      priority
                                      unoptimized
                                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                                      sizes="240px"
                                    />
                                    <div className="absolute top-2 left-2 bg-emerald-700 text-white text-2xs font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
                                      {activeCatData.featured.badge}
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <h5 className="font-bold text-xs text-gray-900 leading-snug line-clamp-1">
                                      {activeCatData.featured.title}
                                    </h5>
                                    <div className="flex items-baseline gap-2 pt-0.5">
                                      <span className="tabular-nums font-extrabold text-sm text-gray-950">
                                        {activeCatData.featured.price}
                                      </span>
                                    </div>
                                  </div>

                                  <Link
                                    href={activeCatData.featured.href}
                                    className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gray-950 hover:bg-emerald-700 text-white text-2xs font-bold transition-all shadow-xs active:scale-95"
                                  >
                                    <span>Découvrir</span>
                                    <ArrowRight size={12} />
                                  </Link>
                                </div>

                              </div>
                            </div>

                            {/* Puces bas de panneau droit */}
                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-2xs text-gray-500">
                              <span className="flex items-center gap-1 font-medium">
                                <CheckCircle2 size={13} className="text-emerald-600" /> BAT 300 DPI offert
                              </span>
                              <span className="flex items-center gap-1 font-medium">
                                <Clock size={13} className="text-emerald-600" /> Prêt en 24h à 48h
                              </span>
                              <Link href="/devis" className="font-bold text-emerald-700 hover:underline">
                                Devis sur mesure →
                              </Link>
                            </div>

                          </div>
                        )
                      })()}

                    </div>

                  </div>
                </div>
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              MEGA MENU ÉPURÉ, COMPACT & RAPIDE (Style Moderne Apple / Stripe)
          ════════════════════════════════════════════════════════════════════ */}
          {activeCategory && (
            <>
              {/* Voile d'ombrage ultra-léger */}
              <div
                className="fixed inset-0 top-[138px] bg-black/15 z-40 transition-opacity duration-150 pointer-events-none"
              />

              {/* Panneau Déroulant Compact & Épuré */}
              <div
                className="hidden lg:block absolute left-0 right-0 top-full z-50 bg-white border-b border-gray-200 shadow-xl text-gray-900 transition-all animate-in fade-in slide-in-from-top-1 duration-150"
                onMouseEnter={handleMegaEnter}
                onMouseLeave={handleMegaLeave}
              >
                <div className="max-w-6xl mx-auto px-6 py-4">
                  
                  {/* Ligne En-tête Compacte */}
                  <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-gray-100">
                    <span className="font-display font-extrabold text-sm text-gray-900 tracking-tight">
                      {activeCategory.label}
                    </span>
                    <Link
                      href={activeCategory.href}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group transition-colors"
                    >
                      <span>Voir toute la gamme</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* Grille Épurée : Colonnes de Liens Lisibles (Aucun prix parasite, aucun badge bruyant) */}
                  <div className="grid grid-cols-12 gap-8 items-start">
                    
                    {/* 3 Colonnes de Liens Produits (9/12) */}
                    <div className="col-span-9 grid grid-cols-3 gap-6 divide-x divide-gray-100">
                      {activeCategory.columns.map((col, cIdx) => (
                        <div key={cIdx} className={cIdx > 0 ? 'pl-6' : ''}>
                          <h4 className="font-mono text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            {col.title}
                          </h4>
                          <ul className="space-y-1">
                            {col.items.map((item, iIdx) => (
                              <li key={iIdx}>
                                <Link
                                  href={item.href}
                                  className="text-xs text-gray-700 hover:text-emerald-600 hover:font-bold transition-colors block py-0.5 whitespace-normal leading-snug"
                                >
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Visuel Miniature Discret & Élégant (3/12) */}
                    <div className="col-span-3 border-l border-gray-100 pl-6 flex flex-col justify-center">
                      <Link
                        href={activeCategory.featured?.href || activeCategory.href}
                        className="group block relative rounded-xl overflow-hidden bg-gray-50 border border-gray-200/80 p-2.5 hover:border-emerald-500/50 hover:shadow-xs transition-all"
                      >
                        <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-gray-100 mb-2">
                          <Image
                            src={activeCategory.featured?.imageUrl || '/images/products/flyers-depliants.jpg'}
                            alt={activeCategory.label}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="200px"
                          />
                        </div>
                        <p className="font-bold text-xs text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                          {activeCategory.featured?.title || activeCategory.label}
                        </p>
                        <span className="text-2xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                          <span>Découvrir</span>
                          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </Link>
                    </div>

                  </div>

                </div>
              </div>
            </>
          )}

        </nav>
      </header>

      {/* ══════════════════════════════════════════════════════
          MOBILE: TIROIR LATÉRAL RESPONSIVE (STYLE JUMIA PUR)
      ══════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <>
          {/* Overlay flouté sombre */}
          <div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer glissant depuis la GAUCHE (Style Jumia Mobile) */}
          <div className="fixed top-0 left-0 bottom-0 z-[70] w-[84vw] max-w-xs sm:max-w-sm bg-white md:hidden flex flex-col shadow-2xl text-gray-900 animate-in slide-in-from-left duration-250">
            
            {/* Header du Drawer (Croix Gauche + Logo YopoePrint) */}
            <div className="px-3 h-14 border-b border-gray-100 flex items-center gap-2.5 bg-white shrink-0">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-gray-800 hover:bg-gray-100 rounded-lg active:scale-95 transition-transform cursor-pointer"
                aria-label="Fermer le menu"
              >
                <X size={22} className="stroke-[2.2]" />
              </button>
              <Logo theme="light" size="sm" showSubtitle={false} />
            </div>

            {/* Corps Déroulant du Drawer */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              
              {/* SECTION 1 : BESOIN D'AIDE ? & VOTRE COMPTE (Style Jumia) */}
              <div className="border-b border-gray-100 divide-y divide-gray-100">
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 text-xs font-extrabold tracking-wider text-gray-800 uppercase transition-colors"
                >
                  <span>BESOIN D'AIDE?</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </Link>

                <Link
                  href={isLoggedIn ? "/mon-compte" : "/connexion"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 text-xs font-extrabold tracking-wider text-gray-800 uppercase transition-colors"
                >
                  <span>
                    {isLoggedIn && user?.firstName ? `VOTRE COMPTE (${user.firstName})` : 'VOTRE COMPTE YOPOEPRINT'}
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </Link>
              </div>

              {/* SECTION 1.5 : RACCOURCIS AVEC ICÔNES LIGNES ÉPURÉES (Style Jumia) */}
              <div className="py-1.5 border-b border-gray-100">
                <Link
                  href={isLoggedIn ? "/mon-compte" : "/connexion"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-2.5 text-gray-700 hover:text-emerald-700 hover:bg-gray-50 transition-colors"
                >
                  <Package size={18} className="text-gray-500 stroke-[1.8] shrink-0" />
                  <span className="text-xs font-medium text-gray-800">Vos commandes</span>
                </Link>

                <Link
                  href="/devis"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-2.5 text-gray-700 hover:text-emerald-700 hover:bg-gray-50 transition-colors"
                >
                  <FileCheck size={18} className="text-gray-500 stroke-[1.8] shrink-0" />
                  <span className="text-xs font-medium text-gray-800">Vos devis d'imprimerie</span>
                </Link>

                <div
                  onClick={() => {
                    handleCopyPromo()
                  }}
                  className="flex items-center justify-between px-4 py-2.5 text-gray-700 hover:text-emerald-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Tag size={18} className="text-gray-500 stroke-[1.8] shrink-0" />
                    <span className="text-xs font-medium text-gray-800">Bons d'achat & Promo</span>
                  </div>
                  <span className="text-2xs font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {copiedPromo ? 'Copié !' : '-15% YOPPRINT15'}
                  </span>
                </div>

                <Link
                  href="/catalogue"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-2.5 text-gray-700 hover:text-emerald-700 hover:bg-gray-50 transition-colors"
                >
                  <Heart size={18} className="text-gray-500 stroke-[1.8] shrink-0" />
                  <span className="text-xs font-medium text-gray-800">Favoris</span>
                </Link>
              </div>

              {/* SECTION 2 : NOS CATÉGORIES (Style Jumia avec Icônes fines) */}
              <div className="py-2.5">
                <div className="flex items-center justify-between px-4 py-1.5 mb-1">
                  <span className="text-2xs font-bold uppercase tracking-wider text-gray-500">
                    NOS CATÉGORIES
                  </span>
                  <Link
                    href="/catalogue"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    Voir plus
                  </Link>
                </div>

                <div className="space-y-0.5">
                  {NAV_CATEGORIES.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <Link
                        key={cat.id}
                        href={cat.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3.5 px-4 py-2.5 hover:bg-gray-50 text-gray-800 hover:text-emerald-700 transition-colors group"
                      >
                        <Icon size={18} className="text-gray-500 group-hover:text-emerald-600 stroke-[1.8] shrink-0" />
                        <span className="text-xs font-medium text-gray-800 group-hover:text-emerald-700">
                          {cat.label}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* SECTION 3 : ASSISTANCE ATELIER RAPIDE */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/80 mt-2 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <Phone size={14} className="text-primary shrink-0" />
                  <span>Hotline Atelier : {CONTACT_PHONE_DISPLAY}</span>
                </div>
                <p className="text-2xs text-gray-500 leading-relaxed">
                  Ouagadougou & Bobo-Dioulasso · Facturation IFU normalisée
                </p>
              </div>

            </div>

          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════
          MOBILE: OVERLAY RECHERCHE PLEIN ÉCRAN
      ══════════════════════════════════════════════════════ */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-white md:hidden flex flex-col">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex-1 relative flex items-center">
              <Search size={18} className="absolute left-3 text-gray-400" />
              <input
                type="search"
                placeholder="Cartes, flyers, roll-up, bâches..."
                autoFocus
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-900 outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto p-4">
            {navSearchResults.length > 0 ? (
              <div className="space-y-2">
                <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-2">Produits trouvés</p>
                {navSearchResults.map((prod) => (
                  <Link
                    key={prod.id || prod._id}
                    href={`/produit/${prod.slug}`}
                    onClick={() => { setSearchOpen(false); setNavSearch('') }}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-bold text-xs text-gray-900">{prod.name}</p>
                      <p className="text-2xs text-gray-500">{prod.category}</p>
                    </div>
                    <span className="font-bold text-xs text-emerald-600 tabular-nums">
                      {new Intl.NumberFormat('fr-FR').format(prod.basePrice)} F
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-2xs font-bold uppercase tracking-wider text-gray-400">Recherches fréquentes</p>
                <div className="flex flex-wrap gap-2">
                  {['Flyers A5', 'Cartes de visite', 'Roll-up 85×200', 'Bâche PVC', 'Brochures', 'T-shirts'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setNavSearch(term)}
                      className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-700"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
