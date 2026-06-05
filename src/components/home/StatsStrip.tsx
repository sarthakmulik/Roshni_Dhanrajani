import { Users, Calendar, Award } from 'lucide-react'

const stats = [
  { icon: <Users size={28} />, value: '200+', label: 'Students Coached' },
  { icon: <Calendar size={28} />, value: '50+', label: 'Events Hosted' },
  { icon: <Award size={28} />, value: '5 Yrs', label: 'Experience' },
]

export function StatsStrip() {
  return (
    <section style={{ background: 'var(--color-bg)', padding: '0' }}>
      <div className="container">
        <div className="gold-rule" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0',
            padding: '48px 0',
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="reveal"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '24px 20px',
                borderRight: i < stats.length - 1 ? '1px solid rgba(200,168,130,0.25)' : 'none',
                transitionDelay: `${i * 0.1}s`,
              }}
            >
              <div style={{ color: 'var(--color-primary)' }}>{stat.icon}</div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.8rem',
                  fontWeight: 500,
                  color: 'var(--color-text)',
                  lineHeight: 1,
                }}
              >
                {stat.value}
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
          ))}
        </div>
        <div className="gold-rule" />
      </div>

      <style>{`
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
