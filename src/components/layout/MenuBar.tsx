'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutGrid, ChevronRight, ArrowRight, ChevronDown } from 'lucide-react'

const MEGA_MENU_DATA = [
  { label: 'Publicité imprimée', href: '/catalogue/flyers', subItems: [
    { label: 'Brochures & Catalogues', href: '/catalogue/brochures' },
    { label: 'Affiches & Posters', href: '/catalogue/affiches' },
    { label: 'Flyers', href: '/catalogue/flyers' },
    { label: 'Dépliants & Plaquettes', href: '/catalogue/depliants' },
    { label: 'Cartes de visite', href: '/catalogue/cartes' },
  ]},
  { label: 'Brochures', href: '/catalogue/brochures', subItems: [
    { label: 'Brochures agrafées', href: '/catalogue/brochures' },
    { label: 'Dos carré collé', href: '/catalogue/brochures' },
    { label: 'À spirale', href: '/catalogue/brochures' },
    { label: 'Catalogues', href: '/catalogue/livres' },
    { label: 'Magazines', href: '/catalogue/brochures' },
  ]},
  { label: 'Carterie', href: '/catalogue/cartes', subItems: [
    { label: 'Cartes de visite standard', href: '/catalogue/cartes' },
    { label: 'Cartes premium', href: '/catalogue/cartes' },
    { label: 'Cartes de fidélité', href: '/catalogue/cartes' },
    { label: 'Faire-part & Invitations', href: '/catalogue/evenementiel' },
  ]},
  { label: 'Papeterie', href: '/catalogue/papeterie', subItems: [
    { label: 'En-têtes de lettre', href: '/catalogue/papeterie' },
    { label: 'Enveloppes', href: '/catalogue/papeterie' },
    { label: 'Carnets & Blocs-notes', href: '/catalogue/papeterie' },
  ]},
  { label: 'Signalétique', href: '/catalogue/signaletique', subItems: [
    { label: 'Panneaux rigides', href: '/catalogue/signaletique' },
    { label: 'Bâches & Banderoles', href: '/catalogue/evenementiel' },
    { label: 'Drapeaux publicitaires', href: '/catalogue/signaletique' },
  ]},
  { label: 'Roll-up', href: '/catalogue/roll-up', subItems: [
    { label: 'Roll-up standard', href: '/catalogue/roll-up' },
    { label: 'Roll-up premium', href: '/catalogue/roll-up' },
    { label: 'X-Banner & L-Banner', href: '/catalogue/roll-up' },
  ]},
  { label: 'Stickers', href: '/catalogue/etiquettes', subItems: [
    { label: 'Autocollants petit format', href: '/catalogue/etiquettes' },
    { label: 'Étiquettes en rouleau', href: '/catalogue/etiquettes' },
    { label: 'Stickers grand format', href: '/catalogue/signaletique' },
  ]},
  { label: 'Goodies', href: '/catalogue/goodies', subItems: [
    { label: 'Mugs & tasses', href: '/catalogue/goodies' },
    { label: 'Stylos personnalisés', href: '/catalogue/goodies' },
    { label: 'Lanyards & Tours de cou', href: '/catalogue/goodies' },
  ]},
  { label: 'Textile', href: '/catalogue/textile', subItems: [
    { label: 'T-shirts personnalisés', href: '/catalogue/textile' },
    { label: 'Polos', href: '/catalogue/textile' },
    { label: 'Vêtements de travail', href: '/catalogue/textile' },
  ]},
]

export function MenuBar() {
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    // Hidden on mobile — navigation done via BottomTabBar
    <div className="hidden md:block bg-white border-b border-gray-200 relative z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-5 overflow-x-auto scrollbar-none">

        {/* All products mega menu button */}
        <div className="group static">
          <Link
            href="/catalogue"
            className="flex items-center gap-2 py-3 px-4 bg-gray-900 text-white font-bold text-[13px] uppercase tracking-wide whitespace-nowrap hover:bg-primary transition-colors shrink-0"
          >
            <LayoutGrid size={15} />
            Tous les produits
          </Link>

          {/* Mega Menu */}
          <div className="absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-xl
                          opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="max-w-7xl mx-auto flex h-[460px]">
              {/* Left nav */}
              <div className="w-[260px] border-r border-gray-100 bg-gray-50 py-3 overflow-y-auto shrink-0">
                <ul>
                  {MEGA_MENU_DATA.map((cat, idx) => (
                    <li key={idx}>
                      <Link
                        href={cat.href}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className={`flex items-center justify-between px-5 py-2.5 text-[14px] font-medium transition-all
                          ${activeIdx === idx
                            ? 'bg-white text-primary border-l-2 border-primary'
                            : 'text-gray-700 hover:text-primary hover:bg-white'}`}
                      >
                        {cat.label}
                        <ChevronRight size={14} className={activeIdx === idx ? 'text-primary' : 'text-gray-300'} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Center: sub items */}
              <div className="flex-1 px-8 py-7 bg-white overflow-y-auto">
                <h3 className="font-display text-2xl font-extrabold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                  {MEGA_MENU_DATA[activeIdx].label}
                </h3>
                <div className="grid grid-cols-2 gap-x-10 gap-y-3">
                  {MEGA_MENU_DATA[activeIdx].subItems.map((sub, sIdx) => (
                    <Link key={sIdx} href={sub.href} className="group/link block py-1">
                      <span className="text-[14px] text-gray-700 font-medium group-hover/link:text-primary group-hover/link:underline underline-offset-4 transition-all">
                        {sub.label}
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="mt-8 pt-5 border-t border-gray-100">
                  <Link href={MEGA_MENU_DATA[activeIdx].href} className="inline-flex items-center gap-2 text-[14px] font-bold text-primary hover:underline underline-offset-4">
                    Voir tout — {MEGA_MENU_DATA[activeIdx].label} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Right: promo block */}
              <div className="w-[280px] bg-gray-50 p-6 flex flex-col justify-center border-l border-gray-100 shrink-0">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📦</span>
                  </div>
                  <h4 className="font-display text-base font-bold text-gray-900 mb-2">Gros volumes ?</h4>
                  <p className="text-xs text-gray-500 mb-4">Tarifs dégressifs pour professionnels sur toute la gamme.</p>
                  <Link href="/devis" className="block w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-primary transition-colors">
                    Demander un devis
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        {MEGA_MENU_DATA.slice(0, 6).map((cat, idx) => (
          <Link
            key={idx}
            href={cat.href}
            className="py-3.5 text-[13px] font-semibold whitespace-nowrap text-gray-700 hover:text-primary transition-colors shrink-0"
          >
            {cat.label}
          </Link>
        ))}

        <Link href="/devis" className="py-3.5 text-[13px] font-bold whitespace-nowrap text-primary hover:text-gray-900 transition-colors ml-auto shrink-0 flex items-center gap-1">
          Devis sur-mesure
        </Link>
      </div>
    </div>
  )
}
