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

// Community Connection SVG Component inspired by shared experiences
const CommunityLighthouseSVG = ({ className = "" }: { className?: string }) => (
  <svg 
    viewBox="0 0 400 600" 
    className={className}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Ocean Base with Waves */}
    <path 
      d="M0 580 Q100 570 200 580 Q300 590 400 580 L400 600 L0 600 Z" 
      fill="url(#oceanGradient)" 
      className="animate-wave"
    />
    
    {/* Island Base */}
    <ellipse cx="200" cy="580" rx="80" ry="20" fill="url(#islandGradient)" />
    
    {/* Lighthouse Base - Modern Tower */}
    <rect x="175" y="420" width="50" height="160" fill="url(#lighthouseGradient)" rx="6"/>
    
    {/* Lighthouse Segments - Representing Community Levels */}
    <rect x="180" y="440" width="40" height="6" fill="#fbbf24" opacity="0.8" />
    <rect x="180" y="460" width="40" height="6" fill="#10b981" opacity="0.8" />
    <rect x="180" y="480" width="40" height="6" fill="#3b82f6" opacity="0.8" />
    <rect x="180" y="500" width="40" height="6" fill="#8b5cf6" opacity="0.8" />
    
    {/* Community Platform at Top */}
    <rect x="160" y="400" width="80" height="25" fill="url(#platformGradient)" rx="8"/>
    
    {/* Connection Beams - Multiple directions representing community reach */}
    <g className="animate-pulse">
      <path 
        d="M200 400 L80 250 L200 385 L150 250 Z" 
        fill="url(#lightBeam1)" 
        opacity="0.4"
      />
      <path 
        d="M200 400 L320 250 L200 385 L250 250 Z" 
        fill="url(#lightBeam2)" 
        opacity="0.4"
      />
      <path 
        d="M200 400 L200 200 L185 385 L215 385 Z" 
        fill="url(#lightBeam3)" 
        opacity="0.5"
      />
    </g>
    
    {/* Central Community Hub */}
    <circle cx="200" cy="390" r="12" fill="#fbbf24" className="animate-pulse" />
    <circle cx="200" cy="390" r="18" fill="#fbbf24" opacity="0.3" className="animate-ping" />
    
    {/* People Icons Around Lighthouse - Representing Community */}
    <circle cx="120" cy="380" r="8" fill="#10b981" className="animate-pulse" style={{animationDelay: '0.5s'}} />
    <circle cx="120" cy="375" r="4" fill="#065f46" />
    <rect x="116" y="383" width="8" height="12" fill="#065f46" rx="2" />
    
    <circle cx="280" cy="370" r="8" fill="#3b82f6" className="animate-pulse" style={{animationDelay: '1s'}} />
    <circle cx="280" cy="365" r="4" fill="#1e3a8a" />
    <rect x="276" y="373" width="8" height="12" fill="#1e3a8a" rx="2" />
    
    <circle cx="150" cy="350" r="8" fill="#8b5cf6" className="animate-pulse" style={{animationDelay: '1.5s'}} />
    <circle cx="150" cy="345" r="4" fill="#581c87" />
    <rect x="146" y="353" width="8" height="12" fill="#581c87" rx="2" />
    
    <circle cx="250" cy="340" r="8" fill="#f59e0b" className="animate-pulse" style={{animationDelay: '2s'}} />
    <circle cx="250" cy="335" r="4" fill="#92400e" />
    <rect x="246" y="343" width="8" height="12" fill="#92400e" rx="2" />
    
    {/* Connection Lines Between People */}
    <line x1="120" y1="380" x2="200" y2="390" stroke="#fbbf24" strokeWidth="2" opacity="0.6" className="animate-pulse" />
    <line x1="280" y1="370" x2="200" y2="390" stroke="#fbbf24" strokeWidth="2" opacity="0.6" className="animate-pulse" />
    <line x1="150" y1="350" x2="200" y2="390" stroke="#fbbf24" strokeWidth="2" opacity="0.6" className="animate-pulse" />
    <line x1="250" y1="340" x2="200" y2="390" stroke="#fbbf24" strokeWidth="2" opacity="0.6" className="animate-pulse" />
    
    {/* Stars representing destinations/dreams */}
    <circle cx="100" cy="100" r="2" fill="#fbbf24" className="animate-star-twinkle" />
    <circle cx="300" cy="80" r="1.5" fill="#fbbf24" className="animate-star-twinkle" style={{animationDelay: '0.5s'}} />
    <circle cx="350" cy="120" r="1" fill="#fbbf24" className="animate-star-twinkle" style={{animationDelay: '1s'}} />
    <circle cx="80" cy="60" r="1.5" fill="#fbbf24" className="animate-star-twinkle" style={{animationDelay: '1.5s'}} />
    <circle cx="200" cy="50" r="2" fill="#fbbf24" className="animate-star-twinkle" style={{animationDelay: '2s'}} />
    
    {/* Definitions */}
    <defs>
      <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1e40af" />
      </linearGradient>
      <linearGradient id="islandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#065f46" />
        <stop offset="100%" stopColor="#064e3b" />
      </linearGradient>
      <linearGradient id="lighthouseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
      <linearGradient id="platformGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <linearGradient id="lightBeam1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="lightBeam2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <linearGradient id="lightBeam3" x1="0%" y1="0%" x2="0%" y2="100%">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 relative overflow-hidden">
      <Navbar />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <motion.div
          className="absolute w-64 h-64 bg-blue-400/15 rounded-full blur-3xl"
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
          className="absolute w-48 h-48 bg-slate-600/15 rounded-full blur-3xl"
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
          className="absolute w-32 h-32 bg-orange-400/10 rounded-full blur-2xl"
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
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Compartilhe experiências únicas</span>
              </motion.div>

              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
                  <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                    Viaje Junto
                  </span>
                  <br />
                  <span className="text-white">
                    Gaste Menos
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
                Conecte-se com viajantes que compartilham seus interesses. 
                <span className="text-yellow-300 font-semibold"> Divida custos</span>, troque experiências 
                e descubra o mundo de forma mais inteligente e econômica.
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
                    <Users className="mr-2 h-5 w-5" />
                    Encontrar Companheiros
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 rounded-full">
                  <Link href="/create-trip">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Compartilhar Viagem
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
                    65%
                  </motion.p>
                  <p className="text-blue-200 text-sm">Economia Média</p>
                </div>
                <div className="text-center">
                  <motion.p
                    className="text-3xl font-bold text-green-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
                  >
                    2.8k+
                  </motion.p>
                  <p className="text-blue-200 text-sm">Viajantes Conectados</p>
                </div>
                <div className="text-center">
                  <motion.p
                    className="text-3xl font-bold text-purple-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
                  >
                    1.2k+
                  </motion.p>
                  <p className="text-blue-200 text-sm">Experiências Compartilhadas</p>
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
                  <CommunityLighthouseSVG className="w-80 h-96 lg:w-96 lg:h-[500px]" />
                </motion.div>
              </div>

              {/* Floating Community Elements */}
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
                <Users className="w-6 h-6 text-yellow-400" />
              </motion.div>

              <motion.div
                className="absolute bottom-20 right-10 bg-white/10 backdrop-blur-sm rounded-full p-3"
                animate={{
                  y: [0, 20, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <DollarSign className="w-6 h-6 text-green-400" />
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
                <Heart className="w-6 h-6 text-purple-400" />
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
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">Destinos em Alta</h2>
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
              <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">Viagens Recentes</h2>
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
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">Por que escolher ViajaJunto?</h2>
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
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">Sua próxima aventura começa aqui</h2>
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