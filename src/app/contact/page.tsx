'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  Send,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  ShieldCheck,
  FileCheck,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Building2,
  ArrowRight
} from 'lucide-react'

// Sujets pré-configurés
const SUBJECT_OPTIONS = [
  { id: 'quote', label: 'Devis sur mesure', desc: 'Grands tirages ou projet spécifique' },
  { id: 'order', label: 'Suivi de commande', desc: 'État de production & expédition' },
  { id: 'bat', label: 'Contrôle BAT / Fichiers', desc: 'Normes PAO, fonds perdus & CMJN' },
  { id: 'b2b', label: 'Compte Entreprise (DGI)', desc: 'Facture normalisée & conditions pro' },
  { id: 'other', label: 'Autre demande', desc: 'Question générale ou partenariat' },
]

// FAQ rapide pour réduire les frictions
const FAQS = [
  {
    q: "Quels sont vos délais moyens d'impression et de livraison ?",
    a: "Nos délais standards sont de 24h à 72h ouvrées selon le produit. Pour les urgences à Ouagadougou, notre service Express permet une livraison le jour même sur une sélection de produits (cartes, flyers, roll-up)."
  },
  {
    q: "Puis-je retirer ma commande directement à l'atelier ?",
    a: "Oui, le retrait en atelier ou en showroom à Ouagadougou est 100% gratuit. Vous recevrez une notification SMS/WhatsApp dès que votre colis est prêt."
  },
  {
    q: "Délivrez-vous des factures normalisées avec sticker DGI ?",
    a: "Absolument. YopoePrint est une entreprise officiellement enregistrée au Burkina Faso. Chaque commande professionnelle s'accompagne d'une facture normalisée conforme e-Sintax / DGI avec TVA légale."
  },
  {
    q: "Quels formats de fichiers acceptez-vous pour l'impression ?",
    a: "Nous recommandons le PDF haute définition (PDF/X-1a ou PDF/X-4) avec 300 DPI, profil CMJN (FOGRA39) et 3 mm de fonds perdus. Nous acceptons également les fichiers Illustrator (.ai), Photoshop (.psd) et images haute résolution."
  }
]

