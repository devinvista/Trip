import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdvancedActivityManager } from "@/components/advanced-activity-manager";
import { PlannedActivity } from "@shared/schema";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  MessageCircle, 
  Share2,
  Clock,
  Check,
  X,
  User,
  Camera,
  Star,
  Heart,
  TrendingUp,
  Timer,
  Sparkles,
  Target,
  Trophy,
  Zap,
  Gift,
  AlertCircle
} from "lucide-react";
import { format, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect, useMemo } from "react";
import { expenseCategories, BudgetBreakdown } from "@shared/schema";
import { BudgetVisualization } from "@/components/budget-visualization";
import { ExpenseManager } from "@/components/expense-manager";
import { CoverImageSelector } from "@/components/cover-image-selector";

// Countdown Timer Component
function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const target = new Date(targetDate);
      const difference = target.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const isPast = new Date(targetDate) < new Date();

  if (isPast) {
    return (
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 md:p-6 text-white shadow-xl">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="h-6 w-6 md:h-8 md:w-8 text-amber-100" />
          <div className="text-center">
            <h2 className="text-lg md:text-2xl font-bold">Viagem Concluída!</h2>
            <p className="text-amber-100 text-sm md:text-base">Esperamos que tenha sido incrível!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 md:p-6 text-white shadow-xl">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Timer className="h-6 w-6 md:h-8 md:w-8 text-blue-100" />
          <h2 className="text-lg md:text-2xl font-bold">Contagem Regressiva</h2>
        </div>
        <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-xs md:max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-4 border border-white/30"
          >
            <div className="text-xl md:text-3xl font-bold text-white">{timeLeft.days}</div>
            <div className="text-xs md:text-sm text-blue-100">Dias</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-4 border border-white/30"
          >
            <div className="text-xl md:text-3xl font-bold text-white">{timeLeft.hours}</div>
            <div className="text-xs md:text-sm text-blue-100">Horas</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-4 border border-white/30"
          >
            <div className="text-xl md:text-3xl font-bold text-white">{timeLeft.minutes}</div>
            <div className="text-xs md:text-sm text-blue-100">Min</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-4 border border-white/30"
          >
            <div className="text-xl md:text-3xl font-bold text-white">{timeLeft.seconds}</div>
            <div className="text-xs md:text-sm text-blue-100">Seg</div>
          </motion.div>
        </div>
        <p className="mt-4 text-blue-100 text-xs md:text-sm">
          Faltam {timeLeft.days} dias para a sua aventura começar!
        </p>
      </div>
    </div>
  );
}

