import { api, saveAuth, clearAuth } from './api'

// ─── Types ────────────────────────────────────────────────────
export interface RegisterData {
 firstName: string
 lastName: string
 email: string
 phone?: string
 password: string
 // Case « J'accepte les conditions générales » : obligatoire, l'API enregistre la date d'acceptation
 acceptTerms: boolean
}

export interface LoginData {
 email: string
 password: string
}

export interface AuthUser {
 id: string
 email: string
 firstName: string
 lastName: string
 phone: string
 role: string
 loyaltyPoints: number
 addresses: any[]
 companyName?: string | null
 resellerStatus?: 'pending' | 'approved' | 'rejected' | 'suspended' | null
}

export interface AuthResponse {
 accessToken: string
 refreshToken: string
 user: AuthUser
}

// ─── Auth Service ─────────────────────────────────────────────
export const authService = {

 // Créer un compte
 async register(data: RegisterData): Promise<AuthResponse> {
 const response = await api.post<AuthResponse>('/auth/register', data)
 // Sauvegarder les tokens automatiquement
 console.log('[auth.register] Response:', response)
 saveAuth(response.accessToken, response.refreshToken)
 saveUser(response.user)
 return response
 },

 // Se connecter
 async login(data: LoginData): Promise<AuthResponse> {
 const response = await api.post<AuthResponse>('/auth/login', data)
 console.log('[auth.login] Response:', response)
 saveAuth(response.accessToken, response.refreshToken)
 saveUser(response.user)
 return response
 },

 // Se déconnecter
 async logout(): Promise<void> {
 try {
 await api.post('/auth/logout', {})
 } finally {
 clearAuth()
 }
 },

 // Obtenir le profil connecté
 async getMe(): Promise<AuthUser> {
 const response = await api.get<AuthUser>('/auth/me')
 console.log('[auth.getMe] Response:', response)
 saveUser(response)
 return response
 },

 // Lire l'utilisateur depuis localStorage
 getCurrentUser(): AuthUser | null {
 if (typeof window === 'undefined') return null
 const raw = localStorage.getItem('user')
 if (!raw) return null
 try { return JSON.parse(raw) } catch { return null }
 },
}

function saveUser(user: AuthUser) {
 if (!user || !user.id) {
 console.warn('[auth] Invalid user:', user)
 return
 }
 localStorage.setItem('user', JSON.stringify(user))
}
