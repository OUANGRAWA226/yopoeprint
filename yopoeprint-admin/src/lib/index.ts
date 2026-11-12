import { authFetch } from './session'

// Ne jamais journaliser le jeton ni le corps des requêtes : ils contiennent des mots de passe
async function request<T = any>(method: string, path: string, body?: any): Promise<T> {
  const res = await authFetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // Permet les cookies cross-domain
  })

  const data = await res.json().catch(() => ({
    error: `Failed to parse response (status ${res.status})`,
  }))

  if (!res.ok) {
    const errorMessage = data?.message || data?.error || `HTTP ${res.status}: ${res.statusText}`
    if (process.env.NODE_ENV !== 'production') console.error(`[API Error] ${method} ${path}: ${errorMessage}`)
    throw new Error(errorMessage)
  }

  return data
}

export const api = {
  get:    <T = any>(path: string)              => request<T>('GET',    path),
  post:   <T = any>(path: string, body: any)   => request<T>('POST',   path, body),
  put:    <T = any>(path: string, body: any)   => request<T>('PUT',    path, body),
  patch:  <T = any>(path: string, body: any)   => request<T>('PATCH',  path, body),
  delete: <T = any>(path: string)              => request<T>('DELETE', path),
}
