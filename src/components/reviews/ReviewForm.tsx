'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, Send, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { api } from '@/lib/api'

interface ReviewFormProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  orderNumber: string
  productName?: string
}

export function ReviewForm({ isOpen, onClose, orderId, orderNumber, productName }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const toast = useToast()

  const LABELS = ['', 'Décevant', 'Passable', 'Bien', 'Très bien', 'Excellent !']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.warning('Note manquante', 'Veuillez sélectionner une note avant d\'envoyer.')
      return
    }
    setIsSubmitting(true)
    try {
      await api.post('/reviews', { orderId, rating, comment })
      setIsDone(true)
      toast.success('Avis publié !', 'Merci pour votre retour, il aide toute la communauté.')
    } catch {
      toast.error('Erreur', 'L\'avis n\'a pas pu être envoyé. Réessayez.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setHoveredRating(0)
    setComment('')
    setIsDone(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gray-900 px-6 py-5 flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs mb-1">Commande {orderNumber}</p>
              <h2 className="font-display font-bold text-white text-lg">
                Votre avis nous intéresse 💬
              </h2>
              {productName && <p className="text-gray-400 text-xs mt-1 truncate">{productName}</p>}
            </div>
            <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors mt-1">
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          {isDone ? (
            <div className="p-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 size={40} className="text-green-500" />
              </motion.div>
              <h3 className="font-bold text-gray-900 text-xl mb-2">Merci beaucoup ! 🙏</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Votre avis a été publié et aidera d'autres clients à faire leur choix.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Star Rating */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Notez votre expérience globale</p>
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        size={36}
                        className={`transition-colors ${
                          star <= (hoveredRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  {(hoveredRating || rating) > 0 && (
                    <motion.p
                      key={hoveredRating || rating}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className={`text-sm font-bold ${
                        (hoveredRating || rating) >= 4 ? 'text-green-600' :
                        (hoveredRating || rating) === 3 ? 'text-amber-500' : 'text-red-500'
                      }`}
                    >
                      {LABELS[hoveredRating || rating]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Votre commentaire <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Qualité d'impression, délai de livraison, service client... Partagez votre expérience !"
                  className="w-full text-sm border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors resize-none"
                />
                <p className="text-2xs text-gray-600 mt-1">{comment.length}/500 caractères</p>
              </div>

              {/* Notice */}
              <p className="text-2xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
                🔒 Votre avis sera publié sous votre prénom uniquement, après vérification que vous avez bien passé cette commande.
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={rating === 0 || isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Send size={16} /> Publier mon avis</>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
