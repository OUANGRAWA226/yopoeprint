import { Product, NavCategory, PaymentOption } from '@/types'

// ─── Navigation Categories ─────────────────────────────────────
export const NAV_CATEGORIES: NavCategory[] = [
 { label: 'Flyers & Affiches', slug: 'flyers', emoji: '📄', href: '/catalogue/flyers' },
 { label: 'Cartes de visite', slug: 'cartes-de-visite', emoji: '🪪', href: '/catalogue/cartes-de-visite' },
 { label: 'Brochures', slug: 'brochures', emoji: '📚', href: '/catalogue/brochures' },
 { label: 'Goodies', slug: 'goodies', emoji: '🎁', href: '/catalogue/goodies' },
 { label: 'Textile', slug: 'textile', emoji: '👕', href: '/catalogue/textile' },
 { label: 'Événementiel', slug: 'evenementiel', emoji: '🎪', href: '/catalogue/evenementiel' },
 { label: 'Signalétique', slug: 'signaletique', emoji: '🪧', href: '/catalogue/signaletique' },
 { label: 'Corporate', slug: 'corporate', emoji: '📦', href: '/catalogue/corporate' },
]

// ─── Products Mock Data ────────────────────────────────────────
export const PRODUCTS: Product[] = [
 {
 id: '1',
 slug: 'flyer-a5-classique',
 name: 'Flyer A5 classique',
 description: 'Flyer idéal pour la communication événementielle et commerciale. Impression haute qualité recto/verso sur papier couché.',
 shortDesc: 'Recto/Verso · Papier couché 135g · 5 formats',
 category: 'flyers',
 badge: 'popular',
 emoji: '📄',
 bgGradient: 'linear-gradient(135deg, #E8EEF8, #C5D4F0)',
 basePrice: 8500,
 minQuantity: 500,
 formats: [
 { id: 'a6', label: 'A6', dimensions: '105×148mm' },
 { id: 'a5', label: 'A5', dimensions: '148×210mm' },
 { id: 'a4', label: 'A4', dimensions: '210×297mm' },
 { id: 'a3', label: 'A3', dimensions: '297×420mm' },
 ],
 papers: [
 { id: 'couche-135', label: 'Couché mat 135g', description: 'Standard, rendu professionnel' },
 { id: 'couche-170', label: 'Couché brillant 170g', description: 'Couleurs éclatantes, premium' },
 { id: 'couche-250', label: 'Couché mat 250g', description: 'Épais, carte semi-rigide' },
 ],
 quantities: [250, 500, 1000, 2000, 5000],
 finishes: [
 { id: 'none', label: 'Sans finition', value: 'none', priceModifier: 0 },
 { id: 'mat', label: 'Pelliculage mat', value: 'mat', priceModifier: 2000 },
 { id: 'brillant', label: 'Pelliculage brillant', value: 'brillant', priceModifier: 2000 },
 ],
 deliveryDays: 2,
 popular: true,
 },
 {
 id: '2',
 slug: 'carte-de-visite-standard',
 name: 'Carte de visite standard',
 description: 'La carte de visite professionnelle par excellence. Format standard 85×55mm avec finitions au choix.',
 shortDesc: '85×55mm · Plusieurs finitions · Livraison rapide',
 category: 'cartes-de-visite',
 badge: 'popular',
 emoji: '🪪',
 bgGradient: 'linear-gradient(135deg, #FDF6E3, #F0E0A0)',
 basePrice: 6200,
 minQuantity: 250,
 formats: [
 { id: 'standard', label: 'Standard', dimensions: '85×55mm' },
 { id: 'carre', label: 'Carré', dimensions: '55×55mm' },
 { id: 'mini', label: 'Mini', dimensions: '70×45mm' },
 ],
 papers: [
 { id: 'couche-350', label: 'Couché mat 350g', description: 'Standard professionnel' },
 { id: 'couche-400', label: 'Couché brillant 400g', description: 'Premium, épais' },
 { id: 'soft-touch', label: 'Soft Touch 400g', description: 'Toucher velours unique' },
 ],
 quantities: [100, 250, 500, 1000],
 finishes: [
 { id: 'none', label: 'Sans finition', value: 'none', priceModifier: 0 },
 { id: 'mat', label: 'Pelliculage mat', value: 'mat', priceModifier: 1500 },
 { id: 'vernis', label: 'Vernis sélectif UV', value: 'vernis', priceModifier: 3500 },
 ],
 deliveryDays: 2,
 popular: true,
 },
 {
 id: '3',
 slug: 'affiche-a3-premium',
 name: 'Affiche A3 premium',
 description: 'Affiche grand format pour vos événements, promotions et communication interne. Papier couché brillant haute résolution.',
 shortDesc: 'Papier couché brillant 200g · Couleurs éclatantes',
 category: 'affiches',
 badge: 'new',
 emoji: '🗓️',
 bgGradient: 'linear-gradient(135deg, #E8F5ED, #A8D5B5)',
 basePrice: 12000,
 minQuantity: 100,
 formats: [
 { id: 'a3', label: 'A3', dimensions: '297×420mm' },
 { id: 'a2', label: 'A2', dimensions: '420×594mm' },
 { id: 'a1', label: 'A1', dimensions: '594×841mm' },
 { id: '60x80',label: '60×80', dimensions: '600×800mm' },
 ],
 papers: [
 { id: 'couche-200', label: 'Couché brillant 200g', description: 'Couleurs vives, standard' },
 { id: 'couche-250', label: 'Couché brillant 250g', description: 'Rigide, premium' },
 { id: 'bache', label: 'Bâche PVC 440g', description: 'Résistant, intérieur/extérieur' },
 ],
 quantities: [10, 25, 50, 100, 250],
 finishes: [
 { id: 'none', label: 'Sans finition', value: 'none', priceModifier: 0 },
 { id: 'mat', label: 'Pelliculage mat', value: 'mat', priceModifier: 3000 },
 ],
 deliveryDays: 3,
 popular: false,
 },
 {
 id: '4',
 slug: 'brochure-3-volets',
 name: 'Brochure 3 volets',
 description: 'Dépliant 3 volets idéal pour présenter vos services, produits ou activités. Format A4 plié en trois.',
 shortDesc: 'Format A4 plié · Papier satiné · Finition professionnelle',
 category: 'brochures',
 badge: 'promo',
 emoji: '📚',
 bgGradient: 'linear-gradient(135deg, #F8E8E8, #F0C0C0)',
 basePrice: 18500,
 minQuantity: 200,
 formats: [
 { id: 'a4-3v', label: 'A4 — 3 volets', dimensions: 'A4 plié en 3' },
 { id: 'a4-2v', label: 'A4 — 2 volets', dimensions: 'A4 plié en 2' },
 { id: 'a3-3v', label: 'A3 — 3 volets', dimensions: 'A3 plié en 3' },
 ],
 papers: [
 { id: 'satine-135', label: 'Satiné 135g', description: 'Toucher doux, professionnel' },
 { id: 'satine-170', label: 'Satiné 170g', description: 'Épais, premium' },
 { id: 'couche-mat', label: 'Couché mat 150g', description: 'Rendu élégant' },
 ],
 quantities: [100, 200, 500, 1000],
 finishes: [
 { id: 'none', label: 'Sans finition', value: 'none', priceModifier: 0 },
 { id: 'mat', label: 'Pelliculage mat', value: 'mat', priceModifier: 4000 },
 { id: 'brillant',label: 'Pelliculage brillant',value: 'brillant',priceModifier: 4000 },
 ],
 deliveryDays: 3,
 popular: false,
 },
 {
 id: '5',
 slug: 'kakemono-roll-up',
 name: 'Kakémono Roll-up',
 description: 'Support de communication idéal pour salons, foires et showrooms. Structure aluminium légère incluse.',
 shortDesc: '85×200cm · Bâche HD · Structure incluse',
 category: 'roll-up',
 badge: null,
 emoji: '🪧',
 bgGradient: 'linear-gradient(135deg, #E8EEF8, #B8CCF0)',
 basePrice: 28000,
 minQuantity: 1,
 formats: [
 { id: '60x160', label: '60×160cm', dimensions: '600×1600mm' },
 { id: '85x200', label: '85×200cm', dimensions: '850×2000mm' },
 { id: '100x200', label: '100×200cm', dimensions: '1000×2000mm' },
 { id: '120x200', label: '120×200cm', dimensions: '1200×2000mm' },
 ],
 papers: [
 { id: 'bache-standard', label: 'Bâche PVC HD', description: 'Standard, intérieur' },
 { id: 'bache-premium', label: 'Bâche PVC Premium', description: 'Couleurs ultra-vives' },
 { id: 'textile', label: 'Tissu polyester', description: 'Léger, antireflet' },
 ],
 quantities: [1, 2, 5, 10],
 finishes: [
 { id: 'none', label: 'Sans finition', value: 'none', priceModifier: 0 },
 ],
 deliveryDays: 4,
 popular: false,
 },
 {
 id: '6',
 slug: 'tote-bag-coton',
 name: 'Tote bag coton',
 description: 'Sac en coton naturel sérigraphié, idéal pour les événements, boutiques et offres promotionnelles.',
 shortDesc: 'Sérigraphie 1 à 4 couleurs · 38×42cm · Éco-responsable',
 category: 'goodies',
 badge: 'new',
 emoji: '🎁',
 bgGradient: 'linear-gradient(135deg, #FDF6E3, #EDD880)',
 basePrice: 32000,
 minQuantity: 20,
 formats: [
 { id: '38x42', label: '38×42cm', dimensions: '380×420mm' },
 { id: '42x48', label: '42×48cm', dimensions: '420×480mm' },
 ],
 papers: [
 { id: 'coton-140', label: 'Coton naturel 140g', description: 'Standard, écologique' },
 { id: 'coton-180', label: 'Coton épais 180g', description: 'Résistant, premium' },
 ],
 quantities: [20, 50, 100, 250, 500],
 finishes: [
 { id: '1c', label: '1 couleur', value: '1c', priceModifier: 0 },
 { id: '2c', label: '2 couleurs', value: '2c', priceModifier: 3000 },
 { id: '4c', label: '4 couleurs', value: '4c', priceModifier: 7000 },
 ],
 deliveryDays: 5,
 popular: false,
 },
 {
 id: '7',
 slug: 'tshirt-personnalise',
 name: 'T-shirt personnalisé',
 description: 'T-shirt 100% coton avec impression DTG haute définition. Disponible dans toutes les tailles et couleurs.',
 shortDesc: 'Impression DTG · Toutes tailles · Rendu haute qualité',
 category: 'textile',
 badge: null,
 emoji: '👕',
 bgGradient: 'linear-gradient(135deg, #E8F5ED, #90C8A0)',
 basePrice: 4500,
 minQuantity: 1,
 formats: [
 { id: 'xs', label: 'XS', dimensions: 'Tour poitrine: 84-88cm' },
 { id: 's', label: 'S', dimensions: 'Tour poitrine: 88-92cm' },
 { id: 'm', label: 'M', dimensions: 'Tour poitrine: 92-96cm' },
 { id: 'l', label: 'L', dimensions: 'Tour poitrine: 96-100cm' },
 { id: 'xl', label: 'XL', dimensions: 'Tour poitrine: 100-104cm' },
 { id: 'xxl', label: 'XXL', dimensions: 'Tour poitrine: 104-108cm' },
 ],
 papers: [
 { id: 'coton-180', label: 'Coton 180g blanc', description: 'Classique, toutes impressions' },
 { id: 'coton-noir', label: 'Coton 180g noir', description: 'Impression spéciale fond sombre' },
 { id: 'coton-col', label: 'Coton 180g coloré',description: 'Choix de couleur au devis' },
 ],
 quantities: [1, 5, 10, 25, 50, 100],
 finishes: [
 { id: 'dtg', label: 'Impression DTG', value: 'dtg', priceModifier: 0 },
 { id: 'serigraphie',label: 'Sérigraphie', value: 'serigraphie',priceModifier: 2000 },
 { id: 'broderie', label: 'Broderie', value: 'broderie', priceModifier: 5000 },
 ],
 deliveryDays: 5,
 popular: false,
 },
 {
 id: '8',
 slug: 'etiquettes-rouleau',
 name: 'Étiquettes en rouleau',
 description: 'Étiquettes autocollantes en rouleau, résistantes et disponibles dans de nombreuses formes.',
 shortDesc: 'Formes au choix · Papier brillant ou mat · Résistant',
 category: 'signaletique',
 badge: 'promo',
 emoji: '🏷️',
 bgGradient: 'linear-gradient(135deg, #F0E8F8, #C8A8E8)',
 basePrice: 14200,
 minQuantity: 500,
 formats: [
 { id: 'rond-4', label: 'Rond Ø4cm', dimensions: '40mm' },
 { id: 'rond-6', label: 'Rond Ø6cm', dimensions: '60mm' },
 { id: 'rect-5x3', label: 'Rectangle 5×3', dimensions: '50×30mm' },
 { id: 'rect-9x5', label: 'Rectangle 9×5', dimensions: '90×50mm' },
 { id: 'ovale', label: 'Ovale 6×4', dimensions: '60×40mm' },
 ],
 papers: [
 { id: 'papier-brillant', label: 'Papier brillant', description: 'Couleurs vives, standard' },
 { id: 'papier-mat', label: 'Papier mat', description: 'Rendu élégant' },
 { id: 'transparent', label: 'Transparent', description: 'Discret sur tout support' },
 { id: 'resistant-eau', label: 'PP résistant eau', description: 'Extérieur, frigo, bouteilles' },
 ],
 quantities: [500, 1000, 2500, 5000],
 finishes: [
 { id: 'none', label: 'Sans finition', value: 'none', priceModifier: 0 },
 { id: 'decoupe', label: 'Découpe personnalisée', value: 'decoupe', priceModifier: 5000 },
 ],
 deliveryDays: 3,
 popular: false,
 },
]

