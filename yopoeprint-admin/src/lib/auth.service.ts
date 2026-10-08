// src/lib/auth.service.ts
import { api } from './index'

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  user: AdminUser
}

export interface LoginDto {
  email: string
  password: string
}

// Clé de stockage
const TOKEN_KEY = 'admin_auth_token'
const USER_KEY = 'admin_auth_user'

export const authService = {
  /**
   * Se connecter avec email/password
   */
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    // Stocker le token et l'utilisateur
    if (response.accessToken) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, response.accessToken)
        localStorage.setItem(USER_KEY, JSON.stringify(response.user))
      }
    }
    return response
  },

  /**
   * Se déconnecter
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  },

  /**
   * Récupère le token stocké
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  },

  /**
   * Récupère l'utilisateur stocké
   */
  getCurrentUser(): AdminUser | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(USER_KEY)
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
