'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Tag, Copy, CheckCircle, X, Save } from 'lucide-react'

interface Promo {
  id:         string
  code:       string
  type:       'percent' | 'fixed'
  value:      number
  minOrder:   number
  uses:       number
  maxUses:    number
  expiry:     string
  active:     boolean
}

const MOCK: Promo[] = [
  { id: '1', code: 'YOPOE10',   type: 'percent', value: 10, minOrder: 10000,  uses: 42,  maxUses: 100, expiry: '2025-06-30', active: true },
  { id: '2', code: 'PROMO20',   type: 'percent', value: 20, minOrder: 25000,  uses: 18,  maxUses: 50,  expiry: '2025-04-30', active: true },
  { id: '3', code: 'BURKINA',   type: 'percent', value: 15, minOrder: 0,      uses: 73,  maxUses: 200, expiry: '2025-12-31', active: true },
  { id: '4', code: 'BIENVENUE', type: 'fixed',   value: 5000, minOrder: 15000, uses: 31, maxUses: 999, expiry: '2025-12-31', active: true },
  { id: '5', code: 'ETE2025',   type: 'percent', value: 25, minOrder: 30000,  uses: 5,   maxUses: 30,  expiry: '2025-07-31', active: false },
]

const EMPTY: Omit<Promo, 'id' | 'uses'> = {
  code: '', type: 'percent', value: 10, minOrder: 0,
  maxUses: 100, expiry: '', active: true
}

