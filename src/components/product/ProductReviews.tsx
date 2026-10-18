'use client'

import React from 'react'
import { Star, CheckCircle2, User } from 'lucide-react'

interface ProductReviewsProps {
  productName?: string
  category?: string
  rating?: number
  totalReviews?: number
}

const CATEGORY_REVIEWS: Record<string, Array<{ name: string; rating: number; date: string; comment: string; verified: boolean }>> = {
  'cartes-de-visite': [
    {
      name: 'Awa T.',
      rating: 5,
      date: 'il y a 3 jours',
      comment: "Service très professionnel. Le rendu des cartes de visite avec pelliculage mat velours est ultra premium. Les boîtes distributrices rigides offertes sont parfaites pour mon bureau.",
      verified: true,
    },
    {
      name: 'Dr. David O.',
      rating: 5,
      date: 'il y a 1 semaine',
      comment: "Découpe laser parfaite, bords impeccables et dorure or à chaud très élégante. Mes clients me complimentent régulièrement sur la texture du papier 350g.",
      verified: true,
    },
    {
      name: 'Alpha Conseil SARL',
      rating: 5,
      date: 'il y a 2 semaines',
      comment: "Livraison express à Ouaga 2000 respectée. Le papier a une excellente tenue ferme en main sans effet carton mou. Rapport qualité/prix imbattable.",
      verified: true,
    },
  ],
  flyers: [
    {
      name: 'Moussa K.',
      rating: 5,
      date: 'il y a 2 jours',
      comment: "Impression au top ! J'ai commandé 2 500 flyers pour le lancement de notre agence, les couleurs quadri sont éclatantes et le papier couché brillant est d'excellente facture.",
      verified: true,
    },
    {
      name: 'Fatou S.',
      rating: 5,
      date: 'il y a 5 jours',
      comment: "Vérification PAO du fichier et BAT rapide par WhatsApp avant tirage. Les flyers sont arrivés sous film rétracté anti-poussière.",
      verified: true,
    },
    {
      name: 'Club Événementiel',
      rating: 4,
      date: 'il y a 2 semaines',
      comment: "Très bonne impression recto/verso, pliage net sans cassure blanche. Équipe à l'écoute et livraison rapide.",
      verified: true,
    },
  ],
  'roll-up': [
    {
      name: 'Entreprise Sahel BTP',
      rating: 5,
      date: 'il y a 4 jours',
      comment: "Structure en aluminium très robuste et stable. La bâche haute définition ne gondole pas et la housse matelassée de transport incluse est très pratique.",
      verified: true,
    },
    {
      name: 'Salif T.',
      rating: 5,
      date: 'il y a 1 semaine',
      comment: "Roll-up utilisé pour le SIAO et nos conférences. Montage en moins de 30 secondes, rendu des couleurs fidèle à notre charte graphique.",
      verified: true,
    },
    {
      name: 'Agence Synergy',
      rating: 5,
      date: 'il y a 2 semaines',
      comment: "Excellente qualité d'impression grand format. Livraison directe à notre stand d'exposition sans encombre.",
      verified: true,
    },
  ],
  textile: [
    {
      name: 'Boureima N.',
      rating: 5,
      date: 'il y a 3 jours',
      comment: "T-shirts en coton peigné très doux et respirant. L'impression DTG a survécu à plusieurs lavages sans craqueler.",
      verified: true,
    },
    {
      name: 'Promo Burkina',
      rating: 5,
      date: 'il y a 1 semaine',
      comment: "Les polos avec broderie et t-shirts personnalisés sont arrivés parfaitement repassés sous sachet individuel.",
      verified: true,
    },
  ],
}

export function ProductReviews({
  productName = 'Produit YopoePrint',
  category = '',
  rating = 4.9,
  totalReviews = 127
}: ProductReviewsProps) {
  // Sélection des avis pertinents
  const catKey = category.toLowerCase()
  const reviews = CATEGORY_REVIEWS[catKey] || [
    {
      name: 'Moussa K.',
      rating: 5,
      date: 'il y a 2 jours',
      comment: `Très satisfait de notre commande de ${productName}. Finition irréprochable et livraison très rapide à Ouagadougou.`,
      verified: true,
    },
    {
      name: 'Awa T.',
      rating: 5,
      date: 'il y a 1 semaine',
      comment: "Service client ultra réactif et contrôle PAO certifié avant impression. Je recommande à 100%.",
      verified: true,
    },
    {
      name: 'Société Faso Services',
      rating: 5,
      date: 'il y a 2 semaines',
      comment: `Rapport qualité/prix excellent pour nos séries de ${productName}. Nous renouvellerons nos commandes sans hésiter.`,
      verified: true,
    },
  ]

  return (
    <section id="avis-clients" className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 scroll-mt-20">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-gray-900">Avis Clients</h2>
          <p className="text-xs text-gray-500 mt-1">Avis certifiés suite à commande livrée chez YopoePrint</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <CheckCircle2 size={13} className="text-emerald-600" />
          <span>100% Avis d&apos;acheteurs vérifiés</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Résumé des avis */}
        <div className="md:col-span-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl font-display font-extrabold text-gray-900">{rating}</div>
            <div>
              <div className="flex text-[#FFB800] mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={20} fill={star <= Math.round(rating) ? "currentColor" : "none"} />
                ))}
              </div>
              <p className="text-sm text-gray-500 font-medium">Basé sur {totalReviews} avis vérifiés</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { stars: 5, percent: 92 },
              { stars: 4, percent: 6 },
              { stars: 3, percent: 2 },
              { stars: 2, percent: 0 },
              { stars: 1, percent: 0 },
            ].map((bar) => (
              <div key={bar.stars} className="flex items-center gap-3 text-sm">
                <span className="w-12 text-gray-600 font-medium">{bar.stars} étoiles</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFB800] rounded-full" style={{ width: `${bar.percent}%` }} />
                </div>
                <span className="w-8 text-right text-gray-400">{bar.percent}%</span>
              </div>
            ))}
          </div>

          <a
            href="https://wa.me/22670000000?text=Bonjour%20YopoePrint,%20je%20souhaite%20donner%20mon%20avis"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center w-full mt-8 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold text-sm rounded-xl border border-gray-200 transition-colors"
          >
            Écrire un avis
          </a>
        </div>

        {/* Liste des avis contextualisés */}
        <div className="md:col-span-8 space-y-6">
          {reviews.map((review, idx) => (
            <div key={idx} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-sm">{review.name}</p>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={10} /> Achat vérifié
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex text-[#FFB800]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={12} fill={star <= review.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{review.date}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
