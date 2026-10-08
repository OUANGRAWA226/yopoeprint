'use client'

import { useState } from 'react'
import { X, Send, CheckCircle2 } from 'lucide-react'

interface DevisPopupProps {
 isOpen: boolean
 onClose: () => void
 defaultProductName?: string
}

export function DevisPopup({ isOpen, onClose, defaultProductName = '' }: DevisPopupProps) {
 const [formData, setFormData] = useState({
 name: '',
 email: '',
 phone: '',
 productName: defaultProductName,
 quantity: '',
 dimensions: '',
 description: '',
 })
 const [loading, setLoading] = useState(false)
 const [success, setSuccess] = useState(false)

 if (!isOpen) return null

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault()
 setLoading(true)

 // Simulation de l'appel d'API devis
 setTimeout(() => {
 setLoading(false)
 setSuccess(true)
 setTimeout(() => {
 // Reset and close after a short delay
 setSuccess(false)
 setFormData({
 name: '',
 email: '',
 phone: '',
 productName: defaultProductName,
 quantity: '',
 dimensions: '',
 description: '',
 })
 onClose()
 }, 3000)
 }, 1500)
 }

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
 <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
 
 {/* Header */}
 <div className="bg-primary text-foreground px-6 py-4 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="text-xl">✏️</span>
 <h3 className="font-display font-bold text-base">Demande de Devis Sur-Mesure</h3>
 </div>
 <button
 onClick={onClose}
 className="text-foreground/70 hover:text-foreground transition-colors p-1 rounded-lg hover:bg-black/5"
 >
 <X size={18} />
 </button>
 </div>

 {/* Content */}
 {success ? (
 <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
 <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center animate-bounce">
 <CheckCircle2 size={36} />
 </div>
 <h4 className="font-display text-xl font-bold text-foreground">Devis Envoyé avec Succès !</h4>
 <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
 Notre équipe d&apos;imprimerie étudie votre demande. Un conseiller vous contactera par téléphone ou e-mail sous <strong>2h ouvrées</strong>.
 </p>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm text-gray-600">
 <p className="text-xs text-gray-400">
 Remplissez ce formulaire pour les travaux d&apos;imprimerie spéciaux (formats géants, finitions complexes, reliures spécifiques).
 </p>

 {/* Nom complet */}
 <div className="space-y-1">
 <label className="text-xs font-bold text-foreground">Nom complet *</label>
 <input
 type="text"
 required
 placeholder="Votre nom ou nom d'entreprise"
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 className="w-full px-3.5 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors text-sm"
 />
 </div>

 {/* Email & Phone */}
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="text-xs font-bold text-foreground">E-mail *</label>
 <input
 type="email"
 required
 placeholder="exemple@mail.com"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 className="w-full px-3.5 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors text-sm"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-foreground">Téléphone *</label>
 <input
 type="tel"
 required
 placeholder="+226 70 00 00 00"
 value={formData.phone}
 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
 className="w-full px-3.5 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors text-sm"
 />
 </div>
 </div>

 {/* Nom produit */}
 <div className="space-y-1">
 <label className="text-xs font-bold text-foreground">Type de produit *</label>
 <input
 type="text"
 required
 placeholder="Ex: Brochure spirale, Rollup 120x200..."
 value={formData.productName}
 onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
 className="w-full px-3.5 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors text-sm"
 />
 </div>

 {/* Quantité & Dimensions */}
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="text-xs font-bold text-foreground">Quantité souhaitée *</label>
 <input
 type="text"
 required
 placeholder="Ex: 250, 1000..."
 value={formData.quantity}
 onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
 className="w-full px-3.5 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors text-sm"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-foreground">Dimensions / Format</label>
 <input
 type="text"
 placeholder="Ex: 50x70cm, A2..."
 value={formData.dimensions}
 onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
 className="w-full px-3.5 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors text-sm"
 />
 </div>
 </div>

 {/* Description détaillée */}
 <div className="space-y-1">
 <label className="text-xs font-bold text-foreground">Spécifications additionnelles *</label>
 <textarea
 required
 rows={3}
 placeholder="Décrivez votre besoin : type de papier particulier, pelliculage or, reliure thermocollée, etc."
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 className="w-full px-3.5 py-2 border-2 border-gray-100 rounded-xl outline-none focus:border-primary transition-colors text-sm resize-none"
 />
 </div>

 {/* Submit Button */}
 <button
 type="submit"
 disabled={loading}
 className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-foreground hover:bg-foreground text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-md"
 >
 {loading ? (
 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
 ) : (
 <>
 <Send size={15} />
 Envoyer ma demande
 </>
 )}
 </button>
 </form>
 )}

 </div>
 </div>
 )
}
