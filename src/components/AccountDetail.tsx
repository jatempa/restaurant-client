import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CreditCard } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmModal } from './ConfirmModal';
import './AccountDetail.css';

interface Account {
  id: number;
  name: string | null;
  checkout: string | null;
}

interface Note {
  id: number;
  numberNote: number;
  status: string;
  accountId: number;
  checkout: string | null;
}

export function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(true);
  const [confirmState, setConfirmState] = useState<
    'checkout-account' | 'delete-note' | null
  >(null);
  const [pendingNoteId, setPendingNoteId] = useState<number | null>(null);
  const { auth, fetchWithAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth || !id) {
      if (!auth) navigate('/');
      return;
    }
    fetchWithAuth(`/accounts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(setAccount)
      .catch(() => setAccount(null))
      .finally(() => setLoading(false));
  }, [auth, id, fetchWithAuth, navigate]);

  useEffect(() => {
    if (!auth || !id) return;
    fetchWithAuth(`/notes?accountId=${id}`)
      .then((res) => res.json())
      .then(setNotes)
      .catch(() => setNotes([]))
      .finally(() => setNotesLoading(false));
  }, [auth, id, fetchWithAuth]);

  const handleCreateNote = async () => {
    if (!id) return;
    const res = await fetchWithAuth('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: Number(id) }),
    });
    if (res.ok) {
      const note = await res.json();
      setNotes((prev) => [...prev, note]);
    }
  };

  const handleDeleteNoteClick = (e: React.MouseEvent, noteId: number) => {
    e.stopPropagation();
    setPendingNoteId(noteId);
    setConfirmState('delete-note');
  };

  const handleDeleteNoteConfirm = async () => {
    if (pendingNoteId === null) return;
    const res = await fetchWithAuth(`/notes/${pendingNoteId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== pendingNoteId));
    }
    setPendingNoteId(null);
    setConfirmState(null);
  };

  const handleCheckoutClick = () => {
    setConfirmState('checkout-account');
  };

  const handleCheckoutConfirm = async () => {
    if (!id) return;
    const res = await fetchWithAuth(`/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkout: new Date().toISOString() }),
    });
    if (res.ok) {
      navigate('/accounts');
    }
    setConfirmState(null);
  };

  const accountOpen = !account?.checkout;

  if (!auth) return null;
  if (loading) return <div className='page'>Loading...</div>;
  if (!account) return <div className='page'>Account not found</div>;

  return (
    <div className='page'>
      <header className='page-header'>
        <Button
          variant='secondary'
          onClick={() => navigate('/accounts')}
          aria-label='Back'
          className='text-white'
        >
          <ArrowLeft className='size-4' />
          Back
        </Button>
      </header>

      <div className='account-number-display'>
        <span className='account-number'>
          {account.name || `Account #${account.id}`}
        </span>
        <Badge
          variant={accountOpen ? 'secondary' : 'destructive'}
          className='ml-2'
        >
          {accountOpen ? 'Open' : 'Closed'}
        </Badge>
      </div>

      {accountOpen && (
        <div className='checkout-actions'>
          <Button
            onClick={handleCheckoutClick}
            aria-label='Checkout account'
            className='bg-green-600 hover:bg-green-700'
          >
            <CreditCard className='size-4' />
            Checkout account
          </Button>
        </div>
      )}

      <section className='notes-section'>
        <div className='notes-header'>
          <h2>Notes</h2>
          {accountOpen && (
            <Button
              size='icon'
              onClick={handleCreateNote}
              aria-label='Create note'
            >
              <Plus className='size-4' />
            </Button>
          )}
        </div>
        <div className='note-list'>
          {notesLoading ? (
            <p className='empty-message'>Loading...</p>
          ) : notes.length === 0 ? (
            <p className='empty-message'>There are no notes yet</p>
          ) : (
            <ul>
              {notes.map((note) => {
                const noteOpen = !note.checkout;
                return (
                  <li
                    key={note.id}
                    onClick={() =>
                      id && navigate(`/accounts/${id}/notes/${note.id}`)
                    }
                    className={noteOpen ? '' : 'item-closed'}
                  >
                    <span>
                      Note #{note.numberNote}
                      <span className='note-status'> — {note.status}</span>
                      <Badge
                        variant={noteOpen ? 'secondary' : 'destructive'}
                        className='ml-2'
                      >
                        {noteOpen ? 'Open' : 'Closed'}
                      </Badge>
                    </span>
                    {noteOpen && (
                      <Button
                        variant='destructive'
                        size='icon-sm'
                        onClick={(e) => handleDeleteNoteClick(e, note.id)}
                        aria-label={`Delete note ${note.id}`}
                      >
                        <Trash2 className='size-4' />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
      {confirmState === 'checkout-account' && (
        <ConfirmModal
          message='Are you sure you want to close the account? All notes will be closed too.'
          onConfirm={handleCheckoutConfirm}
          onCancel={() => setConfirmState(null)}
          confirmVariant='close'
        />
      )}
      {confirmState === 'delete-note' && (
        <ConfirmModal
          message='Are you sure you want to delete the note?'
          onConfirm={handleDeleteNoteConfirm}
          onCancel={() => {
            setConfirmState(null);
            setPendingNoteId(null);
          }}
        />
      )}
    </div>
  );
}
