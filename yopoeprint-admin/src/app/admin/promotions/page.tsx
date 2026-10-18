'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, Copy, Check, X, Save, Loader2, Star, Tag } from 'lucide-react'
import { promosService, Promo, PromoInput } from '@/lib/promos.service'

const input = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-mid'
const label = 'text-xs font-semibold text-gray-700 space-y-1 block'
const fcfa = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n)} FCFA`

const EMPTY: PromoInput = {
  code: '', type: 'percentage', value: 10, minOrder: 0, maxUses: null, oncePerCustomer: false,
  description: null, active: true, featured: false, startDate: null, endDate: null,
}

// Dates saisies au jour près : début à 0 h, fin incluse (jusqu'au lendemain 0 h)
const dayToIso = (day: string, end = false) => {
  if (!day) return null
  const d = new Date(`${day}T00:00:00`)
  if (end) d.setDate(d.getDate() + 1)
  return d.toISOString()
}
const isoToDay = (iso: string | null, end = false) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (end) d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const discountLabel = (p: Pick<Promo, 'type' | 'value'>) => (p.type === 'percentage' ? `−${p.value} %` : `−${fcfa(p.value)}`)

function status(p: Promo): { text: string; cls: string } {
  const now = Date.now()
  if (!p.active) return { text: 'Inactif', cls: 'bg-gray-100 text-gray-700' }
  if (p.startDate && new Date(p.startDate).getTime() > now) return { text: `Dès le ${new Date(p.startDate).toLocaleDateString('fr-FR')}`, cls: 'bg-blue-50 text-blue-800' }
  if (p.endDate && new Date(p.endDate).getTime() <= now) return { text: 'Expiré', cls: 'bg-amber-50 text-amber-800' }
  if (p.maxUses !== null && p.uses >= p.maxUses) return { text: 'Épuisé', cls: 'bg-amber-50 text-amber-800' }
  return { text: 'Actif', cls: 'bg-emerald-50 text-emerald-800' }
}

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [editing, setEditing] = useState<{ id: string | null; data: PromoInput } | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    try {
      setPromos(await promosService.list())
      setError('')
    } catch (e: any) {
      setError(e?.message || 'Impossible de charger les codes promo')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError('')
    try { await fn(); await load() } catch (e: any) { setError(e?.message || 'Action impossible') } finally { setBusy(false) }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const set = (patch: Partial<PromoInput>) => setEditing((e) => (e ? { ...e, data: { ...e.data, ...patch } } : e))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setSaving(true); setFormError('')
    try {
      const { id, data } = editing
      const payload = { ...data, description: data.description || null }
      if (id) await promosService.update(id, payload)
      else await promosService.create(payload)
      setEditing(null)
      await load()
    } catch (err: any) {
      setFormError(err?.message || 'Enregistrement impossible')
    } finally {
      setSaving(false)
    }
  }

  const filtered = promos.filter((p) => !search || p.code.includes(search.trim().toUpperCase()))
  const featured = promos.find((p) => p.featured)
  const d = editing?.data

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-600 max-w-2xl">
          Codes saisis par les clients au panier. L&apos;API vérifie chaque condition à la commande ; la remise revendeur
          et un code ne se cumulent pas (la plus avantageuse s&apos;applique).
          {featured ? <> Code affiché sur la boutique : <strong className="font-mono">{featured.code}</strong>.</> : ' Aucun code affiché sur la boutique.'}
        </p>
        <button onClick={() => { setFormError(''); setEditing({ id: null, data: { ...EMPTY } }) }}
          className="inline-flex items-center gap-2 bg-blue-deep text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-mid shrink-0">
          <Plus size={16} /> Nouveau code
        </button>
      </div>

      {error && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un code" aria-label="Rechercher un code"
              className={`${input} pl-8`} />
          </div>
          <span className="text-xs text-gray-600 shrink-0">{promos.filter((p) => status(p).text === 'Actif').length} actif(s) sur {promos.length}</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500 text-sm"><Loader2 className="animate-spin mx-auto mb-2 text-blue-mid" size={22} />Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <Tag className="mx-auto mb-2 text-gray-300" size={28} />
            <p className="text-sm font-semibold text-gray-700">{promos.length ? 'Aucun code ne correspond' : 'Aucun code promo'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Code</th><th className="px-4 py-3">Remise</th><th className="px-4 py-3">Conditions</th>
                  <th className="px-4 py-3">Utilisations</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => {
                  const s = status(p)
                  return (
                    <tr key={p.id} className={p.active ? '' : 'opacity-70'}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-blue-deep tracking-wider">{p.code}</span>
                          <button onClick={() => copyCode(p.code)} aria-label={`Copier ${p.code}`} className="p-1 text-gray-400 hover:text-blue-mid">
                            {copied === p.code ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                          {p.featured && <span title="Affiché sur la boutique" className="text-amber-500"><Star size={14} fill="currentColor" /></span>}
                        </div>
                        {p.description && <p className="text-xs text-gray-600">{p.description}</p>}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">{discountLabel(p)}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 space-y-0.5">
                        <p>{p.minOrder > 0 ? `Dès ${fcfa(p.minOrder)}` : 'Sans minimum'}</p>
                        {p.oncePerCustomer && <p>Une fois par client</p>}
                        {(p.startDate || p.endDate) && (
                          <p>
                            {p.startDate ? `Du ${new Date(p.startDate).toLocaleDateString('fr-FR')} ` : ''}
                            {p.endDate ? `jusqu'au ${new Date(new Date(p.endDate).getTime() - 1).toLocaleDateString('fr-FR')}` : ''}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        <p className="font-bold text-gray-900 text-sm tabular-nums">{p.uses}{p.maxUses !== null ? ` / ${p.maxUses}` : ''}</p>
                        <p>{p.paidUses} payée(s) · {fcfa(p.discountTotal)} accordés</p>
                      </td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${s.cls}`}>{s.text}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => run(() => promosService.update(p.id, { active: !p.active }))} disabled={busy}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                            {p.active ? 'Désactiver' : 'Activer'}
                          </button>
                          <button onClick={() => { setFormError(''); setEditing({ id: p.id, data: { ...p } }) }} aria-label={`Modifier ${p.code}`}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-mid"><Edit2 size={14} /></button>
                          <button onClick={() => { if (window.confirm(`Supprimer le code ${p.code} ?`)) run(() => promosService.remove(p.id)) }} disabled={busy}
                            aria-label={`Supprimer ${p.code}`} title={p.uses ? 'Déjà utilisé : désactivez-le plutôt' : undefined}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 disabled:opacity-50"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && d && (
        // Conteneur défilant + enveloppe min-h-full : le formulaire reste lisible depuis le haut sur petit écran
        <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto" onClick={() => !saving && setEditing(null)}>
          <div className="min-h-full flex items-center justify-center p-4">
            <form onSubmit={save} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="promo-form-title"
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 id="promo-form-title" className="font-display text-lg font-bold text-blue-deep">{editing.id ? `Modifier ${d.code}` : 'Nouveau code promo'}</h2>
                <button type="button" onClick={() => setEditing(null)} aria-label="Fermer" className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"><X size={16} /></button>
              </div>

              <div className="p-6 space-y-4">
                <label className={label}><span>Code *</span>
                  <input required pattern="[A-Za-z0-9_\-]{3,30}" title="3 à 30 lettres, chiffres, - ou _" className={`${input} font-mono font-bold tracking-widest uppercase`}
                    value={d.code} onChange={(e) => set({ code: e.target.value.toUpperCase() })} placeholder="RENTREE15" /></label>

                <div className="grid grid-cols-2 gap-3">
                  <label className={label}><span>Type de remise</span>
                    <select className={input} value={d.type} onChange={(e) => set({ type: e.target.value as PromoInput['type'] })}>
                      <option value="percentage">Pourcentage</option>
                      <option value="fixed">Montant fixe</option>
                    </select></label>
                  <label className={label}><span>Valeur * ({d.type === 'percentage' ? '%' : 'FCFA'})</span>
                    <input required type="number" min={1} max={d.type === 'percentage' ? 90 : undefined} className={input}
                      value={d.value} onChange={(e) => set({ value: Number(e.target.value) || 0 })} /></label>
                </div>

                <label className={label}><span>Libellé affiché au client</span>
                  <input maxLength={120} className={input} value={d.description || ''} placeholder={discountLabel(d)}
                    onChange={(e) => set({ description: e.target.value })} /></label>

                <div className="grid grid-cols-2 gap-3">
                  <label className={label}><span>Commande minimum (FCFA)</span>
                    <input type="number" min={0} className={input} value={d.minOrder} onChange={(e) => set({ minOrder: Number(e.target.value) || 0 })} /></label>
                  <label className={label}><span>Utilisations max (vide = illimité)</span>
                    <input type="number" min={1} className={input} value={d.maxUses ?? ''}
                      onChange={(e) => set({ maxUses: e.target.value ? Number(e.target.value) : null })} /></label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className={label}><span>Valable à partir du</span>
                    <input type="date" className={input} value={isoToDay(d.startDate)} onChange={(e) => set({ startDate: dayToIso(e.target.value) })} /></label>
                  <label className={label}><span>Jusqu&apos;au (inclus)</span>
                    <input type="date" className={input} value={isoToDay(d.endDate, true)} onChange={(e) => set({ endDate: dayToIso(e.target.value, true) })} /></label>
                </div>

                <div className="space-y-2 pt-1">
                  {([
                    ['oncePerCustomer', 'Une seule utilisation par client'],
                    ['active', 'Code actif'],
                    ['featured', 'Afficher sur la boutique (menu et accueil) — remplace le code actuellement affiché'],
                  ] as const).map(([k, text]) => (
                    <label key={k} className="flex items-start gap-2.5 text-sm text-gray-800 cursor-pointer">
                      <input type="checkbox" className="mt-0.5 w-4 h-4 accent-blue-mid" checked={d[k]} onChange={(e) => set({ [k]: e.target.checked })} />
                      {text}
                    </label>
                  ))}
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                  <p className="font-mono font-bold text-xl text-blue-deep tracking-widest">{d.code || 'CODE'}</p>
                  <p className="text-sm text-gray-700">
                    {d.description || discountLabel(d)}{d.minOrder > 0 && ` dès ${fcfa(d.minOrder)} d'achat`}
                  </p>
                </div>

                {formError && <p role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{formError}</p>}
              </div>

              <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold">Annuler</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-deep text-white text-sm font-bold hover:bg-blue-mid disabled:opacity-60">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
