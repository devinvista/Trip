import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Heart,
  Share2,
  Calendar,
  Shield,
  Award,
  MessageSquare,
  Camera,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Plane,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ActivityBudgetProposals } from "@/components/activity-budget-proposals";
import { AddActivityToTrip } from "@/components/add-activity-to-trip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { activityCategories, insertActivityBookingSchema } from "@shared/schema";
import type { Activity, ActivityReview, ActivityBooking, InsertActivityBooking, ActivityBudgetProposal } from "@shared/schema";

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showAddToTripDialog, setShowAddToTripDialog] = useState(false);
  const [selectedProposals, setSelectedProposals] = useState<ActivityBudgetProposal[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Helper function to safely parse JSON arrays
  const parseJsonArray = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const { data: activity, isLoading: activityLoading } = useQuery<Activity>({
    queryKey: [`/api/activities/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/activities/${id}`);
      if (!response.ok) throw new Error("Atividade não encontrada");
      return response.json();
    },
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<(ActivityReview & { user: any })[]>({
    queryKey: [`/api/activities/${id}/reviews`],
    queryFn: async () => {
      const response = await fetch(`/api/activities/${id}/reviews`);
      if (!response.ok) throw new Error("Falha ao carregar avaliações");
      return response.json();
    },
  });

  const { data: proposals, isLoading: proposalsLoading } = useQuery<ActivityBudgetProposal[]>({
    queryKey: [`/api/activities/${id}/proposals`],
    queryFn: async () => {
      const response = await fetch(`/api/activities/${id}/proposals`);
      if (!response.ok) throw new Error("Erro ao buscar propostas");
      return response.json();
    },
    enabled: !!id,
  });

  const bookingForm = useForm<InsertActivityBooking>({
    resolver: zodResolver(insertActivityBookingSchema),
    defaultValues: {
      activityId: Number(id),
      participants: 1,
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      specialRequests: "",
      bookingDate: new Date(),
      totalAmount: 0,
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: InsertActivityBooking) => {
      const response = await fetch(`/api/activities/${id}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Falha ao fazer reserva");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Reserva realizada com sucesso!" });
      setShowBookingDialog(false);
      bookingForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao fazer reserva", description: error.message, variant: "destructive" });
    },
  });

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

  const calculateTotalPrice = () => {
    if (!activity?.priceAmount) return 0;
    const participants = bookingForm.watch("participants") || 1;
    return activity.priceType === "per_person" 
      ? activity.priceAmount * participants
      : activity.priceAmount;
  };

  // Helper function to safely parse JSON arrays for proposals
  const safeParseArray = (data: any) => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        let parsed = JSON.parse(data);
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Handle proposal selection for adding to trip
  const handleProposalSelect = (proposal: ActivityBudgetProposal, selected: boolean) => {
    if (selected) {
      setSelectedProposals(prev => [...prev, proposal]);
    } else {
      setSelectedProposals(prev => prev.filter(p => p.id !== proposal.id));
    }
  };

  if (activityLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner variant="travel" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Atividade não encontrada</h2>
          <Link to="/activities">
            <Button>Voltar para atividades</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/activities">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Favoritar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-6">
              <div className="relative rounded-lg overflow-hidden">
                {(() => {
                  const images = parseJsonArray(activity.images);
                  return (
                    <img
                      src={images[selectedImageIndex] || activity.coverImage}
                      alt={activity.title}
                      className="w-full h-96 object-cover"
                    />
                  );
                })()}
                
                {(() => {
                  const images = parseJsonArray(activity.images);
                  return images && images.length > 1 && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex gap-2 overflow-x-auto">
                        {images.map((image: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                              index === selectedImageIndex 
                                ? "border-white" 
                                : "border-white/50"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${activity.title} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Activity Info */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {activityCategories[activity.category as keyof typeof activityCategories]?.label}
                  </Badge>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {activity.title}
                  </h1>
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
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(Number(activity.averageRating))}
                  </div>
                  <span className="text-sm font-medium">
                    {Number(activity.averageRating).toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({activity.totalRatings} avaliações)
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                {activity.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activity.difficultyLevel && (
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium">Dificuldade</div>
                      <div className="text-xs text-gray-600">
                        {activity.difficultyLevel === "easy" && "Fácil"}
                        {activity.difficultyLevel === "moderate" && "Moderado"}
                        {activity.difficultyLevel === "challenging" && "Desafiador"}
                      </div>
                    </div>
                  </div>
                )}

                {activity.minParticipants && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm font-medium">Participantes</div>
                      <div className="text-xs text-gray-600">
                        {activity.minParticipants} - {activity.maxParticipants || "∞"}
                      </div>
                    </div>
                  </div>
                )}

                {(() => {
                  const languages = parseJsonArray(activity.languages);
                  return languages.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="text-sm font-medium">Idiomas</div>
                        <div className="text-xs text-gray-600">
                          {languages.join(", ")}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="mb-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="proposals">Orçamentos</TabsTrigger>
                <TabsTrigger value="reviews">Avaliações</TabsTrigger>
                <TabsTrigger value="location">Localização</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <div className="bg-white rounded-lg border p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(() => {
                      const inclusions = parseJsonArray(activity.inclusions);
                      return inclusions.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Incluso
                          </h3>
                          <ul className="space-y-2">
                            {inclusions.map((item, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}

                    {(() => {
                      const exclusions = parseJsonArray(activity.exclusions);
                      return exclusions.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            Não incluso
                          </h3>
                          <ul className="space-y-2">
                            {exclusions.map((item, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}
                  </div>

                  {(() => {
                    const requirements = parseJsonArray(activity.requirements);
                    return requirements.length > 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-blue-600" />
                          Requisitos e Restrições
                        </h3>
                        <ul className="space-y-2">
                          {requirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}

                  {activity.cancellationPolicy && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Política de Cancelamento
                      </h3>
                      <p className="text-sm text-gray-600">{activity.cancellationPolicy}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="proposals" className="mt-6">
                <ActivityBudgetProposals 
                  activityId={Number(id)} 
                  allowMultipleSelection={true}
                  onProposalsChange={setSelectedProposals}
                />
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="bg-white rounded-lg border p-6">
                  {reviewsLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={review.user.profilePhoto} />
                              <AvatarFallback>
                                {review.user.fullName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{review.user.fullName}</span>
                                <div className="flex items-center gap-1">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {format(new Date(review.createdAt), "MMM yyyy", { locale: ptBR })}
                                </span>
                              </div>
                              
                              {review.review && (
                                <p className="text-gray-700 mb-2">{review.review}</p>
                              )}
                              
                              {review.photos && review.photos.length > 0 && (
                                <div className="flex gap-2 mb-2">
                                  {review.photos.map((photo, index) => (
                                    <img
                                      key={index}
                                      src={photo}
                                      alt={`Review ${index + 1}`}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <button className="flex items-center gap-1 hover:text-blue-600">
                                  <MessageSquare className="w-4 h-4" />
                                  Útil ({review.helpfulVotes})
                                </button>
                                {review.isVerified && (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    Verificado
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhuma avaliação ainda
                      </h3>
                      <p className="text-gray-600">
                        Seja o primeiro a avaliar esta atividade!
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="location" className="mt-6">
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Localização</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <span className="text-gray-700">{activity.location}</span>
                  </div>
                  
                  {/* Placeholder for map */}
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Mapa interativo em breve</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatPrice(activity.priceType, activity.priceAmount)}
                </div>
                <div className="text-sm text-gray-600">
                  {activity.priceType === "per_person" ? "por pessoa" : "por grupo"}
                </div>
              </div>

              <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full mb-3 bg-blue-600 hover:bg-blue-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Reservar Agora
                  </Button>
                </DialogTrigger>
              </Dialog>

              <Button 
                onClick={() => setShowAddToTripDialog(true)}
                variant="outline" 
                className="w-full mb-4 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Plane className="w-4 h-4 mr-2" />
                Adicionar à Viagem
              </Button>



              <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
                <DialogTrigger asChild>
                  <div style={{ display: 'none' }}></div>
                </DialogTrigger>
                <DialogContent aria-describedby="booking-description">
                  <DialogHeader>
                    <DialogTitle>Reservar Atividade</DialogTitle>
                    <p id="booking-description" className="text-sm text-gray-600">
                      Preencha os dados abaixo para fazer sua reserva
                    </p>
                  </DialogHeader>
                  
                  <Form {...bookingForm}>
                    <form onSubmit={bookingForm.handleSubmit((data) => {
                      bookingMutation.mutate({ ...data, totalAmount: calculateTotalPrice() });
                    })} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={bookingForm.control}
                          name="participants"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Participantes</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max={activity.maxParticipants || 50}
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={bookingForm.control}
                          name="bookingDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field}
                                  value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                                  onChange={(e) => field.onChange(new Date(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={bookingForm.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={bookingForm.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="seu@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={bookingForm.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input placeholder="(11) 99999-9999" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={bookingForm.control}
                        name="specialRequests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Observações especiais</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Alguma observação ou solicitação especial..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-lg font-semibold">
                          <span>Total:</span>
                          <span className="text-blue-600">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(calculateTotalPrice())}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowBookingDialog(false)}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={bookingMutation.isPending}
                          className="flex-1"
                        >
                          {bookingMutation.isPending ? "Reservando..." : "Confirmar Reserva"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              

              <Separator className="my-6" />

              {/* Contact Info */}
              {activity.contactInfo && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Informações de Contato
                  </h3>
                  <div className="space-y-3">
                    {activity.contactInfo.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <a 
                          href={`mailto:${activity.contactInfo.email}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {activity.contactInfo.email}
                        </a>
                      </div>
                    )}
                    
                    {activity.contactInfo.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <a 
                          href={`tel:${activity.contactInfo.phone}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {activity.contactInfo.phone}
                        </a>
                      </div>
                    )}
                    
                    {activity.contactInfo.whatsapp && (
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-4 h-4 text-gray-600" />
                        <a 
                          href={`https://wa.me/${activity.contactInfo.whatsapp}`}
                          className="text-sm text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>
                      </div>
                    )}
                    
                    {activity.contactInfo.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-gray-600" />
                        <a 
                          href={activity.contactInfo.website}
                          className="text-sm text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add to Trip Dialog */}
      <AddActivityToTrip 
        activity={activity}
        isOpen={showAddToTripDialog}
        onClose={() => setShowAddToTripDialog(false)}
        selectedProposals={selectedProposals}
      />
    </div>
  );
}