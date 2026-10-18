'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductScrollRailProps {
  children: React.ReactNode
  className?: string
  trackClassName?: string
  stepPx?: number
  ariaLabel?: string
}

export function ProductScrollRail({
  children,
  className = '',
  trackClassName = '',
  stepPx,
  ariaLabel = 'Défilement des produits',
}: ProductScrollRailProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Met à jour la visibilité des flèches en fonction du défilement réel
  const updateScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return

    const { scrollLeft, scrollWidth, clientWidth } = el
    // Tolérance de 6px pour gérer les arrondis sous-pixels
    setCanScrollLeft(scrollLeft > 6)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    updateScrollState()

    const handleScroll = () => {
      updateScrollState()
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateScrollState)

    return () => {
      el.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState])

  // Défilement fluide vers la gauche
  const scrollLeft = () => {
    const el = trackRef.current
    if (!el) return
    const distance = stepPx || Math.max(el.clientWidth * 0.75, 240)
    el.scrollBy({ left: -distance, behavior: 'smooth' })
  }

  // Défilement fluide vers la droite
  const scrollRight = () => {
    const el = trackRef.current
    if (!el) return
    const distance = stepPx || Math.max(el.clientWidth * 0.75, 240)
    el.scrollBy({ left: distance, behavior: 'smooth' })
  }

  return (
    <div className={`relative group/rail ${className}`} aria-label={ariaLabel}>
      {/* ── Bouton Flèche Gauche (Desktop uniquement) ── */}
      <button
        type="button"
        onClick={scrollLeft}
        disabled={!canScrollLeft}
        aria-label="Faire défiler vers la gauche"
        className={`absolute -left-3.5 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-gray-800 shadow-[0_6px_20px_rgba(0,0,0,0.18)] border border-gray-200/90 hidden md:flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 hover:bg-gray-50 hover:text-emerald-700 hover:border-emerald-300 ${
          canScrollLeft
            ? 'opacity-95 hover:opacity-100 hover:scale-105 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronLeft size={20} className="stroke-[2.5]" />
      </button>

      {/* ── Piste Déroulante Magnétique (Touch sur Mobile / Scroll Snap) ── */}
      <div
        ref={trackRef}
        className={`flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2 pt-1 px-1 -mx-1 ${trackClassName}`}
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {children}
      </div>

      {/* ── Bouton Flèche Droite (Desktop uniquement) ── */}
      <button
        type="button"
        onClick={scrollRight}
        disabled={!canScrollRight}
        aria-label="Faire défiler vers la droite"
        className={`absolute -right-3.5 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-gray-800 shadow-[0_6px_20px_rgba(0,0,0,0.18)] border border-gray-200/90 hidden md:flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 hover:bg-gray-50 hover:text-emerald-700 hover:border-emerald-300 ${
          canScrollRight
            ? 'opacity-95 hover:opacity-100 hover:scale-105 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronRight size={20} className="stroke-[2.5]" />
      </button>
    </div>
  )
}
