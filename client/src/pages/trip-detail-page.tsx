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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  AlertCircle,
  ChevronRight,
  Utensils,
  Mountain,
  Palette,
  Waves,
  Music,
  ShoppingBag,
  Edit2,
  Trash2,
  Plus,
  Save,
  Calculator,
  BarChart3,
  CheckCircle,
  PieChart,
  Eye,
  Info,
  UserPlus,
  Plane,
  Home,
  Shield,
  MoreHorizontal
} from "lucide-react";
import { format, differenceInDays, differenceInHours, differenceInMinutes, parseISO, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getRealParticipantsCount, getTripOccupancy, getParticipantsForBudgetCalculation, hasTripStarted } from "@/lib/trip-utils";
import React, { useState, useEffect, useMemo } from "react";
import { expenseCategories, budgetCategories, BudgetBreakdown } from "@shared/schema";
import { formatBrazilianCurrency, formatBrazilianNumber, calculatePerPerson, sumValues, parseNumber, calculateProgress } from "@shared/utils";
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
    if (days <= 7) {
      // Vermelho intenso - urgente (até 7 dias)
      return {
        gradient: "from-red-600 via-red-500 to-orange-500",
        textAccent: "text-red-100",
        iconAccent: "text-red-100"
      };
    } else if (days <= 30) {
      // Laranja - próximo (até 30 dias)
      return {
        gradient: "from-orange-500 via-amber-500 to-yellow-500",
        textAccent: "text-orange-100",
        iconAccent: "text-orange-100"
      };
    } else if (days <= 90) {
      // Verde/azul - médio prazo (até 90 dias)
      return {
        gradient: "from-emerald-600 via-teal-600 to-cyan-600",
        textAccent: "text-emerald-100",
        iconAccent: "text-emerald-100"
      };
    } else {
      // Azul/roxo - planejamento (mais de 90 dias)
      return {
        gradient: "from-blue-600 via-purple-600 to-indigo-600",
        textAccent: "text-blue-100",
        iconAccent: "text-blue-100"
      };
    }
  };

  if (isPast) {
    return (
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-2 sm:p-3 md:p-4 text-white shadow-lg w-full max-w-[280px] sm:max-w-sm md:max-w-md">
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <Trophy className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-100" />
          <div className="text-center">
            <h2 className="text-xs sm:text-sm md:text-base font-bold">Viagem Concluída!</h2>
            <p className="text-amber-100 text-[10px] sm:text-xs">Esperamos que tenha sido incrível!</p>
          </div>
        </div>
      </div>
    );
  }

  const gradientConfig = getGradientClasses(timeLeft.days);

  return (
    <div className={`bg-gradient-to-r ${gradientConfig.gradient} rounded-lg p-2 sm:p-3 md:p-4 text-white shadow-lg transition-all duration-1000 w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg`}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1.5 sm:mb-2">
          <Timer className={`h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ${gradientConfig.iconAccent}`} />
          <h2 className="text-xs sm:text-sm md:text-base font-bold">Contagem Regressiva</h2>
        </div>
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 md:gap-2 max-w-[240px] sm:max-w-xs md:max-w-sm mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/20 backdrop-blur-sm rounded-lg p-1 sm:p-1.5 md:p-2 border border-white/30"
          >
            <div className="text-xs sm:text-sm md:text-xl lg:text-2xl font-bold text-white">{timeLeft.days}</div>
            <div className={`text-[10px] sm:text-xs ${gradientConfig.textAccent}`}>Dias</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/20 backdrop-blur-sm rounded-lg p-1 sm:p-1.5 md:p-2 border border-white/30"
          >
            <div className="text-xs sm:text-sm md:text-xl lg:text-2xl font-bold text-white">{timeLeft.hours}</div>
            <div className={`text-[10px] sm:text-xs ${gradientConfig.textAccent}`}>Horas</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/20 backdrop-blur-sm rounded-lg p-1 sm:p-1.5 md:p-2 border border-white/30"
          >
            <div className="text-xs sm:text-sm md:text-xl lg:text-2xl font-bold text-white">{timeLeft.minutes}</div>
            <div className={`text-[10px] sm:text-xs ${gradientConfig.textAccent}`}>Min</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/20 backdrop-blur-sm rounded-lg p-1 sm:p-1.5 md:p-2 border border-white/30"
          >
            <div className="text-xs sm:text-sm md:text-xl lg:text-2xl font-bold text-white">{timeLeft.seconds}</div>
            <div className={`text-[10px] sm:text-xs ${gradientConfig.textAccent}`}>Seg</div>
          </motion.div>
        </div>
        <p className={`mt-1.5 sm:mt-2 ${gradientConfig.textAccent} text-[10px] sm:text-xs`}>
          Faltam {timeLeft.days} dias para sua aventura!
        </p>
      </div>
    </div>
  );
}

