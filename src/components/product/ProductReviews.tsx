'use client'

import { Star, CheckCircle2, User } from 'lucide-react'

const MOCK_REVIEWS = [
  {
    id: 1,
    name: 'Moussa K.',
    rating: 5,
    date: 'il y a 2 jours',
    comment: "Impression au top ! J'ai commandé 500 flyers pour mon événement, les couleurs sont éclatantes et le papier de très bonne qualité. Livraison hyper rapide à Ouaga 2000.",
    verified: true,
  },
  {
    id: 2,
    name: 'Awa T.',
    rating: 5,
    date: 'il y a 1 semaine',
    comment: "Service très professionnel. C'est la première fois que je commande en ligne au Burkina et je ne suis pas déçue. Le rendu des cartes de visite est premium.",
    verified: true,
  },
  {
    id: 3,
    name: 'Entreprise XYZ',
    rating: 4,
    date: 'il y a 2 semaines',
    comment: "Très bien dans l'ensemble. Les Roll-ups sont solides. Petit bémol sur le délai de livraison qui a pris un jour de plus que prévu, mais le service client a été réactif.",
    verified: true,
  },
]

export function ProductReviews() {
  const totalReviews = 124
  const averageRating = 4.8

  return (
    <section id="avis-clients" className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 scroll-mt-20">
      <h2 className="font-display text-2xl font-extrabold text-gray-900 mb-8">Avis Clients</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Résumé des avis */}
        <div className="md:col-span-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl font-display font-extrabold text-gray-900">{averageRating}</div>
            <div>
              <div className="flex text-[#FFB800] mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={20} fill={star <= Math.round(averageRating) ? "currentColor" : "none"} />
                ))}
              </div>
              <p className="text-sm text-gray-500 font-medium">Basé sur {totalReviews} avis</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { stars: 5, percent: 85 },
              { stars: 4, percent: 10 },
              { stars: 3, percent: 3 },
              { stars: 2, percent: 1 },
              { stars: 1, percent: 1 },
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

          <button className="w-full mt-8 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold text-sm rounded-xl border border-gray-200 transition-colors">
            Écrire un avis
          </button>
        </div>

        {/* Liste des avis */}
        <div className="md:col-span-8 space-y-6">
          {MOCK_REVIEWS.map((review) => (
            <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
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
