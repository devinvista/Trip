import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ActivityBudgetProposals } from "./activity-budget-proposals";
import { Plane, MapPin, Calendar, Users, DollarSign, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type Activity = {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  images: string[];
};

type Trip = {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  maxParticipants: number;
  budget: number;
};

type ActivityBudgetProposal = {
  id: number;
  activityId: number;
  title: string;
  description: string;
  amount: number;
  currency: string;
  priceType: string;
  inclusions: string[];
  exclusions: string[];
  votes: number;
  creator: {
    id: number;
    username: string;
    fullName: string;
  };
};

interface AddActivityToTripProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
  selectedProposals?: ActivityBudgetProposal[];
}

export function AddActivityToTrip({ activity, isOpen, onClose, selectedProposals = [] }: AddActivityToTripProps) {
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<ActivityBudgetProposal | null>(null);
  const [step, setStep] = useState<'trip' | 'proposal' | 'confirm'>('trip');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user trips in same location as activity (like in the trip page)
  const { data: userTrips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ['/api/users', user?.id, 'trips-in-location', activity.location],
    queryFn: async () => {
      if (!user) return [];
      const response = await fetch(`/api/users/${user.id}/trips-in-location?location=${encodeURIComponent(activity.location)}`);
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error('Falha ao buscar viagens');
      }
      const result = await response.json();
      console.log('🔍 AddActivityToTrip trips in location result:', result);
      return result;
    },
    enabled: !!user && isOpen
  });

  // Add activity to trip mutation
  const addActivityToTrip = useMutation({
    mutationFn: async () => {
      if (!selectedTripId) {
        throw new Error('Selecione uma viagem');
      }

      const selectedTrip = Array.isArray(userTrips) ? userTrips.find(trip => trip.id === selectedTripId) : undefined;
      if (!selectedTrip) {
        throw new Error('Viagem não encontrada');
      }

      // Use pre-selected proposals or single selected proposal
      const proposalsToAdd = selectedProposals && selectedProposals.length > 0 
        ? selectedProposals 
        : selectedProposal 
        ? [selectedProposal] 
        : [];

      if (proposalsToAdd.length === 0) {
        throw new Error('Selecione pelo menos uma proposta');
      }

      // Add each proposal as separate activity
      const promises = proposalsToAdd.map(async (proposal) => {
        const participants = selectedTrip.maxParticipants || 1;
        const amount = typeof proposal.amount === 'number' ? proposal.amount : parseFloat(proposal.amount || '0');
        const totalCost = proposal.priceType === "per_person" 
          ? amount * participants
          : amount;

        console.log('🔍 Calculando custo da atividade:', {
          proposalAmount: proposal.amount,
          priceType: proposal.priceType,
          participants,
          totalCost
        });

        const response = await fetch(`/api/trips/${selectedTripId}/activities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activityId: activity.id,
            budgetProposalId: proposal.id,
            participants,
            totalCost,
            notes: `Atividade adicionada: ${activity.title} - ${proposal.title}`
          })
        });

        if (!response.ok) throw new Error('Falha ao adicionar atividade');
        return response.json();
      });

      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      
      const proposalsCount = selectedProposals && selectedProposals.length > 0 
        ? selectedProposals.length 
        : 1;
      
      toast({ 
        title: "Atividade adicionada com sucesso!", 
        description: `${activity.title} foi adicionada à sua viagem${proposalsCount > 1 ? ` com ${proposalsCount} propostas de orçamento` : ''}.` 
      });
      handleClose();
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao adicionar atividade", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleClose = () => {
    setStep('trip');
    setSelectedTripId(null);
    setSelectedProposal(null);
    onClose();
  };

  const handleTripSelect = (tripId: string) => {
    setSelectedTripId(parseInt(tripId));
    // If we have pre-selected proposals, skip to confirm step
    if (selectedProposals && selectedProposals.length > 0) {
      setStep('confirm');
    } else {
      setStep('proposal');
    }
  };

  const handleProposalSelect = (proposal: ActivityBudgetProposal) => {
    setSelectedProposal(proposal);
    setStep('confirm');
  };

  const handleConfirm = () => {
    addActivityToTrip.mutate();
  };

  const selectedTrip = Array.isArray(userTrips) ? userTrips.find(trip => trip.id === selectedTripId) : undefined;
  
  // Debug logging
  if (isOpen && user) {
    console.log('🔍 AddActivityToTrip Debug:', {
      userTrips: userTrips,
      isArray: Array.isArray(userTrips),
      length: Array.isArray(userTrips) ? userTrips.length : 'not array',
      tripsLoading
    });
  }

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Faça login para adicionar atividades</DialogTitle>
            <DialogDescription>
              Você precisa estar logado para adicionar atividades às suas viagens
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Você precisa estar logado para adicionar atividades às suas viagens.
            </p>
            <Button onClick={handleClose}>Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Adicionar {activity.title} à Viagem
          </DialogTitle>
          <DialogDescription>
            Selecione uma viagem para adicionar esta atividade
          </DialogDescription>
        </DialogHeader>

        {step === 'trip' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <MapPin className="h-4 w-4" />
              <span>Buscando suas viagens em {activity.location}</span>
            </div>

            {tripsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !Array.isArray(userTrips) || userTrips.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">
                    Nenhuma viagem encontrada
                  </h4>
                  <p className="text-gray-500 mb-4">
                    Você não tem viagens programadas para {activity.location}.
                  </p>
                  <p className="text-sm text-gray-400">
                    Para adicionar esta atividade, crie uma viagem para este destino primeiro.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <h3 className="font-semibold">Selecione uma viagem:</h3>
                <div className="grid gap-3">
                  {Array.isArray(userTrips) && userTrips.map((trip) => (
                    <Card 
                      key={trip.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleTripSelect(trip.id.toString())}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={trip.coverImage} 
                            alt={trip.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{trip.title}</h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {trip.destination}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(trip.startDate).toLocaleDateString('pt-BR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                até {trip.maxParticipants} pessoas
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                R$ {trip.budget.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Selecionar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'proposal' && selectedTrip && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setStep('trip')}
              >
                ← Voltar
              </Button>
              <div>
                <h3 className="font-semibold">{selectedTrip.title}</h3>
                <p className="text-sm text-gray-600">{selectedTrip.destination}</p>
              </div>
            </div>

            <ActivityBudgetProposals 
              activityId={activity.id}
              onSelectProposal={handleProposalSelect}
            />
          </div>
        )}

        {step === 'confirm' && selectedTrip && ((selectedProposals && selectedProposals.length > 0) || selectedProposal) && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setStep('proposal')}
              >
                ← Voltar
              </Button>
              <h3 className="font-semibold">Confirmar Adição</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Trip Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Viagem Selecionada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src={selectedTrip.coverImage} 
                      alt={selectedTrip.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">{selectedTrip.title}</h4>
                      <p className="text-sm text-gray-600">{selectedTrip.destination}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        {new Date(selectedTrip.startDate).toLocaleDateString('pt-BR')} - {' '}
                        {new Date(selectedTrip.endDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>Orçamento: R$ {selectedTrip.budget.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Proposal Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedProposals && selectedProposals.length > 0 
                      ? `Propostas Selecionadas (${selectedProposals.length})`
                      : 'Proposta Selecionada'
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedProposals && selectedProposals.length > 0 ? (
                    <div className="space-y-3">
                      {selectedProposals.map((proposal, index) => {
                        const amount = typeof proposal.amount === 'number' ? proposal.amount : parseFloat(proposal.amount || '0');
                        const totalCost = proposal.priceType === "per_person" 
                          ? amount * selectedTrip.maxParticipants
                          : amount;
                        
                        return (
                          <div key={proposal.id} className="border rounded-lg p-3 bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-sm">{proposal.title}</h4>
                                <p className="text-xs text-gray-600">{proposal.description}</p>
                              </div>
                              <span className="text-sm font-semibold text-blue-600">
                                R$ {totalCost.toFixed(2)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {proposal.priceType === "per_person" ? "Por pessoa" : "Por grupo"}
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold">Custo Total:</span>
                        <span className="font-semibold text-green-600">
                          R$ {selectedProposals.reduce((total, proposal) => {
                            const amount = typeof proposal.amount === 'number' ? proposal.amount : parseFloat(proposal.amount || '0');
                            const cost = proposal.priceType === "per_person" 
                              ? amount * selectedTrip.maxParticipants
                              : amount;
                            return total + cost;
                          }, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : selectedProposal && (
                    <div>
                      <div className="mb-4">
                        <h4 className="font-semibold">{selectedProposal.title}</h4>
                        <p className="text-sm text-gray-600">{selectedProposal.description}</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Valor Base:</span>
                          <span className="font-semibold text-blue-600">
                            R$ {(typeof selectedProposal.amount === 'number' ? selectedProposal.amount : parseFloat(selectedProposal.amount || '0')).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tipo de Preço:</span>
                          <span className="capitalize">{selectedProposal.priceType === "per_person" ? "Por Pessoa" : "Por Grupo"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Participantes:</span>
                          <span>{selectedTrip.maxParticipants}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Custo Total:</span>
                          <span className="font-semibold text-green-600">
                            R$ {(selectedProposal.priceType === "per_person" 
                              ? (typeof selectedProposal.amount === 'number' ? selectedProposal.amount : parseFloat(selectedProposal.amount || '0')) * selectedTrip.maxParticipants
                              : (typeof selectedProposal.amount === 'number' ? selectedProposal.amount : parseFloat(selectedProposal.amount || '0'))).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Resumo da Adição</h4>
              <p className="text-sm text-blue-800">
                A atividade <strong>{activity.title}</strong> será adicionada à viagem{' '}
                <strong>{selectedTrip.title}</strong> com{' '}
                {selectedProposals && selectedProposals.length > 0 
                  ? `${selectedProposals.length} propostas de orçamento`
                  : selectedProposal ? `a proposta ${selectedProposal.title}` : 'a proposta selecionada'
                } no valor total de <strong>R$ {
                  selectedProposals && selectedProposals.length > 0 
                    ? selectedProposals.reduce((total, proposal) => {
                        const amount = typeof proposal.amount === 'number' ? proposal.amount : parseFloat(proposal.amount || '0');
                        const cost = proposal.priceType === "per_person" 
                          ? amount * selectedTrip.maxParticipants
                          : amount;
                        return total + cost;
                      }, 0).toFixed(2)
                    : selectedProposal 
                      ? (selectedProposal.priceType === "per_person" 
                          ? (typeof selectedProposal.amount === 'number' ? selectedProposal.amount : parseFloat(selectedProposal.amount || '0')) * selectedTrip.maxParticipants
                          : (typeof selectedProposal.amount === 'number' ? selectedProposal.amount : parseFloat(selectedProposal.amount || '0'))).toFixed(2)
                      : '0.00'
                }</strong>.
              </p>
              <div className="mt-2 text-xs text-blue-700">
                <span className="font-medium">Detalhes:</span> {
                  selectedProposals && selectedProposals.length > 0 
                    ? `${selectedProposals.length} propostas serão adicionadas para ${selectedTrip.maxParticipants} participantes`
                    : selectedProposal 
                      ? (selectedProposal.priceType === "per_person" 
                          ? `R$ ${(typeof selectedProposal.amount === 'number' ? selectedProposal.amount : parseFloat(selectedProposal.amount || '0')).toFixed(2)} por pessoa × ${selectedTrip.maxParticipants} participantes`
                          : `R$ ${(typeof selectedProposal.amount === 'number' ? selectedProposal.amount : parseFloat(selectedProposal.amount || '0')).toFixed(2)} valor fixo por grupo`)
                      : 'Nenhuma proposta selecionada'
                }
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep('proposal')}>
                Alterar Proposta
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={addActivityToTrip.isPending}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {addActivityToTrip.isPending ? "Adicionando..." : "Confirmar Adição"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}