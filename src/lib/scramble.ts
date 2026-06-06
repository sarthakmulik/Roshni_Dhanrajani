/**
 * Scrambles an element's text through random characters then resolves to the final text.
 * Pure rAF-based — no external library.
 */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&'

export function scrambleText(
  el: HTMLElement,
  finalText: string,
  duration = 1000,
  delay = 0
): () => void {
  let frame: number
  let start: number | null = null
  let running = true

  const run = (timestamp: number) => {
    if (!running) return
    if (!start) start = timestamp + delay
    if (timestamp < start) {
      frame = requestAnimationFrame(run)
      return
    }

    const elapsed = timestamp - start
    const progress = Math.min(elapsed / duration, 1)

    // How many characters have "settled" — grows from 0 to full length
    const settled = Math.floor(progress * finalText.length)

    let output = ''
    for (let i = 0; i < finalText.length; i++) {
      if (i < settled) {
        output += finalText[i]
      } else if (finalText[i] === ' ') {
        output += ' '
      } else {
        output += CHARS[Math.floor(Math.random() * CHARS.length)]
      }
    }
    el.textContent = output

    if (progress < 1) {
      frame = requestAnimationFrame(run)
    } else {
      el.textContent = finalText
    }
  }

  frame = requestAnimationFrame(run)

  return () => {
    running = false
    cancelAnimationFrame(frame)
    el.textContent = finalText
  }
}
