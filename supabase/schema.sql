-- =============================================
-- PULSE IT OUT — SUPABASE DATABASE SCHEMA (PRODUCTION READY)
-- =============================================
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  city TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure profiles columns exist if table was pre-existing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- =============================================
-- EVENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  price NUMERIC(10,2),
  max_participants INT DEFAULT 20,
  current_bookings INT DEFAULT 0,
  category TEXT DEFAULT 'Workshop',
  thumbnail_url TEXT,
  status TEXT DEFAULT 'active',  -- active | draft
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BOOKINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  participants INT DEFAULT 1,
  notes TEXT,
  hear_about_us TEXT,
  total_price NUMERIC(10,2),
  status TEXT DEFAULT 'pending',  -- pending | confirmed | cancelled
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure user_id and admin_note columns exist if table was pre-existing (Phase 1 → Phase 2)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS admin_note TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS hear_about_us TEXT;

-- =============================================
-- TESTIMONIALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quote TEXT NOT NULL,
  stars INT DEFAULT 5,
  photo_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SECURITY HELPER FUNCTIONS
-- =============================================

-- Security definer helper to check admin role without infinite RLS recursion
CREATE OR REPLACE FUNCTION public.check_is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PL/pgSQL TRIGGERS AND CORE FUNCTIONS
-- =============================================

-- 1. Auto-create profile on signup trigger (Safely handles null metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      CASE 
        WHEN NEW.raw_user_meta_data IS NOT NULL THEN NEW.raw_user_meta_data->>'full_name'
        ELSE NULL
      END,
      ''
    ),
    CASE 
      WHEN NEW.raw_user_meta_data IS NOT NULL THEN NEW.raw_user_meta_data->>'avatar_url'
      ELSE NULL
    END,
    (NEW.email = 'sarthakmulik16@gmail.com') -- Automatically sets designated admin role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    is_admin = COALESCE(public.profiles.is_admin, EXCLUDED.is_admin);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Trigger to manage event spots (participants count)
CREATE OR REPLACE FUNCTION public.manage_booking_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment if status changes to confirmed
  IF (TG_OP = 'INSERT' AND NEW.status = 'confirmed') OR
     (TG_OP = 'UPDATE' AND NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed')) THEN
    UPDATE public.events SET current_bookings = LEAST(max_participants, current_bookings + NEW.participants)
    WHERE id = NEW.event_id;
  END IF;

  -- Decrement if status changes from confirmed to something else
  IF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
    UPDATE public.events SET current_bookings = GREATEST(0, current_bookings - OLD.participants)
    WHERE id = NEW.event_id;
  END IF;

  -- Decrement if booking is deleted and it was confirmed
  IF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    UPDATE public.events SET current_bookings = GREATEST(0, current_bookings - OLD.participants)
    WHERE id = OLD.event_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_booking_change ON public.bookings;
CREATE TRIGGER on_booking_change
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.manage_booking_count();

-- 3. Trigger to prevent self-escalation of admin privileges
CREATE OR REPLACE FUNCTION public.protect_admin_flag()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin AND NOT public.check_is_admin(auth.uid()) THEN
    NEW.is_admin = OLD.is_admin;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_is_admin_escalation ON public.profiles;
CREATE TRIGGER prevent_is_admin_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_admin_flag();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES & CONFLICT DROPS
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 1. Drop existing policies to prevent conflicts on re-runs
DROP POLICY IF EXISTS "Profiles: Users read own or admin read all" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Users update own or admin update all" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Allow signup insertions" ON public.profiles;

DROP POLICY IF EXISTS "Events: Public read active" ON public.events;
DROP POLICY IF EXISTS "Events: Admin full access" ON public.events;

DROP POLICY IF EXISTS "Bookings: Users read own or admin read all" ON public.bookings;
DROP POLICY IF EXISTS "Bookings: Public insert" ON public.bookings;
DROP POLICY IF EXISTS "Bookings: Admin full access" ON public.bookings;

DROP POLICY IF EXISTS "Testimonials: Public read featured" ON public.testimonials;
DROP POLICY IF EXISTS "Testimonials: Admin full access" ON public.testimonials;

-- 2. Create public.profiles Policies
CREATE POLICY "Profiles: Users read own or admin read all" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.check_is_admin(auth.uid()));

CREATE POLICY "Profiles: Users update own or admin update all" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.check_is_admin(auth.uid()));

