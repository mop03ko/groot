import { useState, useRef } from 'react'
import { Package, Users, Truck, BarChart2, ShoppingBag, TrendingUp, CheckCircle, Clock, Edit2, Search, X, Plus, Trash2, Tag, MapPin, Settings, Building2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { OrderStatus, ProductVariant, Driver, DiscountCode } from '../types'

type Tab = 'dashboard' | 'orders' | 'products' | 'categories' | 'customers' | 'delivery' | 'discounts' | 'settings'

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

type ProductForm = {
  name: string; nameEn: string; emoji: string; image: string
  category: string; price: string; unit: string; stock: string
  description: string; origin: string; discount: string; isOrganic: boolean
  packagedAt: string; certifiedAt: string
  variants: ProductVariant[]
  bgGradient: string; isFeatured: boolean
  wholesalePrice: string; minWholesaleQty: string; freeDelivery: boolean
}

const EMPTY_FORM: ProductForm = {
  name: '', nameEn: '', emoji: '🥕', image: '',
  category: 'vegetable', price: '', unit: 'кг', stock: '',
  description: '', origin: '', discount: '', isOrganic: false,
  packagedAt: '', certifiedAt: '', variants: [],
  bgGradient: 'from-green-50 to-green-100', isFeatured: false,
  wholesalePrice: '', minWholesaleQty: '', freeDelivery: false,
}

type DriverForm = { name: string; phone: string; vehicle: string }
const EMPTY_DRIVER: DriverForm = { name: '', phone: '', vehicle: '' }

// Driver assignment modal state
type AssignState = { orderId: string; orderNum: string } | null

export default function AdminPanel() {
  const {
    state, updateOrderStatus, assignDriver, toast,
    addProduct, updateProduct, addDriver, addCategory, updateCategory, deleteCategory,
    addDiscountCode, updateDiscountCode, deleteDiscountCode,
    updateBankSettings, updateDeliveryZones,
  } = useApp()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [orderSearch, setOrderSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productForm, setProductForm] = useState<ProductForm>(EMPTY_FORM)
  const [showAddDriver, setShowAddDriver] = useState(false)
  const [driverForm, setDriverForm] = useState<DriverForm>(EMPTY_DRIVER)
  const [assignState, setAssignState] = useState<AssignState>(null)
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCatValue, setEditCatValue] = useState('')
  const [newCatValue, setNewCatValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Discount code form
  type DiscountForm = {
    code: string; type: 'percent' | 'amount'; value: string
    scope: 'all' | 'category' | 'products'
    categoryTarget: string; productIds: string
    usageLimit: string; expiresAt: string; isActive: boolean
  }
  const EMPTY_DISCOUNT: DiscountForm = {
    code: '', type: 'percent', value: '', scope: 'all',
    categoryTarget: '', productIds: '', usageLimit: '', expiresAt: '', isActive: true,
  }
  const [showDiscountForm, setShowDiscountForm] = useState(false)
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null)
  const [discountForm, setDiscountForm] = useState<DiscountForm>(EMPTY_DISCOUNT)
  const df = (key: keyof DiscountForm, val: string | boolean) =>
    setDiscountForm(f => ({ ...f, [key]: val }))

  // Settings
  const [bankEdit, setBankEdit] = useState(state.bankSettings)
  const [zoneEdits, setZoneEdits] = useState(state.deliveryZones)

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
  const deliveredCount = orders.filter(o => o.status === 'delivered').length

  const filteredOrders = orders.filter(o =>
    orderSearch === '' ||
    o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customerName.toLowerCase().includes(orderSearch.toLowerCase())
  )

  const TABS = [
    { id: 'dashboard',  label: 'Хяналтын самбар', icon: BarChart2 },
    { id: 'orders',     label: 'Захиалгууд',      icon: ShoppingBag },
    { id: 'products',   label: 'Бүтээгдэхүүн',   icon: Package },
    { id: 'categories', label: 'Ангилал',          icon: Tag },
    { id: 'customers',  label: 'Хэрэглэгчид',     icon: Users },
    { id: 'delivery',   label: 'Хүргэлт',          icon: Truck },
    { id: 'discounts',  label: 'Хөнгөлөлт',        icon: Tag },
    { id: 'settings',   label: 'Тохиргоо',         icon: Settings },
  ]

  // ── Product form helpers ──────────────────────────────────────────────────

  function openAddProduct() {
    setProductForm({ ...EMPTY_FORM, category: state.categories[0] ?? 'vegetable' })
    setEditingProductId(null)
    setShowAddProduct(true)
  }

  function openEditProduct(id: string) {
    const p = state.products.find(p => p.id === id)
    if (!p) return
    setProductForm({
      name: p.name, nameEn: p.nameEn, emoji: p.emoji, image: p.image ?? '',
      category: p.category, price: String(p.price), unit: p.unit,
      stock: String(p.stock), description: p.description, origin: p.origin,
      discount: p.discount ? String(p.discount) : '', isOrganic: p.isOrganic ?? false,
      packagedAt: p.packagedAt ?? '', certifiedAt: p.certifiedAt ?? '',
      variants: p.variants ? [...p.variants] : [],
      bgGradient: p.bgGradient || 'from-green-50 to-green-100',
      isFeatured: p.isFeatured ?? false,
      wholesalePrice: p.wholesalePrice ? String(p.wholesalePrice) : '',
      minWholesaleQty: p.minWholesaleQty ? String(p.minWholesaleQty) : '',
      freeDelivery: p.freeDelivery ?? false,
    })
    setEditingProductId(id)
    setShowAddProduct(true)
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => pf('image', (ev.target?.result as string) ?? '')
    reader.readAsDataURL(file)
  }

  function handleSaveProduct() {
    if (!productForm.name.trim() || !productForm.price || !productForm.stock) {
      toast('Нэр, үнэ, нөөцийг бөглөнө үү', 'error'); return
    }
    const base = {
      id: editingProductId ?? `p_${Date.now()}`,
      name: productForm.name.trim(),
      nameEn: productForm.nameEn.trim(),
      emoji: productForm.emoji,
      image: productForm.image || undefined,
      category: productForm.category,
      price: Number(productForm.price),
      unit: productForm.unit || 'кг',
      stock: Number(productForm.stock),
      description: productForm.description,
      origin: productForm.origin,
      discount: productForm.discount ? Number(productForm.discount) : undefined,
      isOrganic: productForm.isOrganic,
      isFeatured: productForm.isFeatured,
      bgGradient: productForm.bgGradient || 'from-green-50 to-green-100',
      rating: 5.0, reviews: 0,
      packagedAt: productForm.packagedAt || undefined,
      certifiedAt: productForm.certifiedAt || undefined,
      variants: productForm.variants.length > 0 ? productForm.variants : undefined,
      wholesalePrice: productForm.wholesalePrice ? Number(productForm.wholesalePrice) : undefined,
      minWholesaleQty: productForm.minWholesaleQty ? Number(productForm.minWholesaleQty) : undefined,
      freeDelivery: productForm.freeDelivery || undefined,
    }
    if (editingProductId) {
      updateProduct(base)
      toast('Бүтээгдэхүүн шинэчлэгдлээ', 'success')
    } else {
      addProduct(base)
      toast('Бүтээгдэхүүн нэмэгдлээ', 'success')
    }
    setShowAddProduct(false)
  }

  function pf(key: keyof ProductForm, val: string | boolean | ProductVariant[]) {
    setProductForm(f => ({ ...f, [key]: val }))
  }

  function addVariant() {
    const v: ProductVariant = { id: `v_${Date.now()}`, name: '', price: Number(productForm.price) || 0 }
    pf('variants', [...productForm.variants, v])
  }

  function updateVariant(id: string, field: 'name' | 'price', val: string) {
    pf('variants', productForm.variants.map(v => v.id === id ? { ...v, [field]: field === 'price' ? Number(val) : val } : v))
  }

  function removeVariant(id: string) {
    pf('variants', productForm.variants.filter(v => v.id !== id))
  }

  // ── Driver helpers ────────────────────────────────────────────────────────

  function handleAddDriver() {
    if (!driverForm.name.trim() || !driverForm.phone.trim()) { toast('Нэр, утасыг бөглөнө үү', 'error'); return }
    addDriver({
      id: `d_${Date.now()}`,
      name: driverForm.name.trim(),
      phone: driverForm.phone.trim(),
      vehicle: driverForm.vehicle.trim(),
      status: 'available',
      completedToday: 0,
      rating: 5.0,
    })
    setDriverForm(EMPTY_DRIVER)
    setShowAddDriver(false)
    toast('Жолооч нэмэгдлээ', 'success')
  }

  // ── Assign driver ─────────────────────────────────────────────────────────

  function handleAssign() {
    if (!assignState || !selectedDriverId) return
    const driver = state.drivers.find(d => d.id === selectedDriverId)
    if (!driver) return
    assignDriver(assignState.orderId, driver.id, driver.name, driver.phone)
    toast(`${driver.name} жолоочид хуваарилагдлаа`, 'success')
    setAssignState(null)
    setSelectedDriverId('')
  }

  const availableDrivers = state.drivers.filter(d => d.status === 'available')

  return (
    <div className="min-h-screen bg-cream">

      {/* Add/Edit Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-4" onClick={() => setShowAddProduct(false)}>
          <div className="bg-white rounded-sm border border-cream-dark w-full max-w-xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-cream-dark sticky top-0 bg-white z-10">
              <h3 className="font-serif font-semibold text-ink">{editingProductId ? 'Бүтээгдэхүүн засах' : 'Шинэ бүтээгдэхүүн нэмэх'}</h3>
              <button onClick={() => setShowAddProduct(false)} className="text-ink/30 hover:text-ink"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">

              {/* Image upload */}
              <div>
                <label className="label-mono text-ink/50 block mb-1.5">Зураг оруулах</label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-sm border border-cream-dark bg-cream flex items-center justify-center overflow-hidden shrink-0">
                    {productForm.image
                      ? <img src={productForm.image} alt="" className="w-full h-full object-cover" />
                      : <span className="text-3xl">{productForm.emoji}</span>
                    }
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <button onClick={() => fileInputRef.current?.click()} className="btn-outline text-sm py-1.5 w-full">Зураг сонгох</button>
                    {productForm.image && (
                      <button onClick={() => pf('image', '')} className="text-xs text-red-500 hover:text-red-700">Зураг устгах</button>
                    )}
                    <div className="flex items-center gap-2">
                      <input value={productForm.emoji} onChange={e => pf('emoji', e.target.value)}
                        className="w-16 border border-cream-dark rounded-sm px-2 py-1 text-center text-xl focus:outline-none focus:ring-2 focus:ring-lime" placeholder="🥕" />
                      <span className="text-xs text-ink/40">Emoji (зураг байхгүй үед)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-mono text-ink/50 block mb-1">Нэр (МН)</label>
                  <input value={productForm.name} onChange={e => pf('name', e.target.value)}
                    className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="Лууван" />
                </div>
                <div>
                  <label className="label-mono text-ink/50 block mb-1">Нэр (EN)</label>
                  <input value={productForm.nameEn} onChange={e => pf('nameEn', e.target.value)}
                    className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="Carrot" />
                </div>
              </div>

              <div>
                <label className="label-mono text-ink/50 block mb-1">Ангилал</label>
                <select value={productForm.category} onChange={e => pf('category', e.target.value)}
                  className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime">
                  {state.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label-mono text-ink/50 block mb-1">Үнэ (₮)</label>
                  <input type="number" min="0" value={productForm.price} onChange={e => pf('price', e.target.value)}
                    className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="1500" />
                </div>
                <div>
                  <label className="label-mono text-ink/50 block mb-1">Нэгж</label>
                  <input value={productForm.unit} onChange={e => pf('unit', e.target.value)}
                    className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="кг" />
                </div>
                <div>
                  <label className="label-mono text-ink/50 block mb-1">Нөөц</label>
                  <input type="number" min="0" value={productForm.stock} onChange={e => pf('stock', e.target.value)}
                    className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-mono text-ink/50 block mb-1">Гарал үүсэл</label>
                  <input value={productForm.origin} onChange={e => pf('origin', e.target.value)}
                    className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="Дархан" />
                </div>
                <div>
                  <label className="label-mono text-ink/50 block mb-1">Хөнгөлөлт (%)</label>
                  <input type="number" min="0" max="90" value={productForm.discount} onChange={e => pf('discount', e.target.value)}
                    className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="0" />
                </div>
              </div>

              {/* Packaged / certified dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-mono text-ink/50 block mb-1">Савласан огноо</label>
                  <input type="date" value={productForm.packagedAt} onChange={e => pf('packagedAt', e.target.value)}
                    className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" />
                </div>
                <div>
                  <label className="label-mono text-ink/50 block mb-1">Баталгаажуулсан огноо</label>
                  <input type="date" value={productForm.certifiedAt} onChange={e => pf('certifiedAt', e.target.value)}
                    className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" />
                </div>
              </div>

              <div>
                <label className="label-mono text-ink/50 block mb-1">Тайлбар</label>
                <textarea value={productForm.description} onChange={e => pf('description', e.target.value)} rows={2}
                  className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime resize-none" placeholder="Бүтээгдэхүүний тайлбар..." />
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={productForm.isOrganic} onChange={e => pf('isOrganic', e.target.checked)} className="accent-lime" />
                  <span className="text-sm text-ink">Органик бүтээгдэхүүн</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={productForm.freeDelivery} onChange={e => pf('freeDelivery', e.target.checked)} className="accent-lime" />
                  <span className="text-sm text-ink">Үнэгүй хүргэлт</span>
                </label>
              </div>

              {/* Wholesale price */}
              <div>
                <label className="label-mono text-ink/50 block mb-1.5">Бөөний үнэ (заавал биш)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input type="number" min="0" value={productForm.wholesalePrice} onChange={e => pf('wholesalePrice', e.target.value)}
                      className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="Бөөний үнэ (₮)" />
                  </div>
                  <div>
                    <input type="number" min="1" value={productForm.minWholesaleQty} onChange={e => pf('minWholesaleQty', e.target.value)}
                      className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="Мин. тоо хэмжээ" />
                  </div>
                </div>
                <p className="text-xs text-ink/30 mt-1">Тоо хэмжээ хүрсэн үед бөөний үнэ идэвхжинэ</p>
              </div>

              {/* Variants / Attributes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label-mono text-ink/50">Савлагааны сонголт (variants)</label>
                  <button onClick={addVariant} className="text-xs text-forest hover:text-lime flex items-center gap-1 font-medium">
                    <Plus className="w-3.5 h-3.5" /> Нэмэх
                  </button>
                </div>
                {productForm.variants.length === 0 && (
                  <p className="text-xs text-ink/30 py-2">Сонголт нэмэхгүй бол үндсэн үнэ ашиглагдана</p>
                )}
                <div className="space-y-2">
                  {productForm.variants.map(v => (
                    <div key={v.id} className="flex items-center gap-2">
                      <input
                        value={v.name}
                        onChange={e => updateVariant(v.id, 'name', e.target.value)}
                        placeholder="Жишээ: Хайрцагтай, Уутанд..."
                        className="flex-1 border border-cream-dark rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime"
                      />
                      <input
                        type="number" min="0"
                        value={v.price}
                        onChange={e => updateVariant(v.id, 'price', e.target.value)}
                        placeholder="Үнэ"
                        className="w-24 border border-cream-dark rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime"
                      />
                      <span className="text-sm text-ink/50">₮</span>
                      <button onClick={() => removeVariant(v.id)} className="text-ink/30 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-cream-dark sticky bottom-0 bg-white">
              <button onClick={() => setShowAddProduct(false)} className="btn-outline flex-1 py-2">Болих</button>
              <button onClick={handleSaveProduct} className="btn-forest flex-1 py-2 flex items-center justify-center gap-1">
                <Plus className="w-4 h-4" /> {editingProductId ? 'Хадгалах' : 'Нэмэх'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {assignState && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-4" onClick={() => setAssignState(null)}>
          <div className="bg-white rounded-sm border border-cream-dark w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif font-semibold text-ink mb-1">Жолооч сонгох</h3>
            <p className="text-xs text-ink/50 mb-4">{assignState.orderNum}</p>
            <div className="space-y-2 mb-4">
              {state.drivers.filter(d => d.status !== 'offline').map(d => (
                <label key={d.id} className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-colors ${selectedDriverId === d.id ? 'border-forest bg-forest/5' : 'border-cream-dark hover:border-forest/40'}`}>
                  <input type="radio" name="driver" value={d.id} checked={selectedDriverId === d.id} onChange={() => setSelectedDriverId(d.id)} className="accent-lime" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-ink">{d.name}</p>
                    <p className="text-xs text-ink/50">{d.vehicle}</p>
                  </div>
                  <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded-sm border ${d.status === 'available' ? 'bg-lime/10 text-lime-dark border-lime/30' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                    {d.status === 'available' ? 'Бэлэн' : 'Хүргэлтэнд'}
                  </span>
                </label>
              ))}
              {state.drivers.filter(d => d.status !== 'offline').length === 0 && (
                <p className="text-sm text-ink/50 text-center py-4">Бэлэн жолооч байхгүй байна</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setAssignState(null)} className="btn-outline flex-1 py-2">Болих</button>
              <button onClick={handleAssign} disabled={!selectedDriverId} className="btn-forest flex-1 py-2 disabled:opacity-40">Хуваарилах</button>
            </div>
          </div>
        </div>
      )}

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
                  tab === t.id ? 'border-lime text-white' : 'border-transparent text-white/50 hover:text-white'
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
                        <text x={x} y={170} textAnchor="middle" style={{ fontSize: 10, fill: '#1C1C1A80', fontFamily: 'monospace' }}>{day}</text>
                        <text x={x} y={160 - h - 4} textAnchor="middle" style={{ fontSize: 9, fill: '#7AB648', fontFamily: 'monospace' }}>{vals[i]}к</text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>

            <div className="bg-white rounded-sm border border-cream-dark p-5">
              <h2 className="font-serif font-semibold text-ink mb-4">Сүүлийн захиалгууд</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cream-dark">
                      <th className="label-mono text-left py-2 pr-4">Дугаар</th>
                      <th className="label-mono text-left py-2 pr-4">Хэрэглэгч</th>
                      <th className="label-mono text-left py-2 pr-4">Хаяг</th>
                      <th className="label-mono text-left py-2 pr-4">Дүн</th>
                      <th className="label-mono text-left py-2">Төлөв</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream">
                    {orders.slice(0, 6).map(o => (
                      <tr key={o.id} className="hover:bg-cream/50 transition-colors">
                        <td className="py-2.5 pr-4 font-mono text-xs text-ink/60">{o.orderNumber}</td>
                        <td className="py-2.5 pr-4 font-medium text-ink">{o.customerName}</td>
                        <td className="py-2.5 pr-4 text-xs text-ink/60">
                          <div className="flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{o.deliveryAddress.district}, {o.deliveryAddress.building}</div>
                        </td>
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
                <input placeholder="Хайх..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                  className="border border-cream-dark bg-white rounded-sm pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" />
              </div>
            </div>
            <div className="bg-white rounded-sm border border-cream-dark overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-cream border-b border-cream-dark">
                    <tr>
                      {['Дугаар', 'Хэрэглэгч', 'Утас', 'Хүргэх хаяг', 'Дүн', 'Хүргэлт', 'Төлөв', 'Үйлдэл'].map(h => (
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
                        <td className="px-4 py-3 text-xs text-ink/70 max-w-[180px]">
                          <div className="flex items-start gap-1">
                            <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-lime-dark" />
                            <span>{o.deliveryAddress.district}<br />{o.deliveryAddress.khoroo}, {o.deliveryAddress.building}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-serif font-bold text-forest">{o.total.toLocaleString()}₮</td>
                        <td className="px-4 py-3 text-ink/60">{o.deliveryFee === 0 ? <span className="text-lime-dark">Үнэгүй</span> : `${o.deliveryFee.toLocaleString()}₮`}</td>
                        <td className="px-4 py-3">
                          <select value={o.status} onChange={e => { updateOrderStatus(o.id, e.target.value as OrderStatus); toast('Төлөв шинэчлэгдлээ', 'success') }}
                            className={`text-xs font-mono uppercase border rounded-sm px-2 py-1 ${STATUS_COLORS[o.status]} focus:outline-none`}>
                            {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(s => (
                              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => { setAssignState({ orderId: o.id, orderNum: o.orderNumber }); setSelectedDriverId(o.driverId ?? '') }}
                            className="text-xs font-mono text-forest hover:text-lime border border-forest/30 hover:border-lime rounded-sm px-2 py-1 transition-colors whitespace-nowrap"
                            title="Жолооч сонгох"
                          >
                            {o.driverName ? `🚗 ${o.driverName}` : '+ Жолооч'}
                          </button>
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
                  <input placeholder="Хайх..." value={productSearch} onChange={e => setProductSearch(e.target.value)}
                    className="border border-cream-dark bg-white rounded-sm pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" />
                </div>
                <button onClick={openAddProduct} className="btn-forest text-sm px-4 py-2 flex items-center gap-1"><Plus className="w-4 h-4" /> Нэмэх</button>
              </div>
            </div>
            <div className="bg-white rounded-sm border border-cream-dark overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-cream border-b border-cream-dark">
                    <tr>
                      {['Бүтээгдэхүүн', 'Ангилал', 'Үнэ', 'Нөөц', 'Савласан', 'Баталгаа', 'Variants', 'Төлөв', ''].map(h => (
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
                              {p.image
                                ? <img src={p.image} alt={p.name} className="w-8 h-8 rounded-sm object-cover shrink-0" />
                                : <span className="text-xl">{p.emoji}</span>
                              }
                              <div>
                                <p className="font-medium text-ink">{p.name}</p>
                                <p className="text-xs text-ink/40">{p.nameEn}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 label-mono text-ink/50">{p.category}</td>
                          <td className="px-4 py-3 font-serif font-bold text-forest">{p.price.toLocaleString()}₮/{p.unit}</td>
                          <td className="px-4 py-3">
                            <span className={`font-mono font-bold ${p.stock === 0 ? 'text-red-500' : p.stock <= 20 ? 'text-amber-500' : 'text-forest'}`}>{p.stock}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-ink/50">{p.packagedAt ?? '—'}</td>
                          <td className="px-4 py-3 text-xs text-ink/50">{p.certifiedAt ?? '—'}</td>
                          <td className="px-4 py-3 text-xs text-ink/50">{p.variants ? `${p.variants.length} сонголт` : '—'}</td>
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
                            <button onClick={() => openEditProduct(p.id)} className="text-ink/30 hover:text-forest transition-colors"><Edit2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORIES */}
        {tab === 'categories' && (
          <div className="space-y-4 max-w-lg">
            <h2 className="font-serif font-bold text-xl text-ink mb-4">Ангилал удирдах</h2>
            <div className="bg-white rounded-sm border border-cream-dark overflow-hidden">
              {state.categories.map(cat => (
                <div key={cat} className="flex items-center gap-3 px-4 py-3 border-b border-cream last:border-0">
                  {editingCategory === cat ? (
                    <>
                      <input value={editCatValue} onChange={e => setEditCatValue(e.target.value)}
                        className="flex-1 border border-cream-dark rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime" />
                      <button onClick={() => { updateCategory(cat, editCatValue.trim()); setEditingCategory(null); toast('Ангилал шинэчлэгдлээ', 'success') }}
                        className="text-xs btn-forest px-3 py-1.5">Хадгалах</button>
                      <button onClick={() => setEditingCategory(null)} className="text-xs btn-outline px-3 py-1.5">Болих</button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium text-ink">{cat}</span>
                      <button onClick={() => { setEditingCategory(cat); setEditCatValue(cat) }} className="text-ink/30 hover:text-forest"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => { deleteCategory(cat); toast('Ангилал устгагдлаа', 'info') }} className="text-ink/30 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="bg-white rounded-sm border border-cream-dark p-4">
              <p className="label-mono text-ink/50 mb-2">Шинэ ангилал нэмэх</p>
              <div className="flex gap-2">
                <input value={newCatValue} onChange={e => setNewCatValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newCatValue.trim()) { addCategory(newCatValue.trim()); setNewCatValue(''); toast('Ангилал нэмэгдлээ', 'success') } }}
                  placeholder="Ангилалын нэр..." className="flex-1 border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" />
                <button onClick={() => { if (newCatValue.trim()) { addCategory(newCatValue.trim()); setNewCatValue(''); toast('Ангилал нэмэгдлээ', 'success') } }}
                  className="btn-forest px-4 py-2 flex items-center gap-1 text-sm"><Plus className="w-4 h-4" /> Нэмэх</button>
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
                        <td className="px-4 py-3"><span className="badge-fresh">{c.pts.toLocaleString()} оноо</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DELIVERY */}
        {tab === 'delivery' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif font-bold text-xl text-ink">Хүргэлтийн удирдлага</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowAddDriver(v => !v)} className="btn-outline text-sm px-4 py-2 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Жолооч нэмэх
                </button>
                <span className="label-mono text-ink/40 flex items-center gap-1"><span className="w-2 h-2 bg-lime rounded-full pulse-dot inline-block" />Шууд горим</span>
              </div>
            </div>

            {/* Add Driver Form */}
            {showAddDriver && (
              <div className="bg-white rounded-sm border border-forest p-5">
                <h3 className="font-serif font-semibold text-ink mb-4">Шинэ жолооч нэмэх</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="label-mono text-ink/50 block mb-1">Нэр</label>
                    <input value={driverForm.name} onChange={e => setDriverForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="Батаа Жолооч" />
                  </div>
                  <div>
                    <label className="label-mono text-ink/50 block mb-1">Утас</label>
                    <input value={driverForm.phone} onChange={e => setDriverForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="99001234" />
                  </div>
                  <div>
                    <label className="label-mono text-ink/50 block mb-1">Машин</label>
                    <input value={driverForm.vehicle} onChange={e => setDriverForm(f => ({ ...f, vehicle: e.target.value }))}
                      className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="Toyota Prius 1234УБА" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowAddDriver(false)} className="btn-outline px-4 py-2 text-sm">Болих</button>
                  <button onClick={handleAddDriver} className="btn-forest px-4 py-2 text-sm flex items-center gap-1"><Plus className="w-4 h-4" />Нэмэх</button>
                </div>
              </div>
            )}

            {/* Drivers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {state.drivers.map(d => (
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
                  <p className="text-xs text-ink/50 mb-1">{d.vehicle || '—'}</p>
                  <p className="text-xs text-ink/50 mb-1">{d.phone}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink/60">Өнөөдөр: <strong>{d.completedToday}</strong></span>
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
                      <span className={`text-xs font-mono uppercase px-2 py-1 rounded-sm border ${STATUS_COLORS[col]}`}>{STATUS_LABELS[col]}</span>
                      <span className="label-mono text-ink/40">{colOrders.length}</span>
                    </div>
                    <div className="space-y-2">
                      {colOrders.map(o => (
                        <div key={o.id} className="bg-white rounded-sm border border-cream-dark p-3 text-xs">
                          <p className="font-mono text-ink/50 mb-1">{o.orderNumber}</p>
                          <p className="font-semibold text-ink mb-1">{o.customerName}</p>
                          <p className="text-ink/50 mb-1">{o.items.length} бараа · {o.total.toLocaleString()}₮</p>
                          <p className="text-ink/40 flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3 shrink-0" />{o.deliveryAddress.district}
                          </p>
                          {o.driverName && <p className="text-blue-600 mb-1">🚗 {o.driverName}</p>}
                          {col === 'preparing' ? (
                            // Preparing → Delivering requires driver assignment
                            <button
                              onClick={() => { setAssignState({ orderId: o.id, orderNum: o.orderNumber }); setSelectedDriverId(o.driverId ?? '') }}
                              className="mt-1 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs py-1.5 rounded-sm transition-colors font-medium"
                            >
                              🚗 Жолооч сонгож хүргэлтэнд гаргах →
                            </button>
                          ) : col !== 'delivered' ? (
                            <button
                              onClick={() => {
                                const next = KANBAN_COLS[KANBAN_COLS.indexOf(col) + 1]
                                if (next) { updateOrderStatus(o.id, next); toast('Төлөв шинэчлэгдлээ', 'success') }
                              }}
                              className="mt-1 w-full bg-forest/5 hover:bg-forest/10 text-forest text-xs py-1.5 rounded-sm transition-colors font-medium"
                            >
                              Дараагийн алхам →
                            </button>
                          ) : null}
                        </div>
                      ))}
                      {colOrders.length === 0 && (
                        <div className="border-2 border-dashed border-cream-dark rounded-sm py-6 text-center label-mono text-ink/20">Хоосон</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* DISCOUNTS */}
        {tab === 'discounts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-xl text-ink">Хөнгөлөлтийн кодууд</h2>
              <button onClick={() => { setDiscountForm(EMPTY_DISCOUNT); setEditingDiscountId(null); setShowDiscountForm(true) }}
                className="btn-forest text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Код нэмэх
              </button>
            </div>

            {/* Discount code form */}
            {showDiscountForm && (
              <div className="bg-white rounded-sm border border-cream-dark p-5">
                <h3 className="font-serif font-semibold text-ink mb-4">{editingDiscountId ? 'Код засах' : 'Шинэ код нэмэх'}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-mono text-ink/50 block mb-1">Код</label>
                    <input value={discountForm.code} onChange={e => df('code', e.target.value.toUpperCase())}
                      className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-lime" placeholder="GROOT20" />
                  </div>
                  <div>
                    <label className="label-mono text-ink/50 block mb-1">Утга</label>
                    <input type="number" min="0" value={discountForm.value} onChange={e => df('value', e.target.value)}
                      className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="20" />
                  </div>
                  <div>
                    <label className="label-mono text-ink/50 block mb-1.5">Төрөл</label>
                    <div className="flex gap-3">
                      {([['percent', '% хувь'], ['amount', '₮ тоо']] as const).map(([v, l]) => (
                        <label key={v} className="flex items-center gap-1.5 cursor-pointer text-sm">
                          <input type="radio" name="dctype" value={v} checked={discountForm.type === v} onChange={() => df('type', v)} className="accent-lime" />
                          {l}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label-mono text-ink/50 block mb-1.5">Хамрах хүрээ</label>
                    <div className="flex gap-3 flex-wrap">
                      {([['all', 'Бүгд'], ['category', 'Ангилал'], ['products', 'Бүтээгдэхүүн']] as const).map(([v, l]) => (
                        <label key={v} className="flex items-center gap-1.5 cursor-pointer text-sm">
                          <input type="radio" name="dcscope" value={v} checked={discountForm.scope === v} onChange={() => df('scope', v)} className="accent-lime" />
                          {l}
                        </label>
                      ))}
                    </div>
                  </div>
                  {discountForm.scope === 'category' && (
                    <div>
                      <label className="label-mono text-ink/50 block mb-1">Ангилал сонгох</label>
                      <select value={discountForm.categoryTarget} onChange={e => df('categoryTarget', e.target.value)}
                        className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime">
                        {state.categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                  {discountForm.scope === 'products' && (
                    <div>
                      <label className="label-mono text-ink/50 block mb-1">Бүтээгдэхүүний ID (таслалаар)</label>
                      <input value={discountForm.productIds} onChange={e => df('productIds', e.target.value)}
                        className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="p1, p5, p13" />
                    </div>
                  )}
                  <div>
                    <label className="label-mono text-ink/50 block mb-1">Хэрэглэх лимит (заавал биш)</label>
                    <input type="number" min="1" value={discountForm.usageLimit} onChange={e => df('usageLimit', e.target.value)}
                      className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="100" />
                  </div>
                  <div>
                    <label className="label-mono text-ink/50 block mb-1">Дуусах огноо (заавал биш)</label>
                    <input type="date" value={discountForm.expiresAt} onChange={e => df('expiresAt', e.target.value)}
                      className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={discountForm.isActive} onChange={e => df('isActive', e.target.checked)} className="accent-lime" />
                      Идэвхтэй
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => {
                    if (!discountForm.code.trim() || !discountForm.value) { toast('Код, утгыг бөглөнө үү', 'error'); return }
                    const code: DiscountCode = {
                      id: editingDiscountId ?? `dc_${Date.now()}`,
                      code: discountForm.code.trim(),
                      type: discountForm.type,
                      value: Number(discountForm.value),
                      scope: discountForm.scope,
                      categoryTarget: discountForm.scope === 'category' ? discountForm.categoryTarget : undefined,
                      productIds: discountForm.scope === 'products' ? discountForm.productIds.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                      usageLimit: discountForm.usageLimit ? Number(discountForm.usageLimit) : undefined,
                      usedCount: editingDiscountId ? (state.discountCodes.find(c => c.id === editingDiscountId)?.usedCount ?? 0) : 0,
                      expiresAt: discountForm.expiresAt || undefined,
                      isActive: discountForm.isActive,
                    }
                    if (editingDiscountId) { updateDiscountCode(code); toast('Код шинэчлэгдлээ', 'success') }
                    else { addDiscountCode(code); toast('Код нэмэгдлээ', 'success') }
                    setShowDiscountForm(false)
                    setEditingDiscountId(null)
                  }} className="btn-forest text-sm px-5 py-2">Хадгалах</button>
                  <button onClick={() => setShowDiscountForm(false)} className="btn-outline text-sm px-5 py-2">Болих</button>
                </div>
              </div>
            )}

            {/* Discount codes table */}
            {state.discountCodes.length === 0 ? (
              <div className="bg-white rounded-sm border border-cream-dark p-8 text-center">
                <p className="text-ink/40 text-sm">Хөнгөлөлтийн код байхгүй байна</p>
              </div>
            ) : (
              <div className="bg-white rounded-sm border border-cream-dark overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-cream border-b border-cream-dark">
                    <tr>
                      {['Код', 'Төрөл', 'Утга', 'Хамрах хүрээ', 'Хэрэглэсэн / Лимит', 'Дуусах', 'Төлөв', ''].map(h => (
                        <th key={h} className="label-mono text-left px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream">
                    {state.discountCodes.map(c => (
                      <tr key={c.id} className="hover:bg-cream/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-forest">{c.code}</td>
                        <td className="px-4 py-3 text-ink/60">{c.type === 'percent' ? '%' : '₮'}</td>
                        <td className="px-4 py-3 font-semibold">{c.value}{c.type === 'percent' ? '%' : '₮'}</td>
                        <td className="px-4 py-3 text-ink/60 text-xs">
                          {c.scope === 'all' ? 'Бүгд' : c.scope === 'category' ? `Ангилал: ${c.categoryTarget}` : `${c.productIds?.length} бүтээгдэхүүн`}
                        </td>
                        <td className="px-4 py-3 text-ink/60">{c.usedCount} / {c.usageLimit ?? '∞'}</td>
                        <td className="px-4 py-3 text-xs text-ink/40">{c.expiresAt ? c.expiresAt.slice(0, 10) : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`label-mono text-xs px-2 py-0.5 rounded-sm ${c.isActive ? 'bg-lime/10 text-lime-dark' : 'bg-gray-100 text-gray-400'}`}>
                            {c.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => {
                              setDiscountForm({
                                code: c.code, type: c.type, value: String(c.value),
                                scope: c.scope, categoryTarget: c.categoryTarget ?? '',
                                productIds: c.productIds?.join(', ') ?? '',
                                usageLimit: c.usageLimit ? String(c.usageLimit) : '',
                                expiresAt: c.expiresAt ?? '', isActive: c.isActive,
                              })
                              setEditingDiscountId(c.id)
                              setShowDiscountForm(true)
                            }} className="text-ink/30 hover:text-forest transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => { if (confirm('Устгах уу?')) deleteDiscountCode(c.id) }} className="text-ink/30 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            {/* Bank settings */}
            <div className="bg-white rounded-sm border border-cream-dark p-5">
              <h2 className="font-serif font-semibold text-ink mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-lime-dark" /> Банкны тохиргоо
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="label-mono text-ink/50 block mb-1">Банкны нэр</label>
                  <input value={bankEdit.bankName} onChange={e => setBankEdit(b => ({ ...b, bankName: e.target.value }))}
                    className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="Хаан банк" />
                </div>
                <div>
                  <label className="label-mono text-ink/50 block mb-1">Дансны дугаар</label>
                  <input value={bankEdit.accountNumber} onChange={e => setBankEdit(b => ({ ...b, accountNumber: e.target.value }))}
                    className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-lime" placeholder="5000123456" />
                </div>
                <div>
                  <label className="label-mono text-ink/50 block mb-1">Хүлээн авагчийн нэр</label>
                  <input value={bankEdit.accountHolder} onChange={e => setBankEdit(b => ({ ...b, accountHolder: e.target.value }))}
                    className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" placeholder="Groot MN LLC" />
                </div>
                <button onClick={() => { updateBankSettings(bankEdit); toast('Банкны мэдээлэл хадгалагдлаа', 'success') }}
                  className="btn-forest text-sm px-6 py-2">Хадгалах</button>
              </div>
            </div>

            {/* Delivery zones */}
            <div className="bg-white rounded-sm border border-cream-dark p-5">
              <h2 className="font-serif font-semibold text-ink mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-lime-dark" /> Хүргэлтийн бүс тохиргоо
              </h2>
              <div className="space-y-2 mb-4">
                {zoneEdits.map((zone, i) => (
                  <div key={zone.district} className="flex items-center gap-3">
                    <span className="flex-1 text-sm text-ink">{zone.district}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number" min="0"
                        value={zone.fee}
                        onChange={e => setZoneEdits(z => z.map((zn, j) => j === i ? { ...zn, fee: Number(e.target.value) } : zn))}
                        className="w-24 border border-cream-dark rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime text-right"
                      />
                      <span className="text-sm text-ink/50">₮</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink/30 mb-3">50,000₮-с дээш захиалгад автоматаар үнэгүй хүргэлт хэрэгжинэ</p>
              <button onClick={() => { updateDeliveryZones(zoneEdits); toast('Хүргэлтийн бүс хадгалагдлаа', 'success') }}
                className="btn-forest text-sm px-6 py-2">Хадгалах</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
