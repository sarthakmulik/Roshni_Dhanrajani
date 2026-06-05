const GALLERY_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80', alt: 'Pilates class' },
  { src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80', alt: 'Group Pilates' },
  { src: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&q=80', alt: 'Pilates studio' },
  { src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&q=80', alt: 'Wellness retreat' },
  { src: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=500&q=80', alt: 'Mindful movement' },
  { src: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=500&q=80', alt: 'Pilates session' },
]

export function GalleryStrip() {
  return (
    <section
      className="section-padding-sm"
      id="gallery"
      style={{ background: 'var(--color-bg)', overflow: 'hidden' }}
    >
      <div className="container" style={{ marginBottom: '32px' }}>
        <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        {GALLERY_IMAGES.map((img, i) => (
          <div
            key={i}
            className="reveal"
            style={{
              flexShrink: 0,
              width: '280px',
              height: img.src.includes('506126') || img.src.includes('552196') ? '380px' : '320px',
              borderRadius: '12px',
              overflow: 'hidden',
              transitionDelay: `${i * 0.07}s`,
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.6s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </div>
        ))}
      </div>

      <style>{`
        .gallery-strip::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}
