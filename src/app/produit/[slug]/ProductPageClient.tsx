'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronRight, ShieldCheck, Truck, Clock, Upload,
  ShoppingCart, HelpCircle, FileCheck, FileWarning,
  AlertTriangle, Check, ChevronDown, Star, Zap, RotateCcw,
  ArrowRight
} from 'lucide-react'
import { usePriceCalculator } from '@/hooks/useProducts'
import { useCart } from '@/context/CartContext'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductImageGallery } from '@/components/product/ProductImageGallery'
import { productsService, Product } from '@/lib/products.service'
import { PrepressGuide } from '@/components/product/PrepressGuide'
import { DevisPopup } from '@/components/product/DevisPopup'
import { ProductReviews } from '@/components/product/ProductReviews'
import { uploadService } from '@/lib/upload.service'
import { BatPreviewModal } from '@/components/product/BatPreviewModal'
import { useToast } from '@/context/ToastContext'
import { UniversalProductDetails } from '@/components/product/UniversalProductDetails'

function formatPrice(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

interface ProductPageClientProps { product: Product }

// ── Step Header ────────────────────────────────────────────────────────────────
function StepHeader({ step, label, sublabel }: { step: number; label: string; sublabel?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
        {step}
      </span>
      <div>
        <h3 className="text-[15px] font-bold text-gray-900 leading-none">{label}</h3>
        {sublabel && <p className="text-[11px] text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  )
}

// ── Section Wrapper ─────────────────────────────────────────────────────────────
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border-b border-gray-100 pb-6 last:border-b-0 last:pb-0 ${className}`}>
      {children}
    </div>
  )
}

export function ProductPageClient({ product }: ProductPageClientProps) {
  const router = useRouter()
  const { price, loading: priceLoading, calculate } = usePriceCalculator()
  const { addItem, openCart } = useCart()
  const toast = useToast()

  const [config, setConfig] = useState(() => ({
    formatId: (product as any).formats?.[0]?.id || '',
    paperId: (product as any).papers?.[0]?.id || '',
    quantity: (product as any).quantities?.[0] || product.minQuantity || 100,
    finishId: (product as any).finishes?.[0]?.id || '',
    rectoverso: false,
  }))

  const [addedToCart, setAddedToCart] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [prepressOpen, setPrepressOpen] = useState(false)
  const [devisOpen, setDevisOpen] = useState(false)
  const [isBatModalOpen, setIsBatModalOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadState, setUploadState] = useState<{
    status: 'idle' | 'checking' | 'valid' | 'warning' | 'error' | 'uploading'
    fileName?: string
    fileSize?: string
    message?: string
    fileUrl?: string
  }>({ status: 'idle' })

  useEffect(() => {
    if (!product) return
    const initialConfig = {
      formatId: (product as any).formats?.[0]?.id || '',
      paperId: (product as any).papers?.[0]?.id || '',
      quantity: (product as any).quantities?.[0] || product.minQuantity || 100,
      finishId: (product as any).finishes?.[0]?.id || '',
      rectoverso: false,
    }
    calculate({ productId: product.id, basePrice: product.basePrice, ...initialConfig })

    productsService.getAll({ category: product.category, limit: 5 })
      .then((res) => {
        const siblings = (res.data || res) as any[]
        if (Array.isArray(siblings))
          setRelatedProducts(siblings.filter((p: any) => p.id !== product.id).slice(0, 4))
      })
      .catch(() => {})
  }, [product, calculate])

  useEffect(() => {
    if (!product || !config.formatId) return
    
    const sFormat = (product as any).formats?.find((f: any) => f.id === config.formatId)
    const sPaper = (product as any).papers?.find((p: any) => p.id === config.paperId)
    const sFinish = (product as any).finishes?.find((f: any) => f.id === config.finishId)

    calculate({ 
      productId: product.id, 
      basePrice: product.basePrice, 
      ...config,
      formatMultiplier: sFormat?.multiplier || 1,
      paperExtra: sPaper?.priceExtra || 0,
      finishExtra: sFinish?.priceModifier ?? sFinish?.priceExtra ?? 0
    })
  }, [config, product, calculate])

  const selectedFormat = (product as any).formats?.find((f: any) => f.id === config.formatId)
  const selectedPaper  = (product as any).papers?.find((p: any) => p.id === config.paperId)
  const selectedFinish = (product as any).finishes?.find((f: any) => f.id === config.finishId)

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: `${product.id}-${config.formatId}-${config.paperId}-${config.finishId}-${config.rectoverso ? 'rv' : 'r'}`,
      productId: product.id,
      productName: product.name,
      emoji: product.emoji,
      formatId: config.formatId,
      formatLabel: selectedFormat?.label || config.formatId,
      paperId: config.paperId,
      paperLabel: selectedPaper?.label || config.paperId,
      quantity: config.quantity,
      rectoverso: config.rectoverso,
      finition: selectedFinish?.label || 'Sans finition',
      price: price?.total || product.basePrice,
      unitPrice: price?.unitPrice || 0,
      fileUrl: uploadState.fileUrl,
      fileName: uploadState.fileName,
    })
    openCart()
    toast.success(`${product.emoji} Ajouté au panier !`, `${config.quantity} ex. de ${product.name}`)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

  const handleBuyNow = () => {
    if (!product) return
    addItem({
      id: `${product.id}-${config.formatId}-${config.paperId}-${config.finishId}-${config.rectoverso ? 'rv' : 'r'}`,
      productId: product.id,
      productName: product.name,
      emoji: product.emoji,
      formatId: config.formatId,
      formatLabel: selectedFormat?.label || config.formatId,
      paperId: config.paperId,
      paperLabel: selectedPaper?.label || config.paperId,
      quantity: config.quantity,
      rectoverso: config.rectoverso,
      finition: selectedFinish?.label || 'Sans finition',
      price: price?.total || product.basePrice,
      unitPrice: price?.unitPrice || 0,
      fileUrl: uploadState.fileUrl,
      fileName: uploadState.fileName || 'Visuel différé / WhatsApp',
    })
    router.push('/commande')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadState({ status: 'checking', fileName: file.name })
    const sizeInMB = file.size / (1024 * 1024)
    const formattedSize = sizeInMB.toFixed(2) + ' Mo'
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    const allowed = ['pdf', 'ai', 'psd', 'jpg', 'jpeg', 'png', 'tiff']
    
    if (sizeInMB > 50)
      return setUploadState({ status: 'error', fileName: file.name, fileSize: formattedSize, message: 'Le fichier dépasse 50 Mo.' })
    if (!allowed.includes(extension))
      return setUploadState({ status: 'error', fileName: file.name, fileSize: formattedSize, message: `Extension .${extension} non supportée.` })
    
    let warningMsg = ''
    if (['jpg', 'jpeg', 'png'].includes(extension) && sizeInMB < 0.25) {
      warningMsg = 'Résolution faible suspectée. Préférez un PDF.'
    }

    // Prévisualisation immédiate en local si fichier image
    const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(extension)
    const localPreviewUrl = isImage ? URL.createObjectURL(file) : undefined

    // Lancer l'upload réel
    setUploadState({ 
      status: 'uploading', 
      fileName: file.name, 
      fileSize: formattedSize, 
      message: 'Upload en cours...',
      fileUrl: localPreviewUrl 
    })
    try {
      const res = await uploadService.uploadFile(file, 'designs')
      setUploadState({ 
        status: warningMsg ? 'warning' : 'valid', 
        fileName: file.name, 
        fileSize: formattedSize, 
        message: warningMsg || 'Fichier prêt pour l\'impression.',
        fileUrl: res.url || localPreviewUrl
      })
      if (warningMsg) {
        toast.warning('Fichier uploadé avec avertissement', warningMsg)
      } else {
        toast.success('Fichier uploadé avec succès', 'Votre design est prêt pour l\'impression.')
      }
    } catch (err) {
      setUploadState({ status: 'error', fileName: file.name, fileSize: formattedSize, message: 'Erreur lors de l\'upload du fichier. Veuillez réessayer.' })
      toast.error('Erreur d\'upload', 'Le fichier n\'a pas pu être envoyé. Vérifiez votre connexion.')
    }
  }

  const currentPrice  = price?.total || product.basePrice
  const currentUnit   = price?.unitPrice || 0
  const deliveryDays  = (price as any)?.deliveryDays || (product as any).deliveryDays || 2
  const badgeLabel    = product.badge === 'popular' ? 'Populaire' : product.badge === 'new' ? 'Nouveau' : product.badge === 'promo' ? 'Promo' : undefined

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-32 md:pb-10">

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center gap-1.5 text-xs text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-none">
          <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
          <ChevronRight size={12} />
          <Link href="/catalogue" className="hover:text-primary transition-colors">Catalogue</Link>
          <ChevronRight size={12} />
          <Link href={`/catalogue/${product.category}`} className="hover:text-primary transition-colors capitalize">
            {product.category}
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8">

          {/* ═══════════════════════════════════════════════════════════
              LEFT: Gallery + trust badges — sticky
          ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 z-40 space-y-4">

              {/* Image gallery card */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="relative">
                  {badgeLabel && (
                    <span className="absolute top-3 left-3 z-10 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded pointer-events-none select-none">
                      {badgeLabel}
                    </span>
                  )}
                  <ProductImageGallery
                    slug={product.slug}
                    productName={product.name}
                    category={product.category}
                    imageUrl={product.imageUrl}
                    images={product.images}
                    selectedFormat={selectedFormat}
                    selectedPaper={selectedPaper}
                    selectedFinish={selectedFinish}
                    rectoverso={config.rectoverso}
                    customVisualUrl={uploadState.fileUrl}
                    onFlipRectoVerso={() => setConfig(c => ({ ...c, rectoverso: !c.rectoverso }))}
                  />
                </div>

                {/* Réassurance sous image */}
                <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
                  {[
                    { icon: <ShieldCheck size={16} className="text-green-600"/>, label: 'Qualité Pro' },
                    { icon: <Clock size={16} className="text-primary"/>, label: `Livraison J+${deliveryDays}` },
                    { icon: <Check size={16} className="text-emerald-600"/>, label: 'BAT vérifié' },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5 py-3 px-2">
                      {icon}
                      <span className="text-[10px] md:text-[11px] font-semibold text-gray-700 text-center leading-tight">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating + Description — desktop only */}
              <div className="hidden md:block bg-white rounded-xl border border-gray-200 p-5">
                <a href="#avis-clients" className="flex items-center gap-2 mb-3 hover:bg-gray-50 px-1 py-1 -ml-1 rounded-lg transition-colors group">
                  <div className="flex text-[#FFB800]">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" stroke="none" />)}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">4.9/5</span>
                  <span className="text-xs text-gray-400">— 127 avis vérifiés</span>
                </a>
                <p className="text-sm text-gray-600 leading-relaxed">{product.shortDesc}</p>
                {product.description && (
                  <p className="text-xs text-gray-400 leading-relaxed mt-2 line-clamp-3">{product.description}</p>
                )}
              </div>

              {/* Express badge */}
              <div className="hidden md:flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <Zap size={18} className="text-amber-500 shrink-0" />
                <div>
                  <p className="text-[12px] font-bold text-amber-800">Production Express disponible</p>
                  <p className="text-[11px] text-amber-600">Livraison en {deliveryDays}h ouvrées après validation du fichier</p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              RIGHT: Product name + Configurator
          ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-3">

            {/* Product name block */}
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-5 md:px-6 md:py-6">
              <h1 className="font-display text-xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-1.5">
                {product.name}
              </h1>
              <p className="text-gray-500 text-sm md:text-base">{product.shortDesc}</p>
              {/* Mobile: rating */}
              <a href="#avis-clients" className="flex items-center gap-2 mt-3 md:hidden">
                <div className="flex text-[#FFB800]">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" stroke="none" />)}
                </div>
                <span className="text-xs font-semibold text-gray-600 underline">4.9/5 · 127 avis</span>
              </a>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                CONFIGURATOR CARD
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-5 md:px-6 md:py-6 space-y-6">

              {/* ── ÉTAPE 1: Format ── */}
              {(product as any).formats?.length > 0 && (
                <Section>
                  <StepHeader step={1} label="Choisissez votre format" sublabel="Cliquez pour sélectionner la taille souhaitée" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {(product as any).formats.map((f: any) => {
                      const sel = config.formatId === f.id
                      return (
                        <button
                          key={f.id}
                          onClick={() => setConfig(c => ({ ...c, formatId: f.id }))}
                          className={`relative flex flex-col items-center gap-2 px-3 py-4 rounded-xl border-2 transition-all text-center select-none
                            ${sel
                              ? 'border-primary bg-green-50 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]'}`}
                        >
                          {/* Check indicator */}
                          {sel && (
                            <span className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check size={11} strokeWidth={3} className="text-white" />
                            </span>
                          )}
                          {/* Format miniature */}
                          <div className={`w-10 h-12 border-2 rounded flex items-center justify-center text-[10px] font-bold shadow-sm
                            ${sel ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                            {f.label}
                          </div>
                          <div className="flex flex-col items-center mt-1">
                            <span className={`text-[13px] font-bold leading-tight ${sel ? 'text-primary' : 'text-gray-900'}`}>
                              {f.label}
                            </span>
                            {f.dimensions && (
                              <span className={`text-[10px] mt-0.5 leading-tight ${sel ? 'text-primary/80' : 'text-gray-500'}`}>
                                {f.dimensions}
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </Section>
              )}

              {/* ── ÉTAPE 2: Matière / Papier ── */}
              {(product as any).papers?.length > 0 && (
                <Section>
                  <StepHeader step={2} label="Sélectionnez la matière" sublabel="Qualité d'impression garantie" />
                  <div className="space-y-2">
                    {(product as any).papers.map((p: any) => {
                      const sel = config.paperId === p.id
                      return (
                        <button
                          key={p.id}
                          onClick={() => setConfig(c => ({ ...c, paperId: p.id }))}
                          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all select-none
                            ${sel
                              ? 'border-primary bg-green-50 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99]'}`}
                        >
                          {/* Radio dot */}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                            ${sel ? 'border-primary bg-primary' : 'border-gray-300 bg-white'}`}>
                            {sel && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`block text-[14px] font-bold ${sel ? 'text-primary' : 'text-gray-900'}`}>
                              {p.label}
                            </span>
                            {p.description && (
                              <span className={`block text-[12px] mt-0.5 ${sel ? 'text-primary/80' : 'text-gray-500'}`}>
                                {p.description}
                              </span>
                            )}
                          </div>
                          {p.priceExtra && (
                            <span className={`text-[11px] font-bold shrink-0 ${sel ? 'text-primary' : 'text-gray-400'}`}>
                              +{p.priceExtra} FCFA
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </Section>
              )}

              {/* ── ÉTAPE 3: Type d'impression ── */}
              <Section>
                <StepHeader step={3} label="Type d'impression" sublabel="Recto uniquement ou recto-verso ?" />
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { value: false, label: 'Recto seul', icon: '▭', desc: 'Impression 1 face' },
                    { value: true,  label: 'Recto / Verso', icon: '⇌', desc: 'Impression 2 faces' },
                  ].map(({ value, label, icon, desc }) => {
                    const sel = config.rectoverso === value
                    return (
                      <button
                        key={String(value)}
                        onClick={() => setConfig(c => ({ ...c, rectoverso: value }))}
                        className={`relative flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2 transition-all text-center select-none
                          ${sel
                            ? 'border-primary bg-green-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]'}`}
                      >
                        {sel && (
                          <span className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Check size={11} strokeWidth={3} className="text-white" />
                          </span>
                        )}
                        <span className={`text-2xl leading-none ${sel ? 'text-primary' : 'text-gray-400'}`}>{icon}</span>
                        <span className={`text-[13px] font-bold ${sel ? 'text-primary' : 'text-gray-900'}`}>{label}</span>
                        <span className="text-[10px] text-gray-400">{desc}</span>
                      </button>
                    )
                  })}
                </div>
              </Section>

              {/* ── ÉTAPE 4: Finition spéciale ── */}
              {(product as any).finishes?.length > 0 && (
                <Section>
                  <StepHeader step={4} label="Finition spéciale" sublabel="Valorisez vos impressions (optionnel)" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {(product as any).finishes.map((f: any) => {
                      const sel = config.finishId === f.id
                      return (
                        <button
                          key={f.id}
                          onClick={() => setConfig(c => ({ ...c, finishId: sel ? '' : f.id }))}
                          className={`relative flex flex-col items-center justify-center gap-1 px-3 py-4 rounded-xl border-2 transition-all text-center h-full select-none
                            ${sel
                              ? 'border-primary bg-green-50 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]'}`}
                        >
                          {sel && (
                            <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <Check size={9} strokeWidth={3} className="text-white" />
                            </span>
                          )}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1
                            ${sel ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                            {f.value === 'none' ? <span className="text-sm">Ø</span> : <span className="text-sm">✨</span>}
                          </div>
                          <span className={`text-[12px] md:text-[13px] font-bold leading-tight ${sel ? 'text-primary' : 'text-gray-900'}`}>{f.label}</span>
                          
                          {f.priceModifier > 0 ? (
                            <span className={`text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full ${sel ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                              +{f.priceModifier} FCFA
                            </span>
                          ) : (
                            <span className={`text-[10px] mt-1 ${sel ? 'text-primary/80' : 'text-gray-400'}`}>Inclus</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </Section>
              )}

              {/* ── ÉTAPE 5: Quantité ── */}
              {(product as any).quantities?.length > 0 && (
                <Section>
                  <div className="flex items-center justify-between mb-4">
                    <StepHeader step={5} label="Quantité souhaitée" sublabel={`Min. ${formatPrice(product.minQuantity || 100)} ex.`} />
                    {currentUnit > 0 && !priceLoading && (
                      <span className="text-[11px] font-semibold text-gray-400 shrink-0">
                        {formatPrice(currentUnit)} FCFA/u
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {(product as any).quantities.map((q: number) => {
                      const sel = config.quantity === q
                      return (
                        <button
                          key={q}
                          onClick={() => setConfig(c => ({ ...c, quantity: q }))}
                          className={`py-3 px-2 rounded-xl border-2 text-[13px] md:text-[14px] font-bold transition-all text-center
                            ${sel
                              ? 'border-primary bg-primary text-white shadow-md'
                              : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]'}`}
                        >
                          {formatPrice(q)}
                          <span className="block text-[9px] font-normal mt-0.5 opacity-70">ex.</span>
                        </button>
                      )
                    })}
                  </div>
                </Section>
              )}

              {/* ── ÉTAPE 6: Fichier d'impression ── */}
              <Section>
                <div className="flex items-center justify-between mb-4">
                  <StepHeader step={6} label="Fichier d'impression" />
                  <button
                    onClick={() => setPrepressOpen(true)}
                    className="flex items-center gap-1 text-[11px] text-primary font-semibold hover:underline underline-offset-4"
                  >
                    <HelpCircle size={13} />
                    Guide technique
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.ai,.psd,.jpg,.jpeg,.png,.tiff"
                  className="hidden"
                />

                {/* Drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all
                    ${uploadState.status === 'idle'    ? 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-green-50' : ''}
                    ${uploadState.status === 'checking' ? 'border-blue-300 bg-blue-50' : ''}
                    ${uploadState.status === 'valid'    ? 'border-primary bg-green-50' : ''}
                    ${uploadState.status === 'warning'  ? 'border-amber-400 bg-amber-50' : ''}
                    ${uploadState.status === 'error'    ? 'border-red-400 bg-red-50' : ''}`}
                >
                  <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 text-center">
                    {uploadState.status === 'idle' && (
                      <>
                        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                          <Upload size={22} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Déposer ou cliquer pour envoyer</p>
                          <p className="text-gray-400 text-xs mt-1">PDF recommandé · AI, PSD, JPG, PNG · Max 50 Mo</p>
                        </div>
                        <span className="text-[11px] bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-semibold">
                          Choisir un fichier
                        </span>
                      </>
                    )}
                    {uploadState.status === 'checking' && (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-bold text-blue-600">Analyse du fichier...</p>
                      </div>
                    )}
                    {uploadState.status === 'uploading' && (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-bold text-blue-600">{uploadState.message}</p>
                        <p className="text-xs text-blue-400">{uploadState.fileName}</p>
                      </div>
                    )}
                    {uploadState.status === 'valid' && (
                      <>
                        <FileCheck size={36} className="text-primary" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{uploadState.fileName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{uploadState.fileSize}</p>
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                          <span className="flex items-center justify-center gap-1.5 text-[12px] bg-green-100 text-primary px-3 py-1.5 rounded-full font-bold">
                            <Check size={12} strokeWidth={3} /> Fichier conforme
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsBatModalOpen(true);
                            }}
                            className="flex items-center justify-center gap-1.5 text-[12px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full font-bold hover:bg-indigo-100 transition-colors"
                          >
                            👁️ Voir mon Bon À Tirer (BAT)
                          </button>
                        </div>
                      </>
                    )}
                    {uploadState.status === 'warning' && (
                      <>
                        <AlertTriangle size={36} className="text-amber-500" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{uploadState.fileName}</p>
                          <p className="text-xs text-amber-700 mt-0.5">{uploadState.message}</p>
                        </div>
                        <span className="text-[11px] text-amber-700 underline">Remplacer le fichier</span>
                      </>
                    )}
                    {uploadState.status === 'error' && (
                      <>
                        <FileWarning size={36} className="text-red-500" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{uploadState.fileName}</p>
                          <p className="text-xs text-red-600 mt-0.5">{uploadState.message}</p>
                        </div>
                        <span className="text-[11px] text-red-600 underline">Choisir un autre fichier</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Spec rapide */}
                {uploadState.status === 'idle' && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[
                      { label: 'Résolution', value: '300 DPI min' },
                      { label: 'Fond perdu', value: '3mm' },
                      { label: 'Format conseillé', value: 'PDF/X-1a' },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-2 text-center">
                        <p className="text-[9px] text-gray-400 uppercase tracking-wide font-semibold">{label}</p>
                        <p className="text-[11px] font-bold text-gray-700 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Option fichier différé / WhatsApp */}
                <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-900 min-w-0">
                    <span className="text-base shrink-0">💡</span>
                    <span className="leading-tight text-[11px]">Pas encore de maquette ? Vous pouvez commander maintenant et l'envoyer par WhatsApp.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadState({
                      status: 'valid',
                      fileName: 'Envoi ultérieur (WhatsApp / Email)',
                      fileSize: 'À fournir après commande',
                      message: 'Visuel différé sélectionné'
                    })}
                    className="shrink-0 px-3 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold rounded-lg transition-colors text-[11px]"
                  >
                    Envoyer plus tard
                  </button>
                </div>
              </Section>

            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                PRICE + ADD TO CART STICKY BAR
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* Mobile: fixed bottom bar */}
            <div 
              className="fixed md:hidden left-0 right-0 bottom-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.10)] px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-medium truncate">Total · {formatPrice(config.quantity)} ex.</p>
                  {priceLoading ? (
                    <div className="h-6 w-20 bg-gray-100 rounded animate-pulse mt-0.5" />
                  ) : (
                    <p className="font-display text-xl font-extrabold text-gray-900 leading-none">
                      {formatPrice(currentPrice)} <span className="text-xs font-normal text-gray-400">FCFA</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddToCart}
                    className={`flex items-center justify-center p-3 rounded-xl border-2 font-bold text-xs transition-all active:scale-95
                      ${addedToCart ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'}`}
                    title="Ajouter au panier"
                  >
                    <ShoppingCart size={16} />
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-xs bg-[#FF6B00] text-white hover:bg-[#E66000] active:scale-95 transition-all shadow-md"
                  >
                    <span>Commander</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop: inline price + cart block */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 px-6 py-5">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">
                    Total TTC — {formatPrice(config.quantity)} exemplaires
                  </p>
                  {priceLoading ? (
                    <div className="h-10 w-36 bg-gray-100 rounded-lg animate-pulse" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <p className="font-display text-4xl font-extrabold text-gray-900 tracking-tight">
                        {formatPrice(currentPrice)}
                      </p>
                      <span className="text-lg font-bold text-gray-400">FCFA</span>
                    </div>
                  )}
                  {currentUnit > 0 && !priceLoading && (
                    <p className="text-xs text-gray-400 mt-1">
                      soit <strong className="text-gray-700">{formatPrice(currentUnit)} FCFA</strong> / ex.
                    </p>
                  )}
                  <p className="flex items-center gap-1.5 text-primary font-bold text-xs mt-2">
                    <Truck size={13} /> Livraison prévue J+{deliveryDays}
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 shrink-0 min-w-[240px]">
                  <button
                    onClick={handleBuyNow}
                    className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl font-bold text-base bg-[#FF6B00] text-white hover:bg-[#E66000] shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
                  >
                    Commander maintenant <ArrowRight size={18} />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleAddToCart}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 font-bold text-xs transition-all
                        ${addedToCart
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50 active:scale-98'}`}
                    >
                      <ShoppingCart size={14} />
                      {addedToCart ? 'Ajouté !' : 'Au panier'}
                    </button>
                    <button
                      onClick={() => setDevisOpen(true)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-xs hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                      Devis proforma
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Fiche détaillée universelle (Tous produits & futures créations) ── */}
        <UniversalProductDetails product={product} />

        {/* ── Produits liés ────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="mt-10 md:mt-14">
            <h2 className="font-display text-lg md:text-2xl font-extrabold text-gray-900 mb-4 md:mb-6">
              Dans la même catégorie
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {relatedProducts.map((p: any) => (
                <ProductCard key={p._id ?? p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════
            REVIEWS
        ═══════════════════════════════════════════════════════════ */}
        <div id="avis-clients" className="mt-12 md:mt-16">
          <ProductReviews
            productName={product.name}
            category={product.category}
            rating={4.9}
            totalReviews={127}
          />
        </div>
      </div>

      <PrepressGuide isOpen={prepressOpen} onClose={() => setPrepressOpen(false)} />
      <DevisPopup isOpen={devisOpen} onClose={() => setDevisOpen(false)} defaultProductName={product.name} />
      <BatPreviewModal 
        isOpen={isBatModalOpen} 
        onClose={() => setIsBatModalOpen(false)} 
        fileUrl={uploadState.fileUrl} 
        fileName={uploadState.fileName} 
      />
    </div>
  )
}
