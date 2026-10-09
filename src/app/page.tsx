'use client'

import { useRef } from 'react'
import { usePopularProducts } from '@/hooks/useProducts'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Clock,
  Star, Truck, Building2, CheckCircle2, FileCheck, Users,
  Calculator, Award, Sparkles, Layers, Printer, Briefcase,
  Phone, Check
} from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'

// ── 8 Produits phares du Hero avec visuels réels & spécifications professionnelles ──
const HERO_PRODUCTS = [
  {
    title: 'Cartes de visite',
    badge: 'Dès 5 000 F',
    badgeCls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    sub: '350g · Finition Soft Touch',
    href: '/catalogue/cartes',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=350&q=80',
    tag: 'B2B Top',
  },
  {
    title: 'Flyers & Dépliants',
    badge: 'Dès 12 000 F',
    badgeCls: 'bg-blue-50 text-blue-800 border-blue-200',
    sub: '135g à 250g · Quadri recto/verso',
    href: '/catalogue/flyers',
    img: 'https://images.unsplash.com/photo-1572945753563-80495678363d?auto=format&fit=crop&w=350&q=80',
    tag: 'Express 48h',
  },
  {
    title: 'Roll-up & Kakémonos',
    badge: 'Dès 28 000 F',
    badgeCls: 'bg-purple-50 text-purple-800 border-purple-200',
    sub: '85×200cm · Structure alu + sac',
    href: '/catalogue/roll-up',
    img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=350&q=80',
    tag: 'Salons & Foires',
  },
  {
    title: 'Textile d’Entreprise',
    badge: 'Dès 3 500 F',
    badgeCls: 'bg-amber-50 text-amber-800 border-amber-200',
    sub: 'T-shirts & Polos 220g brodés',
    href: '/catalogue/textile',
    img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=350&q=80',
    tag: 'Équipe Pro',
  },
  {
    title: 'Bâches & Signalétique',
    badge: 'Sur mesure',
    badgeCls: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    sub: '510g indéchirable · Œillets alu',
    href: '/catalogue/signaletique',
    img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=350&q=80',
    tag: 'Grand format',
  },
  {
    title: 'Goodies & Cadeaux VIP',
    badge: 'Dès 450 F/u',
    badgeCls: 'bg-rose-50 text-rose-800 border-rose-200',
    sub: 'Stylos métal, Mugs, Agendas',
    href: '/catalogue/goodies',
    img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=350&q=80',
    tag: 'Fidélisation',
  },
  {
    title: 'Brochures & Rapports',
    badge: 'Dès 18 500 F',
    badgeCls: 'bg-teal-50 text-teal-800 border-teal-200',
    sub: 'Reliure piqûre / dos carré collé',
    href: '/catalogue/brochures',
    img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=350&q=80',
    tag: 'Institutionnel',
  },
  {
    title: 'Affiches & Posters',
    badge: 'Dès 1 500 F',
    badgeCls: 'bg-orange-50 text-orange-800 border-orange-200',
    sub: 'Formats A3, A2, A1 jusqu’à A0',
    href: '/catalogue/affiches',
    img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=350&q=80',
    tag: 'Campagnes',
  },
]

// ── Avantages Entreprises & B2B YopoePrint ──
const B2B_PILLARS = [
  {
    icon: FileCheck,
    title: 'Facturation Normalisée DGI',
    desc: 'Factures déductibles avec mention IFU & TVA conformes aux règles fiscales du Burkina Faso.',
    badge: 'Conformité 100%',
  },
  {
    icon: ShieldCheck,
    title: 'BAT Numérique Haute Définition',
    desc: 'Contrôle pré-presse rigoureux (CMJN FOGRA39, résolutions 300 DPI, fonds perdus) avant impression.',
    badge: 'Validation Garantie',
  },
  {
    icon: Calculator,
    title: 'Tarifs Dégressifs Annuels',
    desc: 'Jusqu’à -35% de réduction pour les entreprises et remises sur volume récurrent.',
    badge: 'Jusqu’à -35%',
  },
  {
    icon: Truck,
    title: 'Livraison sur Site au Bureau',
    desc: 'Acheminement direct au siège ou succursales à Ouagadougou, Bobo-Dioulasso et en province.',
    badge: 'Express 24/48h',
  },
]

