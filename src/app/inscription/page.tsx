'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { Alert } from '@/components/ui/Alert'
import { GoogleButton, googleSignInAvailable } from '@/components/auth/GoogleButton'
import { useAuthContext } from '@/context/AuthContext'
import { returnPath } from '@/lib/return-to'
import { authService } from '@/lib/auth.service'

// Parcours inspiré de Jumia : 1. email (ou Google) → 2. mot de passe → 3. profil → compte créé (5 s) → accueil.
// Une adresse déjà inscrite bascule sur la saisie du mot de passe pour se connecter.
type Step = 'email' | 'login' | 'password' | 'profile' | 'done'

const MIN_AGE = 13 // identique à l'API (auth.service.ts)
const REDIRECT_SECONDS = 5

// « +226 70 12-34.56 » → « +22670123456 » : même format pour la vérification et l'envoi (comme l'API)
const cleanPhone = (phone: string) => phone.replace(/[\s.\-()]/g, '')
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const maxBirthDate = () => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - MIN_AGE)
  return d.toISOString().slice(0, 10)
}

const input = 'w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[15px] text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors'

function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      {children}
      {error ? <span role="alert" className="block text-xs text-red-600">{error}</span> : hint ? <span className="block text-xs text-gray-500">{hint}</span> : null}
    </label>
  )
}

function PasswordInput({ value, onChange, autoComplete, autoFocus }: {
  value: string; onChange: (v: string) => void; autoComplete: string; autoFocus?: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete}
        autoFocus={autoFocus} className={`${input} pr-12`} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-900">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: '8 caractères' },
  { test: (p: string) => /[A-Z]/.test(p), label: '1 majuscule' },
  { test: (p: string) => /[0-9]/.test(p), label: '1 chiffre' },
]

function Submit({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold text-[15px] hover:bg-primary transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
      {loading ? <Loader2 size={18} className="animate-spin" /> : null}
      {children}
    </button>
  )
}

