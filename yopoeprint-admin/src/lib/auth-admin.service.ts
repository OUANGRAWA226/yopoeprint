// src/lib/auth-admin.service.ts
import { api } from './index'

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  user: AdminUser
}

export interface AdminLoginDto {
  email: string
  password: string
}

/**
 * Service d'authentification pour les administrateurs
 * Les tokens admin sont stockés séparément
 */
const ADMIN_TOKEN_KEY = 'admin_auth_token'
const ADMIN_USER_KEY = 'admin_auth_user'

export const adminAuthService = {
  /**
   * Se connecter en tant qu'admin via le backend
   */
  async login(credentials: AdminLoginDto): Promise<AuthResponse> {
    try {
      console.log('[AdminAuth] Tentative de connexion avec:', credentials.email)
      
      const response = await api.post<AuthResponse>('/auth/login', credentials)
      
      console.log('[AdminAuth] Réponse:', response)
      
      // Vérifier que c'est un admin
      if (!response.user || (response.user.role !== 'ADMIN' && response.user.role !== 'STAFF')) {
        console.warn('[AdminAuth] Compte n\'a pas le rôle ADMIN, rôle actuel:', response.user?.role)
        throw new Error('Ce compte n\'a pas les permissions administrateur. Contactez le support.')
      }

      // Stocker le token et l'utilisateur
      if (response.accessToken) {
        if (typeof window !== 'undefined') {
          console.log('[AdminAuth] Sauvegarde du token et utilisateur')
          localStorage.setItem(ADMIN_TOKEN_KEY, response.accessToken)
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(response.user))
        }
      }

      return response
    } catch (error: any) {
      console.error('[AdminAuth] Erreur de connexion:', error)
      throw error
    }
  },

  /**
   * Se déconnecter
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_TOKEN_KEY)
      localStorage.removeItem(ADMIN_USER_KEY)
    }
  },

  /**
   * Récupère le token stocké
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ADMIN_TOKEN_KEY)
    }
    return null
  },

  /**
   * Récupère l'utilisateur stocké
   */
  getCurrentUser(): AdminUser | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(ADMIN_USER_KEY)
      return user ? JSON.parse(user) : null
    }
    return null
  },

  /**
   * Vérifie si connecté
   */
  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}
