import React, { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Minus,
  BookOpen,
  Route,
  Lightbulb,
  Shield,
  Search,
  Trash2,
  ArrowUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertTripSchema, expenseCategories, BudgetBreakdown, PlannedActivity } from "@shared/schema";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import { DestinationSelector } from "@/components/destination-selector";
import { AdvancedActivityManager } from "@/components/advanced-activity-manager";
import { CoverImageSelector } from "@/components/cover-image-selector";
import { apiRequest } from "@/lib/queryClient";

// Enhanced schema with proper date handling
const createTripSchema = insertTripSchema.omit({ destination_id: true }).extend({
  planned_activities: z.array(z.any()).optional(),
  destination: z.string().min(1, "Destino é obrigatório"),
  start_date: z.string().min(1, "Data de início é obrigatória"),
  end_date: z.string().min(1, "Data de fim é obrigatória"),
}).refine((data) => {
  const start_date = new Date(data.start_date);
  const end_date = new Date(data.end_date);
  return end_date > start_date;
}, {
  message: "A data de fim deve ser posterior à data de início",
  path: ["end_date"],
});

type CreateTripForm = z.infer<typeof createTripSchema>;

// Multi-step wizard configuration
interface WizardStep {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  isCompleted: boolean;
  isActive: boolean;
}

const WIZARD_STEPS: WizardStep[] = [
  { id: 'basics', title: 'Informações Básicas', subtitle: 'Defina título, destino e período', icon: BookOpen, isCompleted: false, isActive: true },
  { id: 'planning', title: 'Planejamento', subtitle: 'Orçamento e grupo de viajantes', icon: Target, isCompleted: false, isActive: false },
  { id: 'activities', title: 'Atividades', subtitle: 'Adicione experiências planejadas', icon: Camera, isCompleted: false, isActive: false },
  { id: 'review', title: 'Revisão Final', subtitle: 'Confirme todos os detalhes', icon: CheckCircle, isCompleted: false, isActive: false },
];

// Smart suggestions based on destination/travel style
const TRAVEL_STYLE_SUGGESTIONS = {
  'aventura': {
    icon: '🏔️',
    tips: ['Considere seguro viagem', 'Verifique equipamentos necessários', 'Pesquise sobre clima'],
    budget_multiplier: 1.2
  },
  'cultural': {
    icon: '🏛️',
    tips: ['Reserve ingressos antecipadamente', 'Pesquise sobre história local', 'Considere guias especializados'],
    budget_multiplier: 1.0
  },
  'gastronomia': {
    icon: '🍽️',
    tips: ['Reserve restaurantes populares', 'Experimente mercados locais', 'Considere tours gastronômicos'],
    budget_multiplier: 1.15
  },
  'relaxante': {
    icon: '🌴',
    tips: ['Reserve spas antecipadamente', 'Considere resorts all-inclusive', 'Planeje tempo livre'],
    budget_multiplier: 0.9
  },
  'urbanas': {
    icon: '🏙️',
    tips: ['Use transporte público', 'Explore diferentes bairros', 'Aproveite a vida noturna'],
    budget_multiplier: 1.1
  },
  'praia': {
    icon: '🏖️',
    tips: ['Verifique temporadas', 'Considere protetor solar', 'Atividades aquáticas'],
    budget_multiplier: 1.0
  }
};

