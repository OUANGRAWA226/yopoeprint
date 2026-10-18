'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/context/AuthContext'
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

function ConnexionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/mon-compte'
  const isCheckoutRedirect = redirect.includes('/commande')

  const { login } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!form.email || !form.password) {
      setError('Veuillez remplir tous les champs')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      router.push(redirect)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[420px]">
      {/* Mobile Logo */}
      <div className="lg:hidden flex justify-center mb-8">
        <Logo theme="light" size="md" />
      </div>

      {isCheckoutRedirect && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-3 animate-in fade-in">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#FF6B00] shrink-0">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="font-bold text-orange-950 text-sm">Finalisation de commande</p>
            <p className="text-xs text-orange-700">Connectez-vous pour retrouver votre panier et vos adresses.</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Bon retour ! 👋</h1>
        <p className="text-gray-500 text-sm">Veuillez vous connecter pour accéder à votre espace.</p>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button type="button" className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-700">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>
        <button type="button" className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-700">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-px bg-gray-200 flex-1" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ou avec l'email</span>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-start gap-3">
          <span className="mt-0.5">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
            Adresse email
          </label>
          <input
            type="email"
            placeholder="votre.email@exemple.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl
                       text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
              Mot de passe
            </label>
            <Link href="/mot-de-passe-oublie" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
              Oublié ?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl
                         text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            />
            <button 
              type="button" 
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm
                     hover:bg-primary transition-colors hover:-translate-y-0.5 shadow-lg shadow-gray-900/20
                     disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Connexion...
            </>
          ) : (
            <>
              {isCheckoutRedirect ? 'Se connecter et continuer la commande' : 'Se connecter'}{' '}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-8">
        Nouveau sur YopoePrint ?{' '}
        <Link
          href={`/inscription${redirect !== '/mon-compte' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="text-gray-900 font-bold hover:text-primary transition-colors underline underline-offset-4"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  )
}

export default function ConnexionPage() {
  return (
    <div className="min-h-screen flex bg-white">
      {/* ─── LEFT PANEL (Studio Mockup & Branding) ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105"
          style={{ backgroundImage: 'url("/images/products/cartes-visite.jpg")' }}
        />
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none" 
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        <div className="absolute top-1/4 right-10 w-72 h-72 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10 max-w-lg px-12 text-center flex flex-col items-center">
          <div className="mb-10">
            <Logo theme="dark" size="lg" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Imprimerie en ligne certifiée • Ouagadougou</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4 leading-tight">
            L'excellence de l'impression à portée de clic.
          </h2>
          <p className="text-base text-slate-300 mb-10 leading-relaxed">
            Accédez à vos bons à tirer (BAT), téléchargez vos factures conformes DGI et pilotez vos réassorts en toute simplicité.
          </p>
          
          <div className="grid grid-cols-2 gap-4 w-full text-left">
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-lg">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                <ArrowRight size={16} />
              </div>
              <p className="text-white font-bold text-sm mb-0.5">Commandes rapides</p>
              <p className="text-slate-400 text-xs leading-relaxed">Relancez vos tirages récurrents en 1 clic</p>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                <ShieldCheck size={16} />
              </div>
              <p className="text-white font-bold text-sm mb-0.5">Suivi de production</p>
              <p className="text-slate-400 text-xs leading-relaxed">Validation BAT & expédition en temps réel</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL (Form) ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
        <Suspense fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        }>
          <ConnexionForm />
        </Suspense>
      </div>
    </div>
  )
}
