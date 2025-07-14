import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plane
} from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";

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
  travelStyles: z.array(z.enum(["praia", "neve", "cruzeiros", "natureza", "culturais", "aventura", "urbanas", "parques"])).min(1, "Selecione pelo menos um estilo de viagem")
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

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone ? formatPhoneNumber(user.phone) : "",
      bio: user?.bio || "",
      location: user?.location || "",
      languages: user?.languages || [],
      interests: user?.interests || [],
      travelStyles: user?.travelStyles || []
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Meu Perfil</h1>
          <p className="text-slate-600">Gerencie suas informações pessoais e configurações</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="referral">Indicações</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

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
                            variant={form.watch("travelStyles")?.includes(style.value) ? "default" : "outline"}
                            className={`cursor-pointer ${!isEditing ? "pointer-events-none" : ""}`}
                            onClick={() => {
                              if (!isEditing) return;
                              const current = form.watch("travelStyles") || [];
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

              {/* Profile Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Perfil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <Avatar className="h-24 w-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600">
                      <AvatarFallback className="text-white text-lg font-bold">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{user.fullName}</h3>
                    <p className="text-slate-600 flex items-center justify-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Idiomas:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {user.languages?.map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Interesses:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {user.interests?.map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Estilos de Viagem:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {user.travelStyles?.map((style) => {
                        const styleLabel = travelStyles.find(s => s.value === style)?.label || style;
                        return (
                          <Badge key={style} variant="secondary" className="text-xs">
                            {styleLabel}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {user.bio && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Bio:</h4>
                      <p className="text-sm text-slate-600">{user.bio}</p>
                    </div>
                  )}
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
    </div>
  );
}