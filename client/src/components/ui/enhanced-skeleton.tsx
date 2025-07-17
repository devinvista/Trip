import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface EnhancedSkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'avatar' | 'text' | 'image';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function EnhancedSkeleton({ 
  className,
  variant = 'default',
  size = 'md',
  animated = true
}: EnhancedSkeletonProps) {
  const baseClasses = cn(
    "rounded-md bg-muted",
    {
      "animate-pulse": animated,
      "h-4": size === 'sm' && variant === 'text',
      "h-6": size === 'md' && variant === 'text',
      "h-8": size === 'lg' && variant === 'text',
      "w-8 h-8 rounded-full": size === 'sm' && variant === 'avatar',
      "w-12 h-12 rounded-full": size === 'md' && variant === 'avatar',
      "w-16 h-16 rounded-full": size === 'lg' && variant === 'avatar',
      "h-32": variant === 'image',
      "h-48": variant === 'card',
    },
    className
  );

  if (variant === 'card') {
    return (
      <div className={cn("p-4 space-y-3", className)}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  return <div className={baseClasses} />;
}

export function TripCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded-full w-8" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}