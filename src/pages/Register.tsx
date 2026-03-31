import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, Lock, ArrowRight, Leaf, User, Mail, Eye, EyeOff } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Register() {
  const { register, toast } = useApp()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [socialSource, setSocialSource] = useState<'facebook' | 'google' | null>(null)

  const handleSocialLogin = (provider: 'facebook' | 'google') => {
    setSocialSource(provider)
    if (provider === 'facebook') {
      setName('Facebook Хэрэглэгч')
      setEmail('fb@example.mn')
    } else {
      setName('Google Хэрэглэгч')
      setEmail('google@example.mn')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Нэр оруулна уу'); return }
    if (!phone.trim()) { setError('Утасны дугаар оруулна уу'); return }
    if (password && password !== confirmPassword) { setError('Нууц үг таарахгүй байна'); return }

    const ok = register(name.trim(), phone.trim(), email.trim())
    if (!ok) {
      setError('Энэ утасны дугаар бүртгэлтэй байна. Нэвтэрнэ үү.')
      return
    }
    toast('Бүртгэл амжилттай!', 'success')
    navigate('/shop')
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/shop" className="inline-flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-forest rounded-sm flex items-center justify-center mb-1">
              <Leaf className="w-7 h-7 text-lime" />
            </div>
            <span className="font-serif font-bold text-2xl text-forest">GROOT</span>
            <span className="label-mono text-ink/40">Root to Table</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white border border-cream-dark rounded-sm shadow-sm p-8">
          <h1 className="font-serif text-2xl font-bold text-ink mb-1">Бүртгүүлэх</h1>
          <p className="text-sm text-ink/50 mb-6">Шинэ данс үүсгэх</p>

          {/* Social login */}
          <div className="space-y-3 mb-5">
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-sm border font-semibold text-sm transition-colors ${socialSource === 'facebook' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-cream-dark bg-cream hover:bg-cream-dark text-ink'}`}
            >
              <span className="text-xl">📘</span> Facebook-ээр бүртгүүлэх
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-sm border font-semibold text-sm transition-colors ${socialSource === 'google' ? 'border-red-400 bg-red-50 text-red-700' : 'border-cream-dark bg-cream hover:bg-cream-dark text-ink'}`}
            >
              <span className="text-xl">🔴</span> Google-ээр бүртгүүлэх
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-cream-dark" />
            <span className="text-xs text-ink/40 font-mono uppercase">эсвэл</span>
            <div className="flex-1 h-px bg-cream-dark" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="label-mono text-ink/60 block mb-1.5">Нэр</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Таны нэр"
                  className="input-field pl-9"
                />
              </div>
            </div>

            {/* Phone — required */}
            <div>
              <label className="label-mono text-ink/60 block mb-1.5">
                Утасны дугаар <span className="text-red-500">*</span>
              </label>
              {socialSource && (
                <p className="text-xs text-amber-600 mb-1.5 flex items-center gap-1">
                  ⚠️ Баталгаажуулалтад утасны дугаар заавал шаардлагатай
                </p>
              )}
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

            {/* Email */}
            <div>
              <label className="label-mono text-ink/60 block mb-1.5">И-мэйл <span className="text-ink/30">(заавал биш)</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@mail.mn"
                  className="input-field pl-9"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label-mono text-ink/60 block mb-1.5">Нууц үг</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-9 pr-9"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="label-mono text-ink/60 block mb-1.5">Нууц үг давтах</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
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
              Бүртгүүлэх <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-ink/50 mt-5">
            Бүртгэлтэй юу?{' '}
            <Link to="/login" className="text-forest hover:underline font-semibold">Нэвтрэх →</Link>
          </p>
        </div>

        <p className="text-center text-xs text-ink/30 mt-4">
          Демо горим — бүртгэл хуудас шинэчлэхэд хадгалагдахгүй
        </p>
      </div>
    </div>
  )
}
