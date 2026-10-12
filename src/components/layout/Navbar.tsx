'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Search, ShoppingCart, User, X, ChevronRight, LogOut,
  Menu, ArrowRight, LayoutGrid, Loader2, FileText, CreditCard,
  Image as ImageIcon, BookOpen, Flag, Shirt, Gift, Box,
  Sparkles, CheckCircle2, ShieldCheck, Phone, Clock, Percent,
  Zap, Truck, ChevronDown
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuthContext } from '@/context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { productsService } from '@/lib/products.service'

// ─── Structure de Données E-Commerce Professionnelle (Standard Helloprint & Jumia) ───
export interface NavCategory {
  id: string
  label: string
  href: string
  icon: any
  tag?: string
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
    tag: 'Populaire',
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
      imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop',
    },
  },
  {
    id: 'cartes',
    label: 'Cartes de Visite',
    href: '/catalogue/cartes',
    icon: CreditCard,
    tag: 'Indispensable',
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
      imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop',
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
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
    },
  },
  {
    id: 'roll-up',
    label: 'Roll-ups & Salons',
    href: '/catalogue/roll-up',
    icon: Flag,
    tag: 'Spécial SIAO/SNC',
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
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop',
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
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
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
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
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
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
    },
  },
  {
    id: 'packaging',
    label: 'Stickers & Packaging',
    href: '/catalogue/etiquettes',
    icon: Box,
    tag: 'Nouveau',
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
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=600&auto=format&fit=crop',
    },
  },
]

