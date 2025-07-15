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
import { AnimatedPreloader } from "@/components/ui/animated-preloader";

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

// PartiuTrip Interactive Travel Animation Component
const TravelAnimation = ({ className = "" }: { className?: string }) => (
  <div className={`relative ${className}`}>
    {/* Main Animation Container */}
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Animated Preloader with Custom Styling */}
      <div className="relative">
        <AnimatedPreloader 
          message=""
          className="transform scale-110"
        />
      </div>
    </div>
    
    {/* Interactive Elements Below Animation */}
  
  </div>
);

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
                <span className="text-blue-600 font-semibold"> Divida custos</span>, troque experiências 
                e descubra o mundo de forma mais inteligente e econômica.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-6 rounded-full shadow-xl shadow-blue-500/25 transform hover:scale-105 transition-all">
                  <Link href="/search">
                    <Users className="mr-2 h-5 w-5" />
                    Encontrar Viagem
                  </Link>
                </Button>
                <Button asChild size="lg" className="bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white font-semibold px-8 py-6 rounded-full shadow-xl shadow-purple-500/25 transform hover:scale-105 transition-all">
                  <Link href="/activities">
                    <Calendar className="mr-2 h-5 w-5" />
                    Explorar Atividades
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

            {/* Right Content - Interactive Globe */}
            <motion.div
              className="relative h-96 lg:h-[600px] flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Interactive Globe Container */}
              <div className="relative w-full h-full max-w-lg">
                {/* Background Glow Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Globe Component */}
                <motion.div
                  className="relative z-10 w-full h-full"
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                >
                  <TravelAnimation className="w-full h-full" />
                </motion.div>

                {/* Floating Action Buttons around Preloader - com z-index corrigido */}
                <motion.div
                  className="absolute top-12 left-12 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg cursor-pointer group z-20"
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 10, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{
                    scale: 1.15,
                    rotate: 15,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Users className="w-6 h-6 text-blue-600 group-hover:text-blue-500 transition-colors" />
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                    Comunidade Verificada
                  </div>
                </motion.div>

                <motion.div
                  className="absolute bottom-12 right-12 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg cursor-pointer group z-20"
                  animate={{
                    y: [0, 20, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{
                    scale: 1.15,
                    rotate: -15,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <DollarSign className="w-6 h-6 text-green-600 group-hover:text-green-500 transition-colors" />
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                    Economize até 65%
                  </div>
                </motion.div>

                <motion.div
                  className="absolute top-28 right-8 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg cursor-pointer group z-20"
                  animate={{
                    x: [0, 15, 0],
                    y: [0, -15, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{
                    scale: 1.15,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="w-6 h-6 text-blue-600 group-hover:text-blue-500 transition-colors" />
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                    Experiências Únicas
                  </div>
                </motion.div>

                <motion.div
                  className="absolute bottom-28 left-8 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg cursor-pointer group z-20"
                  animate={{
                    x: [0, -15, 0],
                    y: [0, 15, 0],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{
                    scale: 1.15,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Globe className="w-6 h-6 text-indigo-600 group-hover:text-indigo-500 transition-colors" />
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                    85+ Destinos
                  </div>
                </motion.div>

                {/* Animated Stats Badges - com z-index corrigido */}
                <motion.div
                  className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full px-4 py-2 shadow-lg z-20"
                  animate={{
                    y: [0, -10, 0],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="text-sm font-bold">2.8k+ Viajantes</div>
                </motion.div>

                <motion.div
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full px-4 py-2 shadow-lg z-20"
                  animate={{
                    y: [0, 10, 0],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="text-sm font-bold">1.2k+ Experiências</div>
                </motion.div>
              </div>
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
            <Button asChild className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all">
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
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-4 text-lg rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
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
      <footer className="relative z-50 bg-slate-900 text-white border-t border-slate-800">
        <div className="container mx-auto px-4 py-16 relative z-10">
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
                <li><Link href="/search" className="relative z-10 hover:text-blue-400 transition-colors cursor-pointer">Buscar Viagens</Link></li>
                <li><Link href="/create-trip" className="relative z-10 hover:text-blue-400 transition-colors cursor-pointer">Criar Viagem</Link></li>
                <li><Link href="/dashboard" className="relative z-10 hover:text-blue-400 transition-colors cursor-pointer">Meu Painel</Link></li>
                <li><Link href="/auth" className="relative z-10 hover:text-blue-400 transition-colors cursor-pointer">Cadastrar-se</Link></li>
              </ul>
            </div>

            {/* Destinos */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-white">Destinos Populares</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/search?region=europa" className="relative z-10 hover:text-blue-400 transition-colors cursor-pointer">Europa</Link></li>
                <li><Link href="/search?region=asia" className="relative z-10 hover:text-blue-400 transition-colors cursor-pointer">Ásia</Link></li>
                <li><Link href="/search?region=america" className="relative z-10 hover:text-blue-400 transition-colors cursor-pointer">América do Sul</Link></li>
                <li><Link href="/search?region=oceania" className="relative z-10 hover:text-blue-400 transition-colors cursor-pointer">Oceania</Link></li>
              </ul>
            </div>

            {/* Suporte */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-white">Suporte</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/profile" className="relative z-10 hover:text-blue-400 transition-colors cursor-pointer">Central de Ajuda</Link></li>
                <li><Link href="/profile" className="relative z-10 hover:text-blue-400 transition-colors cursor-pointer">Segurança</Link></li>
                <li><Link href="/terms-of-service" className="relative z-10 hover:text-blue-400 transition-colors cursor-pointer">Termos de Uso</Link></li>
                <li><Link href="/privacy-policy" className="relative z-10 hover:text-blue-400 transition-colors cursor-pointer">Privacidade</Link></li>
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