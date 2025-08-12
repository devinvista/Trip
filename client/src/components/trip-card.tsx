import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  MessageCircle,
  Heart,
  Share2,
  Star,
  Eye,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { useState, memo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth-snake";
import { getRealParticipantsCount, getAvailableSpots, isTripFull } from "@/lib/trip-utils";
import { getTripDuration, safeParseDate } from "@/lib/date-utils";

interface TripCardProps {
  trip: any;
  showActions?: boolean;
}

export const TripCard = memo(function TripCard({ trip, showActions = true }: TripCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Use standardized participant counting
  const currentParticipants = getRealParticipantsCount(trip);
  const availableSpots = getAvailableSpots(trip);
  const isFull = isTripFull(trip);
  const duration = getTripDuration(
    trip.start_date || trip.startDate, 
    trip.end_date || trip.endDate
  );

  const getDestinationImage = (trip: any) => {
    // Use the trip's cover image if available
    if (trip.cover_image) {
      return trip.cover_image;
    }
    
    // For cruise trips, use cruise ship images instead of destination images
    if (trip.travel_style === 'cruzeiros') {
      const cruiseImages = [
        "https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=800&q=80", // Luxury cruise ship
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80", // Cruise ship at sunset
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80", // Cruise ship in fjord
        "https://images.unsplash.com/photo-1570197526-ebbe9c6df8f2?w=800&q=80", // Cruise ship in Alaska
      ];
      return cruiseImages[Math.floor(Math.random() * cruiseImages.length)];
    }
    
    // Default fallback for other travel types
    return "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80";
  };

  const travelStyleLabels: { [key: string]: string } = {
    praia: "Praia",
    neve: "Neve",
    cruzeiros: "Cruzeiros",
    natureza: "Natureza e Ecoturismo",
    cultural: "Culturais e Históricas",
    aventura: "Aventura",
    parques: "Parques Temáticos",
    urbanas: "Viagens Urbanas / Cidades Grandes",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <Card className="trip-card overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
        {/* Trip Image */}
        <div className="relative overflow-hidden">
          <img 
            src={getDestinationImage(trip)} 
            alt={`Imagem de ${trip.destination}`}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Overlay gradient on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
          
          {/* Status badges */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge className={!isFull ? "status-open" : "bg-red-100 text-red-800"}>
              {!isFull ? `${availableSpots} vagas` : "Lotada"}
            </Badge>
          </div>
          
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
              {travelStyleLabels[trip.travel_style] || trip.travel_style}
            </Badge>
          </div>

          {/* Floating action buttons on hover */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-3 right-3 flex gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/80 text-gray-700 hover:bg-white hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const shareData = {
                  title: trip.title,
                  text: trip.description,
                  url: `${window.location.origin}/trip/${trip.id}`
                };

                if (navigator.share) {
                  navigator.share(shareData).catch(console.error);
                } else {
                  // Fallback: copiar URL para clipboard
                  navigator.clipboard.writeText(shareData.url).then(() => {
                    toast({
                      title: "Link copiado!",
                      description: "O link da viagem foi copiado para sua área de transferência.",
                    });
                  }).catch(() => {
                    // Fallback final: abrir WhatsApp
                    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareData.title} - ${shareData.text} ${shareData.url}`)}`, '_blank');
                    toast({
                      title: "Compartilhar via WhatsApp",
                      description: "Redirecionando para o WhatsApp...",
                    });
                  });
                }
              }}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-blue-500 transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </motion.button>
          </motion.div>

          {/* Trip rating overlay */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -20 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="absolute bottom-3 left-3"
          >
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="text-xs font-medium text-gray-700">4.8</span>
            </div>
          </motion.div>
        </div>

        <CardContent className="p-6">
        {/* Trip Header */}
        <div className="mb-3">
          <h3 className="font-heading font-semibold text-xl text-dark mb-2 line-clamp-1">
            {trip.title || "Viagem sem título"}
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{trip.destination}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {format(safeParseDate(trip.start_date || trip.startDate), "dd/MM", { locale: ptBR })} - {format(safeParseDate(trip.end_date || trip.endDate), "dd/MM", { locale: ptBR })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{duration} dias</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{currentParticipants}/{trip.max_participants} pessoas</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {trip.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Creator Info */}
          <div className="flex items-center space-x-2">
            <UserAvatar 
              user={trip.creator}
              size="sm"
              className="w-8 h-8"
            />
            <div>
              <span className="text-sm text-gray-600">Por</span>
              <span className="text-sm font-medium text-gray-800 ml-1">
                {(trip.creator?.full_name || 'Usuário')?.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="text-right">
            {trip.budget ? (
              <>
                <div className="flex items-center gap-1 text-primary font-semibold mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.round(trip.budget / trip.max_participants))}</span>
                </div>
                <div className="text-xs text-gray-500">por pessoa</div>
                <div className="text-xs text-gray-400 mt-1">
                  Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(trip.budget)}
                </div>
              </>
            ) : (
              <div className="text-xs text-gray-500">Orçamento a definir</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
            <Link href={`/trip/${trip.id}`} className="flex-1">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full text-xs font-semibold bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-slate-300 hover:bg-slate-50/90 text-slate-700 hover:text-slate-800 rounded-lg py-2 h-8 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Ver
                </Button>
              </motion.div>
            </Link>
            
            {/* Edit button for trip creators */}
            {user && trip.creator_id === user.id && (
              <Link href={`/edit-trip/${trip.id}`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-auto"
                >
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold bg-white/80 backdrop-blur-sm border border-blue-200 hover:border-blue-300 hover:bg-blue-50/90 text-blue-600 hover:text-blue-700 rounded-lg px-3 py-2 h-8 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                </motion.div>
              </Link>
            )}

            {!isFull ? (
              <Link href={`/trip/${trip.id}`} className="flex-1">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Button 
                    size="sm"
                    className="w-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 rounded-lg py-2 h-8 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    Participar
                  </Button>
                </motion.div>
              </Link>
            ) : (
              <motion.div className="flex-1">
                <Button 
                  disabled 
                  size="sm"
                  className="w-full text-xs font-semibold bg-gray-100 text-gray-400 border-0 rounded-lg py-2 h-8 cursor-not-allowed"
                >
                  <Users className="w-3 h-3 mr-1" />
                  Lotada
                </Button>
              </motion.div>
            )}
          </div>
        )}
        </CardContent>
      </Card>
    </motion.div>
  );
});
