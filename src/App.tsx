import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Toast from './components/Toast'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Login from './pages/Login'
import Checkout from './pages/Checkout'
import UserDashboard from './pages/UserDashboard'
import AdminPanel from './pages/AdminPanel'
import DeliveryApp from './pages/DeliveryApp'

function RequireRole({ role, children }: { role: string; children: JSX.Element }) {
  const { state } = useApp()
  if (!state.user) return <Navigate to="/login" replace />
  if (state.user.role !== role) return <Navigate to="/" replace />
  return children
}

function PublicLayout({ children }: { children: JSX.Element }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <CartDrawer />
      <Toast />
      <Routes>
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={
          <PublicLayout>
            <Checkout />
          </PublicLayout>
        } />
        <Route path="/dashboard" element={
          <RequireRole role="customer">
            <PublicLayout><UserDashboard /></PublicLayout>
          </RequireRole>
        } />
        <Route path="/admin" element={
          <RequireRole role="admin">
            <><Navbar /><AdminPanel /></>
          </RequireRole>
        } />
        <Route path="/delivery" element={
          <RequireRole role="driver">
            <><Navbar /><DeliveryApp /></>
          </RequireRole>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
