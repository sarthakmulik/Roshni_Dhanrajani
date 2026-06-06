import { useEffect, useRef } from 'react'

/** Animates a numeric value from 0 to target on intersection */
function useCountUp(ref: React.RefObject<HTMLSpanElement | null>, target: number, duration = 2000, suffix = '') {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        let start: number | null = null
        const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // ease-in-out

        const step = (timestamp: number) => {
          if (!start) start = timestamp
          const progress = Math.min((timestamp - start) / duration, 1)
          const value = Math.floor(ease(progress) * target)
          el.textContent = value.toLocaleString('en-IN') + suffix
          if (progress < 1) requestAnimationFrame(step)
          else el.textContent = target.toLocaleString('en-IN') + suffix
        }
        requestAnimationFrame(step)
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, target, duration, suffix])
}

const statsData = [
  { numeric: 200, suffix: '+', label: 'Students Coached', icon: '👥' },
  { numeric: 50, suffix: '+', label: 'Events Hosted', icon: '📅' },
  { numeric: 5, suffix: ' Yrs', label: 'Experience', icon: '🏆' },
]

function StatItem({ stat, index }: { stat: typeof statsData[0]; index: number }) {
  const countRef = useRef<HTMLSpanElement>(null)
  useCountUp(countRef, stat.numeric, 1800, stat.suffix)

  return (
    <div
      className="reveal"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '24px 20px',
        borderRight: index < statsData.length - 1 ? '1px solid rgba(200,168,130,0.25)' : 'none',
        transitionDelay: `${index * 0.1}s`,
      }}
    >
      <div style={{ fontSize: '1.6rem', lineHeight: 1 }}>{stat.icon}</div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.8rem',
          fontWeight: 500,
          color: 'var(--color-text)',
          lineHeight: 1,
        }}
      >
        <span ref={countRef}>0{stat.suffix}</span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(44,36,32,0.5)',
        }}
      >
        {stat.label}
      </div>
    </div>
  )
}

export function StatsStrip() {
  return (
    <section style={{ background: 'var(--color-bg)', padding: '0' }}>
      <div className="container">
        <div className="gold-rule" />
        <div
          className="stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0',
            padding: '48px 0',
          }}
        >
          {statsData.map((stat, i) => (
            <StatItem key={stat.label} stat={stat} index={i} />
          ))}
        </div>
        <div className="gold-rule" />
      </div>

      <style>{`
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .stats-grid > div { border-right: none !important; border-bottom: 1px solid rgba(200,168,130,0.25); }
          .stats-grid > div:last-child { border-bottom: none !important; }
        }
      `}</style>
    </section>
  )
}
