'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, X, Save, FileText, ImagePlus } from 'lucide-react'
import { useRef } from 'react'

interface Article {
  id:         string
  title:      string
  slug:       string
  category:   string
  excerpt:    string
  content:    string
  imageUrl:   string
  published:  boolean
  date:       string
  views:      number
}

const CATS = ['Conseils impression', 'Tutoriels', 'Actualités', 'Guides', 'Entreprise']

const MOCK: Article[] = [
  { id: '1', title: 'Comment préparer ses fichiers pour l\'impression',  slug: 'preparer-fichiers-impression',   category: 'Tutoriels',          excerpt: 'Un guide complet pour soumettre vos fichiers PDF, AI ou PSD dans les meilleures conditions.',   content: '', imageUrl: '', published: true,  date: '10 mars 2025',   views: 342 },
  { id: '2', title: '5 conseils pour des flyers qui convertissent',       slug: 'conseils-flyers-efficaces',      category: 'Conseils impression', excerpt: 'Découvrez les techniques des professionnels pour créer des flyers qui génèrent des résultats.', content: '', imageUrl: '', published: true,  date: '7 mars 2025',    views: 218 },
  { id: '3', title: 'Lancement de YopoePrint au Burkina Faso',            slug: 'lancement-yopoeprint',           category: 'Actualités',          excerpt: 'Nous sommes fiers d\'annoncer le lancement officiel de la première imprimerie en ligne du BF.', content: '', imageUrl: '', published: true,  date: '1 mars 2025',    views: 891 },
  { id: '4', title: 'Guide complet des papiers d\'impression',            slug: 'guide-papiers-impression',       category: 'Guides',              excerpt: 'Couché mat, couché brillant, offset, kraft… comprenez les différences pour bien choisir.',      content: '', imageUrl: '', published: false, date: '12 mars 2025',   views: 0 },
]

const EMPTY: Omit<Article, 'id' | 'views'> = {
  title: '', slug: '', category: CATS[0], excerpt: '', content: '', imageUrl: '', published: false, date: ''
}

