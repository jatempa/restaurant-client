import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function CreateAccount() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { auth, fetchWithAuth } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetchWithAuth('/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(name ? { name } : {}),
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
        <button
          type="button"
          className="btn-back"
          onClick={() => navigate('/accounts')}
          aria-label="Back"
        >
          ← Back
        </button>
      </header>

      <form onSubmit={handleSubmit} className="create-account-form">
        <h1>Create account</h1>
        <input
          type="text"
          placeholder="Account name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  )
}
