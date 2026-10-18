'use client'

import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib'
import {
  CheckCircle2, 
  AlertCircle, 
  Phone,
  Mail, 
  ChevronDown, 
  ArrowRight, 
  Check,
  Clock,
  ShieldCheck,
  FileCheck,
  Sparkles,
  Building2,
  Package,
  Layers,
  PhoneCall,
  Loader2
} from 'lucide-react'
import { useContact } from '@/lib/settings.service'
import { Alert } from '@/components/ui/Alert'

// ─── Données ──────────────────────────────────────────────────
const POPULAR_PRODUCTS = [
  'Cartes de visite pro',
  'Flyers & Dépliants',
  'Roll-up & Banderoles',
  'Affiches & Posters',
  'Brochures & Catalogues',
  'Textile & Polos brodés',
  'Packaging & Sacs Kraft',
  'Goodies & Cadeaux d\'affaires',
  'Autre projet sur mesure',
]

const BUDGETS = [
  'Moins de 50 000 FCFA',
  '50 000 – 150 000 FCFA',
  '150 000 – 500 000 FCFA',
  '500 000 – 1 000 000 FCFA',
  'Plus de 1 000 000 FCFA',
  'Budget à définir',
]

const DELAIS = [
  'Urgent (24h - 48h)',
  'Standard (3 - 5 jours ouvrés)',
  'Sous 2 semaines',
  'Sous 1 mois',
  'Pas de contrainte de délai',
]

const PROFILS = [
  'Entreprise / PME / Grande Entreprise',
  'Agence de communication & Design',
  'Association / ONG / Institution',
  'Commerçant / E-commerçant / Boutique',
  'Organisateur d\'événement / Festival',
  'Particulier',
  'Autre profil',
]

// ─── Avantages ────────────────────────────────────────────────
const ADVANTAGES = [
  { icon: '⏱️', title: 'Réponse sous 24h', desc: 'Chiffrage détaillé par nos estimateurs d\'atelier' },
  { icon: '💰', title: 'Tarifs dégressifs', desc: 'Conditions préférentielles dès les volumes moyens' },
  { icon: '🤝', title: 'Expert PAO dédié', desc: 'Conseils papiers, grammages et finitions offerts' },
  { icon: '📄', title: 'Facture DGI certifiée', desc: 'Conforme e-Sintax avec TVA déductible pour sociétés' },
]

// ─── Formulaire initial ───────────────────────────────────────
const INITIAL = {
  fullName: '', email: '', phone: '', company: '', profile: '',
  product: '', productOther: '', quantity: '', format: '', description: '',
  budget: '', deadline: '', hasFile: false, fileDesc: '',
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-rose-600 font-medium mt-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
}

const inputCls = `w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`
const selectCls = `${inputCls} cursor-pointer appearance-none`

