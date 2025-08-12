import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatBrazilianCurrency } from '@shared/utils';
import { Navbar } from "@/components/navbar";
import { TripCard } from "@/components/trip-card";
import { SearchResultsSkeleton } from "@/components/ui/loading-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ErrorBoundary } from "@/components/ui/error-boundary";
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
  Zap,
  Plus
} from "lucide-react";
import { PlacesAutocomplete } from "@/components/places-autocomplete";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useDebounce } from "@/hooks/use-debounce";
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

// Generate dynamic date filters: current month + next 15 months
const generateDateFilters = () => {
  const now = new Date();
  const quickFilters = [
    { id: 'next-week', label: 'Próxima Semana', icon: Clock, color: 'bg-emerald-100 text-emerald-800' },
    { id: 'next-two-weeks', label: 'Próximas 2 Semanas', icon: Clock, color: 'bg-blue-100 text-blue-800' },
    { id: 'next-month', label: 'Próximo Mês', icon: Calendar, color: 'bg-purple-100 text-purple-800' },
    { id: 'next-three-months', label: 'Próximos 3 Meses', icon: Calendar, color: 'bg-orange-100 text-orange-800' },
  ];

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const colors = [
    'bg-cyan-100 text-cyan-800', 'bg-pink-100 text-pink-800', 'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800', 'bg-red-100 text-red-800', 'bg-indigo-100 text-indigo-800',
    'bg-teal-100 text-teal-800', 'bg-purple-100 text-purple-800', 'bg-blue-100 text-blue-800',
    'bg-orange-100 text-orange-800', 'bg-gray-100 text-gray-800', 'bg-rose-100 text-rose-800',
    'bg-emerald-100 text-emerald-800', 'bg-amber-100 text-amber-800', 'bg-lime-100 text-lime-800',
    'bg-violet-100 text-violet-800'
  ];

  const monthFilters = [];
  let currentDate = new Date(now.getFullYear(), now.getMonth(), 1);

  for (let i = 0; i < 16; i++) {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const monthName = monthNames[month];
    
    monthFilters.push({
      id: `${month}-${year}`,
      label: `${monthName} ${year}`,
      icon: Calendar,
      color: colors[i % colors.length],
      month,
      year
    });

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return [...quickFilters, ...monthFilters];
};

const dateFilters = generateDateFilters();

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
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
      default:
        // Handle dynamic month filters (format: "month-year")
        const monthFilter = dateFilters.find(filter => filter.id === filterId);
        if (monthFilter && 'month' in monthFilter && 'year' in monthFilter) {
          const month = Number(monthFilter.month);
          const year = Number(monthFilter.year);
          const startDate = new Date(year, month, 1);
          const endDate = new Date(year, month + 1, 0); // Last day of the month
          return { start: startDate, end: endDate };
        }
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
    const filtered = trips.filter((trip: any) => {
      // Filter out trips that have already started
      const currentDate = new Date();
      const tripStartDate = new Date(trip.start_date || trip.startDate);
      
      // Only show trips that haven't started yet (future trips)
      if (tripStartDate <= currentDate) {
        return false;
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
      if (selectedTravelTypes.length > 0 && !selectedTravelTypes.includes(trip.travel_style || trip.travelStyle)) {
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
          const tripStartDate = new Date(trip.start_date || trip.startDate);
          if (tripStartDate < dateRange.start || tripStartDate > dateRange.end) {
            return false;
          }
        }
      }

      return true;
    });
    
    return filtered;
  }, [trips, searchTerm, selectedTravelTypes, budgetRange, selectedContinent, selectedDateFilter]);

  // Client-side sorting
  const sortedTrips = useMemo(() => {
    return [...filteredTrips].sort((a: any, b: any) => {
      switch (sortBy) {
        case "date":
          return new Date(a.start_date || a.startDate).getTime() - new Date(b.start_date || b.startDate).getTime();
        case "price-low":
          return (a.budget || 0) - (b.budget || 0);
        case "price-high":
          return (b.budget || 0) - (a.budget || 0);
        case "popularity":
          return (b.current_participants || 0) - (a.current_participants || 0);
        default:
          return 0;
      }
    });
  }, [filteredTrips, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Modern Hero Section with Destination Gallery */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Background Image Gallery */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-6 h-full">
              <div className="bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80)'}}></div>
              <div className="bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80)'}}></div>
              <div className="bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80)'}}></div>
              <div className="bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1544718865-4c8eff1f3f8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80)'}}></div>
              <div className="bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1600298881974-6be191ceeda1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80)'}}></div>
              <div className="bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1516012669313-c1c15b8b6b13?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80)'}}></div>
            </div>
          </div>

          {/* Clean Content */}
          <div className="relative z-10 px-8 py-12 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-6">
                <Search className="h-4 w-4" />
                Encontre sua próxima aventura
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight"
            >
              Descubra <span className="text-blue-600">destinos únicos</span>
              <br />
              com companheiros ideais
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              Conecte-se com viajantes que compartilham seus interesses e descubra experiências inesquecíveis ao redor do mundo
            </motion.p>

            {/* Destination Preview Gallery */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-8"
            >
              <div className="flex justify-center items-center gap-4 mb-4">
                <div className="flex -space-x-2">
                  <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80)'}}></div>
                  <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80)'}}></div>
                  <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1513581166391-887a96ddeafd?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80)'}}></div>
                  <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80)'}}></div>
                  <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1600298881974-6be191ceeda1?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80)'}}></div>
                  <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1516012669313-c1c15b8b6b13?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80)'}}></div>
                  <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-semibold">
                    +80
                  </div>
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Rio de Janeiro • Fernando de Noronha • Coliseu • Chapada Diamantina • Pirâmides de Gizé • Bonito e muito mais
                </div>
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
                      {formatBrazilianCurrency(budgetRange[0])} - {budgetRange[1] === 10000 ? 'R$ 10k+' : formatBrazilianCurrency(budgetRange[1])}
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
                <SearchResultsSkeleton />
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
                      <div className="flex gap-3 justify-center flex-wrap">
                        <Button onClick={clearAllFilters} variant="outline">
                          <Filter className="h-4 w-4 mr-2" />
                          Limpar Filtros
                        </Button>
                        <Button onClick={() => window.location.href = '/activities'} variant="outline">
                          <Calendar className="h-4 w-4 mr-2" />
                          Ver Atividades
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