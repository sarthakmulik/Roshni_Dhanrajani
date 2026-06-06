import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { supabase, type Event } from '@/lib/supabase'
import { EventCardSkeleton } from '@/components/ui/Skeleton'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useImageReveal } from '@/hooks/useImageReveal'

gsap.registerPlugin(ScrollTrigger)

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
  {
    id: '4',
    title: 'Pilates for Posture',
    description: 'Targeted session focusing on spine alignment and postural correction for desk workers.',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Pune, Koregaon Park',
    price: 1800,
    max_participants: 10,
    current_bookings: 4,
    category: 'Workshop',
    thumbnail_url: 'https://images.unsplash.com/photo-1518310952931-b1de897abd40?w=600&q=80',
    status: 'active',
    is_deleted: false,
    created_at: new Date().toISOString(),
  },
]

function EventCard({ event }: { event: Event }) {
  const date = new Date(event.date)
  const spotsLeft = event.max_participants - event.current_bookings
  const isAlmostFull = spotsLeft <= 3 && spotsLeft > 0
  const isSoldOut = event.current_bookings >= event.max_participants
  const cardRef = useRef<HTMLDivElement>(null)

  // 3D tilt on mouse move (desktop only)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    card.style.transform = `perspective(800px) rotateY(${dx * 7}deg) rotateX(${-dy * 5}deg) scale(1.02)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)'
  }

  return (
    <div
      ref={cardRef}
      className="event-card horiz-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-cursor="VIEW"
      style={{ transition: 'transform 0.25s ease', willChange: 'transform' }}
    >
      {/* Image with reveal overlay */}
      <div className="img-reveal" style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3' }}>
        <img
          src={event.thumbnail_url || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80'}
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: isSoldOut ? 0.65 : 1,
            transition: 'transform 0.5s ease',
          }}
        />
        {/* Reveal overlay */}
        <div
          className="img-reveal-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--color-primary)',
            transformOrigin: 'left center',
            transition: 'transform 0.7s cubic-bezier(0.76,0,0.24,1)',
          }}
        />
        {/* Category tag */}
        <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 2 }}>
          <span className="category-tag">{event.category}</span>
        </div>
        {isSoldOut && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(44,36,32,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', background: '#2C2420', color: 'white', padding: '8px 18px', borderRadius: '30px', textTransform: 'uppercase' }}>
              Sold Out
            </span>
          </div>
        )}
        {/* Date badge */}
        <div style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 2 }}>
          <div className="date-badge">
            <span className="day">{date.getDate()}</span>
            <span className="month">{date.toLocaleString('en', { month: 'short' })}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="event-card-body">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.3 }}>
          {event.title}
        </h3>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          {event.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(44,36,32,0.55)' }}>
              <MapPin size={13} />{event.location}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(44,36,32,0.55)' }}>
            <Calendar size={13} />{date.toLocaleDateString('en-IN', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-accent)' }}>
              ₹{event.price?.toLocaleString('en-IN')}
            </span>
            {isAlmostFull && (
              <div style={{ marginTop: '4px' }}>
                <span className="spots-badge" style={{ padding: '2px 8px', fontSize: '0.68rem' }}>Only {spotsLeft} left!</span>
              </div>
            )}
          </div>
          {isSoldOut ? (
            <button disabled style={{ padding: '9px 18px', fontSize: '0.68rem', background: '#E8DDD4', color: 'rgba(44,36,32,0.4)', border: 'none', borderRadius: '30px', fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Sold Out
            </button>
          ) : (
            <Link
              to={`/book/${event.id}`}
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: '0.68rem', textDecoration: 'none' }}
              data-cursor="BOOK"
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
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  useScrollReveal([loading])
  useImageReveal([loading])

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'active')
          .eq('is_deleted', false)
          .order('date', { ascending: true })
          .limit(4)

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

  // GSAP horizontal scroll — desktop only
  useEffect(() => {
    if (loading || isMobile) return
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    // Wait a tick for layout
    const timeout = setTimeout(() => {
      const trackWidth = track.scrollWidth
      const viewportWidth = window.innerWidth
      const distance = trackWidth - viewportWidth + 120 // extra padding

      const ctx = gsap.context(() => {
        gsap.to(track, {
          x: -distance,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
      }, section)

      return () => ctx.revert()
    }, 100)

    return () => clearTimeout(timeout)
  }, [loading, isMobile])

  return (
    <section
      ref={sectionRef}
      id="events"
      style={{ background: 'var(--color-soft)', position: 'relative', overflow: isMobile ? 'hidden' : 'visible' }}
    >
      <div className="grain-overlay" />

      {/* Header — always visible */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: 'clamp(48px,7vw,88px) clamp(20px,5vw,80px) 0',
        }}
      >
        <div
          className="reveal"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div className="gold-rule-short" />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                Don't Miss Out
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, color: 'var(--color-text)' }}>
              Upcoming Events
            </h2>
          </div>
          <Link
            to="/events"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', borderBottom: '1px solid var(--color-primary)', paddingBottom: '2px' }}
            data-cursor="VIEW"
          >
            View All Events <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Horizontal Scroll Track — desktop */}
      {!isMobile ? (
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: '28px',
            padding: '0 clamp(20px,5vw,80px) 60px',
            width: 'max-content',
            alignItems: 'flex-start',
          }}
        >
          {loading
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} style={{ width: '340px', flexShrink: 0 }}>
                  <EventCardSkeleton />
                </div>
              ))
            : events.map((event) => (
                <div key={event.id} style={{ width: '340px', flexShrink: 0 }}>
                  <EventCard event={event} />
                </div>
              ))}
        </div>
      ) : (
        // Mobile: normal vertical grid
        <div style={{ padding: '0 20px 60px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {loading
            ? [1, 2, 3].map((i) => <EventCardSkeleton key={i} />)
            : events.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
        </div>
      )}

      <style>{`
        .horiz-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--color-soft);
          box-shadow: 0 4px 24px rgba(44,36,32,0.04);
        }
        @media (hover: none) {
          .horiz-card { transform: none !important; }
        }
      `}</style>
    </section>
  )
}
