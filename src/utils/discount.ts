import type { DiscountCode, CartItem } from '../types'

/**
 * Calculate the discount amount (in ₮) for a given code applied to the cart.
 * Returns 0 if the code is invalid or not applicable.
 */
export function applyDiscountCode(
  code: DiscountCode,
  cartItems: CartItem[],
  cartTotal: number
): number {
  if (!code.isActive) return 0
  if (code.expiresAt && new Date(code.expiresAt) < new Date()) return 0
  if (code.usageLimit !== undefined && code.usedCount >= code.usageLimit) return 0

  const effectivePrice = (item: CartItem) =>
    item.product.discount
      ? Math.round(item.product.price * (1 - item.product.discount / 100))
      : item.product.price

  let eligibleTotal = cartTotal

  if (code.scope === 'category' && code.categoryTarget) {
    eligibleTotal = cartItems
      .filter(i => i.product.category === code.categoryTarget)
      .reduce((s, i) => s + effectivePrice(i) * i.quantity, 0)
  } else if (code.scope === 'products' && code.productIds && code.productIds.length > 0) {
    eligibleTotal = cartItems
      .filter(i => code.productIds!.includes(i.product.id))
      .reduce((s, i) => s + effectivePrice(i) * i.quantity, 0)
  }

  if (eligibleTotal === 0) return 0

  if (code.type === 'percent') {
    return Math.round(eligibleTotal * (code.value / 100))
  }
  // amount type — never exceed eligible total
  return Math.min(code.value, eligibleTotal)
}
