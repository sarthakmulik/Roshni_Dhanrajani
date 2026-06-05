import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, BookOpen, TrendingUp, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AdminLayout } from '@/components/admin/AdminLayout'

interface Stats {
  totalEvents: number
  totalBookings: number
  upcomingEvents: number
  recentBookings: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalEvents: 0, totalBookings: 0, upcomingEvents: 0, recentBookings: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Dashboard | Pulse It Out Admin'
  }, [])

  useEffect(() => {
    async function fetchStats() {
      try {
        const now = new Date().toISOString()
        const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const [eventsRes, bookingsRes, upcomingRes, recentRes] = await Promise.all([
          supabase.from('events').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
          supabase.from('bookings').select('id', { count: 'exact', head: true }),
          supabase.from('events').select('id', { count: 'exact', head: true }).gte('date', now).lte('date', weekLater).eq('is_deleted', false),
          supabase.from('bookings').select('id', { count: 'exact', head: true }).gte('created_at', dayAgo),
        ])

        setStats({
          totalEvents: eventsRes.count || 0,
          totalBookings: bookingsRes.count || 0,
          upcomingEvents: upcomingRes.count || 0,
          recentBookings: recentRes.count || 0,
        })
      } catch {
        // Keep zeros on error
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const cards = [
    {
      label: 'Total Events',
      value: stats.totalEvents,
      icon: <Calendar size={24} />,
      color: 'var(--color-primary)',
      href: '/admin/events',
    },
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      icon: <BookOpen size={24} />,
      color: 'var(--color-sage)',
      href: '/admin/bookings',
    },
    {
      label: 'Events This Week',
      value: stats.upcomingEvents,
      icon: <TrendingUp size={24} />,
      color: 'var(--color-accent)',
      href: '/admin/events',
    },
    {
      label: 'Bookings (24h)',
      value: stats.recentBookings,
      icon: <Clock size={24} />,
      color: '#7B9ED9',
      href: '/admin/bookings',
    },
  ]

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginBottom: '8px',
            }}
          >
            Dashboard
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'rgba(44,36,32,0.55)' }}>
            Welcome back! Here's what's happening with Pulse It Out.
          </p>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            marginBottom: '40px',
          }}
          className="stats-grid-admin"
        >
          {cards.map((card) => (
            <Link
              key={card.label}
              to={card.href}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="stat-card"
                style={{
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  borderTop: `3px solid ${card.color}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-med)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-soft)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: `${card.color}18`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.4rem',
                    fontWeight: 500,
                    color: 'var(--color-text)',
                    lineHeight: 1,
                    marginBottom: '8px',
                  }}
                >
                  {loading ? '—' : card.value}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'rgba(44,36,32,0.45)',
                  }}
                >
                  {card.label}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div
          style={{
            background: 'var(--color-white)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
              marginBottom: '24px',
            }}
          >
            Quick Actions
          </h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/admin/events" className="btn-primary">+ Create Event</Link>
            <Link to="/admin/bookings" className="btn-outline">View Bookings</Link>
            <Link to="/admin/testimonials" className="btn-outline">Manage Testimonials</Link>
            <Link to="/" className="btn-ghost" target="_blank" style={{ color: 'var(--color-accent)' }}>
              View Live Site ↗
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .stats-grid-admin { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .stats-grid-admin { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AdminLayout>
  )
}
