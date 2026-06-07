import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { X } from 'lucide-react'

interface BookingSnippet {
  full_name: string
  city: string | null
  created_at: string
}

function getFirstName(fullName: string): string {
  return fullName.trim().split(' ')[0] || fullName
}

const INTERVAL_MS = 45000 // 45 seconds

export function SocialProofToast() {
  console.log("SocialProofToast v2 (Single Display Per Session) Loaded.");
  const [booking, setBooking] = useState<BookingSnippet | null>(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    return !!sessionStorage.getItem('social_proof_dismissed')
  })

  const fetchLatestBooking = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_latest_booking_toast')
        .maybeSingle()

      if (error || !data) return
      setBooking(data)
    } catch {
      // Silently fail
    }
  }, [])

  useEffect(() => {
    fetchLatestBooking()
  }, [fetchLatestBooking])

  useEffect(() => {
    if (!booking || dismissed) return

    // Delay first toast by 8 seconds
    const firstTimer = setTimeout(() => {
      setVisible(true)
      setDismissed(true)
      sessionStorage.setItem('social_proof_dismissed', 'true')
    }, 8000)

    return () => clearTimeout(firstTimer)
  }, [booking, dismissed])

  useEffect(() => {
    if (!visible) return
    // Auto-hide after 6 seconds
    const hideTimer = setTimeout(() => {
      setVisible(false)
    }, 6000)
    return () => clearTimeout(hideTimer)
  }, [visible])

  if (!booking) return null

  const timeDiff = Math.floor((Date.now() - new Date(booking.created_at).getTime()) / 60000)
  const timeLabel =
    timeDiff < 60 ? `${timeDiff}m ago` : `${Math.floor(timeDiff / 60)}h ago`

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -40, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -30, y: 10 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
          style={{
            position: 'fixed',
            bottom: '32px',
            left: '24px',
            zIndex: 400,
            background: 'white',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(44,36,32,0.14)',
            border: '1px solid var(--color-soft)',
            padding: '16px 18px',
            maxWidth: '280px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          {/* Green dot */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontFamily: 'var(--font-display)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {getFirstName(booking.full_name)[0]}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.82rem',
                color: 'var(--color-text)',
                lineHeight: 1.4,
              }}
            >
              <strong style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                {getFirstName(booking.full_name)}
              </strong>
              {booking.city ? ` from ${booking.city}` : ''} just booked a session 🎉
            </div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
                color: 'rgba(44,36,32,0.4)',
                marginTop: '4px',
                textTransform: 'uppercase',
              }}
            >
              {timeLabel} · Pulse It Out
            </div>
          </div>

          <button
            onClick={() => {
              setVisible(false)
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              color: 'rgba(44,36,32,0.35)',
              flexShrink: 0,
              lineHeight: 1,
            }}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
