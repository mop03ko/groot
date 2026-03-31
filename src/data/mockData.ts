import type { User, Order, Driver } from '../types'
import { products } from './products'

export const DEMO_USERS: User[] = [
  {
    id: 'u1',
    name: 'Батбаяр Дорж',
    phone: '99001234',
    email: 'bat@example.mn',
    role: 'customer',
    avatar: '👤',
    loyaltyPoints: 3450,
    addresses: [
      {
        id: 'a1', label: 'Гэр', district: 'Баянзүрх дүүрэг',
        khoroo: '15-р хороо', street: 'Эх орон гудамж',
        building: '23-р байр, 45-р тоот', isDefault: true,
      },
      {
        id: 'a2', label: 'Ажил', district: 'Сүхбаатар дүүрэг',
        khoroo: '1-р хороо', street: 'Энхтайваны өргөн чөлөө',
        building: 'Блю Скай тауэр, 601', isDefault: false,
      },
    ],
    favoriteIds: ['p1', 'p5', 'p13'],
  },
  {
    id: 'u2',
    name: 'Админ Хэрэглэгч',
    phone: '99009999',
    email: 'admin@groot.mn',
    role: 'admin',
    avatar: '👨‍💼',
    loyaltyPoints: 0,
    addresses: [],
    favoriteIds: [],
  },
  {
    id: 'u3',
    name: 'Төгсөө Жолооч',
    phone: '99005678',
    email: 'driver@groot.mn',
    role: 'driver',
    avatar: '🚗',
    loyaltyPoints: 0,
    addresses: [],
    favoriteIds: [],
  },
]

const makeTimeline = (status: string) => {
  const all = [
    { status: 'pending', label: 'Захиалга хүлээгдэж байна', time: '10:00', done: true },
    { status: 'confirmed', label: 'Баталгаажсан', time: '10:05', done: true },
    { status: 'preparing', label: 'Бэлтгэж байна', time: '10:15', done: status !== 'pending' && status !== 'confirmed' },
    { status: 'delivering', label: 'Хүргэлтэнд гарсан', time: '10:45', done: status === 'delivering' || status === 'delivered' },
    { status: 'delivered', label: 'Хүргэгдсэн', time: '11:20', done: status === 'delivered' },
  ] as const
  return all.map(t => ({ ...t, done: t.done }))
}

