import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Loader2 } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  lazy?: boolean;
  blurhash?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  fallbackSrc = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  className = '',
  lazy = true,
  blurhash,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observerRef.current = observer;

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsError(false);
    } else {
      setIsError(true);
    }
    onError?.();
  }, [currentSrc, fallbackSrc, onError]);

  // Preload image when in view
  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = currentSrc;
    img.onload = handleLoad;
    img.onerror = handleError;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, currentSrc, handleLoad, handleError]);

  // Blurhash placeholder (if provided)
  const BlurhashPlaceholder = () => (
    <div 
      className={`bg-gray-100 animate-pulse ${className}`}
      style={{ 
        backgroundImage: blurhash ? `url(${blurhash})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    />
  );

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={`bg-gray-100 animate-pulse flex items-center justify-center ${className}`}>
      <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
    </div>
  );

  // Error state
  const ErrorState = () => (
    <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
      <div className="text-center">
        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <span className="text-xs text-gray-500">Falha ao carregar</span>
      </div>
    </div>
  );

  if (isError) {
    return <ErrorState />;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {blurhash ? <BlurhashPlaceholder /> : <LoadingSkeleton />}
          </motion.div>
        )}
      </AnimatePresence>

      {isInView && (
        <motion.img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
});

// Progressive image loading with multiple sources
export const ProgressiveImage = memo(function ProgressiveImage({
  src,
  lowQualitySrc,
  alt,
  className = '',
  ...props
}: {
  src: string;
  lowQualitySrc?: string;
  alt: string;
  className?: string;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);
  const [isLowQualityLoaded, setIsLowQualityLoaded] = useState(false);

  useEffect(() => {
    // Load low quality image first
    if (lowQualitySrc) {
      const lowQualityImg = new Image();
      lowQualityImg.src = lowQualitySrc;
      lowQualityImg.onload = () => setIsLowQualityLoaded(true);
    }

    // Load high quality image
    const highQualityImg = new Image();
    highQualityImg.src = src;
    highQualityImg.onload = () => setIsHighQualityLoaded(true);
  }, [src, lowQualitySrc]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Low quality placeholder */}
      {lowQualitySrc && (
        <motion.img
          src={lowQualitySrc}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLowQualityLoaded && !isHighQualityLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          {...props}
        />
      )}

      {/* High quality image */}
      <motion.img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHighQualityLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      />

      {/* Loading skeleton */}
      {!isLowQualityLoaded && !isHighQualityLoaded && (
        <div className={`absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center ${className}`}>
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      )}
    </div>
  );
});