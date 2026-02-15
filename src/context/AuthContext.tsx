import { useState, useCallback, type ReactNode } from 'react'
import { AuthContext, API_BASE, type AuthState } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(() => {
    const stored = localStorage.getItem('auth')
    if (stored) {
      try {
        return JSON.parse(stored) as AuthState
      } catch {
        return null
      }
    }
    return null
  })

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      return { ok: false, error: data.message || 'Login failed' }
    }
    const state: AuthState = {
      token: data.token,
      user: data.user,
    }
    setAuth(state)
    localStorage.setItem('auth', JSON.stringify(state))
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    setAuth(null)
    localStorage.removeItem('auth')
  }, [])

  const fetchWithAuth = useCallback(
    (url: string, options: RequestInit = {}) => {
      const token = auth?.token
      const headers = new Headers(options.headers)
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return fetch(url.startsWith('http') ? url : `${API_BASE}${url}`, { ...options, headers })
    },
    [auth?.token]
  )

  return (
    <AuthContext.Provider value={{ auth, login, logout, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
