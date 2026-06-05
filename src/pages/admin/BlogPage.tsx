import { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Check, Upload, Image as ImageIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase, type BlogPost } from '@/lib/supabase'
import { AdminLayout } from '@/components/admin/AdminLayout'

const CATEGORIES = ['Wellness', 'Pilates', 'Anatomy', 'Lifestyle', 'Nutrition']

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function estimateReadTime(body: string) {
  const words = body.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

const emptyForm: Partial<BlogPost> = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  cover_url: '',
  category: 'Wellness',
  read_time_minutes: 3,
  is_published: false,
}

function BlogEditorModal({
  post,
  onClose,
  onSave,
}: {
  post?: BlogPost | null
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState<Partial<BlogPost>>(post || emptyForm)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(false)
  const [slugManual, setSlugManual] = useState(!!post)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const update = (key: keyof BlogPost, val: unknown) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val }
      if (key === 'title' && !slugManual) {
        next.slug = slugify(val as string)
      }
      if (key === 'body') {
        next.read_time_minutes = estimateReadTime(val as string)
      }
      return next
    })
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('blog-covers')
        .upload(filename, file, { upsert: false, contentType: file.type })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('blog-covers').getPublicUrl(filename)
      update('cover_url', urlData.publicUrl)
      toast.success('Image uploaded!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async (publish?: boolean) => {
    if (!form.title?.trim()) { toast.error('Title is required'); return }
    if (!form.slug?.trim()) { toast.error('Slug is required'); return }
    if (!form.body?.trim()) { toast.error('Body content is required'); return }

    setLoading(true)
    const payload = {
      ...form,
      is_published: publish !== undefined ? publish : form.is_published,
    }
    try {
      if (post?.id) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', post.id)
        if (error) throw error
        toast.success('Post updated!')
      } else {
        const { error } = await supabase.from('blog_posts').insert(payload)
        if (error) throw error
        toast.success(payload.is_published ? 'Post published!' : 'Draft saved!')
      }
      onSave()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid var(--color-soft)',
    borderRadius: '8px',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    outline: 'none',
    background: '#fafafa',
    color: 'var(--color-text)',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'rgba(44,36,32,0.5)',
    marginBottom: '6px',
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '760px', width: '95vw', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', position: 'sticky', top: 0, background: 'white', paddingBottom: '16px', borderBottom: '1px solid var(--color-soft)', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 500 }}>
            {post ? 'Edit Post' : 'New Blog Post'}
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPreview(!preview)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: '1.5px solid var(--color-soft)', background: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent)' }}
            >
              {preview ? <EyeOff size={14} /> : <Eye size={14} />}
              {preview ? 'Edit' : 'Preview'}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(44,36,32,0.4)', padding: '4px' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {preview ? (
          /* ── PREVIEW MODE ── */
          <div style={{ padding: '8px 0 24px' }}>
            {form.cover_url && (
              <img src={form.cover_url} alt="cover" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '20px' }} />
            )}
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-primary)', background: 'rgba(200,168,130,0.12)', padding: '4px 12px', borderRadius: '20px' }}>
              {form.category}
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, lineHeight: 1.2, marginTop: '16px', marginBottom: '8px' }}>{form.title || 'Untitled'}</h1>
            {form.excerpt && <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontStyle: 'italic', color: 'var(--color-accent)', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--color-soft)' }}>{form.excerpt}</p>}
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', lineHeight: 1.85, color: 'rgba(44,36,32,0.85)', whiteSpace: 'pre-wrap' }}>
              {form.body || <span style={{ color: 'rgba(44,36,32,0.3)', fontStyle: 'italic' }}>No content yet…</span>}
            </div>
          </div>
        ) : (
          /* ── EDIT MODE ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Cover Image */}
            <div>
              <label style={labelStyle}>Cover Image</label>
              <div
                style={{
                  border: '2px dashed var(--color-soft)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  position: 'relative',
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fafafa',
                  cursor: 'pointer',
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {form.cover_url ? (
                  <>
                    <img src={form.cover_url} alt="cover" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(44,36,32,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0, transition: 'opacity 0.2s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    >
                      <Upload size={22} color="white" />
                      <span style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: '0.72rem', fontWeight: 600 }}>Replace Image</span>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '24px', color: 'rgba(44,36,32,0.4)' }}>
                    {uploading ? (
                      <div className="spinner" style={{ width: '24px', height: '24px' }} />
                    ) : (
                      <>
                        <ImageIcon size={28} />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
                          Click to upload cover image (max 5MB)
                        </span>
                      </>
                    )}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
              </div>
              {form.cover_url && (
                <button onClick={() => update('cover_url', '')} style={{ marginTop: '6px', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#E74C3C', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Remove image
                </button>
              )}
            </div>

            {/* Title */}
            <div>
              <label style={labelStyle}>Title *</label>
              <input style={inputStyle} value={form.title || ''} onChange={(e) => update('title', e.target.value)} placeholder="e.g. The Power of Breath in Pilates" />
            </div>

            {/* Slug */}
            <div>
              <label style={labelStyle}>Slug (URL) *</label>
              <input
                style={inputStyle}
                value={form.slug || ''}
                onChange={(e) => { setSlugManual(true); update('slug', e.target.value) }}
                placeholder="auto-generated from title"
              />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'rgba(44,36,32,0.4)' }}>
                Will appear as: /journal/{form.slug || 'your-post-slug'}
              </span>
            </div>

            {/* Category & Read Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select style={{ ...inputStyle, appearance: 'none' }} value={form.category || 'Wellness'} onChange={(e) => update('category', e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Read Time (mins)</label>
                <input type="number" min={1} max={60} style={inputStyle} value={form.read_time_minutes || 3} onChange={(e) => update('read_time_minutes', parseInt(e.target.value))} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(44,36,32,0.4)' }}>Auto-estimated from body</span>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label style={labelStyle}>Excerpt / Intro</label>
              <textarea
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                value={form.excerpt || ''}
                onChange={(e) => update('excerpt', e.target.value)}
                placeholder="A short teaser that appears on the blog grid…"
              />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(44,36,32,0.4)' }}>
                {(form.excerpt || '').length}/300 characters
              </span>
            </div>

            {/* Body */}
            <div>
              <label style={labelStyle}>Body *</label>
              <textarea
                style={{ ...inputStyle, minHeight: '280px', resize: 'vertical', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}
                value={form.body || ''}
                onChange={(e) => update('body', e.target.value)}
                placeholder="Write your article here. Use blank lines to separate paragraphs…"
              />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(44,36,32,0.4)' }}>
                ~{estimateReadTime(form.body || '')} min read · {(form.body || '').trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            {/* Published toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="checkbox"
                id="is_published"
                checked={form.is_published || false}
                onChange={(e) => update('is_published', e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
              />
              <label htmlFor="is_published" style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-text)' }}>
                Publish immediately (visible on public site)
              </label>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--color-soft)' }}>
          <button onClick={onClose} className="btn-outline">Cancel</button>
          {!form.is_published && (
            <button
              onClick={() => handleSave(false)}
              disabled={loading}
              style={{ padding: '10px 20px', borderRadius: '30px', border: '1.5px solid var(--color-soft)', background: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-accent)', opacity: loading ? 0.7 : 1 }}
            >
              Save as Draft
            </button>
          )}
          <button onClick={() => handleSave(true)} disabled={loading} className="btn-primary" style={{ opacity: loading ? 0.7 : 1 }}>
            {loading
              ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> Saving…</>
              : <><Check size={16} /> {form.is_published ? 'Update' : 'Publish'}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<BlogPost | null | undefined>(undefined)

  useEffect(() => {
    document.title = 'Blog | Pulse It Out Admin'
    fetchPosts()
  }, [])

  async function fetchPosts() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setPosts(data || [])
    } catch {
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id)
      if (error) throw error
      toast.success('Post deleted')
      fetchPosts()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const togglePublish = async (post: BlogPost) => {
    try {
      const { error } = await supabase.from('blog_posts').update({ is_published: !post.is_published }).eq('id', post.id)
      if (error) throw error
      toast.success(post.is_published ? 'Post unpublished' : 'Post published!')
      fetchPosts()
    } catch {
      toast.error('Failed to update')
    }
  }

  const published = posts.filter((p) => p.is_published).length
  const drafts = posts.filter((p) => !p.is_published).length

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 500, color: 'var(--color-text)', marginBottom: '4px' }}>Blog Posts</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(44,36,32,0.5)' }}>
              {published} published · {drafts} draft{drafts !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => setModal(null)} className="btn-primary">
            <Plus size={16} /> New Post
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--color-primary)', opacity: 0.3, marginBottom: '12px' }}>✦</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 500, marginBottom: '8px' }}>No posts yet</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(44,36,32,0.5)', marginBottom: '20px' }}>Create your first blog post to get started.</p>
            <button onClick={() => setModal(null)} className="btn-primary"><Plus size={16} /> Write First Post</button>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-soft)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-soft)' }}>
                    {['Title', 'Category', 'Status', 'Read Time', 'Date', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '14px 20px', fontFamily: 'var(--font-heading)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.45)', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post, idx) => (
                    <tr
                      key={post.id}
                      style={{
                        borderBottom: idx < posts.length - 1 ? '1px solid var(--color-soft)' : 'none',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                    >
                      <td style={{ padding: '16px 20px', maxWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {post.cover_url && (
                            <img src={post.cover_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                          )}
                          <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.title}</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'rgba(44,36,32,0.4)' }}>/journal/{post.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', background: 'rgba(200,168,130,0.12)', padding: '3px 10px', borderRadius: '12px' }}>{post.category}</span>
                      </td>
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '12px', background: post.is_published ? 'rgba(156,175,136,0.2)' : 'rgba(200,168,130,0.12)', color: post.is_published ? '#5A7A47' : 'var(--color-accent)' }}>
                          {post.is_published ? '● Live' : '○ Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'rgba(44,36,32,0.5)', whiteSpace: 'nowrap' }}>
                        {post.read_time_minutes} min
                      </td>
                      <td style={{ padding: '16px 20px', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(44,36,32,0.4)', whiteSpace: 'nowrap' }}>
                        {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => togglePublish(post)}
                            title={post.is_published ? 'Unpublish' : 'Publish'}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', background: post.is_published ? 'rgba(231,76,60,0.08)' : 'rgba(156,175,136,0.2)', color: post.is_published ? '#E74C3C' : '#5A7A47', fontSize: '0.72rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}
                          >
                            {post.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => setModal(post)}
                            style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'rgba(200,168,130,0.12)', color: 'var(--color-accent)' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'rgba(231,76,60,0.1)', color: '#E74C3C' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modal !== undefined && (
        <BlogEditorModal
          post={modal}
          onClose={() => setModal(undefined)}
          onSave={fetchPosts}
        />
      )}
    </AdminLayout>
  )
}