// Trip Statistics Component
function TripStatistics({ trip, planned_activities = [] }: { trip: any; planned_activities?: PlannedActivity[] }) {
  const stats = useMemo(() => {
    const totalBudget = Number(trip.budget) || 0;
    const realParticipants = getRealParticipantsCount(trip);
    const budgetParticipants = getParticipantsForBudgetCalculation(trip);
    const perPerson = budgetParticipants > 0 ? totalBudget / budgetParticipants : 0;
    const daysUntil = differenceInDays(new Date(trip.start_date || trip.startDate), new Date());
    const duration = differenceInDays(new Date(trip.end_date || trip.endDate), new Date(trip.start_date || trip.startDate));
    const occupancy = getTripOccupancy(trip);

    return {
      totalBudget,
      perPerson: isNaN(perPerson) ? 0 : perPerson,
      daysUntil: Math.max(0, daysUntil),
      duration: Math.max(1, duration),
      realParticipants,
      budgetParticipants,
      occupancy: isNaN(occupancy) ? 0 : occupancy
    };
  }, [trip]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
      {/* Orçamento Card */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-500 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600">Orçamento</div>
          </div>
          <div className="text-base sm:text-lg font-bold text-gray-900">
            R$ {stats.totalBudget.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-emerald-600">
            R$ {stats.perPerson.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} /pessoa
          </div>
        </CardContent>
      </Card>

      {/* Participação Card */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-purple-500 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600">Participantes</div>
          </div>
          <div className="text-base sm:text-lg font-bold text-gray-900">
            {stats.realParticipants}/{trip.max_participants || trip.maxParticipants}
          </div>
          <div className="text-xs text-purple-600">
            {Math.round(stats.occupancy)}% ocupação
          </div>
        </CardContent>
      </Card>

      {/* Duração Card */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-500 rounded-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600">Duração</div>
          </div>
          <div className="text-base sm:text-lg font-bold text-gray-900">
            {stats.duration} {stats.duration === 1 ? 'dia' : 'dias'}
          </div>
          {planned_activities.length > 0 && (
            <div className="text-xs text-blue-600">
              {planned_activities.length} atividades
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${
              trip.status === 'open' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {trip.status === 'open' ? (
                <Star className="h-4 w-4 text-white" />
              ) : (
                <X className="h-4 w-4 text-white" />
              )}
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600">Status</div>
          </div>
          <div className={`text-base sm:text-lg font-bold ${
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

// Enhanced Activities Timeline Component with Edit Features
function ActivitiesTimeline({ 
  activities, 
  tripStartDate, 
  tripEndDate, 
  canJoin, 
  onJoinClick,
  onActivitiesChange,
  isEditable = false,
  trip
}: {
  activities: PlannedActivity[];
  tripStartDate: string;
  tripEndDate: string;
  canJoin: boolean;
  onJoinClick: () => void;
  onActivitiesChange?: (activities: PlannedActivity[]) => void;
  isEditable?: boolean;
  trip?: any;
}) {
  const [editingActivity, setEditingActivity] = useState<PlannedActivity | null>(null);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<PlannedActivity>>({
    priority: 'medium',
    category: 'sightseeing',
    scheduledDate: tripStartDate
  });
  const { toast } = useToast();

  // Functions to handle activity editing
  const handleSaveActivity = async (activity: PlannedActivity) => {
    if (!onActivitiesChange) return;
    
    const updatedActivities = activities.map(a => 
      a.id === activity.id ? activity : a
    );
    
    try {
      // Save to backend if trip is provided
      if (trip) {
        const response = await fetch(`/api/trips/${trip.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ planned_activities: updatedActivities })
        });
        if (!response.ok) throw new Error('Failed to save');
      }
      
      onActivitiesChange(updatedActivities);
      setEditingActivity(null);
      toast({
        title: "Atividade atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!onActivitiesChange) return;
    
    const updatedActivities = activities.filter(a => a.id !== activityId);
    
    try {
      // Save to backend if trip is provided
      if (trip) {
        const response = await fetch(`/api/trips/${trip.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ planned_activities: updatedActivities })
        });
        if (!response.ok) throw new Error('Failed to delete');
      }
      
      onActivitiesChange(updatedActivities);
      toast({
        title: "Atividade removida",
        description: "A atividade foi removida do cronograma.",
      });
    } catch (error) {
      console.error('Erro ao remover atividade:', error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a atividade. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleAddActivity = async () => {
    if (!onActivitiesChange || !newActivity.title) return;
    
    const activity: PlannedActivity = {
      id: Date.now().toString(),
      title: newActivity.title,
      description: newActivity.description,
      category: (newActivity.category as PlannedActivity['category']) || 'sightseeing',
      priority: newActivity.priority || 'medium',
      estimatedCost: newActivity.estimatedCost,
      duration: newActivity.duration,
      location: newActivity.location,
      scheduledDate: newActivity.scheduledDate || tripStartDate,
      notes: newActivity.notes,
      completed: false,
      createdAt: new Date().toISOString(),
      status: 'planned'
    };
    
    const updatedActivities = [...activities, activity];
    
    try {
      // Save to backend if trip is provided
      if (trip) {
        const response = await fetch(`/api/trips/${trip.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ planned_activities: updatedActivities })
        });
        if (!response.ok) throw new Error('Failed to add');
      }
      
      onActivitiesChange(updatedActivities);
      setNewActivity({
        priority: 'medium',
        category: 'sightseeing',
        scheduledDate: tripStartDate
      });
      setIsAddingActivity(false);
      toast({
        title: "Atividade adicionada",
        description: "Nova atividade foi adicionada ao cronograma.",
      });
    } catch (error) {
      console.error('Erro ao adicionar atividade:', error);
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar a atividade. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Function to get category icon and color
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'sightseeing':
        return { icon: Camera, color: 'bg-blue-100 text-blue-600 border-blue-200', label: 'Turismo' };
      case 'food':
        return { icon: Utensils, color: 'bg-orange-100 text-orange-600 border-orange-200', label: 'Comida' };
      case 'adventure':
        return { icon: Mountain, color: 'bg-green-100 text-green-600 border-green-200', label: 'Aventura' };
      case 'culture':
        return { icon: Palette, color: 'bg-purple-100 text-purple-600 border-purple-200', label: 'Cultura' };
      case 'relaxation':
        return { icon: Waves, color: 'bg-teal-100 text-teal-600 border-teal-200', label: 'Relaxamento' };
      case 'nightlife':
        return { icon: Music, color: 'bg-pink-100 text-pink-600 border-pink-200', label: 'Vida Noturna' };
      case 'shopping':
        return { icon: ShoppingBag, color: 'bg-indigo-100 text-indigo-600 border-indigo-200', label: 'Compras' };
      default:
        return { icon: Target, color: 'bg-gray-100 text-gray-600 border-gray-200', label: category };
    }
  };

  // Function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Group activities by date
  const groupedActivities = useMemo(() => {
    if (!activities || activities.length === 0) return [];

    const grouped: { [key: string]: PlannedActivity[] } = {};
    
    activities.forEach(activity => {
      if (activity.scheduledDate) {
        const date = parseISO(activity.scheduledDate);
        const dateKey = format(date, 'yyyy-MM-dd');
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(activity);
      }
    });

    // Sort dates and activities within each date
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, dayActivities]) => ({
        date,
        displayDate: format(parseISO(date), 'EEEE, dd/MM', { locale: ptBR }),
        fullDate: format(parseISO(date), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR }),
        shortDate: format(parseISO(date), 'dd/MM', { locale: ptBR }),
        dayOfWeek: format(parseISO(date), 'EEEE', { locale: ptBR }),
        activities: dayActivities.sort((a, b) => {
          // Sort by priority (high > medium > low), then by title
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority;
          }
          
          return a.title.localeCompare(b.title);
        })
      }));
  }, [activities]);

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <Target className="h-8 w-8 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Nenhuma atividade planejada</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Comece a planejar suas atividades para tornar esta viagem ainda mais especial!
            </p>
          </div>
          {canJoin && (
            <div className="pt-4">
              <p className="text-sm text-gray-600 mb-3">
                Participe da viagem para ajudar no planejamento das atividades!
              </p>
              <Button onClick={onJoinClick} className="inline-flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Solicitar Participação
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Timeline Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Cronograma de Atividades</h3>
              <p className="text-sm text-gray-600 mt-1">
                {groupedActivities.length} {groupedActivities.length === 1 ? 'dia' : 'dias'} com atividades planejadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {activities.length}
              </div>
              <div className="text-sm text-gray-500">
                {activities.length === 1 ? 'atividade' : 'atividades'}
              </div>
            </div>
            {isEditable && (
              <Button
                onClick={() => setIsAddingActivity(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Atividade
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-blue-400 to-blue-300 rounded-full"></div>
        
        <div className="space-y-12">
          {groupedActivities.map((dayGroup, dayIndex) => (
            <motion.div
              key={dayGroup.date}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: dayIndex * 0.15 }}
              className="relative"
            >
              {/* Date Header */}
              <div className="flex items-center gap-6 mb-6">
                <div className="relative z-10 w-16 h-16 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center shadow-xl">
                  <div className="text-center">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      {dayGroup.shortDate}
                    </div>
                  </div>
                </div>
                <div className="bg-white px-6 py-4 rounded-xl border border-gray-200 shadow-sm flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 capitalize">{dayGroup.dayOfWeek}</h4>
                      <p className="text-sm text-gray-600 mt-1">{dayGroup.fullDate}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">
                        {dayGroup.activities.length}
                      </div>
                      <div className="text-xs text-gray-500">
                        {dayGroup.activities.length === 1 ? 'atividade' : 'atividades'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activities for this day */}
              <div className="ml-20 space-y-4">
                {dayGroup.activities.map((activity, activityIndex) => {
                  const categoryConfig = getCategoryConfig(activity.category);
                  const IconComponent = categoryConfig.icon;
                  
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: (dayIndex * 0.15) + (activityIndex * 0.08) }}
                      className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Activity Icon */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl border-2 flex items-center justify-center ${categoryConfig.color} group-hover:scale-110 transition-transform duration-200`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          
                          {/* Activity Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <h5 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                {activity.title}
                              </h5>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge variant="outline" className={`text-xs px-3 py-1 font-medium ${getPriorityColor(activity.priority)}`}>
                                  {activity.priority === 'high' ? 'Alta' : 
                                   activity.priority === 'medium' ? 'Média' : 'Baixa'}
                                </Badge>
                                <Badge variant="outline" className="text-xs px-3 py-1 font-medium bg-gray-50 text-gray-700">
                                  {categoryConfig.label}
                                </Badge>
                                {isEditable && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingActivity(activity)}
                                      className="h-8 w-8 p-0 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                                    >
                                      <Edit2 className="h-3 w-3 text-blue-600" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteActivity(activity.id)}
                                      className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:border-red-300"
                                    >
                                      <Trash2 className="h-3 w-3 text-red-600" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {activity.description && (
                              <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                                {activity.description}
                              </p>
                            )}
                            
                            {/* Activity Details */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6 text-sm text-gray-500">
                                {activity.duration && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">{activity.duration}</span>
                                  </div>
                                )}
                                {activity.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span className="truncate max-w-40 font-medium">{activity.location}</span>
                                  </div>
                                )}
                              </div>
                              
                              {activity.estimatedCost && (
                                <div className="flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                                  <DollarSign className="h-4 w-4" />
                                  <span>R$ {activity.estimatedCost.toLocaleString('pt-BR')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-200"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900">Resumo do Planejamento</h4>
            <p className="text-sm text-gray-600 mt-1">
              {activities.length} atividades distribuídas em {groupedActivities.length} {groupedActivities.length === 1 ? 'dia' : 'dias'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              R$ {activities.reduce((sum, activity) => sum + (activity.estimatedCost || 0), 0).toLocaleString('pt-BR')}
            </div>
            <div className="text-sm text-gray-500">Custo total estimado</div>
          </div>
        </div>
      </motion.div>

      {/* Edit Activity Dialog */}
      {editingActivity && (
        <Dialog open={!!editingActivity} onOpenChange={() => setEditingActivity(null)}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Atividade</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editingActivity.title}
                  onChange={(e) => setEditingActivity({...editingActivity, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editingActivity.description || ''}
                  onChange={(e) => setEditingActivity({...editingActivity, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Select value={editingActivity.category} onValueChange={(value) => setEditingActivity({...editingActivity, category: value as PlannedActivity['category']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sightseeing">Turismo</SelectItem>
                      <SelectItem value="food">Comida</SelectItem>
                      <SelectItem value="adventure">Aventura</SelectItem>
                      <SelectItem value="culture">Cultura</SelectItem>
                      <SelectItem value="relaxation">Relaxamento</SelectItem>
                      <SelectItem value="nightlife">Vida Noturna</SelectItem>
                      <SelectItem value="shopping">Compras</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-priority">Prioridade</Label>
                  <Select value={editingActivity.priority} onValueChange={(value) => setEditingActivity({...editingActivity, priority: value as 'high' | 'medium' | 'low'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-duration">Duração</Label>
                  <Input
                    id="edit-duration"
                    value={editingActivity.duration || ''}
                    onChange={(e) => setEditingActivity({...editingActivity, duration: e.target.value})}
                    placeholder="ex: 2 horas"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-cost">Custo Estimado (R$)</Label>
                  <Input
                    id="edit-cost"
                    type="number"
                    value={editingActivity.estimatedCost || ''}
                    onChange={(e) => setEditingActivity({...editingActivity, estimatedCost: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-location">Local</Label>
                <Input
                  id="edit-location"
                  value={editingActivity.location || ''}
                  onChange={(e) => setEditingActivity({...editingActivity, location: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-notes">Observações</Label>
                <Textarea
                  id="edit-notes"
                  value={editingActivity.notes || ''}
                  onChange={(e) => setEditingActivity({...editingActivity, notes: e.target.value})}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button onClick={() => handleSaveActivity(editingActivity)} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
                <Button variant="outline" onClick={() => setEditingActivity(null)} className="sm:w-auto">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Activity Dialog */}
      <Dialog open={isAddingActivity} onOpenChange={setIsAddingActivity}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Atividade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-title">Título</Label>
              <Input
                id="new-title"
                value={newActivity.title || ''}
                onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                placeholder="Nome da atividade"
              />
            </div>
            <div>
              <Label htmlFor="new-description">Descrição</Label>
              <Textarea
                id="new-description"
                value={newActivity.description || ''}
                onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                placeholder="Descreva a atividade..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-category">Categoria</Label>
                <Select value={newActivity.category} onValueChange={(value) => setNewActivity({...newActivity, category: value as PlannedActivity['category']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sightseeing">Turismo</SelectItem>
                    <SelectItem value="food">Comida</SelectItem>
                    <SelectItem value="adventure">Aventura</SelectItem>
                    <SelectItem value="culture">Cultura</SelectItem>
                    <SelectItem value="relaxation">Relaxamento</SelectItem>
                    <SelectItem value="nightlife">Vida Noturna</SelectItem>
                    <SelectItem value="shopping">Compras</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-priority">Prioridade</Label>
                <Select value={newActivity.priority} onValueChange={(value) => setNewActivity({...newActivity, priority: value as 'high' | 'medium' | 'low'})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-duration">Duração</Label>
                <Input
                  id="new-duration"
                  value={newActivity.duration || ''}
                  onChange={(e) => setNewActivity({...newActivity, duration: e.target.value})}
                  placeholder="ex: 2 horas"
                />
              </div>
              <div>
                <Label htmlFor="new-cost">Custo Estimado (R$)</Label>
                <Input
                  id="new-cost"
                  type="number"
                  value={newActivity.estimatedCost || ''}
                  onChange={(e) => setNewActivity({...newActivity, estimatedCost: Number(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="new-location">Local</Label>
              <Input
                id="new-location"
                value={newActivity.location || ''}
                onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                placeholder="Local da atividade"
              />
            </div>
            <div>
              <Label htmlFor="new-notes">Observações</Label>
              <Textarea
                id="new-notes"
                value={newActivity.notes || ''}
                onChange={(e) => setNewActivity({...newActivity, notes: e.target.value})}
                placeholder="Observações adicionais..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button onClick={handleAddActivity} className="flex-1" disabled={!newActivity.title}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Atividade
              </Button>
              <Button variant="outline" onClick={() => setIsAddingActivity(false)} className="sm:w-auto">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TripDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [requestMessage, setRequestMessage] = useState("");
  const [planned_activities, setPlannedActivities] = useState<PlannedActivity[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: rawTrip, isLoading, refetch } = useQuery<any>({
    queryKey: ["/api/trips", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/trips/${id}`);
      if (!res.ok) throw new Error('Falha ao buscar viagem');
      return res.json();
    },
    enabled: !!id,
  });

  // Initialize planned activities when trip data is loaded
  useEffect(() => {
    if (rawTrip?.planned_activities) {
      try {
        let parsedActivities = rawTrip.planned_activities;
        
        // Handle double-escaped JSON strings
        if (typeof parsedActivities === 'string') {
          try {
            parsedActivities = JSON.parse(parsedActivities);
          } catch (e) {
            // First parse failed, data might be double-escaped
          }
        }
        
        // If it's still a string, try parsing again
        if (typeof parsedActivities === 'string') {
          try {
            parsedActivities = JSON.parse(parsedActivities);
          } catch (e) {
            // Second parse failed
          }
        }
        
        setPlannedActivities(Array.isArray(parsedActivities) ? parsedActivities : []);
      } catch (error) {
        console.error('Error parsing planned activities:', error);
        setPlannedActivities([]);
      }
    } else {
      setPlannedActivities([]);
    }
  }, [rawTrip?.planned_activities]);

  // Parse budget_breakdown if it's a string (similar to planned_activities)
  const trip = useMemo(() => {
    if (!rawTrip) return null;

    let parsedBudgetBreakdown = rawTrip.budget_breakdown;
    
    // Handle budget_breakdown parsing - it might be stored as string JSON in database
    if (typeof parsedBudgetBreakdown === 'string') {
      try {
        parsedBudgetBreakdown = JSON.parse(parsedBudgetBreakdown);
        
        // Ensure it's actually an object and not still a string
        if (typeof parsedBudgetBreakdown === 'string') {
          parsedBudgetBreakdown = JSON.parse(parsedBudgetBreakdown);
        }
      } catch (e) {
        console.error('Error parsing budget_breakdown:', e);
        parsedBudgetBreakdown = null;
      }
    }
    
    // Ensure we have a valid object
    if (parsedBudgetBreakdown && typeof parsedBudgetBreakdown === 'object' && !Array.isArray(parsedBudgetBreakdown)) {
      // Convert string values to numbers if needed
      const cleanedBreakdown: any = {};
      for (const [key, value] of Object.entries(parsedBudgetBreakdown)) {
        cleanedBreakdown[key] = typeof value === 'string' ? parseFloat(value) || 0 : Number(value) || 0;
      }
      parsedBudgetBreakdown = cleanedBreakdown;
    }
    
    // If budget_breakdown is explicitly null, keep it null (user disabled categories)
    // Only create default breakdown if budget_breakdown is undefined (legacy trips)
    if (parsedBudgetBreakdown === undefined && rawTrip.budget && rawTrip.budget > 0) {
      parsedBudgetBreakdown = {
        transport: Math.round(rawTrip.budget * 0.4),
        accommodation: Math.round(rawTrip.budget * 0.4),
        food: Math.round(rawTrip.budget * 0.2)
      };
    }

    return {
      ...rawTrip,
      budget_breakdown: parsedBudgetBreakdown
    };
  }, [rawTrip]);

  const { data: requests = [] } = useQuery<any[]>({
    queryKey: ["/api/trips", id, "requests"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/trips/${id}/requests`);
      if (!res.ok) throw new Error('Falha ao buscar solicitações');
      return res.json();
    },
    enabled: !!trip && !!user && trip.creator_id === user?.id,
  });

  // Calculate user permissions
  const isCreator = trip && user && trip.creator_id === user.id;
  const isParticipant = trip && user && trip.participants?.some((p: any) => p.user_id === user.id && p.status === 'accepted');

  // Handle activities change and save to database
  const handleActivitiesChange = React.useCallback(async (newActivities: PlannedActivity[]) => {
    setPlannedActivities(newActivities);
    
    if (!trip || (!isCreator && !isParticipant)) return; // Allow creator and accepted participants to edit
    
    // Save to database asynchronously
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/trips/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ planned_activities: newActivities })
        });
        
        if (!response.ok) {
          throw new Error('Erro ao salvar atividades');
        }
        
        queryClient.invalidateQueries({ queryKey: ["/api/trips", id] });
      } catch (error) {
        console.error('Erro ao salvar atividades:', error);
        toast({
          title: "Erro ao salvar atividades",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive",
        });
      }
    }, 100);
  }, [id, trip, isCreator, isParticipant, queryClient, toast]);

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
      const response = await apiRequest("POST", `/api/trips/${data.trip_id}/request`, {
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
    mutationFn: async (cover_image: string) => {
      const response = await apiRequest("PATCH", `/api/trips/${id}/cover-image`, {
        cover_image
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

  // Handle saving activity to database
  const handleSaveActivity = async (activity: PlannedActivity) => {
    try {
      const updatedActivities = [...planned_activities, activity];
      setPlannedActivities(updatedActivities);
      
      const response = await apiRequest("PATCH", `/api/trips/${id}/activities`, {
        planned_activities: JSON.stringify(updatedActivities)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao salvar atividade');
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/trips", id] });
      toast({
        title: "Atividade salva!",
        description: "A atividade foi adicionada com sucesso à viagem.",
      });
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      toast({
        title: "Erro ao salvar atividade",
        description: "Não foi possível salvar a atividade.",
        variant: "destructive",
      });
    }
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

  const realParticipants = getRealParticipantsCount(trip);
  const canJoin = !isCreator && !isParticipant && realParticipants < trip.max_participants;

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
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4"
        >
          {/* Cover Image */}
          <div className="relative h-48">
            {trip.cover_image && (
              <img 
                src={trip.cover_image}
                alt={`Imagem da viagem: ${trip.title}`}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/30" />
            
            {/* Cover Image Edit Button */}
            {isCreator && (
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                <CoverImageSelector
                  currentImage={trip.cover_image}
                  destination={trip.destination}
                  onImageSelect={(imageUrl) => updateCoverImageMutation.mutate(imageUrl)}
                  trigger={
                    <Button 
                      variant="secondary" 
                      size="sm"
                      disabled={updateCoverImageMutation.isPending}
                      className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                    >
                      <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">{updateCoverImageMutation.isPending ? "Alterando..." : "Alterar"}</span>
                      <span className="sm:hidden">{updateCoverImageMutation.isPending ? "..." : "📷"}</span>
                    </Button>
                  }
                />
              </div>
            )}
            
            {/* Countdown Timer */}
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
              <CountdownTimer targetDate={trip.startDate} />
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-3">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {trip.title || "Viagem sem título"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
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
                      <span>{getRealParticipantsCount(trip)}/{trip.max_participants} participantes</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant={trip.status === 'open' ? 'default' : 'secondary'}>
                      {trip.status === 'open' ? 'Aberta para participação' : 'Lotada'}
                    </Badge>
                    <Badge variant="outline">
                      {travelStyleLabels[trip.travelStyle] || trip.travelStyle}
                    </Badge>
                  </div>
                </div>
                
                <TripStatistics trip={trip} planned_activities={planned_activities} />
              </div>
              
              <div className="flex gap-2 lg:flex-col lg:w-32">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3 order-2 lg:order-1"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Enhanced Tab Navigation */}
              <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-transparent gap-1 h-auto">
                  <TabsTrigger 
                    value="overview" 
                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-3 sm:py-2 rounded-lg font-medium transition-all duration-300 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200 text-gray-600 hover:bg-gray-50 group relative"
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Star className="h-4 w-4 group-data-[state=active]:text-blue-600" />
                      <span className="text-xs sm:text-sm font-medium">
                        <span className="hidden sm:inline">Visão Geral</span>
                        <span className="sm:hidden">Visão</span>
                      </span>
                    </div>
                    {/* Progress indicator for active tab */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="budget" 
                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-3 sm:py-2 rounded-lg font-medium transition-all duration-300 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200 text-gray-600 hover:bg-gray-50 group relative"
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Calculator className="h-4 w-4 group-data-[state=active]:text-blue-600" />
                      <span className="text-xs sm:text-sm font-medium">Orçamento</span>
                    </div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="activities" 
                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-3 sm:py-2 rounded-lg font-medium transition-all duration-300 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200 text-gray-600 hover:bg-gray-50 group relative"
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Target className="h-4 w-4 group-data-[state=active]:text-blue-600" />
                      <span className="text-xs sm:text-sm font-medium">Atividades</span>
                    </div>
                    {planned_activities.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {planned_activities.length}
                      </div>
                    )}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="expenses" 
                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-3 sm:py-2 rounded-lg font-medium transition-all duration-300 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200 text-gray-600 hover:bg-gray-50 group relative"
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <DollarSign className="h-4 w-4 group-data-[state=active]:text-blue-600" />
                      <span className="text-xs sm:text-sm font-medium">Despesas</span>
                    </div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="participants" 
                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-3 sm:py-2 rounded-lg font-medium transition-all duration-300 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200 text-gray-600 hover:bg-gray-50 group relative"
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Users className="h-4 w-4 group-data-[state=active]:text-blue-600" />
                      <span className="text-xs sm:text-sm font-medium">
                        <span className="hidden sm:inline">Participantes</span>
                        <span className="sm:hidden">Pessoas</span>
                      </span>
                    </div>
                    {trip.participants && trip.participants.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {getRealParticipantsCount(trip)}
                      </div>
                    )}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                  </TabsTrigger>
                </TabsList>

                {/* Tab Content Indicators */}
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center gap-1">
                    {["overview", "budget", "activities", "expenses", "participants"].map((tab, index) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          activeTab === tab ? 'bg-blue-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <TabsContent value="overview" className="space-y-6">


                {/* Description */}
                <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Info className="h-5 w-5 text-white" />
                      </div>
                      Sobre a Viagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed text-base">
                      {trip.description || "Descrição não disponível"}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="budget" className="space-y-6">
                {/* Tab Header */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500 rounded-lg">
                      <Calculator className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Detalhamento do Orçamento</h2>
                      <p className="text-sm text-gray-600">
                        Distribuição dos custos por categoria
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detailed Budget Breakdown */}
                <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <PieChart className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Orçamento da Viagem</h3>
                          <p className="text-sm text-gray-600 mt-1">Análise detalhada dos custos</p>
                        </div>
                        {!(isCreator || isParticipant) && (
                          <Badge variant="outline" className="text-xs bg-gray-100">
                            <Eye className="h-3 w-3 mr-1" />
                            Somente Visualização
                          </Badge>
                        )}
                      </div>
                      {isCreator && (
                        <BudgetEditor
                          tripId={parseInt(id!)}
                          currentBudget={trip.budget}
                          currentBudgetBreakdown={trip.budget_breakdown}
                          maxParticipants={trip.max_participants}
                          onBudgetUpdate={(newBudget, newBreakdown) => {
                            // Force refresh the trip data
                              refetch();
                            }}
                          />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {trip.budget_breakdown ? (
                        <div className="space-y-4">
                          {/* Compact Category Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(trip.budget_breakdown).map(([category, amount]) => {
                              // Ensure amount is a number (it might be a string from JSON parsing)
                              const numericAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : Number(amount) || 0;
                              const participantsCount = getParticipantsForBudgetCalculation(trip);
                              const perPerson = participantsCount > 0 ? numericAmount / participantsCount : 0;
                              
                              return (
                                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-white rounded-md shadow-sm">
                                      {category === 'transport' && <Plane className="h-3.5 w-3.5 text-blue-600" />}
                                      {category === 'accommodation' && <Home className="h-3.5 w-3.5 text-green-600" />}
                                      {category === 'food' && <Utensils className="h-3.5 w-3.5 text-orange-600" />}
                                      {category === 'insurance' && <Shield className="h-3.5 w-3.5 text-purple-600" />}
                                      {category === 'medical' && <Shield className="h-3.5 w-3.5 text-red-600" />}
                                      {!['transport', 'accommodation', 'food', 'insurance', 'medical'].includes(category) && 
                                        <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {budgetCategories[category as keyof typeof budgetCategories] || category}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        R$ {perPerson.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/pessoa
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold text-gray-900 tabular-nums">
                                      R$ {numericAmount.toLocaleString('pt-BR')}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Compact Total Summary */}
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 text-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-white" />
                                <div>
                                  <h4 className="text-base font-semibold">Total da Viagem</h4>
                                  <p className="text-blue-100 text-xs">
                                    {getParticipantsForBudgetCalculation(trip)} participantes
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold tabular-nums">
                                  R$ {trip.budget.toLocaleString('pt-BR')}
                                </p>
                                <p className="text-blue-100 text-xs">
                                  R$ {getParticipantsForBudgetCalculation(trip) > 0 ? (trip.budget / getParticipantsForBudgetCalculation(trip)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'} cada
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Simple Budget Display - No Categories Shown */
                        <div className="text-center py-8">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
                            <DollarSign className="h-8 w-8 text-white" />
                          </div>
                          <div className="space-y-3">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                R$ {trip.budget.toLocaleString('pt-BR')}
                              </h3>
                              <p className="text-lg text-gray-600">
                                R$ {getParticipantsForBudgetCalculation(trip) > 0 ? (trip.budget / getParticipantsForBudgetCalculation(trip)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'} por pessoa
                              </p>
                            </div>
                            <div className="max-w-sm mx-auto">
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-sm text-gray-600 mb-1">Participantes confirmados</p>
                                <div className="flex items-center justify-center gap-2">
                                  <Users className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium text-gray-900">{getRealParticipantsCount(trip)} de {trip.max_participants}</span>
                                </div>
                              </div>
                            </div>
                            {isCreator && (
                              <p className="text-xs text-gray-500 mt-4">
                                <Info className="h-4 w-4 inline mr-1" />
                                Use o botão "Editar Orçamento" para adicionar detalhamento por categoria
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Call to Action for Non-Participants */}
                      {!(isCreator || isParticipant) && canJoin && (
                        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mb-4">
                              <UserPlus className="h-6 w-6 text-white" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              Participe do Planejamento
                            </h4>
                            <p className="text-blue-700 mb-4 max-w-md mx-auto">
                              Junte-se à viagem para colaborar no planejamento do orçamento e dividir os custos!
                            </p>
                            <Button 
                              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
                              onClick={() => setActiveTab("overview")}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Solicitar Participação
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
              </TabsContent>

              <TabsContent value="activities" className="space-y-6">
                {/* Tab Header with Navigation */}
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Atividades da Viagem</h2>
                      <p className="text-sm text-gray-600">
                        {planned_activities.length} {planned_activities.length === 1 ? 'atividade planejada' : 'atividades planejadas'}
                      </p>
                    </div>
                  </div>
                </div>

                {(isCreator || isParticipant) ? (
                  <AdvancedActivityManager 
                    activities={planned_activities}
                    onActivitiesChange={handleActivitiesChange}
                    tripDestination={trip.destination}
                    trip={trip}
                  />
                ) : (
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        Atividades Planejadas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ActivitiesTimeline 
                        activities={planned_activities}
                        tripStartDate={trip.startDate}
                        tripEndDate={trip.endDate}
                        canJoin={canJoin}
                        onJoinClick={() => setActiveTab("overview")}
                        onActivitiesChange={setPlannedActivities}
                        isEditable={false}
                        trip={trip}
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="expenses" className="space-y-6">
                {/* Tab Header */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Gestão Financeira</h2>
                      <p className="text-sm text-gray-600">
                        Total: R$ {((trip.budget || 0) + calculateActivitiesCost(planned_activities)).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

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
                {/* Tab Header */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Companheiros de Viagem</h2>
                      <p className="text-sm text-gray-600">
                        {getRealParticipantsCount(trip)} de {trip.max_participants} vagas ocupadas
                      </p>
                    </div>
                  </div>
                </div>

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
                            {participant.user_id === trip.creator_id && (
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
            className="space-y-3 lg:space-y-4 order-1 lg:order-2"
          >

            {/* Action Buttons */}
            <Card className="bg-white shadow-sm border border-gray-200 lg:sticky lg:top-4">
              <CardContent className="p-3 space-y-2">
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

            {/* Compact Budget Overview */}
            <Card className="bg-white border-0 shadow-sm ring-1 ring-gray-200">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-2">
                <CardTitle className="text-base font-semibold text-gray-900 tracking-tight">
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-3">
                  {/* Compact Budget Items */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                        <span className="text-xs font-medium text-gray-700">Orçamento Base</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-900 tabular-nums">
                        R$ {(trip.budget || 0).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                        <span className="text-xs font-medium text-gray-700">Atividades</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-900 tabular-nums">
                        R$ {calculateActivitiesCost(planned_activities).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 bg-gray-50 -mx-3 px-3 mt-2 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                        <span className="text-xs font-semibold text-gray-900">Total</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 tabular-nums">
                        R$ {((trip.budget || 0) + calculateActivitiesCost(planned_activities)).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Compact Cost per Person */}
                  <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                    <div className="text-center space-y-0.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <Users className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-900">Custo Individual com Atividades</span>
                      </div>
                      <div className="text-base font-bold text-blue-900 tabular-nums">
                        R$ {getParticipantsForBudgetCalculation(trip) > 0 ? (((trip.budget || 0) + calculateActivitiesCost(planned_activities)) / getParticipantsForBudgetCalculation(trip)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                      </div>
                      <div className="text-xs text-blue-700">
                        {hasTripStarted(trip) ? `${getRealParticipantsCount(trip)} participantes confirmados` : `${trip.max_participants} participantes planejados`}
                      </div>
                    </div>
                  </div>

                  {/* Compact Budget Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Progresso</span>
                      <span className="text-xs font-semibold text-gray-900 tabular-nums">
                        {Math.round((calculateTotalExpenses() / ((trip.budget || 0) + calculateActivitiesCost(planned_activities) || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Progress 
                        value={Math.min(100, (calculateTotalExpenses() / ((trip.budget || 0) + calculateActivitiesCost(planned_activities) || 1)) * 100)} 
                        className="h-1.5 bg-gray-200"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>R$ {calculateTotalExpenses().toLocaleString('pt-BR')}</span>
                        <span>R$ {((trip.budget || 0) + calculateActivitiesCost(planned_activities)).toLocaleString('pt-BR')}</span>
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