function CreateTripPageContent() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Wizard state management
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardSteps, setWizardSteps] = useState(WIZARD_STEPS);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedDestinationId, setSelectedDestinationId] = useState<number | undefined>(undefined);
  const [plannedActivities, setPlannedActivities] = useState<PlannedActivity[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);

  const form = useForm<CreateTripForm>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      title: "",
      destination: "",
      description: "",
      start_date: "",
      end_date: "",
      max_participants: 4,
      budget: undefined,
      budget_breakdown: undefined,
      travel_style: "",
      shared_costs: [],
    },
  });

  const watchedValues = useWatch({ control: form.control });

  // Update wizard progress based on form completion
  useEffect(() => {
    const updatedSteps = [...wizardSteps];
    
    // Step 1: Basics completion
    const basicsComplete = watchedValues.title && watchedValues.destination && 
                          watchedValues.start_date && watchedValues.end_date;
    updatedSteps[0].isCompleted = Boolean(basicsComplete);

    // Step 2: Planning completion
    const planningComplete = watchedValues.budget && watchedValues.travel_style && 
                           watchedValues.max_participants;
    updatedSteps[1].isCompleted = Boolean(planningComplete);

    // Step 3: Activities completion (opcional - permite pular)
    updatedSteps[2].isCompleted = true; // Sempre permite avançar

    // Step 4: Review (always completable if previous steps are done)
    updatedSteps[3].isCompleted = updatedSteps[0].isCompleted && 
                                updatedSteps[1].isCompleted && 
                                updatedSteps[2].isCompleted;

    setWizardSteps(updatedSteps);
  }, [watchedValues, plannedActivities]);

  // Smart suggestions based on travel style
  useEffect(() => {
    if (watchedValues.travel_style && TRAVEL_STYLE_SUGGESTIONS[watchedValues.travel_style as keyof typeof TRAVEL_STYLE_SUGGESTIONS]) {
      const suggestions = TRAVEL_STYLE_SUGGESTIONS[watchedValues.travel_style as keyof typeof TRAVEL_STYLE_SUGGESTIONS];
      setSmartSuggestions(suggestions.tips);
    }
  }, [watchedValues.travel_style]);

  // Navigation functions
  const nextStep = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      const updatedSteps = [...wizardSteps];
      updatedSteps.forEach((step, index) => {
        step.isActive = index === currentStep + 1;
      });
      setWizardSteps(updatedSteps);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const updatedSteps = [...wizardSteps];
      updatedSteps.forEach((step, index) => {
        step.isActive = index === currentStep - 1;
      });
      setWizardSteps(updatedSteps);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    const updatedSteps = [...wizardSteps];
    updatedSteps.forEach((step, index) => {
      step.isActive = index === stepIndex;
    });
    setWizardSteps(updatedSteps);
  };

  // Form submission
  const createTripMutation = useMutation({
    mutationFn: async (data: CreateTripForm) => {
      const { destination, ...tripData } = data;
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...tripData,
          destination_id: selectedDestinationId,
          planned_activities: plannedActivities,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create trip');
      }
      return response.json();
    },
    onSuccess: () => {
      setShowConfetti(true);
      toast({
        title: "🎉 Viagem criada com sucesso!",
        description: "Sua aventura está pronta para começar!",
      });
      
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/my-trips'] });
        navigate('/dashboard');
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar viagem",
        description: error.message || "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateTripForm) => {
    console.log("Form submission data:", data);
    console.log("Selected destination ID:", selectedDestinationId);
    console.log("Planned activities:", plannedActivities);
    
    if (!selectedDestinationId) {
      toast({
        title: "Destino não selecionado",
        description: "Por favor, selecione um destino válido",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.title || !data.start_date || !data.end_date) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha título, data de início e fim",
        variant: "destructive",
      });
      return;
    }
    
    // Avança para o próximo passo (atividades) em vez de criar a viagem
    setCurrentStep(currentStep + 1);
  };

  // Função separada para criar a viagem (apenas na revisão final)
  const handleCreateTrip = () => {
    const formData = form.getValues();
    const tripData = {
      ...formData,
      destination_id: selectedDestinationId,
      planned_activities: plannedActivities,
    };
    
    console.log("Creating trip with data:", tripData);
    createTripMutation.mutate(tripData);
  };

  // Progress calculation
  const overallProgress = Math.round(
    (wizardSteps.filter(step => step.isCompleted).length / wizardSteps.length) * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-800 dark:text-blue-200">Criador Inteligente de Viagens</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Planeje Sua Próxima Aventura
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Crie experiências inesquecíveis com nosso planejador inteligente. 
            Conecte-se com pessoas incríveis e descubra destinos fantásticos.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Progress Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-24 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Route className="h-5 w-5 text-blue-600" />
                  Progresso da Criação
                </CardTitle>
                <div className="space-y-2">
                  <Progress value={overallProgress} className="h-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {overallProgress}% concluído
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wizardSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => goToStep(index)}
                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                          step.isActive 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                            : step.isCompleted
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                            : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                          step.isActive 
                            ? 'bg-white/20' 
                            : step.isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                        }`}>
                          {step.isCompleted ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-semibold ${
                            step.isActive ? 'text-white' : step.isCompleted ? 'text-green-800 dark:text-green-200' : 'text-gray-800 dark:text-gray-200'
                          }`}>
                            {step.title}
                          </h4>
                          <p className={`text-xs ${
                            step.isActive ? 'text-white/80' : step.isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {step.subtitle}
                          </p>
                        </div>
                        
                        {index === currentStep && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Smart Suggestions */}
                {smartSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <h5 className="font-medium text-yellow-800 dark:text-yellow-200">Dicas Inteligentes</h5>
                    </div>
                    <ul className="space-y-2">
                      {smartSuggestions.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                          <div className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Form Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
{(() => {
                        const Icon = wizardSteps[currentStep].icon;
                        return <Icon className="h-6 w-6 text-blue-600" />;
                      })()}
                      {wizardSteps[currentStep].title}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {wizardSteps[currentStep].subtitle}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    Etapa {currentStep + 1} de {wizardSteps.length}
                  </Badge>
                </div>
                <Separator className="mt-4" />
              </CardHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <CardContent className="pb-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {currentStep === 0 && (
                          <StepBasics 
                            form={form} 
                            selectedDestinationId={selectedDestinationId}
                            setSelectedDestinationId={setSelectedDestinationId}
                          />
                        )}
                        
                        {currentStep === 1 && (
                          <StepPlanning 
                            form={form} 
                            watchedValues={watchedValues}
                          />
                        )}
                        
                        {currentStep === 2 && (
                          <StepActivities 
                            plannedActivities={plannedActivities}
                            setPlannedActivities={setPlannedActivities}
                          />
                        )}
                        
                        {currentStep === 3 && (
                          <StepReview 
                            form={form}
                            watchedValues={watchedValues}
                            plannedActivities={plannedActivities}
                            selectedDestinationId={selectedDestinationId}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </CardContent>

                  {/* Navigation Footer */}
                  <CardContent className="pt-0">
                    <Separator className="mb-6" />
                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Anterior
                      </Button>

                      <div className="flex items-center gap-2">
                        {wizardSteps.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentStep 
                                ? 'bg-blue-600 w-6' 
                                : index < currentStep 
                                ? 'bg-green-500' 
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>

                      {currentStep < wizardSteps.length - 1 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={!wizardSteps[currentStep].isCompleted}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          Próximo
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleCreateTrip}
                          disabled={createTripMutation.isPending || !wizardSteps[3].isCompleted}
                          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 min-w-[140px]"
                        >
                          {createTripMutation.isPending ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Criar Viagem
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </form>
              </Form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function StepBasics({ 
  form, 
  selectedDestinationId, 
  setSelectedDestinationId 
}: { 
  form: any; 
  selectedDestinationId: number | undefined; 
  setSelectedDestinationId: (id: number | undefined) => void; 
}) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-medium">
                <Sparkles className="h-4 w-4 text-purple-600" />
                Título da Viagem
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Ex: Aventura no Rio de Janeiro"
                  className="h-12 text-lg border-2 focus:border-blue-500 transition-colors"
                  data-testid="input-trip-title"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-medium">
                <MapPin className="h-4 w-4 text-red-600" />
                Destino
              </FormLabel>
              <FormControl>
                <DestinationSelector
                  value={selectedDestinationId}
                  onValueChange={(destinationId: number | undefined) => {
                    setSelectedDestinationId(destinationId);
                    // Find destination name by ID and update form
                    if (destinationId) {
                      // This will be set when destinations are loaded
                      field.onChange(`destination-${destinationId}`);
                    } else {
                      field.onChange("");
                    }
                  }}
                  className="h-12 text-lg"
                  data-testid="select-destination"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-base font-medium">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Descrição da Viagem
            </FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Descreva o que torna essa viagem especial. Que experiências você quer viver?"
                className="min-h-24 text-base border-2 focus:border-blue-500 transition-colors resize-none"
                data-testid="textarea-description"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-medium">
                <Calendar className="h-4 w-4 text-green-600" />
                Data de Início
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="date" 
                  className="h-12 text-lg border-2 focus:border-blue-500 transition-colors"
                  min={new Date().toISOString().split('T')[0]}
                  data-testid="input-start-date"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-medium">
                <Calendar className="h-4 w-4 text-red-600" />
                Data de Término
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="date" 
                  className="h-12 text-lg border-2 focus:border-blue-500 transition-colors"
                  min={form.watch('start_date') || new Date().toISOString().split('T')[0]}
                  data-testid="input-end-date"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function StepPlanning({ form, watchedValues }: { form: any; watchedValues: any }) {
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-medium">
                <DollarSign className="h-4 w-4 text-green-600" />
                Orçamento Total (R$)
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  placeholder="Ex: 2500"
                  className="h-12 text-lg border-2 focus:border-blue-500 transition-colors"
                  min="0"
                  step="50"
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  data-testid="input-budget"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_participants"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-medium">
                <Users className="h-4 w-4 text-blue-600" />
                Máximo de Participantes
              </FormLabel>
              <FormControl>
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => field.onChange(Math.max(2, field.value - 1))}
                    disabled={field.value <= 2}
                    data-testid="button-decrease-participants"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold text-blue-600">{field.value}</span>
                    <p className="text-sm text-gray-500">pessoas</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => field.onChange(Math.min(20, field.value + 1))}
                    disabled={field.value >= 20}
                    data-testid="button-increase-participants"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="travel_style"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-base font-medium">
              <Compass className="h-4 w-4 text-purple-600" />
              Estilo de Viagem
            </FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value} data-testid="select-travel-style">
                <SelectTrigger className="h-12 text-lg border-2 focus:border-blue-500">
                  <SelectValue placeholder="Escolha o estilo que mais combina com você" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TRAVEL_STYLE_SUGGESTIONS).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{value.icon}</span>
                        <span className="capitalize font-medium">{key}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Budget Breakdown Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div>
          <h4 className="font-medium">Orçamento Detalhado</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Organize seus gastos por categoria para melhor controle
          </p>
        </div>
        <Switch
          checked={showBudgetBreakdown}
          onCheckedChange={setShowBudgetBreakdown}
          data-testid="switch-budget-breakdown"
        />
      </div>

      {showBudgetBreakdown && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="budget_breakdown"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distribuição do Orçamento</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(expenseCategories).map(([key, categoryName]) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium capitalize flex items-center gap-2">
                          <span className="text-lg">💰</span>
                          {categoryName}
                        </label>
                        <Input
                          type="number"
                          placeholder="R$ 0"
                          className="border-2 focus:border-blue-500"
                          onChange={(e) => {
                            const currentBreakdown = field.value || {};
                            field.onChange({
                              ...currentBreakdown,
                              [key]: e.target.value ? parseFloat(e.target.value) : 0
                            });
                          }}
                          data-testid={`input-budget-${key}`}
                        />
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>
      )}
    </div>
  );
}

function StepActivities({ 
  plannedActivities, 
  setPlannedActivities 
}: { 
  plannedActivities: PlannedActivity[]; 
  setPlannedActivities: (activities: PlannedActivity[]) => void; 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  // Query para buscar atividades do banco
  const { data: availableActivities = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const response = await fetch("/api/activities?sortBy=rating", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Erro ao carregar atividades");
      return response.json();
    },
  });

  // Filtrar atividades
  const filteredActivities = availableActivities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || activity.category === selectedCategory;
    const notAlreadyAdded = !plannedActivities.find(planned => planned.id === activity.id.toString());
    
    return matchesSearch && matchesCategory && notAlreadyAdded;
  });

  // Categorias únicas das atividades
  const categories = ["all", ...new Set(availableActivities.map(activity => activity.category))];
  
  const categoryLabels: Record<string, string> = {
    all: "Todas",
    pontos_turisticos: "Pontos Turísticos", 
    adventure: "Aventura",
    cultural: "Cultural",
    food_tours: "Gastronomia",
    nature: "Natureza",
    water_sports: "Esportes Aquáticos"
  };

  const addActivity = (activity: any) => {
    const newActivity: PlannedActivity = {
      id: activity.id.toString(),
      title: activity.title,
      description: activity.description || "",
      category: activity.category,
      estimated_cost: activity.price || 0,
      duration: activity.duration || "1-2 horas",
      priority: "medium",
      attachments: [],
      links: [],
      notes: `Atividade encontrada na busca\nPreço original: R$ ${activity.price || 0}`,
      status: "planned"
    };

    setPlannedActivities([...plannedActivities, newActivity]);
    
    toast({
      title: "✅ Atividade adicionada!",
      description: `${activity.title} foi adicionada ao seu plano`,
    });
  };

  const removeActivity = (activityId: string) => {
    setPlannedActivities(plannedActivities.filter(activity => activity.id !== activityId));
    
    toast({
      title: "🗑️ Atividade removida",
      description: "A atividade foi removida do seu plano",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-6">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-800 dark:text-blue-200">
            Experiências Incríveis Te Esperam
          </span>
        </div>
        <h2 className="text-3xl font-bold mb-4">Monte Seu Roteiro Perfeito</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Descubra atividades avaliadas por outros viajantes e crie experiências inesquecíveis
        </p>
      </motion.div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar por atividades, locais ou experiências..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 focus:border-blue-500 rounded-xl"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="md:w-48 h-12 border-2 rounded-xl">
                <SelectValue placeholder="Filtrar categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {categoryLabels[category] || category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Available Activities */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group cursor-pointer"
                  onClick={() => addActivity(activity)}
                >
                  <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <CardContent className="p-0">
                      {activity.images?.[0] && (
                        <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl flex items-center justify-center">
                          <Camera className="h-12 w-12 text-white/60" />
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                              {activity.title}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {categoryLabels[activity.category] || activity.category}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{activity.average_rating?.toFixed(1) || "5.0"}</span>
                            </div>
                            {activity.price > 0 && (
                              <p className="text-green-600 font-bold">R$ {activity.price}</p>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {activity.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{activity.duration || "1-2h"}</span>
                          </div>
                          <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {filteredActivities.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">Nenhuma atividade encontrada</h4>
              <p className="text-gray-500">Tente ajustar os filtros ou termo de busca</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Activities */}
      {plannedActivities.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Atividades Selecionadas ({plannedActivities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plannedActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
                >
                  <div className="flex-1">
                    <h5 className="font-semibold">{activity.title}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {categoryLabels[activity.category] || activity.category}
                    </p>
                  </div>
                  
                  {activity.estimated_cost > 0 && (
                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-800">
                      R$ {activity.estimated_cost}
                    </Badge>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeActivity(activity.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Custo Total das Atividades:</span>
                  <span className="font-bold text-green-600 text-lg">
                    R$ {plannedActivities.reduce((sum, activity) => sum + (activity.estimated_cost || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {plannedActivities.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600"
        >
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-3">
            Seu roteiro está vazio
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Explore as atividades acima e monte o roteiro perfeito para sua viagem
          </p>
          <div className="inline-flex items-center gap-2 text-blue-600">
            <ArrowUp className="h-4 w-4" />
            <span className="font-medium">Clique em uma atividade para adicionar</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StepReview({ 
  form, 
  watchedValues, 
  plannedActivities, 
  selectedDestinationId 
}: { 
  form: any; 
  watchedValues: any; 
  plannedActivities: PlannedActivity[]; 
  selectedDestinationId: number | undefined; 
}) {
  const totalActivityCosts = plannedActivities.reduce((sum, activity) => 
    sum + (activity.estimated_cost || 0), 0
  );

  const tripDuration = watchedValues.start_date && watchedValues.end_date 
    ? Math.ceil((new Date(watchedValues.end_date).getTime() - new Date(watchedValues.start_date).getTime()) / (1000 * 3600 * 24))
    : 0;

  return (
    <div className="space-y-6">
      <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Quase Pronto!</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Revise todos os detalhes antes de criar sua viagem
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Detalhes Básicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Título</p>
              <p className="font-semibold">{watchedValues.title || "Sem título"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Destino</p>
              <p className="font-semibold">{watchedValues.destination || "Não selecionado"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Período</p>
              <p className="font-semibold">
                {watchedValues.start_date && watchedValues.end_date 
                  ? `${new Date(watchedValues.start_date).toLocaleDateString()} - ${new Date(watchedValues.end_date).toLocaleDateString()} (${tripDuration} dias)`
                  : "Datas não definidas"
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Planejamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Orçamento Total</p>
              <p className="font-semibold text-green-600">
                {watchedValues.budget ? `R$ ${watchedValues.budget.toLocaleString()}` : "Não definido"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Participantes</p>
              <p className="font-semibold">{watchedValues.max_participants || 0} pessoas</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Estilo</p>
              <p className="font-semibold capitalize">
                {watchedValues.travel_style 
                  ? `${TRAVEL_STYLE_SUGGESTIONS[watchedValues.travel_style as keyof typeof TRAVEL_STYLE_SUGGESTIONS]?.icon} ${watchedValues.travel_style}`
                  : "Não definido"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Atividades Planejadas ({plannedActivities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plannedActivities.length > 0 ? (
            <div className="space-y-3">
              {plannedActivities.slice(0, 3).map((activity, index) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-500 capitalize">{activity.category} • {activity.priority}</p>
                  </div>
                  {activity.estimated_cost && (
                    <Badge variant="secondary">R$ {activity.estimated_cost}</Badge>
                  )}
                </div>
              ))}
              {plannedActivities.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{plannedActivities.length - 3} atividades adicionais
                </p>
              )}
              <div className="flex items-center justify-between pt-3 border-t">
                <p className="font-medium">Custo Total das Atividades:</p>
                <p className="font-bold text-green-600">R$ {totalActivityCosts.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhuma atividade planejada ainda</p>
          )}
        </CardContent>
      </Card>

      {watchedValues.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Descrição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {watchedValues.description}
            </p>
          </CardContent>
        </Card>
      )}
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