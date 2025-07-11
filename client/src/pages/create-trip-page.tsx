import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Confetti from 'react-confetti';

import { ProtectedRoute } from "@/lib/protected-route";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Plane, 
  CheckCircle, 
  Target,
  TrendingUp,
  Star,
  Gift,
  Zap,
  Award,
  Trophy,
  Sparkles,
  Clock,
  Globe,
  Camera,
  Heart,
  Coffee,
  Compass,
  GripVertical,
  Plus,
  Minus,
  ChevronRight,
  ChevronLeft,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertTripSchema, expenseCategories, BudgetBreakdown, PlannedActivity } from "@shared/schema";
import { PlacesAutocomplete } from "@/components/places-autocomplete";
import { AdvancedActivityManager } from "@/components/advanced-activity-manager";
import { apiRequest } from "@/lib/queryClient";

const createTripSchema = insertTripSchema.extend({
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().min(1, "Data de fim é obrigatória"),
  plannedActivities: z.array(z.any()).optional(),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate > startDate;
}, {
  message: "A data de fim deve ser posterior à data de início",
  path: ["endDate"],
});

type CreateTripForm = z.input<typeof createTripSchema>;

// Travel Planning Roadmap - Best Practices Based
const PLANNING_ROADMAP = [
  { 
    id: 'research', 
    title: 'Pesquisa & Inspiração', 
    icon: Globe, 
    points: 20,
    status: 'pending',
    description: 'Escolha destino e pesquise sobre cultura, clima e atrações'
  },
  { 
    id: 'budget', 
    title: 'Planejamento Financeiro', 
    icon: DollarSign, 
    points: 25,
    status: 'pending',
    description: 'Defina orçamento total e categorize gastos'
  },
  { 
    id: 'dates', 
    title: 'Datas & Duração', 
    icon: Calendar, 
    points: 15,
    status: 'pending',
    description: 'Escolha as melhores datas considerando clima e eventos'
  },
  { 
    id: 'activities', 
    title: 'Atividades Planejadas', 
    icon: Camera, 
    points: 30,
    status: 'pending',
    description: 'Adicione atividades com custos, links e anexos'
  },
  { 
    id: 'group', 
    title: 'Formação do Grupo', 
    icon: Users, 
    points: 20,
    status: 'pending',
    description: 'Defina tamanho ideal e perfil dos companheiros'
  },
  { 
    id: 'logistics', 
    title: 'Logística & Detalhes', 
    icon: CheckCircle, 
    points: 20,
    status: 'pending',
    description: 'Finalize descrição e estilo de viagem'
  },
] as const;

// Old SortableActivityItem removed - now using AdvancedActivityManager

// Achievement System
const ACHIEVEMENTS = [
  { id: 'first_trip', title: 'Primeira Viagem', desc: 'Criar sua primeira viagem', icon: Star, unlocked: true },
  { id: 'budget_master', title: 'Planejador Financeiro', desc: 'Detalhar orçamento completo', icon: Trophy, unlocked: false },
  { id: 'social_butterfly', title: 'Organizador Social', desc: 'Criar viagem para 6+ pessoas', icon: Users, unlocked: false },
  { id: 'adventurer', title: 'Aventureiro', desc: 'Criar viagem de aventura', icon: Compass, unlocked: false },
];

