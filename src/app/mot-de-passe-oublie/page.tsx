'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Veuillez entrer votre adresse email.')
      return
    }
    
    setLoading(true)
    setError('')
    
    // Simulation d'appel API
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* ─── LEFT PANEL (Image & Branding) ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=2000&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        
        <div className="relative z-10 max-w-xl px-12 text-center flex flex-col items-center">
          <Link href="/" className="font-display text-4xl font-extrabold text-white mb-12 tracking-tight">
            Yopoe<span className="text-primary">Print</span>
          </Link>
          
          <h2 className="text-4xl font-display font-extrabold text-white mb-6 leading-tight">
            Pas de panique.
          </h2>
          <p className="text-lg text-gray-300">
            Il arrive à tout le monde d'oublier son mot de passe. Entrez votre email et nous vous enverrons un lien pour le réinitialiser.
          </p>
        </div>
      </div>

      {/* ─── RIGHT PANEL (Form) ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-[420px]">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="font-display text-3xl font-extrabold text-gray-900">
              Yopoe<span className="text-primary">Print</span>
            </Link>
          </div>

          <Link href="/connexion" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors mb-8">
            <ArrowLeft size={16} /> Retour à la connexion
          </Link>

          {success ? (
            <div className="animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <MailCheck size={32} className="text-green-600" />
              </div>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">Email envoyé !</h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Si un compte est associé à l'adresse <strong className="text-gray-900">{email}</strong>, vous recevrez un email contenant un lien de réinitialisation dans quelques instants.
              </p>
              <button
                onClick={() => { setSuccess(false); setEmail('') }}
                className="w-full bg-gray-100 text-gray-900 py-3.5 rounded-xl font-bold text-sm
                           hover:bg-gray-200 transition-colors"
              >
                Essayer une autre adresse
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié ? 🔒</h1>
                <p className="text-gray-500 text-sm">Saisissez l'adresse email associée à votre compte pour recevoir un lien de réinitialisation.</p>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl
                               text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm
                             hover:bg-primary/90 transition-colors hover:-translate-y-0.5 shadow-lg shadow-primary/20
                             disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    'Envoyer le lien de réinitialisation'
                  )}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
