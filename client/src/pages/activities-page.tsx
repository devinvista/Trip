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
  ChevronDown,
  X,
  ArrowUpDown,
  Eye,
  Bookmark,
  Trophy,
  Plane,
  Navigation,
  TrendingDown,
  ArrowRight
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
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

const DURATION_OPTIONS = [
  { value: "all", label: "Qualquer duração" },
  { value: "1-2", label: "1-2 horas" },
  { value: "3-4", label: "3-4 horas" },
  { value: "5-8", label: "5-8 horas" },
  { value: "8+", label: "Dia inteiro" },
];

function ActivitiesPage() {
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
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

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

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (filters.priceRange !== "all") count++;
    if (filters.location !== "") count++;
    if (filters.duration !== "all") count++;
    if (filters.difficulty !== "all") count++;
    if (filters.rating !== "all") count++;
    if (filters.onlyMyTrips) count++;
    setActiveFiltersCount(count);
  }, [filters]);

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

  // Get upcoming trips (future trips)
  const upcomingTrips = useMemo(() => {
    if (!userTrips) return [];
    const now = new Date();
    return userTrips.filter((trip: any) => new Date(trip.startDate) > now);
  }, [userTrips]);

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

  const clearFilters = () => {
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

  // Top rated activities (4.5+ rating)
  const topActivities = useMemo(() => {
    if (!activities) return [];
    return activities
      .filter(activity => parseFloat(activity.averageRating) >= 4.5)
      .sort((a, b) => parseFloat(b.averageRating) - parseFloat(a.averageRating))
      .slice(0, 6);
  }, [activities]);

  // Activities for upcoming trips
  const activitiesForUpcomingTrips = useMemo(() => {
    if (!activities || !upcomingTrips.length) return [];
    
    // Get destination cities from upcoming trips
    const upcomingDestinations = upcomingTrips.map((trip: any) => {
      const city = trip.destination.split(',')[0].trim().toLowerCase();
      return city;
    });

    // Filter activities that match upcoming trip destinations
    return activities.filter(activity => {
      const activityCity = activity.location.split(',')[0].trim().toLowerCase();
      return upcomingDestinations.includes(activityCity);
    }).slice(0, 8);
  }, [activities, upcomingTrips]);

  // Group activities by travel style > destination > activity
  const groupedActivities = useMemo(() => {
    if (!activities) return {};
    
    const filtered = filters.onlyMyTrips && user ? 
      activities.filter(activity => {
        const activityCity = activity.location.split(',')[0].trim();
        return userTrips.some((trip: any) => {
          const tripCity = trip.destination.split(',')[0].trim();
          return tripCity.toLowerCase() === activityCity.toLowerCase();
        });
      }) : activities;

    const grouped: Record<string, Record<string, Activity[]>> = {};
    
    filtered.forEach(activity => {
      const category = activity.category || 'outros';
      const destination = activity.location.split(',')[0].trim();
      
      if (!grouped[category]) {
        grouped[category] = {};
      }
      
      if (!grouped[category][destination]) {
        grouped[category][destination] = [];
      }
      
      grouped[category][destination].push(activity);
    });

    return grouped;
  }, [activities, filters.onlyMyTrips, user, userTrips]);

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



  // Activity Card Component
  const ActivityCard = ({ activity }: { activity: Activity }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Link href={`/activities/${activity.id}`}>
        <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white hover:shadow-xl hover:-translate-y-1">
          <div className="relative">
            <img
              src={activity.imageUrl || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80"}
              alt={activity.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3">
              <Badge className="bg-white/90 text-gray-800 border-0">
                {activityCategories[activity.category]?.icon} {activityCategories[activity.category]?.label}
              </Badge>
            </div>
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-800">
                  {parseFloat(activity.averageRating).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {activity.title}
            </h3>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{activity.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{activity.duration || "2h"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{activity.difficultyLevel || "Fácil"}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg text-blue-600">
                  {formatPrice(activity.priceType, activity.priceAmount)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white rounded-xl p-12 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Descubra Atividades Incríveis
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Encontre as melhores experiências e atividades para suas próximas aventuras. 
              Explore destinos únicos e crie memórias inesquecíveis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                <Sparkles className="w-5 h-5 mr-2" />
                Explorar Atividades
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <MapPin className="w-5 h-5 mr-2" />
                Ver Por Destino
              </Button>
            </div>
          </div>
        </div>

        {/* Suggestions Sections */}
        {topActivities.length > 0 && (
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Melhores Avaliadas
              </h2>
              <p className="text-gray-600">
                Atividades com 4.5+ estrelas que você não pode perder
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {topActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
            {topActivities.length >= 6 && (
              <div className="text-center">
                <Button 
                  variant="outline"
                  onClick={() => updateFilter("rating", "4.5")}
                >
                  Ver Todas as Top Avaliadas
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </Card>
        )}

        {user && activitiesForUpcomingTrips.length > 0 && (
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                <Plane className="w-6 h-6 text-blue-500" />
                Para Suas Próximas Viagens
              </h2>
              <p className="text-gray-600 mb-4">
                Atividades perfeitas para os {upcomingTrips.length} destinos que você vai visitar
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {upcomingTrips.slice(0, 3).map((trip: any) => (
                  <Badge key={trip.id} variant="secondary">
                    <Calendar className="w-3 h-3 mr-1" />
                    {trip.destination} - {new Date(trip.startDate).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                  </Badge>
                ))}
                {upcomingTrips.length > 3 && (
                  <Badge variant="secondary">
                    +{upcomingTrips.length - 3} viagens
                  </Badge>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {activitiesForUpcomingTrips.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
            <div className="text-center">
              <Button 
                variant="outline"
                onClick={() => updateFilter("onlyMyTrips", true)}
              >
                Ver Todas Para Suas Viagens
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar atividades, locais ou experiências..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 pr-4 h-12 text-lg"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2">
              <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {Object.entries(activityCategories).map(([value, { label, icon }]) => (
                    <SelectItem key={value} value={value}>
                      {icon} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Advanced Filters Button */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle>Filtros Avançados</SheetTitle>
                    <SheetDescription>
                      Refine sua busca para encontrar as atividades perfeitas
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="space-y-6 mt-6">
                    {/* Price Range */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Preço
                      </h3>
                      <Select value={filters.priceRange} onValueChange={(value) => updateFilter("priceRange", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRICE_RANGES.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Duration */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Duração
                      </h3>
                      <Select value={filters.duration} onValueChange={(value) => updateFilter("duration", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Dificuldade
                      </h3>
                      <Select value={filters.difficulty} onValueChange={(value) => updateFilter("difficulty", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIFFICULTY_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Local
                      </h3>
                      <Input
                        placeholder="Cidade, estado ou região..."
                        value={filters.location}
                        onChange={(e) => updateFilter("location", e.target.value)}
                      />
                    </div>

                    {/* Only My Trips Toggle */}
                    {user && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Bookmark className="w-4 h-4" />
                            Apenas Minhas Viagens
                          </h3>
                          <Switch
                            checked={filters.onlyMyTrips}
                            onCheckedChange={(checked) => updateFilter("onlyMyTrips", checked)}
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          Mostrar apenas atividades nos destinos das suas viagens
                        </p>
                      </div>
                    )}

                    {/* Clear Filters */}
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="w-full"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Limpar Filtros ({activeFiltersCount})
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </Card>

        {/* Grouped Activities */}
        <div className="space-y-8">
          {Object.entries(groupedActivities).map(([category, destinations]) => {
            const categoryInfo = activityCategories[category] || { label: category, icon: '📍' };
            
            return (
              <Card key={category} className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="text-3xl">{categoryInfo.icon}</span>
                    {categoryInfo.label}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {Object.values(destinations).flat().length} atividades em {Object.keys(destinations).length} destinos
                  </p>
                </div>

                <div className="space-y-8">
                  {Object.entries(destinations).map(([destination, activities]) => (
                    <div key={destination}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          {destination}
                        </h3>
                        <Badge variant="outline" className="text-sm">
                          {activities.length} atividades
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {activities.map((activity) => (
                          <ActivityCard key={activity.id} activity={activity} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {Object.keys(groupedActivities).length === 0 && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhuma atividade encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                Tente ajustar seus filtros ou buscar por outros termos
              </p>
              <Button onClick={clearFilters} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ActivitiesPage;