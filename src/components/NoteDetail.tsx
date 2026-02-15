import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import './NoteDetail.css'

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  price: number
  categoryId: number
}

interface NoteProduct {
  id: number
  productId: number
  amount: number
  total: number
  product: Product
}

interface Note {
  id: number
  numberNote: number
  status: string
  accountId: number
  noteProducts: NoteProduct[]
}

interface GroupedProduct {
  product: Product
  amount: number
  total: number
}

function ProductRow({
  item,
  onUpdateAmount,
  onDelete,
}: {
  item: GroupedProduct
  onUpdateAmount: (productId: number, amount: number) => void
  onDelete: (productId: number) => void
}) {
  const [amount, setAmount] = useState(String(item.amount))
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = () => {
    setAmount(String(item.amount))
    setIsEditing(true)
  }

  const handleSave = () => {
    const num = parseInt(amount, 10)
    if (num >= 1 && num !== item.amount) {
      onUpdateAmount(item.product.id, num)
    }
    setIsEditing(false)
  }

  const displayTotal =
    isEditing
      ? (parseInt(amount, 10) || 0) * item.product.price
      : item.total

  return (
    <li className="note-product-row">
      <span className="note-product-name">{item.product.name}</span>
      <div className="note-product-actions">
        <span className="note-product-amount">
          ×{' '}
          {isEditing ? (
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          ) : (
            <button
              type="button"
              className="btn-amount"
              onClick={handleEdit}
            >
              {item.amount}
            </button>
          )}
        </span>
        <span className="note-product-total">
          = ${displayTotal.toFixed(2)}
        </span>
        <button
          type="button"
          className="btn-delete"
          onClick={() => onDelete(item.product.id)}
          aria-label={`Delete ${item.product.name}`}
        >
          −
        </button>
      </div>
    </li>
  )
}

export function NoteDetail() {
  const { accountId, noteId } = useParams<{ accountId: string; noteId: string }>()
  const [note, setNote] = useState<Note | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [amount, setAmount] = useState<string>('1')
  const [loading, setLoading] = useState(true)
  const { auth, fetchWithAuth } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth || !noteId) {
      if (!auth) navigate('/')
      return
    }
    fetchWithAuth(`/notes/${noteId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(setNote)
      .catch(() => setNote(null))
      .finally(() => setLoading(false))
  }, [auth, noteId, fetchWithAuth, navigate])

  useEffect(() => {
    if (!auth) return
    fetchWithAuth('/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [auth, fetchWithAuth])

  useEffect(() => {
    if (!auth) return
    const url = selectedCategoryId
      ? `/products?categoryId=${selectedCategoryId}`
      : '/products'
    fetchWithAuth(url)
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [auth, selectedCategoryId, fetchWithAuth])

  const handleAddProduct = async () => {
    if (!noteId || !selectedProductId || !amount) return
    const amountNum = parseInt(amount, 10)
    if (amountNum < 1) return
    const res = await fetchWithAuth(`/notes/${noteId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: Number(selectedProductId), amount: amountNum }),
    })
    if (res.ok) {
      const created = await res.json()
      setNote((prev) =>
        prev
          ? {
              ...prev,
              noteProducts: [...prev.noteProducts, created],
            }
          : null
      )
      setAmount('1')
    }
  }

  const handleUpdateAmount = async (productId: number, newAmount: number) => {
    if (!noteId || newAmount < 1) return
    const res = await fetchWithAuth(
      `/notes/${noteId}/products/${productId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: newAmount }),
      }
    )
    if (res.ok) {
      const updated = await res.json()
      setNote((prev) => {
        if (!prev) return null
        const withoutProduct = prev.noteProducts.filter(
          (np) => np.productId !== productId
        )
        return {
          ...prev,
          noteProducts: [...withoutProduct, updated],
        }
      })
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!noteId) return
    const res = await fetchWithAuth(
      `/notes/${noteId}/products/${productId}`,
      { method: 'DELETE' }
    )
    if (res.ok) {
      setNote((prev) =>
        prev
          ? {
              ...prev,
              noteProducts: prev.noteProducts.filter(
                (np) => np.productId !== productId
              ),
            }
          : null
      )
    }
  }

  const groupedProducts = useMemo(() => {
    const byProduct: Record<
      number,
      { product: Product; amount: number; total: number }
    > = {}
    for (const np of note?.noteProducts ?? []) {
      const key = np.productId
      if (!byProduct[key]) {
        byProduct[key] = { product: np.product, amount: 0, total: 0 }
      }
      byProduct[key].amount += np.amount
      byProduct[key].total += np.total ?? 0
    }
    return Object.values(byProduct)
  }, [note?.noteProducts])

  if (!auth) return null
  if (loading) return <div className="page">Loading...</div>
  if (!note) return <div className="page">Note not found</div>

  const backPath = accountId ? `/accounts/${accountId}` : '/accounts'

  return (
    <div className="page">
      <header className="page-header">
        <button
          type="button"
          className="btn-back"
          onClick={() => navigate(backPath)}
          aria-label="Back"
        >
          ← Back
        </button>
      </header>

      <div className="note-detail-header">
        <h1>Note #{note.numberNote}</h1>
      </div>

      <section className="add-product-section">
        <h2>Add product</h2>
        <div className="add-product-form">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value)
                setSelectedProductId('')
              }}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {selectedCategoryId && (
            <>
              <div className="form-group">
                <label htmlFor="product">Product</label>
                <select
                  id="product"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">Select product</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} — ${prod.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              {selectedProductId && (
                <>
                  <div className="form-group">
                    <label htmlFor="amount">Amount</label>
                    <input
                      id="amount"
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-save"
                    onClick={handleAddProduct}
                  >
                    Save product
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </section>

      <section className="note-products-section">
        <h2>Products in note</h2>
        {groupedProducts.length === 0 ? (
          <p className="empty-message">No products added yet</p>
        ) : (
          <>
            <ul className="note-products-list">
              {groupedProducts.map((item) => (
                <ProductRow
                  key={item.product.id}
                  item={item}
                  onUpdateAmount={handleUpdateAmount}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </ul>
            <div className="note-products-total">
              Total: $
              {groupedProducts
                .reduce((sum, item) => sum + item.total, 0)
                .toFixed(2)}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
