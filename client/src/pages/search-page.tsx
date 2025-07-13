import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { TripCard } from "@/components/trip-card";
import { TripCardSkeleton } from "@/components/trip-card-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  MapPin, 
  Calendar,
  DollarSign,
  Globe,
  Mountain,
  Waves,
  Building,
  TreePine,
  Snowflake,
  Plane,
  Ship,
  Camera,
  Star,
  Users,
  Clock,
  TrendingUp,
  X,
  ChevronDown,
  ChevronUp,
  Navigation,
  Compass,
  Zap
} from "lucide-react";
import { PlacesAutocomplete } from "@/components/places-autocomplete";
import { LoadingSpinner } from "@/components/loading-spinner";
import { motion, AnimatePresence } from "framer-motion";

const continents = [
  { id: 'america-sul', name: 'América do Sul', icon: Mountain, color: 'bg-green-500' },
  { id: 'america-norte', name: 'América do Norte', icon: Building, color: 'bg-blue-500' },
  { id: 'europa', name: 'Europa', icon: Globe, color: 'bg-purple-500' },
  { id: 'asia', name: 'Ásia', icon: TreePine, color: 'bg-orange-500' },
  { id: 'africa', name: 'África', icon: Mountain, color: 'bg-yellow-500' },
  { id: 'oceania', name: 'Oceania', icon: Waves, color: 'bg-teal-500' },
  { id: 'brasil', name: 'Brasil', icon: Star, color: 'bg-emerald-500' },
];

const travelTypes = [
  { id: 'praia', name: 'Praia', icon: Waves, color: 'from-blue-400 to-cyan-300' },
  { id: 'aventura', name: 'Aventura', icon: Mountain, color: 'from-green-500 to-emerald-400' },
  { id: 'urbanas', name: 'Urbanas', icon: Building, color: 'from-gray-500 to-slate-400' },
  { id: 'cultural', name: 'Cultural', icon: Camera, color: 'from-purple-500 to-violet-400' },
  { id: 'natureza', name: 'Natureza', icon: TreePine, color: 'from-green-600 to-lime-500' },
  { id: 'neve', name: 'Neve', icon: Snowflake, color: 'from-blue-300 to-white' },
  { id: 'cruzeiros', name: 'Cruzeiros', icon: Ship, color: 'from-indigo-500 to-blue-400' },
  { id: 'parques', name: 'Parques Temáticos', icon: Star, color: 'from-pink-500 to-rose-400' },
];

const budgetRanges = [
  { id: 'budget-1', label: 'Até R$ 500', value: 500, color: 'bg-green-100 text-green-800' },
  { id: 'budget-2', label: 'R$ 500 - R$ 1.500', value: 1500, color: 'bg-blue-100 text-blue-800' },
  { id: 'budget-3', label: 'R$ 1.500 - R$ 3.000', value: 3000, color: 'bg-purple-100 text-purple-800' },
  { id: 'budget-4', label: 'R$ 3.000 - R$ 5.000', value: 5000, color: 'bg-orange-100 text-orange-800' },
  { id: 'budget-5', label: 'Acima de R$ 5.000', value: 10000, color: 'bg-red-100 text-red-800' },
];

