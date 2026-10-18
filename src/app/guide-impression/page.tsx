import Link from 'next/link'
import { 
  BookOpen, AlertTriangle, CheckCircle, Monitor, Printer, 
  LayoutTemplate, ArrowRight, Download, FileCheck, Layers, 
  Sparkles, CheckCircle2, ShieldCheck, Phone, HelpCircle, FileText
} from 'lucide-react'
import { getServerContact } from '@/lib/contact'

export const metadata = {
  title: 'Guide Technique Pré-Presse — Préparer ses fichiers pour YopoePrint',
  description: 'Gabarits, fonds perdus, profil colorimétrique CMJN, résolution 300 DPI : le guide complet pour réussir l’impression de vos supports au Burkina Faso.',
}

const TEMPLATES = [
  { name: 'Carte de Visite Standard', dim: '85 × 54 mm', format: 'PDF / AI / PSD', size: '2.4 MB' },
  { name: 'Flyer A5 Commercial', dim: '148 × 210 mm', format: 'PDF / AI / PSD', size: '3.8 MB' },
  { name: 'Dépliant 3 Volets A4', dim: '297 × 210 mm', format: 'PDF / AI / PSD', size: '5.1 MB' },
  { name: 'Roll-Up Stand Aluminium', dim: '85 × 200 cm', format: 'PDF / AI / PSD', size: '7.2 MB' },
]

const FORMATS_TABLE = [
  { name: 'A6 (Carte postale)', dimMm: '105 × 148 mm', pixels300: '1240 × 1748 px', usage: 'Flyers de soirée, cartons d’invitation' },
  { name: 'A5 (Demi-page)', dimMm: '148 × 210 mm', pixels300: '1748 × 2480 px', usage: 'Flyers promotionnels, menus, livrets' },
  { name: 'A4 (Format standard)', dimMm: '210 × 297 mm', pixels300: '2480 × 3508 px', usage: 'Têtes de lettre, rapports, chemises' },
  { name: 'A3 (Double page)', dimMm: '297 × 420 mm', pixels300: '3508 × 4960 px', usage: 'Petites affiches, sets de table, journaux' },
  { name: 'A2 & A1 (Grand format)', dimMm: '420 × 594 mm / 594 × 841 mm', pixels300: '4960 × 7016 px', usage: 'Affiches événementielles, vitrines' },
]

