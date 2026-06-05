import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, User, Settings, LogOut, ChevronRight, CheckCircle2, Clock, XCircle, ShieldCheck } from 'lucide-react'

interface BookingWithEvent {
  id: string
  event_id: string
  full_name: string
  email: string
  phone: string | null
  city: string | null
  participants: number
  notes: string | null
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  events: {
    id: string
    title: string
    date: string
    location: string
    price: number
    category: string
    thumbnail_url: string | null
  } | null
}

export function DashboardPage() {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings')
  const [bookings, setBookings] = useState<BookingWithEvent[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)

  // Profile Form State
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [updatingProfile, setUpdatingProfile] = useState(false)

  // Password Update Form State
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
      setCity(profile.city || '')
    }
  }, [profile])

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    setLoadingBookings(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, events(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data as BookingWithEvent[])
    } catch (err: any) {
      console.error('Error fetching bookings:', err)
      toast.error('Failed to load bookings')
    } finally {
      setLoadingBookings(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', user?.id) // security precaution

      if (error) throw error
      
      // Update local state
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
      )
      toast.success('Booking cancelled successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking')
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName) {
      toast.error('Full name is required')
      return
    }

    setUpdatingProfile(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone || null,
          city: city || null,
        })
        .eq('id', user?.id)

      if (error) throw error
      await refreshProfile()
      toast.success('Profile updated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword) {
      toast.error('Please enter new password and confirm it')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setUpdatingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setUpdatingPassword(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="dashboard-container">
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.15em', color: 'var(--color-accent)', textTransform: 'uppercase' }}>
                Dashboard
              </span>
              {profile?.is_admin && (
                <Link
                  to="/admin/dashboard"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: 'var(--color-primary)',
                    color: 'var(--color-text)',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    textDecoration: 'none',
                    letterSpacing: '0.05em',
                  }}
                >
                  <ShieldCheck size={12} /> Admin
                </Link>
              )}
            </div>
            <h1 className="dashboard-welcome-title" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, color: 'var(--color-text)' }}>
              Namaste, {profile?.full_name || 'Friend'}
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(44,36,32,0.6)', marginTop: '4px' }}>
              {user?.email}
            </p>
          </div>

          <button
            onClick={signOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              border: '1px solid var(--color-soft)',
              borderRadius: '30px',
              background: 'white',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--color-accent)',
              cursor: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 10px rgba(44,36,32,0.03)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C0392B'; e.currentTarget.style.color = '#C0392B' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-soft)'; e.currentTarget.style.color = 'var(--color-accent)' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          
          {/* Sidebar Tabs */}
          <div className="dashboard-sidebar">
            <button
              onClick={() => setActiveTab('bookings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '12px',
                background: activeTab === 'bookings' ? 'var(--color-bg)' : 'transparent',
                color: activeTab === 'bookings' ? 'var(--color-accent)' : 'var(--color-text)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'bookings' ? 700 : 500,
                textAlign: 'left',
                cursor: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { if (activeTab !== 'bookings') e.currentTarget.style.background = 'rgba(232,221,212,0.3)' }}
              onMouseLeave={(e) => { if (activeTab !== 'bookings') e.currentTarget.style.background = 'transparent' }}
            >
              <Calendar size={18} color={activeTab === 'bookings' ? 'var(--color-accent)' : 'rgba(44,36,32,0.5)'} />
              My Bookings
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '12px',
                background: activeTab === 'profile' ? 'var(--color-bg)' : 'transparent',
                color: activeTab === 'profile' ? 'var(--color-accent)' : 'var(--color-text)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'profile' ? 700 : 500,
                textAlign: 'left',
                cursor: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { if (activeTab !== 'profile') e.currentTarget.style.background = 'rgba(232,221,212,0.3)' }}
              onMouseLeave={(e) => { if (activeTab !== 'profile') e.currentTarget.style.background = 'transparent' }}
            >
              <User size={18} color={activeTab === 'profile' ? 'var(--color-accent)' : 'rgba(44,36,32,0.5)'} />
              My Profile
            </button>
          </div>

          {/* Main Dashboard Content */}
          <div style={{ minWidth: 0 }}>
            <AnimatePresence mode="wait">
              {activeTab === 'bookings' ? (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-text)' }}>
                      Booking History
                    </h2>
                  </div>

                  {loadingBookings ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {[1, 2].map(i => (
                        <div key={i} className="shimmer" style={{ height: '180px', borderRadius: '20px', background: 'rgba(232,221,212,0.3)' }} />
                      ))}
                    </div>
                  ) : bookings.length === 0 ? (
                    /* Beautiful Empty State */
                    <div className="dashboard-empty-state">
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          background: 'var(--color-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 24px',
                        }}
                      >
                        <Calendar size={28} color="var(--color-primary)" />
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
                        No bookings found
                      </h3>
                      <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(44,36,32,0.6)', maxWidth: '400px', margin: '0 auto 30px', lineHeight: 1.6 }}>
                        You haven't reserved your spot in any of our classes or retreats yet. Explore upcoming sessions to start.
                      </p>
                      <Link
                        to="/events"
                        className="btn-primary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '14px 28px',
                          borderRadius: '30px',
                          background: 'var(--color-text)',
                          color: 'white',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                          textDecoration: 'none',
                          boxShadow: '0 4px 15px rgba(44,36,32,0.1)',
                        }}
                      >
                        Browse Upcoming Events <ChevronRight size={16} />
                      </Link>
                    </div>
                  ) : (
                    /* Bookings List */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {bookings.map((booking) => {
                        const event = booking.events
                        if (!event) return null

                        const isUpcoming = new Date(event.date) > new Date()
                        const statusColors = {
                          confirmed: { bg: 'rgba(156,175,136,0.15)', text: 'var(--color-sage)', icon: <CheckCircle2 size={16} /> },
                          pending: { bg: 'rgba(200,168,130,0.15)', text: 'var(--color-primary)', icon: <Clock size={16} /> },
                          cancelled: { bg: 'rgba(231,76,60,0.1)', text: '#C0392B', icon: <XCircle size={16} /> },
                        }[booking.status]

                        return (
                          <div key={booking.id} className="dashboard-booking-card">
                            {/* Card Image */}
                            <div className="dashboard-booking-card-image">
                              {event.thumbnail_url ? (
                                <img
                                  src={event.thumbnail_url}
                                  alt={event.title}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div style={{ width: '100%', height: '100%', background: 'var(--color-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Calendar size={32} color="rgba(44,36,32,0.3)" />
                                </div>
                              )}
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '16px',
                                  left: '16px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  background: 'white',
                                  color: 'var(--color-accent)',
                                  padding: '4px 10px',
                                  borderRadius: '20px',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                }}
                              >
                                {event.category}
                              </span>
                            </div>
 
                            {/* Card Details */}
                            <div className="dashboard-booking-card-details">
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)' }}>
                                    {event.title}
                                  </h3>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '4px 12px',
                                      borderRadius: '20px',
                                      background: statusColors.bg,
                                      color: statusColors.text,
                                      fontSize: '0.8rem',
                                      fontWeight: 600,
                                      textTransform: 'capitalize',
                                    }}
                                  >
                                    {statusColors.icon}
                                    {booking.status}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '12px 0' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(44,36,32,0.6)', fontSize: '0.9rem' }}>
                                    <Calendar size={15} />
                                    <span>{formatDate(event.date)}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(44,36,32,0.6)', fontSize: '0.9rem' }}>
                                    <MapPin size={15} />
                                    <span>{event.location}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="booking-card-footer">
                                <div style={{ fontSize: '0.85rem', color: 'rgba(44,36,32,0.6)' }}>
                                  <span>{booking.participants} spot{booking.participants > 1 ? 's' : ''} reserved</span>
                                  <span style={{ margin: '0 8px' }}>•</span>
                                  <strong style={{ color: 'var(--color-text)' }}>₹{booking.total_price}</strong>
                                </div>

                                {isUpcoming && booking.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleCancelBooking(booking.id)}
                                    style={{
                                      border: 'none',
                                      background: 'none',
                                      fontFamily: 'var(--font-heading)',
                                      fontSize: '0.8rem',
                                      fontWeight: 600,
                                      color: '#C0392B',
                                      cursor: 'none',
                                      padding: '4px 8px',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                  >
                                    Cancel Booking
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              ) : (
                /* Profile Tab */
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
                >
                  {/* Edit Profile Form */}
                  <div className="dashboard-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <User size={20} color="var(--color-accent)" />
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        Personal Details
                      </h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(44,36,32,0.5)', marginBottom: '8px' }}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--color-soft)', borderRadius: '10px', background: '#FAFAF8', outline: 'none' }}
                          required
                        />
                      </div>

                      <div className="form-columns">
                        <div>
                          <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(44,36,32,0.5)', marginBottom: '8px' }}>
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--color-soft)', borderRadius: '10px', background: '#FAFAF8', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(44,36,32,0.5)', marginBottom: '8px' }}>
                            City
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--color-soft)', borderRadius: '10px', background: '#FAFAF8', outline: 'none' }}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={updatingProfile}
                        style={{
                          alignSelf: 'flex-start',
                          padding: '12px 24px',
                          background: 'var(--color-text)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          cursor: 'none',
                          transition: 'background 0.2s ease',
                          marginTop: '8px',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-text)'}
                      >
                        {updatingProfile ? 'Saving Changes...' : 'Save Profile'}
                      </button>
                    </form>
                  </div>

                  {/* Change Password Form */}
                  <div className="dashboard-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <Settings size={20} color="var(--color-accent)" />
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        Security Settings
                      </h2>
                    </div>

                    <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="form-columns">
                        <div>
                          <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(44,36,32,0.5)', marginBottom: '8px' }}>
                            New Password
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--color-soft)', borderRadius: '10px', background: '#FAFAF8', outline: 'none' }}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(44,36,32,0.5)', marginBottom: '8px' }}>
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--color-soft)', borderRadius: '10px', background: '#FAFAF8', outline: 'none' }}
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={updatingPassword}
                        style={{
                          alignSelf: 'flex-start',
                          padding: '12px 24px',
                          background: 'var(--color-text)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          cursor: 'none',
                          transition: 'background 0.2s ease',
                          marginTop: '8px',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-text)'}
                      >
                        {updatingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