export default function DevisPage() {
  const contact = useContact()
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState('')
  const [step, setStep] = useState(1)

  const set = (key: keyof typeof INITIAL) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) {
      setErrors((errs) => {
        const next = { ...errs }
        delete next[key]
        return next
      })
    }
  }

  const validateStep = (s: number) => {
    const errs: Record<string, string> = {}
    if (s === 1) {
      if (!form.fullName.trim()) errs.fullName = 'Nom complet obligatoire'
      if (!form.email.trim()) errs.email = 'Email professionnel obligatoire'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Adresse email invalide'
      if (!form.phone.trim()) errs.phone = 'Numéro de téléphone requis'
      if (!form.profile) errs.profile = 'Sélectionnez votre profil'
    }
    if (s === 2) {
      if (!form.product) errs.product = 'Sélectionnez une catégorie de produit'
      if (!form.quantity.trim()) errs.quantity = 'Indiquez la quantité estimée'
      if (!form.description.trim() || form.description.length < 15) errs.description = 'Description trop courte (15 caractères minimum)'
    }
    if (s === 3) {
      if (!form.budget) errs.budget = 'Sélectionnez une fourchette budgétaire'
      if (!form.deadline) errs.deadline = 'Sélectionnez votre délai souhaité'
    }
    return errs
  }

  const nextStep = () => {
    const errs = validateStep(step)
    setErrors(errs)
    if (Object.keys(errs).length === 0) {
      setStep((s) => s + 1)
      window.scrollTo({ top: 300, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setStep((s) => s - 1)
    setErrors({})
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    const errs = validateStep(3)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    setApiError('')
    try {
      await api.post('/quotes', {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        company: form.company || undefined,
        profile: form.profile,
        product: form.product === 'Autre projet sur mesure' ? form.productOther || 'Sur mesure' : form.product,
        quantity: form.quantity,
        format: form.format || undefined,
        description: form.description,
        budget: form.budget,
        deadline: form.deadline,
        hasFile: form.hasFile,
        fileDesc: form.fileDesc || undefined,
      })
      setSuccess(true)
    } catch (err: any) {
      setApiError(err?.message || "Erreur lors de l'envoi. Veuillez réessayer ou nous contacter sur WhatsApp.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full bg-white rounded-2xl p-8 border border-gray-200 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={36} />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Demande enregistrée avec succès
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
              Merci {form.fullName} !
            </h2>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              Votre dossier de chiffrage a été transmis au bureau d'estimation YopoePrint à Ouagadougou. 
              Vous recevrez une proposition personnalisée sous <strong>24h ouvrées</strong>.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-left text-xs space-y-2.5">
            <p className="font-bold text-gray-900 uppercase tracking-wider mb-2">Récapitulatif de votre demande</p>
            <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
              <span className="text-gray-500">Produit :</span>
              <span className="font-bold text-gray-900">{form.product}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
              <span className="text-gray-500">Quantité :</span>
              <span className="font-bold text-gray-900">{form.quantity}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
              <span className="text-gray-500">Budget estimé :</span>
              <span className="font-bold text-gray-900">{form.budget}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Délai visé :</span>
              <span className="font-bold text-gray-900">{form.deadline}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link 
              href="/catalogue" 
              className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm"
            >
              Découvrir le catalogue
            </Link>
            <Link 
              href="/" 
              className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      
      {/* ── HEADER SLATE-950 ARCHITECTURAL ── */}
      <section className="relative bg-gray-950 text-white pt-16 pb-24 px-4 overflow-hidden">
        {/* Subtle technical print grid */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none" 
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '36px 36px'
          }}
        />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-emerald-400">Devis Spécifique</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-xs text-gray-300">
            <Sparkles size={14} className="text-primary" />
            <span>Grand tirage, finitions luxe ou format hors-normes</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight max-w-3xl mx-auto leading-tight">
            Demande de devis d'impression sur mesure
          </h1>
          
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Obtenez un chiffrage précis sous 24h ouvrées. Nos techniciens calculent les meilleurs coûts de production pour vos séries professionnelles.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-primary" /> Réponse garantie sous <strong>24h ouvrées</strong>
            </span>
            <span className="hidden sm:inline text-gray-700">•</span>
            <span className="flex items-center gap-1.5">
              <FileCheck size={14} className="text-emerald-400" /> Factures conformes <strong>DGI e-Sintax</strong>
            </span>
            <span className="hidden sm:inline text-gray-700">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary" /> Échantillons papier <strong>sur demande</strong>
            </span>
          </div>
        </div>
      </section>

      {/* ── BANDEAU AVANTAGES EN 4 COLONNES ── */}
      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {ADVANTAGES.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-md shadow-gray-200/40">
              <span className="text-xl">{icon}</span>
              <p className="font-bold text-gray-900 text-xs sm:text-sm mt-2">{title}</p>
              <p className="text-gray-500 text-2xs mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── ZONE CENTRALE : STEPPER + FORMULAIRE + RECAP ── */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* Colonne Gauche : Formulaire Multi-étapes */}
          <div className="space-y-6">
            
            {/* Stepper tactile */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-2 shadow-sm grid grid-cols-3 gap-2">
              {[
                { n: 1, label: 'Vos Coordonnées', desc: 'Identité & Entreprise' },
                { n: 2, label: 'Votre Projet', desc: 'Produit & Quantité' },
                { n: 3, label: 'Budget & Délais', desc: 'Validation finale' },
              ].map(({ n, label, desc }) => {
                const isCurrent = step === n
                const isDone = step > n
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      if (isDone) setStep(n)
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all text-center
                      ${isCurrent 
                        ? 'bg-gray-900 text-white shadow-sm' 
                        : isDone 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/60' 
                          : 'text-gray-400 bg-gray-50/50'}`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                      {isDone ? (
                        <Check size={14} className="text-emerald-700" />
                      ) : (
                        <span>Étape {n}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold mt-0.5">{label}</span>
                    <span className="hidden sm:inline text-2xs opacity-75">{desc}</span>
                  </button>
                )
              })}
            </div>

            {apiError && <Alert>{apiError}</Alert>}

            {/* Cadre du formulaire */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              
              {/* Étape 1 : Coordonnées */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="font-display text-xl font-bold text-gray-900">Vos coordonnées de contact</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Ces informations serviront à vous envoyer la proposition chiffrée.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Nom complet" required error={errors.fullName}>
                      <input 
                        type="text" 
                        placeholder="Ex: Alassane Sawadogo" 
                        value={form.fullName} 
                        onChange={set('fullName')} 
                        className={inputCls} 
                      />
                    </Field>

                    <Field label="Société / Organisation">
                      <input 
                        type="text" 
                        placeholder="Ex: Société Générale, Agence X, ONG..." 
                        value={form.company} 
                        onChange={set('company')} 
                        className={inputCls} 
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Email professionnel" required error={errors.email}>
                      <input 
                        type="email" 
                        placeholder="contact@societe.bf" 
                        value={form.email} 
                        onChange={set('email')} 
                        className={inputCls} 
                      />
                    </Field>

                    <Field label="Téléphone (WhatsApp)" required error={errors.phone}>
                      <input 
                        type="tel" 
                        placeholder="+226 70 00 00 00" 
                        value={form.phone} 
                        onChange={set('phone')} 
                        className={inputCls} 
                      />
                    </Field>
                  </div>

                  <Field label="Vous êtes" required error={errors.profile}>
                    <div className="relative">
                      <select value={form.profile} onChange={set('profile')} className={selectCls}>
                        <option value="">Sélectionnez votre type d'organisation...</option>
                        {PROFILS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </Field>
                </div>
              )}

              {/* Étape 2 : Spécifications Projet */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="font-display text-xl font-bold text-gray-900">Spécifications de votre tirage</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Choisissez le support ou détaillez votre fabrication sur mesure.</p>
                  </div>

                  {/* Pills de produits populaires */}
                  <Field label="Type de produit souhaité" required error={errors.product}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      {POPULAR_PRODUCTS.map((prod) => {
                        const isSelected = form.product === prod
                        return (
                          <button
                            key={prod}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, product: prod }))}
                            className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between
                              ${isSelected 
                                ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                                : 'bg-gray-50/70 border-gray-200 text-gray-700 hover:border-gray-300'}`}
                          >
                            <span>{prod}</span>
                            {isSelected && <Check size={14} className="text-primary shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  </Field>

                  {form.product === 'Autre projet sur mesure' && (
                    <Field label="Précisez la nature du produit" required>
                      <input 
                        type="text" 
                        placeholder="Ex: Boîtes d'expédition sur mesure, étiquettes adhésives dorure à chaud..." 
                        value={form.productOther} 
                        onChange={set('productOther')} 
                        className={inputCls} 
                      />
                    </Field>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Quantité estimée" required error={errors.quantity}>
                      <input 
                        type="text" 
                        placeholder="Ex: 500 ex, 2000 ex, 10 000 ex..." 
                        value={form.quantity} 
                        onChange={set('quantity')} 
                        className={inputCls} 
                      />
                    </Field>

                    <Field label="Format / Dimensions">
                      <input 
                        type="text" 
                        placeholder="Ex: A4 (21x29.7cm), 85x55mm, 2x1m..." 
                        value={form.format} 
                        onChange={set('format')} 
                        className={inputCls} 
                      />
                    </Field>
                  </div>

                  <Field label="Description détaillée & Finitions" required error={errors.description}>
                    <textarea 
                      rows={4} 
                      placeholder="Détaillez : type de papier (couché mat, brillant, kraft), grammage (350g, 135g), finitions spéciales (vernis sélectif 3D, dorure, pelliculage soft-touch, œillets)..." 
                      value={form.description} 
                      onChange={set('description')} 
                      className={`${inputCls} resize-none`} 
                    />
                  </Field>
                </div>
              )}

              {/* Étape 3 : Budget & Délais */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="font-display text-xl font-bold text-gray-900">Enveloppe budgétaire & Délais</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Ces indications permettent à nos estimateurs d'optimiser l'amalgame d'impression.</p>
                  </div>

                  <Field label="Fourchette de budget" required error={errors.budget}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {BUDGETS.map((b) => (
                        <button 
                          key={b} 
                          type="button" 
                          onClick={() => setForm((f) => ({ ...f, budget: b }))}
                          className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between
                            ${form.budget === b 
                              ? 'bg-gray-900 border-gray-900 text-white shadow-sm' 
                              : 'bg-gray-50/70 border-gray-200 text-gray-700 hover:border-gray-300'}`}
                        >
                          <span>{b}</span>
                          {form.budget === b && <Check size={14} className="text-emerald-400" />}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label="Délai de livraison souhaité" required error={errors.deadline}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {DELAIS.map((d) => (
                        <button 
                          key={d} 
                          type="button" 
                          onClick={() => setForm((f) => ({ ...f, deadline: d }))}
                          className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between
                            ${form.deadline === d 
                              ? 'bg-gray-900 border-gray-900 text-white shadow-sm' 
                              : 'bg-gray-50/70 border-gray-200 text-gray-700 hover:border-gray-300'}`}
                        >
                          <span>{d}</span>
                          {form.deadline === d && <Check size={14} className="text-emerald-400" />}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mt-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={form.hasFile} 
                        onChange={(e) => setForm((f) => ({ ...f, hasFile: e.target.checked }))} 
                        className="w-4 h-4 mt-0.5 rounded accent-primary cursor-pointer" 
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900">J'ai déjà une maquette graphique prête (PDF, AI, PSD)</span>
                        <p className="text-2xs text-gray-500 mt-0.5">
                          Vous pourrez la joindre par retour de mail ou via WhatsApp dès réception de l'accusé de réception.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Barre de navigation Stepper */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                {step > 1 ? (
                  <button 
                    type="button" 
                    onClick={prevStep} 
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs transition-colors"
                  >
                    ← Étape précédente
                  </button>
                ) : <div />}

                {step < 3 ? (
                  <button 
                    type="button" 
                    onClick={nextStep} 
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
                  >
                    Continuer vers l'étape {step + 1} <ArrowRight size={15} />
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleSubmit} 
                    disabled={loading} 
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Envoi de votre dossier...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Transmettre ma demande de devis</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* Colonne Droite : Récapitulatif dynamique & Hotline */}
          <aside className="space-y-5">
            
            {/* Carte Récapitulatif Temps Réel */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Votre récapitulatif</h3>
                <span className="text-2xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">En direct</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Demandeur :</span>
                  <span className="font-semibold text-gray-800 text-right truncate max-w-[150px]">
                    {form.fullName || '—'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Produit :</span>
                  <span className="font-semibold text-gray-800 text-right truncate max-w-[150px]">
                    {form.product || '—'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Quantité :</span>
                  <span className="font-semibold text-gray-800 text-right">
                    {form.quantity || '—'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Budget :</span>
                  <span className="font-semibold text-gray-800 text-right">
                    {form.budget || '—'}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Délai :</span>
                  <span className="font-semibold text-gray-800 text-right">
                    {form.deadline || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Carte Hotline & WhatsApp Direct */}
            <div className="bg-gray-900 rounded-2xl p-5 text-white border border-gray-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <PhoneCall size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Besoin d'un chiffrage urgent ?</p>
                  <p className="text-2xs text-gray-400">Appelez directement nos estimateurs</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Pour les appels d'offres ou événements sous 48h, contactez notre permanence commerciale.
              </p>

              <div className="pt-1 flex flex-col gap-2">
                <a 
                  href={`${contact.whatsappUrl}?text=Bonjour%20YopoePrint%2C%20j%27ai%20besoin%20d%27un%20devis%20urgent%20pour%20une%20impression.`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-bold text-xs transition-colors"
                >
                  WhatsApp Devis Urgent ({contact.phoneDisplay})
                </a>
                <a 
                  href={`tel:${contact.phone}`} 
                  className="w-full inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-xl text-xs font-semibold transition-colors"
                >
                  Téléphone direct : +226 25 30 00 00
                </a>
              </div>
            </div>

          </aside>

        </div>
      </div>

    </div>
  )
}
