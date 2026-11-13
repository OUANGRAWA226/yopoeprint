'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  Plus, Edit2, Trash2, Upload, ArrowUp, ArrowDown, ExternalLink, Save, Power,
  Image as ImageIcon, Smartphone, Monitor,
} from 'lucide-react'
import {
  bannersService, Banner, BannerInput, BannerVariant, BANNER_FORMATS, readImageSize,
} from '@/lib/banners.service'
import { Card, ErrorAlert, LoadingRow, Modal, Spinner, TableMessage } from '@/components/ui'

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

function status(b: Banner): { text: string; badge: string } {
  const now = Date.now()
  if (!b.active) return { text: 'Inactive', badge: 'text-bg-secondary' }
  if (b.startDate && new Date(b.startDate).getTime() > now) return { text: `Programmée le ${new Date(b.startDate).toLocaleDateString('fr-FR')}`, badge: 'text-bg-info' }
  if (b.endDate && new Date(b.endDate).getTime() <= now) return { text: 'Terminée', badge: 'text-bg-warning' }
  return { text: 'En ligne', badge: 'text-bg-success' }
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
    <div className="mb-3">
      <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
        <span className="form-label mb-0 d-inline-flex align-items-center gap-1">
          <Icon size={14} /> Visuel {fmt.label} {required ? '*' : '(facultatif)'}
          <span className="badge text-bg-light font-mono">{fmt.width} × {fmt.height} px</span>
        </span>
        {url && !required && (
          <button type="button" onClick={() => onChange(null)} className="btn btn-link btn-sm text-danger p-0">Retirer</button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/png,image/jpeg" onChange={pick} className="d-none" />
      <button type="button" onClick={() => ref.current?.click()} disabled={progress !== null}
        style={{ aspectRatio: `${fmt.width} / ${fmt.height}`, maxWidth: variant === 'mobile' ? 260 : undefined, borderStyle: 'dashed' }}
        className="btn btn-light border border-2 w-100 p-0 position-relative overflow-hidden d-flex align-items-center justify-content-center text-center">
        {url ? (
          <>
            <Image src={url} alt="" fill unoptimized style={{ objectFit: 'cover' }} />
            <span className="position-absolute bottom-0 end-0 m-2 badge text-bg-light shadow-sm">Remplacer</span>
          </>
        ) : progress !== null ? (
          <span className="small fw-semibold d-inline-flex align-items-center gap-2"><Spinner /> Envoi… {progress} %</span>
        ) : (
          <span className="small text-secondary px-3">
            <Upload size={20} className="d-block mx-auto mb-1 text-primary" />
            Choisir un JPG ou PNG de <strong>{fmt.width} × {fmt.height} px</strong> exactement
          </span>
        )}
        {url && progress !== null && (
          <span className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center small fw-semibold gap-2">
            <Spinner /> Envoi… {progress} %
          </span>
        )}
      </button>
      {error && <div role="alert" className="small text-danger mt-1">{error}</div>}
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

  const closeEditor = useCallback(() => { if (!saving) setEditing(null) }, [saving])
  const live = banners.filter((b) => status(b).text === 'En ligne').length
  const d = editing?.data

  return (
    <>
      <div className="callout callout-info mb-3">
        Carrousel de la page d&apos;accueil. Visuel ordinateur <strong className="font-mono">1248 × 357 px</strong> obligatoire,
        version téléphone <strong className="font-mono">660 × 330 px</strong> facultative : sans elle, le visuel ordinateur est recadré
        au centre sur téléphone (à éviter si l&apos;image contient du texte).
      </div>

      <ErrorAlert message={error} onRetry={load} />

      <Card title={`Bannières (${banners.length})`} icon={<ImageIcon size={18} />} noPadding
        tools={
          <button type="button" onClick={() => openEdit()} className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1">
            <Plus size={15} /> Nouvelle bannière
          </button>
        }
        footer={<small className="text-secondary">{live} en ligne{banners.length === 0 && !loading ? ' · la boutique affiche ses bannières par défaut' : ''}</small>}>
        <div className="table-responsive">
          <table className="table table-striped align-middle mb-0">
            <thead><tr><th style={{ width: 70 }}>Ordre</th><th>Visuels</th><th>Bannière</th><th>Statut</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
              {loading ? <LoadingRow colSpan={5} /> : banners.length === 0 ? (
                <TableMessage colSpan={5}>Aucune bannière. Ajoutez-en une pour remplacer les bannières par défaut de la boutique.</TableMessage>
              ) : banners.map((b, i) => {
                const s = status(b)
                return (
                  <tr key={b.id}>
                    <td>
                      <div className="btn-group-vertical btn-group-sm">
                        <button type="button" onClick={() => move(i, -1)} disabled={busy || i === 0} aria-label={`Monter « ${b.title} »`} className="btn btn-outline-secondary py-0"><ArrowUp size={13} /></button>
                        <span className="btn btn-sm disabled border-0 py-0 font-mono">{i + 1}</span>
                        <button type="button" onClick={() => move(i, 1)} disabled={busy || i === banners.length - 1} aria-label={`Descendre « ${b.title} »`} className="btn btn-outline-secondary py-0"><ArrowDown size={13} /></button>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="position-relative rounded border overflow-hidden bg-body-tertiary flex-shrink-0" style={{ width: 200, aspectRatio: '1248 / 357' }}>
                          <Image src={b.imageUrl} alt="" fill unoptimized style={{ objectFit: 'cover' }} />
                        </div>
                        <div className="position-relative rounded border overflow-hidden bg-body-tertiary flex-shrink-0 d-flex align-items-center justify-content-center"
                          style={{ width: 46, aspectRatio: '660 / 330' }} title={b.mobileImageUrl ? 'Version téléphone' : 'Pas de version téléphone'}>
                          {b.mobileImageUrl ? <Image src={b.mobileImageUrl} alt="" fill unoptimized style={{ objectFit: 'cover' }} /> : <Smartphone size={13} className="text-secondary" />}
                        </div>
                      </div>
                    </td>
                    <td className="min-w-0">
                      <div className="fw-semibold">{b.title}</div>
                      <small className="font-mono text-secondary d-inline-flex align-items-center gap-1"><ExternalLink size={11} />{b.linkUrl}</small>
                    </td>
                    <td>
                      <span className={`badge ${s.badge}`}>{s.text}</span>
                      {b.endDate && s.text === 'En ligne' && <div className="small text-secondary">jusqu&apos;au {new Date(new Date(b.endDate).getTime() - 1).toLocaleDateString('fr-FR')}</div>}
                    </td>
                    <td className="text-end text-nowrap">
                      <div className="btn-group btn-group-sm">
                        <button type="button" onClick={() => run(() => bannersService.update(b.id, { active: !b.active }))} disabled={busy}
                          className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"><Power size={13} /> {b.active ? 'Désactiver' : 'Activer'}</button>
                        <button type="button" onClick={() => openEdit(b)} aria-label={`Modifier « ${b.title} »`} className="btn btn-outline-primary"><Edit2 size={14} /></button>
                        <button type="button" onClick={() => { if (window.confirm(`Supprimer la bannière « ${b.title} » ?`)) run(() => bannersService.remove(b.id)) }}
                          disabled={busy} aria-label={`Supprimer « ${b.title} »`} className="btn btn-outline-danger"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!d} size="lg" title={editing?.id ? 'Modifier la bannière' : 'Nouvelle bannière'} onClose={closeEditor}
        footer={
          <>
            <button type="button" onClick={closeEditor} className="btn btn-outline-secondary">Annuler</button>
            <button type="submit" form="banner-form" disabled={saving} className="btn btn-primary d-inline-flex align-items-center gap-2">
              {saving ? <Spinner /> : <Save size={15} />} Enregistrer
            </button>
          </>
        }>
        {d && (
          <form id="banner-form" onSubmit={save}>
            <ImageField variant="desktop" required url={d.imageUrl || null} onChange={(url) => set({ imageUrl: url || '' })} />
            <ImageField variant="mobile" url={d.mobileImageUrl} onChange={(url) => set({ mobileImageUrl: url })} />

            <div className="row g-3 mb-3">
              <div className="col-12">
                <label htmlFor="b-title" className="form-label">Titre *</label>
                <input id="b-title" required minLength={2} maxLength={120} className="form-control" value={d.title} onChange={(e) => set({ title: e.target.value })} />
              </div>
              <div className="col-sm-6">
                <label htmlFor="b-link" className="form-label">Lien au clic *</label>
                <input id="b-link" required maxLength={300} className="form-control font-mono" placeholder="/catalogue/roll-up" value={d.linkUrl} onChange={(e) => set({ linkUrl: e.target.value })} />
              </div>
              <div className="col-sm-6">
                <label htmlFor="b-alt" className="form-label">Texte alternatif (lecteurs d&apos;écran)</label>
                <input id="b-alt" maxLength={200} className="form-control" value={d.altText || ''} onChange={(e) => set({ altText: e.target.value })} />
              </div>
            </div>

            <fieldset className="border rounded p-3 mb-3">
              <legend className="float-none w-auto px-2 fs-6 mb-0">Texte posé sur l&apos;image (facultatif)</legend>
              <p className="small text-secondary">Renseignez le bouton pour afficher titre, sous-titre et badge par-dessus le visuel. Laissez-le vide si le visuel contient déjà son texte.</p>
              <div className="row g-3">
                <div className="col-sm-4">
                  <label htmlFor="b-cta" className="form-label">Bouton</label>
                  <input id="b-cta" maxLength={40} className="form-control" placeholder="Voir les offres" value={d.ctaLabel || ''} onChange={(e) => set({ ctaLabel: e.target.value })} />
                </div>
                <div className="col-sm-4">
                  <label htmlFor="b-badge" className="form-label">Badge</label>
                  <input id="b-badge" maxLength={40} className="form-control" placeholder="Offre flash" value={d.badge || ''} onChange={(e) => set({ badge: e.target.value })} />
                </div>
                <div className="col-sm-4">
                  <label htmlFor="b-sub" className="form-label">Sous-titre</label>
                  <input id="b-sub" maxLength={200} className="form-control" value={d.subtitle || ''} onChange={(e) => set({ subtitle: e.target.value })} />
                </div>
              </div>
            </fieldset>

            <div className="row g-3 align-items-end">
              <div className="col-sm-4">
                <label htmlFor="b-start" className="form-label">Diffusion à partir du</label>
                <input id="b-start" type="date" className="form-control" value={isoToDay(d.startDate)} onChange={(e) => set({ startDate: dayToIso(e.target.value) })} />
              </div>
              <div className="col-sm-4">
                <label htmlFor="b-end" className="form-label">Jusqu&apos;au (inclus)</label>
                <input id="b-end" type="date" className="form-control" value={isoToDay(d.endDate, true)} onChange={(e) => set({ endDate: dayToIso(e.target.value, true) })} />
              </div>
              <div className="col-sm-4">
                <div className="form-check form-switch mb-2">
                  <input id="b-active" type="checkbox" role="switch" className="form-check-input" checked={d.active} onChange={(e) => set({ active: e.target.checked })} />
                  <label htmlFor="b-active" className="form-check-label">Bannière active</label>
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