const dateFilters = [
  { id: 'next-week', label: 'Próxima Semana', icon: Clock, color: 'bg-emerald-100 text-emerald-800' },
  { id: 'next-two-weeks', label: 'Próximas 2 Semanas', icon: Clock, color: 'bg-blue-100 text-blue-800' },
  { id: 'next-month', label: 'Próximo Mês', icon: Calendar, color: 'bg-purple-100 text-purple-800' },
  { id: 'next-three-months', label: 'Próximos 3 Meses', icon: Calendar, color: 'bg-orange-100 text-orange-800' },
  { id: 'jan-2025', label: 'Janeiro 2025', icon: Calendar, color: 'bg-cyan-100 text-cyan-800' },
  { id: 'feb-2025', label: 'Fevereiro 2025', icon: Calendar, color: 'bg-pink-100 text-pink-800' },
  { id: 'mar-2025', label: 'Março 2025', icon: Calendar, color: 'bg-green-100 text-green-800' },
  { id: 'apr-2025', label: 'Abril 2025', icon: Calendar, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'may-2025', label: 'Maio 2025', icon: Calendar, color: 'bg-red-100 text-red-800' },
  { id: 'jun-2025', label: 'Junho 2025', icon: Calendar, color: 'bg-indigo-100 text-indigo-800' },
  { id: 'jul-2025', label: 'Julho 2025', icon: Calendar, color: 'bg-teal-100 text-teal-800' },
  { id: 'aug-2025', label: 'Agosto 2025', icon: Calendar, color: 'bg-purple-100 text-purple-800' },
  { id: 'sep-2025', label: 'Setembro 2025', icon: Calendar, color: 'bg-blue-100 text-blue-800' },
  { id: 'oct-2025', label: 'Outubro 2025', icon: Calendar, color: 'bg-orange-100 text-orange-800' },
  { id: 'nov-2025', label: 'Novembro 2025', icon: Calendar, color: 'bg-gray-100 text-gray-800' },
  { id: 'dec-2025', label: 'Dezembro 2025', icon: Calendar, color: 'bg-red-100 text-red-800' },
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("");
  const [selectedTravelTypes, setSelectedTravelTypes] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("date");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("");

  // Helper functions
  const toggleTravelType = (typeId: string) => {
    setSelectedTravelTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setDestination("");
    setSelectedContinent("");
    setSelectedTravelTypes([]);
    setBudgetRange([0, 10000]);
    setSelectedDateFilter("");
  };

  // Helper function to get date range from filter
  const getDateRangeFromFilter = (filterId: string) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filterId) {
      case 'next-week':
        return {
          start: startOfToday,
          end: new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000)
        };
      case 'next-two-weeks':
        return {
          start: startOfToday,
          end: new Date(startOfToday.getTime() + 14 * 24 * 60 * 60 * 1000)
        };
      case 'next-month':
        return {
          start: startOfToday,
          end: new Date(startOfToday.getTime() + 30 * 24 * 60 * 60 * 1000)
        };
      case 'next-three-months':
        return {
          start: startOfToday,
          end: new Date(startOfToday.getTime() + 90 * 24 * 60 * 60 * 1000)
        };
      case 'jan-2025':
        return { start: new Date(2025, 0, 1), end: new Date(2025, 0, 31) };
      case 'feb-2025':
        return { start: new Date(2025, 1, 1), end: new Date(2025, 1, 28) };
      case 'mar-2025':
        return { start: new Date(2025, 2, 1), end: new Date(2025, 2, 31) };
      case 'apr-2025':
        return { start: new Date(2025, 3, 1), end: new Date(2025, 3, 30) };
      case 'may-2025':
        return { start: new Date(2025, 4, 1), end: new Date(2025, 4, 31) };
      case 'jun-2025':
        return { start: new Date(2025, 5, 1), end: new Date(2025, 5, 30) };
      case 'jul-2025':
        return { start: new Date(2025, 6, 1), end: new Date(2025, 6, 31) };
      case 'aug-2025':
        return { start: new Date(2025, 7, 1), end: new Date(2025, 7, 31) };
      case 'sep-2025':
        return { start: new Date(2025, 8, 1), end: new Date(2025, 8, 30) };
      case 'oct-2025':
        return { start: new Date(2025, 9, 1), end: new Date(2025, 9, 31) };
      case 'nov-2025':
        return { start: new Date(2025, 10, 1), end: new Date(2025, 10, 30) };
      case 'dec-2025':
        return { start: new Date(2025, 11, 1), end: new Date(2025, 11, 31) };
      default:
        return null;
    }
  };

  // Build query parameters for API call
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (destination) params.destination = destination;
    if (selectedTravelTypes.length === 1) params.travelStyle = selectedTravelTypes[0];
    if (budgetRange[1] < 10000) params.budget = budgetRange[1].toString();
    return params;
  }, [destination, selectedTravelTypes, budgetRange]);

  const { data: trips = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/trips", queryParams],
    queryFn: async () => {
      const searchParams = new URLSearchParams(queryParams);
      const res = await fetch(`/api/trips?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch trips');
      return res.json();
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  // Advanced client-side filtering
  const filteredTrips = useMemo(() => {
    return trips.filter((trip: any) => {
      // Filter out past or completed trips - only show future trips
      const currentDate = new Date();
      const tripStartDate = new Date(trip.startDate);
      const tripEndDate = new Date(trip.endDate);
      
      // Show only trips that haven't started yet or are currently in progress
      if (tripEndDate < currentDate) {
        return false; // Trip is completed
      }

      // Text search filter
      if (searchTerm && searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        const titleMatch = trip.title?.toLowerCase().includes(searchLower);
        const destinationMatch = trip.destination?.toLowerCase().includes(searchLower);
        const descriptionMatch = trip.description?.toLowerCase().includes(searchLower);
        
        if (!titleMatch && !destinationMatch && !descriptionMatch) {
          return false;
        }
      }

      // Travel type filter
      if (selectedTravelTypes.length > 0 && !selectedTravelTypes.includes(trip.travelStyle)) {
        return false;
      }

      // Budget filter
      const tripBudget = trip.budget || 0;
      if (tripBudget < budgetRange[0] || tripBudget > budgetRange[1]) {
        return false;
      }

      // Continent filter
      if (selectedContinent && selectedContinent !== 'brasil') {
        const destination = trip.destination?.toLowerCase() || '';
        
        const continentKeywords = {
          'america-sul': ['chile', 'argentina', 'colombia', 'equador', 'venezuela', 'bolivia', 'peru', 'uruguai'],
          'america-norte': ['eua', 'estados unidos', 'nova york', 'california', 'canada', 'méxico', 'toronto', 'vancouver'],
          'europa': ['frança', 'itália', 'espanha', 'alemanha', 'portugal', 'inglaterra', 'london', 'paris', 'roma', 'madrid', 'barcelona'],
          'asia': ['japão', 'china', 'tailândia', 'singapura', 'coreia', 'índia', 'tokyo', 'beijing', 'bangkok'],
          'africa': ['egito', 'marrocos', 'áfrica do sul', 'cairo', 'casablanca'],
          'oceania': ['austrália', 'nova zelândia', 'sydney', 'melbourne', 'auckland']
        };

        const keywords = continentKeywords[selectedContinent as keyof typeof continentKeywords] || [];
        const hasMatch = keywords.some(keyword => destination.includes(keyword.toLowerCase()));
        if (!hasMatch) return false;
      }

      if (selectedContinent === 'brasil') {
        const destination = trip.destination?.toLowerCase() || '';
        const internationalKeywords = ['eua', 'frança', 'itália', 'japão', 'argentina', 'chile', 'nova york', 'paris', 'tokyo'];
        const isInternational = internationalKeywords.some(keyword => destination.includes(keyword));
        if (isInternational) return false;
      }

      // Date filter
      if (selectedDateFilter) {
        const dateRange = getDateRangeFromFilter(selectedDateFilter);
        if (dateRange) {
          const tripStartDate = new Date(trip.startDate);
          if (tripStartDate < dateRange.start || tripStartDate > dateRange.end) {
            return false;
          }
        }
      }

      return true;
    });
  }, [trips, searchTerm, selectedTravelTypes, budgetRange, selectedContinent]);

  // Client-side sorting
  const sortedTrips = useMemo(() => {
    return [...filteredTrips].sort((a: any, b: any) => {
      switch (sortBy) {
        case "date":
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case "price-low":
          return (a.budget || 0) - (b.budget || 0);
        case "price-high":
          return (b.budget || 0) - (a.budget || 0);
        case "popularity":
          return (b.currentParticipants || 0) - (a.currentParticipants || 0);
        default:
          return 0;
      }
    });
  }, [filteredTrips, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section with Lighthouse Theme */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl mb-12 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-700/20 to-purple-800/20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
          </div>
          
          {/* Lighthouse SVG with Animation */}
          <motion.div 
            className="absolute right-8 bottom-8 opacity-40"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg width="120" height="160" viewBox="0 0 120 160" className="text-yellow-200">
              {/* Lighthouse Base */}
              <rect x="45" y="140" width="30" height="15" fill="currentColor" opacity="0.8"/>
              {/* Lighthouse Body */}
              <polygon points="48,140 52,20 68,20 72,140" fill="currentColor" opacity="0.6"/>
              {/* Lighthouse Stripes */}
              <rect x="48" y="30" width="24" height="4" fill="white" opacity="0.4"/>
              <rect x="48" y="50" width="24" height="4" fill="white" opacity="0.4"/>
              <rect x="48" y="70" width="24" height="4" fill="white" opacity="0.4"/>
              <rect x="48" y="90" width="24" height="4" fill="white" opacity="0.4"/>
              <rect x="48" y="110" width="24" height="4" fill="white" opacity="0.4"/>
              <rect x="48" y="130" width="24" height="4" fill="white" opacity="0.4"/>
              {/* Lighthouse Top */}
              <rect x="46" y="15" width="28" height="8" fill="currentColor" opacity="0.8"/>
              {/* Light Beam */}
              <polygon points="60,20 30,5 30,35" fill="yellow" opacity="0.3"/>
              <polygon points="60,20 90,5 90,35" fill="yellow" opacity="0.2"/>
              {/* Light Source */}
              <circle cx="60" cy="19" r="3" fill="yellow" opacity="0.8"/>
            </svg>
          </motion.div>

          {/* Content */}
          <div className="relative z-10 px-8 py-8 text-center">
            
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-200 via-white to-blue-200 bg-clip-text text-transparent leading-tight"
            >
              Descubra destinos únicos e conecte-se com companheiros de viagem que compartilham seus sonhos
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-200 mb-1">250+</div>
                <div className="text-sm text-blue-100">Viagens Planejadas</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-300 mb-1">1.2k</div>
                <div className="text-sm text-blue-100">Viajantes Ativos</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">85+</div>
                <div className="text-sm text-blue-100">Destinos Únicos</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-cyan-300 mb-1">4.8★</div>
                <div className="text-sm text-blue-100">Experiências</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Buscar por destino, título ou descrição da viagem..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-lg border-0 focus:ring-2 focus:ring-blue-500 bg-white/80"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Travel Types Filter - Horizontal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Camera className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold">Tipos de Viagem</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {travelTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedTravelTypes.includes(type.id);
                  return (
                    <Button
                      key={type.id}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => toggleTravelType(type.id)}
                      className="flex items-center gap-2 h-10"
                    >
                      <Icon className="h-4 w-4" />
                      {type.name}
                      {isSelected && <Badge className="ml-1 bg-white text-primary">✓</Badge>}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Active Filters */}
            {(destination || selectedContinent || selectedTravelTypes.length > 0 || budgetRange[0] > 0 || budgetRange[1] < 10000 || selectedDateFilter) && (
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Filtros Ativos</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Limpar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {destination && (
                    <Badge variant="secondary" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {destination}
                    </Badge>
                  )}
                  {selectedContinent && (
                    <Badge variant="secondary" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      {continents.find(c => c.id === selectedContinent)?.name}
                    </Badge>
                  )}
                  {selectedTravelTypes.map(type => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {travelTypes.find(t => t.id === type)?.name}
                    </Badge>
                  ))}
                  {(budgetRange[0] > 0 || budgetRange[1] < 10000) && (
                    <Badge variant="secondary" className="text-xs">
                      <DollarSign className="h-3 w-3 mr-1" />
                      R$ {budgetRange[0]} - R$ {budgetRange[1] === 10000 ? '10k+' : budgetRange[1]}
                    </Badge>
                  )}
                  {selectedDateFilter && (
                    <Badge variant="secondary" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {dateFilters.find(d => d.id === selectedDateFilter)?.label}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Continent Filter */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5 text-blue-500" />
                  Continentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {continents.map((continent) => {
                  const Icon = continent.icon;
                  return (
                    <Button
                      key={continent.id}
                      variant={selectedContinent === continent.id ? "default" : "ghost"}
                      onClick={() => setSelectedContinent(selectedContinent === continent.id ? "" : continent.id)}
                      className="w-full justify-start h-12"
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {continent.name}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Date Filter */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-indigo-500" />
                  Período da Viagem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <div className="text-sm font-medium text-gray-700 mb-2">Próximos Períodos</div>
                  {dateFilters.slice(0, 4).map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <Button
                        key={filter.id}
                        variant={selectedDateFilter === filter.id ? "default" : "ghost"}
                        onClick={() => setSelectedDateFilter(selectedDateFilter === filter.id ? "" : filter.id)}
                        className="w-full justify-start h-10 text-sm"
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {filter.label}
                      </Button>
                    );
                  })}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Meses Específicos</div>
                  <Select value={selectedDateFilter} onValueChange={setSelectedDateFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um mês específico" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateFilters.slice(4).map((filter) => (
                        <SelectItem key={filter.id} value={filter.id}>
                          {filter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Budget Filter */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Orçamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="px-2">
                  <Slider
                    value={budgetRange}
                    onValueChange={setBudgetRange}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>R$ {budgetRange[0].toLocaleString()}</span>
                  <span>R$ {budgetRange[1] === 10000 ? '10k+' : budgetRange[1].toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {budgetRanges.map((range) => (
                    <Button
                      key={range.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (range.value === 10000) {
                          setBudgetRange([5000, 10000]);
                        } else if (range.value === 500) {
                          setBudgetRange([0, 500]);
                        } else if (range.value === 1500) {
                          setBudgetRange([500, 1500]);
                        } else if (range.value === 3000) {
                          setBudgetRange([1500, 3000]);
                        } else if (range.value === 5000) {
                          setBudgetRange([3000, 5000]);
                        }
                      }}
                      className="justify-start text-xs h-8"
                    >
                      <Badge className={`mr-2 ${range.color}`}>
                        {range.label}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Destination Input */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-red-500" />
                  Destino Específico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PlacesAutocomplete
                  value={destination}
                  onChange={setDestination}
                  placeholder="Digite um destino..."
                  className="w-full"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {filteredTrips.length > 0 ? `${filteredTrips.length} viagens encontradas` : 'Nenhuma viagem encontrada'}
                </h2>
                {isLoading && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
                    <span className="text-sm">Carregando...</span>
                  </div>
                )}
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-white/80">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Data da viagem</SelectItem>
                  <SelectItem value="price-low">Menor preço</SelectItem>
                  <SelectItem value="price-high">Maior preço</SelectItem>
                  <SelectItem value="popularity">Mais populares</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Grid */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <LoadingSpinner variant="travel" size="lg" message="Buscando viagens incríveis..." />
                </div>
              ) : sortedTrips.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {sortedTrips.map((trip, index) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <TripCard trip={trip} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="py-16">
                      <Search className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Nenhuma viagem encontrada</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Tente ajustar seus filtros ou buscar por termos diferentes. Que tal criar uma nova viagem?
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button onClick={clearAllFilters} variant="outline">
                          <Filter className="h-4 w-4 mr-2" />
                          Limpar Filtros
                        </Button>
                        <Button onClick={() => window.location.href = '/create-trip'}>
                          <Star className="h-4 w-4 mr-2" />
                          Criar Viagem
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}