import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Tag, ArrowRight } from 'lucide-react'
import { supabase, type BlogPost } from '@/lib/supabase'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { PageTransition } from '@/components/ui/PageTransition'

const CATEGORIES = ['All', 'Wellness', 'Pilates', 'Anatomy', 'Lifestyle', 'Nutrition']

function PostCard({ post }: { post: BlogPost }) {
  const [hovered, setHovered] = useState(false)
  const date = new Date(post.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Link
      to={`/journal/${post.slug}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article
        style={{
          background: 'var(--color-white)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: hovered ? 'var(--shadow-med)' : 'var(--shadow-soft)',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          borderTop: hovered ? '3px solid var(--color-primary)' : '3px solid transparent',
        }}
      >
        {/* Cover Image */}
        <div
          style={{
            width: '100%',
            aspectRatio: '16/9',
            background: `linear-gradient(135deg, var(--color-soft) 0%, rgba(200,168,130,0.2) 100%)`,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {post.cover_url ? (
            <img
              src={post.cover_url}
              alt={post.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.5s ease',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: '2.5rem',
                color: 'var(--color-primary)',
                fontStyle: 'italic',
                opacity: 0.5,
              }}
            >
              P
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
          {/* Category & Read Time */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--color-primary)',
                background: 'rgba(200,168,130,0.12)',
                padding: '4px 10px',
                borderRadius: '20px',
              }}
            >
              <Tag size={10} />
              {post.category}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                color: 'rgba(44,36,32,0.45)',
              }}
            >
              <Clock size={12} />
              {post.read_time_minutes} min read
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.35rem',
              fontWeight: 600,
              lineHeight: 1.3,
              transition: 'color 0.2s ease',
              color: hovered ? 'var(--color-accent)' : 'var(--color-text)',
            }}
          >
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                color: 'rgba(44,36,32,0.6)',
                lineHeight: 1.65,
                flex: 1,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {post.excerpt}
            </p>
          )}

          {/* Footer row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--color-soft)' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'rgba(44,36,32,0.4)' }}>
              {date}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-primary)',
              }}
            >
              Read <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--color-white)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
      <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--color-soft)', animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '80px', height: '20px', borderRadius: '10px', background: 'var(--color-soft)', animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
        <div style={{ width: '100%', height: '28px', borderRadius: '6px', background: 'var(--color-soft)', animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
        <div style={{ width: '90%', height: '16px', borderRadius: '4px', background: 'var(--color-soft)', animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
        <div style={{ width: '75%', height: '16px', borderRadius: '4px', background: 'var(--color-soft)', animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
      </div>
    </div>
  )
}

export function BlogPage() {
  useScrollReveal()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    document.title = 'The Journal | Pulse It Out'
    fetchPosts()
  }, [])

  async function fetchPosts() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      setPosts(data || [])
    } catch {
      // silently fail — empty state shown
    } finally {
      setLoading(false)
    }
  }

  const filtered = posts.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory
    const q = search.toLowerCase()
    const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.excerpt?.toLowerCase().includes(q))
    return matchCat && matchSearch
  })

  return (
    <PageTransition>
      <main style={{ paddingTop: '72px' }}>
        {/* Hero */}
        <section
          style={{
            background: 'var(--color-text)',
            padding: '80px 0 64px',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '32px', height: '1px', background: 'var(--color-primary)', opacity: 0.6 }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
              Wellness • Movement • Life
            </span>
            <div style={{ width: '32px', height: '1px', background: 'var(--color-primary)', opacity: 0.6 }} />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 8vw, 5.5rem)',
              fontWeight: 500,
              color: 'var(--color-white)',
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
              marginBottom: '16px',
            }}
          >
            The Journal
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', color: 'rgba(255,255,255,0.55)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            Insights on Pilates, movement science, and mindful living — from Roshni's practice to yours.
          </p>
        </section>

        {/* Filter Bar */}
        <section style={{ background: 'var(--color-white)', borderBottom: '1px solid var(--color-soft)', padding: '20px 0', position: 'sticky', top: '72px', zIndex: 10 }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '0 0 260px' }}>
              <input
                id="blog-search"
                type="text"
                placeholder="Search articles…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 36px',
                  border: '1.5px solid var(--color-soft)',
                  borderRadius: '30px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--color-soft)')}
              />
              <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(44,36,32,0.35)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  id={`cat-${cat.toLowerCase()}`}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    border: activeCategory === cat ? 'none' : '1.5px solid var(--color-soft)',
                    background: activeCategory === cat ? 'var(--color-text)' : 'transparent',
                    color: activeCategory === cat ? 'var(--color-primary)' : 'rgba(44,36,32,0.55)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section style={{ background: 'var(--color-bg)', padding: '60px 0 80px' }}>
          <div className="container">
            {loading ? (
              <div className="blog-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'var(--color-primary)', opacity: 0.3, marginBottom: '16px' }}>✦</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 500, color: 'var(--color-text)', marginBottom: '12px' }}>
                  {search || activeCategory !== 'All' ? 'No articles found' : 'Coming Soon'}
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(44,36,32,0.5)', maxWidth: '380px', margin: '0 auto', lineHeight: 1.6 }}>
                  {search || activeCategory !== 'All'
                    ? 'Try adjusting your search or filter.'
                    : 'Roshni is crafting beautiful content — check back soon.'}
                </p>
              </div>
            ) : (
              <div className="blog-grid">
                {filtered.map((post) => <PostCard key={post.id} post={post} />)}
              </div>
            )}
          </div>
        </section>

        <style>{`
          .blog-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 28px;
          }
          @media (max-width: 1024px) {
            .blog-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 640px) {
            .blog-grid { grid-template-columns: 1fr; }
          }
          @keyframes skeleton-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </main>
    </PageTransition>
  )
}
