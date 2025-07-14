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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/loading-spinner";
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
  const [filters, setFilters] = useState<ActivityFilters>({
    search: "",
    category: "all",
    priceRange: "all",
    location: "",
    duration: "all",
    difficulty: "all",
    rating: "all",
    sortBy: "rating",
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

  const { data: activities, isLoading, isFetching } = useQuery<Activity[]>({
    queryKey: ["/api/activities", filters],
    queryFn: async () => {
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
    },
  });

  const updateFilter = (key: keyof ActivityFilters, value: string) => {
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

  // Group activities by city/destination
  const groupedActivities = useMemo(() => {
    if (!activities) return {};
    
    const grouped = activities.reduce((acc, activity) => {
      const city = activity.location.split(',')[0].trim();
      if (!acc[city]) acc[city] = [];
      acc[city].push(activity);
      return acc;
    }, {} as Record<string, Activity[]>);
    
    return grouped;
  }, [activities]);

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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/search">
                <Button variant="ghost" size="sm" className="text-[#1B2B49] hover:bg-[#41B6FF]/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              
              <div>
                <h1 className="text-3xl font-bold text-[#1B2B49] mb-2">
                  Atividades e Experiências
                </h1>
                <p className="text-[#AAB0B7] text-lg">
                  Descubra experiências incríveis para sua viagem • {activities?.length || 0} atividades disponíveis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="border-[#AAB0B7]/30 hover:bg-[#41B6FF]/10"
              >
                {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
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

        {/* Enhanced Filters */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 bg-white rounded-xl border border-[#AAB0B7]/20 p-6 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#1B2B49] mb-3">
                  Categoria
                </label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => updateFilter("category", value)}
                >
                  <SelectTrigger className="border-[#AAB0B7]/30 focus:border-[#41B6FF]">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {Object.entries(activityCategories).map(([key, cat]) => (
                      <SelectItem key={key} value={key}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1B2B49] mb-3">
                  Preço
                </label>
                <Select 
                  value={filters.priceRange} 
                  onValueChange={(value) => updateFilter("priceRange", value)}
                >
                  <SelectTrigger className="border-[#AAB0B7]/30 focus:border-[#41B6FF]">
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
                <label className="block text-sm font-medium text-[#1B2B49] mb-3">
                  Dificuldade
                </label>
                <Select 
                  value={filters.difficulty} 
                  onValueChange={(value) => updateFilter("difficulty", value)}
                >
                  <SelectTrigger className="border-[#AAB0B7]/30 focus:border-[#41B6FF]">
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
                <label className="block text-sm font-medium text-[#1B2B49] mb-3">
                  Ordenar por
                </label>
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value) => updateFilter("sortBy", value)}
                >
                  <SelectTrigger className="border-[#AAB0B7]/30 focus:border-[#41B6FF]">
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
          </motion.div>
        )}

        {/* Activities Grouped by City */}
        {cities.length > 0 ? (
          <div className="space-y-12">
            {cities.map((city) => (
              <div key={city} className="space-y-6">
                {/* City Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-[#1B2B49]">
                      {city}
                    </h2>
                    <Badge variant="outline" className="bg-[#41B6FF]/10 text-[#41B6FF] border-[#41B6FF]/20">
                      {groupedActivities[city].length} atividades
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#41B6FF] hover:bg-[#41B6FF]/10">
                    Ver todas em {city} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {/* Activities Grid */}
                <div className={`grid gap-6 ${
                  viewMode === "grid" 
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                    : "grid-cols-1"
                }`}>
                  {groupedActivities[city].map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border-[#AAB0B7]/20 hover:border-[#41B6FF]/30">
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

                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-lg line-clamp-2 text-[#1B2B49]">
                              {activity.title}
                            </h3>
                            <div className="flex items-center gap-1 ml-2">
                              <Star className="w-4 h-4 fill-[#FFA500] text-[#FFA500]" />
                              <span className="text-sm font-medium text-[#1B2B49]">
                                {Number(activity.averageRating).toFixed(1)}
                              </span>
                              <span className="text-xs text-[#AAB0B7]">
                                ({activity.totalRatings})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-[#AAB0B7]">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {activity.location}
                            </div>
                            {activity.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {activity.duration}
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent>
                          <p className="text-[#AAB0B7] text-sm mb-4 line-clamp-3">
                            {activity.description}
                          </p>

                          {/* Multiple Budget Options */}
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-4 h-4 text-[#41B6FF]" />
                              <span className="text-sm font-medium text-[#1B2B49]">Opções de Orçamento</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 bg-[#F5F9FC] rounded-lg">
                                <span className="text-sm">Básica</span>
                                <span className="text-sm font-medium text-[#1B2B49]">
                                  {formatPrice(activity.priceType, activity.priceAmount)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-[#F5F9FC] rounded-lg">
                                <span className="text-sm">Completa</span>
                                <span className="text-sm font-medium text-[#1B2B49]">
                                  {formatPrice(activity.priceType, (activity.priceAmount || 0) * 1.5)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-[#F5F9FC] rounded-lg">
                                <span className="text-sm">Premium</span>
                                <span className="text-sm font-medium text-[#1B2B49]">
                                  {formatPrice(activity.priceType, (activity.priceAmount || 0) * 2)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
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
                                <Button size="sm" variant="outline" className="border-[#AAB0B7]/30 hover:bg-[#41B6FF]/10">
                                  Ver detalhes
                                </Button>
                              </Link>
                              <Button size="sm" className="bg-[#41B6FF] hover:bg-[#41B6FF]/90 text-white">
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