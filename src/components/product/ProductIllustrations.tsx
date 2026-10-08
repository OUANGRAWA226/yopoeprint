// Illustrations SVG réalistes pour chaque produit YopoePrint
// Utilisé dans les pages produit, catalogue et cards

interface IllustrationProps {
 className?: string
 width?: number
 height?: number
}

// ─── FLYER A5 ─────────────────────────────────────────────────
export function FlyerIllustration({ className = '', width = 280, height = 200 }: IllustrationProps) {
 return (
 <svg width={width} height={height} viewBox="0 0 280 200" fill="none"
 xmlns="http://www.w3.org/2000/svg" className={className}>
 {/* Ombre */}
 <ellipse cx="140" cy="188" rx="80" ry="8" fill="rgba(0,0,0,0.08)" />
 {/* Flyer arrière */}
 <rect x="70" y="20" width="130" height="160" rx="4" fill="#E2C46E"
 transform="rotate(-6 70 20)" />
 {/* Flyer principal */}
 <rect x="60" y="15" width="130" height="160" rx="4" fill="white"
 filter="url(#shadow1)" />
 <rect x="60" y="15" width="130" height="160" rx="4"
 fill="url(#flyerGrad)" />
 {/* Header coloré */}
 <rect x="60" y="15" width="130" height="50" rx="4" fill="#1A3A6B" />
 <rect x="60" y="45" width="130" height="20" fill="#1A3A6B" />
 {/* Logo simulé */}
 <rect x="75" y="28" width="40" height="6" rx="3" fill="white" opacity="0.9" />
 <rect x="75" y="38" width="25" height="4" rx="2" fill="#C9A84C" opacity="0.9" />
 {/* Image zone */}
 <rect x="68" y="72" width="114" height="55" rx="3"
 fill="url(#imgGrad)" opacity="0.3" />
 <rect x="68" y="72" width="114" height="55" rx="3"
 fill="none" stroke="#E2E8F0" strokeWidth="1" />
 {/* Icône image */}
 <rect x="116" y="89" width="20" height="20" rx="10" fill="#E8EEF8" />
 <text x="126" y="103" textAnchor="middle" fontSize="12" fill="#8A8FA8">🖼</text>
 {/* Lignes de texte */}
 <rect x="68" y="136" width="80" height="6" rx="3" fill="#1A3A6B" opacity="0.8" />
 <rect x="68" y="147" width="114" height="4" rx="2" fill="#8A8FA8" opacity="0.5" />
 <rect x="68" y="155" width="90" height="4" rx="2" fill="#8A8FA8" opacity="0.4" />
 <rect x="68" y="163" width="50" height="8" rx="4" fill="#C9A84C" />
 <defs>
 <linearGradient id="flyerGrad" x1="60" y1="15" x2="190" y2="175">
 <stop offset="0%" stopColor="#F7F8FA" />
 <stop offset="100%" stopColor="#FFFFFF" />
 </linearGradient>
 <linearGradient id="imgGrad" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0%" stopColor="#2A5298" />
 <stop offset="100%" stopColor="#1A3A6B" />
 </linearGradient>
 <filter id="shadow1" x="-10%" y="-10%" width="120%" height="120%">
 <feDropShadow dx="2" dy="4" stdDeviation="6" floodOpacity="0.12" />
 </filter>
 </defs>
 </svg>
 )
}

