'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, UserPlus } from 'lucide-react'
import { api } from '@/lib'
import { saveSession } from '@/lib/session'
import { AuthBox } from '@/components/AuthBox'
import { Spinner } from '@/components/ui'

const EMPTY = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', setupToken: '' }

/** Installation : création du premier super administrateur (une seule fois, code ADMIN_SETUP_TOKEN). */
export default function AdminSetupPage() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('Les mots de passe ne correspondent pas')
    if (form.password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères')

    setLoading(true)
    try {
      const res = await api.post('/auth/setup-first-admin', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        setupToken: form.setupToken.trim() || undefined,
      })
      // Session ouverte : jetons (renouvelables) et utilisateur
      saveSession(res.accessToken, res.refreshToken, res.user)
      setSuccess(true)
      setTimeout(() => { window.location.href = '/admin' }, 1200)
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  const locked = loading || success

  return (
    <AuthBox subtitle="Installation du back-office" wide>
      <p className="login-box-msg">Créez le premier compte : il devient super administrateur.</p>

      <form onSubmit={submit}>
        <div className="row g-2 mb-2">
          <div className="col-sm-6">
            <label htmlFor="s-first" className="form-label small mb-1">Prénom</label>
            <input id="s-first" className="form-control" required disabled={locked} value={form.firstName} onChange={set('firstName')} autoComplete="given-name" />
          </div>
          <div className="col-sm-6">
            <label htmlFor="s-last" className="form-label small mb-1">Nom</label>
            <input id="s-last" className="form-control" required disabled={locked} value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
          </div>
        </div>
        <div className="mb-2">
          <label htmlFor="s-email" className="form-label small mb-1">Email</label>
          <input id="s-email" type="email" className="form-control" required disabled={locked} value={form.email} onChange={set('email')} autoComplete="username" />
        </div>
        <div className="mb-2">
          <label htmlFor="s-token" className="form-label small mb-1">Code d&apos;installation</label>
          <input id="s-token" type="password" className="form-control" disabled={locked} value={form.setupToken} onChange={set('setupToken')} autoComplete="off" aria-describedby="s-token-help" />
          <div id="s-token-help" className="form-text">Valeur de la variable ADMIN_SETUP_TOKEN du serveur (obligatoire en production).</div>
        </div>
        <div className="row g-2 mb-3">
          <div className="col-sm-6">
            <label htmlFor="s-pass" className="form-label small mb-1">Mot de passe</label>
            <input id="s-pass" type="password" className="form-control" required minLength={8} disabled={locked} value={form.password} onChange={set('password')} autoComplete="new-password" />
          </div>
          <div className="col-sm-6">
            <label htmlFor="s-confirm" className="form-label small mb-1">Confirmation</label>
            <input id="s-confirm" type="password" className="form-control" required disabled={locked} value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" />
          </div>
        </div>

        {error && <div role="alert" className="alert alert-danger py-2 small">{error}</div>}
        {success && (
          <div role="status" className="alert alert-success py-2 small d-flex align-items-center gap-2">
            <CheckCircle2 size={16} /> Compte créé. Ouverture du back-office…
          </div>
        )}

        <div className="d-grid">
          <button type="submit" disabled={locked} className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2">
            {loading ? <><Spinner /> Création en cours…</> : <><UserPlus size={17} /> Créer le compte</>}
          </button>
        </div>
      </form>

      <p className="text-center small mt-4 mb-0">
        Déjà un compte ? <Link href="/login" className="link-primary">Se connecter</Link>
      </p>
    </AuthBox>
  )
}
