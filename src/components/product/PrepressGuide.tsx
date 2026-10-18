'use client'

import { ShieldAlert, CheckCircle2, AlertTriangle, X } from 'lucide-react'

interface PrepressGuideProps {
 isOpen: boolean
 onClose: () => void
}

export function PrepressGuide({ isOpen, onClose }: PrepressGuideProps) {
 if (!isOpen) return null

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
 <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
 
 {/* Header */}
 <div className="bg-foreground text-white px-6 py-4 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="text-xl">🎨</span>
 <h3 className="font-display font-bold text-base">Guide Prépresse & Gabarit</h3>
 </div>
 <button
 onClick={onClose}
 className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
 >
 <X size={18} />
 </button>
 </div>

 {/* Content */}
 <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-600">
 
 {/* Intro Warning */}
 <div className="flex gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-800">
 <ShieldAlert size={20} className="shrink-0 text-amber-600 mt-0.5" />
 <div>
 <h4 className="font-bold text-xs uppercase tracking-wider mb-1">Attention qualité d&apos;impression</h4>
 <p className="text-xs leading-relaxed">
 Pour éviter toute pixellisation, texte coupé ou problème de couleurs lors de la découpe physique, veuillez respecter les consignes ci-dessous.
 </p>
 </div>
 </div>

 {/* Rule 1: Resolution */}
 <div className="space-y-2">
 <h4 className="font-bold text-foreground flex items-center gap-2">
 <span className="w-5 h-5 bg-secondary text-foreground rounded-full flex items-center justify-center text-xs font-bold">1</span>
 Résolution : 300 DPI minimum
 </h4>
 <p className="pl-7 text-xs leading-relaxed">
 Vos visuels doivent avoir une résolution de <strong>300 pixels par pouce (DPI)</strong> à taille réelle. Les images récupérées sur le web ou WhatsApp sont souvent compressées à 72 DPI et apparaîtront floues.
 </p>
 <div className="pl-7 flex gap-2">
 <span className="px-2 py-1 bg-green-50 border border-green-100 text-green-700 text-2xs font-bold rounded-lg flex items-center gap-1">
 <CheckCircle2 size={10} /> PDF Vectoriel / TIFF (Recommandé)
 </span>
 <span className="px-2 py-1 bg-red-50 border border-red-100 text-red-700 text-2xs font-bold rounded-lg flex items-center gap-1">
 <AlertTriangle size={10} /> Capture d&apos;écran / WhatsApp
 </span>
 </div>
 </div>

 {/* Rule 2: Bleed margins */}
 <div className="space-y-2">
 <h4 className="font-bold text-foreground flex items-center gap-2">
 <span className="w-5 h-5 bg-secondary text-foreground rounded-full flex items-center justify-center text-xs font-bold">2</span>
 Marge de débord (Bleed) : 3 mm
 </h4>
 <p className="pl-7 text-xs leading-relaxed">
 Ajoutez <strong>3 mm de débord tout autour</strong> de votre fichier. Par exemple, pour un format A5 (148×210mm), votre fichier final doit faire 154×216mm. Remplissez cet espace avec votre image de fond pour éviter des filets blancs lors du massicotage.
 </p>
 {/* Visual crop guide */}
 <div className="pl-7">
 <div className="border border-dashed border-red-400 p-2 rounded relative bg-gray-50 max-w-xs mx-auto">
 <div className="absolute inset-1 border border-blue-400 rounded-sm" />
 <div className="h-16 flex items-center justify-center text-2xs font-bold text-gray-400 select-none">
 Visuel / Fond perdu
 </div>
 <div className="absolute top-0 left-4 text-[10px] bg-red-100 text-red-700 px-1 rounded">Zone de coupe (Rouge)</div>
 <div className="absolute bottom-0 right-4 text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Zone tranquille (Bleu - textes à l&apos;intérieur)</div>
 </div>
 </div>
 </div>

 {/* Rule 3: Color Mode */}
 <div className="space-y-2">
 <h4 className="font-bold text-foreground flex items-center gap-2">
 <span className="w-5 h-5 bg-secondary text-foreground rounded-full flex items-center justify-center text-xs font-bold">3</span>
 Mode de couleur : CMJN (CMYK)
 </h4>
 <p className="pl-7 text-xs leading-relaxed">
 Vos écrans affichent en RVB (RGB). Les presses d&apos;imprimerie impriment en <strong>CMJN (Cyan, Magenta, Jaune, Noir)</strong>. Convertissez votre espace colorimétrique en CMJN (profil FOGRA39 par exemple) pour éviter des variations de teintes (couleurs plus ternes ou différentes à l&apos;impression).
 </p>
 </div>

 </div>

 {/* Footer */}
 <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-100">
 <button
 onClick={onClose}
 className="px-5 py-2.5 bg-foreground hover:bg-foreground text-white rounded-xl font-bold text-xs transition-all shadow-md"
 >
 J&apos;ai compris
 </button>
 </div>

 </div>
 </div>
 )
}
