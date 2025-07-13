import { useState } from "react";
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
  List
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

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const { data: activities, isLoading } = useQuery<Activity[]>({
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner variant="travel" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/search">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Atividades e Experiências
                </h1>
                <p className="text-gray-600">
                  Descubra experiências incríveis para sua viagem
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              >
                {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar atividades, experiências ou locais..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10 pr-4 py-3 w-full"
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-white rounded-lg border p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => updateFilter("category", value)}
                >
                  <SelectTrigger>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço
                </label>
                <Select 
                  value={filters.priceRange} 
                  onValueChange={(value) => updateFilter("priceRange", value)}
                >
                  <SelectTrigger>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dificuldade
                </label>
                <Select 
                  value={filters.difficulty} 
                  onValueChange={(value) => updateFilter("difficulty", value)}
                >
                  <SelectTrigger>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value) => updateFilter("sortBy", value)}
                >
                  <SelectTrigger>
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

        {/* Activity Grid/List */}
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        }`}>
          {activities?.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="relative">
                  <img
                    src={activity.coverImage}
                    alt={activity.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Button size="sm" variant="outline" className="bg-white/90 hover:bg-white">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      {activityCategories[activity.category as keyof typeof activityCategories]?.label}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {activity.title}
                    </h3>
                    <div className="flex items-center gap-1 ml-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {Number(activity.averageRating).toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({activity.totalRatings})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
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
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {activity.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(activity.priceType, activity.priceAmount)}
                      </span>
                      {activity.difficultyLevel && (
                        <Badge variant="outline" className="text-xs">
                          {activity.difficultyLevel === "easy" && "Fácil"}
                          {activity.difficultyLevel === "moderate" && "Moderado"}
                          {activity.difficultyLevel === "challenging" && "Desafiador"}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/activities/${activity.id}`}>
                        <Button size="sm" variant="outline">
                          Ver detalhes
                        </Button>
                      </Link>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {activities && activities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma atividade encontrada
            </h3>
            <p className="text-gray-600">
              Tente ajustar seus filtros ou buscar por outros termos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}