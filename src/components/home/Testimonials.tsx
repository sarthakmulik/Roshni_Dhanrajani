import { useState, useEffect, useRef } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase, type Testimonial } from '@/lib/supabase'
import { TestimonialSkeleton } from '@/components/ui/Skeleton'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    quote: "Roshni's classes completely changed how I relate to my body. The attention to detail and her warm teaching style make every session feel like a gift to yourself.",
    stars: 5,
    photo_url: 'https://i.pravatar.cc/80?img=1',
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Ananya Mehta',
    quote: 'The retreat was absolutely transformative. I came with back pain and left feeling stronger, lighter, and more connected to my body than ever before.',
    stars: 5,
    photo_url: 'https://i.pravatar.cc/80?img=5',
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Kavya Patel',
    quote: "I've tried many Pilates instructors, but Roshni has a rare ability to see exactly what each student needs. The weekly classes are my non-negotiable self-care ritual.",
    stars: 5,
    photo_url: 'https://i.pravatar.cc/80?img=9',
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Deepika Nair',
    quote: "Pulse It Out is not just a Pilates class — it's a community. Roshni creates such a safe, encouraging space that you immediately feel at home.",
    stars: 5,
    photo_url: 'https://i.pravatar.cc/80?img=20',
    is_featured: true,
    created_at: new Date().toISOString(),
  },
]

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  useScrollReveal([loading])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        setTestimonials(data && data.length > 0 ? data : FALLBACK_TESTIMONIALS)
      } catch {
        setTestimonials(FALLBACK_TESTIMONIALS)
      } finally {
        setLoading(false)
      }
    }
    fetchTestimonials()
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === 'right' ? 380 : -380,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section
      className="section-padding"
      style={{
        background: 'var(--color-soft)',
        position: 'relative',
        overflow: 'hidden',
      }}
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
            marginBottom: '48px',
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
                Student Stories
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
              What Students Say
            </h2>
          </div>

          {/* Navigation arrows */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => scroll('left')}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '1.5px solid var(--color-primary)',
                background: 'transparent',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.25s ease, color 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-primary)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--color-primary)'
              }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                background: 'var(--color-primary)',
                color: 'var(--color-white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.25s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable cards */}
        <div ref={scrollRef} className="scroll-x" style={{ paddingBottom: '20px' }}>
          {loading
            ? [1, 2, 3].map((i) => <TestimonialSkeleton key={i} />)
            : testimonials.map((t) => (
                <div key={t.id} className="testimonial-card reveal">
                  {/* Stars */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill="var(--color-primary)"
                        color="var(--color-primary)"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.05rem',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      color: 'var(--color-text)',
                      lineHeight: 1.7,
                      marginBottom: '24px',
                      flex: 1,
                    }}
                  >
                    "{t.quote}"
                  </p>

                  {/* Author */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {t.photo_url ? (
                      <img
                        src={t.photo_url}
                        alt={t.name}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid var(--color-soft)',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.1rem',
                        }}
                      >
                        {t.name[0]}
                      </div>
                    )}
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: 'var(--color-text)',
                        }}
                      >
                        {t.name}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.75rem',
                          color: 'var(--color-primary)',
                        }}
                      >
                        Pulse It Out Student
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
