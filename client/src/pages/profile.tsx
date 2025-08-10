import { useAuth } from "@/hooks/use-auth-snake";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { 
  User, 
  Edit3, 
  MapPin, 
  Languages, 
  Heart, 
  Share2, 
  Users, 
  Award,
  Copy,
  Check,
  UserPlus,
  Star,
  Calendar,
  Plane,
  Luggage,
  Compass,
  Map,
  Trophy,
  Shield,
  Target,
  TrendingUp,
  DollarSign,
  MessageCircle,
  Zap,
  Globe,
  ChevronRight,
  ExternalLink,
  Gift,
  Crown,
  Sparkles,
  ThumbsUp,
  Settings,
  Share,
  Mail,
  MessageSquare,
  WhatsApp,
  Camera,
  Image,
  Upload,
  Trash2,
  MoreVertical,
  UserMinus
} from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { motion } from "framer-motion";

// Função para formatação de telefone (xx) xxxxx-xxxx
const formatPhoneNumber = (value: string) => {
  // Remove todos os caracteres não numéricos
  const onlyNumbers = value.replace(/\D/g, '');
  
  // Aplica a formatação baseada no número de dígitos
  if (onlyNumbers.length <= 2) {
    return onlyNumbers;
  } else if (onlyNumbers.length <= 7) {
    return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2)}`;
  } else if (onlyNumbers.length <= 11) {
    return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2, 7)}-${onlyNumbers.slice(7)}`;
  } else {
    // Limita a 11 dígitos
    return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2, 7)}-${onlyNumbers.slice(7, 11)}`;
  }
};

const profileSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos").max(20, "Telefone deve ter no máximo 20 dígitos"),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
  location: z.string().min(2, "Localização deve ter pelo menos 2 caracteres"),
  languages: z.array(z.string()).min(1, "Selecione pelo menos um idioma"),
  interests: z.array(z.string()).min(1, "Selecione pelo menos um interesse"),
  travel_styles: z.array(z.string()).min(1, "Selecione pelo menos um estilo de viagem")
});

type ProfileFormData = z.infer<typeof profileSchema>;

const availableLanguages = [
  "Português", "Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Japonês", "Mandarim", "Russo", "Árabe"
];

const availableInterests = [
  "Aventura", "Praia", "Cultura", "Gastronomia", "Natureza", "História", "Arquitetura", "Museus", 
  "Fotografia", "Música", "Dança", "Esportes", "Montanha", "Mergulho", "Surfe", "Trilhas"
];

const travelStyles = [
  { value: "praia", label: "Praia" },
  { value: "neve", label: "Neve" },
  { value: "cruzeiros", label: "Cruzeiros" },
  { value: "natureza", label: "Natureza e Ecoturismo" },
  { value: "culturais", label: "Culturais e Históricas" },
  { value: "aventura", label: "Aventura" },
  { value: "urbanas", label: "Viagens Urbanas / Cidades Grandes" },
  { value: "parques", label: "Parques Temáticos" }
];

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [showCoverUpload, setShowCoverUpload] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState<any>(null);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone ? formatPhoneNumber(user.phone) : "",
      bio: user?.bio || "",
      location: user?.location || "",
      languages: user?.languages ? (Array.isArray(user.languages) ? user.languages : (typeof user.languages === 'string' ? JSON.parse(user.languages || '[]') : [])) : [],
      interests: user?.interests ? (Array.isArray(user.interests) ? user.interests : (typeof user.interests === 'string' ? JSON.parse(user.interests || '[]') : [])) : [],
      travelStyles: user?.travelStyles ? (Array.isArray(user.travelStyles) ? user.travelStyles : (typeof user.travelStyles === 'string' ? JSON.parse(user.travelStyles || '[]') : [])) : user?.travelStyle ? [user.travelStyle] : []
    }
  });

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["/api/user/stats"],
    queryFn: async () => {
      const response = await fetch("/api/user/stats", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: !!user,
    retry: 1
  });

  // Fetch referral code and referred users
  const { data: referralData, isLoading: referralLoading, error: referralError } = useQuery({
    queryKey: ["/api/user/referral"],
    queryFn: async () => {
      const response = await fetch("/api/user/referral", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch referral data');
      return response.json();
    },
    enabled: !!user,
    retry: 1
  });

  // Fetch travel companions
  const { data: travelCompanions, isLoading: companionsLoading, error: companionsError } = useQuery({
    queryKey: ["/api/user/travel-companions"],
    queryFn: async () => {
      const response = await fetch("/api/user/travel-companions", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch travel companions');
      return response.json();
    },
    enabled: !!user,
    retry: 1
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error("Erro ao atualizar perfil");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Perfil atualizado com sucesso!" });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: () => {
      toast({ 
        title: "Erro ao atualizar perfil", 
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    }
  });

  // Mutation to rate a travel companion
  const rateCompanionMutation = useMutation({
    mutationFn: async ({ companionId, rating, comment }: { companionId: number, rating: number, comment: string }) => {
      const response = await fetch("/api/user/rate-companion", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        credentials: 'include',
        body: JSON.stringify({ companionId, rating, comment })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao avaliar companheiro");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Avaliação enviada com sucesso!" });
      setShowRateDialog(false);
      setRating(5);
      setRatingComment("");
      // Invalidate multiple queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["/api/user/travel-companions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Invalidate the specific user's ratings if showing their profile
      if (selectedCompanion?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/user/${selectedCompanion.id}/ratings`] });
      }
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao enviar avaliação", 
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive"
      });
    }
  });

  // Mutation to remove a travel companion
  const removeCompanionMutation = useMutation({
    mutationFn: async (companionId: number) => {
      const response = await fetch(`/api/user/remove-companion/${companionId}`, {
        method: "DELETE",
        headers: { 
          "Cache-Control": "no-cache"
        },
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error("Erro ao remover companheiro");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Companheiro removido da sua rede!" });
      queryClient.invalidateQueries({ queryKey: ["/api/user/travel-companions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
    },
    onError: () => {
      toast({ 
        title: "Erro ao remover companheiro", 
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    }
  });

  const handleUpdateProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const copyReferralCode = () => {
    if (referralData?.code) {
      navigator.clipboard.writeText(referralData.code);
      setCopiedCode(true);
      toast({ title: "Código copiado!" });
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  // Handle rating companion
  const handleRateCompanion = (companion: any) => {
    setSelectedCompanion(companion);
    setShowRateDialog(true);
  };

  // Handle remove companion
  const handleRemoveCompanion = (companionId: number) => {
    removeCompanionMutation.mutate(companionId);
  };

  // Submit rating
  const submitRating = () => {
    if (selectedCompanion) {
      rateCompanionMutation.mutate({
        companionId: selectedCompanion.id,
        rating,
        comment: ratingComment
      });
    }
  };

  // Render star rating component
  const renderStarRating = (currentRating: number, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange?.(star)}
            className={`text-2xl ${star <= currentRating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
            disabled={!onRatingChange}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  // Debug logging
  console.log("Profile Debug:", {
    user: user?.username,
    userStats,
    referralData,
    statsLoading,
    referralLoading,
    statsError: statsError?.message,
    referralError: referralError?.message
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner variant="travel" size="lg" message="Carregando perfil..." />
      </div>
    );
  }

  // Funções auxiliares para o novo design
  const getTravelerLevel = (completedTrips: number) => {
    if (completedTrips >= 20) return { level: "Embaixador", color: "from-orange-500 to-red-500", progress: 100 };
    if (completedTrips >= 10) return { level: "Explorador", color: "from-blue-500 to-cyan-500", progress: (completedTrips - 10) / 10 * 100 };
    if (completedTrips >= 5) return { level: "Aventureiro", color: "from-green-500 to-emerald-500", progress: (completedTrips - 5) / 5 * 100 };
    return { level: "Iniciante", color: "from-gray-500 to-gray-600", progress: completedTrips / 5 * 100 };
  };

  const getAchievements = () => {
    const achievements = [];
    const completed = userStats?.completedTrips || 0;
    
    if (completed >= 2) achievements.push({ name: "Globetrotter", icon: Globe, description: "2+ viagens completadas", color: "text-blue-500" });
    if (completed >= 5) achievements.push({ name: "Aventureiro", icon: Compass, description: "5+ viagens completadas", color: "text-green-500" });
    if (completed >= 10) achievements.push({ name: "Explorador", icon: Map, description: "10+ viagens completadas", color: "text-purple-500" });
    if (userStats?.travelPartners >= 5) achievements.push({ name: "Social Traveler", icon: Users, description: "5+ conexões de viagem", color: "text-orange-500" });
    
    return achievements;
  };

  const shareOnWhatsApp = () => {
    const message = `Olá! Estou usando o PartiuTrip para encontrar companheiros de viagem e economizar nos custos. Use meu código ${referralData?.code} e ganhe acesso à plataforma também! https://partiutrip.com`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const shareByEmail = () => {
    const subject = "Convite PartiuTrip - Viaje junto e economize!";
    const body = `Olá!\n\nEstou usando o PartiuTrip para encontrar companheiros de viagem e economizar nos custos. É uma plataforma incrível onde você pode compartilhar viagens com pessoas que têm os mesmos interesses!\n\nUse meu código ${referralData?.code} e ganhe acesso à plataforma também.\n\nAcesse: https://partiutrip.com\n\nVamos viajar juntos!`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulated avatar upload - in a real app, you'd upload to a service
      const reader = new FileReader();
      reader.onload = (e) => {
        // Here you would typically upload to your server/cloud storage
        toast({
          title: "Avatar atualizado!",
          description: "Sua foto de perfil foi atualizada com sucesso.",
        });
        setShowAvatarUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulated cover upload - in a real app, you'd upload to a service
      const reader = new FileReader();
      reader.onload = (e) => {
        // Here you would typically upload to your server/cloud storage
        toast({
          title: "Capa atualizada!",
          description: "Sua imagem de capa foi atualizada com sucesso.",
        });
        setShowCoverUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAvatarUpload = () => {
    avatarInputRef.current?.click();
  };

  const triggerCoverUpload = () => {
    coverInputRef.current?.click();
  };

  return (
    <div className="min-h-screen" style={{ background: '#F5F9FC' }}>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
        {/* Header Moderno do Perfil */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 sm:mb-8"
        >
          {/* Banner dinâmico com mosaico de destinos - responsivo */}
          <div className="relative h-48 sm:h-56 md:h-64 rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6"
               style={{ 
                 backgroundImage: `linear-gradient(45deg, #1B2B49 0%, #41B6FF 50%, #FFA500 100%)`,
                 backgroundSize: 'cover'
               }}>
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Botão para alterar cover - responsivo */}
            <button
              onClick={() => setShowCoverUpload(true)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            >
              <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
            
            {/* Elementos de viagem flutuantes - responsivo */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex gap-1.5 sm:gap-2">
              <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Luggage className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg hidden sm:block">
                <Compass className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </div>
            
            {/* Avatar interativo - posicionamento responsivo */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
                <UserAvatar 
                  user={user}
                  size="xl"
                  className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 border-4 border-white shadow-xl"
                />
                
                {/* Botão para alterar avatar - tamanho responsivo */}
                <button
                  onClick={() => setShowAvatarUpload(true)}
                  className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-1 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                >
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                </button>
                
                {/* Badge responsivo */}
                <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getTravelerLevel(userStats?.completedTrips || 0).color} shadow-md border border-white/30 backdrop-blur-sm`}>
                    {getTravelerLevel(userStats?.completedTrips || 0).level}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Informações do perfil - layout responsivo */}
          <div className="px-4 sm:px-6 md:ml-8 mt-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2" style={{ color: '#1B2B49' }}>
              {user.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 text-sm sm:text-base">
              <div className="flex items-center gap-2" style={{ color: '#AAB0B7' }}>
                <MapPin className="h-4 w-4" />
                <span>{user.location}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: '#AAB0B7' }}>
                <Star className="h-4 w-4" />
                <span>{userStats?.averageRating || '5.0'} ⭐</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2" style={{ color: '#AAB0B7' }}>
                  <User className="h-4 w-4" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.languages && user.languages.length > 0 && (
                <div className="flex items-center gap-2" style={{ color: '#AAB0B7' }}>
                  <Languages className="h-4 w-4" />
                  <span>{Array.isArray(user.languages) ? user.languages.join(', ') : (typeof user.languages === 'string' ? (() => { try { const parsed = JSON.parse(user.languages); return Array.isArray(parsed) ? parsed.join(', ') : ''; } catch { return ''; } })() : '')}</span>
                </div>
              )}
            </div>
            
            {/* Bio editável - responsivo */}
            <p className="text-gray-600 max-w-2xl mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
              {user.bio || "Aventureiro em busca de novas experiências e conexões incríveis!"}
            </p>
            
            {/* Estilos de viagem preferidos */}
            {user.travelStyle && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Estilo de Viagem</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800">
                    {travelStyles.find(s => s.value === user.travelStyle)?.label}
                  </Badge>
                </div>
              </div>
            )}
            
            {/* Interesses */}
            {user.interests && (() => {
              try {
                const interests = Array.isArray(user.interests) ? user.interests : JSON.parse(user.interests || '[]');
                return Array.isArray(interests) && interests.length > 0;
              } catch {
                return false;
              }
            })() && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Interesses</h4>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    try {
                      const interests = Array.isArray(user.interests) ? user.interests : JSON.parse(user.interests || '[]');
                      return Array.isArray(interests) ? interests : [];
                    } catch {
                      return [];
                    }
                  })().map((interest) => (
                    <Badge key={interest} variant="outline" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Informações de Contato */}
            <div className="flex flex-wrap gap-6 text-sm" style={{ color: '#AAB0B7' }}>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Membro desde {new Date(user.createdAt || '2025-01-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="stats" className="space-y-6 sm:space-y-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto min-h-[3rem] sm:min-h-[3.5rem] bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl gap-1 p-1">
            <TabsTrigger value="stats" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-xl px-2 py-2 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300">
              <Award className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Estatísticas</span>
              <span className="sm:hidden text-[10px] leading-tight">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="partiuamigos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl px-2 py-2 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300">
              <Gift className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">PartiuAmigos</span>
              <span className="sm:hidden text-[10px] leading-tight">Amigos</span>
            </TabsTrigger>
            <TabsTrigger value="connections" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl px-2 py-2 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300 col-span-2 sm:col-span-1">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline lg:inline truncate">Conexões</span>
              <span className="sm:hidden lg:hidden text-[10px] leading-tight">Rede</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-xl px-2 py-2 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline lg:inline truncate">Conquistas</span>
              <span className="sm:hidden lg:hidden text-[10px] leading-tight">Prêmios</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white rounded-xl px-2 py-2 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-300">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline lg:inline truncate">Configurações</span>
              <span className="sm:hidden lg:hidden text-[10px] leading-tight">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba de Estatísticas */}
          <TabsContent value="stats" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {/* Total de Viagens */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#AAB0B7' }}>Total de Viagens</p>
                        <p className="text-3xl font-bold" style={{ color: '#1B2B49' }}>
                          {userStats?.totalTrips || 0}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                        <Plane className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Viagens Concluídas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#AAB0B7' }}>Concluídas</p>
                        <p className="text-3xl font-bold" style={{ color: '#1B2B49' }}>
                          {userStats?.completedTrips || 0}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Parceiros de Viagem */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#AAB0B7' }}>Parceiros</p>
                        <p className="text-3xl font-bold" style={{ color: '#1B2B49' }}>
                          {userStats?.travelPartners || 0}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Avaliação Média */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#AAB0B7' }}>Avaliação</p>
                        <p className="text-3xl font-bold" style={{ color: '#1B2B49' }}>
                          {userStats?.averageRating || '5.0'}
                        </p>
                      </div>
                      <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Progresso do Nível */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#1B2B49' }}>
                  <Crown className="h-5 w-5" />
                  Progresso do Viajante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: '#AAB0B7' }}>
                      Nível Atual: {getTravelerLevel(userStats?.completedTrips || 0).level}
                    </span>
                    <span className="text-sm" style={{ color: '#AAB0B7' }}>
                      {userStats?.completedTrips || 0} / {userStats?.completedTrips >= 20 ? 20 : userStats?.completedTrips >= 10 ? 20 : userStats?.completedTrips >= 5 ? 10 : 5} viagens
                    </span>
                  </div>
                  <Progress 
                    value={getTravelerLevel(userStats?.completedTrips || 0).progress} 
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba do Programa PartiuAmigos */}
          <TabsContent value="partiuamigos" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Código de Indicação */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#1B2B49' }}>
                    <Gift className="h-5 w-5" />
                    Código de Indicação
                  </CardTitle>
                  <CardDescription>
                    Compartilhe e ganhe benefícios exclusivos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-center">
                      <div className="text-2xl font-bold text-white tracking-wider">
                        {referralData?.code || "LOADING..."}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={copyReferralCode}
                        variant="outline"
                        className="flex-1"
                      >
                        {copiedCode ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        {copiedCode ? 'Copiado!' : 'Copiar'}
                      </Button>
                      <Button
                        onClick={shareOnWhatsApp}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">WhatsApp</span>
                        <span className="sm:hidden">WhatsApp</span>
                      </Button>
                      <Button
                        onClick={shareByEmail}
                        variant="outline"
                        className="flex-1"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sistema de Recompensas */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#1B2B49' }}>
                    <Sparkles className="h-5 w-5" />
                    Sistema de Recompensas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Iniciante</span>
                      </div>
                      <span className="text-xs text-gray-500">0-4 indicações</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Explorador</span>
                      </div>
                      <span className="text-xs text-gray-500">5-9 indicações</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium">Embaixador</span>
                      </div>
                      <span className="text-xs text-gray-500">10+ indicações</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Amigos Indicados */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#1B2B49' }}>
                  <Users className="h-5 w-5" />
                  Amigos Indicados ({referralData?.referredUsers?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {referralData?.referredUsers?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {referralData.referredUsers.map((friend: any) => (
                      <div key={friend.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-500">
                          <AvatarFallback className="text-white">
                            {getInitials(friend.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{friend.fullName}</div>
                          <div className="text-sm text-gray-500">
                            Entrou em {new Date(friend.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-2">Nenhum amigo indicado ainda</p>
                    <p className="text-sm text-gray-400">Compartilhe seu código e comece a ganhar recompensas!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Conexões */}
          <TabsContent value="connections" className="space-y-4 sm:space-y-6">
            {/* Minha Rede de Companheiros */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl" style={{ color: '#1B2B49' }}>
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Minha Rede de Companheiros</span>
                  <span className="sm:hidden">Minha Rede</span>
                  <span className="text-sm font-normal">({travelCompanions?.length || 0})</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  Companheiros de viagem que você conheceu
                </CardDescription>
              </CardHeader>
              <CardContent>
                {companionsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : travelCompanions && travelCompanions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {travelCompanions.map((companion: any) => (
                      <motion.div
                        key={companion.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="relative group"
                      >
                        <Card className="hover:shadow-lg transition-shadow duration-200 border-0 bg-gradient-to-br from-white to-gray-50">
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="relative flex-shrink-0">
                                <UserAvatar 
                                  user={companion}
                                  size="md"
                                  className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-white shadow-md"
                                />
                                {companion.isVerified && (
                                  <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <Check className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-white" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-xs sm:text-sm truncate" style={{ color: '#1B2B49' }}>
                                    {companion.fullName}
                                  </h3>
                                  
                                  {/* Menu de ações - responsivo */}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40 sm:w-48">
                                      <DropdownMenuItem onClick={() => handleRateCompanion(companion)}>
                                        <Star className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="text-xs sm:text-sm">Avaliar</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleRemoveCompanion(companion.id)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <UserMinus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="text-xs sm:text-sm">Remover</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                
                                <p className="text-xs text-gray-600 mb-1 sm:mb-2 truncate">
                                  {companion.location}
                                </p>
                                
                                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
                                  <div className="flex items-center gap-0.5 sm:gap-1">
                                    <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-400 fill-current" />
                                    <span className="text-xs font-medium">
                                      {companion.averageRating || '5.0'}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-500">
                                    {companion.tripsCount || 1} viagem{(companion.tripsCount || 1) > 1 ? 's' : ''}
                                  </span>
                                </div>
                                
                                <div className="text-xs text-gray-500 hidden sm:block">
                                  Última viagem: {companion.lastTrip ? new Date(companion.lastTrip).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Recente'}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-2">Nenhum companheiro na sua rede ainda</p>
                    <p className="text-sm text-gray-400">
                      Participe de viagens para conectar-se com outros viajantes!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Convites para Viagem */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#1B2B49' }}>
                    <MessageCircle className="h-5 w-5" />
                    Convites Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-2">Nenhum convite ativo</p>
                    <p className="text-sm text-gray-400">
                      Seus próximos convites aparecerão aqui
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#1B2B49' }}>
                    <Trophy className="h-5 w-5" />
                    Estatísticas da Rede
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total de Companheiros</span>
                      <span className="font-semibold" style={{ color: '#1B2B49' }}>
                        {travelCompanions?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Países Visitados</span>
                      <span className="font-semibold" style={{ color: '#1B2B49' }}>
                        {userStats?.countriesVisited || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avaliação Média</span>
                      <span className="font-semibold" style={{ color: '#1B2B49' }}>
                        {userStats?.averageRating || '5.0'} ⭐
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba de Conquistas */}
          <TabsContent value="achievements" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {getAchievements().map((achievement, index) => (
                <motion.div
                  key={achievement.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`p-2 sm:p-3 rounded-full ${achievement.color.replace('text-', 'bg-')}/20 flex-shrink-0`}>
                          <achievement.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${achievement.color}`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm sm:text-lg truncate" style={{ color: '#1B2B49' }}>
                            {achievement.name}
                          </h3>
                          <p className="text-xs sm:text-sm" style={{ color: '#AAB0B7' }}>
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {/* Conquistas Bloqueadas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg opacity-50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 rounded-full bg-gray-200 flex-shrink-0">
                        <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm sm:text-lg text-gray-400 truncate">Economista</h3>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Economize R$1000+ em viagens
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Gamificação e Níveis */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#1B2B49' }}>
                  <Zap className="h-5 w-5" />
                  Sistema de Pontuação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-blue-600">
                      {(userStats?.completedTrips || 0) * 100}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Pontos XP</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-green-600 truncate">
                      {getTravelerLevel(userStats?.completedTrips || 0).level}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Nível</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-orange-600">
                      {getAchievements().length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Conquistas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Profile Card */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Informações Pessoais</span>
                      <span className="sm:hidden">Perfil</span>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Atualize suas informações
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={updateProfileMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancelar" : "Editar"}
                  </Button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(handleUpdateProfile)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Nome Completo</Label>
                        <Input
                          id="fullName"
                          {...form.register("fullName")}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-slate-50" : ""}
                        />
                        {form.formState.errors.fullName && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.fullName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register("email")}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-slate-50" : ""}
                        />
                        {form.formState.errors.email && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={form.watch("phone")}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          form.setValue("phone", formatted);
                        }}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-slate-50" : ""}
                      />
                      {form.formState.errors.phone && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="location">Localização</Label>
                      <Input
                        id="location"
                        {...form.register("location")}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-slate-50" : ""}
                      />
                      {form.formState.errors.location && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.location.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        {...form.register("bio")}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-slate-50" : ""}
                        rows={3}
                      />
                      {form.formState.errors.bio && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.bio.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Estilos de Viagem</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {travelStyles.map((style) => (
                          <Badge
                            key={style.value}
                            variant={form.watch("travelStyles").includes(style.value) ? "default" : "outline"}
                            className={`cursor-pointer ${!isEditing ? "pointer-events-none" : ""}`}
                            onClick={() => {
                              if (!isEditing) return;
                              const current = form.watch("travelStyles");
                              if (current.includes(style.value)) {
                                form.setValue("travelStyles", current.filter(s => s !== style.value));
                              } else {
                                form.setValue("travelStyles", [...current, style.value]);
                              }
                            }}
                          >
                            {style.label}
                          </Badge>
                        ))}
                      </div>
                      {form.formState.errors.travelStyles && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.travelStyles.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Idiomas</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {availableLanguages.map((lang) => (
                          <Badge
                            key={lang}
                            variant={form.watch("languages").includes(lang) ? "default" : "outline"}
                            className={`cursor-pointer ${!isEditing ? "pointer-events-none" : ""}`}
                            onClick={() => {
                              if (!isEditing) return;
                              const current = form.watch("languages");
                              if (current.includes(lang)) {
                                form.setValue("languages", current.filter(l => l !== lang));
                              } else {
                                form.setValue("languages", [...current, lang]);
                              }
                            }}
                          >
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Interesses</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {availableInterests.map((interest) => (
                          <Badge
                            key={interest}
                            variant={form.watch("interests").includes(interest) ? "default" : "outline"}
                            className={`cursor-pointer ${!isEditing ? "pointer-events-none" : ""}`}
                            onClick={() => {
                              if (!isEditing) return;
                              const current = form.watch("interests");
                              if (current.includes(interest)) {
                                form.setValue("interests", current.filter(i => i !== interest));
                              } else {
                                form.setValue("interests", [...current, interest]);
                              }
                            }}
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={updateProfileMutation.isPending}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                        >
                          {updateProfileMutation.isPending ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            "Salvar Alterações"
                          )}
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>


            </div>
          </TabsContent>

          {/* Referral Tab */}
          <TabsContent value="referral" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Seu Código de Indicação
                  </CardTitle>
                  <CardDescription>
                    Compartilhe com amigos e ganhe benefícios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {referralLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Input
                          value={referralData?.code || "LOADING..."}
                          readOnly
                          className="font-mono text-center text-lg bg-slate-50"
                        />
                        <Button
                          onClick={copyReferralCode}
                          variant="outline"
                          size="icon"
                        >
                          {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium mb-1">Como funciona:</p>
                        <ul className="space-y-1">
                          <li>• Compartilhe seu código com amigos</li>
                          <li>• Eles ganham 10% de desconto na primeira viagem</li>
                          <li>• Você ganha créditos para suas próximas viagens</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Amigos Indicados
                  </CardTitle>
                  <CardDescription>
                    Pessoas que usaram seu código
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {referralLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="space-y-4">
                      {referralData?.referredUsers?.length > 0 ? (
                        <div className="space-y-3">
                          {referralData.referredUsers.map((referredUser: any) => (
                            <div key={referredUser.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                              <Avatar className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600">
                                <AvatarFallback className="text-white text-sm">
                                  {getInitials(referredUser.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">{referredUser.fullName}</p>
                                <p className="text-sm text-slate-600">
                                  Entrou em {new Date(referredUser.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="secondary">
                                <UserPlus className="h-3 w-3 mr-1" />
                                Ativo
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Nenhum amigo indicado ainda</p>
                          <p className="text-sm">Compartilhe seu código para começar!</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Plane className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {statsLoading ? "..." : userStats?.totalTrips || 0}
                      </p>
                      <p className="text-sm text-slate-600">Viagens Totais</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {statsLoading ? "..." : userStats?.completedTrips || 0}
                      </p>
                      <p className="text-sm text-slate-600">Viagens Completas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {statsLoading ? "..." : userStats?.travelPartners || 0}
                      </p>
                      <p className="text-sm text-slate-600">Companheiros</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {statsLoading ? "..." : userStats?.averageRating || "5.0"}
                      </p>
                      <p className="text-sm text-slate-600">Avaliação</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-3xl mb-2">🎯</div>
                    <h4 className="font-semibold">Explorador</h4>
                    <p className="text-sm text-slate-600">Primeira viagem completa</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="text-3xl mb-2">🤝</div>
                    <h4 className="font-semibold">Sociável</h4>
                    <p className="text-sm text-slate-600">5+ companheiros de viagem</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-3xl mb-2">🌟</div>
                    <h4 className="font-semibold">Confiável</h4>
                    <p className="text-sm text-slate-600">Avaliação 5.0 estrelas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Avatar Upload Modal */}
      {showAvatarUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Alterar Foto de Perfil</h3>
            <div className="space-y-4">
              <div className="text-center">
                <UserAvatar 
                  user={user}
                  size="xl"
                  className="h-24 w-24 mx-auto mb-4"
                  showVerificationBadge={false}
                />
                <p className="text-sm text-gray-600 mb-4">
                  Escolha uma nova foto de perfil
                </p>
              </div>
              
              <div className="space-y-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Button 
                  onClick={triggerAvatarUpload}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Escolher Arquivo
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowAvatarUpload(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Cover Upload Modal */}
      {showCoverUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Alterar Imagem de Capa</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="h-32 w-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mb-4 flex items-center justify-center">
                  <Image className="h-12 w-12 text-white" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Escolha uma nova imagem de capa para seu perfil
                </p>
              </div>
              
              <div className="space-y-2">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
                <Button 
                  onClick={triggerCoverUpload}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Escolher Arquivo
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowCoverUpload(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog para Avaliar Companheiro */}
      <Dialog open={showRateDialog} onOpenChange={setShowRateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Avaliar Companheiro de Viagem</DialogTitle>
            <DialogDescription>
              Avalie sua experiência com {selectedCompanion?.fullName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Avaliação</Label>
              <div className="flex justify-center">
                {renderStarRating(rating, setRating)}
              </div>
            </div>
            
            <div>
              <Label htmlFor="rating-comment" className="text-sm font-medium mb-2 block">
                Comentário (opcional)
              </Label>
              <Textarea
                id="rating-comment"
                placeholder="Compartilhe sua experiência de viagem..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowRateDialog(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={submitRating}
                disabled={rateCompanionMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {rateCompanionMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  "Enviar Avaliação"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}