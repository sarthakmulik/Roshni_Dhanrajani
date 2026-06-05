import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Download, ChevronDown, RefreshCw, Eye, CheckCircle2, XCircle, Trash2, Calendar, FileSpreadsheet, Filter, Check, Clock, Edit3, MessageSquare } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'

interface EventRelation {
  title: string
  date: string
  location: string
  price: number
}

interface Booking {
  id: string
  event_id: string | null
  user_id: string | null
  full_name: string
  email: string
  phone: string | null
  city: string | null
  participants: number
  notes: string | null
  hear_about_us: string | null
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled'
  admin_note: string | null
  created_at: string
  events: EventRelation | null
}

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [events, setEvents] = useState<{ id: string; title: string }[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all') // all, today, week, month

  // Selections
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // UI features
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [countdown, setCountdown] = useState(30)
  const [savingNote, setSavingNote] = useState(false)
  const [adminNoteText, setAdminNoteText] = useState('')

  // Search debounce ref
  const refreshIntervalRef = useRef<any>(null)

  const fetchBookings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, events(title, date, location, price)')
        .order('created_at', { ascending: false })

      if (bookingsError) throw bookingsError
      setBookings((bookingsData as unknown as Booking[]) || [])

      // Fetch distinct events for the filter dropdown
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id, title')
        .eq('is_deleted', false)
      
      if (eventsError) throw eventsError
      setEvents(eventsData || [])

      setCountdown(30) // reset auto-refresh timer
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to sync bookings data')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  // Auto-refresh interval
  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchBookings(true)
            return 30;
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current)
    }

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current)
    }
  }, [autoRefresh, fetchBookings])

  // Sync admin note textarea with active selection
  useEffect(() => {
    if (selectedBooking) {
      setAdminNoteText(selectedBooking.admin_note || '')
    }
  }, [selectedBooking])

  // Bulk operations
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredBookings.map((b) => b.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleBulkStatus = async (status: 'confirmed' | 'cancelled' | 'pending') => {
    if (selectedIds.length === 0) return

    // Optimistic UI update
    const previousBookings = [...bookings]
    setBookings(prev => prev.map(b => selectedIds.includes(b.id) ? { ...b, status } : b))
    setSelectedIds([])

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .in('id', selectedIds)

      if (error) throw error
      toast.success(`Updated ${selectedIds.length} bookings to ${status}`)
      fetchBookings(true)
    } catch (err: any) {
      setBookings(previousBookings)
      toast.error(err.message || 'Bulk status update failed')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedIds.length} bookings?`)) return

    const previousBookings = [...bookings]
    setBookings(prev => prev.filter(b => !selectedIds.includes(b.id)))
    setSelectedIds([])

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .in('id', selectedIds)

      if (error) throw error
      toast.success('Bookings deleted successfully')
      fetchBookings(true)
    } catch (err: any) {
      setBookings(previousBookings)
      toast.error(err.message || 'Bulk deletion failed')
    }
  }

  // Row operations
  const handleStatusUpdate = async (id: string, status: 'confirmed' | 'cancelled' | 'pending') => {
    const previousBookings = [...bookings]
    // Optimistic UI
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
    if (selectedBooking?.id === id) {
      setSelectedBooking(prev => prev ? { ...prev, status } : null)
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      toast.success(`Booking status is now ${status}`)
      fetchBookings(true)
    } catch (err: any) {
      setBookings(previousBookings)
      toast.error(err.message || 'Failed to update status')
    }
  }

  // Admin note updates
  const handleSaveNote = async () => {
    if (!selectedBooking) return
    setSavingNote(true)

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ admin_note: adminNoteText })
        .eq('id', selectedBooking.id)

      if (error) throw error
      
      // Update local states
      setBookings(prev =>
        prev.map(b => b.id === selectedBooking.id ? { ...b, admin_note: adminNoteText } : b)
      )
      setSelectedBooking(prev => prev ? { ...prev, admin_note: adminNoteText } : null)
      toast.success('Admin notes saved')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save admin notes')
    } finally {
      setSavingNote(false)
    }
  }

  // Filter calculations
  const filteredBookings = bookings.filter((b) => {
    // Search
    const query = search.toLowerCase()
    const matchesSearch =
      b.full_name.toLowerCase().includes(query) ||
      b.email.toLowerCase().includes(query) ||
      (b.phone && b.phone.includes(query)) ||
      b.id.toLowerCase().includes(query)

    // Status
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter

    // Event
    const matchesEvent = eventFilter === 'all' || b.event_id === eventFilter

    // Date
    let matchesDate = true
    if (dateFilter !== 'all') {
      const bDate = new Date(b.created_at)
      const now = new Date()
      if (dateFilter === 'today') {
        matchesDate = bDate.toDateString() === now.toDateString()
      } else if (dateFilter === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        matchesDate = bDate >= oneWeekAgo
      } else if (dateFilter === 'month') {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        matchesDate = bDate >= oneMonthAgo
      }
    }

    return matchesSearch && matchesStatus && matchesEvent && matchesDate
  })

  // Stats summary based on FILTERED bookings
  const stats = {
    total: filteredBookings.length,
    pending: filteredBookings.filter((b) => b.status === 'pending').length,
    confirmed: filteredBookings.filter((b) => b.status === 'confirmed').length,
    revenue: filteredBookings
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.total_price || 0), 0),
  }

  // Export filtered CSV
  const exportCSV = () => {
    if (filteredBookings.length === 0) {
      toast.error('No bookings to export')
      return
    }

    const headers = ['Booking ID', 'Name', 'Email', 'Phone', 'City', 'Event Title', 'Participants', 'Total Price (INR)', 'Status', 'Date Booked', 'User Notes', 'Admin Note']
    const rows = filteredBookings.map((b) => [
      b.id,
      b.full_name,
      b.email,
      b.phone || '',
      b.city || '',
      b.events?.title || '—',
      b.participants,
      b.total_price || 0,
      b.status,
      new Date(b.created_at).toISOString(),
      b.notes || '',
      b.admin_note || '',
    ])
    
    // Convert to CSV string, escape comma
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((val) => {
            const strVal = String(val).replace(/"/g, '""')
            return strVal.includes(',') || strVal.includes('\n') || strVal.includes('"') ? `"${strVal}"` : strVal
          })
          .join(',')
      )
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `PulseItOut_Bookings_Filtered_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Filtered CSV exported!')
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Header with manual refresh countdown */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 500, color: 'var(--color-text)', marginBottom: '4px' }}>
              Booking Management
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(44,36,32,0.5)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>View, filter, export, and confirm guest spots.</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>•</span>
              <span onClick={() => fetchBookings(false)} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'none', color: 'var(--color-accent)' }} className="refresh-trigger">
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Sync Now
              </span>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'white', padding: '8px 20px', borderRadius: '30px', border: '1px solid var(--color-soft)', boxShadow: '0 2px 8px rgba(44,36,32,0.02)' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(44,36,32,0.4)', textTransform: 'uppercase' }}>
              Auto Sync {autoRefresh ? `in ${countdown}s` : 'Off'}
            </span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                width: '36px',
                height: '20px',
                borderRadius: '20px',
                background: autoRefresh ? 'var(--color-sage)' : '#BDC3C7',
                border: 'none',
                position: 'relative',
                cursor: 'none',
                padding: '2px',
                transition: 'background 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  left: autoRefresh ? '18px' : '2px',
                  top: '2px',
                  transition: 'left 0.2s ease',
                }}
              />
            </button>
          </div>
        </div>

        {/* Stats Dashboard Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { label: 'Filtered Bookings', value: stats.total, sub: 'total list size', color: 'var(--color-text)' },
            { label: 'Pending Spots', value: stats.pending, sub: 'requires action', color: 'var(--color-primary)' },
            { label: 'Confirmed Spots', value: stats.confirmed, sub: 'attending sessions', color: 'var(--color-sage)' },
            { label: 'Confirmed Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, sub: 'approved payments', color: 'var(--color-accent)' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'white',
                border: '1px solid var(--color-soft)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(44,36,32,0.02)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.4)', marginBottom: '8px' }}>
                {stat.label}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, color: stat.color, lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'rgba(44,36,32,0.4)', marginTop: '4px' }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search toolbar */}
        <div
          style={{
            background: 'white',
            border: '1px solid var(--color-soft)',
            borderRadius: '20px',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 4px 20px rgba(44,36,32,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} color="var(--color-primary)" />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text)' }}>
                Filter Matrix
              </span>
            </div>
            
            <button
              onClick={exportCSV}
              className="btn-outline"
              style={{ padding: '8px 16px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FileSpreadsheet size={14} /> Export Filtered CSV
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(44,36,32,0.4)' }} />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 34px',
                  border: '1.5px solid var(--color-soft)',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  color: 'var(--color-text)',
                  background: '#FAFAF9',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid var(--color-soft)',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  color: 'var(--color-text)',
                  background: '#FAFAF9',
                  outline: 'none',
                }}
              >
                <option value="all">Status: All Bookings</option>
                <option value="pending">Status: Pending</option>
                <option value="confirmed">Status: Confirmed</option>
                <option value="cancelled">Status: Cancelled</option>
              </select>
            </div>

            {/* Event Filter */}
            <div>
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid var(--color-soft)',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  color: 'var(--color-text)',
                  background: '#FAFAF9',
                  outline: 'none',
                }}
              >
                <option value="all">Events: All sessions</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Date filter */}
            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid var(--color-soft)',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  color: 'var(--color-text)',
                  background: '#FAFAF9',
                  outline: 'none',
                }}
              >
                <option value="all">Booked date: All time</option>
                <option value="today">Booked date: Today</option>
                <option value="week">Booked date: Past 7 days</option>
                <option value="month">Booked date: Past 30 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div
          style={{
            background: 'white',
            border: '1px solid var(--color-soft)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(44,36,32,0.02)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#FAF8F5', borderBottom: '1px solid var(--color-soft)' }}>
                  <th style={{ padding: '16px 24px', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={filteredBookings.length > 0 && selectedIds.length === filteredBookings.length}
                      onChange={handleSelectAll}
                      style={{ cursor: 'none' }}
                    />
                  </th>
                  <th style={{ padding: '16px 20px', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.5)' }}>Guest Info</th>
                  <th style={{ padding: '16px 20px', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.5)' }}>Event details</th>
                  <th style={{ padding: '16px 20px', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.5)', textAlign: 'center' }}>Spots</th>
                  <th style={{ padding: '16px 20px', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.5)' }}>Total Amount</th>
                  <th style={{ padding: '16px 20px', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.5)' }}>Booking Date</th>
                  <th style={{ padding: '16px 20px', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.5)' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.5)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '60px' }}>
                      <div className="spinner" style={{ margin: '0 auto', width: '32px', height: '32px', border: '3px solid var(--color-soft)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '80px 24px', color: 'rgba(44,36,32,0.4)', fontFamily: 'var(--font-body)' }}>
                      <Calendar size={36} color="var(--color-soft)" style={{ margin: '0 auto 16px' }} />
                      <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--color-text)', marginBottom: '4px' }}>No bookings matching criteria</div>
                      <div>Try clearing filters or checking other dates.</div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const isSelected = selectedIds.includes(booking.id)
                    const statusTextColors = {
                      pending: 'var(--color-primary)',
                      confirmed: 'var(--color-sage)',
                      cancelled: '#C0392B',
                    }[booking.status]

                    return (
                      <tr
                        key={booking.id}
                        style={{
                          borderBottom: '1px solid var(--color-soft)',
                          background: isSelected ? 'rgba(200,168,130,0.03)' : 'transparent',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '16px 24px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(booking.id)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ cursor: 'none' }}
                          />
                        </td>
                        
                        {/* Guest Info */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.95rem' }}>{booking.full_name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'rgba(44,36,32,0.55)', marginTop: '2px' }}>{booking.email}</div>
                          {booking.phone && <div style={{ fontSize: '0.78rem', color: 'rgba(44,36,32,0.4)', marginTop: '2px' }}>{booking.phone}</div>}
                        </td>

                        {/* Event Details */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '0.9rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {booking.events?.title || '—'}
                          </div>
                          {booking.events && (
                            <div style={{ fontSize: '0.8rem', color: 'rgba(44,36,32,0.5)', marginTop: '2px' }}>
                              {new Date(booking.events.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {booking.events.location}
                            </div>
                          )}
                        </td>

                        {/* Spots */}
                        <td style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)' }}>
                          {booking.participants}
                        </td>

                        {/* Price */}
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--color-accent)' }}>
                          ₹{(booking.total_price || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Created At */}
                        <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'rgba(44,36,32,0.6)' }}>
                          {new Date(booking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>

                        {/* Status badge with row actions */}
                        <td style={{ padding: '16px 20px' }}>
                          <span
                            className={`badge badge-${booking.status}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textTransform: 'uppercase',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              letterSpacing: '0.05em',
                              padding: '4px 10px',
                              borderRadius: '12px',
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusTextColors }} />
                            {booking.status}
                          </span>
                        </td>

                        {/* Row actions */}
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              title="View Details & Notes"
                              style={{ background: 'none', border: 'none', color: 'var(--color-accent)', padding: '6px', borderRadius: '4px', cursor: 'none' }}
                              className="action-btn-hover"
                            >
                              <Eye size={16} />
                            </button>

                            {booking.status !== 'confirmed' && (
                              <button
                                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                title="Confirm Booking"
                                style={{ background: 'none', border: 'none', color: 'var(--color-sage)', padding: '6px', borderRadius: '4px', cursor: 'none' }}
                                className="action-btn-hover"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}

                            {booking.status !== 'cancelled' && (
                              <button
                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                title="Cancel Booking"
                                style={{ background: 'none', border: 'none', color: '#E74C3C', padding: '6px', borderRadius: '4px', cursor: 'none' }}
                                className="action-btn-hover"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk selections action bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              style={{
                position: 'fixed',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--color-text)',
                borderRadius: '16px',
                padding: '16px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                zIndex: 300,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 600, color: 'white', letterSpacing: '0.05em' }}>
                {selectedIds.length} booking{selectedIds.length > 1 ? 's' : ''} selected
              </span>

              <div style={{ display: 'flex', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '24px' }}>
                <button
                  onClick={() => handleBulkStatus('confirmed')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: 'var(--color-sage)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'none',
                  }}
                >
                  <Check size={12} /> Confirm Selected
                </button>

                <button
                  onClick={() => handleBulkStatus('cancelled')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'none',
                  }}
                >
                  <XCircle size={12} /> Cancel Selected
                </button>

                <button
                  onClick={handleBulkDelete}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: '#C0392B',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'none',
                  }}
                >
                  <Trash2 size={12} /> Delete Selected
                </button>
              </div>

              <button
                onClick={() => setSelectedIds([])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-body)',
                  cursor: 'none',
                }}
              >
                Clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detailed Side Panel with Timeline and Notes */}
        <AnimatePresence>
          {selectedBooking && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedBooking(null)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'black',
                  zIndex: 400,
                }}
              />

              {/* Panel container */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '420px',
                  background: 'white',
                  boxShadow: '-8px 0 40px rgba(44,36,32,0.12)',
                  zIndex: 500,
                  padding: '40px 32px',
                  overflowY: 'auto',
                  boxSizing: 'border-box',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                      Booking File
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 500, color: 'var(--color-text)', marginTop: '2px' }}>
                      Details & History
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(44,36,32,0.4)',
                      padding: '8px',
                      fontSize: '1.2rem',
                      cursor: 'none',
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Status bar actions in Side Panel */}
                <div
                  style={{
                    background: 'var(--color-bg)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    marginBottom: '32px',
                    border: '1px solid var(--color-soft)',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.4)', marginBottom: '10px' }}>
                    Quick Status Manager
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['pending', 'confirmed', 'cancelled'] as const).map((s) => {
                      const isActive = selectedBooking.status === s
                      const bgColors = {
                        pending: isActive ? 'var(--color-primary)' : 'white',
                        confirmed: isActive ? 'var(--color-sage)' : 'white',
                        cancelled: isActive ? '#C0392B' : 'white',
                      }
                      return (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(selectedBooking.id, s)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: bgColors[s],
                            color: isActive ? 'white' : 'var(--color-text)',
                            border: isActive ? 'none' : '1px solid var(--color-soft)',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-heading)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase',
                            cursor: 'none',
                          }}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ marginBottom: '36px' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.4)', marginBottom: '16px' }}>
                    Activity Timeline
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '24px' }}>
                    {/* Vertical connector line */}
                    <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '1.5px', background: 'var(--color-soft)' }} />
                    
                    {/* Step 1: Booking Received */}
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-sage)' }} />
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text)' }}>Booking Received</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(44,36,32,0.5)', marginTop: '2px' }}>{formatDateTime(selectedBooking.created_at)}</div>
                    </div>

                    {/* Step 2: Status check */}
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: selectedBooking.status === 'confirmed' ? 'var(--color-sage)' : selectedBooking.status === 'cancelled' ? '#C0392B' : 'var(--color-primary)' }} />
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text)' }}>
                        Status: <span style={{ textTransform: 'capitalize' }}>{selectedBooking.status}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(44,36,32,0.5)', marginTop: '2px' }}>
                        {selectedBooking.status === 'pending' ? 'Awaiting administrative review' : `Updated on sync`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '36px' }}>
                  {[
                    { label: 'Name', value: selectedBooking.full_name },
                    { label: 'Email Address', value: selectedBooking.email },
                    { label: 'Phone Number', value: selectedBooking.phone || '—' },
                    { label: 'City', value: selectedBooking.city || '—' },
                    { label: 'Event', value: selectedBooking.events?.title || '—' },
                    { label: 'Guests Attending', value: String(selectedBooking.participants) },
                    { label: 'Total Spots Value', value: `₹${(selectedBooking.total_price || 0).toLocaleString('en-IN')}` },
                    { label: 'User Notes/Requirements', value: selectedBooking.notes || '—' },
                    { label: 'Marketing Channel', value: selectedBooking.hear_about_us || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-soft)' }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(44,36,32,0.4)', marginBottom: '3px' }}>{label}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-text)', wordBreak: 'break-word' }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Admin Note Manager */}
                <div style={{ borderTop: '1px solid var(--color-soft)', paddingTop: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <MessageSquare size={16} color="var(--color-accent)" />
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text)' }}>
                      Administrative Notes
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={adminNoteText}
                    onChange={(e) => setAdminNoteText(e.target.value)}
                    placeholder="Add notes here (e.g. 'Requested front row reformer', 'Contacted regarding payment confirmation')..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1.5px solid var(--color-soft)',
                      borderRadius: '10px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.88rem',
                      color: 'var(--color-text)',
                      background: '#FAFAF8',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box',
                    }}
                  />

                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--color-text)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      cursor: 'none',
                      transition: 'background 0.2s ease',
                      marginTop: '12px',
                      opacity: savingNote ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-text)'}
                  >
                    {savingNote ? 'Saving...' : 'Save File Notes'}
                  </button>
                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
      <style>{`
        .action-btn-hover {
          transition: background 0.2s ease, transform 0.1s ease;
        }
        .action-btn-hover:hover {
          background: var(--color-bg);
          transform: scale(1.08);
        }
        .refresh-trigger {
          transition: color 0.2s ease;
        }
        .refresh-trigger:hover {
          color: var(--color-primary) !important;
          text-decoration: underline;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </AdminLayout>
  )
}