// ─── CARTE DE VISITE ──────────────────────────────────────────
export function BusinessCardIllustration({ className = '', width = 280, height = 200 }: IllustrationProps) {
 return (
 <svg width={width} height={height} viewBox="0 0 280 200" fill="none"
 xmlns="http://www.w3.org/2000/svg" className={className}>
 <ellipse cx="140" cy="188" rx="90" ry="7" fill="rgba(0,0,0,0.07)" />
 {/* Carte arrière */}
 <rect x="55" y="65" width="160" height="95" rx="8"
 fill="#C9A84C" transform="rotate(-4 55 65)" />
 {/* Carte principale recto */}
 <rect x="45" y="55" width="160" height="95" rx="8" fill="white"
 filter="url(#cardShadow)" />
 <rect x="45" y="55" width="160" height="95" rx="8" fill="#0E2347" />
 {/* Accent gold */}
 <rect x="45" y="55" width="6" height="95" rx="3" fill="#C9A84C" />
 <rect x="45" y="120" width="160" height="30" rx="0" fill="#1A3A6B"
 style={{borderRadius: '0 0 8px 8px'}} />
 <rect x="45" y="120" width="160" height="30" fill="#1A3A6B" />
 <rect x="45" y="120" width="160" height="30" rx="8"
 style={{borderTopLeftRadius: 0, borderTopRightRadius: 0}} />
 {/* Texte simulé */}
 <rect x="62" y="72" width="55" height="8" rx="4" fill="white" opacity="0.95" />
 <rect x="62" y="85" width="35" height="5" rx="2.5" fill="#C9A84C" opacity="0.9" />
 <rect x="62" y="100" width="70" height="4" rx="2" fill="white" opacity="0.4" />
 <rect x="62" y="108" width="55" height="4" rx="2" fill="white" opacity="0.3" />
 {/* Logo cercle */}
 <circle cx="170" cy="88" r="22" fill="white" opacity="0.08" />
 <circle cx="170" cy="88" r="16" fill="white" opacity="0.1" />
 <rect x="163" y="83" width="14" height="10" rx="2" fill="#C9A84C" opacity="0.8" />
 {/* Footer infos */}
 <rect x="55" y="127" width="40" height="3" rx="1.5" fill="white" opacity="0.5" />
 <rect x="55" y="133" width="60" height="3" rx="1.5" fill="white" opacity="0.4" />
 <rect x="140" y="127" width="55" height="3" rx="1.5" fill="#C9A84C" opacity="0.7" />
 <defs>
 <filter id="cardShadow">
 <feDropShadow dx="3" dy="6" stdDeviation="8" floodOpacity="0.15" />
 </filter>
 </defs>
 </svg>
 )
}

// ─── AFFICHE A3 ───────────────────────────────────────────────
export function AfficheIllustration({ className = '', width = 280, height = 200 }: IllustrationProps) {
 return (
 <svg width={width} height={height} viewBox="0 0 280 200" fill="none"
 xmlns="http://www.w3.org/2000/svg" className={className}>
 <ellipse cx="140" cy="192" rx="70" ry="6" fill="rgba(0,0,0,0.08)" />
 {/* Ombre affiche */}
 <rect x="100" y="12" width="105" height="170" rx="3"
 fill="#1A3A6B" opacity="0.2" transform="rotate(3 100 12)" />
 {/* Affiche principale */}
 <rect x="87" y="10" width="106" height="172" rx="3" fill="white"
 filter="url(#affShadow)" />
 {/* Zone image haut */}
 <rect x="87" y="10" width="106" height="100" rx="3" fill="url(#affGrad)" />
 <rect x="87" y="90" width="106" height="20" fill="url(#affGrad2)" />
 {/* Éléments graphiques déco */}
 <circle cx="140" cy="52" r="28" fill="white" opacity="0.08" />
 <circle cx="140" cy="52" r="18" fill="white" opacity="0.12" />
 <text x="140" y="58" textAnchor="middle" fontSize="22" fill="white" opacity="0.9">★</text>
 {/* Titre */}
 <rect x="95" y="118" width="90" height="8" rx="4" fill="#0E2347" opacity="0.9" />
 <rect x="100" y="130" width="80" height="5" rx="2.5" fill="#0E2347" opacity="0.6" />
 {/* Lignes corps */}
 <rect x="95" y="143" width="90" height="3" rx="1.5" fill="#8A8FA8" opacity="0.5" />
 <rect x="95" y="150" width="75" height="3" rx="1.5" fill="#8A8FA8" opacity="0.4" />
 <rect x="95" y="157" width="85" height="3" rx="1.5" fill="#8A8FA8" opacity="0.4" />
 {/* CTA bas */}
 <rect x="105" y="167" width="70" height="10" rx="5" fill="#C9A84C" />
 <rect x="115" y="170" width="50" height="4" rx="2" fill="white" opacity="0.8" />
 <defs>
 <linearGradient id="affGrad" x1="87" y1="10" x2="193" y2="110" gradientUnits="userSpaceOnUse">
 <stop offset="0%" stopColor="#2A5298" />
 <stop offset="100%" stopColor="#0E2347" />
 </linearGradient>
 <linearGradient id="affGrad2" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#0E2347" />
 <stop offset="100%" stopColor="white" stopOpacity="0" />
 </linearGradient>
 <filter id="affShadow">
 <feDropShadow dx="4" dy="8" stdDeviation="10" floodOpacity="0.15" />
 </filter>
 </defs>
 </svg>
 )
}

