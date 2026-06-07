import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, ChevronLeft, Minus, Plus, AlertCircle, Calendar } from 'lucide-react'
import { toast } from 'react-hot-toast'
import canvasConfetti from 'canvas-confetti'
import { supabase, type Event } from '@/lib/supabase'
import { PageTransition } from '@/components/ui/PageTransition'
import { useAuth } from '@/context/AuthContext'
import { getGoogleCalendarUrl, downloadIcsFile } from '@/lib/calendar'

// Validation schemas
const step1Schema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  city: z.string().optional(),
})

const step2Schema = z.object({
  eventId: z.string().min(1, 'Please select an event'),
  participants: z.number().min(1).max(5),
  notes: z.string().optional(),
  hearAboutUs: z.string().optional(),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

interface FloatingInputProps {
  id: string
  label: string
  type?: string
  error?: string
  placeholder?: string
  [key: string]: unknown
}

function FloatingInput({ id, label, type = 'text', error, placeholder = ' ', ...props }: FloatingInputProps) {
  return (
    <div className="form-group">
      <input
        id={id}
        type={type}
        className={`form-input ${error ? 'error' : ''}`}
        placeholder={placeholder}
        {...props}
      />
      <label htmlFor={id} className="form-label">{label}</label>
      {error && (
        <div className="form-error">
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </div>
  )
}

function FloatingSelect({ id, label, error, children, ...props }: {
  id: string; label: string; error?: string; children: React.ReactNode; [key: string]: unknown
}) {
  return (
    <div className="form-group">
      <select
        id={id}
        className={`form-input ${error ? 'error' : ''}`}
        style={{ paddingTop: '20px', appearance: 'none' }}
        {...props}
      >
        {children}
      </select>
      <label
        htmlFor={id}
        className="form-label"
        style={{ top: '6px', fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}
      >
        {label}
      </label>
      {error && <div className="form-error"><AlertCircle size={12} /> {error}</div>}
    </div>
  )
}

function SuccessScreen({ bookingData, event }: { bookingData: Record<string, unknown>; event: Event | null }) {
  useEffect(() => {
    const fire = () => {
      canvasConfetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C8A882', '#8B7355', '#9CAF88', '#FAF7F2'],
      })
    }
    fire()
    setTimeout(fire, 400)
    setTimeout(fire, 800)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        textAlign: 'center',
        padding: '60px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-sage))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(200,168,130,0.4)',
        }}
      >
        <Check size={36} color="white" strokeWidth={2.5} />
      </div>

      <div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 500,
            color: 'var(--color-text)',
            marginBottom: '12px',
          }}
        >
          Booking Confirmed! 🎉
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1.05rem',
            color: 'rgba(44,36,32,0.65)',
            lineHeight: 1.7,
            maxWidth: '420px',
          }}
        >
          Thank you, <strong>{String(bookingData.fullName)}</strong>! You'll receive a confirmation
          email at <em>{String(bookingData.email)}</em> shortly. We can't wait to see you on the mat!
        </p>
      </div>

      <div
        style={{
          background: 'var(--color-soft)',
          borderRadius: '12px',
          padding: '24px 32px',
          textAlign: 'left',
          width: '100%',
          maxWidth: '360px',
        }}
      >
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '16px' }}>
          Booking Summary
        </div>
        {[
          { label: 'Name', value: String(bookingData.fullName) },
          { label: 'Email', value: String(bookingData.email) },
          { label: 'Participants', value: String(bookingData.participants) },
          { label: 'Total', value: `₹${Number(bookingData.totalPrice).toLocaleString('en-IN')}` },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(200,168,130,0.2)' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'rgba(44,36,32,0.55)' }}>{label}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{value}</span>
          </div>
        ))}
      </div>

      {event && (
        <div
          style={{
            width: '100%',
            maxWidth: '360px',
            background: 'var(--color-white)',
            border: '1px solid rgba(200,168,130,0.25)',
            borderRadius: '12px',
            padding: '20px 24px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(44,36,32,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="var(--color-primary)" />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text)' }}>
              Add to Calendar
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'rgba(44,36,32,0.6)', margin: 0, lineHeight: 1.4 }}>
            Save this session to your calendar to receive reminders.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <a
              href={getGoogleCalendarUrl(
                event.title,
                event.description || 'Pilates session at Pulse It Out',
                event.date,
                event.location
              )}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                background: 'var(--color-soft)',
                border: '1px solid rgba(200,168,130,0.15)',
                borderRadius: '6px',
                textDecoration: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.02em',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(200,168,130,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-soft)';
              }}
            >
              Google Calendar
            </a>
            <button
              onClick={() => downloadIcsFile(
                event.title,
                event.description || 'Pilates session at Pulse It Out',
                event.date,
                event.location
              )}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                background: 'var(--color-soft)',
                border: '1px solid rgba(200,168,130,0.15)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.02em',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(200,168,130,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-soft)';
              }}
            >
              Apple / Outlook
            </button>
          </div>
        </div>
      )}

      <Link to="/" className="btn-primary">Back to Home</Link>
    </motion.div>
  )
}