// ── Packs Corporate Entreprises ──
const CORPORATE_PACKS = [
  {
    title: 'Pack Papeterie Corporate',
    badge: 'Essentiel PME & Agences',
    desc: 'Cartes 350g Soft Touch, têtes de lettre, chemises à rabats, tampons encreurs officiels.',
    price: 'Dès 85 000 FCFA',
    items: ['500 Cartes de visite Soft Touch', '1 000 Têtes de lettre opale 90g', '250 Chemises à rabats pelliculées'],
  },
  {
    title: 'Pack Salons & Foires (SIAO / SNC)',
    badge: 'Événementiel & Salons',
    desc: 'Roll-up aluminium, photocall stand parapluie, dépliants 3 volets, badges tours de cou satinés.',
    price: 'Dès 195 000 FCFA',
    items: ['2 Roll-up alu 85×200cm', '1 Photocall 3×3m autoportant', '1 000 Dépliants 3 volets vernis'],
  },
  {
    title: 'Pack Goodies & Objets Publicitaires',
    badge: 'Cadeaux d’Affaires VIP',
    desc: 'Stylos métalliques gravés laser, carnets cuir PU débossés, clés USB métal, tote bags coton.',
    price: 'Dès 145 000 FCFA',
    items: ['200 Stylos métal gravure laser', '100 Carnets reliés simili-cuir', '100 Tote bags coton épais 280g'],
  },
]

// ── Secteurs qui font confiance à YopoePrint au Faso ──
const SECTORS_TRUST = [
  'Banques & Assurances',
  'Mines & BTP',
  'Opérateurs Télécoms',
  'ONG & Institutions',
  'Agences de Communication',
  'Hôtellerie & Événements',
]

// ── Sections inspiration Helloprint style ──
const INSPIRATIONS = [
  { topText: 'Équipez vos salons et événements d’entreprise.', cta: 'Grand format & Signalétique', emoji: '🎪', href: '/catalogue/signaletique', bg: 'from-orange-950/80 to-orange-800/60' },
  { topText: 'Donnez une image haut de gamme à votre entreprise.', cta: 'Cartes & Papeterie', emoji: '🪪', href: '/catalogue/cartes', bg: 'from-slate-950/80 to-slate-800/60' },
  { topText: 'Habillez vos collaborateurs aux couleurs de votre marque.', cta: 'Textile imprimé', emoji: '👕', href: '/catalogue/textile', bg: 'from-emerald-950/80 to-emerald-800/60' },
  { topText: 'Offrez des cadeaux d’affaires mémorables à vos clients.', cta: 'Goodies & Objets pub', emoji: '🎁', href: '/catalogue/goodies', bg: 'from-purple-950/80 to-purple-800/60' },
  { topText: 'Distribuez vos flyers lors de vos opérations terrain.', cta: 'Flyers & Dépliants', emoji: '📄', href: '/catalogue/flyers', bg: 'from-blue-950/80 to-blue-800/60' },
]