// ─── BROCHURE 3 VOLETS ────────────────────────────────────────
export function BrochureIllustration({ className = '', width = 280, height = 200 }: IllustrationProps) {
 return (
 <svg width={width} height={height} viewBox="0 0 280 200" fill="none"
 xmlns="http://www.w3.org/2000/svg" className={className}>
 <ellipse cx="140" cy="190" rx="100" ry="7" fill="rgba(0,0,0,0.07)" />
 {/* Volet gauche */}
 <rect x="22" y="30" width="70" height="148" rx="4" fill="#E8EEF8"
 filter="url(#brochShadow)" transform="rotate(-2 22 30)" />
 <rect x="22" y="30" width="70" height="50" rx="4" fill="#1A3A6B"
 transform="rotate(-2 22 30)" />
 <rect x="28" y="38" width="50" height="5" rx="2.5" fill="white" opacity="0.7"
 transform="rotate(-2 22 30)" />
 <rect x="28" y="47" width="35" height="3" rx="1.5" fill="#C9A84C" opacity="0.8"
 transform="rotate(-2 22 30)" />
 {/* Volet droit */}
 <rect x="178" y="30" width="70" height="148" rx="4" fill="#E8EEF8"
 filter="url(#brochShadow)" transform="rotate(2 178 30)" />
 <rect x="178" y="30" width="70" height="50" rx="4" fill="#2A5298"
 transform="rotate(2 178 30)" />
 <rect x="185" y="38" width="50" height="5" rx="2.5" fill="white" opacity="0.7"
 transform="rotate(2 178 30)" />
 {/* Volet central (devant) */}
 <rect x="95" y="22" width="90" height="155" rx="4" fill="white"
 filter="url(#brochShadow2)" />
 <rect x="95" y="22" width="90" height="65" rx="4" fill="url(#brochGrad)" />
 <rect x="95" y="67" width="90" height="20" fill="url(#brochGrad2)" />
 {/* Logo central */}
 <circle cx="140" cy="46" r="18" fill="white" opacity="0.15" />
 <rect x="131" y="40" width="18" height="12" rx="3" fill="#C9A84C" opacity="0.9" />
 {/* Texte central */}
 <rect x="103" y="96" width="74" height="7" rx="3.5" fill="#0E2347" opacity="0.85" />
 <rect x="108" y="108" width="64" height="4" rx="2" fill="#8A8FA8" opacity="0.6" />
 <rect x="103" y="116" width="74" height="3" rx="1.5" fill="#8A8FA8" opacity="0.4" />
 <rect x="103" y="123" width="60" height="3" rx="1.5" fill="#8A8FA8" opacity="0.4" />
 <rect x="103" y="130" width="70" height="3" rx="1.5" fill="#8A8FA8" opacity="0.3" />
 {/* Pli */}
 <line x1="95" y1="22" x2="95" y2="177" stroke="#E2E8F0" strokeWidth="1" />
 <line x1="185" y1="22" x2="185" y2="177" stroke="#E2E8F0" strokeWidth="1" />
 <defs>
 <linearGradient id="brochGrad" x1="95" y1="22" x2="185" y2="87" gradientUnits="userSpaceOnUse">
 <stop offset="0%" stopColor="#1A3A6B" />
 <stop offset="100%" stopColor="#2A5298" />
 </linearGradient>
 <linearGradient id="brochGrad2" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#2A5298" />
 <stop offset="100%" stopColor="white" stopOpacity="0" />
 </linearGradient>
 <filter id="brochShadow">
 <feDropShadow dx="1" dy="3" stdDeviation="4" floodOpacity="0.1" />
 </filter>
 <filter id="brochShadow2">
 <feDropShadow dx="3" dy="6" stdDeviation="8" floodOpacity="0.15" />
 </filter>
 </defs>
 </svg>
 )
}

