const TICKER_ITEMS = [
  'PILATES',
  '✦',
  'WELLNESS',
  '✦',
  'MOVEMENT',
  '✦',
  'ROSHNI DHANRAJANI',
  '✦',
  'PUNE',
  '✦',
  'TRANSFORM',
  '✦',
  'BREATHE',
  '✦',
  'ELEVATE',
  '✦',
]

interface MarqueeTickerProps {
  dark?: boolean
}

export function MarqueeTicker({ dark = false }: MarqueeTickerProps) {
  const textColor = dark ? 'rgba(255,255,255,0.5)' : 'rgba(44,36,32,0.4)'
  const accentColor = dark ? 'var(--color-primary)' : 'var(--color-primary)'
  const bg = dark ? 'var(--color-text)' : 'var(--color-soft)'

  const items = [...TICKER_ITEMS, ...TICKER_ITEMS] // double for seamless loop

  return (
    <div
      style={{
        background: bg,
        borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(200,168,130,0.25)'}`,
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(200,168,130,0.25)'}`,
        overflow: 'hidden',
        padding: '14px 0',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div className="marquee-track">
        {items.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: item === '✦' ? 'serif' : 'var(--font-heading)',
              fontSize: item === '✦' ? '0.55rem' : '0.68rem',
              fontWeight: 700,
              letterSpacing: item === '✦' ? '0' : '0.18em',
              textTransform: 'uppercase',
              color: item === '✦' ? accentColor : textColor,
              padding: '0 24px',
              flexShrink: 0,
              display: 'inline-block',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
