// Session du back-office : jetons stockés dans le navigateur et renouvellement automatique.
// Le jeton d'accès est court (15 min) ; il est renouvelé avant expiration ou après un 401.
// Si la session est fermée côté serveur (déconnexion, mot de passe changé, compte désactivé),
// tout est effacé et l'on revient à la page de connexion.

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
const ACCESS_KEY = 'admin_auth_token'
const REFRESH_KEY = 'admin_refresh_token'
const USER_KEY = 'admin_auth_user'

function read(key: string): string | null {
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem(key) } catch { return null }
}

export function getAccessToken(): string | null {
  return read(ACCESS_KEY)
}

export function hasSession(): boolean {
  return !!read(ACCESS_KEY) || !!read(REFRESH_KEY)
}

export function saveSession(accessToken: string, refreshToken?: string, user?: unknown) {
  localStorage.setItem(ACCESS_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  try {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  } catch { /* stockage indisponible */ }
}

// Dates d'émission et d'expiration (ms) lues dans le jeton, sans vérification : la signature est contrôlée par l'API
function lifetime(token: string): { iat: number; exp: number } | null {
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof p.exp === 'number' && typeof p.iat === 'number' ? { iat: p.iat * 1000, exp: p.exp * 1000 } : null
  } catch {
    return null
  }
}

function sessionExpired() {
  clearSession()
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    window.location.href = '/login'
  }
}

// Un seul renouvellement à la fois : les requêtes simultanées attendent le même résultat
let refreshing: Promise<string | null> | null = null

export function refreshSession(): Promise<string | null> {
  if (!refreshing) {
    refreshing = (async () => {
      const refreshToken = read(REFRESH_KEY)
      if (!refreshToken) { sessionExpired(); return null }
      try {
        const res = await fetch(`${BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        saveSession(data.accessToken, data.refreshToken)
        return data.accessToken as string
      } catch {
        sessionExpired()
        return null
      }
    })().finally(() => { refreshing = null })
  }
  return refreshing
}

/** Jeton d'accès valide pour encore au moins 30 s (renouvelé si besoin) ; null si non connecté. */
export async function freshAccessToken(): Promise<string | null> {
  const token = read(ACCESS_KEY)
  if (!token) return read(REFRESH_KEY) ? refreshSession() : null
  const life = lifetime(token)
  // Renouvelé dans le dernier tiers de sa durée de vie (au plus 30 s avant l'expiration)
  if (life && life.exp - Date.now() < Math.min(30_000, (life.exp - life.iat) / 3)) return refreshSession()
  return token
}

/** fetch authentifié vers l'API : jeton à jour, puis un renouvellement et une nouvelle tentative sur 401. */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const send = (token: string | null) => {
    const headers = new Headers(init.headers)
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return fetch(`${BASE}${path}`, { ...init, headers })
  }
  const token = await freshAccessToken()
  const res = await send(token)
  if (res.status !== 401 || !token) return res
  const renewed = await refreshSession()
  return renewed ? send(renewed) : res
}

/** Ferme la session de cet appareil côté serveur, puis efface les jetons locaux. */
export async function logoutSession() {
  try {
    if (hasSession()) await authFetch('/auth/logout', { method: 'POST' })
  } catch { /* hors ligne : la session expirera d'elle-même */ }
  clearSession()
}
