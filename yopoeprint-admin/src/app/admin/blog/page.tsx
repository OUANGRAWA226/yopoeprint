'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Plus, Search, Edit2, Trash2, X, Save, Loader2, FileText, ImagePlus } from 'lucide-react'
import { postsService, Post, PostInput } from '@/lib/posts.service'
import { uploadMedia } from '@/lib/media.service'

const input = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-mid'
const label = 'text-xs font-semibold text-gray-700 space-y-1 block'
const CATS = ['Conseils pratiques', 'Tutoriel', 'Inspiration', 'Actualités', 'Guides', 'Entreprise']

const EMPTY: PostInput = { title: '', slug: '', excerpt: '', content: '', category: CATS[0], author: 'L\'équipe YopoePrint', imageUrl: null, published: false }

const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9\s-]/g, '').trim().replace(/[\s-]+/g, '-').slice(0, 120)

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<{ id: string | null; data: PostInput; slugTouched: boolean } | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [upload, setUpload] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      setPosts(await postsService.list())
      setError('')
    } catch (e: any) {
      setError(e?.message || 'Impossible de charger les articles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError('')
    try { await fn(); await load() } catch (e: any) { setError(e?.message || 'Action impossible') } finally { setBusy(false) }
  }

  const set = (patch: Partial<PostInput>) => setEditing((e) => (e ? { ...e, data: { ...e.data, ...patch } } : e))

  // L'adresse suit le titre tant qu'elle n'a pas été modifiée à la main (et jamais pour un article existant)
  const setTitle = (title: string) => setEditing((e) => e && ({
    ...e, data: { ...e.data, title, slug: e.slugTouched || e.id ? e.data.slug : slugify(title) },
  }))

  const pickCover = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0]
    ev.target.value = ''
    if (!file) return
    setFormError('')
    try {
      setUpload(0)
      set({ imageUrl: await uploadMedia(file, 'blog', setUpload) })
    } catch (err: any) {
      setFormError(err?.message || 'Envoi de l\'image impossible')
    } finally {
      setUpload(null)
    }
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setSaving(true); setFormError('')
    try {
      const { id, data } = editing
      if (id) await postsService.update(id, data)
      else await postsService.create(data)
      setEditing(null)
      await load()
    } catch (err: any) {
      setFormError(err?.message || 'Enregistrement impossible')
    } finally {
      setSaving(false)
    }
  }

  const q = search.trim().toLowerCase()
  const filtered = posts.filter((p) => !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
  const d = editing?.data
  const words = d?.content.split(/\s+/).filter(Boolean).length ?? 0

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-600 max-w-2xl">
          Articles du blog de la boutique, rédigés en Markdown. Un brouillon n&apos;est visible que dans l&apos;admin ; la date affichée
          est celle de la première publication.
        </p>
        <button onClick={() => { setFormError(''); setEditing({ id: null, data: { ...EMPTY }, slugTouched: false }) }}
          className="inline-flex items-center gap-2 bg-blue-deep text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-mid shrink-0">
          <Plus size={16} /> Nouvel article
        </button>
      </div>

      {error && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un article" aria-label="Rechercher un article"
              className={`${input} pl-8`} />
          </div>
          <span className="text-xs text-gray-600 shrink-0">{posts.filter((p) => p.published).length} publié(s) sur {posts.length}</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500 text-sm"><Loader2 className="animate-spin mx-auto mb-2 text-blue-mid" size={22} />Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <FileText className="mx-auto mb-2 text-gray-300" size={28} />
            <p className="text-sm font-semibold text-gray-700">{posts.length ? 'Aucun article ne correspond' : 'Aucun article'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <li key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative w-28 aspect-[16/10] rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                  {p.imageUrl ? <Image src={p.imageUrl} alt="" fill unoptimized className="object-cover" /> : <FileText size={18} className="text-gray-300" />}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-bold text-gray-900 text-sm">{p.title}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${p.published ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                      {p.published ? 'Publié' : 'Brouillon'}
                    </span>
                    <span>{p.category}</span>
                    <span>· {p.readMinutes} min de lecture</span>
                    {p.publishedAt && <span>· publié le {new Date(p.publishedAt).toLocaleDateString('fr-FR')}</span>}
                    <span className="font-mono text-blue-mid">/blog/{p.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button onClick={() => run(() => postsService.update(p.id, { published: !p.published }))} disabled={busy}
                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    {p.published ? 'Dépublier' : 'Publier'}
                  </button>
                  <button onClick={() => { setFormError(''); setEditing({ id: p.id, data: { ...p }, slugTouched: true }) }} aria-label={`Modifier « ${p.title} »`}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-mid"><Edit2 size={14} /></button>
                  <button onClick={() => { if (window.confirm(`Supprimer définitivement « ${p.title} » ?`)) run(() => postsService.remove(p.id)) }} disabled={busy}
                    aria-label={`Supprimer « ${p.title} »`}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 disabled:opacity-50"><Trash2 size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && d && (
        // Conteneur défilant + enveloppe min-h-full : le formulaire reste lisible depuis le haut
        <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto" onClick={() => !saving && setEditing(null)}>
          <div className="min-h-full flex items-center justify-center p-4">
            <form onSubmit={save} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="post-form-title"
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 id="post-form-title" className="font-display text-lg font-bold text-blue-deep">{editing.id ? 'Modifier l\'article' : 'Nouvel article'}</h2>
                <button type="button" onClick={() => setEditing(null)} aria-label="Fermer" className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"><X size={16} /></button>
              </div>

              <div className="p-6 space-y-4">
                <label className={label}><span>Titre *</span>
                  <input required minLength={5} maxLength={160} className={input} value={d.title} onChange={(e) => setTitle(e.target.value)} /></label>

                <div className="grid sm:grid-cols-3 gap-3">
                  <label className={`${label} sm:col-span-2`}><span>Adresse (/blog/…) *</span>
                    <input required pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Minuscules, chiffres et tirets" maxLength={120} className={`${input} font-mono`}
                      value={d.slug} onChange={(e) => setEditing((x) => x && ({ ...x, slugTouched: true, data: { ...x.data, slug: e.target.value } }))} /></label>
                  <label className={label}><span>Catégorie *</span>
                    <input required list="post-categories" maxLength={60} className={input} value={d.category} onChange={(e) => set({ category: e.target.value })} />
                    <datalist id="post-categories">{CATS.map((c) => <option key={c} value={c} />)}</datalist></label>
                </div>

                <label className={label}><span>Résumé * (listes du blog et résultats Google)</span>
                  <textarea required minLength={20} maxLength={300} rows={2} className={input} value={d.excerpt} onChange={(e) => set({ excerpt: e.target.value })} /></label>

                <label className={label}>
                  <span>Contenu * (Markdown : ## Titre, **gras**, *italique*, - liste, 1. liste, &gt; citation, [lien](https://…))</span>
                  <textarea required minLength={50} rows={14} className={`${input} font-mono text-xs leading-relaxed`} value={d.content}
                    onChange={(e) => set({ content: e.target.value })} />
                  <span className="block text-gray-500 font-normal">{words} mots · environ {Math.max(1, Math.round(words / 200))} min de lecture. Le HTML saisi est affiché tel quel, sans être interprété.</span>
                </label>

                <div className="grid sm:grid-cols-3 gap-3 items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-700">Image de couverture</span>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={pickCover} />
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={upload !== null}
                      className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-blue-mid bg-gray-50 flex items-center justify-center text-xs text-gray-600">
                      {d.imageUrl ? <Image src={d.imageUrl} alt="" fill unoptimized className="object-cover" />
                        : upload !== null ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> {upload} %</span>
                        : <span className="flex flex-col items-center gap-1"><ImagePlus size={18} className="text-blue-mid" /> JPG ou PNG</span>}
                    </button>
                    {d.imageUrl && <button type="button" onClick={() => set({ imageUrl: null })} className="text-xs font-bold text-red-600 hover:underline">Retirer l&apos;image</button>}
                  </div>
                  <label className={`${label} sm:col-span-2`}><span>Auteur</span>
                    <input maxLength={80} className={input} value={d.author} onChange={(e) => set({ author: e.target.value })} />
                    <span className="flex items-center gap-2 pt-3 text-sm text-gray-800 font-normal">
                      <input type="checkbox" className="w-4 h-4 accent-blue-mid" checked={d.published} onChange={(e) => set({ published: e.target.checked })} />
                      Publier sur le blog
                    </span>
                  </label>
                </div>

                {formError && <p role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{formError}</p>}
              </div>

              <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold">Annuler</button>
                <button type="submit" disabled={saving || upload !== null} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-deep text-white text-sm font-bold hover:bg-blue-mid disabled:opacity-60">
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
