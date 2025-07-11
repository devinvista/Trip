import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Navbar } from "@/components/navbar";
import { TravelBoard } from "@/components/travel-board";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Calendar,
  MapPin,
  TrendingUp,
  Users,
  Plus
} from "lucide-react";
import { Link } from "wouter";

export default function BoardPage() {
  const { user } = useAuth();

  // Mock statistics
  const stats = {
    totalTrips: 4,
    upcomingTrips: 2,
    activeTrips: 0,
    completedTrips: 1,
    totalBudget: 15000,
    savedAmount: 2300
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                Painel de Viagens
              </h1>
              <p className="text-gray-600 mt-2">
                Organize e gerencie todas as suas viagens em um só lugar
              </p>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/create-trip">
                <Plus className="h-4 w-4 mr-2" />
                Nova Viagem
              </Link>
            </Button>
          </div>

          <Tabs defaultValue="board" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="board">Painel Visual</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="board">
              <TravelBoard />
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Viagens</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalTrips}</div>
                    <p className="text-xs text-muted-foreground">
                      Todas as suas aventuras
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Próximas Viagens</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.upcomingTrips}</div>
                    <p className="text-xs text-muted-foreground">
                      Confirmadas e agendadas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {stats.totalBudget.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-muted-foreground">
                      Investimento em experiências
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Companheiros</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">
                      Pessoas conhecidas
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nova viagem criada</p>
                        <p className="text-xs text-gray-600">Trilha na Chapada Diamantina - há 2 horas</p>
                      </div>
                      <Badge variant="secondary">Novo</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Participante adicionado</p>
                        <p className="text-xs text-gray-600">Ana Silva se juntou à viagem para Campos do Jordão</p>
                      </div>
                      <Badge variant="outline">Participação</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Orçamento atualizado</p>
                        <p className="text-xs text-gray-600">Detalhamento de custos da viagem para Salvador</p>
                      </div>
                      <Badge variant="outline">Orçamento</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips and Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Dicas de Organização</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">📋 Mantenha suas viagens organizadas</h4>
                      <p className="text-sm text-blue-800">
                        Use o painel visual para arrastar viagens entre as colunas conforme elas progridem do planejamento até a conclusão.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">💡 Dica de orçamento</h4>
                      <p className="text-sm text-green-800">
                        Detalhe os custos compartilhados para facilitar a divisão de gastos entre os participantes.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">🤝 Comunicação é fundamental</h4>
                      <p className="text-sm text-yellow-800">
                        Use o chat das viagens para manter todos os participantes informados sobre mudanças e novidades.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}