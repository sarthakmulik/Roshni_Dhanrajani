import { useEffect } from 'react'
import { HeroSection } from '@/components/home/HeroSection'
import { StatsStrip } from '@/components/home/StatsStrip'
import { AboutSection } from '@/components/home/AboutSection'
import { EventsPreview } from '@/components/home/EventsPreview'
import { Testimonials } from '@/components/home/Testimonials'
import { GalleryStrip } from '@/components/home/GalleryStrip'
import { BlogTeaser } from '@/components/home/BlogTeaser'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { PageTransition } from '@/components/ui/PageTransition'

export function HomePage() {
  useScrollReveal()

  useEffect(() => {
    document.title = 'Pulse It Out | Premium Pilates by Roshni Dhanrajani'
  }, [])

  return (
    <PageTransition>
      <main>
        <HeroSection />
        <StatsStrip />
        <AboutSection />
        <EventsPreview />
        <Testimonials />
        <GalleryStrip />
        <BlogTeaser />
      </main>
    </PageTransition>
  )
}
