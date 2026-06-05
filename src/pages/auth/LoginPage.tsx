import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout, authInputStyle, authLabelStyle, authErrorStyle, GoogleButton, AuthDivider } from '@/components/auth/AuthLayout'
import { toast } from 'react-hot-toast'

export function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
      toast.success('Welcome back to Pulse It Out!')
      // Check if redirect target is in sessionStorage (e.g. from booking flow)
      const sessionRedirect = sessionStorage.getItem('redirectAfterLogin')
      if (sessionRedirect) {
        sessionStorage.removeItem('redirectAfterLogin')
        navigate(sessionRedirect)
      } else {
        navigate(redirect)
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    try {
      // Save redirect target if present
      const sessionRedirect = sessionStorage.getItem('redirectAfterLogin')
      if (sessionRedirect) {
        // OAuth uses page redirects, so we rely on callback handling or sessionStorage to pick it up later
      } else if (redirect) {
        sessionStorage.setItem('redirectAfterLogin', redirect)
      }
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || 'Google authentication failed')
      toast.error(err.message || 'Google login failed')
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Log in to view your bookings and manage your profile.">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: '#FDEDEC',
              border: '1.5px solid #FADBD8',
              borderRadius: '10px',
              color: '#C0392B',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-body)',
            }}
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" style={authLabelStyle}>Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={authInputStyle}
            placeholder="you@example.com"
            disabled={loading || googleLoading}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
            <label htmlFor="password" style={{ ...authLabelStyle, marginBottom: 0 }}>Password</label>
            <Link
              to="/auth/forgot-password"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                color: 'var(--color-accent)',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={authInputStyle}
            placeholder="••••••••"
            disabled={loading || googleLoading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--color-text)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'none',
            transition: 'background 0.2s ease, transform 0.1s ease',
            opacity: loading ? 0.7 : 1,
            marginTop: '8px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-accent)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-text)'}
        >
          {loading ? 'Logging in...' : 'Sign In'}
        </button>
      </form>

      <AuthDivider />

      <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />

      <div style={{ textAlign: 'center', marginTop: '28px' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(44,36,32,0.6)' }}>
          Don't have an account?{' '}
          <Link
            to="/auth/signup"
            style={{
              fontWeight: 600,
              color: 'var(--color-text)',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Sign up
          </Link>
        </span>
      </div>
    </AuthLayout>
  )
}
