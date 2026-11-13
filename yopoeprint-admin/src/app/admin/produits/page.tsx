'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff, Save, ImagePlus, Package, X, PackageCheck, PackageX,
} from 'lucide-react'
import { api } from '@/lib'
import { uploadMedia } from '@/lib/media.service'
import { Card, ErrorAlert, InfoBox, LoadingRow, Modal, Spinner, TableMessage } from '@/components/ui'
import { fcfa, num } from '@/components/status'

// ── Types (produit tel que renvoyé par GET /products) ─────────
interface Format { id: string; label: string; dimensions: string; multiplier?: number }
interface Paper { id: string; label: string; description: string; priceExtra?: number }
interface Finish { id: string; label: string; value: string; priceModifier: number }
interface GalleryImage { id: string; label: string; description: string; url: string; order: number }

interface Product {
  id: string
  slug: string
  name: string
  shortDesc: string
  description: string
  category: string
  badge: string
  emoji: string
  bgGradient: string
  imageUrl: string
  images: GalleryImage[]
  basePrice: number
  minQuantity: number
  formats: Format[]
  papers: Paper[]
  quantities: number[]
  finishes: Finish[]
  deliveryDays: number
  isPopular: boolean
  sortOrder: number
  isHomeOffer: boolean
  inCalculator: boolean
  offerQuantity: number | null
  active: boolean
}

const CATEGORIES: Record<string, string> = {
  'flyers': 'Flyers & dépliants', 'cartes-de-visite': 'Cartes de visite', 'affiches': 'Affiches & posters',
  'brochures': 'Brochures & catalogues', 'roll-up': 'Roll-ups & salons', 'goodies': 'Goodies & cadeaux',
  'textile': 'Textile pro', 'evenementiel': 'Événementiel', 'signaletique': 'Signalétique & bâches', 'corporate': 'Papeterie d\'entreprise',
}
const BADGES: Record<string, { label: string; badge: string }> = {
  popular: { label: 'Populaire', badge: 'text-bg-warning' },
  new:     { label: 'Nouveau',   badge: 'text-bg-success' },
  promo:   { label: 'Promo',     badge: 'text-bg-danger' },
}

const EMPTY: Omit<Product, 'id'> & { id?: string } = {
  slug: '', name: '', shortDesc: '', description: '', category: 'flyers', badge: '', emoji: '📄',
  bgGradient: 'linear-gradient(135deg, #E8EEF8, #C5D4F0)', imageUrl: '', images: [],
  basePrice: 0, minQuantity: 100,
  formats: [{ id: 'format-1', label: 'Format 1', dimensions: '10 x 15 cm', multiplier: 1 }],
  papers: [{ id: 'paper-1', label: 'Papier standard', description: 'Papier standard 80g', priceExtra: 0 }],
  quantities: [100, 250, 500, 1000],
  finishes: [{ id: 'none', label: 'Aucune finition', value: 'none', priceModifier: 0 }],
  deliveryDays: 2, isPopular: false, sortOrder: 0, isHomeOffer: false, inCalculator: false, offerQuantity: null, active: true,
}

const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

// Même formule que l'API (products.service.ts › computePrice) : prix réellement facturé
function computePrice(basePrice: number, minQuantity: number, quantity: number, finishModifier = 0, formatMultiplier = 1, paperExtra = 0) {
  if (!basePrice || !minQuantity || !quantity) return { total: 0, unitPrice: 0 }
  let total = basePrice * Math.pow(quantity / minQuantity, 0.75) * formatMultiplier
  total += finishModifier + paperExtra
  total = Math.round(total / 100) * 100
  return { total, unitPrice: Math.round((total / quantity) * 10) / 10 }
}

const toProduct = (p: any): Product => ({
  ...EMPTY,
  ...p,
  id: String(p.id ?? ''),
  badge: p.badge || '',
  imageUrl: p.imageUrl || '',
  images: Array.isArray(p.images) ? p.images : [],
  active: (p.isActive ?? p.active) !== false,
})

