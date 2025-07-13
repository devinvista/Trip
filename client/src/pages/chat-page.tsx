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
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LoadingSpinner } from "@/components/loading-spinner";

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
      <div className="min-h-screen bg-gray-50">
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center p-8">
            <h1 className="text-2xl font-bold text-dark mb-4">Viagem não encontrada</h1>
            <p className="text-gray-600">A viagem que você procura não existe ou foi removida.</p>
          </Card>
        </div>
      </div>
    );
  }

  const isParticipant = trip.participants?.some((p: any) => p.userId === user?.id) || trip.creatorId === user?.id;

  if (!isParticipant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center p-8">
            <h1 className="text-2xl font-bold text-dark mb-4">Acesso negado</h1>
            <p className="text-gray-600">Você precisa ser participante desta viagem para acessar o chat.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-2xl text-dark">{trip.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{trip.destination}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(new Date(trip.startDate), "dd/MM", { locale: ptBR })} - {format(new Date(trip.endDate), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{trip.currentParticipants} participantes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Window */}
          <div className="lg:col-span-3">
            <ChatWindow 
              tripId={tripId!} 
              participants={trip.participants || []}
              className="h-[600px]"
            />
          </div>

          {/* Participants Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Creator */}
                <div className="flex items-center gap-3 p-2 bg-primary/5 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={trip.creator?.profilePhoto || ""} />
                    <AvatarFallback>
                      {trip.creator?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{trip.creator?.fullName}</h4>
                    <Badge variant="secondary" className="text-xs">Organizador</Badge>
                  </div>
                </div>

                {/* Other Participants */}
                {trip.participants?.filter((p: any) => p.userId !== trip.creatorId).map((participant: any) => (
                  <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={participant.user?.profilePhoto || ""} />
                      <AvatarFallback>
                        {participant.user?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{participant.user?.fullName}</h4>
                      <p className="text-xs text-gray-600">{participant.user?.location || "Sem localização"}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Trip Summary */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Resumo da Viagem</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Orçamento:</span>
                  <span className="font-medium">R$ {trip.budget.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duração:</span>
                  <span className="font-medium">
                    {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} dias
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estilo:</span>
                  <span className="font-medium capitalize">{trip.travelStyle}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
