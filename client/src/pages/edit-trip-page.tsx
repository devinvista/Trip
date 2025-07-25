import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Edit, 
  Trash2,
  AlertTriangle
} from "lucide-react";
import { getRealParticipantsCount } from "@/lib/trip-utils";

export default function EditTripPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const params = useParams();
  const tripId = parseInt(params.id as string);

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    maxParticipants: '',
    travelStyle: ''
  });

  // Fetch trip data
  const { data: trip, isLoading: tripLoading, error: tripError } = useQuery({
    queryKey: ['/api/trips', tripId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/trips/${tripId}`);
      return response.json();
    },
    enabled: !!tripId
  });

  // Update form when trip data loads
  useEffect(() => {
    if (trip) {
      // Check if user is the creator
      if (trip.creator_id !== user?.id) {
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Apenas o criador da viagem pode editá-la."
        });
        setLocation('/dashboard');
        return;
      }

      setFormData({
        title: trip.title || '',
        destination: trip.destination || '',
        description: trip.description || '',
        startDate: trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '',
        endDate: trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : '',
        budget: trip.budget?.toString() || '',
        maxParticipants: trip.max_participants?.toString() || '',
        travelStyle: trip.travelStyle || ''
      });
    }
  }, [trip, user?.id, setLocation, toast]);

  // Update trip mutation
  const updateTripMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PATCH', `/api/trips/${tripId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Viagem atualizada!",
        description: "As alterações foram salvas com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-trips'] });
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar viagem",
        description: error.message || "Tente novamente mais tarde."
      });
    }
  });

  // Delete trip mutation
  const deleteTripMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/trips/${tripId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Viagem excluída",
        description: "A viagem foi removida permanentemente."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-trips'] });
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir viagem",
        description: error.message || "Tente novamente mais tarde."
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.destination.trim() || !formData.startDate || !formData.endDate) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios."
      });
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast({
        variant: "destructive",
        title: "Datas inválidas",
        description: "A data de fim deve ser posterior à data de início."
      });
      return;
    }

    const data = {
      ...formData,
      budget: formData.budget ? parseInt(formData.budget) : 0,
      maxParticipants: formData.max_participants ? parseInt(formData.max_participants) : 2
    };

    updateTripMutation.mutate(data);
  };

  const handleDelete = () => {
    if (getRealParticipantsCount(trip) > 1) {
      toast({
        variant: "destructive",
        title: "Não é possível excluir",
        description: "A viagem tem outros participantes. Use 'Cancelar' no dashboard para transferir a organização."
      });
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir permanentemente a viagem "${trip?.title}"? Esta ação não pode ser desfeita.`
    );

    if (confirmed) {
      deleteTripMutation.mutate();
    }
  };

  if (tripLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (tripError || !trip) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Viagem não encontrada</h1>
              <Button onClick={() => setLocation('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/dashboard')}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Edit className="h-8 w-8 text-orange-500" />
                  Editar Viagem
                </h1>
                <p className="text-gray-600 mt-1">Atualize os detalhes da sua viagem</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Informações da Viagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título da Viagem *
                        </label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Ex: Aventura na Chapada Diamantina"
                          className="w-full"
                          required
                        />
                      </div>

                      {/* Destination */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Destino *
                        </label>
                        <Input
                          value={formData.destination}
                          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                          placeholder="Ex: Chapada Diamantina, BA"
                          className="w-full"
                          required
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descrição
                        </label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Descreva sua viagem, atividades planejadas, etc."
                          rows={4}
                          className="w-full"
                        />
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data de Início *
                          </label>
                          <Input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data de Fim *
                          </label>
                          <Input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            min={formData.startDate}
                            className="w-full"
                            required
                          />
                        </div>
                      </div>

                      {/* Budget and Participants */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Orçamento Total (R$)
                          </label>
                          <Input
                            type="number"
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            placeholder="2000"
                            min="0"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Máximo de Participantes
                          </label>
                          <Input
                            type="number"
                            value={formData.max_participants}
                            onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                            placeholder="6"
                            min={getRealParticipantsCount(trip) || 1}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Mínimo: {getRealParticipantsCount(trip)} (participantes atuais)
                          </p>
                        </div>
                      </div>

                      {/* Travel Style */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estilo de Viagem
                        </label>
                        <Select value={formData.travelStyle} onValueChange={(value) => setFormData({ ...formData, travelStyle: value })}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o estilo da viagem" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="praia">Praia</SelectItem>
                            <SelectItem value="neve">Neve</SelectItem>
                            <SelectItem value="cruzeiros">Cruzeiros</SelectItem>
                            <SelectItem value="natureza">Natureza e Ecoturismo</SelectItem>
                            <SelectItem value="culturais">Culturais e Históricas</SelectItem>
                            <SelectItem value="aventura">Aventura</SelectItem>
                            <SelectItem value="parques">Parques Temáticos</SelectItem>
                            <SelectItem value="urbanas">Viagens Urbanas / Cidades Grandes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button 
                          type="submit" 
                          disabled={updateTripMutation.isPending}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                        >
                          {updateTripMutation.isPending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Salvar Alterações
                            </>
                          )}
                        </Button>
                        
                        {trip?.current_participants === 1 && (
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={handleDelete}
                            disabled={deleteTripMutation.isPending}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            {deleteTripMutation.isPending ? (
                              <>
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                                Excluindo...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir Viagem
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Trip Stats */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Status da Viagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Participantes:</span>
                        <Badge variant="secondary">{getRealParticipantsCount(trip)}/{trip.max_participants}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge className="bg-green-500 hover:bg-green-600">Ativa</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Criada em:</span>
                        <span className="text-sm text-gray-500">
                          {new Date(trip.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Warning for creators */}
                {getRealParticipantsCount(trip) > 1 && (
                  <Card className="shadow-lg border-orange-200 bg-orange-50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-orange-800 mb-2">Atenção</h3>
                          <p className="text-sm text-orange-700">
                            Esta viagem tem outros participantes. Se você cancelar no dashboard, 
                            a organização será transferida para o participante mais antigo.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}