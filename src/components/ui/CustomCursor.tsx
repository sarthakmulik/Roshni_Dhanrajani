import { useEffect, useRef, useState } from 'react'

interface CursorState {
  label: string
  dark: boolean
  hovered: boolean
}

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const [state, setState] = useState<CursorState>({ label: '', dark: false, hovered: false })
  const stateRef = useRef(state)

  // Keep ref in sync for rAF callback
  useEffect(() => { stateRef.current = state }, [state])

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mouseX = 0, mouseY = 0
    let ringX = 0, ringY = 0
    let rafId: number

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.left = mouseX + 'px'
      dot.style.top = mouseY + 'px'
    }

    const animate = () => {
      ringX += (mouseX - ringX) * 0.08
      ringY += (mouseY - ringY) * 0.08
      ring.style.left = ringX + 'px'
      ring.style.top = ringY + 'px'
      rafId = requestAnimationFrame(animate)
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const el =
        target.closest('[data-cursor]') ||
        target.closest('a') ||
        target.closest('button')

      const cursorLabel = (el as HTMLElement | null)?.dataset?.cursor || ''
      const isInteractive = !!el
      const isDark = !!target.closest('[data-theme="dark"]')

      setState({ label: cursorLabel, dark: isDark, hovered: isInteractive })
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', onMouseOver)
    rafId = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const { label, dark, hovered } = state

  const dotSize = hovered ? 6 : 8
  const ringSize = hovered && label ? 72 : hovered ? 44 : 36

  return (
    <>
      {/* Precise dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: '50%',
          background: dark ? 'var(--color-primary)' : 'var(--color-text)',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.2s ease, height 0.2s ease, background 0.3s ease',
          mixBlendMode: dark ? 'normal' : 'multiply',
        }}
      />

      {/* Trailing ring — morphs into label pill */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          width: `${ringSize}px`,
          height: label && hovered ? '36px' : `${ringSize}px`,
          borderRadius: label && hovered ? '18px' : '50%',
          border: `1.5px solid ${dark ? 'rgba(200,168,130,0.7)' : 'rgba(44,36,32,0.35)'}`,
          background: label && hovered
            ? dark ? 'var(--color-primary)' : 'var(--color-text)'
            : 'transparent',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition:
            'width 0.3s cubic-bezier(0.16,1,0.3,1), height 0.3s cubic-bezier(0.16,1,0.3,1), border-radius 0.3s ease, background 0.3s ease, border-color 0.3s ease',
        }}
      >
        {label && hovered && (
          <span
            ref={labelRef}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'white',
              opacity: 1,
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
        )}
      </div>
    </>
  )
}
