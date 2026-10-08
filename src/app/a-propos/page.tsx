import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, Zap, ShieldCheck, ArrowRight, Printer, PenTool, Box, Mail } from 'lucide-react'

export const metadata = {
  title: 'À Propos de YopoePrint — Imprimerie en ligne au Burkina Faso',
  description: 'Découvrez l\'histoire, les engagements et le parc machine de YopoePrint, le leader de l\'impression en ligne.',
}

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1598970420556-9cc357c9c0dc?q=80&w=2000&auto=format&fit=crop"
            alt="Imprimerie YopoePrint"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
              Révolutionner l'imprimerie au <span className="text-primary">Burkina Faso.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl">
              YopoePrint est née d'une conviction simple : l'accès à une impression de qualité professionnelle devrait être rapide, transparent et accessible en quelques clics depuis Ouagadougou jusqu'aux frontières.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/catalogue" className="bg-primary text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-primary/90 transition-all hover:scale-105 shadow-xl shadow-primary/20">
                Découvrir le catalogue
              </Link>
              <Link href="/contact" className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/10">
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NOTRE HISTOIRE / MISSION ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square relative rounded-3xl overflow-hidden shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?q=80&w=1000&auto=format&fit=crop"
                  alt="Équipe au travail"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-3xl shadow-xl hidden md:block max-w-xs border border-gray-100">
                <p className="font-display text-4xl font-extrabold text-primary mb-2">10+</p>
                <p className="font-bold text-gray-900 mb-1">Années d'expertise</p>
                <p className="text-sm text-gray-500">Dans le domaine des arts graphiques et de la production industrielle.</p>
              </div>
            </div>
            
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                Fini les allers-retours interminables chez l'imprimeur.
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Historiquement, commander des supports de communication au Burkina Faso nécessitait des déplacements physiques, de longues négociations pour les devis, et un suivi complexe.
                </p>
                <p>
                  En créant YopoePrint, nous avons digitalisé l'intégralité de ce processus. De la configuration du produit au paiement via Mobile Money (Orange, Moov), en passant par l'upload sécurisé de vos fichiers de conception.
                </p>
                <p className="font-bold text-gray-900">
                  Notre mission : Vous faire gagner du temps pour que vous puissiez vous concentrer sur votre cœur de métier.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PARC MACHINE (TECHNIQUE) ─── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Notre Parc Machine</h2>
            <p className="text-gray-500 text-lg">Nous investissons continuellement dans les technologies de pointe pour vous garantir une qualité irréprochable sur tous les formats.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Printer size={28} />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Presses Numériques HD</h3>
              <p className="text-gray-500 leading-relaxed mb-6">
                Idéal pour les petites et moyennes séries (cartes, flyers, brochures). Qualité colorimétrique exceptionnelle et temps de chauffe ultra-rapide pour vos commandes urgentes.
              </p>
              <ul className="space-y-2 text-sm font-medium text-gray-700">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Calibrage automatique CMJN</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Rendu offset-like</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Box size={28} />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Presses Offset Industrielles</h3>
              <p className="text-gray-500 leading-relaxed mb-6">
                La référence pour les très gros volumes (magazines, catalogues, packaging). Rendu des couleurs Pantone parfait et coûts unitaires extrêmement bas.
              </p>
              <ul className="space-y-2 text-sm font-medium text-gray-700">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Jusqu'à 15 000 feuilles/heure</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Vernis acrylique en ligne</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <PenTool size={28} />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Traceurs Grand Format</h3>
              <p className="text-gray-500 leading-relaxed mb-6">
                Pour l'événementiel et la signalétique : Bâches, kakémonos, vinyles adhésifs. Encre latex écologique résistante aux UV et aux intempéries (spécial climat ouest-africain).
              </p>
              <ul className="space-y-2 text-sm font-medium text-gray-700">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Découpe mi-chair intégrée</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> Laize jusqu'à 3,20 mètres</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NOTRE EQUIPE ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Derrière les machines, des humains.</h2>
            <p className="text-gray-500 text-lg">Nos experts en pré-presse et conducteurs de machines veillent chaque jour à sublimer vos créations graphiques.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Abdoulaye S.', role: 'Directeur de Production', img: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=500&auto=format&fit=crop' },
              { name: 'Sarah O.', role: 'Responsable Pré-presse', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=500&auto=format&fit=crop' },
              { name: 'Karim D.', role: 'Conducteur Offset', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop' },
              { name: 'Fatimata Z.', role: 'Service Client', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=500&auto=format&fit=crop' },
            ].map((member, i) => (
              <div key={i} className="text-center group">
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-4 border-4 border-white shadow-xl group-hover:scale-105 transition-transform">
                  <Image src={member.img} alt={member.name} fill className="object-cover" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                <p className="text-primary font-bold text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CALL TO ACTION FINAL ─── */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center relative z-10">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-6">Prêt à imprimer avec le leader ?</h2>
          <p className="text-xl text-gray-300 mb-10">Testez notre qualité sur votre prochaine commande. Nous sommes sûrs que vous ne pourrez plus vous en passer.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/catalogue" className="bg-primary text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-primary/90 transition-all hover:scale-105 shadow-xl shadow-primary/20">
              Voir tous les produits
            </Link>
            <Link href="/devis" className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/10 flex items-center gap-2">
              <Mail size={18} /> Demander un devis B2B
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
