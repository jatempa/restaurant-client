import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { auth, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (auth) navigate('/accounts')
  }, [auth, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(identifier, password)
      if (result.ok) {
        navigate('/accounts')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  )
}
