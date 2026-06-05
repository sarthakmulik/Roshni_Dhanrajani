import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout, authInputStyle, authLabelStyle, GoogleButton, AuthDivider } from '@/components/auth/AuthLayout'
import { toast } from 'react-hot-toast'

export function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !password) {
      setError('Full name, email, and password are required.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await signUp({
        email,
        password,
        fullName,
        phone: phone || undefined,
        city: city || undefined,
      })
      toast.success('Account created successfully! Welcome to Pulse It Out.')
      
      const sessionRedirect = sessionStorage.getItem('redirectAfterLogin')
      if (sessionRedirect) {
        sessionStorage.removeItem('redirectAfterLogin')
        navigate(sessionRedirect)
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
      toast.error(err.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || 'Google authentication failed')
      toast.error(err.message || 'Google login failed')
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout title="Begin Your Journey" subtitle="Create an account to start booking classes and retreats.">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
          <label htmlFor="fullName" style={authLabelStyle}>Full Name *</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={authInputStyle}
            placeholder="Roshni Dhanrajani"
            disabled={loading || googleLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="email" style={authLabelStyle}>Email Address *</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={authInputStyle}
            placeholder="you@example.com"
            disabled={loading || googleLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="password" style={authLabelStyle}>Password * (Min 6 chars)</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={authInputStyle}
            placeholder="••••••••"
            disabled={loading || googleLoading}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label htmlFor="phone" style={authLabelStyle}>Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={authInputStyle}
              placeholder="+91 98765 43210"
              disabled={loading || googleLoading}
            />
          </div>
          <div>
            <label htmlFor="city" style={authLabelStyle}>City</label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={authInputStyle}
              placeholder="Mumbai"
              disabled={loading || googleLoading}
            />
          </div>
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
            transition: 'background 0.2s ease',
            opacity: loading ? 0.7 : 1,
            marginTop: '10px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-accent)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-text)'}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <AuthDivider />

      <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(44,36,32,0.6)' }}>
          Already have an account?{' '}
          <Link
            to="/auth/login"
            style={{
              fontWeight: 600,
              color: 'var(--color-text)',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Log in
          </Link>
        </span>
      </div>
    </AuthLayout>
  )
}
