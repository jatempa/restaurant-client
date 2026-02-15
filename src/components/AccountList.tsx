import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmModal } from './ConfirmModal';
import './AccountList.css';

interface Account {
  id: number;
  name: string | null;
  userId: number;
  checkout: string | null;
}

export function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteAccountId, setDeleteAccountId] = useState<number | null>(null);
  const { auth, fetchWithAuth, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth) {
      navigate('/');
      return;
    }
    fetchWithAuth('/accounts')
      .then((res) => res.json())
      .then((data) => setAccounts(data))
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false));
  }, [auth, fetchWithAuth, navigate]);

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeleteAccountId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteAccountId === null) return;
    const res = await fetchWithAuth(`/accounts/${deleteAccountId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setAccounts((prev) => prev.filter((acc) => acc.id !== deleteAccountId));
    }
    setDeleteAccountId(null);
  };

  const isOpen = (acc: Account) => !acc.checkout;

  if (!auth) return null;
  if (loading) return <div className='page'>Loading...</div>;

  return (
    <div className='page'>
      <header className='page-header accounts-header'>
        <div className='accounts-header-main'>
          <h1 className='accounts-title'>Accounts</h1>
          {auth.user?.name && (
            <span className='user-name accounts-greeting'>
              Hi, {auth.user.name}
            </span>
          )}
        </div>
        <div className='header-actions accounts-header-actions'>
          <Button
            size='icon'
            onClick={() => navigate('/accounts/new')}
            aria-label='Create account'
            title='Create a new account'
            className='accounts-create-btn'
          >
            <Plus className='size-4' />
          </Button>
          <Button
            variant='secondary'
            onClick={() => logout()}
            aria-label='Logout'
            className='accounts-logout-btn text-white hover:text-white'
          >
            <LogOut className='size-4' />
            Logout
          </Button>
        </div>
      </header>

      <div className='account-list'>
        {accounts.length === 0 ? (
          <p className='empty-message'>There are no accounts yet</p>
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
                  {acc.name && (
                    <span className='account-name'> — {acc.name}</span>
                  )}
                  <Badge
                    variant={isOpen(acc) ? 'secondary' : 'destructive'}
                    className='ml-2'
                  >
                    {isOpen(acc) ? 'Open' : 'Closed'}
                  </Badge>
                </span>
                {isOpen(acc) && (
                  <Button
                    variant='destructive'
                    size='icon-sm'
                    onClick={(e) => handleDeleteClick(e, acc.id)}
                    aria-label={`Delete account ${acc.id}`}
                  >
                    <Trash2 className='size-4' />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {deleteAccountId !== null && (
        <ConfirmModal
          message='Are you sure you want to delete the account?'
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteAccountId(null)}
        />
      )}
    </div>
  );
}
