import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Navbar } from "@/components/navbar";
import { TripCard } from "@/components/trip-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Briefcase, 
  Users, 
  Mail, 
  Calendar, 
  MapPin,
  Plus,
  MessageCircle
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: myTrips, isLoading: tripsLoading } = useQuery({
    queryKey: ["/api/my-trips"],
    enabled: !!user, // Only fetch when user is authenticated
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/user-requests"],
    enabled: !!user, // Only fetch when user is authenticated
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const createdTrips = (myTrips as any)?.created || [];
  const participatingTrips = (myTrips as any)?.participating || [];
  const pendingRequests = (requests as any)?.filter((r: any) => r.status === 'pending') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={user?.profilePhoto || ""} />
                    <AvatarFallback className="text-lg">
                      {user?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-xl text-dark">{user?.fullName}</h3>
                  <p className="text-gray-600">{user?.location || "Localização não informada"}</p>
                </div>

                <nav className="space-y-2">
                  <div className="flex items-center space-x-3 text-primary bg-orange-50 px-4 py-3 rounded-lg">
                    <Briefcase className="h-5 w-5" />
                    <span>Dashboard</span>
                  </div>
                  <Link href="/search" className="flex items-center space-x-3 text-dark hover:text-primary px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <MapPin className="h-5 w-5" />
                    <span>Buscar Viagens</span>
                  </Link>
                  <Link href="/create-trip" className="flex items-center space-x-3 text-dark hover:text-primary px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Plus className="h-5 w-5" />
                    <span>Criar Viagem</span>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="mb-8">
              <h1 className="font-bold text-3xl text-dark mb-2">
                Olá, {user?.fullName?.split(' ')[0]}!
              </h1>
              <p className="text-gray-600">Bem-vindo de volta ao seu painel de viagens</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-full">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-2xl text-dark">{createdTrips.length}</h3>
                      <p className="text-gray-600">Viagens Criadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-secondary bg-opacity-10 p-3 rounded-full">
                      <Users className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-2xl text-dark">{participatingTrips.length}</h3>
                      <p className="text-gray-600">Viagens Participando</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-accent bg-opacity-10 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-accent" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-2xl text-dark">{pendingRequests.length}</h3>
                      <p className="text-gray-600">Novos Convites</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* My Recent Trips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Minhas Viagens Recentes
                    <Link href="/create-trip">
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Viagem
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tripsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : createdTrips.length > 0 ? (
                    <div className="space-y-4">
                      {createdTrips.slice(0, 3).map((trip: any) => (
                        <div key={trip.id} className="border-l-4 border-primary pl-4">
                          <h3 className="font-medium text-dark">{trip.title}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(trip.startDate).toLocaleDateString('pt-BR')} - {new Date(trip.endDate).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            {trip.currentParticipants}/{trip.maxParticipants} participantes
                          </p>
                          <Badge className={`mt-2 ${trip.status === 'open' ? 'status-open' : 'status-confirmed'}`}>
                            {trip.status === 'open' ? 'Aberta' : 'Confirmada'}
                          </Badge>
                        </div>
                      ))}
                      <Separator />
                      <Link href="/search">
                        <Button variant="outline" className="w-full">
                          Ver Todas
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">Você ainda não criou nenhuma viagem.</p>
                      <Link href="/create-trip">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Primeira Viagem
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Participating Trips */}
              <Card>
                <CardHeader>
                  <CardTitle>Viagens que Estou Participando</CardTitle>
                </CardHeader>
                <CardContent>
                  {tripsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : participatingTrips.length > 0 ? (
                    <div className="space-y-4">
                      {participatingTrips.slice(0, 3).map((trip: any) => (
                        <div key={trip.id} className="border-l-4 border-secondary pl-4">
                          <h3 className="font-medium text-dark">{trip.title}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {trip.destination}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(trip.startDate).toLocaleDateString('pt-BR')}
                          </p>
                          <Link href={`/chat/${trip.id}`}>
                            <Button size="sm" variant="outline" className="mt-2">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Chat
                            </Button>
                          </Link>
                        </div>
                      ))}
                      <Separator />
                      <Link href="/search">
                        <Button variant="outline" className="w-full">
                          Buscar Mais Viagens
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">Você ainda não está participando de nenhuma viagem.</p>
                      <Link href="/search">
                        <Button>
                          <MapPin className="h-4 w-4 mr-2" />
                          Encontrar Viagens
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}