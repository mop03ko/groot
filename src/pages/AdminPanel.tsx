import { useState } from 'react'
import { Package, Users, Truck, BarChart2, ShoppingBag, TrendingUp, AlertCircle, CheckCircle, Clock, Edit2, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { DEMO_DRIVERS } from '../data/mockData'
import type { OrderStatus } from '../types'

type Tab = 'dashboard' | 'orders' | 'products' | 'customers' | 'delivery'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Хүлээгдэж байна',
  confirmed: 'Баталгаажсан',
  preparing: 'Бэлтгэж байна',
  delivering: 'Хүргэлтэнд гарсан',
  delivered: 'Хүргэгдсэн',
  cancelled: 'Цуцлагдсан',
}
const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    'bg-amber-50 text-amber-700 border-amber-200',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
  preparing:  'bg-purple-50 text-purple-700 border-purple-200',
  delivering: 'bg-lime/10 text-lime-700 border-lime/30',
  delivered:  'bg-forest/10 text-forest border-forest/20',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
}
const KANBAN_COLS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered']

export default function AdminPanel() {
  const { state, updateOrderStatus, toast } = useApp()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [orderSearch, setOrderSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')

  const user = state.user
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-center px-4">
        <div>
          <p className="font-serif text-xl text-ink mb-2">Хандах эрх байхгүй</p>
          <p className="text-sm text-ink/50">Зөвхөн администраторт зориулагдсан хэсэг</p>
        </div>
      </div>
    )
  }

  const orders = state.orders
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0)
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const deliveringCount = orders.filter(o => o.status === 'delivering').length
  const deliveredCount = orders.filter(o => o.status === 'delivered').length

  const filteredOrders = orders.filter(o =>
    orderSearch === '' ||
    o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customerName.toLowerCase().includes(orderSearch.toLowerCase())
  )

  const TABS = [
    { id: 'dashboard', label: 'Хяналтын самбар', icon: BarChart2 },
    { id: 'orders',    label: 'Захиалгууд',       icon: ShoppingBag },
    { id: 'products',  label: 'Бүтээгдэхүүн',    icon: Package },
    { id: 'customers', label: 'Хэрэглэгчид',      icon: Users },
    { id: 'delivery',  label: 'Хүргэлт',           icon: Truck },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-forest-dark text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <p className="label-mono text-white/40 mb-0.5">Groot.mn</p>
            <h1 className="font-serif font-bold text-xl">Удирдлагын самбар</h1>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-sm">
            <span className="w-2 h-2 bg-lime rounded-full pulse-dot" />
            <span className="label-mono text-white/70 text-xs">Шууд горим</span>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="bg-forest text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  tab === t.id
                    ? 'border-lime text-white'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Нийт орлого', value: `${totalRevenue.toLocaleString()}₮`, icon: TrendingUp, color: 'text-lime-dark', bg: 'bg-lime/10' },
                { label: 'Нийт захиалга', value: orders.length, icon: ShoppingBag, color: 'text-forest', bg: 'bg-forest/10' },
                { label: 'Хүлээгдэж буй', value: pendingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Хүргэгдсэн', value: deliveredCount, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-sm border border-cream-dark p-4">
                  <div className={`w-9 h-9 rounded-sm ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
                  </div>
                  <p className="font-serif font-bold text-2xl text-ink">{s.value}</p>
                  <p className="label-mono text-ink/40">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Revenue chart (SVG) */}
            <div className="bg-white rounded-sm border border-cream-dark p-5">
              <h2 className="font-serif font-semibold text-ink mb-4">Орлогын график</h2>
              <div className="overflow-x-auto">
                <svg viewBox="0 0 600 180" className="w-full min-w-[400px]" preserveAspectRatio="none">
                  {[0,25,50,75,100].map(pct => (
                    <line key={pct} x1="40" y1={160 - pct * 1.4} x2="590" y2={160 - pct * 1.4} stroke="#EDE8DC" strokeWidth="1" />
                  ))}
                  {['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'].map((day, i) => {
                    const vals = [45, 72, 58, 90, 65, 110, 85]
                    const h = vals[i] * 1.3
                    const x = 60 + i * 77
                    return (
                      <g key={day}>
                        <rect x={x - 18} y={160 - h} width={36} height={h} fill="#1A3A1F" rx="1" opacity="0.85" />
                        <text x={x} y={170} textAnchor="middle" className="font-mono" style={{ fontSize: 10, fill: '#1C1C1A80' }}>{day}</text>
                        <text x={x} y={160 - h - 4} textAnchor="middle" style={{ fontSize: 9, fill: '#7AB648', fontFamily: 'monospace' }}>{vals[i]}к</text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>

            {/* Recent orders */}
            <div className="bg-white rounded-sm border border-cream-dark p-5">
              <h2 className="font-serif font-semibold text-ink mb-4">Сүүлийн захиалгууд</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cream-dark">
                      <th className="label-mono text-left py-2 pr-4">Дугаар</th>
                      <th className="label-mono text-left py-2 pr-4">Хэрэглэгч</th>
                      <th className="label-mono text-left py-2 pr-4">Дүн</th>
                      <th className="label-mono text-left py-2">Төлөв</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream">
                    {orders.slice(0, 6).map(o => (
                      <tr key={o.id} className="hover:bg-cream/50 transition-colors">
                        <td className="py-2.5 pr-4 font-mono text-xs text-ink/60">{o.orderNumber}</td>
                        <td className="py-2.5 pr-4 font-medium text-ink">{o.customerName}</td>
                        <td className="py-2.5 pr-4 font-serif font-bold text-forest">{o.total.toLocaleString()}₮</td>
                        <td className="py-2.5">
                          <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded-sm border ${STATUS_COLORS[o.status]}`}>
                            {STATUS_LABELS[o.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif font-bold text-xl text-ink">Захиалгууд ({orders.length})</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                <input
                  placeholder="Хайх..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  className="border border-cream-dark bg-white rounded-sm pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime"
                />
              </div>
            </div>
            <div className="bg-white rounded-sm border border-cream-dark overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-cream border-b border-cream-dark">
                    <tr>
                      {['Дугаар', 'Хэрэглэгч', 'Утас', 'Дүн', 'Хүргэлт', 'Төлөв', 'Үйлдэл'].map(h => (
                        <th key={h} className="label-mono text-left px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream">
                    {filteredOrders.map(o => (
                      <tr key={o.id} className="hover:bg-cream/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-ink/60">{o.orderNumber}</td>
                        <td className="px-4 py-3 font-medium text-ink">{o.customerName}</td>
                        <td className="px-4 py-3 text-ink/60">{o.customerPhone}</td>
                        <td className="px-4 py-3 font-serif font-bold text-forest">{o.total.toLocaleString()}₮</td>
                        <td className="px-4 py-3 text-ink/60">{o.deliveryFee === 0 ? <span className="text-lime-dark">Үнэгүй</span> : `${o.deliveryFee.toLocaleString()}₮`}</td>
                        <td className="px-4 py-3">
                          <select
                            value={o.status}
                            onChange={e => { updateOrderStatus(o.id, e.target.value as OrderStatus); toast('Захиалгын төлөв шинэчлэгдлээ', 'success') }}
                            className={`text-xs font-mono uppercase border rounded-sm px-2 py-1 ${STATUS_COLORS[o.status]} focus:outline-none`}
                          >
                            {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(s => (
                              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-ink/30 hover:text-forest transition-colors"><Edit2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif font-bold text-xl text-ink">Бүтээгдэхүүн ({state.products.length})</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                  <input
                    placeholder="Хайх..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="border border-cream-dark bg-white rounded-sm pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime"
                  />
                </div>
                <button className="btn-forest text-sm px-4 py-2">+ Нэмэх</button>
              </div>
            </div>
            <div className="bg-white rounded-sm border border-cream-dark overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-cream border-b border-cream-dark">
                    <tr>
                      {['Бүтээгдэхүүн', 'Ангилал', 'Үнэ', 'Нөөц', 'Үнэлгээ', 'Төлөв', ''].map(h => (
                        <th key={h} className="label-mono text-left px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream">
                    {state.products
                      .filter(p => productSearch === '' || p.name.toLowerCase().includes(productSearch.toLowerCase()))
                      .map(p => (
                        <tr key={p.id} className="hover:bg-cream/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{p.emoji}</span>
                              <div>
                                <p className="font-medium text-ink">{p.name}</p>
                                <p className="text-xs text-ink/40">{p.nameEn}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 label-mono text-ink/50">{p.category}</td>
                          <td className="px-4 py-3 font-serif font-bold text-forest">{p.price.toLocaleString()}₮/{p.unit}</td>
                          <td className="px-4 py-3">
                            <span className={`font-mono font-bold ${p.stock === 0 ? 'text-red-500' : p.stock <= 20 ? 'text-amber-500' : 'text-forest'}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-ink/60">⭐ {p.rating}</td>
                          <td className="px-4 py-3">
                            {p.stock === 0 ? (
                              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-sm border bg-red-50 text-red-600 border-red-200">Дууссан</span>
                            ) : p.stock <= 20 ? (
                              <span className="badge-limited">Бага</span>
                            ) : (
                              <span className="badge-fresh">Бэлэн</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-ink/30 hover:text-forest transition-colors"><Edit2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMERS */}
        {tab === 'customers' && (
          <div className="space-y-4">
            <h2 className="font-serif font-bold text-xl text-ink mb-2">Хэрэглэгчид</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Нийт хэрэглэгч', value: '1,247', icon: Users },
                { label: 'Шинэ (7 хоног)', value: '34', icon: TrendingUp },
                { label: 'Идэвхтэй', value: '892', icon: CheckCircle },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-sm border border-cream-dark p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm bg-forest/10 flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-forest" />
                  </div>
                  <div>
                    <p className="font-serif font-bold text-xl text-ink">{s.value}</p>
                    <p className="label-mono text-ink/40">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-sm border border-cream-dark overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-cream border-b border-cream-dark">
                    <tr>
                      {['Хэрэглэгч', 'Утас', 'Захиалга', 'Нийт дүн', 'Урамшуулал'].map(h => (
                        <th key={h} className="label-mono text-left px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream">
                    {[
                      { name: 'Батбаяр Д.', phone: '9900-1234', orders: 12, total: 156000, pts: 3450 },
                      { name: 'Одгэрэл Б.', phone: '9900-5678', orders: 8, total: 94000, pts: 1820 },
                      { name: 'Мөнхбаяр С.', phone: '9900-9999', orders: 5, total: 61000, pts: 980 },
                      { name: 'Сарантуяа Г.', phone: '9900-3344', orders: 21, total: 287000, pts: 7240 },
                    ].map(c => (
                      <tr key={c.phone} className="hover:bg-cream/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                        <td className="px-4 py-3 text-ink/60">{c.phone}</td>
                        <td className="px-4 py-3 font-bold text-ink">{c.orders}</td>
                        <td className="px-4 py-3 font-serif font-bold text-forest">{c.total.toLocaleString()}₮</td>
                        <td className="px-4 py-3">
                          <span className="badge-fresh">{c.pts.toLocaleString()} оноо</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DELIVERY — Kanban */}
        {tab === 'delivery' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif font-bold text-xl text-ink">Хүргэлтийн удирдлага</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-lime rounded-full pulse-dot" />
                <span className="label-mono text-ink/40">Шууд горим</span>
              </div>
            </div>

            {/* Drivers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {DEMO_DRIVERS.map(d => (
                <div key={d.id} className="bg-white rounded-sm border border-cream-dark p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-ink">{d.name}</p>
                    <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded-sm border ${
                      d.status === 'available' ? 'bg-lime/10 text-lime-dark border-lime/30' :
                      d.status === 'delivering' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {d.status === 'available' ? 'Бэлэн' : d.status === 'delivering' ? 'Хүргэлтэнд' : 'Офлайн'}
                    </span>
                  </div>
                  <p className="text-xs text-ink/50 mb-1">{d.vehicle}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink/60">Өнөөдөр: <strong>{d.completedToday}</strong> хүргэлт</span>
                    <span className="text-gold">⭐ {d.rating}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Kanban board */}
            <div className="flex gap-3 overflow-x-auto pb-4">
              {KANBAN_COLS.map(col => {
                const colOrders = orders.filter(o => o.status === col)
                return (
                  <div key={col} className="min-w-56 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-mono uppercase px-2 py-1 rounded-sm border ${STATUS_COLORS[col]}`}>
                        {STATUS_LABELS[col]}
                      </span>
                      <span className="label-mono text-ink/40">{colOrders.length}</span>
                    </div>
                    <div className="space-y-2">
                      {colOrders.map(o => (
                        <div key={o.id} className="bg-white rounded-sm border border-cream-dark p-3 text-xs">
                          <p className="font-mono text-ink/50 mb-1">{o.orderNumber}</p>
                          <p className="font-semibold text-ink mb-1">{o.customerName}</p>
                          <p className="text-ink/50">{o.items.length} бараа · {o.total.toLocaleString()}₮</p>
                          {col !== 'delivered' && (
                            <button
                              onClick={() => {
                                const next = KANBAN_COLS[KANBAN_COLS.indexOf(col) + 1]
                                if (next) { updateOrderStatus(o.id, next); toast('Төлөв шинэчлэгдлээ', 'success') }
                              }}
                              className="mt-2 w-full bg-forest/5 hover:bg-forest/10 text-forest text-xs py-1.5 rounded-sm transition-colors font-medium"
                            >
                              Дараагийн алхам →
                            </button>
                          )}
                        </div>
                      ))}
                      {colOrders.length === 0 && (
                        <div className="border-2 border-dashed border-cream-dark rounded-sm py-6 text-center label-mono text-ink/20">
                          Хоосон
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
