import { useAuthStore } from '@/stores/auth.store'

export function useAuth() {
  const auth = useAuthStore((state) => state.auth)
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const logout = useAuthStore((state) => state.logout)
  const fetchWithAuth = useAuthStore((state) => state.fetchWithAuth)
  return { auth, login, register, logout, fetchWithAuth }
}
