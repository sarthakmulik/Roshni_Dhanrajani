import { ArrowRight } from 'lucide-react'

export function AboutSection() {
  return (
    <section
      id="about"
      className="section-padding"
      style={{ background: 'var(--color-bg)', overflow: 'hidden' }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
          }}
          className="about-grid"
        >
          {/* Left: Image */}
          <div
            className="reveal"
            style={{
              position: 'relative',
              paddingBottom: '40px',
              paddingRight: '40px',
            }}
          >
            <div
              style={{
                width: '100%',
                aspectRatio: '3/4',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80"
                alt="Roshni Dhanrajani - Pilates Trainer"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                }}
              />
            </div>

            {/* Decorative offset box */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '55%',
                height: '45%',
                border: '1.5px solid var(--color-primary)',
                borderRadius: '12px',
                zIndex: 0,
                opacity: 0.4,
              }}
            />

            {/* Floating experience badge */}
            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                left: '-20px',
                background: 'var(--color-primary)',
                color: 'var(--color-white)',
                borderRadius: '12px',
                padding: '20px 24px',
                zIndex: 2,
                boxShadow: 'var(--shadow-med)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.2rem',
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                5+
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginTop: '6px',
                  opacity: 0.85,
                }}
              >
                Years of Excellence
              </div>
            </div>
          </div>

          {/* Right: Text */}
          <div
            className="reveal"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '28px',
              transitionDelay: '0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="gold-rule-short" />
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--color-primary)',
                }}
              >
                About Roshni
              </span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 500,
                color: 'var(--color-text)',
                lineHeight: 1.2,
              }}
            >
              A Journey of Movement & Mindfulness
            </h2>

            {/* Pull Quote */}
            <blockquote
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'var(--color-accent)',
                lineHeight: 1.5,
                paddingLeft: '24px',
                borderLeft: '2px solid var(--color-primary)',
              }}
            >
              "Pilates changed my life. Now I'm here to change yours."
            </blockquote>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'rgba(44,36,32,0.7)',
                lineHeight: 1.8,
              }}
            >
              With over 5 years of experience and 200+ students coached, Roshni brings a deeply
              personal, science-backed approach to Pilates. Every session is crafted to meet you
              exactly where you are — and take you further than you thought possible.
            </p>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'rgba(44,36,32,0.7)',
                lineHeight: 1.8,
              }}
            >
              Certified in classical and contemporary Pilates methodologies, her teaching philosophy
              centers on intentional movement, breath awareness, and building a practice that
              serves your whole life.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a href="#events" className="btn-primary">
                Explore Events <ArrowRight size={16} />
              </a>
              <button
                className="btn-ghost"
                style={{ padding: '10px 0', color: 'var(--color-accent)' }}
              >
                My Story →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  )
}
