import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react'
import type {
  User, Product, CartItem, Order, ToastMessage, UserRole, Driver,
  DiscountCode, BankSettings, DeliveryZone, AppNotification,
} from '../types'
import { products as allProducts } from '../data/products'
import { DEMO_USERS, DEMO_ORDERS, DEMO_DRIVERS } from '../data/mockData'
import { login as apiLogin, fetchMe, setAuthToken } from '../services/api'

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = ['vegetable', 'fruit', 'herb', 'organic']

const DEFAULT_BANK_SETTINGS: BankSettings = {
  bankName: 'Хаан банк',
  accountNumber: '5000123456',
  accountHolder: 'Groot MN LLC',
}

const DEFAULT_DELIVERY_ZONES: DeliveryZone[] = [
  { district: 'Баянзүрх дүүрэг',        fee: 3000 },
  { district: 'Сүхбаатар дүүрэг',       fee: 3000 },
  { district: 'Баянгол дүүрэг',         fee: 3000 },
  { district: 'Чингэлтэй дүүрэг',       fee: 3000 },
  { district: 'Хан-Уул дүүрэг',         fee: 4000 },
  { district: 'Сонгинохайрхан дүүрэг',  fee: 4000 },
  { district: 'Налайх дүүрэг',          fee: 6000 },
  { district: 'Багануур дүүрэг',        fee: 8000 },
  { district: 'Багахангай дүүрэг',      fee: 10000 },
]

// ─── State ───────────────────────────────────────────────────────────────────

interface AppState {
  user: User | null
  products: Product[]
  cart: CartItem[]
  isCartOpen: boolean
  orders: Order[]
  drivers: Driver[]
  categories: string[]
  toasts: ToastMessage[]
  activeRole: UserRole
  discountCodes: DiscountCode[]
  bankSettings: BankSettings
  deliveryZones: DeliveryZone[]
  notifications: AppNotification[]
  cartDiscount: { code: DiscountCode | null; amount: number }
}

