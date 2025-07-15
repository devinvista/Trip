import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertActivityBudgetProposalSchema } from "@shared/schema";
import type { z } from "zod";
import { Plus, DollarSign, ThumbsUp, ThumbsDown, Check, User, Package, Star, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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
  isActive: boolean;
  createdAt: string;
  creator: {
    id: number;
    username: string;
    fullName: string;
  };
};

interface ActivityBudgetProposalsProps {
  activityId: number;
  onSelectProposal?: (proposal: ActivityBudgetProposal) => void;
  selectedProposalId?: number;
  allowMultipleSelection?: boolean;
  onProposalsChange?: (proposals: ActivityBudgetProposal[]) => void;
  includedProposalIds?: number[]; // IDs das propostas já incluídas nas viagens do usuário
}

type ProposalFormData = z.infer<typeof insertActivityBudgetProposalSchema>;

export function ActivityBudgetProposals({ 
  activityId, 
  onSelectProposal, 
  selectedProposalId,
  allowMultipleSelection = false,
  onProposalsChange,
  includedProposalIds = []
}: ActivityBudgetProposalsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProposals, setSelectedProposals] = useState<ActivityBudgetProposal[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(insertActivityBudgetProposalSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      currency: "BRL",
      priceType: "per_person",
      inclusions: [],
      exclusions: []
    }
  });

  // Fetch proposals
  const { data: proposalsData, isLoading } = useQuery({
    queryKey: ['/api/activities', activityId, 'proposals'],
    queryFn: async () => {
      const response = await fetch(`/api/activities/${activityId}/proposals`);
      if (!response.ok) throw new Error('Falha ao buscar propostas');
      return response.json() as Promise<ActivityBudgetProposal[]>;
    }
  });

  // Filter unique proposals to avoid duplicate keys
  const proposals = proposalsData ? proposalsData.filter((proposal, index, arr) => 
    arr.findIndex(p => p.id === proposal.id) === index
  ) : [];

  // Create proposal mutation
  const createProposal = useMutation({
    mutationFn: async (data: ProposalFormData) => {
      const response = await fetch(`/api/activities/${activityId}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Falha ao criar proposta');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities', activityId, 'proposals'] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Proposta criada com sucesso!" });
    },
    onError: () => {
      toast({ 
        title: "Erro ao criar proposta", 
        description: "Tente novamente mais tarde",
        variant: "destructive" 
      });
    }
  });

  // Vote mutation
  const voteProposal = useMutation({
    mutationFn: async ({ proposalId, increment }: { proposalId: number; increment: boolean }) => {
      const response = await fetch(`/api/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ increment })
      });
      if (!response.ok) throw new Error('Falha ao votar');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities', activityId, 'proposals'] });
    },
    onError: () => {
      toast({ 
        title: "Erro ao votar", 
        description: "Tente novamente mais tarde",
        variant: "destructive" 
      });
    }
  });

  const onSubmit = (data: ProposalFormData) => {
    // Parse inclusions and exclusions from textarea
    const inclusions = data.inclusions as any;
    const exclusions = data.exclusions as any;
    
    const processedData = {
      ...data,
      inclusions: typeof inclusions === 'string' 
        ? inclusions.split('\n').filter(Boolean) 
        : (Array.isArray(inclusions) ? inclusions : []),
      exclusions: typeof exclusions === 'string' 
        ? exclusions.split('\n').filter(Boolean) 
        : (Array.isArray(exclusions) ? exclusions : []),
    };
    
    console.log('🔍 Dados processados para envio:', processedData);
    
    createProposal.mutate(processedData);
  };

  const handleVote = (proposalId: number, increment: boolean) => {
    if (!user) {
      toast({ 
        title: "Faça login para votar", 
        variant: "destructive" 
      });
      return;
    }
    voteProposal.mutate({ proposalId, increment });
  };

  // Handle multiple proposal selection
  const handleProposalToggle = (proposal: ActivityBudgetProposal, selected: boolean) => {
    if (!allowMultipleSelection) {
      onSelectProposal?.(proposal);
      return;
    }

    let newSelected: ActivityBudgetProposal[];
    if (selected) {
      newSelected = [...selectedProposals, proposal];
    } else {
      newSelected = selectedProposals.filter(p => p.id !== proposal.id);
    }
    
    setSelectedProposals(newSelected);
    onProposalsChange?.(newSelected);
  };

  const isProposalSelected = (proposalId: number) => {
    if (!allowMultipleSelection) {
      return selectedProposalId === proposalId;
    }
    return selectedProposals.some(p => p.id === proposalId);
  };

  const calculateSelectedTotal = () => {
    return selectedProposals.reduce((total, proposal) => {
      return total + (Number(proposal.amount) || 0);
    }, 0);
  };

  // Helper function to safely parse JSON arrays
  const safeParseArray = (data: any): string[] => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        let parsed = JSON.parse(data);
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Calculate best value proposal
  const getBestValueProposal = () => {
    if (!proposals || proposals.length === 0) return null;
    return proposals.reduce((best, current) => {
      if (!best) return current;
      const bestScore = best.votes / (Number(best.amount) || 1);
      const currentScore = current.votes / (Number(current.amount) || 1);
      return currentScore > bestScore ? current : best;
    }, null as ActivityBudgetProposal | null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Propostas de Orçamento</h3>
            <p className="text-gray-600">Compare as opções disponíveis para esta atividade</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const bestValue = getBestValueProposal();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Propostas de Orçamento</h3>
          <p className="text-gray-600">Compare as opções disponíveis para esta atividade</p>
        </div>
        {user && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Nova Proposta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Criar Nova Proposta de Orçamento</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Título da Proposta</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Pacote Premium" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Valor (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
                              className="h-11"
                              {...field}
                              onChange={e => {
                                const value = e.target.value;
                                field.onChange(value === '' ? 0 : parseFloat(value) || 0);
                              }}
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
                        <FormLabel className="text-sm font-medium">Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva o que está incluído nesta proposta..."
                            className="min-h-[100px]"
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
                      name="priceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Tipo de Preço</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="per_person">Por pessoa</SelectItem>
                                <SelectItem value="per_group">Por grupo</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Moeda</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Selecione a moeda" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="BRL">Real (BRL)</SelectItem>
                                <SelectItem value="USD">Dólar (USD)</SelectItem>
                                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="inclusions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Inclui (uma por linha)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Guia especializado&#10;Equipamentos&#10;Lanche"
                              className="min-h-[120px]"
                              {...field}
                              value={Array.isArray(field.value) ? field.value.join('\n') : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="exclusions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Não Inclui (uma por linha)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Transporte&#10;Alimentação&#10;Seguro"
                              className="min-h-[120px]"
                              {...field}
                              value={Array.isArray(field.value) ? field.value.join('\n') : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="h-11"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createProposal.isPending}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-11"
                    >
                      {createProposal.isPending ? "Criando..." : "Criar Proposta"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Statistics Bar */}
      {proposals && proposals.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{proposals.length}</div>
              <div className="text-sm text-gray-600">Propostas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                R$ {Math.min(...proposals.map(p => Number(p.amount) || 0)).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Menor Preço</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                R$ {Math.max(...proposals.map(p => Number(p.amount) || 0)).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Maior Preço</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(proposals.reduce((sum, p) => sum + (p.votes || 0), 0) / proposals.length)}
              </div>
              <div className="text-sm text-gray-600">Votos Médios</div>
            </div>
          </div>
        </div>
      )}

      {/* Proposals Grid */}
      {!proposals || proposals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <DollarSign className="h-12 w-12 text-gray-400" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhuma proposta ainda
          </h4>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Seja o primeiro a criar uma proposta de orçamento para esta atividade e ajude outros viajantes.
          </p>
          {user && (
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Proposta
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map((proposal, index) => {
            const inclusions = safeParseArray(proposal.inclusions);
            const exclusions = safeParseArray(proposal.exclusions);
            const isBestValue = bestValue?.id === proposal.id;
            const isSelected = allowMultipleSelection 
              ? selectedProposals.some(p => p.id === proposal.id)
              : selectedProposalId === proposal.id;
            
            return (
              <motion.div
                key={`proposal-${proposal.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`relative h-full transition-all duration-300 cursor-pointer group ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 shadow-lg transform scale-[1.02]' 
                      : 'hover:shadow-lg hover:transform hover:scale-[1.01]'
                  } ${isBestValue ? 'border-green-500 border-2' : ''}`}
                  onClick={() => onSelectProposal?.(proposal)}
                >
                  {/* Best Value Badge */}
                  {isBestValue && (
                    <div className="absolute -top-3 left-4 right-4">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full text-center shadow-lg">
                        <Star className="h-3 w-3 inline mr-1" />
                        Melhor Custo-Benefício
                      </div>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                          {proposal.title}
                          {isSelected && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <User className="h-4 w-4" />
                          <span>{proposal.creator.fullName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price Display */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          R$ {Number(proposal.amount || 0).toFixed(2)}
                        </div>
                        <Badge variant="outline" className="capitalize text-xs">
                          {proposal.priceType === "per_person" ? "Por pessoa" : "Por grupo"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {proposal.description}
                    </p>

                    {/* Inclusions */}
                    {inclusions.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-green-700 text-sm mb-2 flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          Inclui:
                        </h5>
                        <div className="space-y-1">
                          {inclusions.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              <span className="line-clamp-1">{item}</span>
                            </div>
                          ))}
                          {inclusions.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{inclusions.length - 3} itens
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Voting and Selection */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        {user && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(proposal.id, true);
                            }}
                            disabled={voteProposal.isPending}
                            className="h-8 px-2 flex items-center gap-1"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span className="text-xs">{proposal.votes}</span>
                          </Button>
                        )}
                        {!user && (
                          <Badge variant="secondary" className="text-xs">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {proposal.votes}
                          </Badge>
                        )}
                      </div>
                      
                      {(onSelectProposal || allowMultipleSelection) && (
                        <Button 
                          size="sm"
                          variant={
                            includedProposalIds.includes(proposal.id) 
                              ? "secondary" 
                              : isSelected 
                              ? "default" 
                              : "outline"
                          }
                          className={
                            includedProposalIds.includes(proposal.id)
                              ? "h-8 bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
                              : isSelected 
                              ? "bg-blue-600 hover:bg-blue-700 text-white h-8" 
                              : "h-8 hover:bg-blue-50 hover:border-blue-300"
                          }
                          disabled={includedProposalIds.includes(proposal.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!includedProposalIds.includes(proposal.id)) {
                              handleProposalToggle(proposal, !isSelected);
                            }
                          }}
                        >
                          {includedProposalIds.includes(proposal.id) ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Já incluído
                            </>
                          ) : isSelected ? (
                            allowMultipleSelection ? "Selecionado" : "Selecionado"
                          ) : (
                            allowMultipleSelection ? "Adicionar" : "Selecionar"
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Selected Proposals Summary */}
      {allowMultipleSelection && selectedProposals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-green-800 flex items-center gap-2">
              <Check className="h-5 w-5" />
              Propostas Selecionadas
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedProposals([]);
                onProposalsChange?.([]);
              }}
              className="text-green-700 hover:text-green-800"
            >
              Limpar
            </Button>
          </div>
          
          <div className="space-y-3">
            {selectedProposals.map((proposal, idx) => (
              <div key={`selected-${proposal.id}-${idx}`} className="flex items-center justify-between bg-white/60 rounded-lg p-3">
                <div>
                  <div className="font-medium text-sm">{proposal.title}</div>
                  <div className="text-xs text-gray-600">
                    {proposal.priceType === "per_person" ? "Por pessoa" : "Por grupo"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-700">
                    R$ {Number(proposal.amount || 0).toFixed(2)}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleProposalToggle(proposal, false)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-green-200 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-green-800">
                Total: {selectedProposals.length} proposta{selectedProposals.length !== 1 ? 's' : ''}
              </span>
              <span className="text-2xl font-bold text-green-700">
                R$ {calculateSelectedTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}