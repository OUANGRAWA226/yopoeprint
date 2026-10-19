'use client'

import { useEffect, useState } from 'react'
import { Save, Plus, Trash2, Truck, Phone, Briefcase, Wrench, Loader2, Landmark } from 'lucide-react'
import { adminAuthService } from '@/lib/auth-admin.service'
import { platformService, PlatformSettings, DeliveryZone, ResellerTier } from '@/lib/platform.service'

const input = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-mid disabled:bg-gray-50 disabled:text-gray-600'
const fcfa = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n || 0)} FCFA`

function Section({ icon, title, hint, children }: { icon: React.ReactNode; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-card p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-blue-deep flex items-center gap-2">{icon}{title}</h2>
        {hint && <p className="text-xs text-gray-600 mt-1">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

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

  if (error && !form) return <div role="alert" className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>
  if (!form) return <div className="h-64 rounded-2xl bg-white border border-gray-100 animate-pulse" aria-busy="true" />

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

  return (
    <div className="max-w-5xl space-y-5 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          {canEdit ? 'Ces réglages pilotent la boutique et l\'API.' : 'Lecture seule : seul le super administrateur peut modifier ces réglages.'}
          {meta.updatedAt && <> Dernière modification le {new Date(meta.updatedAt).toLocaleString('fr-FR')}.</>}
        </p>
        {canEdit && (
          <button onClick={save} disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-deep text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-mid disabled:opacity-60">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Enregistrer
          </button>
        )}
      </div>

      {notice && <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">{notice}</div>}
      {error && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      <fieldset disabled={!canEdit || saving} className="space-y-5">
        <Section icon={<Wrench size={18} />} title="Maintenance" hint="Suspend la prise de commande (la boutique reste consultable) et affiche le message aux clients.">
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 accent-blue-mid" checked={form.maintenance.enabled}
              onChange={(e) => setForm({ ...form, maintenance: { ...form.maintenance, enabled: e.target.checked } })} />
            <span className="text-sm font-semibold text-gray-900">Suspendre les commandes</span>
          </label>
          <input className={input} placeholder="Message affiché (ex. Inventaire jusqu'à lundi 8 h)" value={form.maintenance.message}
            onChange={(e) => setForm({ ...form, maintenance: { ...form.maintenance, message: e.target.value } })} aria-label="Message de maintenance" />
        </Section>

        <Section icon={<Phone size={18} />} title="Coordonnées" hint="Exposées à la boutique via /settings/public.">
          <div className="grid sm:grid-cols-2 gap-3">
            {([
              ['phone', 'Téléphone'], ['whatsapp', 'WhatsApp'], ['email', 'Email de contact'], ['address', 'Adresse de l\'atelier'],
            ] as const).map(([k, label]) => (
              <label key={k} className="text-xs font-semibold text-gray-700 space-y-1">
                <span>{label}</span>
                <input className={input} value={form.contact[k]} onChange={(e) => setContact(k, e.target.value)} />
              </label>
            ))}
          </div>
        </Section>

        <Section icon={<Landmark size={18} />} title="Mentions légales" hint="Imprimées en pied des devis PDF générés par les clients. Laissez vide ce qui n'est pas encore attribué.">
          <div className="grid sm:grid-cols-3 gap-3">
            {([
              ['companyName', 'Raison sociale', 'YopoePrint SARL'], ['rccm', 'N° RCCM', 'BF-OUA-01-2024-B12-01234'], ['ifu', 'N° IFU', '00123456X'],
            ] as const).map(([k, label, placeholder]) => (
              <label key={k} className="text-xs font-semibold text-gray-700 space-y-1">
                <span>{label}</span>
                <input className={input} placeholder={placeholder} value={form.legal?.[k] ?? ''}
                  onChange={(e) => setForm({ ...form, legal: { ...form.legal, [k]: e.target.value } })} />
              </label>
            ))}
          </div>
        </Section>

        <Section icon={<Truck size={18} />} title="Livraison" hint="Zones proposées au client, frais et livraison offerte. L'API recalcule chaque commande avec ces valeurs.">
          <label className="text-xs font-semibold text-gray-700 space-y-1 block max-w-xs">
            <span>Livraison offerte à partir de (FCFA, 0 = jamais)</span>
            <input type="number" min={0} className={input} value={form.delivery.freeThreshold}
              onChange={(e) => setForm({ ...form, delivery: { ...form.delivery, freeThreshold: Number(e.target.value) || 0 } })} />
          </label>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide">
                  <th className="py-2 pr-2">Identifiant</th><th className="py-2 pr-2">Libellé</th><th className="py-2 pr-2">Ville</th>
                  <th className="py-2 pr-2">Frais (FCFA)</th><th className="py-2 pr-2">Délai</th><th className="py-2 pr-2">Active</th>
                  <th className="py-2 pr-2">Offerte au-delà du seuil</th><th />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {form.delivery.zones.map((z, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-2 w-32"><input className={`${input} font-mono text-xs`} value={z.id} onChange={(e) => setZone(i, { id: e.target.value })} aria-label="Identifiant" /></td>
                    <td className="py-2 pr-2"><input className={input} value={z.label} onChange={(e) => setZone(i, { label: e.target.value })} aria-label="Libellé" /></td>
                    <td className="py-2 pr-2"><input className={input} value={z.city} onChange={(e) => setZone(i, { city: e.target.value })} aria-label="Ville" /></td>
                    <td className="py-2 pr-2 w-28"><input type="number" min={0} className={input} value={z.price} onChange={(e) => setZone(i, { price: Number(e.target.value) || 0 })} aria-label="Frais" /></td>
                    <td className="py-2 pr-2 w-24"><input className={input} value={z.delay} onChange={(e) => setZone(i, { delay: e.target.value })} aria-label="Délai" /></td>
                    <td className="py-2 pr-2 text-center"><input type="checkbox" className="w-4 h-4 accent-blue-mid" checked={z.enabled} onChange={(e) => setZone(i, { enabled: e.target.checked })} aria-label="Active" /></td>
                    <td className="py-2 pr-2 text-center"><input type="checkbox" className="w-4 h-4 accent-blue-mid" checked={z.freeEligible} onChange={(e) => setZone(i, { freeEligible: e.target.checked })} aria-label="Livraison offerte" /></td>
                    <td className="py-2">
                      <button type="button" aria-label={`Supprimer la zone ${z.label}`} className="p-2 text-gray-400 hover:text-red-600"
                        onClick={() => setForm({ ...form, delivery: { ...form.delivery, zones: form.delivery.zones.filter((_, j) => j !== i) } })}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-mid hover:underline"
            onClick={() => setForm({ ...form, delivery: { ...form.delivery, zones: [...form.delivery.zones, { id: '', label: '', city: '', price: 0, delay: '', enabled: true, freeEligible: true }] } })}>
            <Plus size={15} /> Ajouter une zone
          </button>
        </Section>

        <Section icon={<Briefcase size={18} />} title="Paliers revendeurs" hint="Calculés sur le CA payé des 12 derniers mois. Le premier palier commence à 0 FCFA ; la remise doit augmenter avec le palier.">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide">
                <th className="py-2 pr-2">Identifiant</th><th className="py-2 pr-2">Nom</th><th className="py-2 pr-2">Remise (%)</th><th className="py-2 pr-2">À partir de (FCFA)</th><th />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {form.resellerTiers.map((t, i) => (
                <tr key={i}>
                  <td className="py-2 pr-2 w-32"><input className={`${input} font-mono text-xs`} value={t.id} onChange={(e) => setTier(i, { id: e.target.value })} aria-label="Identifiant" /></td>
                  <td className="py-2 pr-2"><input className={input} value={t.label} onChange={(e) => setTier(i, { label: e.target.value })} aria-label="Nom" /></td>
                  <td className="py-2 pr-2 w-28"><input type="number" min={0} max={50} className={input} value={t.rate} onChange={(e) => setTier(i, { rate: Number(e.target.value) || 0 })} aria-label="Remise" /></td>
                  <td className="py-2 pr-2 w-40">
                    <input type="number" min={0} className={input} value={t.minRevenue} onChange={(e) => setTier(i, { minRevenue: Number(e.target.value) || 0 })} aria-label="Seuil" />
                    <span className="text-[11px] text-gray-500">{fcfa(t.minRevenue)}</span>
                  </td>
                  <td className="py-2">
                    <button type="button" aria-label={`Supprimer le palier ${t.label}`} className="p-2 text-gray-400 hover:text-red-600"
                      onClick={() => setForm({ ...form, resellerTiers: form.resellerTiers.filter((_, j) => j !== i) })}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-mid hover:underline"
            onClick={() => setForm({ ...form, resellerTiers: [...form.resellerTiers, { id: '', label: '', rate: 0, minRevenue: 0 }] })}>
            <Plus size={15} /> Ajouter un palier
          </button>
        </Section>
      </fieldset>
    </div>
  )
}
