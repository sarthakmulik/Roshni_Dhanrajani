import { Routes, Route, useLocation, Outlet } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { UserGuard, AdminGuard } from '@/components/auth/AuthGuard'
import { useLenis } from '@/hooks/useLenis'

// Pages
import { HomePage } from '@/pages/HomePage'
import { EventsPage } from '@/pages/EventsPage'
import { BookingPage } from '@/pages/BookingPage'
import { DashboardPage } from '@/pages/DashboardPage'

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { AuthCallback } from '@/pages/auth/AuthCallback'

// Admin Pages
import { AdminLoginPage } from '@/pages/admin/LoginPage'
import { AdminDashboard } from '@/pages/admin/DashboardPage'
import { AdminEventsPage } from '@/pages/admin/EventsManagePage'
import { AdminBookingsPage } from '@/pages/admin/BookingsPage'
import { AdminTestimonialsPage } from '@/pages/admin/TestimonialsPage'
import { AdminSettingsPage } from '@/pages/admin/SettingsPage'

// Public layout (with navbar + footer) using Outlet for clean Layout Routing
function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

export default function App() {
  const location = useLocation()
  useLenis()

  return (
    <>
      <CustomCursor />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            background: 'var(--color-text)',
            color: 'white',
            borderRadius: '10px',
            padding: '14px 20px',
            boxShadow: '0 4px 24px rgba(44,36,32,0.1)',
            border: '1px solid var(--color-soft)',
          },
          success: {
            iconTheme: { primary: 'var(--color-sage)', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: '#E74C3C', secondary: 'white' },
          },
        }}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          
          {/* Public Pages (wrapped in PublicLayout with Nav & Footer) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/book/:eventId" element={<BookingPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route
              path="/dashboard"
              element={
                <UserGuard>
                  <DashboardPage />
                </UserGuard>
              }
            />
          </Route>

          {/* Auth Pages (Clean view - no Nav/Footer) */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Admin Pages (Clean view - custom Admin sidebar) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/events"
            element={
              <AdminGuard>
                <AdminEventsPage />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <AdminGuard>
                <AdminBookingsPage />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/testimonials"
            element={
              <AdminGuard>
                <AdminTestimonialsPage />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminGuard>
                <AdminSettingsPage />
              </AdminGuard>
            }
          />
          <Route path="/admin" element={<AdminLoginPage />} />

          {/* 404 Fallback Page */}
          <Route
            path="*"
            element={
              <div
                style={{
                  minHeight: '100vh',
                  background: 'var(--color-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '20px',
                  padding: '24px',
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '6rem', fontWeight: 300, color: 'var(--color-primary)' }}>404</div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 500 }}>Page not found</h1>
                <a href="/" className="btn-primary" style={{ padding: '12px 24px', background: 'var(--color-text)', color: 'white', borderRadius: '30px', textDecoration: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                  Return Home
                </a>
              </div>
            }
          />

        </Routes>
      </AnimatePresence>
    </>
  )
}
