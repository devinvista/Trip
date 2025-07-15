import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { OnboardingTour, useOnboardingTour } from "@/components/onboarding-tour";
import { WelcomeBanner } from "@/components/welcome-banner";
import { LoadingSpinner } from "@/components/loading-spinner";
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
  Filter,
  X
} from "lucide-react";
import { getRealParticipantsCount } from "@/lib/trip-utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTimeframe, setSelectedTimeframe] = useState('upcoming');
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  
  // Onboarding tour hook
  const { isOpen, isCompleted, startTour, closeTour, completeTour } = useOnboardingTour();

  // Check if user should see welcome banner (first time or hasn't completed tour)
  useEffect(() => {
    if (user && !isCompleted) {
      // Check if user was created recently (within last 24 hours)
      const welcomeBannerDismissed = localStorage.getItem('welcome-banner-dismissed');
      if (!welcomeBannerDismissed) {
        setShowWelcomeBanner(true);
      }
    }
  }, [user, isCompleted]);

  const { data: myTrips, isLoading: tripsLoading, error: tripsError, refetch: refetchTrips } = useQuery({
    queryKey: ["/api/my-trips"],
    queryFn: async () => {
      const response = await fetch("/api/my-trips", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!user,
    staleTime: 0, // Always fresh
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
    refetchInterval: 5000, // Auto refresh every 5 seconds
  });

  const { data: requests, isLoading: requestsLoading, error: requestsError, refetch: refetchRequests } = useQuery({
    queryKey: ["/api/user-requests"],
    queryFn: async () => {
      const response = await fetch("/api/user-requests", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!user,
    staleTime: 0, // Always fresh
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
    refetchInterval: false,
  });

  // Mutation para desistir da viagem
  const quitTripMutation = useMutation({
    mutationFn: async (tripId: number) => {
      const response = await fetch(`/api/trips/${tripId}/participants/${user?.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao sair da viagem');
      }
      return response.json();
    },
    onSuccess: (data, tripId) => {
      toast({
        title: "Saída confirmada!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-trips"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao sair da viagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createdTrips = (myTrips as any)?.created || [];
  const participatingTrips = (myTrips as any)?.participating || [];
  const pendingRequests = (requests as any)?.filter((r: any) => r.status === 'pending') || [];
  const allTrips = [...createdTrips, ...participatingTrips];

  // Debug logging
  console.log('Dashboard Debug:', {
    user: user?.username,
    myTrips,
    myTripsType: typeof myTrips,
    myTripsKeys: myTrips ? Object.keys(myTrips) : null,
    createdTrips: createdTrips.length,
    participatingTrips: participatingTrips.length,
    tripsError: tripsError?.message,
    requestsError: requestsError?.message,
    tripsLoading,
    requestsLoading
  });

  // Show toast on errors
  useEffect(() => {
    if (tripsError) {
      console.error('Trips error:', tripsError);
      toast({
        title: "Erro ao carregar viagens",
        description: "Não foi possível carregar suas viagens. Tente novamente.",
        variant: "destructive"
      });
    }
    if (requestsError) {
      console.error('Requests error:', requestsError);
      toast({
        title: "Erro ao carregar solicitações",
        description: "Não foi possível carregar suas solicitações. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [tripsError, requestsError, toast]);

  // Manual refetch only on user change
  useEffect(() => {
    if (user) {
      console.log('Usuário autenticado, forçando refetch...');
      refetchTrips();
      refetchRequests();
    }
  }, [user?.id, refetchTrips, refetchRequests]);

  // Calculate trip statistics
  const upcomingTrips = allTrips.filter(trip => new Date(trip.startDate) > new Date());
  const completedTrips = allTrips.filter(trip => new Date(trip.endDate) < new Date());
  const inProgressTrips = allTrips.filter(trip => {
    const now = new Date();
    return new Date(trip.startDate) <= now && new Date(trip.endDate) >= now;
  });

  const totalBudget = allTrips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
  const totalParticipants = allTrips.reduce((sum, trip) => sum + getRealParticipantsCount(trip), 0);

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
          {/* Welcome Banner */}
          <WelcomeBanner
            userName={user?.fullName?.split(' ')[0]}
            onStartTour={startTour}
            onDismiss={() => {
              setShowWelcomeBanner(false);
              localStorage.setItem('welcome-banner-dismissed', 'true');
            }}
            isVisible={showWelcomeBanner}
          />

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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 w-full lg:w-auto">
                <Link href="/create-trip">
                  <Button className="w-full h-10 sm:h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    <span className="font-medium text-sm sm:text-base hidden sm:inline">Criar Viagem</span>
                    <span className="font-medium text-sm sm:hidden">Nova</span>
                  </Button>
                </Link>
                
                <Link href="/search">
                  <Button className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    <span className="font-medium text-sm sm:text-base">Buscar</span>
                  </Button>
                </Link>
                
                <Link href="/profile">
                  <Button className="w-full h-10 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    <span className="font-medium text-sm sm:text-base">Perfil</span>
                  </Button>
                </Link>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="w-full h-10 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative">
                      <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                      <span className="font-medium text-sm sm:text-base hidden sm:inline">Notificações</span>
                      <span className="font-medium text-sm sm:hidden">Avisos</span>
                      {(upcomingTrips.length > 0 || pendingRequests.length > 0) && (
                        <Badge className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 p-0 text-xs bg-red-500 hover:bg-red-600 text-white border-0 rounded-full flex items-center justify-center">
                          {upcomingTrips.length + pendingRequests.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="bg-white rounded-lg shadow-lg border">
                      <div className="px-4 py-3 border-b bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Notificações
                        </h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {upcomingTrips.length === 0 && pendingRequests.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p>Nenhuma notificação</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {upcomingTrips.slice(0, 3).map((trip: any) => (
                              <div key={trip.id} className="p-3 hover:bg-gray-50 border-b last:border-b-0">
                                <div className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-900">{trip.title}</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                      Viagem em {Math.ceil((new Date(trip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(trip.startDate).toLocaleDateString('pt-BR')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {pendingRequests.map((request: any) => (
                              <div key={request.id} className="p-3 hover:bg-gray-50 border-b last:border-b-0">
                                <div className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-900">Solicitação pendente</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {request.trip?.title}
                                    </p>
                                    <p className="text-xs text-gray-500">Aguardando aprovação</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {(upcomingTrips.length > 3 || pendingRequests.length > 0) && (
                        <div className="px-4 py-3 border-t bg-gray-50">
                          <Button size="sm" variant="outline" className="w-full text-xs">
                            Ver todas as notificações
                          </Button>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
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

          {/* Stats Dashboard - Modern Clean Design */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
            {/* Total de Viagens */}
            <Card className="group bg-white border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-300/60">
              <CardContent className="p-3 sm:p-4 lg:p-5">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2.5 rounded-xl group-hover:bg-blue-100 transition-colors duration-200">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">{allTrips.length}</p>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">Total de Viagens</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Próximas Viagens */}
            <Card className="group bg-white border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/60">
              <CardContent className="p-3 sm:p-4 lg:p-5">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 p-2.5 rounded-xl group-hover:bg-emerald-100 transition-colors duration-200">
                    <Clock className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">{upcomingTrips.length}</p>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">Próximas Viagens</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Companheiros */}
            <Card className="group bg-white border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/60">
              <CardContent className="p-3 sm:p-4 lg:p-5">
                <div className="flex items-center gap-3">
                  <div className="bg-violet-50 p-2.5 rounded-xl group-hover:bg-violet-100 transition-colors duration-200">
                    <Users className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalParticipants}</p>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">Companheiros</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orçamento Total */}
            <Card className="group bg-white border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-orange-300/60">
              <CardContent className="p-3 sm:p-4 lg:p-5">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-50 p-2.5 rounded-xl group-hover:bg-orange-100 transition-colors duration-200">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-slate-900">R$ {totalBudget.toLocaleString()}</p>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">Orçamento Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          

          {/* Clean Filter Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-slate-700">Filtrar por status</h3>
              <span className="text-sm text-slate-500">
                {getFilteredTrips().length} viagens
              </span>
            </div>
            
            {/* Simple Filter Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
              {[
                { id: 'all', label: 'Todas', count: allTrips.length, color: 'blue' },
                { id: 'upcoming', label: 'Próximas', count: upcomingTrips.length, color: 'emerald' },
                { id: 'in-progress', label: 'Em Andamento', count: inProgressTrips.length, color: 'orange' },
                { id: 'completed', label: 'Concluídas', count: completedTrips.length, color: 'slate' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedTimeframe(filter.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap min-w-0 ${
                    selectedTimeframe === filter.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span className="truncate">{filter.label}</span>
                  <span className={`px-1 sm:px-1.5 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${
                    selectedTimeframe === filter.id
                      ? filter.color === 'blue' 
                        ? 'bg-blue-100 text-blue-700'
                        : filter.color === 'emerald'
                        ? 'bg-emerald-100 text-emerald-700'
                        : filter.color === 'orange'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-slate-100 text-slate-700'
                      : filter.color === 'blue'
                      ? 'bg-blue-200 text-blue-800'
                      : filter.color === 'emerald'
                      ? 'bg-emerald-200 text-emerald-800'
                      : filter.color === 'orange'
                      ? 'bg-orange-200 text-orange-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
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
              <div className="col-span-full flex items-center justify-center min-h-[300px]">
                <LoadingSpinner variant="travel" size="lg" message="Carregando suas viagens..." />
              </div>
            ) : !tripsError && getFilteredTrips().length > 0 ? (
              getFilteredTrips().map((trip: any) => (
                <Card key={trip.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-slate-200/60 bg-white shadow-sm">
                  {/* Cover Image */}
                  <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    {trip.coverImage && (
                      <img 
                        src={trip.coverImage} 
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {new Date(trip.startDate) > new Date() ? (
                        <Badge className="bg-emerald-500/90 backdrop-blur-sm hover:bg-emerald-600 text-white border-0 shadow-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          Próxima
                        </Badge>
                      ) : new Date(trip.endDate) < new Date() ? (
                        <Badge className="bg-slate-500/90 backdrop-blur-sm hover:bg-slate-600 text-white border-0 shadow-sm">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Concluída
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/90 backdrop-blur-sm hover:bg-blue-600 text-white border-0 shadow-sm">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Em Andamento
                        </Badge>
                      )}
                    </div>

                    {/* Role Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge 
                        className={trip.creatorId === user?.id 
                          ? "bg-orange-500/90 backdrop-blur-sm hover:bg-orange-600 text-white border-0 shadow-sm" 
                          : "bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white border-0 shadow-sm"}
                      >
                        {trip.creatorId === user?.id ? 'Criada por você' : 'Participando'}
                      </Badge>
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-bold text-lg text-white mb-1 group-hover:text-orange-200 transition-colors drop-shadow-sm">
                        {trip.title}
                      </h3>
                      <p className="text-white/90 flex items-center gap-2 text-sm drop-shadow-sm">
                        <MapPin className="h-3.5 w-3.5" />
                        {trip.destination}
                      </p>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    {/* Trip Info */}
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          {new Date(trip.startDate).toLocaleDateString('pt-BR')} - {new Date(trip.endDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>{getRealParticipantsCount(trip)}/{trip.maxParticipants} participantes</span>
                        </div>
                        
                        {/* Participants Progress */}
                        <div className="flex-1 mx-3">
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${(getRealParticipantsCount(trip) / trip.maxParticipants) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {trip.budget && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <DollarSign className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-slate-900">
                            R$ {trip.budget.toLocaleString()}
                          </span>
                          <span className="text-slate-500">
                            / R$ {Math.round(trip.budget / trip.maxParticipants).toLocaleString()} por pessoa
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - Responsive & Clean */}
                    <div className="flex flex-col gap-2">
                      {/* Primary Action - Full width on mobile */}
                      <Link href={`/trip/${trip.id}`} className="w-full">
                        <Button 
                          size="sm" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 transition-colors duration-200"
                        >
                          <Eye className="h-3 w-3 mr-1.5" />
                          <span className="text-xs">Ver Detalhes</span>
                        </Button>
                      </Link>
                      
                      {/* Secondary Actions - Two rows on mobile for better spacing */}
                      <div className="grid grid-cols-2 gap-1.5">
                        {/* Chat always visible */}
                        <Link href={`/chat/${trip.id}`} className="w-full">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            <span className="text-xs">Chat</span>
                          </Button>
                        </Link>
                        
                        {/* Conditional buttons based on user role */}
                        {trip.creatorId === user?.id ? (
                          <Link href={`/edit-trip/${trip.id}`} className="w-full">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200"
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              <span className="text-xs">Editar</span>
                            </Button>
                          </Link>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 hover:border-red-400 transition-colors duration-200"
                            onClick={() => {
                              if (window.confirm(`Tem certeza que deseja sair da viagem "${trip.title}"? Esta ação não pode ser desfeita.`)) {
                                quitTripMutation.mutate(trip.id);
                              }
                            }}
                            disabled={quitTripMutation.isPending}
                          >
                            {quitTripMutation.isPending ? (
                              <>
                                <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1" />
                                <span className="text-xs">...</span>
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3 mr-1" />
                                <span className="text-xs">Sair</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      
                      {/* Cancel button for creators - separate row */}
                      {trip.creatorId === user?.id && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 hover:border-red-400 transition-colors duration-200"
                          onClick={() => {
                            const hasOtherParticipants = getRealParticipantsCount(trip) > 1;
                            let confirmMessage = '';
                            if (hasOtherParticipants) {
                              confirmMessage = `Como criador da viagem "${trip.title}", ao cancelar você transferirá a organização para o participante mais antigo. Confirma?`;
                            } else {
                              confirmMessage = `Como criador da viagem "${trip.title}" sem outros participantes, ao cancelar a viagem será excluída permanentemente. Confirma?`;
                            }
                            
                            if (window.confirm(confirmMessage)) {
                              quitTripMutation.mutate(trip.id);
                            }
                          }}
                          disabled={quitTripMutation.isPending}
                        >
                          {quitTripMutation.isPending ? (
                            <>
                              <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1" />
                              <span className="text-xs">Cancelando...</span>
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              <span className="text-xs">Cancelar Viagem</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full border-2 border-dashed border-gray-200 bg-gray-50/50">
                <CardContent className="p-12 text-center">
                  <div className="mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plane className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">
                      Nenhuma viagem encontrada
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      {selectedTimeframe === 'upcoming' && 'Você não tem viagens próximas planejadas. Que tal criar uma nova aventura?'}
                      {selectedTimeframe === 'completed' && 'Você ainda não concluiu nenhuma viagem. Suas próximas aventuras aparecerão aqui.'}
                      {selectedTimeframe === 'in-progress' && 'Você não tem viagens em andamento. Suas viagens ativas aparecerão aqui.'}
                      {selectedTimeframe === 'all' && 'Você ainda não tem viagens. Comece sua jornada criando uma nova viagem ou encontre companheiros para aventuras incríveis!'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                    <Link href="/create-trip" className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 px-6 sm:px-8 py-3 h-auto">
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        <span className="hidden sm:inline">Criar Nova Viagem</span>
                        <span className="sm:hidden">Nova Viagem</span>
                      </Button>
                    </Link>
                    <Link href="/search" className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full sm:w-auto border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 px-6 sm:px-8 py-3 h-auto">
                        <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        <span className="hidden sm:inline">Buscar Companheiros</span>
                        <span className="sm:hidden">Buscar</span>
                      </Button>
                    </Link>
                    <Link href="/profile" className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full sm:w-auto border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-6 sm:px-8 py-3 h-auto">
                        <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        <span className="hidden sm:inline">Editar Perfil</span>
                        <span className="sm:hidden">Perfil</span>
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

        {/* Onboarding Tour */}
        <OnboardingTour
          isOpen={isOpen}
          onClose={closeTour}
          onComplete={completeTour}
          userPreferences={{
            travelStyle: user?.travelStyle,
            interests: user?.interests,
            experience: 'iniciante' // Could be determined from user profile
          }}
        />
      </div>
    </ProtectedRoute>
  );
}