export default function Home() {
  const { products: popularProducts, loading: isLoading } = usePopularProducts()
  const carouselRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: 'left' | 'right') => {
    carouselRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* ═══════════════════════════════════════════════════════════
          1. HERO — Positionnement Entreprise & Produits Phares Visuels
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-200 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row lg:items-center py-8 lg:py-14 gap-10">

            {/* ─── COLONNE GAUCHE : Texte + CTAs + Stats Entreprise ─── */}
            <div className="flex-1 flex flex-col justify-center">

              {/* Badge d'autorité */}
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4 w-fit shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                🇧🇫 N°1 de l'imprimerie & communication d'entreprise au Burkina Faso
              </div>

              {/* Titre principal */}
              <h1
                className="font-display font-black text-slate-950 tracking-tight leading-[1.12] mb-4"
                style={{ fontSize: 'clamp(2rem, 4.2vw, 3.4rem)' }}
              >
                L'imprimerie en ligne la plus <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-4">simple</span> pour votre entreprise.
              </h1>

              <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed mb-6 max-w-xl">
                PME, institutions, agences ou créateurs : configurez vos supports, validez votre <strong>Bon À Tirer (BAT) en 300 DPI</strong> et recevez vos impressions en <strong>24 à 48h</strong>.
                <br className="hidden sm:inline" /> Facturation normalisée DGI et règlements <strong>Orange Money</strong>, <strong>Moov Money</strong> ou virement B2B.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Link
                  href="/catalogue"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3.5 rounded-xl text-sm sm:text-base active:scale-95 transition-all shadow-md hover:shadow-lg"
                >
                  Voir tout le catalogue <ArrowRight size={17} />
                </Link>

                <Link
                  href="/entreprises"
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl text-sm sm:text-base active:scale-95 transition-all shadow-sm"
                >
                  <Building2 size={16} className="text-amber-400" />
                  Espace Entreprises & Devis
                </Link>
              </div>

              {/* Stats & Rassurance de l'Entreprise — 4 indicateurs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                <div>
                  <p className="font-display font-black text-emerald-600 text-xl sm:text-2xl">5 000+</p>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Commandes livrées</p>
                </div>
                <div>
                  <p className="font-display font-black text-slate-900 text-xl sm:text-2xl">500+</p>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Entreprises clientes</p>
                </div>
                <div>
                  <p className="font-display font-black text-emerald-600 text-xl sm:text-2xl">99.2%</p>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">BAT certifiés</p>
                </div>
                <div>
                  <p className="font-display font-black text-slate-900 text-xl sm:text-2xl">100%</p>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Factures DGI (TVA)</p>
                </div>
              </div>

            </div>

            {/* ─── COLONNE DROITE : Grille Produits Phares avec VRAIES PHOTOS ─── */}
            <div className="w-full lg:w-[480px] xl:w-[540px] shrink-0">
              <div className="bg-slate-50/80 p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs">
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-extrabold text-slate-900 text-sm sm:text-base">
                      Nos Produits Phares
                    </h3>
                    <p className="text-xs text-slate-500">Qualité professionnelle certifiée studio</p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Atelier Ouaga & Bobo
                  </span>
                </div>

                {/* Grille 2×4 avec mockups photos */}
                <div className="grid grid-cols-2 gap-3">
                  {HERO_PRODUCTS.map((prod) => (
                    <Link
                      key={prod.title}
                      href={prod.href}
                      className="group flex flex-col p-2.5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all active:scale-[0.98] overflow-hidden"
                    >
                      {/* Vignette Photo */}
                      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={prod.img}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className={`absolute top-1.5 left-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-md border ${prod.badgeCls} shadow-2xs`}>
                          {prod.badge}
                        </span>
                      </div>

                      {/* Métadonnées */}
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-bold text-slate-900 text-xs truncate group-hover:text-emerald-700 transition-colors">
                            {prod.title}
                          </p>
                          <span className="text-[9px] font-semibold text-slate-400 shrink-0">
                            {prod.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {prod.sub}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Footer colonne droite */}
                <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Besoin d’un format spécifique ?</span>
                  <Link
                    href="/catalogue"
                    className="font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 hover:underline underline-offset-4"
                  >
                    Voir les 200+ références →
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. BANDEAU DE CONFIANCE : SECTEURS & GRANDS COMPTES DU FASO
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-slate-900 text-slate-300 py-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider shrink-0">
              <Briefcase size={16} className="text-amber-400" />
              <span>Ils font imprimer chez nous :</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold">
              {SECTORS_TRUST.map((sec) => (
                <span
                  key={sec}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-emerald-500/50 transition-colors"
                >
                  {sec}
                </span>
              ))}
            </div>

            <Link
              href="/entreprises"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 shrink-0"
            >
              Rejoindre nos comptes Pro →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. SECTION MAJEURE : SOLUTIONS ENTREPRISES & B2B
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          {/* En-tête de section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200/60">
                <Building2 size={13} /> Offre Dédiée PME, Grandes Entreprises & Institutions
              </div>
              <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-950 tracking-tight">
                Une infrastructure d'impression pensée pour les professionnels
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Finis les retards de livraison, les factures non conformes et les écarts de couleurs. YopoePrint garantit une chaîne graphique industrielle irréprochable.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/entreprises"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
              >
                Découvrir l'Espace Entreprises <ArrowRight size={14} />
              </Link>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all"
              >
                Devis sur mesure
              </Link>
            </div>
          </div>

          {/* Les 4 Piliers B2B */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
            {B2B_PILLARS.map((p) => {
              const Icon = p.icon
              return (
                <div
                  key={p.title}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-500/50 hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-mono">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              )
            })}
          </div>

          {/* 3 Packs Corporate Prêts à l'emploi */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  Solutions Clés en Main
                </span>
                <h3 className="font-display font-extrabold text-xl sm:text-3xl text-white">
                  Les 3 Packs Entreprises les plus plébiscités
                </h3>
              </div>
              <Link
                href="/entreprises#packs"
                className="text-xs font-bold text-amber-400 hover:text-white inline-flex items-center gap-1.5"
              >
                Voir tous les détails des packs →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CORPORATE_PACKS.map((pack) => (
                <div
                  key={pack.title}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/10 transition-colors"
                >
                  <div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {pack.badge}
                    </span>
                    <h4 className="font-bold text-base text-white mt-3 mb-2">
                      {pack.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {pack.desc}
                    </p>

                    <div className="space-y-1.5 pt-3 border-t border-white/10 mb-6">
                      {pack.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-200">
                          <Check size={13} className="text-emerald-400 shrink-0" />
                          <span>{it}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="font-display font-bold text-sm text-amber-300">{pack.price}</span>
                    <Link
                      href={`/devis?pack=${encodeURIComponent(pack.title)}`}
                      className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all"
                    >
                      Commander ce pack
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          4. BESTSELLERS — Grille Produits avec Prix Réels
      ═══════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-6 md:mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h2 className="font-display font-extrabold text-slate-900 text-xl md:text-3xl tracking-tight">
                  Nos meilleures ventes
                </h2>
              </div>
              <p className="text-slate-500 text-xs md:text-sm mt-1">Les supports préférés des professionnels au Burkina</p>
            </div>
            <Link href="/catalogue" className="text-emerald-700 font-bold text-sm flex items-center gap-1 shrink-0 hover:underline underline-offset-4">
              Tout le catalogue <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[260px] md:h-[340px] bg-slate-200/70 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {(popularProducts ?? []).slice(0, 8).map((p: any) => (
                <ProductCard key={p._id ?? p.id} product={p} />
              ))}
            </div>
          )}

          {/* Mobile CTA */}
          <div className="mt-6 md:hidden">
            <Link href="/catalogue" className="flex items-center justify-center gap-2 w-full py-4 border-2 border-emerald-600 text-emerald-700 font-bold rounded-xl text-sm active:scale-95 transition-all">
              Voir tout le catalogue <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          5. SAVOIR-FAIRE INDUSTRIEL & ATELIER
      ═══════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Atelier 100% Local au Burkina Faso
              </span>

              <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 leading-tight">
                Zéro sous-traitance opaque. Une production industrielle maîtrisée de A à Z.
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Installé à Ouagadougou avec relais à Bobo-Dioulasso, notre atelier réunit des presses numériques haute définition, des traceurs éco-solvants pour grand format et un studio de façonnage complet (massicots numériques, pelliculeuses thermiques, dorure).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-1">
                    <CheckCircle2 size={16} /> Épreuve BAT 300 DPI
                  </div>
                  <p className="text-xs text-slate-500">Validation visuelle avant toute mise sur machine.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-1">
                    <CheckCircle2 size={16} /> 100% Satisfait ou Réimprimé
                  </div>
                  <p className="text-xs text-slate-500">Remplacement immédiat en cas d’anomalie technique.</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/a-propos"
                  className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-4"
                >
                  Découvrir l'histoire et le parc machine de YopoePrint →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80"
                    alt="Presses d'impression YopoePrint"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Presses Numériques HD
                  </span>
                </div>

                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80"
                    alt="Studio PAO pré-presse"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Studio PAO Pré-presse
                  </span>
                </div>

                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
                    alt="Façonnage et massicot"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Façonnage & Finition
                  </span>
                </div>

                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md relative bg-emerald-900 text-white p-5 flex flex-col justify-between">
                  <Award size={28} className="text-amber-400" />
                  <div>
                    <p className="font-display font-black text-2xl text-white">50 000+</p>
                    <p className="text-[11px] text-emerald-200">Tirages réalisés par semaine au Burkina</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          6. INSPIRATION CAROUSEL — Style Helloprint
      ═══════════════════════════════════════ */}
      <section className="bg-slate-50 py-12 md:py-16 border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-6 md:mb-8">
            <div>
              <h2 className="font-display font-extrabold text-slate-900 text-lg md:text-3xl tracking-tight">
                Trouvez l'inspiration pour vos campagnes
              </h2>
              <p className="text-slate-500 text-xs md:text-sm mt-1 hidden md:block">Des idées concrètes pour valoriser votre marque et vos opérations</p>
            </div>
            <div className="hidden md:flex gap-2">
              <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-slate-300 bg-white flex items-center justify-center hover:border-emerald-600 hover:text-emerald-600 transition-all shadow-2xs">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-slate-300 bg-white flex items-center justify-center hover:border-emerald-600 hover:text-emerald-600 transition-all shadow-2xs">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {INSPIRATIONS.map((story, i) => (
              <Link
                key={i}
                href={story.href}
                className="relative shrink-0 w-[75vw] max-w-[280px] md:w-[320px] md:max-w-none h-[260px] md:h-[380px] rounded-3xl overflow-hidden snap-center group border border-slate-200 hover:border-emerald-500 transition-all shadow-xs"
              >
                {/* Background */}
                <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-8xl opacity-40 group-hover:scale-105 group-hover:opacity-30 transition-all duration-700">
                  {story.emoji}
                </div>
                <div className={`absolute inset-0 bg-gradient-to-b ${story.bg}`} />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  <h3 className="text-white font-bold text-base md:text-lg leading-snug max-w-[90%]">
                    {story.topText}
                  </h3>
                  <span className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold text-xs px-4 py-2.5 rounded-full self-start group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-md">
                    {story.cta} <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          7. TRUST BAR — 4 Engagements Fermes
      ═══════════════════════════════════════ */}
      <section className="bg-white py-10 md:py-14 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Clock size={24} className="text-emerald-600" />, title: 'Production Express 24/48h', desc: 'Délais respectés pour vos salons, lancements et événements urgents.' },
              { icon: <Star size={24} className="text-emerald-600" />, title: 'Qualité Pré-presse 300 DPI', desc: 'Contrôle technique gratuit de chaque fichier avant mise en machine.' },
              { icon: <ShieldCheck size={24} className="text-emerald-600" />, title: 'Paiements Sécurisés du Faso', desc: 'Orange Money, Moov Money, virement bancaire et chèque d’entreprise.' },
              { icon: <Truck size={24} className="text-emerald-600" />, title: 'Livraison Directe au Bureau', desc: 'Partout à Ouaga, Bobo et dans les 45 provinces du Burkina Faso.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                  {icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          8. BANNIÈRE PROMO & APPEL D’OFFRE B2B
      ═══════════════════════════════════════ */}
      <section className="bg-emerald-700 py-10 md:py-14 text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-800/60 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-200 border border-emerald-600">
            🚚 Livraison offerte dès 75 000 FCFA sur tout le catalogue
          </div>

          <h2 className="font-display font-black text-2xl md:text-4xl text-white">
            Un appel d'offres ou une convention d'impression pour votre entreprise ?
          </h2>

          <p className="text-emerald-100 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Profitez de nos remises corporate, d’un gestionnaire de compte attitré et d’une facturation normalisée DGI avec déclaration TVA.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/entreprises"
              className="inline-flex items-center gap-2 bg-white text-emerald-950 font-black px-7 py-3.5 rounded-xl text-sm md:text-base hover:bg-slate-100 active:scale-95 transition-all shadow-lg"
            >
              Consulter l'offre Entreprise <ArrowRight size={16} />
            </Link>

            <Link
              href="/devis"
              className="inline-flex items-center gap-2 bg-emerald-900/60 hover:bg-emerald-900 text-white font-bold px-6 py-3.5 rounded-xl text-sm md:text-base border border-emerald-500 transition-all"
            >
              Déposer un devis en ligne
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
