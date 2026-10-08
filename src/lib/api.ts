// src/lib/api.ts
// Client HTTP connecté à votre backend NestJS

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

function getToken(): string | null {
 if (typeof window === 'undefined') return null
 return localStorage.getItem('access_token')
}

async function request<T = any>(
 method: string,
 path: string,
 body?: any,
 isFormData = false
): Promise<T> {
 const token = getToken()

 const headers: Record<string, string> = {}
 if (token) headers['Authorization'] = `Bearer ${token}`
 if (!isFormData && body) headers['Content-Type'] = 'application/json'

 const url = `${BASE_URL}${path}`
 console.log(`[api.${method}] ${url}`)
 
 const res = await fetch(url, {
 method,
 headers,
 body: isFormData ? body : body ? JSON.stringify(body) : undefined,
 })

 if (!res.ok) {
 const err = await res.json().catch(() => ({ message: 'Erreur serveur' }))
 console.error(`[api.${method}] Error ${res.status}:`, err)
 throw new Error(err.message || `HTTP ${res.status}`)
 }

 // 204 No Content
 if (res.status === 204) return null as T
 const data = await res.json()
 console.log(`[api.${method}] Response:`, Array.isArray(data) ? `Array[${data.length}]` : data)
 return data
}

export function isAuthenticated(): boolean {
 if (typeof window === 'undefined') return false
 return !!localStorage.getItem('access_token')
}

export function saveAuth(accessToken: string, refreshToken: string): void {
 localStorage.setItem('access_token', accessToken)
 localStorage.setItem('refresh_token', refreshToken)
}

export function clearAuth(): void {
 localStorage.removeItem('access_token')
 localStorage.removeItem('refresh_token')
}

export const api = {
 get: <T = any>(path: string) => request<T>('GET', path),
 post: <T = any>(path: string, body: any) => request<T>('POST', path, body),
 patch: <T = any>(path: string, body: any) => request<T>('PATCH', path, body),
 delete: <T = any>(path: string) => request<T>('DELETE', path),
 upload: <T = any>(path: string, formData: FormData) => request<T>('POST', path, formData, true),
}
