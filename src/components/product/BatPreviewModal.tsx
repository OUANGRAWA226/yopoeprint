import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, Info, Download, ShieldCheck } from 'lucide-react'

interface BatPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl?: string
  fileName?: string
}

export function BatPreviewModal({ isOpen, onClose, fileUrl, fileName }: BatPreviewModalProps) {
  const [isPdf, setIsPdf] = useState(false)

  useEffect(() => {
    if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
      setIsPdf(true)
    } else {
      setIsPdf(false)
    }
  }, [fileName])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} />
                Aperçu Bon À Tirer (BAT)
              </h2>
              <p className="text-sm text-gray-500 mt-0.5 truncate max-w-sm">{fileName}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left: The Preview */}
            <div className="flex-1 w-full flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl p-8 relative shadow-sm min-h-[400px]">
              {isPdf ? (
                <div className="text-center max-w-sm">
                  <div className="w-24 h-24 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4 border border-gray-200">
                    <span className="text-2xl font-bold text-gray-400">PDF</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Aperçu PDF non disponible</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Votre fichier est un PDF. Notre équipe pré-presse vérifiera manuellement les marges et les fonds perdus avant le lancement en production.
                  </p>
                  <a href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                    <Download size={16} /> Télécharger le fichier original
                  </a>
                </div>
              ) : (
                <div className="relative w-full max-w-md mx-auto aspect-[1/1.414] bg-white border shadow-sm">
                  {/* The actual image */}
                  {fileUrl ? (
                    <img src={fileUrl} alt="Aperçu BAT" className="absolute inset-0 w-full h-full object-contain" />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-medium text-sm">
                      Image en cours de traitement...
                    </div>
                  )}

                  {/* Bleed line (Fonds perdus) - Outside / Edge */}
                  <div className="absolute inset-0 border-[3px] border-red-500/80 border-dashed pointer-events-none z-10" />
                  
                  {/* Safe Zone line (Zone tranquille) - Inside */}
                  <div className="absolute inset-[5%] border-[2px] border-green-500/80 border-dashed pointer-events-none z-10" />

                  {/* Labels floating */}
                  <div className="absolute -top-6 left-0 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    Bord de coupe (Fonds perdus)
                  </div>
                  <div className="absolute top-[5%] left-[5%] -translate-y-6 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    Zone de sécurité (Textes)
                  </div>
                </div>
              )}
            </div>

            {/* Right: The Guide */}
            <div className="w-full lg:w-80 space-y-6 shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info size={18} className="text-blue-500" />
                  Légende du BAT
                </h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded shrink-0 border-2 border-red-500 border-dashed bg-red-50 flex items-center justify-center"></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Traits de coupe</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        Ligne rouge. Le massicot passera ici. Prévoyez 3mm de fond perdu au-delà pour éviter les bords blancs.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded shrink-0 border-2 border-green-500 border-dashed bg-green-50 flex items-center justify-center"></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Zone de sécurité</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        Ligne verte. Gardez tous vos textes et logos importants à l'intérieur de cette zone pour éviter qu'ils ne soient coupés.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 text-amber-900">
                <h3 className="font-bold mb-2 flex items-center gap-2 text-amber-800">
                  <AlertCircle size={18} />
                  Responsabilité
                </h3>
                <p className="text-xs leading-relaxed opacity-90">
                  Cet aperçu est donné à titre indicatif. L'impression finale peut présenter de légères variations de couleurs (passage en CMJN) et une tolérance de coupe de 1 à 2 mm.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              J'ai compris, fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
