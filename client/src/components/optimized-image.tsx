import { useState, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './ui/loading-spinner';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  loaderClassName?: string;
  errorClassName?: string;
  showLoader?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  className,
  loaderClassName,
  errorClassName,
  showLoader = true,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400",
          errorClassName,
          className
        )}
      >
        <div className="text-center">
          <div className="text-lg mb-1">📷</div>
          <div className="text-xs">Imagem não disponível</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && showLoader && (
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-gray-100",
            loaderClassName
          )}
        >
          <LoadingSpinner size="sm" />
        </div>
      )}
      
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading && "opacity-0",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}