// Trip Statistics Component
function TripStatistics({ trip }: { trip: any }) {
  const stats = useMemo(() => {
    const totalBudget = trip.budget || 0;
    const perPerson = trip.maxParticipants > 0 ? totalBudget / trip.maxParticipants : 0;
    const daysUntil = differenceInDays(new Date(trip.startDate), new Date());
    const duration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate));

    return {
      totalBudget,
      perPerson,
      daysUntil: Math.max(0, daysUntil),
      duration: Math.max(1, duration),
      occupancy: (trip.currentParticipants / trip.maxParticipants) * 100
    };
  }, [trip]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-3 lg:p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
            <span className="text-xs lg:text-sm font-medium text-green-800">Orçamento Total</span>
          </div>
          <div className="text-lg lg:text-xl font-bold text-green-900">
            R$ {stats.totalBudget.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-green-600">
            R$ {stats.perPerson.toLocaleString('pt-BR')} por pessoa
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-3 lg:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-3 w-3 lg:h-4 lg:w-4 text-purple-600" />
            <span className="text-xs lg:text-sm font-medium text-purple-800">Participação</span>
          </div>
          <div className="text-lg lg:text-xl font-bold text-purple-900">
            {trip.currentParticipants}/{trip.maxParticipants}
          </div>
          <Progress value={stats.occupancy} className="h-2 mt-2" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="p-3 lg:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
            <span className="text-xs lg:text-sm font-medium text-blue-800">Duração</span>
          </div>
          <div className="text-lg lg:text-xl font-bold text-blue-900">
            {stats.duration} {stats.duration === 1 ? 'dia' : 'dias'}
          </div>
          <div className="text-xs text-blue-600">
            {stats.daysUntil > 0 ? `Em ${stats.daysUntil} dias` : 'Viagem iniciada'}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-3 lg:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-3 w-3 lg:h-4 lg:w-4 text-amber-600" />
            <span className="text-xs lg:text-sm font-medium text-amber-800">Status</span>
          </div>
          <div className="text-lg lg:text-xl font-bold text-amber-900">
            {trip.status === 'open' ? 'Aberta' : 'Fechada'}
          </div>
          <div className="text-xs text-amber-600">
            {trip.status === 'open' ? 'Aceita novos membros' : 'Viagem lotada'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TripDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [requestMessage, setRequestMessage] = useState("");
  const [plannedActivities, setPlannedActivities] = useState<PlannedActivity[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: trip, isLoading } = useQuery<any>({
    queryKey: ["/api/trips", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/trips/${id}`);
      if (!res.ok) throw new Error('Falha ao buscar viagem');
      return res.json();
    },
    enabled: !!id,
  });

  const { data: requests = [] } = useQuery<any[]>({
    queryKey: ["/api/trips", id, "requests"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/trips/${id}/requests`);
      if (!res.ok) throw new Error('Falha ao buscar solicitações');
      return res.json();
    },
    enabled: !!trip && !!user && trip.creatorId === user?.id,
  });

  // Calculate user permissions
  const isCreator = trip && user && trip.creatorId === user.id;
  const isParticipant = trip && user && trip.participants?.some((p: any) => p.userId === user.id && p.status === 'accepted');

  const { data: expenses = [] } = useQuery<any[]>({
    queryKey: ["/api/trips", id, "expenses"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/trips/${id}/expenses`);
      if (!res.ok) throw new Error('Falha ao buscar despesas');
      return res.json();
    },
    enabled: !!trip && !!user && (isCreator || isParticipant),
  });

  const requestJoinMutation = useMutation({
    mutationFn: async (data: { tripId: string; message: string }) => {
      const response = await apiRequest("POST", `/api/trips/${data.tripId}/request`, {
        message: data.message,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação foi enviada ao organizador da viagem.",
      });
      setRequestMessage("");
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRequestMutation = useMutation({
    mutationFn: async (data: { requestId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/trip-requests/${data.requestId}`, {
        status: data.status,
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.status === 'accepted' ? "Solicitação aceita!" : "Solicitação rejeitada",
        description: variables.status === 'accepted' 
          ? "O viajante foi adicionado à viagem." 
          : "A solicitação foi rejeitada.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trips", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/trips", id, "requests"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao processar solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCoverImageMutation = useMutation({
    mutationFn: async (coverImage: string) => {
      const response = await apiRequest("PATCH", `/api/trips/${id}/cover-image`, {
        coverImage
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar imagem');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Imagem atualizada!",
        description: "A imagem da viagem foi alterada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trips", id] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar imagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const quitTripMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/trips/${id}/participants/${user?.id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao sair da viagem');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Saída confirmada!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trips", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-trips"] });
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast({
        title: "Erro ao sair da viagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate activities cost
  const calculateActivitiesCost = (activities: PlannedActivity[]) => {
    return activities.reduce((total, activity) => {
      return total + (activity.estimatedCost || 0);
    }, 0);
  };

  const calculateTotalExpenses = () => {
    return expenses.reduce((total, expense) => {
      return total + expense.amount;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="h-64 bg-gray-200 rounded mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-200 rounded" />
                <div className="h-48 bg-gray-200 rounded" />
              </div>
              <div className="h-96 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center p-8 bg-white/80 backdrop-blur-sm">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Viagem não encontrada</h1>
            <p className="text-gray-600">A viagem que você procura não existe ou foi removida.</p>
          </Card>
        </div>
      </div>
    );
  }

  const canJoin = !isCreator && !isParticipant && trip.currentParticipants < trip.maxParticipants;

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Countdown Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <CountdownTimer targetDate={trip.startDate} />
        </motion.div>

        {/* Cover Image Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            {/* Cover Image */}
            <div className="relative h-96 bg-gradient-to-br from-blue-500 to-purple-600">
              {trip.coverImage && (
                <img 
                  src={trip.coverImage}
                  alt={`Imagem da viagem: ${trip.title}`}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/40 shadow-inner" style={{
                boxShadow: 'inset 0 0 60px rgba(0,0,0,0.3), inset 0 -100px 80px rgba(0,0,0,0.4)'
              }} />
              
              {/* Cover Image Edit Button (only for trip creator) */}
              {isCreator && (
                <div className="absolute top-4 right-4">
                  <CoverImageSelector
                    currentImage={trip.coverImage}
                    destination={trip.destination}
                    onImageSelect={(imageUrl) => updateCoverImageMutation.mutate(imageUrl)}
                    trigger={
                      <Button 
                        variant="secondary" 
                        size="sm"
                        disabled={updateCoverImageMutation.isPending}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {updateCoverImageMutation.isPending ? "Alterando..." : "Alterar Imagem"}
                      </Button>
                    }
                  />
                </div>
              )}
              
              {/* Trip Title and Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h1 className="font-bold text-4xl mb-3">{trip.title || "Viagem sem título"}</h1>
                <div className="flex items-center gap-6 text-blue-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span className="text-lg">{trip.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-lg">
                      {format(new Date(trip.startDate), "dd/MM", { locale: ptBR })} - {format(new Date(trip.endDate), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
              <div className="flex flex-wrap gap-2 lg:gap-3">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs lg:text-sm">
                  {trip.status === 'open' ? 'Aberta para participação' : 'Lotada'}
                </Badge>
                <Badge variant="outline" className="bg-white/50 text-xs lg:text-sm">
                  {travelStyleLabels[trip.travelStyle] || trip.travelStyle}
                </Badge>
                <Badge variant="outline" className="bg-white/50 text-xs lg:text-sm">
                  {trip.currentParticipants}/{trip.maxParticipants} participantes
                </Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({ title: "Link copiado!", description: "O link da viagem foi copiado para a área de transferência." });
                  }}
                  className="text-xs lg:text-sm"
                >
                  <Share2 className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                  Compartilhar
                </Button>
                {(isParticipant || isCreator) && (
                  <Button variant="secondary" asChild size="sm" className="text-xs lg:text-sm">
                    <a href={`/chat/${trip.id}`}>
                      <MessageCircle className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                      Chat
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <TripStatistics trip={trip} />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 order-2 lg:order-1"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="flex w-full bg-gradient-to-r from-slate-50 to-blue-50 backdrop-blur-sm rounded-xl p-1 shadow-md border border-slate-200">
                <TabsTrigger 
                  value="overview" 
                  className="flex-1 flex items-center justify-center gap-1 md:gap-2 px-1 md:px-2 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/60 text-slate-700 text-xs md:text-sm"
                >
                  <Sparkles className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">Visão Geral</span>
                  <span className="sm:hidden truncate">Visão</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="activities" 
                  className="flex-1 flex items-center justify-center gap-1 md:gap-2 px-1 md:px-2 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/60 text-slate-700 text-xs md:text-sm"
                >
                  <Camera className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="truncate">Atividades</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="expenses" 
                  className="flex-1 flex items-center justify-center gap-1 md:gap-2 px-1 md:px-2 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/60 text-slate-700 text-xs md:text-sm"
                >
                  <DollarSign className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="truncate">Despesas</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="participants" 
                  className="flex-1 flex items-center justify-center gap-1 md:gap-2 px-1 md:px-2 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/60 text-slate-700 text-xs md:text-sm"
                >
                  <Users className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">Participantes</span>
                  <span className="sm:hidden truncate">Pessoas</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 lg:space-y-6">
                {/* Description */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Sobre a Viagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                      {trip.description || "Descrição não disponível"}
                    </p>
                  </CardContent>
                </Card>

                {/* Budget Breakdown */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Orçamento Detalhado
                      {!(isCreator || isParticipant) && (
                        <Badge variant="outline" className="text-xs ml-2">
                          Somente Visualização
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {trip.budgetBreakdown ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(trip.budgetBreakdown).map(([category, amount]) => (
                              <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-xs md:text-sm font-medium text-gray-700 capitalize">
                                  {category === 'transport' ? 'Transporte' :
                                   category === 'accommodation' ? 'Hospedagem' :
                                   category === 'food' ? 'Alimentação' :
                                   category === 'activities' ? 'Atividades' :
                                   category === 'shopping' ? 'Compras' :
                                   category === 'insurance' ? 'Seguro' :
                                   category === 'visas' ? 'Vistos' :
                                   category === 'other' ? 'Outros' : category}
                                </span>
                                <span className="font-bold text-gray-900 text-xs md:text-sm">
                                  R$ {amount.toLocaleString('pt-BR')}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-semibold text-blue-900">Total</span>
                              <span className="text-xl font-bold text-blue-900">
                                R$ {trip.budget.toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-blue-700">
                              R$ {(trip.budget / trip.maxParticipants).toLocaleString('pt-BR')} custo estimado por pessoa
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-gray-900">
                              Orçamento Total: R$ {trip.budget.toLocaleString('pt-BR')}
                            </p>
                            <p className="text-sm text-gray-600">
                              R$ {(trip.budget / trip.maxParticipants).toLocaleString('pt-BR')} custo estimado por pessoa
                            </p>
                            <p className="text-xs text-gray-500 mt-4">
                              Detalhamento não disponível ainda
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {!(isCreator || isParticipant) && canJoin && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="text-center">
                            <p className="text-sm text-blue-700 mb-2">
                              Participe da viagem para ajudar no planejamento do orçamento!
                            </p>
                            <Button size="sm" onClick={() => setActiveTab("overview")}>
                              Solicitar Participação
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activities" className="space-y-4 lg:space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-blue-500" />
                      Atividades Planejadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(isCreator || isParticipant) ? (
                      <AdvancedActivityManager
                        activities={plannedActivities}
                        onActivitiesChange={setPlannedActivities}
                        className="border-0"
                      />
                    ) : (
                      <div className="space-y-4">
                        {plannedActivities.length > 0 ? (
                          <div className="space-y-3">
                            {plannedActivities.map((activity, index) => (
                              <div key={activity.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium text-gray-900">{activity.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {activity.category === 'sightseeing' ? 'Turismo' :
                                     activity.category === 'food' ? 'Comida' :
                                     activity.category === 'adventure' ? 'Aventura' :
                                     activity.category === 'culture' ? 'Cultura' :
                                     activity.category === 'relaxation' ? 'Relaxamento' :
                                     activity.category === 'nightlife' ? 'Vida Noturna' :
                                     activity.category === 'shopping' ? 'Compras' :
                                     activity.category}
                                  </Badge>
                                </div>
                                {activity.description && (
                                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                )}
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                  <span>
                                    Prioridade: {activity.priority === 'high' ? 'Alta' : 
                                                activity.priority === 'medium' ? 'Média' : 'Baixa'}
                                  </span>
                                  {activity.estimatedCost && (
                                    <span className="font-medium text-green-600">
                                      R$ {activity.estimatedCost.toLocaleString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">Nenhuma atividade planejada ainda</p>
                          </div>
                        )}
                        {canJoin && (
                          <div className="text-center mt-4">
                            <p className="text-sm text-gray-600 mb-2">
                              Participe da viagem para ajudar no planejamento!
                            </p>
                            <Button onClick={() => setActiveTab("overview")}>
                              Solicitar Participação
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="expenses" className="space-y-4 lg:space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Gestão de Despesas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(isCreator || isParticipant) ? (
                      <ExpenseManager 
                        tripId={parseInt(id!)}
                        participants={trip.participants || []}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">
                          Entre na viagem e descubra como é fácil dividir automaticamente as despesas com os participantes!
                        </p>
                        {canJoin && (
                          <Button onClick={() => setActiveTab("overview")}>
                            Solicitar Participação
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="participants" className="space-y-4 lg:space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-purple-500" />
                      Participantes ({trip.participants?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {trip.participants?.map((participant: any) => (
                        <div key={participant.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                              <AvatarImage src={participant.user.profilePhoto} />
                              <AvatarFallback className="text-xs sm:text-sm">
                                {participant.user.fullName?.[0] || participant.user.username[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm sm:text-base truncate">{participant.user.fullName || participant.user.username}</p>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{participant.user.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {participant.userId === trip.creatorId && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">Organizador</Badge>
                            )}
                            <Badge variant="outline" className="text-green-800 border-green-200 text-xs">
                              {participant.status === 'accepted' ? 'Aceito' : 
                               participant.status === 'pending' ? 'Pendente' : 
                               participant.status === 'rejected' ? 'Rejeitado' : 
                               participant.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Join Requests for Creator */}
                {isCreator && requests.length > 0 && (
                  <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-orange-500" />
                        Solicitações de Participação ({requests.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {requests.map((request: any) => (
                          <div key={request.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{request.user.fullName?.[0] || request.user.username[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{request.user.fullName || request.user.username}</p>
                                  <p className="text-sm text-gray-600">{request.message}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleRequestMutation.mutate({ requestId: request.id, status: 'accepted' })}
                                  disabled={handleRequestMutation.isPending}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Aceitar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleRequestMutation.mutate({ requestId: request.id, status: 'rejected' })}
                                  disabled={handleRequestMutation.isPending}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4 lg:space-y-6 order-1 lg:order-2"
          >

            {/* Action Buttons */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg lg:sticky lg:top-4">
              <CardContent className="p-3 lg:p-4 space-y-3">
                {canJoin && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                        <Heart className="h-4 w-4 mr-2" />
                        Solicitar Participação
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Solicitar Participação</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Conte um pouco sobre você e por que gostaria de participar desta viagem..."
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <Button 
                          onClick={() => requestJoinMutation.mutate({ tripId: id!, message: requestMessage })}
                          disabled={requestJoinMutation.isPending || !requestMessage.trim()}
                          className="w-full"
                        >
                          {requestJoinMutation.isPending ? "Enviando..." : "Enviar Solicitação"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {isParticipant && !isCreator && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <X className="h-4 w-4 mr-2" />
                        Desistir da Viagem
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar Saída</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p>Tem certeza que deseja sair desta viagem? Esta ação não pode ser desfeita.</p>
                        <div className="flex gap-2">
                          <Button 
                            variant="destructive" 
                            onClick={() => quitTripMutation.mutate()}
                            disabled={quitTripMutation.isPending}
                            className="flex-1"
                          >
                            {quitTripMutation.isPending ? "Saindo..." : "Confirmar Saída"}
                          </Button>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1">
                              Cancelar
                            </Button>
                          </DialogTrigger>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Budget Tracking */}
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-emerald-800">
                  <TrendingUp className="h-5 w-5" />
                  Acompanhamento de Orçamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Budget Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 lg:p-3 bg-white rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 lg:w-3 lg:h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs lg:text-sm font-medium text-gray-700">Orçamento Base</span>
                    </div>
                    <span className="font-bold text-blue-900 text-xs lg:text-sm">
                      R$ {(trip.budget || 0).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 lg:p-3 bg-white rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 lg:w-3 lg:h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-xs lg:text-sm font-medium text-gray-700">Atividades</span>
                    </div>
                    <span className="font-bold text-purple-900 text-xs lg:text-sm">
                      R$ {calculateActivitiesCost(plannedActivities).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 lg:p-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg border-2 border-emerald-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 lg:w-3 lg:h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs lg:text-sm font-bold text-emerald-800">Total Geral</span>
                    </div>
                    <span className="text-sm lg:text-lg font-bold text-emerald-900">
                      R$ {((trip.budget || 0) + calculateActivitiesCost(plannedActivities)).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                <Separator className="bg-emerald-200" />

                {/* Cost per Person */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 lg:p-4 rounded-lg border border-amber-200">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 lg:h-4 lg:w-4 text-amber-600" />
                      <span className="text-xs lg:text-sm font-medium text-amber-800">Custo Estimado por Pessoa</span>
                    </div>
                    <div className="text-center">
                      <span className="text-lg lg:text-xl font-bold text-amber-900">
                        R$ {(((trip.budget || 0) + calculateActivitiesCost(plannedActivities)) / trip.maxParticipants).toLocaleString('pt-BR')}
                      </span>
                      <div className="text-xs text-amber-600 mt-1">
                        Dividido entre {trip.maxParticipants} participantes
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs lg:text-sm">
                    <span className="text-gray-600">Progresso do Orçamento</span>
                    <span className="font-medium text-gray-900">
                      {Math.round((calculateTotalExpenses() / (trip.budget || 1)) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (calculateTotalExpenses() / (trip.budget || 1)) * 100)} 
                    className="h-2"
                  />
                  <div className="text-xs text-gray-500">
                    Despesas realizadas em relação ao orçamento planejado
                  </div>
                </div>


              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}