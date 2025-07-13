import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TripCard } from "@/components/trip-card";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
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
          className="absolute w-48 h-48 bg-indigo-300/20 rounded-full blur-3xl"
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/80 to-red-500/80 backdrop-blur-sm rounded-full border border-orange-300/50 text-white shadow-lg shadow-orange-500/25"
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
                <h1 className="text-6xl md:text-7xl font-bold text-slate-800 leading-tight">
                  <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                    Viaje Junto,
                  </span>
                  <br />
                  <span className="text-slate-800">
                    Gaste Menos
                  </span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                className="text-xl text-slate-600 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Conecte-se com viajantes que compartilham seus interesses. 
                <span className="text-amber-600 font-semibold"> Divida custos</span>, troque experiências 
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
                    Encontrar Viagem
                  </Link>
                </Button>
                <Button asChild size="lg" className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold px-8 py-6 rounded-full shadow-xl shadow-green-500/25 transform hover:scale-105 transition-all">
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
                  <p className="text-slate-600 text-sm">Economia Média</p>
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
                  <p className="text-slate-600 text-sm">Viajantes Conectados</p>
                </div>
                <div className="text-center">
                  <motion.p
                    className="text-3xl font-bold text-blue-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
                  >
                    1.2k+
                  </motion.p>
                  <p className="text-slate-600 text-sm">Experiências Compartilhadas</p>
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
                <Heart className="w-6 h-6 text-blue-400" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />
      </section>

      {/* Featured Destinations */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400 to-cyan-600 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-slate-700">Mais Procurados</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Destinos em Alta
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Descubra os lugares mais procurados pelos nossos viajantes e planeje sua próxima aventura
            </p>
            <Button asChild className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all">
              <Link href="/search">
                <Globe className="mr-2 h-5 w-5" />
                Explorar Todos os Destinos
              </Link>
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDestinations.map((destination, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="group overflow-hidden bg-white/70 backdrop-blur-sm border border-white/40 hover:bg-white/90 hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={destination.image} 
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                    {/* Glass morphism overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-transparent to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold mb-1 drop-shadow-lg">{destination.name}</h3>
                      <p className="text-sm opacity-90 drop-shadow-md">{destination.description}</p>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 border border-white/40">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-bold text-slate-800">{destination.rating}</span>
                      </div>
                    </div>

                    {/* Floating trend indicator */}
                    <motion.div
                      className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full px-3 py-1 text-xs font-bold"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    >
                      🔥 TRENDING
                    </motion.div>
                  </div>

                  <CardContent className="p-6 bg-gradient-to-br from-white to-slate-50/80">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Orçamento médio</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          R$ {destination.avgBudget.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Disponíveis</p>
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-lg font-bold text-slate-800">{destination.tripCount}</span>
                          <span className="text-sm text-blue-600 font-medium">viagens</span>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <Button className="w-full mt-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white border-0 rounded-xl py-3 font-semibold transition-all duration-300 group-hover:shadow-lg">
                      <Compass className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Bottom decoration */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 text-slate-600">
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-slate-300"></div>
              <span className="text-sm font-medium">E muitos outros destinos incríveis</span>
              <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-slate-300"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recent Trips */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400 to-cyan-600 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium text-slate-700">Mais Recentes</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Viagens Recentes
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Junte-se a uma aventura que está prestes a começar e faça novas amizades
            </p>
            <Button asChild className="mt-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all">
              <Link href="/search">
                <Heart className="mr-2 h-5 w-5" />
                Explorar Mais Viagens
              </Link>
            </Button>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Card className="overflow-hidden bg-white/70 backdrop-blur-sm border border-white/40">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips?.slice(0, 6).map((trip: any, index: number) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <TripCard trip={trip} showActions={true} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Bottom decoration */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 text-slate-600">
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-slate-300"></div>
              <span className="text-sm font-medium">Mais de 500 viagens disponíveis</span>
              <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-slate-300"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section with Icons */}
      <section className="relative py-24 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-slate-700">Vantagens Exclusivas</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Por que escolher PartiuTrip?
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Descubra como nossa plataforma transforma a forma de viajar, conectando pessoas e criando experiências inesquecíveis
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="group text-center bg-white/80 backdrop-blur-sm border border-white/40 hover:bg-white/95 hover:shadow-2xl hover:scale-105 transition-all duration-500 h-full">
                <CardHeader className="pb-4">
                  <motion.div 
                    className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <DollarSign className="w-12 h-12 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Economize até 65%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 text-base leading-relaxed">
                    Divida hospedagem, transporte e passeios. Viaje mais gastando menos com nossa inteligente divisão de custos!
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="group text-center bg-white/80 backdrop-blur-sm border border-white/40 hover:bg-white/95 hover:shadow-2xl hover:scale-105 transition-all duration-500 h-full">
                <CardHeader className="pb-4">
                  <motion.div 
                    className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Users className="w-12 h-12 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Comunidade Verificada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 text-base leading-relaxed">
                    Perfis autenticados, avaliações reais e sistema de reputação confiável para viagens seguras e divertidas.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="group text-center bg-white/80 backdrop-blur-sm border border-white/40 hover:bg-white/95 hover:shadow-2xl hover:scale-105 transition-all duration-500 h-full">
                <CardHeader className="pb-4">
                  <motion.div 
                    className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Heart className="w-12 h-12 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Experiências Únicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 text-base leading-relaxed">
                    Viva aventuras autênticas e faça amizades que duram para sempre com companheiros de viagem compatíveis.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section with gradient */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-indigo-400 to-cyan-400 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium">Comece Agora</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Sua próxima aventura
              </span>
              <br />
              <span className="text-white">começa aqui</span>
            </h2>

            <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Junte-se a mais de <span className="font-bold text-yellow-400">2.8k viajantes</span> que já descobriram uma nova forma de explorar o mundo com <span className="font-bold text-green-400">65% de economia</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-8 py-4 text-lg rounded-full shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300">
                <Link href="/auth">
                  <Users className="mr-2 h-5 w-5" />
                  Criar Conta Grátis
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white hover:text-slate-900 px-8 py-4 text-lg rounded-full transition-all duration-300">
                <Link href="/search">
                  <Compass className="mr-2 h-5 w-5" />
                  Explorar Viagens
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Plane className="h-8 w-8 text-yellow-400" />
                <span className="font-heading font-bold text-2xl bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">PartiuTrip</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Conectamos viajantes, reduzimos custos e criamos experiências inesquecíveis ao redor do mundo.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
                  <span className="text-blue-400">f</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
                  <span className="text-sky-400">t</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
                  <span className="text-pink-400">i</span>
                </div>
              </div>
            </div>

            {/* Platform */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-white">Plataforma</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/search" className="hover:text-yellow-400 transition-colors">Buscar Viagens</Link></li>
                <li><Link href="/create-trip" className="hover:text-yellow-400 transition-colors">Criar Viagem</Link></li>
                <li><Link href="/dashboard" className="hover:text-yellow-400 transition-colors">Meu Painel</Link></li>
                <li><Link href="/auth" className="hover:text-yellow-400 transition-colors">Cadastrar-se</Link></li>
              </ul>
            </div>

            {/* Destinos */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-white">Destinos Populares</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/search?region=europa" className="hover:text-yellow-400 transition-colors">Europa</Link></li>
                <li><Link href="/search?region=asia" className="hover:text-yellow-400 transition-colors">Ásia</Link></li>
                <li><Link href="/search?region=america" className="hover:text-yellow-400 transition-colors">América do Sul</Link></li>
                <li><Link href="/search?region=oceania" className="hover:text-yellow-400 transition-colors">Oceania</Link></li>
              </ul>
            </div>

            {/* Suporte */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-white">Suporte</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/profile" className="hover:text-yellow-400 transition-colors">Central de Ajuda</Link></li>
                <li><Link href="/profile" className="hover:text-yellow-400 transition-colors">Segurança</Link></li>
                <li><span className="hover:text-yellow-400 cursor-pointer transition-colors">Termos de Uso</span></li>
                <li><span className="hover:text-yellow-400 cursor-pointer transition-colors">Privacidade</span></li>
              </ul>
            </div>
          </div>

          {/* Stats & Bottom */}
          <div className="border-t border-slate-800 mt-12 pt-8">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">2.8k+</div>
                <div className="text-slate-400">Viajantes Conectados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">65%</div>
                <div className="text-slate-400">Economia Média</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">85+</div>
                <div className="text-slate-400">Destinos Disponíveis</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
              <p>&copy; 2025 PartiuTrip. Todos os direitos reservados.</p>
              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <Shield className="w-4 h-4" />
                <span>Plataforma segura e verificada</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// The code has been updated to change the brand name from "ViajaJunto" to "PartiuTrip" in the footer section.