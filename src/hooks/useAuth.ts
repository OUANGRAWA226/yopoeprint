'use client'

import { useState, useEffect, useCallback } from 'react'
import { authService, AuthUser, LoginData, RegisterData } from '@/lib/auth.service'
import { clearAuth, isAuthenticated } from '@/lib/api'

interface AuthState {
 user: AuthUser | null
 loading: boolean
 isLoggedIn: boolean
}

export function useAuth() {
 const [state, setState] = useState<AuthState>({
 user: null,
 loading: true,
 isLoggedIn: false,
 })

 // Charger l'utilisateur au démarrage
 useEffect(() => {
 const user = authService.getCurrentUser()
 setState({
 user,
 loading: false,
 isLoggedIn: !!user && isAuthenticated(),
 })
 }, [])

 // Connexion
 const login = useCallback(async (data: LoginData) => {
 const response = await authService.login(data)
 setState({ user: response.user, loading: false, isLoggedIn: true })
 return response
 }, [])

 // Inscription
 const register = useCallback(async (data: RegisterData) => {
 const response = await authService.register(data)
 setState({ user: response.user, loading: false, isLoggedIn: true })
 return response
 }, [])

 // Déconnexion
 const logout = useCallback(async () => {
 await authService.logout()
 setState({ user: null, loading: false, isLoggedIn: false })
 }, [])

 // Rafraîchir le profil depuis l'API
 const refreshUser = useCallback(async () => {
 try {
 const user = await authService.getMe()
 setState((prev) => ({ ...prev, user }))
 } catch {
 clearAuth()
 setState({ user: null, loading: false, isLoggedIn: false })
 }
 }, [])

 return {
 user: state.user,
 loading: state.loading,
 isLoggedIn: state.isLoggedIn,
 login,
 register,
 logout,
 refreshUser,
 }
}
