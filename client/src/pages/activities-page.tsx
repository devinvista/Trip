import { useState, useEffect, useMemo, useCallback } from "react";
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
  Home,
  Globe,
  Anchor,
  ChevronLeft
} from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';
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
  categories: string[];
  priceRange: string;
  location: string;
  duration: string;
  difficulty: string;
  rating: string;
  sortBy: string;
  onlyMyTrips: boolean;
  onlyActiveTrips: boolean;
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
    categories: [],
    priceRange: "all",
    location: "",
    duration: "all",
    difficulty: "all",
    rating: "all",
    sortBy: "rating",
    onlyMyTrips: false,
    onlyActiveTrips: false,
  });

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // Hierarchical navigation state
  const [selectedCountryType, setSelectedCountryType] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'hierarchy' | 'list'>('list');

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
    if (filters.categories.length > 0) count++;
    if (filters.priceRange !== "all") count++;
    if (filters.location !== "") count++;
    if (filters.duration !== "all") count++;
    if (filters.difficulty !== "all") count++;
    if (filters.rating !== "all") count++;
    if (filters.onlyActiveTrips) count++;
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

  const { data: activities, isLoading, isFetching } = useQuery<Activity[]>({
    queryKey: ["/api/activities", filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.categories.length > 0) {
          filters.categories.forEach(category => params.append("category", category));
        }
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

  // Fetch hierarchical structure
  const { data: hierarchy } = useQuery({
    queryKey: ["/api/activities/hierarchy"],
    queryFn: async () => {
      const response = await fetch("/api/activities/hierarchy");
      if (!response.ok) throw new Error("Falha ao carregar hierarquia");
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch activities by location when in hierarchy mode
  const { data: locationActivities } = useQuery<Activity[]>({
    queryKey: ["/api/activities/by-location", selectedCountryType, selectedRegion, selectedCity],
    queryFn: async () => {
      if (!selectedCountryType) return [];
      const params = new URLSearchParams();
      params.set("countryType", selectedCountryType);
      if (selectedRegion) params.set("region", selectedRegion);
      if (selectedCity) params.set("city", selectedCity);
      
      const response = await fetch(`/api/activities/by-location?${params}`);
      if (!response.ok) throw new Error("Falha ao carregar atividades por localização");
      return response.json();
    },
    enabled: viewMode === 'hierarchy' && !!selectedCountryType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch popular activities suggestions
  const { data: popularActivities } = useQuery<Activity[]>({
    queryKey: ["/api/activities/suggestions/popular"],
    queryFn: async () => {
      const response = await fetch("/api/activities/suggestions/popular?limit=6");
      if (!response.ok) throw new Error("Falha ao carregar atividades populares");
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });



  // Fetch personalized suggestions (only for authenticated users)
  const { data: personalizedActivities } = useQuery<Activity[]>({
    queryKey: ["/api/activities/suggestions/personalized"],
    queryFn: async () => {
      const response = await fetch("/api/activities/suggestions/personalized?limit=6");
      if (!response.ok) throw new Error("Falha ao carregar sugestões personalizadas");
      return response.json();
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const updateFilter = (key: keyof ActivityFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      categories: [],
      priceRange: "all",
      location: "",
      duration: "all",
      difficulty: "all",
      rating: "all",
      sortBy: "rating",
      onlyMyTrips: false,
      onlyActiveTrips: false,
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

  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    
    let result = activities;
    
    if (filters.onlyMyTrips && user) {
      result = result.filter(activity => {
        const activityCity = activity.location.split(',')[0].trim();
        return userTrips.some(trip => {
          const tripCity = trip.destination.split(',')[0].trim();
          return tripCity.toLowerCase() === activityCity.toLowerCase();
        });
      });
    }
    
    if (filters.onlyActiveTrips && user) {
      result = result.filter(activity => {
        const activityCity = activity.location.split(',')[0].trim();
        const now = new Date();
        return userTrips.some(trip => {
          const tripCity = trip.destination.split(',')[0].trim();
          const tripStart = new Date(trip.startDate);
          const tripEnd = new Date(trip.endDate);
          return (
            tripCity.toLowerCase() === activityCity.toLowerCase() &&
            tripStart <= now && now <= tripEnd
          );
        });
      });
    }
    
    return result;
  }, [activities, filters.onlyMyTrips, filters.onlyActiveTrips, user, userTrips]);

  const topActivities = useMemo(() => {
    if (!activities) return [];
    return activities
      .filter(activity => (activity.rating || 0) >= 4.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);
  }, [activities]);

  // Query for counting activities (apply all filters EXCEPT category filters)
  const { data: activitiesForCount } = useQuery<Activity[]>({
    queryKey: ["/api/activities", "count-only", {
      search: filters.search,
      priceRange: filters.priceRange,
      location: filters.location,
      duration: filters.duration,
      difficulty: filters.difficulty,
      rating: filters.rating,
      onlyMyTrips: filters.onlyMyTrips,
      onlyActiveTrips: filters.onlyActiveTrips,
      sortBy: filters.sortBy
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      // NOTE: No category filter here - we want counts that respond to other filters
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categoryStats = useMemo(() => {
    if (!activitiesForCount) return [];
    
    // Convert activityCategories object to array format using filtered data (but not category-filtered)
    const categoriesArray = Object.entries(activityCategories).map(([value, { label, icon }]) => ({
      value,
      label,
      icon,
      count: activitiesForCount.filter(a => a.category === value).length
    }));
    
    // Add "Todas" option at the beginning
    const allOption = {
      value: "all",
      label: "Todas",
      icon: "🎯",
      count: activitiesForCount.length
    };
    
    return [allOption, ...categoriesArray];
  }, [activitiesForCount]);

  // Function to toggle category selection
  const toggleCategory = (categoryValue: string) => {
    if (categoryValue === "all") {
      // If "Todas" is clicked, clear all categories
      setFilters(prev => ({ ...prev, categories: [] }));
    } else {
      setFilters(prev => ({
        ...prev,
        categories: prev.categories.includes(categoryValue)
          ? prev.categories.filter(c => c !== categoryValue)
          : [...prev.categories, categoryValue]
      }));
    }
  };

  const FilterSidebar = () => (
    <div className="space-y-4">
      {/* Active Trips Filter */}
      {user && (
        <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-blue-900 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Viagens ativas
              </label>
              <p className="text-xs text-blue-700">
                Atividades nos destinos das suas viagens em andamento
              </p>
            </div>
            <Switch
              checked={filters.onlyActiveTrips}
              onCheckedChange={(checked) => updateFilter("onlyActiveTrips", checked)}
            />
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Target className="w-3 h-3" />
            Categoria
          </h3>
          {filters.categories.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, categories: [] }))}
              className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
            >
              Limpar
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-1.5">
          {categoryStats.map((category) => {
            const isSelected = category.value === "all" 
              ? filters.categories.length === 0 
              : filters.categories.includes(category.value);
            
            // Show count logic: 
            // - Always show count for "Todas" button
            // - For other categories, show count only when no specific categories are selected
            const showCount = category.value === "all" || filters.categories.length === 0;
            

            
            return (
              <div
                key={category.value}
                className={`flex items-center justify-between p-1.5 rounded-md border cursor-pointer transition-all text-xs ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => toggleCategory(category.value)}
              >
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-xs">{category.icon}</span>
                  <span className="font-medium truncate text-xs">{category.label}</span>
                </div>
                {showCount && (
                  <Badge variant="outline" className="text-xs px-1 py-0 h-auto">
                    {category.count}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Filter Grid - Responsive Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Price Range */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <DollarSign className="w-3 h-3" />
            Preço
          </h3>
          <Select value={filters.priceRange} onValueChange={(value) => updateFilter("priceRange", value)}>
            <SelectTrigger className="h-8 text-sm">
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
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Duração
          </h3>
          <Select value={filters.duration} onValueChange={(value) => updateFilter("duration", value)}>
            <SelectTrigger className="h-8 text-sm">
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
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" />
            Dificuldade
          </h3>
          <Select value={filters.difficulty} onValueChange={(value) => updateFilter("difficulty", value)}>
            <SelectTrigger className="h-8 text-sm">
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

        {/* Rating */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Star className="w-3 h-3" />
            Avaliação
          </h3>
          <Select value={filters.rating} onValueChange={(value) => updateFilter("rating", value)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as avaliações</SelectItem>
              <SelectItem value="5">⭐⭐⭐⭐⭐ 5 estrelas</SelectItem>
              <SelectItem value="4">⭐⭐⭐⭐ 4+ estrelas</SelectItem>
              <SelectItem value="3">⭐⭐⭐ 3+ estrelas</SelectItem>
              <SelectItem value="2">⭐⭐ 2+ estrelas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* My Trips Only */}
      {user && (
        <>
          <Separator />
          <div className="flex items-center justify-between p-2 rounded-md border border-gray-200 bg-gray-50">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-gray-900">
                Apenas meus destinos
              </label>
              <p className="text-xs text-gray-500">
                Destinos das minhas viagens
              </p>
            </div>
            <Switch
              checked={filters.onlyMyTrips}
              onCheckedChange={(checked) => updateFilter("onlyMyTrips", checked)}
            />
          </div>
        </>
      )}

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button 
          variant="outline" 
          onClick={clearFilters}
          className="w-full h-8 text-sm"
        >
          <X className="w-3 h-3 mr-2" />
          Limpar Filtros ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  // Check if activity is both popular and highly rated
  const isTopQuality = (activity: Activity) => {
    const rating = Number(activity.averageRating || activity.rating || 0);
    const totalRatings = activity.totalRatings || activity.reviewCount || 0;
    return rating >= 4.5 && totalRatings >= 5;
  };

  // Get icon for country type
  const getCountryTypeIcon = (countryType: string) => {
    switch (countryType) {
      case 'nacional': return <Home className="w-5 h-5" />;
      case 'internacional': return <Globe className="w-5 h-5" />;
      case 'cruzeiro': return <Anchor className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  // Get display name for country type
  const getCountryTypeDisplayName = (countryType: string) => {
    switch (countryType) {
      case 'nacional': return 'Nacionais';
      case 'internacional': return 'Internacionais';
      case 'cruzeiro': return 'Cruzeiros';
      default: return countryType;
    }
  };

  // Breadcrumb component for navigation
  const Breadcrumb = () => (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setSelectedCountryType(null);
          setSelectedRegion(null);
          setSelectedCity(null);
        }}
        className="h-8 px-2 hover:bg-blue-50"
      >
        Todas as Atividades
      </Button>
      
      {selectedCountryType && (
        <>
          <ChevronRight className="w-4 h-4" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedRegion(null);
              setSelectedCity(null);
            }}
            className="h-8 px-2 hover:bg-blue-50"
          >
            {getCountryTypeDisplayName(selectedCountryType)}
          </Button>
        </>
      )}
      
      {selectedRegion && (
        <>
          <ChevronRight className="w-4 h-4" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCity(null)}
            className="h-8 px-2 hover:bg-blue-50"
          >
            {selectedRegion}
          </Button>
        </>
      )}
      
      {selectedCity && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-gray-900">{selectedCity}</span>
        </>
      )}
    </div>
  );

  // Premium Activity Card Component (for carousel)
  const PremiumActivityCard = ({ activity, index }: { activity: Activity; index: number }) => {
    const isPremium = isTopQuality(activity);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          delay: index * 0.15,
          duration: 0.6,
          ease: [0.21, 1.02, 0.73, 1]
        }}
        whileHover={{ 
          y: -8,
          scale: 1.03,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        className="group flex-[0_0_320px] mr-6 last:mr-0"
      >
        <Link to={`/activities/${activity.id}`}>
          <Card className={`relative h-full overflow-hidden border-0 transition-all duration-500 bg-white ${
            isPremium 
              ? 'shadow-2xl shadow-yellow-500/25 ring-1 ring-yellow-300/30 hover:shadow-3xl hover:shadow-yellow-600/40 hover:ring-yellow-400/50' 
              : 'shadow-xl shadow-gray-500/20 hover:shadow-2xl hover:shadow-blue-500/30'
          }`}>
            {/* Gradient Background Overlay for Premium */}
            {isPremium && (
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/80 via-orange-50/60 to-red-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
            )}
            
            <div className="relative z-10">
              <div className="relative overflow-hidden">
                <motion.img
                  src={activity.imageUrl || activity.coverImage || `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=250&fit=crop&crop=center`}
                  alt={activity.title}
                  className="w-full h-52 object-cover transition-all duration-700 group-hover:scale-115"
                  whileHover={{ scale: 1.1 }}
                  onError={(e) => {
                    e.currentTarget.src = `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=250&fit=crop&crop=center`;
                  }}
                />
                
                {/* Dynamic Gradient Overlay */}
                <div className={`absolute inset-0 transition-all duration-700 ${
                  isPremium 
                    ? 'bg-gradient-to-t from-amber-900/80 via-orange-900/50 to-transparent group-hover:from-amber-900/90' 
                    : 'bg-gradient-to-t from-slate-900/70 via-slate-900/40 to-transparent group-hover:from-slate-900/80'
                }`} />
                
                {/* Animated Border Effect for Premium */}
                {isPremium && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 border-2 border-yellow-400/50 animate-pulse" />
                  </div>
                )}
                
                {/* Premium Badge with Animation */}
                {isPremium && (
                  <motion.div 
                    className="absolute top-4 left-4"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 + 0.5, type: "spring", stiffness: 200 }}
                  >
                    <div className="relative bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-white px-4 py-2 rounded-full shadow-2xl border border-yellow-300/60 flex items-center gap-2 backdrop-blur-sm">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      <span className="text-xs font-black tracking-widest">PREMIUM</span>
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-md -z-10" />
                    </div>
                  </motion.div>
                )}
                
                {/* Enhanced Category Badge */}
                <div className="absolute top-4 right-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Badge className={`backdrop-blur-md shadow-lg border transition-all duration-300 ${
                      isPremium 
                        ? 'bg-white/95 text-amber-800 border-yellow-200/60 hover:bg-yellow-50' 
                        : 'bg-white/95 text-gray-800 border-white/30 hover:bg-white'
                    }`}>
                      <span className="text-sm mr-1">
                        {activityCategories[activity.category as keyof typeof activityCategories]?.icon || '🎯'}
                      </span>
                      <span className="font-semibold">
                        {activityCategories[activity.category as keyof typeof activityCategories]?.label || 'Atividade'}
                      </span>
                    </Badge>
                  </motion.div>
                </div>
                
                {/* Enhanced Price Badge */}
                <div className="absolute bottom-4 left-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`backdrop-blur-md px-4 py-2.5 rounded-xl shadow-xl border transition-all duration-300 ${
                      isPremium 
                        ? 'bg-gradient-to-r from-yellow-50/95 to-amber-50/95 border-yellow-300/60 shadow-yellow-500/30' 
                        : 'bg-white/95 border-white/40 shadow-gray-500/30'
                    }`}>
                    <span className={`text-lg font-black ${
                      isPremium ? 'text-amber-900 bg-gradient-to-r from-yellow-700 to-orange-700 bg-clip-text text-transparent' : 'text-gray-900'
                    }`}>
                      {(!activity.price || activity.price === 0) ? "Grátis" : `R$ ${Number(activity.price).toLocaleString('pt-BR')}`}
                    </span>
                  </motion.div>
                </div>

                {/* Enhanced Rating Badge */}
                <div className="absolute bottom-4 right-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`backdrop-blur-md px-3 py-2 rounded-xl shadow-xl flex items-center gap-2 border transition-all duration-300 ${
                      isPremium 
                        ? 'bg-gradient-to-r from-yellow-400/95 to-amber-500/95 border-yellow-300/60 shadow-yellow-500/40' 
                        : 'bg-yellow-400/95 border-yellow-300/40 shadow-yellow-500/30'
                    }`}>
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Star className="w-4 h-4 fill-white text-white drop-shadow-sm" />
                    </motion.div>
                    <span className="text-sm font-black text-white drop-shadow-sm">
                      {Number(activity.averageRating || activity.rating || 0).toFixed(1)}
                    </span>
                  </motion.div>
                </div>
              </div>
              
              <CardContent className="p-6 relative">
                <div className="space-y-4">
                  <div>
                    <motion.h3 
                      className={`font-black text-lg leading-tight line-clamp-2 transition-all duration-300 ${
                        isPremium 
                          ? 'text-gray-900 group-hover:text-amber-700 group-hover:text-xl' 
                          : 'text-gray-900 group-hover:text-blue-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      {activity.title}
                    </motion.h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-2 leading-relaxed font-medium">
                      {activity.description}
                    </p>
                  </div>
                  
                  {/* Enhanced Info Row */}
                  <div className="flex items-center justify-between text-sm">
                    <motion.div 
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                        isPremium ? 'bg-yellow-50 text-amber-700' : 'bg-gray-50 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="font-semibold truncate max-w-[140px]">{activity.location}</span>
                    </motion.div>
                    <motion.div 
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                        isPremium ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">{activity.duration}h</span>
                    </motion.div>
                  </div>
                  
                  {/* Enhanced Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      {renderStars(Number(activity.averageRating || activity.rating || 0))}
                      <span className="text-xs text-gray-500 ml-2 font-medium">
                        ({activity.totalRatings || activity.reviewCount || 0})
                      </span>
                    </div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-bold border-2 transition-all duration-300 ${
                          activity.difficulty === 'easy' ? 'border-green-300 text-green-800 bg-green-50 hover:bg-green-100' :
                          activity.difficulty === 'moderate' ? 'border-yellow-300 text-yellow-800 bg-yellow-50 hover:bg-yellow-100' :
                          activity.difficulty === 'challenging' ? 'border-red-300 text-red-800 bg-red-50 hover:bg-red-100' :
                          'border-gray-300 text-gray-800 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {DIFFICULTY_LEVELS.find(d => d.value === activity.difficulty)?.label || 'N/A'}
                      </Badge>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </Link>
      </motion.div>
    );
  };

  // Carousel Component for Popular Activities
  const PopularActivitiesCarousel = ({ activities }: { activities: Activity[] }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
      align: 'start',
      dragFree: true,
      containScroll: 'trimSnaps',
    });

    const scrollPrev = useCallback(() => {
      if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
      if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    return (
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {activities.map((activity, index) => (
              <PremiumActivityCard key={activity.id} activity={activity} index={index} />
            ))}
          </div>
        </div>
        
        {/* Enhanced Navigation Buttons */}
        <div className="absolute -top-16 right-0 flex gap-3">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollPrev}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <ChevronLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollNext}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <ChevronRight className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  };

  const ActivityCard = ({ activity, index, isPopular = false }: { activity: Activity; index: number; isPopular?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Link to={`/activities/${activity.id}`}>
        <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:border-blue-200 bg-white">
          <div className="relative">
            <img
              src={activity.imageUrl || activity.coverImage || `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=250&fit=crop&crop=center`}
              alt={activity.title}
              className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=250&fit=crop&crop=center`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            
            {/* Category Badge */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {/* Premium Quality Badge for popular + highly rated */}
              {isPopular && isTopQuality(activity) && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg border-0 font-bold">
                  ⭐ Premium
                </Badge>
              )}
              <Badge className="bg-white/95 text-gray-800 hover:bg-white backdrop-blur-sm shadow-lg">
                {activityCategories[activity.category as keyof typeof activityCategories]?.icon || '🎯'} {activityCategories[activity.category as keyof typeof activityCategories]?.label || 'Atividade'}
              </Badge>
            </div>
            
            {/* Price Badge */}
            <div className="absolute bottom-4 left-4">
              <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                <span className="text-xl font-bold text-gray-900">
                  {(!activity.price || activity.price === 0) ? "Grátis" : `R$ ${Number(activity.price).toLocaleString('pt-BR')}`}
                </span>
              </div>
            </div>

            {/* Rating Badge */}
            <div className="absolute bottom-4 right-4">
              <div className="bg-yellow-400/95 backdrop-blur-sm px-3 py-1 rounded-lg shadow-lg flex items-center gap-1">
                <Star className="w-4 h-4 fill-white text-white" />
                <span className="text-sm font-bold text-white">
                  {Number(activity.averageRating || activity.rating || 0).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                  {activity.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                  {activity.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-1">
                  {renderStars(Number(activity.averageRating || activity.rating || 0))}
                  <span className="text-sm text-gray-600 ml-2 font-medium">
                    ({activity.totalRatings || activity.reviewCount || 0} avaliações)
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium truncate">{activity.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium">{activity.duration}h</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {activity.minParticipants || 1}-{activity.maxParticipants || 20} pessoas
                  </span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium ${
                    activity.difficulty === 'easy' ? 'border-green-200 text-green-700 bg-green-50' :
                    activity.difficulty === 'moderate' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                    activity.difficulty === 'challenging' ? 'border-red-200 text-red-700 bg-red-50' :
                    'border-gray-200 text-gray-700 bg-gray-50'
                  }`}
                >
                  {DIFFICULTY_LEVELS.find(d => d.value === activity.difficulty)?.label || 'N/A'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold"
            >
              Descubra Experiências Incríveis
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-blue-100 max-w-2xl mx-auto"
            >
              Encontre as melhores atividades e experiências para suas viagens. 
              Aventuras inesquecíveis estão esperando por você.
            </motion.p>
          </div>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar atividades, experiências ou destinos..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-white/95 backdrop-blur-sm border-0 shadow-lg text-black"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'hierarchy' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('hierarchy')}
                className={`px-4 ${viewMode === 'hierarchy' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Por Destino
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`px-4 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                <List className="w-4 h-4 mr-2" />
                Lista Completa
              </Button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'hierarchy' ? (
        // Hierarchical Navigation
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Breadcrumb />
            
            {!selectedCountryType && hierarchy && (
              // Country Type Selection
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">Explore Atividades por Destino</h2>
                  <p className="text-gray-600">Escolha entre experiências nacionais, internacionais ou cruzeiros</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(hierarchy).map(([countryType, regions]) => {
                    const totalCount = Object.values(regions).reduce((acc: number, cities: any) => 
                      acc + Object.values(cities).reduce((cityAcc: number, count: any) => cityAcc + count, 0), 0
                    );
                    
                    return (
                      <motion.div
                        key={countryType}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCountryType(countryType)}
                        className="cursor-pointer"
                      >
                        <Card className="h-full hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300">
                          <CardContent className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white">
                              {getCountryTypeIcon(countryType)}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{getCountryTypeDisplayName(countryType)}</h3>
                              <p className="text-gray-600">{totalCount} atividades disponíveis</p>
                            </div>
                            <ChevronRight className="w-5 h-5 mx-auto text-gray-400" />
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {selectedCountryType && !selectedRegion && hierarchy && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">Escolha a Região</h2>
                  <p className="text-gray-600">Selecione a região que deseja explorar</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(hierarchy[selectedCountryType] || {}).map(([region, cities]) => {
                    const totalCount = Object.values(cities).reduce((acc: number, count: any) => acc + count, 0);
                    
                    return (
                      <motion.div
                        key={region}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedRegion(region)}
                        className="cursor-pointer"
                      >
                        <Card className="hover:shadow-md transition-all duration-200 hover:border-blue-300">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{region}</h4>
                              <p className="text-sm text-gray-600">{totalCount} atividades</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {selectedCountryType && selectedRegion && !selectedCity && hierarchy && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">Escolha a Cidade</h2>
                  <p className="text-gray-600">Selecione a cidade para ver as atividades disponíveis</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(hierarchy[selectedCountryType]?.[selectedRegion] || {}).map(([city, count]) => (
                    <motion.div
                      key={city}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCity(city)}
                      className="cursor-pointer"
                    >
                      <Card className="hover:shadow-md transition-all duration-200 hover:border-blue-300">
                        <CardContent className="p-4 text-center">
                          <h5 className="font-semibold text-gray-900">{city}</h5>
                          <p className="text-sm text-gray-600">{count} atividades</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedCity && locationActivities && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Atividades em {selectedCity}</h2>
                    <p className="text-gray-600">{locationActivities.length} atividades encontradas</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={displayMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDisplayMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={displayMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDisplayMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className={displayMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {locationActivities.map((activity, index) => (
                    <ActivityCard key={activity.id} activity={activity} index={index} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
          {/* Personalized Suggestions (only for authenticated users) */}
          {user && personalizedActivities && personalizedActivities.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Sugestões Para Você</h2>
                  <p className="text-gray-600">Baseado em suas próximas viagens</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 ml-auto">
                  Personalizado
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalizedActivities.slice(0, 6).map((activity, index) => (
                  <ActivityCard key={activity.id} activity={activity} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Popular Activities */}
          {popularActivities && popularActivities.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Mais Populares</h2>
                  <p className="text-gray-600">As experiências que todo mundo está escolhendo • Premium = Popular + 4.5⭐</p>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 ml-auto">
                  Trending
                </Badge>
              </div>
              
              <PopularActivitiesCarousel activities={popularActivities.slice(0, 12)} />
            </motion.div>
          )}


        </div>
      </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary">{activeFiltersCount}</Badge>
                  )}
                </div>
                <FilterSidebar />
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filtros
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 sm:w-96">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                      <SheetDescription>
                        Refine sua busca para encontrar a experiência perfeita
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="text-gray-600">
                  {isLoading ? (
                    "Carregando..."
                  ) : (
                    `${filteredActivities?.length || 0} atividades encontradas`
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                  <SelectTrigger className="w-48">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
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

                {/* View Mode */}
                <div className="flex border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Section Header for Filtered Activities */}
            {!isLoading && filteredActivities && filteredActivities.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Todas as Atividades</h2>
                  <p className="text-gray-600">Explore nossa coleção completa de experiências</p>
                </div>
              </motion.div>
            )}

            {/* Activities Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="w-full h-48 bg-gray-200 animate-pulse" />
                    <CardContent className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredActivities?.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
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
              </motion.div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                <AnimatePresence>
                  {filteredActivities?.map((activity, index) => (
                    <ActivityCard key={activity.id} activity={activity} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivitiesPage;