import Link from 'next/link'

const FOOTER_LINKS = {
  produits: [
    { label: 'Flyers & Dépliants', href: '/catalogue/flyers' },
    { label: 'Cartes de visite', href: '/catalogue/cartes' },
    { label: 'Affiches & Posters', href: '/catalogue/affiches' },
    { label: 'Brochures', href: '/catalogue/brochures' },
    { label: 'Roll-up & Kakémonos', href: '/catalogue/roll-up' },
    { label: 'Goodies personnalisés', href: '/catalogue/goodies' },
    { label: '→ Tout le catalogue', href: '/catalogue' },
  ],
  services: [
    { label: 'Demander un devis', href: '/devis' },
    { label: 'Qui sommes-nous ?', href: '/a-propos' },
    { label: 'Suivi de commande', href: '/suivi' },
    { label: 'Programme fidélité', href: '/fidelite' },
    { label: 'Offres entreprises', href: '/entreprises' },
    { label: 'Blog & Ressources', href: '/blog' },
  ],
  aide: [
    { label: 'Foire aux questions', href: '/faq' },
    { label: 'Préparer son fichier', href: '/faq/fichiers' },
    { label: 'Délais de livraison', href: '/livraison' },
    { label: 'Nous contacter', href: '/contact' },
    { label: 'Conditions de vente', href: '/cgv' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 md:pb-0 pb-20">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pb-8 md:pb-12 border-b border-white/10">

          {/* Brand — full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight block mb-3">
              Yopoe<span className="text-primary">Print</span>
            </Link>
            <p className="text-sm leading-relaxed mb-4 max-w-xs">
              Votre imprimerie en ligne de référence au Burkina Faso.
            </p>

            {/* Payment methods — prominent on mobile */}
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">
              Paiements acceptés
            </p>
            <div className="flex flex-wrap gap-2">
              {['📱 Orange Money', '💙 Moov Money', 'Visa', 'Mastercard'].map((p) => (
                <span key={p} className="bg-white/10 border border-white/15 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-300">
                  {p}
                </span>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[11px] text-gray-500 mb-0.5">Besoin d'aide ?</p>
              <p className="text-base font-bold text-primary">+226 70 00 00 00</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Lun–Sam · 8h–18h (WhatsApp)</p>
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Produits', links: FOOTER_LINKS.produits },
            { title: 'Services', links: FOOTER_LINKS.services },
            { title: 'Aide', links: FOOTER_LINKS.aide },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-primary text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-3 md:mb-4">
                {title}
              </h4>
              <ul className="space-y-2 md:space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-[13px] text-gray-400 hover:text-primary transition-colors leading-snug">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-4 md:px-6 py-4 max-w-7xl mx-auto flex
                      flex-col sm:flex-row items-center justify-between gap-2 text-[11px] md:text-[12px] text-gray-500">
        <span>© 2025 YopoePrint · Ouagadougou, Burkina Faso</span>
        <span>Fait avec ❤️ au Burkina</span>
      </div>
    </footer>
  )
}