const initial: AppState = {
  user: null,
  products: allProducts,
  cart: [],
  isCartOpen: false,
  orders: DEMO_ORDERS,
  drivers: DEMO_DRIVERS,
  categories: DEFAULT_CATEGORIES,
  toasts: [],
  activeRole: 'customer',
  discountCodes: [],
  bankSettings: DEFAULT_BANK_SETTINGS,
  deliveryZones: DEFAULT_DELIVERY_ZONES,
  notifications: [],
  cartDiscount: { code: null, amount: 0 },
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SWITCH_ROLE'; payload: UserRole }
  | { type: 'CART_ADD'; payload: { product: Product; qty: number; variantId?: string } }
  | { type: 'CART_REMOVE'; payload: string }
  | { type: 'CART_UPDATE_QTY'; payload: { productId: string; qty: number } }
  | { type: 'CART_CLEAR' }
  | { type: 'CART_TOGGLE' }
  | { type: 'CART_OPEN' }
  | { type: 'SET_CART_DISCOUNT'; payload: { code: DiscountCode | null; amount: number } }
  | { type: 'PLACE_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status'] } }
  | { type: 'ASSIGN_DRIVER'; payload: { orderId: string; driverId: string; driverName: string; driverPhone: string } }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'ADD_TOAST'; payload: ToastMessage }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'ADD_ADDRESS'; payload: import('../types').Address }
  | { type: 'UPDATE_ADDRESS'; payload: import('../types').Address }
  | { type: 'DELETE_ADDRESS'; payload: string }
  | { type: 'ADD_DRIVER'; payload: Driver }
  | { type: 'UPDATE_DRIVER'; payload: Driver }
  | { type: 'ADD_CATEGORY'; payload: string }
  | { type: 'UPDATE_CATEGORY'; payload: { old: string; next: string } }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_DISCOUNT_CODE'; payload: DiscountCode }
  | { type: 'UPDATE_DISCOUNT_CODE'; payload: DiscountCode }
  | { type: 'DELETE_DISCOUNT_CODE'; payload: string }
  | { type: 'INCREMENT_CODE_USED'; payload: string }
  | { type: 'UPDATE_BANK_SETTINGS'; payload: BankSettings }
  | { type: 'UPDATE_DELIVERY_ZONES'; payload: DeliveryZone[] }
  | { type: 'ADD_NOTIFICATION'; payload: AppNotification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }

    case 'SWITCH_ROLE': {
      const user = DEMO_USERS.find(u => u.role === action.payload) ?? null
      return { ...state, user, activeRole: action.payload }
    }

    case 'CART_ADD': {
      const existing = state.cart.find(i => i.product.id === action.payload.product.id && i.variantId === action.payload.variantId)
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(i =>
            i.product.id === action.payload.product.id && i.variantId === action.payload.variantId
              ? { ...i, quantity: i.quantity + action.payload.qty }
              : i
          ),
        }
      }
      return { ...state, cart: [...state.cart, { product: action.payload.product, quantity: action.payload.qty, variantId: action.payload.variantId }] }
    }

    case 'CART_REMOVE':
      return { ...state, cart: state.cart.filter(i => i.product.id !== action.payload) }

    case 'CART_UPDATE_QTY':
      if (action.payload.qty <= 0) {
        return { ...state, cart: state.cart.filter(i => i.product.id !== action.payload.productId) }
      }
      return {
        ...state,
        cart: state.cart.map(i =>
          i.product.id === action.payload.productId ? { ...i, quantity: action.payload.qty } : i
        ),
      }

    case 'CART_CLEAR':
      return { ...state, cart: [], cartDiscount: { code: null, amount: 0 } }

    case 'CART_TOGGLE':
      return { ...state, isCartOpen: !state.isCartOpen }

    case 'CART_OPEN':
      return { ...state, isCartOpen: true }

    case 'SET_CART_DISCOUNT':
      return { ...state, cartDiscount: action.payload }

    case 'PLACE_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        cart: [],
        isCartOpen: false,
        cartDiscount: { code: null, amount: 0 },
      }

    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.payload.orderId ? { ...o, status: action.payload.status } : o
        ),
      }

    case 'ASSIGN_DRIVER':
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.payload.orderId
            ? { ...o, status: 'delivering', driverId: action.payload.driverId, driverName: action.payload.driverName, driverPhone: action.payload.driverPhone }
            : o
        ),
        drivers: state.drivers.map(d =>
          d.id === action.payload.driverId ? { ...d, status: 'delivering', currentOrderId: action.payload.orderId } : d
        ),
      }

    case 'TOGGLE_FAVORITE': {
      if (!state.user) return state
      const favs = state.user.favoriteIds
      const updated = favs.includes(action.payload)
        ? favs.filter(id => id !== action.payload)
        : [...favs, action.payload]
      return { ...state, user: { ...state.user, favoriteIds: updated } }
    }

    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] }

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) }

    case 'LOAD_CART':
      return { ...state, cart: action.payload }

    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] }

    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.payload.id ? action.payload : p) }

    case 'ADD_ADDRESS':
      if (!state.user) return state
      return { ...state, user: { ...state.user, addresses: [...state.user.addresses, action.payload] } }

    case 'UPDATE_ADDRESS':
      if (!state.user) return state
      return {
        ...state,
        user: {
          ...state.user,
          addresses: state.user.addresses.map(a => a.id === action.payload.id ? action.payload : a),
        },
      }

    case 'DELETE_ADDRESS':
      if (!state.user) return state
      return { ...state, user: { ...state.user, addresses: state.user.addresses.filter(a => a.id !== action.payload) } }

    case 'ADD_DRIVER':
      return { ...state, drivers: [...state.drivers, action.payload] }

    case 'UPDATE_DRIVER':
      return { ...state, drivers: state.drivers.map(d => d.id === action.payload.id ? action.payload : d) }

    case 'ADD_CATEGORY':
      if (state.categories.includes(action.payload)) return state
      return { ...state, categories: [...state.categories, action.payload] }

    case 'UPDATE_CATEGORY':
      return { ...state, categories: state.categories.map(c => c === action.payload.old ? action.payload.next : c) }

    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c !== action.payload) }

    case 'ADD_DISCOUNT_CODE':
      return { ...state, discountCodes: [...state.discountCodes, action.payload] }

    case 'UPDATE_DISCOUNT_CODE':
      return { ...state, discountCodes: state.discountCodes.map(c => c.id === action.payload.id ? action.payload : c) }

    case 'DELETE_DISCOUNT_CODE':
      return { ...state, discountCodes: state.discountCodes.filter(c => c.id !== action.payload) }

    case 'INCREMENT_CODE_USED':
      return {
        ...state,
        discountCodes: state.discountCodes.map(c =>
          c.code === action.payload ? { ...c, usedCount: c.usedCount + 1 } : c
        ),
      }

    case 'UPDATE_BANK_SETTINGS':
      return { ...state, bankSettings: action.payload }

    case 'UPDATE_DELIVERY_ZONES':
      return { ...state, deliveryZones: action.payload }

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n),
      }

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) }

    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState
  login: (phone: string) => Promise<boolean>
  register: (name: string, phone: string, email: string) => boolean
  logout: () => void
  switchRole: (role: UserRole) => void
  addToCart: (product: Product, qty?: number, variantId?: string) => void
  removeFromCart: (productId: string) => void
  updateCartQty: (productId: string, qty: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  cartTotal: number
  cartCount: number
  deliveryFee: number
  setCartDiscount: (code: DiscountCode | null, amount: number) => void
  placeOrder: (
    address: import('../types').Address,
    payment: Order['paymentMethod'],
    appliedDiscount?: { code: string; amount: number }
  ) => Order
  updateOrderStatus: (orderId: string, status: Order['status']) => void
  assignDriver: (orderId: string, driverId: string, driverName: string, driverPhone: string) => void
  myOrders: Order[]
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  toast: (message: string, type?: ToastMessage['type']) => void
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  addAddress: (address: import('../types').Address) => void
  updateAddress: (address: import('../types').Address) => void
  deleteAddress: (id: string) => void
  addDriver: (driver: Driver) => void
  updateDriver: (driver: Driver) => void
  addCategory: (name: string) => void
  updateCategory: (old: string, next: string) => void
  deleteCategory: (name: string) => void
  addDiscountCode: (code: DiscountCode) => void
  updateDiscountCode: (code: DiscountCode) => void
  deleteDiscountCode: (id: string) => void
  updateBankSettings: (settings: BankSettings) => void
  updateDeliveryZones: (zones: DeliveryZone[]) => void
  getDeliveryFeeForDistrict: (district: string) => number
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  unreadNotificationCount: number
}

