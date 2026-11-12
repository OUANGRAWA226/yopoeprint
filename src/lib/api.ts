// src/lib/api.ts
// Client HTTP connecté au backend NestJS.
// Le jeton d'accès est court (15 min) : il est renouvelé automatiquement avec le jeton
// de renouvellement, avant expiration ou après un 401. Si la session est fermée côté
// serveur (déconnexion ailleurs, mot de passe changé…), l'événement `auth:expired` est émis.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'
export const AUTH_EXPIRED_EVENT = 'auth:expired'

function read(key: string): string | null {
 if (typeof window === 'undefined') return null
 try { return localStorage.getItem(key) } catch { return null }
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

// Un seul renouvellement à la fois : les requêtes simultanées attendent le même résultat
let refreshing: Promise<string | null> | null = null

export function refreshSession(): Promise<string | null> {
 if (!refreshing) {
  refreshing = (async () => {
   const refreshToken = read(REFRESH_KEY)
   if (!refreshToken) return null
   try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    saveAuth(data.accessToken, data.refreshToken)
    return data.accessToken as string
   } catch {
    clearAuth()
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    return null
   }
  })().finally(() => { refreshing = null })
 }
 return refreshing
}

/** Jeton d'accès valide pour encore au moins 30 s, renouvelé si besoin ; null si non connecté. */
async function freshToken(): Promise<string | null> {
 const token = read(ACCESS_KEY)
 if (!token) return null
 const life = lifetime(token)
 // Renouvelé dans le dernier tiers de sa durée de vie (au plus 30 s avant l'expiration)
 if (life && life.exp - Date.now() < Math.min(30_000, (life.exp - life.iat) / 3)) return refreshSession()
 return token
}

async function request<T = any>(
 method: string,
 path: string,
 body?: any,
 isFormData = false
): Promise<T> {
 const send = (token: string | null) => {
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!isFormData && body) headers['Content-Type'] = 'application/json'
  return fetch(`${BASE_URL}${path}`, {
   method,
   headers,
   body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  })
 }

 const token = await freshToken()
 let res = await send(token)
 // Jeton refusé (session renouvelée ailleurs, horloge décalée…) : un renouvellement puis une seule nouvelle tentative
 if (res.status === 401 && token) {
  const renewed = await refreshSession()
  if (renewed) res = await send(renewed)
 }

 if (!res.ok) {
  const err = await res.json().catch(() => ({ message: 'Erreur serveur' }))
  if (process.env.NODE_ENV !== 'production') console.error(`[api.${method}] ${path} → ${res.status}`, err?.message)
  throw new Error(err.message || `HTTP ${res.status}`)
 }

 // 204 No Content
 if (res.status === 204) return null as T
 return res.json()
}

export function isAuthenticated(): boolean {
 return !!read(ACCESS_KEY) || !!read(REFRESH_KEY)
}

export function saveAuth(accessToken: string, refreshToken: string): void {
 localStorage.setItem(ACCESS_KEY, accessToken)
 localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function clearAuth(): void {
 try {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem('user')
 } catch { /* stockage indisponible */ }
}

export const api = {
 get: <T = any>(path: string) => request<T>('GET', path),
 post: <T = any>(path: string, body: any) => request<T>('POST', path, body),
 patch: <T = any>(path: string, body: any) => request<T>('PATCH', path, body),
 delete: <T = any>(path: string) => request<T>('DELETE', path),
 upload: <T = any>(path: string, formData: FormData) => request<T>('POST', path, formData, true),
}
