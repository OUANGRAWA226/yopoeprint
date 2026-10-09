'use client'

import Link from 'next/link'
import { Truck, ShieldCheck, Check, Building2 } from 'lucide-react'

export function Topbar() {
  return (
    <div className="bg-gray-900 text-white text-xs py-2 border-b border-gray-800 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center gap-6 font-medium flex-wrap">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <Truck size={13} className="text-primary shrink-0" />
            <span>Livraison offerte dès <strong className="text-primary">75 000 FCFA</strong></span>
          </div>
          <div className="flex items-center gap-1.5 hidden lg:flex">
            <ShieldCheck size={13} className="text-primary shrink-0" />
            <span>Paiement sécurisé · Orange Money · Moov</span>
          </div>
          <div className="flex items-center gap-1.5 hidden xl:flex">
            <Check size={13} className="text-primary shrink-0" />
            <span>Contrôle PAO gratuit avant impression</span>
          </div>
        </div>

        <Link
          href="/entreprises"
          className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-white transition-colors"
        >
          <Building2 size={13} className="text-amber-400" />
          <span>Espace Entreprises & Facturation DGI →</span>
        </Link>
      </div>
    </div>
  )
}
