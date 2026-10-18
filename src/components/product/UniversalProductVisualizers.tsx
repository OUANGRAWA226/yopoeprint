'use client'

import React from 'react'

export interface VisualizerCommonProps {
  className?: string
  width?: number
  height?: number
  customVisualUrl?: string
  showHumanScale?: boolean
  materialFinish?: string
  formatLabel?: string
  showDimensionLines?: boolean
  dimensions?: { widthLabel?: string; heightLabel?: string }
  isFlipped?: boolean
  productName?: string
}

// ─── DÉTECTION DU TYPE DE PRODUIT ───────────────────────────────────────────
export type ProductArchetype =
  | 'rollup'
  | 'business_card'
  | 'flyer'
  | 'poster'
  | 'brochure'
  | 'textile'
  | 'tote_bag'
  | 'stickers'
  | 'banner'
  | 'generic'

export function detectProductArchetype(slug: string = '', category: string = ''): ProductArchetype {
  const s = slug.toLowerCase()
  const c = category.toLowerCase()

  if (s.includes('roll-up') || s.includes('kakemono') || s.includes('enrouleur') || c.includes('roll-up')) return 'rollup'
  if (s.includes('carte') || s.includes('visite') || s.includes('business-card') || c.includes('carte')) return 'business_card'
  if (s.includes('flyer') || s.includes('prospectus') || s.includes('tract') || c.includes('flyer')) return 'flyer'
  if (s.includes('affiche') || s.includes('poster') || c.includes('affiche')) return 'poster'
  if (s.includes('brochure') || s.includes('depliant') || s.includes('catalogue') || c.includes('brochure') || c.includes('depliant')) return 'brochure'
  if (s.includes('t-shirt') || s.includes('tshirt') || s.includes('polo') || s.includes('sweat') || c.includes('textile')) return 'textile'
  if (s.includes('tote-bag') || s.includes('totebag') || s.includes('sac') || c.includes('sac')) return 'tote_bag'
  if (s.includes('etiquette') || s.includes('sticker') || s.includes('adhesif') || c.includes('etiquette') || c.includes('sticker')) return 'stickers'
  if (s.includes('banderole') || s.includes('bache') || s.includes('banner') || c.includes('grand-format') || c.includes('bache')) return 'banner'

  return 'generic'
}

// ─── CONFIGURATION DES 3 VUES PAR ARCHÉTYPE ─────────────────────────────────
export interface ArchetypeViewConfig {
  label: string
  desc: string
}

