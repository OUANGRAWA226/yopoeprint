'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib'
import { AlertCircle, CheckCircle, LogIn } from 'lucide-react'

export default function AdminSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'choice' | 'create' | 'login'>('choice')
  
  // Form Create Admin
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState(false)
  
  // Form Login
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')

    if (createForm.password !== createForm.confirmPassword) {
      setCreateError('Les mots de passe ne correspondent pas')
      return
    }

    if (createForm.password.length < 6) {
      setCreateError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setCreateLoading(true)
    try {
      // Créer un compte ADMIN directement
      const registerRes = await api.post('/auth/setup-first-admin', {
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        password: createForm.password,
      })

      console.log('Admin créé:', registerRes)
      
      // Sauvegarder le token et l'utilisateur
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_auth_token', registerRes.accessToken)
        localStorage.setItem('admin_auth_user', JSON.stringify(registerRes.user))
      }

      setCreateSuccess(true)
      setTimeout(() => {
        // Redirection directe vers admin après création réussie
        window.location.href = '/admin'
      }, 1500)
    } catch (err: any) {
      console.error('Erreur:', err)
      setCreateError(err.message || 'Erreur lors de la création du compte')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const response = await api.post('/auth/login', {
        email: loginForm.email,
        password: loginForm.password,
      })

      console.log('Connexion réussie:', response)

      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_auth_token', response.accessToken)
        localStorage.setItem('admin_auth_user', JSON.stringify(response.user))
      }

      // Rediriger vers admin
      router.push('/admin')
    } catch (err: any) {
      setLoginError(err.message || 'Erreur de connexion')
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-pale to-[#C5D4F0] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-pale rounded-2xl mb-4">
            <span className="text-4xl">🖨️</span>
          </div>
          <h1 className="text-3xl font-bold text-blue-deep">YopoePrint</h1>
          <p className="text-sm text-gray-400 mt-1">Configuration Administrateur</p>
        </div>

        {/* Choice Step */}
        {step === 'choice' && (
          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600 mb-6">
              Que souhaitez-vous faire?
            </p>
            <button
              onClick={() => setStep('create')}
              className="w-full py-3 bg-blue-mid text-white font-bold rounded-xl
                         hover:bg-blue-deep transition-all">
              ✓ Créer un nouveau compte admin
            </button>
            <button
              onClick={() => setStep('login')}
              className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl
                         hover:bg-gray-200 transition-all">
              → Me connecter avec mon compte
            </button>
          </div>
        )}

        {/* Create Admin Step */}
        {step === 'create' && (
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Prénom"
                value={createForm.firstName}
                onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                required
                disabled={createLoading || createSuccess}
                className="px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl
                           text-sm outline-none focus:border-blue-mid disabled:opacity-50"
              />
              <input
                type="text"
                placeholder="Nom"
                value={createForm.lastName}
                onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                required
                disabled={createLoading || createSuccess}
                className="px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl
                           text-sm outline-none focus:border-blue-mid disabled:opacity-50"
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              required
              disabled={createLoading || createSuccess}
              className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl
                         text-sm outline-none focus:border-blue-mid disabled:opacity-50"
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              required
              disabled={createLoading || createSuccess}
              className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl
                         text-sm outline-none focus:border-blue-mid disabled:opacity-50"
            />

            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={createForm.confirmPassword}
              onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
              required
              disabled={createLoading || createSuccess}
              className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl
                         text-sm outline-none focus:border-blue-mid disabled:opacity-50"
            />

            {createError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{createError}</p>
              </div>
            )}

            {createSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700">Compte créé avec succès! Redirection...</p>
              </div>
            )}

            <button
              type="submit"
              disabled={createLoading || createSuccess}
              className="w-full py-3 bg-blue-mid text-white font-bold rounded-xl
                         hover:bg-blue-deep transition-all disabled:opacity-50
                         flex items-center justify-center gap-2">
              {createLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création en cours…
                </>
              ) : (
                <>
                  Créer le compte
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep('choice'); setCreateError(''); }}
              className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-all">
              Retour
            </button>
          </form>
        )}

        {/* Login Step */}
        {step === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
              disabled={loginLoading}
              className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl
                         text-sm outline-none focus:border-blue-mid disabled:opacity-50"
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
              disabled={loginLoading}
              className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl
                         text-sm outline-none focus:border-blue-mid disabled:opacity-50"
            />

            {loginError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-blue-mid text-white font-bold rounded-xl
                         hover:bg-blue-deep transition-all disabled:opacity-50
                         flex items-center justify-center gap-2">
              {loginLoading ? (
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

            <button
              type="button"
              onClick={() => { setStep('choice'); setLoginError(''); }}
              className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-all">
              Retour
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
