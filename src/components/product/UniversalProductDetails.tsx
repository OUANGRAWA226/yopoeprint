'use client'

import React, { useState } from 'react'
import {
  PackageCheck,
  Wrench,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Check,
  ChevronDown,
  Layers,
  Flame,
  Award,
  Clock,
  FileDown,
  AlertCircle,
  Building2,
  Truck,
  Palette,
  FileCheck,
  HelpCircle as QuestionIcon
} from 'lucide-react'

interface FormatItem {
  id: string
  label: string
  dimensions?: string
  multiplier?: number
}

interface PaperItem {
  id: string
  label: string
  description?: string
  priceExtra?: number
}

interface FinishItem {
  id: string
  label: string
  value?: string
  priceModifier?: number
}

interface UniversalProductProps {
  product: {
    id: string
    slug: string
    name: string
    category?: string
    shortDesc?: string
    description?: string
    basePrice?: number
    minQuantity?: number
    deliveryDays?: number
    formats?: FormatItem[]
    papers?: PaperItem[]
    quantities?: number[]
    finishes?: FinishItem[]
    badge?: string | null
    emoji?: string
  }
}

// ─── HELPER : Récupération du profil thématique par catégorie ────────────────
function getCategoryProfile(category: string = '', slug: string = '', name: string = '') {
  const cat = (category || '').toLowerCase()
  const s = (slug || '').toLowerCase()
  const n = (name || '').toLowerCase()

  // 1. Roll-up / Kakemono
  if (cat === 'roll-up' || s.includes('roll-up') || s.includes('kakemono') || n.includes('kakémono') || n.includes('roll up')) {
    return {
      type: 'rollup',
      pill: 'Exposition nomade N°1 au Burkina Faso',
      valueProp: 'La solution d\'exposition clé en main : caisson aluminium anodisé haute résistance, visuel HD pré-monté et sac de transport matelassé offert. Déployable en 30 secondes sans outil.',
      badge1: { icon: Clock, label: 'Montage en', value: '30 secondes' },
      badge2: { icon: PackageCheck, label: 'Sac matelassé', value: 'Inclus offert' },
      badge3: { icon: Flame, label: 'Bâche norme', value: 'Anti-feu M1' },
      badge4: { icon: Award, label: 'Impression', value: 'HD 1200 DPI' },
      packTitle: 'Kit d\'exposition complet 100% prêt à dérouler',
      packSub: 'Aucun montage technique requis à la réception : le visuel est directement installé et tendu dans l\'enrouleur.',
      packCards: [
        { icon: '🗄️', title: 'Boîtier aluminium anodisé', desc: 'Carter léger et ultra robuste avec ressort interne haute endurance et 2 pieds pivotants à 360° pour une stabilité maximale dans les halls d\'exposition.', tag: 'Double pied stabilisateur' },
        { icon: '🖼️', title: 'Visuel HD monté en atelier', desc: 'Impression numérique haute définition 1200 DPI réels avec encres UV écologiques. Toile pré-montée avec tension calibrée en usine.', tag: 'Prêt à dérouler' },
        { icon: '📏', title: 'Mât télescopique 3 sections', desc: 'Tubes en aluminium résistant reliés par un élastique intérieur (système type tente de camping). Emboîtement instantané en quelques secondes.', tag: 'Emboîtement express' },
        { icon: '🎒', title: 'Sac de transport matelassé OFFERT', desc: 'Housse en toile Oxford 600D noire renforcée avec mousse intérieure anti-choc, double fermeture éclair et bandoulière de portage.', tag: 'Inclus sans supplément', highlight: true },
      ],
      guideTitle: 'Guide de montage express en 30 secondes',
      guideSub: 'Une seule personne suffit, aucun outil ni vis requis.',
      guideSteps: [
        { num: '1', icon: '🦶', title: 'Déployez les pieds', desc: 'Sortez le caisson de sa housse, déposez-le au sol et faites pivoter les deux pieds métalliques à 90° perpendiculairement au carter.' },
        { num: '2', icon: '🦯', title: 'Assemblez le mât vertical', desc: 'Emboîtez les 3 sections du mât (guidées par l\'élastique) et insérez fermement l\'extrémité inférieure dans l\'orifice central du boîtier.' },
        { num: '3', icon: '🚀', title: 'Déroulez et clipsez', desc: 'Tirez doucement la barre supérieure vers le haut avec les deux mains et encochez la réglette au sommet du mât. Votre stand est prêt !' },
      ],
      guideAlert: 'Conseil d\'expert : Pour le rangement, tenez fermement la réglette supérieure à deux mains et accompagnez la descente de la toile jusqu\'au carter. Ne lâchez jamais la toile d\'un coup.',
      paoDimensions: '850 × 2000 mm (Standard)',
      paoBleed: 'Laisser 50 mm (5 cm) en bas dans le tambour + 10 mm en haut sous le clip',
      paoResolution: '150 à 300 DPI à l\'échelle 1:1',
      paoColor: 'CMJN (Fogra 39)',
      paoAlert: 'Marge technique basse : Ne placez aucun logo, texte ni coordonnées dans les 5 derniers centimètres du bas du fichier (cette zone s\'enroule dans le tambour intérieur).',
      usages: [
        { icon: '🎪', title: 'Foires & Salons professionnels', desc: 'Indispensable pour habiller votre stand lors du SIAO, SITHO, SAMAO et foires régionales à Ouagadougou et Bobo-Dioulasso.' },
        { icon: '🎤', title: 'Conférences & Séminaires d\'entreprises', desc: 'Arrière-plan parfait pour vos tribunes, conférences de presse et assemblées générales dans les hôtels (Lancaster, Silmandé, Laïco).' },
        { icon: '🏢', title: 'Halls d\'accueil & Sièges sociaux', desc: 'Présentez vos nouveaux services, vos certifications ou vos produits bancaires dès l\'entrée de vos agences et bureaux.' },
        { icon: '🛍️', title: 'Points de vente & Animations commerciales', desc: 'PLV mobile et élégante pour vos lancements promotionnels en boutiques, centres commerciaux et galeries.' },
      ],
      faqs: [
        { q: 'Le sac de transport est-il bien inclus ?', a: 'Oui, absolument ! Chaque roll-up commandé est livré dans sa housse de transport matelassée avec anse et bandoulière sans aucun supplément.' },
        { q: 'Peut-on remplacer le visuel plus tard sur la même structure ?', a: 'Oui ! La mécanique en aluminium est réutilisable pendant des années. Vous pouvez recommander uniquement la recharge imprimée lors de vos prochains événements.' },
        { q: 'Puis-je commander maintenant et envoyer mon visuel plus tard ?', a: 'Oui, choisissez l\'option "Envoyer plus tard (WhatsApp)". Notre équipe prendra contact avec vous pour recevoir votre maquette ou vous aider à la concevoir.' },
        { q: 'Recevrai-je un Bon À Tirer (BAT) avant l\'impression ?', a: 'Oui. YopoePrint fournit un BAT numérique gratuit pour chaque commande. Nos graphistes vérifient la résolution et les marges avant tout tirage.' },
      ]
    }
  }

  // 2. Cartes de visite
  if (cat === 'cartes-de-visite' || s.includes('carte') || n.includes('carte de visite')) {
    return {
      type: 'cartes',
      pill: 'Votre première impression professionnelle',
      valueProp: 'La carte de visite haut de gamme qui valorise votre réputation d\'affaires : papier couché 350g à 400g extra-rigide, massicotage laser précis et boîtes de protection offertes.',
      badge1: { icon: Award, label: 'Papier rigide', value: '350g à 400g' },
      badge2: { icon: PackageCheck, label: 'Boîte distributrice', value: 'Incluse offerte' },
      badge3: { icon: Palette, label: 'Finitions', value: 'Mat, Brillant, UV' },
      badge4: { icon: Truck, label: 'Livraison express', value: 'J+2 Ouagadougou' },
      packTitle: 'Conditionnement soigné prêt pour vos rendez-vous',
      packSub: 'Toutes nos cartes de visite sont livrées sous boîtes de protection rigides pour éviter les coins cornés.',
      packCards: [
        { icon: '🪪', title: 'Papier d\'art extra-rigide', desc: 'Couché professionnel 350g ou 400g garantissant une tenue ferme en main sans aucun effet carton mou.', tag: 'Rigidité certifiée' },
        { icon: '📦', title: 'Boîte distributrice rigide', desc: 'Chaque lot de 100 ou 250 cartes est emballé dans une boîte rigide protectrice cristal ou carton pour votre mallette ou bureau.', tag: 'Boîte offerte' },
        { icon: '✨', title: 'Pelliculage protecteur au choix', desc: 'Pelliculage mat soyeux anti-rayures, brillant éclatant ou Soft Touch velours haut de gamme.', tag: 'Toucher d\'exception' },
        { icon: '✂️', title: 'Découpe laser au millimètre', desc: 'Bords parfaitement nets et réguliers, coins droits ou arrondis selon votre charte graphique.', tag: 'Finition zéro défaut' },
      ],
      guideTitle: 'Conseils pour des cartes de visite percutantes',
      guideSub: 'Les bonnes pratiques pour le réseautage au Burkina Faso et en Afrique de l\'Ouest.',
      guideSteps: [
        { num: '1', icon: '📱', title: 'Numéro WhatsApp avec indicatif', desc: 'Mentionnez toujours le préfixe international (+226) et un contact WhatsApp actif : 90% des échanges professionnels se font via WhatsApp.' },
        { num: '2', icon: '📍', title: 'Adresse et localisation claire', desc: 'Précisez votre quartier ou zone d\'activité (ex: Ouaga 2000, Koulouba, Zone Industrielle Bobo) pour rassurer vos partenaires.' },
        { num: '3', icon: '🪪', title: 'Conservation propre', desc: 'Conservez toujours vos cartes dans leur boîte distributrice ou un porte-cartes métallique pour préserver la netteté des tranches.' },
      ],
      guideAlert: 'Conseil graphique : Privilégiez une typographie d\'au moins 7 points pour le texte secondaire et 8 à 10 points pour les coordonnées afin de garantir une parfaite lisibilité.',
      paoDimensions: '85 × 55 mm (Format portefeuille universel)',
      paoBleed: '2 mm de fond perdu tout autour (format fichier : 89 × 59 mm)',
      paoResolution: '300 DPI réels',
      paoColor: 'CMJN (Fogra 39)',
      paoAlert: 'Zone de sécurité : Conservez impérativement tous vos textes, numéros et logos à au moins 3 mm à l\'intérieur du bord de coupe final.',
      usages: [
        { icon: '🤝', title: 'Rendez-vous d\'affaires & B2B', desc: 'L\'outil indispensable pour les dirigeants, consultants, commerciaux et professions libérales.' },
        { icon: '🎪', title: 'Salons & Foires (SIAO, SAMAO)', desc: 'Échangez rapidement vos coordonnées avec des prospects et partenaires locaux et internationaux.' },
        { icon: '🛍️', title: 'Commerces & Boutiques', desc: 'Cartes de fidélité, cartes de contact en caisse ou cartons d\'accompagnement dans les sacs.' },
        { icon: '💼', title: 'Équipes d\'entreprises', desc: 'Harmonisez l\'image de marque de tous vos collaborateurs avec des cartes aux standards corporate.' },
      ],
      faqs: [
        { q: 'Quel grammage choisir entre 350g et 400g ?', a: 'Le 350g est le standard professionnel le plus équilibré. Le 400g apporte une épaisseur encore plus prestigieuse particulièrement recommandée avec le pelliculage Soft Touch.' },
        { q: 'Peut-on imprimer le recto et le verso différemment ?', a: 'Oui ! Vous pouvez choisir Recto seul ou Recto/Verso avec vos informations au dos (logo, QR code, réseaux sociaux, plan d\'accès).' },
        { q: 'La boîte distributrice est-elle payante ?', a: 'Non, les boîtes de conditionnement protectrices sont incluses gratuitement avec toutes vos commandes de cartes.' },
        { q: 'Quel est le délai de livraison à Ouagadougou ?', a: 'La production et la livraison s\'effectuent sous 24h à 48h ouvrées après validation de votre BAT numérique.' },
      ]
    }
  }

  // 3. Flyers & Dépliants
  if (cat === 'flyers' || s.includes('flyer') || n.includes('flyer')) {
    return {
      type: 'flyers',
      pill: 'Communication commerciale percutante',
      valueProp: 'Le support roi pour vos campagnes publicitaires, événements et promotions : papier couché certifié, impression quadrichromie éclatante et emballage renforcé sous film protecteur.',
      badge1: { icon: Award, label: 'Papier couché', value: '135g à 250g' },
      badge2: { icon: PackageCheck, label: 'Conditionnement', value: 'Sous film étanche' },
      badge3: { icon: Palette, label: 'Couleurs', value: 'Quadri éclatante' },
      badge4: { icon: Truck, label: 'Livraison express', value: 'J+2 Ouagadougou' },
      packTitle: 'Conditionnement soigné par paquets étiquetés',
      packSub: 'Vos flyers sont livrés par paquets comptés sous film thermo-rétracté pour une conservation optimale contre la poussière.',
      packCards: [
        { icon: '📄', title: 'Papier couché haute brillance ou mat', desc: 'Papier de qualité supérieure 135g (distribution de masse), 170g (semi-rigide) ou 250g (prestige cartonné).', tag: 'Qualité certifiée' },
        { icon: '📦', title: 'Emballage protecteur sous film', desc: 'Conditionnement par paquets de 250 ou 500 exemplaires sous film rétracté pour protéger vos documents de la poussière et de l\'humidité.', tag: 'Protection anti-poussière' },
        { icon: '🎨', title: 'Encres haute fidélité', desc: 'Restitution fidèle des teintes de votre charte graphique avec un séchage UV instantané sans bavure.', tag: 'Couleurs vives' },
        { icon: '📐', title: 'Découpe droite massicot haute précision', desc: 'Bords nets et dimensions strictement respectées au demi-millimètre près.', tag: 'Précision d\'atelier' },
      ],
      guideTitle: 'Conseils pour maximiser le retour de vos flyers',
      guideSub: 'Comment concevoir une distribution efficace au Burkina Faso.',
      guideSteps: [
        { num: '1', icon: '🎯', title: 'Titre d\'accroche et offre claire', desc: 'Votre prospect décide en 3 secondes : placez une offre claire en gros caractères (ex: -20% sur présentation du flyer).' },
        { num: '2', icon: '📍', title: 'Localisation et appel à l\'action', desc: 'Mettez en avant votre numéro WhatsApp, votre page Facebook et un repère géographique familier à Ouaga ou Bobo.' },
        { num: '3', icon: '📦', title: 'Stockage à l\'abri de l\'humidité', desc: 'Conservez vos paquets de flyers dans un placard fermé ou dans leur carton de livraison pour éviter le gondolage dû aux variations climatiques.' },
      ],
      guideAlert: 'Conseil format : Le format A5 (15×21cm) est idéal pour présenter une gamme de produits ou un menu. Le format A6 (10×15cm) est le plus économique pour les distributions de rue.',
      paoDimensions: 'A5 (148×210 mm) ou A6 (105×148 mm)',
      paoBleed: '2 mm de fond perdu tout autour',
      paoResolution: '300 DPI réels',
      paoColor: 'CMJN (Fogra 39)',
      paoAlert: 'Marge intérieure : Conservez impérativement textes et logos à 3 mm minimum des bords de coupe.',
      usages: [
        { icon: '📢', title: 'Campagnes de street marketing', desc: 'Distribution de main à main aux carrefours, sorties d\'universités et centres commerciaux.' },
        { icon: '🍽️', title: 'Restaurants, Maquis & Fast-foods', desc: 'Menus à emporter, cartes de livraison express et promotions hebdomadaires.' },
        { icon: '🛍️', title: 'Promotions de boutiques & Salons', desc: 'Présentation de nouvelles collections de vêtements, cosmétiques ou offres de rentrée.' },
        { icon: '🎪', title: 'Événements, Concerts & Formations', desc: 'Programmes de séminaires, concerts live et invitations événementielles.' },
      ],
      faqs: [
        { q: 'Quel grammage choisir pour mes flyers ?', a: 'Pour une distribution de rue à grande échelle, le 135g couché brillant est le plus économique et dynamique. Pour laisser sur un comptoir ou un salon, le 170g ou 250g donne un aspect beaucoup plus haut de gamme.' },
        { q: 'Puis-je commander en recto seul ou recto/verso ?', a: 'Les deux options sont disponibles dans le configurateur. Le recto/verso permet de détailler vos services et tarifs sans surcharger la face avant.' },
        { q: 'Vérifiez-vous mon fichier avant impression ?', a: 'Oui, un graphiste vérifie systématiquement la résolution, les marges de coupe et les couleurs. Un BAT numérique vous est envoyé pour validation.' },
        { q: 'Quels sont les délais de livraison pour Ouagadougou ?', a: 'Vos flyers sont livrés sous 24h à 48h ouvrées après accord sur le BAT.' },
      ]
    }
  }

  // 4. Affiches & Posters
  if (cat === 'affiches' || s.includes('affiche') || n.includes('affiche')) {
    return {
      type: 'affiches',
      pill: 'Visibilité grand format éclatante',
      valueProp: 'Attirez tous les regards sur vos événements, campagnes et offres : papier couché brillant 200g à 250g, impression grand format haute résolution et résistance accrue à la décoloration.',
      badge1: { icon: Award, label: 'Papier couché', value: '200g à 250g' },
      badge2: { icon: PackageCheck, label: 'Protection', value: 'Tube / Emballage kraft' },
      badge3: { icon: Palette, label: 'Format max', value: 'Jusqu\'au A1 / 60×80' },
      badge4: { icon: Truck, label: 'Livraison express', value: 'J+2 Ouagadougou' },
      packTitle: 'Conditionnement soigné anti-froissement',
      packSub: 'Toutes nos affiches sont emballées à plat sous kraft épais ou roulées sous tube rigide pour arriver impeccables.',
      packCards: [
        { icon: '🖼️', title: 'Papier couché brillant d\'art', desc: 'Papier lourd 200g ou 250g offrant un éclat incomparable aux visuels publicitaires et photographiques.', tag: 'Brillance éclatante' },
        { icon: '☀️', title: 'Encres résistantes aux UV', desc: 'Pigments haute densité offrant une excellente tenue face à la lumière naturelle et l\'éclairage intérieur.', tag: 'Longue tenue' },
        { icon: '📦', title: 'Conditionnement sous tube ou à plat', desc: 'Protection renforcée évitant les plis et les déchirures lors du transport dans Ouagadougou et les provinces.', tag: 'Protection maximale' },
        { icon: '📐', title: 'Formats universels d\'affichage', desc: 'Formats standard A3, A2, A1 ou 60×80 cm compatibles avec tous les cadres et porte-affiches du marché.', tag: 'Formats standardisés' },
      ],
      guideTitle: 'Conseils pour un affichage réussi',
      guideSub: 'Comment poser et rentabiliser vos affiches.',
      guideSteps: [
        { num: '1', icon: '👀', title: 'Hauteur de vue optimale', desc: 'Collez vos affiches à hauteur des yeux (centre de l\'affiche à environ 1m60 du sol) pour une captation immédiate.' },
        { num: '2', icon: '🪧', title: 'Fixation propre', desc: 'Utilisez de la pâte adhésive repositionnable ou du ruban adhésif double-face spécifique pour ne pas endommager les murs ni la bâche.' },
        { num: '3', icon: '☀️', title: 'Emplacement stratégique', desc: 'Privilégiez les vitrines, halls d\'attente, panneaux d\'affichage réglementaires et entrées d\'immeubles d\'affaires.' },
      ],
      guideAlert: 'Conseil lisibilité : Vos textes principaux doivent pouvoir être lus à au moins 2 mètres de distance pour le format A3 et à plus de 5 mètres pour les formats A1 et 60×80 cm.',
      paoDimensions: 'A3 (297×420 mm), A2 (420×594 mm), A1 (594×841 mm)',
      paoBleed: '3 mm de fond perdu tout autour',
      paoResolution: '300 DPI (A3/A2) ou 150-200 DPI (A1)',
      paoColor: 'CMJN (Fogra 39)',
      paoAlert: 'Marges de sécurité : Gardez textes et visuels clés à au moins 5 mm des bords.',
      usages: [
        { icon: '🎪', title: 'Festivals, Concerts & Événements', desc: 'Annoncez vos spectacles, festivals culturels (FESPACO, SIAO) et événements sportifs.' },
        { icon: '🏢', title: 'Affichages internes d\'entreprises', desc: 'Notes de service, consignes d\'hygiène et sécurité, organigrammes et campagnes RSE.' },
        { icon: '🛍️', title: 'Vitrines de magasins & Boutiques', desc: 'Mettez en avant vos soldes, déstockages et arrivages de nouveaux produits.' },
        { icon: '🎓', title: 'Écoles, Universités & Instituts', desc: 'Journées portes ouvertes, rentrées académiques et programmes de formation.' },
      ],
      faqs: [
        { q: 'Quel format choisir pour mon événement ?', a: 'Le format A3 est parfait pour les intérieurs, vitrines et portes d\'entrée. Les formats A2 et A1 offrent une présence monumentale idéale pour les halls et façades.' },
        { q: 'Vos affiches résistent-elles en extérieur ?', a: 'Pour un affichage extérieur de longue durée exposé aux intempéries, nous vous conseillons de sélectionner l\'option Bâche PVC 440g dans le configurateur.' },
        { q: 'Comment mes affiches sont-elles protégées pour la livraison ?', a: 'Selon la quantité et le format, les affiches sont emballées à plat sous double carton rigide ou roulées sous tube cartonné scellé.' },
      ]
    }
  }

  // 5. Brochures & Dépliants 3 volets
  if (cat === 'brochures' || s.includes('brochure') || s.includes('depliant') || n.includes('brochure') || n.includes('dépliant')) {
    return {
      type: 'brochures',
      pill: 'Présentation d\'entreprise d\'exception',
      valueProp: 'La plaquette commerciale qui structure vos offres : papier satiné de prestige, rainage et pliage machine haute précision et finition zéro pli blanc.',
      badge1: { icon: Award, label: 'Papier d\'art', value: 'Satiné 135g à 170g' },
      badge2: { icon: PackageCheck, label: 'Pliage machine', value: 'Rainé sans pli blanc' },
      badge3: { icon: Palette, label: 'Volets', value: '2 ou 3 volets' },
      badge4: { icon: Truck, label: 'Livraison express', value: 'J+3 Ouagadougou' },
      packTitle: 'Pliage professionnel prêt pour distribution',
      packSub: 'Toutes nos brochures sont livrées pliées et emballées par paquets étanches.',
      packCards: [
        { icon: '📚', title: 'Papier couché satiné d\'art', desc: 'Toucher soyeux et doux au doigt, absence de reflets gênants sous la lumière pour un confort de lecture optimal.', tag: 'Toucher velouté' },
        { icon: '⚙️', title: 'Rainage préalable avant pli', desc: 'Rainage mécanique évitant toute craquelure du papier ou effritement de l\'encre au niveau des arêtes de pli.', tag: 'Zéro craquelure' },
        { icon: '📐', title: 'Pliage en accordéon ou roulé', desc: 'Pliage automatisé haute précision assurant des volets parfaitement alignés au millimètre.', tag: 'Alignement parfait' },
        { icon: '📦', title: 'Emballage sous film hermétique', desc: 'Paquets de 50 ou 100 exemplaires protégés de l\'air et de la poussière pour une conservation impeccable.', tag: 'Conservation pro' },
      ],
      guideTitle: 'Bien structurer votre brochure 3 volets',
      guideSub: 'Comment organiser vos 6 pages pour captiver vos clients.',
      guideSteps: [
        { num: '1', icon: '🏠', title: 'Page de couverture (Face avant)', desc: 'Logo, nom de l\'entreprise, slogan fort et visuel évocateur. Ne surchargez pas la première page.' },
        { num: '2', icon: '📖', title: 'Les 3 volets intérieurs (Au dépliement)', desc: 'C\'est le cœur de votre offre : détaillez vos prestations, tarifs, atouts différenciateurs et photos de réalisations.' },
        { num: '3', icon: '📞', title: 'Le volet arrière (Contact)', desc: 'Coordonnées complètes, numéro WhatsApp, plan d\'accès succinct, horaires d\'ouverture et certifications.' },
      ],
      guideAlert: 'Règle PAO essentielle : Pour un pli roulé, le volet qui se replie vers l\'intérieur doit mesurer 2 mm de moins en largeur (ex: 97 mm / 100 mm / 100 mm) pour ne pas gondoler.',
      paoDimensions: 'A4 ouvert (297 × 210 mm) plié en 3',
      paoBleed: '2 mm de fond perdu tout autour',
      paoResolution: '300 DPI réels',
      paoColor: 'CMJN (Fogra 39)',
      paoAlert: 'Repères de pli : Indiquez les lignes de pliage sur un calque séparé ou hors de la zone d\'impression utile.',
      usages: [
        { icon: '🏢', title: 'Plaquettes institutionnelles', desc: 'Présentez votre entreprise, votre vision, vos équipes et vos références clients.' },
        { icon: '🏦', title: 'Banques, Assurances & Microfinance', desc: 'Guides de souscription, présentation d\'offres de crédit, livrets d\'épargne et assurances.' },
        { icon: '🩺', title: 'Cliniques, Hôpitaux & Cabinets', desc: 'Brochures d\'information santé, spécialités médicales et guides de soins aux patients.' },
        { icon: '🏨', title: 'Hôtels, Écotourisme & Agences', desc: 'Dépliants touristiques, tarifs de chambres, circuits touristiques au Burkina et menus banquet.' },
      ],
      faqs: [
        { q: 'Quelle est la différence entre pli roulé et pli accordéon ?', a: 'Dans le pli roulé, le volet de droite se replie vers l\'intérieur. Dans le pli accordéon (en Z), les volets se déplient comme un accordéon. Les deux modèles sont réalisables au même tarif.' },
        { q: 'Le papier risque-t-il de se craqueler au pli ?', a: 'Non, car nous effectuons systématiquement un rainage mécanique préalable qui prépare la fibre du papier avant le pliage.' },
        { q: 'Quel grammage est conseillé ?', a: 'Le 135g satiné est très fluide et léger. Le 170g est notre best-seller car il offre une excellente main sans alourdir le document.' },
      ]
    }
  }

  // 6. Textile personnalisé (T-shirts, polos)
  if (cat === 'textile' || s.includes('tshirt') || s.includes('t-shirt') || n.includes('t-shirt') || n.includes('polo')) {
    return {
      type: 'textile',
      pill: 'Textile publicitaire & Corporate',
      valueProp: 'Habillez vos collaborateurs et fidélisez vos clients avec des textiles de qualité : coton peigné 180g doux au toucher, marquage numérique DTG ou sérigraphie haute résistance au lavage.',
      badge1: { icon: Award, label: 'Matière', value: '100% Coton peigné' },
      badge2: { icon: PackageCheck, label: 'Finition', value: 'Ensachage individuel' },
      badge3: { icon: Palette, label: 'Impression', value: 'DTG / Sérigraphie' },
      badge4: { icon: Truck, label: 'Livraison express', value: 'J+5 Ouagadougou' },
      packTitle: 'Conditionnement individuel sous sachet transparent',
      packSub: 'Chaque pièce est soigneusement pliée et ensachée avec son étiquette de taille apparente.',
      packCards: [
        { icon: '👕', title: 'Coton peigné 180g pré-rétréci', desc: 'Tissu épais et doux, coupe moderne avec col renforcé et coutures latérales indéformables.', tag: 'Confort respirant' },
        { icon: '🎨', title: 'Impression DTG ou Sérigraphie', desc: 'Impression directe dans la fibre pour un toucher sans surépaisseur ou sérigraphie industrielle pour grands volumes.', tag: 'Tenue au lavage' },
        { icon: '🏷️', title: 'Pliage et ensachage individuel', desc: 'Chaque vêtement est plié au format compact et glissé dans un sachet transparent prêt à remettre à vos collaborateurs.', tag: 'Distribution facile' },
        { icon: '📏', title: 'Toutes les tailles disponibles', desc: 'Large choix de tailles du XS au 3XL avec coupes adaptées homme, femme ou unisexe.', tag: 'Tailles universelles' },
      ],
      guideTitle: 'Conseils d\'entretien pour vos textiles',
      guideSub: 'Comment conserver l\'éclat des couleurs pendant des années.',
      guideSteps: [
        { num: '1', icon: '🧼', title: 'Lavage sur l\'envers à 30°C/40°C', desc: 'Lavez toujours vos t-shirts retournés sur l\'envers pour protéger les pigments d\'impression du frottement tambour.' },
        { num: '2', icon: '👔', title: 'Repassage sur l\'envers', desc: 'Ne passez jamais le fer chaud directement sur le visuel imprimé. Repassez toujours sur l\'envers du vêtement.' },
        { num: '3', icon: '☀️', title: 'Séchage naturel à l\'ombre', desc: 'Évitez le sèche-linge intensif et l\'exposition prolongée en plein soleil zénithal pour préserver la souplesse du coton.' },
      ],
      guideAlert: 'Fichier graphique : Préférez un fichier PNG transparent à 300 DPI à taille réelle pour que le fond ne vienne pas salir la couleur naturelle du t-shirt.',
      paoDimensions: 'A4 (20×29 cm) ou A3 (28×40 cm) sur buste',
      paoBleed: 'Aucun fond perdu requis',
      paoResolution: '300 DPI réels',
      paoColor: 'CMJN ou RVB (DTG)',
      paoAlert: 'Attention aux petits détails : Évitez les traits inférieurs à 0.5 mm pour garantir une parfaite adhérence de l\'encre.',
      usages: [
        { icon: '🏢', title: 'Uniformes & Équipes d\'entreprises', desc: 'Tenues professionnelles pour vos vendeurs, livreurs, techniciens et agents d\'accueil.' },
        { icon: '🎪', title: 'Événements & Séminaires', desc: 'T-shirts officiels pour salons, team building, journées d\'intégration et marathons.' },
        { icon: '🎁', title: 'Cadeaux promotionnels clients', desc: 'Fidélisez vos meilleurs partenaires avec un textile de qualité qu\'ils porteront avec fierté.' },
        { icon: '🎓', title: 'Associations, Clubs & Écoles', desc: 'T-shirts promotionnels pour promotions scolaires, clubs de sport et associations citoyennes.' },
      ],
      faqs: [
        { q: 'Puis-je panacher différentes tailles dans une même commande ?', a: 'Oui, tout à fait ! Vous pouvez panacher différentes tailles (S, M, L, XL, XXL) au moment de votre confirmation avec notre équipe.' },
        { q: 'Le marquage résiste-t-il bien aux lavages répétés ?', a: 'Oui, nos encres textiles subissent une fixation thermique à 160°C en atelier qui ancre les pigments au cœur de la fibre de coton.' },
        { q: 'Proposez-vous des t-shirts de différentes couleurs ?', a: 'Oui, nous proposons du blanc, du noir, du bleu marine, du gris chiné et d\'autres teintes sur demande dans notre atelier de Ouagadougou.' },
      ]
    }
  }

  // 7. Goodies & Tote Bags
  if (cat === 'goodies' || s.includes('tote-bag') || s.includes('sac') || n.includes('tote bag') || n.includes('goodies')) {
    return {
      type: 'goodies',
      pill: 'Cadeau d\'affaires éco-responsable',
      valueProp: 'Offrez un support publicitaire utile et durable : tote bag en coton naturel ou goodies marqués à votre image, conditionnés avec soin pour vos salons et séminaires.',
      badge1: { icon: Award, label: 'Matière', value: 'Coton naturel 140g/180g' },
      badge2: { icon: PackageCheck, label: 'Écologie', value: '100% Réutilisable' },
      badge3: { icon: Palette, label: 'Sérigraphie', value: '1 à 4 couleurs' },
      badge4: { icon: Truck, label: 'Livraison express', value: 'J+5 Ouagadougou' },
      packTitle: 'Conditionnement par cartons renforcés',
      packSub: 'Comptage vérifié et empilement soigné sous cartons étiquetés.',
      packCards: [
        { icon: '🌱', title: 'Toile coton naturelle écologique', desc: 'Matière végétale biodégradable 140g (souple et légère) ou 180g (toile épaisse ultra résistante).', tag: 'Éco-responsable' },
        { icon: '👜', title: 'Anses longues renforcées (65 cm)', desc: 'Porté épaule ou à la main très confortable avec coutures en croix haute résistance à la charge.', tag: 'Anses renforcées' },
        { icon: '🎨', title: 'Sérigraphie nette et durable', desc: 'Marquage 1 à 4 couleurs ou quadrichromie avec encres écologiques sans solvant toxique.', tag: 'Marquage pro' },
        { icon: '📦', title: 'Conditionnement par lots de 50', desc: 'Emballage propre en cartons rigides pour un transport facile lors de vos déplacements sur événement.', tag: 'Comptage certifié' },
      ],
      guideTitle: 'Le tote bag comme ambassadeur de marque',
      guideSub: 'Comment maximiser l\'impact de vos goodies publicitaires.',
      guideSteps: [
        { num: '1', icon: '🎁', title: 'Remise lors des salons', desc: 'Offrez le sac dès l\'entrée du stand : vos visiteurs y glisseront toutes les brochures du salon et promèneront votre marque toute la journée.' },
        { num: '2', icon: '🎨', title: 'Design esthétique et épuré', desc: 'Un visuel artistique ou un slogan inspirant donnera envie à vos clients de réutiliser le sac quotidiennement pour leurs courses.' },
        { num: '3', icon: '🧼', title: 'Lavage délicat', desc: 'Comme tout coton naturel non traité, privilégiez un lavage à la main à l\'eau froide pour éviter tout rétrécissement de la fibre.' },
      ],
      guideAlert: 'Conseil d\'usage : Le tote bag génère en moyenne plus de 3 000 impressions visuelles au cours de sa durée de vie auprès du grand public.',
      paoDimensions: '38 × 42 cm (Zone de marquage : 28 × 30 cm)',
      paoBleed: 'Aucun fond perdu requis',
      paoResolution: '300 DPI vectoriel',
      paoColor: 'CMJN ou Pantone',
      paoAlert: 'Vectorisation obligatoire : Toutes les polices de caractères doivent être vectorisées (tracés).',
      usages: [
        { icon: '🎪', title: 'Salons professionnels (SIAO, SITHO)', desc: 'Le sac publicitaire le plus convoité des visiteurs de salons professionnels au Burkina.' },
        { icon: '🎁', title: 'Welcome packs de séminaires', desc: 'Glissez-y bloc-notes, stylos et badges pour accueillir vos participants avec élégance.' },
        { icon: '🛍️', title: 'Emballage boutique de prêt-à-porter', desc: 'Remplacez les sachets plastiques par un sac en tissu chic que vos clientes conserveront.' },
        { icon: '🎉', title: 'Cadeaux de fin d\'année d\'entreprises', desc: 'Offrez un cadeau éco-responsable pratique et apprécié de vos partenaires.' },
      ],
      faqs: [
        { q: 'Quelle charge peut supporter le tote bag ?', a: 'Grâce à ses coutures en croix renforcées, le tote bag supporte facilement une charge de 8 à 10 kg de documents ou courses.' },
        { q: 'Peut-on imprimer en recto et verso ?', a: 'Oui, vous pouvez imprimer sur une seule face ou sur les deux faces (ex: logo au recto et slogan/partenaires au verso).' },
        { q: 'Quel est le délai moyen pour 250 exemplaires ?', a: 'Pour 100 à 500 sacs sérigraphiés, le délai de confection et marquage est de 4 à 5 jours ouvrés à Ouagadougou.' },
      ]
    }
  }

  // 8. Étiquettes & Signalétique adhésive
  if (cat === 'signaletique' || s.includes('etiquette') || s.includes('rouleau') || n.includes('étiquette') || n.includes('sticker')) {
    return {
      type: 'etiquettes',
      pill: 'Packaging & Marquage adhésif Pro',
      valueProp: 'Valorisez vos emballages et produits du terroir : étiquettes en rouleau ou planches prédécoupées, adhésif permanent haute tenue et découpe sur mesure.',
      badge1: { icon: Award, label: 'Adhésif', value: 'Permanent renforcé' },
      badge2: { icon: PackageCheck, label: 'Présentation', value: 'Rouleau ou Planche' },
      badge3: { icon: Palette, label: 'Découpe', value: 'Ronde, Rect, Forme' },
      badge4: { icon: Truck, label: 'Livraison express', value: 'J+3 Ouagadougou' },
      packTitle: 'Conditionnement prêt pour pose manuelle ou machine',
      packSub: 'Bobines calibrées avec mandrin standard 40mm ou 76mm ou planches prédécoupées.',
      packCards: [
        { icon: '🏷️', title: 'Papier brillant ou Polypropylène étanche', desc: 'Supports papier pour packaging sec ou polypropylène (PP) résistant à l\'eau, aux huiles et au réfrigérateur.', tag: 'Supports adaptés' },
        { icon: '🧲', title: 'Colle permanente haute adhérence', desc: 'Adhérence immédiate sur verre, plastique, carton, métal et emballages kraft.', tag: 'Tenue extrême' },
        { icon: '✂️', title: 'Découpe mi-chair ultra précise', desc: 'Décollage facile sans déchirure grâce à une découpe laser numérique au tracé exact.', tag: 'Décollage aisé' },
        { icon: '📦', title: 'Conditionnement en rouleaux étiquetés', desc: 'Enroulement soigné évitant tout froissement ou décollement accidentel.', tag: 'Bobinage pro' },
      ],
      guideTitle: 'Conseils pour une pose d\'étiquettes sans bulle',
      guideSub: 'Comment préparer vos flacons, pots et emballages.',
      guideSteps: [
        { num: '1', icon: '🧼', title: 'Nettoyez la surface', desc: 'La surface d\'application doit être parfaitement propre, sèche et exempte de poussière ou de corps gras.' },
        { num: '2', icon: '🖐️', title: 'Marouflez du centre vers les bords', desc: 'Appliquez l\'étiquette en partant du centre et lissez vers l\'extérieur avec le pouce pour chasser l\'air.' },
        { num: '3', icon: '⏱️', title: 'Temps de prise de la colle', desc: 'Laissez reposer 12 heures à température ambiante avant de placer vos bouteilles ou pots au froid.' },
      ],
      guideAlert: 'Conseil packaging : Pour vos produits cosmétiques (beurre de karité) ou alimentaires (sirops, miels), choisissez toujours la matière résistante à l\'eau et aux corps gras.',
      paoDimensions: 'Formes personnalisables (Rond, Ovale, Rectangle)',
      paoBleed: '2 mm de fond perdu au-delà du tracé de découpe',
      paoResolution: '300 DPI réels',
      paoColor: 'CMJN (Fogra 39)',
      paoAlert: 'Tracé de découpe : Fournissez le contour de découpe sous forme de tracé vectoriel en ton direct nommé "CutContour".',
      usages: [
        { icon: '🍯', title: 'Produits agro-alimentaires locaux', desc: 'Bocaux de miel, confitures, sirops de bissap, épices locales et jus de fruits.' },
        { icon: '🧴', title: 'Cosmétiques & Soins naturels', desc: 'Pots de beurre de karité pur, huiles végétales de balanites, savons et lotions.' },
        { icon: '📦', title: 'Fermetures de colis & Boîtes cadeaux', desc: 'Scellez vos emballages e-commerce et sacs de boutique avec un sticker personnalisé élégant.' },
        { icon: '🏷️', title: 'Étiquetage de prix & Codes-barres', desc: 'Identification logistique, traçabilité et codes-barres pour commerces et entrepôts.' },
      ],
      faqs: [
        { q: 'Les étiquettes résistent-elles au réfrigérateur ?', a: 'Oui, si vous sélectionnez la matière Polypropylène (PP) étanche, elle supporte l\'humidité, la condensation et les températures de 0°C à 60°C.' },
        { q: 'Peut-on commander des formes libres personnalisées ?', a: 'Oui, grâce à notre découpe numérique, nous pouvons découper vos étiquettes à la forme exacte de votre logo ou de votre produit.' },
        { q: 'Quel est le conditionnement en rouleau ?', a: 'Les rouleaux sont bobinés avec un mandrin standard adapté aussi bien à la pose manuelle qu\'à l\'utilisation sur étiqueteuse semi-automatique.' },
      ]
    }
  }

  // 9. Fallback Universel pour TOUTES les autres catégories / futurs produits
  return {
    type: 'generic',
    pill: 'Qualité d\'impression professionnelle garantie',
    valueProp: `Découvrez notre solution ${name || 'sur mesure'} : fabrication soignée, matériaux d\'imprimerie certifiés et vérification technique gratuite avant chaque tirage.`,
    badge1: { icon: Award, label: 'Qualité Pro', value: 'Certifiée YopoePrint' },
    badge2: { icon: PackageCheck, label: 'Conditionnement', value: 'Soigné & protégé' },
    badge3: { icon: Palette, label: 'Impression', value: 'Haute Définition' },
    badge4: { icon: Truck, label: 'Livraison express', value: 'Ouaga & Province' },
    packTitle: 'Un produit complet, vérifié et prêt à l\'emploi',
    packSub: 'Chaque commande est rigoureusement contrôlée avant expédition dans tout le Burkina Faso.',
    packCards: [
      { icon: '📦', title: 'Fabrication soignée et conforme', desc: 'Respect rigoureux de vos dimensions, de votre charte graphique et du support sélectionné.', tag: 'Conformité 100%' },
      { icon: '🎨', title: 'Encres d\'imprimerie haute résolution', desc: 'Restitution fidèle des contrastes et des couleurs avec séchage immédiat sans maculage.', tag: 'Couleurs éclatantes' },
      { icon: '🛡️', title: 'Emballage protecteur renforcé', desc: 'Conditionnement spécifique assurant une protection totale contre la poussière et les chocs lors de la livraison.', tag: 'Protection maximale' },
      { icon: '👁️', title: 'Contrôle PAO humain inclus', desc: 'Vérification méticuleuse par nos graphistes avant lancement de la production en atelier.', tag: 'BAT numérique offert' },
    ],
    guideTitle: 'Conseils pour une utilisation optimale',
    guideSub: 'Recommandations pratiques pour valoriser votre investissement.',
    guideSteps: [
      { num: '1', icon: '🔍', title: 'Validation du Bon À Tirer (BAT)', desc: 'Relisez attentivement le BAT numérique envoyé par notre équipe avant de donner votre accord d\'impression.' },
      { num: '2', icon: '📦', title: 'Déballage et vérification', desc: 'Déballez votre colis dans un endroit propre et sec pour conserver l\'aspect neuf de vos impressions.' },
      { num: '3', icon: '🤝', title: 'Diffusion stratégique', desc: 'Déployez vos supports auprès de votre cible prioritaire lors de vos événements et rendez-vous professionnels.' },
    ],
    guideAlert: 'Assistance YopoePrint : Notre service client est disponible sur WhatsApp pour vous accompagner à chaque étape de votre commande.',
    paoDimensions: 'Formats sur mesure selon configurateur',
    paoBleed: '2 mm à 3 mm de fond perdu recommandé',
    paoResolution: '300 DPI réels',
    paoColor: 'CMJN (Fogra 39)',
    paoAlert: 'Zone de sécurité : Conservez textes et logos importants à au moins 4 mm des bords de coupe.',
    usages: [
      { icon: '🏢', title: 'Communication d\'entreprise & Corporate', desc: 'Renforcez la notoriété et la crédibilité de votre structure auprès de vos partenaires.' },
      { icon: '🎪', title: 'Salons, Foires & Événements au Burkina', desc: 'Présence professionnelle remarquée lors de tous vos rassemblements institutionnels et commerciaux.' },
      { icon: '🛍️', title: 'Commerces & Points de vente', desc: 'Améliorez l\'expérience d\'achat de vos clients avec une présentation soignée de vos offres.' },
      { icon: '📢', title: 'Campagnes promotionnelles & Lancement', desc: 'Donnez un coup d\'accélérateur à votre visibilité sur le marché burkinabè.' },
    ],
    faqs: [
      { q: 'Puis-je modifier ma commande après le paiement ?', a: 'Tant que vous n\'avez pas validé votre Bon À Tirer (BAT) numérique, vous pouvez apporter des corrections à votre fichier.' },
      { q: 'Quels sont les modes de livraison au Burkina Faso ?', a: 'Nous livrons directement à domicile ou au bureau à Ouagadougou en 24h-48h, et nous expédions dans toutes les provinces (Bobo-Dioulasso, Koudougou, Fada, etc.) par car de transport sécurisé.' },
      { q: 'Comment obtenir une facture proforma ?', a: 'Vous pouvez cliquer directement sur le bouton "Devis proforma" sur cette page ou télécharger un PDF officiel depuis votre panier.' },
      { q: 'Que faire si je n\'ai pas de fichier d\'impression ?', a: 'Sélectionnez "Envoyer plus tard (WhatsApp)" lors de votre commande. Notre studio de création graphique peut concevoir votre maquette sur mesure.' },
    ]
  }
}

