import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Toast from './components/Toast'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Login from './pages/Login'
import Register from './pages/Register'
import Checkout from './pages/Checkout'
import UserDashboard from './pages/UserDashboard'
import AdminPanel from './pages/AdminPanel'
import DeliveryApp from './pages/DeliveryApp'
import ProductDetail from './pages/ProductDetail'

function RequireRole({ role, children }: { role: string; children: JSX.Element }) {
  const { state } = useApp()
  if (!state.user) return <Navigate to="/login" replace />
  if (state.user.role !== role) return <Navigate to="/shop" replace />
  return children
}

/** Redirect drivers away from non-delivery pages */
function DriverGuard({ children }: { children: JSX.Element }) {
  const { state } = useApp()
  const location = useLocation()
  if (state.user?.role === 'driver' && location.pathname !== '/delivery') {
    return <Navigate to="/delivery" replace />
  }
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
        <Route path="/" element={<Navigate to="/shop" replace />} />
        <Route path="/home" element={
          <DriverGuard><PublicLayout><Home /></PublicLayout></DriverGuard>
        } />
        <Route path="/shop" element={
          <DriverGuard><PublicLayout><Shop /></PublicLayout></DriverGuard>
        } />
        <Route path="/shop/:productId" element={
          <DriverGuard><PublicLayout><ProductDetail /></PublicLayout></DriverGuard>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={
          <DriverGuard>
            <PublicLayout><Checkout /></PublicLayout>
          </DriverGuard>
        } />
        <Route path="/dashboard" element={
          <RequireRole role="customer">
            <DriverGuard><PublicLayout><UserDashboard /></PublicLayout></DriverGuard>
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
        <Route path="*" element={<Navigate to="/shop" replace />} />
      </Routes>
    </HashRouter>
  )
}
