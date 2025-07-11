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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
  User
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { expenseCategories, BudgetBreakdown } from "@shared/schema";
import { BudgetVisualization } from "@/components/budget-visualization";
import { ExpenseManager } from "@/components/expense-manager";

export default function TripDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [requestMessage, setRequestMessage] = useState("");

  const { data: trip, isLoading } = useQuery<any>({
    queryKey: ["/api/trips", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/trips/${id}`);
      if (!res.ok) throw new Error('Failed to fetch trip');
      return res.json();
    },
    enabled: !!id,
  });

  const { data: requests = [] } = useQuery<any[]>({
    queryKey: ["/api/trips", id, "requests"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/trips/${id}/requests`);
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    },
    enabled: !!trip && !!user && trip.creatorId === user?.id,
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
      // Redirect to dashboard after leaving
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
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

  const isCreator = trip.creatorId === user?.id;
  const isParticipant = trip.participants?.some((p: any) => p.userId === user?.id);
  const canJoin = !isCreator && !isParticipant && trip.currentParticipants < trip.maxParticipants;

  // Debug logs
  console.log('🔍 Trip Debug:', {
    tripId: trip.id,
    userId: user?.id,
    isCreator,
    isParticipant,
    canJoin,
    participants: trip.participants,
    participantsLength: trip.participants?.length
  });

  const costLabels: { [key: string]: string } = {
    hospedagem: "Hospedagem",
    transporte: "Transporte",
    alimentacao: "Alimentação",
    aluguel_carro: "Aluguel de carro",
    atividades: "Atividades",
    combustivel: "Combustível",
  };

  const travelStyleLabels: { [key: string]: string } = {
    praia: "Praia",
    neve: "Neve",
    cruzeiros: "Cruzeiros",
    natureza: "Natureza e Ecoturismo",
    cultural: "Culturais e Históricas",
    aventura: "Aventura",
    parques: "Parques Temáticos",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="font-bold text-3xl text-dark mb-2">{trip.title || "Viagem sem título"}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(trip.startDate), "dd/MM", { locale: ptBR })} - {format(new Date(trip.endDate), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({ title: "Link copiado!", description: "O link da viagem foi copiado para a área de transferência." });
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              {(isParticipant || isCreator) && (
                <Button asChild>
                  <a href={`/chat/${trip.id}`}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat do Grupo
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Badge className={trip.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {trip.status === 'open' ? 'Aberta para participação' : 'Lotada'}
            </Badge>
            <Badge variant="outline">
              {travelStyleLabels[trip.travelStyle] || trip.travelStyle}
            </Badge>
            <Badge variant="secondary">
              {trip.currentParticipants}/{trip.maxParticipants} participantes
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre a Viagem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{trip.description}</p>
              </CardContent>
            </Card>

            {/* Budget Visualization */}
            <BudgetVisualization 
              budget={trip.budget}
              budgetBreakdown={trip.budgetBreakdown}
              maxParticipants={trip.maxParticipants}
            />

            {/* Shared Costs */}
            {trip.sharedCosts && trip.sharedCosts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Custos Compartilhados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {trip.sharedCosts.map((cost: string) => (
                      <Badge key={cost} variant="secondary">
                        {costLabels[cost] || cost}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participantes ({trip.currentParticipants}/{trip.maxParticipants})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Creator */}
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                    <Avatar>
                      <AvatarImage src={trip.creator?.profilePhoto || ""} />
                      <AvatarFallback>
                        {trip.creator?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">{trip.creator?.fullName}</h4>
                      <p className="text-sm text-gray-600">Organizador</p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">Criador</Badge>
                  </div>

                  {/* Other Participants */}
                  {trip.participants?.filter((p: any) => p.userId !== trip.creatorId).map((participant: any) => (
                    <div key={participant.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={participant.user?.profilePhoto || ""} />
                        <AvatarFallback>
                          {participant.user?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{participant.user?.fullName}</h4>
                        <p className="text-sm text-gray-600">{participant.user?.location || "Localização não informada"}</p>
                      </div>
                    </div>
                  ))}

                  {/* Empty Slots */}
                  {Array.from({ length: trip.maxParticipants - trip.currentParticipants }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border border-dashed rounded-lg opacity-50">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-500">Vaga disponível</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expense Manager - only for participants */}
            {(isParticipant || isCreator) && (
              <ExpenseManager 
                tripId={parseInt(id || "0")} 
                participants={[
                  ...(trip.participants || []),
                  { userId: trip.creatorId, user: trip.creator, status: 'accepted' }
                ].filter(p => p.status === 'accepted')}
              />
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trip Requests (only for creator) */}
            {isCreator && requests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Solicitações de Participação</span>
                    <Badge variant="secondary">
                      {requests.filter((r: any) => r.status === 'pending').length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requests.filter((r: any) => r.status === 'pending').map((request: any) => (
                      <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={request.user?.profilePhoto || ""} />
                            <AvatarFallback>
                              {request.user?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{request.user?.fullName}</h4>
                              <Badge variant="outline" className="text-xs">
                                {request.user?.travelStyle || 'Sem estilo definido'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{request.user?.location || 'Localização não informada'}</p>
                            {request.message && (
                              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                <p className="text-sm text-gray-700 italic">"{request.message}"</p>
                              </div>
                            )}
                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                onClick={() => handleRequestMutation.mutate({ requestId: request.id, status: 'accepted' })}
                                disabled={handleRequestMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Aceitar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRequestMutation.mutate({ requestId: request.id, status: 'rejected' })}
                                disabled={handleRequestMutation.isPending}
                                className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Rejeitar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chat Preview for Participants */}
            {(isParticipant || isCreator) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Chat do Grupo</span>
                    <Button size="sm" asChild>
                      <a href={`/chat/${trip.id}`}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Abrir Chat
                      </a>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Converse com os outros participantes da viagem
                    </p>
                    <p className="text-xs text-gray-500">
                      Coordenem detalhes, compartilhem dicas e façam novos amigos!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trip Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Viagem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    {trip.budget ? (
                      <>
                        <p className="font-medium">R$ {trip.budget.toLocaleString('pt-BR')}</p>
                        <p className="text-sm text-gray-600">orçamento total da viagem</p>
                        <p className="text-sm font-medium text-primary mt-1">
                          R$ {Math.round(trip.budget / trip.maxParticipants).toLocaleString('pt-BR')} por pessoa
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">Orçamento não informado</p>
                    )}
                    
                    {/* Budget Breakdown Display */}
                    {trip.budgetBreakdown && typeof trip.budgetBreakdown === 'object' && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-gray-700">Detalhamento de Gastos (Total da Viagem):</p>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          {Object.entries(trip.budgetBreakdown).map(([key, value]) => {
                            if (!value || value === 0) return null;
                            const label = expenseCategories[key as keyof typeof expenseCategories] || key;
                            const perPersonCost = Math.round(Number(value) / trip.maxParticipants);
                            return (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">{label}:</span>
                                  <span className="font-medium">R$ {new Intl.NumberFormat('pt-BR').format(Number(value))}</span>
                                </div>
                                <div className="flex justify-end">
                                  <span className="text-primary text-xs">R$ {new Intl.NumberFormat('pt-BR').format(perPersonCost)} por pessoa</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(trip.startDate), "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-gray-600">Data de partida</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(trip.endDate), "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-gray-600">Data de retorno</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} dias
                    </p>
                    <p className="text-sm text-gray-600">Duração da viagem</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{trip.currentParticipants}/{trip.maxParticipants}</p>
                    <p className="text-sm text-gray-600">Participantes</p>
                  </div>
                </div>

                {/* Action Button */}
                {canJoin && !trip.userRequest && (
                  <div className="pt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          <Users className="h-4 w-4 mr-2" />
                          Solicitar Participação
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Solicitar Participação</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-800">
                              ✈️ <strong>{trip.title}</strong> - {trip.destination}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              {format(new Date(trip.startDate), "dd/MM", { locale: ptBR })} - {format(new Date(trip.endDate), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600">
                            Envie uma mensagem para o organizador explicando por que você gostaria de participar desta viagem.
                          </p>
                          <Textarea
                            placeholder="Olá! Gostaria muito de participar desta viagem porque..."
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            className="min-h-[100px]"
                            maxLength={500}
                          />
                          <div className="text-xs text-gray-500 text-right">
                            {requestMessage.length}/500 caracteres
                          </div>
                          <Button 
                            onClick={() => requestJoinMutation.mutate({ tripId: id!, message: requestMessage })}
                            disabled={requestJoinMutation.isPending || !requestMessage.trim()}
                            className="w-full"
                          >
                            {requestJoinMutation.isPending ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Enviando...
                              </>
                            ) : (
                              "Enviar Solicitação"
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {trip.userRequest && (
                  <div className="pt-4">
                    <Button disabled className="w-full bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      <Clock className="h-4 w-4 mr-2" />
                      Solicitação Enviada
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Aguardando resposta do organizador
                    </p>
                  </div>
                )}

                {isParticipant && !isCreator && (
                  <div className="pt-4 space-y-2">
                    <Button className="w-full" asChild>
                      <a href={`/chat/${trip.id}`}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Abrir Chat
                      </a>
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                          <X className="h-4 w-4 mr-2" />
                          Desistir da Viagem
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-red-600">Desistir da Viagem</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="bg-red-50 p-3 rounded-lg">
                            <p className="text-sm text-red-800">
                              ⚠️ <strong>Atenção!</strong> Esta ação não pode ser desfeita.
                            </p>
                          </div>
                          <p className="text-sm text-gray-600">
                            Você está prestes a sair da viagem <strong>"{trip.title}"</strong>. 
                            Após confirmar, você será removido da lista de participantes e não terá mais acesso ao chat e às informações da viagem.
                          </p>
                          <p className="text-xs text-gray-500">
                            Se desejar participar novamente, precisará enviar uma nova solicitação ao organizador.
                          </p>
                          <div className="flex gap-2">
                            <DialogTrigger asChild>
                              <Button variant="outline" className="flex-1">
                                Cancelar
                              </Button>
                            </DialogTrigger>
                            <Button 
                              onClick={() => quitTripMutation.mutate()}
                              disabled={quitTripMutation.isPending}
                              variant="destructive"
                              className="flex-1"
                            >
                              {quitTripMutation.isPending ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                  Saindo...
                                </>
                              ) : (
                                "Confirmar Saída"
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {trip.currentParticipants >= trip.maxParticipants && !isParticipant && !isCreator && (
                  <div className="pt-4">
                    <Button disabled className="w-full">
                      Viagem Lotada
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
