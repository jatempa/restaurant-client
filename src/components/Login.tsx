import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { loginSchema } from '@/lib/validations'
import './Login.css'

export function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({})
  const { auth, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (auth) navigate('/accounts')
  }, [auth, navigate])

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const parsed = loginSchema.safeParse({ identifier, password })
    if (!parsed.success) {
      const { fieldErrors: issues } = z.flattenError(parsed.error)
      setFieldErrors({
        identifier: issues.identifier?.[0],
        password: issues.password?.[0],
      })
      return
    }

    setLoading(true)
    try {
      const result = await login(parsed.data.identifier, parsed.data.password)
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
        <div>
          <Input
            type="text"
            placeholder="Email or username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            aria-invalid={!!fieldErrors.identifier}
          />
          {fieldErrors.identifier && (
            <p className="field-error">{fieldErrors.identifier}</p>
          )}
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!fieldErrors.password}
          />
          {fieldErrors.password && (
            <p className="field-error">{fieldErrors.password}</p>
          )}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <p className="auth-link-row">
        Don&apos;t have an account? <Link to="/register">Create one</Link>
      </p>

      {error && <p className="error">{error}</p>}
    </div>
  )
}
