import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Tag } from 'lucide-react'
import { supabase, type BlogPost } from '@/lib/supabase'

export function BlogTeaser() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLatest() {
      try {
        const { data } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(3)
        setPosts(data || [])
      } catch {
        // Silently hide section if no table yet
      } finally {
        setLoading(false)
      }
    }
    fetchLatest()
  }, [])

  // Don't render anything while loading or if no posts
  if (loading || posts.length === 0) return null

  return (
    <section style={{ background: 'var(--color-bg)', padding: '80px 0', borderTop: '1px solid var(--color-soft)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="gold-rule-short" />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
              From the Journal
            </span>
          </div>
          <Link
            to="/journal"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              borderBottom: '1px solid var(--color-primary)',
              paddingBottom: '2px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
          >
            View all articles <ArrowRight size={13} />
          </Link>
        </div>

        {/* Featured post large + 2 small */}
        <div className="blog-teaser-grid">
          {/* Large featured post */}
          {posts[0] && (
            <Link
              to={`/journal/${posts[0].slug}`}
              className="blog-teaser-featured"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{ height: '100%', background: 'var(--color-white)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.3s ease, transform 0.3s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-med)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-soft)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ flex: '0 0 260px', background: `linear-gradient(135deg, var(--color-soft) 0%, rgba(200,168,130,0.2) 100%)`, overflow: 'hidden' }}>
                  {posts[0].cover_url ? (
                    <img src={posts[0].cover_url} alt={posts[0].title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--color-primary)', opacity: 0.4, fontStyle: 'italic' }}>P</div>
                  )}
                </div>
                <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-primary)', background: 'rgba(200,168,130,0.12)', padding: '3px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={9} /> {posts[0].category}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'rgba(44,36,32,0.4)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> {posts[0].read_time_minutes} min
                    </span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, lineHeight: 1.25, color: 'var(--color-text)' }}>{posts[0].title}</h3>
                  {posts[0].excerpt && (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(44,36,32,0.6)', lineHeight: 1.65 }}>{posts[0].excerpt}</p>
                  )}
                  <div style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                    Read Article <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* 2 smaller posts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {posts.slice(1).map((post) => (
              <Link key={post.id} to={`/journal/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                <div
                  style={{ background: 'var(--color-white)', borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--shadow-soft)', display: 'flex', height: '100%', transition: 'box-shadow 0.25s ease, transform 0.25s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-med)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-soft)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {post.cover_url && (
                    <div style={{ width: '110px', flexShrink: 0, overflow: 'hidden' }}>
                      <img src={post.cover_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>{post.category}</span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.3, color: 'var(--color-text)' }}>{post.title}</h3>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'rgba(44,36,32,0.4)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> {post.read_time_minutes} min read
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .blog-teaser-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }
        .blog-teaser-featured {
          grid-row: span 1;
        }
        @media (max-width: 768px) {
          .blog-teaser-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}