export function getArchetypeViews(archetype: ProductArchetype): ArchetypeViewConfig[] {
  switch (archetype) {
    case 'business_card':
      return [
        { label: 'Recto (Face avant)', desc: 'Finitions or / vernis & coordonnées' },
        { label: 'Verso (Face arrière)', desc: 'Logo épuré, QR Code & contact' },
        { label: 'Boîte & Pile 250 ex.', desc: 'Tranche papier épais 350g & coffret' },
      ]
    case 'flyer':
      return [
        { label: 'Recto (Couverture)', desc: 'Visuel percutant & offre commerciale' },
        { label: 'Verso (Détails & Plan)', desc: 'Horaires, tarifs, QR code & contact' },
        { label: 'Prise en main', desc: 'Échelle 1:1 tenue en main' },
      ]
    case 'poster':
      return [
        { label: 'Affiche tendue', desc: 'Cotes d\'impression & haute définition' },
        { label: 'Mise en scène murale', desc: 'Cadre noir aluminium en intérieur design' },
        { label: 'Échelle humaine 1.75m', desc: 'Comparateur de taille en situation réelle' },
      ]
    case 'brochure':
      return [
        { label: 'Volet fermé (Couverture)', desc: 'Pli rainé haute précision' },
        { label: '3 Volets ouverts', desc: 'Intérieur panoramique complet' },
        { label: 'Vue 3D accordéon', desc: 'Dépliant semi-ouvert posé sur table' },
      ]
    case 'textile':
      return [
        { label: 'Face avant', desc: 'Coton 180g peigné & marquage poitrine/face' },
        { label: 'Dos', desc: 'Marquage supérieur nuque / dos' },
        { label: 'Col & Tissu HD', desc: 'Double surpiqûre & maille peignée' },
      ]
    case 'tote_bag':
      return [
        { label: 'Face avant', desc: 'Toile naturelle & sérigraphie centrale' },
        { label: 'Anses & Coutures en croix', desc: 'Points de renfort haute charge 15kg' },
        { label: 'Toile 100% Coton', desc: 'Fibre écologique certifiée' },
      ]
    case 'stickers':
      return [
        { label: 'Rouleau & Décollement', desc: 'Bobine industrielle & adhésif' },
        { label: 'Prise en main', desc: 'Échenillage & épaisseur liner' },
        { label: 'Protection & Vernis UV', desc: 'Résistant à l\'eau & intempéries' },
      ]
    case 'banner':
      return [
        { label: 'Bâche tendue avec œillets', desc: 'Ourlet thermosoudé & œillets laiton' },
        { label: 'Détail Œillet & Ourlet', desc: 'Gros plan renfort anti-arrachement' },
        { label: 'Pose sur barrière', desc: 'Mise en situation extérieure avec tendeurs' },
      ]
    case 'rollup':
      return [
        { label: 'Roll-up monté sur pieds', desc: 'Bâche tendue avec cotes architecturales' },
        { label: 'Structure alu brossé', desc: 'Boîtier carter & pieds pivotants 90°' },
        { label: 'Housse offerte incluse', desc: 'Sac de transport matelassé avec sangle' },
      ]
    default:
      return [
        { label: 'Présentation produit', desc: 'Rendu 3D avec cotes & visuel' },
        { label: 'Perspective isométrique', desc: 'Angles de vue & finitions matières' },
        { label: 'Contrôle PAO & Pack', desc: 'Certification 1200 DPI YopoePrint' },
      ]
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. CARTES DE VISITE (RECTO, VERSO, PILE 3D)
// ═════════════════════════════════════════════════════════════════════════════

export function BusinessCardVisualizer({
  viewIndex = 0,
  width = 320,
  height = 240,
  customVisualUrl,
  showHumanScale = false,
  materialFinish = 'mat',
  showDimensionLines = true,
  dimensions = { widthLabel: '85 mm', heightLabel: '55 mm' },
}: VisualizerCommonProps & { viewIndex: number }) {
  const isGold = materialFinish.includes('or') || materialFinish.includes('dore')
  const isGloss = materialFinish.includes('brillant') || materialFinish.includes('vernis')
  const isKraft = materialFinish.includes('kraft')

  // VIEW 0 : RECTO
  if (viewIndex === 0) {
    const cardW = 200
    const cardH = 125
    const cardX = (320 - cardW) / 2 + (showHumanScale ? 15 : 0)
    const cardY = (240 - cardH) / 2

    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="bcShadow" x="30" y="30" width="260" height="180" filterUnits="userSpaceOnUse">
            <feDropShadow dx="3" dy="8" stdDeviation="10" floodColor="#0F172A" floodOpacity="0.22" />
          </filter>
          <linearGradient id="goldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFBA5A" />
            <stop offset="25%" stopColor="#F9E8A2" />
            <stop offset="50%" stopColor="#B38B27" />
            <stop offset="75%" stopColor="#FBF0BD" />
            <stop offset="100%" stopColor="#8C6615" />
          </linearGradient>
          <clipPath id="bcClip">
            <rect x={cardX} y={cardY} width={cardW} height={cardH} rx="8" />
          </clipPath>
        </defs>

        {/* Comparateur échelle : Main stylisée tenant la carte */}
        {showHumanScale && (
          <g opacity="0.65" className="transition-opacity duration-300">
            <path
              d="M35 155 C35 120, 55 105, 75 105 C85 105, 95 110, 100 118 L100 150 C95 155, 80 165, 55 170 C40 172, 35 165, 35 155 Z"
              fill="#94A3B8"
            />
            <path d="M55 105 C60 90, 75 88, 88 95 L95 115" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
            <text x="62" y="80" textAnchor="middle" fill="#0284C7" fontSize="8" fontWeight="bold">Taille CB (85×55 mm)</text>
          </g>
        )}

        {/* Ombre au sol */}
        <ellipse cx={cardX + cardW / 2} cy={cardY + cardH + 15} rx={cardW * 0.45} ry="7" fill="rgba(15,23,42,0.14)" />

        {/* Carte principale */}
        <g filter="url(#bcShadow)">
          <rect
            x={cardX}
            y={cardY}
            width={cardW}
            height={cardH}
            rx="8"
            fill={isKraft ? '#D8B175' : '#0B192C'}
            stroke={isGold ? 'url(#goldFoil)' : 'rgba(255,255,255,0.1)'}
            strokeWidth={isGold ? 2 : 1}
          />

          {customVisualUrl ? (
            <g clipPath="url(#bcClip)">
              <image href={customVisualUrl} x={cardX} y={cardY} width={cardW} height={cardH} preserveAspectRatio="xMidYMid slice" />
              <rect x={cardX} y={cardY} width={cardW} height={cardH} fill="white" opacity="0.03" />
            </g>
          ) : (
            <g clipPath="url(#bcClip)">
              {/* Fond élégant géométrique */}
              <circle cx={cardX + cardW - 20} cy={cardY + 20} r="70" fill={isKraft ? '#C49A5A' : '#1E3E62'} opacity="0.25" />
              <circle cx={cardX + cardW - 20} cy={cardY + 20} r="45" fill={isKraft ? '#C49A5A' : '#1E3E62'} opacity="0.35" />

              {/* Ligne d'accent gold / bleu */}
              <rect x={cardX} y={cardY + 4} width="5" height={cardH - 8} rx="2" fill={isGold ? 'url(#goldFoil)' : '#38BDF8'} />

              {/* Logo entreprise */}
              <circle cx={cardX + 35} cy={cardY + 38} r="14" fill={isGold ? 'url(#goldFoil)' : 'white'} opacity={isGold ? 1 : 0.9} />
              <text x={cardX + 35} y={cardY + 43} textAnchor="middle" fontSize="13" fontWeight="900" fill="#0B192C">Y</text>

              {/* Raison sociale */}
              <text x={cardX + 58} y={cardY + 36} fontSize="12" fontWeight="800" fill={isGold ? 'url(#goldFoil)' : 'white'} letterSpacing="1">
                YOPOEPRINT
              </text>
              <text x={cardX + 58} y={cardY + 46} fontSize="7" fontWeight="500" fill={isKraft ? '#452E10' : '#94A3B8'} letterSpacing="0.5">
                IMPRIMERIE DIGITALE & PACKAGING
              </text>

              {/* Ligne séparatrice */}
              <line x1={cardX + 24} y1={cardY + 62} x2={cardX + cardW - 24} y2={cardY + 62} stroke={isKraft ? '#9C7A45' : '#334155'} strokeWidth="0.8" />

              {/* Nom & Titre */}
              <text x={cardX + 25} y={cardY + 80} fontSize="11" fontWeight="700" fill={isKraft ? '#2B1C08' : '#F8FAFC'}>
                David OUANGRAWA
              </text>
              <text x={cardX + 25} y={cardY + 91} fontSize="7.5" fontWeight="600" fill={isGold ? 'url(#goldFoil)' : '#38BDF8'}>
                Directeur Général & Fondateur
              </text>

              {/* Coordonnées */}
              <text x={cardX + 25} y={cardY + 104} fontSize="6.5" fill={isKraft ? '#4A3415' : '#94A3B8'}>
                📞 +226 70 00 00 00 · ✉ contact@yopoeprint.bf
              </text>
              <text x={cardX + 25} y={cardY + 114} fontSize="6.5" fill={isKraft ? '#4A3415' : '#94A3B8'}>
                📍 Ouagadougou, Zone Commerciale · www.yopoeprint.bf
              </text>
            </g>
          )}

          {/* Reflet brillant si vernis sélectif ou finition brillante */}
          {isGloss && (
            <path
              d={`M${cardX} ${cardY} L${cardX + 80} ${cardY} L${cardX} ${cardY + 80} Z`}
              fill="white"
              opacity="0.15"
            />
          )}
        </g>

        {/* Cotes architecturales */}
        {showDimensionLines && (
          <g>
            {/* Ligne du haut (85 mm) */}
            <line x1={cardX} y1={cardY - 12} x2={cardX + cardW} y2={cardY - 12} stroke="#059669" strokeWidth="1" />
            <line x1={cardX} y1={cardY - 16} x2={cardX} y2={cardY - 8} stroke="#059669" strokeWidth="1" />
            <line x1={cardX + cardW} y1={cardY - 16} x2={cardX + cardW} y2={cardY - 8} stroke="#059669" strokeWidth="1" />
            <rect x={cardX + cardW / 2 - 24} y={cardY - 21} width="48" height="14" rx="3" fill="#059669" />
            <text x={cardX + cardW / 2} y={cardY - 11} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
              {dimensions.widthLabel || '85 mm'}
            </text>

            {/* Ligne de droite (55 mm) */}
            <line x1={cardX + cardW + 12} y1={cardY} x2={cardX + cardW + 12} y2={cardY + cardH} stroke="#059669" strokeWidth="1" />
            <line x1={cardX + cardW + 8} y1={cardY} x2={cardX + cardW + 16} y2={cardY} stroke="#059669" strokeWidth="1" />
            <line x1={cardX + cardW + 8} y1={cardY + cardH} x2={cardX + cardW + 16} y2={cardY + cardH} stroke="#059669" strokeWidth="1" />
            <rect x={cardX + cardW + 5} y={cardY + cardH / 2 - 7} width="36" height="14" rx="3" fill="#059669" />
            <text x={cardX + cardW + 23} y={cardY + cardH / 2 + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
              {dimensions.heightLabel || '55 mm'}
            </text>
          </g>
        )}
      </svg>
    )
  }

  // VIEW 1 : VERSO (FACE ARRIÈRE AVEC GRAND LOGO & QR CODE VCARD)
  if (viewIndex === 1) {
    const cardW = 200
    const cardH = 125
    const cardX = (320 - cardW) / 2
    const cardY = (240 - cardH) / 2

    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="bcVersoShadow" x="30" y="30" width="260" height="180" filterUnits="userSpaceOnUse">
            <feDropShadow dx="3" dy="8" stdDeviation="10" floodColor="#0F172A" floodOpacity="0.22" />
          </filter>
          <linearGradient id="goldVerso" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFBA5A" />
            <stop offset="50%" stopColor="#B38B27" />
            <stop offset="100%" stopColor="#F9E8A2" />
          </linearGradient>
        </defs>

        <ellipse cx={cardX + cardW / 2} cy={cardY + cardH + 15} rx={cardW * 0.45} ry="7" fill="rgba(15,23,42,0.14)" />

        <g filter="url(#bcVersoShadow)">
          <rect
            x={cardX}
            y={cardY}
            width={cardW}
            height={cardH}
            rx="8"
            fill={isKraft ? '#CFA569' : '#07101E'}
            stroke={isGold ? 'url(#goldVerso)' : 'rgba(255,255,255,0.15)'}
            strokeWidth={isGold ? 2 : 1}
          />

          {/* Grand Monogramme central en relief */}
          <circle cx={cardX + 65} cy={cardY + cardH / 2} r="28" fill={isGold ? 'url(#goldVerso)' : 'white'} opacity={isGold ? 1 : 0.9} />
          <text x={cardX + 65} y={cardY + cardH / 2 + 10} textAnchor="middle" fontSize="28" fontWeight="900" fill="#0B192C">Y</text>

          {/* QR Code stylisé scannable vCard */}
          <g transform={`translate(${cardX + cardW - 65}, ${cardY + 28})`}>
            <rect x="0" y="0" width="48" height="48" rx="6" fill="white" />
            {/* Pattern QR simulé */}
            <rect x="5" y="5" width="14" height="14" fill="#0B192C" />
            <rect x="7" y="7" width="10" height="10" fill="white" />
            <rect x="9" y="9" width="6" height="6" fill="#0B192C" />

            <rect x="29" y="5" width="14" height="14" fill="#0B192C" />
            <rect x="31" y="7" width="10" height="10" fill="white" />
            <rect x="33" y="9" width="6" height="6" fill="#0B192C" />

            <rect x="5" y="29" width="14" height="14" fill="#0B192C" />
            <rect x="7" y="31" width="10" height="10" fill="white" />
            <rect x="9" y="33" width="6" height="6" fill="#0B192C" />

            {/* Pixels data */}
            <rect x="23" y="10" width="3" height="3" fill="#0B192C" />
            <rect x="23" y="16" width="3" height="3" fill="#0B192C" />
            <rect x="29" y="23" width="4" height="4" fill="#0B192C" />
            <rect x="37" y="27" width="5" height="5" fill="#0B192C" />
            <rect x="24" y="34" width="4" height="4" fill="#0B192C" />
            <rect x="35" y="36" width="6" height="6" fill="#0B192C" />
          </g>

          <text x={cardX + cardW - 41} y={cardY + 86} textAnchor="middle" fontSize="6" fontWeight="bold" fill={isKraft ? '#362208' : '#94A3B8'}>
            SCANNEZ LA VCARD
          </text>

          {/* Logo et slogan en bas */}
          <text x={cardX + 20} y={cardY + cardH - 14} fontSize="8" fontWeight="bold" fill={isGold ? 'url(#goldVerso)' : '#38BDF8'}>
            YOPOEPRINT.BF
          </text>
          <text x={cardX + cardW - 20} y={cardY + cardH - 14} textAnchor="end" fontSize="7" fill={isKraft ? '#4A3415' : '#64748B'}>
            Impression Quadri HD
          </text>
        </g>
      </svg>
    )
  }

  // VIEW 2 : BOÎTE & PILE DE 250 CARTES 3D
  const stackX = 90
  const stackY = 110
  return (
    <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="160" cy="195" rx="100" ry="12" fill="rgba(15,23,42,0.18)" />

      {/* Boîte distributrice ouverte à l'arrière */}
      <path d="M50 80 L130 50 L210 70 L130 100 Z" fill="#1E293B" />
      <path d="M50 80 L130 100 L130 160 L50 140 Z" fill="#0F172A" />
      <path d="M130 100 L210 70 L210 130 L130 160 Z" fill="#334155" />
      <text x="90" y="130" fill="white" fontSize="9" fontWeight="900" transform="rotate(14 90 130)">YOPOEPRINT 250 EX.</text>

      {/* Pile de cartes épaisses 350g */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i}>
          {/* Tranche de la carte */}
          <path
            d={`M${stackX} ${stackY - i * 4} L${stackX + 100} ${stackY - 25 - i * 4} L${stackX + 160} ${stackY - i * 4} L${stackX + 60} ${stackY + 25 - i * 4} Z`}
            fill={i === 7 ? (isKraft ? '#D8B175' : '#0B192C') : '#F1F5F9'}
            stroke="#CBD5E1"
            strokeWidth="0.5"
          />
        </g>
      ))}

      {/* Carte du dessus détaillée */}
      <circle cx={stackX + 80} cy={stackY - 33} r="10" fill={isGold ? '#E9B642' : 'white'} />
      <text x={stackX + 80} y={stackY - 30} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0B192C">Y</text>
      <text x={stackX + 80} y={stackY - 14} textAnchor="middle" fontSize="7" fontWeight="bold" fill={isGold ? '#E9B642' : 'white'}>
        Pelliculage 350g Pro
      </text>

      {/* Badge reassurance */}
      <rect x="200" y="30" width="100" height="28" rx="8" fill="#059669" />
      <text x="250" y="44" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">Boîte distributrice</text>
      <text x="250" y="54" textAnchor="middle" fill="#A7F3D0" fontSize="7">Offerte avec vos cartes</text>
    </svg>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. FLYERS & PROSPECTUS (RECTO, VERSO, PRISE EN MAIN 1:1)
