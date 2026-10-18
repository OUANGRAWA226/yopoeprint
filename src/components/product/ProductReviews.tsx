'use client'

import React from 'react'
import { Star, CheckCircle2, User, MessageSquare } from 'lucide-react'

export interface ProductReview {
  name: string
  rating: number
  date: string
  comment: string
  verified: boolean
}

interface ProductReviewsProps {
  productName?: string
  // Real reviews only (from the API). None yet → honest empty state.
  reviews?: ProductReview[]
}

const WHATSAPP_REVIEW_URL = 'https://wa.me/22670000000?text=Bonjour%20YopoePrint,%20je%20souhaite%20donner%20mon%20avis'

export function ProductReviews({ productName = 'ce produit', reviews = [] }: ProductReviewsProps) {
  const count = reviews.length
  const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0

  return (
    <section id="avis-clients" className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 scroll-mt-20">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-gray-900">Avis clients</h2>
          <p className="text-xs text-gray-500 mt-1">Publiés par des clients après livraison de leur commande</p>
        </div>
        <a
          href={WHATSAPP_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold text-sm rounded-xl border border-gray-200 transition-colors"
        >
          Écrire un avis
        </a>
      </div>

      {count === 0 ? (
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
            <MessageSquare size={22} />
          </div>
          <p className="font-bold text-gray-900">Pas encore d&apos;avis pour {productName}</p>
          <p className="text-sm text-gray-500 mt-1 max-w-md">
            Vous avez commandé ce produit ? Votre retour aide les prochains clients à choisir.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-4 flex items-center gap-4">
            <div className="text-5xl font-display font-extrabold text-gray-900">{average.toFixed(1)}</div>
            <div>
              <div className="flex text-[#FFB800] mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={20} fill={star <= Math.round(average) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <p className="text-sm text-gray-500 font-medium">{count} avis</p>
            </div>
          </div>

          <div className="md:col-span-8 space-y-6">
            {reviews.map((review, idx) => (
              <div key={idx} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 mb-3">
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
                          <Star key={star} size={12} fill={star <= review.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