CREATE POLICY "Profiles: Allow signup insertions" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- 3. Create public.events Policies
CREATE POLICY "Events: Public read active" ON public.events
  FOR SELECT USING (status = 'active' AND is_deleted = false);

CREATE POLICY "Events: Admin full access" ON public.events
  FOR ALL USING (public.check_is_admin(auth.uid()));

-- 4. Create public.bookings Policies
CREATE POLICY "Bookings: Users read own or admin read all" ON public.bookings
  FOR SELECT USING (user_id = auth.uid() OR public.check_is_admin(auth.uid()));

CREATE POLICY "Bookings: Public insert" ON public.bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Bookings: Admin full access" ON public.bookings
  FOR ALL USING (public.check_is_admin(auth.uid()));

-- 5. Create public.testimonials Policies
CREATE POLICY "Testimonials: Public read featured" ON public.testimonials
  FOR SELECT USING (is_featured = true);

CREATE POLICY "Testimonials: Admin full access" ON public.testimonials
  FOR ALL USING (public.check_is_admin(auth.uid()));

-- =============================================
-- BLOG POSTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  body TEXT NOT NULL,
  cover_url TEXT,
  category TEXT DEFAULT 'Wellness',
  read_time_minutes INT DEFAULT 3,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.blog_posts;

CREATE POLICY "Public can read published posts" ON public.blog_posts
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all posts" ON public.blog_posts
  FOR ALL USING (public.check_is_admin(auth.uid()));

-- =============================================
-- STORAGE BUCKETS & POLICIES (WEBSITE MEDIA)
-- =============================================

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-covers', 'blog-covers', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-thumbnails', 'event-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonial-photos', 'testimonial-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to prevent conflicts on re-run
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Select Blog Covers" ON storage.objects;
DROP POLICY IF EXISTS "Public Select Event Thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Public Select Testimonial Photos" ON storage.objects;

DROP POLICY IF EXISTS "Admins can upload blog covers" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update blog covers" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete blog covers" ON storage.objects;

DROP POLICY IF EXISTS "Admins can upload event thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update event thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete event thumbnails" ON storage.objects;

DROP POLICY IF EXISTS "Admins can upload testimonial photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update testimonial photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete testimonial photos" ON storage.objects;

-- 3. Public READ (SELECT) Policies
CREATE POLICY "Public Select Blog Covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-covers');

CREATE POLICY "Public Select Event Thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-thumbnails');

CREATE POLICY "Public Select Testimonial Photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'testimonial-photos');

-- 4. Admin WRITE (INSERT/UPDATE/DELETE) Policies for blog-covers
CREATE POLICY "Admins can upload blog covers" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-covers' AND
    auth.role() = 'authenticated' AND
    public.check_is_admin(auth.uid())
  );

CREATE POLICY "Admins can update blog covers" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'blog-covers' AND
    auth.role() = 'authenticated' AND
    public.check_is_admin(auth.uid())
  );

CREATE POLICY "Admins can delete blog covers" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-covers' AND
    auth.role() = 'authenticated' AND
    public.check_is_admin(auth.uid())
  );

-- 5. Admin WRITE (INSERT/UPDATE/DELETE) Policies for event-thumbnails
CREATE POLICY "Admins can upload event thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-thumbnails' AND
    auth.role() = 'authenticated' AND
    public.check_is_admin(auth.uid())
  );

CREATE POLICY "Admins can update event thumbnails" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'event-thumbnails' AND
    auth.role() = 'authenticated' AND
    public.check_is_admin(auth.uid())
  );

CREATE POLICY "Admins can delete event thumbnails" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'event-thumbnails' AND
    auth.role() = 'authenticated' AND
    public.check_is_admin(auth.uid())
  );

-- 6. Admin WRITE (INSERT/UPDATE/DELETE) Policies for testimonial-photos
CREATE POLICY "Admins can upload testimonial photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'testimonial-photos' AND
    auth.role() = 'authenticated' AND
    public.check_is_admin(auth.uid())
  );

CREATE POLICY "Admins can update testimonial photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'testimonial-photos' AND
    auth.role() = 'authenticated' AND
    public.check_is_admin(auth.uid())
  );

CREATE POLICY "Admins can delete testimonial photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'testimonial-photos' AND
    auth.role() = 'authenticated' AND
    public.check_is_admin(auth.uid())
  );


