const API = '/api/qpay'

export interface QPayInvoice {
  invoice_id: string
  qr_text: string
  qr_image: string       // base64 PNG
  qPay_shortUrl?: string
  urls: { name: string; description: string; logo: string; link: string }[]
}

export interface QPayCheckResult {
  count: number
  paid_amount: number
  rows: { payment_status: string }[]
}

export async function createInvoice(
  orderId: string,
  amount: number,
  description: string
): Promise<QPayInvoice> {
  const res = await fetch(`${API}/invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, amount, description }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? `QPay invoice error ${res.status}`)
  }
  return res.json()
}

export async function checkPayment(invoiceId: string): Promise<QPayCheckResult> {
  const res = await fetch(`${API}/check/${invoiceId}`)
  if (!res.ok) throw new Error(`QPay check error ${res.status}`)
  return res.json()
}

export function isPaid(result: QPayCheckResult): boolean {
  return result.count > 0 && result.rows.some(r => r.payment_status === 'PAID')
}
