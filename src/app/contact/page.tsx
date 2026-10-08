'use client'

import { useState } from 'react'
import { 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  Send,
  CheckCircle,
  Loader2
} from 'lucide-react'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulation d'envoi
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    }, 1500)
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* ── HEADER BANNÈRE ── */}
      <div className="bg-indigo-950 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center text-white space-y-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold">Contactez-nous</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
            Une question sur une commande, besoin d'un conseil technique ou d'un devis sur-mesure ? Notre équipe à Ouagadougou est là pour vous.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* ── COLONNE INFORMATIONS (GAUCHE) ── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Carte Infos */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Nos Coordonnées</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Adresse</p>
                    <p className="text-gray-500 text-sm mt-1">Ouagadougou, Burkina Faso<br/>(Retrait sur rendez-vous)</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Téléphone</p>
                    <p className="text-gray-500 text-sm mt-1">+226 70 00 00 00</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Email</p>
                    <p className="text-gray-500 text-sm mt-1">contact@yopoeprint.bf</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Heures d'ouverture</p>
                    <p className="text-gray-500 text-sm mt-1">Lun - Ven : 08h00 - 18h00<br/>Samedi : 09h00 - 13h00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte WhatsApp */}
            <div className="bg-[#25D366] rounded-3xl p-8 text-white shadow-xl shadow-[#25D366]/20 relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-110 transition-transform duration-500">
                <MessageCircle size={150} />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-2">Réponse Rapide</h3>
                <p className="text-green-50 text-sm mb-6 leading-relaxed">
                  Notre équipe est très réactive sur WhatsApp. Envoyez-nous un message pour une assistance immédiate.
                </p>
                <a 
                  href="https://wa.me/22670000000" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-[#25D366] px-6 py-3 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors"
                >
                  <MessageCircle size={18} /> Discuter sur WhatsApp
                </a>
              </div>
            </div>

          </div>

          {/* ── COLONNE FORMULAIRE (DROITE) ── */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Envoyez-nous un message</h2>
            <p className="text-gray-500 text-sm mb-8">Nous vous répondrons par email dans les plus brefs délais (généralement sous 2h ouvrées).</p>

            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="font-bold text-green-900 text-xl mb-2">Message envoyé !</h3>
                <p className="text-green-700 text-sm">
                  Merci de nous avoir contactés. Notre équipe commerciale traitera votre demande très rapidement.
                </p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-6 text-sm font-bold text-green-600 hover:text-green-800 underline"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Nom complet</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Thomas Sankara"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Téléphone</label>
                    <input 
                      type="tel" 
                      placeholder="Ex: +226..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Adresse Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="vous@exemple.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Sujet de votre demande</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="">Sélectionnez un sujet...</option>
                    <option value="order">Question sur ma commande</option>
                    <option value="quote">Demande de devis spécifique</option>
                    <option value="technical">Aide technique (Fichiers)</option>
                    <option value="partnership">Partenariat B2B / Revendeur</option>
                    <option value="other">Autre demande</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Votre message</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="Détaillez votre besoin ici..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Envoi en cours...</> : <><Send size={18} /> Envoyer le message</>}
                </button>
              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  )
}
