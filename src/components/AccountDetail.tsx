import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

interface Account {
  id: number
  name: string | null
}

export function AccountDetail() {
  const { id } = useParams<{ id: string }>()
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const { auth, fetchWithAuth } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth || !id) {
      if (!auth) navigate('/')
      return
    }
    fetchWithAuth(`/accounts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(setAccount)
      .catch(() => setAccount(null))
      .finally(() => setLoading(false))
  }, [auth, id, fetchWithAuth, navigate])

  if (!auth) return null
  if (loading) return <div className="page">Loading...</div>
  if (!account) return <div className="page">Account not found</div>

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

      <div className="account-number-display">
        <span className="account-number">{account.id}</span>
      </div>
    </div>
  )
}
