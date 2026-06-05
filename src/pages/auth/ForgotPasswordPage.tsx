import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout, authInputStyle, authLabelStyle } from '@/components/auth/AuthLayout'
import { toast } from 'react-hot-toast'

export function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')
    try {
      await sendPasswordReset(email)
      setSuccess(true)
      toast.success('Password reset link sent to your email!')
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset link')
      toast.error(err.message || 'Error sending reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Recover Password" subtitle="Enter your email address to receive a password recovery link.">
      {success ? (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              padding: '16px',
              background: 'rgba(156,175,136,0.15)',
              border: '1.5px solid var(--color-sage)',
              borderRadius: '10px',
              color: 'var(--color-text)',
              fontSize: '0.95rem',
              lineHeight: '1.5',
              fontFamily: 'var(--font-body)',
            }}
          >
            We have sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
          </div>
          <Link
            to="/auth/login"
            style={{
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
              textDecoration: 'none',
              cursor: 'none',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-text)'}
          >
            Back to Login
          </Link>
        </div>
      ) : (
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
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
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
              marginTop: '8px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-text)'}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <Link
              to="/auth/login"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
