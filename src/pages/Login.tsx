import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Phone, Lock, ArrowRight, Leaf } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { login, toast } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname ?? '/'

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const DEMO_ACCOUNTS = [
    { phone: '99001234', role: 'Хэрэглэгч', icon: '👤' },
    { phone: '99009999', role: 'Админ', icon: '⚙️' },
    { phone: '99005678', role: 'Жолооч', icon: '🚗' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!phone) { setError('Утасны дугаар оруулна уу'); return }
    const ok = login(phone)
    if (ok) {
      toast('Амжилттай нэвтэрлээ!', 'success')
      navigate(from, { replace: true })
    } else {
      setError('Утасны дугаар буруу байна. Доорх демо дансуудыг ашиглана уу.')
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-forest rounded-sm flex items-center justify-center mb-1">
              <Leaf className="w-7 h-7 text-lime" />
            </div>
            <span className="font-serif font-bold text-2xl text-forest">GROOT</span>
            <span className="label-mono text-ink/40">Root to Table</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white border border-cream-dark rounded-sm shadow-sm p-8">
          <h1 className="font-serif text-2xl font-bold text-ink mb-1">Нэвтрэх</h1>
          <p className="text-sm text-ink/50 mb-6">Захиалга өгөхийн тулд нэвтрэнэ үү</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-mono text-ink/60 block mb-1.5">Утасны дугаар</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="9900-1234"
                  className="input-field pl-9"
                />
              </div>
            </div>
            <div>
              <label className="label-mono text-ink/60 block mb-1.5">Нууц үг</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-9"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-sm px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" className="btn-forest w-full py-3 flex items-center justify-center gap-2 mt-2">
              Нэвтрэх <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-cream-dark">
            <p className="label-mono text-ink/40 mb-3">Демо дансууд</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.phone}
                  onClick={() => { setPhone(acc.phone); setPassword('groot2024') }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-sm bg-cream hover:bg-cream-dark border border-cream-dark transition-colors text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span>{acc.icon}</span>
                    <span className="font-medium text-ink">{acc.role}</span>
                  </span>
                  <span className="label-mono text-ink/40">{acc.phone}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-ink/30 mt-2 text-center">Нууц үг: groot2024</p>
          </div>
        </div>

        <p className="text-center text-sm text-ink/40 mt-4">
          <Link to="/" className="hover:text-forest transition-colors">← Нүүр хуудас руу буцах</Link>
        </p>
      </div>
    </div>
  )
}
