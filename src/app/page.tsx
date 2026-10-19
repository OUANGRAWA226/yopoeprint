'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import Image, { getImageProps } from 'next/image'
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
import { useCatalogue, priceFor, referenceQuantity, productImage, categoryCards, eventCards, papersGuide } from '@/lib/catalogue'
import { ProductScrollRail } from '@/components/product/ProductScrollRail'
import { useContact } from '@/lib/settings.service'

// Visuel d'une bannière : version téléphone (660 × 330) sous 768 px quand elle existe, sinon le visuel
// 1248 × 357 recadré au centre. <picture> : le navigateur ne télécharge que la version affichée.
function BannerImage({ banner, priority }: { banner: BannerSlide; priority: boolean }) {
  const alt = banner.ctaLabel ? '' : (banner.altText || banner.title || 'Bannière YopoePrint')
  const common = { alt, fill: true, priority, className: 'object-cover object-center' }
  const { props: { srcSet: desktopSrcSet, ...imgProps } } = getImageProps({
    ...common, src: banner.imageUrl, sizes: '(max-width: 1248px) 100vw, 1248px',
  })
  if (!banner.mobileImageUrl) return <Image {...common} alt={alt} src={banner.imageUrl} sizes="(max-width: 1248px) 100vw, 1248px" />
  const { props: { srcSet: mobileSrcSet } } = getImageProps({ ...common, src: banner.mobileImageUrl, sizes: '100vw' })
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
      <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...imgProps} alt={alt} />
    </picture>
  )
}

