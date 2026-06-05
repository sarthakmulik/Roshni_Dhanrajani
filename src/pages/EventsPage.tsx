import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users } from 'lucide-react'
import { supabase, type Event } from '@/lib/supabase'
import { EventCardSkeleton } from '@/components/ui/Skeleton'
import { PageTransition } from '@/components/ui/PageTransition'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const CATEGORIES = ['All', 'Workshop', 'Retreat', 'Weekly Class']

const FALLBACK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Morning Flow Pilates Workshop',
    description: 'Start your week with intention. A 90-minute deep-dive into core activation and breath work. Perfect for all levels looking to build a stronger foundation.',
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
    description: 'Two days of immersive practice, meditation, and mindful movement in a serene setting away from the city.',
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
  {
    id: '4',
    title: 'Pilates for Beginners',
    description: 'Never tried Pilates? This is your starting point. Learn the fundamentals in a warm, non-judgmental space.',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Mumbai, Andheri',
    price: 1800,
    max_participants: 8,
    current_bookings: 3,
    category: 'Workshop',
    thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
    status: 'active',
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Advanced Reformer Class',
    description: 'For experienced practitioners ready to deepen their practice on the reformer. Intense, intentional, transformative.',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Mumbai, Bandra Studio',
    price: 3500,
    max_participants: 6,
    current_bookings: 4,
    category: 'Weekly Class',
    thumbnail_url: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=600&q=80',
    status: 'active',
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Goa Wellness Retreat',
    description: 'A 3-day escape to Goa combining sunrise Pilates, ayurvedic wellness, and beachside meditation.',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'North Goa',
    price: 18000,
    max_participants: 8,
    current_bookings: 2,
    category: 'Retreat',
    thumbnail_url: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&q=80',
    status: 'active',
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
]

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  useScrollReveal([loading, activeFilter])

  useEffect(() => {
    document.title = 'Events | Pulse It Out'
  }, [])

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'active')
          .eq('is_deleted', false)
          .order('date', { ascending: true })

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

  const filtered = activeFilter === 'All'
    ? events
    : events.filter((e) => e.category === activeFilter)

  return (
    <PageTransition>
      <div style={{ paddingTop: '72px' }}>
        {/* Hero Banner */}
        <section
          style={{
            background: 'var(--color-text)',
            padding: '80px 0 60px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="grain-overlay" />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=60')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.25,
            }}
          />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Link
                to="/"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.7rem',
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Home
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>›</span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.7rem',
                  color: 'var(--color-primary)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Events
              </span>
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 500,
                color: 'var(--color-white)',
                marginBottom: '16px',
              }}
            >
              Our Events
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.6)',
                maxWidth: '480px',
              }}
            >
              Workshops, retreats, and weekly classes curated for every level of Pilates enthusiast.
            </p>
          </div>
        </section>

        {/* Filter + Grid */}
        <section className="section-padding" style={{ background: 'var(--color-bg)' }}>
          <div className="container">
            {/* Filter Pills */}
            <div
              className="reveal"
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '48px',
              }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`filter-pill ${activeFilter === cat ? 'active' : ''}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Events Grid */}
            {loading ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '28px',
                }}
                className="events-grid"
              >
                {[1, 2, 3, 4, 5, 6].map((i) => <EventCardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                }}
              >
                <div style={{ fontSize: '4rem' }}>🌿</div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.8rem',
                    fontWeight: 500,
                    color: 'var(--color-text)',
                  }}
                >
                  No events currently
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: 'rgba(44,36,32,0.55)',
                    maxWidth: '360px',
                  }}
                >
                  We're planning something beautiful. Check back soon or follow us on Instagram for updates.
                </p>
                <button
                  onClick={() => setActiveFilter('All')}
                  className="btn-outline"
                >
                  View All Events
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '28px',
                }}
                className="events-grid"
              >
                {filtered.map((event) => {
                  const date = new Date(event.date)
                  const spotsLeft = event.max_participants - event.current_bookings
                  const isAlmostFull = spotsLeft <= 3 && spotsLeft > 0
                  const isSoldOut = event.current_bookings >= event.max_participants

                  return (
                    <div key={event.id} className="event-card reveal">
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
                        <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                          <span className="category-tag">{event.category}</span>
                        </div>
                        {isSoldOut && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(44,36,32,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', background: '#2C2420', color: 'white', padding: '8px 18px', borderRadius: '30px', textTransform: 'uppercase', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
                              Sold Out
                            </span>
                          </div>
                        )}
                        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
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
                            fontSize: '1.25rem',
                            fontWeight: 500,
                            color: 'var(--color-text)',
                            lineHeight: 1.3,
                          }}
                        >
                          {event.title}
                        </h3>

                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.88rem',
                            color: 'rgba(44,36,32,0.65)',
                            lineHeight: 1.6,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {event.description}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {event.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: 'rgba(44,36,32,0.55)' }}>
                              <MapPin size={14} />{event.location}
                            </span>
                          )}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: 'rgba(44,36,32,0.55)' }}>
                            <Calendar size={14} />
                            {date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: 'rgba(44,36,32,0.55)' }}>
                            <Users size={14} />
                            {isSoldOut ? 'Fully Booked' : `${spotsLeft} spots remaining`}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px' }}>
                          <div>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                              ₹{event.price?.toLocaleString('en-IN')}
                            </span>
                            {isAlmostFull && (
                              <div style={{ marginTop: '4px' }}>
                                <span className="spots-badge" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Only {spotsLeft} left!</span>
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
                            <Link to={`/book/${event.id}`} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.7rem', textDecoration: 'none' }}>
                              Book Now
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .events-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .events-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </PageTransition>
  )
}
