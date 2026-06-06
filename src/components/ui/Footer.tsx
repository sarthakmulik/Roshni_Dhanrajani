import { Link } from 'react-router-dom'
import { Camera, Play, MessageCircle } from 'lucide-react'

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--color-text)',
        color: 'var(--color-white)',
        padding: '60px 0 32px',
      }}
    >
      <div className="container">
        {/* Top Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '40px',
            paddingBottom: '48px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
          className="footer-grid"
        >
          {/* Logo + Tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontWeight: 600,
                letterSpacing: '0.3em',
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
              }}
            >
              PULSE IT OUT
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.7,
                maxWidth: '240px',
              }}
            >
              Premium Pilates experiences crafted for your transformation journey.
            </p>
            <div className="gold-rule-short" />
          </div>

          {/* Navigation */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--color-primary)',
                marginBottom: '4px',
              }}
            >
              Navigation
            </span>
            {[
              { label: 'Home', href: '/' },
              { label: 'Events', href: '/events' },
              { label: 'Journal', href: '/journal' },
              { label: 'About', href: '/#about' },
              { label: 'Book a Session', href: '/events' },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.href}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.55)',
                  transition: 'color 0.25s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Socials */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignItems: 'flex-end',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--color-primary)',
                marginBottom: '4px',
              }}
            >
              Connect
            </span>
            {[
              { icon: <Camera size={20} />, label: 'Instagram', href: 'https://www.instagram.com/roshni.dhanrajani/' },
              { icon: <MessageCircle size={20} />, label: 'WhatsApp', href: 'https://wa.me' },
              { icon: <Play size={20} />, label: 'YouTube', href: 'https://youtube.com' },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'rgba(255,255,255,0.55)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  transition: 'color 0.25s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
              >
                {social.icon}
                {social.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            paddingTop: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            © {new Date().getFullYear()} Pulse It Out. Designed with ❤️ for Roshni Dhanrajani
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            Privacy Policy · Terms of Service
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .footer-grid > div {
            align-items: center !important;
          }
        }
      `}</style>
    </footer>
  )
}
