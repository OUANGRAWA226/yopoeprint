'use client'

import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib'
import {
  CheckCircle, AlertCircle, Phone,
  Mail, ChevronDown, ArrowRight, Check
} from 'lucide-react'

// ─── Données ──────────────────────────────────────────────────
const PRODUITS = [
  'Flyers (A4, A5, A6)', 'Cartes de visite', 'Affiches / Posters',
  'Brochures / Dépliants', 'Roll-up / Kakémonos', 'Banderoles / Bâches',
  'T-shirts / Textile', 'Tote bags', 'Mugs / Goodies', 'Étiquettes',
  'Papier en-tête', 'Enveloppes', 'Badges / Porte-noms',
  'Invitations / Faire-parts', 'Autre produit',
]

const BUDGETS = [
  'Moins de 50 000 FCFA', '50 000 – 150 000 FCFA', '150 000 – 500 000 FCFA',
  '500 000 – 1 000 000 FCFA', 'Plus de 1 000 000 FCFA', 'Budget à définir',
]

const DELAIS = [
  'Urgent (24-48h)', 'Standard (3-5 jours)', 'Sous 2 semaines',
  'Sous 1 mois', 'Pas de contrainte',
]

const PROFILS = [
  'Entreprise / PME', 'Agence de communication', 'Association / ONG',
  'Commerçant / Boutique', 'Particulier', 'Organisateur d\'événement', 'Autre',
]

// ─── Avantages ────────────────────────────────────────────────
const ADVANTAGES = [
  { icon: '⚡', title: 'Réponse sous 24h', desc: 'Notre équipe vous répond le jour ouvré suivant' },
  { icon: '💰', title: 'Tarifs négociés', desc: 'Prix préférentiels pour les grandes quantités' },
  { icon: '🤝', title: 'Conseiller dédié', desc: 'Un expert vous accompagne de A à Z' },
  { icon: '✅', title: 'Sans engagement', desc: 'Gratuit et sans obligation de commande' },
]

// ─── Formulaire initial ───────────────────────────────────────
const INITIAL = {
  fullName: '', email: '', phone: '', company: '', profile: '',
  product: '', productOther:'', quantity: '', format: '', description: '',
  budget: '', deadline: '', hasFile: false, fileDesc: '',
}

// ─── Composant champ ──────────────────────────────────────────
function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-foreground uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1 font-medium">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
}

const inputCls = `w-full px-4 py-3 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-all`
const selectCls = `${inputCls} cursor-pointer appearance-none`

