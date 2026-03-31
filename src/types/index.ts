export type ProductCategory = 'vegetable' | 'fruit' | 'herb' | 'organic' | 'all'

export interface ProductVariant {
  id: string
  name: string   // e.g. "Энгийн", "Хайрцагтай", "Уутанд"
  price: number
  stock?: number
}

export interface Product {
  id: string
  name: string
  nameEn: string
  category: string
  price: number
  unit: string
  stock: number
  emoji: string
  image?: string        // base64 or URL — shown instead of emoji if present
  bgGradient: string
  description: string
  origin: string
  rating: number
  reviews: number
  discount?: number
  isFeatured?: boolean
  isOrganic?: boolean
  packagedAt?: string   // е.g. "2026-03-31"
  certifiedAt?: string  // quality cert date
  variants?: ProductVariant[]
  wholesalePrice?: number      // price per unit for wholesale buyers
  minWholesaleQty?: number     // minimum qty to unlock wholesale price
  freeDelivery?: boolean       // product-level free delivery override
}

export interface CartItem {
  product: Product
  quantity: number
  variantId?: string   // which variant is selected
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

export type PaymentMethod = 'cash' | 'qpay' | 'bank'

export interface OrderItem {
  productId: string
  productName: string
  emoji: string
  price: number
  quantity: number
  unit: string
  subtotal: number
  variantName?: string
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

// ── Discount codes ───────────────────────────────────────────────────────────

export type DiscountScope = 'all' | 'category' | 'products'

export interface DiscountCode {
  id: string
  code: string                   // uppercase, e.g. "GROOT20"
  type: 'percent' | 'amount'    // percent = % off, amount = fixed ₮ off
  value: number                  // 20 for 20% or 5000 for 5000₮
  scope: DiscountScope
  categoryTarget?: string        // used when scope === 'category'
  productIds?: string[]          // used when scope === 'products'
  usageLimit?: number            // undefined = unlimited
  usedCount: number
  expiresAt?: string             // ISO date string
  isActive: boolean
}

// ── Bank payment settings ────────────────────────────────────────────────────

export interface BankSettings {
  bankName: string        // e.g. "Хаан банк"
  accountNumber: string   // e.g. "5000123456"
  accountHolder: string   // e.g. "Groot MN LLC"
}

// ── Delivery zones ───────────────────────────────────────────────────────────

export interface DeliveryZone {
  district: string   // matches Address.district
  fee: number        // delivery fee in ₮
}

// ── In-app notifications ─────────────────────────────────────────────────────

export type NotificationType = 'new_order' | 'driver_assigned'

export interface AppNotification {
  id: string
  type: NotificationType
  message: string
  orderId?: string
  read: boolean
  createdAt: string
}