// Champs acceptés par l'API (le reste serait ignoré, et badge vide refusé)
function payloadOf(f: typeof EMPTY) {
  return {
    name: f.name.trim(), slug: f.slug.trim(), shortDesc: f.shortDesc, description: f.description,
    category: f.category, badge: f.badge || null, emoji: f.emoji || '📄', bgGradient: f.bgGradient,
    imageUrl: f.imageUrl || undefined, images: f.images.map((img, i) => ({ ...img, order: i })),
    basePrice: Number(f.basePrice) || 0, minQuantity: Number(f.minQuantity) || 1,
    formats: f.formats, papers: f.papers, quantities: f.quantities, finishes: f.finishes,
    deliveryDays: Number(f.deliveryDays) || 1, isPopular: !!f.isPopular, sortOrder: Number(f.sortOrder) || 0,
    isHomeOffer: !!f.isHomeOffer, inCalculator: !!f.inCalculator, offerQuantity: f.offerQuantity || null,
  }
}

// ── Formulaire produit ─────────────────────────────────────────
type Tab = 'infos' | 'config' | 'prix' | 'media'

function ProductForm({ initial, onSaved, onCancel }: {
  initial: typeof EMPTY
  onSaved: () => void
  onCancel: () => void
}) {
  const isNew = !initial.id
  const [form, setForm] = useState(initial)
  const [tab, setTab] = useState<Tab>('infos')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [upload, setUpload] = useState<{ target: 'main' | 'gallery'; percent: number } | null>(null)
  const [newQty, setNewQty] = useState('')
  const mainRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const patch = (p: Partial<typeof EMPTY>) => { setDirty(true); setForm((f) => ({ ...f, ...p })) }
  const field = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => patch({ [k]: e.target.value } as any)

  // Listes (formats, papiers, finitions) : mises à jour sans muter l'état existant
  function listOps<T>(key: 'formats' | 'papers' | 'finishes') {
    const list = form[key] as unknown as T[]
    return {
      update: (i: number, p: Partial<T>) => patch({ [key]: list.map((x, j) => (j === i ? { ...x, ...p } : x)) } as any),
      remove: (i: number) => patch({ [key]: list.filter((_, j) => j !== i) } as any),
      add: (item: T) => patch({ [key]: [...list, item] } as any),
    }
  }
  const formats = listOps<Format>('formats')
  const papers = listOps<Paper>('papers')
  const finishes = listOps<Finish>('finishes')

  const cancel = () => {
    if (dirty && !window.confirm('Des modifications ne sont pas enregistrées. Fermer quand même ?')) return
    onCancel()
  }

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'gallery') => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setUpload({ target, percent: 0 })
    try {
      const url = await uploadMedia(file, 'products', (percent) => setUpload({ target, percent }))
      if (target === 'main') patch({ imageUrl: url })
      else patch({ images: [...form.images, { id: uid('img'), label: `Vue ${form.images.length + 1}`, description: '', url, order: form.images.length }] })
    } catch (err: any) {
      setError(err?.message || 'Envoi de l\'image impossible')
    } finally {
      setUpload(null)
    }
  }

  const addQuantity = () => {
    const q = parseInt(newQty, 10)
    if (!(q > 0) || form.quantities.includes(q)) return
    patch({ quantities: [...form.quantities, q].sort((a, b) => a - b) })
    setNewQty('')
  }

  const save = async () => {
    setError('')
    const missing = [
      !form.name.trim() && 'nom', !form.slug.trim() && 'adresse (slug)', !form.shortDesc.trim() && 'description courte',
      !(Number(form.basePrice) > 0) && 'prix de base', !form.formats.length && 'au moins un format',
      !form.papers.length && 'au moins un papier', !form.finishes.length && 'au moins une finition', !form.quantities.length && 'au moins une quantité',
    ].filter(Boolean)
    if (missing.length) { setError(`À compléter : ${missing.join(', ')}.`); return }

    setSaving(true)
    try {
      const body = payloadOf(form)
      if (isNew) {
        const created = await api.post<any>('/products', body)
        // La création active toujours le produit : on applique ensuite le choix « inactif »
        if (!form.active && created?.id) await api.patch(`/products/${created.id}`, { active: false })
      } else {
        await api.patch(`/products/${form.id}`, { ...body, active: form.active })
      }
      setDirty(false)
      onSaved()
    } catch (err: any) {
      setError(err?.message || 'Enregistrement impossible')
    } finally {
      setSaving(false)
    }
  }

  const f0 = form.formats[0], p0 = form.papers[0], fin0 = form.finishes[0]
  const tabs: [Tab, string][] = [['infos', 'Informations'], ['config', 'Configuration'], ['prix', 'Prix'], ['media', 'Images']]

  return (
    <Modal open size="xl" title={isNew ? 'Nouveau produit' : `Modifier — ${initial.name}`} onClose={cancel}
      footer={
        <>
          <button type="button" onClick={cancel} className="btn btn-outline-secondary">Annuler</button>
          <button type="button" onClick={save} disabled={saving || !!upload} className="btn btn-primary d-inline-flex align-items-center gap-2">
            {saving ? <Spinner /> : <Save size={15} />} {isNew ? 'Créer le produit' : 'Enregistrer'}
          </button>
        </>
      }>
      <ul className="nav nav-tabs mb-3" role="tablist">
        {tabs.map(([key, label]) => (
          <li key={key} className="nav-item">
            <button type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`nav-link ${tab === key ? 'active' : ''}`}>{label}</button>
          </li>
        ))}
      </ul>

      {error && <div role="alert" className="alert alert-danger py-2">{error}</div>}

      {/* ── Informations ── */}
      {tab === 'infos' && (
        <div className="row g-3">
          <div className="col-md-8">
            <label htmlFor="pf-name" className="form-label">Nom du produit *</label>
            <input id="pf-name" className="form-control" placeholder="Ex : Flyer A5 classique" value={form.name}
              onChange={(e) => patch({ name: e.target.value, ...(isNew ? { slug: slugify(e.target.value) } : {}) })} />
          </div>
          <div className="col-md-4">
            <label htmlFor="pf-emoji" className="form-label">Emoji</label>
            <input id="pf-emoji" className="form-control text-center fs-5" maxLength={2} value={form.emoji} onChange={field('emoji')} />
          </div>
          <div className="col-md-6">
            <label htmlFor="pf-slug" className="form-label">Adresse (slug) *</label>
            <input id="pf-slug" className="form-control font-mono" value={form.slug} onChange={field('slug')} aria-describedby="pf-slug-help" />
            <div id="pf-slug-help" className="form-text">/produit/<strong>{form.slug || 'votre-produit'}</strong></div>
          </div>
          <div className="col-md-3">
            <label htmlFor="pf-cat" className="form-label">Catégorie *</label>
            <select id="pf-cat" className="form-select" value={form.category} onChange={field('category')}>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label htmlFor="pf-badge" className="form-label">Badge</label>
            <select id="pf-badge" className="form-select" value={form.badge} onChange={field('badge')}>
              <option value="">Aucun</option>
              {Object.entries(BADGES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="col-12">
            <label htmlFor="pf-short" className="form-label">Description courte *</label>
            <input id="pf-short" className="form-control" placeholder="Ex : Recto/verso · Papier couché 135 g · 5 formats" value={form.shortDesc} onChange={field('shortDesc')} />
          </div>
          <div className="col-12">
            <label htmlFor="pf-desc" className="form-label">Description complète</label>
            <textarea id="pf-desc" rows={5} className="form-control" placeholder="Spécifications techniques, conseils d'utilisation…" value={form.description} onChange={field('description')} />
          </div>
          <div className="col-12">
            <div className="form-check form-switch">
              <input id="pf-active" type="checkbox" role="switch" className="form-check-input" checked={form.active} onChange={(e) => patch({ active: e.target.checked })} />
              <label htmlFor="pf-active" className="form-check-label">Produit {form.active ? 'actif (visible et commandable)' : 'inactif (masqué de la boutique)'}</label>
            </div>
          </div>
        </div>
      )}

      {/* ── Configuration ── */}
      {tab === 'config' && (
        <>
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label htmlFor="pf-days" className="form-label">Délai de production (jours) *</label>
              <input id="pf-days" type="number" min={1} className="form-control" value={form.deliveryDays} onChange={field('deliveryDays')} />
            </div>
            <div className="col-md-4">
              <label htmlFor="pf-sort" className="form-label">Ordre d&apos;affichage</label>
              <input id="pf-sort" type="number" className="form-control" value={form.sortOrder} onChange={field('sortOrder')} />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <div className="form-check form-switch mb-2">
                <input id="pf-pop" type="checkbox" role="switch" className="form-check-input" checked={form.isPopular} onChange={(e) => patch({ isPopular: e.target.checked })} />
                <label htmlFor="pf-pop" className="form-check-label">Produit populaire</label>
              </div>
            </div>
          </div>

          <fieldset className="border rounded p-3 mb-3">
            <legend className="float-none w-auto px-2 fs-6 mb-0">Mise en avant sur l&apos;accueil</legend>
            <div className="form-check mb-2">
              <input id="pf-offer" type="checkbox" className="form-check-input" checked={form.isHomeOffer} onChange={(e) => patch({ isHomeOffer: e.target.checked })} />
              <label htmlFor="pf-offer" className="form-check-label"><strong>Offre de l&apos;atelier</strong> <span className="text-secondary small">— carte dans « Offres de l&apos;atelier » et vedette du méga-menu de sa catégorie</span></label>
            </div>
            <div className="form-check mb-3">
              <input id="pf-calc" type="checkbox" className="form-check-input" checked={form.inCalculator} onChange={(e) => patch({ inCalculator: e.target.checked })} />
              <label htmlFor="pf-calc" className="form-check-label"><strong>Calculateur de prix</strong> <span className="text-secondary small">— onglet du calculateur de l&apos;accueil</span></label>
            </div>
            <label htmlFor="pf-offerq" className="form-label">Quantité du prix affiché (« Dès … »)</label>
            <select id="pf-offerq" className="form-select" style={{ maxWidth: 320 }} value={form.offerQuantity ?? ''}
              onChange={(e) => patch({ offerQuantity: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Quantité minimale ({form.minQuantity || '—'} ex.)</option>
              {form.quantities.map((q) => <option key={q} value={q}>{num(q)} ex.</option>)}
            </select>
          </fieldset>

          {/* Formats */}
          <h6 className="fw-semibold">Formats *</h6>
          <div className="table-responsive mb-3">
            <table className="table table-sm align-middle mb-1">
              <thead><tr><th>Libellé</th><th>Dimensions</th><th style={{ width: 150 }}>Coefficient de prix</th><th /></tr></thead>
              <tbody>
                {form.formats.map((fmt, i) => (
                  <tr key={fmt.id}>
                    <td><input className="form-control form-control-sm" placeholder="A5" value={fmt.label} onChange={(e) => formats.update(i, { label: e.target.value })} aria-label="Libellé du format" /></td>
                    <td><input className="form-control form-control-sm" placeholder="14,8 x 21 cm" value={fmt.dimensions} onChange={(e) => formats.update(i, { dimensions: e.target.value })} aria-label="Dimensions" /></td>
                    <td><input type="number" step="0.05" min={0.1} className="form-control form-control-sm" value={fmt.multiplier ?? 1} onChange={(e) => formats.update(i, { multiplier: Number(e.target.value) || 1 })} aria-label="Coefficient" /></td>
                    <td className="text-end"><button type="button" onClick={() => formats.remove(i)} className="btn btn-sm btn-outline-danger" aria-label="Retirer le format"><X size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={() => formats.add({ id: uid('fmt'), label: '', dimensions: '', multiplier: 1 })} className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"><Plus size={13} /> Ajouter un format</button>
          </div>

          {/* Papiers */}
          <h6 className="fw-semibold">Papiers *</h6>
          <div className="table-responsive mb-3">
            <table className="table table-sm align-middle mb-1">
              <thead><tr><th>Libellé</th><th>Description</th><th style={{ width: 150 }}>Supplément (FCFA)</th><th /></tr></thead>
              <tbody>
                {form.papers.map((p, i) => (
                  <tr key={p.id}>
                    <td><input className="form-control form-control-sm" placeholder="Couché 135 g" value={p.label} onChange={(e) => papers.update(i, { label: e.target.value })} aria-label="Libellé du papier" /></td>
                    <td><input className="form-control form-control-sm" placeholder="Couché brillant" value={p.description} onChange={(e) => papers.update(i, { description: e.target.value })} aria-label="Description du papier" /></td>
                    <td><input type="number" min={0} className="form-control form-control-sm" value={p.priceExtra ?? 0} onChange={(e) => papers.update(i, { priceExtra: Number(e.target.value) || 0 })} aria-label="Supplément" /></td>
                    <td className="text-end"><button type="button" onClick={() => papers.remove(i)} className="btn btn-sm btn-outline-danger" aria-label="Retirer le papier"><X size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={() => papers.add({ id: uid('paper'), label: '', description: '', priceExtra: 0 })} className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"><Plus size={13} /> Ajouter un papier</button>
          </div>

          {/* Finitions */}
          <h6 className="fw-semibold">Finitions *</h6>
          <div className="table-responsive mb-3">
            <table className="table table-sm align-middle mb-1">
              <thead><tr><th>Libellé</th><th style={{ width: 150 }}>Supplément (FCFA)</th><th /></tr></thead>
              <tbody>
                {form.finishes.map((fin, i) => (
                  <tr key={fin.id}>
                    <td><input className="form-control form-control-sm" placeholder="Pelliculage mat" value={fin.label}
                      onChange={(e) => finishes.update(i, { label: e.target.value, value: fin.value || slugify(e.target.value) })} aria-label="Libellé de la finition" /></td>
                    <td><input type="number" min={0} className="form-control form-control-sm" value={fin.priceModifier} onChange={(e) => finishes.update(i, { priceModifier: Number(e.target.value) || 0 })} aria-label="Supplément" /></td>
                    <td className="text-end"><button type="button" onClick={() => finishes.remove(i)} className="btn btn-sm btn-outline-danger" aria-label="Retirer la finition"><X size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={() => finishes.add({ id: uid('finish'), label: '', value: '', priceModifier: 0 })} className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"><Plus size={13} /> Ajouter une finition</button>
          </div>

          {/* Quantités */}
          <h6 className="fw-semibold">Quantités proposées *</h6>
          <div className="d-flex flex-wrap align-items-center gap-2">
            {form.quantities.map((q, i) => (
              <span key={q} className="badge text-bg-light border d-inline-flex align-items-center gap-1 fs-6 fw-normal">
                {num(q)}
                <button type="button" className="btn btn-link btn-sm p-0 text-danger" aria-label={`Retirer ${q}`}
                  onClick={() => patch({ quantities: form.quantities.filter((_, j) => j !== i) })}><X size={12} /></button>
              </span>
            ))}
            <div className="input-group input-group-sm" style={{ width: 170 }}>
              <input type="number" min={1} className="form-control" placeholder="Ex : 2500" value={newQty} aria-label="Nouvelle quantité"
                onChange={(e) => setNewQty(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addQuantity() } }} />
              <button type="button" className="btn btn-outline-primary" onClick={addQuantity}>Ajouter</button>
            </div>
          </div>
        </>
      )}

      {/* ── Prix ── */}
      {tab === 'prix' && (
        <>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label htmlFor="pf-price" className="form-label">Prix de base (FCFA) *</label>
              <input id="pf-price" type="number" min={1} className="form-control" placeholder="8500" value={form.basePrice || ''} onChange={field('basePrice')} aria-describedby="pf-price-help" />
              <div id="pf-price-help" className="form-text">Prix de la quantité minimale, dans la configuration de base.</div>
            </div>
            <div className="col-md-6">
              <label htmlFor="pf-min" className="form-label">Quantité minimale *</label>
              <input id="pf-min" type="number" min={1} className="form-control" placeholder="100" value={form.minQuantity || ''} onChange={field('minQuantity')} />
            </div>
          </div>

          <h6 className="fw-semibold">Prix facturés (configuration de base, recto seul)</h6>
          <p className="small text-secondary">
            Calculés avec la formule de l&apos;API : {f0?.label || 'premier format'} (×{f0?.multiplier ?? 1}), {p0?.label || 'premier papier'} (+{fcfa(p0?.priceExtra ?? 0)}),
            {' '}{fin0?.label || 'première finition'} (+{fcfa(fin0?.priceModifier ?? 0)}). Le recto/verso ajoute 60 %.
          </p>
          <table className="table table-striped table-sm">
            <thead><tr><th>Quantité</th><th>Prix total</th><th>Prix unitaire</th></tr></thead>
            <tbody>
              {form.quantities.length === 0 ? (
                <TableMessage colSpan={3}>Ajoutez des quantités dans l&apos;onglet Configuration.</TableMessage>
              ) : form.quantities.map((q) => {
                const r = computePrice(Number(form.basePrice), Number(form.minQuantity), q, fin0?.priceModifier ?? 0, f0?.multiplier ?? 1, p0?.priceExtra ?? 0)
                return (
                  <tr key={q}>
                    <td>{num(q)} ex.</td>
                    <td className="fw-semibold tabular-nums">{r.total ? fcfa(r.total) : '—'}</td>
                    <td className="tabular-nums text-secondary">{r.total ? `${new Intl.NumberFormat('fr-FR').format(r.unitPrice)} FCFA/u` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}

      {/* ── Images ── */}
      {tab === 'media' && (
        <div className="row g-4">
          <div className="col-lg-5">
            <h6 className="fw-semibold">Image principale</h6>
            <input ref={mainRef} type="file" accept="image/png,image/jpeg" className="d-none" onChange={(e) => uploadFile(e, 'main')} />
            <button type="button" onClick={() => mainRef.current?.click()} disabled={!!upload}
              className="btn btn-light border border-2 w-100 position-relative overflow-hidden d-flex align-items-center justify-content-center p-0"
              style={{ aspectRatio: '4 / 3', borderStyle: 'dashed', background: form.imageUrl ? undefined : form.bgGradient }}>
              {form.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imageUrl} alt="" className="w-100 h-100" style={{ objectFit: 'contain' }} />
              ) : upload?.target === 'main' ? (
                <span className="d-inline-flex align-items-center gap-2"><Spinner /> {upload.percent} %</span>
              ) : (
                <span className="d-flex flex-column align-items-center gap-1 small">
                  <span className="fs-1">{form.emoji}</span>
                  <span className="d-inline-flex align-items-center gap-1 text-primary fw-semibold"><ImagePlus size={16} /> Choisir une image (JPG ou PNG)</span>
                </span>
              )}
            </button>
            {form.imageUrl && <button type="button" onClick={() => patch({ imageUrl: '' })} className="btn btn-link btn-sm text-danger px-0">Retirer l&apos;image</button>}
            <div className="mt-2">
              <label htmlFor="pf-url" className="form-label small">Ou adresse d&apos;une image</label>
              <input id="pf-url" type="url" className="form-control form-control-sm" placeholder="https://…" value={form.imageUrl} onChange={field('imageUrl')} />
            </div>
            <div className="mt-3">
              <label htmlFor="pf-grad" className="form-label small">Fond affiché sans image (dégradé CSS) *</label>
              <input id="pf-grad" className="form-control form-control-sm font-mono" value={form.bgGradient} onChange={field('bgGradient')} />
            </div>
          </div>

          <div className="col-lg-7">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="fw-semibold mb-0">Galerie (recto, verso, détails…)</h6>
              <input ref={galleryRef} type="file" accept="image/png,image/jpeg" className="d-none" onChange={(e) => uploadFile(e, 'gallery')} />
              <button type="button" onClick={() => galleryRef.current?.click()} disabled={!!upload} className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                {upload?.target === 'gallery' ? <><Spinner /> {upload.percent} %</> : <><ImagePlus size={14} /> Ajouter une image</>}
              </button>
            </div>
            {form.images.length === 0 ? (
              <p className="text-secondary small border rounded p-4 text-center mb-0">Aucune image dans la galerie.</p>
            ) : (
              <ul className="list-group">
                {form.images.map((img, i) => (
                  <li key={img.id} className="list-group-item d-flex align-items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" width={56} height={56} className="rounded border flex-shrink-0" style={{ objectFit: 'cover' }} />
                    <div className="flex-grow-1 min-w-0">
                      <input className="form-control form-control-sm mb-1" value={img.label} aria-label="Libellé de l'image"
                        onChange={(e) => patch({ images: form.images.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                      <input className="form-control form-control-sm" placeholder="Description courte" value={img.description} aria-label="Description de l'image"
                        onChange={(e) => patch({ images: form.images.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })} />
                    </div>
                    <button type="button" className="btn btn-sm btn-outline-danger" aria-label={`Retirer ${img.label}`}
                      onClick={() => patch({ images: form.images.filter((_, j) => j !== i) })}><X size={13} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function AdminProduitsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [editing, setEditing] = useState<typeof EMPTY | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toRetire, setToRetire] = useState<Product | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await api.get<any>('/products?limit=200&includeInactive=true')
      const list = Array.isArray(data) ? data : data?.data || data?.products || []
      setProducts(list.map(toProduct))
      setError('')
    } catch (e: any) {
      setError(e?.message || 'Impossible de charger les produits')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleActive = async (p: Product) => {
    setBusyId(p.id); setError('')
    try {
      await api.patch(`/products/${p.id}/toggle`, {})
      setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)))
    } catch (e: any) {
      setError(`Statut non modifié : ${e?.message || 'API indisponible'}`)
    } finally {
      setBusyId(null)
    }
  }

  // DELETE = désactivation douce côté API : le produit reste listé ici, marqué inactif
  const retire = async (p: Product) => {
    setBusyId(p.id); setError('')
    try {
      await api.delete(`/products/${p.id}`)
      setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, active: false } : x)))
      setToRetire(null)
    } catch (e: any) {
      setError(`Produit non retiré : ${e?.message || 'API indisponible'}`)
    } finally {
      setBusyId(null)
    }
  }

  const q = search.trim().toLowerCase()
  const filtered = products.filter((p) => (catFilter === 'all' || p.category === catFilter) && (!q || p.name.toLowerCase().includes(q)))
  const active = products.filter((p) => p.active).length

  return (
    <>
      <div className="row">
        <div className="col-md-4"><InfoBox icon={<Package />} color="primary" label="Produits au catalogue" value={loading ? '…' : products.length} /></div>
        <div className="col-md-4"><InfoBox icon={<PackageCheck />} color="success" label="Actifs" value={loading ? '…' : active} /></div>
        <div className="col-md-4"><InfoBox icon={<PackageX />} color="secondary" label="Inactifs" value={loading ? '…' : products.length - active} /></div>
      </div>

      <ErrorAlert message={error} onRetry={load} />

      <Card title="Catalogue" icon={<Package size={18} />} noPadding
        tools={
          <>
            <div className="input-group input-group-sm" style={{ width: 220 }}>
              <span className="input-group-text"><Search size={13} /></span>
              <input placeholder="Rechercher un produit" aria-label="Rechercher un produit" className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} aria-label="Catégorie" className="form-select form-select-sm" style={{ width: 'auto' }}>
              <option value="all">Toutes les catégories</option>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button type="button" onClick={() => setEditing({ ...EMPTY })} className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 text-nowrap">
              <Plus size={15} /> Nouveau produit
            </button>
          </>
        }>
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead><tr><th style={{ width: 72 }} /><th>Produit</th><th>Catégorie</th><th>Prix de base</th><th>Statut</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
              {loading ? <LoadingRow colSpan={6} /> : filtered.length === 0 ? (
                <TableMessage colSpan={6}>{products.length ? 'Aucun produit ne correspond.' : 'Aucun produit au catalogue. Créez le premier.'}</TableMessage>
              ) : filtered.map((p) => (
                <tr key={p.id} className={p.active ? '' : 'opacity-50'}>
                  <td>
                    <div className="rounded border overflow-hidden d-flex align-items-center justify-content-center" style={{ width: 56, height: 56, background: p.imageUrl ? undefined : p.bgGradient }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-100 h-100" style={{ objectFit: 'cover' }} /> : <span className="fs-4">{p.emoji}</span>}
                    </div>
                  </td>
                  <td>
                    <div className="fw-semibold">
                      {p.name}
                      {p.badge && BADGES[p.badge] && <span className={`badge ${BADGES[p.badge].badge} ms-2`}>{BADGES[p.badge].label}</span>}
                    </div>
                    <small className="text-secondary">{p.shortDesc}</small>
                  </td>
                  <td><span className="badge text-bg-light">{CATEGORIES[p.category] || p.category}</span></td>
                  <td className="text-nowrap">
                    <div className="fw-semibold tabular-nums">{fcfa(p.basePrice)}</div>
                    <small className="text-secondary">min. {num(p.minQuantity)} ex.</small>
                  </td>
                  <td><span className={`badge ${p.active ? 'text-bg-success' : 'text-bg-secondary'}`}>{p.active ? 'Actif' : 'Inactif'}</span></td>
                  <td className="text-end text-nowrap">
                    <div className="btn-group btn-group-sm">
                      <button type="button" onClick={() => toggleActive(p)} disabled={busyId === p.id} title={p.active ? 'Masquer' : 'Afficher'}
                        aria-label={`${p.active ? 'Masquer' : 'Afficher'} ${p.name}`} className="btn btn-outline-secondary">
                        {busyId === p.id ? <Spinner /> : p.active ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button type="button" onClick={() => setEditing({ ...p })} aria-label={`Modifier ${p.name}`} className="btn btn-outline-primary"><Edit2 size={14} /></button>
                      <button type="button" onClick={() => setToRetire(p)} disabled={!p.active} aria-label={`Retirer ${p.name}`} className="btn btn-outline-danger"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <ProductForm key={editing.id || 'new'} initial={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />
      )}

      <Modal open={!!toRetire} size="sm" title="Retirer ce produit ?" onClose={() => setToRetire(null)}
        footer={
          <>
            <button type="button" onClick={() => setToRetire(null)} className="btn btn-outline-secondary">Annuler</button>
            <button type="button" onClick={() => toRetire && retire(toRetire)} disabled={!!busyId} className="btn btn-danger d-inline-flex align-items-center gap-2">
              {busyId && <Spinner />} Retirer
            </button>
          </>
        }>
        <p className="mb-0">
          <strong>{toRetire?.name}</strong> ne sera plus visible ni commandable. Les commandes passées sont conservées et vous pourrez le réactiver.
        </p>
      </Modal>
    </>
  )
}
