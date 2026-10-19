'use client'

import { useEffect, useRef, useState } from 'react'

// Identifiant client OAuth (Google Cloud Console › API et services › Identifiants).
// Sans lui, le bouton n'est pas affiché ; l'API doit avoir le même GOOGLE_CLIENT_ID.
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: string }) => void
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

let scriptPromise: Promise<void> | null = null
function loadScript(): Promise<void> {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = SCRIPT_SRC
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => { scriptPromise = null; reject(new Error('Google indisponible')) }
      document.head.appendChild(s)
    })
  }
  return scriptPromise
}

export const googleSignInAvailable = !!CLIENT_ID

/** Bouton officiel « Continuer avec Google » ; `onCredential` reçoit le jeton à vérifier par l'API. */
export function GoogleButton({ onCredential }: { onCredential: (credential: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const callback = useRef(onCredential)
  callback.current = onCredential
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!CLIENT_ID) return
    let alive = true
    loadScript()
      .then(() => {
        if (!alive || !ref.current || !window.google) return
        window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: (r) => callback.current(r.credential) })
        window.google.accounts.id.renderButton(ref.current, {
          type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill', locale: 'fr',
          width: ref.current.offsetWidth || 320,
        })
      })
      .catch(() => alive && setFailed(true))
    return () => { alive = false }
  }, [])

  if (!CLIENT_ID) return null
  if (failed) return <p className="text-xs text-center text-gray-500">Connexion Google momentanément indisponible.</p>
  return <div ref={ref} className="w-full flex justify-center min-h-[44px]" />
}
