import React from 'react'
import Link from 'next/link'
import { CONTACT_PHONE_DISPLAY } from '@/lib/contact'

export const metadata = {
  title: 'Prévisualisation Email - Confirmation de commande',
  robots: 'noindex, nofollow', // Ne pas indexer les pages d'emails
}

export default function EmailConfirmationPreview() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 flex flex-col items-center justify-center font-sans">
      
      {/* ── Bandeau d'information (Ne fait pas partie de l'email) ── */}
      <div className="max-w-2xl w-full mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-sm text-gray-600 flex items-center justify-between">
        <div>
          <strong className="text-gray-900 block mb-1">Prévisualisation de l'email</strong>
          Sujet : 📦 Votre commande YopoePrint #YP-4098 est confirmée !
        </div>
        <Link href="/mon-compte" className="text-primary font-bold hover:underline">
          Mon Compte
        </Link>
      </div>

      {/* ── CORPS DE L'EMAIL (Simulé) ── */}
      {/* 
        Note technique : Dans un vrai email, on utiliserait des <table> partout.
        Ici, nous utilisons Tailwind pour le rendu visuel Next.js afin que le développeur 
        puisse valider le design avant de le convertir en MJML ou vrai HTML Email.
      */}
      <div className="max-w-[600px] w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        
        {/* Header (En-tête de l'email) */}
        <div className="bg-gray-900 px-8 py-8 text-center">
          <h1 className="font-display text-3xl font-extrabold text-white tracking-tight m-0">
            Yopoe<span className="text-primary">Print</span>
          </h1>
        </div>

        {/* Hero Section */}
        <div className="px-8 pt-10 pb-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            🎉
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Commande confirmée !</h2>
          <p className="text-gray-600 leading-relaxed text-base">
            Bonjour <strong>Sankara</strong>,<br/>
            Nous avons bien reçu votre paiement. Votre commande <strong>#YP-4098</strong> est maintenant en cours de traitement dans nos ateliers à Ouagadougou.
          </p>
        </div>

        {/* Détails de la commande */}
        <div className="px-8 py-6 bg-gray-50 border-y border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Récapitulatif</h3>
          
          {/* Article 1 */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0 flex items-center justify-center text-2xl">
              📄
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-base m-0">Flyers A5 Classiques</h4>
              <p className="text-sm text-gray-500 m-0">Papier couché brillant 135g</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-gray-900 text-base m-0">45 000 F</p>
              <p className="text-xs text-gray-500 m-0">Qté: 5000</p>
            </div>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* Totaux */}
          <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
            <span>Sous-total HT</span>
            <span>45 000 F</span>
          </div>
          <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
            <span>TVA (18%)</span>
            <span>8 100 F</span>
          </div>
          <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
            <span>Livraison (Ouagadougou)</span>
            <span className="text-green-600 font-bold">Offerte</span>
          </div>
          
          <div className="border-t border-gray-200 my-4"></div>
          
          <div className="flex justify-between items-center text-lg">
            <strong className="text-gray-900">Total payé</strong>
            <strong className="text-primary text-xl">53 100 F</strong>
          </div>
        </div>

        {/* Action (Suivi) */}
        <div className="px-8 py-10 text-center">
          <p className="text-gray-600 mb-6 text-sm">
            Vous pouvez suivre l'avancée de l'impression et la livraison directement depuis votre espace client.
          </p>
          <a href="#" className="inline-block bg-primary text-gray-900 font-bold px-8 py-4 rounded-xl no-underline text-base shadow-lg shadow-primary/20 hover:opacity-90">
            Suivre ma commande
          </a>
        </div>

        {/* Footer de l'email */}
        <div className="bg-gray-100 px-8 py-8 text-center border-t border-gray-200">
          <p className="text-xs text-gray-500 font-medium mb-4 uppercase tracking-widest">
            Besoin d'aide avec votre commande ?
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Répondez directement à cet email ou contactez-nous sur WhatsApp au <strong>{CONTACT_PHONE_DISPLAY}</strong>.
          </p>
          
          <div className="text-2xs text-gray-400 space-y-1">
            <p>© 2026 YopoePrint. Tous droits réservés.</p>
            <p>Quartier Koulouba, Ouagadougou, Burkina Faso</p>
            <p className="mt-4">
              <a href="#" className="text-gray-400 underline">Se désabonner</a>
              {' · '}
              <a href="#" className="text-gray-400 underline">Conditions Générales</a>
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}
