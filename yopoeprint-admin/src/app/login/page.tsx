'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock } from 'lucide-react'
import { adminAuthService } from '@/lib/auth-admin.service'
import { AuthBox } from '@/components/AuthBox'
import { Spinner } from '@/components/ui'

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
      await adminAuthService.login({ email, password })
      router.push('/admin')
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthBox subtitle="Back-office">
      <p className="login-box-msg">Connectez-vous pour ouvrir votre session</p>

      <form onSubmit={handleLogin} noValidate={false}>
        <div className="input-group mb-3">
          <div className="form-floating">
            <input id="login-email" type="email" className="form-control" placeholder="Email" autoComplete="username"
              value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            <label htmlFor="login-email">Email</label>
          </div>
          <span className="input-group-text"><Mail size={16} aria-hidden="true" /></span>
        </div>

        <div className="input-group mb-3">
          <div className="form-floating">
            <input id="login-password" type="password" className="form-control" placeholder="Mot de passe" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
            <label htmlFor="login-password">Mot de passe</label>
          </div>
          <span className="input-group-text"><Lock size={16} aria-hidden="true" /></span>
        </div>

        {error && <div role="alert" className="alert alert-danger py-2 small">{error}</div>}

        <div className="d-grid">
          <button type="submit" className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2"
            disabled={loading || !email || !password}>
            {loading ? <><Spinner /> Connexion en cours…</> : <><LogIn size={17} /> Se connecter</>}
          </button>
        </div>
      </form>

      <p className="text-center text-secondary small mt-4 mb-1">Réservé à l&apos;équipe YopoePrint</p>
      <p className="text-center small mb-0">
        <Link href="/admin-setup" className="link-primary">Installation : créer le premier administrateur</Link>
      </p>
    </AuthBox>
  )
}
