'use client'

import { useRef } from 'react'
import { usePopularProducts } from '@/hooks/useProducts'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Clock, Star, Truck } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'

// Catégories hero en scroll horizontal — style Helloprint
const HERO_CATS = [
  { title: 'Cartes de visite', icon: '🪪', href: '/catalogue/cartes', sub: 'Dès 5 000 FCFA' },
  { title: 'Flyers A5', icon: '📄', href: '/catalogue/flyers', sub: 'Dès 12 000 FCFA' },
  { title: 'Bâches', icon: '🚩', href: '/catalogue/signaletique', sub: 'Sur mesure' },
  { title: 'T-shirts', icon: '👕', href: '/catalogue/textile', sub: 'Dès 3 500 FCFA' },
  { title: 'Goodies', icon: '🎁', href: '/catalogue/goodies', sub: 'Express 48h' },
  { title: 'Roll-up', icon: '🪧', href: '/catalogue/roll-up', sub: 'Avec pied' },
  { title: 'Affiches', icon: '🗓️', href: '/catalogue/affiches', sub: 'A3 → A0' },
  { title: 'Brochures', icon: '📚', href: '/catalogue/brochures', sub: '2 & 3 volets' },
]

// Sections inspiration — style Helloprint (image fullwidth avec overlay)
const INSPIRATIONS = [
  { topText: 'Équipez vos événements professionnels.', cta: 'Grand format & Signalétique', emoji: '🎪', href: '/catalogue/signaletique', bg: 'from-orange-900/80 to-orange-700/60' },
  { topText: 'Donnez une image pro à votre entreprise.', cta: 'Cartes & Papeterie', emoji: '🪪', href: '/catalogue/cartes', bg: 'from-gray-900/80 to-gray-700/60' },
  { topText: 'Habillez votre équipe aux couleurs de votre marque.', cta: 'Textile imprimé', emoji: '👕', href: '/catalogue/textile', bg: 'from-green-900/80 to-green-700/60' },
  { topText: 'Offrez des cadeaux mémorables à vos clients.', cta: 'Goodies & Objets pub', emoji: '🎁', href: '/catalogue/goodies', bg: 'from-purple-900/80 to-purple-700/60' },
  { topText: 'Distribuez vos flyers lors de vos opérations terrain.', cta: 'Flyers & Dépliants', emoji: '📄', href: '/catalogue/flyers', bg: 'from-blue-900/80 to-blue-700/60' },
]