function PromoModal({ promo, onClose, onSave }: {
  promo: Partial<Promo> | null
  onClose: () => void
  onSave:  (p: any) => void
}) {
  const isNew = !promo?.id
  const [form, setForm] = useState<any>(promo || EMPTY)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f: any) => ({ ...f, [k]: e.target.value }))

  const inputCls = `w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl
                    text-sm outline-none focus:border-blue-mid focus:bg-white transition-all`

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
         onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-blue-deep">
            {isNew ? 'Nouveau code promo' : 'Modifier le code'}
          </h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center
                                               justify-center text-gray-400 hover:text-red-500 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Code promo *
            </label>
            <input type="text" placeholder="Ex: YOPOE10" value={form.code}
              onChange={(e) => setForm((f: any) => ({ ...f, code: e.target.value.toUpperCase() }))}
              className={`${inputCls} font-mono font-bold text-blue-mid tracking-widest uppercase`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Type de réduction
              </label>
              <select value={form.type} onChange={set('type')} className={`${inputCls} cursor-pointer`}>
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (FCFA)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Valeur *
              </label>
              <div className="relative">
                <input type="number" value={form.value} onChange={set('value')}
                  className={`${inputCls} pr-14`} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">
                  {form.type === 'percent' ? '%' : 'FCFA'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Commande minimum (FCFA)
              </label>
              <input type="number" value={form.minOrder} onChange={set('minOrder')}
                placeholder="0 = aucun" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Nombre max d'utilisations
              </label>
              <input type="number" value={form.maxUses} onChange={set('maxUses')} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Date d'expiration
            </label>
            <input type="date" value={form.expiry} onChange={set('expiry')} className={inputCls} />
          </div>

          {/* Preview */}
          {form.code && (
            <div className="bg-gold-pale border border-gold/30 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Aperçu du code</p>
              <p className="font-mono font-bold text-2xl text-blue-deep tracking-widest">{form.code}</p>
              <p className="text-sm text-gray-600 mt-1">
                {form.type === 'percent'
                  ? `−${form.value}% sur votre commande`
                  : `−${new Intl.NumberFormat('fr-FR').format(form.value)} FCFA`}
                {form.minOrder > 0 && ` dès ${new Intl.NumberFormat('fr-FR').format(form.minOrder)} FCFA`}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-medium
                       text-gray-500 hover:border-gray-400 transition-all">
            Annuler
          </button>
          <button onClick={() => onSave({ ...form, id: form.id || Date.now().toString(), uses: 0 })}
            disabled={!form.code || !form.value}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-mid text-white
                       py-2.5 rounded-xl font-bold text-sm hover:bg-blue-deep transition-all
                       disabled:opacity-40">
            <Save size={15} /> {isNew ? 'Créer' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPromotionsPage() {
  const [promos,  setPromos]  = useState<Promo[]>(MOCK)
  const [modal,   setModal]   = useState<Partial<Promo> | null | false>(false)
  const [copied,  setCopied]  = useState<string | null>(null)
  const [search,  setSearch]  = useState('')

  const filtered = promos.filter((p) =>
    !search || p.code.includes(search.toUpperCase())
  )

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSave = (data: Promo) => {
    if (promos.find((p) => p.id === data.id)) {
      setPromos((ps) => ps.map((p) => p.id === data.id ? data : p))
    } else {
      setPromos((ps) => [...ps, data])
    }
    setModal(false)
  }

  const toggle = (id: string) =>
    setPromos((ps) => ps.map((p) => p.id === id ? { ...p, active: !p.active } : p))

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Codes actifs',     value: promos.filter((p) => p.active).length,  color: 'text-green-600' },
          { label: 'Utilisations',     value: promos.reduce((acc, p) => acc + p.uses, 0), color: 'text-blue-mid' },
          { label: 'Économies totales', value: '—',                                    color: 'text-yellow-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
            <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Rechercher un code…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl
                       text-sm outline-none focus:border-blue-mid transition-all" />
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 bg-blue-mid text-white px-5 py-2.5
                     rounded-xl font-bold text-sm hover:bg-blue-deep transition-all ml-auto">
          <Plus size={16} /> Nouveau code
        </button>
      </div>

      {/* Grille codes promo */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const pct = Math.min((p.uses / p.maxUses) * 100, 100)
          const expired = p.expiry && new Date(p.expiry) < new Date()
          return (
            <div key={p.id}
              className={`bg-white border-2 rounded-2xl p-5 transition-all
                           ${!p.active || expired ? 'opacity-55 border-gray-100' : 'border-gray-100 hover:border-blue-mid/30 hover:shadow-md'}`}>

              {/* Top */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-gold rounded-xl flex items-center justify-center">
                    <Tag size={17} className="text-blue-deep" />
                  </div>
                  <div>
                    <p className="font-mono font-bold text-blue-deep text-base tracking-wider">
                      {p.code}
                    </p>
                    <p className="text-xs text-gray-400">
                      {p.type === 'percent'
                        ? `−${p.value}%`
                        : `−${new Intl.NumberFormat('fr-FR').format(p.value)} FCFA`}
                      {p.minOrder > 0 && ` · min ${new Intl.NumberFormat('fr-FR').format(p.minOrder)} FCFA`}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                                  ${p.active && !expired ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {expired ? 'Expiré' : p.active ? '● Actif' : '○ Inactif'}
                </span>
              </div>

              {/* Progress utilisations */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{p.uses} utilisations</span>
                  <span>/ {p.maxUses}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all
                                   ${pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-yellow-400' : 'bg-green-500'}`}
                       style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Expiry */}
              {p.expiry && (
                <p className="text-[10px] text-gray-400 mb-3">
                  Expire le {new Date(p.expiry).toLocaleDateString('fr-FR')}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                <button onClick={() => copyCode(p.code)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500
                             hover:text-blue-mid transition-colors px-2 py-1.5 rounded-lg hover:bg-blue-pale">
                  {copied === p.code ? <CheckCircle size={13} className="text-green-500" /> : <Copy size={13} />}
                  {copied === p.code ? 'Copié !' : 'Copier'}
                </button>
                <button onClick={() => toggle(p.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500
                             hover:text-blue-mid transition-colors px-2 py-1.5 rounded-lg hover:bg-blue-pale ml-auto">
                  {p.active ? 'Désactiver' : 'Activer'}
                </button>
                <button onClick={() => setModal(p)}
                  className="w-7 h-7 rounded-lg hover:bg-blue-pale text-gray-400
                             hover:text-blue-mid flex items-center justify-center transition-all">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => setPromos((ps) => ps.filter((x) => x.id !== p.id))}
                  className="w-7 h-7 rounded-lg hover:bg-red-50 text-gray-400
                             hover:text-red-500 flex items-center justify-center transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        })}

        {/* Carte ajout */}
        <button onClick={() => setModal({})}
          className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col
                     items-center justify-center gap-3 p-8 hover:border-blue-mid
                     hover:bg-blue-pale/30 transition-all text-gray-400 hover:text-blue-mid group min-h-[200px]">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-blue-mid
                          flex items-center justify-center transition-all">
            <Plus size={22} className="group-hover:text-white" />
          </div>
          <p className="font-bold text-sm">Créer un code promo</p>
        </button>
      </div>

      {modal !== false && (
        <PromoModal promo={modal} onClose={() => setModal(false)} onSave={handleSave} />
      )}
    </div>
  )
}