// ─── ROLL-UP / KAKÉMONO ───────────────────────────────────────
export function RollupIllustration({ className = '', width = 280, height = 200 }: IllustrationProps) {
 return (
 <svg width={width} height={height} viewBox="0 0 280 200" fill="none"
 xmlns="http://www.w3.org/2000/svg" className={className}>
 {/* Base */}
 <rect x="110" y="185" width="60" height="10" rx="5" fill="#8A8FA8" opacity="0.4" />
 <rect x="127" y="175" width="26" height="12" rx="3" fill="#8A8FA8" opacity="0.5" />
 {/* Tige */}
 <rect x="138" y="20" width="4" height="158" rx="2" fill="#C9A84C" opacity="0.6" />
 {/* Bâche principale */}
 <rect x="80" y="18" width="120" height="160" rx="4"
 fill="url(#rollGrad)" filter="url(#rollShadow)" />
 {/* Header logo zone */}
 <rect x="80" y="18" width="120" height="55" rx="4" fill="white" opacity="0.12" />
 <circle cx="140" cy="38" r="15" fill="white" opacity="0.15" />
 <rect x="122" y="34" width="36" height="8" rx="4" fill="white" opacity="0.9" />
 <rect x="128" y="46" width="24" height="4" rx="2" fill="#C9A84C" opacity="0.9" />
 {/* Ligne séparatrice */}
 <rect x="88" y="78" width="104" height="2" rx="1" fill="white" opacity="0.2" />
 {/* Zone image centrale */}
 <rect x="88" y="84" width="104" height="65" rx="3" fill="white" opacity="0.08" />
 <circle cx="140" cy="116" r="22" fill="white" opacity="0.1" />
 <text x="140" y="122" textAnchor="middle" fontSize="26">🏢</text>
 {/* Texte bas */}
 <rect x="95" y="155" width="90" height="5" rx="2.5" fill="white" opacity="0.7" />
 <rect x="105" y="163" width="70" height="4" rx="2" fill="#C9A84C" opacity="0.8" />
 {/* Enrouleur bas */}
 <rect x="80" y="174" width="120" height="8" rx="4" fill="#1A3A6B" opacity="0.8" />
 <rect x="78" y="172" width="124" height="5" rx="2.5" fill="#8A8FA8" opacity="0.4" />
 <defs>
 <linearGradient id="rollGrad" x1="80" y1="18" x2="200" y2="178" gradientUnits="userSpaceOnUse">
 <stop offset="0%" stopColor="#1A3A6B" />
 <stop offset="50%" stopColor="#2A5298" />
 <stop offset="100%" stopColor="#0E2347" />
 </linearGradient>
 <filter id="rollShadow">
 <feDropShadow dx="4" dy="8" stdDeviation="10" floodOpacity="0.2" />
 </filter>
 </defs>
 </svg>
 )
}

