import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ShoppingCart, Plus, Minus, Trash2, Truck, ArrowRight, Tag } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { applyDiscountCode } from '../utils/discount'

export default function CartDrawer() {
  const { state, toggleCart, removeFromCart, updateCartQty, cartTotal, deliveryFee, setCartDiscount } = useApp()
  const navigate = useNavigate()

  const [discountInput, setDiscountInput] = useState('')
  const [codeError, setCodeError] = useState('')

  const appliedCode = state.cartDiscount.code
  const discountAmount = state.cartDiscount.amount

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') toggleCart() }
    if (state.isCartOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [state.isCartOpen, toggleCart])

  useEffect(() => {
    document.body.style.overflow = state.isCartOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [state.isCartOpen])

  if (!state.isCartOpen) return null

  const threshold = 50000
  const remaining = threshold - cartTotal
  const progress = Math.min((cartTotal / threshold) * 100, 100)

  const finalTotal = Math.max(0, cartTotal - discountAmount + deliveryFee)

  const handleApplyCode = () => {
    if (!discountInput.trim()) return
    const code = state.discountCodes.find(
      c => c.code.toLowerCase() === discountInput.trim().toLowerCase()
    )
    if (!code) { setCodeError('Код олдсонгүй'); return }
    if (!code.isActive) { setCodeError('Энэ код идэвхгүй байна'); return }
    if (code.expiresAt && new Date(code.expiresAt) < new Date()) { setCodeError('Кодны хугацаа дууссан'); return }
    if (code.usageLimit !== undefined && code.usedCount >= code.usageLimit) { setCodeError('Кодны хэрэглэх лимит дууссан'); return }
    const amount = applyDiscountCode(code, state.cart, cartTotal)
    if (amount === 0) { setCodeError('Энэ код таны сагсанд хэрэгжихгүй байна'); return }
    setCartDiscount(code, amount)
    setDiscountInput('')
    setCodeError('')
  }

  const handleRemoveCode = () => {
    setCartDiscount(null, 0)
    setDiscountInput('')
    setCodeError('')
  }

  return (
    <>
      <div className="fixed inset-0 bg-ink/50 z-40" onClick={toggleCart} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-forest text-white">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-serif font-semibold">Сагс</span>
            {state.cart.length > 0 && (
              <span className="bg-lime text-white text-xs font-bold px-2 py-0.5 rounded-full">{state.cart.length}</span>
            )}
          </div>
          <button onClick={toggleCart} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-sm transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free delivery bar */}
        {state.cart.length > 0 && (
          <div className="px-5 py-3 bg-cream border-b border-cream-dark">
            {remaining > 0 ? (
              <>
                <p className="label-mono text-forest mb-1.5">
                  {remaining.toLocaleString('mn-MN')}₮ нэмж үнэгүй хүргэлт аваарай
                </p>
                <div className="h-1 bg-cream-dark rounded-full overflow-hidden">
                  <div className="h-full bg-lime transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </>
            ) : (
              <p className="label-mono text-lime-dark flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> Та үнэгүй хүргэлт авах боломжтой!
              </p>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {state.cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 px-5">
              <span className="text-5xl mb-4">🛒</span>
              <p className="font-serif text-lg text-ink mb-1">Сагс хоосон байна</p>
              <p className="text-sm text-ink/50 mb-6">Шинэхэн ногоо нэмж эхлэцгээе</p>
              <button onClick={toggleCart} className="btn-forest text-sm">Дэлгүүр рүү явах</button>
            </div>
          ) : (
            <div className="divide-y divide-cream-dark">
              {state.cart.map(item => {
                const ep = item.product.discount
                  ? Math.round(item.product.price * (1 - item.product.discount / 100))
                  : item.product.price
                return (
                  <div key={item.product.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-cream/50 transition-colors">
                    <div className={`w-12 h-12 rounded-sm bg-gradient-to-br ${item.product.bgGradient} flex items-center justify-center text-2xl shrink-0`}>
                      {item.product.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink text-sm truncate">{item.product.name}</p>
                      <p className="font-serif font-bold text-forest text-sm">
                        {ep.toLocaleString('mn-MN')}₮
                        <span className="label-mono font-normal text-ink/40 ml-1">/{item.product.unit}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-sm bg-cream border border-cream-dark flex items-center justify-center hover:bg-cream-dark transition-colors"
                      >
                        {item.quantity === 1
                          ? <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          : <Minus className="w-3.5 h-3.5 text-ink" />
                        }
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-ink">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-sm bg-forest flex items-center justify-center hover:bg-forest-light transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.cart.length > 0 && (
          <div className="border-t border-cream-dark px-5 py-4 bg-white">
            {/* Discount code input */}
            <div className="mb-3">
              {appliedCode ? (
                <div className="flex items-center justify-between bg-lime/10 border border-lime/30 rounded-sm px-3 py-2">
                  <span className="flex items-center gap-1.5 text-xs text-lime-dark font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    {appliedCode.code} — -{discountAmount.toLocaleString('mn-MN')}₮
                  </span>
                  <button onClick={handleRemoveCode} className="text-ink/30 hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={discountInput}
                    onChange={e => { setDiscountInput(e.target.value.toUpperCase()); setCodeError('') }}
                    onKeyDown={e => { if (e.key === 'Enter') handleApplyCode() }}
                    placeholder="Хөнгөлөлтийн код"
                    className="flex-1 border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime font-mono uppercase bg-cream"
                  />
                  <button onClick={handleApplyCode} className="btn-forest text-xs px-3 py-2 whitespace-nowrap">
                    Хэрэглэх
                  </button>
                </div>
              )}
              {codeError && <p className="text-xs text-red-500 mt-1">{codeError}</p>}
            </div>

            {/* Totals */}
            <div className="space-y-1.5 mb-4 text-sm">
              <div className="flex justify-between text-ink/60">
                <span>Барааны үнэ</span>
                <span>{cartTotal.toLocaleString('mn-MN')}₮</span>
              </div>
              {appliedCode && (
                <div className="flex justify-between text-lime-dark font-semibold">
                  <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Хөнгөлөлт</span>
                  <span>-{discountAmount.toLocaleString('mn-MN')}₮</span>
                </div>
              )}
              <div className="flex justify-between text-ink/60">
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Хүргэлт</span>
                {deliveryFee === 0
                  ? <span className="text-lime-dark font-semibold">Үнэгүй</span>
                  : <span>{deliveryFee.toLocaleString('mn-MN')}₮ <span className="text-ink/30 text-xs">(хаяг сонгоход өөрчлөгдөнө)</span></span>
                }
              </div>
              <div className="flex justify-between font-serif font-bold text-ink text-base pt-2 border-t border-cream-dark">
                <span>Нийт дүн</span>
                <span className="text-forest">{finalTotal.toLocaleString('mn-MN')}₮</span>
              </div>
            </div>
            <button
              onClick={() => { toggleCart(); navigate('/checkout') }}
              className="w-full btn-forest py-3 text-sm flex items-center justify-center gap-2"
            >
              Захиалга өгөх <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
