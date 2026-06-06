import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type GalleryImage } from '@/lib/supabase'

const FALLBACK_IMAGES = [
  { public_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80', alt_text: 'Pilates class' },
  { public_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80', alt_text: 'Group Pilates' },
  { public_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&q=80', alt_text: 'Pilates studio' },
  { public_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&q=80', alt_text: 'Wellness retreat' },
  { public_url: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=500&q=80', alt_text: 'Mindful movement' },
  { public_url: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=500&q=80', alt_text: 'Pilates session' },
]

export function GalleryStrip() {
  const [images, setImages] = useState<Partial<GalleryImage>[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .eq('is_hidden', false)
          .order('created_at', { ascending: false })
          .order('display_order', { ascending: true })
          .limit(8)

        if (error) throw error
        
        if (data && data.length > 0) {
          setImages(data)
        } else {
          setImages(FALLBACK_IMAGES)
        }
      } catch (err) {
        console.error('Error fetching gallery:', err)
        setImages(FALLBACK_IMAGES)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImages()
  }, [])

  return (
    <section
      className="section-padding-sm"
      id="gallery"
      style={{ background: 'var(--color-bg)', overflow: 'hidden' }}
    >
      <div className="container" style={{ marginBottom: '32px' }}>
        <div className="reveal flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
              Gallery
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link
              to="/gallery"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-text)',
                borderBottom: '1px solid rgba(0,0,0,0.2)',
                paddingBottom: '2px',
                transition: 'border-color 0.3s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = 'var(--color-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'rgba(0,0,0,0.2)')}
            >
              See All Gallery
            </Link>
            <a
              href="https://www.instagram.com/roshni.dhanrajani/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                borderBottom: '1px solid var(--color-primary)',
                paddingBottom: '2px',
              }}
            >
              @roshni.dhanrajani →
            </a>
          </div>
        </div>
      </div>

      {/* Full-width horizontal scroll */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          padding: '0 40px 20px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {isLoading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-black/5"
              style={{
                flexShrink: 0,
                width: '280px',
                height: '320px',
                borderRadius: '12px',
              }}
            />
          ))
        ) : (
          images.map((img, i) => (
            <div
              key={img.id || i}
              className="reveal group"
              style={{
                flexShrink: 0,
                width: '280px',
                height: i % 2 === 0 ? '320px' : '380px', // Stagger heights slightly for a dynamic feel
                borderRadius: '12px',
                overflow: 'hidden',
                transitionDelay: `${i * 0.07}s`,
                position: 'relative'
              }}
            >
              <img
                src={img.public_url}
                alt={img.alt_text || 'Studio image'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                loading="lazy"
              />
            </div>
          ))
        )}
      </div>

      <style>{`
        .gallery-strip::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}
