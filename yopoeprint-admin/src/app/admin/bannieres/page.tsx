'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  Plus, Edit2, Trash2, Upload, ArrowUp, ArrowDown, ExternalLink, X, Save, Loader2,
  Image as ImageIcon, Smartphone, Monitor,
} from 'lucide-react'
import {
  bannersService, Banner, BannerInput, BannerVariant, BANNER_FORMATS, readImageSize,
} from '@/lib/banners.service'

const input = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-mid'
const label = 'text-xs font-semibold text-gray-700 space-y-1 block'

const EMPTY: BannerInput = {
  title: '', subtitle: null, badge: null, ctaLabel: null, altText: null,
  imageUrl: '', mobileImageUrl: null, linkUrl: '/catalogue', active: true, startDate: null, endDate: null,
}

// Les dates de diffusion se saisissent au jour près : début à 0 h, fin incluse (jusqu'au lendemain 0 h)
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

function status(b: Banner): { text: string; cls: string } {
  const now = Date.now()
  if (!b.active) return { text: 'Inactive', cls: 'bg-gray-100 text-gray-700' }
  if (b.startDate && new Date(b.startDate).getTime() > now) return { text: `Programmée le ${new Date(b.startDate).toLocaleDateString('fr-FR')}`, cls: 'bg-blue-50 text-blue-800' }
  if (b.endDate && new Date(b.endDate).getTime() <= now) return { text: 'Terminée', cls: 'bg-amber-50 text-amber-800' }
  return { text: 'En ligne', cls: 'bg-emerald-50 text-emerald-800' }
}

