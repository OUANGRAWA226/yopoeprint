'use client'

import { ReactNode, useEffect } from 'react'

/** Gabarit AdminLTE des pages hors session (connexion, installation) : boîte centrée sur fond de la marque. */
export function AuthBox({ subtitle, children, wide = false }: { subtitle: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    document.body.classList.add('login-page')
    return () => document.body.classList.remove('login-page')
  }, [])

  return (
    <div className="login-box" style={wide ? { width: 'min(460px, 100%)' } : undefined}>
      <div className="card card-outline card-gold">
        <div className="card-header text-center">
          <span className="login-logo-mark h1 mb-0 d-block">Yopoe<span className="text-gold">Print</span></span>
          <span className="text-secondary small">{subtitle}</span>
        </div>
        <div className="card-body login-card-body">{children}</div>
      </div>
    </div>
  )
}
