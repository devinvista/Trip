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

// PartiuTrip Travel Globe SVG Component - Inspired by the logo
const CommunityLighthouseSVG = ({ className = "" }: { className?: string }) => (
  <svg 
    viewBox="0 0 400 600" 
    className={className}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Space Background with Stars */}
    <rect width="400" height="600" fill="url(#spaceGradient)" />
    
    {/* Twinkling Stars */}
    <circle cx="80" cy="80" r="1.5" fill="#FFD700" className="animate-pulse" />
    <circle cx="320" cy="60" r="1" fill="#FFD700" className="animate-pulse" style={{animationDelay: '0.5s'}} />
    <circle cx="60" cy="140" r="1.5" fill="#FFD700" className="animate-pulse" style={{animationDelay: '1s'}} />
    <circle cx="350" cy="120" r="1" fill="#FFD700" className="animate-pulse" style={{animationDelay: '1.5s'}} />
    <circle cx="100" cy="200" r="1.5" fill="#FFD700" className="animate-pulse" style={{animationDelay: '2s'}} />
    <circle cx="330" cy="180" r="1" fill="#FFD700" className="animate-pulse" style={{animationDelay: '2.5s'}} />

    {/* Central Earth Globe - Dark Blue */}
    <circle cx="200" cy="350" r="120" fill="url(#globeGradient)" />
    
    {/* Continents on Globe - Simplified shapes */}
    <g fill="#1e40af" opacity="0.8">
      {/* North America */}
      <path d="M140 280 Q150 270 160 280 Q170 285 165 295 Q155 300 145 295 Q135 285 140 280 Z" />
      
      {/* South America */}
      <path d="M155 320 Q160 310 165 320 Q170 340 165 360 Q160 370 155 365 Q150 350 155 320 Z" />
      
      {/* Europe/Africa */}
      <path d="M200 270 Q210 265 220 270 Q225 280 220 290 Q215 310 210 330 Q205 350 200 345 Q195 325 200 270 Z" />
      
      {/* Asia */}
      <path d="M230 280 Q250 275 260 285 Q255 295 250 300 Q240 305 235 300 Q225 290 230 280 Z" />
      
      {/* Australia */}
      <path d="M245 380 Q255 375 265 380 Q260 390 250 385 Q240 385 245 380 Z" />
    </g>

    {/* Globe Orbital Rings - Representing Flight Paths */}
    <ellipse cx="200" cy="350" rx="140" ry="30" fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.3" />
    <ellipse cx="200" cy="350" rx="160" ry="40" fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.2" />
    <ellipse cx="200" cy="350" rx="180" ry="50" fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.1" />

    {/* Golden Airplane - Circling the Globe */}
    <g className="animate-spin" style={{transformOrigin: '200px 350px', animationDuration: '8s'}}>
      <g transform="translate(340, 350)">
        {/* Airplane Body */}
        <ellipse cx="0" cy="0" rx="12" ry="3" fill="#FFD700" />
        
        {/* Wings */}
        <ellipse cx="-2" cy="0" rx="8" ry="2" fill="#FFA500" />
        <rect x="-8" y="-1" width="16" height="2" fill="#FFD700" rx="1" />
        
        {/* Tail */}
        <path d="M-10 0 L-15 -3 L-12 0 L-15 3 Z" fill="#FFA500" />
        
        {/* Propeller */}
        <circle cx="10" cy="0" r="1" fill="#FFD700" />
        <rect x="9" y="-3" width="2" height="6" fill="#FFD700" rx="1" className="animate-spin" style={{animationDuration: '0.2s'}} />
      </g>
    </g>

    {/* Secondary Airplane - Smaller, different orbital path */}
    <g className="animate-spin" style={{transformOrigin: '200px 350px', animationDuration: '12s', animationDirection: 'reverse'}}>
      <g transform="translate(80, 380)">
        {/* Smaller Airplane Body */}
        <ellipse cx="0" cy="0" rx="8" ry="2" fill="#FFD700" />
        
        {/* Wings */}
        <ellipse cx="-1" cy="0" rx="6" ry="1.5" fill="#FFA500" />
        <rect x="-6" y="-0.5" width="12" height="1" fill="#FFD700" rx="0.5" />
        
        {/* Tail */}
        <path d="M-6 0 L-10 -2 L-8 0 L-10 2 Z" fill="#FFA500" />
        
        {/* Propeller */}
        <circle cx="6" cy="0" r="0.5" fill="#FFD700" />
        <rect x="5.5" y="-2" width="1" height="4" fill="#FFD700" rx="0.5" className="animate-spin" style={{animationDuration: '0.15s'}} />
      </g>
    </g>

    {/* Travel Connections - Lines connecting different destinations */}
    <g stroke="#FFD700" strokeWidth="1" opacity="0.4" fill="none" className="animate-pulse">
      <path d="M140 280 Q200 250 260 285" strokeDasharray="5,5" />
      <path d="M155 320 Q200 300 245 380" strokeDasharray="3,3" />
      <path d="M200 270 Q180 320 155 320" strokeDasharray="4,4" />
    </g>

    {/* Floating Travel Icons Around Globe */}
    <g className="animate-pulse">
      {/* Suitcase */}
      <g transform="translate(120, 250)">
        <rect x="0" y="0" width="16" height="12" fill="#FFD700" rx="2" />
        <rect x="2" y="2" width="12" height="8" fill="#FFA500" rx="1" />
        <circle cx="8" cy="6" r="1" fill="#FFD700" />
      </g>
      
      {/* Camera */}
      <g transform="translate(280, 280)" style={{animationDelay: '0.5s'}}>
        <rect x="0" y="0" width="14" height="10" fill="#FFD700" rx="2" />
        <circle cx="7" cy="5" r="3" fill="#1e40af" />
        <circle cx="7" cy="5" r="2" fill="#FFD700" />
      </g>
      
      {/* Compass */}
      <g transform="translate(100, 420)" style={{animationDelay: '1s'}}>
        <circle cx="8" cy="8" r="8" fill="#FFD700" />
        <circle cx="8" cy="8" r="6" fill="#1e40af" />
        <path d="M8 2 L10 8 L8 14 L6 8 Z" fill="#FFD700" />
      </g>
      
      {/* Map */}
      <g transform="translate(300, 420)" style={{animationDelay: '1.5s'}}>
        <rect x="0" y="0" width="18" height="12" fill="#FFD700" rx="1" />
        <path d="M2 2 L8 6 L14 2 L16 10 L2 10 Z" fill="#1e40af" />
      </g>
    </g>

    {/* PartiuTrip Logo Text Effect */}
    <text x="200" y="520" textAnchor="middle" className="text-2xl font-bold" fill="url(#textGradient)">
      PartiuTrip
    </text>
    
    {/* Subtitle */}
    <text x="200" y="545" textAnchor="middle" className="text-sm" fill="#FFD700" opacity="0.8">
      Conectando Viajantes pelo Mundo
    </text>

    {/* Definitions */}
    <defs>
      <linearGradient id="spaceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      
      <radialGradient id="globeGradient" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="60%" stopColor="#1e40af" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </radialGradient>
      
      <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FFA500" />
        <stop offset="100%" stopColor="#FF8C00" />
      </linearGradient>
    </defs>
  </svg>
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
                <li><Link href="/search" className="relative z-10 hover:text-yellow-400 transition-colors cursor-pointer">Buscar Viagens</Link></li>
                <li><Link href="/create-trip" className="relative z-10 hover:text-yellow-400 transition-colors cursor-pointer">Criar Viagem</Link></li>
                <li><Link href="/dashboard" className="relative z-10 hover:text-yellow-400 transition-colors cursor-pointer">Meu Painel</Link></li>
                <li><Link href="/auth" className="relative z-10 hover:text-yellow-400 transition-colors cursor-pointer">Cadastrar-se</Link></li>
              </ul>
            </div>

            {/* Destinos */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-white">Destinos Populares</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/search?region=europa" className="relative z-10 hover:text-yellow-400 transition-colors cursor-pointer">Europa</Link></li>
                <li><Link href="/search?region=asia" className="relative z-10 hover:text-yellow-400 transition-colors cursor-pointer">Ásia</Link></li>
                <li><Link href="/search?region=america" className="relative z-10 hover:text-yellow-400 transition-colors cursor-pointer">América do Sul</Link></li>
                <li><Link href="/search?region=oceania" className="relative z-10 hover:text-yellow-400 transition-colors cursor-pointer">Oceania</Link></li>
              </ul>
            </div>

            {/* Suporte */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-white">Suporte</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/profile" className="relative z-10 hover:text-yellow-400 transition-colors cursor-pointer">Central de Ajuda</Link></li>
                <li><Link href="/profile" className="relative z-10 hover:text-yellow-400 transition-colors cursor-pointer">Segurança</Link></li>
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