// ── Zone d'envoi d'un visuel au format exact ─────────────────────────────
function ImageField({ variant, url, onChange, required }: {
  variant: BannerVariant
  url: string | null
  onChange: (url: string | null) => void
  required?: boolean
}) {
  const fmt = BANNER_FORMATS[variant]
  const ref = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState('')

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    try {
      const size = await readImageSize(file)
      if (size.width !== fmt.width || size.height !== fmt.height) {
        setError(`Cette image mesure ${size.width} × ${size.height} px : le visuel ${fmt.label} doit faire exactement ${fmt.width} × ${fmt.height} px.`)
        return
      }
      setProgress(0)
      onChange(await bannersService.uploadImage(file, variant, setProgress))
    } catch (err: any) {
      setError(err?.message || 'Envoi impossible')
    } finally {
      setProgress(null)
    }
  }

  const Icon = variant === 'desktop' ? Monitor : Smartphone
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <Icon size={14} /> Visuel {fmt.label} {required ? '*' : '(facultatif)'}
          <span className="font-mono text-blue-mid">{fmt.width} × {fmt.height} px</span>
        </span>
        {url && !required && (
          <button type="button" onClick={() => onChange(null)} className="text-xs font-bold text-red-600 hover:underline">Retirer</button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/png,image/jpeg" onChange={pick} className="hidden" />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={progress !== null}
        style={{ aspectRatio: `${fmt.width} / ${fmt.height}` }}
        className={`relative w-full ${variant === 'mobile' ? 'max-w-[260px]' : ''} rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-blue-mid bg-gray-50 flex items-center justify-center text-center`}
      >
        {url ? (
          <>
            <Image src={url} alt="" fill unoptimized className="object-cover" />
            <span className="absolute bottom-2 right-2 bg-white/90 text-gray-900 text-xs font-bold px-2 py-1 rounded-lg">Remplacer</span>
          </>
        ) : progress !== null ? (
          <span className="text-xs font-bold text-blue-deep flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Envoi… {progress} %</span>
        ) : (
          <span className="text-xs text-gray-600 px-3">
            <Upload size={20} className="mx-auto mb-1 text-blue-mid" />
            Choisir un JPG ou PNG de <strong>{fmt.width} × {fmt.height} px</strong> exactement
          </span>
        )}
        {url && progress !== null && (
          <span className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs font-bold text-blue-deep gap-2"><Loader2 size={16} className="animate-spin" /> Envoi… {progress} %</span>
        )}
      </button>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  )
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState<{ id: string | null; data: BannerInput } | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    try {
      setBanners(await bannersService.list())
      setError('')
    } catch (e: any) {
      setError(e?.message || 'Impossible de charger les bannières')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError('')
    try { await fn(); await load() } catch (e: any) { setError(e?.message || 'Action impossible') } finally { setBusy(false) }
  }

  const move = (index: number, dir: -1 | 1) => {
    const ids = banners.map((b) => b.id)
    const j = index + dir
    if (j < 0 || j >= ids.length) return
    ;[ids[index], ids[j]] = [ids[j], ids[index]]
    run(() => bannersService.reorder(ids))
  }

  const openEdit = (b?: Banner) => {
    setFormError('')
    setEditing(b ? { id: b.id, data: { ...b } } : { id: null, data: { ...EMPTY } })
  }

  const set = (patch: Partial<BannerInput>) => setEditing((e) => (e ? { ...e, data: { ...e.data, ...patch } } : e))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    if (!editing.data.imageUrl) { setFormError('Ajoutez le visuel ordinateur (1248 × 357 px).'); return }
    setSaving(true); setFormError('')
    const { id, data } = editing
    const payload: BannerInput = {
      ...data,
      subtitle: data.subtitle || null, badge: data.badge || null, ctaLabel: data.ctaLabel || null, altText: data.altText || null,
    }
    try {
      if (id) await bannersService.update(id, payload)
      else await bannersService.create(payload)
      setEditing(null)
      await load()
    } catch (err: any) {
      setFormError(err?.message || 'Enregistrement impossible')
    } finally {
      setSaving(false)
    }
  }

  const live = banners.filter((b) => status(b).text === 'En ligne').length

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-600 max-w-2xl">
          Carrousel de la page d&apos;accueil. Visuel ordinateur <strong className="font-mono">1248 × 357 px</strong> obligatoire,
          version téléphone <strong className="font-mono">660 × 330 px</strong> facultative : sans elle, le visuel ordinateur est recadré
          au centre sur téléphone (à éviter si l&apos;image contient du texte).
        </p>
        <button onClick={() => openEdit()}
          className="inline-flex items-center gap-2 bg-blue-deep text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-mid shrink-0">
          <Plus size={16} /> Nouvelle bannière
        </button>
      </div>

      {error && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <span className="font-bold text-gray-900 text-sm">Bannières ({banners.length})</span>
          <span>{live} en ligne{banners.length === 0 && !loading ? ' · la boutique affiche ses bannières par défaut' : ''}</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500 text-sm"><Loader2 className="animate-spin mx-auto mb-2 text-blue-mid" size={22} />Chargement…</div>
        ) : banners.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <ImageIcon className="mx-auto mb-2 text-gray-300" size={30} />
            <p className="text-sm font-semibold text-gray-700">Aucune bannière</p>
            <p className="text-xs mt-1">Ajoutez-en une pour remplacer les bannières par défaut de la boutique.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {banners.map((b, i) => {
              const s = status(b)
              return (
                <li key={b.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex flex-col items-center text-gray-400 shrink-0">
                      <button onClick={() => move(i, -1)} disabled={busy || i === 0} aria-label={`Monter « ${b.title} »`} className="p-1 hover:text-blue-mid disabled:opacity-20"><ArrowUp size={14} /></button>
                      <span className="font-mono text-xs font-bold text-gray-600">{i + 1}</span>
                      <button onClick={() => move(i, 1)} disabled={busy || i === banners.length - 1} aria-label={`Descendre « ${b.title} »`} className="p-1 hover:text-blue-mid disabled:opacity-20"><ArrowDown size={14} /></button>
                    </div>
                    <div className="relative w-52 aspect-[1248/357] rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      <Image src={b.imageUrl} alt="" fill unoptimized className="object-cover" />
                    </div>
                    <div className="relative w-11 aspect-[660/330] rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center"
                      title={b.mobileImageUrl ? 'Version téléphone' : 'Pas de version téléphone'}>
                      {b.mobileImageUrl ? <Image src={b.mobileImageUrl} alt="" fill unoptimized className="object-cover" /> : <Smartphone size={13} className="text-gray-400" />}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="font-bold text-gray-900 text-sm truncate">{b.title}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${s.cls}`}>{s.text}</span>
                        {b.endDate && s.text === 'En ligne' && <span className="text-gray-600">jusqu&apos;au {new Date(new Date(b.endDate).getTime() - 1).toLocaleDateString('fr-FR')}</span>}
                        <span className="font-mono text-blue-mid inline-flex items-center gap-1 truncate"><ExternalLink size={11} />{b.linkUrl}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    <button onClick={() => run(() => bannersService.update(b.id, { active: !b.active }))} disabled={busy}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                      {b.active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button onClick={() => openEdit(b)} aria-label={`Modifier « ${b.title} »`} className="p-2 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-mid"><Edit2 size={15} /></button>
                    <button onClick={() => { if (window.confirm(`Supprimer la bannière « ${b.title} » ?`)) run(() => bannersService.remove(b.id)) }}
                      disabled={busy} aria-label={`Supprimer « ${b.title} »`} className="p-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {editing && (
        // Conteneur défilant + enveloppe min-h-full : un formulaire plus haut que l'écran reste lisible depuis le haut
        <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto" onClick={() => !saving && setEditing(null)}>
          <div className="min-h-full flex items-center justify-center p-4">
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="banner-form-title"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 id="banner-form-title" className="font-display text-lg font-bold text-blue-deep">{editing.id ? 'Modifier la bannière' : 'Nouvelle bannière'}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Fermer" className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"><X size={16} /></button>
            </div>

            <div className="p-6 space-y-5">
              <ImageField variant="desktop" required url={editing.data.imageUrl || null} onChange={(url) => set({ imageUrl: url || '' })} />
              <ImageField variant="mobile" url={editing.data.mobileImageUrl} onChange={(url) => set({ mobileImageUrl: url })} />

              <div className="grid sm:grid-cols-2 gap-3">
                <label className={`${label} sm:col-span-2`}><span>Titre *</span>
                  <input required minLength={2} maxLength={120} className={input} value={editing.data.title} onChange={(e) => set({ title: e.target.value })} /></label>
                <label className={label}><span>Lien au clic *</span>
                  <input required maxLength={300} className={`${input} font-mono`} placeholder="/catalogue/roll-up" value={editing.data.linkUrl} onChange={(e) => set({ linkUrl: e.target.value })} /></label>
                <label className={label}><span>Texte alternatif (lecteurs d&apos;écran)</span>
                  <input maxLength={200} className={input} value={editing.data.altText || ''} onChange={(e) => set({ altText: e.target.value })} /></label>
              </div>

              <fieldset className="border border-gray-100 rounded-xl p-4 space-y-3">
                <legend className="text-xs font-bold text-gray-700 px-1">Texte posé sur l&apos;image (facultatif)</legend>
                <p className="text-xs text-gray-600">Renseignez le bouton pour afficher titre, sous-titre et badge par-dessus le visuel. Laissez-le vide si le visuel contient déjà son texte.</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <label className={label}><span>Bouton</span>
                    <input maxLength={40} className={input} placeholder="Voir les offres" value={editing.data.ctaLabel || ''} onChange={(e) => set({ ctaLabel: e.target.value })} /></label>
                  <label className={label}><span>Badge</span>
                    <input maxLength={40} className={input} placeholder="Offre flash" value={editing.data.badge || ''} onChange={(e) => set({ badge: e.target.value })} /></label>
                  <label className={label}><span>Sous-titre</span>
                    <input maxLength={200} className={input} value={editing.data.subtitle || ''} onChange={(e) => set({ subtitle: e.target.value })} /></label>
                </div>
              </fieldset>

              <div className="grid sm:grid-cols-3 gap-3 items-end">
                <label className={label}><span>Diffusion à partir du</span>
                  <input type="date" className={input} value={isoToDay(editing.data.startDate)} onChange={(e) => set({ startDate: dayToIso(e.target.value) })} /></label>
                <label className={label}><span>Jusqu&apos;au (inclus)</span>
                  <input type="date" className={input} value={isoToDay(editing.data.endDate, true)} onChange={(e) => set({ endDate: dayToIso(e.target.value, true) })} /></label>
                <label className="flex items-center gap-2 py-2 text-sm font-semibold text-gray-800">
                  <input type="checkbox" className="w-4 h-4 accent-blue-mid" checked={editing.data.active} onChange={(e) => set({ active: e.target.checked })} />
                  Bannière active
                </label>
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
