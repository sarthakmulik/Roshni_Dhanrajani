import { useEffect, useState } from 'react'

export default function PulsePreloader() {
  const [visible, setVisible] = useState(true)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Session gate — only show once per browser session
    if (sessionStorage.getItem('pio-preloaded-v1')) {
      setVisible(false)
      return
    }

    // Lock scroll while preloader is active
    document.body.style.overflow = 'hidden'

    const exitTimer = setTimeout(() => {
      setExiting(true) // triggers translateY(-100%) CSS class

      setTimeout(() => {
        setVisible(false)
        document.body.style.overflow = ''
        sessionStorage.setItem('pio-preloaded-v1', 'true')
      }, 700) // exit animation duration
    }, 1700) // hold time before exit begins

    return () => {
      clearTimeout(exitTimer)
      document.body.style.overflow = ''
    }
  }, [])

  if (!visible) return null

  const letters = 'PULSE IT OUT'.split('')

  return (
    <div className={`preloader-overlay${exiting ? ' preloader-exit' : ''}`}>
      {/* SVG Monogram — P·I·O letterform stroked path */}
      <svg
        width="120"
        height="84"
        viewBox="0 0 120 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* P — vertical stem + rounded bowl */}
        <path
          d="M12 72 V12 H42 C58 12 66 20 66 31 C66 42 58 50 42 50 H22"
          className="preloader-path"
          style={{ animationDelay: '100ms' }}
        />
        {/* · dot separator */}
        <circle
          cx="75"
          cy="42"
          r="2.5"
          fill="#C8A882"
          style={{ opacity: 0, animation: 'dotFade 0.4s ease 800ms forwards' }}
        />
        {/* O — clean ellipse */}
        <ellipse
          cx="100"
          cy="42"
          rx="16"
          ry="22"
          className="preloader-path"
          style={{ animationDelay: '200ms' }}
        />
      </svg>

      {/* Brand Wordmark — individual letter stagger */}
      <div className="preloader-wordmark" aria-label="Pulse It Out">
        {letters.map((char, i) => (
          <span
            key={i}
            className="preloader-letter"
            style={{ animationDelay: `${300 + i * 40}ms` }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      <div className="preloader-bar-track" role="progressbar" aria-label="Loading">
        <div className="preloader-bar-fill" />
      </div>
    </div>
  )
}
