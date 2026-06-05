import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Star, X, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase, type Testimonial } from '@/lib/supabase'
import { AdminLayout } from '@/components/admin/AdminLayout'

const emptyForm: Partial<Testimonial> = {
  name: '',
  quote: '',
  stars: 5,
  photo_url: '',
  is_featured: false,
}

function TestimonialModal({
  testimonial,
  onClose,
  onSave,
}: {
  testimonial?: Testimonial | null
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState<Partial<Testimonial>>(testimonial || emptyForm)
  const [loading, setLoading] = useState(false)

  const update = (key: keyof Testimonial, val: unknown) =>
    setForm((prev) => ({ ...prev, [key]: val }))

  const handleSave = async () => {
    if (!form.name || !form.quote) {
      toast.error('Name and quote are required')
      return
    }
    setLoading(true)
    try {
      if (testimonial?.id) {
        const { error } = await supabase.from('testimonials').update(form).eq('id', testimonial.id)
        if (error) throw error
        toast.success('Testimonial updated!')
      } else {
        const { error } = await supabase.from('testimonials').insert(form)
        if (error) throw error
        toast.success('Testimonial added!')
      }
      onSave()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid var(--color-soft)',
    borderRadius: '8px',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    outline: 'none',
    background: '#fafafa',
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 500 }}>
            {testimonial ? 'Edit Testimonial' : 'Add Testimonial'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(44,36,32,0.4)', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.5)', marginBottom: '6px' }}>
              Name *
            </label>
            <input style={inputStyle} value={form.name || ''} onChange={(e) => update('name', e.target.value)} />
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.5)', marginBottom: '6px' }}>
              Quote *
            </label>
            <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={form.quote || ''} onChange={(e) => update('quote', e.target.value)} />
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.5)', marginBottom: '8px' }}>
              Stars
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update('stars', s)}
                  style={{ background: 'none', border: 'none', padding: '2px' }}
                >
                  <Star size={24} fill={(form.stars || 0) >= s ? 'var(--color-primary)' : 'transparent'} color="var(--color-primary)" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.5)', marginBottom: '6px' }}>
              Photo URL
            </label>
            <input style={inputStyle} value={form.photo_url || ''} onChange={(e) => update('photo_url', e.target.value)} placeholder="https://..." />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="checkbox"
              id="is_featured"
              checked={form.is_featured || false}
              onChange={(e) => update('is_featured', e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
            />
            <label htmlFor="is_featured" style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-text)' }}>
              Feature on homepage
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary" style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> Saving...</> : <><Check size={16} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [modalTestimonial, setModalTestimonial] = useState<Testimonial | null | undefined>(undefined)

  useEffect(() => {
    document.title = 'Testimonials | Pulse It Out Admin'
    fetchTestimonials()
  }, [])

  async function fetchTestimonials() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setTestimonials(data || [])
    } catch {
      toast.error('Failed to load testimonials')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id)
      if (error) throw error
      toast.success('Testimonial deleted')
      fetchTestimonials()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const toggleFeatured = async (t: Testimonial) => {
    try {
      const { error } = await supabase.from('testimonials').update({ is_featured: !t.is_featured }).eq('id', t.id)
      if (error) throw error
      toast.success(`${t.is_featured ? 'Unfeatured' : 'Featured'} successfully`)
      fetchTestimonials()
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <AdminLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 500, color: 'var(--color-text)', marginBottom: '4px' }}>Testimonials</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(44,36,32,0.5)' }}>{testimonials.length} total testimonials</p>
          </div>
          <button onClick={() => setModalTestimonial(null)} className="btn-primary">
            <Plus size={16} /> Add Testimonial
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {testimonials.map((t) => (
              <div key={t.id} style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: 'var(--shadow-soft)', border: t.is_featured ? '2px solid var(--color-primary)' : '2px solid transparent' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} fill="var(--color-primary)" color="var(--color-primary)" />
                  ))}
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontStyle: 'italic', color: 'var(--color-text)', lineHeight: 1.6, marginBottom: '16px' }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {t.photo_url ? (
                      <img src={t.photo_url} alt={t.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>{t.name[0]}</div>
                    )}
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', fontWeight: 600 }}>{t.name}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => toggleFeatured(t)} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: t.is_featured ? 'rgba(156,175,136,0.2)' : 'rgba(200,168,130,0.12)', color: t.is_featured ? '#5A7A47' : 'var(--color-accent)', fontSize: '0.7rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                      {t.is_featured ? '★ Featured' : 'Feature'}
                    </button>
                    <button onClick={() => setModalTestimonial(t)} style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'rgba(200,168,130,0.12)', color: 'var(--color-accent)' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'rgba(231,76,60,0.1)', color: '#E74C3C' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalTestimonial !== undefined && (
        <TestimonialModal
          testimonial={modalTestimonial}
          onClose={() => setModalTestimonial(undefined)}
          onSave={fetchTestimonials}
        />
      )}
    </AdminLayout>
  )
}