// ─── TOTE BAG ─────────────────────────────────────────────────
export function ToteBagIllustration({ className = '', width = 280, height = 200 }: IllustrationProps) {
 return (
 <svg width={width} height={height} viewBox="0 0 280 200" fill="none"
 xmlns="http://www.w3.org/2000/svg" className={className}>
 <ellipse cx="140" cy="192" rx="65" ry="6" fill="rgba(0,0,0,0.08)" />
 {/* Anses */}
 <path d="M105 65 Q100 30 118 25 Q130 22 130 40" stroke="#8A8FA8" strokeWidth="8"
 fill="none" strokeLinecap="round" />
 <path d="M175 65 Q180 30 162 25 Q150 22 150 40" stroke="#8A8FA8" strokeWidth="8"
 fill="none" strokeLinecap="round" />
 {/* Corps du sac */}
 <path d="M85 65 L95 185 Q140 192 185 185 L195 65 Z"
 fill="url(#bagGrad)" filter="url(#bagShadow)" />
 {/* Plis latéraux */}
 <path d="M85 65 L95 185" stroke="white" strokeWidth="1" opacity="0.1" />
 <path d="M195 65 L185 185" stroke="white" strokeWidth="1" opacity="0.1" />
 {/* Zone impression */}
 <rect x="108" y="90" width="64" height="64" rx="8" fill="white" opacity="0.15" />
 {/* Logo imprimé simulé */}
 <circle cx="140" cy="118" r="22" fill="white" opacity="0.2" />
 <rect x="126" y="112" width="28" height="12" rx="6" fill="white" opacity="0.8" />
 <rect x="131" y="127" width="18" height="4" rx="2" fill="#C9A84C" opacity="0.9" />
 {/* Surpiqûres */}
 <path d="M87 67 L193 67" stroke="white" strokeWidth="1.5"
 strokeDasharray="4 3" opacity="0.3" />
 <defs>
 <linearGradient id="bagGrad" x1="85" y1="65" x2="195" y2="185" gradientUnits="userSpaceOnUse">
 <stop offset="0%" stopColor="#1A3A6B" />
 <stop offset="100%" stopColor="#0E2347" />
 </linearGradient>
 <filter id="bagShadow">
 <feDropShadow dx="3" dy="6" stdDeviation="8" floodOpacity="0.15" />
 </filter>
 </defs>
 </svg>
 )
}

// ─── T-SHIRT ──────────────────────────────────────────────────
export function TshirtIllustration({ className = '', width = 280, height = 200 }: IllustrationProps) {
 return (
 <svg width={width} height={height} viewBox="0 0 280 200" fill="none"
 xmlns="http://www.w3.org/2000/svg" className={className}>
 <ellipse cx="140" cy="193" rx="70" ry="5" fill="rgba(0,0,0,0.07)" />
 {/* Corps t-shirt */}
 <path d="M90 55 L55 95 L80 105 L80 185 L200 185 L200 105 L225 95 L190 55
 Q175 45 158 50 Q150 62 140 62 Q130 62 122 50 Q105 45 90 55Z"
 fill="url(#shirtGrad)" filter="url(#shirtShadow)" />
 {/* Col */}
 <path d="M122 50 Q130 65 140 65 Q150 65 158 50"
 fill="none" stroke="#0E2347" strokeWidth="2" opacity="0.3" />
 {/* Manches ombre */}
 <path d="M90 55 L55 95 L80 105" fill="none"
 stroke="white" strokeWidth="1" opacity="0.1" />
 <path d="M190 55 L225 95 L200 105" fill="none"
 stroke="white" strokeWidth="1" opacity="0.1" />
 {/* Zone impression */}
 <rect x="112" y="95" width="56" height="56" rx="6" fill="white" opacity="0.12" />
 {/* Design imprimé */}
 <circle cx="140" cy="120" r="20" fill="white" opacity="0.15" />
 <rect x="128" y="114" width="24" height="12" rx="6" fill="white" opacity="0.8" />
 <rect x="133" y="129" width="14" height="4" rx="2" fill="#C9A84C" opacity="0.9" />
 <defs>
 <linearGradient id="shirtGrad" x1="55" y1="55" x2="225" y2="185" gradientUnits="userSpaceOnUse">
 <stop offset="0%" stopColor="#2A5298" />
 <stop offset="100%" stopColor="#1A3A6B" />
 </linearGradient>
 <filter id="shirtShadow">
 <feDropShadow dx="2" dy="5" stdDeviation="8" floodOpacity="0.15" />
 </filter>
 </defs>
 </svg>
 )
}

