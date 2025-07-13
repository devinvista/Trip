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
import { expenseCategories, budgetCategories, BudgetBreakdown } from "@shared/schema";
import { LoadingSpinner } from "@/components/loading-spinner";
import { BudgetVisualization } from "@/components/budget-visualization";
import { ExpenseManager } from "@/components/expense-manager";
import { CoverImageSelector } from "@/components/cover-image-selector";
import { BudgetEditor } from "@/components/budget-editor";

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

  // Função para determinar o gradiente baseado nos dias restantes
  const getGradientClasses = (days: number) => {
    if (days <= 1) {
      // Vermelho intenso - urgente (até 1 dia)
      return {
        gradient: "from-red-600 via-red-500 to-orange-500",
        textAccent: "text-red-100",
        iconAccent: "text-red-100"
      };
    } else if (days <= 7) {
      // Laranja - próximo (até 1 semana)
      return {
        gradient: "from-orange-500 via-amber-500 to-yellow-500",
        textAccent: "text-orange-100",
        iconAccent: "text-orange-100"
      };
    } else if (days <= 30) {
      // Azul/roxo - médio prazo (até 1 mês)
      return {
        gradient: "from-blue-600 via-purple-600 to-indigo-600",
        textAccent: "text-blue-100",
        iconAccent: "text-blue-100"
      };
    } else if (days <= 90) {
      // Verde/azul - planejamento (até 3 meses)
      return {
        gradient: "from-emerald-600 via-teal-600 to-cyan-600",
        textAccent: "text-emerald-100",
        iconAccent: "text-emerald-100"
      };
    } else {
      // Roxo/rosa - longo prazo (mais de 3 meses)
      return {
        gradient: "from-purple-600 via-pink-600 to-rose-600",
        textAccent: "text-purple-100",
        iconAccent: "text-purple-100"
      };
    }
  };

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

  const gradientConfig = getGradientClasses(timeLeft.days);

  return (
    <div className={`bg-gradient-to-r ${gradientConfig.gradient} rounded-2xl p-4 md:p-6 text-white shadow-xl transition-all duration-1000`}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Timer className={`h-6 w-6 md:h-8 md:w-8 ${gradientConfig.iconAccent}`} />
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
            <div className={`text-xs md:text-sm ${gradientConfig.textAccent}`}>Dias</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-4 border border-white/30"
          >
            <div className="text-xl md:text-3xl font-bold text-white">{timeLeft.hours}</div>
            <div className={`text-xs md:text-sm ${gradientConfig.textAccent}`}>Horas</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-4 border border-white/30"
          >
            <div className="text-xl md:text-3xl font-bold text-white">{timeLeft.minutes}</div>
            <div className={`text-xs md:text-sm ${gradientConfig.textAccent}`}>Min</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-4 border border-white/30"
          >
            <div className="text-xl md:text-3xl font-bold text-white">{timeLeft.seconds}</div>
            <div className={`text-xs md:text-sm ${gradientConfig.textAccent}`}>Seg</div>
          </motion.div>
        </div>
        <p className={`mt-4 ${gradientConfig.textAccent} text-xs md:text-sm`}>
          Faltam {timeLeft.days} dias para a sua aventura começar!
        </p>
      </div>
    </div>
  );
}