// ═════════════════════════════════════════════════════════════════════════════

export function FlyerVisualizer({
  viewIndex = 0,
  width = 320,
  height = 240,
  customVisualUrl,
  showHumanScale = false,
  formatLabel = 'A5 (14.8×21 cm)',
  showDimensionLines = true,
  dimensions = { widthLabel: '14.8 cm', heightLabel: '21.0 cm' },
}: VisualizerCommonProps & { viewIndex: number }) {
  // VIEW 0 : RECTO (COUVERTURE OFFRE)
  if (viewIndex === 0) {
    const isA4 = formatLabel.includes('A4')
    const isA6 = formatLabel.includes('A6')
    const fw = isA4 ? 160 : isA6 ? 120 : 140
    const fh = isA4 ? 200 : isA6 ? 150 : 180
    const fx = (320 - fw) / 2 + (showHumanScale ? 25 : 0)
    const fy = (240 - fh) / 2

    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="flyerShadow" x="20" y="10" width="280" height="225" filterUnits="userSpaceOnUse">
            <feDropShadow dx="3" dy="8" stdDeviation="10" floodColor="#0F172A" floodOpacity="0.22" />
          </filter>
          <linearGradient id="flyerHeader" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B192C" />
            <stop offset="100%" stopColor="#1E3E62" />
          </linearGradient>
          <clipPath id="flyerClip">
            <rect x={fx} y={fy} width={fw} height={fh} rx="5" />
          </clipPath>
        </defs>

        {/* Échelle humaine : Silhouette adulte */}
        {showHumanScale && (
          <g opacity="0.75" className="transition-opacity duration-300">
            <ellipse cx="65" cy="204" rx="20" ry="4" fill="rgba(15,23,42,0.12)" />
            <circle cx="65" cy="56" r="10" fill="#475569" />
            <path d="M52 74 C52 68, 78 68, 78 74 L80 130 L74 202 L66 202 L66 144 L64 144 L64 202 L56 202 L56 130 Z" fill="#64748B" />
            <text x="65" y="40" textAnchor="middle" fill="#0284C7" fontSize="8" fontWeight="bold">1.75 m</text>
            <text x="65" y="115" textAnchor="middle" fill="#E2E8F0" fontSize="7">{formatLabel.split(' ')[0]}</text>
          </g>
        )}

        <ellipse cx={fx + fw / 2} cy={fy + fh + 12} rx={fw * 0.45} ry="6" fill="rgba(15,23,42,0.16)" />

        <g filter="url(#flyerShadow)">
          <rect x={fx} y={fy} width={fw} height={fh} rx="5" fill="white" stroke="#E2E8F0" strokeWidth="1" />

          {customVisualUrl ? (
            <g clipPath="url(#flyerClip)">
              <image href={customVisualUrl} x={fx} y={fy} width={fw} height={fh} preserveAspectRatio="xMidYMid slice" />
              <rect x={fx} y={fy} width={fw} height={fh} fill="black" opacity="0.04" />
            </g>
          ) : (
            <g clipPath="url(#flyerClip)">
              {/* En-tête flyer */}
              <rect x={fx} y={fy} width={fw} height={fh * 0.42} fill="url(#flyerHeader)" />
              <circle cx={fx + fw - 15} cy={fy + 15} r="35" fill="white" opacity="0.08" />

              <rect x={fx + 12} y={fy + 14} width="40" height="5" rx="2" fill="#38BDF8" />
              <text x={fx + 12} y={fy + 32} fill="white" fontSize="13" fontWeight="900">GRAND EVENT</text>
              <text x={fx + 12} y={fy + 44} fill="#FDE047" fontSize="8" fontWeight="bold">OFFRE PROMOTIONNELLE</text>

              {/* Ruban promo discount */}
              <rect x={fx + fw - 45} y={fy + 28} width="45" height="18" rx="4" fill="#EF4444" />
              <text x={fx + fw - 22} y={fy + 40} textAnchor="middle" fill="white" fontSize="9" fontWeight="900">-30%</text>

              {/* Corps du flyer */}
              <rect x={fx + 12} y={fy + fh * 0.46} width={fw - 24} height={fh * 0.24} rx="4" fill="#F1F5F9" />
              <text x={fx + 20} y={fy + fh * 0.54} fill="#0F172A" fontSize="8" fontWeight="bold">Lancement Officiel 2026</text>
              <text x={fx + 20} y={fy + fh * 0.62} fill="#64748B" fontSize="6.5">Découvrez nos solutions d\'impression</text>

              {/* 3 puces visuelles */}
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${fx + 12}, ${fy + fh * 0.74 + i * 11})`}>
                  <circle cx="4" cy="4" r="3" fill="#059669" />
                  <rect x="12" y="2" width={fw - 40} height="4" rx="2" fill="#94A3B8" opacity="0.6" />
                </g>
              ))}

              {/* Footer contact */}
              <rect x={fx} y={fy + fh - 18} width={fw} height="18" fill="#0B192C" />
              <text x={fx + fw / 2} y={fy + fh - 6} textAnchor="middle" fill="#38BDF8" fontSize="7" fontWeight="bold">
                Ouagadougou · www.yopoeprint.bf
              </text>
            </g>
          )}
        </g>

        {/* Lignes de cotes architecturales */}
        {showDimensionLines && (
          <g>
            <line x1={fx} y1={fy - 10} x2={fx + fw} y2={fy - 10} stroke="#059669" strokeWidth="1" />
            <line x1={fx} y1={fy - 14} x2={fx} y2={fy - 6} stroke="#059669" strokeWidth="1" />
            <line x1={fx + fw} y1={fy - 14} x2={fx + fw} y2={fy - 6} stroke="#059669" strokeWidth="1" />
            <rect x={fx + fw / 2 - 24} y={fy - 18} width="48" height="14" rx="3" fill="#059669" />
            <text x={fx + fw / 2} y={fy - 8} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
              {dimensions.widthLabel || '14.8 cm'}
            </text>

            <line x1={fx + fw + 10} y1={fy} x2={fx + fw + 10} y2={fy + fh} stroke="#059669" strokeWidth="1" />
            <line x1={fx + fw + 6} y1={fy} x2={fx + fw + 14} y2={fy} stroke="#059669" strokeWidth="1" />
            <line x1={fx + fw + 6} y1={fy + fh} x2={fx + fw + 14} y2={fy + fh} stroke="#059669" strokeWidth="1" />
            <rect x={fx + fw + 4} y={fy + fh / 2 - 7} width="38" height="14" rx="3" fill="#059669" />
            <text x={fx + fw + 23} y={fy + fh / 2 + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
              {dimensions.heightLabel || '21.0 cm'}
            </text>
          </g>
        )}
      </svg>
    )
  }

  // VIEW 1 : VERSO (PLAN, INFOS PRATIQUES & QR CODE)
  if (viewIndex === 1) {
    const fw = 140
    const fh = 180
    const fx = (320 - fw) / 2
    const fy = (240 - fh) / 2

    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="flyerVersoShadow" x="30" y="10" width="260" height="225" filterUnits="userSpaceOnUse">
            <feDropShadow dx="3" dy="8" stdDeviation="10" floodColor="#0F172A" floodOpacity="0.22" />
          </filter>
        </defs>

        <ellipse cx={fx + fw / 2} cy={fy + fh + 12} rx={fw * 0.45} ry="6" fill="rgba(15,23,42,0.16)" />

        <g filter="url(#flyerVersoShadow)">
          <rect x={fx} y={fy} width={fw} height={fh} rx="5" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />

          {/* En-tête Verso */}
          <rect x={fx} y={fy} width={fw} height="32" fill="#0B192C" rx="5 5 0 0" />
          <text x={fx + fw / 2} y={fy + 20} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
            INFOS PRATIQUES & PLAN
          </text>

          {/* Carte / Plan stylisé */}
          <g transform={`translate(${fx + 12}, ${fy + 40})`}>
            <rect x="0" y="0" width={fw - 24} height="52" rx="4" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
            {/* Rues */}
            <line x1="0" y1="26" x2={fw - 24} y2="26" stroke="white" strokeWidth="5" />
            <line x1="45" y1="0" x2="45" y2="52" stroke="white" strokeWidth="5" />
            {/* Pin de localisation */}
            <circle cx="45" cy="26" r="6" fill="#EF4444" />
            <circle cx="45" cy="26" r="2" fill="white" />
            <text x="56" y="30" fontSize="7" fontWeight="bold" fill="#0F172A">YopoePrint</text>
          </g>

          {/* QR Code de contact */}
          <g transform={`translate(${fx + 12}, ${fy + 102})`}>
            <rect x="0" y="0" width="42" height="42" rx="4" fill="white" stroke="#CBD5E1" strokeWidth="1" />
            <rect x="4" y="4" width="12" height="12" fill="#0F172A" />
            <rect x="26" y="4" width="12" height="12" fill="#0F172A" />
            <rect x="4" y="26" width="12" height="12" fill="#0F172A" />
            <rect x="20" y="20" width="6" height="6" fill="#0F172A" />
          </g>

          <text x={fx + 60} y={fy + 115} fontSize="8" fontWeight="bold" fill="#0F172A">Flashez pour réserver</text>
          <text x={fx + 60} y={fy + 126} fontSize="6.5" fill="#64748B">Accès immédiat au site web</text>
          <text x={fx + 60} y={fy + 138} fontSize="6.5" fill="#059669" fontWeight="bold">Ouvert Lun - Sam : 8h-18h</text>

          {/* Mentions légales */}
          <line x1={fx + 10} y1={fy + fh - 24} x2={fx + fw - 10} y2={fy + fh - 24} stroke="#E2E8F0" strokeWidth="1" />
          <text x={fx + fw / 2} y={fy + fh - 12} textAnchor="middle" fontSize="5.5" fill="#94A3B8">
            Ne pas jeter sur la voie publique · Imprimé au Burkina Faso
          </text>
        </g>
      </svg>
    )
  }

  // VIEW 2 : PRISE EN MAIN DU FLYER 1:1
  return (
    <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="handShadow" x="40" y="20" width="240" height="200" filterUnits="userSpaceOnUse">
          <feDropShadow dx="4" dy="10" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Main tenant le flyer en perspective */}
      <g filter="url(#handShadow)">
        {/* Flyer incliné */}
        <g transform="rotate(-6 160 120)">
          <rect x="90" y="35" width="135" height="175" rx="5" fill="white" stroke="#E2E8F0" strokeWidth="1" />
          <rect x="90" y="35" width="135" height="70" fill="#0B192C" rx="5 5 0 0" />
          <text x="157" y="70" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Papier Couché 250g</text>
          <text x="157" y="84" textAnchor="middle" fill="#38BDF8" fontSize="8">Tenue semi-rigide en main</text>

          {/* Corps factice */}
          <rect x="100" y="120" width="115" height="35" rx="3" fill="#F1F5F9" />
          <rect x="100" y="165" width="80" height="6" rx="3" fill="#94A3B8" opacity="0.6" />
          <rect x="100" y="177" width="100" height="6" rx="3" fill="#94A3B8" opacity="0.4" />
        </g>

        {/* Doigts de la main au premier plan */}
        <path
          d="M80 180 C80 160, 95 140, 115 145 C125 148, 128 158, 122 170 L115 195 L75 220 Z"
          fill="#475569"
        />
        <circle cx="118" cy="155" r="7" fill="#64748B" />
      </g>

      <rect x="180" y="190" width="120" height="26" rx="6" fill="#059669" />
      <text x="240" y="206" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">Prise en main naturelle</text>
    </svg>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. AFFICHES & POSTERS (TENDUE, CADRE MURAL, ÉCHELLE HUMAINE)
// ═════════════════════════════════════════════════════════════════════════════

export function PosterVisualizer({
  viewIndex = 0,
  width = 320,
  height = 240,
  customVisualUrl,
  showHumanScale = false,
  formatLabel = 'A3 (29.7×42 cm)',
  showDimensionLines = true,
  dimensions = { widthLabel: '29.7 cm', heightLabel: '42.0 cm' },
}: VisualizerCommonProps & { viewIndex: number }) {
  // VIEW 0 : AFFICHE TENDUE HD
  if (viewIndex === 0) {
    const pw = 135
    const ph = 190
    const px = (320 - pw) / 2 + (showHumanScale ? 25 : 0)
    const py = (240 - ph) / 2

    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="posterShadow" x="30" y="10" width="260" height="225" filterUnits="userSpaceOnUse">
            <feDropShadow dx="3" dy="8" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.25" />
          </filter>
          <linearGradient id="posterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3E62" />
            <stop offset="100%" stopColor="#0B192C" />
          </linearGradient>
          <clipPath id="posterClip">
            <rect x={px} y={py} width={pw} height={ph} rx="3" />
          </clipPath>
        </defs>

        {showHumanScale && (
          <g opacity="0.75" className="transition-opacity duration-300">
            <ellipse cx="65" cy="204" rx="20" ry="4" fill="rgba(15,23,42,0.12)" />
            <circle cx="65" cy="56" r="10" fill="#475569" />
            <path d="M52 74 C52 68, 78 68, 78 74 L80 130 L74 202 L66 202 L66 144 L64 144 L64 202 L56 202 L56 130 Z" fill="#64748B" />
            <text x="65" y="40" textAnchor="middle" fill="#0284C7" fontSize="8" fontWeight="bold">1.75 m</text>
          </g>
        )}

        <ellipse cx={px + pw / 2} cy={py + ph + 10} rx={pw * 0.45} ry="6" fill="rgba(15,23,42,0.16)" />

        <g filter="url(#posterShadow)">
          <rect x={px} y={py} width={pw} height={ph} rx="3" fill="white" stroke="#E2E8F0" strokeWidth="1" />

          {customVisualUrl ? (
            <g clipPath="url(#posterClip)">
              <image href={customVisualUrl} x={px} y={py} width={pw} height={ph} preserveAspectRatio="xMidYMid slice" />
              <rect x={px} y={py} width={pw} height={ph} fill="black" opacity="0.04" />
            </g>
          ) : (
            <g clipPath="url(#posterClip)">
              <rect x={px} y={py} width={pw} height={ph * 0.58} fill="url(#posterGrad)" />
              <circle cx={px + pw / 2} cy={py + 55} r="35" fill="white" opacity="0.12" />
              <text x={px + pw / 2} y={py + 62} textAnchor="middle" fontSize="30">🎨</text>

              <rect x={px + 12} y={py + ph * 0.64} width={pw - 24} height="7" rx="3.5" fill="#0B192C" />
              <rect x={px + 12} y={py + ph * 0.72} width={pw - 45} height="4" rx="2" fill="#64748B" />
              <rect x={px + 12} y={py + ph * 0.77} width={pw - 30} height="4" rx="2" fill="#94A3B8" opacity="0.6" />

              <rect x={px + 12} y={py + ph - 24} width={pw - 24} height="14" rx="4" fill="#059669" />
              <text x={px + pw / 2} y={py + ph - 14} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">
                Impression Grand Format 1200 DPI
              </text>
            </g>
          )}
        </g>

        {showDimensionLines && (
          <g>
            <line x1={px} y1={py - 10} x2={px + pw} y2={py - 10} stroke="#059669" strokeWidth="1" />
            <line x1={px} y1={py - 14} x2={px} y2={py - 6} stroke="#059669" strokeWidth="1" />
            <line x1={px + pw} y1={py - 14} x2={px + pw} y2={py - 6} stroke="#059669" strokeWidth="1" />
            <rect x={px + pw / 2 - 24} y={py - 18} width="48" height="14" rx="3" fill="#059669" />
            <text x={px + pw / 2} y={py - 8} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
              {dimensions.widthLabel || '29.7 cm'}
            </text>

            <line x1={px + pw + 10} y1={py} x2={px + pw + 10} y2={py + ph} stroke="#059669" strokeWidth="1" />
            <line x1={px + pw + 6} y1={py} x2={px + pw + 14} y2={py} stroke="#059669" strokeWidth="1" />
            <line x1={px + pw + 6} y1={py + ph} x2={px + pw + 14} y2={py + ph} stroke="#059669" strokeWidth="1" />
            <rect x={px + pw + 4} y={py + ph / 2 - 7} width="38" height="14" rx="3" fill="#059669" />
            <text x={px + pw + 23} y={py + ph / 2 + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
              {dimensions.heightLabel || '42.0 cm'}
            </text>
          </g>
        )}
      </svg>
    )
  }

  // VIEW 1 : MISE EN SITUATION DANS UN CADRE MURAL DESIGN
  if (viewIndex === 1) {
    const frameW = 120
    const frameH = 165
    const fx = (320 - frameW) / 2
    const fy = 25

    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Mur d'exposition avec spot zénithal */}
        <rect x="0" y="0" width="320" height="240" fill="#F8FAFC" />
        <ellipse cx="160" cy="15" rx="110" ry="35" fill="rgba(254,240,138,0.25)" />

        {/* Cordelette de suspension */}
        <line x1="160" y1="12" x2={fx + 20} y2={fy} stroke="#64748B" strokeWidth="1.2" />
        <line x1="160" y1="12" x2={fx + frameW - 20} y2={fy} stroke="#64748B" strokeWidth="1.2" />
        <circle cx="160" cy="12" r="3" fill="#0F172A" />

        {/* Cadre en aluminium noir avec passe-partout blanc */}
        <rect x={fx} y={fy} width={frameW} height={frameH} rx="3" fill="#0F172A" />
        {/* Passe-partout blanc */}
        <rect x={fx + 8} y={fy + 8} width={frameW - 16} height={frameH - 16} rx="2" fill="white" />
        {/* Affiche intérieure */}
        <rect x={fx + 18} y={fy + 18} width={frameW - 36} height={frameH - 36} rx="1" fill="#1E3E62" />

        {customVisualUrl ? (
          <image href={customVisualUrl} x={fx + 18} y={fy + 18} width={frameW - 36} height={frameH - 36} preserveAspectRatio="xMidYMid slice" />
        ) : (
          <text x={fx + frameW / 2} y={fy + frameH / 2} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
            ART WORK
          </text>
        )}

        {/* Reflet de vitre diagonale */}
        <path d={`M${fx + 8} ${fy + 8} L${fx + 65} ${fy + 8} L${fx + 8} ${fy + 65} Z`} fill="white" opacity="0.25" />

        {/* Console / Meuble bas de décoration */}
        <rect x="40" y="205" width="240" height="12" fill="#E2E8F0" rx="2" />
        {/* Petite plante sur le meuble */}
        <rect x="75" y="195" width="16" height="10" rx="2" fill="#CBD5E1" />
        <circle cx="83" cy="190" r="7" fill="#10B981" />
      </svg>
    )
  }

  // VIEW 2 : COMPARATEUR ÉCHELLE HUMAINE EN GRAND
  return (
    <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sol */}
      <line x1="20" y1="210" x2="300" y2="210" stroke="#CBD5E1" strokeWidth="1.5" />

      {/* Silhouette humaine 1.75m */}
      <g>
        <ellipse cx="100" cy="210" rx="18" ry="4" fill="rgba(15,23,42,0.12)" />
        <circle cx="100" cy="65" r="11" fill="#475569" />
        <path d="M85 86 C85 80, 115 80, 115 86 L118 145 L110 210 L102 210 L102 150 L98 150 L98 210 L90 210 L90 145 Z" fill="#64748B" />
        <line x1="65" y1="54" x2="65" y2="210" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
        <rect x="52" y="125" width="28" height="14" rx="3" fill="#0F172A" />
        <text x="66" y="135" textAnchor="middle" fill="#38BDF8" fontSize="8" fontWeight="bold">1.75 m</text>
      </g>

      {/* Affiche fixée au mur à hauteur des yeux */}
      <g>
        <rect x="160" y="75" width="95" height="135" rx="3" fill="white" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="165" y="80" width="85" height="125" fill="#1E3E62" />
        {customVisualUrl && (
          <image href={customVisualUrl} x="165" y="80" width="85" height="125" preserveAspectRatio="xMidYMid slice" />
        )}
        <text x="207" y="145" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{formatLabel.split(' ')[0]}</text>
        <rect x="175" y="55" width="65" height="15" rx="3" fill="#059669" />
        <text x="207" y="65" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">Hauteur des yeux</text>
      </g>
    </svg>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. BROCHURES & DÉPLIANTS (FERMÉ, DÉPLIÉ 3 VOLETS, ACCORDÉON 3D)
// ═════════════════════════════════════════════════════════════════════════════

export function BrochureVisualizer({
  viewIndex = 0,
  width = 320,
  height = 240,
  customVisualUrl,
  dimensions = { widthLabel: '29.7 cm', heightLabel: '21.0 cm' },
}: VisualizerCommonProps & { viewIndex: number }) {
  // VIEW 0 : VOLET FERMÉ
  if (viewIndex === 0) {
    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="160" cy="205" rx="60" ry="7" fill="rgba(15,23,42,0.18)" />
        {/* Pli inférieur */}
        <rect x="115" y="30" width="90" height="165" rx="3" fill="#0B192C" stroke="#CBD5E1" strokeWidth="1" />
        {/* Rainage élégant sur l'arête gauche */}
        <line x1="117" y1="30" x2="117" y2="195" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <circle cx="160" cy="75" r="22" fill="#1E3E62" />
        <text x="160" y="82" textAnchor="middle" fontSize="18">📖</text>
        <text x="160" y="125" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Brochure Entreprise</text>
        <text x="160" y="138" textAnchor="middle" fill="#38BDF8" fontSize="7.5">3 Volets Roulés Pro</text>
        <rect x="130" y="160" width="60" height="14" rx="4" fill="#059669" />
        <text x="160" y="170" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">Fermé (10×21 cm)</text>
      </svg>
    )
  }

  // VIEW 1 : 3 VOLETS OUVERTS PANORAMIQUE
  if (viewIndex === 1) {
    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="160" cy="195" rx="120" ry="8" fill="rgba(15,23,42,0.14)" />
        {/* Volet Gauche */}
        <rect x="35" y="45" width="80" height="140" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        <rect x="42" y="55" width="66" height="30" rx="3" fill="#E2E8F0" />
        <rect x="42" y="95" width="66" height="5" rx="2.5" fill="#0F172A" />
        <rect x="42" y="105" width="55" height="4" rx="2" fill="#94A3B8" />

        {/* Volet Central */}
        <rect x="120" y="45" width="80" height="140" fill="white" stroke="#E2E8F0" strokeWidth="1" />
        <rect x="128" y="55" width="64" height="60" rx="3" fill="#0B192C" />
        <text x="160" y="90" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">Présentation</text>
        <rect x="128" y="125" width="64" height="4" rx="2" fill="#94A3B8" />
        <rect x="128" y="133" width="50" height="4" rx="2" fill="#94A3B8" />

        {/* Volet Droit */}
        <rect x="205" y="45" width="80" height="140" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        <rect x="213" y="55" width="64" height="40" rx="3" fill="#38BDF8" opacity="0.2" />
        <text x="245" y="80" textAnchor="middle" fill="#0284C7" fontSize="8" fontWeight="bold">Tarifs</text>
        <rect x="213" y="105" width="64" height="5" rx="2.5" fill="#059669" />

        {/* Rainages entre volets */}
        <line x1="117" y1="45" x2="117" y2="185" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="202" y1="45" x2="202" y2="185" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />

        <text x="160" y="32" textAnchor="middle" fill="#0F172A" fontSize="9" fontWeight="bold">
          Déplié complet : A4 Ouvert ({dimensions.widthLabel || '29.7 cm'})
        </text>
      </svg>
    )
  }

  // VIEW 2 : VUE 3D ACCORDÉON
  return (
    <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="160" cy="205" rx="100" ry="10" fill="rgba(15,23,42,0.18)" />
      {/* 3 panneaux en perspective Z */}
      <path d="M40 50 L110 35 L110 185 L40 195 Z" fill="#1E3E62" />
      <path d="M110 35 L190 60 L190 205 L110 185 Z" fill="#0B192C" />
      <path d="M190 60 L280 40 L280 185 L190 205 Z" fill="#334155" />
      <text x="150" y="125" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" transform="rotate(14 150 125)">
        3 Volets 3D
      </text>
      <rect x="180" y="210" width="110" height="20" rx="4" fill="#059669" />
      <text x="235" y="223" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">Rainage sans pliure blanche</text>
    </svg>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. TEXTILE & T-SHIRTS (FACE, DOS, ZOOM TISSU)
// ═════════════════════════════════════════════════════════════════════════════

export function TextileVisualizer({
  viewIndex = 0,
  width = 320,
  height = 240,
  customVisualUrl,
}: VisualizerCommonProps & { viewIndex: number }) {
  // VIEW 0 : FACE AVANT
  if (viewIndex === 0) {
    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="160" cy="215" rx="75" ry="8" fill="rgba(15,23,42,0.14)" />
        {/* Silhouette T-shirt pro */}
        <path
          d="M105 40 L135 48 C145 58, 175 58, 185 48 L215 40 L250 85 L225 105 L205 85 L205 200 L115 200 L115 85 L95 105 L70 85 Z"
          fill="#1E293B"
          stroke="#0F172A"
          strokeWidth="1.5"
        />
        {/* Col rond double surpiqûre */}
        <path d="M135 48 C145 68, 175 68, 185 48" stroke="#334155" strokeWidth="2.5" fill="none" />

        {/* Zone de marquage poitrine / central */}
        <rect x="135" y="95" width="50" height="50" rx="4" fill="white" opacity="0.08" stroke="rgba(255,255,255,0.2)" strokeDasharray="2 2" />

        {customVisualUrl ? (
          <image href={customVisualUrl} x="137" y="97" width="46" height="46" preserveAspectRatio="xMidYMid contain" />
        ) : (
          <g>
            <circle cx="160" cy="115" r="14" fill="#38BDF8" opacity="0.8" />
            <text x="160" y="119" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Y</text>
            <text x="160" y="137" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">Sérigraphie HD</text>
          </g>
        )}

        <text x="160" y="225" textAnchor="middle" fill="#64748B" fontSize="8" fontWeight="bold">100% Coton Peigné 180g</text>
      </svg>
    )
  }

  // VIEW 1 : DOS
  if (viewIndex === 1) {
    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="160" cy="215" rx="75" ry="8" fill="rgba(15,23,42,0.14)" />
        <path
          d="M105 40 L135 45 C150 48, 170 48, 185 45 L215 40 L250 85 L225 105 L205 85 L205 200 L115 200 L115 85 L95 105 L70 85 Z"
          fill="#1E293B"
          stroke="#0F172A"
          strokeWidth="1.5"
        />
        {/* Col arrière */}
        <path d="M135 45 C150 50, 170 50, 185 45" stroke="#334155" strokeWidth="2.5" fill="none" />

        {/* Marquage supérieur dos / nuque */}
        <rect x="145" y="65" width="30" height="15" rx="2" fill="white" opacity="0.1" />
        <text x="160" y="75" textAnchor="middle" fill="#38BDF8" fontSize="6" fontWeight="bold">YOPOEPRINT</text>

        {/* Grand marquage dorsal */}
        <rect x="130" y="100" width="60" height="50" rx="4" fill="white" opacity="0.05" stroke="rgba(255,255,255,0.15)" strokeDasharray="2 2" />
        <text x="160" y="128" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">GRAND DOS</text>
      </svg>
    )
  }

  // VIEW 2 : DETAIL TEXTURE & MAILLE COTON
  return (
    <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="240" height="180" rx="12" fill="#1E293B" stroke="#334155" strokeWidth="2" />
      {/* Pattern de tricotage coton peigné */}
      {[0, 1, 2, 3, 4, 5, 6].map((row) => (
        <path
          key={row}
          d={`M60 ${40 + row * 22} Q80 ${35 + row * 22} 100 ${40 + row * 22} T140 ${40 + row * 22} T180 ${40 + row * 22} T220 ${40 + row * 22} T260 ${40 + row * 22}`}
          stroke="#334155"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />
      ))}
      <circle cx="160" cy="110" r="40" fill="#0F172A" opacity="0.8" stroke="#38BDF8" strokeWidth="2" />
      <text x="160" y="105" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Coton 180g</text>
      <text x="160" y="120" textAnchor="middle" fill="#A7F3D0" fontSize="8">Toucher ultra doux</text>
    </svg>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 6. ÉTIQUETTES & STICKERS EN ROULEAU (BOBINE, DÉCOLLEMENT, VERRE ÉTANCHE)
// ═════════════════════════════════════════════════════════════════════════════

export function StickerVisualizer({
  viewIndex = 0,
  width = 320,
  height = 240,
  customVisualUrl,
}: VisualizerCommonProps & { viewIndex: number }) {
  if (viewIndex === 0) {
    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="160" cy="205" rx="80" ry="8" fill="rgba(15,23,42,0.14)" />
        {/* Rouleau de stickers */}
        <ellipse cx="160" cy="140" rx="70" ry="25" fill="#E2E8F0" />
        <rect x="90" y="60" width="140" height="80" fill="#F8FAFC" />
        <ellipse cx="160" cy="60" rx="70" ry="25" fill="white" stroke="#CBD5E1" strokeWidth="1" />
        <ellipse cx="160" cy="60" rx="25" ry="10" fill="#64748B" />

        {/* Étiquette se détachant en 3D */}
        <g transform="rotate(-8 130 90)">
          <rect x="90" y="35" width="85" height="50" rx="8" fill="#0B192C" stroke="#38BDF8" strokeWidth="1.5" />
          {customVisualUrl ? (
            <image href={customVisualUrl} x="92" y="37" width="81" height="46" preserveAspectRatio="xMidYMid contain" />
          ) : (
            <g>
              <circle cx="115" cy="60" r="12" fill="#FDE047" />
              <text x="115" y="64" textAnchor="middle" fontSize="12">🏷</text>
              <text x="145" y="58" fill="white" fontSize="8" fontWeight="bold">BIO ORGANIC</text>
              <text x="145" y="68" fill="#94A3B8" fontSize="6">Adhésif puissant</text>
            </g>
          )}
        </g>
        <text x="160" y="225" textAnchor="middle" fill="#059669" fontSize="8" fontWeight="bold">Découpe mi-chair précise</text>
      </svg>
    )
  }

  // VIEW 1 : DÉCOLLEMENT ADHÉSIF
  if (viewIndex === 1) {
    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Support glassine */}
        <rect x="60" y="50" width="200" height="140" rx="8" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />
        <text x="80" y="70" fill="#92400E" fontSize="8" fontWeight="bold">Liner protecteur siliconé</text>

        {/* Sticker à moitié décollé montrant la colle */}
        <path d="M100 150 L180 150 L220 90 L140 90 Z" fill="#0B192C" />
        {/* Effet colle adhésive transparente */}
        <path d="M140 90 L180 150 L160 150 L120 90 Z" fill="white" opacity="0.3" />
        <text x="160" y="125" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">Colle Permanente Ultra-Fix</text>
      </svg>
    )
  }

  // VIEW 2 : RÉSISTANCE À L'EAU & VERMIS UV
  return (
    <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="60" y="40" width="200" height="150" rx="10" fill="#0284C7" />
      <text x="160" y="85" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">100% WATERPROOF</text>
      <text x="160" y="105" textAnchor="middle" fill="#E0F2FE" fontSize="9">Vernis protecteur brillant anti-rayures</text>

      {/* Gouttes d'eau réalistes */}
      <circle cx="110" cy="140" r="10" fill="rgba(255,255,255,0.4)" stroke="white" strokeWidth="1" />
      <circle cx="180" cy="150" r="14" fill="rgba(255,255,255,0.4)" stroke="white" strokeWidth="1" />
      <circle cx="220" cy="130" r="8" fill="rgba(255,255,255,0.4)" stroke="white" strokeWidth="1" />
    </svg>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 7. BANDEROLES & BÂCHES PVC (TENDUE, OEILLET LAITON, EXTÉRIEUR)
// ═════════════════════════════════════════════════════════════════════════════

export function BannerVisualizer({
  viewIndex = 0,
  width = 320,
  height = 240,
  customVisualUrl,
  dimensions = { widthLabel: '300 cm', heightLabel: '100 cm' },
}: VisualizerCommonProps & { viewIndex: number }) {
  if (viewIndex === 0) {
    const bw = 240
    const bh = 110
    const bx = (320 - bw) / 2
    const by = (240 - bh) / 2

    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x={bx} y={by} width={bw} height={bh} rx="4" fill="#0B192C" stroke="#38BDF8" strokeWidth="1.5" />
        {/* Ourlet périmétrique renforcé */}
        <rect x={bx + 6} y={by + 6} width={bw - 12} height={bh - 12} fill="none" stroke="#64748B" strokeDasharray="3 3" />

        {/* 6 œillets laiton */}
        {[
          [bx + 12, by + 12],
          [bx + bw / 2, by + 12],
          [bx + bw - 12, by + 12],
          [bx + 12, by + bh - 12],
          [bx + bw / 2, by + bh - 12],
          [bx + bw - 12, by + bh - 12],
        ].map(([ox, oy], i) => (
          <g key={i}>
            <circle cx={ox} cy={oy} r="5" fill="#EAB308" stroke="#713F12" strokeWidth="1" />
            <circle cx={ox} cy={oy} r="2.5" fill="#020617" />
          </g>
        ))}

        {customVisualUrl ? (
          <image href={customVisualUrl} x={bx + 15} y={by + 15} width={bw - 30} height={bh - 30} preserveAspectRatio="xMidYMid slice" />
        ) : (
          <g>
            <text x={bx + bw / 2} y={by + 52} textAnchor="middle" fill="white" fontSize="14" fontWeight="900" letterSpacing="1">
              BANDEROLE ÉVÉNEMENTIELLE
            </text>
            <text x={bx + bw / 2} y={by + 72} textAnchor="middle" fill="#FDE047" fontSize="9" fontWeight="bold">
              Bâche PVC 510g M1 Anti-Feu · Résistance Vent Extérieur
            </text>
          </g>
        )}

        <text x="160" y="210" textAnchor="middle" fill="#059669" fontSize="8" fontWeight="bold">
          Dimensions : {dimensions.widthLabel || '3.00 m'} × {dimensions.heightLabel || '1.00 m'}
        </text>
      </svg>
    )
  }

  // VIEW 1 : ZOOM OEILLET LAITON
  if (viewIndex === 1) {
    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="40" y="30" width="240" height="170" rx="8" fill="#1E293B" />
        {/* Ourlet thermosoudé épais */}
        <line x1="120" y1="30" x2="120" y2="200" stroke="#38BDF8" strokeWidth="3" strokeDasharray="5 5" />
        {/* Gros œillet laiton massif */}
        <circle cx="80" cy="115" r="30" fill="#EAB308" stroke="#854D0E" strokeWidth="3" />
        <circle cx="80" cy="115" r="16" fill="#0F172A" />
        <text x="180" y="105" fill="white" fontSize="12" fontWeight="bold">Œillet Laiton Nickelé</text>
        <text x="180" y="125" fill="#94A3B8" fontSize="8.5">Antirouille résistant 80 kg</text>
      </svg>
    )
  }

  // VIEW 2 : FIXATION SUR GRILLE EXTÉRIEURE
  return (
    <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Grille barrière de sécurité */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={i} x1={30 + i * 38} y1="20" x2={30 + i * 38} y2="220" stroke="#94A3B8" strokeWidth="3" />
      ))}
      <rect x="50" y="60" width="220" height="110" rx="3" fill="#0B192C" stroke="#38BDF8" strokeWidth="2" />
      <text x="160" y="120" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Tendeurs élastiques inclus</text>
    </svg>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 8. TOTE BAG EN COTON (FACE, ANSES & COUTURES EN CROIX, FIBRE)
// ═════════════════════════════════════════════════════════════════════════════

export function ToteBagVisualizer({
  viewIndex = 0,
  width = 320,
  height = 240,
  customVisualUrl,
}: VisualizerCommonProps & { viewIndex: number }) {
  if (viewIndex === 0) {
    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="160" cy="220" rx="60" ry="6" fill="rgba(15,23,42,0.14)" />
        {/* Anses */}
        <path d="M125 90 C125 15, 150 10, 150 10 C150 10, 175 15, 175 90" stroke="#D1D5DB" strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M125 90 C125 15, 150 10, 150 10 C150 10, 175 15, 175 90" stroke="#F3F4F6" strokeWidth="7" strokeLinecap="round" fill="none" />

        {/* Corps du tote bag */}
        <path d="M105 85 L215 85 L205 210 L115 210 Z" fill="#FDFBF7" stroke="#E5E7EB" strokeWidth="1.5" />

        {/* Marquage */}
        <rect x="130" y="115" width="60" height="60" rx="4" fill="#0B192C" />
        {customVisualUrl ? (
          <image href={customVisualUrl} x="130" y="115" width="60" height="60" preserveAspectRatio="xMidYMid contain" />
        ) : (
          <g>
            <circle cx="160" cy="140" r="14" fill="#EAB308" />
            <text x="160" y="145" textAnchor="middle" fill="#0B192C" fontSize="12" fontWeight="bold">Y</text>
            <text x="160" y="165" textAnchor="middle" fill="white" fontSize="6.5" fontWeight="bold">ECO BAG</text>
          </g>
        )}
        <text x="160" y="232" textAnchor="middle" fill="#64748B" fontSize="8" fontWeight="bold">Toile 100% Coton Naturel 140g</text>
      </svg>
    )
  }

  // VIEW 1 : COUTURES EN CROIX RENFORCÉES
  if (viewIndex === 1) {
    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="50" y="30" width="220" height="170" rx="8" fill="#FDFBF7" stroke="#E5E7EB" strokeWidth="2" />
        {/* Anse fixée */}
        <rect x="130" y="10" width="60" height="110" fill="#E5E7EB" />
        {/* Point en croix renforcé */}
        <rect x="135" y="60" width="50" height="50" fill="none" stroke="#DC2626" strokeWidth="2" />
        <line x1="135" y1="60" x2="185" y2="110" stroke="#DC2626" strokeWidth="2" />
        <line x1="185" y1="60" x2="135" y2="110" stroke="#DC2626" strokeWidth="2" />
        <text x="160" y="145" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="bold">Couture en croix haute résistance</text>
        <text x="160" y="165" textAnchor="middle" fill="#059669" fontSize="8.5">Supporte jusqu\'à 15 kg sans déchirure</text>
      </svg>
    )
  }

  // VIEW 2 : TOILE NATURELLE
  return (
    <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="240" height="170" rx="10" fill="#FBF7EE" stroke="#E2D9C8" strokeWidth="2" />
      <circle cx="160" cy="115" r="45" fill="#E8DEC8" opacity="0.6" />
      <text x="160" y="105" textAnchor="middle" fill="#451A03" fontSize="12" fontWeight="bold">Fibre Végétale</text>
      <text x="160" y="122" textAnchor="middle" fill="#78350F" fontSize="8">100% Coton Non Blanchi</text>
      <text x="160" y="136" textAnchor="middle" fill="#059669" fontSize="7.5" fontWeight="bold">Certifié OEKO-TEX Standard 100</text>
    </svg>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 9. FALLBACK UNIVERSEL INTELLIGENT (POUR TOUT FUTUR PRODUIT AJOUTÉ)
// ═════════════════════════════════════════════════════════════════════════════

export function GenericUniversalVisualizer({
  viewIndex = 0,
  width = 320,
  height = 240,
  productName = 'Produit Imprimé YopoePrint',
  customVisualUrl,
  dimensions = { widthLabel: 'Standard', heightLabel: 'HD' },
}: VisualizerCommonProps & { viewIndex: number }) {
  if (viewIndex === 0) {
    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="160" cy="205" rx="90" ry="10" fill="rgba(15,23,42,0.15)" />
        {/* Mockup tablette/affiche universelle */}
        <rect x="80" y="35" width="160" height="160" rx="12" fill="#0B192C" stroke="#38BDF8" strokeWidth="1.5" />
        <rect x="90" y="45" width="140" height="140" rx="8" fill="#1E293B" />

        {customVisualUrl ? (
          <image href={customVisualUrl} x="90" y="45" width="140" height="140" preserveAspectRatio="xMidYMid contain" />
        ) : (
          <g>
            <circle cx="160" cy="95" r="28" fill="#0284C7" />
            <text x="160" y="103" textAnchor="middle" fontSize="24">🖨️</text>
            <text x="160" y="140" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
              {productName.slice(0, 24)}
            </text>
            <text x="160" y="155" textAnchor="middle" fill="#38BDF8" fontSize="7.5">
              Impression Quadri HD 1200 DPI
            </text>
          </g>
        )}
      </svg>
    )
  }

  // VIEW 1 : PERSPECTIVE ISOMÉTRIQUE
  if (viewIndex === 1) {
    return (
      <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="160" cy="195" rx="80" ry="10" fill="rgba(15,23,42,0.15)" />
        <path d="M90 70 L160 40 L230 70 L160 100 Z" fill="#38BDF8" />
        <path d="M90 70 L160 100 L160 170 L90 140 Z" fill="#0B192C" />
        <path d="M160 100 L230 70 L230 140 L160 170 Z" fill="#1E293B" />
        <text x="160" y="140" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">Vue Isométrique 3D</text>
      </svg>
    )
  }

  // VIEW 2 : PACKAGING & CONTRÔLE PAO
  return (
    <svg width={width} height={height} viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="60" y="40" width="200" height="150" rx="10" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
      <circle cx="160" cy="95" r="28" fill="#059669" />
      <text x="160" y="103" textAnchor="middle" fill="white" fontSize="24">✓</text>
      <text x="160" y="140" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="bold">Bon À Tirer (BAT) Certifié</text>
      <text x="160" y="155" textAnchor="middle" fill="#64748B" fontSize="8">Contrôle chromatique & résolutions vérifiés</text>
    </svg>
  )
}
