import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import './AccountDetail.css'

interface Account {
  id: number
  name: string | null
}

interface Note {
  id: number
  numberNote: number
  status: string
  accountId: number
}

export function AccountDetail() {
  const { id } = useParams<{ id: string }>()
  const [account, setAccount] = useState<Account | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [notesLoading, setNotesLoading] = useState(true)
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

  useEffect(() => {
    if (!auth || !id) return
    fetchWithAuth(`/notes?accountId=${id}`)
      .then((res) => res.json())
      .then(setNotes)
      .catch(() => setNotes([]))
      .finally(() => setNotesLoading(false))
  }, [auth, id, fetchWithAuth])

  const handleCreateNote = async () => {
    if (!id) return
    const res = await fetchWithAuth('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: Number(id) }),
    })
    if (res.ok) {
      const note = await res.json()
      setNotes((prev) => [...prev, note])
    }
  }

  const handleDeleteNote = async (e: React.MouseEvent, noteId: number) => {
    e.stopPropagation()
    const res = await fetchWithAuth(`/notes/${noteId}`, { method: 'DELETE' })
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
    }
  }

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
        <span className="account-number">{account.name || `Account #${account.id}`}</span>
      </div>

      <section className="notes-section">
        <div className="notes-header">
          <h2>Notes</h2>
          <button
            type="button"
            className="btn-add"
            onClick={handleCreateNote}
            aria-label="Create note"
          >
            +
          </button>
        </div>
        <div className="note-list">
          {notesLoading ? (
            <p className="empty-message">Loading...</p>
          ) : notes.length === 0 ? (
            <p className="empty-message">There are no notes yet</p>
          ) : (
            <ul>
              {notes.map((note) => (
                <li
                  key={note.id}
                  onClick={() => navigate(`/accounts/${id}/notes/${note.id}`)}
                >
                  <span>
                    Note #{note.numberNote}
                    <span className="note-status"> — {note.status}</span>
                  </span>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    aria-label={`Delete note ${note.id}`}
                  >
                    −
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
