import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth-snake";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  Plus,
  MoreVertical,
  MessageCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";
import { getRealParticipantsCount } from "@/lib/trip-utils";

interface Trip {
  id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  max_participants: number;
  current_participants: number;
  description: string;
  travel_style: string;
  status: string;
  creator?: any;
}

interface TravelBoardProps {
  className?: string;
}

// Travel board columns/categories
const BOARD_COLUMNS = [
  {
    id: 'planning',
    title: 'Planejando',
    description: 'Viagens em fase de planejamento',
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'bg-blue-100'
  },
  {
    id: 'upcoming',
    title: 'Próximas',
    description: 'Viagens confirmadas',
    color: 'bg-yellow-50 border-yellow-200',
    headerColor: 'bg-yellow-100'
  },
  {
    id: 'active',
    title: 'Em Andamento',
    description: 'Viagens acontecendo agora',
    color: 'bg-green-50 border-green-200',
    headerColor: 'bg-green-100'
  },
  {
    id: 'completed',
    title: 'Concluídas',
    description: 'Viagens finalizadas',
    color: 'bg-gray-50 border-gray-200',
    headerColor: 'bg-gray-100'
  }
];

export function TravelBoard({ className = "" }: TravelBoardProps) {
  const { user } = useAuth();
  const [draggedTrip, setDraggedTrip] = useState<Trip | null>(null);
  const [tripCategories, setTripCategories] = useState<Record<string, Trip[]>>({
    planning: [],
    upcoming: [],
    active: [],
    completed: []
  });

  // Fetch user's trips
  const { data: myTripsData } = useQuery({
    queryKey: ["/api/my-trips"],
    enabled: !!user,
  });

  // Get all available trips
  const { data: allTrips = [] } = useQuery({
    queryKey: ["/api/trips"],
    enabled: !!user,
  });

  // Cast the trips data to Trip array
  const trips = (allTrips as Trip[]) || [];

  // Categorize trips based on dates and status
  useEffect(() => {
    if (!trips || trips.length === 0) return;

    const now = new Date();
    const categorized: Record<string, Trip[]> = {
      planning: [],
      upcoming: [],
      active: [],
      completed: []
    };

    trips.forEach((trip: Trip) => {
      const startDate = new Date(trip.start_date);
      const endDate = new Date(trip.end_date);
      
      if (endDate < now) {
        categorized.completed.push(trip);
      } else if (startDate <= now && endDate >= now) {
        categorized.active.push(trip);
      } else if (startDate > now) {
        // Future trips - categorize as upcoming if confirmed, planning if still open
        if (getRealParticipantsCount(trip) >= 2) {
          categorized.upcoming.push(trip);
        } else {
          categorized.planning.push(trip);
        }
      }
    });

    setTripCategories(categorized);
  }, [trips]);

  const handleDragStart = (e: React.DragEvent, trip: Trip) => {
    setDraggedTrip(trip);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    
    if (!draggedTrip) return;

    // Find source column
    let sourceColumn = '';
    Object.entries(tripCategories).forEach(([columnId, trips]) => {
      if (trips.find(t => t.id === draggedTrip.id)) {
        sourceColumn = columnId;
      }
    });

    if (sourceColumn === targetColumn) return;

    // Move trip between columns
    setTripCategories(prev => {
      const newCategories = { ...prev };
      
      // Remove from source
      newCategories[sourceColumn] = newCategories[sourceColumn].filter(
        t => t.id !== draggedTrip.id
      );
      
      // Add to target
      newCategories[targetColumn] = [...newCategories[targetColumn], draggedTrip];
      
      return newCategories;
    });

    setDraggedTrip(null);
  };

  const getTravelStyleLabel = (style: string) => {
    const styles: Record<string, string> = {
      praia: 'Praia',
      neve: 'Neve',
      cruzeiros: 'Cruzeiros',
      natureza: 'Natureza e Ecoturismo',
      cultural: 'Culturais e Históricas',
      aventura: 'Aventura',
      parques: 'Parques Temáticos',
      urbanas: 'Viagens Urbanas / Cidades Grandes'
    };
    return styles[style] || style;
  };

  const getTravelStyleColor = (style: string) => {
    const colors: Record<string, string> = {
      praia: 'bg-blue-100 text-blue-800',
      neve: 'bg-cyan-100 text-cyan-800',
      cruzeiros: 'bg-indigo-100 text-indigo-800',
      natureza: 'bg-green-100 text-green-800',
      cultural: 'bg-purple-100 text-purple-800',
      aventura: 'bg-orange-100 text-orange-800',
      parques: 'bg-pink-100 text-pink-800',
      urbanas: 'bg-gray-100 text-gray-800'
    };
    return colors[style] || 'bg-gray-100 text-gray-800';
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `Em ${diffDays} dias`;
    } else if (diffDays === 0) {
      return 'Hoje';
    } else {
      return 'Em andamento';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Painel de Viagens</h2>
        <p className="text-gray-600">Organize suas viagens arrastando os cards entre as colunas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {BOARD_COLUMNS.map(column => (
          <div
            key={column.id}
            className={`min-h-[600px] rounded-lg border-2 border-dashed ${column.color} p-4`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className={`${column.headerColor} rounded-lg p-3 mb-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <p className="text-sm text-gray-600">{column.description}</p>
                </div>
                <Badge variant="secondary">
                  {tripCategories[column.id]?.length || 0}
                </Badge>
              </div>
            </div>

            {/* Trip Cards */}
            <div className="space-y-4">
              {tripCategories[column.id]?.map(trip => (
                <Card
                  key={trip.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, trip)}
                  className="cursor-move hover:shadow-lg transition-shadow bg-white border-2 hover:border-primary/20"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold line-clamp-2">
                          {trip.title}
                        </CardTitle>
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{trip.destination}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Trip Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(trip.start_date), "dd/MM", { locale: ptBR })}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {getDaysUntil(trip.start_date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <DollarSign className="h-3 w-3" />
                          <span>R$ {trip.budget.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="h-3 w-3" />
                          <span>{trip.current_participants}/{trip.max_participants}</span>
                        </div>
                      </div>
                    </div>

                    {/* Travel Style Badge */}
                    <Badge className={`text-xs ${getTravelStyleColor(trip.travel_style)}`}>
                      {getTravelStyleLabel(trip.travel_style)}
                    </Badge>

                    {/* Creator Info */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {trip.creator?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-600">{trip.creator?.full_name}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link href={`/trip/${trip.id}`}>
                          <Clock className="h-3 w-3 mr-1" />
                          Ver
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/chat/${trip.id}`}>
                          <MessageCircle className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add New Trip Button (only in planning column) */}
              {column.id === 'planning' && (
                <Card className="border-2 border-dashed border-gray-300 hover:border-primary transition-colors">
                  <CardContent className="flex items-center justify-center p-8">
                    <Button asChild variant="ghost" className="flex-col gap-2 h-auto">
                      <Link href="/create-trip">
                        <Plus className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600">Nova Viagem</span>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}