'use client'

import { useState } from 'react'
import { 
  Settings, 
  Store, 
  Bell, 
  ShieldCheck, 
  Save, 
  Loader2,
  CheckCircle
} from 'lucide-react'

export default function AdminParametresPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Mock State
  const [form, setForm] = useState({
    shopName: 'YopoePrint',
    contactEmail: 'contact@yopoeprint.bf',
    contactPhone: '+226 70 00 00 00',
    shippingFee: 2000,
    freeShippingThreshold: 50000,
    maintenanceMode: false,
    orderNotifications: true
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
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Paramètres</h1>
          <p className="text-gray-500 text-sm">Configurez les informations générales et le comportement de votre boutique.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary transition-all disabled:opacity-50"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Enregistrement...</> : <><Save size={16} /> Enregistrer</>}
        </button>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-xl flex items-center gap-3 text-sm font-bold animate-in slide-in-from-top-2">
          <CheckCircle size={18} />
          Paramètres mis à jour avec succès.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* ── COLONNE NAVIGATION (optionnelle si on voulait faire des tabs, ici statique) ── */}
        <div className="hidden md:block col-span-1 space-y-2 sticky top-24">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white text-gray-900 font-bold rounded-xl border border-gray-200 shadow-sm text-sm">
            <Store size={18} className="text-primary" /> Informations Générales
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-white hover:text-gray-900 font-medium rounded-xl transition-colors text-sm">
            <Settings size={18} /> E-Commerce & Livraison
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-white hover:text-gray-900 font-medium rounded-xl transition-colors text-sm">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-white hover:text-gray-900 font-medium rounded-xl transition-colors text-sm">
            <ShieldCheck size={18} /> Sécurité & Système
          </button>
        </div>

        {/* ── COLONNE CONTENU ── */}
        <div className="col-span-1 md:col-span-2 space-y-8">

          {/* Section Informations */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Store size={20} className="text-gray-400" /> Informations Générales
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Nom de la boutique</label>
                <input 
                  type="text" 
                  name="shopName"
                  value={form.shopName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email public de contact</label>
                  <input 
                    type="email" 
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Téléphone (Service Client)</label>
                  <input 
                    type="text" 
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section E-Commerce */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings size={20} className="text-gray-400" /> E-Commerce & Livraison
            </h2>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Frais de livraison par défaut (FCFA)</label>
                  <input 
                    type="number" 
                    name="shippingFee"
                    value={form.shippingFee}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Livraison gratuite à partir de (FCFA)</label>
                  <input 
                    type="number" 
                    name="freeShippingThreshold"
                    value={form.freeShippingThreshold}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Système & Sécurité */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShieldCheck size={20} className="text-gray-400" /> Système & Sécurité
            </h2>
            
            <div className="space-y-5">
              
              <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors group">
                <div className="mt-0.5">
                  <input 
                    type="checkbox" 
                    name="orderNotifications"
                    checked={form.orderNotifications}
                    onChange={handleChange}
                    className="w-5 h-5 accent-primary border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Notifications de commandes</p>
                  <p className="text-gray-500 text-xs mt-1">Recevoir un email à chaque nouvelle commande ou demande de devis.</p>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 border border-orange-200 bg-orange-50/50 rounded-xl cursor-pointer hover:bg-orange-50 transition-colors group">
                <div className="mt-0.5">
                  <input 
                    type="checkbox" 
                    name="maintenanceMode"
                    checked={form.maintenanceMode}
                    onChange={handleChange}
                    className="w-5 h-5 accent-orange-500 border-orange-300 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <p className="font-bold text-orange-900 text-sm">Mode Maintenance</p>
                  <p className="text-orange-700 text-xs mt-1">Activer ce mode bloque l'accès au site public pour les clients. Utile lors d'une grosse mise à jour du catalogue.</p>
                </div>
              </label>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