export default async function GuideImpressionPage() {
  const contact = await getServerContact()
  return (
    <div className="bg-gray-100 min-h-screen text-foreground pb-24">
      
      {/* ── 1. HEADER HERO STYLE APPLE ── */}
      <section className="bg-gradient-to-b from-foreground via-[#151516] to-foreground text-white pt-28 pb-20 md:pt-36 md:pb-24 px-4 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-600/20 via-primary/30 to-purple-600/20 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-gray-200">
            <BookOpen size={14} className="text-primary" />
            <span>Guide Pré-Presse Officiel Atelier YopoePrint</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Préparez vos fichiers <br />
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              comme un professionnel.
            </span>
          </h1>

          <p className="text-gray-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Évitez les décalages de découpe, les couleurs ternes ou les textes pixellisés. 
            Découvrez les 4 règles d'or pour un rendu d'impression parfait au Burkina Faso.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <a 
              href="#regles" 
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-7 py-3.5 rounded-full text-xs sm:text-sm transition-all shadow-md active:scale-95"
            >
              Consulter les règles d'or ↓
            </a>
            <a 
              href="#gabarits" 
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-7 py-3.5 rounded-full text-xs sm:text-sm border border-white/15 transition-all active:scale-95"
            >
              <Download size={15} /> Télécharger les gabarits
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. BANDEAU BAT GRATUIT ── */}
      <section className="-mt-8 relative z-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white/90 backdrop-blur-xl border border-black/5 rounded-3xl p-6 shadow-[0_12px_36px_rgba(0,0,0,0.06)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-foreground">
                Contrôle PAO & Bon À Tirer (BAT) numérique 100% offert
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Même si votre fichier comporte de petites imperfections, notre studio pré-presse à Ouagadougou vérifie gratuitement la conformité technique avant tout tirage.
              </p>
            </div>
          </div>
          <Link 
            href="/contact?sujet=aide-fichier" 
            className="shrink-0 text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            Poser une question à un graphiste →
          </Link>
        </div>
      </section>

      {/* ── 3. LES 4 RÈGLES D'OR TECHNIQUES ── */}
      <div id="regles" className="max-w-5xl mx-auto px-4 sm:px-6 py-20 space-y-16">

        {/* ── RÈGLE 1 : CMJN vs RVB ── */}
        <section className="bg-white rounded-3xl p-8 md:p-12 border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10">
              Règle 01 · Espace Couleur
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground">
              Le Mode Colorimétrique : CMJN obligatoire
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Votre écran émet de la lumière en <strong>RVB</strong> (Rouge, Vert, Bleu) et peut afficher des néons ultra-saturés. En imprimerie industrielle, nos presses déposent 4 encres physiques : <strong>CMJN</strong> (Cyan, Magenta, Jaune, Noir).
            </p>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/60 text-xs text-amber-900 flex gap-3">
              <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Attention :</strong> Si vous soumettez un fichier en RVB, nos serveurs le convertiront automatiquement en profil normalisé <strong>ISO FOGRA39 CMJN</strong>, ce qui peut légèrement ternir les teintes vives. Réglez votre document en CMJN dès sa création dans Photoshop ou Illustrator.
              </span>
            </div>
          </div>

          <div className="md:col-span-5 bg-gray-100 rounded-3xl p-6 border border-black/5 flex flex-col items-center gap-4">
            <p className="text-2xs font-bold text-gray-600 uppercase tracking-wider">Comparatif Réel Écran vs Papier</p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="space-y-1.5 text-center">
                <div className="aspect-square bg-[#00FF66] rounded-2xl shadow-inner flex items-center justify-center text-gray-900 font-extrabold text-sm">
                  RVB Écran
                </div>
                <p className="text-2xs text-gray-600 font-semibold"><Monitor size={12} className="inline mr-1" /> Très lumineux</p>
              </div>
              <div className="space-y-1.5 text-center">
                <div className="aspect-square bg-[#00A651] rounded-2xl shadow-inner flex items-center justify-center text-white font-extrabold text-sm">
                  CMJN Encre
                </div>
                <p className="text-2xs text-gray-600 font-semibold"><Printer size={12} className="inline mr-1" /> Rendu physique</p>
              </div>
            </div>
            <span className="text-2xs text-gray-600 italic">Profil recommandé : Coated FOGRA39 (ISO 12647-2)</span>
          </div>
        </section>

        {/* ── RÈGLE 2 : FONDS PERDUS (BLEED) ── */}
        <section className="bg-white rounded-3xl p-8 md:p-12 border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-emerald-700 px-3 py-1 rounded-full bg-emerald-50">
              Règle 02 · Massicot & Découpe
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground">
              Les Fonds Perdus (Bleed) : +3 mm tout autour
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              La lame du massicot industriel coupe des piles de 1 000 feuilles simultanément. Une micro-oscillation d'un demi-millimètre peut se produire. Si votre image s'arrête exactement au bord de coupe, un filet blanc inesthétique apparaîtra.
            </p>
            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Fond perdu de +3 mm :</strong> Prolongez vos fonds de couleur et photos au-delà du format fini (ex: 91 × 60 mm pour une carte 85 × 54 mm).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Zone tranquille de 4 mm :</strong> Éloignez vos textes, logos et numéros de téléphone du bord pour éviter qu'ils ne soient rognés.</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-gray-100 rounded-3xl p-6 border border-black/5 flex flex-col items-center justify-center">
            <div className="relative w-48 h-56 bg-white border-2 border-dashed border-red-400 p-4 rounded-xl flex flex-col items-center justify-center shadow-xs">
              <div className="absolute inset-0 border-2 border-blue-500 m-3 rounded-lg" />
              <div className="absolute top-1 left-2 text-[10px] font-extrabold text-red-600 uppercase tracking-widest">Fond perdu (+3mm)</div>
              <div className="absolute top-4 left-4 text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Format fini coupé</div>
              <div className="text-center space-y-1 my-auto">
                <LayoutTemplate size={32} className="text-gray-300 mx-auto" />
                <p className="text-2xs font-bold text-gray-700">Zone de sécurité</p>
                <p className="text-[10px] text-gray-500">Gardez textes & logos au centre</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── RÈGLE 3 : RÉSOLUTION 300 DPI ── */}
        <section className="bg-white rounded-3xl p-8 md:p-12 border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-purple-600 px-3 py-1 rounded-full bg-purple-50">
              Règle 03 · Piqué & Netteté
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground">
              La Résolution : 300 DPI à l’échelle 1:1
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Une photo capturée sur WhatsApp ou téléchargée sur Facebook est compressée à <strong>72 DPI</strong> pour s'afficher rapidement sur mobile. Sur papier, cette même image apparaîtra floue et pixellisée en mosaïque.
            </p>
            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <span><strong>Flyers, cartes, brochures :</strong> Exigez 300 DPI minimum pour des détails ultra-nets.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <span><strong>Bâches & kakémonos géants (&gt; 2 mètres) :</strong> 150 DPI suffisent grâce à la distance de visionnage naturelle.</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-foreground text-white rounded-3xl p-6 border border-black/10 flex flex-col items-center gap-4">
            <p className="text-2xs font-bold text-gray-400 uppercase tracking-wider">Simulation Visuelle</p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="space-y-1.5 text-center">
                <div className="aspect-square bg-gray-800 rounded-xl overflow-hidden relative border border-red-500/40">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-amber-500 scale-150 blur-sm" />
                </div>
                <span className="text-2xs text-red-400 font-bold uppercase tracking-wider">72 DPI (Flou Web)</span>
              </div>
              <div className="space-y-1.5 text-center">
                <div className="aspect-square bg-gray-800 rounded-xl overflow-hidden relative border border-emerald-500/40">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-amber-500" />
                </div>
                <span className="text-2xs text-emerald-400 font-bold uppercase tracking-wider">300 DPI (Net Print)</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── RÈGLE 4 : POLICES & NOIR PROFOND ── */}
        <section className="bg-white rounded-3xl p-8 md:p-12 border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-blue-600 px-3 py-1 rounded-full bg-blue-50">
              Règle 04 · Typographie & Noirs
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground">
              Vectorisation des textes & Gestion des Noirs
            </h2>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>
                <strong>Vectorisez vos polices (Créer des contours / Ctrl+Shift+O)</strong> avant l'export PDF. Cela évite que nos machines ne substituent votre typographie par une police par défaut si elle n'est pas installée.
              </p>
              <p>
                <strong>Pour les textes fins :</strong> Utilisez du <em>Noir Pur à 100%</em> (C0 M0 J0 N100) pour une netteté chirurgicale sans décalage de repérage.
              </p>
              <p>
                <strong>Pour les grands aplats de fond noir :</strong> Utilisez du <em>Noir Riche</em> (C30 M30 J30 N100) pour un fond d'une profondeur intense sans aspect grisâtre.
              </p>
            </div>
          </div>

          <div className="md:col-span-5 bg-gray-100 rounded-3xl p-6 border border-black/5 space-y-3 text-xs">
            <p className="font-bold text-foreground uppercase tracking-wider text-2xs">Formats de fichiers acceptés :</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-white border border-black/5 text-center font-bold text-emerald-700">
                PDF Haute Définition <br /><span className="text-2xs text-gray-500 font-normal">Idéal & Recommandé</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-black/5 text-center font-bold text-gray-800">
                Illustrator (.ai) <br /><span className="text-2xs text-gray-500 font-normal">Vectorisé</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-black/5 text-center font-bold text-gray-800">
                Photoshop (.psd) <br /><span className="text-2xs text-gray-500 font-normal">Calques aplatis</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-black/5 text-center font-bold text-gray-800">
                TIFF / JPEG HD <br /><span className="text-2xs text-gray-500 font-normal">Sans compression</span>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ── 4. TABLEAU DES FORMATS ISO NORMALISÉS ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <h3 className="font-display font-extrabold text-2xl text-foreground mb-2">
            Tableau des Formats Normalisés & Résolutions
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Dimensions exactes en millimètres et pixels nécessaires à 300 DPI pour concevoir vos fichiers dans Photoshop ou InDesign.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 font-bold">Format</th>
                  <th className="pb-3 font-bold">Dimensions (mm)</th>
                  <th className="pb-3 font-bold">Dimensions en pixels (300 DPI)</th>
                  <th className="pb-3 font-bold">Usage Fréquent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {FORMATS_TABLE.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="py-3.5 font-bold text-foreground">{row.name}</td>
                    <td className="py-3.5 font-mono text-gray-600">{row.dimMm}</td>
                    <td className="py-3.5 font-mono text-gray-600">{row.pixels300}</td>
                    <td className="py-3.5 text-gray-500">{row.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 5. GABARITS TÉLÉCHARGEABLES ── */}
      <section id="gabarits" className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Gain de Temps</p>
          <h3 className="font-display font-extrabold text-3xl text-foreground">
            Téléchargez nos gabarits prêts à l'emploi
          </h3>
          <p className="text-xs text-gray-600 mt-2">
            Fichiers pré-configurés avec fonds perdus, repères de découpe et calques verrouillés pour InDesign, Illustrator et Photoshop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map((tmpl, i) => (
            <div 
              key={i} 
              className="bg-white rounded-3xl p-5 border border-black/5 shadow-xs flex flex-col justify-between hover:border-black/20 hover:shadow-md transition-all"
            >
              <div>
                <span className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center mb-3">
                  <FileText size={18} />
                </span>
                <h4 className="font-bold text-sm text-foreground mb-1">{tmpl.name}</h4>
                <p className="font-mono text-xs text-gray-500 mb-2">{tmpl.dim}</p>
                <p className="text-2xs text-gray-400">{tmpl.format} · {tmpl.size}</p>
              </div>

              <a 
                href={`/contact?gabarit=${encodeURIComponent(tmpl.name)}`}
                className="mt-4 pt-3 border-t border-gray-100 inline-flex items-center justify-between text-xs font-bold text-primary hover:underline"
              >
                <span>Télécharger le kit</span>
                <Download size={14} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. CALL TO ACTION FINAL ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-foreground via-[#242426] to-foreground text-white rounded-3xl p-8 md:p-12 border border-white/10 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-primary mx-auto flex items-center justify-center">
            <Sparkles size={28} />
          </div>

          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white">
            Vos fichiers sont prêts ? Lancez votre commande !
          </h2>

          <p className="text-gray-300 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
            Téléversez votre visuel directement lors du panier. Notre atelier vérifiera chaque détail et vous enverra un BAT certifié avant tout départ d'impression.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link 
              href="/catalogue" 
              className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3.5 rounded-full text-xs sm:text-sm transition-all shadow-md active:scale-95"
            >
              Voir le catalogue produits
            </Link>
            <a 
              href={`${contact.whatsappUrl}?text=Bonjour%20YopoePrint,%20j'ai%20besoin%20d'aide%20pour%20la%20préparation%20de%20mon%20fichier.`} 
              target="_blank" 
              rel="noreferrer"
              className="bg-white/10 hover:bg-white/15 text-white font-medium px-7 py-3.5 rounded-full text-xs sm:text-sm border border-white/15 transition-all"
            >
              <Phone size={14} className="inline mr-1.5" /> Assistance PAO WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