// ─── ÉTIQUETTES ───────────────────────────────────────────────
export function EtiquetteIllustration({ className = '', width = 280, height = 200 }: IllustrationProps) {
 return (
 <svg width={width} height={height} viewBox="0 0 280 200" fill="none"
 xmlns="http://www.w3.org/2000/svg" className={className}>
 <ellipse cx="150" cy="188" rx="80" ry="7" fill="rgba(0,0,0,0.07)" />
 {/* Rouleau base */}
 <ellipse cx="150" cy="130" rx="65" ry="20" fill="#E2E8F0" />
 <rect x="85" y="50" width="130" height="80" rx="0" fill="#F0F4FF" />
 <ellipse cx="150" cy="50" rx="65" ry="20" fill="white"
 filter="url(#etiqShadow)" />
 {/* Étiquettes déroulées */}
 {[0, 1, 2, 3, 4].map((i) => (
 <g key={i}>
 <rect x={88 + i * 2} y={52 + i * 14} width="124" height="12" rx="6"
 fill={i === 0 ? '#1A3A6B' : i === 1 ? '#C9A84C' : '#E8EEF8'}
 opacity={1 - i * 0.15} />
 {i < 2 && (
 <rect x={96 + i * 2} y={55 + i * 14} width="60" height="5" rx="2.5"
 fill="white" opacity="0.7" />
 )}
 </g>
 ))}
 {/* Étiquette principale détachée */}
 <rect x="75" y="25" width="90" height="55" rx="10"
 fill="url(#etiqGrad)" filter="url(#etiqShadow)"
 transform="rotate(-8 75 25)" />
 <circle cx="95" cy="37" r="5" fill="white" opacity="0.5"
 transform="rotate(-8 75 25)" />
 <rect x="88" y="45" width="65" height="6" rx="3" fill="white" opacity="0.9"
 transform="rotate(-8 88 45)" />
 <rect x="88" y="55" width="45" height="4" rx="2" fill="#C9A84C" opacity="0.9"
 transform="rotate(-8 88 55)" />
 <rect x="88" y="63" width="55" height="3" rx="1.5" fill="white" opacity="0.5"
 transform="rotate(-8 88 63)" />
 <defs>
 <linearGradient id="etiqGrad" x1="75" y1="25" x2="165" y2="80" gradientUnits="userSpaceOnUse">
 <stop offset="0%" stopColor="#1A3A6B" />
 <stop offset="100%" stopColor="#2A5298" />
 </linearGradient>
 <filter id="etiqShadow">
 <feDropShadow dx="3" dy="5" stdDeviation="7" floodOpacity="0.15" />
 </filter>
 </defs>
 </svg>
 )
}

// ─── MAP slug → composant ─────────────────────────────────────
export const PRODUCT_ILLUSTRATIONS: Record<string, React.FC<IllustrationProps>> = {
 'flyer-a5-classique': FlyerIllustration,
 'carte-de-visite-standard': BusinessCardIllustration,
 'affiche-a3-premium': AfficheIllustration,
 'brochure-3-volets': BrochureIllustration,
 'kakemono-roll-up': RollupIllustration,
 'tote-bag-coton': ToteBagIllustration,
 't-shirt-personnalise': TshirtIllustration,
 'etiquettes-rouleau': EtiquetteIllustration,
}

// ─── Composant générique ──────────────────────────────────────
export function ProductIllustration({
 slug, className, width, height
}: { slug: string } & IllustrationProps) {
 const Illustration = PRODUCT_ILLUSTRATIONS[slug]
 if (!Illustration) {
 return (
 <div className={`flex items-center justify-center text-6xl ${className}`}>
 📦
 </div>
 )
 }
 return <Illustration className={className} width={width} height={height} />
}
