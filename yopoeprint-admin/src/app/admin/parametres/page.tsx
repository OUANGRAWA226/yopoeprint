'use client'

import { useEffect, useState } from 'react'
import { Save, Plus, Trash2, Truck, Phone, Briefcase, Wrench, Landmark, Lock } from 'lucide-react'
import { adminAuthService } from '@/lib/auth-admin.service'
import { platformService, PlatformSettings, DeliveryZone, ResellerTier } from '@/lib/platform.service'
import { Card, ErrorAlert, Spinner } from '@/components/ui'
import { fcfa } from '@/components/status'

export default function ParametresPage() {
  const [form, setForm] = useState<PlatformSettings | null>(null)
  const [meta, setMeta] = useState<{ updatedAt: string | null }>({ updatedAt: null })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const canEdit = String(adminAuthService.getCurrentUser()?.role || '').toLowerCase() === 'superadmin'

  useEffect(() => {
    platformService.getSettings()
      .then((r) => { setForm(r.settings); setMeta({ updatedAt: r.updatedAt }) })
      .catch((e) => setError(e?.message || 'Impossible de charger les paramètres'))
  }, [])

  if (error && !form) return <ErrorAlert message={error} />
  if (!form) return <div className="text-center text-secondary py-5" aria-busy="true"><Spinner className="me-2" />Chargement des paramètres…</div>

  const setContact = (k: keyof PlatformSettings['contact'], v: string) => setForm({ ...form, contact: { ...form.contact, [k]: v } })
  const setZone = (i: number, patch: Partial<DeliveryZone>) =>
    setForm({ ...form, delivery: { ...form.delivery, zones: form.delivery.zones.map((z, j) => (j === i ? { ...z, ...patch } : z)) } })
  const setTier = (i: number, patch: Partial<ResellerTier>) =>
    setForm({ ...form, resellerTiers: form.resellerTiers.map((t, j) => (j === i ? { ...t, ...patch } : t)) })

  const save = async () => {
    setSaving(true); setError(''); setNotice('')
    try {
      const r = await platformService.saveSettings(form)
      setForm(r.settings)
      setMeta({ updatedAt: r.updatedAt })
      setNotice('Paramètres enregistrés : ils s\'appliquent immédiatement aux nouvelles commandes.')
    } catch (e: any) {
      setError(e?.message || 'Enregistrement impossible')
    } finally {
      setSaving(false)
    }
  }

  const saveButton = canEdit && (
    <button type="button" onClick={save} disabled={saving} className="btn btn-primary d-inline-flex align-items-center gap-2">
      {saving ? <Spinner /> : <Save size={16} />} Enregistrer
    </button>
  )

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <p className="text-secondary mb-0">
          {canEdit ? 'Ces réglages pilotent la boutique et l\'API.' : <span className="d-inline-flex align-items-center gap-1"><Lock size={14} /> Lecture seule : seul le super administrateur peut modifier ces réglages.</span>}
          {meta.updatedAt && <> Dernière modification le {new Date(meta.updatedAt).toLocaleString('fr-FR')}.</>}
        </p>
        {saveButton}
      </div>

      {notice && <div role="status" className="alert alert-success">{notice}</div>}
      <ErrorAlert message={error} />

      <fieldset disabled={!canEdit || saving}>
        <div className="row">
          <div className="col-lg-6">
            <Card title="Maintenance" icon={<Wrench size={18} />} variant={form.maintenance.enabled ? 'danger' : 'primary'}>
              <p className="small text-secondary">Suspend la prise de commande (la boutique reste consultable) et affiche le message aux clients.</p>
              <div className="form-check form-switch mb-3">
                <input id="maint" type="checkbox" role="switch" className="form-check-input" checked={form.maintenance.enabled}
                  onChange={(e) => setForm({ ...form, maintenance: { ...form.maintenance, enabled: e.target.checked } })} />
                <label htmlFor="maint" className="form-check-label fw-semibold">Suspendre les commandes</label>
              </div>
              <label htmlFor="maint-msg" className="form-label">Message affiché</label>
              <input id="maint-msg" className="form-control" placeholder="Ex. Inventaire jusqu'à lundi 8 h" value={form.maintenance.message}
                onChange={(e) => setForm({ ...form, maintenance: { ...form.maintenance, message: e.target.value } })} />
            </Card>
          </div>

          <div className="col-lg-6">
            <Card title="Coordonnées" icon={<Phone size={18} />}>
              <p className="small text-secondary">Exposées à la boutique via /settings/public. Email vide : il n&apos;est pas affiché.</p>
              <div className="row g-3">
                {([
                  ['phone', 'Téléphone'], ['whatsapp', 'WhatsApp'], ['email', 'Email de contact'], ['address', 'Adresse de l\'atelier'],
                ] as const).map(([k, label]) => (
                  <div key={k} className="col-sm-6">
                    <label htmlFor={`c-${k}`} className="form-label">{label}</label>
                    <input id={`c-${k}`} className="form-control" value={form.contact[k]} onChange={(e) => setContact(k, e.target.value)} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <Card title="Mentions légales" icon={<Landmark size={18} />}>
          <p className="small text-secondary">Imprimées en pied des devis PDF générés par les clients. Laissez vide ce qui n&apos;est pas encore attribué.</p>
          <div className="row g-3">
            {([
              ['companyName', 'Raison sociale', 'YopoePrint SARL'], ['rccm', 'N° RCCM', 'BF-OUA-01-2024-B12-01234'], ['ifu', 'N° IFU', '00123456X'],
            ] as const).map(([k, label, placeholder]) => (
              <div key={k} className="col-md-4">
                <label htmlFor={`l-${k}`} className="form-label">{label}</label>
                <input id={`l-${k}`} className="form-control" placeholder={placeholder} value={form.legal?.[k] ?? ''}
                  onChange={(e) => setForm({ ...form, legal: { ...form.legal, [k]: e.target.value } })} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Livraison" icon={<Truck size={18} />} noPadding
          footer={
            <button type="button" className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
              onClick={() => setForm({ ...form, delivery: { ...form.delivery, zones: [...form.delivery.zones, { id: '', label: '', city: '', price: 0, delay: '', enabled: true, freeEligible: true }] } })}>
              <Plus size={15} /> Ajouter une zone
            </button>
          }>
          <div className="p-3 border-bottom">
            <p className="small text-secondary">Zones proposées au client, frais et livraison offerte. L&apos;API recalcule chaque commande avec ces valeurs.</p>
            <label htmlFor="free" className="form-label">Livraison offerte à partir de (FCFA, 0 = jamais)</label>
            <input id="free" type="number" min={0} className="form-control" style={{ maxWidth: 220 }} value={form.delivery.freeThreshold}
              onChange={(e) => setForm({ ...form, delivery: { ...form.delivery, freeThreshold: Number(e.target.value) || 0 } })} />
          </div>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th className="ps-3">Identifiant</th><th>Libellé</th><th>Ville</th><th>Frais (FCFA)</th><th>Délai</th>
                  <th className="text-center">Active</th><th className="text-center">Offerte au-delà du seuil</th><th />
                </tr>
              </thead>
              <tbody>
                {form.delivery.zones.map((z, i) => (
                  <tr key={i}>
                    <td className="ps-3" style={{ width: 140 }}><input className="form-control form-control-sm font-mono" value={z.id} onChange={(e) => setZone(i, { id: e.target.value })} aria-label="Identifiant" /></td>
                    <td><input className="form-control form-control-sm" value={z.label} onChange={(e) => setZone(i, { label: e.target.value })} aria-label="Libellé" /></td>
                    <td><input className="form-control form-control-sm" value={z.city} onChange={(e) => setZone(i, { city: e.target.value })} aria-label="Ville" /></td>
                    <td style={{ width: 120 }}><input type="number" min={0} className="form-control form-control-sm" value={z.price} onChange={(e) => setZone(i, { price: Number(e.target.value) || 0 })} aria-label="Frais" /></td>
                    <td style={{ width: 110 }}><input className="form-control form-control-sm" value={z.delay} onChange={(e) => setZone(i, { delay: e.target.value })} aria-label="Délai" /></td>
                    <td className="text-center"><input type="checkbox" className="form-check-input" checked={z.enabled} onChange={(e) => setZone(i, { enabled: e.target.checked })} aria-label="Active" /></td>
                    <td className="text-center"><input type="checkbox" className="form-check-input" checked={z.freeEligible} onChange={(e) => setZone(i, { freeEligible: e.target.checked })} aria-label="Livraison offerte" /></td>
                    <td className="text-end pe-3">
                      <button type="button" aria-label={`Supprimer la zone ${z.label}`} className="btn btn-sm btn-outline-danger"
                        onClick={() => setForm({ ...form, delivery: { ...form.delivery, zones: form.delivery.zones.filter((_, j) => j !== i) } })}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Paliers revendeurs" icon={<Briefcase size={18} />} variant="gold" noPadding
          footer={
            <button type="button" className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
              onClick={() => setForm({ ...form, resellerTiers: [...form.resellerTiers, { id: '', label: '', rate: 0, minRevenue: 0 }] })}>
              <Plus size={15} /> Ajouter un palier
            </button>
          }>
          <p className="small text-secondary p-3 border-bottom mb-0">
            Calculés sur le CA payé des 12 derniers mois. Le premier palier commence à 0 FCFA ; la remise doit augmenter avec le palier.
          </p>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead><tr><th className="ps-3">Identifiant</th><th>Nom</th><th>Remise (%)</th><th>À partir de (FCFA)</th><th /></tr></thead>
              <tbody>
                {form.resellerTiers.map((t, i) => (
                  <tr key={i}>
                    <td className="ps-3" style={{ width: 140 }}><input className="form-control form-control-sm font-mono" value={t.id} onChange={(e) => setTier(i, { id: e.target.value })} aria-label="Identifiant" /></td>
                    <td><input className="form-control form-control-sm" value={t.label} onChange={(e) => setTier(i, { label: e.target.value })} aria-label="Nom" /></td>
                    <td style={{ width: 120 }}><input type="number" min={0} max={50} className="form-control form-control-sm" value={t.rate} onChange={(e) => setTier(i, { rate: Number(e.target.value) || 0 })} aria-label="Remise" /></td>
                    <td style={{ width: 200 }}>
                      <input type="number" min={0} className="form-control form-control-sm" value={t.minRevenue} onChange={(e) => setTier(i, { minRevenue: Number(e.target.value) || 0 })} aria-label="Seuil" />
                      <small className="text-secondary">{fcfa(t.minRevenue)}</small>
                    </td>
                    <td className="text-end pe-3">
                      <button type="button" aria-label={`Supprimer le palier ${t.label}`} className="btn btn-sm btn-outline-danger"
                        onClick={() => setForm({ ...form, resellerTiers: form.resellerTiers.filter((_, j) => j !== i) })}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </fieldset>

      {canEdit && <div className="d-flex justify-content-end mb-4">{saveButton}</div>}
    </>
  )
}
