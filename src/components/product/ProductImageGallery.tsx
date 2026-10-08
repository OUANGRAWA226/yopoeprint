'use client'

// Type guard for gallery images
function isGalleryImage(view: any): view is { id: string; label: string; description: string; url: string; order: number } {
 return view && typeof view === 'object' && 'url' in view && typeof view.url === 'string';
}

import { useState } from 'react'
import { ProductIllustration } from './ProductIllustrations'
import { ZoomIn } from 'lucide-react'
import Image from 'next/image'

// Vues disponibles par produit
const VIEWS: Record<string, { label: string; desc: string }[]> = {
 'flyer-a5-classique': [
 { label: 'Recto', desc: 'Face avant' },
 { label: 'Verso', desc: 'Face arrière' },
 { label: 'Détail', desc: 'Texture papier' },
 ],
 'carte-de-visite-standard': [
 { label: 'Recto', desc: 'Face avant' },
 { label: 'Verso', desc: 'Face arrière' },
 { label: 'Pile', desc: 'Vue empilée' },
 ],
 default: [
 { label: 'Vue 1', desc: 'Vue principale' },
 { label: 'Vue 2', desc: 'Vue alternative' },
 { label: 'Détail', desc: 'Zoom texture' },
 ],
}

// Couleurs de fond par produit
const BG_GRADIENTS: Record<string, string> = {
 'flyer-a5-classique': 'bg-secondary to-[#C5D4F0]',
 'carte-de-visite-standard': 'from-[#FDF6E3] to-[#F0E0A0]',
 'affiche-a3-premium': 'from-[#E8F5ED] to-[#A8D5B5]',
 'brochure-3-volets': 'from-[#F8E8E8] to-[#F0C0C0]',
 'kakemono-roll-up': 'bg-secondary to-[#B8CCF0]',
 'tote-bag-coton': 'from-[#FDF6E3] to-[#EDD880]',
 't-shirt-personnalise': 'from-[#E8F5ED] to-[#90C8A0]',
 'etiquettes-rouleau': 'from-[#F0E8F8] to-[#C8A8E8]',
}

interface Props {
 slug: string
 productName: string
 badge?: string
 imageUrl?: string
 images?: Array<{ id: string; label: string; description: string; url: string; order: number }>
}