function CreateTripPageContent() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [roadmapSteps, setRoadmapSteps] = useState(PLANNING_ROADMAP);
  const [showConfetti, setShowConfetti] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [achievements, setAchievements] = useState(ACHIEVEMENTS);
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);
  const [plannedActivities, setPlannedActivities] = useState<PlannedActivity[]>([
    {
      id: '1',
      title: 'Visitar pontos turísticos principais',
      category: 'sightseeing',
      priority: 'high',
      estimatedCost: 150,
      duration: '4 horas',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Experimentar gastronomia local',
      category: 'food',
      priority: 'medium',
      estimatedCost: 200,
      duration: '2 horas',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Explorar a vida noturna',
      category: 'nightlife',
      priority: 'low',
      estimatedCost: 100,
      duration: '3 horas',
      createdAt: new Date().toISOString(),
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const form = useForm<CreateTripForm>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      title: "",
      destination: "",
      description: "",
      startDate: "",
      endDate: "",
      maxParticipants: 4,
      budget: undefined,
      budgetBreakdown: undefined,
      travelStyle: "",
      sharedCosts: [],
    },
  });

  const watchedValues = useWatch({ control: form.control });

  // Calculate roadmap progress and update steps
  const calculateRoadmapProgress = () => {
    const updatedSteps = [...roadmapSteps];
    let totalProgress = 0;
    let completedCount = 0;
    
    // Research & Inspiration
    if (watchedValues.destination && watchedValues.travelStyle) {
      updatedSteps[0].status = 'completed';
      totalProgress += updatedSteps[0].points;
      completedCount++;
    } else if (watchedValues.destination || watchedValues.travelStyle) {
      updatedSteps[0].status = 'in-progress';
    }
    
    // Budget Planning
    if (watchedValues.budget || watchedValues.budgetBreakdown) {
      updatedSteps[1].status = 'completed';
      totalProgress += updatedSteps[1].points;
      completedCount++;
    }
    
    // Dates & Duration
    if (watchedValues.startDate && watchedValues.endDate) {
      updatedSteps[2].status = 'completed';
      totalProgress += updatedSteps[2].points;
      completedCount++;
    } else if (watchedValues.startDate || watchedValues.endDate) {
      updatedSteps[2].status = 'in-progress';
    }
    
    // Activities Planning
    if (plannedActivities.length >= 3) {
      updatedSteps[3].status = 'completed';
      totalProgress += updatedSteps[3].points;
      completedCount++;
    } else if (plannedActivities.length > 0) {
      updatedSteps[3].status = 'in-progress';
    }
    
    // Group Formation
    if (watchedValues.maxParticipants && watchedValues.maxParticipants > 2) {
      updatedSteps[4].status = 'completed';
      totalProgress += updatedSteps[4].points;
      completedCount++;
    }
    
    // Logistics & Details
    if (watchedValues.title && watchedValues.description) {
      updatedSteps[5].status = 'completed';
      totalProgress += updatedSteps[5].points;
      completedCount++;
    } else if (watchedValues.title || watchedValues.description) {
      updatedSteps[5].status = 'in-progress';
    }
    
    if (JSON.stringify(updatedSteps) !== JSON.stringify(roadmapSteps)) {
      setRoadmapSteps(updatedSteps);
    }
    
    return { progress: (totalProgress / 130) * 100, completedCount };
  };

  const { progress, completedCount } = calculateRoadmapProgress();

  // Check achievements
  useEffect(() => {
    const newAchievements = [...achievements];
    let newPoints = 0;
    
    // Budget Master achievement
    if (watchedValues.budgetBreakdown && !achievements.find(a => a.id === 'budget_master')?.unlocked) {
      const budgetMaster = newAchievements.find(a => a.id === 'budget_master');
      if (budgetMaster) {
        budgetMaster.unlocked = true;
        newPoints += 50;
        toast({
          title: "🏆 Conquista Desbloqueada!",
          description: "Planejador Financeiro - Você detalhou seu orçamento completo!",
        });
      }
    }

    // Social Butterfly achievement
    if (watchedValues.maxParticipants >= 6 && !achievements.find(a => a.id === 'social_butterfly')?.unlocked) {
      const socialButterfly = newAchievements.find(a => a.id === 'social_butterfly');
      if (socialButterfly) {
        socialButterfly.unlocked = true;
        newPoints += 30;
        toast({
          title: "🦋 Conquista Desbloqueada!",
          description: "Organizador Social - Viagem para grupos grandes!",
        });
      }
    }

    // Adventurer achievement
    if (watchedValues.travelStyle === 'aventura' && !achievements.find(a => a.id === 'adventurer')?.unlocked) {
      const adventurer = newAchievements.find(a => a.id === 'adventurer');
      if (adventurer) {
        adventurer.unlocked = true;
        newPoints += 40;
        toast({
          title: "🧭 Conquista Desbloqueada!",
          description: "Aventureiro - Pronto para a aventura!",
        });
      }
    }

    if (newPoints > 0) {
      setAchievements(newAchievements);
      setTotalPoints(prev => prev + newPoints);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [watchedValues, achievements]);

  const calculateTotalBudget = (breakdown: BudgetBreakdown): number => {
    return Object.values(breakdown).reduce((total, amount) => total + (amount || 0), 0);
  };

  const calculateActivitiesCost = (activities: PlannedActivity[]): number => {
    return activities.reduce((total, activity) => total + (activity.estimatedCost || 0), 0);
  };

  const calculateCostPerPerson = (totalBudget: number, participants: number): number => {
    return participants > 0 ? Math.round(totalBudget / participants) : 0;
  };

  const createTripMutation = useMutation({
    mutationFn: async (data: CreateTripForm) => {
      const activitiesCost = calculateActivitiesCost(plannedActivities);
      const totalBudget = data.budgetBreakdown 
        ? calculateTotalBudget(data.budgetBreakdown) + activitiesCost
        : (data.budget || 0) + activitiesCost;
        
      const tripData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        budget: totalBudget,
        plannedActivities: plannedActivities,
      };
      
      const response = await apiRequest("POST", "/api/trips", tripData);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar viagem");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-trips"] });
      
      setShowConfetti(true);
      toast({
        title: "🎉 Viagem Criada com Sucesso!",
        description: "Sua aventura está pronta! Outros viajantes já podem se juntar.",
      });
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar viagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateTripForm) => {
    // Final achievement unlock
    const finalAchievement = achievements.find(a => a.id === 'first_trip');
    if (finalAchievement && !finalAchievement.unlocked) {
      finalAchievement.unlocked = true;
      setTotalPoints(prev => prev + 100);
    }
    
    createTripMutation.mutate(data);
  };

  // Removed old activity functions - now handled by AdvancedActivityManager

  const travelStyles = [
    { value: "praia", label: "Praia", icon: "🏖️" },
    { value: "neve", label: "Neve", icon: "❄️" },
    { value: "cruzeiros", label: "Cruzeiros", icon: "🚢" },
    { value: "natureza", label: "Natureza e Ecoturismo", icon: "🌿" },
    { value: "cultural", label: "Culturais e Históricas", icon: "🏛️" },
    { value: "aventura", label: "Aventura", icon: "🏔️" },
    { value: "parques", label: "Parques Temáticos", icon: "🎢" },
    { value: "urbanas", label: "Viagens Urbanas", icon: "🏙️" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      {showConfetti && <Confetti />}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Progress */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Plane className="h-8 w-8 text-primary" />
              </motion.div>
              <span className="font-bold text-3xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Criar Nova Viagem
              </span>
            </div>
            <p className="text-gray-600 mb-6">Transforme seus sonhos em realidade com nossa plataforma gamificada</p>
            
            {/* Progress Bar */}
            <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Progresso da Criação</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{totalPoints} pontos</span>
                </div>
              </div>
              <Progress value={progress} className="h-3 mb-2" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{completedCount}/6 etapas concluídas</span>
                <span>{Math.round(progress)}% completo</span>
              </div>
            </div>

            {/* Achievements */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ 
                    scale: achievement.unlocked ? 1 : 0.8, 
                    opacity: achievement.unlocked ? 1 : 0.5 
                  }}
                  className={`p-4 rounded-lg border-2 ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <achievement.icon className={`h-6 w-6 mx-auto mb-2 ${
                    achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'
                  }`} />
                  <p className="text-xs font-medium text-center">{achievement.title}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Detalhes da Viagem
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Step 1: Basic Info */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="outline" className="bg-blue-50">
                            <Globe className="h-3 w-3 mr-1" />
                            Etapa 1
                          </Badge>
                          <h3 className="text-lg font-semibold">Informações Básicas</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Título da Viagem</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ex: Aventura Épica em Machu Picchu" 
                                    {...field} 
                                    className="border-2 focus:border-primary"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descrição da Aventura</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Conte sobre sua viagem dos sonhos! O que vocês vão fazer? Que experiências incríveis esperam por vocês?"
                                    className="min-h-[120px] border-2 focus:border-primary"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </motion.div>

                      <Separator />

                      {/* Step 2: Destination */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="outline" className="bg-green-50">
                            <MapPin className="h-3 w-3 mr-1" />
                            Etapa 2
                          </Badge>
                          <h3 className="text-lg font-semibold">Destino dos Sonhos</h3>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="destination"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Para onde vamos?</FormLabel>
                              <FormControl>
                                <PlacesAutocomplete
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Busque cidades incríveis como São Paulo, Paris, Tokyo..."
                                  className="border-2 focus:border-primary"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="travelStyle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estilo de Viagem</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-2 focus:border-primary">
                                    <SelectValue placeholder="Escolha o estilo da sua aventura" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {travelStyles.map((style) => (
                                    <SelectItem key={style.value} value={style.value}>
                                      <div className="flex items-center gap-2">
                                        <span>{style.icon}</span>
                                        <span>{style.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <Separator />

                      {/* Step 3: Dates */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="outline" className="bg-purple-50">
                            <Calendar className="h-3 w-3 mr-1" />
                            Etapa 3
                          </Badge>
                          <h3 className="text-lg font-semibold">Quando Partir</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data de Início</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <Input 
                                      type="date" 
                                      className="pl-10 border-2 focus:border-primary" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data de Fim</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                    <Input 
                                      type="date" 
                                      className="pl-10 border-2 focus:border-primary" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </motion.div>

                      <Separator />

                      {/* Step 4: Budget */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="outline" className="bg-yellow-50">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Etapa 4
                          </Badge>
                          <h3 className="text-lg font-semibold">Planejamento Financeiro</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Orçamento Detalhado</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Simples</span>
                              <Switch 
                                checked={showBudgetBreakdown}
                                onCheckedChange={setShowBudgetBreakdown}
                              />
                              <span className="text-sm text-gray-600">Detalhado</span>
                            </div>
                          </div>

                          {!showBudgetBreakdown ? (
                            <FormField
                              control={form.control}
                              name="budget"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Orçamento Total da Viagem (R$)</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                      <Input 
                                        type="number" 
                                        placeholder="6000" 
                                        className="pl-10 border-2 focus:border-primary" 
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                        value={field.value || ""}
                                      />
                                    </div>
                                  </FormControl>
                                  {field.value && form.watch('maxParticipants') && (
                                    <div className="space-y-2">
                                      {calculateActivitiesCost(plannedActivities) > 0 && (
                                        <div className="bg-purple-50 p-3 rounded-lg">
                                          <p className="text-sm font-medium text-purple-900">
                                            🎯 Custo das Atividades: R$ {calculateActivitiesCost(plannedActivities).toLocaleString('pt-BR')}
                                          </p>
                                        </div>
                                      )}
                                      <div className="bg-emerald-50 p-3 rounded-lg">
                                        <p className="text-sm font-medium text-emerald-900">
                                          💰 Total da Viagem: R$ {(field.value + calculateActivitiesCost(plannedActivities)).toLocaleString('pt-BR')}
                                        </p>
                                      </div>
                                      <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-sm font-medium text-blue-900">
                                          👥 Custo por pessoa: R$ {calculateCostPerPerson(field.value + calculateActivitiesCost(plannedActivities), form.watch('maxParticipants')).toLocaleString('pt-BR')}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(expenseCategories).map(([key, label]) => (
                                  <FormField
                                    key={key}
                                    control={form.control}
                                    name={`budgetBreakdown.${key as keyof BudgetBreakdown}`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-sm">{label}</FormLabel>
                                        <FormControl>
                                          <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 h-3 w-3 text-gray-500" />
                                            <Input 
                                              type="number" 
                                              placeholder="0" 
                                              className="pl-10 text-sm border-2 focus:border-primary" 
                                              {...field}
                                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                              value={field.value || ""}
                                            />
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </div>
                              
                              {form.watch('budgetBreakdown') && (
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                                    <span className="font-bold text-blue-900">💎 Orçamento Base:</span>
                                    <span className="text-xl font-bold text-blue-900">
                                      R$ {calculateTotalBudget(form.watch('budgetBreakdown') || {}).toLocaleString('pt-BR')}
                                    </span>
                                  </div>
                                  {calculateActivitiesCost(plannedActivities) > 0 && (
                                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                                      <span className="font-bold text-purple-900">🎯 Custo das Atividades:</span>
                                      <span className="text-xl font-bold text-purple-900">
                                        R$ {calculateActivitiesCost(plannedActivities).toLocaleString('pt-BR')}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-300">
                                    <span className="font-bold text-emerald-900">💰 Total da Viagem:</span>
                                    <span className="text-2xl font-bold text-emerald-900">
                                      R$ {(calculateTotalBudget(form.watch('budgetBreakdown') || {}) + calculateActivitiesCost(plannedActivities)).toLocaleString('pt-BR')}
                                    </span>
                                  </div>
                                  {form.watch('maxParticipants') && (calculateTotalBudget(form.watch('budgetBreakdown') || {}) + calculateActivitiesCost(plannedActivities)) > 0 && (
                                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                                      <span className="font-bold text-green-900">👥 Custo por Pessoa:</span>
                                      <span className="text-xl font-bold text-green-900">
                                        R$ {calculateCostPerPerson(
                                          calculateTotalBudget(form.watch('budgetBreakdown') || {}) + calculateActivitiesCost(plannedActivities), 
                                          form.watch('maxParticipants')
                                        ).toLocaleString('pt-BR')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>

                      <Separator />

                      {/* Step 5: Advanced Activities */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="outline" className="bg-orange-50">
                            <Camera className="h-3 w-3 mr-1" />
                            Etapa 5
                          </Badge>
                          <h3 className="text-lg font-semibold">Atividades Planejadas</h3>
                        </div>
                        
                        <AdvancedActivityManager
                          activities={plannedActivities}
                          onActivitiesChange={setPlannedActivities}
                          className="border-2 border-gray-200 rounded-lg p-4"
                        />
                      </motion.div>

                      <Separator />

                      {/* Step 6: Group */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="outline" className="bg-indigo-50">
                            <Users className="h-3 w-3 mr-1" />
                            Etapa 6
                          </Badge>
                          <h3 className="text-lg font-semibold">Companheiros de Viagem</h3>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="maxParticipants"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Máximo de Participantes</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                  <Input 
                                    type="number" 
                                    min="2" 
                                    max="20" 
                                    className="pl-10 border-2 focus:border-primary" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 4)}
                                  />
                                </div>
                              </FormControl>
                              <p className="text-sm text-gray-600 mt-1">
                                👥 Grupos maiores desbloqueiam conquistas especiais!
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <Separator />

                      {/* Submit Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <Button 
                          type="submit" 
                          size="lg" 
                          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white font-bold py-4 text-lg shadow-lg"
                          disabled={createTripMutation.isPending}
                        >
                          {createTripMutation.isPending ? (
                            <>
                              <Clock className="mr-2 h-4 w-4 animate-spin" />
                              Criando sua aventura...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Criar Viagem dos Sonhos
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Planning Roadmap */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Compass className="h-5 w-5" />
                      Roadmap de Planejamento
                    </CardTitle>
                    <p className="text-sm text-gray-600">Siga as melhores práticas para viagens</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {roadmapSteps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                          <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                              step.status === 'completed' 
                                ? 'bg-green-50 border-green-200' 
                                : step.status === 'in-progress'
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              step.status === 'completed' 
                                ? 'bg-green-500 text-white' 
                                : step.status === 'in-progress'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-300 text-gray-600'
                            }`}>
                              {step.status === 'completed' ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Icon className="h-4 w-4" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <h4 className={`text-sm font-semibold ${
                                step.status === 'completed' ? 'text-green-800' : 'text-gray-800'
                              }`}>
                                {step.title}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                              {step.status === 'completed' && (
                                <div className="flex items-center gap-1 mt-2">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span className="text-xs text-yellow-600 font-medium">
                                    +{step.points} pontos
                                  </span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Activities Summary */}
                <Card className="shadow-lg border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <Camera className="h-5 w-5" />
                      Resumo das Atividades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-purple-700">Total de Atividades:</span>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">
                          {plannedActivities.length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-purple-700">Custo Estimado:</span>
                        <span className="text-sm font-bold text-purple-900">
                          R$ {calculateActivitiesCost(plannedActivities).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {plannedActivities.length > 0 && (
                        <div className="pt-2 border-t border-purple-200">
                          <p className="text-xs text-purple-600 mb-2">Top 3 Atividades:</p>
                          <div className="space-y-1">
                            {plannedActivities.slice(0, 3).map((activity, index) => (
                              <div key={activity.id} className="flex items-center gap-2 text-xs">
                                <span className="w-4 h-4 bg-purple-200 rounded-full flex items-center justify-center text-purple-800 font-bold">
                                  {index + 1}
                                </span>
                                <span className="truncate flex-1 text-purple-700">{activity.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Travel Tips */}
                <Card className="shadow-lg border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-800">
                      <Zap className="h-5 w-5" />
                      Dicas de Planejamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Pesquise sobre feriados e eventos locais</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Reserve pelo menos 20% do orçamento para emergências</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Organize atividades por prioridade e proximidade</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Considere seguro viagem para destinos internacionais</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateTripPage() {
  return (
    <ProtectedRoute>
      <CreateTripPageContent />
    </ProtectedRoute>
  );
}