'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Check, AlertTriangle, ShieldCheck, ZoomIn, ZoomOut,
  Maximize2, Eye, EyeOff, Download, Send, RotateCcw,
  CheckCircle2, FileText, Sparkles, Layers, UploadCloud, Info
} from 'lucide-react'
import { ordersService } from '@/lib/orders.service'
import { cloudinaryService } from '@/lib/cloudinary.service'
import { useToast } from '@/context/ToastContext'

interface BatInteractiveModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  orderNumber: string
  batUrl: string
  batVersoUrl?: string
  batStatus?: 'pending' | 'approved' | 'rejected' | null
  batNotes?: string
  batApprovedAt?: string
  isPublicMode?: boolean
  onSuccess?: () => void
}

export function BatInteractiveModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  batUrl,
  batVersoUrl,
  batStatus: initialBatStatus,
  batNotes,
  batApprovedAt,
  isPublicMode = false,
  onSuccess,
}: BatInteractiveModalProps) {
  const toast = useToast()

  // ── States ──────────────────────────────────────────────────
  const [activeFace, setActiveFace] = useState<'recto' | 'verso'>('recto')
  const [zoom, setZoom] = useState(1)
  const [showBleed, setShowBleed] = useState(true)       // Fond perdu
  const [showTrim, setShowTrim] = useState(true)         // Ligne de coupe
  const [showSafety, setShowSafety] = useState(true)     // Zone de sécurité
  const [showCleanCut, setShowCleanCut] = useState(false) // Rendu final sans traits
  const [showCenterLines, setShowCenterLines] = useState(false)

  // Validation checklist
  const [checks, setChecks] = useState({
    texts: false,
    layout: false,
    resolution: false,
    agreement: false,
  })

  // Action states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(initialBatStatus)
  const [showCorrectionForm, setShowCorrectionForm] = useState(false)
  const [correctionReason, setCorrectionReason] = useState('')
  const [correctionFile, setCorrectionFile] = useState<File | null>(null)
  const [correctionFileUrl, setCorrectionFileUrl] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const isApproved = currentStatus === 'approved'
  const isRejected = currentStatus === 'rejected'
  const allChecked = checks.texts && checks.layout && checks.resolution && checks.agreement

  const currentImageUrl = activeFace === 'recto' ? batUrl : (batVersoUrl || batUrl)
  const isPdf = currentImageUrl?.toLowerCase().includes('.pdf')

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStatus(initialBatStatus)
      setZoom(1)
      setShowCleanCut(false)
      setShowCorrectionForm(false)
    }
  }, [isOpen, initialBatStatus])

  if (!isOpen) return null

  // ── Handlers ────────────────────────────────────────────────
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5))
  const handleResetZoom = () => setZoom(1)

  const toggleCleanCut = () => {
    setShowCleanCut(!showCleanCut)
  }

  // Upload correction file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCorrectionFile(file)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const url = await cloudinaryService.uploadFile(file, (p) => setUploadProgress(p))
      setCorrectionFileUrl(url)
      toast.success('Fichier chargé', 'Votre maquette corrective est prête à être envoyée.')
    } catch (err: any) {
      toast.error('Erreur de téléchargement', err?.message || 'Impossible d\'envoyer le fichier.')
      setCorrectionFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  // Approve BAT
  const handleApprove = async () => {
    if (!allChecked) {
      toast.error('Validation incomplète', 'Veuillez cocher tous les points de contrôle obligatoires.')
      return
    }

    setIsSubmitting(true)
    try {
      if (isPublicMode) {
        await ordersService.approveBatPublic(orderNumber, 'BAT approuvé via le visualiseur interactif.')
      } else {
        await ordersService.approveBat(orderId, 'BAT approuvé via le visualiseur interactif.')
      }

      setCurrentStatus('approved')
      toast.success('Bon À Tirer Validé ! 🎉', 'Votre commande a été immédiatement transmise à notre atelier d\'impression.')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      toast.error('Erreur', err?.message || 'Une erreur est survenue lors de la validation du BAT.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reject BAT / Request corrections
  const handleReject = async () => {
    if (!correctionReason.trim()) {
      toast.error('Précision requise', 'Veuillez décrire les modifications souhaitées avant d\'envoyer.')
      return
    }

    setIsSubmitting(true)
    try {
      if (isPublicMode) {
        await ordersService.rejectBatPublic(orderNumber, correctionReason, correctionFileUrl)
      } else {
        await ordersService.rejectBat(orderId, correctionReason, correctionFileUrl)
      }

      setCurrentStatus('rejected')
      setShowCorrectionForm(false)
      toast.success('Demande enregistrée', 'Notre équipe graphique corrige votre fichier et vous notifiera sous 24h.')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      toast.error('Erreur', err?.message || 'Une erreur est survenue lors de l\'envoi des corrections.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-gray-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-7xl h-[94vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
        >
          {/* ── Top Bar ───────────────────────────────────────── */}
          <div className="px-6 py-4 bg-gray-900 text-white flex items-center justify-between shrink-0 border-b border-gray-800">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold font-display tracking-tight text-white flex items-center gap-2">
                    Épreuve Numérique · Bon À Tirer (BAT)
                  </h2>
                  {isApproved && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 size={12} /> BAT Validé
                    </span>
                  )}
                  {isRejected && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle size={12} /> Corrections demandées
                    </span>
                  )}
                  {!isApproved && !isRejected && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                      <Sparkles size={12} /> En attente de votre accord
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Commande : <span className="text-white font-bold">{orderNumber}</span>
                  {batApprovedAt && ` · Validé le ${new Date(batApprovedAt).toLocaleDateString('fr-FR')}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={currentImageUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 transition-colors"
                title="Télécharger l'épreuve originale"
              >
                <Download size={14} /> Télécharger
              </a>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── Main Body: Split View ─────────────────────────── */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-gray-100">

            {/* ── Left Side: Interactive Preview Canvas ───────── */}
            <div className="flex-1 flex flex-col overflow-hidden relative">

              {/* Sub-toolbar: Face selector & Layers */}
              <div className="px-5 py-2.5 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0 z-10">
                {/* Recto / Verso Tabs */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveFace('recto')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeFace === 'recto'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Recto (Face 1)
                  </button>
                  {batVersoUrl && (
                    <button
                      onClick={() => setActiveFace('verso')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeFace === 'verso'
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Verso (Face 2)
                    </button>
                  )}
                </div>

                {/* Layer Toggles & Mode */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Clean preview toggle */}
                  <button
                    onClick={toggleCleanCut}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      showCleanCut
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Affiche le document tel qu'il sera une fois découpé (sans aucun trait de repère)"
                  >
                    {showCleanCut ? <Eye size={14} /> : <EyeOff size={14} />}
                    {showCleanCut ? 'Rendu massicoté (Net)' : 'Mode épreuve technique'}
                  </button>

                  {!showCleanCut && (
                    <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-gray-200">
                      <button
                        onClick={() => setShowBleed(!showBleed)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          showBleed
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-white text-gray-400 border-gray-200'
                        }`}
                        title="Fond perdu (+3mm)"
                      >
                        🟥 Fond perdu
                      </button>
                      <button
                        onClick={() => setShowTrim(!showTrim)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          showTrim
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-400 border-gray-200'
                        }`}
                        title="Ligne de coupe au massicot"
                      >
                        ✂️ Coupe
                      </button>
                      <button
                        onClick={() => setShowSafety(!showSafety)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          showSafety
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-white text-gray-400 border-gray-200'
                        }`}
                        title="Zone de sécurité des textes"
                      >
                        🟩 Sécurité
                      </button>
                    </div>
                  )}

                  {/* Zoom controls */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-0.5 ml-1">
                    <button
                      onClick={handleZoomOut}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-gray-600 transition-colors"
                      title="Zoom arrière"
                    >
                      <ZoomOut size={13} />
                    </button>
                    <span className="text-[11px] font-mono font-bold text-gray-600 px-1 min-w-[38px] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-gray-600 transition-colors"
                      title="Zoom avant"
                    >
                      <ZoomIn size={13} />
                    </button>
                    {zoom !== 1 && (
                      <button
                        onClick={handleResetZoom}
                        className="px-1.5 h-7 flex items-center justify-center rounded-lg hover:bg-white text-[10px] font-bold text-blue-600"
                        title="Réinitialiser zoom"
                      >
                        100%
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Canvas Container */}
              <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-radial from-gray-100 to-gray-200/80 select-none">
                {isPdf ? (
                  <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-gray-200">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                      PDF
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Fichier Pré-presse PDF Haute Définition</h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      Ce BAT a été généré au format vectoriel certifié PDF/X. Vous pouvez ouvrir l&apos;épreuve originale dans votre lecteur pour inspecter chaque détail à l&apos;échelle 1:1.
                    </p>
                    <a
                      href={currentImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <Download size={16} /> Ouvrir le PDF Certifié
                    </a>
                  </div>
                ) : (
                  <div
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                    className="transition-transform duration-200 ease-out relative"
                  >
                    {/* The Printed Product Canvas */}
                    <div className="relative bg-white shadow-2xl rounded-sm overflow-hidden p-6 border border-gray-300">
                      
                      {/* Technical Crop Marks / Traits de coupe extérieurs */}
                      {!showCleanCut && (
                        <>
                          {/* Top-left tick */}
                          <div className="absolute top-1 left-5 w-4 h-0.5 bg-black" />
                          <div className="absolute top-5 left-1 w-0.5 h-4 bg-black" />
                          {/* Top-right tick */}
                          <div className="absolute top-1 right-5 w-4 h-0.5 bg-black" />
                          <div className="absolute top-5 right-1 w-0.5 h-4 bg-black" />
                          {/* Bottom-left tick */}
                          <div className="absolute bottom-1 left-5 w-4 h-0.5 bg-black" />
                          <div className="absolute bottom-5 left-1 w-0.5 h-4 bg-black" />
                          {/* Bottom-right tick */}
                          <div className="absolute bottom-1 right-5 w-4 h-0.5 bg-black" />
                          <div className="absolute bottom-5 right-1 w-0.5 h-4 bg-black" />
                        </>
                      )}

                      {/* Visual Artwork wrapper */}
                      <div className="relative w-[340px] sm:w-[480px] md:w-[560px] aspect-[1/1.414] bg-white border border-gray-100 overflow-hidden shadow-inner">
                        {/* Actual proof image */}
                        {currentImageUrl ? (
                          <img
                            src={currentImageUrl}
                            alt="Épreuve Bon À Tirer"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                            <Layers size={36} className="mb-2 opacity-40" />
                            <p className="text-sm font-medium">Chargement de la maquette...</p>
                          </div>
                        )}

                        {/* OVERLAYS (Only if not in clean cut mode) */}
                        {!showCleanCut && (
                          <>
                            {/* 1. Bleed Area (Bord perdu externe) */}
                            {showBleed && (
                              <div className="absolute inset-0 border-2 border-red-500/80 border-dashed pointer-events-none z-20">
                                <span className="absolute top-1 left-1.5 text-[9px] font-bold text-red-700 bg-red-100/90 px-1.5 py-0.5 rounded shadow-xs">
                                  Bord perdu (+3mm)
                                </span>
                              </div>
                            )}

                            {/* 2. Trim Line (Ligne de massicotage) */}
                            {showTrim && (
                              <div className="absolute inset-[3.5%] border-2 border-black/80 pointer-events-none z-20">
                                <span className="absolute -top-3 right-2 text-[9px] font-bold text-gray-900 bg-white/90 px-1.5 py-0.5 rounded border border-gray-300 shadow-xs">
                                  Ligne de coupe
                                </span>
                              </div>
                            )}

                            {/* 3. Safety Zone (Zone tranquille intérieure) */}
                            {showSafety && (
                              <div className="absolute inset-[8.5%] border-2 border-emerald-500/80 border-dotted pointer-events-none z-20">
                                <span className="absolute bottom-1 right-1.5 text-[9px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded shadow-xs">
                                  Zone sécurisée (Textes/Logos)
                                </span>
                              </div>
                            )}

                            {/* 4. Center Crosshairs */}
                            {showCenterLines && (
                              <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                                <div className="w-full h-px bg-blue-500/30" />
                                <div className="h-full w-px bg-blue-500/30 absolute" />
                              </div>
                            )}
                          </>
                        )}

                        {/* Clean cut mask (masks bleed) */}
                        {showCleanCut && (
                          <div className="absolute inset-0 border-[3.5%] border-gray-300/60 pointer-events-none z-20" />
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Legend reminder */}
              <div className="px-5 py-2.5 bg-white border-t border-gray-200 flex flex-wrap items-center justify-between text-xs text-gray-500 shrink-0">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    Bord perdu (matière coupée)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-black" />
                    Ligne de coupe
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Zone de sécurité protégée
                  </span>
                </div>
                <span className="text-gray-400 font-mono text-[11px]">
                  Résolution certifiée 300 DPI · Profil CMJN ISO Coated
                </span>
              </div>
            </div>

            {/* ── Right Side: Control & Validation Sidebar ────── */}
            <div className="w-full lg:w-[440px] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col justify-between overflow-y-auto shrink-0 shadow-lg">
              
              <div className="p-6 space-y-6">

                {/* Studio Prepress Notes */}
                {batNotes && (
                  <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-4 text-blue-950">
                    <div className="flex items-center gap-2 mb-1.5 font-bold text-xs uppercase tracking-wider text-blue-800">
                      <Info size={15} className="text-blue-600" />
                      Remarque de notre atelier pré-presse
                    </div>
                    <p className="text-xs text-blue-900 leading-relaxed">
                      {batNotes}
                    </p>
                  </div>
                )}

                {/* Technical Quality Checklist Badge */}
                <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Contrôle Technique Automatisé
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check size={14} className="text-emerald-600 stroke-[3]" /> Profil CMJN vérifié
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check size={14} className="text-emerald-600 stroke-[3]" /> 300 DPI Haute Définition
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check size={14} className="text-emerald-600 stroke-[3]" /> Fonds perdus conformes
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check size={14} className="text-emerald-600 stroke-[3]" /> Polices vectorisées
                    </div>
                  </div>
                </div>

                {/* Already Approved State */}
                {isApproved && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-2">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={24} />
                    </div>
                    <h3 className="font-bold text-emerald-900 text-base">BAT Déjà Validé</h3>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      Ce Bon À Tirer a été validé et signé numériquement. Votre commande est actuellement en cours d&apos;impression sur nos rotatives.
                    </p>
                  </div>
                )}

                {/* Already Rejected / Revision in progress State */}
                {isRejected && !showCorrectionForm && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-900 text-sm">Modifications en cours de traitement</h4>
                        <p className="text-xs text-amber-700 mt-0.5">Nos graphistes adaptent vos fichiers.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCorrectionForm(true)}
                      className="w-full text-center text-xs font-bold text-amber-800 hover:underline pt-1"
                    >
                      Ajouter une précision ou modifier la demande
                    </button>
                  </div>
                )}

                {/* Correction Form Dropdown/Panel */}
                {showCorrectionForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                        <RotateCcw size={15} /> Demander des corrections
                      </h4>
                      <button
                        onClick={() => setShowCorrectionForm(false)}
                        className="text-xs text-gray-400 hover:text-gray-700 font-bold"
                      >
                        Annuler
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Détails des corrections à apporter :
                      </label>
                      <textarea
                        rows={3}
                        value={correctionReason}
                        onChange={(e) => setCorrectionReason(e.target.value)}
                        placeholder="Ex: Veuillez corriger l'orthographe du numéro de téléphone et centrer le logo principal..."
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Joindre un nouveau fichier ou capture annotée (facultatif) :
                      </label>
                      <div className="relative border-2 border-dashed border-gray-200 hover:border-amber-400 rounded-xl p-3 bg-white text-center cursor-pointer transition-colors">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept="image/*,.pdf"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                          <UploadCloud size={16} className="text-amber-600" />
                          <span className="truncate max-w-[200px]">
                            {correctionFile ? correctionFile.name : 'Choisir un fichier...'}
                          </span>
                        </div>
                      </div>
                      {isUploading && (
                        <div className="mt-2 text-xs text-amber-700 font-medium">
                          Envoi en cours ({uploadProgress}%)...
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleReject}
                      disabled={isSubmitting || !correctionReason.trim() || isUploading}
                      className="w-full py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={14} /> Envoyer mes corrections à l&apos;atelier
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {/* Validation Checklist (When pending) */}
                {!isApproved && !showCorrectionForm && (
                  <div className="space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                      <h4 className="font-display font-bold text-gray-900 text-sm">
                        Points de contrôle obligatoires
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Cochez chaque case pour débloquer la validation pour impression.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={checks.texts}
                          onChange={(e) => setChecks({ ...checks, texts: e.target.checked })}
                          className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            Orthographe & Textes vérifiés
                          </p>
                          <p className="text-gray-500 text-[11px] mt-0.5">
                            Coordonnées, numéros de téléphone, adresses et typographies sont exacts.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={checks.layout}
                          onChange={(e) => setChecks({ ...checks, layout: e.target.checked })}
                          className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            Positionnement & Zone de sécurité
                          </p>
                          <p className="text-gray-500 text-[11px] mt-0.5">
                            Aucun élément critique n&apos;est trop proche du trait de massicot.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={checks.resolution}
                          onChange={(e) => setChecks({ ...checks, resolution: e.target.checked })}
                          className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            Netteté des photos & Couleurs
                          </p>
                          <p className="text-gray-500 text-[11px] mt-0.5">
                            J&apos;accepte les légères tolérances chromatiques propres à l&apos;impression CMJN.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={checks.agreement}
                          onChange={(e) => setChecks({ ...checks, agreement: e.target.checked })}
                          className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            Bon À Tirer ferme et définitif
                          </p>
                          <p className="text-gray-500 text-[11px] mt-0.5">
                            Je confirme que le tirage sera réalisé strictement selon cette épreuve.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

              </div>

              {/* ── Bottom Action CTAs ────────────────────────── */}
              <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-3">
                {!isApproved && !showCorrectionForm && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={!allChecked || isSubmitting}
                      className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                        allChecked && !isSubmitting
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-lg active:scale-[0.99]'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          Valider mon BAT & Lancer l&apos;impression
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowCorrectionForm(true)}
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 font-bold text-xs hover:bg-gray-100 hover:text-gray-900 transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={14} /> Demander des modifications
                    </button>
                  </>
                )}

                {isApproved && (
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
                  >
                    Fermer la fenêtre
                  </button>
                )}
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
