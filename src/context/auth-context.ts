import { createContext } from 'react'

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

export interface AuthContextValue {
  auth: AuthState | null
  login: (identifier: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
