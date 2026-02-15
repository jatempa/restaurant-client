import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Trash2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmModal } from './ConfirmModal';
import { addProductSchema, productAmountSchema } from '@/lib/validations';
import './NoteDetail.css';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
}

interface NoteProduct {
  id: number;
  productId: number;
  amount: number;
  total: number;
  product: Product;
}

interface Note {
  id: number;
  numberNote: number;
  status: string;
  accountId: number;
  checkout: string | null;
  account?: { checkout: string | null };
  noteProducts: NoteProduct[];
}

interface GroupedProduct {
  product: Product;
  amount: number;
  total: number;
}

function ProductRow({
  item,
  readOnly,
  onUpdateAmount,
  onDelete,
}: {
  item: GroupedProduct;
  readOnly?: boolean;
  onUpdateAmount: (productId: number, amount: number) => void;
  onDelete: (productId: number) => void;
}) {
  const [amount, setAmount] = useState(String(item.amount));
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setAmount(String(item.amount));
    setIsEditing(true);
  };

  const handleSave = () => {
    const num = parseInt(amount, 10);
    const parsed = productAmountSchema.safeParse({
      amount: Number.isNaN(num) ? 0 : num,
    });
    if (parsed.success && parsed.data.amount !== item.amount) {
      onUpdateAmount(item.product.id, parsed.data.amount);
    }
    setIsEditing(false);
  };

  const displayTotal = isEditing
    ? (parseInt(amount, 10) || 0) * item.product.price
    : item.total;

  if (readOnly) {
    return (
      <li className='note-product-row'>
        <span className='note-product-name'>{item.product.name}</span>
        <span className='note-product-total'>
          × {item.amount} = ${item.total.toFixed(2)}
        </span>
      </li>
    );
  }

  return (
    <li className='note-product-row'>
      <span className='note-product-name'>{item.product.name}</span>
      <div className='note-product-actions'>
        <span className='note-product-amount'>
          ×{' '}
          {isEditing ? (
            <Input
              type='number'
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
              className='w-16 h-8 text-center '
            />
          ) : (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleEdit}
              className='text-white'
            >
              {item.amount}
            </Button>
          )}
        </span>
        <span className='note-product-total'>= ${displayTotal.toFixed(2)}</span>
        <Button
          variant='destructive'
          size='icon-sm'
          onClick={() => onDelete(item.product.id)}
          aria-label={`Delete ${item.product.name}`}
        >
          <Trash2 className='size-4' />
        </Button>
      </div>
    </li>
  );
}

