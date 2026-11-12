const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

// Ne jamais journaliser le jeton ni le corps des requêtes : ils contiennent des mots de passe
async function request<T = any>(method: string, path: string, body?: any): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
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
