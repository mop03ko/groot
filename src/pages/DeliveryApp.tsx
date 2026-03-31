import { useState } from 'react'
import { MapPin, Phone, CheckCircle, Package, Truck, Navigation, Clock, Star } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { DEMO_DRIVERS } from '../data/mockData'
import type { OrderStatus } from '../types'

const DELIVERY_FLOW: { status: OrderStatus; label: string; action: string }[] = [
  { status: 'confirmed',  label: 'Баталгаажсан',     action: 'Авахаар явах' },
  { status: 'preparing',  label: 'Бэлтгэж байна',    action: 'Авсан' },
  { status: 'delivering', label: 'Хүргэлтэнд гарсан', action: 'Хүргэлт эхлэх' },
  { status: 'delivered',  label: 'Хүргэгдсэн',       action: 'Хүргэсэн баталгаажуулах' },
]

export default function DeliveryApp() {
  const { state, updateOrderStatus, toast } = useApp()
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  const user = state.user
  if (user?.role !== 'driver') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-center px-4">
        <div>
          <p className="font-serif text-xl text-ink mb-2">Жолоочийн эрх шаардлагатай</p>
          <p className="text-sm text-ink/50">Зөвхөн жолоочид зориулагдсан хэсэг</p>
        </div>
      </div>
    )
  }

  const driver = DEMO_DRIVERS.find(d => d.id === user.id) ?? DEMO_DRIVERS[0]
  const activeOrders = state.orders.filter(o => ['confirmed', 'preparing', 'delivering'].includes(o.status))
  const completedOrders = state.orders.filter(o => o.status === 'delivered')

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const idx = DELIVERY_FLOW.findIndex(f => f.status === current)
    if (idx === -1 || idx === DELIVERY_FLOW.length - 1) return 'delivered'
    return DELIVERY_FLOW[idx + 1].status
  }

  const getNextAction = (current: OrderStatus): string => {
    const next = DELIVERY_FLOW.find(f => f.status === current)
    return next?.action ?? 'Дуусгах'
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-forest text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-sm bg-white/10 flex items-center justify-center text-2xl">{user.avatar}</div>
            <div>
              <h1 className="font-serif font-bold text-lg">{user.name}</h1>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded-sm ${driver.status === 'delivering' ? 'bg-lime text-white' : 'bg-white/20 text-white/70'}`}>
                  {driver.status === 'available' ? '● Бэлэн' : driver.status === 'delivering' ? '🚗 Хүргэлтэнд' : '○ Офлайн'}
                </span>
                <span className="text-white/40 text-xs font-mono">⭐ {driver.rating}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: driver.completedToday, label: 'Өнөөдөр' },
              { val: activeOrders.length, label: 'Идэвхтэй' },
              { val: completedOrders.length, label: 'Нийт' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-sm p-3 text-center">
                <p className="font-serif font-bold text-2xl text-lime">{s.val}</p>
                <p className="label-mono text-white/50 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex border-t border-white/10">
          {[
            { id: 'active', label: `Идэвхтэй (${activeOrders.length})` },
            { id: 'history', label: `Түүх (${completedOrders.length})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as 'active' | 'history')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.id ? 'border-lime text-white' : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        {activeTab === 'active' ? (
          activeOrders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">✅</p>
              <p className="font-serif text-xl text-ink mb-1">Идэвхтэй хүргэлт байхгүй</p>
              <p className="text-sm text-ink/50">Шинэ захиалга ирэхийг хүлээж байна</p>
            </div>
          ) : (
            activeOrders.map(order => {
              const nextStatus = getNextStatus(order.status)
              const nextAction = getNextAction(order.status)
              const isDelivering = order.status === 'delivering'

              return (
                <div key={order.id} className={`bg-white rounded-sm border overflow-hidden ${isDelivering ? 'border-lime shadow-sm shadow-lime/20' : 'border-cream-dark'}`}>
                  {isDelivering && (
                    <div className="bg-lime/10 border-b border-lime/20 px-4 py-2 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-lime-dark" />
                      <span className="label-mono text-lime-dark">Одоо хүргэж байна</span>
                    </div>
                  )}

                  <div className="p-4">
                    {/* Order header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono text-sm text-ink/50">{order.orderNumber}</p>
                        <p className="font-serif font-bold text-lg text-ink">{order.customerName}</p>
                        <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1 text-sm text-forest hover:text-lime transition-colors">
                          <Phone className="w-3.5 h-3.5" /> {order.customerPhone}
                        </a>
                      </div>
                      <div className="text-right">
                        <p className="font-serif font-bold text-forest text-lg">{order.total.toLocaleString()}₮</p>
                        <p className="text-xs text-ink/40 font-mono uppercase">{order.paymentMethod === 'cash' ? 'Бэлэн' : order.paymentMethod === 'qpay' ? 'QPay' : 'Карт'}</p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="bg-cream rounded-sm p-3 mb-3 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-lime-dark shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-ink">{order.deliveryAddress.district}, {order.deliveryAddress.khoroo}</p>
                        <p className="text-ink/60">{order.deliveryAddress.street}, {order.deliveryAddress.building}</p>
                      </div>
                      <button className="ml-auto text-forest hover:text-lime transition-colors">
                        <Navigation className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Items summary */}
                    <div className="flex gap-1 mb-3 flex-wrap">
                      {order.items.map((item, i) => (
                        <span key={i} className="text-sm bg-cream rounded-sm px-2 py-1 flex items-center gap-1">
                          {item.emoji} <span className="text-ink/60 text-xs">{item.productName} ×{item.quantity}</span>
                        </span>
                      ))}
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-1 mb-4">
                      {DELIVERY_FLOW.map((f, i) => (
                        <div key={f.status} className="flex items-center flex-1">
                          <div className={`w-full h-1 rounded-full ${order.status === f.status || DELIVERY_FLOW.findIndex(x => x.status === order.status) > i ? 'bg-forest' : 'bg-cream-dark'}`} />
                        </div>
                      ))}
                    </div>

                    {/* Action button */}
                    {order.status !== 'delivered' && nextStatus && (
                      <button
                        onClick={() => {
                          updateOrderStatus(order.id, nextStatus)
                          toast(`Захиалга "${nextStatus}" болов`, 'success')
                        }}
                        className="w-full btn-forest py-3 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> {nextAction}
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )
        ) : (
          /* History */
          completedOrders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">📋</p>
              <p className="font-serif text-xl text-ink mb-1">Хүргэлтийн түүх хоосон байна</p>
            </div>
          ) : (
            completedOrders.map(order => (
              <div key={order.id} className="bg-white rounded-sm border border-cream-dark p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-forest" />
                    <p className="font-mono text-sm text-ink/50">{order.orderNumber}</p>
                  </div>
                  <span className="font-serif font-bold text-forest">{order.total.toLocaleString()}₮</span>
                </div>
                <div className="flex items-center justify-between text-sm text-ink/60">
                  <span>{order.customerName}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{new Date(order.createdAt).toLocaleDateString('mn-MN')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-gold text-gold" />
                  ))}
                  <span className="text-xs text-ink/40 ml-1">Хэрэглэгчийн үнэлгээ</span>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  )
}
