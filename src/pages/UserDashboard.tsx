import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, MapPin, User, Star, Heart, ShoppingBag, Clock, CheckCircle, Truck, XCircle, ChevronRight, Edit2, Trash2, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { OrderStatus, Address } from '../types'

const UB_DISTRICTS = [
  'Баянзүрх дүүрэг', 'Сүхбаатар дүүрэг', 'Хан-Уул дүүрэг', 'Баянгол дүүрэг',
  'Чингэлтэй дүүрэг', 'Налайх дүүрэг', 'Сонгинохайрхан дүүрэг', 'Багануур дүүрэг', 'Багахангай дүүрэг',
]

type AddrForm = { label: string; district: string; khoroo: string; street: string; building: string; isDefault: boolean }
const EMPTY_ADDR: AddrForm = { label: 'Гэр', district: UB_DISTRICTS[0], khoroo: '', street: '', building: '', isDefault: false }

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: typeof Package }> = {
  pending:    { label: 'Хүлээгдэж байна', color: 'text-amber-600 bg-amber-50 border-amber-200',    icon: Clock },
  confirmed:  { label: 'Баталгаажсан',    color: 'text-blue-600 bg-blue-50 border-blue-200',       icon: CheckCircle },
  preparing:  { label: 'Бэлтгэж байна',   color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Package },
  delivering: { label: 'Хүргэлтэнд гарсан', color: 'text-lime-700 bg-lime/10 border-lime/30',     icon: Truck },
  delivered:  { label: 'Хүргэгдсэн',      color: 'text-forest bg-forest/10 border-forest/20',     icon: CheckCircle },
  cancelled:  { label: 'Цуцлагдсан',      color: 'text-red-600 bg-red-50 border-red-200',         icon: XCircle },
}

const TIER_CONFIG = [
  { min: 0,     max: 999,   name: 'Ногоон',   color: 'text-lime-dark',  pct: 0 },
  { min: 1000,  max: 4999,  name: 'Мөнгөн',   color: 'text-gray-500',   pct: 25 },
  { min: 5000,  max: 9999,  name: 'Алтан',    color: 'text-gold',       pct: 50 },
  { min: 10000, max: Infinity, name: 'Платинум', color: 'text-forest',  pct: 100 },
]

function getTier(pts: number) {
  return TIER_CONFIG.find(t => pts >= t.min && pts <= t.max) ?? TIER_CONFIG[0]
}

type Tab = 'overview' | 'orders' | 'profile' | 'addresses' | 'favorites' | 'loyalty'

