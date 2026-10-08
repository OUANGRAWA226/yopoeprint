'use client'

// ─────────────────────────────────────────────────────────────
// src/app/admin/produits/page.tsx
// Page Produits connectée à NestJS + Supabase + Cloudinary
// ─────────────────────────────────────────────────────────────

import { useState, useRef } from 'react'
import {
 Plus, Search, Edit2, Trash2, Eye, EyeOff,
 X, Save, AlertCircle, ImagePlus, CheckCircle,
 RefreshCw, Loader2, AlertTriangle
} from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import type { Product } from '@/lib/products.service'
import type { CreateProductDto, UpdateProductDto } from '@/lib/products.service'

// ── Constantes ────────────────────────────────────────────────
const CATEGORIES = ['flyers', 'cartes', 'affiches', 'brochures', 'roll-up', 'goodies', 'textile', 'evenementiel']
const BADGES = [
 { value: '', label: 'Aucun badge' },
 { value: 'popular', label: '⭐ Populaire' },
 { value: 'new', label: '✦ Nouveau' },
 { value: 'promo', label: '🔥 Promo' },
]

const EMPTY_FORM = {
 name: '', slug: '', shortDesc: '', description: '',
 category: 'flyers', basePrice: 0, minQuantity: 100,
 badge: '', active: true, imageUrl: '', emoji: '📄',
}

// ── Composant Toast ───────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
 return (
 <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5
 rounded-2xl shadow-2xl text-sm font-medium animate-slide-up
 ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
 {type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
 {message}
 <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
 <X size={14} />
 </button>
 </div>
 )
}

