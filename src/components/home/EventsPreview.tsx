import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'
import { supabase, type Event } from '@/lib/supabase'
import { EventCardSkeleton } from '@/components/ui/Skeleton'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const FALLBACK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Morning Flow Pilates Workshop',
    description: 'Start your week with intention. A 90-minute deep-dive into core activation and breath work.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Mumbai, Bandra Studio',
    price: 2500,
    max_participants: 15,
    current_bookings: 9,
    category: 'Workshop',
    thumbnail_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    status: 'active',
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Weekend Pilates Retreat',
    description: 'Two days of immersive practice, meditation, and mindful movement in a serene setting.',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Alibaug, Maharashtra',
    price: 8500,
    max_participants: 10,
    current_bookings: 7,
    category: 'Retreat',
    thumbnail_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    status: 'active',
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Weekly Pilates — Tuesday Series',
    description: 'Join our intimate weekly class designed for all levels. Build consistency, build strength.',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Mumbai, Juhu',
    price: 1200,
    max_participants: 12,
    current_bookings: 10,
    category: 'Weekly Class',
    thumbnail_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    status: 'active',
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
]

function EventCard({ event, index }: { event: Event; index: number }) {
  const date = new Date(event.date)
  const spotsLeft = event.max_participants - event.current_bookings
  const isAlmostFull = spotsLeft <= 3 && spotsLeft > 0
  const isSoldOut = event.current_bookings >= event.max_participants

  return (
    <div
      className="event-card reveal"
      style={{
        transitionDelay: `${index * 0.1}s`,
        marginTop: index === 1 ? '40px' : '0', // offset middle card
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '16/10' }}>
        <img
          src={event.thumbnail_url || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80'}
          alt={event.title}
          className="event-card-image"
          style={{ transition: 'transform 0.6s ease', opacity: isSoldOut ? 0.65 : 1 }}
          onMouseEnter={(e) => { if (!isSoldOut) e.currentTarget.style.transform = 'scale(1.05)' }}
          onMouseLeave={(e) => { if (!isSoldOut) e.currentTarget.style.transform = 'scale(1)' }}
        />
        {/* Category tag */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
          }}
        >
          <span className="category-tag">{event.category}</span>
        </div>
        {isSoldOut && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(44,36,32,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', background: '#2C2420', color: 'white', padding: '8px 18px', borderRadius: '30px', textTransform: 'uppercase', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
              Sold Out
            </span>
          </div>
        )}
        {/* Date badge */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
          }}
        >
          <div className="date-badge">
            <span className="day">{date.getDate()}</span>
            <span className="month">{date.toLocaleString('en', { month: 'short' })}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="event-card-body">
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.3rem',
            fontWeight: 500,
            color: 'var(--color-text)',
            lineHeight: 1.3,
          }}
        >
          {event.title}
        </h3>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {event.location && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: 'rgba(44,36,32,0.55)',
              }}
            >
              <MapPin size={14} />
              {event.location}
            </span>
          )}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              color: 'rgba(44,36,32,0.55)',
            }}
          >
            <Calendar size={14} />
            {date.toLocaleDateString('en-IN', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto',
            paddingTop: '8px',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: 'var(--color-accent)',
              }}
            >
              ₹{event.price?.toLocaleString('en-IN')}
            </span>
            {isAlmostFull && (
              <div style={{ marginTop: '4px' }}>
                <span className="spots-badge" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Only {spotsLeft} left!</span>
              </div>
            )}
            {isSoldOut && (
              <div style={{ marginTop: '4px' }}>
                <span className="spots-badge" style={{ background: 'rgba(231,76,60,0.1)', color: '#C0392B', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>Fully Booked</span>
              </div>
            )}
          </div>
          {isSoldOut ? (
            <button
              disabled
              style={{
                padding: '10px 20px',
                fontSize: '0.7rem',
                background: '#E8DDD4',
                color: 'rgba(44,36,32,0.4)',
                border: 'none',
                borderRadius: '30px',
                cursor: 'not-allowed',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Sold Out
            </button>
          ) : (
            <Link
              to={`/book/${event.id}`}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.7rem', textDecoration: 'none' }}
            >
              Book Slot
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export function EventsPreview() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  useScrollReveal([loading])

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'active')
          .eq('is_deleted', false)
          .order('date', { ascending: true })
          .limit(3)

        if (error) throw error
        setEvents(data && data.length > 0 ? data : FALLBACK_EVENTS)
      } catch {
        setEvents(FALLBACK_EVENTS)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  return (
    <section
      id="events"
      className="section-padding"
      style={{ background: 'var(--color-soft)', position: 'relative', overflow: 'hidden' }}
    >
      <div className="grain-overlay" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div
          className="reveal"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '60px',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div className="gold-rule-short" />
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--color-primary)',
                }}
              >
                Don't Miss Out
              </span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 500,
                color: 'var(--color-text)',
              }}
            >
              Upcoming Events
            </h2>
          </div>
          <Link
            to="/events"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              borderBottom: '1px solid var(--color-primary)',
              paddingBottom: '2px',
            }}
          >
            View All Events <ArrowRight size={16} />
          </Link>
        </div>

        {/* Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '28px',
            alignItems: 'start',
          }}
          className="events-grid"
        >
          {loading
            ? [1, 2, 3].map((i) => <EventCardSkeleton key={i} />)
            : events.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .events-grid { grid-template-columns: 1fr !important; }
          .event-card { margin-top: 0 !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .events-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
