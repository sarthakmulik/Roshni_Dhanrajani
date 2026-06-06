import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
}

// Curtain variants — champagne gold sweep
const curtainVariants = {
  initial: { scaleX: 1, transformOrigin: 'right center' },
  animate: {
    scaleX: 0,
    transformOrigin: 'right center',
    transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] as const, delay: 0.1 },
  },
  exit: {
    scaleX: 1,
    transformOrigin: 'left center',
    transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] as const },
  },
}

const contentVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const, delay: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: 'easeIn' as const },
  },
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const key = location.pathname

  return (
    <>
      {/* Curtain layer — sits above content */}
      <motion.div
        variants={curtainVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
          zIndex: 800,
          pointerEvents: 'none',
        }}
      />

      {/* Page content */}
      <motion.div
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </>
  )
}
