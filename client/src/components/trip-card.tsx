import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { useState } from "react";

interface TripCardProps {
  trip: any;
  showActions?: boolean;
}

export function TripCard({ trip, showActions = true }: TripCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const availableSpots = trip.maxParticipants - trip.currentParticipants;
  const duration = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24));

  const getDestinationImage = (trip: any) => {
    // Use the trip's cover image if available, otherwise use default
    return trip.coverImage || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80";
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
            <Badge className={availableSpots > 0 ? "status-open" : "bg-red-100 text-red-800"}>
              {availableSpots > 0 ? `${availableSpots} vagas` : "Lotada"}
            </Badge>
          </div>
          
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
              {travelStyleLabels[trip.travelStyle] || trip.travelStyle}
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
                navigator.share?.({
                  title: trip.title,
                  text: trip.description,
                  url: window.location.href
                });
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
                {format(new Date(trip.startDate), "dd/MM", { locale: ptBR })} - {format(new Date(trip.endDate), "dd/MM", { locale: ptBR })}
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
              <span>{trip.currentParticipants}/{trip.maxParticipants} pessoas</span>
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
            <Avatar className="w-8 h-8">
              <AvatarImage src={trip.creator?.profilePhoto || ""} />
              <AvatarFallback className="text-xs">
                {trip.creator?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-sm text-gray-600">Por</span>
              <span className="text-sm font-medium text-gray-800 ml-1">
                {trip.creator?.fullName?.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="text-right">
            {trip.budget ? (
              <>
                <div className="flex items-center gap-1 text-primary font-semibold mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.round(trip.budget / trip.maxParticipants))}</span>
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
          <div className="mt-4 pt-4 border-t flex gap-2">
            <Link href={`/trip/${trip.id}`} className="flex-1">
              <Button variant="outline" className="w-full text-sm">
                Ver Detalhes
              </Button>
            </Link>
            
            {trip.currentParticipants < trip.maxParticipants ? (
              <Link href={`/trip/${trip.id}`} className="flex-1">
                <Button className="w-full text-sm bg-primary hover:bg-primary/90">
                  Participar
                </Button>
              </Link>
            ) : (
              <Button disabled className="flex-1 text-sm">
                Lotada
              </Button>
            )}
          </div>
        )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
