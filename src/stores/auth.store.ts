import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const API_BASE = 'http://localhost:3000/api'

export interface User {
  id: number
  email: string
  name: string
  firstLastName: string
}

export interface AuthState {
  token: string
  user: User
}

interface AuthStore {
  auth: AuthState | null
  login: (identifier: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      auth: null,

      login: async (identifier: string, password: string) => {
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
        set({ auth: state })
        return { ok: true }
      },

      logout: () => set({ auth: null }),

      fetchWithAuth: (url: string, options: RequestInit = {}) => {
        const token = get().auth?.token
        const headers = new Headers(options.headers)
        if (token) headers.set('Authorization', `Bearer ${token}`)
        return fetch(url.startsWith('http') ? url : `${API_BASE}${url}`, { ...options, headers })
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.auth) return
        const legacy = localStorage.getItem('auth')
        if (legacy) {
          try {
            const auth = JSON.parse(legacy) as AuthState
            useAuthStore.setState({ auth })
            localStorage.removeItem('auth')
          } catch {
            /* ignore */
          }
        }
      },
    }
  )
)
