import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Edit3, DollarSign, Calculator, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { budgetCategories, BudgetBreakdown } from "@shared/schema";
import { formatBrazilianCurrency, calculatePerPerson, sumValues, parseNumber } from "@shared/utils";

interface BudgetEditorProps {
  tripId: number;
  currentBudget: number;
  currentBudgetBreakdown?: BudgetBreakdown;
  maxParticipants: number;
  onBudgetUpdate?: (newBudget: number, newBreakdown?: BudgetBreakdown) => void;
}

export function BudgetEditor({ 
  tripId, 
  currentBudget, 
  currentBudgetBreakdown, 
  maxParticipants,
  onBudgetUpdate 
}: BudgetEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(!!currentBudgetBreakdown);
  const [budget, setBudget] = useState(currentBudget);
  const [budget_breakdown, setBudgetBreakdown] = useState<BudgetBreakdown>(
    currentBudgetBreakdown || {}
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateBudgetMutation = useMutation({
    mutationFn: async (data: { budget: number; budget_breakdown?: BudgetBreakdown }) => {
      console.log('Enviando dados de orçamento:', data);
      const response = await apiRequest('PATCH', `/api/trips/${tripId}/budget`, data);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro na resposta:', response.status, errorData);
        throw new Error(errorData || 'Erro ao atualizar orçamento');
      }
      
      const result = await response.json();
      console.log('Orçamento atualizado com sucesso:', result);
      return result;
    },
    onSuccess: (updatedTrip) => {
      console.log('Invalidando cache e atualizando UI');
      queryClient.invalidateQueries({ queryKey: ['/api/trips', tripId] });
      onBudgetUpdate?.(updatedTrip.budget, updatedTrip.budget_breakdown);
      setIsOpen(false);
      toast({
        title: "Orçamento atualizado",
        description: "O orçamento da viagem foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      console.error('Erro na mutação:', error);
      toast({
        title: "Erro ao atualizar orçamento",
        description: error.message || "Erro desconhecido ao atualizar orçamento",
        variant: "destructive",
      });
    },
  });

  const calculateTotalFromBreakdown = () => {
    return sumValues(Object.values(budget_breakdown));
  };

  const handleBudgetBreakdownChange = (category: string, value: number) => {
    setBudgetBreakdown(prev => ({
      ...prev,
      [category]: parseNumber(value) || undefined
    }));
  };

  const handleSubmit = () => {
    let finalBudget = budget;
    let finalBreakdown = undefined;
    
    if (showBreakdown) {
      finalBudget = calculateTotalFromBreakdown();
      finalBreakdown = budget_breakdown;
    } else {
      // Se a opção de breakdown estiver desabilitada, enviar budget_breakdown como null
      // para indicar que as categorias devem ser zeradas
      finalBreakdown = null;
    }
    
    if (finalBudget <= 0) {
      toast({
        title: "Erro de validação",
        description: "O orçamento deve ser um valor positivo.",
        variant: "destructive",
      });
      return;
    }

    updateBudgetMutation.mutate({
      budget: finalBudget,
      budget_breakdown: finalBreakdown || undefined
    });
  };

  const resetForm = () => {
    setBudget(currentBudget);
    setBudgetBreakdown(currentBudgetBreakdown || {});
    setShowBreakdown(!!currentBudgetBreakdown);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => setIsOpen(true)}
        >
          <Edit3 className="h-4 w-4" />
          Editar Orçamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Editar Orçamento da Viagem
          </DialogTitle>
          <DialogDescription>
            Ajuste o orçamento total da viagem ou defina valores específicos por categoria
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Budget Mode Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Modo de Orçamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="breakdown-mode" className="text-sm font-medium">
                    Orçamento Detalhado por Categoria
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Divida o orçamento em categorias específicas (transporte, hospedagem, etc.)
                  </p>
                </div>
                <Switch
                  id="breakdown-mode"
                  checked={showBreakdown}
                  onCheckedChange={setShowBreakdown}
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget Input */}
          {!showBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Orçamento Total</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="budget">Orçamento Total da Viagem (R$)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="budget"
                      type="number"
                      placeholder="0"
                      className="pl-10"
                      value={budget || ""}
                      onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                {budget > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-900">
                        Custo por pessoa:
                      </span>
                      <span className="text-lg font-bold text-blue-900">
                        {formatBrazilianCurrency(budget / maxParticipants)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Budget Breakdown */}
          {showBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Orçamento por Categoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(budgetCategories).map(([key, label]) => (
                    <div key={key}>
                      <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-3 w-3 text-gray-500" />
                        <Input
                          id={key}
                          type="number"
                          placeholder="0"
                          className="pl-10"
                          value={budget_breakdown[key as keyof BudgetBreakdown] || ""}
                          onChange={(e) => handleBudgetBreakdownChange(key, parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                    <span className="font-bold text-blue-900">💎 Orçamento Base Total:</span>
                    <span className="text-xl font-bold text-blue-900">
                      {formatBrazilianCurrency(calculateTotalFromBreakdown())}
                    </span>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-900">
                        Custo por pessoa:
                      </span>
                      <span className="text-lg font-bold text-green-900">
                        {formatBrazilianCurrency(calculateTotalFromBreakdown() / maxParticipants)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Update budget from breakdown */}
                {calculateTotalFromBreakdown() !== budget && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      O orçamento será atualizado para {formatBrazilianCurrency(calculateTotalFromBreakdown())}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                setIsOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={updateBudgetMutation.isPending}
            >
              {updateBudgetMutation.isPending ? "Salvando..." : "Salvar Orçamento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}