export default function ContactPage() {
  const [selectedSubject, setSelectedSubject] = useState('quote')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleCopy = (text: string, type: 'phone' | 'email') => {
    navigator.clipboard.writeText(text)
    if (type === 'phone') {
      setCopiedPhone(true)
      setTimeout(() => setCopiedPhone(false), 2000)
    } else {
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulation d'envoi avec feedback fluide
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
    }, 1200)
  }

  return (
    <div className="bg-slate-50/60 min-h-screen text-slate-800">
      
      {/* ── HEADER ARCHITECTURAL SLATE-950 ── */}
      <section className="relative bg-slate-950 text-white pt-16 pb-28 px-4 overflow-hidden">
        {/* Grille technique d'imprimerie en arrière-plan */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none" 
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '36px 36px'
          }}
        />
        
        {/* Glow doux */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          
          {/* Fil d'Ariane & Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-primary">Contact & Support</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Atelier & Showroom de production • Ouagadougou</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Parlons de vos projets d'impression
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Conseil technique pré-presse, devis sur mesure ou suivi de commande : 
            nos experts vous répondent à Ouagadougou avec réactivité et rigueur.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-primary" /> Réponse moyenne : <strong>15 minutes</strong>
            </span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <FileCheck size={14} className="text-emerald-400" /> Factures normalisées <strong>DGI e-Sintax</strong>
            </span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary" /> Vérification PAO <strong>100% offerte</strong>
            </span>
          </div>
        </div>
      </section>

      {/* ── CONTENU PRINCIPAL EN GRILLE ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── COLONNE GAUCHE : COORDONNÉES & WHATSAPP PRO (5 colonnes) ── */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Carte Coordonnées Principales */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 border border-slate-200/80">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900">Coordonnées directes</h2>
                  <p className="text-xs text-slate-500 mt-0.5">YopoePrint Burkina Faso</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                  <Building2 size={20} />
                </div>
              </div>
              
              <div className="divide-y divide-slate-100">
                
                {/* Téléphone Hotline */}
                <div className="py-4.5 first:pt-4 last:pb-0 group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                        <Phone size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Téléphone standard</p>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-800">Direct</span>
                        </div>
                        <a 
                          href="tel:+22670000000" 
                          className="font-bold text-slate-900 text-base hover:text-primary transition-colors block mt-0.5"
                        >
                          +226 70 00 00 00
                        </a>
                        <p className="text-xs text-slate-500 mt-0.5">Fixe atelier : +226 25 30 00 00</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy('+22670000000', 'phone')}
                      title="Copier le numéro"
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      aria-label="Copier le numéro"
                    >
                      {copiedPhone ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                {/* Email Service Client */}
                <div className="py-4.5 group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
                        <Mail size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Courriel officiel</p>
                        <a 
                          href="mailto:contact@yopoeprint.bf" 
                          className="font-bold text-slate-900 text-sm sm:text-base hover:text-primary transition-colors block mt-0.5"
                        >
                          contact@yopoeprint.bf
                        </a>
                        <p className="text-xs text-slate-500 mt-0.5">Devis : devis@yopoeprint.bf</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy('contact@yopoeprint.bf', 'email')}
                      title="Copier l'email"
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      aria-label="Copier l'email"
                    >
                      {copiedEmail ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                {/* Adresse & Retrait atelier */}
                <div className="py-4.5">
                  <div className="flex gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center justify-center shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Showroom & Retrait</p>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">
                        Zone Industrielle de Kossodo & Centre-ville
                      </p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Ouagadougou, Burkina Faso.<br />
                        <span className="text-emerald-700 font-medium">Point retrait gratuit disponible sans frais.</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Horaires d'ouverture */}
                <div className="pt-4.5">
                  <div className="flex gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Horaires d'atelier</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ouvert
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        Lundi au Vendredi : 08h00 – 18h30
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Samedi : 08h30 – 13h30 (Permanence livraison)
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Carte WhatsApp Pro Redesignée (Élégante & B2B) */}
            <div className="relative bg-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-xl shadow-slate-900/10 border border-slate-800 overflow-hidden">
              {/* Reflet d'accent vert subtil */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Support WhatsApp Actif
                  </div>
                  <MessageCircle size={28} className="text-emerald-400" />
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    Assistance Instantanée WhatsApp
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed mt-1">
                    Besoin d'un retour immédiat sur vos fichiers PAO ou d'un devis rapide ? 
                    Échangez directement avec nos techniciens d'impression.
                  </p>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> Envoi de maquettes & BAT en direct
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> Suivi photo des commandes prêtes
                  </div>
                </div>

                <a 
                  href="https://wa.me/22670000000?text=Bonjour%20YopoePrint%2C%20j%27aimerais%20avoir%20des%20renseignements%20sur%20vos%20services%20d%27impression." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                >
                  <MessageCircle size={18} />
                  <span>Démarrer une conversation WhatsApp</span>
                </a>
              </div>
            </div>

          </div>

          {/* ── COLONNE DROITE : FORMULAIRE PRO AVEC SÉLECTEUR DE SUJET (7 colonnes) ── */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-9 shadow-xl shadow-slate-200/50 border border-slate-200/80">
            
            <div className="flex items-start justify-between pb-6 border-b border-slate-100">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900">
                  Transmettez votre demande
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Remplissez ce formulaire pour recevoir une réponse détaillée avec devis chiffré.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                <Sparkles size={14} /> Réponse sous 2h
              </div>
            </div>

            {success ? (
              <div className="py-12 text-center space-y-5 animate-in fade-in zoom-in-95 duration-400">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={36} />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="font-display text-2xl font-bold text-slate-900">Message bien reçu !</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Merci <strong>{fullName || 'cher client'}</strong>. Votre demande a été assignée à notre équipe commerciale à Ouagadougou. Vous recevrez un accusé et une proposition sous 2h ouvrées.
                  </p>
                </div>
                <div className="pt-4">
                  <button 
                    onClick={() => {
                      setSuccess(false)
                      setMessage('')
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  >
                    Envoyer une autre demande
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                
                {/* 1. Sélection du Sujet via Pills Visuelles */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Objet de votre demande <span className="text-primary">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SUBJECT_OPTIONS.map((opt) => {
                      const isSelected = selectedSubject === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedSubject(opt.id)}
                          className={`text-left p-3 rounded-xl border text-xs transition-all relative
                            ${isSelected 
                              ? 'border-primary bg-primary/5 text-primary shadow-sm font-semibold' 
                              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{opt.label}</span>
                            {isSelected && <Check size={14} className="text-primary" />}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{opt.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Coordonnées de contact (2 colonnes) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Nom complet <span className="text-primary">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Idrissa Ouédraogo"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Téléphone (WhatsApp de préférence) <span className="text-primary">*</span>
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex: +226 70 12 34 56"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 3. Email & Entreprise */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Adresse Email <span className="text-primary">*</span>
                    </label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@entreprise.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Société / Organisation <span className="text-slate-400 font-normal lowercase">(facultatif)</span>
                    </label>
                    <input 
                      type="text" 
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Ex: SA, SARL, Agence, ONG..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 4. Message détaillé */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Précisez votre demande ou cahier des charges <span className="text-primary">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Min. 10 caractères</span>
                  </div>
                  <textarea 
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Indiquez les quantités prévues, formats souhaités (A4, A5, sur-mesure), papier, finitions (vernis sélectif, pelliculage) et votre date butoir..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  />
                </div>

                {/* Note rassurante sur les fichiers */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileCheck size={16} className="text-primary shrink-0" />
                    <span>Vous avez déjà une maquette prête ? Vous pourrez la transmettre par email ou WhatsApp dès notre prise de contact.</span>
                  </div>
                </div>

                {/* Bouton d'envoi & Garanties */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Transmission en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Envoyer ma demande à l'atelier</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span>Devis gratuit sans engagement</span>
                  </div>
                </div>

              </form>
            )}

          </div>

        </div>

        {/* ── SECTION FAQ EXPANDABLE (RÉASSURANCE CLIENT) ── */}
        <div className="mt-16 bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-700">
              <HelpCircle size={20} />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900">Questions fréquentes</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Tout ce que vous devez savoir pour commander en toute sérénité.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 font-semibold text-slate-900 text-sm sm:text-base hover:text-primary transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown 
                      size={18} 
                      className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-primary' : ''}`} 
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in duration-200 pr-6">
                      {faq.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>

    </div>
  )
}
