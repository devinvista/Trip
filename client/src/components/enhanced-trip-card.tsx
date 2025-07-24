import { useState } from 'react';
import { Star, MapPin, Calendar, Users, DollarSign, Clock, Heart, Share2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LoadingSpinner } from './ui/loading-spinner';
import { OptimizedImage } from './optimized-image';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Trip {
  id: number;
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  maxParticipants: number;
  currentParticipants: number;
  travelStyle: string;
  creator: {
    id: number;
    fullName: string;
    profilePhoto?: string;
    averageRating: number;
    isVerified: boolean;
  };
  coverImage?: string;
}

interface EnhancedTripCardProps {
  trip: Trip;
  onSelect?: (trip: Trip) => void;
  onFavorite?: (tripId: number) => void;
  onShare?: (tripId: number) => void;
  isFavorited?: boolean;
  isLoading?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
}

export function EnhancedTripCard({ 
  trip, 
  onSelect, 
  onFavorite,
  onShare,
  isFavorited = false,
  isLoading = false,
  className,
  variant = 'default'
}: EnhancedTripCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(trip.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(trip.id);
  };

  const travelStyleColors = {
    'praia': 'bg-blue-100 text-blue-800',
    'aventura': 'bg-green-100 text-green-800',
    'urbanas': 'bg-gray-100 text-gray-800',
    'cultural': 'bg-purple-100 text-purple-800',
    'natureza': 'bg-emerald-100 text-emerald-800',
    'neve': 'bg-cyan-100 text-cyan-800'
  };

  const getDaysUntilTrip = () => {
    const startDate = new Date(trip.startDate);
    const today = new Date();
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilTrip();
  const isUpcoming = daysUntil > 0;
  const spotsLeft = trip.maxParticipants - trip.currentParticipants;

  const cardHeight = variant === 'compact' ? 'h-64' : variant === 'featured' ? 'h-80' : 'h-72';

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2",
        "border-gray-200 hover:border-blue-300 overflow-hidden",
        variant === 'featured' && "ring-2 ring-blue-200 shadow-lg",
        isLoading && "pointer-events-none opacity-50",
        cardHeight,
        className
      )}
      onClick={() => onSelect?.(trip)}
    >
      <div className="relative h-2/3">
        {/* Cover Image */}
        <OptimizedImage
          src={trip.coverImage || `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&crop=center`}
          alt={trip.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          fallbackSrc="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&crop=center"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={handleShareClick}
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={handleFavoriteClick}
          >
            <Heart 
              className={cn(
                "w-4 h-4 transition-colors",
                isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
              )} 
            />
          </Button>
        </div>

        {/* Travel Style Badge */}
        <Badge 
          className={cn(
            "absolute top-3 left-3",
            travelStyleColors[trip.travelStyle as keyof typeof travelStyleColors] || 'bg-gray-100 text-gray-800'
          )}
        >
          {trip.travelStyle}
        </Badge>

        {/* Featured Badge */}
        {variant === 'featured' && (
          <Badge className="absolute top-12 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            ⭐ Destaque
          </Badge>
        )}

        {/* Days Until Trip */}
        {isUpcoming && daysUntil <= 30 && (
          <Badge 
            variant="secondary" 
            className="absolute bottom-3 right-3 bg-white/90 text-gray-800"
          >
            {daysUntil === 1 ? 'Amanhã' : `${daysUntil} dias`}
          </Badge>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-t-lg">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>

      <CardContent className="p-4 h-1/3 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Title and Location */}
          <div>
            <h3 className="font-semibold text-lg leading-tight text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {trip.title}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{trip.destination}</span>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">
              {format(new Date(trip.startDate), 'dd MMM', { locale: ptBR })} - {format(new Date(trip.endDate), 'dd MMM', { locale: ptBR })}
            </span>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-3">
          {/* Creator Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={trip.creator.profilePhoto} />
                <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                  {trip.creator.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600 truncate max-w-20">
                  {trip.creator.fullName.split(' ')[0]}
                </span>
                {trip.creator.isVerified && (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </div>

            {/* Creator Rating */}
            <div className="flex items-center">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium text-gray-900">
                {trip.creator.averageRating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Trip Stats */}
          <div className="flex items-center justify-between text-sm">
            {/* Budget */}
            <div className="flex items-center text-green-600 font-medium">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>R$ {trip.budget.toLocaleString()}</span>
            </div>

            {/* Participants */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                <span>{trip.currentParticipants}/{trip.maxParticipants}</span>
              </div>
              
              {spotsLeft > 0 && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    spotsLeft === 1 ? "border-orange-300 text-orange-600" : "border-green-300 text-green-600"
                  )}
                >
                  {spotsLeft} {spotsLeft === 1 ? 'vaga' : 'vagas'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}