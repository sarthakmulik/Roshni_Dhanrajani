import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Minimal header */}
      <header
        style={{
          padding: '24px 40px',
          borderBottom: '1px solid var(--color-soft)',
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            fontWeight: 600,
            letterSpacing: '0.25em',
            color: 'var(--color-accent)',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          PULSE IT OUT
        </Link>
      </header>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          {/* Decorative rule */}
          <div
            style={{
              width: '40px',
              height: '2px',
              background: 'var(--color-primary)',
              marginBottom: '24px',
            }}
          />

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.4rem',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '8px',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                color: 'rgba(44,36,32,0.55)',
                marginBottom: '36px',
                lineHeight: 1.6,
              }}
            >
              {subtitle}
            </p>
          )}

          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: '0 4px 40px rgba(44,36,32,0.07)',
              border: '1px solid var(--color-soft)',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Shared input style
export const authInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  border: '1.5px solid var(--color-soft)',
  borderRadius: '10px',
  fontFamily: 'var(--font-body)',
  fontSize: '0.95rem',
  color: 'var(--color-text)',
  outline: 'none',
  background: '#FAFAF8',
  transition: 'border-color 0.2s ease',
  boxSizing: 'border-box',
}

export const authLabelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-heading)',
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'rgba(44,36,32,0.5)',
  marginBottom: '7px',
}

export const authErrorStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#D94F3D',
  marginTop: '5px',
  fontFamily: 'var(--font-body)',
}

// Google OAuth button
export function GoogleButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%',
        padding: '13px 16px',
        background: 'white',
        border: '1.5px solid var(--color-soft)',
        borderRadius: '10px',
        fontFamily: 'var(--font-body)',
        fontSize: '0.95rem',
        color: 'var(--color-text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        cursor: 'none',
        transition: 'border-color 0.2s ease, background 0.2s ease',
        opacity: loading ? 0.7 : 1,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-bg)' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-soft)'; e.currentTarget.style.background = 'white' }}
    >
      {/* Google G logo SVG */}
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
      Continue with Google
    </button>
  )
}

// Divider
export function AuthDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-soft)' }} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'rgba(44,36,32,0.4)' }}>or</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-soft)' }} />
    </div>
  )
}
