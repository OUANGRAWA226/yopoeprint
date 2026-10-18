'use client'

import { useEffect, useState } from 'react'
import { PackageSearch, Upload, Save, Loader2, Building, MapPin, Phone, Mail, Trash2 } from 'lucide-react'
import { resellerService, WhiteLabelSender } from '@/lib/reseller.service'
import { uploadService } from '@/lib/upload.service'
import { Alert } from '@/components/ui/Alert'

const EMPTY: WhiteLabelSender = { companyName: '', phone: '', address: '', email: '', logoUrl: '', includeInvoice: false }
const inputCls = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all'

export default function MarqueBlanchePage() {
  const [form, setForm] = useState<WhiteLabelSender>(EMPTY)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    resellerService.getMe()
      .then((me) => setForm({ ...EMPTY, companyName: me.companyName || '', ...(me.whiteLabel || {}) }))
      .catch((e) => setError(e?.message || 'Impossible de charger votre configuration'))
      .finally(() => setLoaded(true))
  }, [])

  const set = (key: keyof WhiteLabelSender) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const { url } = await uploadService.uploadFile(file, 'general')
      setForm((f) => ({ ...f, logoUrl: url }))
    } catch (err: any) {
      setError(err?.message || 'Le logo n\'a pas pu être envoyé')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess('')
    setError('')
    try {
      await resellerService.updateWhiteLabel({
        companyName: form.companyName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        email: form.email?.trim() || undefined,
        logoUrl: form.logoUrl || undefined,
        includeInvoice: !!form.includeInvoice,
      })
      setSuccess('Identité d\'expéditeur enregistrée. Cochez « Expédier en marque blanche » au moment de commander.')
    } catch (err: any) {
      setError(err?.message || 'Enregistrement impossible')
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) {
    return <div className="max-w-4xl mx-auto h-64 rounded-2xl bg-white border border-gray-100 animate-pulse" aria-busy="true" />
  }

  return (
    <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
            <PackageSearch size={28} className="text-emerald-700" /> Marque blanche
          </h1>
          <p className="text-gray-600 text-sm">L&apos;identité imprimée sur le bordereau des colis livrés à vos clients.</p>
        </div>
        <button type="submit" disabled={saving || uploading} className="btn-primary disabled:opacity-60">
          {saving ? <><Loader2 size={16} className="animate-spin" /> Enregistrement…</> : <><Save size={16} /> Enregistrer</>}
        </button>
      </div>

      {success && <Alert tone="success">{success}</Alert>}
      {error && <Alert>{error}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Identité de l&apos;expéditeur</h2>
          <div>
            <label htmlFor="wl-company" className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              <Building size={14} /> Nom de votre entreprise *
            </label>
            <input id="wl-company" required minLength={2} value={form.companyName} onChange={set('companyName')} className={inputCls} />
          </div>
          <div>
            <label htmlFor="wl-address" className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
              <MapPin size={14} /> Adresse (imprimée sur le bordereau) *
            </label>
            <input id="wl-address" required minLength={3} value={form.address} onChange={set('address')} className={inputCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="wl-phone" className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                <Phone size={14} /> Téléphone SAV *
              </label>
              <input id="wl-phone" type="tel" required placeholder="+226 70 00 00 00" value={form.phone} onChange={set('phone')} className={inputCls} />
            </div>
            <div>
              <label htmlFor="wl-email" className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                <Mail size={14} /> Email SAV
              </label>
              <input id="wl-email" type="email" value={form.email || ''} onChange={set('email')} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Logo (optionnel)</h2>
            {form.logoUrl ? (
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.logoUrl} alt="Logo de votre entreprise" className="h-16 w-auto max-w-[160px] object-contain rounded-lg border border-gray-100 p-2" />
                <button type="button" onClick={() => setForm((f) => ({ ...f, logoUrl: '' }))}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 hover:underline">
                  <Trash2 size={14} /> Retirer
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <span className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mb-3">
                  {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                </span>
                <span className="font-bold text-gray-900 text-sm">{uploading ? 'Envoi en cours…' : 'Choisir un logo'}</span>
                <span className="text-xs text-gray-600 mt-1">PNG ou JPG. Il remplace celui de YopoePrint sur le bordereau.</span>
                <input type="file" accept=".png,.jpg,.jpeg" onChange={handleLogo} disabled={uploading} className="sr-only" />
              </label>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <label className="flex items-start gap-4 cursor-pointer">
              <input type="checkbox" checked={!!form.includeInvoice} onChange={set('includeInvoice')}
                className="mt-0.5 w-5 h-5 accent-primary" />
              <span>
                <span className="block font-bold text-gray-900 text-sm">Glisser votre facture dans le colis</span>
                <span className="block text-gray-600 text-xs mt-1 leading-relaxed">
                  Envoyez-nous votre facture avec la commande : nous l&apos;ajoutons au colis. Sans cette option, seul le bordereau à votre nom est joint ; aucun document ne mentionne YopoePrint.
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </form>
  )
}
