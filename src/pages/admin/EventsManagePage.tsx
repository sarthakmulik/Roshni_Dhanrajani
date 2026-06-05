import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Check, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase, type Event } from '@/lib/supabase'
import { AdminLayout } from '@/components/admin/AdminLayout'

const emptyForm: Partial<Event> = {
  title: '',
  description: '',
  date: '',
  location: '',
  price: 0,
  max_participants: 20,
  category: 'Workshop',
  thumbnail_url: '',
  status: 'active',
}

function EventModal({
  event,
  onClose,
  onSave,
}: {
  event?: Event | null
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState<Partial<Event>>(event || emptyForm)
  const [loading, setLoading] = useState(false)

  const update = (key: keyof Event, val: unknown) =>
    setForm((prev) => ({ ...prev, [key]: val }))

  const handleSave = async () => {
    if (!form.title || !form.date) {
      toast.error('Title and date are required')
      return
    }
    setLoading(true)
    try {
      if (event?.id) {
        const { error } = await supabase.from('events').update(form).eq('id', event.id)
        if (error) throw error
        toast.success('Event updated!')
      } else {
        const { error } = await supabase.from('events').insert(form)
        if (error) throw error
        toast.success('Event created!')
      }
      onSave()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save event')
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
    color: 'var(--color-text)',
    outline: 'none',
    background: '#fafafa',
  }

  const labelStyle = {
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 500 }}>
            {event ? 'Edit Event' : 'Create Event'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(44,36,32,0.4)', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} value={form.title || ''} onChange={(e) => update('title', e.target.value)} placeholder="Event title" />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.description || ''} onChange={(e) => update('description', e.target.value)} placeholder="Event description..." />
          </div>

          <div>
            <label style={labelStyle}>Date & Time *</label>
            <input type="datetime-local" style={inputStyle} value={form.date ? new Date(form.date).toISOString().slice(0, 16) : ''} onChange={(e) => update('date', new Date(e.target.value).toISOString())} />
          </div>

          <div>
            <label style={labelStyle}>Location</label>
            <input style={inputStyle} value={form.location || ''} onChange={(e) => update('location', e.target.value)} placeholder="City, Venue" />
          </div>

          <div>
            <label style={labelStyle}>Price (₹)</label>
            <input type="number" style={inputStyle} value={form.price || ''} onChange={(e) => update('price', parseFloat(e.target.value))} />
          </div>

          <div>
            <label style={labelStyle}>Max Participants</label>
            <input type="number" style={inputStyle} value={form.max_participants || 20} onChange={(e) => update('max_participants', parseInt(e.target.value))} />
          </div>

          <div>
            <label style={labelStyle}>Category</label>
            <select style={inputStyle} value={form.category || 'Workshop'} onChange={(e) => update('category', e.target.value)}>
              <option>Workshop</option>
              <option>Retreat</option>
              <option>Weekly Class</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Status</label>
            <select style={inputStyle} value={form.status || 'active'} onChange={(e) => update('status', e.target.value as Event['status'])}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Thumbnail URL</label>
            <input style={inputStyle} value={form.thumbnail_url || ''} onChange={(e) => update('thumbnail_url', e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary" style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> Saving...</> : <><Check size={16} /> Save Event</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [modalEvent, setModalEvent] = useState<Event | null | undefined>(undefined)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Events | Pulse It Out Admin'
    fetchEvents()
  }, [])

  async function fetchEvents() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_deleted', false)
        .order('date', { ascending: true })
      if (error) throw error
      setEvents(data || [])
    } catch {
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('events').update({ is_deleted: true }).eq('id', id)
      if (error) throw error
      toast.success('Event deleted')
      setDeleteId(null)
      fetchEvents()
    } catch {
      toast.error('Failed to delete event')
    }
  }

  return (
    <AdminLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 500, color: 'var(--color-text)', marginBottom: '4px' }}>Events</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(44,36,32,0.5)' }}>{events.length} total events</p>
          </div>
          <button onClick={() => setModalEvent(null)} className="btn-primary">
            <Plus size={16} /> Create Event
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Location</th>
                <th>Price</th>
                <th>Spots</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px', color: 'rgba(44,36,32,0.4)' }}>
                    No events yet. Create your first event!
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{event.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(44,36,32,0.5)', marginTop: '2px' }}>{event.category}</div>
                    </td>
                    <td>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>{event.location || '—'}</td>
                    <td>₹{event.price?.toLocaleString('en-IN') || '—'}</td>
                    <td>{event.max_participants - event.current_bookings} / {event.max_participants}</td>
                    <td>
                      <span className={`badge badge-${event.status}`}>{event.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setModalEvent(event)}
                          style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'rgba(200,168,130,0.12)', color: 'var(--color-accent)', cursor: 'none' }}
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(event.id)}
                          style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'rgba(231,76,60,0.1)', color: '#E74C3C', cursor: 'none' }}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalEvent !== undefined && (
        <EventModal
          event={modalEvent}
          onClose={() => setModalEvent(undefined)}
          onSave={fetchEvents}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 500, marginBottom: '12px' }}>Delete Event?</h3>
            <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(44,36,32,0.6)', marginBottom: '28px' }}>
              This action cannot be undone. The event will be archived.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteId(null)} className="btn-outline">Cancel</button>
              <button
                onClick={() => handleDelete(deleteId)}
                style={{ padding: '12px 24px', background: '#E74C3C', color: 'white', border: 'none', borderRadius: '999px', fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keep ToggleLeft/ToggleRight in scope */}
      <span style={{ display: 'none' }}><ToggleLeft /><ToggleRight /></span>
    </AdminLayout>
  )
}
