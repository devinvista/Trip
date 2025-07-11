
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { ProtectedRoute } from "@/lib/protected-route";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar, MapPin, Users, DollarSign, Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertTripSchema, expenseCategories, BudgetBreakdown } from "@shared/schema";
import { PlacesAutocomplete } from "@/components/places-autocomplete";
import { apiRequest } from "@/lib/queryClient";

const createTripSchema = insertTripSchema.extend({
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().min(1, "Data de fim é obrigatória"),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate > startDate;
}, {
  message: "A data de fim deve ser posterior à data de início",
  path: ["endDate"],
});

type CreateTripForm = z.input<typeof createTripSchema>;

function CreateTripPageContent() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);

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

  // Calculate total budget from breakdown
  const calculateTotalBudget = (breakdown: BudgetBreakdown): number => {
    return Object.values(breakdown).reduce((total, amount) => total + (amount || 0), 0);
  };

  // Calculate cost per person
  const calculateCostPerPerson = (totalBudget: number, participants: number): number => {
    return participants > 0 ? Math.round(totalBudget / participants) : 0;
  };

  const createTripMutation = useMutation({
    mutationFn: async (data: CreateTripForm) => {
      // Prepare trip data
      const tripData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        budget: data.budgetBreakdown 
          ? calculateTotalBudget(data.budgetBreakdown)
          : data.budget,
      };
      
      console.log('Enviando dados da viagem:', tripData);
      
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
      
      toast({
        title: "Viagem criada com sucesso!",
        description: "Sua viagem foi publicada e outros viajantes já podem se juntar.",
      });
      
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      console.error('Erro ao criar viagem:', error);
      toast({
        title: "Erro ao criar viagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateTripForm) => {
    console.log('Dados do formulário:', data);
    createTripMutation.mutate(data);
  };

  const travelStyles = [
    { value: "aventura", label: "Aventura" },
    { value: "relaxante", label: "Relaxante" },
    { value: "cultural", label: "Cultural" },
    { value: "mochilao", label: "Mochilão" },
    { value: "luxo", label: "Luxo" },
    { value: "gastronomia", label: "Gastronômico" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Plane className="h-8 w-8 text-primary" />
              <span className="font-bold text-2xl">Criar Nova Viagem</span>
            </div>
            <p className="text-gray-600">Planeje sua próxima aventura e encontre companheiros de viagem</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Viagem</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título da Viagem</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Aventura em Machu Picchu" {...field} />
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
                        <FormLabel>Destino</FormLabel>
                        <FormControl>
                          <PlacesAutocomplete
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Busque cidades como São Paulo, Rio de Janeiro..."
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
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva sua viagem, o que vocês vão fazer, onde ficar, etc."
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                                className="pl-10" 
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
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Budget Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Orçamento (Opcional)</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBudgetBreakdown(!showBudgetBreakdown)}
                      >
                        {showBudgetBreakdown ? "Orçamento Simples" : "Detalhamento de Gastos"}
                      </Button>
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
                                  className="pl-10" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                  value={field.value || ""}
                                />
                              </div>
                            </FormControl>
                            <p className="text-xs text-gray-500 mt-1">
                              {field.value && form.watch('maxParticipants') && (
                                <>Custo por pessoa: R$ {calculateCostPerPerson(field.value, form.watch('maxParticipants')).toLocaleString('pt-BR')}</>
                              )}
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <div className="space-y-4">
                        <FormLabel>Detalhamento de Gastos Totais da Viagem (R$)</FormLabel>
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
                                        className="pl-10 text-sm" 
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
                        
                        {/* Total calculation display */}
                        {form.watch('budgetBreakdown') && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <span className="font-medium text-blue-900">Total da Viagem:</span>
                              <span className="text-lg font-bold text-blue-900">
                                R$ {calculateTotalBudget(form.watch('budgetBreakdown') || {}).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            {form.watch('maxParticipants') && calculateTotalBudget(form.watch('budgetBreakdown') || {}) > 0 && (
                              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="font-medium text-green-900">Custo por Pessoa:</span>
                                <span className="text-lg font-bold text-green-900">
                                  R$ {calculateCostPerPerson(
                                    calculateTotalBudget(form.watch('budgetBreakdown') || {}), 
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
                              className="pl-10" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 4)}
                            />
                          </div>
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
                            <SelectTrigger>
                              <SelectValue placeholder="Escolha o estilo da viagem" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {travelStyles.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                {style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between pt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate("/dashboard")}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createTripMutation.isPending}
                      className="min-w-[120px]"
                    >
                      {createTripMutation.isPending ? "Criando..." : "Criar Viagem"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
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
