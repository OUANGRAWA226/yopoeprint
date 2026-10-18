'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/context/AuthContext'
import { Eye, EyeOff, CheckCircle, Loader2, ArrowRight, PackageCheck, Smartphone, FileText, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { Alert } from '@/components/ui/Alert'

// ─── Validation ───────────────────────────────────────────────
function validate(form: typeof INITIAL_FORM) {
  const errors: Record<string, string> = {}

  if (!form.firstName.trim())
    errors.firstName = 'Requis'

  if (!form.lastName.trim())
    errors.lastName = 'Requis'

  if (!form.email.trim())
    errors.email = 'Requis'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Email invalide'

  if (!form.phone.trim())
    errors.phone = 'Requis'
  else if (!/^\+?[0-9]{8,15}$/.test(form.phone.replace(/\s/g, '')))
    errors.phone = 'Numéro invalide'

  if (!form.password)
    errors.password = 'Requis'
  else if (form.password.length < 8)
    errors.password = 'Minimum 8 caractères'
  else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(form.password))
    errors.password = 'Majuscule et chiffre requis'

  if (form.password !== form.confirm)
    errors.confirm = 'Ne correspond pas'

  if (!form.cgv)
    errors.cgv = 'Requis'

  return errors
}

// ─── Indicateur force mot de passe ────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null

  const checks = [
    { ok: password.length >= 8, label: '8 caractères' },
    { ok: /[A-Z]/.test(password), label: '1 majuscule' },
    { ok: /[0-9]/.test(password), label: '1 chiffre' },
    { ok: /[^A-Za-z0-9]/.test(password), label: '1 caractère spécial' },
  ]
  const score = checks.filter((c) => c.ok).length

  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500']
  const labels = ['Faible', 'Moyen', 'Bon', 'Excellent']

  return (
    <div className="mt-2.5">
      <div className="flex gap-1.5 mb-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : 'bg-gray-100'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className={`text-2xs font-bold uppercase tracking-wider ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-orange-500' : score === 3 ? 'text-yellow-600' : 'text-emerald-500'}`}>
          {labels[score - 1] || 'Trop faible'}
        </p>
        <div className="flex gap-3">
          {checks.map(({ ok, label }) => (
            <div key={label} className={`flex items-center gap-1 text-2xs ${ok ? 'text-emerald-500' : 'text-gray-400'}`}>
              {ok ? <CheckCircle size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-gray-200" />}
              <span className="hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Champ de formulaire ──────────────────────────────────────
function Field({
  label, name, type = 'text', placeholder, value, error, onChange, required, hint, suffix
}: {
  label: string; name: string; type?: string; placeholder?: string
  value: string; error?: string; onChange: (v: string) => void
  required?: boolean; hint?: string; suffix?: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-2xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex justify-between">
        <span>{label} {required && <span className="text-red-400">*</span>}</span>
        {error && <span className="text-red-500 normal-case tracking-normal animate-in fade-in">{error}</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3.5 py-3 bg-gray-50 border rounded-xl text-sm
            outline-none transition-all pr-${suffix ? '10' : '3.5'}
            ${error
              ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-4 focus:ring-red-100'
              : 'border-gray-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10'}`}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
      {hint && !error && <p className="text-2xs text-gray-600 mt-1">{hint}</p>}
    </div>
  )
}

// ─── Valeurs initiales ────────────────────────────────────────
const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirm: '',
  cgv: false,
  newsletter: false,
}

function InscriptionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/mon-compte'
  const { register } = useAuthContext()
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (key: keyof typeof INITIAL_FORM) => (value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }))
    // Clear error on typing
    if (errors[key]) {
      setErrors((e) => { const next = { ...e }; delete next[key]; return next })
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    setApiError('')

    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      })
      setSuccess(true)
      setTimeout(() => router.push(redirect), 1800)
    } catch (err: any) {
      const msg = err.response?.data?.message
      if (msg?.includes('already exists') || msg?.includes('duplicate')) {
        setApiError('Un compte existe déjà avec cet email ou ce téléphone.')
      } else {
        setApiError(msg || 'Une erreur est survenue. Réessayez.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Succès ────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-emerald-500" />
          </div>
          <h2 className="font-display text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Bienvenue à bord ! 🎉
          </h2>
          <p className="text-gray-500 text-base mb-8">
            Votre compte <strong>{form.firstName}</strong> a été créé avec succès.
          </p>
          <div className="flex items-center justify-center gap-3 text-sm font-bold text-primary">
            <Loader2 size={18} className="animate-spin" /> Redirection en cours...
          </div>
        </div>
      </div>
    )
  }

  // ── Formulaire ────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-white">
      {/* ─── LEFT PANEL (Studio Mockup & Branding) ─── */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-gray-950 overflow-hidden items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105"
          style={{ backgroundImage: 'url("/images/products/flyers-depliants.jpg")' }}
        />
        {/* Technical print grid */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none" 
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-gray-950/40" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-500/15 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-md px-10">
          <div className="mb-10">
            <Logo theme="dark" size="lg" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs text-gray-300 mb-6">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Compte client sécurisé • DGI Compliant</span>
          </div>

          <h2 className="text-3xl font-display font-bold text-white mb-6 leading-tight">
            Rejoignez plus de 1 200 entreprises et créateurs.
          </h2>
          
          <div className="space-y-5">
            <div className="flex items-start gap-3.5 bg-gray-900/70 p-3.5 rounded-xl border border-gray-800/80">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                <PackageCheck size={18} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Suivi atelier en direct</h3>
                <p className="text-gray-400 text-xs leading-relaxed">Notification à chaque étape : validation BAT, tirage et mise sous pli.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-gray-900/70 p-3.5 rounded-xl border border-gray-800/80">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                <Smartphone size={18} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Paiement Mobile Money local</h3>
                <p className="text-gray-400 text-xs leading-relaxed">Réglez directement avec Orange Money ou Moov Africa sans frais cachés.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-gray-900/70 p-3.5 rounded-xl border border-gray-800/80">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 text-sky-400">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Facturation normalisée e-Sintax</h3>
                <p className="text-gray-400 text-xs leading-relaxed">Téléchargez instantanément vos factures avec sticker fiscal DGI.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL (Form) ─── */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-[480px]">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo theme="light" size="md" />
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
            <p className="text-gray-500 text-sm">Rapide, gratuit et sans engagement.</p>
          </div>

          {apiError && <Alert className="mb-6">{apiError}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prénom" name="firstName" placeholder="Salimata" value={form.firstName} error={errors.firstName} onChange={set('firstName')} />
              <Field label="Nom" name="lastName" placeholder="Kaboré" value={form.lastName} error={errors.lastName} onChange={set('lastName')} />
            </div>

            <Field label="Adresse email" name="email" type="email" placeholder="salimata@exemple.com" value={form.email} error={errors.email} onChange={set('email')} />
            <Field label="Téléphone" name="phone" placeholder="+226 70 00 00 00" hint="Sera utilisé pour le paiement Mobile Money" value={form.phone} error={errors.phone} onChange={set('phone')} />

            <div className="pt-2">
              <Field label="Mot de passe" name="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} error={errors.password} onChange={set('password')}
                suffix={
                  <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <PasswordStrength password={form.password} />
            </div>

            <div className="pt-2">
              <Field label="Confirmer" name="confirm" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={form.confirm} error={errors.confirm} onChange={set('confirm')}
                suffix={
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </div>

            <div className="pt-4 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={form.cgv} onChange={(e) => set('cgv')(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-primary cursor-pointer border-gray-300 rounded" />
                <span className="text-xs text-gray-500 leading-relaxed">
                  J'accepte les <Link href="/cgv" className="text-gray-900 font-bold hover:underline">conditions générales</Link> et la <Link href="/confidentialite" className="text-gray-900 font-bold hover:underline">politique de confidentialité</Link>.
                </span>
              </label>
              {errors.cgv && <p className="text-2xs text-red-500 ml-7 animate-in fade-in">{errors.cgv}</p>}

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.newsletter} onChange={(e) => set('newsletter')(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-primary cursor-pointer border-gray-300 rounded" />
                <span className="text-xs text-gray-500 leading-relaxed">
                  Je souhaite recevoir des offres exclusives et nouveautés.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm
                         hover:bg-primary transition-colors hover:-translate-y-0.5 shadow-lg shadow-gray-900/20
                         disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Création...</>
              ) : (
                <>Créer mon compte <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Déjà un compte ?{' '}
            <Link
              href={`/connexion${redirect !== '/mon-compte' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="text-gray-900 font-bold hover:text-primary transition-colors underline underline-offset-4"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function InscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center p-12">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    }>
      <InscriptionForm />
    </Suspense>
  )
}
