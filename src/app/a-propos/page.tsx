import Image from 'next/image'
import Link from 'next/link'
import { 
  CheckCircle2, Zap, ShieldCheck, ArrowRight, Printer, 
  PenTool, Box, Mail, Phone, MapPin, Award, Clock, 
  Sparkles, FileText, ChevronRight, Check, Eye, Package, 
  Cpu, Factory, Users, Download, HelpCircle
} from 'lucide-react'
import { getServerContact } from '@/lib/contact'

export const metadata = {
  title: 'À Propos de YopoePrint — Imprimerie Numérique & Industrielle au Burkina Faso',
  description: 'Découvrez l’histoire de YopoePrint, notre parc de presses HD, notre atelier de façonnage à Ouagadougou et nos engagements qualité certifiés.',
}

const STATS = [
  { value: '15 000+', label: 'Commandes livrées', sub: 'À Ouaga, Bobo et provinces' },
  { value: '99.6%', label: 'Conformité colorimétrique', sub: 'Calibrage FOGRA39 certifié' },
  { value: '24h / 48h', label: 'Délais de production', sub: 'Option express atelier disponible' },
  { value: '100%', label: 'Factures DGI avec IFU & TVA', sub: 'Déductibilité fiscale intégrale' },
]

const PRODUCTION_LINES = [
  {
    title: 'Presses Numériques HD Haute Cadence',
    category: 'Petits & Moyens Tirages',
    speed: 'Jusqu’à 4 800 feuilles / heure',
    resolution: '2 400 × 2 400 DPI Ultra HD',
    idealFor: 'Cartes de visite de prestige, flyers promotionnels, menus restaurants, brochures agrafées et stickers vinyles en découpe mi-chair.',
    colorimetry: 'Spectrophotomètre intégré X-Rite, contrôle du noir riche (C30 M30 J30 N100).',
    badge: 'Production Express 24h',
    icon: Printer,
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Ligne Offset Industrielle Grands Volumes',
    category: 'Grands Tirages & Packaging',
    speed: 'Jusqu’à 15 000 feuilles / heure',
    resolution: 'Trames fines 200 LPI',
    idealFor: 'Magazines institutionnels, rapports d’activités annuels, catalogues commerciaux, chemises à rabats et emballages kraft certifiés.',
    colorimetry: 'Encre végétale conforme aux normes alimentaires et respectueuse de l’environnement.',
    badge: 'Coût Unitaire Ultra-Compétitif',
    icon: Factory,
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Traceurs Grand Format Écologiques UV & Latex',
    category: 'Signalétique & Événementiel',
    speed: 'Laize continue jusqu’à 3,20 mètres',
    resolution: '1 200 DPI résistant aux UV extérieurs',
    idealFor: 'Bâches tendues micro-perforées, kakémonos aluminium, photocalls stands SIAO/SNC, vinyles pour vitrines et panneaux Dibond.',
    colorimetry: 'Encres résistantes au soleil sahélien et aux fortes chaleurs sans décoloration pendant 3 ans.',
    badge: 'Spécial Climat Sahélien',
    icon: PenTool,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1000&auto=format&fit=crop',
  },
]

const FINISHING_WORKSHOP = [
  {
    name: 'Pelliculage Mat Velours & Soft Touch',
    desc: 'Un toucher soyeux haut de gamme semblable à la peau de pêche, anti-traces de doigts et ultra-résistant aux frottements.',
    tag: 'Finition Signature Apple',
  },
  {
    name: 'Vernis Sélectif 3D & Dorure à Chaud',
    desc: 'Application d’une résine brillante en relief ou d’un film métallique or / argent pour mettre en exergue vos logos.',
    tag: 'Effet Relief Tactile',
  },
  {
    name: 'Découpe Laser & Rainage Précis',
    desc: 'Formes de découpe sur-mesure pour étiquettes produits, stickers personnalisés, pochettes et packagings origami.',
    tag: 'Tolérance < 0.2 mm',
  },
  {
    name: 'Façonnage & Reliure Industrielle',
    desc: 'Reliure Wire-O métallique pour calendriers et blocs-notes, dos carré collé PUR pour livres et piqûre à cheval 2 points métal.',
    tag: 'Longévité Garantie',
  },
]

