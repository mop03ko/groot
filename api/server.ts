// Deno HTTP server — QPay proxy + Mock DB + Auth API
// Run: deno run -A api/server.ts

const QPAY_BASE = 'https://merchant.qpay.mn/v2'
const QPAY_USERNAME = Deno.env.get('QPAY_USERNAME') ?? 'TEST'
const QPAY_PASSWORD = Deno.env.get('QPAY_PASSWORD') ?? 'TEST'
const QPAY_INVOICE_CODE = Deno.env.get('QPAY_INVOICE_CODE') ?? 'TEST_INVOICE'
const FRONTEND_URL = Deno.env.get('APP_URL') ?? 'http://localhost:5173'

// --- In-Memory Database State ---
// Roles: user, admin, driver
const usersDB = [
  { id: 'u1', name: 'Батбаяр Дорж', phone: '99001234', role: 'customer' },
  { id: 'u2', name: 'Админ Хэрэглэгч', phone: '99009999', role: 'admin' },
  { id: 'u3', name: 'Төгсөө Жолооч', phone: '99005678', role: 'driver' },
]

const ordersDB: any[] = []
const activeTokens = new Map<string, typeof usersDB[0]>() // token -> user

// --- Token Fetching Mutex (Fixing issue #5) ---
let cachedToken: { token: string; expiresAt: number } | null = null
let fetchingTokenPromise: Promise<string> | null = null

async function fetchNewToken(): Promise<string> {
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

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }
  if (!fetchingTokenPromise) {
    fetchingTokenPromise = fetchNewToken().finally(() => { fetchingTokenPromise = null })
  }
  return fetchingTokenPromise
}

// --- Helpers ---
const allowedOrigins = [FRONTEND_URL, 'http://127.0.0.1:5173']

function getCORS(req: Request) {
  const origin = req.headers.get('origin') || '*'
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  return {
    'Access-Control-Allow-Origin': allowOrigin, // Fixed issue #2 (Security)
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

function json(data: unknown, status = 200, req: Request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...getCORS(req) },
  })
}

// Fixed issue #3 (Authentication & Authorization)
function getUserFromAuth(req: Request) {
  const header = req.headers.get('Authorization')
  if (!header || !header.startsWith('Bearer ')) return null
  const token = header.split(' ')[1]
  return activeTokens.get(token) || null
}

Deno.serve({ port: 3001 }, async (req) => {
  const url = new URL(req.url)

  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCORS(req) })
  }

  // --- 1. Auth & Connections API ---
  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    try {
      const { phone } = await req.json()
      const user = usersDB.find(u => u.phone === phone)
      if (!user) return json({ error: 'User not found' }, 401, req)
      const token = crypto.randomUUID()
      activeTokens.set(token, user)
      return json({ token, user }, 200, req)
    } catch {
      return json({ error: 'Invalid body' }, 400, req)
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/auth/me') {
    const user = getUserFromAuth(req)
    if (!user) return json({ error: 'Unauthorized' }, 401, req)
    return json({ user }, 200, req)
  }

  // --- QPay API with Input Validation ---
  if (req.method === 'POST' && url.pathname === '/api/qpay/invoice') {
    try {
      const body = await req.json()
      // Fix issue #2: Specific Validation added
      if (typeof body.amount !== 'number' || body.amount <= 0 || !body.orderId) {
        return json({ error: 'Invalid data: amount must be positive and orderId is required' }, 400, req)
      }

      const { orderId, amount, description } = body
      
      const sessionUser = getUserFromAuth(req)
      if (!sessionUser) return json({ error: 'Unauthorized to create invoice' }, 401, req)

      // Store "pending" order in our DB
      ordersDB.push({ orderId, amount, status: 'pending', customerId: sessionUser.id })

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
          callback_url: `${FRONTEND_URL}/#/?qpay_callback=1&order_id=${orderId}`,
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        return json({ error: err }, res.status, req)
      }

      const data = await res.json()
      return json(data, 200, req)
    } catch (e) {
      return json({ error: String(e) }, 500, req)
    }
  }

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
      return json(data, 200, req)
    } catch (e) {
      return json({ error: String(e) }, 500, req)
    }
  }

  // --- 4. Webhook API (Fixing issue #4) ---
  if (req.method === 'POST' && url.pathname === '/api/qpay/webhook') {
    try {
      const body = await req.json()
      const orderId = body.sender_invoice_no || body.orderId
      
      // Update our mock database safely
      const order = ordersDB.find(o => o.orderId === orderId)
      if (order) {
        order.status = 'paid'
        console.log(`[Webhook] Order ${orderId} marked as PAID.`)
      }
      return json({ success: true, message: 'Status updated' }, 200, req)
    } catch (e) {
      return json({ error: String(e) }, 500, req)
    }
  }

  return json({ error: 'Not found' }, 404, req)
})

console.log(`QPay proxy + API listening on http://localhost:3001`)
