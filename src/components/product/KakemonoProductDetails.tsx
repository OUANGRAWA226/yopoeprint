'use client'

import React, { useState } from 'react'
import {
  PackageCheck,
  Wrench,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Check,
  ChevronDown,
  Layers,
  Flame,
  Award,
  Clock,
  Eye,
  FileDown,
  AlertCircle,
  Building2,
  Calendar,
  Store,
  Share2,
  Maximize2
} from 'lucide-react'

export function KakemonoProductDetails() {
  const [activeTab, setActiveTab] = useState<'pack' | 'tech' | 'montage' | 'pao' | 'usage' | 'faq'>('pack')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  return (
    <div className="mt-12 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* ── Entête avec proposition de valeur ── */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-primary/90 text-white p-6 md:p-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-200 text-xs font-semibold backdrop-blur-sm mb-3">
            <Sparkles size={14} className="text-amber-400" />
            <span>Support événementiel N°1 au Burkina Faso</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
            Tout savoir sur le Kakémono Roll-up YopoePrint
          </h2>
          <p className="mt-2 text-gray-300 text-sm md:text-base leading-relaxed">
            La solution d'exposition mobile clé en main : caisson aluminium haute résistance, visuel HD imprimé et déjà monté, et sac de transport matelassé offert. Déployable en 30 secondes sans le moindre outil.
          </p>

          {/* Mini badges réassurance */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2 text-gray-200">
              <Clock size={16} className="text-amber-400 shrink-0" />
              <span>Montage en <strong>30 secondes</strong></span>
            </div>
            <div className="flex items-center gap-2 text-gray-200">
              <PackageCheck size={16} className="text-emerald-400 shrink-0" />
              <span>Sac matelassé <strong>inclus</strong></span>
            </div>
            <div className="flex items-center gap-2 text-gray-200">
              <Flame size={16} className="text-rose-400 shrink-0" />
              <span>Toile norme <strong>anti-feu M1</strong></span>
            </div>
            <div className="flex items-center gap-2 text-gray-200">
              <Award size={16} className="text-blue-400 shrink-0" />
              <span>Impression <strong>HD 1200 DPI</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation par Onglets ── */}
      <div className="border-b border-gray-200 bg-gray-50/80 px-4 md:px-8 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 py-3 min-w-max">
          {[
            { id: 'pack', label: 'Pack complet inclus', icon: PackageCheck },
            { id: 'tech', label: 'Fiche technique', icon: FileSpreadsheet },
            { id: 'montage', label: 'Guide de montage (30s)', icon: Wrench },
            { id: 'pao', label: 'Spécifications PAO & Fichiers', icon: Layers },
            { id: 'usage', label: 'Cas d\'usage au Burkina', icon: Building2 },
            { id: 'faq', label: 'Questions fréquentes', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all
                  ${isActive
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80'}`}
              >
                <Icon size={16} className={isActive ? 'text-primary' : 'text-gray-400'} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Contenu des Onglets ── */}
      <div className="p-6 md:p-8">

        {/* 1. PACK COMPLET */}
        {activeTab === 'pack' && (
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Un kit d'exposition 100% prêt à l'emploi
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Aucun montage de bâche nécessaire : le visuel est directement installé et tendu dans l'enrouleur en atelier.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Carte 1 */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-xl mb-4">
                  🗄️
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Boîtier aluminium anodisé</h4>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Carter léger et solide en aluminium argenté satiné avec ressort d'enroulement haute endurance et <strong>2 pieds pivotants à 360°</strong> pour une stabilité parfaite.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  <Check size={12} /> Double pied stabilisateur
                </div>
              </div>

              {/* Carte 2 */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-xl mb-4">
                  🖼️
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Visuel HD monté en atelier</h4>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Impression numérique quadrichromie haute définition (1200 DPI réels) sur bâche anti-feu M1 ou toile Ferrari anti-curling. Visuel déjà inséré dans le tambour.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                  <Check size={12} /> Prêt à dérouler
                </div>
              </div>

              {/* Carte 3 */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-xl mb-4">
                  📏
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Mât vertical 3 sections</h4>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Tige de maintien en aluminium robuste reliée par un élastique interne ultra résistant (type armature de tente). Aucun risque d'égarer un élément.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                  <Check size={12} /> Emboîtement instantané
                </div>
              </div>

              {/* Carte 4 - Sac offert */}
              <div className="bg-amber-50/70 rounded-xl p-5 border-2 border-amber-300 relative overflow-hidden">
                <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                  Offert
                </span>
                <div className="w-12 h-12 rounded-xl bg-white border border-amber-200 shadow-sm flex items-center justify-center text-xl mb-4">
                  🎒
                </div>
                <h4 className="font-bold text-amber-950 text-sm">Sac de transport matelassé</h4>
                <p className="text-xs text-amber-800 mt-2 leading-relaxed">
                  Housse en tissu Oxford noir renforcé avec mousse de protection intérieure, double fermeture éclair et bandoulière de portage à l'épaule.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-md">
                  <Check size={12} /> Zéro coût supplémentaire
                </div>
              </div>
            </div>

            {/* Note informative */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-primary shrink-0" />
                <span>
                  <strong>Garantie tranquillité YopoePrint</strong> : chaque roll-up est inspecté, déroulé et vérifié manuellement par nos équipes de contrôle qualité avant conditionnement.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. FICHE TECHNIQUE */}
        {activeTab === 'tech' && (
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Caractéristiques techniques détaillées
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Conçu pour un usage professionnel intensif, intérieur comme extérieur abrité.
              </p>
            </div>

            {/* Spécifications générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-100 px-4 py-2.5 font-bold text-xs uppercase tracking-wider text-gray-700">
                  Structure & Mécanique
                </div>
                <dl className="divide-y divide-gray-100 text-xs">
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Matériau du carter</dt>
                    <dd className="font-semibold text-gray-900">Aluminium anodisé argenté anti-rayure</dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Stabilité au sol</dt>
                    <dd className="font-semibold text-gray-900">2 pieds pivotants à embouts protecteurs</dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Profilé supérieur</dt>
                    <dd className="font-semibold text-gray-900">Réglette clipseuse alu avec embouts noirs</dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Mât de tension</dt>
                    <dd className="font-semibold text-gray-900">3 sections emboîtables avec élastique</dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Poids de l'ensemble</dt>
                    <dd className="font-semibold text-gray-900">2.8 kg (85×200cm) avec sac inclus</dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Dimensions emballé</dt>
                    <dd className="font-semibold text-gray-900">88 × 11 × 11 cm</dd>
                  </div>
                </dl>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-100 px-4 py-2.5 font-bold text-xs uppercase tracking-wider text-gray-700">
                  Impression & Toiles
                </div>
                <dl className="divide-y divide-gray-100 text-xs">
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Technologie d'impression</dt>
                    <dd className="font-semibold text-gray-900">Numérique UV HD / Latex écologique</dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Résolution</dt>
                    <dd className="font-semibold text-gray-900">Jusqu'à 1200 DPI réels</dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Norme incendie</dt>
                    <dd className="font-semibold text-emerald-700 flex items-center gap-1">
                      <Flame size={13} /> Certifié M1 (Non inflammable ERP)
                    </dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Résistance UV</dt>
                    <dd className="font-semibold text-gray-900">Encres anti-décoloration longue durée</dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Entretien</dt>
                    <dd className="font-semibold text-gray-900">Lavable à l'eau douce tiède sans solvant</dd>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <dt className="text-gray-500">Réutilisation</dt>
                    <dd className="font-semibold text-gray-900">Structure rechargeable avec nouveau visuel</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Comparatif des supports imprimés */}
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-3">Quelle matière choisir pour votre visuel ?</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-gray-200 bg-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    Standard Économique
                  </span>
                  <h5 className="font-bold text-gray-900 text-sm mt-2">Bâche PVC 510g/m² M1</h5>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Ultra résistante, indéchirable et conforme à la norme anti-feu des salons pro et foires. Excellent rapport qualité/prix.
                  </p>
                </div>
                <div className="p-4 rounded-xl border-2 border-primary/40 bg-green-50/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                    Recommandé Prestige
                  </span>
                  <h5 className="font-bold text-gray-900 text-sm mt-2">Toile Ferrari Décolit Anti-curling</h5>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Ne bique jamais sur les bords (zéro curling). Dos gris opaque bloquant tout contre-jour. Rendu satiné sans aucun reflet.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 bg-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    Spécial Caméras & Médias
                  </span>
                  <h5 className="font-bold text-gray-900 text-sm mt-2">Tissu Polyester Textile 220g</h5>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Matière textile noble, toucher doux et mat. Absorption totale des reflets des flashs photo et éclairages de scène.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. GUIDE DE MONTAGE EXPRESS */}
        {activeTab === 'montage' && (
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Montage express en 30 secondes chrono
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Aucun outil ni compétence technique requise. Une seule personne suffit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Étape 1 */}
              <div className="relative bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col items-center text-center">
                <span className="w-10 h-10 rounded-full bg-primary text-white text-base font-extrabold flex items-center justify-center mb-4 shadow-sm">
                  1
                </span>
                <div className="w-20 h-20 bg-white rounded-2xl border border-gray-200 flex items-center justify-center text-3xl shadow-sm mb-4">
                  🦶
                </div>
                <h4 className="font-bold text-gray-900 text-base">Ouvrez les pieds</h4>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Sortez le carter de sa housse, déposez-le au sol à l'emplacement souhaité et faites pivoter les deux pieds métalliques à 90° perpendiculairement au boîtier.
                </p>
              </div>

              {/* Étape 2 */}
              <div className="relative bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col items-center text-center">
                <span className="w-10 h-10 rounded-full bg-primary text-white text-base font-extrabold flex items-center justify-center mb-4 shadow-sm">
                  2
                </span>
                <div className="w-20 h-20 bg-white rounded-2xl border border-gray-200 flex items-center justify-center text-3xl shadow-sm mb-4">
                  🦯
                </div>
                <h4 className="font-bold text-gray-900 text-base">Emboîtez le mât</h4>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Dépliez les 3 sections du mât télescopique (l'élastique interne les guide automatiquement). Insérez fermement l'embout inférieur dans l'orifice central du boîtier.
                </p>
              </div>

              {/* Étape 3 */}
              <div className="relative bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col items-center text-center">
                <span className="w-10 h-10 rounded-full bg-primary text-white text-base font-extrabold flex items-center justify-center mb-4 shadow-sm">
                  3
                </span>
                <div className="w-20 h-20 bg-white rounded-2xl border border-gray-200 flex items-center justify-center text-3xl shadow-sm mb-4">
                  🚀
                </div>
                <h4 className="font-bold text-gray-900 text-base">Déroulez et clipsez</h4>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Prenez la barre clip supérieure par le centre avec les deux mains, tirez délicatement le visuel vers le haut et fixez l'encoche au sommet du mât. C'est terminé !
                </p>
              </div>
            </div>

            {/* Conseil de sécurité pro */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Conseil d'expert pour le démontage :</strong> Pour ranger votre roll-up, décrochez la réglette du sommet du mât en la tenant fermement à deux mains et accompagnez la descente de la toile jusqu'au carter. Ne relâchez jamais la bâche d'un coup pour éviter d'endommager le ressort intérieur.
              </div>
            </div>
          </div>
        )}

        {/* 4. GUIDE PAO & GABARIT */}
        {activeTab === 'pao' && (
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Spécifications pour graphistes & agences
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Suivez ces consignes pour garantir une netteté absolue et éviter toute coupure de texte.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Spécifications texte */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-400 font-semibold uppercase text-[10px]">Dimensions réelles (Standard)</p>
                    <p className="font-extrabold text-gray-900 text-sm mt-0.5">850 × 2000 mm</p>
                    <p className="text-[11px] text-gray-500 mt-1">Format fini visible</p>
                  </div>
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-400 font-semibold uppercase text-[10px]">Mode colorimétrique</p>
                    <p className="font-extrabold text-gray-900 text-sm mt-0.5">CMJN / Fogra 39</p>
                    <p className="text-[11px] text-gray-500 mt-1">Pas de profil RVB</p>
                  </div>
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-400 font-semibold uppercase text-[10px]">Résolution d'image</p>
                    <p className="font-extrabold text-gray-900 text-sm mt-0.5">150 à 300 DPI</p>
                    <p className="text-[11px] text-gray-500 mt-1">À l'échelle 1:1</p>
                  </div>
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-400 font-semibold uppercase text-[10px]">Formats acceptés</p>
                    <p className="font-extrabold text-gray-900 text-sm mt-0.5">PDF HD, AI, PSD, TIFF</p>
                    <p className="text-[11px] text-gray-500 mt-1">Polices vectorisées</p>
                  </div>
                </div>

                {/* Marges critiques */}
                <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl text-xs text-red-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-red-800">
                    <AlertCircle size={16} />
                    <span>⚠️ Marges techniques indispensables :</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-red-900 pl-1">
                    <li>
                      <strong>Zone basse (+ 50 mm / 5 cm) :</strong> Ne placez aucun logo, texte ni information importante dans les 5 derniers centimètres du bas du fichier. Cette zone est enroulée dans le mécanisme.
                    </li>
                    <li>
                      <strong>Zone haute (10 mm / 1 cm) :</strong> Marge de sécurité pour le profilé de serrage en aluminium qui recouvre le haut du visuel.
                    </li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://wa.me/22600000000?text=Bonjour,%20je%20souhaite%20recevoir%20le%20gabarit%20du%20Kakemono%20Roll-up"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
                  >
                    <FileDown size={14} />
                    Demander le gabarit Illustrator / PDF
                  </a>
                </div>
              </div>

              {/* Schéma visuel gabarit */}
              <div className="lg:col-span-5 bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col items-center justify-center">
                <div className="w-full max-w-[200px] aspect-[85/205] bg-white rounded-lg border-2 border-dashed border-gray-300 relative flex flex-col justify-between p-2 shadow-inner">
                  {/* Zone clip haute */}
                  <div className="h-4 bg-gray-200 rounded text-[9px] text-gray-500 flex items-center justify-center font-bold">
                    Profilé haut (1 cm)
                  </div>
                  
                  {/* Zone de contenu utile */}
                  <div className="flex-1 my-2 border border-emerald-300 bg-emerald-50/40 rounded flex flex-col items-center justify-center p-2 text-center">
                    <span className="text-[10px] font-bold text-emerald-800">Zone Utile Visible</span>
                    <span className="text-[8px] text-emerald-600 mt-1">Textes, logos, visuels et charte graphique</span>
                  </div>

                  {/* Zone basse amorce */}
                  <div className="h-8 bg-red-100 border border-red-300 rounded text-[8px] text-red-700 flex flex-col items-center justify-center font-bold">
                    <span>Zone Amorçage (5 cm)</span>
                    <span className="text-[7px] font-normal opacity-80">Non visible dans le caisson</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-3 text-center">
                  Gabarit officiel pour format standard 85×200 cm
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. CAS D'USAGE AU BURKINA */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Où et comment utiliser votre Roll-up ?
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Recommandé par plus de 500 entreprises, institutions et ONG partenaires à Ouagadougou et dans les provinces.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-gray-200 bg-white flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                  🎪
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Foires & Salons professionnels</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Indispensable pour habiller votre stand lors du <strong>SIAO</strong>, du <strong>SITHO</strong>, du <strong>SAMAO</strong> ou des foires régionales à Bobo-Dioulasso et Koudougou.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-gray-200 bg-white flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                  🎤
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Conférences & Assemblées Générales</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Arrière-plan parfait pour vos tribunes officielles, interviews télévisées, lancements de projets et séminaires d'entreprises dans les hôtels (Lancaster, Silmandé, Laïco).
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-gray-200 bg-white flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                  🏢
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Halls d'accueil & Sièges sociaux</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Présentez vos nouveaux produits, vos certifications qualité ou vos services bancaires et d'assurances dès l'entrée de vos bureaux à Ouaga 2000 ou en agence.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-gray-200 bg-white flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                  🛍️
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Magasins & Campagnes promotionnelles</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Animation commerciale en point de vente, annonces de remises temporaires et PLV (Publicité sur le Lieu de Vente) facile à déplacer chaque matin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. FAQ SPÉCIFIQUE */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4 mb-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Foire Aux Questions — Kakémono Roll-up
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Toutes les réponses à vos interrogations avant de passer commande.
              </p>
            </div>

            {[
              {
                q: "Le sac de transport est-il vraiment inclus avec chaque roll-up ?",
                a: "Oui, absolument ! Chaque roll-up commandé est livré dans sa housse de transport matelassée zippée avec poignées et bandoulière. Vous n'avez aucun supplément à régler."
              },
              {
                q: "Peut-on remplacer le visuel tout en gardant la même structure aluminium ?",
                a: "Oui ! La mécanique en aluminium est durable et réutilisable. Si votre charte graphique change ou pour un nouvel événement, vous pouvez commander uniquement une recharge de bâche imprimée."
              },
              {
                q: "Que se passe-t-il si je n'ai pas encore de fichier ou si je ne sais pas faire la maquette ?",
                a: "Vous pouvez commander en ligne et sélectionner l'option 'Envoyer plus tard (WhatsApp)'. Notre studio graphique peut également concevoir votre maquette sur mesure à partir de votre logo et de vos textes."
              },
              {
                q: "Recevrai-je un Bon À Tirer (BAT) avant le lancement de l'impression ?",
                a: "Oui. YopoePrint génère un BAT numérique systématique. Nos graphistes vérifient la résolution, les marges de coupe et la colorimétrie avant de lancer l'impression."
              },
              {
                q: "Quels sont les délais de livraison pour Ouagadougou et les autres villes du Burkina ?",
                a: "À Ouagadougou, votre roll-up est livré sous 24h à 48h ouvrées après validation de votre fichier. Pour les villes de province (Bobo-Dioulasso, Koudougou, Ouahigouya, etc.), l'expédition sécurisée s'effectue par car de transport en 24h supplémentaires."
              },
              {
                q: "Comment entretenir et nettoyer la toile de mon roll-up ?",
                a: "Pour la bâche PVC comme pour la toile Ferrari, passez simplement un chiffon microfibre ou une éponge douce humidifiée à l'eau tiède savonneuse. N'utilisez aucun solvant agressif (acétone, alcool fort) pour préserver les pigments UV."
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-bold text-gray-900 text-sm md:text-base">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-gray-600 bg-gray-50/50 border-t border-gray-100 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
