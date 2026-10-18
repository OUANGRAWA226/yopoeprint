'use client'

import Link from 'next/link'
import { Phone, Truck, Building2, HelpCircle, CheckCircle2 } from 'lucide-react'
import { useContact } from '@/lib/settings.service'

export function Topbar() {
  const contact = useContact()
  return (
    <div className="bg-gray-900 text-gray-300 text-xs py-2 border-b border-gray-800 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center gap-6 font-medium">
        
        {/* Left: Hotline & Trust */}
        <div className="flex items-center gap-6">
          <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone size={13} className="text-emerald-400 shrink-0" />
            <span>Conseiller Atelier Ouagadougou : <strong className="text-white tabular-nums">{contact.phoneDisplay}</strong></span>
          </a>

          <div className="flex items-center gap-1.5 text-gray-300 hidden lg:flex">
            <div className="flex text-amber-400 text-xs leading-none">
              ★★★★★
            </div>
            <span><strong className="text-white">4.8/5</strong> · 840 avis d'entreprises</span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-300 hidden xl:flex">
            <Truck size={13} className="text-emerald-400 shrink-0" />
            <span>Livraison gratuite dès <strong className="text-white">75 000 FCFA</strong></span>
          </div>
        </div>

        {/* Right: B2B DGI & Pre-press Guide */}
        <div className="flex items-center gap-5 text-xs">
          <Link
            href="/guide-impression"
            className="text-gray-300 hover:text-white transition-colors hidden sm:inline-flex items-center gap-1"
          >
            <HelpCircle size={13} />
            <span>Gabarits & Guide PAO</span>
          </Link>

          <Link
            href="/entreprises"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-bold"
          >
            <Building2 size={13} />
            <span>Espace Entreprises (Facturation DGI) →</span>
          </Link>
        </div>

      </div>
    </div>
  )
}
