import { api, saveAuth, clearAuth } from './api'

// ─── Types ────────────────────────────────────────────────────
export interface RegisterData {
 firstName: string
 lastName: string
 email: string
 phone?: string
 password: string
 birthDate: string // AAAA-MM-JJ
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
 birthDate?: string | null
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

// « Continuer avec Google » : connexion directe ou profil à compléter (nouvel utilisateur)
export type GoogleAuthResult =
 | ({ status: 'logged_in' } & AuthResponse)
 | { status: 'needs_profile'; email: string; firstName: string; lastName: string }

export type GoogleCompleteData = Omit<RegisterData, 'email' | 'password'> & { credential: string }

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

 // Étape 1 de l'inscription : l'adresse a-t-elle déjà un compte ?
 async checkEmail(email: string): Promise<{ exists: boolean }> {
 return api.post<{ exists: boolean }>('/auth/check-email', { email })
 },

 // Continuer avec Google (credential renvoyé par Google Identity Services)
 async google(credential: string): Promise<GoogleAuthResult> {
 const res = await api.post<GoogleAuthResult>('/auth/google', { credential })
 if (res.status === 'logged_in') { saveAuth(res.accessToken, res.refreshToken); saveUser(res.user) }
 return res
 },

 // Nouveau compte Google : profil de l'étape 3
 async googleComplete(data: GoogleCompleteData): Promise<AuthResponse> {
 const res = await api.post<AuthResponse>('/auth/google/complete', data)
 saveAuth(res.accessToken, res.refreshToken)
 saveUser(res.user)
 return res
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
