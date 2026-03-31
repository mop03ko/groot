import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, LayoutDashboard, Settings, Truck, Menu, X, LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { UserRole } from '../types'

const ROLE_LABELS: Record<UserRole, { label: string; icon: string }> = {
  customer: { label: 'Хэрэглэгч', icon: '👤' },
  admin:    { label: 'Админ',      icon: '⚙️' },
  driver:   { label: 'Жолооч',    icon: '🚗' },
}

export default function Navbar() {
  const { state, cartCount, toggleCart, switchRole, logout } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const navigate = useNavigate()

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role)
    setRoleOpen(false)
    setMenuOpen(false)
    if (role === 'admin') navigate('/admin')
    else if (role === 'driver') navigate('/delivery')
    else navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-forest text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-serif font-bold text-xl tracking-tight">
            <span className="relative">
              <span className="text-white">GROOT</span>
              <span className="absolute -top-0.5 -right-2 w-1.5 h-1.5 bg-lime rounded-full pulse-dot" />
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="text-white/70 hover:text-white transition-colors">Нүүр</Link>
            <Link to="/shop" className="text-white/70 hover:text-white transition-colors">Дэлгүүр</Link>

            {/* Demo role switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleOpen(!roleOpen)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition-colors"
              >
                <span>{ROLE_LABELS[state.activeRole].icon}</span>
                <span>{ROLE_LABELS[state.activeRole].label}</span>
                <span className="opacity-50">▾</span>
              </button>
              {roleOpen && (
                <div className="absolute top-full mt-1 left-0 bg-forest-light border border-white/10 rounded-sm shadow-xl py-1 w-40 z-50">
                  {(['customer', 'admin', 'driver'] as UserRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      className={`w-full text-left px-4 py-2 text-sm font-mono uppercase tracking-wide hover:bg-white/10 transition-colors flex items-center gap-2 ${state.activeRole === role ? 'text-lime' : 'text-white/70'}`}
                    >
                      <span>{ROLE_LABELS[role].icon}</span>
                      {ROLE_LABELS[role].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {state.user?.role === 'customer' && (
              <>
                <Link to="/dashboard" className="hidden md:flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Миний хэсэг</span>
                </Link>
                <button
                  onClick={toggleCart}
                  className="relative flex items-center justify-center w-10 h-10 rounded-sm hover:bg-white/10 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 text-white" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-lime text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>
              </>
            )}
            {state.user?.role === 'admin' && (
              <Link to="/admin" className="hidden md:flex items-center gap-1.5 text-sm text-lime hover:text-lime-light transition-colors">
                <Settings className="w-4 h-4" /> Удирдлага
              </Link>
            )}
            {state.user?.role === 'driver' && (
              <Link to="/delivery" className="hidden md:flex items-center gap-1.5 text-sm text-lime hover:text-lime-light transition-colors">
                <Truck className="w-4 h-4" /> Хүргэлт
              </Link>
            )}
            {state.user ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm">{state.user.avatar}</span>
                <span className="text-sm text-white/80 max-w-[100px] truncate">{state.user.name.split(' ')[0]}</span>
                <button onClick={logout} title="Гарах" className="text-white/40 hover:text-red-400 transition-colors ml-1">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block btn-primary text-sm py-1.5 px-4">
                Нэвтрэх
              </Link>
            )}
            <button className="md:hidden p-2 text-white" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-forest-light px-4 py-4 space-y-3">
          <Link to="/" className="block text-sm text-white/80 py-2 font-medium" onClick={() => setMenuOpen(false)}>Нүүр</Link>
          <Link to="/shop" className="block text-sm text-white/80 py-2 font-medium" onClick={() => setMenuOpen(false)}>Дэлгүүр</Link>
          {state.user?.role === 'customer' && (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 text-sm text-white/80 py-2 font-medium" onClick={() => setMenuOpen(false)}>
                <LayoutDashboard className="w-4 h-4" /> Миний хэсэг
              </Link>
              <button onClick={() => { toggleCart(); setMenuOpen(false) }} className="w-full flex items-center justify-between text-sm font-medium bg-white/10 text-white rounded-sm px-4 py-2.5">
                <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Сагс</span>
                {cartCount > 0 && <span className="bg-lime text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
              </button>
            </>
          )}
          <div className="pt-2 border-t border-white/10">
            <p className="label-mono text-white/40 mb-2">Демо горим</p>
            <div className="flex gap-2">
              {(['customer', 'admin', 'driver'] as UserRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={`flex-1 text-xs py-2 rounded-sm font-mono uppercase tracking-wide transition-colors ${state.activeRole === role ? 'bg-lime text-white' : 'bg-white/10 text-white/60'}`}
                >
                  {ROLE_LABELS[role].icon} {ROLE_LABELS[role].label}
                </button>
              ))}
            </div>
          </div>
          {state.user && (
            <button onClick={() => { logout(); setMenuOpen(false) }} className="w-full flex items-center gap-2 text-sm text-red-400 py-2 border-t border-white/10 pt-3">
              <LogOut className="w-4 h-4" /> Гарах
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
