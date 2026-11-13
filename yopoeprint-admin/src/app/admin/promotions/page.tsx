'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, Copy, Check, Save, Star, Tag, Power } from 'lucide-react'
import { promosService, Promo, PromoInput } from '@/lib/promos.service'
import { Card, ErrorAlert, LoadingRow, Modal, Spinner, TableMessage } from '@/components/ui'
import { fcfa } from '@/components/status'

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

function status(p: Promo): { text: string; badge: string } {
  const now = Date.now()
  if (!p.active) return { text: 'Inactif', badge: 'text-bg-secondary' }
  if (p.startDate && new Date(p.startDate).getTime() > now) return { text: `Dès le ${new Date(p.startDate).toLocaleDateString('fr-FR')}`, badge: 'text-bg-info' }
  if (p.endDate && new Date(p.endDate).getTime() <= now) return { text: 'Expiré', badge: 'text-bg-warning' }
  if (p.maxUses !== null && p.uses >= p.maxUses) return { text: 'Épuisé', badge: 'text-bg-warning' }
  return { text: 'Actif', badge: 'text-bg-success' }
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

  const closeEditor = useCallback(() => { if (!saving) setEditing(null) }, [saving])
  const filtered = promos.filter((p) => !search || p.code.includes(search.trim().toUpperCase()))
  const featured = promos.find((p) => p.featured)
  const d = editing?.data

  return (
    <>
      <div className="callout callout-info mb-3">
        Codes saisis par les clients au panier. L&apos;API vérifie chaque condition à la commande ; la remise revendeur
        et un code ne se cumulent pas (la plus avantageuse s&apos;applique).
        {featured ? <> Code affiché sur la boutique : <strong className="font-mono">{featured.code}</strong>.</> : ' Aucun code affiché sur la boutique.'}
      </div>

      <ErrorAlert message={error} onRetry={load} />

      <Card title="Codes promo" icon={<Tag size={18} />} noPadding
        tools={
          <>
            <div className="input-group input-group-sm" style={{ width: 200 }}>
              <span className="input-group-text"><Search size={13} /></span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher" aria-label="Rechercher un code" className="form-control" />
            </div>
            <button type="button" onClick={() => { setFormError(''); setEditing({ id: null, data: { ...EMPTY } }) }}
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 text-nowrap">
              <Plus size={15} /> Nouveau code
            </button>
          </>
        }
        footer={<small className="text-secondary">{promos.filter((p) => status(p).text === 'Actif').length} actif(s) sur {promos.length}</small>}>
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle mb-0">
            <thead><tr><th>Code</th><th>Remise</th><th>Conditions</th><th>Utilisations</th><th>Statut</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
              {loading ? <LoadingRow colSpan={6} /> : filtered.length === 0 ? (
                <TableMessage colSpan={6}>{promos.length ? 'Aucun code ne correspond.' : 'Aucun code promo.'}</TableMessage>
              ) : filtered.map((p) => {
                const s = status(p)
                return (
                  <tr key={p.id} className={p.active ? '' : 'opacity-50'}>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <span className="font-mono fw-bold text-navy" style={{ letterSpacing: '0.08em' }}>{p.code}</span>
                        <button type="button" onClick={() => copyCode(p.code)} aria-label={`Copier ${p.code}`} className="btn btn-tool btn-sm p-1">
                          {copied === p.code ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                        </button>
                        {p.featured && <span title="Affiché sur la boutique" className="text-gold"><Star size={14} fill="currentColor" /></span>}
                      </div>
                      {p.description && <small className="text-secondary">{p.description}</small>}
                    </td>
                    <td className="fw-semibold text-nowrap">{discountLabel(p)}</td>
                    <td className="small text-secondary">
                      <div>{p.minOrder > 0 ? `Dès ${fcfa(p.minOrder)}` : 'Sans minimum'}</div>
                      {p.oncePerCustomer && <div>Une fois par client</div>}
                      {(p.startDate || p.endDate) && (
                        <div>
                          {p.startDate ? `Du ${new Date(p.startDate).toLocaleDateString('fr-FR')} ` : ''}
                          {p.endDate ? `jusqu'au ${new Date(new Date(p.endDate).getTime() - 1).toLocaleDateString('fr-FR')}` : ''}
                        </div>
                      )}
                    </td>
                    <td className="text-nowrap">
                      <div className="fw-semibold tabular-nums">{p.uses}{p.maxUses !== null ? ` / ${p.maxUses}` : ''}</div>
                      <small className="text-secondary">{p.paidUses} payée(s) · {fcfa(p.discountTotal)} accordés</small>
                    </td>
                    <td><span className={`badge ${s.badge}`}>{s.text}</span></td>
                    <td className="text-end text-nowrap">
                      <div className="btn-group btn-group-sm">
                        <button type="button" onClick={() => run(() => promosService.update(p.id, { active: !p.active }))} disabled={busy}
                          className="btn btn-outline-secondary d-inline-flex align-items-center gap-1">
                          <Power size={13} /> {p.active ? 'Désactiver' : 'Activer'}
                        </button>
                        <button type="button" onClick={() => { setFormError(''); setEditing({ id: p.id, data: { ...p } }) }} aria-label={`Modifier ${p.code}`}
                          className="btn btn-outline-primary"><Edit2 size={14} /></button>
                        <button type="button" onClick={() => { if (window.confirm(`Supprimer le code ${p.code} ?`)) run(() => promosService.remove(p.id)) }} disabled={busy}
                          aria-label={`Supprimer ${p.code}`} title={p.uses ? 'Déjà utilisé : désactivez-le plutôt' : undefined}
                          className="btn btn-outline-danger"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!editing && !!d} title={editing?.id ? `Modifier ${d?.code}` : 'Nouveau code promo'} onClose={closeEditor}
        footer={
          <>
            <button type="button" onClick={closeEditor} className="btn btn-outline-secondary">Annuler</button>
            <button type="submit" form="promo-form" disabled={saving} className="btn btn-primary d-inline-flex align-items-center gap-2">
              {saving ? <Spinner /> : <Save size={15} />} Enregistrer
            </button>
          </>
        }>
        {d && (
          <form id="promo-form" onSubmit={save}>
            <div className="mb-3">
              <label htmlFor="pr-code" className="form-label">Code *</label>
              <input id="pr-code" required pattern="[A-Za-z0-9_\-]{3,30}" title="3 à 30 lettres, chiffres, - ou _"
                className="form-control font-mono fw-bold text-uppercase" style={{ letterSpacing: '0.12em' }}
                value={d.code} onChange={(e) => set({ code: e.target.value.toUpperCase() })} placeholder="RENTREE15" />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label htmlFor="pr-type" className="form-label">Type de remise</label>
                <select id="pr-type" className="form-select" value={d.type} onChange={(e) => set({ type: e.target.value as PromoInput['type'] })}>
                  <option value="percentage">Pourcentage</option>
                  <option value="fixed">Montant fixe</option>
                </select>
              </div>
              <div className="col-6">
                <label htmlFor="pr-value" className="form-label">Valeur * ({d.type === 'percentage' ? '%' : 'FCFA'})</label>
                <input id="pr-value" required type="number" min={1} max={d.type === 'percentage' ? 90 : undefined} className="form-control"
                  value={d.value} onChange={(e) => set({ value: Number(e.target.value) || 0 })} />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="pr-desc" className="form-label">Libellé affiché au client</label>
              <input id="pr-desc" maxLength={120} className="form-control" value={d.description || ''} placeholder={discountLabel(d)}
                onChange={(e) => set({ description: e.target.value })} />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label htmlFor="pr-min" className="form-label">Commande minimum (FCFA)</label>
                <input id="pr-min" type="number" min={0} className="form-control" value={d.minOrder} onChange={(e) => set({ minOrder: Number(e.target.value) || 0 })} />
              </div>
              <div className="col-6">
                <label htmlFor="pr-max" className="form-label">Utilisations max</label>
                <input id="pr-max" type="number" min={1} className="form-control" value={d.maxUses ?? ''} placeholder="Illimité"
                  onChange={(e) => set({ maxUses: e.target.value ? Number(e.target.value) : null })} />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label htmlFor="pr-start" className="form-label">Valable à partir du</label>
                <input id="pr-start" type="date" className="form-control" value={isoToDay(d.startDate)} onChange={(e) => set({ startDate: dayToIso(e.target.value) })} />
              </div>
              <div className="col-6">
                <label htmlFor="pr-end" className="form-label">Jusqu&apos;au (inclus)</label>
                <input id="pr-end" type="date" className="form-control" value={isoToDay(d.endDate, true)} onChange={(e) => set({ endDate: dayToIso(e.target.value, true) })} />
              </div>
            </div>

            {([
              ['oncePerCustomer', 'Une seule utilisation par client'],
              ['active', 'Code actif'],
              ['featured', 'Afficher sur la boutique (menu et accueil) — remplace le code actuellement affiché'],
            ] as const).map(([k, text]) => (
              <div key={k} className="form-check form-switch mb-2">
                <input id={`pr-${k}`} type="checkbox" role="switch" className="form-check-input" checked={d[k]} onChange={(e) => set({ [k]: e.target.checked })} />
                <label htmlFor={`pr-${k}`} className="form-check-label">{text}</label>
              </div>
            ))}

            <div className="callout callout-warning text-center mt-3 mb-0">
              <div className="font-mono fw-bold fs-4 text-navy" style={{ letterSpacing: '0.12em' }}>{d.code || 'CODE'}</div>
              <div>{d.description || discountLabel(d)}{d.minOrder > 0 && ` dès ${fcfa(d.minOrder)} d'achat`}</div>
            </div>

            {formError && <div role="alert" className="alert alert-danger mt-3 mb-0 py-2">{formError}</div>}
          </form>
        )}
      </Modal>
    </>
  )
}
