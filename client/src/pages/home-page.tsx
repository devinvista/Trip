import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plane, Users, DollarSign, Calendar, MapPin, Shield, Star, TrendingUp, Heart, Sparkles, Compass, Navigation, Globe } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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

// Lighthouse SVG Component inspired by Alexandria
const LighthouseSVG = ({ className = "" }: { className?: string }) => (
  <svg 
    viewBox="0 0 400 600" 
    className={className}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Ocean Base */}
    <path 
      d="M0 580 Q200 560 400 580 L400 600 L0 600 Z" 
      fill="url(#oceanGradient)" 
    />
    
    {/* Lighthouse Base */}
    <rect x="170" y="400" width="60" height="180" fill="url(#lighthouseGradient)" rx="4"/>
    
    {/* Lighthouse Body Segments */}
    <rect x="175" y="420" width="50" height="8" fill="#e2e8f0" />
    <rect x="175" y="440" width="50" height="8" fill="#e2e8f0" />
    <rect x="175" y="460" width="50" height="8" fill="#e2e8f0" />
    <rect x="175" y="480" width="50" height="8" fill="#e2e8f0" />
    
    {/* Lighthouse Top Structure */}
    <rect x="165" y="380" width="70" height="30" fill="url(#topGradient)" rx="6"/>
    
    {/* Light Beam */}
    <g className="animate-pulse">
      <path 
        d="M200 380 L50 200 L200 360 L350 200 Z" 
        fill="url(#lightBeam)" 
        opacity="0.3"
      />
    </g>
    
    {/* Light Source */}
    <circle cx="200" cy="370" r="8" fill="#fbbf24" className="animate-pulse" />
    <circle cx="200" cy="370" r="12" fill="#fbbf24" opacity="0.5" className="animate-ping" />
    
    {/* Stars */}
    <circle cx="100" cy="100" r="2" fill="#fbbf24" className="animate-pulse" />
    <circle cx="300" cy="80" r="1.5" fill="#fbbf24" className="animate-pulse" style={{animationDelay: '0.5s'}} />
    <circle cx="350" cy="120" r="1" fill="#fbbf24" className="animate-pulse" style={{animationDelay: '1s'}} />
    <circle cx="80" cy="60" r="1.5" fill="#fbbf24" className="animate-pulse" style={{animationDelay: '1.5s'}} />
    
    {/* Definitions */}
    <defs>
      <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1e40af" />
      </linearGradient>
      <linearGradient id="lighthouseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
      <linearGradient id="topGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
      <linearGradient id="lightBeam" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
  </svg>
);

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Fetch recent trips
  const { data: trips, isLoading } = useQuery({
    queryKey: ["/api/trips"],
    queryFn: async () => {
      const res = await fetch("/api/trips?limit=6", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch trips");
      return res.json();
    }
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <Navbar />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <motion.div
          className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 70, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '60%', right: '15%' }}
        />
        <motion.div
          className="absolute w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '30%', right: '30%' }}
        />
        
        {/* Parallax Cursor Effect */}
        <motion.div
          className="absolute w-2 h-2 bg-yellow-400 rounded-full pointer-events-none z-50"
          animate={{
            x: mousePosition.x - 4,
            y: mousePosition.y - 4,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>

      {/* Hero Section - Lighthouse Theme */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              className="text-left space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full border border-white/20 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Navigation className="w-4 h-4" />
                <span className="text-sm font-medium">Navegue pelos seus sonhos</span>
              </motion.div>

              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
                  <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                    Ilumine
                  </span>
                  <br />
                  <span className="text-white">
                    Sua Jornada
                  </span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                className="text-xl text-blue-100 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Como o lendário Farol de Alexandria guiava navegadores, 
                <span className="text-yellow-300 font-semibold"> ViajaJunto </span>
                ilumina seu caminho para aventuras extraordinárias pelo mundo.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button asChild size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold px-8 py-6 rounded-full shadow-xl shadow-yellow-500/25 transform hover:scale-105 transition-all">
                  <Link href="/search">
                    <Compass className="mr-2 h-5 w-5" />
                    Descobrir Destinos
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 rounded-full">
                  <Link href="/create-trip">
                    <Globe className="mr-2 h-5 w-5" />
                    Criar Aventura
                  </Link>
                </Button>
              </motion.div>

              {/* Stats with Animation */}
              <motion.div
                className="grid grid-cols-3 gap-8 pt-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="text-center">
                  <motion.p
                    className="text-3xl font-bold text-yellow-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                  >
                    3.2k+
                  </motion.p>
                  <p className="text-blue-200 text-sm">Exploradores Ativos</p>
                </div>
                <div className="text-center">
                  <motion.p
                    className="text-3xl font-bold text-green-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
                  >
                    1.5k+
                  </motion.p>
                  <p className="text-blue-200 text-sm">Jornadas Realizadas</p>
                </div>
                <div className="text-center">
                  <motion.p
                    className="text-3xl font-bold text-purple-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
                  >
                    4.9★
                  </motion.p>
                  <p className="text-blue-200 text-sm">Avaliação Média</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Lighthouse */}
            <motion.div
              className="relative h-96 lg:h-[600px] flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Lighthouse Container with Glow */}
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <motion.div
                  className="relative z-10"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <LighthouseSVG className="w-80 h-96 lg:w-96 lg:h-[500px]" />
                </motion.div>
              </div>

              {/* Floating Navigation Elements */}
              <motion.div
                className="absolute top-20 left-10 bg-white/10 backdrop-blur-sm rounded-full p-3"
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Compass className="w-6 h-6 text-yellow-400" />
              </motion.div>

              <motion.div
                className="absolute bottom-20 right-10 bg-white/10 backdrop-blur-sm rounded-full p-3"
                animate={{
                  y: [0, 20, 0],
                  rotate: [360, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Navigation className="w-6 h-6 text-blue-400" />
              </motion.div>

              <motion.div
                className="absolute top-40 right-20 bg-white/10 backdrop-blur-sm rounded-full p-3"
                animate={{
                  x: [0, 15, 0],
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Globe className="w-6 h-6 text-green-400" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
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