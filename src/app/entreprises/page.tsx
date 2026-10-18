import Link from 'next/link'
import Image from 'next/image'
import {
  Building2, ShieldCheck, Clock, FileCheck, Users,
  Truck, Award, Sparkles, ChevronRight, Phone, Mail,
  CheckCircle2, ArrowRight, Download, Calculator,
  Briefcase, Layers, Printer, BarChart3, Star
} from 'lucide-react'
import { getServerContact } from '@/lib/contact'

export const metadata = {
  title: 'Espace Entreprises & Grands Comptes — YopoePrint Burkina Faso',
  description: 'Solutions d’impression B2B pour entreprises, PME, banques et ONG au Burkina Faso. Facturation normalisée DGI, tarifs dégressifs, BAT numérique express et livraison au bureau.',
}

const ADVANTAGES = [
  {
    icon: FileCheck,
    title: 'Facturation Normalisée DGI',
    desc: 'Factures certifiées conformes avec mention IFU et TVA pour une intégration comptable et déductibilité fiscale sans friction.',
    badge: '100% Conforme',
  },
  {
    icon: ShieldCheck,
    title: 'BAT Numérique & Contrôle PAO Gratuit',
    desc: 'Chaque maquette est auditée par notre studio pré-presse (profil CMJN FOGRA39, résolutions 300 DPI, fonds perdus) avant impression.',
    badge: 'Zéro Erreur',
  },
  {
    icon: BarChart3,
    title: 'Tarifs Dégressifs Annuels',
    desc: 'Économisez jusqu’à 35% grâce à nos grilles tarifaires dégressives adaptées aux volumes réguliers et commandes groupées.',
    badge: 'Jusqu’à -35%',
  },
  {
    icon: Users,
    title: 'Chargé de Compte Dédié',
    desc: 'Un interlocuteur unique et joignable directement pour coordonner tous vos projets de communication, urgences et réimpressions.',
    badge: 'Support VIP',
  },
  {
    icon: Truck,
    title: 'Livraison sur Site au Bureau',
    desc: 'Acheminement direct dans vos locaux à Ouagadougou, Bobo-Dioulasso, Koudougou ou expédition sécurisée vers vos succursales régionales.',
    badge: 'Express 24/48h',
  },
  {
    icon: Award,
    title: 'Garantie Satisfait ou Réimprimé',
    desc: 'Une conformité colorimétrique et de façonnage irréprochable. En cas de non-conformité par rapport au BAT validé, nous réimprimons sans frais.',
    badge: 'Sérénité Totale',
  },
]

const CORPORATE_PACKS = [
  {
    id: 'pack-papeterie',
    title: 'Pack Papeterie & Identité Corporate',
    badge: 'Essentiel PME',
    desc: 'L’arsenal complet pour équiper vos collaborateurs et affirmer votre image de marque lors de vos réunions et correspondances officielles.',
    items: [
      'Cartes de visite 350g pelliculage mat / Soft Touch (par lot de 500)',
      'Têtes de lettre papier opale 90g (1 000 ou 2 500 ex.)',
      'Chemises à rabats avec encoche carte de visite (250 ou 500 ex.)',
      'Enveloppes personnalisées autocollantes C5 & DL',
      'Tampons encreurs automatiques professionnels',
    ],
    highlight: 'Dès 85 000 FCFA',
    leadTime: 'Livrable en 48h',
  },
  {
    id: 'pack-event',
    title: 'Pack Salons, Foires & Séminaires',
    badge: 'Événementiel & Salons',
    desc: 'Tout le matériel visuel pour vos stands d’exposition au SIAO, SNC, forums d’affaires ou conférences internationales.',
    items: [
      '2 Roll-up aluminium Deluxe 85×200cm avec housse rembourrée',
      '1 Photocall / Stand parapluie autoportant 3×3m',
      '1 000 Dépliants 3 volets vernis sélectif 250g',
      '100 Badges tours de cou satinés personnalisés avec porte-carte',
      '2 Bâches œillets haute résistance 300×100cm',
    ],
    highlight: 'Dès 195 000 FCFA',
    leadTime: 'Livrable en 72h',
  },
  {
    id: 'pack-goodies',
    title: 'Pack Objets & Cadeaux d’Affaires VIP',
    badge: 'Fidélisation Clients',
    desc: 'Renforcez la fidélité de vos partenaires stratégiques et clients grands comptes avec des objets publicitaires haut de gamme.',
    items: [
      'Stylos métal gravure laser haute précision (par 200 ex.)',
      'Carnets de notes reliés cuir PU avec logo débossé',
      'Clés USB professionnelles métalliques gravées',
      'Mugs isothermes céramique & gourdes alu personnalisées',
      'Sacs shopping tote bag coton épais 280g sérigraphiés',
    ],
    highlight: 'Dès 145 000 FCFA',
    leadTime: 'Livrable en 3 à 5 jours',
  },
  {
    id: 'pack-textile',
    title: 'Pack Textile Pro & Image d’Équipe',
    badge: 'Tenues Corporate',
    desc: 'Habillez vos équipes terrain, vendeurs et techniciens aux couleurs exactes de votre charte graphique avec un marquage durable.',
    items: [
      'Polos piqué 220g avec broderie cœur et dos',
      'T-shirts coton peigné 190g sérigraphie quadri',
      'Casquettes 6 panneaux brodées avec boucle réglable',
      'Gilets de sécurité haute visibilité marqués',
      'Tabliers et blouses selon vos métiers',
    ],
    highlight: 'Dès 65 000 FCFA',
    leadTime: 'Livrable en 48 à 72h',
  },
]

