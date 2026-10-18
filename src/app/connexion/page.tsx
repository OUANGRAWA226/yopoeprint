'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/context/AuthContext'
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { Alert } from '@/components/ui/Alert'

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
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
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

      {error && <Alert className="mb-6">{error}</Alert>}

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
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-950 overflow-hidden items-center justify-center">
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
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-gray-950/40" />
        <div className="absolute top-1/4 right-10 w-72 h-72 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10 max-w-lg px-12 text-center flex flex-col items-center">
          <div className="mb-10">
            <Logo theme="dark" size="lg" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs text-gray-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Imprimerie en ligne certifiée • Ouagadougou</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4 leading-tight">
            L'excellence de l'impression à portée de clic.
          </h2>
          <p className="text-base text-gray-300 mb-10 leading-relaxed">
            Accédez à vos bons à tirer (BAT), téléchargez vos factures conformes DGI et pilotez vos réassorts en toute simplicité.
          </p>
          
          <div className="grid grid-cols-2 gap-4 w-full text-left">
            <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-5 border border-gray-800/80 shadow-lg">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                <ArrowRight size={16} />
              </div>
              <p className="text-white font-bold text-sm mb-0.5">Commandes rapides</p>
              <p className="text-gray-400 text-xs leading-relaxed">Relancez vos tirages récurrents en 1 clic</p>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-5 border border-gray-800/80 shadow-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                <ShieldCheck size={16} />
              </div>
              <p className="text-white font-bold text-sm mb-0.5">Suivi de production</p>
              <p className="text-gray-400 text-xs leading-relaxed">Validation BAT & expédition en temps réel</p>
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