const WORKFLOW_STEPS = [
  {
    num: '01',
    title: 'Commande en ligne en 3 minutes',
    desc: 'Sélectionnez votre produit, choisissez vos finitions (grammage, coins arrondis, pelliculage) et calculez instantanément le prix exact en FCFA.',
  },
  {
    num: '02',
    title: 'Audit Pré-Presse & BAT Numérique Gratuit',
    desc: 'Nos opérateurs PAO vérifient gratuitement vos fichiers : résolutions 300 DPI, zone tranquille de 3mm, colorimétrie CMJN et polices vectorisées.',
  },
  {
    num: '03',
    title: 'Impression & Façonnage en Atelier',
    desc: 'Tirage immédiat sur nos presses calibrées, découpe haute précision au massicot numérique et conditionnement sous film thermo-rétractable.',
  },
  {
    num: '04',
    title: 'Livraison Express au Bureau ou à Domicile',
    desc: 'Livraison par nos coursiers dédiés à Ouagadougou en 24h ou expédition sécurisée via cars partenaires vers Bobo-Dioulasso et toute la sous-région.',
  },
]

const CORE_VALUES = [
  {
    icon: ShieldCheck,
    title: 'Rigueur & Transparence Tarifaire',
    desc: 'Aucun frais caché. Tous nos prix sont affichés TTC avec facture normalisée DGI (IFU et TVA) délivrée immédiatement pour vos bilans comptables.',
  },
  {
    icon: Zap,
    title: 'Vitesse d’Exécution Sans Compromis',
    desc: 'Nous comprenons l’urgence des lancements de produits et des salons. Nos lignes de production tournent en continu pour tenir des délais records.',
  },
  {
    icon: Award,
    title: 'Garantie Satisfait ou Réimprimé',
    desc: 'Si le rendu final ne correspond pas au Bon À Tirer (BAT) validé par vos soins, nous réimprimons l’intégralité de votre lot à nos frais exclusifs.',
  },
  {
    icon: Users,
    title: 'Ancrage Local & Création d’Emplois',
    desc: '100% de notre production est réalisée au Burkina Faso par des opérateurs et graphistes locaux passionnés par les arts graphiques industriels.',
  },
]