// ── Modal Produit ─────────────────────────────────────────────
function ProductModal({
 product,
 saving,
 uploadPct,
 onClose,
 onSave,
}: {
 product: Partial<Product> | null
 saving: boolean
 uploadPct: number
 onClose: () => void
 onSave: (data: any, imageFile?: File) => void
}) {
 const isNew = !product?.id
 const [form, setForm] = useState<any>(product || EMPTY_FORM)
 const [tab, setTab] = useState<'infos' | 'prix' | 'media'>('infos')
 const [imgPrev,setImgPrev] = useState<string>(product?.imageUrl || '')
 const [imgFile,setImgFile] = useState<File | undefined>()
 const fileRef = useRef<HTMLInputElement>(null)

 const set = (k: string) =>
 (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
 setForm((f: any) => ({ ...f, [k]: e.target.value }))

 // Génère le slug depuis le nom
 const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
 const name = e.target.value
 const slug = name.toLowerCase()
 .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
 .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
 setForm((f: any) => ({ ...f, name, slug }))
 }

 // Prévisualisation image locale
 const handleImgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0]
 if (!file) return
 setImgFile(file)
 const reader = new FileReader()
 reader.onload = (ev) => setImgPrev(ev.target?.result as string)
 reader.readAsDataURL(file)
 }

 const handleSave = () => {
 if (!form.name || !form.basePrice) return
 onSave(form, imgFile)
 }

 const inputCls = `w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl
 text-sm outline-none focus:border-border focus:bg-white transition-all`

 return (
 <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
 flex items-center justify-center p-4" onClick={onClose}>
 <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh]
 overflow-hidden flex flex-col"
 onClick={(e) => e.stopPropagation()}>

 {/* Header */}
 <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
 <div>
 <h2 className="font-display text-xl font-bold text-foreground">
 {isNew ? 'Nouveau produit' : `Modifier — ${product?.name}`}
 </h2>
 <p className="text-xs text-gray-400 mt-0.5">
 {isNew ? 'Créé directement en base de données' : 'Modifications sauvegardées en base de données'}
 </p>
 </div>
 <button onClick={onClose}
 className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center
 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
 <X size={16} />
 </button>
 </div>

 {/* Tabs */}
 <div className="flex gap-0 px-6 pt-4 border-b border-gray-100">
 {[
 { key: 'infos', label: '📝 Informations' },
 { key: 'prix', label: '💰 Prix & Stock' },
 { key: 'media', label: '🖼️ Image' },
 ].map(({ key, label }) => (
 <button key={key} onClick={() => setTab(key as any)}
 className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px
 ${tab === key
 ? 'border-border text-foreground'
 : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
 {label}
 </button>
 ))}
 </div>

 {/* Body */}
 <div className="flex-1 overflow-y-auto p-6 space-y-4">

 {/* ── Infos ─────────────────────────────────── */}
 {tab === 'infos' && (
 <>
 <div className="grid grid-cols-2 gap-4">
 <div className="col-span-2">
 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
 Nom du produit *
 </label>
 <input type="text" placeholder="Ex: Flyer A5 classique"
 value={form.name} onChange={handleName} className={inputCls} />
 </div>
 <div>
 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
 Slug URL
 </label>
 <input type="text" value={form.slug} onChange={set('slug')}
 className={`${inputCls} font-mono text-xs`} />
 <p className="text-[10px] text-gray-400 mt-1">
 /produit/<strong>{form.slug || 'votre-produit'}</strong>
 </p>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
 Emoji
 </label>
 <input type="text" value={form.emoji} onChange={set('emoji')}
 className={`${inputCls} text-2xl text-center`} maxLength={2} />
 </div>
 </div>

 <div>
 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
 Description courte *
 </label>
 <input type="text" placeholder="Ex: Recto/Verso · Papier couché 135g"
 value={form.shortDesc} onChange={set('shortDesc')} className={inputCls} />
 </div>

 <div>
 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
 Description complète
 </label>
 <textarea rows={4} placeholder="Description détaillée, spécifications techniques…"
 value={form.description} onChange={set('description')}
 className={`${inputCls} resize-none`} />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
 Catégorie *
 </label>
 <select value={form.category} onChange={set('category')}
 className={`${inputCls} cursor-pointer`}>
 {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
 </select>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
 Badge
 </label>
 <select value={form.badge || ''} onChange={set('badge')}
 className={`${inputCls} cursor-pointer`}>
 {BADGES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
 </select>
 </div>
 </div>

 {/* Toggle actif */}
 <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer"
 onClick={() => setForm((f: any) => ({ ...f, active: !f.active }))}>
 <div className={`w-11 h-6 rounded-full transition-colors relative
 ${form.active ? 'bg-foreground' : 'bg-gray-300'}`}>
 <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow
 transition-transform
 ${form.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
 </div>
 <span className="text-sm font-medium text-foreground select-none">
 Produit {form.active ? 'actif — visible sur le site' : 'inactif — masqué'}
 </span>
 </div>
 </>
 )}

 {/* ── Prix ──────────────────────────────────── */}
 {tab === 'prix' && (
 <>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
 Prix de base (FCFA) *
 </label>
 <input type="number" placeholder="8500"
 value={form.basePrice || ''} onChange={set('basePrice')}
 className={inputCls} />
 <p className="text-[10px] text-gray-400 mt-1">
 Affiché &quot;à partir de&quot; sur la fiche produit
 </p>
 </div>
 <div>
 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
 Quantité minimum
 </label>
 <input type="number" placeholder="100"
 value={form.minQuantity || ''} onChange={set('minQuantity')}
 className={inputCls} />
 </div>
 </div>

 {/* Grille dégressive simulée */}
 <div>
 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">
 Aperçu grille tarifaire dégressive
 </label>
 <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-gray-100">
 <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-400">Quantité</th>
 <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-400">Prix total</th>
 <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-400">Réduction</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {[
 { factor: 1, pctOff: 0 },
 { factor: 0.9, pctOff: 10 },
 { factor: 0.78, pctOff: 22 },
 { factor: 0.65, pctOff: 35 },
 ].map(({ factor, pctOff }, i) => {
 const qty = (form.minQuantity || 100) * [1, 2, 5, 10][i]
 const total = Math.round((form.basePrice || 0) * factor)
 return (
 <tr key={i} className="hover:bg-white transition-colors">
 <td className="px-4 py-2.5 font-medium">
 {new Intl.NumberFormat('fr-FR').format(qty)} pièces
 </td>
 <td className="px-4 py-2.5 font-bold text-foreground">
 {total > 0 ? new Intl.NumberFormat('fr-FR').format(total) + ' FCFA' : '—'}
 </td>
 <td className="px-4 py-2.5 text-xs">
 {pctOff > 0
 ? <span className="text-green-600 font-bold">−{pctOff}%</span>
 : <span className="text-gray-400">Prix de base</span>
 }
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>
 </div>
 </div>
 </>
 )}

 {/* ── Media ─────────────────────────────────── */}
 {tab === 'media' && (
 <>
 <div>
 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">
 Image du produit
 </label>

 {/* Zone drop */}
 <div onClick={() => fileRef.current?.click()}
 className="border-2 border-dashed border-gray-200 rounded-2xl p-8
 hover:border-border hover:bg-secondary transition-all
 cursor-pointer text-center group">
 {imgPrev ? (
 <div className="relative">
 <img src={imgPrev} alt="Aperçu"
 className="max-h-48 mx-auto rounded-xl object-contain" />
 <button
 onClick={(e) => { e.stopPropagation(); setImgPrev(''); setImgFile(undefined); setForm((f: any) => ({ ...f, imageUrl: '' })) }}
 className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white
 rounded-full flex items-center justify-center
 hover:bg-red-600 transition-colors">
 <X size={12} />
 </button>
 </div>
 ) : (
 <div>
 <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center
 justify-center mx-auto mb-3 group-hover:bg-foreground transition-colors">
 <ImagePlus size={28} className="text-foreground group-hover:text-white" />
 </div>
 <p className="font-bold text-foreground text-sm mb-1">
 Cliquez pour sélectionner une image
 </p>
 <p className="text-xs text-gray-400">
 JPG, PNG, WebP · Max 5 Mo · Recommandé : 800×600px
 </p>
 </div>
 )}
 </div>
 <input ref={fileRef} type="file" accept="image/*"
 className="hidden" onChange={handleImgFile} />

 {/* Progression upload */}
 {saving && uploadPct > 0 && uploadPct < 100 && (
 <div className="mt-3">
 <div className="flex justify-between text-xs text-gray-400 mb-1">
 <span>Upload image en cours…</span>
 <span>{uploadPct}%</span>
 </div>
 <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
 <div className="h-full bg-foreground rounded-full transition-all"
 style={{ width: `${uploadPct}%` }} />
 </div>
 </div>
 )}
 {saving && uploadPct === 100 && (
 <p className="mt-2 flex items-center gap-2 text-green-600 text-xs font-medium">
 <CheckCircle size={14} /> Image uploadée — sauvegarde en cours…
 </p>
 )}

 {imgFile && !saving && (
 <p className="mt-2 flex items-center gap-2 text-foreground text-xs font-medium">
 <CheckCircle size={14} />
 <span>Image sélectionnée : <strong>{imgFile.name}</strong> — sera uploadée à la sauvegarde</span>
 </p>
 )}
 </div>

 {/* URL manuelle */}
 <div>
 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
 — Ou URL d&apos;image existante
 </label>
 <input type="url" placeholder="https://res.cloudinary.com/…"
 value={form.imageUrl || ''}
 onChange={(e) => { set('imageUrl')(e); setImgPrev(e.target.value); setImgFile(undefined) }}
 className={inputCls} />
 </div>

 {/* Aperçu emoji fallback */}
 <div className="bg-gray-50 rounded-xl p-4">
 <p className="text-xs font-bold text-gray-400 mb-2">
 Illustration automatique (si pas d&apos;image)
 </p>
 <div className=" bg-secondary to-[#C5D4F0]
 rounded-xl h-28 flex items-center justify-center">
 <span className="text-5xl">{form.emoji || '📄'}</span>
 </div>
 </div>
 </>
 )}
 </div>

 {/* Footer */}
 <div className="flex items-center justify-between px-6 py-4
 border-t border-gray-100 bg-gray-50">
 <button onClick={onClose}
 className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm
 font-medium text-gray-500 hover:border-gray-400 transition-all">
 Annuler
 </button>
 <button onClick={handleSave}
 disabled={saving || !form.name || !form.basePrice}
 className="flex items-center gap-2 bg-foreground text-white px-6 py-2.5
 rounded-xl font-bold text-sm hover:bg-foreground transition-all
 disabled:opacity-50 disabled:cursor-not-allowed">
 {saving
 ? <><Loader2 size={15} className="animate-spin" /> Enregistrement…</>
 : <><Save size={15} /> {isNew ? 'Créer en base' : 'Sauvegarder'}</>
 }
 </button>
 </div>
 </div>
 </div>
 )
}

// ── Page principale ───────────────────────────────────────────
export default function AdminProduitsPage() {
 const {
 products, loading, error, saving, uploadPct,
 fetchProducts, create, update, toggleActive, remove,
 } = useProducts()

 const [search, setSearch] = useState('')
 const [catFilter, setCatFilter] = useState('all')
 const [modal, setModal] = useState<Partial<Product> | null | false>(false)
 const [deleteId, setDeleteId] = useState<string | null>(null)
 const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

 const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
 setToast({ msg, type })
 setTimeout(() => setToast(null), 3500)
 }

 const filtered = products.filter((p) =>
 (catFilter === 'all' || p.category === catFilter) &&
 (!search || p.name.toLowerCase().includes(search.toLowerCase()))
 )

 // ── Handlers ────────────────────────────────────────────────
 const handleSave = async (data: any, imageFile?: File) => {
 if (data.id) {
 // Mise à jour
 const result = await update(data.id, data, imageFile)
 if (result) {
 showToast(`"${result.name}" mis à jour avec succès ✓`)
 setModal(false)
 } else {
 showToast('Erreur lors de la mise à jour', 'error')
 }
 } else {
 // Création
 const result = await create(data, imageFile)
 if (result) {
 showToast(`"${result.name}" créé en base de données ✓`)
 setModal(false)
 } else {
 showToast('Erreur lors de la création', 'error')
 }
 }
 }

 const handleToggle = async (p: Product) => {
 await toggleActive(p.id, !p.active)
 showToast(`"${p.name}" ${!p.active ? 'activé' : 'désactivé'}`)
 }

 const handleDelete = async (id: string) => {
 const ok = await remove(id)
 setDeleteId(null)
 if (ok) showToast('Produit supprimé')
 else showToast('Erreur lors de la suppression', 'error')
 }

 // ── Rendu ────────────────────────────────────────────────────
 return (
 <div className="space-y-5">

 {/* Erreur API */}
 {error && (
 <div className="flex items-center gap-3 bg-red-50 border border-red-200
 text-red-700 px-4 py-3 rounded-xl text-sm">
 <AlertCircle size={16} />
 <span className="flex-1">{error}</span>
 <button onClick={fetchProducts}
 className="flex items-center gap-1 font-bold hover:underline">
 <RefreshCw size={13} /> Réessayer
 </button>
 </div>
 )}

 {/* ── Toolbar ─────────────────────────────────────── */}
 <div className="flex items-center gap-3 flex-wrap">
 <div className="relative flex-1 min-w-48">
 <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
 <input placeholder="Rechercher un produit…"
 value={search} onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl
 text-sm outline-none focus:border-border transition-all" />
 </div>

 <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
 className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
 outline-none cursor-pointer focus:border-border">
 <option value="all">Toutes catégories</option>
 {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
 </select>

 <button onClick={fetchProducts} disabled={loading}
 className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400
 hover:text-foreground hover:border-border transition-all">
 <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
 </button>

 <button onClick={() => setModal({})}
 className="flex items-center gap-2 bg-foreground text-white px-5 py-2.5
 rounded-xl font-bold text-sm hover:bg-foreground transition-all shadow-sm">
 <Plus size={16} /> Nouveau produit
 </button>
 </div>

 {/* ── Stats ─────────────────────────────────────────── */}
 <div className="grid grid-cols-3 gap-3">
 {[
 { label: 'Total', value: products.length, color: 'text-foreground' },
 { label: 'Actifs', value: products.filter((p) => p.active).length, color: 'text-green-600' },
 { label: 'Inactifs', value: products.filter((p) => !p.active).length, color: 'text-gray-400' },
 ].map(({ label, value, color }) => (
 <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
 <p className={`font-display text-2xl font-bold ${color}`}>
 {loading ? '…' : value}
 </p>
 <p className="text-xs text-gray-400">{label}</p>
 </div>
 ))}
 </div>

 {/* ── Skeleton chargement ────────────────────────────── */}
 {loading && (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {Array.from({ length: 6 }).map((_, i) => (
 <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
 <div className="h-36 bg-gray-100" />
 <div className="p-4 space-y-2">
 <div className="h-4 bg-gray-100 rounded w-2/3" />
 <div className="h-3 bg-gray-100 rounded w-1/2" />
 <div className="h-8 bg-gray-100 rounded mt-3" />
 </div>
 </div>
 ))}
 </div>
 )}

 {/* ── Grille produits ────────────────────────────────── */}
 {!loading && (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {filtered.map((p) => (
 <div key={p.id}
 className={`bg-white border-2 rounded-2xl overflow-hidden transition-all
 hover:shadow-md
 ${p.active ? 'border-gray-100 hover:border-border/30' : 'border-gray-100 opacity-55'}`}>

 {/* Image */}
 <div className="h-36 bg-secondary to-[#C5D4F0]
 flex items-center justify-center relative overflow-hidden">
 {p.imageUrl ? (
 <img src={p.imageUrl} alt={p.name}
 className="w-full h-full object-cover" />
 ) : (
 <span className="text-5xl filter drop-shadow">{p.emoji}</span>
 )}
 {p.badge && (
 <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full
 text-[10px] font-bold
 ${p.badge === 'popular' ? 'bg-primary text-foreground' :
 p.badge === 'new' ? 'bg-green-600 text-white' :
 'bg-red-600 text-white'}`}>
 {p.badge === 'popular' ? '⭐ Populaire' : p.badge === 'new' ? '✦ Nouveau' : '🔥 Promo'}
 </span>
 )}
 <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold
 ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
 {p.active ? '● Actif' : '○ Inactif'}
 </span>
 </div>

 {/* Infos */}
 <div className="p-4">
 <div className="flex items-start justify-between gap-2 mb-1">
 <h3 className="font-bold text-foreground text-sm leading-snug">{p.name}</h3>
 <span className="text-xs bg-secondary text-foreground px-2 py-0.5
 rounded-full font-medium shrink-0">{p.category}</span>
 </div>
 <p className="text-xs text-gray-400 mb-3 line-clamp-1">{p.shortDesc}</p>
 <div className="flex items-center justify-between">
 <div>
 <p className="font-display font-bold text-foreground text-base leading-none">
 {new Intl.NumberFormat('fr-FR').format(p.basePrice)}
 <span className="text-xs font-sans font-normal text-gray-400 ml-1">FCFA</span>
 </p>
 <p className="text-[10px] text-gray-400">
 min. {new Intl.NumberFormat('fr-FR').format(p.minQuantity)} pièces
 </p>
 </div>
 <div className="flex items-center gap-1">
 <button onClick={() => handleToggle(p)}
 className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center
 justify-center text-gray-400 hover:text-foreground transition-all"
 title={p.active ? 'Désactiver' : 'Activer'}>
 {p.active ? <EyeOff size={15} /> : <Eye size={15} />}
 </button>
 <button onClick={() => setModal(p)}
 className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center
 justify-center text-gray-400 hover:text-foreground transition-all">
 <Edit2 size={15} />
 </button>
 <button onClick={() => setDeleteId(p.id)}
 className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center
 justify-center text-gray-400 hover:text-red-500 transition-all">
 <Trash2 size={15} />
 </button>
 </div>
 </div>
 </div>
 </div>
 ))}

 {/* Carte ajout rapide */}
 <button onClick={() => setModal({})}
 className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col
 items-center justify-center gap-3 p-8 hover:border-border
 hover:bg-secondary transition-all text-gray-400
 hover:text-foreground group min-h-[240px]">
 <div className="w-14 h-14 rounded-2xl bg-gray-100 group-hover:bg-foreground
 flex items-center justify-center transition-all">
 <Plus size={24} className="group-hover:text-white" />
 </div>
 <p className="font-bold text-sm">Ajouter un produit</p>
 </button>
 </div>
 )}

 {/* ── Modal produit ────────────────────────────────── */}
 {modal !== false && (
 <ProductModal
 product={modal}
 saving={saving}
 uploadPct={uploadPct}
 onClose={() => setModal(false)}
 onSave={handleSave}
 />
 )}

 {/* ── Confirmation suppression ─────────────────────── */}
 {deleteId && (
 <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
 flex items-center justify-center p-4">
 <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
 <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center
 justify-center mx-auto mb-4">
 <AlertCircle size={24} className="text-red-500" />
 </div>
 <h3 className="font-bold text-foreground text-center mb-2">Supprimer ce produit ?</h3>
 <p className="text-sm text-gray-400 text-center mb-5">
 Cette action supprime le produit définitivement en base de données.
 </p>
 <div className="flex gap-3">
 <button onClick={() => setDeleteId(null)}
 className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm
 font-medium hover:border-gray-400 transition-all">
 Annuler
 </button>
 <button onClick={() => handleDelete(deleteId)} disabled={saving}
 className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm
 font-bold hover:bg-red-600 transition-all flex items-center
 justify-center gap-2 disabled:opacity-50">
 {saving ? <Loader2 size={14} className="animate-spin" /> : null}
 Supprimer
 </button>
 </div>
 </div>
 </div>
 )}

 {/* ── Toast notification ───────────────────────────── */}
 {toast && (
 <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
 )}
 </div>
 )
}