// ── 5. Avis Clients d'Entreprises Vérifiés ───────────────────────────────────
export default function StorefrontHomePage() {
  const contact = useContact()
  const router = useRouter()

  // Offres et calculateur : produits cochés dans l'admin (Produits › Configuration › Mise en avant)
  const { products: catalogue } = useCatalogue()
  const offers = catalogue?.filter((p) => p.isHomeOffer) ?? null
  const calcProducts = catalogue?.filter((p) => p.inCalculator && p.quantities?.length) ?? null
  // Catégories, salons et guide des papiers : également tirés du catalogue (blocs masqués s'ils sont vides)
  const categoriesGrid = categoryCards(catalogue)
  const expoCards = eventCards(catalogue)
  const papers = papersGuide(catalogue)

  // Calculateur : sans choix explicite, premier produit, quantité de référence et première finition
  const [calcProdId, setCalcProdId] = useState<string | null>(null)
  const [selectedQty, setSelectedQty] = useState<number | null>(null)
  const [selectedFinish, setSelectedFinish] = useState<string | null>(null)
  const currentCalc = calcProducts?.find((p) => p.id === calcProdId) ?? calcProducts?.[0] ?? null
  const calcQty = currentCalc
    ? (selectedQty && currentCalc.quantities.includes(selectedQty) ? selectedQty : referenceQuantity(currentCalc))
    : 0
  const activeFinishObj = currentCalc?.finishes?.find((f) => f.id === selectedFinish) ?? currentCalc?.finishes?.[0]
  const calculatedTotal = currentCalc ? priceFor(currentCalc, calcQty, activeFinishObj?.id) : 0
  const unitPrice = calcQty ? Math.round(calculatedTotal / calcQty) : 0

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
        setHeroSlide(0)
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

  // Une offre n'est pas commandable telle quelle : le client configure et dépose son fichier sur la fiche produit
  const handleQuickAddFlash = (e: React.MouseEvent, slug: string) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/produit/${slug}`)
  }

  // Changement de produit dans le calculateur : retour à sa quantité de référence et sa première finition
  const handleSelectCalcProduct = (id: string) => {
    setCalcProdId(id)
    setSelectedQty(null)
    setSelectedFinish(null)
  }

  // La commande se finalise sur la fiche produit
  const handleAddCalculatedToCart = () => {
    if (currentCalc) router.push(`/produit/${currentCalc.slug}`)
  }



  return (
    <div className="min-h-screen bg-gray-100/70 text-gray-900 font-sans antialiased">

      {/* ═════════════════════════════════════════════════════════════
          1. GRANDE BANNIÈRE CARROUSEL HERO (1248 × 357 PX)
             Bannières visuelles graphiques uploadées depuis le Backoffice
      ═════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[1248px] mx-auto px-2 sm:px-4 pt-4 sm:pt-6 pb-3">
        {/* Titre de la page conservé pour le référencement et les lecteurs d'écran, sans texte visible au-dessus du carrousel */}
        <h1 className="sr-only">Imprimerie en ligne au Burkina Faso</h1>

        <div
          className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-gray-200/60 bg-gray-200 group"
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
          onFocusCapture={() => setIsCarouselHovered(true)}
          onBlurCapture={() => setIsCarouselHovered(false)}
        >
          {/* Ratios exacts des visuels : 660 × 330 sur téléphone, 1248 × 357 à partir de 768 px (aucun recadrage) */}
          <div className="relative w-full aspect-[660/330] md:aspect-[1248/357] overflow-hidden">
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
                    <BannerImage banner={banner} priority={idx === 0} />
                    {banner.ctaLabel && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/85 via-gray-950/55 to-gray-950/0" />
                        {/* Bandeau bas (2:1) sur téléphone : textes resserrés, sous-titre masqué là où il ne tient pas */}
                        <div className="absolute inset-0 flex flex-col justify-center gap-1.5 sm:gap-3 px-4 sm:px-10 md:px-14 max-w-[36rem]">
                          {banner.badge && (
                            <span className="self-start text-2xs sm:text-xs font-bold uppercase tracking-wider text-white bg-primary px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg">
                              {banner.badge}
                            </span>
                          )}
                          <p className="font-display text-lg sm:text-3xl md:text-2xl lg:text-4xl font-extrabold text-white leading-tight">
                            {banner.title}
                          </p>
                          {banner.subtitle && (
                            <p className="hidden sm:block md:hidden lg:block text-base text-white/85 leading-snug">{banner.subtitle}</p>
                          )}
                          <span className="self-start sm:mt-1 inline-flex items-center gap-1.5 bg-primary text-white text-xs sm:text-sm font-bold px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md group-hover:bg-primary/90 transition-colors">
                            {banner.ctaLabel} <ArrowRight size={14} />
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
          2. OFFRES DE L'ATELIER (produits cochés « Offre de l'atelier » dans l'admin)
      ═════════════════════════════════════════════════════════════ */}
      {(offers === null || offers.length > 0) && (
      <section className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2">
        {/* Bloc sombre neutre : la couleur d'action (vert) reste réservée aux boutons */}
        <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg text-white">

          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h2 className="font-display text-base sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>Offres de l&apos;atelier</span>
              </h2>
              <p className="text-xs text-white/80 mt-0.5">Prix catalogue pour la quantité indiquée, en configuration de base</p>
            </div>

            <Link
              href="/catalogue"
              className="shrink-0 inline-flex items-center gap-1 h-9 px-3.5 bg-white text-gray-900 hover:bg-gray-100 rounded-full font-bold text-xs shadow-sm transition-colors"
            >
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>

          {/* Défilement horizontal : flèches sur ordinateur, glisser sur téléphone */}
          <ProductScrollRail trackClassName="gap-2.5 sm:gap-3">
            {offers === null
              ? [0, 1, 2, 3, 4].map((i) => (
                  <div key={i} aria-hidden="true" className="w-[148px] sm:w-[168px] md:w-[185px] shrink-0 bg-white/10 rounded-xl sm:rounded-2xl aspect-[3/4] animate-pulse" />
                ))
              : offers.map((p) => {
                  const qty = referenceQuantity(p)
                  return (
                    <div
                      key={p.id}
                      className="w-[148px] sm:w-[168px] md:w-[185px] shrink-0 snap-start bg-white text-gray-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between group transition-all"
                    >
                      <div className="relative aspect-square w-full bg-white p-2 flex items-center justify-center">
                        <Link href={`/produit/${p.slug}`} className="relative w-full h-full block">
                          <Image
                            src={productImage(p)}
                            alt={p.name}
                            fill
                            className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                            sizes="185px"
                          />
                        </Link>

                        <span className="absolute top-2 left-2 bg-blue-600 text-white text-2xs font-extrabold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
                          Atelier
                        </span>

                        <button
                          onClick={(e) => handleQuickAddFlash(e, p.slug)}
                          className="absolute top-2 right-2 w-7 h-7 bg-gray-900/90 hover:bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md active:scale-90 transition-transform cursor-pointer"
                          title="Configurer"
                          aria-label={`Configurer ${p.name}`}
                        >
                          <Plus size={15} strokeWidth={2.5} />
                        </button>
                      </div>

                      <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1 gap-1">
                        <Link href={`/produit/${p.slug}`}>
                          <h3 className="font-semibold text-2xs sm:text-xs text-gray-900 line-clamp-2 leading-tight hover:text-primary min-h-[30px]">
                            {p.name}
                          </h3>
                        </Link>

                        <div className="pt-0.5">
                          <span className="text-2xs text-gray-500 font-medium block leading-none">
                            {new Intl.NumberFormat('fr-FR').format(qty)} ex.
                          </span>
                          <div className="tabular-nums font-extrabold text-xs sm:text-sm text-gray-950">
                            {new Intl.NumberFormat('fr-FR').format(priceFor(p, qty))} FCFA
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
          </ProductScrollRail>

        </div>
      </section>
      )}

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
      {categoriesGrid.length > 0 && (
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
              <span>Voir tout le catalogue{catalogue?.length ? ` (${catalogue.length} produits)` : ''}</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categoriesGrid.map((cat) => (
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
      )}

      {/* ═════════════════════════════════════════════════════════════
          4. CALCULATEUR DE PRIX (produits cochés « Calculateur de prix » dans l'admin,
             même formule que l'API : le montant affiché est celui facturé)
      ═════════════════════════════════════════════════════════════ */}
      {(calcProducts === null || calcProducts.length > 0) && (
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
              Pas besoin d&apos;attendre un devis par email. Sélectionnez vos options et découvrez immédiatement le montant de votre tirage en FCFA.
            </p>
          </div>

          {!currentCalc ? (
            <div className="h-80 bg-gray-50 border border-gray-200 rounded-2xl animate-pulse" aria-busy="true" />
          ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8">

            {/* Étape 1 : choix du produit */}
            <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-gray-200">
              {(calcProducts ?? []).map((prod) => {
                const isActive = currentCalc.id === prod.id
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleSelectCalcProduct(prod.id)}
                    aria-pressed={isActive}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {prod.name}
                  </button>
                )
              })}
            </div>

            {/* Étape 2 : quantité et finition */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">

              <div className="lg:col-span-7 space-y-6">

                <div>
                  <p className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    1. Choisissez le tirage (Tarifs dégressifs) :
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {currentCalc.quantities.map((q) => {
                      const isSel = calcQty === q
                      return (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setSelectedQty(q)}
                          aria-pressed={isSel}
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

                {currentCalc.finishes?.length > 1 && (
                <div>
                  <p className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    2. Choisissez la finition :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentCalc.finishes.map((f) => {
                      const isSel = activeFinishObj?.id === f.id
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSelectedFinish(f.id)}
                          aria-pressed={isSel}
                          className={`p-3 rounded-xl text-left transition-all cursor-pointer border ${
                            isSel
                              ? 'bg-emerald-50/80 border-emerald-600 ring-1 ring-emerald-600'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-gray-900">{f.label}</span>
                            {f.priceModifier > 0 && (
                              <span className="text-2xs font-bold text-emerald-700 tabular-nums shrink-0">
                                +{new Intl.NumberFormat('fr-FR').format(f.priceModifier)} F
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
                )}

              </div>

              {/* Résumé du prix et passage à la fiche produit */}
              <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Total TTC
                  </span>
                  <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                    Production : {currentCalc.deliveryDays} j ouvré{currentCalc.deliveryDays > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="mb-4" aria-live="polite">
                  <p className="font-display font-extrabold text-3xl text-gray-900 tabular-nums leading-none">
                    {new Intl.NumberFormat('fr-FR').format(calculatedTotal)} <span className="text-sm font-sans font-bold text-gray-600">FCFA</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Soit <strong>{unitPrice} FCFA</strong> par exemplaire
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="flex items-center gap-1.5 font-medium">
                    <Check size={14} className="text-emerald-600 shrink-0" /> Produit : {currentCalc.name}
                  </p>
                  <p className="flex items-center gap-1.5 font-medium">
                    <Check size={14} className="text-emerald-600 shrink-0" /> Quantité : {new Intl.NumberFormat('fr-FR').format(calcQty)} exemplaires
                  </p>
                  {(currentCalc.formats?.[0] || currentCalc.papers?.[0]) && (
                    <p className="flex items-center gap-1.5 font-medium">
                      <Check size={14} className="text-emerald-600 shrink-0" />
                      {[currentCalc.formats?.[0]?.label, currentCalc.papers?.[0]?.label].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {activeFinishObj && (
                    <p className="flex items-center gap-1.5 font-medium">
                      <Check size={14} className="text-emerald-600 shrink-0" /> Finition : {activeFinishObj.label}
                    </p>
                  )}
                  <p className="flex items-center gap-1.5 font-medium">
                    <Check size={14} className="text-emerald-600 shrink-0" /> Contrôle PAO 300 DPI inclus
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
                  Autres formats, papiers et recto-verso sur la fiche produit
                </p>
              </div>

            </div>

          </div>
          )}

        </div>
      </section>
      )}

{/* ═════════════════════════════════════════════════════════════
          6. SALONS & ÉVÉNEMENTS (Bloc Signature Helloprint)
      ═════════════════════════════════════════════════════════════ */}
      {expoCards.length > 0 && (
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
              {expoCards.map((item) => (
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
      )}

      {/* ═════════════════════════════════════════════════════════════
          7. GUIDE DES MATIÈRES & PAPIERS D'ATELIER (Pédagogie Pro)
      ═════════════════════════════════════════════════════════════ */}
      {papers.length > 0 && (
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
            {papers.map((mat) => (
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
      )}

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
                <span>📍 {contact.address}</span>
                <span>⏰ Lundi au Samedi : 08h00 — 18h30</span>
                <span>📞 Hotline : {contact.phoneDisplay}</span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <a
                href={`${contact.whatsappUrl}?text=Bonjour%20YopoePrint,%20je%20souhaite%20un%20renseignement%20pour%20une%20commande%20d'impression.`}
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
