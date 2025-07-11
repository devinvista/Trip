import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plane, Users, DollarSign, Calendar, MapPin, Shield, Star, TrendingUp, Heart, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Featured destinations with beautiful imagery
const featuredDestinations = [
  {
    name: "Machu Picchu, Peru",
    image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=600&fit=crop",
    description: "Cidade perdida dos Incas",
    avgBudget: 3500,
    rating: 4.9,
    tripCount: 45
  },
  {
    name: "Santorini, Grécia",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop",
    description: "Paraíso no Mar Egeu",
    avgBudget: 4200,
    rating: 4.8,
    tripCount: 38
  },
  {
    name: "Tóquio, Japão",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
    description: "Metrópole futurista",
    avgBudget: 5000,
    rating: 4.9,
    tripCount: 52
  },
  {
    name: "Bali, Indonésia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop",
    description: "Ilha dos Deuses",
    avgBudget: 2800,
    rating: 4.7,
    tripCount: 67
  },
  {
    name: "Patagônia, Argentina",
    image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop",
    description: "Aventura no fim do mundo",
    avgBudget: 4500,
    rating: 4.9,
    tripCount: 29
  },
  {
    name: "Islândia",
    image: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&h=600&fit=crop",
    description: "Terra do gelo e fogo",
    avgBudget: 6000,
    rating: 4.8,
    tripCount: 41
  }
];

export default function HomePage() {
  // Fetch recent trips
  const { data: trips, isLoading } = useQuery({
    queryKey: ["/api/trips"],
    queryFn: async () => {
      const res = await fetch("/api/trips?limit=6", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch trips");
      return res.json();
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      {/* Hero Section with Animation */}
      <section className="container mx-auto px-4 py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <Sparkles className="w-8 h-8 text-yellow-500 animate-bounce" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
            Viaje Junto, Viva Mais
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Descubra o mundo com novos amigos e divida experiências inesquecíveis enquanto economiza até 60% nos custos.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="animate-slide-up">
              <Link href="/search">
                <MapPin className="mr-2 h-5 w-5" />
                Explorar Viagens
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="animate-slide-up animation-delay-200">
              <Link href="/create-trip">
                <Plane className="mr-2 h-5 w-5" />
                Criar Aventura
              </Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">2.5k+</p>
              <p className="text-gray-600 dark:text-gray-400">Viajantes Ativos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">850+</p>
              <p className="text-gray-600 dark:text-gray-400">Viagens Realizadas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">4.8★</p>
              <p className="text-gray-600 dark:text-gray-400">Avaliação Média</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Destinos em Alta</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Os lugares mais procurados pelos nossos viajantes</p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/search">
              Ver Todos <TrendingUp className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDestinations.map((destination, index) => (
            <Card key={index} className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={destination.image} 
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{destination.name}</h3>
                  <p className="text-sm opacity-90">{destination.description}</p>
                </div>
                <Badge className="absolute top-4 right-4 bg-yellow-500 text-black">
                  <Star className="w-3 h-3 mr-1" />
                  {destination.rating}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Orçamento médio</p>
                    <p className="text-lg font-bold text-green-600">R$ {destination.avgBudget}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{destination.tripCount} viagens</p>
                    <p className="text-sm text-blue-600">disponíveis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Trips */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Viagens Recentes</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Junte-se a uma aventura que está prestes a começar</p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/search">
                Explorar Mais <Heart className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips?.slice(0, 6).map((trip: any) => (
                <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{trip.title}</CardTitle>
                        <CardDescription className="flex items-center mt-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {trip.destination}
                        </CardDescription>
                      </div>
                      <Badge variant={trip.travelStyle === "aventura" ? "default" : "secondary"}>
                        {trip.travelStyle}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{trip.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{format(new Date(trip.startDate), "dd MMM", { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{trip.maxParticipants} pessoas</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-bold text-green-600">
                          R$ {Math.round(trip.budget / trip.maxParticipants)}/pessoa
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Verificado</span>
                      </div>
                    </div>
                    <Button asChild className="w-full mt-4">
                      <Link href={`/trips/${trip.id}`}>Ver Detalhes</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section with Icons */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Por que escolher ViajaJunto?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle>Economize até 60%</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Divida hospedagem, transporte e passeios. Viaje mais gastando menos!
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <CardTitle>Comunidade Verificada</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Perfis autenticados, avaliações reais e sistema de reputação confiável.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-purple-600" />
              </div>
              <CardTitle>Experiências Únicas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Viva aventuras autênticas e faça amizades que duram para sempre.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section with gradient */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Sua próxima aventura começa aqui</h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a mais de 2.500 viajantes que já descobriram uma nova forma de explorar o mundo
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth">
                Criar Conta Grátis
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
              <Link href="/search">
                Ver Viagens
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}