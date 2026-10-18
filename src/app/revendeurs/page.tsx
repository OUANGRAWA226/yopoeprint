'use client'

import { useState } from 'react'
import { Sparkles, ShieldCheck, Mail, Phone, Building, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function RevendeursPage() {
 const [formData, setFormData] = useState({
 company: '',
 contactName: '',
 email: '',
 phone: '',
 volume: 'medium',
 message: '',
 })
 const [loading, setLoading] = useState(false)
 const [success, setSuccess] = useState(false)

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault()
 setLoading(true)

 // Simulation de l'envoi de la demande de partenariat
 setTimeout(() => {
 setLoading(false)
 setSuccess(true)
 }, 1500)
 }

 return (
 <div className="min-h-screen bg-gray-50">
 
 {/* Hero Banner */}
 <section className=" bg-secondary text-white py-16 text-center relative overflow-hidden">
 <div className="absolute inset-0 opacity-[0.03]"
 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/svg%3E")` }}
 />
 <div className="max-w-3xl mx-auto px-6 relative z-10">
 <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30
 text-primary text-xs font-bold px-3.5 py-1.5 rounded-full
 mb-4 uppercase tracking-widest">
 <Sparkles size={12} className="text-primary" />
 Espace Professionnels de la Communication
 </div>
 <h1 className="font-display text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
 Programme Revendeurs & Partenaires B2B
 </h1>
 <p className="text-white/80 text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
 Agences, graphistes, imprimeurs indépendants : externalisez votre production chez YopoePrint et bénéficiez de tarifs préférentiels exclusifs et de services sur-mesure.
 </p>
 </div>
 </section>

 {/* Main Body */}
 <div className="max-w-6xl mx-auto px-6 py-12">
 <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
 
 {/* Perks Section */}
 <div className="space-y-8">
 <div>
 <div className="gold-bar" />
 <h2 className="section-title">Pourquoi rejoindre notre réseau ?</h2>
 <p className="text-gray-400 text-sm mt-1">Des avantages exclusifs pensés pour faciliter l&apos;activité des professionnels.</p>
 </div>

 <div className="grid sm:grid-cols-2 gap-6">
 {[
 {
 icon: '🏷️',
 title: '15% de réduction permanente',
 desc: 'Profitez de tarifs privilégiés sur tout notre catalogue de produits, dès votre première commande.'
 },
 {
 icon: '📦',
 title: 'Livraison en marque blanche',
 desc: 'Nous expédions vos commandes directement chez vos clients finaux dans des emballages neutres, sans logo YopoePrint.'
 },
 {
 icon: '👑',
 title: 'Support client prioritaire',
 desc: 'Un conseiller technique dédié prend en charge vos demandes de devis complexes et vos validations de fichiers.'
 },
 {
 icon: '💳',
 title: 'Facilités de paiement',
 desc: 'Après validation de votre dossier, accédez à des options de facturation mensuelle pour optimiser votre trésorerie.'
 }
 ].map((perk, i) => (
 <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
 <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-2xl">
 {perk.icon}
 </div>
 <h3 className="font-bold text-foreground text-base">{perk.title}</h3>
 <p className="text-gray-500 text-xs leading-relaxed">{perk.desc}</p>
 </div>
 ))}
 </div>

 {/* Testimonial */}
 <div className="bg-secondary border border-border/10 rounded-2xl p-6 relative">
 <span className="text-4xl text-primary absolute top-4 left-4 opacity-30 select-none font-display">“</span>
 <p className="text-sm italic text-foreground/80 leading-relaxed pl-6 relative z-10">
 Depuis que nous travaillons avec YopoePrint pour l&apos;impression des flyers et cartes de visite de nos clients à Ouagadougou, nous avons divisé nos délais de production par deux tout en conservant une marge confortable grâce à la remise revendeur.
 </p>
 <div className="mt-4 pl-6 flex items-center gap-3">
 <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-foreground text-xs">
 IK
 </div>
 <div>
 <h4 className="font-bold text-foreground text-xs">Ibrahim Kabore</h4>
 <p className="text-2xs text-gray-400">Directeur d&apos;Agence Créative — Ouagadougou</p>
 </div>
 </div>
 </div>
 </div>

 {/* Form Section */}
 <aside className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md h-fit">
 {success ? (
 <div className="text-center py-8 space-y-4">
 <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
 <CheckCircle2 size={36} />
 </div>
 <h3 className="font-display text-xl font-bold text-foreground">Demande reçue !</h3>
 <p className="text-xs text-gray-500 leading-relaxed">
 Merci pour l&apos;intérêt que vous portez à YopoePrint. Un account manager analysera votre profil de revendeur et vous contactera sous <strong>24 heures</strong> pour valider l&apos;accès à vos tarifs réduits.
 </p>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-4">
 <h3 className="font-display text-lg font-bold text-foreground">Devenir Revendeur</h3>
 <p className="text-xs text-gray-400">
 Veuillez remplir ce formulaire. Notre équipe examinera votre demande de partenariat professionnel.
 </p>

 {/* Nom entreprise */}
 <div className="space-y-1">
 <label className="text-2xs font-bold text-foreground uppercase tracking-wider">Société / Agence *</label>
 <div className="relative">
 <Building className="absolute left-3.5 top-3 text-gray-300" size={16} />
 <input
 type="text"
 required
 placeholder="Nom de l'entreprise"
 value={formData.company}
 onChange={(e) => setFormData({ ...formData, company: e.target.value })}
 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors text-xs"
 />
 </div>
 </div>

 {/* Nom de contact */}
 <div className="space-y-1">
 <label className="text-2xs font-bold text-foreground uppercase tracking-wider">Nom du contact *</label>
 <input
 type="text"
 required
 placeholder="Prénom et Nom"
 value={formData.contactName}
 onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
 className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors text-xs"
 />
 </div>

 {/* E-mail */}
 <div className="space-y-1">
 <label className="text-2xs font-bold text-foreground uppercase tracking-wider">E-mail pro *</label>
 <div className="relative">
 <Mail className="absolute left-3.5 top-3 text-gray-300" size={16} />
 <input
 type="email"
 required
 placeholder="contact@entreprise.com"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors text-xs"
 />
 </div>
 </div>

 {/* Téléphone */}
 <div className="space-y-1">
 <label className="text-2xs font-bold text-foreground uppercase tracking-wider">Numéro de téléphone *</label>
 <div className="relative">
 <Phone className="absolute left-3.5 top-3 text-gray-300" size={16} />
 <input
 type="tel"
 required
 placeholder="+226 70 00 00 00"
 value={formData.phone}
 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors text-xs"
 />
 </div>
 </div>

 {/* Volume de commande estimé */}
 <div className="space-y-1">
 <label className="text-2xs font-bold text-foreground uppercase tracking-wider">Volume de commande mensuel</label>
 <select
 value={formData.volume}
 onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
 className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors text-xs"
 >
 <option value="low">Moins de 100 000 FCFA / mois</option>
 <option value="medium">100 000 à 500 000 FCFA / mois</option>
 <option value="high">Plus de 500 000 FCFA / mois</option>
 </select>
 </div>

 {/* Message */}
 <div className="space-y-1">
 <label className="text-2xs font-bold text-foreground uppercase tracking-wider">Parlez-nous de vos besoins</label>
 <textarea
 rows={3}
 placeholder="Quels sont les types de supports d'impression que vous externalisez le plus fréquemment ?"
 value={formData.message}
 onChange={(e) => setFormData({ ...formData, message: e.target.value })}
 className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors text-xs resize-none"
 />
 </div>

 {/* Submit button */}
 <button
 type="submit"
 disabled={loading}
 className="w-full flex items-center justify-center gap-2 py-3 bg-foreground hover:bg-foreground text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50 shadow-md"
 >
 {loading ? (
 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
 ) : (
 <>
 Déposer ma candidature
 <ArrowRight size={13} />
 </>
 )}
 </button>
 </form>
 )}
 </aside>

 </div>
 </div>

 </div>
 )
}
