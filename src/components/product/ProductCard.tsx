'use client'

import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'
import { ProductIllustration } from './ProductIllustrations'

const BADGE_CFG: Record<string, { label: string; bg: string }> = {
  popular: { label: 'Bestseller', bg: 'bg-emerald-700 text-white' },
  new:     { label: 'Nouveau',    bg: 'bg-blue-700 text-white' },
  promo:   { label: '-20%',       bg: 'bg-rose-600 text-white' },
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
    rating?: number
    reviewsCount?: number
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
  // Only real ratings are shown; products without reviews show none
  const rating       = props.product?.rating
  const reviewsCount = props.product?.reviewsCount

  const badgeCfg = badge ? BADGE_CFG[badge] : undefined

  return (
    <Link
      href={`/produit/${slug}`}
      style={props.style}
      className="group flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-emerald-600 hover:shadow-lg transition-all duration-200 block"
    >
      {/* ────────────────────────────────────────
          IMAGE ZONE — Standard E-Commerce Pro
      ──────────────────────────────────────── */}
      <div className="relative bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100 aspect-[4/3]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="p-4 transform group-hover:scale-105 transition-transform duration-300 ease-out">
            <ProductIllustration slug={slug} width={150} height={110} />
          </div>
        )}

        {/* Badge commercial net */}
        {badgeCfg && (
          <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-2xs font-bold tracking-wide shadow-xs ${badgeCfg.bg}`}>
            {badgeCfg.label}
          </span>
        )}
      </div>

      {/* ────────────────────────────────────────
          PRODUCT INFO — Helloprint / VistaPrint
      ──────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4">
        
        {/* Rating stars */}
        {rating && reviewsCount ? (
        <div className="flex items-center gap-1 mb-1.5">
          <div className="flex text-amber-500 text-xs leading-none">
            {'★'.repeat(5)}
          </div>
          <span className="text-2xs font-semibold text-gray-500">
            {rating} ({reviewsCount})
          </span>
        </div>
        ) : null}

        {/* Nom du produit */}
        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 group-hover:text-emerald-700 transition-colors line-clamp-2">
          {name}
        </h3>

        {/* Description / Spécifications d'atelier */}
        {description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
            {description}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Prix + CTA — bottom row ── */}
        <div className="flex items-end justify-between gap-2 pt-3 border-t border-gray-100">
          <div>
            <p className="text-2xs text-gray-500 uppercase tracking-wider font-bold mb-0.5">
              À partir de
            </p>
            <p className="font-bold text-gray-900 text-base tabular-nums">
              {basePrice > 0
                ? new Intl.NumberFormat('fr-FR').format(basePrice)
                : '—'}
              <span className="text-xs text-gray-600 font-normal ml-1">FCFA</span>
            </p>
            {minQuantity > 0 && (
              <p className="text-2xs text-gray-500 font-medium">
                Pour {new Intl.NumberFormat('fr-FR').format(minQuantity)} exemplaires
              </p>
            )}
          </div>

          {/* Bouton CTA Net Helloprint */}
          <div className="shrink-0 bg-gray-900 group-hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs active:scale-95">
            <span>Configurer</span>
            <ArrowRight size={13} />
          </div>
        </div>

      </div>
    </Link>
  )
}