export function NoteDetail() {
  const { accountId, noteId } = useParams<{
    accountId: string;
    noteId: string;
  }>();
  const [note, setNote] = useState<Note | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [amount, setAmount] = useState<string>('1');
  const [addProductError, setAddProductError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [confirmState, setConfirmState] = useState<
    'checkout-note' | 'delete-product' | null
  >(null);
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);
  const { auth, fetchWithAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth || !noteId) {
      if (!auth) navigate('/');
      return;
    }
    fetchWithAuth(`/notes/${noteId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(setNote)
      .catch(() => setNote(null))
      .finally(() => setLoading(false));
  }, [auth, noteId, fetchWithAuth, navigate]);

  useEffect(() => {
    if (!auth) return;
    fetchWithAuth('/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [auth, fetchWithAuth]);

  useEffect(() => {
    if (!auth) return;
    const url = selectedCategoryId
      ? `/products?categoryId=${selectedCategoryId}`
      : '/products';
    fetchWithAuth(url)
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [auth, selectedCategoryId, fetchWithAuth]);

  const handleAddProduct = async () => {
    if (!noteId) return;
    setAddProductError('');

    const amountNum = parseInt(amount, 10);
    const parsed = addProductSchema.safeParse({
      productId: selectedProductId ? Number(selectedProductId) : 0,
      amount: Number.isNaN(amountNum) ? 0 : amountNum,
    });
    if (!parsed.success) {
      setAddProductError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    const res = await fetchWithAuth(`/notes/${noteId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: parsed.data.productId,
        amount: parsed.data.amount,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setNote((prev) =>
        prev
          ? {
              ...prev,
              noteProducts: [...prev.noteProducts, created],
            }
          : null,
      );
      setAmount('1');
    }
  };

  const handleUpdateAmount = async (productId: number, newAmount: number) => {
    if (!noteId || newAmount < 1) return;
    const res = await fetchWithAuth(`/notes/${noteId}/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: newAmount }),
    });
    if (res.ok) {
      const updated = await res.json();
      setNote((prev) => {
        if (!prev) return null;
        const withoutProduct = prev.noteProducts.filter(
          (np) => np.productId !== productId,
        );
        return {
          ...prev,
          noteProducts: [...withoutProduct, updated],
        };
      });
    }
  };

  const handleDeleteProductClick = (productId: number) => {
    setPendingProductId(productId);
    setConfirmState('delete-product');
  };

  const handleDeleteProductConfirm = async () => {
    if (!noteId || pendingProductId === null) return;
    const res = await fetchWithAuth(
      `/notes/${noteId}/products/${pendingProductId}`,
      { method: 'DELETE' },
    );
    if (res.ok) {
      setNote((prev) =>
        prev
          ? {
              ...prev,
              noteProducts: prev.noteProducts.filter(
                (np) => np.productId !== pendingProductId,
              ),
            }
          : null,
      );
    }
    setPendingProductId(null);
    setConfirmState(null);
  };

  const handleCheckoutClick = () => {
    setConfirmState('checkout-note');
  };

  const handleCheckoutConfirm = async () => {
    if (!noteId || !accountId) return;
    const res = await fetchWithAuth(`/notes/${noteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkout: new Date().toISOString(),
        status: 'closed',
      }),
    });
    if (res.ok) {
      navigate(`/accounts/${accountId}`);
    }
    setConfirmState(null);
  };

  const groupedProducts = useMemo(() => {
    const byProduct: Record<
      number,
      { product: Product; amount: number; total: number }
    > = {};
    for (const np of note?.noteProducts ?? []) {
      const key = np.productId;
      if (!byProduct[key]) {
        byProduct[key] = { product: np.product, amount: 0, total: 0 };
      }
      byProduct[key].amount += np.amount;
      byProduct[key].total += np.total ?? 0;
    }
    return Object.values(byProduct);
  }, [note?.noteProducts]);

  const isReadOnly = !!(note?.checkout || note?.account?.checkout);

  if (!auth) return null;
  if (loading) return <div className='page'>Loading...</div>;
  if (!note) return <div className='page'>Note not found</div>;

  const backPath = accountId ? `/accounts/${accountId}` : '/accounts';

  return (
    <div className='page'>
      <header className='page-header'>
        <div>
          <Button
            variant='secondary'
            onClick={() => navigate(backPath)}
            aria-label='Back'
            className='text-white hover:text-white'
          >
            <ArrowLeft className='size-4' />
            Back
          </Button>
          {auth.user?.name && (
            <span className='user-name'>Hi, {auth.user.name}</span>
          )}
        </div>
      </header>

      <div className='note-detail-header'>
        <h1>Note #{note.numberNote}</h1>
        <Badge
          variant={!note.checkout ? 'secondary' : 'destructive'}
          className='ml-2'
        >
          {!note.checkout ? 'Open' : 'Closed'}
        </Badge>
      </div>

      {!isReadOnly && (
        <div className='checkout-actions'>
          <Button
            onClick={handleCheckoutClick}
            aria-label='Checkout note'
            className='bg-green-600 hover:bg-green-700'
          >
            <CreditCard className='size-4' />
            Checkout note
          </Button>
        </div>
      )}

      {!isReadOnly && (
        <section className='add-product-section'>
          <h2>Add product</h2>
          <div className='add-product-form'>
            <div className='form-group'>
              <label htmlFor='category'>Category</label>
              <Select
                value={selectedCategoryId}
                onValueChange={(v: string) => {
                  setSelectedCategoryId(v);
                  setSelectedProductId('');
                }}
              >
                <SelectTrigger
                  id='category'
                  className='w-full text-white data-placeholder:text-white'
                >
                  <SelectValue placeholder='Select category' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCategoryId && (
              <>
                <div className='form-group'>
                  <label htmlFor='product'>Product</label>
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                    disabled={products.length === 0}
                  >
                    <SelectTrigger
                      id='product'
                      className='w-full text-white data-placeholder:text-white'
                    >
                      <SelectValue
                        placeholder={
                          products.length === 0
                            ? 'No products in this category'
                            : 'Select product'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((prod) => (
                        <SelectItem key={prod.id} value={String(prod.id)}>
                          {prod.name} — ${prod.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedProductId && (
                  <>
                    <div className='form-group'>
                      <label htmlFor='amount'>Amount</label>
                      <Input
                        id='amount'
                        type='number'
                        min={1}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleAddProduct}>Save product</Button>
                  </>
                )}
              </>
            )}
          </div>
          {addProductError && (
            <p className="field-error">{addProductError}</p>
          )}
        </section>
      )}

      <section className='note-products-section'>
        <h2>Products in note</h2>
        {groupedProducts.length === 0 ? (
          <p className='empty-message'>No products added yet</p>
        ) : (
          <>
            <ul className='note-products-list'>
              {groupedProducts.map((item) => (
                <ProductRow
                  key={item.product.id}
                  item={item}
                  readOnly={isReadOnly}
                  onUpdateAmount={handleUpdateAmount}
                  onDelete={handleDeleteProductClick}
                />
              ))}
            </ul>
            <div className='note-products-total'>
              Total: $
              {groupedProducts
                .reduce((sum, item) => sum + item.total, 0)
                .toFixed(2)}
            </div>
          </>
        )}
      </section>
      {confirmState === 'checkout-note' && (
        <ConfirmModal
          message='Are you sure you want to close the note?'
          onConfirm={handleCheckoutConfirm}
          onCancel={() => setConfirmState(null)}
          confirmVariant='close'
        />
      )}
      {confirmState === 'delete-product' && (
        <ConfirmModal
          message='Are you sure you want to delete this product from the note?'
          onConfirm={handleDeleteProductConfirm}
          onCancel={() => {
            setConfirmState(null);
            setPendingProductId(null);
          }}
        />
      )}
    </div>
  );
}
