import { useEffect, useRef } from 'react'

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollTop / docHeight : 0
      bar.style.height = `${progress * 100}vh`
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '3px',
        height: '100vh',
        zIndex: 999,
        pointerEvents: 'none',
        background: 'rgba(200,168,130,0.12)',
      }}
    >
      <div
        ref={barRef}
        style={{
          width: '100%',
          height: '0',
          background: 'linear-gradient(to bottom, var(--color-primary), var(--color-accent))',
          transition: 'height 0.05s linear',
          borderRadius: '0 0 3px 0',
        }}
      />
    </div>
  )
}