export function ProductImageGallery({ slug, productName, badge, imageUrl, images }: Props) {
 const [activeView, setActiveView] = useState(0)
 const [zoomed, setZoomed] = useState(false)

 // Utiliser les images réelles de la galerie s'ils existent, sinon vues par défaut
 const hasGalleryImages = images && images.length > 0
 const views = hasGalleryImages 
 ? images.sort((a, b) => a.order - b.order)
 : (VIEWS[slug] || VIEWS.default)
 
 const bgClass = BG_GRADIENTS[slug] || 'bg-secondary to-[#C5D4F0]'

 // Debug logging
 console.log('[ProductImageGallery] Props:', { slug, hasGalleryImages, imagesCount: images?.length, views: views.length })
 if (hasGalleryImages && views.length > 0) {
 console.log('[ProductImageGallery] First image structure:', views[0])
 console.log('[ProductImageGallery] All views:', views)
 }

 return (
 <div className="space-y-3">

 {/* ── Image principale ────────────────────────────── */}
 <div className={`relative ${bgClass} rounded-2xl overflow-hidden
 aspect-[4/3] flex items-center justify-center group cursor-zoom-in`}
 onClick={() => setZoomed(true)}>

 {/* Badge */}
 {badge && (
 <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-xs
 font-bold bg-primary text-foreground shadow-sm">
 {badge}
 </div>
 )}

 {/* Bouton zoom */}
 <button className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/80 backdrop-blur-sm
 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100
 transition-all hover:bg-white shadow-sm">
 <ZoomIn size={16} className="text-foreground" />
 </button>

 {/* Illustration SVG ou Image Cloudinary */}
 {hasGalleryImages && isGalleryImage(views[activeView]) && views[activeView].url ? (
 <Image
 src={views[activeView].url}
 alt={views[activeView].label}
 fill
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
 />
 ) : imageUrl && activeView === 0 ? (
 <Image
 src={imageUrl}
 alt={productName}
 fill
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
 />
 ) : (
 <div className="transition-transform duration-500 group-hover:scale-105 w-full h-full flex items-center justify-center absolute inset-0">
 {activeView === 0 && <ProductIllustration slug={slug} width={300} height={220} />}
 
 {activeView === 1 && (
 <div className="transform rotate-180 opacity-90">
 <ProductIllustration slug={slug} width={300} height={220} />
 </div>
 )}
 
 {activeView === 2 && (
 <div className="text-center p-6 flex flex-col items-center justify-center w-full h-full bg-white/20 backdrop-blur-[1px]">
 <div className="w-24 h-24 mx-auto bg-white/60 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
 <span className="text-4xl">🔍</span>
 </div>
 <p className="text-xs font-bold text-foreground opacity-70">
 Texture papier HD
 </p>
 <p className="text-[10px] text-gray-500 mt-1">
 Couché mat · 135g/m²
 </p>
 </div>
 )}
 </div>
 )}

 {/* Label vue */}
 <div className="absolute bottom-4 left-1/2 -translate-x-1/2
 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full
 text-xs font-medium text-foreground shadow-sm">
 {views[activeView].label} — {isGalleryImage(views[activeView]) ? views[activeView].description : (views[activeView] as { desc: string }).desc}
 </div>
 </div>

 {/* ── Miniatures ──────────────────────────────────── */}
 <div className="flex gap-2">
 {views.map((view, i) => (
 <button key={i}
 onClick={() => setActiveView(i)}
 className={`flex-1 aspect-square rounded-xl overflow-hidden border-2
 transition-all ${bgClass}
 flex items-center justify-center
 ${activeView === i
 ? 'border-border shadow-sm scale-105'
 : 'border-gray-100 hover:border-border/40 opacity-70 hover:opacity-100'}`}
 >
 {/* Image réelle ou illustration SVG */}
 {hasGalleryImages && isGalleryImage(view) && view.url ? (
 <Image
 src={view.url}
 alt={view.label}
 fill
 className="w-full h-full object-cover"
 />
 ) : (
 <div className={`transition-all ${activeView === i ? 'scale-100' : 'scale-75'}`}>
 <ProductIllustration slug={slug} width={60} height={44} />
 </div>
 )}
 </button>
 ))}
 </div>

 {/* ── Modal zoom ──────────────────────────────────── */}
 {zoomed && (
 <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm
 flex items-center justify-center p-4"
 onClick={() => setZoomed(false)}>
 <div className={`relative ${bgClass} rounded-3xl p-8
 max-w-lg w-full shadow-2xl`}
 onClick={(e) => e.stopPropagation()}>
 <button onClick={() => setZoomed(false)}
 className="absolute top-4 right-4 w-9 h-9 bg-white/80 rounded-xl
 flex items-center justify-center text-gray-500
 hover:text-red-500 transition-colors text-lg font-bold">
 ✕
 </button>
 <div className="flex items-center justify-center py-4 relative min-h-[300px] w-full">
 {hasGalleryImages && isGalleryImage(views[activeView]) && views[activeView].url ? (
 <Image
 src={views[activeView].url}
 alt={views[activeView].label}
 fill
 className="object-contain"
 />
 ) : imageUrl && activeView === 0 ? (
 <Image
 src={imageUrl}
 alt={productName}
 fill
 className="object-contain"
 />
 ) : (
 <>
 {activeView === 0 && <ProductIllustration slug={slug} width={380} height={280} />}
 
 {activeView === 1 && (
 <div className="transform rotate-180 opacity-80">
 <ProductIllustration slug={slug} width={380} height={280} />
 </div>
 )}

 {activeView === 2 && (
 <div className="text-center p-8 bg-white/40 rounded-3xl backdrop-blur-md shadow-xl border border-white/50">
 <div className="w-24 h-24 mx-auto bg-white/80 rounded-full flex items-center justify-center mb-4 shadow-inner">
 <span className="text-5xl">🔍</span>
 </div>
 <p className="text-lg font-bold text-gray-900">Texture détaillée</p>
 <p className="text-xs text-gray-600 mt-1">Vue macro simulée du rendu d'impression</p>
 </div>
 )}
 </>
 )}
 </div>
 <p className="text-center text-sm font-medium text-foreground mt-4 opacity-70">
 {productName}
 </p>
 </div>
 </div>
 )}
 </div>
 )
}
