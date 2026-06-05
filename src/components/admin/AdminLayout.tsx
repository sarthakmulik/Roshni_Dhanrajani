import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Events', href: '/admin/events', icon: <Calendar size={18} /> },
  { label: 'Bookings', href: '/admin/bookings', icon: <BookOpen size={18} /> },
  { label: 'Testimonials', href: '/admin/testimonials', icon: <MessageSquare size={18} /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings size={18} /> },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    navigate('/admin/login')
  }

  const Sidebar = () => (
    <div className="admin-sidebar">
      {/* Logo */}
      <Link
        to="/"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.95rem',
          fontWeight: 600,
          letterSpacing: '0.25em',
          color: 'var(--color-primary)',
          textTransform: 'uppercase',
          padding: '0 16px',
          marginBottom: '16px',
          display: 'block',
        }}
      >
        PULSE IT OUT
      </Link>
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.25)',
          padding: '0 16px',
          marginBottom: '32px',
        }}
      >
        Admin Dashboard
      </div>

      <div className="gold-rule" style={{ opacity: 0.1, marginBottom: '24px' }} />

      {/* Nav Items */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`admin-sidebar-link ${location.pathname === item.href ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="gold-rule" style={{ opacity: 0.1, margin: '24px 0' }} />

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="admin-sidebar-link"
        style={{ width: '100%', textAlign: 'left' }}
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <div className="hide-mobile">
        <Sidebar />
      </div>

      {/* Mobile top bar */}
      <div
        className="show-mobile-only"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          background: 'var(--color-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 200,
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', letterSpacing: '0.2em', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
          PIO Admin
        </span>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', color: 'white', padding: '8px' }}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar overlay */}
      {mobileOpen && (
        <div
          className="show-mobile-only"
          style={{ position: 'fixed', inset: 0, zIndex: 150, display: 'flex' }}
        >
          <div style={{ width: '260px', height: '100%', background: 'var(--color-text)', padding: '80px 20px 32px' }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`admin-sidebar-link ${location.pathname === item.href ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <button onClick={handleLogout} className="admin-sidebar-link" style={{ width: '100%', textAlign: 'left', marginTop: '16px' }}>
                <LogOut size={18} /> Logout
              </button>
            </nav>
          </div>
          <div onClick={() => setMobileOpen(false)} style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} />
        </div>
      )}

      {/* Main content */}
      <main className="admin-main" style={{ flex: 1, paddingTop: '40px' }}>
        {/* Mobile spacer */}
        <div className="show-mobile-only" style={{ height: '56px' }} />
        {children}
      </main>
    </div>
  )
}
