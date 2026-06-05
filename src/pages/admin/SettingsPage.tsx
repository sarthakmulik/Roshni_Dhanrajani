import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Check, Eye, EyeOff } from 'lucide-react'

export function AdminSettingsPage() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ email })
      if (error) throw error
      toast.success('Email updated! Please check your inbox for verification.')
      setEmail('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update email')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid var(--color-soft)',
    borderRadius: '10px',
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    color: 'var(--color-text)',
    outline: 'none',
    background: '#fafafa',
    transition: 'border-color 0.25s ease',
  }

  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.65rem',
    fontWeight: 700 as const,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'rgba(44,36,32,0.5)',
    marginBottom: '8px',
  }

  const CardSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: 'white', borderRadius: '16px', padding: '36px', boxShadow: 'var(--shadow-soft)', marginBottom: '24px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--color-text)', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid var(--color-soft)' }}>
        {title}
      </h2>
      {children}
    </div>
  )

  return (
    <AdminLayout>
      <div style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 500, color: 'var(--color-text)', marginBottom: '4px' }}>Settings</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(44,36,32,0.5)' }}>Manage your admin account settings</p>
        </div>

        {/* Update Email */}
        <CardSection title="Update Email Address">
          <form onSubmit={handleUpdateEmail}>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>New Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                placeholder="new@email.com"
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--color-soft)')}
              />
            </div>
            <button type="submit" disabled={loading || !email} className="btn-primary" style={{ opacity: loading || !email ? 0.6 : 1 }}>
              <Check size={16} /> Update Email
            </button>
          </form>
        </CardSection>

        {/* Update Password */}
        <CardSection title="Change Password">
          <form onSubmit={handleUpdatePassword}>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  placeholder="Min. 6 characters"
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--color-soft)')}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(44,36,32,0.4)', padding: '4px' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ ...inputStyle, borderColor: confirmPassword && newPassword !== confirmPassword ? '#E74C3C' : 'var(--color-soft)' }}
                placeholder="Repeat new password"
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={(e) => (e.target.style.borderColor = confirmPassword && newPassword !== confirmPassword ? '#E74C3C' : 'var(--color-soft)')}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <div style={{ color: '#E74C3C', fontSize: '0.78rem', marginTop: '6px' }}>Passwords do not match</div>
              )}
            </div>

            <button type="submit" disabled={loading || !newPassword || newPassword !== confirmPassword} className="btn-primary" style={{ opacity: loading || !newPassword || newPassword !== confirmPassword ? 0.6 : 1 }}>
              <Check size={16} /> Update Password
            </button>
          </form>
        </CardSection>

        {/* Info */}
        <div style={{ padding: '20px', background: 'rgba(200,168,130,0.08)', border: '1px solid rgba(200,168,130,0.3)', borderRadius: '12px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'rgba(44,36,32,0.6)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--color-accent)' }}>Note:</strong> Email changes require verification via your inbox. Password changes take effect immediately and will log you out of other sessions.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