function ArticleModal({ article, onClose, onSave }: {
  article: Partial<Article> | null
  onClose: () => void
  onSave:  (a: any) => void
}) {
  const isNew = !article?.id
  const [form, setForm] = useState<any>(article || EMPTY)
  const [tab,  setTab]  = useState<'infos' | 'contenu' | 'media'>('infos')
  const [imgPrev, setImgPrev] = useState(article?.imageUrl || '')
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f: any) => ({ ...f, [k]: e.target.value }))

  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    const slug  = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
    setForm((f: any) => ({ ...f, title, slug }))
  }

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const r = new FileReader()
    r.onload = (ev) => {
      const src = ev.target?.result as string
      setImgPrev(src)
      setForm((f: any) => ({ ...f, imageUrl: src }))
    }
    r.readAsDataURL(file)
  }

  const inputCls = `w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl
                    text-sm outline-none focus:border-blue-mid focus:bg-white transition-all`

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
         onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh]
                      flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-blue-deep">
            {isNew ? 'Nouvel article' : 'Modifier l\'article'}
          </h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center
                                               justify-center text-gray-400 hover:text-red-500 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-6 pt-4 border-b border-gray-100">
          {[
            { key: 'infos',   label: '📝 Infos' },
            { key: 'contenu', label: '✍️ Contenu' },
            { key: 'media',   label: '🖼️ Image' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key as any)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px
                          ${tab === key ? 'border-blue-mid text-blue-mid' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === 'infos' && (
            <>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Titre *</label>
                <input type="text" placeholder="Ex: Comment préparer ses fichiers…"
                  value={form.title} onChange={handleTitle} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Slug URL</label>
                <input type="text" value={form.slug} onChange={set('slug')}
                  className={`${inputCls} font-mono text-xs`} />
                <p className="text-[10px] text-gray-400 mt-1">/blog/<strong>{form.slug || 'votre-article'}</strong></p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Catégorie</label>
                  <select value={form.category} onChange={set('category')} className={`${inputCls} cursor-pointer`}>
                    {CATS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Date de publication</label>
                  <input type="date" value={form.date} onChange={set('date')} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Extrait / Meta description</label>
                <textarea rows={3} placeholder="Court résumé de l'article (affiché dans les listings et les résultats Google)…"
                  value={form.excerpt} onChange={set('excerpt')}
                  className={`${inputCls} resize-none`} />
                <p className="text-[10px] text-gray-400 mt-1">{form.excerpt?.length || 0} / 160 caractères recommandés</p>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer
                                 ${form.published ? 'bg-green-500' : 'bg-gray-300'}`}
                     onClick={() => setForm((f: any) => ({ ...f, published: !f.published }))}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                                   ${form.published ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm font-medium text-blue-deep">
                  {form.published ? 'Article publié (visible sur le blog)' : 'Brouillon (non visible)'}
                </span>
              </div>
            </>
          )}

          {tab === 'contenu' && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Contenu de l'article
              </label>
              <textarea rows={18} placeholder="Rédigez le contenu de votre article ici. Vous pouvez utiliser du Markdown (# Titre, **gras**, *italique*, - liste…)"
                value={form.content} onChange={set('content')}
                className={`${inputCls} resize-none font-mono leading-relaxed`} />
              <p className="text-[10px] text-gray-400 mt-1">
                Supporte le Markdown. {form.content?.split(' ').filter(Boolean).length || 0} mots.
              </p>
            </div>
          )}

          {tab === 'media' && (
            <>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">Image de couverture</label>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-8
                             hover:border-blue-mid hover:bg-blue-pale/30 transition-all
                             cursor-pointer text-center group">
                  {imgPrev ? (
                    <div className="relative">
                      <img src={imgPrev} alt="Preview" className="max-h-48 mx-auto rounded-xl object-cover w-full" />
                      <button onClick={(e) => { e.stopPropagation(); setImgPrev(''); setForm((f: any) => ({ ...f, imageUrl: '' })) }}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full
                                   flex items-center justify-center hover:bg-red-600 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-16 h-16 bg-blue-pale rounded-2xl flex items-center justify-center
                                      mx-auto mb-3 group-hover:bg-blue-mid transition-colors">
                        <ImagePlus size={28} className="text-blue-mid group-hover:text-white" />
                      </div>
                      <p className="font-bold text-blue-deep text-sm mb-1">Uploader une image de couverture</p>
                      <p className="text-xs text-gray-400">JPG, PNG, WebP · Max 5 Mo · 1200×630px recommandé</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImg} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">— Ou URL externe</label>
                <input type="url" placeholder="https://…" value={form.imageUrl}
                  onChange={(e) => { set('imageUrl')(e); if (e.target.value) setImgPrev(e.target.value) }}
                  className={inputCls} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-medium
                       text-gray-500 hover:border-gray-400 transition-all">
            Annuler
          </button>
          <button onClick={() => onSave({ ...form, id: form.id || Date.now().toString(), views: 0 })}
            disabled={!form.title}
            className="flex items-center gap-2 bg-blue-mid text-white px-6 py-2.5 rounded-xl
                       font-bold text-sm hover:bg-blue-deep transition-all disabled:opacity-40">
            <Save size={15} /> {isNew ? 'Publier l\'article' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminBlogPage() {
  const [articles, setArticles] = useState<Article[]>(MOCK)
  const [modal,    setModal]    = useState<Partial<Article> | null | false>(false)
  const [search,   setSearch]   = useState('')

  const filtered = articles.filter((a) =>
    !search || a.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (data: Article) => {
    if (articles.find((a) => a.id === data.id)) {
      setArticles((as) => as.map((a) => a.id === data.id ? data : a))
    } else {
      setArticles((as) => [...as, data])
    }
    setModal(false)
  }

  const togglePublish = (id: string) =>
    setArticles((as) => as.map((a) => a.id === id ? { ...a, published: !a.published } : a))

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Articles publiés', value: articles.filter((a) => a.published).length, color: 'text-green-600' },
          { label: 'Brouillons',       value: articles.filter((a) => !a.published).length, color: 'text-gray-400' },
          { label: 'Vues totales',     value: articles.reduce((acc, a) => acc + a.views, 0), color: 'text-blue-mid' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
            <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Rechercher un article…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl
                       text-sm outline-none focus:border-blue-mid transition-all" />
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 bg-blue-mid text-white px-5 py-2.5 rounded-xl
                     font-bold text-sm hover:bg-blue-deep transition-all ml-auto">
          <Plus size={16} /> Nouvel article
        </button>
      </div>

      {/* Articles */}
      <div className="space-y-3">
        {filtered.map((a) => (
          <div key={a.id}
            className={`bg-white border-2 rounded-2xl p-5 flex items-center gap-4 transition-all
                         hover:border-blue-mid/30 hover:shadow-md
                         ${!a.published ? 'opacity-60 border-gray-100' : 'border-gray-100'}`}>

            {/* Miniature */}
            <div className="w-20 h-16 bg-gradient-to-br from-blue-pale to-[#C5D4F0]
                            rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
              {a.imageUrl
                ? <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover" />
                : <FileText size={24} className="text-blue-mid" />
              }
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-bold text-blue-deep text-sm leading-snug truncate">{a.title}</h3>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold
                                  ${a.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {a.published ? '● Publié' : '○ Brouillon'}
                </span>
              </div>
              <p className="text-xs text-gray-400 line-clamp-1 mb-1.5">{a.excerpt}</p>
              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                <span className="bg-blue-pale text-blue-mid font-medium px-2 py-0.5 rounded-full">
                  {a.category}
                </span>
                <span>{a.date}</span>
                {a.published && <span>{a.views} vues</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => togglePublish(a.id)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center
                           text-gray-400 hover:text-blue-mid transition-all">
                {a.published ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button onClick={() => setModal(a)}
                className="w-8 h-8 rounded-lg hover:bg-blue-pale flex items-center justify-center
                           text-gray-400 hover:text-blue-mid transition-all">
                <Edit2 size={15} />
              </button>
              <button onClick={() => setArticles((as) => as.filter((x) => x.id !== a.id))}
                className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center
                           text-gray-400 hover:text-red-500 transition-all">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}

        {/* Bouton ajout */}
        <button onClick={() => setModal({})}
          className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-5
                     flex items-center justify-center gap-3 hover:border-blue-mid
                     hover:bg-blue-pale/30 transition-all text-gray-400 hover:text-blue-mid group">
          <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-blue-mid
                          flex items-center justify-center transition-all">
            <Plus size={16} className="group-hover:text-white" />
          </div>
          <span className="font-bold text-sm">Rédiger un nouvel article</span>
        </button>
      </div>

      {modal !== false && (
        <ArticleModal article={modal} onClose={() => setModal(false)} onSave={handleSave} />
      )}
    </div>
  )
}
