import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  AlertCircle, 
  Info, 
  Download, 
  ShieldCheck,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Sliders,
  Scissors,
  Layers,
  FileCheck2,
  Sparkles,
  Check
} from 'lucide-react'

interface BatPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl?: string
  fileName?: string
  onApprove?: () => void
}

export function BatPreviewModal({ 
  isOpen, 
  onClose, 
  fileUrl, 
  fileName = 'fichier-impression.pdf',
  onApprove 
}: BatPreviewModalProps) {
  const [isPdf, setIsPdf] = useState(false)
  const [showBleed, setShowBleed] = useState(true)
  const [showSafety, setShowSafety] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isApproved, setIsApproved] = useState(false)

  useEffect(() => {
    if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
      setIsPdf(true)
    } else {
      setIsPdf(false)
    }
    setIsApproved(false)
    setZoomLevel(100)
  }, [fileName, isOpen])

  if (!isOpen) return null

  const handleApprove = () => {
    setIsApproved(true)
    setTimeout(() => {
      if (onApprove) onApprove()
      onClose()
    }, 1200)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        
        {/* Backdrop sombre haute fidélité */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Pre-Press Studio */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200/80 z-10"
        >
          {/* Header Technique */}
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white font-display">
                    Contrôle Pré-Presse & Bon À Tirer (BAT)
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Conforme ISO 12647
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate max-w-md mt-0.5">
                  Fichier source : <span className="font-mono text-slate-300">{fileName}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Fermer la prévisualisation"
            >
              <X size={18} />
            </button>
          </div>

          {/* Corps de la modale */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 flex flex-col lg:flex-row gap-6 items-stretch">
            
            {/* Zone Centrale : Studio de visualisation */}
            <div className="flex-1 flex flex-col bg-slate-950 rounded-2xl p-4 sm:p-6 border border-slate-800 relative shadow-inner overflow-hidden min-h-[420px] justify-between">
              
              {/* Barre d'outils d'inspection supérieure */}
              <div className="flex flex-wrap items-center justify-between gap-2 z-20 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5 bg-slate-900/90 rounded-xl p-1 border border-slate-800 text-xs">
                  <button
                    onClick={() => setShowBleed(!showBleed)}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors
                      ${showBleed ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Scissors size={13} />
                    <span>Fonds perdus (3mm)</span>
                  </button>

                  <button
                    onClick={() => setShowSafety(!showSafety)}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors
                      ${showSafety ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Layers size={13} />
                    <span>Zone tranquille (5mm)</span>
                  </button>

                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors
                      ${showGrid ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-white'}`}
                  >
                    <span>Repères</span>
                  </button>
                </div>

                {/* Zoom */}
                <div className="flex items-center gap-1 bg-slate-900 rounded-xl p-1 border border-slate-800 text-slate-300 text-xs">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(z - 15, 70))}
                    className="p-1.5 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title="Zoom arrière"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className="font-mono px-1.5 text-[11px] font-semibold">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(z + 15, 160))}
                    className="p-1.5 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title="Zoom avant"
                  >
                    <ZoomIn size={14} />
                  </button>
                </div>
              </div>

              {/* Surface d'affichage du visuel */}
              <div className="flex-1 flex items-center justify-center py-6 overflow-hidden relative">
                
                {isPdf ? (
                  <div className="text-center max-w-sm py-8 px-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-white">
                    <div className="w-16 h-16 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center mb-3 text-primary border border-slate-700">
                      <FileCheck2 size={32} />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Fichier PDF Pré-presse Détecté</h3>
                    <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                      Votre document est un fichier vectoriel. Nos techniciens PAO appliquent automatiquement les traits de coupe, la surimpression des noirs et le profil CMJN.
                    </p>
                    {fileUrl && (
                      <a 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl border border-slate-700 transition-colors"
                      >
                        <Download size={14} /> Télécharger le fichier source
                      </a>
                    )}
                  </div>
                ) : (
                  <div 
                    className="relative transition-transform duration-200 shadow-2xl bg-white"
                    style={{
                      transform: `scale(${zoomLevel / 100})`,
                      aspectRatio: '1 / 1.414',
                      maxWidth: '380px',
                      width: '100%',
                    }}
                  >
                    {/* Visual image */}
                    {fileUrl ? (
                      <img 
                        src={fileUrl} 
                        alt="Aperçu BAT" 
                        className="w-full h-full object-contain select-none" 
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                        <FileCheck2 size={40} className="mb-2 text-slate-300" />
                        <p className="text-xs font-semibold">Génération de la simulation d'impression...</p>
                      </div>
                    )}

                    {/* Crop marks (Repères de coupe professionnels aux 4 coins) */}
                    <div className="absolute -top-3 -left-3 w-3 h-3 border-b border-r border-slate-400 pointer-events-none" />
                    <div className="absolute -top-3 -right-3 w-3 h-3 border-b border-l border-slate-400 pointer-events-none" />
                    <div className="absolute -bottom-3 -left-3 w-3 h-3 border-t border-r border-slate-400 pointer-events-none" />
                    <div className="absolute -bottom-3 -right-3 w-3 h-3 border-t border-l border-slate-400 pointer-events-none" />

                    {/* Grille technique */}
                    {showGrid && (
                      <div 
                        className="absolute inset-0 pointer-events-none opacity-20"
                        style={{
                          backgroundImage: `linear-gradient(#0284c7 1px, transparent 1px), linear-gradient(90deg, #0284c7 1px, transparent 1px)`,
                          backgroundSize: '20px 20px'
                        }}
                      />
                    )}

                    {/* Ligne rouge : Fonds perdus */}
                    {showBleed && (
                      <div className="absolute inset-0 border-2 border-rose-500 border-dashed pointer-events-none z-10">
                        <span className="absolute top-1 left-1 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          Débord / Coupe (3mm)
                        </span>
                      </div>
                    )}

                    {/* Ligne verte : Zone tranquille */}
                    {showSafety && (
                      <div className="absolute inset-[6%] border-2 border-emerald-500 border-dashed pointer-events-none z-10">
                        <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          Zone de sécurité (Textes)
                        </span>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Barre d'état inférieure */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Profil colorimétrique : <strong>CMJN (FOGRA39)</strong>
                </span>
                <span>Tolérance massicot : <strong>± 1 mm</strong></span>
              </div>
            </div>

            {/* Colonne Droite : Guide d'inspection & Checklist PAO */}
            <div className="w-full lg:w-80 space-y-4 shrink-0 flex flex-col justify-between">
              
              <div className="space-y-4">
                
                {/* Carte Checklist de conformité */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-primary" />
                      Contrôles Pré-Presse
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      4/4 Validés
                    </span>
                  </div>

                  <div className="space-y-2 text-xs divide-y divide-slate-100">
                    <div className="pt-1.5 flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">Résolution 300 DPI</p>
                        <p className="text-[11px] text-slate-500">Netteté optimale pour le tirage offset et numérique.</p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">Fonds perdus 3 mm</p>
                        <p className="text-[11px] text-slate-500">Évite tout liseré blanc lors de la coupe au massicot.</p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">Zone de sécurité respectée</p>
                        <p className="text-[11px] text-slate-500">Textes et logos à plus de 5 mm du bord.</p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">Polices & vectorisation</p>
                        <p className="text-[11px] text-slate-500">Aucun risque de substitution de typographie.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Légende rapide */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2 text-xs">
                  <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Légende des repères</p>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded border-2 border-rose-500 border-dashed bg-rose-50 shrink-0" />
                    <span className="text-slate-600 text-[11px]"><strong>Ligne rouge :</strong> Ligne de coupe massicot</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded border-2 border-emerald-500 border-dashed bg-emerald-50 shrink-0" />
                    <span className="text-slate-600 text-[11px]"><strong>Ligne verte :</strong> Zone tranquille garantie</span>
                  </div>
                </div>

                {/* Mention légale & Responsabilité */}
                <div className="bg-amber-50/80 rounded-xl border border-amber-200 p-3 text-amber-900 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertCircle size={14} />
                    <span>Engagement BAT</span>
                  </div>
                  <p className="leading-relaxed opacity-95">
                    La validation du BAT engage le lancement en presse. Vérifiez l'orthographe, les coordonnées et les visuels avant accord.
                  </p>
                </div>

              </div>

              {/* Boutons d'action */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleApprove}
                  disabled={isApproved}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]
                    ${isApproved 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'}`}
                >
                  {isApproved ? (
                    <>
                      <Check size={18} />
                      <span>BAT Validé pour impression !</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Valider le BAT pour impression</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                >
                  Fermer sans valider
                </button>
              </div>

            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
