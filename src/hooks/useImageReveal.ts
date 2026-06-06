import { useEffect, useRef } from 'react'

/**
 * Attaches a staggered colored-overlay slide-off reveal
 * to all elements matching `.img-reveal` in the document.
 *
 * Usage: wrap images like:
 *   <div className="img-reveal"><img .../></div>
 *
 * The reveal overlay slides from left to right (scaleX: 1 → 0).
 */
export function useImageReveal(deps: unknown[] = []) {
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.img-reveal:not([data-revealed])'))

    if (targets.length === 0) return

    observerRef.current?.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            el.setAttribute('data-revealed', 'true')
            const overlay = el.querySelector<HTMLElement>('.img-reveal-overlay')
            if (overlay) {
              overlay.style.transformOrigin = 'right center'
              overlay.style.transform = 'scaleX(0)'
            }
            observerRef.current?.unobserve(el)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    targets.forEach((el) => observerRef.current?.observe(el))

    return () => observerRef.current?.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
