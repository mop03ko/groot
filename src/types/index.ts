export type ProductCategory = 'vegetable' | 'fruit' | 'herb' | 'organic' | 'all'

export interface Product {
  id: string
  name: string
  nameEn: string
  category: Exclude<ProductCategory, 'all'>
  price: number
  unit: string
  stock: number
  emoji: string
  bgGradient: string
  description: string
  origin: string
  rating: number
  reviews: number
  discount?: number
  isFeatured?: boolean
  isOrganic?: boolean
  checkedTime?: string
  market?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Address {
  id: string
  label: string
  district: string
  khoroo: string
  street: string
  building: string
  isDefault: boolean
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'delivering'
  | 'delivered'
  | 'cancelled'

export type PaymentMethod = 'cash' | 'qpay' | 'card'

export interface OrderItem {
  productId: string
  productName: string
  emoji: string
  price: number
  quantity: number
  unit: string
  subtotal: number
}

export interface OrderTimeline {
  status: OrderStatus
  label: string
  time: string
  done: boolean
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  items: OrderItem[]
  deliveryAddress: Address
  driverId?: string
  driverName?: string
  driverPhone?: string
  status: OrderStatus
  timeline: OrderTimeline[]
  paymentMethod: PaymentMethod
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  notes?: string
  createdAt: string
  estimatedDelivery: string
}

export type UserRole = 'customer' | 'admin' | 'driver'

export interface User {
  id: string
  name: string
  phone: string
  email: string
  role: UserRole
  avatar: string
  loyaltyPoints: number
  addresses: Address[]
  favoriteIds: string[]
}

export interface Driver {
  id: string
  name: string
  phone: string
  status: 'available' | 'delivering' | 'offline'
  vehicle: string
  completedToday: number
  rating: number
  currentOrderId?: string
}

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}
