'use client'

import React from 'react'

export interface RollupIllustrationProps {
  className?: string
  width?: number
  height?: number
  customVisualUrl?: string
  showHumanScale?: boolean
  materialFinish?: 'mat' | 'brillant' | 'textile' | string
  formatLabel?: string
  showDimensionLines?: boolean
  dimensions?: { widthLabel?: string; heightLabel?: string }
}

// ─── ROLL-UP COMPLET HD SUR PIEDS AVEC SUPPORT LIVE DESIGN & ÉCHELLE ─────────
export function RollupIllustration({
  className = '',
  width = 320,
  height = 240,
  customVisualUrl,
  showHumanScale = false,
  materialFinish = 'mat',
  formatLabel = '85×200 cm',
  showDimensionLines = false,
  dimensions = { widthLabel: '85 cm', heightLabel: '200 cm' }
}: RollupIllustrationProps) {
  // Décalage si l'échelle humaine est affichée
  const xOffset = showHumanScale ? 36 : 0
  const bannerWidth = formatLabel.includes('120') ? 116 : formatLabel.includes('100') ? 106 : formatLabel.includes('60') ? 80 : 96
  const bannerX = 150 + xOffset - bannerWidth / 2
  const cassetteWidth = bannerWidth + 14
  const cassetteX = 150 + xOffset - cassetteWidth / 2
  const topClipWidth = bannerWidth + 6
  const topClipX = 150 + xOffset - topClipWidth / 2

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Dégradé bâche visuelle pro */}
        <linearGradient id="rollupBannerGrad" x1="102" y1="18" x2="198" y2="186" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B192C" />
          <stop offset="35%" stopColor="#1E3E62" />
          <stop offset="70%" stopColor="#0E2347" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Dégradé aluminium carter */}
        <linearGradient id="aluGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="20%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="80%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

        {/* Reflet brillant dynamique */}
        <linearGradient id="glossGlint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="45%" stopColor="white" stopOpacity="0.04" />
          <stop offset="50%" stopColor="white" stopOpacity="0.28" />
          <stop offset="55%" stopColor="white" stopOpacity="0.04" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* Ombre portée réaliste */}
        <filter id="rollupShadow" x="40" y="10" width="240" height="225" filterUnits="userSpaceOnUse">
          <feDropShadow dx="3" dy="8" stdDeviation="7" floodColor="#0F172A" floodOpacity="0.25" />
        </filter>

        {/* Clip-path pour le visuel personnalisé */}
        <clipPath id="bannerClip">
          <rect x={bannerX} y="22" width={bannerWidth} height="170" rx="2" />
        </clipPath>
      </defs>

      {/* ── SILHOUETTE HUMAINE ÉCHELLE 1.75M ── */}
      {showHumanScale && (
        <g opacity="0.85" className="transition-opacity duration-300">
          {/* Ombre au sol personne */}
          <ellipse cx="68" cy="204" rx="20" ry="4" fill="rgba(15,23,42,0.12)" />

          {/* Tête */}
          <circle cx="68" cy="56" r="10" fill="#475569" />
          {/* Cou et épaules */}
          <path d="M54 74 C54 68, 82 68, 82 74 L84 130 C84 134, 80 138, 76 138 L76 202 L70 202 L70 144 L66 144 L66 202 L60 202 L60 138 C56 138, 52 134, 52 130 Z" fill="#64748B" />
          {/* Bras */}
          <path d="M53 74 L48 120 C48 124, 52 126, 54 122 L57 86" fill="#475569" />
          <path d="M83 74 L88 120 C88 124, 84 126, 82 122 L79 86" fill="#475569" />

          {/* Cote de taille humaine 1.75m */}
          <line x1="38" y1="46" x2="38" y2="202" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="34" y1="46" x2="42" y2="46" stroke="#94A3B8" strokeWidth="1" />
          <line x1="34" y1="202" x2="42" y2="202" stroke="#94A3B8" strokeWidth="1" />
          <rect x="24" y="116" width="30" height="15" rx="3" fill="#0F172A" />
          <text x="39" y="127" textAnchor="middle" fill="#38BDF8" fontSize="8" fontWeight="bold">1.75 m</text>
        </g>
      )}

      {/* Ombre au sol douce du roll-up */}
      <ellipse cx={150 + xOffset} cy="208" rx={bannerWidth * 0.8} ry="6" fill="rgba(15,23,42,0.14)" />

      {/* Pieds pivotants de stabilisation étendus à 90° */}
      <rect x={150 + xOffset - bannerWidth / 2 - 24} y="200" width="48" height="6" rx="3" fill="#64748B" transform={`rotate(8 ${150 + xOffset - bannerWidth / 2 - 24} 200)`} />
      <circle cx={150 + xOffset - bannerWidth / 2 - 23} cy="204" r="3.5" fill="#334155" />
      <rect x={150 + xOffset + bannerWidth / 2 - 24} y="200" width="48" height="6" rx="3" fill="#64748B" transform={`rotate(-8 ${150 + xOffset + bannerWidth / 2 - 24} 200)`} />
      <circle cx={150 + xOffset + bannerWidth / 2 + 23} cy="204" r="3.5" fill="#334155" />

      {/* Sommet du mât arrière visible */}
      <rect x={150 + xOffset - 2} y="14" width="4" height="12" rx="1.5" fill="#475569" />

      {/* ── BÂCHE VISUELLE HD ── */}
      <g filter="url(#rollupShadow)">
        <rect x={bannerX} y="22" width={bannerWidth} height="170" rx="2" fill="url(#rollupBannerGrad)" />
        
        {/* Si visuel personnalisé fourni par l'utilisateur */}
        {customVisualUrl ? (
          <g clipPath="url(#bannerClip)">
            <image
              href={customVisualUrl}
              x={bannerX}
              y="22"
              width={bannerWidth}
              height="170"
              preserveAspectRatio="xMidYMid slice"
            />
            {/* Voile d'ombrage réaliste pour intégration 3D */}
            <rect x={bannerX} y="22" width={bannerWidth} height="170" fill="black" opacity="0.08" />
          </g>
        ) : (
          /* Graphisme de démonstration pro par défaut */
          <>
            {/* Logo / Marque en haut */}
            <circle cx={150 + xOffset} cy="40" r="11" fill="#00C06D" opacity="0.25" />
            <circle cx={150 + xOffset} cy="40" r="8" fill="#00C06D" />
            <text x={150 + xOffset} y="44" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">Y</text>

            {/* Titre marque */}
            <rect x={150 + xOffset - 24} y="53" width="48" height="4" rx="2" fill="white" opacity="0.95" />
            <rect x={150 + xOffset - 16} y="59" width="32" height="2.5" rx="1.2" fill="#F59E0B" />

            {/* Ligne séparatrice */}
            <line x1={bannerX + 10} y1="67" x2={bannerX + bannerWidth - 10} y2="67" stroke="white" strokeOpacity="0.15" strokeWidth="0.8" />

            {/* Encadré d'exposition / Visuel central */}
            <rect x={bannerX + 10} y="74" width={bannerWidth - 20} height="56" rx="4" fill="white" fillOpacity="0.07" stroke="white" strokeOpacity="0.12" strokeWidth="0.8" />
            <circle cx={150 + xOffset} cy="94" r="14" fill="#F59E0B" fillOpacity="0.15" />
            <text x={150 + xOffset} y="100" textAnchor="middle" fontSize="18">🏢</text>
            <rect x={150 + xOffset - 30} y="114" width="60" height="4" rx="2" fill="white" opacity="0.9" />
            <rect x={150 + xOffset - 22} y="120" width="44" height="2.5" rx="1.2" fill="#00C06D" opacity="0.9" />

            {/* Puces & Arguments */}
            <circle cx={bannerX + 16} cy="142" r="2.2" fill="#00C06D" />
            <rect x={bannerX + 22} y="140.5" width={bannerWidth - 40} height="3" rx="1.5" fill="white" opacity="0.8" />
            <circle cx={bannerX + 16} cy="150" r="2.2" fill="#00C06D" />
            <rect x={bannerX + 22} y="148.5" width={bannerWidth - 48} height="3" rx="1.5" fill="white" opacity="0.8" />
            <circle cx={bannerX + 16} cy="158" r="2.2" fill="#00C06D" />
            <rect x={bannerX + 22} y="156.5" width={bannerWidth - 44} height="3" rx="1.5" fill="white" opacity="0.8" />

            {/* Bouton d'action bas */}
            <rect x={150 + xOffset - 32} y="169" width="64" height="10" rx="3.5" fill="#F59E0B" />
            <rect x={150 + xOffset - 20} y="172.5" width="40" height="3" rx="1.5" fill="#1E293B" />
          </>
        )}

        {/* Reflet de matière dynamique (brillant ou satiné) */}
        {materialFinish === 'brillant' ? (
          <rect x={bannerX} y="22" width={bannerWidth} height="170" fill="url(#glossGlint)" />
        ) : (
          <path d={`M${bannerX} 22 L${bannerX + 50} 22 L${bannerX + 20} 192 L${bannerX} 192 Z`} fill="white" opacity="0.05" />
        )}
      </g>

      {/* Profilé supérieur clip aluminium */}
      <rect x={topClipX} y="18" width={topClipWidth} height="5.5" rx="1.5" fill="url(#aluGrad)" stroke="#64748B" strokeWidth="0.6" />
      <circle cx={topClipX + 2} cy="20.7" r="1.5" fill="#334155" />
      <circle cx={topClipX + topClipWidth - 2} cy="20.7" r="1.5" fill="#334155" />

      {/* Caisson inférieur aluminium anodisé */}
      <rect x={cassetteX} y="188" width={cassetteWidth} height="14" rx="3.5" fill="url(#aluGrad)" stroke="#475569" strokeWidth="0.8" />
      <rect x={cassetteX + 5} y="189" width={cassetteWidth - 10} height="1.8" rx="0.9" fill="#0F172A" />
      {/* Embouts latéraux du carter */}
      <rect x={cassetteX - 1} y="188.5" width="3.5" height="13" rx="1.5" fill="#334155" />
      <rect x={cassetteX + cassetteWidth - 2.5} y="188.5" width="3.5" height="13" rx="1.5" fill="#334155" />

      {/* ── LIGNES DE COTES ARCHITECTURALES ── */}
      {showDimensionLines && (
        <g opacity="0.9">
          {/* Cote largeur haute */}
          <line x1={bannerX} y1="8" x2={bannerX + bannerWidth} y2="8" stroke="#00C06D" strokeWidth="1.2" />
          <line x1={bannerX} y1="5" x2={bannerX} y2="11" stroke="#00C06D" strokeWidth="1.2" />
          <line x1={bannerX + bannerWidth} y1="5" x2={bannerX + bannerWidth} y2="11" stroke="#00C06D" strokeWidth="1.2" />
          <rect x={150 + xOffset - 22} y="1" width="44" height="14" rx="3" fill="#0F172A" />
          <text x={150 + xOffset} y="11" textAnchor="middle" fill="#00C06D" fontSize="8" fontWeight="bold">
            {dimensions.widthLabel || '85 cm'}
          </text>

          {/* Cote hauteur droite */}
          <line x1={bannerX + bannerWidth + 14} y1="18" x2={bannerX + bannerWidth + 14} y2="202" stroke="#00C06D" strokeWidth="1.2" />
          <line x1={bannerX + bannerWidth + 11} y1="18" x2={bannerX + bannerWidth + 17} y2="18" stroke="#00C06D" strokeWidth="1.2" />
          <line x1={bannerX + bannerWidth + 11} y1="202" x2={bannerX + bannerWidth + 17} y2="202" stroke="#00C06D" strokeWidth="1.2" />
          <rect x={bannerX + bannerWidth + 8} y="102" width="46" height="14" rx="3" fill="#0F172A" />
          <text x={bannerX + bannerWidth + 31} y="112" textAnchor="middle" fill="#00C06D" fontSize="8" fontWeight="bold">
            {dimensions.heightLabel || '200 cm'}
          </text>
        </g>
      )}
    </svg>
  )
}

