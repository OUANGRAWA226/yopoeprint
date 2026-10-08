// Remplacez par votre vrai client API (voir yopoeprint-connect.zip)
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

async function request<T = any>(method: string, path: string, body?: any): Promise<T> {
  // Récupérer le token d'auth s'il existe
  let token: string | null = null
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('admin_auth_token')
    console.log(`[API] Token récupéré:`, token ? `${token.substring(0, 20)}...` : 'AUCUN TOKEN')
  }

  const headers: HeadersInit = { 
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  
  // Ajouter le token s'il existe
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    console.log(`[API] Header Authorization ajouté`)
  } else {
    console.warn(`[API] ⚠️ ATTENTION: Pas de token trouvé pour ${method} ${path}`)
  }

  try {
    console.log(`[API] ${method} ${BASE}${path}`)
    console.log(`[API] Headers:`, headers)
    if (body) {
      console.log(`[API] Body (brut):`, body)
      console.log(`[API] Body (JSON):`, JSON.stringify(body, null, 2))
    }
    
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include', // Permet les cookies cross-domain
    })
    
    console.log(`[API] Response status: ${res.status} ${res.statusText}`)
    
    const data = await res.json().catch(() => ({
      error: `Failed to parse response (status ${res.status})`
    }))
    
    console.log(`[API] Response data:`, data)
    
    // Afficher les erreurs de validation détaillées
    if (data?.errors && Array.isArray(data.errors)) {
      console.error(`[API] ❌ ERREURS DE VALIDATION (${data.errors.length}):`)
      data.errors.forEach((err: any, idx: number) => {
        console.error(`  [${idx + 1}] ${err.property}: ${err.constraints ? Object.values(err.constraints).join(', ') : err.message}`)
      })
    }
    
    if (!res.ok) {
      const errorMessage = data?.message || data?.error || `HTTP ${res.status}: ${res.statusText}`
      console.error(`[API Error] ${errorMessage}`)
      throw new Error(errorMessage)
    }
    
    return data
  } catch (error: any) {
    console.error(`[API Error] ${method} ${path}:`, error.message)
    throw error
  }
}

export const api = {
  get:    <T = any>(path: string)              => request<T>('GET',    path),
  post:   <T = any>(path: string, body: any)   => request<T>('POST',   path, body),
  put:    <T = any>(path: string, body: any)   => request<T>('PUT',    path, body),
  patch:  <T = any>(path: string, body: any)   => request<T>('PATCH',  path, body),
  delete: <T = any>(path: string)              => request<T>('DELETE', path),
}
