'use client'

import { useState } from 'react'
import { 
  PackageSearch, 
  Upload, 
  Save, 
  Loader2,
  CheckCircle,
  Building,
  MapPin,
  Phone
} from 'lucide-react'

export default function MarqueBlanchePage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Mock State
  const [form, setForm] = useState({
    companyName: 'Studio Graphique XYZ',
    phone: '+226 70 00 11 22',
    address: 'Secteur 12, Ouagadougou',
    email: 'contact@studio-xyz.bf',
    includeInvoice: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = () => {
    setLoading(true)
    setSuccess(false)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }, 1500)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
            <PackageSearch size={28} className="text-blue-600" />
            Marque Blanche
          </h1>
          <p className="text-gray-500 text-sm">Configurez l'identité qui apparaîtra sur les colis de vos clients.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Enregistrement...</> : <><Save size={16} /> Enregistrer</>}
        </button>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-xl flex items-center gap-3 text-sm font-bold animate-in slide-in-from-top-2">
          <CheckCircle size={18} />
          Configuration de la marque blanche mise à jour avec succès.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ── FORMULAIRE IDENTITÉ ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Identité de l'Expéditeur</h2>
          
          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                <Building size={14} /> Nom de votre entreprise
              </label>
              <input 
                type="text" 
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                <MapPin size={14} /> Adresse (imprimée sur le bordereau)
              </label>
              <input 
                type="text" 
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  <Phone size={14} /> Téléphone SAV
                </label>
                <input 
                  type="text" 
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email SAV</label>
                <input 
                  type="email" 
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── LOGO & PREFERENCE ── */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Logo (Optionnel)</h2>
            
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload size={20} />
              </div>
              <p className="font-bold text-gray-900 text-sm">Cliquez pour charger votre logo</p>
              <p className="text-xs text-gray-500 mt-1">Format PNG, fond transparent recommandé.</p>
              <p className="text-xs text-gray-400 mt-0.5">Ce logo remplacera celui de YopoePrint sur le bon de livraison de vos clients.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="mt-0.5">
                <input 
                  type="checkbox" 
                  name="includeInvoice"
                  checked={form.includeInvoice}
                  onChange={handleChange}
                  className="w-5 h-5 accent-blue-600 border-gray-300 rounded cursor-pointer"
                />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">Ne pas insérer de facture dans le colis</p>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                  Si vous cochez cette case, nous expédierons le colis avec uniquement le bon de livraison à votre nom. Aucune facture mentionnant nos tarifs B2B ne sera vue par votre client.
                </p>
              </div>
            </label>
          </div>

        </div>

      </div>
    </div>
  )
}
