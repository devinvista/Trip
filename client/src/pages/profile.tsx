import { useAuth } from "@/hooks/use-auth";
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
  Upload
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
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos").max(20, "Telefone deve ter no máximo 20 dígitos"),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
  location: z.string().min(2, "Localização deve ter pelo menos 2 caracteres"),
  languages: z.array(z.string()).min(1, "Selecione pelo menos um idioma"),
  interests: z.array(z.string()).min(1, "Selecione pelo menos um interesse"),
  travelStyle: z.string().min(1, "Selecione um estilo de viagem")
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
      travelStyle: user?.travelStyle || ""
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Moderno do Perfil */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          {/* Banner dinâmico com mosaico de destinos */}
          <div className="relative h-64 rounded-2xl overflow-hidden mb-6"
               style={{ 
                 backgroundImage: `linear-gradient(45deg, #1B2B49 0%, #41B6FF 50%, #FFA500 100%)`,
                 backgroundSize: 'cover'
               }}>
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Botão para alterar cover */}
            <button
              onClick={() => setShowCoverUpload(true)}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
            
            {/* Elementos de viagem flutuantes */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Luggage className="h-5 w-5 text-white" />
              </div>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Compass className="h-5 w-5 text-white" />
              </div>
            </div>
            
            {/* Avatar interativo com bordas gradientes pulsantes - posicionado dentro da capa */}
            <div className="absolute bottom-6 left-8">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
                <UserAvatar 
                  user={user}
                  size="xl"
                  className="relative h-32 w-32 border-4 border-white shadow-xl"
                />
                
                {/* Botão para alterar avatar */}
                <button
                  onClick={() => setShowAvatarUpload(true)}
                  className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                >
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
                
                {/* Badge centralizado na base inferior com design moderno - versão compacta */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getTravelerLevel(userStats?.completedTrips || 0).color} shadow-md border border-white/30 backdrop-blur-sm`}>
                    {getTravelerLevel(userStats?.completedTrips || 0).level}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Informações do perfil */}
          <div className="ml-8 mt-4">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B2B49' }}>
              {user.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mb-4">
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
            
            {/* Bio editável */}
            <p className="text-gray-600 max-w-2xl mb-4">
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

        <Tabs defaultValue="stats" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 h-14 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <TabsTrigger value="stats" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-xl">
              <Award className="h-4 w-4 mr-2" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="partiuamigos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl">
              <Gift className="h-4 w-4 mr-2" />
              PartiuAmigos
            </TabsTrigger>
            <TabsTrigger value="connections" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl">
              <Users className="h-4 w-4 mr-2" />
              Conexões
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-xl">
              <Trophy className="h-4 w-4 mr-2" />
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white rounded-xl">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Aba de Estatísticas */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <TabsContent value="partiuamigos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    
                    <div className="flex gap-2">
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
                        WhatsApp
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
          <TabsContent value="connections" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Minha Rede */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#1B2B49' }}>
                    <Users className="h-5 w-5" />
                    Minha Rede de Viagem
                  </CardTitle>
                  <CardDescription>
                    Conecte-se com companheiros de viagem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-2">Sua rede está crescendo!</p>
                    <p className="text-sm text-gray-400">
                      {userStats?.travelPartners || 0} conexões de viagem
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Convites para Viagem */}
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
            </div>
          </TabsContent>

          {/* Aba de Conquistas */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getAchievements().map((achievement, index) => (
                <motion.div
                  key={achievement.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${achievement.color.replace('text-', 'bg-')}/20`}>
                          <achievement.icon className={`h-8 w-8 ${achievement.color}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg" style={{ color: '#1B2B49' }}>
                            {achievement.name}
                          </h3>
                          <p className="text-sm" style={{ color: '#AAB0B7' }}>
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
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-gray-200">
                        <DollarSign className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-400">Economista</h3>
                        <p className="text-sm text-gray-400">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(userStats?.completedTrips || 0) * 100}
                    </div>
                    <div className="text-sm text-gray-600">Pontos XP</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {getTravelerLevel(userStats?.completedTrips || 0).level}
                    </div>
                    <div className="text-sm text-gray-600">Nível Atual</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {getAchievements().length}
                    </div>
                    <div className="text-sm text-gray-600">Conquistas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informações Pessoais
                    </CardTitle>
                    <CardDescription>
                      Atualize suas informações para melhor experiência
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={updateProfileMutation.isPending}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancelar" : "Editar"}
                  </Button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(handleUpdateProfile)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            variant={form.watch("travelStyle") === style.value ? "default" : "outline"}
                            className={`cursor-pointer ${!isEditing ? "pointer-events-none" : ""}`}
                            onClick={() => {
                              if (!isEditing) return;
                              const current = form.watch("travelStyle");
                              if (current === style.value) {
                                form.setValue("travelStyle", "");
                              } else {
                                form.setValue("travelStyle", style.value);
                              }
                            }}
                          >
                            {style.label}
                          </Badge>
                        ))}
                      </div>
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
    </div>
  );
}