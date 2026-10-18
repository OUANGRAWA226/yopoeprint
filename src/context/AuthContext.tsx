'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, AuthUser } from '@/lib/auth.service'
import { isAuthenticated, clearAuth } from '@/lib/api'

interface AuthContextType {
 user: AuthUser | null
 loading: boolean
 isLoggedIn: boolean
 login: (email: string, password: string) => Promise<void>
 register: (data: any) => Promise<void>
 logout: () => Promise<void>
 refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// ─── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
 const [user, setUser] = useState<AuthUser | null>(null)
 const [loading, setLoading] = useState(true)

 // Restaurer la session au démarrage
 useEffect(() => {
 const storedUser = authService.getCurrentUser()
 if (storedUser && isAuthenticated()) {
 setUser(storedUser)
 // Rafraîchir depuis l'API en arrière-plan
 authService.getMe()
 .then(setUser)
 .catch(() => {
 clearAuth()
 setUser(null)
 })
 }
 setLoading(false)
 }, [])

 const login = async (email: string, password: string) => {
 const res = await authService.login({ email, password })
 setUser(res.user)
 }

 const register = async (data: any) => {
 const res = await authService.register(data)
 setUser(res.user)
 }

 // Recharge le profil depuis l'API (après modification du compte)
 const refreshUser = async () => {
 const fresh = await authService.getMe()
 setUser(fresh)
 }

 const logout = async () => {
 await authService.logout()
 setUser(null)
 }

 return (
 <AuthContext.Provider value={{
 user,
 loading,
 isLoggedIn: !!user,
 login,
 register,
 logout,
 refreshUser,
 }}>
 {children}
 </AuthContext.Provider>
 )
}

// ─── Hook d'accès au contexte ─────────────────────────────────
export function useAuthContext() {
 const ctx = useContext(AuthContext)
 if (!ctx) throw new Error('useAuthContext doit être utilisé dans AuthProvider')
 return ctx
}
