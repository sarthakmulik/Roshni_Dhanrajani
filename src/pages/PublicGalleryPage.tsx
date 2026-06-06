import { useState, useEffect } from 'react'
import { supabase, type GalleryImage } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2 } from 'lucide-react'

export default function PublicGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .eq('is_hidden', false)
          .order('created_at', { ascending: false })
          .order('display_order', { ascending: true })

        if (error) throw error
        setImages(data || [])
      } catch (err) {
        console.error('Error fetching gallery:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImages()
  }, [])

  // Intersection Observer for scroll reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const timeout = setTimeout(() => {
      const elements = document.querySelectorAll('.reveal')
      elements.forEach((el) => observer.observe(el))
    }, 100)

    return () => {
      clearTimeout(timeout)
      observer.disconnect()
    }
  }, [images, isLoading])

  // Prevent background scrolling when lightbox is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [selectedImage])

  return (
    <>
      <main style={{ paddingTop: '160px', paddingBottom: '120px', minHeight: '100vh', background: 'var(--color-bg)' }}>
        <div className="container max-w-7xl">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="flex items-center justify-center gap-4 mb-6 reveal">
              <div className="gold-rule-short" />
              <span className="text-primary tracking-[0.25em] text-xs font-bold uppercase font-heading">
                Studio Gallery
              </span>
              <div className="gold-rule-short" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-medium mb-8 text-text reveal reveal-delay-1 leading-tight">
              Moments at <br /> Pulse It Out
            </h1>
            <p className="text-text-secondary text-lg md:text-xl reveal reveal-delay-2 font-light max-w-2xl mx-auto leading-relaxed">
              A glimpse into our mindful movement practice, equipment, and community. Discover the energy of our studio.
            </p>
          </div>

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-black/5 rounded-[24px] h-[450px]" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-32 bg-white/50 rounded-[32px] border border-black/5">
              <p className="text-text-secondary text-lg font-medium">More moments coming soon.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
              {images.map((image, i) => (
                <div 
                  key={image.id} 
                  className="reveal group relative rounded-[24px] overflow-hidden break-inside-avoid shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
                  style={{ transitionDelay: `${(i % 10) * 0.1}s` }}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.public_url}
                    alt={image.alt_text || 'Gallery Image'}
                    className="w-full h-auto object-cover transform transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Hover Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg border border-white/30">
                      <Maximize2 className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Alt Text Overlay */}
                  {image.alt_text && (
                    <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                      <p className="text-white font-medium text-base drop-shadow-lg tracking-wide">
                        {image.alt_text}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close Button */}
            <button
              className="absolute top-6 right-6 p-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X className="w-8 h-8" />
            </button>

            {/* Image Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-7xl max-h-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.public_url}
                alt={selectedImage.alt_text || 'Gallery Image'}
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
              {selectedImage.alt_text && (
                <p className="text-white/90 text-lg font-medium mt-6 tracking-wide text-center max-w-2xl">
                  {selectedImage.alt_text}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