export default function UserDashboard() {
  const { state, myOrders, addAddress, updateAddress, deleteAddress, toast } = useApp()
  const [tab, setTab] = useState<Tab>('overview')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [addrEditId, setAddrEditId] = useState<string | 'new' | null>(null)
  const [addrForm, setAddrForm] = useState<AddrForm>(EMPTY_ADDR)

  function openNewAddr() {
    setAddrForm(EMPTY_ADDR)
    setAddrEditId('new')
  }

  function openEditAddr(addr: Address) {
    setAddrForm({ label: addr.label, district: addr.district, khoroo: addr.khoroo, street: addr.street, building: addr.building, isDefault: addr.isDefault })
    setAddrEditId(addr.id)
  }

  function handleSaveAddr() {
    if (!addrForm.building.trim()) { toast('Байр/тоотыг бөглөнө үү', 'error'); return }
    if (addrEditId === 'new') {
      const newAddr: Address = { id: `addr_${Date.now()}`, ...addrForm }
      addAddress(newAddr)
      toast('Хаяг нэмэгдлээ', 'success')
    } else if (addrEditId) {
      updateAddress({ id: addrEditId, ...addrForm })
      toast('Хаяг шинэчлэгдлээ', 'success')
    }
    setAddrEditId(null)
  }

  function af(key: keyof AddrForm, val: string | boolean) {
    setAddrForm(f => ({ ...f, [key]: val }))
  }

  const user = state.user
  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-center px-4">
        <div>
          <p className="font-serif text-xl text-ink mb-4">Нэвтрэх шаардлагатай</p>
          <Link to="/login" className="btn-forest">Нэвтрэх</Link>
        </div>
      </div>
    )
  }

  const tier = getTier(user.loyaltyPoints)
  const nextTier = TIER_CONFIG.find(t => t.min > user.loyaltyPoints)
  const tierProgress = nextTier
    ? ((user.loyaltyPoints - tier.min) / (tier.max - tier.min)) * 100
    : 100

  const TABS = [
    { id: 'overview',   label: 'Ерөнхий',      icon: ShoppingBag },
    { id: 'orders',     label: 'Захиалгууд',    icon: Package },
    { id: 'profile',    label: 'Профайл',       icon: User },
    { id: 'addresses',  label: 'Хаяг',          icon: MapPin },
    { id: 'favorites',  label: 'Дуртай',        icon: Heart },
    { id: 'loyalty',    label: 'Урамшуулал',    icon: Star },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-forest text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-white/10 flex items-center justify-center text-2xl">{user.avatar}</div>
          <div>
            <h1 className="font-serif font-bold text-xl">{user.name}</h1>
            <p className="label-mono text-white/50">{user.phone}</p>
          </div>
          <div className={`ml-auto px-3 py-1.5 rounded-sm bg-white/10 border border-white/20 label-mono ${tier.color.replace('text-', 'text-').replace('bg-', '')}`}>
            <span className="text-white">{tier.name} гишүүн</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-48 shrink-0">
            <nav className="bg-white rounded-sm border border-cream-dark overflow-hidden">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as Tab)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
                    tab === t.id
                      ? 'bg-forest/5 border-forest text-forest'
                      : 'border-transparent text-ink/60 hover:bg-cream hover:text-ink'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">

            {/* Overview */}
            {tab === 'overview' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Нийт захиалга', value: myOrders.length, icon: '📦' },
                    { label: 'Хүргэгдсэн', value: myOrders.filter(o => o.status === 'delivered').length, icon: '✅' },
                    { label: 'Идэвхтэй', value: myOrders.filter(o => !['delivered','cancelled'].includes(o.status)).length, icon: '🚚' },
                    { label: 'Урамшуулал', value: `${user.loyaltyPoints.toLocaleString()} оноо`, icon: '⭐' },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-sm border border-cream-dark p-4">
                      <span className="text-2xl block mb-2">{s.icon}</span>
                      <p className="font-serif font-bold text-forest text-xl">{s.value}</p>
                      <p className="label-mono text-ink/40">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent orders */}
                <div className="bg-white rounded-sm border border-cream-dark p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif font-semibold text-ink">Сүүлийн захиалгууд</h2>
                    <button onClick={() => setTab('orders')} className="text-sm text-forest hover:text-lime flex items-center gap-1 transition-colors">
                      Бүгдийг харах <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  {myOrders.slice(0, 3).map(order => {
                    const cfg = STATUS_CONFIG[order.status]
                    return (
                      <div key={order.id} className="flex items-center justify-between py-3 border-b border-cream last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{order.items[0]?.emoji}</span>
                          <div>
                            <p className="font-mono text-sm text-ink font-semibold">{order.orderNumber}</p>
                            <p className="text-xs text-ink/50">{order.items.length} бүтээгдэхүүн · {order.total.toLocaleString()}₮</p>
                          </div>
                        </div>
                        <span className={`text-xs font-mono uppercase px-2 py-1 rounded-sm border ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    )
                  })}
                  {myOrders.length === 0 && <p className="text-sm text-ink/50 py-4 text-center">Захиалга байхгүй байна</p>}
                </div>
              </div>
            )}

            {/* Orders */}
            {tab === 'orders' && (
              <div className="space-y-3">
                <h2 className="font-serif font-bold text-xl text-ink mb-4">Захиалгын түүх</h2>
                {myOrders.length === 0 ? (
                  <div className="bg-white rounded-sm border border-cream-dark p-10 text-center">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="font-serif text-lg text-ink mb-1">Захиалга байхгүй</p>
                    <p className="text-sm text-ink/50 mb-4">Анхны захиалгаа өгцгөөе!</p>
                    <Link to="/shop" className="btn-forest text-sm">Дэлгүүр рүү явах</Link>
                  </div>
                ) : (
                  myOrders.map(order => {
                    const cfg = STATUS_CONFIG[order.status]
                    const Icon = cfg.icon
                    const isExpanded = expandedOrder === order.id
                    return (
                      <div key={order.id} className="bg-white rounded-sm border border-cream-dark overflow-hidden">
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-cream/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-1">
                              {order.items.slice(0, 3).map((item, i) => (
                                <span key={i} className="text-xl">{item.emoji}</span>
                              ))}
                            </div>
                            <div className="text-left">
                              <p className="font-mono font-semibold text-sm text-ink">{order.orderNumber}</p>
                              <p className="text-xs text-ink/50">{new Date(order.createdAt).toLocaleDateString('mn-MN')} · {order.total.toLocaleString()}₮</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-mono uppercase px-2 py-1 rounded-sm border ${cfg.color} flex items-center gap-1`}>
                              <Icon className="w-3 h-3" /> {cfg.label}
                            </span>
                            <ChevronRight className={`w-4 h-4 text-ink/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-cream-dark px-4 pb-4">
                            {/* Timeline */}
                            <div className="flex items-center gap-1 my-4 overflow-x-auto pb-2">
                              {order.timeline.map((t, i) => (
                                <div key={i} className="flex items-center gap-1 shrink-0">
                                  <div className={`flex flex-col items-center`}>
                                    <div className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold ${t.done ? 'bg-forest text-white' : 'bg-cream-dark text-ink/30'}`}>
                                      {t.done ? '✓' : i + 1}
                                    </div>
                                    <span className="label-mono text-ink/40 mt-1 text-center w-16">{t.label}</span>
                                  </div>
                                  {i < order.timeline.length - 1 && (
                                    <div className={`w-8 h-px ${t.done ? 'bg-forest' : 'bg-cream-dark'} shrink-0 mb-5`} />
                                  )}
                                </div>
                              ))}
                            </div>
                            {/* Items */}
                            <div className="space-y-1">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-sm py-1">
                                  <span className="flex items-center gap-2 text-ink/70">
                                    <span>{item.emoji}</span> {item.productName} × {item.quantity} {item.unit}
                                  </span>
                                  <span className="font-medium text-ink">{item.subtotal.toLocaleString()}₮</span>
                                </div>
                              ))}
                            </div>
                            {order.driverName && (
                              <div className="mt-3 pt-3 border-t border-cream text-xs text-ink/50 flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5" /> Жолооч: {order.driverName} · {order.driverPhone}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* Profile */}
            {tab === 'profile' && (
              <div className="bg-white rounded-sm border border-cream-dark p-6">
                <h2 className="font-serif font-bold text-xl text-ink mb-6">Профайл мэдээлэл</h2>
                <div className="space-y-4 max-w-sm">
                  {[
                    { label: 'Нэр', value: user.name },
                    { label: 'Утасны дугаар', value: user.phone },
                    { label: 'И-мэйл', value: user.email },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="label-mono text-ink/50 block mb-1">{f.label}</label>
                      <div className="flex items-center justify-between bg-cream border border-cream-dark rounded-sm px-3 py-2.5">
                        <span className="text-sm text-ink">{f.value}</span>
                        <button className="text-ink/30 hover:text-forest transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                  <button className="btn-forest w-full mt-2">Хадгалах</button>
                </div>
              </div>
            )}

            {/* Addresses */}
            {tab === 'addresses' && (
              <div className="space-y-3">
                <h2 className="font-serif font-bold text-xl text-ink mb-4">Хадгалагдсан хаягууд</h2>

                {/* Inline add/edit form */}
                {addrEditId !== null && (
                  <div className="bg-white rounded-sm border border-forest p-5">
                    <h3 className="font-serif font-semibold text-ink mb-4">{addrEditId === 'new' ? 'Шинэ хаяг нэмэх' : 'Хаяг засах'}</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label-mono text-ink/50 block mb-1">Шошго</label>
                          <input value={addrForm.label} onChange={e => af('label', e.target.value)}
                            className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="Гэр" />
                        </div>
                        <div>
                          <label className="label-mono text-ink/50 block mb-1">Дүүрэг</label>
                          <select value={addrForm.district} onChange={e => af('district', e.target.value)}
                            className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime">
                            {UB_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="label-mono text-ink/50 block mb-1">Хороо</label>
                        <input value={addrForm.khoroo} onChange={e => af('khoroo', e.target.value)}
                          className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="1-р хороо" />
                      </div>
                      <div>
                        <label className="label-mono text-ink/50 block mb-1">Гудамж / Хэсэг</label>
                        <input value={addrForm.street} onChange={e => af('street', e.target.value)}
                          className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="Энхтайвны өргөн чөлөө" />
                      </div>
                      <div>
                        <label className="label-mono text-ink/50 block mb-1">Байр / Тоот</label>
                        <input value={addrForm.building} onChange={e => af('building', e.target.value)}
                          className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="23-р байр, 45-р тоот" />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={addrForm.isDefault} onChange={e => af('isDefault', e.target.checked)} className="accent-lime" />
                        <span className="text-sm text-ink">Үндсэн хаяг болгох</span>
                      </label>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => setAddrEditId(null)} className="btn-outline flex-1 py-2">Болих</button>
                      <button onClick={handleSaveAddr} className="btn-forest flex-1 py-2">Хадгалах</button>
                    </div>
                  </div>
                )}

                {user.addresses.map(addr => (
                  <div key={addr.id} className="bg-white rounded-sm border border-cream-dark p-4 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-sm bg-forest/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-forest" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-ink text-sm">{addr.label}</p>
                          {addr.isDefault && <span className="badge-fresh text-xs">Үндсэн</span>}
                        </div>
                        <p className="text-xs text-ink/60">{addr.district}, {addr.khoroo}</p>
                        <p className="text-xs text-ink/60">{addr.street}, {addr.building}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditAddr(addr)} className="text-ink/30 hover:text-forest transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => { deleteAddress(addr.id); toast('Хаяг устгагдлаа', 'info') }} className="text-ink/30 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}

                {user.addresses.length === 0 && addrEditId === null && (
                  <div className="bg-white rounded-sm border border-cream-dark p-8 text-center">
                    <p className="text-3xl mb-3">📍</p>
                    <p className="font-serif text-lg text-ink mb-1">Хаяг байхгүй</p>
                    <p className="text-sm text-ink/50">Доорх товчоор хаяг нэмнэ үү</p>
                  </div>
                )}

                {addrEditId === null && (
                  <button onClick={openNewAddr} className="btn-outline w-full py-2.5 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Хаяг нэмэх
                  </button>
                )}
              </div>
            )}

            {/* Favorites */}
            {tab === 'favorites' && (
              <div>
                <h2 className="font-serif font-bold text-xl text-ink mb-4">Дуртай бүтээгдэхүүн</h2>
                {user.favoriteIds.length === 0 ? (
                  <div className="bg-white rounded-sm border border-cream-dark p-10 text-center">
                    <p className="text-4xl mb-3">🤍</p>
                    <p className="font-serif text-lg text-ink mb-1">Дуртай бүтээгдэхүүн байхгүй</p>
                    <p className="text-sm text-ink/50 mb-4">Бүтээгдэхүүний зүрхний товч дарж нэмнэ</p>
                    <Link to="/shop" className="btn-forest text-sm">Дэлгүүр рүү явах</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {state.products.filter(p => user.favoriteIds.includes(p.id)).map(p => (
                      <div key={p.id} className="card p-3 flex items-center gap-3">
                        <span className="text-3xl">{p.emoji}</span>
                        <div>
                          <p className="font-semibold text-sm text-ink">{p.name}</p>
                          <p className="font-serif font-bold text-forest text-sm">{p.price.toLocaleString()}₮/{p.unit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Loyalty */}
            {tab === 'loyalty' && (
              <div className="space-y-4">
                <h2 className="font-serif font-bold text-xl text-ink mb-2">Урамшуулалын хөтөлбөр</h2>
                {/* Card */}
                <div className="bg-forest text-white rounded-sm p-6 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                  <div className="relative">
                    <p className="label-mono text-white/50 mb-4">Урамшуулалын карт</p>
                    <p className="font-serif text-4xl font-bold text-lime">{user.loyaltyPoints.toLocaleString()}</p>
                    <p className="label-mono text-white/50 mb-6">оноо</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-serif font-bold text-xl ${tier.color}`}>{tier.name} гишүүн</p>
                        {nextTier && <p className="text-xs text-white/40">{nextTier.name} болоход {(nextTier.min - user.loyaltyPoints).toLocaleString()} оноо дутуу</p>}
                      </div>
                      <p className="font-mono text-white/60">{user.name}</p>
                    </div>
                    {nextTier && (
                      <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-lime rounded-full" style={{ width: `${tierProgress}%` }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Tiers */}
                <div className="grid grid-cols-2 gap-3">
                  {TIER_CONFIG.map(t => (
                    <div key={t.name} className={`bg-white rounded-sm border p-4 ${user.loyaltyPoints >= t.min ? 'border-forest' : 'border-cream-dark opacity-50'}`}>
                      <p className={`font-serif font-bold text-lg ${t.color}`}>{t.name}</p>
                      <p className="label-mono text-ink/40 text-xs">{t.min.toLocaleString()}+ оноо</p>
                      {user.loyaltyPoints >= t.min && <span className="badge-fresh text-xs mt-2">✓ Идэвхтэй</span>}
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-sm border border-cream-dark p-4 text-sm text-ink/60">
                  <p className="font-semibold text-ink mb-2">Хэрхэн оноо авдаг вэ?</p>
                  <p>• Захиалга бүрт 100₮ тутамд 1 оноо авдаг</p>
                  <p>• 100 оноо = 100₮ хөнгөлөлт</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
