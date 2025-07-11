import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Briefcase, 
  Users, 
  Calendar, 
  MapPin,
  Plus,
  MessageCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Plane,
  Star,
  CheckCircle,
  AlertCircle,
  Eye,
  Settings,
  Bell,
  Search,
  Filter
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTimeframe, setSelectedTimeframe] = useState('upcoming');

  const { data: myTrips, isLoading: tripsLoading, error: tripsError } = useQuery({
    queryKey: ["/api/my-trips"],
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const { data: requests, isLoading: requestsLoading, error: requestsError } = useQuery({
    queryKey: ["/api/user-requests"],
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const createdTrips = (myTrips as any)?.created || [];
  const participatingTrips = (myTrips as any)?.participating || [];
  const pendingRequests = (requests as any)?.filter((r: any) => r.status === 'pending') || [];
  const allTrips = [...createdTrips, ...participatingTrips];

  // Debug logging
  console.log('Dashboard Debug:', {
    user: user?.username,
    myTrips,
    createdTrips: createdTrips.length,
    participatingTrips: participatingTrips.length,
    tripsError,
    requestsError
  });

  // Show toast on errors
  useEffect(() => {
    if (tripsError) {
      toast({
        title: "Erro ao carregar viagens",
        description: "Não foi possível carregar suas viagens. Tente novamente.",
        variant: "destructive"
      });
    }
    if (requestsError) {
      toast({
        title: "Erro ao carregar solicitações",
        description: "Não foi possível carregar suas solicitações. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [tripsError, requestsError, toast]);

  // Calculate trip statistics
  const upcomingTrips = allTrips.filter(trip => new Date(trip.startDate) > new Date());
  const completedTrips = allTrips.filter(trip => new Date(trip.endDate) < new Date());
  const inProgressTrips = allTrips.filter(trip => {
    const now = new Date();
    return new Date(trip.startDate) <= now && new Date(trip.endDate) >= now;
  });

  const totalBudget = allTrips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
  const totalParticipants = allTrips.reduce((sum, trip) => sum + (trip.currentParticipants || 0), 0);

  // Get next trip
  const nextTrip = upcomingTrips.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  // Calculate days until next trip
  const daysUntilNextTrip = nextTrip ? Math.ceil((new Date(nextTrip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Filter trips by timeframe
  const getFilteredTrips = () => {
    switch (selectedTimeframe) {
      case 'upcoming':
        return upcomingTrips;
      case 'completed':
        return completedTrips;
      case 'in-progress':
        return inProgressTrips;
      default:
        return allTrips;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user?.profilePhoto || ""} />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-orange-400 to-amber-400 text-white">
                    {user?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-bold text-3xl text-gray-900">
                    Olá, {user?.fullName?.split(' ')[0]}! 👋
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {user?.location || "Localização não informada"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notificações
                </Button>
              </div>
            </div>
          </div>

          {/* Next Trip Highlight */}
          {nextTrip && (
            <Card className="mb-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <Plane className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Próxima Viagem</h3>
                      <p className="text-xl font-bold">{nextTrip.title}</p>
                      <p className="text-orange-100 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(nextTrip.startDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{daysUntilNextTrip}</p>
                    <p className="text-orange-100">dias restantes</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso de preparação</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2 bg-white bg-opacity-20" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total de Viagens</p>
                    <p className="text-3xl font-bold text-blue-700">{allTrips.length}</p>
                  </div>
                  <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">+{createdTrips.length} criadas</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Próximas Viagens</p>
                    <p className="text-3xl font-bold text-green-700">{upcomingTrips.length}</p>
                  </div>
                  <div className="bg-green-500 bg-opacity-20 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Bem planejadas</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Companheiros</p>
                    <p className="text-3xl font-bold text-purple-700">{totalParticipants}</p>
                  </div>
                  <div className="bg-purple-500 bg-opacity-20 p-3 rounded-full">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Ótimas conexões</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Orçamento Total</p>
                    <p className="text-3xl font-bold text-orange-700">R$ {totalBudget.toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-500 bg-opacity-20 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Dentro do planejado</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Filter */}
          <div className="mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-700">Filtrar por:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'all', label: 'Todas', count: allTrips.length },
                        { id: 'upcoming', label: 'Próximas', count: upcomingTrips.length },
                        { id: 'in-progress', label: 'Em Andamento', count: inProgressTrips.length },
                        { id: 'completed', label: 'Concluídas', count: completedTrips.length }
                      ].map(filter => (
                        <Button
                          key={filter.id}
                          variant={selectedTimeframe === filter.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTimeframe(filter.id)}
                          className="gap-1"
                        >
                          {filter.label}
                          <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                            {filter.count}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/create-trip">
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Viagem
                      </Button>
                    </Link>
                    <Link href="/search">
                      <Button variant="outline" size="sm">
                        <Search className="h-4 w-4 mr-2" />
                        Buscar Viagens
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error State */}
          {tripsError && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Erro ao carregar viagens</span>
                </div>
                <p className="text-red-600 mt-2">
                  Houve um problema ao carregar suas viagens. Tente atualizar a página.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Trips Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {tripsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                  </CardContent>
                </Card>
              ))
            ) : !tripsError && getFilteredTrips().length > 0 ? (
              getFilteredTrips().map((trip: any) => (
                <Card key={trip.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-400">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
                          {trip.title}
                        </h3>
                        <p className="text-gray-600 flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4" />
                          {trip.destination}
                        </p>
                      </div>
                      <Badge 
                        variant={trip.creatorId === user?.id ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {trip.creatorId === user?.id ? 'Criada' : 'Participando'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(trip.startDate).toLocaleDateString('pt-BR')} - {new Date(trip.endDate).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        {trip.currentParticipants}/{trip.maxParticipants} participantes
                      </div>
                      {trip.budget && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          R$ {trip.budget.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Link href={`/trip/${trip.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </Link>
                        <Link href={`/chat/${trip.id}`}>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        </Link>
                      </div>
                      <div className="flex items-center gap-1">
                        {new Date(trip.startDate) > new Date() ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Próxima
                          </Badge>
                        ) : new Date(trip.endDate) < new Date() ? (
                          <Badge variant="outline" className="text-gray-600 border-gray-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Concluída
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Em Andamento
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="p-12 text-center">
                  <div className="mb-4">
                    <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Nenhuma viagem encontrada
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {selectedTimeframe === 'upcoming' && 'Você não tem viagens próximas planejadas.'}
                      {selectedTimeframe === 'completed' && 'Você ainda não concluiu nenhuma viagem.'}
                      {selectedTimeframe === 'in-progress' && 'Você não tem viagens em andamento.'}
                      {selectedTimeframe === 'all' && 'Você ainda não tem viagens. Que tal criar uma?'}
                    </p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Link href="/create-trip">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Viagem
                      </Button>
                    </Link>
                    <Link href="/search">
                      <Button variant="outline">
                        <Search className="h-4 w-4 mr-2" />
                        Buscar Viagens
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <Card className="mt-8 border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <Bell className="h-5 w-5" />
                  Solicitações Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingRequests.map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{request.trip?.title}</p>
                        <p className="text-sm text-gray-600">Solicitação enviada</p>
                      </div>
                      <Badge variant="outline" className="text-amber-600 border-amber-600">
                        Pendente
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}