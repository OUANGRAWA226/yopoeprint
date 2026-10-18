'use client'

import { useState } from 'react'
import { Search, ChevronDown, MessageSquare, Phone, MapPin, Mail, Paperclip, Send } from 'lucide-react'
import { useContact } from '@/lib/settings.service'

// ─── DONNÉES DE LA FAQ ──────────────────────────────────────────────────────────
const FAQ_CATEGORIES = ['Populaires', 'Fichiers & PAO', 'Paiement', 'Livraison']

const FAQ_DATA = [
  {
    category: 'Populaires',
    question: 'Puis-je annuler ou modifier ma commande après le paiement ?',
    answer: 'Une fois le paiement validé, la commande passe automatiquement en file d\'impression. Si le statut est encore "Fichiers attendus" ou "En traitement", vous pouvez nous contacter d\'urgence via WhatsApp pour la bloquer. Si le statut est "En impression", il n\'est malheureusement plus possible de la modifier.'
  },
  {
    category: 'Populaires',
    question: 'Faites-vous la création graphique si je n\'ai pas de design ?',
    answer: 'YopoePrint est avant tout une imprimerie (vous fournissez les fichiers). Cependant, nous proposons un service "Création Graphique" en option sur devis. Contactez notre équipe commerciale pour en discuter !'
  },
  {
    category: 'Fichiers & PAO',
    question: 'Quels formats de fichiers acceptez-vous ?',
    answer: 'Nous recommandons le format PDF (Export Qualité Presse / High Quality Print) avec les polices vectorisées. Nous acceptons également les fichiers AI (Illustrator), PSD (Photoshop), JPG ou PNG haute résolution (minimum 300 dpi).'
  },
  {
    category: 'Fichiers & PAO',
    question: 'Qu\'est-ce que le fond perdu et la marge de sécurité ?',
    answer: 'Le fond perdu (généralement 2 à 3 mm) est la zone qui déborde du format final pour éviter l\'apparition de bords blancs lors de la coupe. La marge de sécurité (3 mm à l\'intérieur) est la zone dans laquelle vous ne devez placer aucun texte ou logo important pour éviter qu\'il ne soit coupé.'
  },
  {
    category: 'Paiement',
    question: 'Comment payer par Orange Money ou Moov Money ?',
    answer: 'Lors de la validation de votre panier, sélectionnez "Mobile Money". Vous serez redirigé vers une plateforme sécurisée pour entrer votre numéro et confirmer le retrait via le code USSD sur votre téléphone.'
  },
  {
    category: 'Paiement',
    question: 'Puis-je payer à la livraison ?',
    answer: 'S\'agissant de produits 100% personnalisés, nous ne pouvons lancer la production qu\'après réception intégrale du paiement. Le paiement à la livraison n\'est donc pas disponible.'
  },
  {
    category: 'Livraison',
    question: 'Quels sont les délais de livraison à Ouagadougou ?',
    answer: 'La plupart de nos produits classiques (Flyers, Cartes, Affiches) sont livrés en 24h à 48h ouvrées après validation de vos fichiers. Les produits complexes (Goodies, Grands formats) peuvent nécessiter 3 à 5 jours.'
  },
  {
    category: 'Livraison',
    question: 'Livrez-vous en dehors de Ouagadougou (Bobo-Dioulasso, Koudougou...) ?',
    answer: 'Oui, nous expédions vos commandes dans les autres villes via nos compagnies de transport partenaires. Les frais d\'expédition (fret) sont à la charge du client et à régler à la gare lors du retrait.'
  }
]

// ─── COMPOSANTS ─────────────────────────────────────────────────────────────────

function Accordion({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden transition-all hover:border-gray-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none"
      >
        <span className="font-bold text-gray-900 pr-4">{question}</span>
        <ChevronDown 
          size={20} 
          className={`text-primary shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <div 
        className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
          {answer}
        </p>
      </div>
    </div>
  )
}

export default function FAQContactPage() {
  const contact = useContact()
  const [activeCategory, setActiveCategory] = useState('Populaires')
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrer les questions selon la recherche ou la catégorie
  const filteredFaqs = FAQ_DATA.filter(faq => {
    if (searchQuery) {
      return faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
             faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return faq.category === activeCategory
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* ─── HERO & RECHERCHE ─── */}
      <section className="bg-gray-900 pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white mb-6">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="text-gray-400 text-lg mb-10">
            Recherchez dans notre base de connaissances ou parcourez les questions fréquentes ci-dessous.
          </p>
          
          <div className="relative max-w-2xl mx-auto group">
            <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher une réponse (ex: fond perdu, livraison, délai...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white rounded-2xl text-lg font-medium text-gray-900 placeholder-gray-400 outline-none focus:ring-4 focus:ring-primary/20 shadow-xl transition-all"
            />
          </div>
        </div>
      </section>

      {/* ─── CONTENU PRINCIPAL (FAQ + CONTACT) ─── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* COLONNE GAUCHE : FAQ */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Tabs Catégories */}
            {!searchQuery && (
              <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
                {FAQ_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2
                      ${activeCategory === cat 
                        ? 'bg-gray-900 border-gray-900 text-white' 
                        : 'bg-white border-white text-gray-500 hover:border-gray-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {searchQuery && (
              <p className="font-bold text-gray-900 text-lg">
                Résultats pour "{searchQuery}" ({filteredFaqs.length})
              </p>
            )}

            {/* Liste Accordéons */}
            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, i) => (
                  <Accordion key={i} question={faq.question} answer={faq.answer} />
                ))
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                  <p className="text-gray-500 mb-2">Aucune réponse trouvée pour "{searchQuery}".</p>
                  <p className="text-sm font-medium text-gray-900">N'hésitez pas à utiliser notre formulaire de contact !</p>
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE : CONTACT */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-32">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-gray-900">Nous contacter</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">Assistance rapide</p>
                </div>
              </div>

              <form className="space-y-4 mb-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Prénom</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nom</label>
                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</label>
                  <textarea rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary outline-none transition-all resize-none"></textarea>
                </div>

                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Paperclip className="w-6 h-6 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-500 font-medium">Joindre un fichier (Capture d'écran, PDF...)</p>
                      </div>
                      <input type="file" className="hidden" />
                  </label>
                </div>

                <button type="button" className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-primary hover:text-gray-900 transition-all shadow-md group mt-2">
                  <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                  Envoyer le message
                </button>
              </form>

              {/* Coordonnées Directes */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Téléphone & WhatsApp</p>
                    <p className="text-sm text-gray-500 mt-0.5">{contact.phoneDisplay}</p>
                    <p className="text-2xs text-gray-600 mt-1">Lun-Sam, 8h00 - 18h00</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Email Support</p>
                    <p className="text-sm text-gray-500 mt-0.5">{contact.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Adresse</p>
                    <p className="text-sm text-gray-500 mt-0.5">{contact.address}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

    </div>
  )
}