export function BookingPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [step, setStep] = useState(1)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [bookingData, setBookingData] = useState<Record<string, unknown>>({})
  const [participants, setParticipants] = useState(1)

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { eventId: eventId || '', participants: 1 },
  })

  // Auth Gate: Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast('Please log in or sign up to book a session.', { icon: '🔐' })
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search)
      navigate('/auth/login')
    }
  }, [user, authLoading, navigate])

  // Pre-fill profile info if logged in
  useEffect(() => {
    if (user && profile) {
      form1.reset({
        fullName: profile.full_name || '',
        email: user.email || '',
        phone: profile.phone || '',
        city: profile.city || '',
      })
    }
  }, [user, profile, form1])

  useEffect(() => {
    document.title = 'Book a Session | Pulse It Out'
  }, [])

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'active')
          .eq('is_deleted', false)
          .order('date', { ascending: true })
        if (data && data.length > 0) {
          setEvents(data)
          if (eventId) {
            const ev = data.find((e) => e.id === eventId)
            if (ev) setSelectedEvent(ev)
          }
        }
      } catch {
        // Fallback
      }
    }
    fetchEvents()
  }, [eventId])

  const watchEventId = form2.watch('eventId')
  useEffect(() => {
    const ev = events.find((e) => e.id === watchEventId)
    setSelectedEvent(ev || null)
  }, [watchEventId, events])

  const totalPrice = selectedEvent
    ? (selectedEvent.price || 0) * participants
    : 0

  const handleStep1 = form1.handleSubmit(() => {
    // Check if event is sold out
    if (selectedEvent && selectedEvent.current_bookings >= selectedEvent.max_participants) {
      toast.error('This event is sold out. Please select another event.')
      return
    }
    setStep(2)
  })

  const handleStep2 = form2.handleSubmit(() => {
    if (selectedEvent && selectedEvent.current_bookings + participants > selectedEvent.max_participants) {
      const remainingSpots = selectedEvent.max_participants - selectedEvent.current_bookings
      toast.error(`Only ${remainingSpots} spot${remainingSpots > 1 ? 's' : ''} left for this event. Please adjust participants.`)
      return
    }
    setStep(3)
  })

  const handleSubmit = useCallback(async () => {
    if (!user) {
      toast.error('You must be logged in to book a session.')
      return
    }

    setLoading(true)
    try {
      const step1Data = form1.getValues()
      const step2Data = form2.getValues()

      // Re-validate availability right before submitting
      if (selectedEvent) {
        const { data: latestEvent, error: checkError } = await supabase
          .from('events')
          .select('current_bookings, max_participants')
          .eq('id', selectedEvent.id)
          .single()

        if (!checkError && latestEvent) {
          if (latestEvent.current_bookings + participants > latestEvent.max_participants) {
            const left = latestEvent.max_participants - latestEvent.current_bookings
            throw new Error(left <= 0 ? 'This event is now sold out.' : `Only ${left} spot${left > 1 ? 's' : ''} remaining.`)
          }
        }
      }

      const data = {
        fullName: step1Data.fullName,
        email: step1Data.email,
        phone: step1Data.phone,
        city: step1Data.city,
        eventId: step2Data.eventId || null,
        participants,
        notes: step2Data.notes || null,
        hearAboutUs: step2Data.hearAboutUs || null,
        totalPrice,
      }

      const { error } = await supabase.from('bookings').insert({
        event_id: data.eventId,
        user_id: user.id, // associate with logged-in user!
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        participants: data.participants,
        notes: data.notes,
        hear_about_us: data.hearAboutUs,
        total_price: data.totalPrice,
        status: 'pending', // pending by default, admin will confirm
      })

      if (error) throw error

      setBookingData(data)
      setSuccess(true)
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [form1, form2, participants, totalPrice, selectedEvent, user])

  const stepLabels = ['Personal Info', 'Booking Details', 'Review & Confirm']

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', gap: '20px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--color-soft)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-text)', letterSpacing: '0.05em' }}>Loading secure portal...</p>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  if (success) {
    return (
      <div style={{ paddingTop: '72px', minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SuccessScreen bookingData={bookingData} event={selectedEvent} />
      </div>
    )
  }

  return (
    <PageTransition>
      <div style={{ paddingTop: '72px', minHeight: '100vh', background: 'var(--color-bg)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div className="gold-rule-short" />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                Reserve Your Spot
              </span>
              <div className="gold-rule-short" />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, color: 'var(--color-text)' }}>
              Book a Session
            </h1>
          </div>

          {/* Step Indicator */}
          <div className="step-indicator" style={{ marginBottom: '48px' }}>
            {stepLabels.map((label, i) => {
              const num = i + 1
              const isActive = step === num
              const isComplete = step > num
              return (
                <div key={label} style={{ display: 'contents' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div className={`step-dot ${isActive ? 'active' : ''} ${isComplete ? 'completed' : ''}`}>
                      {isComplete ? <Check size={14} /> : num}
                    </div>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: isActive ? 'var(--color-primary)' : 'rgba(44,36,32,0.4)', whiteSpace: 'nowrap' }}>
                      {label}
                    </span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className={`step-line ${isComplete ? 'completed' : ''}`} style={{ marginBottom: '24px' }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Form Card */}
          <div
            style={{
              background: 'var(--color-white)',
              borderRadius: '20px',
              padding: '48px 40px',
              boxShadow: 'var(--shadow-med)',
            }}
          >
            <AnimatePresence mode="wait">
              {/* STEP 1 */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 500, color: 'var(--color-text)', marginBottom: '32px' }}>
                    Personal Information
                  </h2>
                  <form onSubmit={handleStep1}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }} className="form-2col">
                      <FloatingInput
                        id="fullName"
                        label="Full Name *"
                        error={form1.formState.errors.fullName?.message}
                        {...form1.register('fullName')}
                      />
                      <FloatingInput
                        id="email"
                        label="Email Address *"
                        type="email"
                        error={form1.formState.errors.email?.message}
                        {...form1.register('email')}
                      />
                      <FloatingInput
                        id="phone"
                        label="Phone Number *"
                        type="tel"
                        error={form1.formState.errors.phone?.message}
                        {...form1.register('phone')}
                      />
                      <FloatingInput
                        id="city"
                        label="City"
                        error={form1.formState.errors.city?.message}
                        {...form1.register('city')}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button type="submit" className="btn-primary">
                        Continue <ChevronRight size={16} />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 500, color: 'var(--color-text)', marginBottom: '32px' }}>
                    Booking Details
                  </h2>
                  <form onSubmit={handleStep2}>
                    <FloatingSelect
                      id="eventId"
                      label="Select Event *"
                      error={form2.formState.errors.eventId?.message}
                      {...form2.register('eventId')}
                    >
                      <option value="">— Choose an event —</option>
                      {events.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title} — {new Date(e.date).toLocaleDateString('en-IN')} — ₹{e.price?.toLocaleString('en-IN')}
                        </option>
                      ))}
                      {events.length === 0 && <option value="" disabled>No active events available</option>}
                    </FloatingSelect>

                    {/* Participants stepper */}
                    <div className="form-group">
                      <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.5)', display: 'block', marginBottom: '12px' }}>
                        Number of Participants
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                          type="button"
                          onClick={() => { const n = Math.max(1, participants - 1); setParticipants(n); form2.setValue('participants', n) }}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1.5px solid var(--color-soft)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)' }}
                        >
                          <Minus size={16} />
                        </button>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 500, color: 'var(--color-text)', minWidth: '32px', textAlign: 'center' }}>
                          {participants}
                        </span>
                        <button
                          type="button"
                          onClick={() => { const n = Math.min(5, participants + 1); setParticipants(n); form2.setValue('participants', n) }}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                        >
                          <Plus size={16} />
                        </button>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'rgba(44,36,32,0.5)' }}>
                          (max 5)
                        </span>
                      </div>
                    </div>

                    <div className="form-group">
                      <textarea
                        id="notes"
                        className="form-input"
                        placeholder=" "
                        rows={3}
                        style={{ resize: 'vertical', minHeight: '90px', paddingTop: '24px' }}
                        {...form2.register('notes')}
                      />
                      <label htmlFor="notes" className="form-label">Special Requirements / Notes</label>
                    </div>

                    <FloatingSelect
                      id="hearAboutUs"
                      label="How did you hear about us?"
                      {...form2.register('hearAboutUs')}
                    >
                      <option value="">— Select —</option>
                      <option value="instagram">Instagram</option>
                      <option value="friend">A Friend</option>
                      <option value="google">Google</option>
                      <option value="other">Other</option>
                    </FloatingSelect>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                      <button type="button" onClick={() => setStep(1)} className="btn-ghost">
                        <ChevronLeft size={16} /> Back
                      </button>
                      <button type="submit" className="btn-primary">
                        Review Booking <ChevronRight size={16} />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 3 — Review */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 500, color: 'var(--color-text)', marginBottom: '32px' }}>
                    Review & Confirm
                  </h2>

                  {/* Summary */}
                  <div style={{ background: 'var(--color-soft)', borderRadius: '12px', padding: '28px', marginBottom: '28px' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '20px' }}>
                      Personal Details
                    </div>
                    {[
                      { label: 'Full Name', value: form1.getValues('fullName') },
                      { label: 'Email', value: form1.getValues('email') },
                      { label: 'Phone', value: form1.getValues('phone') },
                      { label: 'City', value: form1.getValues('city') || '—' },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(200,168,130,0.2)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(44,36,32,0.55)' }}>{label}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: 'var(--color-soft)', borderRadius: '12px', padding: '28px', marginBottom: '28px' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '20px' }}>
                      Booking Details
                    </div>
                    {[
                      { label: 'Event', value: selectedEvent?.title || form2.getValues('eventId') || '—' },
                      { label: 'Date', value: selectedEvent ? new Date(selectedEvent.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                      { label: 'Location', value: selectedEvent?.location || '—' },
                      { label: 'Participants', value: String(participants) },
                      { label: 'Notes', value: form2.getValues('notes') || '—' },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(200,168,130,0.2)', gap: '20px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(44,36,32,0.55)', flexShrink: 0 }}>{label}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500, textAlign: 'right' }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total Price */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', background: 'var(--color-primary)', borderRadius: '12px', marginBottom: '32px' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
                      Total Amount
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: 'white' }}>
                      ₹{totalPrice.toLocaleString('en-IN') || '—'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => setStep(2)} className="btn-ghost">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="btn-primary"
                      style={{ opacity: loading ? 0.7 : 1, minWidth: '180px', justifyContent: 'center' }}
                    >
                      {loading ? (
                        <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> Processing...</>
                      ) : (
                        <>Confirm Booking <Check size={16} /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .form-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageTransition>
  )
}
