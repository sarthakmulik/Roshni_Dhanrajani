import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function AuthCallback() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      const sessionRedirect = sessionStorage.getItem('redirectAfterLogin')
      if (sessionRedirect) {
        sessionStorage.removeItem('redirectAfterLogin')
        navigate(sessionRedirect)
      } else {
        navigate(user ? '/dashboard' : '/auth/login')
      }
    }
  }, [user, loading, navigate])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
      }}
    >
      <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--color-soft)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-text)', letterSpacing: '0.05em' }}>
        Completing secure connection...
      </p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