export default function Home() {
  const { products: popularProducts, loading: isLoading } = usePopularProducts()
  const carouselRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: 'left' | 'right') => {
    carouselRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ═══════════════════════════════════════════════════════════
          1. HERO — Style Helloprint avec 2 colonnes sur desktop
             Mobile : stack vertical / Desktop : texte gauche + visuel droit
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100 overflow-hidden">

        {/* ── Desktop: layout 2 colonnes ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-stretch md:min-h-[520px]">

            {/* ─── COLONNE GAUCHE : Texte + CTAs + Stats ─── */}
            <div className="flex-1 pt-8 md:pt-16 pb-6 md:pb-16 md:pr-12 flex flex-col justify-center">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-5 border border-primary/20 w-fit">
                🇧🇫 N°1 imprimerie en ligne au Burkina Faso
              </div>

              {/* Titre */}
              <h1
                className="font-display font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-4"
                style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3.5rem)' }}
              >
                L'imprimerie en ligne<br />
                la plus <span className="text-primary">simple</span> du Faso.
              </h1>

              <p className="text-gray-500 text-sm md:text-[17px] leading-relaxed mb-8 max-w-[480px]">
                Configurez, commandez et recevez vos impressions en 48h.<br className="hidden md:block" />
                Paiement par{' '}
                <strong className="text-orange-600">Orange Money</strong> &{' '}
                <strong className="text-blue-600">Moov Money</strong>.
              </p>

              {/* CTAs */}
              <div className="flex flex-row gap-3 mb-10">
                <Link
                  href="/catalogue"
                  className="flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3.5 rounded-xl text-sm md:text-base hover:bg-primary/90 active:scale-95 transition-all shadow-md"
                >
                  Voir tout le catalogue <ArrowRight size={16} />
                </Link>
                <Link
                  href="/devis"
                  className="flex items-center justify-center gap-2 bg-white text-gray-800 font-bold px-6 py-3.5 rounded-xl text-sm md:text-base border-2 border-gray-200 hover:border-gray-300 active:scale-95 transition-all"
                >
                  Devis
                </Link>
              </div>

              {/* Stats — 3 colonnes */}
              <div className="flex items-center gap-8 pt-6 border-t border-gray-100">
                {[
                  { v: '5 000+', l: 'Commandes livrées' },
                  { v: '200+',   l: 'Produits disponibles' },
                  { v: '98%',    l: 'Clients satisfaits' },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <p className="font-display font-black text-primary leading-none"
                       style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)' }}>
                      {v}
                    </p>
                    <p className="text-[11px] text-gray-400 font-semibold mt-1 whitespace-nowrap">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── COLONNE DROITE : Grille de produits/catégories (desktop only) ─── */}
            <div className="hidden md:flex flex-col justify-center w-[420px] xl:w-[500px] shrink-0 py-10 pl-6 xl:pl-10">

              {/* Titre colonne droite */}
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Nos produits phares
              </p>

              {/* Grille 2×4 compacte de catégories */}
              <div className="grid grid-cols-2 gap-3">
                {HERO_CATS.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="group flex items-center gap-3 bg-[#F8F8F8] border border-gray-200 rounded-xl px-4 py-3.5
                      hover:border-primary hover:bg-green-50 hover:shadow-sm active:scale-[0.98] transition-all"
                  >
                    <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-[13px] leading-tight group-hover:text-primary transition-colors truncate">
                        {cat.title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{cat.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* CTA bas */}
              <Link
                href="/catalogue"
                className="mt-4 flex items-center justify-center gap-2 text-primary font-bold text-[13px] hover:underline underline-offset-4"
              >
                Voir les 200+ produits <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Mobile only : catégories en scroll horizontal ── */}
        <div
          className="md:hidden px-4 pb-5 flex gap-3 overflow-x-auto scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {HERO_CATS.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="shrink-0 w-[120px] bg-gray-50 border border-gray-200 rounded-xl p-3 text-center
                hover:border-primary hover:bg-primary/5 active:scale-95 transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <p className="font-bold text-gray-900 text-[12px] leading-tight group-hover:text-primary">{cat.title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{cat.sub}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          2. BESTSELLERS — style Helloprint
          Grille produits avec vrais prix
      ═══════════════════════════════════════ */}
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-5 md:mb-8">
            <div>
              <h2 className="font-display font-extrabold text-gray-900 text-lg md:text-3xl tracking-tight">
                Nos meilleures ventes
              </h2>
              <p className="text-gray-400 text-xs md:text-sm mt-1">Les produits préférés de nos clients au Burkina</p>
            </div>
            <Link href="/catalogue" className="text-primary font-bold text-sm flex items-center gap-1 shrink-0 hover:underline underline-offset-4">
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[260px] md:h-[340px] bg-gray-100 rounded-xl animate-pulse" />
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
          <div className="mt-5 md:hidden">
            <Link href="/catalogue" className="flex items-center justify-center gap-2 w-full py-4 border-2 border-primary text-primary font-bold rounded-xl text-sm active:scale-95 transition-all">
              Voir tout le catalogue <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          3. INSPIRATION CAROUSEL — Helloprint style
          Cards plein écran avec overlay texte
      ═══════════════════════════════════════ */}
      <section className="bg-white py-8 md:py-16 border-y border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-5 md:mb-8">
            <div>
              <h2 className="font-display font-extrabold text-gray-900 text-lg md:text-3xl tracking-tight">
                Trouvez l'inspiration
              </h2>
              <p className="text-gray-400 text-xs md:text-sm mt-1 hidden md:block">Découvrez comment nos produits font grandir votre activité</p>
            </div>
            <div className="hidden md:flex gap-2">
              <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-primary hover:text-primary transition-all">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-primary hover:text-primary transition-all">
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
                className="relative shrink-0 w-[75vw] max-w-[280px] md:w-[320px] md:max-w-none h-[260px] md:h-[380px] rounded-2xl overflow-hidden snap-center group border border-gray-200 hover:border-primary transition-all"
              >
                {/* Background */}
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-8xl opacity-50 group-hover:scale-105 group-hover:opacity-40 transition-all duration-700">
                  {story.emoji}
                </div>
                <div className={`absolute inset-0 bg-gradient-to-b ${story.bg}`} />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                  <h3 className="text-white font-bold text-base md:text-lg leading-snug max-w-[85%]">
                    {story.topText}
                  </h3>
                  <span className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold text-xs px-4 py-2.5 rounded-full self-start group-hover:bg-primary group-hover:text-white transition-colors">
                    {story.cta} <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          4. TRUST BAR — Style Helloprint
          Horizontal scroll chips on mobile, 4 cols on desktop
      ═══════════════════════════════════════ */}
      <section className="bg-gray-50 border-b border-gray-100 py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          {/* Mobile: scrollable pills */}
          <div className="flex gap-3 overflow-x-auto scrollbar-none md:hidden pb-1" style={{ scrollbarWidth: 'none' }}>
            {[
              { icon: '⚡', title: 'Production 24h', desc: 'Impression express' },
              { icon: '🏆', title: 'Qualité Premium', desc: 'Finitions parfaites' },
              { icon: '📱', title: 'Orange & Moov', desc: 'Paiement mobile' },
              { icon: '🚚', title: 'Livraison rapide', desc: 'Partout au Burkina' },
            ].map(({ icon, title }) => (
              <div key={title} className="shrink-0 flex items-center gap-2.5 bg-white border border-gray-200 rounded-full px-4 py-2.5 shadow-sm">
                <span className="text-base">{icon}</span>
                <span className="text-xs font-bold text-gray-800 whitespace-nowrap">{title}</span>
              </div>
            ))}
          </div>

          {/* Desktop: 4 columns */}
          <div className="hidden md:grid grid-cols-4 gap-6">
            {[
              { icon: <Clock size={26} className="text-primary" />, title: 'Production Express', desc: 'Vos impressions prêtes en 24 à 48h ouvrées.' },
              { icon: <Star size={26} className="text-primary" />, title: 'Qualité Premium', desc: 'Machines de pointe, finitions parfaites.' },
              { icon: <ShieldCheck size={26} className="text-primary" />, title: 'Paiement Sécurisé', desc: 'Orange Money, Moov Money, carte bancaire.' },
              { icon: <Truck size={26} className="text-primary" />, title: 'Livraison Nationale', desc: 'Partout au Burkina Faso en 24-72h.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          5. PROMO BANNER — Mobile money highlight
          Spécifique marché burkinabè
      ═══════════════════════════════════════ */}
      <section className="bg-primary py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="font-display font-extrabold text-white text-xl md:text-3xl mb-3">
            🎉 Livraison offerte dès 75 000 FCFA
          </h2>
          <p className="text-white/80 text-sm md:text-base mb-6">
            Payez en toute sécurité avec <strong>Orange Money</strong> ou <strong>Moov Money</strong>. Contrôle PAO gratuit inclus.
          </p>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 bg-white text-primary font-extrabold px-8 py-4 rounded-xl text-sm md:text-base hover:bg-gray-50 active:scale-95 transition-all shadow-md"
          >
            Commander maintenant <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  )
}
