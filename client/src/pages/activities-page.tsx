import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Heart,
  SlidersHorizontal,
  ArrowLeft,
  Grid,
  List,
  TrendingUp,
  Calendar,
  DollarSign,
  Award,
  Plus,
  ChevronRight,
  Target,
  Sparkles,
  Sliders,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { activityCategories } from "@shared/schema";
import type { Activity } from "@shared/schema";

interface ActivityFilters {
  search: string;
  category: string;
  priceRange: string;
  location: string;
  duration: string;
  difficulty: string;
  rating: string;
  sortBy: string;
  onlyMyTrips: boolean;
}

const PRICE_RANGES = [
  { value: "all", label: "Todos os preços" },
  { value: "free", label: "Grátis" },
  { value: "0-50", label: "Até R$ 50" },
  { value: "50-150", label: "R$ 50 - R$ 150" },
  { value: "150-300", label: "R$ 150 - R$ 300" },
  { value: "300+", label: "Acima de R$ 300" },
];

const DIFFICULTY_LEVELS = [
  { value: "all", label: "Todos os níveis" },
  { value: "easy", label: "Fácil" },
  { value: "moderate", label: "Moderado" },
  { value: "challenging", label: "Desafiador" },
];

const SORT_OPTIONS = [
  { value: "rating", label: "Melhor avaliação" },
  { value: "price_low", label: "Menor preço" },
  { value: "price_high", label: "Maior preço" },
  { value: "duration", label: "Duração" },
  { value: "newest", label: "Mais recentes" },
];

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<ActivityFilters>({
    search: "",
    category: "all",
    priceRange: "all",
    location: "",
    duration: "all",
    difficulty: "all",
    rating: "all",
    sortBy: "rating",
    onlyMyTrips: false,
  });

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  // Fetch user's trips to filter activities by destination
  const { data: myTripsData } = useQuery({
    queryKey: ["/api/my-trips"],
    queryFn: async () => {
      if (!user) return { created: [], participating: [] };
      try {
        const response = await fetch("/api/my-trips");
        if (!response.ok) return { created: [], participating: [] };
        return response.json();
      } catch (error) {
        console.error("Erro ao carregar viagens do usuário:", error);
        return { created: [], participating: [] };
      }
    },
    enabled: !!user,
    retry: false,
  });

  // Combine created and participating trips
  const userTrips = useMemo(() => {
    if (!myTripsData) return [];
    return [...(myTripsData.created || []), ...(myTripsData.participating || [])];
  }, [myTripsData]);

  const { data: activities, isLoading, isFetching } = useQuery<Activity[]>({
    queryKey: ["/api/activities", filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.category !== "all") params.set("category", filters.category);
        if (filters.priceRange !== "all") params.set("priceRange", filters.priceRange);
        if (filters.location) params.set("location", filters.location);
        if (filters.duration !== "all") params.set("duration", filters.duration);
        if (filters.difficulty !== "all") params.set("difficulty", filters.difficulty);
        if (filters.rating !== "all") params.set("rating", filters.rating);
        params.set("sortBy", filters.sortBy);
        
        const response = await fetch(`/api/activities?${params}`);
        if (!response.ok) throw new Error("Falha ao carregar atividades");
        return response.json();
      } catch (error) {
        console.error("Erro ao carregar atividades:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateFilter = (key: keyof ActivityFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  const formatPrice = (priceType: string, priceAmount: number | null) => {
    if (!priceAmount) return "Grátis";
    
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceAmount);

    return priceType === "per_person" 
      ? `${formatted}/pessoa`
      : priceType === "per_group"
      ? `${formatted}/grupo`
      : formatted;
  };

  // Get user trip destinations for filtering
  const userTripDestinations = useMemo(() => {
    if (!userTrips || !user) return new Set();
    return new Set(userTrips.map((trip: any) => trip.destination));
  }, [userTrips, user]);

  // Filter activities based on user's trip destinations
  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    
    if (filters.onlyMyTrips && user) {
      return activities.filter(activity => {
        const activityCity = activity.location.split(',')[0].trim();
        return Array.from(userTripDestinations).some(destination => 
          destination.includes(activityCity) || activityCity.includes(destination)
        );
      });
    }
    
    return activities;
  }, [activities, filters.onlyMyTrips, userTripDestinations, user]);

  // Group activities by city/destination
  const groupedActivities = useMemo(() => {
    if (!filteredActivities) return {};
    
    const grouped = filteredActivities.reduce((acc, activity) => {
      const city = activity.location.split(',')[0].trim();
      if (!acc[city]) acc[city] = [];
      acc[city].push(activity);
      return acc;
    }, {} as Record<string, Activity[]>);
    
    return grouped;
  }, [filteredActivities]);

  // Get suggestions based on most popular and best-rated activities
  const suggestedActivities = useMemo(() => {
    if (!activities) return [];
    
    // Sort by rating and popularity (total ratings)
    const sorted = [...activities].sort((a, b) => {
      const aScore = Number(a.averageRating) * Math.log(a.totalRatings + 1);
      const bScore = Number(b.averageRating) * Math.log(b.totalRatings + 1);
      return bScore - aScore;
    });
    
    return sorted.slice(0, 6); // Top 6 suggestions
  }, [activities]);

  // Get suggestions based on user's upcoming trips destinations
  const upcomingTripsSuggestions = useMemo(() => {
    if (!activities || !userTrips || !user) return [];
    
    // Get upcoming trips destinations
    const upcomingTrips = userTrips.filter((trip: any) => {
      const tripDate = new Date(trip.startDate);
      const now = new Date();
      return tripDate > now;
    });
    
    if (upcomingTrips.length === 0) return [];
    
    // Extract destinations from upcoming trips
    const upcomingDestinations = upcomingTrips.map((trip: any) => trip.destination);
    
    // Filter activities that match upcoming destinations
    const matchingActivities = activities.filter(activity => {
      const activityCity = activity.location.split(',')[0].trim();
      return upcomingDestinations.some(destination => 
        destination.toLowerCase().includes(activityCity.toLowerCase()) || 
        activityCity.toLowerCase().includes(destination.toLowerCase())
      );
    });
    
    // Sort by rating and return top suggestions
    const sorted = matchingActivities.sort((a, b) => {
      const aScore = Number(a.averageRating) * Math.log(a.totalRatings + 1);
      const bScore = Number(b.averageRating) * Math.log(b.totalRatings + 1);
      return bScore - aScore;
    });
    
    return sorted.slice(0, 6);
  }, [activities, userTrips, user]);

  const cities = Object.keys(groupedActivities).sort();

  // Show full preloader only on initial load
  if (isLoading && !activities) {
    return (
      <div className="min-h-screen bg-[#F5F9FC] flex items-center justify-center">
        <LoadingSpinner variant="travel" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9FC]">
      {/* Modern Header with Institutional Colors */}
      <div className="bg-white shadow-sm border-b border-[#AAB0B7]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-6">
              <Link to="/search">
                <Button variant="ghost" size="sm" className="text-[#1B2B49] hover:bg-[#41B6FF]/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1B2B49] mb-1 md:mb-2">
                  Atividades e Experiências
                </h1>
                <p className="text-[#AAB0B7] text-sm md:text-lg">
                  Descubra experiências incríveis para sua viagem • {filteredActivities?.length || 0} atividades disponíveis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="border-[#AAB0B7]/30 hover:bg-[#41B6FF]/10"
              >
                {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                <span className="hidden sm:inline ml-2">
                  {viewMode === "grid" ? "Lista" : "Grade"}
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-[#AAB0B7]/30 hover:bg-[#41B6FF]/10"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions Section */}
      {suggestedActivities.length > 0 && (
        <div className="bg-white border-b border-[#AAB0B7]/20">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FFA500]" />
                <h2 className="text-lg font-semibold text-[#1B2B49]">Sugestões para Você</h2>
                <Badge variant="outline" className="bg-[#FFA500]/10 text-[#FFA500] border-[#FFA500]/20">
                  Mais escolhidas
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {suggestedActivities.map((activity) => (
                <Link key={activity.id} to={`/activities/${activity.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="relative">
                      <img
                        src={activity.coverImage}
                        alt={activity.title}
                        className="w-full h-24 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                          <Star className="w-3 h-3 fill-[#FFA500] text-[#FFA500]" />
                          <span className="text-xs font-medium">{Number(activity.averageRating).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2 text-[#1B2B49] mb-1">
                        {activity.title}
                      </h3>
                      <p className="text-xs text-[#AAB0B7] mb-2">
                        {activity.location.split(',')[0]}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#1B2B49]">
                          {formatPrice(activity.priceType, activity.priceAmount)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {activityCategories[activity.category as keyof typeof activityCategories]?.icon}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Trips Suggestions - Only show if user is logged in and has upcoming trips */}
      {user && upcomingTripsSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-[#41B6FF]/5 to-[#41B6FF]/10 border-b border-[#AAB0B7]/20">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#41B6FF]" />
                <h2 className="text-lg font-semibold text-[#1B2B49]">Sugestões para Suas Próximas Viagens</h2>
                <Badge variant="outline" className="bg-[#41B6FF]/10 text-[#41B6FF] border-[#41B6FF]/20">
                  Baseado nos seus destinos
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {upcomingTripsSuggestions.map((activity) => (
                <Link key={activity.id} to={`/activities/${activity.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-[#41B6FF]/20">
                    <div className="relative">
                      <img
                        src={activity.coverImage}
                        alt={activity.title}
                        className="w-full h-24 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                          <Star className="w-3 h-3 fill-[#FFA500] text-[#FFA500]" />
                          <span className="text-xs font-medium">{Number(activity.averageRating).toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2">
                        <div className="bg-[#41B6FF] text-white rounded-full px-2 py-1 text-xs font-medium">
                          Próxima viagem
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2 text-[#1B2B49] mb-1">
                        {activity.title}
                      </h3>
                      <p className="text-xs text-[#AAB0B7] mb-2">
                        {activity.location.split(',')[0]}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#1B2B49]">
                          {formatPrice(activity.priceType, activity.priceAmount)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {activityCategories[activity.category as keyof typeof activityCategories]?.icon}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Popular Categories Section */}
      <div className="bg-white border-b border-[#AAB0B7]/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1B2B49]">Categorias Populares</h2>
            <Button variant="ghost" size="sm" className="text-[#41B6FF] hover:bg-[#41B6FF]/10">
              Ver todas <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Object.entries(activityCategories).slice(0, 8).map(([key, category]) => (
              <Button
                key={key}
                variant={filters.category === key ? "default" : "outline"}
                onClick={() => updateFilter("category", key)}
                className={`min-w-fit whitespace-nowrap ${
                  filters.category === key
                    ? "bg-[#41B6FF] hover:bg-[#41B6FF]/90 text-white"
                    : "border-[#AAB0B7]/30 hover:bg-[#41B6FF]/10"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Enhanced Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#AAB0B7] w-5 h-5" />
            <Input
              placeholder="Buscar atividades, experiências ou locais..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-12 pr-12 py-4 w-full text-base border-[#AAB0B7]/30 focus:border-[#41B6FF] focus:ring-[#41B6FF]/20 rounded-xl"
            />
            {isFetching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#41B6FF]"></div>
              </div>
            )}
          </div>
        </div>

        {/* Modern Filter Tabs - Similar to Dashboard */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#1B2B49]" />
                <span className="text-lg font-semibold text-[#1B2B49]">Filtros</span>
              </div>
              <div className="bg-slate-100 rounded-lg p-1 flex gap-1 overflow-x-auto min-w-fit">
                <Button
                  variant={filters.category === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => updateFilter("category", "all")}
                  className={`px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap ${
                    filters.category === "all" 
                      ? "bg-white shadow-sm text-slate-900" 
                      : "text-slate-600 hover:bg-white/50"
                  }`}
                >
                  🗂️ Todas
                  <span className="ml-1 bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-xs">
                    {activities?.length || 0}
                  </span>
                </Button>
                
                {Object.entries(activityCategories).slice(0, 4).map(([key, cat]) => {
                  const count = activities?.filter(a => a.category === key).length || 0;
                  return (
                    <Button
                      key={key}
                      variant={filters.category === key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => updateFilter("category", key)}
                      className={`px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap truncate ${
                        filters.category === key 
                          ? "bg-white shadow-sm text-slate-900" 
                          : "text-slate-600 hover:bg-white/50"
                      }`}
                    >
                      {cat.icon} <span className="hidden sm:inline">{cat.label}</span>
                      <span className="ml-1 bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-xs">
                        {count}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border-slate-200 hover:bg-slate-50"
            >
              <Filter className="w-4 h-4" />
              Mais filtros
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl border border-slate-200/60 p-4 md:p-6 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Faixa de Preço
                  </label>
                  <Select 
                    value={filters.priceRange} 
                    onValueChange={(value) => updateFilter("priceRange", value)}
                  >
                    <SelectTrigger className="border-slate-200 focus:border-blue-400">
                      <SelectValue placeholder="Todos os preços" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_RANGES.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Nível de Dificuldade
                  </label>
                  <Select 
                    value={filters.difficulty} 
                    onValueChange={(value) => updateFilter("difficulty", value)}
                  >
                    <SelectTrigger className="border-slate-200 focus:border-blue-400">
                      <SelectValue placeholder="Todos os níveis" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Ordenar por
                  </label>
                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value) => updateFilter("sortBy", value)}
                  >
                    <SelectTrigger className="border-slate-200 focus:border-blue-400">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Special Filters */}
              {user && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Target className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-900">
                          Apenas destinos das minhas viagens
                        </label>
                        <p className="text-xs text-slate-600 mt-1">
                          Mostra apenas atividades nos destinos onde você tem viagens planejadas
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={filters.onlyMyTrips}
                      onCheckedChange={(checked) => updateFilter("onlyMyTrips", checked)}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Activities Grouped by City - Enhanced Layout */}
        {cities.length > 0 ? (
          <div className="space-y-8">
            {cities.map((city) => (
              <div key={city} className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                {/* City Header - Enhanced */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200/60 p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <MapPin className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                          {city}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {groupedActivities[city].length} atividades
                          </Badge>
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                            {Math.round(groupedActivities[city].reduce((acc, a) => acc + Number(a.averageRating), 0) / groupedActivities[city].length * 10) / 10}★ média
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hidden sm:flex"
                    >
                      Ver todas <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Activities Grid - Improved */}
                <div className="p-4 md:p-6">
                  <div className={`grid gap-4 md:gap-6 ${
                    viewMode === "grid" 
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                      : "grid-cols-1"
                  }`}>
                    {groupedActivities[city].map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border-slate-200/60 hover:border-blue-300/60 group">
                        <div className="relative">
                          <img
                            src={activity.coverImage}
                            alt={activity.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <Button size="sm" variant="outline" className="bg-white/90 hover:bg-white backdrop-blur-sm">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Category Badge */}
                          <div className="absolute bottom-3 left-3">
                            <Badge variant="secondary" className="bg-white/90 text-[#1B2B49] backdrop-blur-sm">
                              {activityCategories[activity.category as keyof typeof activityCategories]?.label}
                            </Badge>
                          </div>

                          {/* Trending Badge */}
                          {Number(activity.averageRating) >= 4.5 && (
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-[#FFA500] text-white">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Trending
                              </Badge>
                            </div>
                          )}
                        </div>

                        <CardHeader className="pb-3 p-4 md:p-6">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-base md:text-lg line-clamp-2 text-[#1B2B49]">
                              {activity.title}
                            </h3>
                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                              <Star className="w-4 h-4 fill-[#FFA500] text-[#FFA500]" />
                              <span className="text-sm font-medium text-[#1B2B49]">
                                {Number(activity.averageRating).toFixed(1)}
                              </span>
                              <span className="text-xs text-[#AAB0B7]">
                                ({activity.totalRatings})
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-[#AAB0B7]">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{activity.location}</span>
                            </div>
                            {activity.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {activity.duration}
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 md:p-6">
                          <p className="text-[#AAB0B7] text-sm mb-4 line-clamp-3">
                            {activity.description}
                          </p>

                          {/* Multiple Budget Options - Mobile Optimized */}
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <DollarSign className="w-4 h-4 text-[#41B6FF]" />
                              <span className="text-sm font-medium text-[#1B2B49]">Opções de Orçamento</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="flex items-center justify-between p-2 bg-[#F5F9FC] rounded-lg">
                                <span className="text-xs sm:text-sm">Básica</span>
                                <span className="text-xs sm:text-sm font-medium text-[#1B2B49]">
                                  {formatPrice(activity.priceType, activity.priceAmount)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-[#F5F9FC] rounded-lg">
                                <span className="text-xs sm:text-sm">Completa</span>
                                <span className="text-xs sm:text-sm font-medium text-[#1B2B49]">
                                  {formatPrice(activity.priceType, (activity.priceAmount || 0) * 1.5)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-[#F5F9FC] rounded-lg">
                                <span className="text-xs sm:text-sm">Premium</span>
                                <span className="text-xs sm:text-sm font-medium text-[#1B2B49]">
                                  {formatPrice(activity.priceType, (activity.priceAmount || 0) * 2)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              {activity.difficultyLevel && (
                                <Badge variant="outline" className="text-xs border-[#AAB0B7]/30">
                                  {activity.difficultyLevel === "easy" && "Fácil"}
                                  {activity.difficultyLevel === "moderate" && "Moderado"}
                                  {activity.difficultyLevel === "challenging" && "Desafiador"}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs border-[#AAB0B7]/30">
                                <Users className="w-3 h-3 mr-1" />
                                {activity.priceType === "per_person" ? "Por pessoa" : "Por grupo"}
                              </Badge>
                            </div>

                            <div className="flex gap-2">
                              <Link to={`/activities/${activity.id}`}>
                                <Button size="sm" variant="outline" className="border-[#AAB0B7]/30 hover:bg-[#41B6FF]/10 text-xs sm:text-sm">
                                  Ver detalhes
                                </Button>
                              </Link>
                              <Button size="sm" className="bg-[#41B6FF] hover:bg-[#41B6FF]/90 text-white text-xs sm:text-sm">
                                <Plus className="w-4 h-4 mr-1" />
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[#41B6FF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-[#41B6FF]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1B2B49] mb-3">
              Nenhuma atividade encontrada
            </h3>
            <p className="text-[#AAB0B7] mb-6">
              Tente ajustar os filtros ou fazer uma nova busca para encontrar atividades incríveis.
            </p>
            <Button 
              onClick={() => {
                setFilters({
                  search: "",
                  category: "all",
                  priceRange: "all",
                  location: "",
                  duration: "all",
                  difficulty: "all",
                  rating: "all",
                  sortBy: "rating",
                  onlyMyTrips: false,
                });
                setSearchInput("");
              }}
              className="bg-[#41B6FF] hover:bg-[#41B6FF]/90 text-white"
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}