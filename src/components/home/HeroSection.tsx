import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { scrambleText } from '@/lib/scramble'

// Import hero image
import heroImg from '/hero_pilates.png'

export function HeroSection() {
  const bgRef = useRef<HTMLDivElement>(null)
  const scrambleRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const onScroll = () => {
      if (bgRef.current) {
        const scrollY = window.scrollY
        bgRef.current.style.transform = `translateY(${scrollY * 0.3}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Text scramble on mount
  useEffect(() => {
    const el = scrambleRef.current
    if (!el) return
    const cancel = scrambleText(el, 'Transform.', 1100, 800)
    return cancel
  }, [])

  const wordVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2 + i * 0.12,
        duration: 0.8,
        ease: 'easeOut' as const,
      },
    }),
  }

  const staticWords = ['Move.', 'Breathe.']

  return (
    <section
      data-theme="dark"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'var(--color-text)',
      }}
    >
      {/* Background Image with Parallax */}
      <div
        ref={bgRef}
        style={{
          position: 'absolute',
          inset: '-20%',
          zIndex: 0,
        }}
      >
        <img
          src={heroImg}
          alt="Roshni Dhanrajani - Pulse It Out Pilates"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
          }}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement
            target.style.display = 'none'
          }}
        />
        {/* Dark overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(105deg, rgba(44,36,32,0.88) 0%, rgba(44,36,32,0.65) 50%, rgba(44,36,32,0.3) 100%)',
          }}
        />
      </div>

      {/* Grain overlay */}
      <div className="grain-overlay" style={{ zIndex: 1 }} />

      {/* Content */}
      <div
        className="container hero-grid"
        style={{
          position: 'relative',
          zIndex: 2,
          paddingTop: '120px',
          paddingBottom: '80px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
        }}
      >
        {/* Left: Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div className="gold-rule-short" />
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-primary)',
              }}
            >
              Premium Pilates Experience
            </span>
          </motion.div>

          {/* Headline — first two words animate in, last word scrambles */}
          <div style={{ overflow: 'hidden', perspective: '1000px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(3.5rem, 7vw, 6rem)',
                fontWeight: 500,
                lineHeight: 1.0,
                color: 'var(--color-white)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.2em',
              }}
            >
              {staticWords.map((word, i) => (
                <motion.span
                  key={word}
                  custom={i}
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ display: 'inline-block' }}
                >
                  {word}
                </motion.span>
              ))}
              {/* Scramble word */}
              <motion.span
                custom={2}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                style={{ display: 'inline-block' }}
              >
                <span
                  ref={scrambleRef}
                  style={{ display: 'inline-block', minWidth: '3ch' }}
                >
                  Transform.
                </span>
              </motion.span>
            </h1>
          </div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.1rem',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.7,
              maxWidth: '420px',
            }}
          >
            Premium Pilates experiences crafted by{' '}
            <em style={{ color: 'var(--color-primary)', fontStyle: 'italic' }}>
              Roshni Dhanrajani
            </em>
            . Transform your body, elevate your mind.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}
          >
            <a
              href="#events"
              className="btn-primary"
              data-cursor="BOOK"
            >
              Explore Events <ArrowRight size={16} />
            </a>
            <Link
              to="/events"
              className="btn-outline"
              style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'var(--color-white)' }}
              data-cursor="BOOK"
            >
              Book Your Slot
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '20px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '40px',
                border: '1.5px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '8px',
              }}
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                style={{
                  width: '4px',
                  height: '8px',
                  background: 'var(--color-primary)',
                  borderRadius: '2px',
                }}
              />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.65rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              Scroll to explore
            </span>
          </motion.div>
        </div>

        {/* Right: Decorative element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '20px',
          }}
          className="hide-mobile"
        >
          {/* Floating stat card */}
          <div
            style={{
              background: 'rgba(250,247,242,0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(200,168,130,0.3)',
              borderRadius: '16px',
              padding: '24px 32px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '3rem',
                fontWeight: 500,
                color: 'var(--color-primary)',
                lineHeight: 1,
              }}
            >
              200+
            </div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                marginTop: '8px',
              }}
            >
              Lives Transformed
            </div>
          </div>

          <div
            style={{
              background: 'rgba(250,247,242,0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(200,168,130,0.3)',
              borderRadius: '16px',
              padding: '24px 32px',
              textAlign: 'center',
              marginRight: '-20px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '3rem',
                fontWeight: 500,
                color: 'var(--color-sage)',
                lineHeight: 1,
              }}
            >
              5★
            </div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                marginTop: '8px',
              }}
            >
              Rated Excellence
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(to top, var(--color-bg), transparent)',
          zIndex: 2,
        }}
      />

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
