import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, CheckCircle, MapPin, CreditCard, Truck, ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import QPayModal from '../components/QPayModal'
import type { Address } from '../types'

const STEPS = ['Хаяг', 'Төлбөр', 'Баталгаажуулалт']

export default function Checkout() {
  const { state, cartTotal, deliveryFee, placeOrder, toast } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    state.user?.addresses.find(a => a.isDefault) ?? null
  )
  const [payment, setPayment] = useState<'cash' | 'qpay' | 'card'>('qpay')
  const [notes, setNotes] = useState('')
  const [placed, setPlaced] = useState(false)
  const [orderNum, setOrderNum] = useState('')
  const [pendingOrder, setPendingOrder] = useState<ReturnType<typeof placeOrder> | null>(null)
  const [showQPay, setShowQPay] = useState(false)

  if (state.cart.length === 0 && !placed && !showQPay) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-center px-4">
        <div>
          <span className="text-5xl block mb-4">🛒</span>
          <p className="font-serif text-xl text-ink mb-2">Сагс хоосон байна</p>
          <button onClick={() => navigate('/shop')} className="btn-forest mt-4">Дэлгүүр рүү явах</button>
        </div>
      </div>
    )
  }

  const handlePlaceOrder = () => {
    if (!selectedAddress) { toast('Хаяг сонгоно уу', 'error'); return }
    if (payment === 'qpay') {
      // Place order first, then open QPay modal
      const order = placeOrder(selectedAddress, payment)
      setPendingOrder(order)
      setOrderNum(order.orderNumber)
      setShowQPay(true)
      return
    }
    const order = placeOrder(selectedAddress, payment)
    setOrderNum(order.orderNumber)
    setPlaced(true)
    toast('Захиалга амжилттай өгөгдлөө!', 'success')
  }

  const handleQPaySuccess = () => {
    setShowQPay(false)
    setPlaced(true)
    toast('QPay төлбөр амжилттай!', 'success')
  }

  if (placed) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="bg-white rounded-sm shadow-sm border border-cream-dark p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-lime/20 rounded-sm flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-lime-dark" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-ink mb-1">Захиалга амжилттай!</h2>
          <p className="text-ink/50 mb-2">Таны захиалга хүлээн авлаа</p>
          <p className="label-mono text-forest font-bold text-lg mb-4">{orderNum}</p>
          <div className="bg-cream rounded-sm p-4 mb-6 text-sm text-ink/70 text-left space-y-1.5">
            <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-lime-dark" /> 2 цагийн дотор хүргэнэ</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-lime-dark" /> {selectedAddress?.district}, {selectedAddress?.building}</div>
            <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-lime-dark" /> {payment === 'qpay' ? 'QPay' : payment === 'card' ? 'Карт' : 'Бэлэн мөнгө'}</div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/dashboard')} className="btn-forest flex-1 py-2.5">Захиалга харах</button>
            <button onClick={() => navigate('/')} className="btn-outline flex-1 py-2.5">Нүүр хуудас</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {showQPay && pendingOrder && (
        <QPayModal
          orderId={pendingOrder.orderNumber}
          amount={pendingOrder.total}
          description={`Groot.mn захиалга ${pendingOrder.orderNumber}`}
          onSuccess={handleQPaySuccess}
          onClose={() => setShowQPay(false)}
        />
      )}
      <div className="bg-forest text-white py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-white/60 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Буцах
          </button>
          <h1 className="font-serif text-2xl font-bold">Захиалга баталгаажуулах</h1>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold ${i <= step ? 'bg-lime text-white' : 'bg-white/20 text-white/50'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-mono uppercase ${i === step ? 'text-white' : 'text-white/40'}`}>{s}</span>
                {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-white/20" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main */}
          <div className="md:col-span-2 space-y-4">
            {/* Step 0: Address */}
            {step === 0 && (
              <div className="bg-white rounded-sm border border-cream-dark p-5">
                <h2 className="font-serif font-semibold text-ink mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-lime-dark" /> Хүргэх хаяг
                </h2>
                {state.user?.addresses.length === 0 ? (
                  <p className="text-sm text-ink/50 py-4">Хадгалагдсан хаяг байхгүй байна.</p>
                ) : (
                  <div className="space-y-3">
                    {state.user?.addresses.map(addr => (
                      <label key={addr.id} className={`flex items-start gap-3 p-3 rounded-sm border cursor-pointer transition-colors ${selectedAddress?.id === addr.id ? 'border-forest bg-forest/5' : 'border-cream-dark hover:border-forest/40'}`}>
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress?.id === addr.id}
                          onChange={() => setSelectedAddress(addr)}
                          className="mt-0.5 accent-lime"
                        />
                        <div>
                          <p className="font-semibold text-sm text-ink">{addr.label} {addr.isDefault && <span className="label-mono text-lime-dark ml-1">Үндсэн</span>}</p>
                          <p className="text-xs text-ink/60">{addr.district}, {addr.khoroo}</p>
                          <p className="text-xs text-ink/60">{addr.street}, {addr.building}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <label className="label-mono text-ink/50 block mb-1.5">Нэмэлт тайлбар</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Жишээ: 3-р давхар, хонх дарна уу..."
                    className="w-full border border-cream-dark bg-cream rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className="bg-white rounded-sm border border-cream-dark p-5">
                <h2 className="font-serif font-semibold text-ink mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-lime-dark" /> Төлбөрийн хэлбэр
                </h2>
                <div className="space-y-3">
                  {([
                    { value: 'qpay', label: 'QPay', desc: 'QR кодоор төлнө', emoji: '📱' },
                    { value: 'card', label: 'Банкны карт', desc: 'Visa, MasterCard', emoji: '💳' },
                    { value: 'cash', label: 'Бэлэн мөнгө', desc: 'Хүргэлтийн үед төлнө', emoji: '💵' },
                  ] as const).map(opt => (
                    <label key={opt.value} className={`flex items-center gap-3 p-4 rounded-sm border cursor-pointer transition-colors ${payment === opt.value ? 'border-forest bg-forest/5' : 'border-cream-dark hover:border-forest/40'}`}>
                      <input type="radio" name="payment" value={opt.value} checked={payment === opt.value} onChange={() => setPayment(opt.value)} className="accent-lime" />
                      <span className="text-2xl">{opt.emoji}</span>
                      <div>
                        <p className="font-semibold text-sm text-ink">{opt.label}</p>
                        <p className="text-xs text-ink/50">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="bg-white rounded-sm border border-cream-dark p-5">
                <h2 className="font-serif font-semibold text-ink mb-4">Захиалга шалгах</h2>
                <div className="space-y-3 divide-y divide-cream">
                  {state.cart.map(item => {
                    const ep = item.product.discount ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price
                    return (
                      <div key={item.product.id} className="flex items-center gap-3 py-2">
                        <span className="text-2xl">{item.product.emoji}</span>
                        <div className="flex-1 text-sm">
                          <span className="font-medium text-ink">{item.product.name}</span>
                          <span className="text-ink/40 ml-1">× {item.quantity} {item.product.unit}</span>
                        </div>
                        <span className="font-serif font-bold text-forest text-sm">{(ep * item.quantity).toLocaleString('mn-MN')}₮</span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 pt-3 border-t border-cream-dark text-sm space-y-1">
                  {selectedAddress && (
                    <div className="flex gap-2 text-ink/60">
                      <MapPin className="w-4 h-4 shrink-0 text-lime-dark mt-0.5" />
                      <span>{selectedAddress.district}, {selectedAddress.building}</span>
                    </div>
                  )}
                  <div className="flex gap-2 text-ink/60">
                    <CreditCard className="w-4 h-4 shrink-0 text-lime-dark mt-0.5" />
                    <span>{payment === 'qpay' ? 'QPay' : payment === 'card' ? 'Банкны карт' : 'Бэлэн мөнгө'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="btn-outline flex-1 py-2.5 flex items-center justify-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Буцах
                </button>
              )}
              {step < 2 ? (
                <button
                  onClick={() => { if (step === 0 && !selectedAddress) { toast('Хаяг сонгоно уу', 'error'); return } setStep(s => s + 1) }}
                  className="btn-forest flex-1 py-2.5 flex items-center justify-center gap-1"
                >
                  Үргэлжлэх <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handlePlaceOrder} className="btn-forest flex-1 py-2.5 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Захиалга баталгаажуулах
                </button>
              )}
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-white rounded-sm border border-cream-dark p-5 sticky top-20">
              <h3 className="font-serif font-semibold text-ink mb-3">Захиалгын дүн</h3>
              <div className="space-y-2 text-sm mb-3">
                {state.cart.slice(0, 3).map(item => (
                  <div key={item.product.id} className="flex justify-between text-ink/60">
                    <span>{item.product.emoji} {item.product.name} ×{item.quantity}</span>
                    <span>{((item.product.discount ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price) * item.quantity).toLocaleString()}₮</span>
                  </div>
                ))}
                {state.cart.length > 3 && <p className="text-ink/40 text-xs">+ {state.cart.length - 3} бүтээгдэхүүн</p>}
              </div>
              <div className="border-t border-cream-dark pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-ink/60">
                  <span>Барааны үнэ</span>
                  <span>{cartTotal.toLocaleString()}₮</span>
                </div>
                <div className="flex justify-between text-ink/60">
                  <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Хүргэлт</span>
                  {deliveryFee === 0
                    ? <span className="text-lime-dark font-semibold">Үнэгүй</span>
                    : <span>{deliveryFee.toLocaleString()}₮</span>
                  }
                </div>
                <div className="flex justify-between font-serif font-bold text-forest text-base pt-2 border-t border-cream-dark">
                  <span>Нийт</span>
                  <span>{(cartTotal + deliveryFee).toLocaleString()}₮</span>
                </div>
              </div>
              {state.user && (
                <p className="text-xs text-lime-dark mt-3 label-mono">
                  +{Math.floor((cartTotal + deliveryFee) / 100)} урамшуулалын оноо авна
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
