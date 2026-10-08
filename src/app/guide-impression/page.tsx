import Link from 'next/link'
import { BookOpen, AlertTriangle, CheckCircle, Monitor, Printer, LayoutTemplate, ArrowRight } from 'lucide-react'

export default function GuideImpressionPage() {
  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* ── HEADER BANNÈRE ── */}
      <div className="bg-indigo-950 py-24 px-4 relative overflow-hidden">
        {/* Pattern décoratif */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)"/>
          </svg>
        </div>
        
        <div className="max-w-4xl mx-auto text-center text-white space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-bold mb-4">
            <BookOpen size={16} /> Guide Technique
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">Préparez vos fichiers<br/>comme un Pro</h1>
          <p className="text-indigo-200 text-lg md:text-xl max-w-2xl mx-auto">
            Évitez les mauvaises surprises à l'impression. Suivez ces 3 règles d'or pour garantir un résultat parfait.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">

        {/* ── RÈGLE 1 : CMJN vs RVB ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-display font-bold text-xl">
              1
            </div>
            <h2 className="font-display text-3xl font-bold text-gray-900">Le Mode Colorimétrique : CMJN</h2>
            <p className="text-gray-600 leading-relaxed">
              Votre écran utilise de la lumière (RVB : Rouge, Vert, Bleu) pour créer des couleurs très vives. Nos machines d'impression utilisent de l'encre (CMJN : Cyan, Magenta, Jaune, Noir).
            </p>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl">
              <p className="text-sm text-orange-800 flex gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>Si vous envoyez un fichier en RVB, nos machines le convertiront en CMJN, ce qui peut rendre vos couleurs plus ternes ou différentes. <strong>Travaillez toujours en CMJN !</strong></span>
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex flex-col items-center gap-6">
            <div className="flex gap-4 w-full">
              <div className="flex-1 space-y-2 text-center">
                <div className="aspect-square bg-[#00FF00] rounded-xl shadow-inner flex items-center justify-center text-black font-bold">RVB</div>
                <p className="text-xs font-bold text-gray-500"><Monitor size={14} className="inline mr-1" /> Écran (Lumineux)</p>
              </div>
              <div className="flex items-center text-gray-300"><ArrowRight /></div>
              <div className="flex-1 space-y-2 text-center">
                <div className="aspect-square bg-[#00A651] rounded-xl shadow-inner flex items-center justify-center text-white font-bold">CMJN</div>
                <p className="text-xs font-bold text-gray-500"><Printer size={14} className="inline mr-1" /> Papier (Plus terne)</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── RÈGLE 2 : FONDS PERDUS ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center flex-row-reverse">
          <div className="space-y-6 md:order-2">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center font-display font-bold text-xl">
              2
            </div>
            <h2 className="font-display text-3xl font-bold text-gray-900">Les Fonds Perdus (Bleed)</h2>
            <p className="text-gray-600 leading-relaxed">
              La lame du massicot (machine de découpe) peut se décaler d'un ou deux millimètres lors de la coupe. Pour éviter d'avoir un liseré blanc sur les bords de votre document, votre fond de couleur ou votre image doit déborder !
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle size={18} className="text-green-500 shrink-0" />
                <span>Ajoutez <strong>3 mm de fond perdu</strong> tout autour de votre document.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle size={18} className="text-green-500 shrink-0" />
                <span>Gardez vos textes importants à <strong>4 mm du bord</strong> (Marge de sécurité).</span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex items-center justify-center md:order-1">
            <div className="relative w-48 h-64 bg-white border-2 border-dashed border-red-400 p-4 flex flex-col items-center justify-center shadow-lg">
              <div className="absolute inset-0 border-2 border-blue-400 m-3" />
              <div className="absolute top-1 left-1 text-[8px] font-bold text-red-500 uppercase">Fond Perdu (+3mm)</div>
              <div className="absolute top-4 left-4 text-[8px] font-bold text-blue-500 uppercase">Coupe finale</div>
              <LayoutTemplate size={48} className="text-gray-200 mt-4" />
            </div>
          </div>
        </section>

        {/* ── RÈGLE 3 : RÉSOLUTION ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-display font-bold text-xl">
              3
            </div>
            <h2 className="font-display text-3xl font-bold text-gray-900">La Résolution : 300 DPI minimum</h2>
            <p className="text-gray-600 leading-relaxed">
              Une image qui paraît nette sur votre téléphone peut s'avérer floue ou "pixellisée" une fois imprimée en grand format. L'impression nécessite beaucoup plus de pixels que les écrans.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Assurez-vous que toutes vos images ont une résolution d'au moins <strong>300 DPI</strong> (Points par Pouce) à leur taille d'impression finale. Ne récupérez jamais d'images directement sur Google ou WhatsApp pour les imprimer !
            </p>
          </div>
          <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl flex gap-4 overflow-hidden relative">
            <div className="flex-1 flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-800 rounded-xl overflow-hidden mb-3 relative">
                {/* Simulation 72 DPI (Pixellisé) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 scale-150 transform transition-transform" style={{ filter: 'blur(8px) contrast(200%)' }} />
              </div>
              <span className="text-red-400 text-xs font-bold uppercase tracking-wider">72 DPI (Web)</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-800 rounded-xl overflow-hidden mb-3 relative">
                {/* Simulation 300 DPI (Net) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500" />
              </div>
              <span className="text-green-400 text-xs font-bold uppercase tracking-wider">300 DPI (Impression)</span>
            </div>
          </div>
        </section>

        {/* ── CALL TO ACTION ── */}
        <div className="bg-blue-50 rounded-3xl p-8 sm:p-12 text-center border border-blue-100 mt-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-blue-900 mb-4">Vos fichiers sont prêts ?</h2>
          <p className="text-blue-700 mb-8 max-w-xl mx-auto">
            Nous acceptons les fichiers <strong>PDF (recommandé)</strong>, Illustrator (.ai), Photoshop (.psd), JPEG et PNG HD.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/catalogue" className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors">
              Découvrir le catalogue
            </Link>
            <Link href="/contact" className="bg-white text-blue-600 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors border border-blue-200">
              J'ai besoin d'aide technique
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
