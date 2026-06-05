import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Clock, Tag, ArrowLeft, Calendar } from 'lucide-react'
import { supabase, type BlogPost } from '@/lib/supabase'
import { PageTransition } from '@/components/ui/PageTransition'

function renderBody(body: string) {
  // Split on double newlines for paragraphs, single newlines become <br>
  return body
    .split('\n\n')
    .filter((p) => p.trim())
    .map((para, i) => (
      <p key={i} style={{ marginBottom: '1.5em', lineHeight: 1.85, color: 'rgba(44,36,32,0.85)' }}>
        {para.split('\n').map((line, j, arr) => (
          <span key={j}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ))}
      </p>
    ))
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [related, setRelated] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) fetchPost(slug)
  }, [slug])

  async function fetchPost(s: string) {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', s)
        .eq('is_published', true)
        .single()
      if (error || !data) {
        navigate('/journal', { replace: true })
        return
      }
      setPost(data)
      document.title = `${data.title} | Pulse It Out Journal`

      // Fetch related
      const { data: rel } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .eq('category', data.category)
        .neq('id', data.id)
        .order('created_at', { ascending: false })
        .limit(3)
      setRelated(rel || [])
    } catch {
      navigate('/journal', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main style={{ paddingTop: '72px', minHeight: '100vh', background: 'var(--color-bg)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px' }}>
          <div style={{ width: '120px', height: '24px', borderRadius: '6px', background: 'var(--color-soft)', marginBottom: '32px', animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
          <div style={{ width: '100%', height: '380px', borderRadius: '16px', background: 'var(--color-soft)', marginBottom: '40px', animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ width: `${85 + Math.random() * 15}%`, height: '18px', borderRadius: '4px', background: 'var(--color-soft)', marginBottom: '12px', animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
          ))}
        </div>
        <style>{`@keyframes skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      </main>
    )
  }

  if (!post) return null

  const date = new Date(post.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <PageTransition>
      <main style={{ paddingTop: '72px' }}>
        {/* Cover Hero */}
        {post.cover_url && (
          <div
            style={{
              width: '100%',
              maxHeight: '480px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <img
              src={post.cover_url}
              alt={post.title}
              style={{ width: '100%', height: '480px', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(44,36,32,0.5) 100%)' }} />
          </div>
        )}

        {/* Article */}
        <article style={{ maxWidth: '760px', margin: '0 auto', padding: post.cover_url ? '48px 24px 80px' : '60px 24px 80px' }}>
          {/* Back link */}
          <Link
            to="/journal"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              marginBottom: '36px',
              transition: 'color 0.2s ease',
            }}
          >
            <ArrowLeft size={14} /> Back to Journal
          </Link>

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--color-primary)',
                background: 'rgba(200,168,130,0.12)',
                padding: '4px 12px',
                borderRadius: '20px',
              }}
            >
              <Tag size={10} /> {post.category}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'rgba(44,36,32,0.45)' }}>
              <Calendar size={13} /> {date}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'rgba(44,36,32,0.45)' }}>
              <Clock size={13} /> {post.read_time_minutes} min read
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 600,
              lineHeight: 1.2,
              color: 'var(--color-text)',
              marginBottom: '24px',
              letterSpacing: '-0.01em',
            }}
          >
            {post.title}
          </h1>

          {/* Excerpt / Intro */}
          {post.excerpt && (
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontStyle: 'italic',
                color: 'var(--color-accent)',
                lineHeight: 1.6,
                marginBottom: '36px',
                paddingBottom: '36px',
                borderBottom: '1px solid var(--color-soft)',
              }}
            >
              {post.excerpt}
            </p>
          )}

          {/* Body */}
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.05rem',
              lineHeight: 1.85,
              color: 'rgba(44,36,32,0.85)',
            }}
          >
            {renderBody(post.body)}
          </div>

          {/* Author tag */}
          <div
            style={{
              marginTop: '56px',
              paddingTop: '28px',
              borderTop: '1px solid var(--color-soft)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
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
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              R
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '2px' }}>
                Roshni Dhanrajani
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'rgba(44,36,32,0.45)' }}>
                Certified Pilates Instructor
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {related.length > 0 && (
          <section style={{ background: 'var(--color-white)', padding: '60px 0 80px', borderTop: '1px solid var(--color-soft)' }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px' }}>
                <div style={{ width: '24px', height: '1px', background: 'var(--color-primary)' }} />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                  More in {post.category}
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '24px',
                }}
              >
                {related.map((r) => (
                  <Link key={r.id} to={`/journal/${r.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div
                      style={{
                        background: 'var(--color-bg)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid var(--color-soft)',
                        transition: 'box-shadow 0.25s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-med)')}
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                    >
                      {r.cover_url && (
                        <img src={r.cover_url} alt={r.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                      )}
                      <div style={{ padding: '20px' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '8px' }}>{r.category}</div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.3 }}>{r.title}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <style>{`
          @keyframes skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        `}</style>
      </main>
    </PageTransition>
  )
}
