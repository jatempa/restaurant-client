import { useState } from 'react'
import './App.css'

interface LoginResponse {
  token: string
  user: {
    id: number
    email: string
    name: string
    firstLastName: string
  }
}

function App() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<{ name: string; firstLastName: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setUser(null)
    setLoading(true)

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Login failed')
        return
      }

      const loginData = data as LoginResponse
      setUser({
        name: loginData.user.name,
        firstLastName: loginData.user.firstLastName,
      })
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

      {user && (
        <div className="user-info">
          <h2>Logged in (test)</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Last name:</strong> {user.firstLastName}</p>
        </div>
      )}
    </div>
  )
}

export default App
