'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Plus, Search, Edit2, Trash2, Save, FileText, ImagePlus, Eye, EyeOff } from 'lucide-react'
import { postsService, Post, PostInput } from '@/lib/posts.service'
import { uploadMedia } from '@/lib/media.service'
import { Card, ErrorAlert, LoadingRow, Modal, Spinner, TableMessage } from '@/components/ui'
import { dateFr } from '@/components/status'

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

  const closeEditor = useCallback(() => { if (!saving) setEditing(null) }, [saving])

  const q = search.trim().toLowerCase()
  const filtered = posts.filter((p) => !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
  const d = editing?.data
  const words = d?.content.split(/\s+/).filter(Boolean).length ?? 0

  return (
    <>
      <div className="callout callout-info mb-3">
        Articles du blog de la boutique, rédigés en Markdown. Un brouillon n&apos;est visible que dans l&apos;admin ; la date affichée
        est celle de la première publication.
      </div>

      <ErrorAlert message={error} onRetry={load} />

      <Card title="Articles" icon={<FileText size={18} />} noPadding
        tools={
          <>
            <div className="input-group input-group-sm" style={{ width: 220 }}>
              <span className="input-group-text"><Search size={13} /></span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher" aria-label="Rechercher un article" className="form-control" />
            </div>
            <button type="button" onClick={() => { setFormError(''); setEditing({ id: null, data: { ...EMPTY }, slugTouched: false }) }}
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 text-nowrap">
              <Plus size={15} /> Nouvel article
            </button>
          </>
        }
        footer={<small className="text-secondary">{posts.filter((p) => p.published).length} publié(s) sur {posts.length}</small>}>
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead><tr><th style={{ width: 110 }}>Couverture</th><th>Article</th><th>Statut</th><th>Publication</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
              {loading ? <LoadingRow colSpan={5} /> : filtered.length === 0 ? (
                <TableMessage colSpan={5}>{posts.length ? 'Aucun article ne correspond.' : 'Aucun article.'}</TableMessage>
              ) : filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="position-relative rounded border bg-body-tertiary overflow-hidden d-flex align-items-center justify-content-center" style={{ width: 96, aspectRatio: '16 / 10' }}>
                      {p.imageUrl ? <Image src={p.imageUrl} alt="" fill unoptimized style={{ objectFit: 'cover' }} /> : <FileText size={18} className="text-secondary" />}
                    </div>
                  </td>
                  <td>
                    <div className="fw-semibold">{p.title}</div>
                    <small className="text-secondary">{p.category} · {p.readMinutes} min de lecture · <span className="font-mono">/blog/{p.slug}</span></small>
                  </td>
                  <td><span className={`badge ${p.published ? 'text-bg-success' : 'text-bg-secondary'}`}>{p.published ? 'Publié' : 'Brouillon'}</span></td>
                  <td className="small text-secondary text-nowrap">{p.publishedAt ? dateFr(p.publishedAt) : '—'}</td>
                  <td className="text-end text-nowrap">
                    <div className="btn-group btn-group-sm">
                      <button type="button" onClick={() => run(() => postsService.update(p.id, { published: !p.published }))} disabled={busy}
                        className="btn btn-outline-secondary d-inline-flex align-items-center gap-1" title={p.published ? 'Dépublier' : 'Publier'}>
                        {p.published ? <EyeOff size={14} /> : <Eye size={14} />} {p.published ? 'Dépublier' : 'Publier'}
                      </button>
                      <button type="button" onClick={() => { setFormError(''); setEditing({ id: p.id, data: { ...p }, slugTouched: true }) }}
                        aria-label={`Modifier « ${p.title} »`} className="btn btn-outline-primary"><Edit2 size={14} /></button>
                      <button type="button" onClick={() => { if (window.confirm(`Supprimer définitivement « ${p.title} » ?`)) run(() => postsService.remove(p.id)) }}
                        disabled={busy} aria-label={`Supprimer « ${p.title} »`} className="btn btn-outline-danger"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!editing && !!d} size="lg" title={editing?.id ? 'Modifier l\'article' : 'Nouvel article'} onClose={closeEditor}
        footer={
          <>
            <button type="button" onClick={closeEditor} className="btn btn-outline-secondary">Annuler</button>
            <button type="submit" form="post-form" disabled={saving || upload !== null} className="btn btn-primary d-inline-flex align-items-center gap-2">
              {saving ? <Spinner /> : <Save size={15} />} Enregistrer
            </button>
          </>
        }>
        {d && (
          <form id="post-form" onSubmit={save}>
            <div className="mb-3">
              <label htmlFor="p-title" className="form-label">Titre *</label>
              <input id="p-title" required minLength={5} maxLength={160} className="form-control" value={d.title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-sm-8">
                <label htmlFor="p-slug" className="form-label">Adresse (/blog/…) *</label>
                <input id="p-slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Minuscules, chiffres et tirets" maxLength={120} className="form-control font-mono"
                  value={d.slug} onChange={(e) => setEditing((x) => x && ({ ...x, slugTouched: true, data: { ...x.data, slug: e.target.value } }))} />
              </div>
              <div className="col-sm-4">
                <label htmlFor="p-cat" className="form-label">Catégorie *</label>
                <input id="p-cat" required list="post-categories" maxLength={60} className="form-control" value={d.category} onChange={(e) => set({ category: e.target.value })} />
                <datalist id="post-categories">{CATS.map((c) => <option key={c} value={c} />)}</datalist>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="p-excerpt" className="form-label">Résumé * <small className="text-secondary">(listes du blog et résultats Google)</small></label>
              <textarea id="p-excerpt" required minLength={20} maxLength={300} rows={2} className="form-control" value={d.excerpt} onChange={(e) => set({ excerpt: e.target.value })} />
            </div>

            <div className="mb-3">
              <label htmlFor="p-content" className="form-label">Contenu *</label>
              <textarea id="p-content" required minLength={50} rows={14} className="form-control font-mono small" value={d.content}
                onChange={(e) => set({ content: e.target.value })} aria-describedby="p-content-help" />
              <div id="p-content-help" className="form-text">
                Markdown : ## Titre, **gras**, *italique*, - liste, 1. liste, &gt; citation, [lien](https://…). {words} mots · environ {Math.max(1, Math.round(words / 200))} min de lecture.
                Le HTML saisi est affiché tel quel, sans être interprété.
              </div>
            </div>

            <div className="row g-3 align-items-start">
              <div className="col-sm-5">
                <span className="form-label d-block">Image de couverture</span>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="d-none" onChange={pickCover} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={upload !== null}
                  className="btn btn-light border border-2 w-100 position-relative overflow-hidden d-flex align-items-center justify-content-center"
                  style={{ aspectRatio: '16 / 10', borderStyle: 'dashed' }}>
                  {d.imageUrl ? <Image src={d.imageUrl} alt="" fill unoptimized style={{ objectFit: 'cover' }} />
                    : upload !== null ? <span className="d-inline-flex align-items-center gap-2"><Spinner /> {upload} %</span>
                    : <span className="d-flex flex-column align-items-center gap-1 small text-secondary"><ImagePlus size={20} className="text-primary" /> JPG ou PNG</span>}
                </button>
                {d.imageUrl && <button type="button" onClick={() => set({ imageUrl: null })} className="btn btn-link btn-sm text-danger px-0">Retirer l&apos;image</button>}
              </div>
              <div className="col-sm-7">
                <label htmlFor="p-author" className="form-label">Auteur</label>
                <input id="p-author" maxLength={80} className="form-control mb-3" value={d.author} onChange={(e) => set({ author: e.target.value })} />
                <div className="form-check form-switch">
                  <input id="p-pub" type="checkbox" role="switch" className="form-check-input" checked={d.published} onChange={(e) => set({ published: e.target.checked })} />
                  <label htmlFor="p-pub" className="form-check-label">Publier sur le blog</label>
                </div>
              </div>
            </div>

            {formError && <div role="alert" className="alert alert-danger mt-3 mb-0 py-2">{formError}</div>}
          </form>
        )}
      </Modal>
    </>
  )
}
