import { useState, useEffect, useRef } from 'react'
import { supabase, type GalleryImage } from '../../lib/supabase'
import { Plus, Image as ImageIcon, Trash2, Eye, EyeOff, GripVertical, Save, X } from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'

export default function GalleryManagePage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false })
        .order('display_order', { ascending: true })

      if (error) throw error
      setImages(data || [])
    } catch (err: any) {
      console.error('Error fetching gallery:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      setError(null)

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const storagePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(storagePath)

      // Get highest display order
      const highestOrder = images.length > 0 ? Math.max(...images.map(img => img.display_order)) : 0

      // Insert into database
      const { data: newImage, error: dbError } = await supabase
        .from('gallery_images')
        .insert({
          storage_path: storagePath,
          public_url: publicUrl,
          alt_text: file.name,
          is_hidden: false,
          display_order: highestOrder + 1
        })
        .select()
        .single()

      if (dbError) throw dbError

      if (newImage) {
        setImages(prev => [...prev, newImage])
      }
    } catch (err: any) {
      console.error('Error uploading image:', err)
      setError(err.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (id: string, storagePath: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('gallery')
        .remove([storagePath])

      if (storageError) console.warn('Could not delete from storage:', storageError)

      // Delete from db
      const { error: dbError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id)

      if (dbError) throw dbError

      setImages(prev => prev.filter(img => img.id !== id))
    } catch (err: any) {
      console.error('Error deleting image:', err)
      setError(err.message)
    }
  }

  const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ is_hidden: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, is_hidden: !currentStatus } : img
      ))
    } catch (err: any) {
      console.error('Error toggling visibility:', err)
      setError(err.message)
    }
  }

  const handleUpdateAltText = async (id: string, newAltText: string) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ alt_text: newAltText })
        .eq('id', id)

      if (error) throw error

      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, alt_text: newAltText } : img
      ))
    } catch (err: any) {
      console.error('Error updating alt text:', err)
      setError(err.message)
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading mb-2">Gallery Management</h1>
          <p className="text-text-secondary">Upload and manage images for the public gallery.</p>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="btn-primary flex items-center gap-2"
        >
          {isUploading ? (
            <span className="animate-pulse">Uploading...</span>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Upload Image
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6 flex justify-between items-center">
          <p>{error}</p>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white/5 rounded-xl h-[300px]" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-text-secondary opacity-50" />
          <h3 className="text-xl font-bold mb-2">No Images Yet</h3>
          <p className="text-text-secondary mb-6">Upload some images to show off your studio.</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary"
          >
            Upload First Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <div key={image.id} className={`group relative bg-surface border border-white/10 rounded-xl overflow-hidden transition-all duration-300 ${image.is_hidden ? 'opacity-60' : 'hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_8px_30px_rgba(212,175,55,0.1)]'}`}>
              
              {/* Image Preview */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/20">
                <img 
                  src={image.public_url} 
                  alt={image.alt_text || 'Gallery image'} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Overlay actions */}
                <div className="absolute top-3 right-3 flex gap-2 translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    onClick={() => handleToggleVisibility(image.id, image.is_hidden)}
                    className="p-2 bg-black/50 backdrop-blur-md hover:bg-primary text-white rounded-lg transition-colors"
                    title={image.is_hidden ? "Show image" : "Hide image"}
                  >
                    {image.is_hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDelete(image.id, image.storage_path)}
                    className="p-2 bg-black/50 backdrop-blur-md hover:bg-red-500 text-white rounded-lg transition-colors"
                    title="Delete image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {image.is_hidden && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-md text-xs rounded-full border border-white/20">
                    Hidden
                  </div>
                )}
              </div>

              {/* Details & Edit */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2 text-text-secondary text-xs">
                  <GripVertical className="w-3 h-3" />
                  <span>Order: {image.display_order}</span>
                  <span className="mx-1">•</span>
                  <span>{new Date(image.created_at).toLocaleDateString()}</span>
                </div>
                
                <input
                  type="text"
                  value={image.alt_text || ''}
                  onChange={(e) => {
                    const newText = e.target.value;
                    setImages(prev => prev.map(img => img.id === image.id ? { ...img, alt_text: newText } : img))
                  }}
                  onBlur={(e) => handleUpdateAltText(image.id, e.target.value)}
                  placeholder="Add description / alt text"
                  className="w-full bg-transparent border-b border-white/10 pb-1 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
