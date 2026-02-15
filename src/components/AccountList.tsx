import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import './AccountList.css'

interface Account {
  id: number
  name: string | null
  userId: number
  checkout: string | null
}

export function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const { auth, fetchWithAuth, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth) {
      navigate('/')
      return
    }
    fetchWithAuth('/accounts')
      .then((res) => res.json())
      .then((data) => setAccounts(data))
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false))
  }, [auth, fetchWithAuth, navigate])

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    const res = await fetchWithAuth(`/accounts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setAccounts((prev) => prev.filter((acc) => acc.id !== id))
    }
  }

  const isOpen = (acc: Account) => !acc.checkout

  if (!auth) return null
  if (loading) return <div className="page">Loading...</div>

  return (
    <div className="page">
      <header className="page-header">
        <h1>Accounts</h1>
        <div className="header-actions">
          <button
            type="button"
            className="btn-add"
            onClick={() => navigate('/accounts/new')}
            aria-label="Create account"
          >
            +
          </button>
          <button type="button" className="btn-icon" onClick={() => logout()} aria-label="Logout">
            Logout
          </button>
        </div>
      </header>

      <div className="account-list">
        {accounts.length === 0 ? (
          <p className="empty-message">There are no accounts yet</p>
        ) : (
          <ul>
            {accounts.map((acc) => (
              <li
                key={acc.id}
                onClick={() => navigate(`/accounts/${acc.id}`)}
                className={isOpen(acc) ? '' : 'item-closed'}
              >
                <span>
                  Account #{acc.id}
                  {acc.name && <span className="account-name"> — {acc.name}</span>}
                  <span className={`status-badge ${isOpen(acc) ? 'status-open' : 'status-closed'}`}>
                    {isOpen(acc) ? 'Open' : 'Closed'}
                  </span>
                </span>
                {isOpen(acc) && (
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={(e) => handleDelete(e, acc.id)}
                    aria-label={`Delete account ${acc.id}`}
                  >
                    −
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
