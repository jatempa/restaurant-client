import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { createAccountSchema } from '@/lib/validations'
import './CreateAccount.css'

export function CreateAccount() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ name?: string }>({})
  const { auth, fetchWithAuth } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const parsed = createAccountSchema.safeParse({ name: name || undefined })
    if (!parsed.success) {
      const { fieldErrors: issues } = z.flattenError(parsed.error)
      setFieldErrors({ name: issues.name?.[0] })
      return
    }

    setLoading(true)
    try {
      const res = await fetchWithAuth('/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data.name ? { name: parsed.data.name } : {}),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Failed to create account')
        return
      }

      const account = await res.json()
      navigate(`/accounts/${account.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  if (!auth) {
    navigate('/')
    return null
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Button variant="secondary" onClick={() => navigate('/accounts')} aria-label="Back">
            ← Back
          </Button>
          {auth.user?.name && (
            <span className="user-name">Hi, {auth.user.name}</span>
          )}
        </div>
      </header>

      <form onSubmit={handleSubmit} className="create-account-form">
        <h1>Create account</h1>
        <div>
          <Input
            type="text"
            placeholder="Account name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!fieldErrors.name}
          />
          {fieldErrors.name && (
            <p className="field-error">{fieldErrors.name}</p>
          )}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  )
}
