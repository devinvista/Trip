import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Receipt, DollarSign, Users, Calculator, TrendingDown, TrendingUp, Check, X, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { expenseCategories } from "@shared/schema";
import { formatBrazilianCurrency, formatBrazilianNumber } from "@shared/utils";

interface ExpenseManagerProps {
  tripId: number;
  participants: any[];
}

export function ExpenseManager({ tripId, participants }: ExpenseManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    category: "other",
    splitWith: participants.map(p => p.userId),
    receipt: null as string | null,
    splitEqually: true,
  });

  // Fetch expenses
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['/api/trips', tripId, 'expenses'],
    queryFn: async () => {
      const response = await fetch(`/api/trips/${tripId}/expenses`);
      if (!response.ok) throw new Error('Falha ao buscar despesas');
      return response.json();
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
  });

  // Fetch balances
  const { data: balances = [], isLoading: balancesLoading, error: balancesError, refetch: refetchBalances } = useQuery({
    queryKey: ['/api/trips', tripId, 'balances'],
    queryFn: async () => {
      const response = await fetch(`/api/trips/${tripId}/balances`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Falha ao buscar balanços');
      const data = await response.json();
      return data;
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      const response = await apiRequest('POST', `/api/trips/${tripId}/expenses`, expenseData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both queries to ensure data refresh
      queryClient.invalidateQueries({ queryKey: ['/api/trips', tripId, 'expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trips', tripId, 'balances'] });
      
      // Also refetch immediately
      queryClient.refetchQueries({ queryKey: ['/api/trips', tripId, 'expenses'] });
      queryClient.refetchQueries({ queryKey: ['/api/trips', tripId, 'balances'] });
      
      setIsAddingExpense(false);
      setNewExpense({
        amount: "",
        description: "",
        category: "other",
        splitWith: participants.map(p => p.userId),
        receipt: null,
        splitEqually: true,
      });
      toast({
        title: "Despesa adicionada",
        description: "A despesa foi registrada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar despesa",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update expense split mutation
  const updateSplitMutation = useMutation({
    mutationFn: async ({ splitId, paid }: { splitId: number; paid: boolean }) => {
      const response = await apiRequest('PATCH', `/api/expense-splits/${splitId}`, { paid });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch both queries
      queryClient.invalidateQueries({ queryKey: ['/api/trips', tripId, 'expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trips', tripId, 'balances'] });
      queryClient.refetchQueries({ queryKey: ['/api/trips', tripId, 'expenses'] });
      queryClient.refetchQueries({ queryKey: ['/api/trips', tripId, 'balances'] });
    },
  });

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o valor e a descrição.",
        variant: "destructive",
      });
      return;
    }

    createExpenseMutation.mutate({
      amount: parseFloat(newExpense.amount.replace(',', '.')),
      description: newExpense.description,
      category: newExpense.category,
      splitWith: newExpense.splitEqually ? 'all' : newExpense.splitWith,
      receipt: newExpense.receipt,
    });
  };

  const handleSplitParticipantToggle = (userId: number) => {
    setNewExpense(prev => ({
      ...prev,
      splitWith: prev.splitWith.includes(userId)
        ? prev.splitWith.filter(id => id !== userId)
        : [...prev.splitWith, userId]
    }));
  };

  const formatCurrency = (amount: number) => {
    return formatBrazilianCurrency(amount);
  };

  // Calculate who owes whom
  const calculateSettlements = () => {
    const settlements: { from: any; to: any; amount: number }[] = [];
    // Create copies of balances to avoid modifying the original data
    const creditors = balances.filter(b => b.balance > 0).map(b => ({ ...b })).sort((a, b) => b.balance - a.balance);
    const debtors = balances.filter(b => b.balance < 0).map(b => ({ ...b })).sort((a, b) => a.balance - b.balance);

    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const credit = creditors[i].balance;
      const debt = Math.abs(debtors[j].balance);
      const settlementAmount = Math.min(credit, debt);

      settlements.push({
        from: debtors[j].user,
        to: creditors[i].user,
        amount: settlementAmount,
      });

      creditors[i].balance -= settlementAmount;
      debtors[j].balance += settlementAmount;

      if (creditors[i].balance === 0) i++;
      if (debtors[j].balance === 0) j++;
    }

    return settlements;
  };

  const settlements = calculateSettlements();

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Resumo de Saldos
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetchBalances()}
              disabled={balancesLoading}
            >
              <RefreshCw className={`h-4 w-4 ${balancesLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
          <div className="text-sm text-gray-600 mt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>Verde: Valor a receber</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span>Vermelho: Valor a pagar</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {balancesLoading ? (
            <div className="text-center py-4">Carregando saldos...</div>
          ) : balances.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhum saldo encontrado. Adicione algumas despesas para ver os saldos.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {balances.map((balance) => (
                  <div key={balance.userId} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={balance.user.profilePhoto || ""} />
                      <AvatarFallback>
                        {balance.user.fullName?.substring(0, 2).toUpperCase() || balance.user.username?.substring(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{balance.user.fullName || balance.user.username}</p>
                      <p className={`text-sm font-semibold ${
                        balance.balance > 0 ? 'text-green-600' : balance.balance < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {balance.balance > 0 && '+ '}
                        {formatCurrency(balance.balance)}
                      </p>

                      <p className="text-xs text-gray-500">
                        {balance.balance > 0 ? 'Tem a receber' : balance.balance < 0 ? 'Tem a pagar' : 'Sem pendências'}
                      </p>
                    </div>
                    {balance.balance > 0 && <TrendingUp className="h-4 w-4 text-green-600" />}
                    {balance.balance < 0 && <TrendingDown className="h-4 w-4 text-red-600" />}
                  </div>
                ))}
              </div>

              {settlements.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Acertos Sugeridos
                    </h4>
                    <div className="space-y-2">
                      {settlements.map((settlement, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{settlement.from.fullName}</span>
                          <span className="text-gray-600">deve</span>
                          <span className="font-semibold text-primary">{formatCurrency(settlement.amount)}</span>
                          <span className="text-gray-600">para</span>
                          <span className="font-medium">{settlement.to.fullName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Button */}
      <div className="flex justify-end">
        <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Despesa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="O que foi pago?"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(expenseCategories).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Dividir com:</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="split-equally"
                      checked={newExpense.splitEqually}
                      onCheckedChange={(checked) => setNewExpense(prev => ({ ...prev, splitEqually: checked as boolean }))}
                    />
                    <Label htmlFor="split-equally" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Dividir igualmente entre todos os participantes</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Incluindo futuros participantes que entrarem na viagem
                      </p>
                    </Label>
                  </div>
                  
                  {!newExpense.splitEqually && (
                    <ScrollArea className="h-32 border rounded-lg p-3">
                      <div className="space-y-2">
                        {participants.map((participant) => (
                          <div key={participant.userId} className="flex items-center gap-2">
                            <Checkbox
                              id={`split-${participant.userId}`}
                              checked={newExpense.splitWith.includes(participant.userId)}
                              onCheckedChange={() => handleSplitParticipantToggle(participant.userId)}
                            />
                            <Label
                              htmlFor={`split-${participant.userId}`}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={participant.user.profilePhoto || ""} />
                                <AvatarFallback className="text-xs">
                                  {participant.user.fullName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{participant.user.fullName}</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingExpense(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddExpense}
                  disabled={createExpenseMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {createExpenseMutation.isPending ? "Adicionando..." : "Adicionar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Despesas da Viagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expensesLoading ? (
            <div className="text-center py-4">Carregando despesas...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Nenhuma despesa registrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{expense.description}</h4>
                      <p className="text-sm text-gray-600">
                        Pago por {expense.payer.fullName} • {format(new Date(expense.createdAt), "dd 'de' MMM", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{formatCurrency(expense.amount)}</p>
                      <Badge variant="secondary" className="text-xs">
                        {expenseCategories[expense.category as keyof typeof expenseCategories]}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div>
                    <p className="text-sm font-medium mb-2">Divisão:</p>
                    <div className="space-y-1">
                      {expense.splits.map((split) => (
                        <div key={split.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={split.user.profilePhoto || ""} />
                              <AvatarFallback className="text-xs">
                                {split.user.fullName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{split.user.fullName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={split.paid ? 'text-green-600' : 'text-gray-600'}>
                              {formatCurrency(split.amount)}
                            </span>
                            {split.paid ? (
                              <Badge variant="outline" className="text-xs text-green-600">
                                <Check className="h-3 w-3 mr-1" />
                                Pago
                              </Badge>
                            ) : (
                              split.userId === user?.id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateSplitMutation.mutate({ splitId: split.id, paid: true })}
                                  disabled={updateSplitMutation.isPending}
                                >
                                  Marcar como pago
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}