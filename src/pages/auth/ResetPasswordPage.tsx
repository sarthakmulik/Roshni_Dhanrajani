import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout, authInputStyle, authLabelStyle } from '@/components/auth/AuthLayout'
import { toast } from 'react-hot-toast'

export function ResetPasswordPage() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')
    try {
      await updatePassword(password)
      toast.success('Your password has been successfully reset!')
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
      toast.error(err.message || 'Error resetting password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Choose a strong new password for your account.">
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
          <label htmlFor="password" style={authLabelStyle}>New Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={authInputStyle}
            placeholder="••••••••"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" style={authLabelStyle}>Confirm New Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={authInputStyle}
            placeholder="••••••••"
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
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </AuthLayout>
  )
}
