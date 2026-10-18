'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { MapPin, Plus, Trash2, Edit2, CheckCircle, Home, Building2, Map } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'

interface Address {
  id: string
  fullName: string
  phone: string
  street: string
  neighborhood: string
  city: string
  isDefault: boolean
  labelType?: 'home' | 'work' | 'other'
}

const VILLES = ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora', 'Autre']

const EMPTY_FORM: Omit<Address, 'id'> = {
  fullName: '', phone: '', street: '', neighborhood: '', city: 'Ouagadougou', isDefault: false, labelType: 'home'
}

const toAddresses = (list: any[] = []): Address[] =>
  list.map((a: any, i: number) => ({ ...a, id: a.id || String(i), labelType: a.labelType || 'home' }))

export default function AdressesPage() {
  const { user, refreshUser } = useAuthContext()

  const [addresses, setAddresses] = useState<Address[]>(toAddresses(user?.addresses))
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Le profil arrive après le premier rendu (localStorage puis /auth/me)
  useEffect(() => {
    setAddresses(toAddresses(user?.addresses))
  }, [user])

  const set = (key: keyof typeof form) => (value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  // Enregistre la liste complète côté API (PATCH /users/me) puis recharge le profil
  const persist = async (next: Address[]) => {
    setSaving(true)
    setError('')
    try {
      await api.patch('/users/me', {
        addresses: next.map(({ id, labelType, fullName, phone, street, neighborhood, city, isDefault }) =>
          ({ id, labelType, fullName, phone, street, neighborhood, city, isDefault })),
      })
      await refreshUser()
      return true
    } catch (e: any) {
      setError(e?.message || "Impossible d'enregistrer vos adresses. Réessayez.")
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!form.fullName || !form.phone || !form.city || !form.street) {
      setError('Renseignez le nom, le téléphone, la rue et la ville.')
      return
    }
    const newAddr: Address = { ...form, id: editId || Date.now().toString() }

    let next = editId
      ? addresses.map((a) => a.id === editId ? newAddr : a)
      : [...addresses, newAddr]
    if (newAddr.isDefault) next = next.map((a) => ({ ...a, isDefault: a.id === newAddr.id }))

    if (!(await persist(next))) return

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
  }

  const handleEdit = (addr: Address) => {
    setForm(addr)
    setEditId(addr.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    await persist(addresses.filter((a) => a.id !== id))
  }

  const getLabelIcon = (type?: string) => {
    if (type === 'work') return <Building2 size={16} />
    if (type === 'other') return <Map size={16} />
    return <Home size={16} />
  }

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Mes adresses</h2>
          <p className="text-gray-500 text-sm mt-1">Gérez vos adresses de livraison pour gagner du temps.</p>
        </div>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM) }}
            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm">
            <Plus size={16} /> Nouvelle adresse
          </button>
        )}
      </div>

      {/* Feedback */}
      {saved && <Alert tone="success">Adresse enregistrée.</Alert>}
      {error && <Alert>{error}</Alert>}

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm animate-in zoom-in-95 duration-200">
          <h3 className="font-bold text-gray-900 text-lg mb-6 pb-4 border-b border-gray-100">
            {editId ? 'Modifier l\'adresse' : 'Ajouter une nouvelle adresse'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {/* Label Type */}
            <div className="md:col-span-2">
              <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Type d'adresse
              </label>
              <div className="flex gap-3">
                {[
                  { id: 'home', label: 'Domicile', icon: <Home size={16} /> },
                  { id: 'work', label: 'Bureau', icon: <Building2 size={16} /> },
                  { id: 'other', label: 'Autre', icon: <Map size={16} /> }
                ].map((t) => (
                  <button key={t.id} onClick={() => set('labelType')(t.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-xs transition-all
                      ${form.labelType === t.id ? 'border-gray-900 bg-gray-50 text-gray-900' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nom complet *</label>
              <input type="text" placeholder="Ex: Salimata Kaboré"
                value={form.fullName} onChange={(e) => set('fullName')(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-2">Téléphone *</label>
              <input type="tel" placeholder="+226 70 00 00 00"
                value={form.phone} onChange={(e) => set('phone')(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-300"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-2">Adresse / Rue *</label>
              <input type="text" placeholder="Ex: Avenue Kwame Nkrumah, Porte 123"
                value={form.street} onChange={(e) => set('street')(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-300"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quartier</label>
              <input type="text" placeholder="Ex: ZAD, Ouaga 2000"
                value={form.neighborhood} onChange={(e) => set('neighborhood')(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-2xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ville *</label>
              <select value={form.city} onChange={(e) => set('city')(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition-all cursor-pointer">
                {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="md:col-span-2 pt-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors w-max">
                <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${form.isDefault ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}>
                  {form.isDefault && <CheckCircle size={14} className="text-white" />}
                </div>
                <input type="checkbox" checked={form.isDefault} onChange={(e) => set('isDefault')(e.target.checked)} className="hidden" />
                <span className="text-sm font-bold text-gray-700">Définir comme adresse par défaut</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 border-t border-gray-100 pt-6 mt-6">
            <button onClick={handleSave} disabled={saving}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-sm disabled:opacity-60">
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }}
              className="px-8 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste adresses */}
      {!showForm && (
        addresses.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm text-center py-16 px-6">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={24} className="text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Aucune adresse enregistrée</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Ajoutez vos adresses de livraison pour commander plus rapidement la prochaine fois.
            </p>
            <button onClick={() => { setShowForm(true); setForm(EMPTY_FORM); setEditId(null) }}
              className="btn-primary inline-flex">
              Ajouter une adresse
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id}
                className={`bg-white rounded-2xl p-6 transition-all relative overflow-hidden flex flex-col
                  ${addr.isDefault ? 'border-2 border-gray-900 shadow-md' : 'border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'}`}>
                
                {addr.isDefault && (
                  <div className="absolute top-0 right-0 bg-gray-900 text-white text-2xs font-bold px-3 py-1.5 rounded-bl-xl">
                    PAR DÉFAUT
                  </div>
                )}
                
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 
                    ${addr.isDefault ? 'bg-gray-100 text-gray-900' : 'bg-gray-50 text-gray-400'}`}>
                    {getLabelIcon(addr.labelType)}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="font-bold text-gray-900 text-base truncate">{addr.fullName}</h3>
                    <p className="text-gray-500 text-sm font-medium mt-0.5">{addr.phone}</p>
                    <div className="mt-2 text-sm text-gray-600 leading-relaxed">
                      <p>{addr.street}</p>
                      <p>{addr.neighborhood ? `${addr.neighborhood}, ` : ''}{addr.city}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50">
                  <button onClick={() => handleEdit(addr)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-50 py-2.5 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
                    <Edit2 size={14} /> Modifier
                  </button>
                  <button onClick={() => handleDelete(addr.id)} disabled={saving}
                    className="disabled:opacity-60 flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 py-2.5 rounded-lg hover:bg-red-100 transition-colors border border-red-100">
                    <Trash2 size={14} /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
