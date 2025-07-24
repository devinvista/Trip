import React, { useState, useEffect, useRef } from 'react';
import { OptimizedImage } from './optimized-image';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { cn } from '@/lib/utils';

interface LazyImageGalleryProps {
  images: string[];
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
  maxVisibleImages?: number;
  enableLightbox?: boolean;
}

export const LazyImageGallery = React.memo(function LazyImageGallery({
  images,
  className,
  aspectRatio = 'video',
  maxVisibleImages = 4,
  enableLightbox = true
}: LazyImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [visibleImages, setVisibleImages] = useState<string[]>([]);
  const observerRef = useRef<IntersectionObserver>();
  const galleryRef = useRef<HTMLDivElement>(null);

  // Lazy load images when they come into view
  useEffect(() => {
    const loadImages = () => {
      const imagesToLoad = images.slice(0, maxVisibleImages);
      setVisibleImages(imagesToLoad);
    };

    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImages();
              observerRef.current?.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );

      if (galleryRef.current) {
        observerRef.current.observe(galleryRef.current);
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      loadImages();
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [images, maxVisibleImages]);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video', 
    wide: 'aspect-[21/9]'
  };

  const openLightbox = (index: number) => {
    if (enableLightbox) {
      setCurrentImageIndex(index);
      setIsLightboxOpen(true);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isLightboxOpen) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        prevImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
      case 'Escape':
        setIsLightboxOpen(false);
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  if (visibleImages.length === 0) {
    return (
      <div 
        ref={galleryRef}
        className={cn("bg-gray-100 rounded-lg flex items-center justify-center", aspectRatioClasses[aspectRatio], className)}
      >
        <div className="text-gray-400 text-center">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-sm">Carregando imagens...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={galleryRef} className={cn("relative", className)}>
        {visibleImages.length === 1 ? (
          // Single image
          <div className="relative group">
            <OptimizedImage
              src={visibleImages[0]}
              alt="Imagem da galeria"
              className={cn("w-full object-cover rounded-lg", aspectRatioClasses[aspectRatio])}
              onClick={() => openLightbox(0)}
            />
            {enableLightbox && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                  onClick={() => openLightbox(0)}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Multiple images grid
          <div className="grid grid-cols-2 gap-2">
            {visibleImages.slice(0, 4).map((image, index) => (
              <div 
                key={index} 
                className={cn(
                  "relative group cursor-pointer",
                  index === 0 && visibleImages.length > 2 ? "col-span-2" : "",
                  aspectRatioClasses[aspectRatio]
                )}
                onClick={() => openLightbox(index)}
              >
                <OptimizedImage
                  src={image}
                  alt={`Imagem ${index + 1} da galeria`}
                  className="w-full h-full object-cover rounded-lg"
                />
                
                {/* Overlay for additional images */}
                {index === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      +{images.length - 4}
                    </span>
                  </div>
                )}

                {/* Hover effect */}
                {enableLightbox && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ZoomIn className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {enableLightbox && (
        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent className="max-w-4xl w-full h-[80vh] p-0 bg-black">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setIsLightboxOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Navigation buttons */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              {/* Current image */}
              <OptimizedImage
                src={images[currentImageIndex]}
                alt={`Imagem ${currentImageIndex + 1} da galeria`}
                className="max-w-full max-h-full object-contain"
              />

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
});