import { useState } from 'react';
import { Star, MapPin, Clock, Users, Heart } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { LoadingSpinner } from './ui/loading-spinner';
import { cn } from '@/lib/utils';
import { formatBrazilianCurrency, formatBrazilianNumber } from '@shared/utils';

interface Activity {
  id: number;
  title: string;
  description: string;
  location: string;
  coverImage: string;
  category: string;
  averageRating: number;
  totalRatings: number;
  estimatedDuration?: string;
  maxParticipants?: number;
  difficulty?: string;
}

interface ImprovedActivityCardProps {
  activity: Activity;
  onSelect?: (activity: Activity) => void;
  onFavorite?: (activityId: number) => void;
  isFavorited?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function ImprovedActivityCard({ 
  activity, 
  onSelect, 
  onFavorite,
  isFavorited = false,
  isLoading = false,
  className 
}: ImprovedActivityCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(activity.id);
  };

  const difficultyColors = {
    'fácil': 'bg-green-100 text-green-800',
    'médio': 'bg-yellow-100 text-yellow-800',
    'difícil': 'bg-red-100 text-red-800'
  };

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        "border-gray-200 hover:border-blue-300",
        isLoading && "pointer-events-none opacity-50",
        className
      )}
      onClick={() => onSelect?.(activity)}
    >
      <div className="relative">
        {/* Image with loading states */}
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <LoadingSpinner size="md" />
            </div>
          )}
          
          {!imageError ? (
            <img
              src={activity.coverImage}
              alt={activity.title}
              className={cn(
                "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
                imageLoading && "opacity-0"
              )}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Imagem não disponível</p>
              </div>
            </div>
          )}

          {/* Favorite button */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={handleFavoriteClick}
          >
            <Heart 
              className={cn(
                "w-4 h-4 transition-colors",
                isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
              )} 
            />
          </Button>

          {/* Category badge */}
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-white/90 text-gray-800"
          >
            {activity.category}
          </Badge>

          {/* Difficulty badge */}
          {activity.difficulty && (
            <Badge 
              className={cn(
                "absolute bottom-2 left-2",
                difficultyColors[activity.difficulty as keyof typeof difficultyColors] || 'bg-gray-100 text-gray-800'
              )}
            >
              {activity.difficulty}
            </Badge>
          )}
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-lg leading-tight text-gray-900 group-hover:text-blue-600 transition-colors">
            {activity.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {activity.description}
          </p>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{activity.location}</span>
          </div>

          {/* Rating and metadata */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-4">
              {/* Rating */}
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm font-medium text-gray-900">
                  {formatBrazilianNumber(activity.averageRating).replace(',00', ',0')}
                </span>
                <span className="ml-1 text-sm text-gray-500">
                  ({activity.totalRatings})
                </span>
              </div>

              {/* Duration */}
              {activity.estimatedDuration && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{activity.estimatedDuration}</span>
                </div>
              )}
            </div>

            {/* Max participants */}
            {activity.maxParticipants && (
              <div className="flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-1" />
                <span>até {activity.maxParticipants}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}