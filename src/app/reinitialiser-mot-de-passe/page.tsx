'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { api } from '@/lib/api'
import { Alert } from '@/components/ui/Alert'

const inputCls = `w-full px-4 py-3.5 pr-12 bg-gray-50 border border-gray-200 rounded-xl
  text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10`

function ResetPasswordForm() {
  const token = useSearchParams().get('token') || ''
  const tokenLooksValid = /^[a-f0-9]{64}$/.test(token)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.post('/auth/reset-password', { token, newPassword: password })
      setSuccess(true)
    } catch (err: any) {
      setError(err?.message || 'Réinitialisation impossible. Faites une nouvelle demande.')
    } finally {
      setLoading(false)
    }
  }

  if (!tokenLooksValid) {
    return (
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">Lien invalide</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Ce lien de réinitialisation est incomplet ou mal copié. Demandez-en un nouveau : il est valable 1 heure.
        </p>
        <Link href="/mot-de-passe-oublie"
          className="block w-full text-center bg-primary text-white py-4 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck size={32} className="text-green-600" />
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">Mot de passe modifié</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Votre nouveau mot de passe est enregistré. Vous pouvez maintenant vous connecter.
        </p>
        <Link href="/connexion"
          className="block w-full text-center bg-primary text-white py-4 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
          Se connecter
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Nouveau mot de passe</h1>
        <p className="text-gray-500 text-sm">Choisissez un mot de passe d’au moins 8 caractères.</p>
      </div>

      {error && (
        <Alert className="mb-6">
          <p>{error}</p>
          {/expir|invalide/i.test(error) && (
            <Link href="/mot-de-passe-oublie" className="inline-block mt-2 font-bold underline">
              Demander un nouveau lien
            </Link>
          )}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="new-password" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input id="new-password" type={show ? 'text' : 'password'} autoComplete="new-password"
              value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
            <button type="button" onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
            Confirmer le mot de passe
          </label>
          <input id="confirm-password" type={show ? 'text' : 'password'} autoComplete="new-password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors
                     shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Enregistrement…</> : 'Enregistrer le mot de passe'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-12 bg-white">
      <div className="w-full max-w-[420px]">
        <div className="flex justify-center mb-10">
          <Logo theme="light" size="md" />
        </div>
        <Link href="/connexion" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors mb-8">
          <ArrowLeft size={16} /> Retour à la connexion
        </Link>
        <Suspense fallback={<Loader2 size={24} className="animate-spin text-gray-400" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
