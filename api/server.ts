// Deno HTTP server — QPay proxy
// Run: deno run -A api/server.ts

const QPAY_BASE = 'https://merchant.qpay.mn/v2'
const QPAY_USERNAME = Deno.env.get('QPAY_USERNAME') ?? 'TEST'
const QPAY_PASSWORD = Deno.env.get('QPAY_PASSWORD') ?? 'TEST'
const QPAY_INVOICE_CODE = Deno.env.get('QPAY_INVOICE_CODE') ?? 'TEST_INVOICE'

let cachedToken: { token: string; expiresAt: number } | null = null

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }
  const res = await fetch(`${QPAY_BASE}/auth/token`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${QPAY_USERNAME}:${QPAY_PASSWORD}`),
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new Error(`QPay auth failed: ${res.status}`)
  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 - 60000,
  }
  return cachedToken.token
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

Deno.serve({ port: 3001 }, async (req) => {
  const url = new URL(req.url)

  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  // POST /api/qpay/invoice  — create invoice
  if (req.method === 'POST' && url.pathname === '/api/qpay/invoice') {
    try {
      const body = await req.json()
      const { orderId, amount, description } = body as {
        orderId: string; amount: number; description: string
      }

      const token = await getToken()
      const res = await fetch(`${QPAY_BASE}/invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_code: QPAY_INVOICE_CODE,
          sender_invoice_no: orderId,
          invoice_receiver_code: 'terminal',
          invoice_description: description,
          amount,
          callback_url: `${Deno.env.get('APP_URL') ?? 'http://localhost:5173'}/qpay/callback`,
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        return json({ error: err }, res.status)
      }

      const data = await res.json()
      return json(data)
    } catch (e) {
      return json({ error: String(e) }, 500)
    }
  }

  // GET /api/qpay/check/:invoiceId
  if (req.method === 'GET' && url.pathname.startsWith('/api/qpay/check/')) {
    const invoiceId = url.pathname.split('/').pop()
    try {
      const token = await getToken()
      const res = await fetch(`${QPAY_BASE}/payment/check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ object_type: 'INVOICE', object_id: invoiceId, offset: { page_number: 1, page_limit: 1 } }),
      })
      const data = await res.json()
      return json(data)
    } catch (e) {
      return json({ error: String(e) }, 500)
    }
  }

  return json({ error: 'Not found' }, 404)
})

console.log('QPay proxy listening on http://localhost:3001')
