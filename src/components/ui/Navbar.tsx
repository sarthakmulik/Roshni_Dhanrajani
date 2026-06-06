import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Menu, X, User as UserIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Events', href: '/events' },
  { label: 'Journal', href: '/journal' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
]

export function Navbar() {
  const { user, profile } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [pill, setPill] = useState(false) // floating pill mode
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const heroHeightRef = useRef(0)

  useEffect(() => {
    // Measure hero height (or default to 80vh)
    const hero = document.querySelector('section[data-theme="dark"]') as HTMLElement | null
    heroHeightRef.current = hero ? hero.offsetHeight * 0.8 : window.innerHeight * 0.8

    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 60)
      setPill(window.innerWidth > 768 && y > heroHeightRef.current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [location.pathname])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isHome = location.pathname === '/'
  const headerTheme = isHome && !scrolled

  const getInitials = () => {
    if (!profile?.full_name) return 'U'
    return profile.full_name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <>
      {/* ── FLOATING PILL MODE ── */}
      <AnimatePresence>
        {pill && (
          <motion.nav
            key="pill-nav"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: '18px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 500,
              background: 'rgba(250,247,242,0.88)',
              backdropFilter: 'blur(20px)',
              borderRadius: '999px',
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
              border: '1px solid rgba(200,168,130,0.3)',
              boxShadow: '0 8px 32px rgba(44,36,32,0.12)',
              whiteSpace: 'nowrap',
            }}
            className="hide-mobile"
          >
            <Link
              to="/"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.25em',
                color: 'var(--color-text)',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              PIO
            </Link>
            <div style={{ width: '1px', height: '16px', background: 'var(--color-soft)' }} />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="nav-link"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ width: '1px', height: '16px', background: 'var(--color-soft)' }} />
            <Link
              to="/events"
              className="btn-primary"
              style={{ padding: '7px 18px', fontSize: '0.68rem', textDecoration: 'none' }}
              data-cursor="BOOK"
            >
              Book
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── STANDARD NAVBAR ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 500,
          padding: '0 40px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease, opacity 0.4s ease',
          background: scrolled ? 'rgba(250, 247, 242, 0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          boxShadow: scrolled ? '0 1px 20px rgba(44,36,32,0.08)' : 'none',
          opacity: pill ? 0 : 1,
          pointerEvents: pill ? 'none' : 'auto',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.15rem',
            fontWeight: 600,
            letterSpacing: '0.3em',
            color: headerTheme ? 'var(--color-white)' : 'var(--color-text)',
            textTransform: 'uppercase',
            transition: 'color 0.4s ease',
            textDecoration: 'none',
          }}
        >
          PULSE IT OUT
        </Link>

        {/* Desktop Nav */}
        <div
          className="hide-mobile"
          style={{ display: 'flex', alignItems: 'center', gap: '32px' }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="nav-link"
              style={{
                color: headerTheme ? 'rgba(255,255,255,0.85)' : 'var(--color-text)',
                transition: 'color 0.4s ease',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <Link
              to="/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                color: headerTheme ? 'var(--color-white)' : 'var(--color-text)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                background: headerTheme ? 'rgba(255,255,255,0.1)' : 'rgba(200,168,130,0.12)',
                padding: '6px 14px',
                borderRadius: '20px',
                border: headerTheme ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--color-soft)',
                transition: 'all 0.25s ease',
              }}
              className="nav-user-pill"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Profile'}
                  style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: headerTheme ? 'var(--color-primary)' : 'var(--color-accent)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                  }}
                >
                  {getInitials()}
                </div>
              )}
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/auth/login"
              style={{
                color: headerTheme ? 'rgba(255,255,255,0.85)' : 'var(--color-text)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = headerTheme ? 'rgba(255,255,255,0.85)' : 'var(--color-text)'}
            >
              Log In
            </Link>
          )}

          <Link to="/events" className="btn-outline" style={{ padding: '10px 24px', textDecoration: 'none' }} data-cursor="BOOK">
            Book Now
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="show-mobile-only"
          onClick={() => setMobileOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: headerTheme ? 'var(--color-white)' : 'var(--color-text)',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'var(--color-text)',
              zIndex: 600,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '30px',
            }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'none',
                border: 'none',
                color: 'var(--color-white)',
                padding: '8px',
              }}
              aria-label="Close menu"
            >
              <X size={28} />
            </button>

            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                letterSpacing: '0.3em',
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}
            >
              PULSE IT OUT
            </div>

            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2rem',
                    fontWeight: 500,
                    color: 'var(--color-white)',
                    letterSpacing: '0.02em',
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            {user ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.8rem',
                    fontWeight: 500,
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <UserIcon size={24} /> Dashboard
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <Link
                  to="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.8rem',
                    fontWeight: 500,
                    color: 'var(--color-white)',
                    textDecoration: 'none',
                  }}
                >
                  Log In
                </Link>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              style={{ marginTop: '10px' }}
            >
              <Link
                to="/events"
                className="btn-outline"
                onClick={() => setMobileOpen(false)}
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', textDecoration: 'none' }}
              >
                Book Now
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
