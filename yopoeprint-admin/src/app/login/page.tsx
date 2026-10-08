'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminAuthService } from '@/lib/auth-admin.service'
import { AlertCircle, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Tentative de connexion admin avec:', { email })
      await adminAuthService.login({ email, password })
      console.log('Connexion réussie!')
      router.push('/admin')
    } catch (err: any) {
      console.error('Erreur de connexion:', err)
      const message = err.message || 'Erreur lors de la connexion'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-pale to-[#C5D4F0] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-pale rounded-2xl mb-4">
            <span className="text-4xl">🖨️</span>
          </div>
          <h1 className="text-3xl font-bold text-blue-deep">YopoePrint</h1>
          <p className="text-sm text-gray-400 mt-1">Tableau de bord administrateur</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl
                         text-sm outline-none focus:border-blue-mid focus:bg-white
                         transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl
                         text-sm outline-none focus:border-blue-mid focus:bg-white
                         transition-all disabled:opacity-50"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3 bg-blue-mid text-white font-bold rounded-xl
                       hover:bg-blue-deep transition-all disabled:opacity-50
                       disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connexion en cours…
              </>
            ) : (
              <>
                <LogIn size={18} />
                Se connecter
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Réservé aux administrateurs YopoePrint
        </p>

        {/* Setup Link */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 mb-2">Pas encore de compte?</p>
          <a href="/admin-setup"
             className="text-sm font-bold text-blue-mid hover:text-blue-deep transition-all">
            Créer un compte administrateur →
          </a>
        </div>
      </div>
    </div>
  )
}