function Onboarding() {
  const router = useRouter()
  const redirectParam = useSearchParams().get('redirect')
  // Retour à la page où était le client (ou au paiement), sinon l'accueil
  const [redirect, setRedirect] = useState('/')
  useEffect(() => { setRedirect(returnPath(redirectParam, '/')) }, [redirectParam])
  const { login, register, setSessionUser } = useAuthContext()

  const [step, setStep] = useState<Step>('email')
  const [form, setForm] = useState({ email: '', password: '', confirm: '', firstName: '', lastName: '', birthDate: '', phone: '', cgv: false })
  const [googleCredential, setGoogleCredential] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [seconds, setSeconds] = useState(REDIRECT_SECONDS)

  const set = (key: keyof typeof form) => (value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const next = { ...e }; delete next[key]; return next })
  }
  const go = (next: Step) => { setApiError(''); setErrors({}); setStep(next) }

  // Compte créé : compte à rebours puis redirection
  useEffect(() => {
    if (step !== 'done') return
    if (seconds <= 0) { router.push(redirect); return }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [step, seconds, redirect, router])

  const run = async (fn: () => Promise<void>) => {
    setLoading(true); setApiError('')
    try { await fn() } catch (err: any) {
      setApiError(err?.response?.data?.message || err?.message || 'Une erreur est survenue. Réessayez.')
    } finally { setLoading(false) }
  }

  // ── Étape 1 : email ──
  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEmail(form.email)) { setErrors({ email: 'Saisissez une adresse email valide' }); return }
    run(async () => {
      const { exists } = await authService.checkEmail(form.email.trim().toLowerCase())
      go(exists ? 'login' : 'password')
    })
  }

  const onGoogle = (credential: string) => run(async () => {
    const res = await authService.google(credential)
    if (res.status === 'logged_in') {
      setSessionUser(res.user)
      router.push(redirect)
      return
    }
    setGoogleCredential(credential)
    setForm((f) => ({ ...f, email: res.email, firstName: f.firstName || res.firstName, lastName: f.lastName || res.lastName }))
    go('profile')
  })

  // ── Compte existant : connexion ──
  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.password) { setErrors({ password: 'Saisissez votre mot de passe' }); return }
    run(async () => {
      await login(form.email.trim().toLowerCase(), form.password)
      router.push(redirect)
    })
  }

  // ── Étape 2 : mot de passe ──
  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!PASSWORD_RULES.every((r) => r.test(form.password))) errs.password = 'Le mot de passe doit respecter les règles ci-dessous'
    if (form.confirm !== form.password) errs.confirm = 'Les deux mots de passe ne correspondent pas'
    setErrors(errs)
    if (!Object.keys(errs).length) go('profile')
  }

  // ── Étape 3 : profil et création ──
  const submitProfile = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.firstName.trim()) errs.firstName = 'Prénom requis'
    if (!form.lastName.trim()) errs.lastName = 'Nom requis'
    if (!form.birthDate) errs.birthDate = 'Date de naissance requise'
    else if (form.birthDate > maxBirthDate()) errs.birthDate = `Vous devez avoir au moins ${MIN_AGE} ans`
    if (!/^\+?[0-9]{8,15}$/.test(cleanPhone(form.phone))) errs.phone = 'Numéro de téléphone invalide'
    if (!form.cgv) errs.cgv = 'Acceptez les conditions générales pour continuer'
    setErrors(errs)
    if (Object.keys(errs).length) return

    const profile = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      birthDate: form.birthDate,
      phone: cleanPhone(form.phone),
      acceptTerms: true,
    }
    run(async () => {
      if (googleCredential) {
        const res = await authService.googleComplete({ ...profile, credential: googleCredential })
        setSessionUser(res.user)
      } else {
        await register({ ...profile, email: form.email.trim().toLowerCase(), password: form.password })
      }
      setSeconds(REDIRECT_SECONDS)
      go('done')
    })
  }

  const stepNumber = step === 'email' ? 1 : step === 'password' ? 2 : step === 'profile' ? 3 : 0
  const back = step === 'login' || step === 'password' ? () => go('email')
    : step === 'profile' ? () => { if (googleCredential) { setGoogleCredential(null); go('email') } else go('password') }
    : null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-8 sm:py-14">
      {/* Le logo est déjà un lien vers l'accueil */}
      <div className="mb-6"><Logo theme="light" size="md" /></div>

      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        {step === 'done' ? (
          <div className="text-center py-4" role="status" aria-live="polite">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={44} className="text-emerald-600" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-gray-900">Compte créé</h1>
            <p className="text-gray-600 mt-2">Bienvenue {form.firstName.trim()} ! Votre compte YopoePrint est prêt.</p>
            <p className="text-sm text-gray-500 mt-6">
              {redirect === '/' ? <>Redirection vers l&apos;accueil</> : <>Retour à la page précédente</>} dans<strong className="text-gray-900 tabular-nums">{seconds}</strong> seconde{seconds > 1 ? 's' : ''}…
            </p>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3" aria-hidden="true">
              <div className="h-full bg-primary transition-all duration-1000 ease-linear" style={{ width: `${((REDIRECT_SECONDS - seconds) / REDIRECT_SECONDS) * 100}%` }} />
            </div>
            <button type="button" onClick={() => router.push(redirect)} className="mt-6 text-sm font-bold text-primary hover:underline inline-flex items-center gap-1">
              Continuer maintenant <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5 min-h-[28px]">
              {back ? (
                <button type="button" onClick={back} aria-label="Étape précédente" className="p-1 -ml-1 text-gray-600 hover:text-gray-900">
                  <ArrowLeft size={20} />
                </button>
              ) : <span />}
              {stepNumber > 0 && (
                <span className="flex items-center gap-1.5" aria-label={`Étape ${stepNumber} sur 3`}>
                  {[1, 2, 3].map((n) => (
                    <span key={n} className={`h-1.5 rounded-full transition-all ${n <= stepNumber ? 'w-6 bg-gray-900' : 'w-3 bg-gray-200'}`} />
                  ))}
                </span>
              )}
            </div>

            {apiError && <Alert className="mb-5">{apiError}</Alert>}

            {step === 'email' && (
              <form onSubmit={submitEmail} className="space-y-5" noValidate>
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-gray-900">Bienvenue sur YopoePrint</h1>
                  <p className="text-sm text-gray-600 mt-1">Saisissez votre email pour vous connecter ou créer un compte.</p>
                </div>
                <Field label="Adresse email" error={errors.email}>
                  <input type="email" inputMode="email" autoComplete="email" autoFocus value={form.email}
                    onChange={(e) => set('email')(e.target.value)} placeholder="salimata@exemple.com" className={input} />
                </Field>
                <Submit loading={loading}>Continuer</Submit>
                {googleSignInAvailable && (
                  <>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="h-px flex-1 bg-gray-200" /> ou <span className="h-px flex-1 bg-gray-200" />
                    </div>
                    <GoogleButton onCredential={onGoogle} />
                  </>
                )}
              </form>
            )}

            {step === 'login' && (
              <form onSubmit={submitLogin} className="space-y-5" noValidate>
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-gray-900">Bon retour !</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Un compte existe pour <strong className="text-gray-900">{form.email.trim().toLowerCase()}</strong>. Saisissez votre mot de passe.
                  </p>
                </div>
                <Field label="Mot de passe" error={errors.password}>
                  <PasswordInput value={form.password} onChange={set('password')} autoComplete="current-password" autoFocus />
                </Field>
                <Submit loading={loading}>Se connecter</Submit>
                <p className="text-center">
                  <Link href="/mot-de-passe-oublie" className="text-sm font-semibold text-gray-700 hover:text-primary underline underline-offset-4">Mot de passe oublié ?</Link>
                </p>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={submitPassword} className="space-y-5" noValidate>
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-gray-900">Créez votre mot de passe</h1>
                  <p className="text-sm text-gray-600 mt-1">Pour <strong className="text-gray-900">{form.email.trim().toLowerCase()}</strong></p>
                </div>
                <Field label="Mot de passe" error={errors.password}>
                  <PasswordInput value={form.password} onChange={set('password')} autoComplete="new-password" autoFocus />
                </Field>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Règles du mot de passe">
                  {PASSWORD_RULES.map((r) => (
                    <li key={r.label} className={`flex items-center gap-1 ${r.test(form.password) ? 'text-emerald-700' : 'text-gray-500'}`}>
                      <CheckCircle2 size={13} /> {r.label}
                    </li>
                  ))}
                </ul>
                <Field label="Confirmez le mot de passe" error={errors.confirm}>
                  <PasswordInput value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
                </Field>
                <Submit loading={false}>Continuer</Submit>
              </form>
            )}

            {step === 'profile' && (
              <form onSubmit={submitProfile} className="space-y-4" noValidate>
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-gray-900">Vos informations</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Dernière étape{googleCredential ? <> — compte Google <strong className="text-gray-900">{form.email}</strong></> : null}.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prénom" error={errors.firstName}>
                    <input autoComplete="given-name" value={form.firstName} onChange={(e) => set('firstName')(e.target.value)} className={input} />
                  </Field>
                  <Field label="Nom" error={errors.lastName}>
                    <input autoComplete="family-name" value={form.lastName} onChange={(e) => set('lastName')(e.target.value)} className={input} />
                  </Field>
                </div>
                <Field label="Date de naissance" error={errors.birthDate}>
                  <input type="date" autoComplete="bday" min="1900-01-01" max={maxBirthDate()} value={form.birthDate}
                    onChange={(e) => set('birthDate')(e.target.value)} className={input} />
                </Field>
                <Field label="Numéro de téléphone" error={errors.phone} hint="Utilisé pour le suivi de commande et le paiement Mobile Money">
                  <input type="tel" inputMode="tel" autoComplete="tel" placeholder="+226 70 00 00 00" value={form.phone}
                    onChange={(e) => set('phone')(e.target.value)} className={input} />
                </Field>
                <label className="flex items-start gap-3 pt-1 cursor-pointer">
                  <input type="checkbox" checked={form.cgv} onChange={(e) => set('cgv')(e.target.checked)} className="mt-0.5 w-4 h-4 accent-primary" />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    J&apos;accepte les <Link href="/cgv" className="font-bold text-gray-900 hover:underline">conditions générales</Link> et
                    la <Link href="/confidentialite" className="font-bold text-gray-900 hover:underline">politique de confidentialité</Link>.
                  </span>
                </label>
                {errors.cgv && <p role="alert" className="text-xs text-red-600 -mt-2 ml-7">{errors.cgv}</p>}
                <Submit loading={loading}>Valider mon compte</Submit>
              </form>
            )}
          </>
        )}
      </div>

      {step === 'email' && (
        <p className="text-xs text-gray-500 mt-6 text-center max-w-[420px]">
          Paiement Orange Money, Moov Money ou carte · BAT gratuit avant chaque impression
        </p>
      )}
    </div>
  )
}

export default function InscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={28} className="animate-spin text-primary" /></div>}>
      <Onboarding />
    </Suspense>
  )
}