export function UniversalProductDetails({ product }: UniversalProductProps) {
  const [activeTab, setActiveTab] = useState<'pack' | 'tech' | 'guide' | 'pao' | 'usage' | 'faq'>('pack')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const profile = getCategoryProfile(product.category, product.slug, product.name)
  const deliveryDays = product.deliveryDays || 2

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  const Badge1Icon = profile.badge1.icon
  const Badge2Icon = profile.badge2.icon
  const Badge3Icon = profile.badge3.icon
  const Badge4Icon = profile.badge4.icon

  return (
    <div className="mt-12 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* ── Entête avec proposition de valeur ── */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-primary/90 text-white p-6 md:p-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-200 text-xs font-semibold backdrop-blur-sm mb-3">
            <Sparkles size={14} className="text-amber-400" />
            <span>{profile.pill}</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
            Tout savoir sur {product.name} — YopoePrint
          </h2>
          <p className="mt-2 text-gray-300 text-sm md:text-base leading-relaxed">
            {profile.valueProp}
          </p>

          {/* Mini badges réassurance */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2 text-gray-200">
              <Badge1Icon size={16} className="text-amber-400 shrink-0" />
              <span>{profile.badge1.label} <strong>{profile.badge1.value}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-gray-200">
              <Badge2Icon size={16} className="text-emerald-400 shrink-0" />
              <span>{profile.badge2.label} <strong>{profile.badge2.value}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-gray-200">
              <Badge3Icon size={16} className="text-rose-400 shrink-0" />
              <span>{profile.badge3.label} <strong>{profile.badge3.value}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-gray-200">
              <Badge4Icon size={16} className="text-blue-400 shrink-0" />
              <span>{profile.badge4.label} <strong>{profile.badge4.value}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation par Onglets ── */}
      <div className="border-b border-gray-200 bg-gray-50/80 px-4 md:px-8 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 py-3 min-w-max">
          {[
            { id: 'pack', label: 'Pack & Inclus', icon: PackageCheck },
            { id: 'tech', label: 'Fiche technique', icon: FileSpreadsheet },
            { id: 'guide', label: 'Guide & Conseils', icon: Wrench },
            { id: 'pao', label: 'Spécifications PAO & Gabarits', icon: Layers },
            { id: 'usage', label: 'Cas d\'usage au Burkina', icon: Building2 },
            { id: 'faq', label: 'Questions fréquentes', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all
                  ${isActive
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80'}`}
              >
                <Icon size={16} className={isActive ? 'text-primary' : 'text-gray-400'} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Contenu des Onglets ── */}
      <div className="p-6 md:p-8">

        {/* 1. PACK & INCLUS */}
        {activeTab === 'pack' && (
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                {profile.packTitle}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {profile.packSub}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {profile.packCards.map((card, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl p-5 border transition-all ${
                    card.highlight
                      ? 'bg-amber-50/70 border-2 border-amber-300 relative overflow-hidden'
                      : 'bg-gray-50 border-gray-200 hover:border-primary/40'
                  }`}
                >
                  {card.highlight && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                      Inclus
                    </span>
                  )}
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-xl mb-4">
                    {card.icon}
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{card.title}</h4>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {card.desc}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    <Check size={12} /> {card.tag}
                  </div>
                </div>
              ))}
            </div>

            {/* Note d'engagement qualité */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-primary shrink-0" />
                <span>
                  <strong>Engagement Excellence YopoePrint</strong> : chaque tirage fait l'objet d'un contrôle visuel strict par notre équipe de production avant son emballage sécurisé.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. FICHE TECHNIQUE */}
        {activeTab === 'tech' && (
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Fiche technique & Caractéristiques du produit
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Données d'imprimerie certifiées pour une communication sans compromis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Spécifications générales */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-100 px-4 py-2.5 font-bold text-xs uppercase tracking-wider text-gray-700">
                  Caractéristiques Générales
                </div>
                <dl className="divide-y divide-gray-100 text-xs">
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Nom du produit</dt>
                    <dd className="font-semibold text-gray-900">{product.name}</dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Catégorie</dt>
                    <dd className="font-semibold text-gray-900 capitalize">{product.category || 'Générale'}</dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Formats disponibles</dt>
                    <dd className="font-semibold text-gray-900 text-right">
                      {product.formats && product.formats.length > 0
                        ? product.formats.map(f => f.label).join(', ')
                        : 'Standard'}
                    </dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Quantités standards</dt>
                    <dd className="font-semibold text-gray-900 text-right">
                      {product.quantities && product.quantities.length > 0
                        ? product.quantities.join(', ') + ' ex.'
                        : `Dès ${product.minQuantity || 1} ex.`}
                    </dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Délai indicatif</dt>
                    <dd className="font-semibold text-primary">J+{deliveryDays} ouvrés (Ouagadougou)</dd>
                  </div>
                </dl>
              </div>

              {/* Spécifications impression */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-100 px-4 py-2.5 font-bold text-xs uppercase tracking-wider text-gray-700">
                  Impression & Contrôles
                </div>
                <dl className="divide-y divide-gray-100 text-xs">
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Technologie</dt>
                    <dd className="font-semibold text-gray-900">Numérique HD / Offset selon volume</dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Résolution</dt>
                    <dd className="font-semibold text-gray-900">Jusqu'à 1200 DPI réels</dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Mode colorimétrique</dt>
                    <dd className="font-semibold text-gray-900">CMJN 4 couleurs (Cyan, Magenta, Jaune, Noir)</dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Contrôle prépresse</dt>
                    <dd className="font-semibold text-emerald-700 flex items-center gap-1">
                      <Check size={13} /> BAT numérique systématique
                    </dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Finitions possibles</dt>
                    <dd className="font-semibold text-gray-900 text-right">
                      {product.finishes && product.finishes.length > 0
                        ? product.finishes.map(f => f.label).join(', ')
                        : 'Standards professionnels'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Papiers / Matières détaillés */}
            {product.papers && product.papers.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-3">Matières & Papiers disponibles pour ce produit</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {product.papers.map((paper, idx) => (
                    <div key={paper.id || idx} className="p-4 rounded-xl border border-gray-200 bg-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                        Option {idx + 1}
                      </span>
                      <h5 className="font-bold text-gray-900 text-sm mt-2">{paper.label}</h5>
                      {paper.description && (
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {paper.description}
                        </p>
                      )}
                      {paper.priceExtra ? (
                        <span className="inline-block mt-2 text-[11px] font-bold text-primary">
                          +{paper.priceExtra} FCFA
                        </span>
                      ) : (
                        <span className="inline-block mt-2 text-[11px] font-bold text-gray-400">
                          Inclus sans surcoût
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. GUIDE & CONSEILS */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                {profile.guideTitle}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {profile.guideSub}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profile.guideSteps.map((step, idx) => (
                <div key={idx} className="relative bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col items-center text-center">
                  <span className="w-10 h-10 rounded-full bg-primary text-white text-base font-extrabold flex items-center justify-center mb-4 shadow-sm">
                    {step.num}
                  </span>
                  <div className="w-20 h-20 bg-white rounded-2xl border border-gray-200 flex items-center justify-center text-3xl shadow-sm mb-4">
                    {step.icon}
                  </div>
                  <h4 className="font-bold text-gray-900 text-base">{step.title}</h4>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            {profile.guideAlert && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>{profile.guideAlert}</div>
              </div>
            )}
          </div>
        )}

        {/* 4. GUIDE PAO & GABARITS */}
        {activeTab === 'pao' && (
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Spécifications techniques pour vos fichiers d'impression
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Transmettez ces indications à votre graphiste ou suivez-les pour concevoir votre maquette.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-400 font-semibold uppercase text-[10px]">Format cible</p>
                    <p className="font-extrabold text-gray-900 text-sm mt-0.5">{profile.paoDimensions}</p>
                    <p className="text-[11px] text-gray-500 mt-1">À l'échelle 1:1</p>
                  </div>
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-400 font-semibold uppercase text-[10px]">Profil couleur</p>
                    <p className="font-extrabold text-gray-900 text-sm mt-0.5">{profile.paoColor}</p>
                    <p className="text-[11px] text-gray-500 mt-1">Pas de profil RVB</p>
                  </div>
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-400 font-semibold uppercase text-[10px]">Résolution d'image</p>
                    <p className="font-extrabold text-gray-900 text-sm mt-0.5">{profile.paoResolution}</p>
                    <p className="text-[11px] text-gray-500 mt-1">Netteté optimale</p>
                  </div>
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-400 font-semibold uppercase text-[10px]">Fichiers acceptés</p>
                    <p className="font-extrabold text-gray-900 text-sm mt-0.5">PDF HD, AI, PSD, TIFF</p>
                    <p className="text-[11px] text-gray-500 mt-1">Polices vectorisées</p>
                  </div>
                </div>

                <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl text-xs text-red-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-red-800">
                    <AlertCircle size={16} />
                    <span>⚠️ Marges & Fonds perdus obligatoires :</span>
                  </div>
                  <p className="text-red-900 leading-relaxed">
                    {profile.paoBleed}. {profile.paoAlert}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/22600000000?text=Bonjour,%20je%20souhaite%20recevoir%20les%20gabarits%20pour%20${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    <FileDown size={14} />
                    Demander le gabarit par WhatsApp
                  </a>
                </div>
              </div>

              {/* Schéma de gabarit visuel */}
              <div className="lg:col-span-5 bg-gray-50 rounded-xl p-5 border border-gray-200 flex flex-col items-center justify-center">
                <div className="w-full max-w-[220px] aspect-[4/3] bg-white rounded-lg border-2 border-dashed border-red-300 relative flex items-center justify-center p-3 shadow-inner">
                  {/* Zone de coupe */}
                  <div className="w-full h-full border border-gray-300 rounded flex items-center justify-center relative bg-gray-50/30">
                    {/* Zone de sécurité */}
                    <div className="w-[85%] h-[80%] border-2 border-emerald-400 bg-emerald-50/60 rounded flex flex-col items-center justify-center p-2 text-center">
                      <span className="text-[10px] font-bold text-emerald-800">Zone de Sécurité</span>
                      <span className="text-[8px] text-emerald-600 mt-0.5">Textes & Logos</span>
                    </div>
                  </div>
                  <span className="absolute -bottom-5 text-[9px] text-red-500 font-bold">Ligne de coupe + Fond perdu</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-8 text-center leading-tight">
                  Représentation des marges de sécurité et du débord de coupe
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. CAS D'USAGE AU BURKINA */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Où et comment utiliser {product.name} au Burkina Faso ?
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Recommandé pour les entreprises, institutions, agences et commerces à Ouagadougou et dans toutes les provinces.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.usages.map((u, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-gray-200 bg-white flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                    {u.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{u.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {u.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. FAQ DÉDIÉE */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4 mb-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Questions fréquentes sur {product.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Tout ce que vous devez savoir avant de passer commande en toute sérénité.
              </p>
            </div>

            {profile.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-bold text-gray-900 text-sm md:text-base">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-gray-600 bg-gray-50/50 border-t border-gray-100 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
