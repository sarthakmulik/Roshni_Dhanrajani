import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  city: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  date: string
  location: string | null
  price: number | null
  max_participants: number
  current_bookings: number
  category: string
  thumbnail_url: string | null
  status: 'active' | 'draft'
  is_deleted: boolean
  created_at: string
}

export interface Booking {
  id: string
  event_id: string | null
  full_name: string
  email: string
  phone: string | null
  city: string | null
  participants: number
  notes: string | null
  hear_about_us: string | null
  total_price: number | null
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  events?: Event
}

export interface Testimonial {
  id: string
  name: string
  quote: string
  stars: number
  photo_url: string | null
  is_featured: boolean
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string
  cover_url: string | null
  category: string
  read_time_minutes: number
  is_published: boolean
  created_at: string
}

export interface GalleryImage {
  id: string
  storage_path: string
  public_url: string
  alt_text: string | null
  is_hidden: boolean
  display_order: number
  created_at: string
}
