import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { 
  DollarSign, 
  Plane, 
  Home, 
  Utensils, 
  Car, 
  Camera, 
  ShoppingBag, 
  Shield, 
  FileText, 
  MoreHorizontal 
} from "lucide-react";
import { BudgetBreakdown, budgetCategories } from "@shared/schema";
import { getParticipantsForBudgetCalculation } from "@/lib/trip-utils";
import { formatBrazilianCurrency, formatBrazilianNumber, calculatePerPerson, sumValues } from "@shared/utils";

interface BudgetVisualizationProps {
  budget: number;
  budgetBreakdown?: BudgetBreakdown;
  trip: any; // Full trip object to determine if started
  className?: string;
}

const categoryIcons: { [key: string]: any } = {
  transport: Plane,
  accommodation: Home,
  food: Utensils,
  insurance: Shield,
  medical: Shield,
  other: MoreHorizontal,
};

const categoryColors: { [key: string]: string } = {
  transport: "#3b82f6",
  accommodation: "#10b981",
  food: "#f59e0b",
  insurance: "#06b6d4",
  medical: "#f97316",
  other: "#6b7280",
};

export function BudgetVisualization({ 
  budget, 
  budgetBreakdown = {}, 
  trip,
  className = "" 
}: BudgetVisualizationProps) {
  const totalBudget = budget;
  const participants = getParticipantsForBudgetCalculation(trip);
  const perPersonBudget = totalBudget / participants;
  
  // Calculate breakdown data
  const breakdownData = Object.entries(budgetCategories).map(([key, label]) => {
    const amount = budgetBreakdown[key as keyof BudgetBreakdown] || 0;
    const percentage = totalBudget > 0 ? (amount / totalBudget) * 100 : 0;
    const Icon = categoryIcons[key];
    
    return {
      key,
      label,
      amount,
      percentage,
      color: categoryColors[key],
      icon: Icon,
      perPerson: amount / participants,
    };
  }).filter(item => item.amount > 0);

  const totalAllocated = breakdownData.reduce((sum, item) => sum + item.amount, 0);
  const unallocated = totalBudget - totalAllocated;
  const allocationPercentage = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0;

  // Prepare chart data
  const chartData: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }> = breakdownData.map(item => ({
    name: item.label,
    value: item.amount,
    percentage: item.percentage,
    color: item.color,
  }));

  if (unallocated > 0) {
    chartData.push({
      name: "Não Alocado",
      value: unallocated,
      percentage: (unallocated / totalBudget) * 100,
      color: "#e5e7eb",
    });
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Visão Geral do Orçamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatBrazilianCurrency(totalBudget)}
              </div>
              <div className="text-sm text-gray-600">Orçamento Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatBrazilianCurrency(perPersonBudget)}
              </div>
              <div className="text-sm text-gray-600">Por Pessoa</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatBrazilianNumber(allocationPercentage / 100).replace(',00', '')}%
              </div>
              <div className="text-sm text-gray-600">Alocado</div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso de Alocação</span>
              <span>{formatBrazilianCurrency(totalAllocated)} / {formatBrazilianCurrency(totalBudget)}</span>
            </div>
            <Progress value={allocationPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Budget Breakdown */}
      {breakdownData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {breakdownData.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" style={{ color: item.color }} />
                        <span className="font-medium">{item.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {formatBrazilianNumber(item.percentage / 100).replace(',00', '')}%
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatBrazilianCurrency(item.amount)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatBrazilianCurrency(item.perPerson)} por pessoa
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={item.percentage} 
                      className="h-2" 
                      style={{ 
                        backgroundColor: `${item.color}20`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {unallocated > 0 && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center justify-between text-gray-600">
                  <span>Orçamento Não Alocado</span>
                  <span className="font-semibold">
                    {formatBrazilianCurrency(unallocated)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Visual Charts */}
      {breakdownData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição do Orçamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${formatBrazilianNumber(percentage / 100).replace(',00', '')}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                        "Valor"
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis 
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL',
                          notation: 'compact' 
                        }).format(value)
                      }
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                        "Valor"
                      ]}
                    />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Dicas de Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            {allocationPercentage < 80 && (
              <div className="flex items-center gap-2 text-amber-600">
                <div className="w-2 h-2 bg-amber-600 rounded-full" />
                <span>Considere alocar mais do seu orçamento para ter maior controle dos gastos</span>
              </div>
            )}
            {breakdownData.some(item => item.key === 'transport' && item.percentage > 40) && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <span>Transporte representa uma grande parte do orçamento - considere opções mais econômicas</span>
              </div>
            )}
            {breakdownData.some(item => item.key === 'accommodation' && item.percentage > 35) && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
                <span>Hospedagem tem alto custo - dividir quartos pode reduzir significativamente o valor</span>
              </div>
            )}
            {unallocated > totalBudget * 0.2 && (
              <div className="flex items-center gap-2 text-purple-600">
                <div className="w-2 h-2 bg-purple-600 rounded-full" />
                <span>Você tem uma reserva boa para emergências e gastos extras</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}