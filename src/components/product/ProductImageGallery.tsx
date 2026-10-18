'use client'

import React, { useState, useRef, MouseEvent } from 'react'
import Image from 'next/image'
import {
  ZoomIn,
  Sparkles,
  CheckCircle2,
  Ruler,
  User,
  Sun,
  Moon,
  RotateCw,
  Eye,
  Maximize2,
  Check,
  Smartphone,
  Layers,
  Palette
} from 'lucide-react'
import {
  RollupIllustration,
  RollupBaseIllustration,
  RollupBagIllustration
} from './RollupCustomIllustrations'
import {
  detectProductArchetype,
  getArchetypeViews,
  BusinessCardVisualizer,
  FlyerVisualizer,
  PosterVisualizer,
  BrochureVisualizer,
  TextileVisualizer,
  ToteBagVisualizer,
  StickerVisualizer,
  BannerVisualizer,
  GenericUniversalVisualizer,
  ProductArchetype
} from './UniversalProductVisualizers'

// Type guard pour images galerie de l'API
function isGalleryImage(view: any): view is { id: string; label: string; description: string; url: string; order: number } {
  return view && typeof view === 'object' && 'url' in view && typeof view.url === 'string'
}

interface FormatOption {
  id: string
  label: string
  dimensions?: string
}

interface PaperOption {
  id: string
  label: string
  description?: string
}

interface FinishOption {
  id: string
  label: string
}

interface Props {
  slug: string
  productName: string
  category?: string
  badge?: string
  imageUrl?: string
  images?: Array<{ id: string; label: string; description: string; url: string; order: number }>
  selectedFormat?: FormatOption
  selectedPaper?: PaperOption
  selectedFinish?: FinishOption
  rectoverso?: boolean
  customVisualUrl?: string
  onFlipRectoVerso?: () => void
}

