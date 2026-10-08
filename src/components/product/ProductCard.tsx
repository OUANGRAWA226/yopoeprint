'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { ProductIllustration } from './ProductIllustrations'

// ─── Badge config (style Helloprint) ─────────────────────────────────────────
const BADGE_CFG: Record<string, { label: string; bg: string }> = {
  popular: { label: 'Populaire',  bg: 'bg-gray-900 text-white' },
  new:     { label: 'Nouveau',    bg: 'bg-green-600 text-white' },
  promo:   { label: 'Promo',      bg: 'bg-red-600 text-white' },
}

interface ProductCardProps {
  product?: {
    slug: string
    name: string
    shortDesc?: string
    description?: string
    basePrice: number
    minQuantity: number
    badge?: string
    emoji?: string
    imageUrl?: string
  }
  slug?: string
  name?: string
  description?: string
  basePrice?: number
  minQuantity?: number
  badge?: string
  imageUrl?: string
  style?: React.CSSProperties
}

export function ProductCard(props: ProductCardProps) {
  const slug        = props.product?.slug        ?? props.slug        ?? ''
  const name        = props.product?.name        ?? props.name        ?? ''
  const description = props.product?.shortDesc   ?? props.product?.description ?? props.description ?? ''
  const basePrice   = props.product?.basePrice   ?? props.basePrice   ?? 0
  const minQuantity = props.product?.minQuantity ?? props.minQuantity ?? 0
  const badge       = (props.product?.badge ?? props.badge) as string | undefined
  const imageUrl    = props.product?.imageUrl    ?? props.imageUrl

  const badgeCfg = badge ? BADGE_CFG[badge] : undefined

  return (
    <Link
      href={`/produit/${slug}`}
      style={props.style}
      className="group flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden
        hover:border-gray-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]
        transition-all duration-200 block active:scale-[0.98]"
    >
      {/* ────────────────────────────────────────
          IMAGE ZONE — fond gris clair, Helloprint
      ──────────────────────────────────────── */}
      <div className="relative bg-[#F8F8F8] flex items-center justify-center overflow-hidden"
        style={{ aspectRatio: '4/3' }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="p-4 transform group-hover:scale-105 transition-transform duration-500">
            <ProductIllustration slug={slug} width={140} height={105} />
          </div>
        )}

        {/* Badge — coin supérieur gauche, style HP */}
        {badgeCfg && (
          <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${badgeCfg.bg}`}>
            {badgeCfg.label}
          </span>
        )}

        {/* Quick view overlay au hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/4 transition-colors duration-200" />
      </div>

      {/* ────────────────────────────────────────
          PRODUCT INFO — blanc, compact comme HP
      ──────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-3 md:p-4 border-t border-gray-100">

        {/* Nom du produit */}
        <h3 className="font-semibold text-gray-900 text-[13px] md:text-sm leading-snug mb-1
          group-hover:text-primary transition-colors line-clamp-2">
          {name}
        </h3>

        {/* Description courte — desktop only */}
        {description && (
          <p className="hidden md:block text-[11px] text-gray-400 leading-relaxed line-clamp-2 mb-2">
            {description}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Prix + CTA — bottom row ── */}
        <div className="flex items-end justify-between gap-2 mt-2">

          {/* Prix bloc — style Helloprint : petit label + gros prix */}
          <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest font-semibold leading-none mb-0.5">
              À partir de
            </p>
            <p className="font-display font-black text-gray-900 leading-none"
               style={{ fontSize: 'clamp(15px, 3vw, 20px)' }}>
              {basePrice > 0
                ? new Intl.NumberFormat('fr-FR').format(basePrice)
                : '—'}
              <span className="text-[10px] md:text-xs font-normal text-gray-400 ml-0.5">FCFA</span>
            </p>
            {minQuantity > 0 && (
              <p className="text-[9px] md:text-[10px] text-gray-400 mt-0.5">
                Dès {new Intl.NumberFormat('fr-FR').format(minQuantity)} pcs
              </p>
            )}
          </div>

          {/* CTA bouton vert style HP — 44px min height pour touch */}
          <div className="shrink-0 bg-primary text-white text-[11px] md:text-xs font-bold
            px-3 py-2 md:px-4 md:py-2.5 rounded-lg whitespace-nowrap
            flex items-center gap-1.5 min-h-[40px] md:min-h-[44px]
            group-hover:bg-primary/90 transition-colors active:scale-95">
            <ShoppingCart size={13} className="shrink-0" />
            <span className="hidden sm:inline">Configurer</span>
            <span className="sm:hidden">Voir</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