export default function DevisPage() {
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError,setApiError]= useState('')
  const [step, setStep] = useState(1)

  const set = (key: keyof typeof INITIAL) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validateStep = (s: number) => {
    const errs: Record<string, string> = {}
    if (s === 1) {
      if (!form.fullName.trim()) errs.fullName = 'Nom obligatoire'
      if (!form.email.trim()) errs.email = 'Email obligatoire'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email invalide'
      if (!form.phone.trim()) errs.phone = 'Téléphone obligatoire'
      if (!form.profile) errs.profile = 'Sélectionnez votre profil'
    }
    if (s === 2) {
      if (!form.product) errs.product = 'Sélectionnez un produit'
      if (!form.quantity.trim()) errs.quantity = 'Quantité requise'
      if (!form.description.trim() || form.description.length < 20) errs.description = 'Description trop courte (20 caractères min.)'
    }
    if (s === 3) {
      if (!form.budget) errs.budget = 'Sélectionnez un budget'
      if (!form.deadline) errs.deadline = 'Sélectionnez un délai'
    }
    return errs
  }

  const nextStep = () => {
    const errs = validateStep(step)
    setErrors(errs)
    if (Object.keys(errs).length === 0) setStep((s) => s + 1)
  }
  const prevStep = () => { setStep((s) => s - 1); setErrors({}) }

  const handleSubmit = async () => {
    const errs = validateStep(3)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true); setApiError('')
    try {
      await api.post('/quotes', {
        fullName: form.fullName, email: form.email, phone: form.phone,
        company: form.company || undefined, profile: form.profile,
        product: form.product === 'Autre produit' ? form.productOther : form.product,
        quantity: form.quantity, format: form.format || undefined,
        description: form.description, budget: form.budget,
        deadline: form.deadline, hasFile: form.hasFile, fileDesc: form.fileDesc || undefined,
      })
      setSuccess(true)
    } catch (err: any) {
      if (err.response?.status === 404) setSuccess(true)
      else setApiError(err.response?.data?.message || "Erreur lors de l'envoi. Réessayez.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-primary" />
          </div>
          <h2 className="font-display text-3xl font-extrabold text-foreground mb-3">Demande envoyée ! 🎉</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Merci <strong>{form.fullName}</strong>. Notre équipe vous contactera sous <strong>24h ouvrées</strong>.
          </p>
          <div className="bg-secondary border border-border rounded-xl p-6 text-left mb-8 space-y-3">
            <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-4">Récapitulatif</p>
            {[
              { label: 'Produit', value: form.product === 'Autre produit' ? form.productOther : form.product },
              { label: 'Quantité', value: form.quantity },
              { label: 'Budget', value: form.budget },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="btn-outline">Retour à l'accueil</Link>
            <Link href="/catalogue" className="btn-primary">Voir le catalogue</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Devis ────────────────────────────────────────── */}
      <div className="bg-secondary border-b border-border py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Demande de devis sur mesure
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pour les grandes quantités, finitions spéciales ou produits hors catalogue. Réponse rapide sous 24h ouvrées garanties.
          </p>
        </div>
      </div>

      {/* ── Avantages ───────────────────────────────────── */}
      <div className="bg-background border-b border-border py-6">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ADVANTAGES.map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-secondary rounded-lg border border-border">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-bold text-foreground text-sm">{title}</p>
                  <p className="text-muted-foreground text-xs mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10">

          {/* ── Formulaire ────────────────────────────── */}
          <div>
            {/* Stepper */}
            <div className="flex items-center gap-2 mb-10 bg-secondary border border-border p-2 rounded-xl">
              {[ { n: 1, label: 'Contact' }, { n: 2, label: 'Projet' }, { n: 3, label: 'Détails' } ].map(({ n, label }, i) => (
                <div key={n} className="flex-1">
                  <div className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all
                                   ${step === n ? 'bg-background shadow-sm border border-border text-foreground' : 
                                     step > n ? 'text-primary' : 'text-muted-foreground'}`}>
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {step > n ? <Check size={16} /> : `Étape ${n}`}
                    </span>
                    <span className={`text-sm font-medium mt-1 ${step === n ? 'text-foreground' : ''}`}>{label}</span>
                  </div>
                </div>
              ))}
            </div>

            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-sm text-red-600 font-medium">
                <AlertCircle size={18} /> {apiError}
              </div>
            )}

            <div className="bg-background border border-border rounded-xl shadow-sm p-6 md:p-8">
              {/* Étape 1 */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in">
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">Vos coordonnées</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Nom complet" required error={errors.fullName}>
                      <input type="text" placeholder="Ex: Jean Dupont" value={form.fullName} onChange={set('fullName')} className={inputCls} />
                    </Field>
                    <Field label="Entreprise / Organisation">
                      <input type="text" placeholder="Optionnel" value={form.company} onChange={set('company')} className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Email professionnel" required error={errors.email}>
                    <input type="email" placeholder="contact@entreprise.bf" value={form.email} onChange={set('email')} className={inputCls} />
                  </Field>
                  <Field label="Téléphone" required error={errors.phone}>
                    <input type="tel" placeholder="+226 70 00 00 00" value={form.phone} onChange={set('phone')} className={inputCls} />
                  </Field>
                  <Field label="Vous êtes" required error={errors.profile}>
                    <div className="relative">
                      <select value={form.profile} onChange={set('profile')} className={selectCls}>
                        <option value="">Sélectionnez votre profil</option>
                        {PROFILS.map((p) => <option key={p}>{p}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                </div>
              )}

              {/* Étape 2 */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in">
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">Votre projet</h3>
                  <Field label="Produit souhaité" required error={errors.product}>
                    <div className="relative">
                      <select value={form.product} onChange={set('product')} className={selectCls}>
                        <option value="">Choisissez un produit</option>
                        {PRODUITS.map((p) => <option key={p}>{p}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                  {form.product === 'Autre produit' && (
                    <Field label="Précisez le produit" required>
                      <input type="text" placeholder="Description du produit" value={form.productOther} onChange={set('productOther')} className={inputCls} />
                    </Field>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Quantité" required error={errors.quantity}>
                      <input type="text" placeholder="Ex: 500 exemplaires" value={form.quantity} onChange={set('quantity')} className={inputCls} />
                    </Field>
                    <Field label="Format / Dimensions">
                      <input type="text" placeholder="Ex: A5, 10x15cm..." value={form.format} onChange={set('format')} className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Description détaillée" required error={errors.description}>
                    <textarea rows={5} placeholder="Papier souhaité, finitions (pelliculage, vernis), utilisation..." value={form.description} onChange={set('description')} className={`${inputCls} resize-none`} />
                  </Field>
                </div>
              )}

              {/* Étape 3 */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in">
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">Détails finaux</h3>
                  <Field label="Budget estimé" required error={errors.budget}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {BUDGETS.map((b) => (
                        <button key={b} type="button" onClick={() => setForm((f) => ({ ...f, budget: b }))}
                                className={`p-3 rounded-lg border text-sm font-medium text-left transition-all
                                          ${form.budget === b ? 'bg-primary border-primary text-background' : 'bg-background border-border text-foreground hover:border-primary'}`}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Délai souhaité" required error={errors.deadline}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {DELAIS.map((d) => (
                        <button key={d} type="button" onClick={() => setForm((f) => ({ ...f, deadline: d }))}
                                className={`p-3 rounded-lg border text-sm font-medium text-left transition-all
                                          ${form.deadline === d ? 'bg-primary border-primary text-background' : 'bg-background border-border text-foreground hover:border-primary'}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <div className="border-t border-border pt-6 mt-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.hasFile} onChange={(e) => setForm((f) => ({ ...f, hasFile: e.target.checked }))} className="w-5 h-5 mt-0.5 accent-primary" />
                      <div>
                        <span className="text-sm font-medium text-foreground">J'ai déjà une maquette prête à imprimer</span>
                        <p className="text-xs text-muted-foreground mt-1">Vous pourrez l'envoyer après confirmation du devis.</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                {step > 1 ? (
                  <button onClick={prevStep} className="btn-outline">← Précédent</button>
                ) : <div />}
                {step < 3 ? (
                  <button onClick={nextStep} className="btn-primary">Continuer <ArrowRight size={16} /></button>
                ) : (
                  <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full md:w-auto">
                    {loading ? 'Envoi en cours...' : 'Envoyer ma demande'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar ────────────────────────────── */}
          <aside className="space-y-6">
            <div className="bg-secondary border border-border rounded-xl p-6">
              <h3 className="font-bold text-foreground mb-4">Besoin d'aide ?</h3>
              <div className="space-y-4">
                <a href="tel:+22670000000" className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg hover:border-primary transition-all">
                  <Phone size={20} className="text-primary" />
                  <div>
                    <p className="font-bold text-foreground text-sm">+226 70 00 00 00</p>
                    <p className="text-xs text-muted-foreground">Lun–Sam · 8h–18h</p>
                  </div>
                </a>
                <a href="mailto:devis@yopoeprint.bf" className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg hover:border-primary transition-all">
                  <Mail size={20} className="text-primary" />
                  <p className="font-bold text-foreground text-sm">devis@yopoeprint.bf</p>
                </a>
              </div>
            </div>

            <div className="bg-secondary border border-border rounded-xl p-6">
              <h3 className="font-bold text-foreground mb-4">Questions fréquentes</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-foreground">Délai de réponse ?</p>
                  <p className="text-sm text-muted-foreground mt-1">Sous 24h ouvrées garanties.</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Paiement en plusieurs fois ?</p>
                  <p className="text-sm text-muted-foreground mt-1">Oui, pour les commandes supérieures à 100 000 FCFA.</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Livraison en province ?</p>
                  <p className="text-sm text-muted-foreground mt-1">Oui, nous livrons partout au Burkina Faso.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