export const DEMO_ORDERS: Order[] = [
  {
    id: 'o1', orderNumber: 'GR-20240330-1234',
    customerId: 'u1', customerName: 'Батбаяр Дорж', customerPhone: '99001234',
    items: [
      { productId: 'p1', productName: 'Лууван', emoji: '🥕', price: 1500, quantity: 2, unit: 'кг', subtotal: 3000 },
      { productId: 'p5', productName: 'Улаан лооль', emoji: '🍅', price: 3150, quantity: 1, unit: 'кг', subtotal: 3150 },
      { productId: 'p11', productName: 'Төмс', emoji: '🥔', price: 1200, quantity: 3, unit: 'кг', subtotal: 3600 },
    ],
    deliveryAddress: {
      id: 'a1', label: 'Гэр', district: 'Баянзүрх дүүрэг',
      khoroo: '15-р хороо', street: 'Эх орон гудамж',
      building: '23-р байр, 45-р тоот', isDefault: true,
    },
    driverId: 'u3', driverName: 'Төгсөө', driverPhone: '99005678',
    status: 'delivered',
    timeline: makeTimeline('delivered') as any,
    paymentMethod: 'qpay',
    subtotal: 9750, deliveryFee: 0, discount: 0, total: 9750,
    createdAt: '2024-03-28T10:00:00Z',
    estimatedDelivery: '2024-03-28T11:30:00Z',
  },
  {
    id: 'o2', orderNumber: 'GR-20240330-2567',
    customerId: 'u1', customerName: 'Батбаяр Дорж', customerPhone: '99001234',
    items: [
      { productId: 'p7', productName: 'Брокколи', emoji: '🥦', price: 6500, quantity: 1, unit: 'кг', subtotal: 6500 },
      { productId: 'p19', productName: 'Органик лууван', emoji: '🥕', price: 3500, quantity: 2, unit: 'кг', subtotal: 7000 },
    ],
    deliveryAddress: {
      id: 'a1', label: 'Гэр', district: 'Баянзүрх дүүрэг',
      khoroo: '15-р хороо', street: 'Эх орон гудамж',
      building: '23-р байр, 45-р тоот', isDefault: true,
    },
    driverId: 'u3', driverName: 'Төгсөө', driverPhone: '99005678',
    status: 'delivering',
    timeline: makeTimeline('delivering') as any,
    paymentMethod: 'cash',
    subtotal: 13500, deliveryFee: 0, discount: 0, total: 13500,
    createdAt: '2024-03-30T09:00:00Z',
    estimatedDelivery: '2024-03-30T11:00:00Z',
  },
  {
    id: 'o3', orderNumber: 'GR-20240330-3891',
    customerId: 'u1', customerName: 'Батбаяр Дорж', customerPhone: '99001234',
    items: [
      { productId: 'p13', productName: 'Алим', emoji: '🍎', price: 4000, quantity: 2, unit: 'кг', subtotal: 8000 },
    ],
    deliveryAddress: {
      id: 'a2', label: 'Ажил', district: 'Сүхбаатар дүүрэг',
      khoroo: '1-р хороо', street: 'Энхтайваны өргөн чөлөө',
      building: 'Блю Скай тауэр, 601', isDefault: false,
    },
    status: 'confirmed',
    timeline: makeTimeline('confirmed') as any,
    paymentMethod: 'card',
    subtotal: 8000, deliveryFee: 3000, discount: 0, total: 11000,
    createdAt: '2024-03-30T11:30:00Z',
    estimatedDelivery: '2024-03-30T14:00:00Z',
  },
  // More orders for admin view
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `o${i + 4}`, orderNumber: `GR-20240330-${4000 + i * 111}`,
    customerId: 'u1',
    customerName: ['Одгэрэл Б.', 'Мөнхбаяр Д.', 'Сарантуяа Г.', 'Баатар Ч.', 'Номин Э.', 'Энхжин Т.', 'Гантулга О.'][i],
    customerPhone: `9900${1000 + i}`,
    items: [{ productId: products[i].id, productName: products[i].name, emoji: products[i].emoji, price: products[i].price, quantity: 2, unit: products[i].unit, subtotal: products[i].price * 2 }],
    deliveryAddress: { id: 'ax', label: 'Гэр', district: 'Баянгол дүүрэг', khoroo: '5-р хороо', street: 'Наран гудамж', building: `${10 + i}-р байр`, isDefault: true },
    status: (['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'pending', 'confirmed'] as const)[i],
    timeline: makeTimeline(['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'pending', 'confirmed'][i]) as any,
    paymentMethod: (['cash', 'qpay', 'card', 'cash', 'qpay', 'card', 'cash'] as const)[i],
    subtotal: products[i].price * 2,
    deliveryFee: products[i].price * 2 >= 50000 ? 0 : 3000,
    discount: 0,
    total: products[i].price * 2 + (products[i].price * 2 >= 50000 ? 0 : 3000),
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    estimatedDelivery: new Date(Date.now() + (2 - i) * 3600000).toISOString(),
  })),
]

export const DEMO_DRIVERS: Driver[] = [
  { id: 'u3', name: 'Төгсөө Жолооч', phone: '99005678', status: 'delivering', vehicle: 'Toyota Prius 1234УБА', completedToday: 4, rating: 4.8, currentOrderId: 'o2' },
  { id: 'd2', name: 'Мөнхбат Н.', phone: '99002222', status: 'available', vehicle: 'Hyundai Accent 5678УБА', completedToday: 6, rating: 4.9 },
  { id: 'd3', name: 'Эрдэнэ Б.', phone: '99003333', status: 'offline', vehicle: 'Toyota Corolla 9012УБА', completedToday: 3, rating: 4.6 },
]