// ─── Payment Options ───────────────────────────────────────────
export const PAYMENT_OPTIONS: PaymentOption[] = [
 {
 id: 'orange-money',
 label: 'Orange Money',
 icon: '🟠',
 description: 'Paiement instantané via Orange Money BF',
 available: true,
 },
 {
 id: 'moov-money',
 label: 'Moov Money',
 icon: '🔵',
 description: 'Paiement via Moov / Telecel Money',
 available: true,
 },
 {
 id: 'visa',
 label: 'Carte Visa',
 icon: '💳',
 description: 'Paiement sécurisé par carte bancaire',
 available: true,
 },
 {
 id: 'mastercard',
 label: 'Mastercard',
 icon: '💳',
 description: 'Paiement sécurisé par carte bancaire',
 available: true,
 },
 {
 id: 'virement',
 label: 'Virement bancaire',
 icon: '🏦',
 description: 'Pour commandes B2B > 100 000 FCFA',
 available: true,
 },
]

// ─── Price Calculator ──────────────────────────────────────────
export function calculatePrice(
 product: Product,
 quantity: number,
 finishModifier: number = 0,
 isRectoverso: boolean = false
): { total: number; unitPrice: number } {
 // Base price scale by quantity (degressive pricing)
 const quantityRatio = product.minQuantity / quantity
 const baseTotal = product.basePrice * Math.max(quantityRatio, 0.3)

 // Scale proportionally for quantities > minQuantity
 const quantityMultiplier = quantity / product.minQuantity
 let total = product.basePrice * Math.pow(quantityMultiplier, 0.75)

 // Recto/verso adds 60% to total
 if (isRectoverso) total *= 1.6

 // Add finish cost
 total += finishModifier

 // Round to nearest 100 FCFA
 total = Math.round(total / 100) * 100

 return {
 total,
 unitPrice: Math.round((total / quantity) * 10) / 10,
 }
}

// ─── Format price in FCFA ─────────────────────────────────────
export function formatPrice(amount: number): string {
 return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}
