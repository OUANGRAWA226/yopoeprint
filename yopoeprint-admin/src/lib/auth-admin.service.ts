// src/lib/auth-admin.service.ts
import { api } from './index'
import { saveSession, clearSession, logoutSession, getAccessToken, hasSession } from './session'

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

const ADMIN_USER_KEY = 'admin_auth_user'
const BACK_OFFICE = ['superadmin', 'admin', 'staff']

/** Authentification du back-office (jetons gérés par ./session, renouvelés automatiquement). */
export const adminAuthService = {
  async login(credentials: AdminLoginDto): Promise<AuthResponse> {
    // Une éventuelle session précédente ne doit pas interférer avec la connexion
    clearSession()
    const response = await api.post<AuthResponse>('/auth/login', credentials)

    // L'API renvoie les rôles en minuscules ('superadmin', 'admin', 'staff', 'client'…)
    const role = String(response.user?.role || '').toLowerCase()
    if (!BACK_OFFICE.includes(role)) {
      // Session ouverte par erreur pour un compte client : on la referme aussitôt
      saveSession(response.accessToken, response.refreshToken)
      await logoutSession()
      throw new Error('Ce compte n\'a pas les permissions administrateur. Contactez le support.')
    }

    saveSession(response.accessToken, response.refreshToken, response.user)
    return response
  },

  /** Ferme la session de cet appareil (côté serveur) et efface les jetons. */
  logout(): Promise<void> {
    return logoutSession()
  },

  getToken(): string | null {
    return getAccessToken()
  },

  getCurrentUser(): AdminUser | null {
    if (typeof window === 'undefined') return null
    try {
      const user = localStorage.getItem(ADMIN_USER_KEY)
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  },

  isAuthenticated(): boolean {
    return hasSession()
  },
}