export function ProductImageGallery({
  slug,
  productName,
  category = '',
  badge,
  imageUrl,
  images,
  selectedFormat,
  selectedPaper,
  selectedFinish,
  rectoverso = false,
  customVisualUrl,
  onFlipRectoVerso
}: Props) {
  const [activeView, setActiveView] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [environment, setEnvironment] = useState<'studio' | 'expo' | 'dark'>('studio')
  const [showDimensions, setShowDimensions] = useState(true)
  const [showHumanScale, setShowHumanScale] = useState(false)
  const [isDemoActive, setIsDemoActive] = useState(false)

  // 3D Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0, glintX: 50, glintY: 50 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Détection du profil universel de produit
  const archetype: ProductArchetype = detectProductArchetype(slug, category)

  // Gestion du survol 3D interactif
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Angle d'inclinaison subtil et élégant (max 8 deg)
    const rotateY = ((x - centerX) / centerX) * 8
    const rotateX = -((y - centerY) / centerY) * 8

    const glintX = (x / rect.width) * 100
    const glintY = (y / rect.height) * 100

    setTilt({ x: rotateX, y: rotateY, glintX, glintY })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glintX: 50, glintY: 50 })
  }

  // Vues du produit : images réelles de l'API ou 3 vues universelles du studio
  const hasGalleryImages = images && images.length > 0
  const views = hasGalleryImages ? images.sort((a, b) => a.order - b.order) : getArchetypeViews(archetype)

  // Ambiance de studio sélectionnée
  const envStyles = {
    studio: 'from-gray-50 via-gray-100 to-gray-200 border-gray-200 text-gray-900',
    expo: 'from-[#1A2639] via-[#111A28] to-[#0A101D] border-gray-700 text-white',
    dark: 'from-[#0F172A] via-[#020617] to-black border-gray-800 text-white'
  }

  // Format dimensions extraction pour affichage
  const formatDimensions = () => {
    if (selectedFormat?.dimensions) {
      const parts = selectedFormat.dimensions.split('×')
      if (parts.length === 2) {
        return {
          widthLabel: parts[0].trim(),
          heightLabel: parts[1].split('·')[0].trim()
        }
      }
      return { widthLabel: selectedFormat.dimensions, heightLabel: '' }
    }
    if (selectedFormat?.label) {
      const parts = selectedFormat.label.split('×')
      if (parts.length === 2) {
        return {
          widthLabel: parts[0].trim(),
          heightLabel: parts[1].split('(')[0].trim()
        }
      }
      return { widthLabel: selectedFormat.label, heightLabel: '' }
    }

    if (archetype === 'business_card') return { widthLabel: '85 mm', heightLabel: '55 mm' }
    if (archetype === 'flyer') return { widthLabel: '14.8 cm', heightLabel: '21.0 cm' }
    if (archetype === 'poster') return { widthLabel: '29.7 cm', heightLabel: '42.0 cm' }
    if (archetype === 'rollup') return { widthLabel: '85 cm', heightLabel: '200 cm' }
    if (archetype === 'banner') return { widthLabel: '300 cm', heightLabel: '100 cm' }

    return { widthLabel: 'Format Standard', heightLabel: 'HD' }
  }

  const dims = formatDimensions()

  // Détermination de la finition matière pour le reflet et le rendu
  const finishLabel = (selectedFinish?.label || '').toLowerCase()
  const paperLabel = (selectedPaper?.label || '').toLowerCase()

  const isGold = finishLabel.includes('or') || finishLabel.includes('dore')
  const isGlossy = paperLabel.includes('brillant') || finishLabel.includes('brillant') || finishLabel.includes('vernis')
  const isKraft = paperLabel.includes('kraft')
  const isTextile = paperLabel.includes('textile') || archetype === 'textile'

  const materialFinish = isGold ? 'or' : isGlossy ? 'brillant' : isKraft ? 'kraft' : isTextile ? 'textile' : 'mat'

  // Échelle humaine vs Échelle en main
  const isLargeFormat = archetype === 'rollup' || archetype === 'poster' || archetype === 'banner'
  const isHandheld = archetype === 'business_card' || archetype === 'flyer' || archetype === 'stickers'

  // Vérification de compatibilité Recto/Verso
  const canFlip = archetype === 'business_card' || archetype === 'flyer' || archetype === 'brochure' || archetype === 'textile' || rectoverso

  // Visuel effectif (uploadé par le client ou démo activée)
  const activeVisualUrl = customVisualUrl || (isDemoActive ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80' : undefined)

  // Gestion du retournement Recto/Verso interactif
  const handleToggleFlip = () => {
    if (activeView === 0) {
      setActiveView(1)
    } else if (activeView === 1) {
      setActiveView(0)
    }
    if (onFlipRectoVerso) onFlipRectoVerso()
  }

  // ─── RENDU CENTRAL DE L'ILLUSTRATION DU PRODUIT ───────────────────────────
  const renderProductIllustration = (viewIdx: number, w: number, h: number) => {
    const commonProps = {
      width: w,
      height: h,
      customVisualUrl: activeVisualUrl,
      showHumanScale: showHumanScale,
      materialFinish: materialFinish,
      formatLabel: selectedFormat?.label || dims.widthLabel,
      showDimensionLines: showDimensions,
      dimensions: dims,
      productName: productName
    }

    switch (archetype) {
      case 'rollup':
        if (viewIdx === 0) return <RollupIllustration {...commonProps} />
        if (viewIdx === 1) return <RollupBaseIllustration width={w} height={h} />
        if (viewIdx === 2) return <RollupBagIllustration width={w} height={h} />
        break

      case 'business_card':
        return <BusinessCardVisualizer viewIndex={viewIdx} {...commonProps} />

      case 'flyer':
        return <FlyerVisualizer viewIndex={viewIdx} {...commonProps} />

      case 'poster':
        return <PosterVisualizer viewIndex={viewIdx} {...commonProps} />

      case 'brochure':
        return <BrochureVisualizer viewIndex={viewIdx} {...commonProps} />

      case 'textile':
        return <TextileVisualizer viewIndex={viewIdx} {...commonProps} />

      case 'tote_bag':
        return <ToteBagVisualizer viewIndex={viewIdx} {...commonProps} />

      case 'stickers':
        return <StickerVisualizer viewIndex={viewIdx} {...commonProps} />

      case 'banner':
        return <BannerVisualizer viewIndex={viewIdx} {...commonProps} />

      default:
        return <GenericUniversalVisualizer viewIndex={viewIdx} {...commonProps} />
    }

    return <GenericUniversalVisualizer viewIndex={viewIdx} {...commonProps} />
  }

  return (
    <div className="space-y-3">

      {/* ── BARRE D'OUTILS INTERACTIVE DU STUDIO ── */}
      <div className="flex items-center justify-between gap-1.5 px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-sm text-xs overflow-x-auto scrollbar-none">
        
        {/* Sélecteur d'ambiance d'éclairage (secondaire : masqué sur petit écran) */}
        <div className="hidden sm:flex items-center gap-1 bg-gray-100 p-1 rounded-lg shrink-0" role="group" aria-label="Éclairage de l'aperçu">
          <button
            onClick={() => setEnvironment('studio')}
            className={`px-2 py-1 rounded-lg text-2xs font-semibold flex items-center gap-1 transition-all
              ${environment === 'studio' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            title="Éclairage Studio Neutre 5000K"
            aria-pressed={environment === 'studio'}
          >
            <Sun size={12} className={environment === 'studio' ? 'text-amber-500' : ''} />
            <span className="hidden sm:inline">Studio</span>
          </button>
          <button
            onClick={() => setEnvironment('expo')}
            className={`px-2 py-1 rounded-lg text-2xs font-semibold flex items-center gap-1 transition-all
              ${environment === 'expo' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            title="Ambiance Stand d'exposition"
            aria-pressed={environment === 'expo'}
          >
            <Sparkles size={12} className={environment === 'expo' ? 'text-amber-400' : ''} />
            <span className="hidden sm:inline">Stand</span>
          </button>
          <button
            onClick={() => setEnvironment('dark')}
            className={`px-2 py-1 rounded-lg text-2xs font-semibold flex items-center gap-1 transition-all
              ${environment === 'dark' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            title="Mode Sombre & Reflets Luxe"
            aria-pressed={environment === 'dark'}
          >
            <Moon size={12} className={environment === 'dark' ? 'text-indigo-400' : ''} />
            <span className="hidden sm:inline">Nuit</span>
          </button>
        </div>

        {/* Contrôles interactifs complémentaires */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Toggle Cotes & Dimensions architecturales */}
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all text-2xs
              ${showDimensions
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            title="Afficher/masquer les cotes architecturales de coupe"
            aria-label="Afficher les cotes"
            aria-pressed={showDimensions}
          >
            <Ruler size={13} className={showDimensions ? 'text-primary' : 'text-gray-400'} />
            <span className="hidden md:inline">Cotes</span>
          </button>

          {/* Comparateur d'Échelle Réelle (Humaine ou En main) */}
          {(isLargeFormat || isHandheld) && (
            <button
              onClick={() => setShowHumanScale(!showHumanScale)}
              className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all text-2xs
                ${showHumanScale
                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              title={isLargeFormat ? 'Comparateur de taille humaine 1.75m' : 'Comparateur d\'échelle en main 1:1'}
            >
              {isLargeFormat ? (
                <User size={13} className={showHumanScale ? 'text-blue-600' : 'text-gray-400'} />
              ) : (
                <Smartphone size={13} className={showHumanScale ? 'text-blue-600' : 'text-gray-400'} />
              )}
              <span>{isLargeFormat ? 'Taille réelle' : 'Échelle 1:1'}</span>
            </button>
          )}

          {/* Toggle Flip Recto / Verso 3D */}
          {canFlip && (
            <button
              onClick={handleToggleFlip}
              className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all text-2xs
                ${activeView === 1
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              title="Tourner le produit (Recto / Verso)"
            >
              <RotateCw size={13} className={activeView === 1 ? 'text-amber-600' : 'text-gray-500'} />
              <span>{activeView === 1 ? 'Voir Recto' : 'Voir Verso'}</span>
            </button>
          )}

          {/* Démo visuelle toggle (si aucun fichier uploadé) */}
          {!customVisualUrl && (
            <button
              onClick={() => setIsDemoActive(!isDemoActive)}
              className={`p-1.5 rounded-lg border transition-all text-2xs font-semibold flex items-center gap-1
                ${isDemoActive
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800'}`}
              title="Aperçu avec un design exemple appliqué sur le produit"
              aria-label="Afficher un design d'exemple"
              aria-pressed={isDemoActive}
            >
              <Palette size={14} className={isDemoActive ? 'text-indigo-600' : 'text-gray-400'} />
              <span className="hidden lg:inline">Exemple</span>
            </button>
          )}

          {/* Bouton Zoom Lightbox */}
          <button
            onClick={() => setZoomed(true)}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title="Agrandir en haute résolution"
            aria-label="Agrandir l'aperçu"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* ── ZONE DE VISUALISATION PRINCIPALE (3D PARALLAX & LIGHTING) ── */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative bg-gradient-to-br ${envStyles[environment]} rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center border shadow-sm cursor-zoom-in transition-all duration-300 select-none group`}
        onClick={() => setZoomed(true)}
        style={{
          perspective: '1200px',
        }}
      >
        {/* Badge promotionnel / populaire */}
        {badge && (
          <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full text-xs font-bold bg-primary text-foreground shadow-sm pointer-events-none select-none">
            {badge}
          </div>
        )}

        {/* Indicateur de finition dorure or / vernis sélectif */}
        {isGold && (
          <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-2xs font-bold bg-gradient-to-r from-amber-400 to-amber-600 text-gray-950 shadow-md flex items-center gap-1 pointer-events-none select-none">
            <Sparkles size={11} /> Dorure Or à Chaud
          </div>
        )}

        {/* Cotes dynamiques affichées en direct */}
        {showDimensions && (
          <div className="absolute top-3 right-3 z-20 bg-black/75 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-2xs font-mono tracking-wide flex items-center gap-1.5 border border-white/10 shadow-sm">
            <Ruler size={11} className="text-emerald-400" />
            <span>{dims.widthLabel} × {dims.heightLabel}</span>
          </div>
        )}

        {/* Reflet spéculaire dynamique suivant la souris */}
        <div
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-200"
          style={{
            background: `radial-gradient(circle at ${tilt.glintX}% ${tilt.glintY}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 65%)`,
            opacity: environment === 'dark' || environment === 'expo' ? 0.35 : 0.6
          }}
        />

        {/* Éclairage spot zénithal en mode Stand d'exposition */}
        {environment === 'expo' && (
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent z-0" />
        )}

        {/* Image Cloudinary ou Visualiseur Vectoriel 3D Tilté */}
        <div
          className="w-full h-full flex items-center justify-center relative transition-transform duration-100 ease-out z-10"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {hasGalleryImages && isGalleryImage(views[activeView]) && views[activeView].url ? (
            <Image
              src={views[activeView].url}
              alt={views[activeView].label}
              fill
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            />
          ) : imageUrl && activeView === 0 && !customVisualUrl && !isDemoActive ? (
            <Image
              src={imageUrl}
              alt={productName}
              fill
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-2">
              {renderProductIllustration(activeView, 320, 240)}
            </div>
          )}
        </div>

        {/* Label vue en bas au centre */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-gray-800 dark:text-gray-200 shadow-md border border-gray-200/50 dark:border-gray-700/50 whitespace-nowrap z-20 flex items-center gap-1.5">
          <Eye size={12} className="text-primary" />
          <span>{views[activeView]?.label}</span>
          <span className="text-gray-400 text-2xs">
            · {isGalleryImage(views[activeView]) ? views[activeView].description : (views[activeView] as any)?.desc}
          </span>
        </div>
      </div>

      {/* ── MINIATURES INTERACTIVES DES 3 VUES ── */}
      <div className="flex gap-2">
        {views.map((view, i) => (
          <button
            key={i}
            onClick={() => setActiveView(i)}
            className={`flex-1 aspect-square rounded-xl overflow-hidden border-2 transition-all bg-gradient-to-br ${envStyles.studio} flex flex-col items-center justify-center relative p-1
              ${activeView === i
                ? 'border-primary ring-2 ring-primary/20 shadow-sm scale-100 bg-white'
                : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'}`}
          >
            {hasGalleryImages && isGalleryImage(view) && view.url ? (
              <Image
                src={view.url}
                alt={view.label}
                fill
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center scale-90">
                {renderProductIllustration(i, 64, 48)}
              </div>
            )}
            <span className="text-2xs font-bold text-gray-700 line-clamp-2 leading-tight w-full text-center px-1 mt-0.5">
              {view.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── MODAL ZOOM PLEIN ÉCRAN HAUTE RÉSOLUTION ── */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <div
            className="relative bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
              <div>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-base md:text-lg">
                  {productName}
                </h3>
                <p className="text-xs text-gray-500">
                  Vue détaillée haute fidélité — {views[activeView]?.label} ({dims.widthLabel} × {dims.heightLabel})
                </p>
              </div>
              <button
                onClick={() => setZoomed(false)}
                className="w-9 h-9 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-700 dark:text-gray-300 transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            {/* Canvas central agrandi */}
            <div className="flex items-center justify-center py-6 relative min-h-[380px] w-full bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {hasGalleryImages && isGalleryImage(views[activeView]) && views[activeView].url ? (
                <Image
                  src={views[activeView].url}
                  alt={views[activeView].label}
                  fill
                  className="object-contain p-4"
                />
              ) : imageUrl && activeView === 0 && !customVisualUrl && !isDemoActive ? (
                <Image
                  src={imageUrl}
                  alt={productName}
                  fill
                  className="object-contain p-4"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center scale-125">
                  {renderProductIllustration(activeView, 460, 340)}
                </div>
              )}
            </div>

            {/* Sélecteur de vues rapide dans le modal */}
            <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-2">
                {views.map((v, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveView(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                      ${activeView === idx
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-200'}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <Check size={14} /> Résolution 1200 DPI
                </span>
                <span>Format : <strong>{selectedFormat?.label || dims.widthLabel}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
