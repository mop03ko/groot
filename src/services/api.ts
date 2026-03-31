export const API_BASE = '/api'

let currentToken: string | null = localStorage.getItem('groot_token')

export const setAuthToken = (token: string | null) => {
  currentToken = token
  if (token) localStorage.setItem('groot_token', token)
  else localStorage.removeItem('groot_token')
}

export const getHeaders = () => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`
  return headers
}

export async function login(phone: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ phone }),
  })
  if (!res.ok) throw new Error('Нэвтрэхэд алдаа гарлаа')
  const { token, user } = await res.json()
  setAuthToken(token)
  return user
}

export async function fetchMe() {
  if (!currentToken) return null
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getHeaders(),
  })
  if (!res.ok) {
    setAuthToken(null)
    return null
  }
  const { user } = await res.json()
  return user
}

export async function notifyQPayWebhook(orderId: string) {
  const res = await fetch(`${API_BASE}/qpay/webhook`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ orderId }),
  })
  return res.ok
}