export default async function AProposPage() {
  const contact = await getServerContact()
  return (
    <div className="min-h-screen bg-gray-100 text-foreground">
      
      {/* ─── 1. HERO SECTION STYLE APPLE ────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-gradient-to-b from-foreground via-[#151516] to-foreground text-white">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        {/* Glow gradients */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/20 via-primary/30 to-purple-600/20 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-gray-200 mb-6">
            <Sparkles size={14} className="text-primary" />
            <span>L’Imprimerie Nouvelle Génération au Burkina Faso</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
            L’art de l’impression, <br className="hidden sm:inline" />
            propulsé par la <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-300 bg-clip-text text-transparent">technologie</span>.
          </h1>

          <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            YopoePrint réinvente la chaîne graphique pour les entreprises, PME et créateurs. 
            Une plateforme e-commerce intuitive, un parc machines industriel de pointe et une livraison garantie dans tout le pays.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/catalogue" 
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-full text-sm sm:text-base transition-all duration-200 shadow-lg shadow-primary/20 active:scale-95"
            >
              Commander en ligne <ArrowRight size={18} />
            </Link>
            
            <Link 
              href="/devis" 
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-8 py-4 rounded-full text-sm sm:text-base border border-white/15 backdrop-blur-md transition-all duration-200 active:scale-95"
            >
              <FileText size={18} /> Demander un devis sur-mesure
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 2. BANDEAU DE CHIFFRES BENTO ────────────────────────────────────────────── */}
      <section className="-mt-8 relative z-20 max-w-7xl mx-auto px-4 md:px-6">
        <div className="bg-white/80 backdrop-blur-2xl border border-black/5 rounded-3xl p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
            {STATS.map((stat, i) => (
              <div key={i} className={`text-center ${i > 0 ? 'pt-4 lg:pt-0' : ''}`}>
                <p className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                  {stat.value}
                </p>
                <p className="font-bold text-sm text-foreground mt-1.5">{stat.label}</p>
                <p className="text-xs text-gray-600 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. NOTRE HISTOIRE & MISSION (BENTO CARDS) ─────────────────────────────────── */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Notre Vision</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Pourquoi avons-nous créé YopoePrint ?
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card Gauche : Constat & Révolution */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 md:p-12 border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="space-y-6">
              <span className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Clock size={24} />
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-extrabold text-foreground leading-snug">
                En finir avec les délais flous et les allers-retours physiques inutiles.
              </h3>
              <div className="space-y-4 text-gray-600 text-base md:text-lg leading-relaxed">
                <p>
                  Historiquement à Ouagadougou et Bobo-Dioulasso, imprimer un support exigeait de traverser la ville dans les embouteillages, d’attendre plusieurs jours pour obtenir un devis manuscrit, et d'angoisser sur la conformité des couleurs jusqu'au jour de la livraison.
                </p>
                <p>
                  Nous avons bâti <strong>YopoePrint</strong> avec une ambition claire : offrir aux professionnels burkinabè la même simplicité d’achat que les plus grands acteurs mondiaux du web-to-print. 
                  En quelques clics, vous configurez votre support, prévisualisez votre BAT, réglez par Mobile Money ou virement, et recevez vos cartons scellés à votre bureau.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4 text-xs font-semibold text-gray-500">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Transparence totale</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Tarification instantanée</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Studio PAO dédié</span>
            </div>
          </div>

          {/* Card Droite : Notre Atelier de Gounghin */}
          <div className="lg:col-span-5 bg-foreground text-white rounded-3xl p-8 md:p-10 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-primary flex items-center justify-center font-bold">
                <Factory size={24} />
              </div>
              
              <h3 className="font-display text-2xl font-bold text-white">
                Un atelier physique ancré à Ouagadougou
              </h3>
              
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Derrière l’interface numérique fluide se trouve un atelier de production industriel équipé des dernières technologies de presse HD et de façonnage automatique.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <MapPin size={20} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">Site Principal & Showroom :</p>
                    <p className="text-xs text-gray-300">{contact.address}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <Clock size={20} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">Horaires d’Ouverture & Retraits :</p>
                    <p className="text-xs text-gray-300">Du Lundi au Samedi : 07h30 — 19h00 sans interruption</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-white transition-colors"
              >
                Plan d’accès & prise de rendez-vous atelier <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. NOTRE PARC MACHINE INDUSTRIEL (HELLOPRINT STYLE) ────────────────────────── */}
      <section className="py-20 md:py-28 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Technologie & Équipements</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                Le parc machine le plus moderne du pays
              </h2>
            </div>
            <p className="text-sm text-gray-500 max-w-md">
              Chaque typologie de support est orientée vers la machine dédiée garantissant le meilleur équilibre entre précision colorimétrique et coût unitaire.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {PRODUCTION_LINES.map((line, i) => {
              const Icon = line.icon
              return (
                <div 
                  key={i}
                  className="bg-gray-100 rounded-3xl p-8 border border-black/5 flex flex-col justify-between hover:bg-white hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:border-black/10 transition-all duration-300 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white text-foreground shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon size={24} />
                      </div>
                      <span className="text-2xs font-bold px-3 py-1 rounded-full bg-white text-foreground border border-black/5 shadow-2xs">
                        {line.badge}
                      </span>
                    </div>

                    <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">{line.category}</p>
                    <h3 className="font-display text-xl font-extrabold text-foreground mb-4">
                      {line.title}
                    </h3>

                    <div className="space-y-3 mb-6 p-4 rounded-2xl bg-white/70 border border-black/5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cadence :</span>
                        <span className="font-bold text-foreground">{line.speed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Résolution :</span>
                        <span className="font-bold text-foreground">{line.resolution}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {line.idealFor}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200/60 text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">Contrôle qualité :</span> {line.colorimetry}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. ATELIER DE FAÇONNAGE & FINITIONS D’EXCEPTION ────────────────────────────── */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Sublimer vos imprimés</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Les finitions nobles qui font la différence
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3">
            L'impression n'est que la première étape. Notre atelier de finition apporte la texture tactile et le prestige visuel à vos supports de marque.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FINISHING_WORKSHOP.map((fin, i) => (
            <div 
              key={i}
              className="bg-white rounded-3xl p-6 border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200"
            >
              <div>
                <span className="inline-block text-2xs font-extrabold uppercase tracking-wider text-primary px-2.5 py-1 rounded-full bg-primary/10 mb-4">
                  {fin.tag}
                </span>
                <h3 className="font-display font-bold text-base text-foreground mb-2">{fin.name}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{fin.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-2xs font-bold text-gray-900">
                <span>Disponible au catalogue</span>
                <Check size={14} className="text-emerald-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Free Sample Kit Callout */}
        <div className="mt-12 bg-gradient-to-r from-amber-500/10 via-primary/15 to-emerald-500/10 border border-primary/20 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Gratuit pour les professionnels</span>
            <h3 className="font-display text-2xl font-extrabold text-foreground">
              Vous souhaitez toucher nos papiers avant de commander ?
            </h3>
            <p className="text-sm text-gray-600 max-w-xl">
              Recevez notre coffret d’échantillons complet comprenant les papiers Couché Mat 350g, Soft Touch, Kraft recyclé, Vernis 3D et le nuancier CMJN officiel.
            </p>
          </div>

          <Link
            href="/contact?sujet=kit-echantillons"
            className="shrink-0 bg-foreground hover:bg-black text-white px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
          >
            Recevoir le coffret échantillon gratuit →
          </Link>
        </div>
      </section>

      {/* ─── 6. LE PROTOCOLE QUALITÉ EN 4 ÉTAPES ────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-foreground text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Excellence Opérationnelle</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Comment garantissons-nous zéro défaut ?
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mt-3">
              Un processus d’assurance qualité rigoureux inspiré des standards internationaux d’imprimerie industrielle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WORKFLOW_STEPS.map((step, i) => (
              <div 
                key={i} 
                className="bg-white/5 backdrop-blur-md rounded-3xl p-7 border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors"
              >
                <div>
                  <span className="font-display font-extrabold text-3xl text-emerald-400 mb-4 block">
                    {step.num}
                  </span>
                  <h3 className="font-display font-bold text-lg text-white mb-2.5">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 text-2xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Étape vérifiée & tracée
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. NOS 4 ENGAGEMENTS FONDAMENTAUX ──────────────────────────────────────────── */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Garanties & Confiance</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Les engagements YopoePrint
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_VALUES.map((val, i) => {
            const Icon = val.icon
            return (
              <div 
                key={i} 
                className="bg-white rounded-3xl p-7 border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 text-foreground flex items-center justify-center mb-6">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2.5">
                    {val.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── 8. CALL TO ACTION COMMERCIAL RICHE ───────────────────────────────────────── */}
      <section className="pb-24 max-w-7xl mx-auto px-4 md:px-6">
        <div className="bg-gradient-to-br from-foreground via-[#2A2A2E] to-foreground text-white rounded-3xl p-8 md:p-16 border border-white/10 shadow-2xl relative overflow-hidden text-center md:text-left">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 size={14} /> Service Commercial & Assistance Directe
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Prêt à sublimer l’image de marque de votre entreprise ?
              </h2>
              <p className="text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Testez notre réactivité sur votre prochaine commande. Nos conseillers d'atelier sont disponibles pour étudier votre projet et vous accompagner de la maquette à la livraison.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3.5 justify-center">
              <Link 
                href="/catalogue" 
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-7 py-4 rounded-full text-sm transition-all shadow-lg shadow-primary/20 active:scale-95 text-center"
              >
                Explorer le catalogue en ligne <ArrowRight size={16} />
              </Link>
              
              <a 
                href={`${contact.whatsappUrl}?text=Bonjour%20YopoePrint,%20je%20souhaite%20des%20informations%20sur%20vos%20services%20d'impression.`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-7 py-4 rounded-full text-sm border border-white/15 backdrop-blur-md transition-all active:scale-95 text-center"
              >
                <Phone size={16} /> Échanger sur WhatsApp (+226)
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