const AppContext = createContext<AppContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial, (init) => {
    const user = DEMO_USERS.find(u => u.role === 'customer') ?? null
    try {
      const savedCart       = localStorage.getItem('groot_cart_v1')
      const savedProducts   = localStorage.getItem('groot_products_v1')
      const savedCategories = localStorage.getItem('groot_categories_v1')
      const savedBank       = localStorage.getItem('groot_bank_v1')
      const savedZones      = localStorage.getItem('groot_zones_v1')
      const savedCodes      = localStorage.getItem('groot_codes_v1')
      return {
        ...init,
        user,
        cart:          savedCart       ? JSON.parse(savedCart)       : init.cart,
        products:      savedProducts   ? JSON.parse(savedProducts)   : init.products,
        categories:    savedCategories ? JSON.parse(savedCategories) : init.categories,
        bankSettings:  savedBank       ? JSON.parse(savedBank)       : init.bankSettings,
        deliveryZones: savedZones      ? JSON.parse(savedZones)      : init.deliveryZones,
        discountCodes: savedCodes      ? JSON.parse(savedCodes)      : init.discountCodes,
      }
    } catch { /* ignore */ }
    return { ...init, user }
  })

  // Safe localStorage helper — catches QuotaExceededError silently
  function lsSet(key: string, value: unknown) {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* quota exceeded — ignore */ }
  }

  useEffect(() => {
    fetchMe().then(user => {
      if (user) dispatch({ type: 'SET_USER', payload: user })
    }).catch(() => {})
  }, [])

  useEffect(() => { lsSet('groot_cart_v1',       state.cart)          }, [state.cart])
  useEffect(() => { lsSet('groot_products_v1',   state.products)      }, [state.products])
  useEffect(() => { lsSet('groot_categories_v1', state.categories)    }, [state.categories])
  useEffect(() => { lsSet('groot_bank_v1',       state.bankSettings)  }, [state.bankSettings])
  useEffect(() => { lsSet('groot_zones_v1',      state.deliveryZones) }, [state.deliveryZones])
  useEffect(() => { lsSet('groot_codes_v1',      state.discountCodes) }, [state.discountCodes])

  useEffect(() => {
    if (state.toasts.length === 0) return
    const id = state.toasts[state.toasts.length - 1].id
    const timer = setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3000)
    return () => clearTimeout(timer)
  }, [state.toasts])

  const cartTotal = Math.round(state.cart.reduce((sum, i) => {
    const isWholesale = i.product.wholesalePrice && i.product.minWholesaleQty
      && i.quantity >= i.product.minWholesaleQty
    const ep = isWholesale
      ? i.product.wholesalePrice!
      : i.product.discount
        ? i.product.price * (1 - i.product.discount / 100)  // round at the end only
        : i.product.price
    return sum + ep * i.quantity
  }, 0))
  const cartCount = state.cart.reduce((sum, i) => sum + i.quantity, 0)
  const deliveryFee = cartTotal >= 50000 ? 0 : 3000

  const getDeliveryFeeForDistrict = useCallback((district: string): number => {
    const hasFreeDeliveryProduct = state.cart.some(i => i.product.freeDelivery === true)
    if (hasFreeDeliveryProduct) return 0
    const zone = state.deliveryZones.find(z => z.district === district)
    const baseFee = zone?.fee ?? 3000
    return cartTotal >= 50000 ? 0 : baseFee
  }, [state.cart, state.deliveryZones, cartTotal])

  const unreadNotificationCount = state.notifications.filter(n => !n.read).length

  const login = useCallback(async (phone: string) => {
    try {
      const user = await apiLogin(phone)
      if (user) {
        dispatch({ type: 'SET_USER', payload: user })
        return true
      }
      return false
    } catch (e) {
      console.error(e)
      return false
    }
  }, [])

  const register = useCallback((name: string, phone: string, email: string) => {
    const exists = DEMO_USERS.some(u => u.phone === phone)
    if (exists) return false
    const newUser: User = {
      id: `u_${Date.now()}`,
      name,
      phone,
      email,
      role: 'customer',
      avatar: '👤',
      loyaltyPoints: 0,
      addresses: [],
      favoriteIds: [],
    }
    dispatch({ type: 'SET_USER', payload: newUser })
    return true
  }, [])

  const logout = useCallback(() => {
    setAuthToken(null)
    dispatch({ type: 'SET_USER', payload: null })
  }, [])
  const switchRole = useCallback((role: UserRole) => dispatch({ type: 'SWITCH_ROLE', payload: role }), [])

  const addToCart = useCallback((product: Product, qty = 1, variantId?: string) => {
    dispatch({ type: 'CART_ADD', payload: { product, qty, variantId } })
    dispatch({ type: 'ADD_TOAST', payload: { id: Date.now().toString(), message: `${product.name} сагсанд нэмэгдлээ`, type: 'success' } })
  }, [])
  const removeFromCart = useCallback((id: string) => dispatch({ type: 'CART_REMOVE', payload: id }), [])
  const updateCartQty = useCallback((productId: string, qty: number) => dispatch({ type: 'CART_UPDATE_QTY', payload: { productId, qty } }), [])
  const clearCart = useCallback(() => dispatch({ type: 'CART_CLEAR' }), [])
  const toggleCart = useCallback(() => dispatch({ type: 'CART_TOGGLE' }), [])
  const openCart = useCallback(() => dispatch({ type: 'CART_OPEN' }), [])
  const setCartDiscount = useCallback((code: DiscountCode | null, amount: number) =>
    dispatch({ type: 'SET_CART_DISCOUNT', payload: { code, amount } }), [])

  const placeOrder = useCallback((
    address: import('../types').Address,
    payment: Order['paymentMethod'],
    appliedDiscount?: { code: string; amount: number }
  ): Order => {
    const orderNum = `GR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
    const items = state.cart.map(i => ({
      productId: i.product.id,
      productName: i.product.name,
      emoji: i.product.emoji,
      price: i.product.discount ? Math.round(i.product.price * (1 - i.product.discount / 100)) : i.product.price,
      quantity: i.quantity,
      unit: i.product.unit,
      subtotal: (i.product.discount ? Math.round(i.product.price * (1 - i.product.discount / 100)) : i.product.price) * i.quantity,
    }))

    const zoneFee = getDeliveryFeeForDistrict(address.district)
    const discountAmount = appliedDiscount?.amount ?? 0

    const order: Order = {
      id: `o_${Date.now()}`,
      orderNumber: orderNum,
      customerId: state.user?.id ?? 'guest',
      customerName: state.user?.name ?? 'Зочин',
      customerPhone: state.user?.phone ?? '',
      items,
      deliveryAddress: address,
      status: 'confirmed',
      timeline: [
        { status: 'pending',   label: 'Захиалга хүлээгдэж байна', time: new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ulaanbaatar' }), done: true },
        { status: 'confirmed', label: 'Баталгаажсан',              time: new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ulaanbaatar' }), done: true },
        { status: 'preparing',  label: 'Бэлтгэж байна',            time: '', done: false },
        { status: 'delivering', label: 'Хүргэлтэнд гарсан',        time: '', done: false },
        { status: 'delivered',  label: 'Хүргэгдсэн',               time: '', done: false },
      ],
      paymentMethod: payment,
      subtotal: cartTotal,
      deliveryFee: zoneFee,
      discount: discountAmount,
      total: Math.max(0, cartTotal - discountAmount + zoneFee),
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 90 * 60000).toISOString(),
    }
    dispatch({ type: 'PLACE_ORDER', payload: order })

    // Admin notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `n_${Date.now()}`,
        type: 'new_order',
        message: `Шинэ захиалга: ${orderNum} — ${state.user?.name ?? 'Зочин'}`,
        orderId: order.id,
        read: false,
        createdAt: new Date().toISOString(),
      },
    })

    if (appliedDiscount?.code) {
      dispatch({ type: 'INCREMENT_CODE_USED', payload: appliedDiscount.code })
    }

    if (state.user) {
      const pts = Math.floor(order.total / 100)
      dispatch({ type: 'SET_USER', payload: { ...state.user, loyaltyPoints: state.user.loyaltyPoints + pts } })
    }
    return order
  }, [state.cart, state.user, cartTotal, getDeliveryFeeForDistrict])

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) =>
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status } }), [])

  const assignDriver = useCallback((orderId: string, driverId: string, driverName: string, driverPhone: string) => {
    dispatch({ type: 'ASSIGN_DRIVER', payload: { orderId, driverId, driverName, driverPhone } })
    // Find the order to get its number for the notification
    const order = state.orders.find(o => o.id === orderId)
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `n_${Date.now()}`,
        type: 'driver_assigned',
        message: `Захиалга хуваарилагдлаа: ${order?.orderNumber ?? orderId}`,
        orderId,
        read: false,
        createdAt: new Date().toISOString(),
      },
    })
  }, [state.orders])

  const myOrders = state.user ? state.orders.filter(o => o.customerId === state.user!.id) : []

  const toggleFavorite = useCallback((productId: string) =>
    dispatch({ type: 'TOGGLE_FAVORITE', payload: productId }), [])

  const isFavorite = useCallback((productId: string) =>
    state.user?.favoriteIds.includes(productId) ?? false, [state.user])

  const toast = useCallback((message: string, type: ToastMessage['type'] = 'info') =>
    dispatch({ type: 'ADD_TOAST', payload: { id: Date.now().toString(), message, type } }), [])

  const addProduct = useCallback((product: Product) =>
    dispatch({ type: 'ADD_PRODUCT', payload: product }), [])

  const updateProduct = useCallback((product: Product) =>
    dispatch({ type: 'UPDATE_PRODUCT', payload: product }), [])

  const addAddress = useCallback((address: import('../types').Address) =>
    dispatch({ type: 'ADD_ADDRESS', payload: address }), [])

  const updateAddress = useCallback((address: import('../types').Address) =>
    dispatch({ type: 'UPDATE_ADDRESS', payload: address }), [])

  const deleteAddress = useCallback((id: string) =>
    dispatch({ type: 'DELETE_ADDRESS', payload: id }), [])

  const addDriver = useCallback((driver: Driver) =>
    dispatch({ type: 'ADD_DRIVER', payload: driver }), [])

  const updateDriver = useCallback((driver: Driver) =>
    dispatch({ type: 'UPDATE_DRIVER', payload: driver }), [])

  const addCategory = useCallback((name: string) =>
    dispatch({ type: 'ADD_CATEGORY', payload: name }), [])

  const updateCategory = useCallback((old: string, next: string) =>
    dispatch({ type: 'UPDATE_CATEGORY', payload: { old, next } }), [])

  const deleteCategory = useCallback((name: string) =>
    dispatch({ type: 'DELETE_CATEGORY', payload: name }), [])

  const addDiscountCode = useCallback((code: DiscountCode) =>
    dispatch({ type: 'ADD_DISCOUNT_CODE', payload: code }), [])

  const updateDiscountCode = useCallback((code: DiscountCode) =>
    dispatch({ type: 'UPDATE_DISCOUNT_CODE', payload: code }), [])

  const deleteDiscountCode = useCallback((id: string) =>
    dispatch({ type: 'DELETE_DISCOUNT_CODE', payload: id }), [])

  const updateBankSettings = useCallback((settings: BankSettings) =>
    dispatch({ type: 'UPDATE_BANK_SETTINGS', payload: settings }), [])

  const updateDeliveryZones = useCallback((zones: DeliveryZone[]) =>
    dispatch({ type: 'UPDATE_DELIVERY_ZONES', payload: zones }), [])

  const markNotificationRead = useCallback((id: string) =>
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }), [])

  const markAllNotificationsRead = useCallback(() =>
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' }), [])

  return (
    <AppContext.Provider value={{
      state,
      login, register, logout, switchRole,
      addToCart, removeFromCart, updateCartQty, clearCart, toggleCart, openCart,
      cartTotal, cartCount, deliveryFee,
      setCartDiscount,
      placeOrder, updateOrderStatus, assignDriver, myOrders,
      toggleFavorite, isFavorite,
      toast,
      addProduct, updateProduct,
      addAddress, updateAddress, deleteAddress,
      addDriver, updateDriver,
      addCategory, updateCategory, deleteCategory,
      addDiscountCode, updateDiscountCode, deleteDiscountCode,
      updateBankSettings, updateDeliveryZones,
      getDeliveryFeeForDistrict,
      markNotificationRead, markAllNotificationsRead,
      unreadNotificationCount,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
