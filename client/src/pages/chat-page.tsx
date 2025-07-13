import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/navbar";
import { ChatWindow } from "@/components/chat-window";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Users, 
  MapPin, 
  Calendar,
  Settings,
  MoreVertical,
  MessageCircle,
  Phone,
  Video,
  Clock
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LoadingSpinner } from "@/components/loading-spinner";
import { motion } from "framer-motion";

export default function ChatPage() {
  const { tripId } = useParams();
  const { user } = useAuth();

  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ["/api/trips", tripId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/trips/${tripId}`);
      if (!res.ok) throw new Error('Failed to fetch trip');
      return res.json();
    },
    enabled: !!tripId,
  });

  if (tripLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[500px]">
            <LoadingSpinner variant="travel" size="lg" message="Carregando chat da viagem..." />
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <Card className="text-center p-8 shadow-lg bg-white/80 backdrop-blur-sm border-0">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Info className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Viagem não encontrada</h1>
              <p className="text-gray-600 text-sm">A viagem que você procura não existe ou foi removida.</p>
              <Button 
                onClick={() => window.location.href = '/dashboard'} 
                className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                Voltar ao Dashboard
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const isParticipant = trip.participants?.some((p: any) => p.userId === user?.id) || trip.creatorId === user?.id;

  if (!isParticipant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <Card className="text-center p-8 shadow-lg bg-white/80 backdrop-blur-sm border-0">
              <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Acesso restrito</h1>
              <p className="text-gray-600 text-sm">Você precisa ser participante desta viagem para acessar o chat.</p>
              <Button 
                onClick={() => window.location.href = '/dashboard'} 
                className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                Voltar ao Dashboard
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const daysUntilTrip = differenceInDays(new Date(trip.startDate), new Date());
  const tripDuration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate));

  const travelStyleLabels: { [key: string]: string } = {
    praia: "Praia",
    neve: "Neve", 
    cruzeiros: "Cruzeiros",
    natureza: "Natureza e Ecoturismo",
    cultural: "Culturais e Históricas",
    aventura: "Aventura",
    parques: "Parques Temáticos",
    urbanas: "Viagens Urbanas / Cidades Grandes"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Navbar />
      
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 md:py-6 max-w-7xl">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-start gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.history.back()}
                  className="shrink-0 hover:bg-blue-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Voltar</span>
                </Button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shrink-0">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="font-bold text-xl md:text-2xl text-gray-900 truncate">{trip.title}</h1>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Chat ativo</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm">
                    <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full">
                      <MapPin className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-blue-700 font-medium truncate">{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full">
                      <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">
                        {format(new Date(trip.startDate), "dd/MM", { locale: ptBR })} - {format(new Date(trip.endDate), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1 rounded-full">
                      <Users className="h-3.5 w-3.5 text-purple-600" />
                      <span className="text-purple-700 font-medium">{trip.currentParticipants} participantes</span>
                    </div>
                    {daysUntilTrip > 0 && (
                      <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full">
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-amber-700 font-medium">{daysUntilTrip} dias restantes</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    <Phone className="h-4 w-4 mr-2" />
                    Ligar
                  </Button>
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    <Video className="h-4 w-4 mr-2" />
                    Vídeo
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          {/* Enhanced Chat Window - Full width */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ChatWindow 
              tripId={tripId!} 
              participants={trip.participants || []}
              className="h-[calc(100vh-200px)] sm:h-[calc(100vh-240px)] md:h-[calc(100vh-280px)] lg:h-[calc(100vh-320px)] min-h-[400px] sm:min-h-[500px]"
            />
          </motion.div>

          {/* Enhanced Sidebar - Below chat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {/* Participants List */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Participantes
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {trip.currentParticipants}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Creator */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <Avatar className="w-10 h-10 ring-2 ring-blue-200">
                    <AvatarImage src={trip.creator?.profilePhoto || ""} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                      {trip.creator?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">{trip.creator?.fullName}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">
                        Organizador
                      </Badge>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Other Participants */}
                {trip.participants?.filter((p: any) => p.userId !== trip.creatorId).map((participant: any) => (
                  <div key={participant.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={participant.user?.profilePhoto || ""} />
                      <AvatarFallback className="bg-gray-100 text-gray-700 font-semibold">
                        {participant.user?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">{participant.user?.fullName}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-600 truncate">{participant.user?.location || "Sem localização"}</p>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