// Trip Statistics Component
function TripStatistics({ trip, plannedActivities = [] }: { trip: any; plannedActivities?: PlannedActivity[] }) {
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
    <div className="grid grid-cols-4 gap-3">
      {/* Orçamento Card */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-500 rounded-lg">
              <DollarSign className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="text-xs font-medium text-gray-600">Orçamento</div>
          </div>
          <div className="text-lg font-bold text-gray-900">
            R$ {stats.totalBudget.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-emerald-600">
            R$ {stats.perPerson.toLocaleString('pt-BR')} /pessoa
          </div>
        </CardContent>
      </Card>

      {/* Participação Card */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-purple-500 rounded-lg">
              <Users className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="text-xs font-medium text-gray-600">Participantes</div>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {trip.currentParticipants}/{trip.maxParticipants}
          </div>
          <div className="text-xs text-purple-600">
            {Math.round(stats.occupancy)}% ocupação
          </div>
        </CardContent>
      </Card>

      {/* Duração Card */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-500 rounded-lg">
              <Calendar className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="text-xs font-medium text-gray-600">Duração</div>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {stats.duration} {stats.duration === 1 ? 'dia' : 'dias'}
          </div>
          {plannedActivities.length > 0 && (
            <div className="text-xs text-blue-600">
              {plannedActivities.length} atividades
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${
              trip.status === 'open' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {trip.status === 'open' ? (
                <Star className="h-3.5 w-3.5 text-white" />
              ) : (
                <X className="h-3.5 w-3.5 text-white" />
              )}
            </div>
            <div className="text-xs font-medium text-gray-600">Status</div>
          </div>
          <div className={`text-lg font-bold ${
            trip.status === 'open' ? 'text-green-700' : 'text-red-700'
          }`}>
            {trip.status === 'open' ? 'Aberta' : 'Fechada'}
          </div>
          <div className={`text-xs ${
            trip.status === 'open' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trip.status === 'open' ? 'Aceita membros' : 'Viagem lotada'}
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
          <div className="flex items-center justify-center min-h-[500px]">
            <LoadingSpinner variant="travel" size="lg" message="Carregando detalhes da viagem..." />
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8"
        >
          {/* Cover Image */}
          <div className="relative h-48 lg:h-56">
            {trip.coverImage && (
              <img 
                src={trip.coverImage}
                alt={`Imagem da viagem: ${trip.title}`}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/30" />
            
            {/* Cover Image Edit Button */}
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
                      {updateCoverImageMutation.isPending ? "Alterando..." : "Alterar"}
                    </Button>
                  }
                />
              </div>
            )}
            
            {/* Countdown Timer */}
            <div className="absolute top-4 left-4">
              <CountdownTimer targetDate={trip.startDate} />
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                    {trip.title || "Viagem sem título"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(trip.startDate), "dd/MM", { locale: ptBR })} - {format(new Date(trip.endDate), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{trip.currentParticipants}/{trip.maxParticipants} participantes</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={trip.status === 'open' ? 'default' : 'secondary'}>
                      {trip.status === 'open' ? 'Aberta para participação' : 'Lotada'}
                    </Badge>
                    <Badge variant="outline">
                      {travelStyleLabels[trip.travelStyle] || trip.travelStyle}
                    </Badge>
                  </div>
                </div>
                
                <TripStatistics trip={trip} plannedActivities={plannedActivities} />
              </div>
              
              <div className="flex gap-3 lg:flex-col lg:w-40">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({ title: "Link copiado!", description: "O link da viagem foi copiado para a área de transferência." });
                  }}
                  className="flex-1 lg:flex-none"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                {(isParticipant || isCreator) && (
                  <Button asChild size="sm" className="flex-1 lg:flex-none">
                    <a href={`/chat/${trip.id}`}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </a>
                  </Button>
                )}
              </div>
            </div>
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
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-lg p-1">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 text-sm"
                >
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">Visão Geral</span>
                  <span className="sm:hidden">Visão</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="activities" 
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 text-sm"
                >
                  <Target className="h-4 w-4" />
                  <span>Atividades</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="expenses" 
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 text-sm"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Despesas</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="participants" 
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 text-sm"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Participantes</span>
                  <span className="sm:hidden">Pessoas</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Description */}
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Sobre a Viagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {trip.description || "Descrição não disponível"}
                    </p>
                  </CardContent>
                </Card>

                {/* Budget Breakdown */}
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900">Orçamento Detalhado</span>
                        {!(isCreator || isParticipant) && (
                          <Badge variant="outline" className="text-xs">
                            Somente Visualização
                          </Badge>
                        )}
                      </div>
                      {isCreator && (
                        <BudgetEditor
                          tripId={parseInt(id!)}
                          currentBudget={trip.budget}
                          currentBudgetBreakdown={trip.budgetBreakdown}
                          maxParticipants={trip.maxParticipants}
                        />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {trip.budgetBreakdown ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(trip.budgetBreakdown).map(([category, amount]) => (
                              <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-sm font-medium text-gray-700">
                                  {budgetCategories[category as keyof typeof budgetCategories] || category}
                                </span>
                                <span className="font-semibold text-gray-900 tabular-nums">
                                  R$ {amount.toLocaleString('pt-BR')}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-base font-semibold text-gray-900">Total</span>
                              <span className="text-xl font-bold text-gray-900 tabular-nums">
                                R$ {trip.budget.toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              R$ {(trip.budget / trip.maxParticipants).toLocaleString('pt-BR')} por pessoa
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
                              R$ {(trip.budget / trip.maxParticipants).toLocaleString('pt-BR')} por pessoa
                            </p>
                            <p className="text-xs text-gray-500 mt-4">
                              Detalhamento não disponível
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {!(isCreator || isParticipant) && canJoin && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
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

              <TabsContent value="activities" className="space-y-6">
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">
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

              <TabsContent value="expenses" className="space-y-6">
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">
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

              <TabsContent value="participants" className="space-y-6">
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">
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
            <Card className="bg-white shadow-sm border border-gray-200 lg:sticky lg:top-4">
              <CardContent className="p-4 space-y-3">
                {canJoin && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
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
                      <Button variant="destructive" className="w-full">
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
                            onClick={() => quitTripMutation.mutate()}
                            disabled={quitTripMutation.isPending}
                            variant="destructive"
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

            {/* Budget Overview */}
            <Card className="bg-white border-0 shadow-sm ring-1 ring-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-lg font-semibold text-gray-900 tracking-tight">
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Budget Items */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Orçamento Base</span>
                      </div>
                      <span className="text-base font-semibold text-gray-900 tabular-nums">
                        R$ {(trip.budget || 0).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Atividades</span>
                      </div>
                      <span className="text-base font-semibold text-gray-900 tabular-nums">
                        R$ {calculateActivitiesCost(plannedActivities).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between py-4 bg-gray-50 -mx-6 px-6 mt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                        <span className="text-base font-semibold text-gray-900">Total</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900 tabular-nums">
                        R$ {((trip.budget || 0) + calculateActivitiesCost(plannedActivities)).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Cost per Person */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Custo Individual</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900 tabular-nums">
                        R$ {(((trip.budget || 0) + calculateActivitiesCost(plannedActivities)) / trip.maxParticipants).toLocaleString('pt-BR')}
                      </div>
                      <div className="text-xs text-blue-700">
                        Para {trip.maxParticipants} participantes
                      </div>
                    </div>
                  </div>

                  {/* Budget Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Progresso das Despesas</span>
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">
                        {Math.round((calculateTotalExpenses() / (trip.budget || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Progress 
                        value={Math.min(100, (calculateTotalExpenses() / (trip.budget || 1)) * 100)} 
                        className="h-2 bg-gray-200"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>R$ {calculateTotalExpenses().toLocaleString('pt-BR')}</span>
                        <span>R$ {(trip.budget || 0).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
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