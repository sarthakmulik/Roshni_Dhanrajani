import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

// Protects routes requiring any authenticated user
export function UserGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!user) return <Navigate to="/auth/login" replace />
  return <>{children}</>
}

// Protects routes requiring admin (is_admin = true in profiles)
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-text)' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!user) return <Navigate to="/admin/login" replace />
  if (profile && !profile.is_admin) return <Navigate to="/" replace />

  // Still loading profile — wait
  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-text)' }}>
        <div className="spinner" />
      </div>
    )
  }

  return <>{children}</>
}

// Legacy AuthGuard (backward compat) — same as AdminGuard
export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>
}
