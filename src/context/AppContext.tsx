import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react'
import type { User, Product, CartItem, Order, ToastMessage, UserRole, Driver } from '../types'
import { products as allProducts } from '../data/products'
import { DEMO_USERS, DEMO_ORDERS, DEMO_DRIVERS } from '../data/mockData'

// ─── State ───────────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = ['vegetable', 'fruit', 'herb', 'organic']

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
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SWITCH_ROLE'; payload: UserRole }
  | { type: 'CART_ADD'; payload: { product: Product; qty: number } }
  | { type: 'CART_REMOVE'; payload: string }
  | { type: 'CART_UPDATE_QTY'; payload: { productId: string; qty: number } }
  | { type: 'CART_CLEAR' }
  | { type: 'CART_TOGGLE' }
  | { type: 'CART_OPEN' }
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

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }

    case 'SWITCH_ROLE': {
      const user = DEMO_USERS.find(u => u.role === action.payload) ?? null
      return { ...state, user, activeRole: action.payload }
    }

    case 'CART_ADD': {
      const existing = state.cart.find(i => i.product.id === action.payload.product.id)
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(i =>
            i.product.id === action.payload.product.id
              ? { ...i, quantity: i.quantity + action.payload.qty }
              : i
          ),
        }
      }
      return { ...state, cart: [...state.cart, { product: action.payload.product, quantity: action.payload.qty }] }
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
      return { ...state, cart: [] }

    case 'CART_TOGGLE':
      return { ...state, isCartOpen: !state.isCartOpen }

    case 'CART_OPEN':
      return { ...state, isCartOpen: true }

    case 'PLACE_ORDER':
      return { ...state, orders: [action.payload, ...state.orders], cart: [], isCartOpen: false }

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

    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState
  login: (phone: string) => boolean
  logout: () => void
  switchRole: (role: UserRole) => void
  addToCart: (product: Product, qty?: number) => void
  removeFromCart: (productId: string) => void
  updateCartQty: (productId: string, qty: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  cartTotal: number
  cartCount: number
  deliveryFee: number
  placeOrder: (address: import('../types').Address, payment: Order['paymentMethod']) => Order
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
}

const AppContext = createContext<AppContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial, (init) => {
    const user = DEMO_USERS.find(u => u.role === 'customer') ?? null
    try {
      const savedCart = localStorage.getItem('groot_cart_v1')
      if (savedCart) return { ...init, user, cart: JSON.parse(savedCart) }
    } catch { /* ignore */ }
    return { ...init, user }
  })

  useEffect(() => {
    localStorage.setItem('groot_cart_v1', JSON.stringify(state.cart))
  }, [state.cart])

  useEffect(() => {
    if (state.toasts.length === 0) return
    const id = state.toasts[state.toasts.length - 1].id
    const timer = setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3000)
    return () => clearTimeout(timer)
  }, [state.toasts])

  const cartTotal = state.cart.reduce((sum, i) => {
    const ep = i.product.discount ? Math.round(i.product.price * (1 - i.product.discount / 100)) : i.product.price
    return sum + ep * i.quantity
  }, 0)
  const cartCount = state.cart.reduce((sum, i) => sum + i.quantity, 0)
  const deliveryFee = cartTotal >= 50000 ? 0 : 3000

  const login = useCallback((phone: string) => {
    const found = DEMO_USERS.find(u => u.phone === phone)
    if (found) { dispatch({ type: 'SET_USER', payload: found }); return true }
    return false
  }, [])

  const logout = useCallback(() => dispatch({ type: 'SET_USER', payload: null }), [])
  const switchRole = useCallback((role: UserRole) => dispatch({ type: 'SWITCH_ROLE', payload: role }), [])

  const addToCart = useCallback((product: Product, qty = 1) => {
    dispatch({ type: 'CART_ADD', payload: { product, qty } })
    dispatch({ type: 'ADD_TOAST', payload: { id: Date.now().toString(), message: `${product.name} сагсанд нэмэгдлээ`, type: 'success' } })
  }, [])
  const removeFromCart = useCallback((id: string) => dispatch({ type: 'CART_REMOVE', payload: id }), [])
  const updateCartQty = useCallback((productId: string, qty: number) => dispatch({ type: 'CART_UPDATE_QTY', payload: { productId, qty } }), [])
  const clearCart = useCallback(() => dispatch({ type: 'CART_CLEAR' }), [])
  const toggleCart = useCallback(() => dispatch({ type: 'CART_TOGGLE' }), [])
  const openCart = useCallback(() => dispatch({ type: 'CART_OPEN' }), [])

  const placeOrder = useCallback((address: import('../types').Address, payment: Order['paymentMethod']): Order => {
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
        { status: 'pending', label: 'Захиалга хүлээгдэж байна', time: new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }), done: true },
        { status: 'confirmed', label: 'Баталгаажсан', time: new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }), done: true },
        { status: 'preparing', label: 'Бэлтгэж байна', time: '', done: false },
        { status: 'delivering', label: 'Хүргэлтэнд гарсан', time: '', done: false },
        { status: 'delivered', label: 'Хүргэгдсэн', time: '', done: false },
      ],
      paymentMethod: payment,
      subtotal: cartTotal,
      deliveryFee,
      discount: 0,
      total: cartTotal + deliveryFee,
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 90 * 60000).toISOString(),
    }
    dispatch({ type: 'PLACE_ORDER', payload: order })
    if (state.user) {
      const pts = Math.floor(order.total / 100)
      dispatch({ type: 'SET_USER', payload: { ...state.user, loyaltyPoints: state.user.loyaltyPoints + pts } })
    }
    return order
  }, [state.cart, state.user, cartTotal, deliveryFee])

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) =>
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status } }), [])

  const assignDriver = useCallback((orderId: string, driverId: string, driverName: string, driverPhone: string) =>
    dispatch({ type: 'ASSIGN_DRIVER', payload: { orderId, driverId, driverName, driverPhone } }), [])

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

  return (
    <AppContext.Provider value={{
      state,
      login, logout, switchRole,
      addToCart, removeFromCart, updateCartQty, clearCart, toggleCart, openCart,
      cartTotal, cartCount, deliveryFee,
      placeOrder, updateOrderStatus, assignDriver, myOrders,
      toggleFavorite, isFavorite,
      toast,
      addProduct, updateProduct,
      addAddress, updateAddress, deleteAddress,
      addDriver, updateDriver,
      addCategory, updateCategory, deleteCategory,
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