const SECTORS = [
  { name: 'Banques & Assurances', desc: 'Rapports annuels, chéquiers, dossiers de crédit, roll-up d’agences' },
  { name: 'Mines & Industrie BTP', desc: 'Signalétique de sécurité, carnets de bord, tenues de travail brodées' },
  { name: 'Télécoms & Tech', desc: 'Kakémonos, bâches géantes, flyers promotionnels grand tirage' },
  { name: 'ONG & Institutions', desc: 'Rapports de projets, manuels de formation, banderoles de sensibilisation' },
  { name: 'Hôtellerie & Restauration', desc: 'Menus plastifiés, sets de table, porte-cartes, uniformes et serviettes' },
  { name: 'Agences de Communication', desc: 'Partenaire marque blanche avec expédition neutre chez le client final' },
]

export default async function EntreprisesPage() {
  const contact = await getServerContact()
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* ── 1. Hero Corporate B2B ────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white py-16 md:py-24 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Colonne gauche : Pitch B2B */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
                <Building2 size={14} className="text-emerald-400" />
                Solutions Dédiées Entreprises, PME & Institutions
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                L’imprimerie industrielle partenaire de votre <span className="text-emerald-400">croissance</span> au Faso.
              </h1>

              <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl">
                Bénéficiez d’un compte professionnel avec <strong>facturation normalisée DGI</strong>, d’un studio de contrôle PAO dédié, de tarifs dégressifs jusqu’à <strong>-35%</strong> et d’une livraison directe dans vos locaux à Ouaga et Bobo.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/devis"
                  className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-7 py-4 rounded-xl text-sm sm:text-base transition-all shadow-lg shadow-emerald-950/40 active:scale-95"
                >
                  <Calculator size={18} />
                  Demander un devis entreprise (sous 2h)
                </Link>

                <a
                  href="#packs"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-4 rounded-xl text-sm sm:text-base border border-white/15 transition-all"
                >
                  Découvrir les packs corporate <ArrowRight size={16} />
                </a>
              </div>

              {/* Rassurance rapide */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-gray-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Factures DGI avec TVA & IFU
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" /> BAT numérique certifié gratuit
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Paiement Orange / Moov ou Virement
                </span>
              </div>
            </div>

            {/* Colonne droite : Carte contact direct & indicateurs B2B */}
            <div className="lg:col-span-5">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                  <div>
                    <h3 className="font-display font-bold text-white text-lg">Pôle Grands Comptes</h3>
                    <p className="text-xs text-gray-400">Atelier & Studio Pré-presse Ouagadougou</p>
                  </div>
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                    <Phone size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Ligne directe Entreprises :</p>
                      <a href={`tel:${contact.phone}`} className="font-bold text-white hover:text-emerald-300 tabular-nums text-base">
                        {contact.phoneDisplay}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                    <Mail size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Email service commercial :</p>
                      <a href="mailto:entreprises@yopoeprint.bf" className="font-bold text-white hover:text-emerald-300 text-sm">
                        entreprises@yopoeprint.bf
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                    <Clock size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Réactivité garantie :</p>
                      <p className="font-semibold text-gray-200 text-xs">
                        Réponse & chiffrage sous 2h ouvrées (Lun - Sam : 08h - 18h30)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                  <p className="text-xs text-gray-300 mb-3">Besoin d'un échantillon papier avant de commander ?</p>
                  <Link
                    href="/contact?sujet=echantillons"
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    Recevoir le nuancier & kit d’échantillons papier gratuit →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. Bandeau Chiffres Clés de Confiance ───────────────────────────── */}
      <section className="bg-white border-b border-gray-200 py-8 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="font-display font-extrabold text-2xl sm:text-4xl text-gray-900">500+</p>
              <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">Entreprises partenaires</p>
            </div>
            <div>
              <p className="font-display font-extrabold text-2xl sm:text-4xl text-emerald-600">99.4%</p>
              <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">BAT approuvés du 1er coup</p>
            </div>
            <div>
              <p className="font-display font-extrabold text-2xl sm:text-4xl text-gray-900">24/48h</p>
              <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">Délai standard atelier</p>
            </div>
            <div>
              <p className="font-display font-extrabold text-2xl sm:text-4xl text-emerald-600">100%</p>
              <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">Facturation normalisée DGI</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Les 6 Avantages Entreprises YopoePrint ───────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-gray-900">
              Pourquoi les directions achats et marketing nous choisissent ?
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Une infrastructure pensée pour les exigences des entreprises modernes : transparence, rigueur colorimétrique et réactivité absolue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ADVANTAGES.map((adv) => {
              const Icon = adv.icon
              return (
                <div
                  key={adv.title}
                  className="bg-white rounded-3xl p-7 border border-gray-200/80 shadow-xs hover:shadow-lg hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                        <Icon size={24} />
                      </div>
                      <span className="text-2xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 tabular-nums">
                        {adv.badge}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-gray-900 mb-2.5">
                      {adv.title}
                    </h3>

                    <p className="text-sm text-gray-600 leading-relaxed">
                      {adv.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                    En savoir plus <ChevronRight size={14} className="ml-1" />
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ── 4. Packs Corporate Clés en Main ─────────────────────────────────── */}
      <section id="packs" className="py-16 md:py-24 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-2">
                Offres Prêtes à l’emploi
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-gray-900">
                Nos 4 Packs Entreprises les plus demandés
              </h2>
            </div>
            <Link
              href="/devis?type=pack"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-700 underline underline-offset-4"
            >
              Personnaliser un pack sur mesure →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CORPORATE_PACKS.map((pack) => (
              <div
                key={pack.id}
                className="bg-gray-50/70 border border-gray-200 rounded-3xl p-7 sm:p-8 flex flex-col justify-between hover:bg-white hover:shadow-xl hover:border-emerald-500/50 transition-all duration-200 relative group overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {pack.badge}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 tabular-nums">
                      {pack.leadTime}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-xl text-gray-900 mb-2">
                    {pack.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    {pack.desc}
                  </p>

                  <div className="space-y-2.5 mb-8">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ce pack inclut :</p>
                    {pack.items.map((it, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{it}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-2xs text-gray-500 block font-semibold">Tarif indicatif :</span>
                    <span className="font-display font-extrabold text-xl text-gray-900">{pack.highlight}</span>
                  </div>

                  <Link
                    href={`/devis?pack=${encodeURIComponent(pack.title)}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-900 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
                  >
                    Commander ce pack <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 5. Secteurs d’Activité Accompagnés ──────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-gray-900">
              Des solutions adaptées à chaque secteur au Faso
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Que vous soyez une multinationale, un ministère ou une PME en pleine expansion, nous maîtrisons les contraintes techniques de votre métier.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SECTORS.map((sec) => (
              <div key={sec.name} className="p-6 rounded-2xl bg-white border border-gray-200 shadow-2xs hover:border-gray-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold mb-3.5">
                  <Briefcase size={18} />
                </div>
                <h4 className="font-bold text-base text-gray-900 mb-1.5">{sec.name}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{sec.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 6. Formulaire Express de Prise de Contact B2B ──────────────────── */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-900 to-blue-950 text-white relative">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
            <Building2 size={32} />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Vous avez un projet d'impression pour votre entreprise ?
          </h2>

          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Transmettez-nous votre cahier des charges ou votre appel d’offres. Notre équipe commerciale prépare votre chiffrage certifié et un Bon À Tirer d’essai dans les plus brefs délais.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-extrabold px-8 py-4 rounded-xl text-sm sm:text-base transition-all shadow-xl shadow-emerald-950 active:scale-95"
            >
              Déposer une demande de devis B2B <ArrowRight size={16} />
            </Link>

            <a
              href={`${contact.whatsappUrl}?text=Bonjour%20YopoePrint,%20je%20souhaite%20des%20informations%20pour%20un%20compte%20entreprise.`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-4 rounded-xl text-sm sm:text-base border border-white/20 transition-all"
            >
              Échanger sur WhatsApp Business →
            </a>
          </div>

          <p className="text-xs text-gray-400 pt-6">
            YopoePrint — {contact.address} · Tél : {contact.phoneDisplay}
          </p>
        </div>
      </section>

    </div>
  )
}
