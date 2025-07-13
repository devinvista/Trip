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
import { Plus, Users, Clock, DollarSign, ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type ActivityBudgetProposal = {
  id: number;
  activityId: number;
  title: string;
  description: string;
  totalCost: number;
  currency: string;
  duration: string;
  minParticipants: number;
  maxParticipants: number;
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
}

type ProposalFormData = z.infer<typeof insertActivityBudgetProposalSchema>;

export function ActivityBudgetProposals({ 
  activityId, 
  onSelectProposal, 
  selectedProposalId 
}: ActivityBudgetProposalsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
  const { data: proposals, isLoading } = useQuery({
    queryKey: ['/api/activities', activityId, 'proposals'],
    queryFn: async () => {
      const response = await fetch(`/api/activities/${activityId}/proposals`);
      if (!response.ok) throw new Error('Falha ao buscar propostas');
      return response.json() as Promise<ActivityBudgetProposal[]>;
    }
  });

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Propostas de Orçamento</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Propostas de Orçamento</h3>
        {user && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Proposta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Proposta de Orçamento</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título da Proposta</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Pacote Premium" {...field} />
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
                          <FormLabel>Custo Total (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
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
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva o que está incluído nesta proposta..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Preço</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
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
                          <FormLabel>Moeda</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="inclusions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inclui (uma por linha)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Guia especializado&#10;Equipamentos&#10;Lanche"
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
                          <FormLabel>Não Inclui (uma por linha)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Transporte&#10;Alimentação&#10;Seguro"
                              {...field}
                              value={Array.isArray(field.value) ? field.value.join('\n') : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createProposal.isPending}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
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

      {!proposals || proposals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">
              Nenhuma proposta ainda
            </h4>
            <p className="text-gray-500 mb-4">
              Seja o primeiro a criar uma proposta de orçamento para esta atividade.
            </p>
            {user && (
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Proposta
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <Card 
              key={proposal.id} 
              className={`transition-all cursor-pointer ${
                selectedProposalId === proposal.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => onSelectProposal?.(proposal)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {proposal.title}
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {proposal.votes}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      por {proposal.creator.fullName} (@{proposal.creator.username})
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      R$ {proposal.amount?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {proposal.priceType === "per_person" ? "Por pessoa" : "Por grupo"}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">{proposal.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>R$ {proposal.amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="capitalize">
                      {proposal.priceType === "per_person" ? "Por pessoa" : "Por grupo"}
                    </Badge>
                  </div>
                </div>

                {(proposal.inclusions.length > 0 || proposal.exclusions.length > 0) && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {proposal.inclusions.length > 0 && (
                      <div>
                        <h5 className="font-medium text-green-700 mb-2">✅ Inclui:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {proposal.inclusions.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {proposal.exclusions.length > 0 && (
                      <div>
                        <h5 className="font-medium text-red-700 mb-2">❌ Não inclui:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {proposal.exclusions.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    {user && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(proposal.id, true);
                          }}
                          disabled={voteProposal.isPending}
                          className="flex items-center gap-1"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          Curtir
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(proposal.id, false);
                          }}
                          disabled={voteProposal.isPending}
                          className="flex items-center gap-1"
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {onSelectProposal && (
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                      {selectedProposalId === proposal.id ? "Selecionado" : "Selecionar"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}