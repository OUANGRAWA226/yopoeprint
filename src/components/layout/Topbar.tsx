'use client'

import Link from 'next/link'
import { Truck, ShieldCheck, Check, Building2 } from 'lucide-react'

export function Topbar() {
  return (
    <div className="bg-[#161617] text-[#86868B] text-xs py-2 border-b border-white/[0.06] hidden md:block">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center gap-6 font-medium flex-wrap">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <Truck size={13} className="text-emerald-400 shrink-0" />
            <span className="text-white/90">Livraison offerte dès <strong className="text-white">75 000 FCFA</strong></span>
          </div>
          <div className="flex items-center gap-1.5 hidden lg:flex">
            <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
            <span>Paiement sécurisé · Orange Money · Moov Money</span>
          </div>
          <div className="flex items-center gap-1.5 hidden xl:flex">
            <Check size={13} className="text-emerald-400 shrink-0" />
            <span>Contrôle PAO 300 DPI offert avant impression</span>
          </div>
        </div>

        <Link
          href="/entreprises"
          className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-white transition-colors font-medium"
        >
          <Building2 size={13} className="text-amber-400" />
          <span>Espace Entreprises & Facturation DGI →</span>
        </Link>
      </div>
    </div>
  )
}