// ─── ZOOM SUR LA STRUCTURE EN ALUMINIUM & LES PIEDS ───────────
export function RollupBaseIllustration({ className = '', width = 300, height = 220 }: { className?: string; width?: number; height?: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="macroAlu" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="25%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#E2E8F0" />
          <stop offset="85%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
      </defs>

      {/* Ombre au sol */}
      <ellipse cx="150" cy="188" rx="115" ry="9" fill="rgba(15,23,42,0.12)" />

      {/* Pieds pivotants grand angle */}
      {/* Pied gauche */}
      <path d="M50 192 L125 174 L125 162 L45 180 Z" fill="#64748B" />
      <rect x="40" y="179" width="15" height="14" rx="4" fill="#1E293B" />
      {/* Pied droit */}
      <path d="M250 192 L175 174 L175 162 L255 180 Z" fill="#64748B" />
      <rect x="245" y="179" width="15" height="14" rx="4" fill="#1E293B" />

      {/* Grand caisson aluminium enrouleur */}
      <rect x="35" y="118" width="230" height="48" rx="9" fill="url(#macroAlu)" stroke="#64748B" strokeWidth="1.2" />
      
      {/* Fente supérieure de sortie de bâche */}
      <rect x="48" y="120" width="204" height="3.5" rx="1.7" fill="#0F172A" />

      {/* Bâche qui se déploie du carter */}
      <rect x="52" y="65" width="196" height="55" fill="#0B192C" opacity="0.95" />
      <line x1="52" y1="65" x2="248" y2="65" stroke="#00C06D" strokeWidth="3" />
      <rect x="85" y="80" width="130" height="7" rx="3.5" fill="white" opacity="0.8" />
      <rect x="110" y="93" width="80" height="5" rx="2.5" fill="#F59E0B" />

      {/* Flèches d'amorce montrant la tension */}
      <path d="M150 48 L150 58 M146 52 L150 48 L154 52" stroke="#00C06D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Embouts latéraux avec vis de fixation */}
      <rect x="31" y="118" width="10" height="48" rx="4" fill="#334155" />
      <circle cx="36" cy="130" r="3" fill="#94A3B8" />
      <circle cx="36" cy="154" r="3" fill="#94A3B8" />

      <rect x="259" y="118" width="10" height="48" rx="4" fill="#334155" />
      <circle cx="264" cy="130" r="3" fill="#94A3B8" />
      <circle cx="264" cy="154" r="3" fill="#94A3B8" />

      {/* Prise mât arrière avec bague */}
      <rect x="144" y="106" width="12" height="14" rx="2.5" fill="#475569" stroke="#94A3B8" strokeWidth="1" />
      <rect x="147" y="50" width="6" height="58" fill="#94A3B8" />

      {/* Badge technique */}
      <g transform="translate(150, 24)">
        <rect x="-95" y="-13" width="190" height="26" rx="13" fill="#0F172A" fillOpacity="0.9" />
        <circle cx="-78" cy="0" r="5" fill="#00C06D" />
        <text x="-66" y="4" fill="white" fontSize="10.5" fontWeight="bold">Aluminium Anodisé + Double Pied</text>
      </g>
    </svg>
  )
}

