'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
  href?: string
  theme?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
}

export function Logo({
  className = '',
  href = '/',
  theme = 'dark',
  size = 'md',
  showSubtitle = true,
}: LogoProps) {
  const [hasImageError, setHasImageError] = useState(false)

  // Tailles prédéfinies
  const heightClasses = {
    sm: 'h-7',
    md: 'h-9 sm:h-10',
    lg: 'h-11 sm:h-13',
  }

  const logoSrc = theme === 'dark' ? '/images/logo-dark.png' : '/images/logo.png'

  const content = (
    <div className={`flex items-center gap-2.5 shrink-0 group ${className}`}>
      {!hasImageError ? (
        <div className="relative flex items-center">
          <Image
            src={logoSrc}
            alt="YopoePrint"
            width={240}
            height={52}
            priority
            unoptimized
            onError={() => setHasImageError(true)}
            className={`${heightClasses[size]} w-auto object-contain transition-transform group-hover:scale-105 duration-200`}
          />
        </div>
      ) : (
        /* Fallback stylisé automatique si logo.png n'est pas encore présent */
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-gray-950 font-extrabold text-lg shadow-sm group-hover:scale-105 transition-transform">
            Y
          </div>
          <div className="leading-none">
            <span
              className={`font-display font-extrabold text-xl tracking-tight ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}
            >
              Yopoe<span className="text-emerald-400">Print</span>
            </span>
            {showSubtitle && (
              <span
                className={`block text-[10px] uppercase tracking-widest font-semibold mt-0.5 ${
                  theme === 'light' ? 'text-gray-400' : 'text-gray-400'
                }`}
              >
                Imprimerie en ligne · BF
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    )
  }

  return content
}
