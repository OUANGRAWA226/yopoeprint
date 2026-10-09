'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { ProductIllustration } from './ProductIllustrations'

// ─── Badge config (Apple clean pills) ─────────────────────────────────────────
const BADGE_CFG: Record<string, { label: string; bg: string }> = {
  popular: { label: 'Populaire', bg: 'bg-[#1D1D1F] text-white' },
  new:     { label: 'Nouveau',   bg: 'bg-emerald-600 text-white' },
  promo:   { label: 'Offre',     bg: 'bg-rose-600 text-white' },
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
      className="group flex flex-col bg-white border border-black/[0.06] rounded-[24px] overflow-hidden
        hover:border-black/[0.1] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:scale-[1.01]
        transition-all duration-300 block active:scale-[0.98]"
    >
      {/* ────────────────────────────────────────
          IMAGE ZONE — Apple neutral #F5F5F7
      ──────────────────────────────────────── */}
      <div className="relative bg-[#F5F5F7] flex items-center justify-center overflow-hidden"
        style={{ aspectRatio: '4/3' }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="p-4 transform group-hover:scale-105 transition-transform duration-500 ease-out">
            <ProductIllustration slug={slug} width={140} height={105} />
          </div>
        )}

        {/* Badge — coin supérieur gauche, pilule Apple */}
        {badgeCfg && (
          <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide shadow-2xs ${badgeCfg.bg}`}>
            {badgeCfg.label}
          </span>
        )}

        {/* Quick view overlay au hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors duration-200" />
      </div>

      {/* ────────────────────────────────────────
          PRODUCT INFO — Typographie Apple épurée
      ──────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 md:p-5 border-t border-black/[0.04]">

        {/* Nom du produit */}
        <h3 className="font-semibold text-[#1D1D1F] text-[13px] md:text-sm leading-snug mb-1
          group-hover:text-emerald-700 transition-colors line-clamp-2">
          {name}
        </h3>

        {/* Description courte — desktop only */}
        {description && (
          <p className="hidden md:block text-[11px] text-[#86868B] leading-relaxed line-clamp-2 mb-2 font-normal">
            {description}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Prix + CTA — bottom row ── */}
        <div className="flex items-end justify-between gap-2 mt-3 pt-2 border-t border-black/[0.03]">

          {/* Prix bloc */}
          <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] text-[#86868B] uppercase tracking-wider font-semibold leading-none mb-1">
              À partir de
            </p>
            <p className="font-display font-semibold text-[#1D1D1F] leading-none tracking-tight"
               style={{ fontSize: 'clamp(15px, 2.5vw, 19px)' }}>
              {basePrice > 0
                ? new Intl.NumberFormat('fr-FR').format(basePrice)
                : '—'}
              <span className="text-[10px] md:text-xs font-normal text-[#86868B] ml-0.5">FCFA</span>
            </p>
            {minQuantity > 0 && (
              <p className="text-[9px] md:text-[10px] text-[#86868B] mt-0.5 font-medium">
                Dès {new Intl.NumberFormat('fr-FR').format(minQuantity)} pcs
              </p>
            )}
          </div>

          {/* CTA bouton pilule Apple */}
          <div className="shrink-0 bg-[#1D1D1F] text-white text-[11px] md:text-xs font-semibold
            px-3 py-2 md:px-4 md:py-2.5 rounded-full whitespace-nowrap
            flex items-center gap-1.5 min-h-[36px] md:min-h-[40px]
            group-hover:bg-emerald-700 transition-colors active:scale-95 shadow-2xs">
            <ShoppingCart size={13} className="shrink-0" />
            <span className="hidden sm:inline">Configurer</span>
            <span className="sm:hidden">Voir</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
