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
  MessageCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TripCardProps {
  trip: any;
  showActions?: boolean;
}

export function TripCard({ trip, showActions = true }: TripCardProps) {
  const availableSpots = trip.maxParticipants - trip.currentParticipants;
  const duration = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24));

  const getDestinationImage = (destination: string) => {
    // Simple mapping for common destinations
    const destinationImages: { [key: string]: string } = {
      "rio": "https://images.unsplash.com/photo-1544262686-20e4db59b33a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      "paris": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      "peru": "https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      "europa": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      "cancun": "https://images.unsplash.com/photo-1512046849505-bdf46560827d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      "fernando": "https://images.unsplash.com/photo-1558618047-79c0c2b9c9e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    };

    const key = destination.toLowerCase();
    for (const [searchTerm, image] of Object.entries(destinationImages)) {
      if (key.includes(searchTerm)) {
        return image;
      }
    }
    
    // Default travel image
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
  };

  const travelStyleLabels: { [key: string]: string } = {
    praia: "Praia",
    neve: "Neve",
    cruzeiros: "Cruzeiros",
    natureza: "Natureza e Ecoturismo",
    cultural: "Culturais e Históricas",
    aventura: "Aventura",
    parques: "Parques Temáticos",
  };

  return (
    <Card className="trip-card group">
      {/* Trip Image */}
      <div className="relative overflow-hidden">
        <img 
          src={getDestinationImage(trip.destination)} 
          alt={`Imagem de ${trip.destination}`}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge className={availableSpots > 0 ? "status-open" : "bg-red-100 text-red-800"}>
            {availableSpots > 0 ? `${availableSpots} vagas` : "Lotada"}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-white/90">
            {travelStyleLabels[trip.travelStyle] || trip.travelStyle}
          </Badge>
        </div>
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
  );
}