export function Navbar() {
  const { itemCount, openCart } = useCart()
  const { user, isLoggedIn, logout } = useAuthContext()
  const pathname = usePathname()
  const router = useRouter()

  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMega, setActiveMega] = useState<number | null>(null)
  const [allProductsHover, setAllProductsHover] = useState(false)
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    setAllProductsHover(false)
  }, [pathname])

  useEffect(() => {
    if (mobileMenuOpen || searchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen, searchOpen])

  // Mega Menu Hover Delays (Avoid accidental triggers)
  const handleCatEnter = (idx: number) => {
    if (megaTimer.current) clearTimeout(megaTimer.current)
    setActiveMega(idx)
    setAllProductsHover(false)
  }
  const handleCatLeave = () => {
    megaTimer.current = setTimeout(() => setActiveMega(null), 180)
  }
  const handleMegaEnter = () => {
    if (megaTimer.current) clearTimeout(megaTimer.current)
  }
  const handleMegaLeave = () => {
    megaTimer.current = setTimeout(() => setActiveMega(null), 180)
  }

  const activeCategory = activeMega !== null ? NAV_CATEGORIES[activeMega] : null

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          HEADER PRINCIPAL (Standard Apple & Helloprint)
      ══════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-[#1D1D1F] border-b border-white/10 shadow-md">
        
        {/* LIGNE 1 : LOGO + RECHERCHE CENTRALE + ACTIONS UTILISATEUR */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo YopoePrint */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-gray-950 font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              Y
            </div>
            <div className="leading-none">
              <span className="font-display font-black text-xl text-white tracking-tight">
                Yopoe<span className="text-emerald-400">Print</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-gray-400 font-semibold mt-0.5">
                Imprimerie en ligne · BF
              </span>
            </div>
          </Link>

          {/* Recherche Prédictive E-Commerce (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4 relative" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <div className="relative flex items-center">
                <Search size={17} className="absolute left-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Rechercher cartes, flyers, roll-up, bâches, t-shirts…"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-[#1D1D1F] placeholder:text-gray-400 focus:placeholder:text-gray-500 rounded-full py-2.5 pl-11 pr-24 text-xs sm:text-sm border border-white/10 focus:border-emerald-500 outline-none transition-all duration-200 shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold px-3.5 py-1.5 rounded-full text-xs transition-colors flex items-center gap-1 shadow-xs"
                >
                  {searchLoading ? <Loader2 size={13} className="animate-spin" /> : <span>Trouver</span>}
                </button>
              </div>
            </form>

            {/* Dropdown de Résultats Prédictifs */}
            {searchFocused && navSearch.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden z-[60] text-slate-900 animate-in fade-in slide-in-from-top-1">
                {searchLoading ? (
                  <div className="p-5 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                    <Loader2 size={15} className="animate-spin text-emerald-600" />
                    <span>Recherche des produits en atelier...</span>
                  </div>
                ) : navSearchResults.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Suggestions immédiates
                    </div>
                    {navSearchResults.map((prod) => (
                      <Link
                        key={prod.id || prod._id}
                        href={`/produit/${prod.slug}`}
                        onClick={() => { setSearchFocused(false); setNavSearch('') }}
                        className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0 group-hover:bg-emerald-50">
                            {prod.emoji || '📦'}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-900 group-hover:text-emerald-600 transition-colors">
                              {prod.name}
                            </p>
                            <p className="text-[11px] text-gray-500">{prod.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block font-medium">Dès</span>
                          <span className="font-bold text-xs text-emerald-600 font-mono">
                            {new Intl.NumberFormat('fr-FR').format(prod.basePrice)} FCFA
                          </span>
                        </div>
                      </Link>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full text-center text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-slate-50 hover:bg-slate-100 py-3 border-t border-gray-100 transition-colors"
                    >
                      Voir tous les résultats pour "{navSearch}" →
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-gray-500">
                    <p className="font-bold text-slate-800 mb-1">Aucun résultat trouvé pour "{navSearch}"</p>
                    <p className="text-[11px] text-gray-400">Essayez avec "cartes", "flyers", "roll-up" ou "bâche".</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions Droite : Devis B2B + Mon Compte + Panier */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Bouton Devis Express B2B (Bureau) */}
            <Link
              href="/devis"
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 transition-all"
            >
              <Zap size={14} className="text-amber-400" />
              <span>Devis sous 2h</span>
            </Link>

            {/* Espace Client */}
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2 pl-2">
                <Link
                  href="/mon-compte"
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full hover:bg-white/10 text-white text-xs font-medium transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.firstName || 'Mon Compte'}</span>
                </Link>
                <button
                  onClick={logout}
                  title="Déconnexion"
                  className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                href="/connexion"
                className="hidden sm:flex items-center gap-1.5 py-1.5 px-3.5 rounded-full hover:bg-white/10 text-gray-200 hover:text-white text-xs font-semibold transition-colors"
              >
                <User size={16} />
                <span>Connexion</span>
              </Link>
            )}

            {/* Panier Interactif Apple style */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 py-2 px-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs transition-all shadow-md active:scale-95 ml-1"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Panier</span>
              {itemCount > 0 && (
                <span className="bg-gray-950 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Bouton Mobile : Recherche */}
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 text-gray-300 hover:text-white rounded-lg active:bg-white/10"
              aria-label="Recherche"
            >
              <Search size={20} />
            </button>

            {/* Bouton Mobile : Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-300 hover:text-white rounded-lg active:bg-white/10"
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} />
            </button>
          </div>

        </div>

        {/* LIGNE 2 : BARRE DE CATÉGORIES (Standard Helloprint avec Déclenchement Mega Menu) */}
        <nav className="border-t border-white/10 bg-[#141416] relative">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
            
            <div className="flex items-center overflow-x-auto scrollbar-none py-0 flex-1">
              
              {/* TRIGGER MEGA CATALOGUE COMPLET : "Toutes les catégories" */}
              <div
                className="relative shrink-0"
                onMouseEnter={() => { setAllProductsHover(true); setActiveMega(null) }}
                onMouseLeave={() => setAllProductsHover(false)}
              >
                <Link
                  href="/catalogue"
                  className={`flex items-center gap-2 py-3 px-4 text-xs font-extrabold transition-all border-r border-white/10 shrink-0 ${
                    allProductsHover
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/5 text-emerald-400 hover:bg-white/10 hover:text-emerald-300'
                  }`}
                >
                  <LayoutGrid size={15} />
                  <span>Tous les Produits</span>
                  <ChevronDown size={13} className={`transition-transform duration-200 ${allProductsHover ? 'rotate-180' : ''}`} />
                </Link>

                {/* MEGA CATALOGUE COMPLET DÉROULANT (Style Helloprint & Jumia) */}
                {allProductsHover && (
                  <div
                    className="absolute left-0 top-full z-50 w-[840px] bg-white rounded-b-3xl shadow-[0_30px_70px_rgba(0,0,0,0.22)] border border-gray-200 p-6 text-slate-900 animate-in fade-in slide-in-from-top-1 duration-150"
                    onMouseEnter={() => setAllProductsHover(true)}
                    onMouseLeave={() => setAllProductsHover(false)}
                  >
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                      <div>
                        <span className="font-display font-black text-sm text-slate-900">
                          Catalogue Général YopoePrint
                        </span>
                        <span className="text-xs text-gray-500 block">
                          Plus de 200 supports d'impression industrielle livrables au Burkina Faso
                        </span>
                      </div>
                      <Link
                        href="/catalogue"
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
                      >
                        <span>Tout le catalogue</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    {/* Grille 4 colonnes des 8 grandes catégories avec icônes vectorielles */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {NAV_CATEGORIES.map((cat) => {
                        const Icon = cat.icon
                        return (
                          <Link
                            key={cat.id}
                            href={cat.href}
                            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/60 hover:border-emerald-300 transition-all group flex flex-col justify-between"
                          >
                            <div className="flex items-start gap-3 mb-2">
                              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors shadow-2xs shrink-0">
                                <Icon size={18} />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-600 transition-colors block truncate">
                                  {cat.label}
                                </span>
                                <span className="text-[10px] text-gray-500 block font-mono">
                                  Dès {cat.startingPrice}
                                </span>
                              </div>
                            </div>
                            <span className="text-[11px] text-gray-500 font-medium line-clamp-1">
                              {cat.columns[0]?.items[0]?.label || 'Voir les modèles'}
                            </span>
                          </Link>
                        )
                      })}
                    </div>

                    {/* Bandeau inférieur pro */}
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs bg-slate-50/80 -mx-6 -mb-6 px-6 py-3.5 rounded-b-3xl">
                      <div className="flex items-center gap-5 text-gray-600 font-medium">
                        <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-600" /> Factures conformes DGI</span>
                        <span className="flex items-center gap-1.5"><Truck size={14} className="text-emerald-600" /> Livraison Ouaga & Bobo</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-600" /> BAT numérique offert</span>
                      </div>
                      <Link href="/entreprises" className="font-bold text-amber-700 hover:underline flex items-center gap-1">
                        Packs Entreprises & Grands Comptes →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* ONGLETS DES CATÉGORIES (Desktop : Hover pour afficher le Mega Menu) */}
              <div className="hidden lg:flex items-center">
                {NAV_CATEGORIES.map((cat, idx) => {
                  const isActive = activeMega === idx
                  const isCurrentRoute = pathname.includes(cat.href.replace('/catalogue/', ''))
                  return (
                    <div
                      key={cat.id}
                      className="relative"
                      onMouseEnter={() => handleCatEnter(idx)}
                      onMouseLeave={handleCatLeave}
                    >
                      <Link
                        href={cat.href}
                        className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                          isActive
                            ? 'text-white border-emerald-400 bg-white/5'
                            : isCurrentRoute
                              ? 'text-emerald-400 border-emerald-500'
                              : 'text-gray-300 hover:text-white border-transparent hover:border-gray-500'
                        }`}
                      >
                        <span>{cat.label}</span>
                        {cat.tag && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {cat.tag}
                          </span>
                        )}
                      </Link>
                    </div>
                  )
                })}
              </div>

            </div>

            {/* Lien B2B Corporate fixe à droite */}
            <div className="hidden sm:flex items-center gap-4 shrink-0 pl-3">
              <Link
                href="/entreprises"
                className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 py-3 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Espace Entreprises (DGI)</span>
              </Link>
            </div>

          </div>

          {/* ════════════════════════════════════════════════════════════════════
              LE VRAI MEGA MENU E-COMMERCE PROFESSIONNEL (Clean White Canvas)
              Inspiré de Helloprint et Jumia, avec la finition soignée Apple
          ════════════════════════════════════════════════════════════════════ */}
          {activeCategory && (
            <>
              {/* Scrim Overlay transparent pour focaliser le regard */}
              <div
                className="fixed inset-0 top-[112px] bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-200 pointer-events-none"
              />

              {/* Panneau Déroulant Blanc Lumineux & Pro */}
              <div
                className="hidden lg:block absolute left-0 right-0 top-full z-50 bg-white border-b border-gray-200 shadow-[0_30px_70px_rgba(0,0,0,0.18)] text-slate-900 transition-all animate-in fade-in slide-in-from-top-1 duration-150"
                onMouseEnter={handleMegaEnter}
                onMouseLeave={handleMegaLeave}
              >
                <div className="max-w-7xl mx-auto px-6 py-8">
                  
                  {/* Grille principale : 3 Colonnes de Liens Thématiques + 1 Colonne Promo Encarts */}
                  <div className="grid grid-cols-12 gap-8 items-start">
                    
                    {/* COLONNES 1, 2, 3 (9 colonnes sur 12) : 3 sous-listes organisées */}
                    <div className="col-span-8 grid grid-cols-3 gap-6 divide-x divide-gray-100">
                      {activeCategory.columns.map((col, cIdx) => (
                        <div key={cIdx} className={cIdx > 0 ? 'pl-6' : ''}>
                          <h4 className="font-display font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                            <span>{col.title}</span>
                          </h4>

                          <ul className="space-y-1.5">
                            {col.items.map((item, iIdx) => (
                              <li key={iIdx}>
                                <Link
                                  href={item.href}
                                  className="group/link flex items-center justify-between py-1.5 px-2 rounded-xl text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition-all"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="truncate group-hover/link:translate-x-0.5 transition-transform">
                                      {item.label}
                                    </span>
                                    {item.badge && (
                                      <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  {item.price && (
                                    <span className="shrink-0 text-[11px] font-semibold text-gray-400 group-hover/link:text-emerald-600 font-mono ml-2">
                                      {item.price}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* COLONNE 4 (4 colonnes sur 12) : Carte Promo Photographique Helloprint style */}
                    <div className="col-span-4 bg-slate-50 border border-slate-200/80 rounded-3xl p-5 flex flex-col justify-between overflow-hidden relative group">
                      
                      {/* Badge Promo / Nouveauté */}
                      <div className="flex items-center justify-between mb-3 z-10">
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-xs">
                          <Percent size={11} /> {activeCategory.featured.badge}
                        </span>
                        {activeCategory.featured.discount && (
                          <span className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                            {activeCategory.featured.discount}
                          </span>
                        )}
                      </div>

                      {/* Image Miniature Pro */}
                      <div className="aspect-[16/9] w-full relative rounded-2xl overflow-hidden mb-3.5 shadow-xs border border-gray-100">
                        <Image
                          src={activeCategory.featured.imageUrl}
                          alt={activeCategory.featured.title}
                          fill
                          sizes="360px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Description & Prix */}
                      <div className="space-y-1.5 mb-4 z-10">
                        <h4 className="font-display font-extrabold text-sm text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                          {activeCategory.featured.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                          {activeCategory.featured.subtitle}
                        </p>
                        
                        <div className="pt-2 flex items-baseline gap-2">
                          <span className="font-display font-black text-base text-slate-900 font-mono">
                            {activeCategory.featured.price}
                          </span>
                          {activeCategory.featured.oldPrice && (
                            <span className="text-xs text-gray-400 line-through font-mono">
                              {activeCategory.featured.oldPrice}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                          <Truck size={12} /> {activeCategory.featured.delivery}
                        </p>
                      </div>

                      {/* Bouton CTA Direct */}
                      <div className="space-y-2 z-10 pt-2 border-t border-slate-200/60">
                        <Link
                          href={activeCategory.featured.href}
                          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-sm active:scale-95"
                        >
                          <span>Configurer & Commander</span>
                          <ArrowRight size={13} />
                        </Link>
                        <Link
                          href={activeCategory.href}
                          className="w-full block text-center text-[11px] font-semibold text-gray-500 hover:text-slate-900 transition-colors"
                        >
                          Voir toute la gamme {activeCategory.label} →
                        </Link>
                      </div>

                    </div>

                  </div>

                  {/* Bandeau d'Assurance d'Atelier sous le Mega Menu */}
                  <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-6">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <CheckCircle2 size={14} className="text-emerald-600" /> Contrôle PAO & Résolution 300 DPI offert
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <ShieldCheck size={14} className="text-emerald-600" /> Garantie Satisfait ou Réimprimé
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Clock size={14} className="text-emerald-600" /> Délais garantis atelier Ouaga
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <Link href="/guide-impression" className="font-bold text-emerald-700 hover:underline">
                        Consulter le guide technique →
                      </Link>
                      <Link href="/devis" className="font-bold text-slate-900 hover:text-emerald-600">
                        Demander un devis sur mesure
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
          MOBILE: TIROIR LATÉRAL RESPONSIVE COMPLET
      ══════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed top-0 right-0 bottom-0 z-[70] w-[88vw] max-w-sm bg-white md:hidden flex flex-col shadow-2xl text-slate-900">
            
            {/* Header du Drawer */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <span className="font-display font-black text-base text-slate-900">
                Menu YopoePrint
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-200/80 text-slate-700 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profil Mobile */}
            <div className="p-4 border-b border-gray-100 bg-white">
              {isLoggedIn ? (
                <div className="flex items-center justify-between">
                  <Link
                    href="/mon-compte"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                      {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{user?.firstName || 'Mon Compte'}</p>
                      <p className="text-[11px] text-gray-500">Compte vérifié</p>
                    </div>
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false) }} className="text-xs text-red-600 font-bold">
                    Quitter
                  </button>
                </div>
              ) : (
                <Link
                  href="/connexion"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  <User size={15} />
                  <span>Se connecter à mon compte</span>
                </Link>
              )}
            </div>

            {/* Liste Déroulante des Catégories */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Nos Catégories Produits
              </div>

              {NAV_CATEGORIES.map((cat) => {
                const Icon = cat.icon
                return (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                        <Icon size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{cat.label}</span>
                        <span className="text-[10px] text-gray-400 font-mono">Dès {cat.startingPrice}</span>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )
              })}

              <div className="pt-4 border-t border-gray-100 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Espace Entreprises & Support
                </div>

                <Link
                  href="/entreprises"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-bold"
                >
                  <span>🏢 Espace Entreprises (DGI)</span>
                  <ChevronRight size={15} />
                </Link>

                <Link
                  href="/guide-impression"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-medium"
                >
                  <span>Guide technique & Gabarits</span>
                  <ChevronRight size={15} />
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-medium"
                >
                  <span>Nous contacter & Atelier</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </nav>

            {/* Footer Mobile Drawer */}
            <div className="p-4 border-t border-gray-100 bg-slate-50 space-y-2">
              <Link
                href="/devis"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
              >
                <span>Demander un devis express</span>
                <ArrowRight size={14} />
              </Link>
              <p className="text-[10px] text-center text-gray-400">
                Atelier Ouagadougou · Tél : +226 70 00 00 00
              </p>
            </div>

          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════
          MOBILE: OVERLAY RECHERCHE PLEIN ÉCRAN
      ══════════════════════════════════════════════════════ */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-white md:hidden flex flex-col">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 p-3 border-b border-gray-200 bg-slate-50">
            <div className="flex-1 relative flex items-center">
              <Search size={18} className="absolute left-3 text-gray-400" />
              <input
                type="search"
                placeholder="Cartes, flyers, roll-up, bâches..."
                autoFocus
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-full text-xs font-medium text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-2 text-gray-500 hover:text-slate-900"
            >
              <X size={20} />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto p-4">
            {navSearchResults.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Produits trouvés</p>
                {navSearchResults.map((prod) => (
                  <Link
                    key={prod.id || prod._id}
                    href={`/produit/${prod.slug}`}
                    onClick={() => { setSearchOpen(false); setNavSearch('') }}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900">{prod.name}</p>
                      <p className="text-[11px] text-gray-500">{prod.category}</p>
                    </div>
                    <span className="font-bold text-xs text-emerald-600 font-mono">
                      {new Intl.NumberFormat('fr-FR').format(prod.basePrice)} F
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Recherches fréquentes</p>
                <div className="flex flex-wrap gap-2">
                  {['Flyers A5', 'Cartes de visite', 'Roll-up 85×200', 'Bâche PVC', 'Brochures', 'T-shirts'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setNavSearch(term)}
                      className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700"
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