// ─── SAC DE TRANSPORT MATELASSÉ INCLUS ─────────────────────────
export function RollupBagIllustration({ className = '', width = 300, height = 220 }: { className?: string; width?: number; height?: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="bagGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="45%" stopColor="#1F2937" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
        <filter id="bagShadow" x="15" y="65" width="270" height="100" filterUnits="userSpaceOnUse">
          <feDropShadow dx="2" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Ombre au sol */}
      <ellipse cx="150" cy="180" rx="115" ry="8" fill="rgba(0,0,0,0.15)" />

      {/* Sangle bandoulière réglable courbée */}
      <path d="M55 110 C55 45, 245 45, 245 110" stroke="#4B5563" strokeWidth="8" fill="none" strokeLinecap="round" />
      {/* Boucle métal réglage sangle */}
      <rect x="142" y="52" width="16" height="11" rx="2.5" fill="#9CA3AF" stroke="#374151" strokeWidth="1" />

      {/* Corps du sac Oxford noir renforcé */}
      <g filter="url(#bagShadow)">
        <rect x="25" y="96" width="250" height="58" rx="18" fill="url(#bagGrad)" stroke="#4B5563" strokeWidth="1.2" />

        {/* Ligne zippée or/métal */}
        <line x1="40" y1="116" x2="260" y2="116" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" />
        <rect x="85" y="112" width="11" height="8" rx="2" fill="#D1D5DB" />
        <path d="M90.5 120 L90.5 130" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" />

        {/* Poignées de portage cousues */}
        <path d="M105 116 C105 84, 150 84, 150 116" stroke="#111827" strokeWidth="5.5" fill="none" />
        <path d="M150 116 C150 84, 195 84, 195 116" stroke="#111827" strokeWidth="5.5" fill="none" />
        {/* Poignée centrale rembourrée */}
        <rect x="135" y="84" width="30" height="13" rx="3" fill="#374151" stroke="#4B5563" strokeWidth="0.8" />

        {/* Porte-étiquette transparent */}
        <rect x="210" y="124" width="34" height="20" rx="3" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.3" />
        <rect x="216" y="130" width="22" height="2.5" rx="1.2" fill="white" opacity="0.6" />
        <rect x="216" y="135" width="15" height="2.5" rx="1.2" fill="white" opacity="0.4" />
      </g>

      {/* Badge éclatant "SAC MATELASSÉ INCLUS" */}
      <g transform="translate(150, 26)">
        <rect x="-95" y="-13" width="190" height="28" rx="14" fill="#F59E0B" />
        <text x="0" y="5" textAnchor="middle" fill="#78350F" fontSize="11" fontWeight="900" letterSpacing="0.4">
          🎒 HOUSSE MATELASSÉE INCLUSE
        </text>
      </g>
    </svg>
  )
}
