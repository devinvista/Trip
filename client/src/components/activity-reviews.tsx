import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertActivityReviewSchema } from "@shared/schema";
import type { z } from "zod";
import { Star, ThumbsUp, User, Calendar, MessageSquare, Plus, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth-snake";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBrazilianCurrency, formatBrazilianNumber } from "@shared/utils";

type ActivityReview = {
  id: number;
  activityId: number;
  rating: number;
  review: string | null;
  photos: string[];
  visit_date: string | null;
  helpful_votes: number;
  is_verified: boolean;
  created_at: string;
  user: {
    id: number;
    username: string;
    full_name: string;
    profile_photo: string | null;
    average_rating: number;
    is_verified: boolean;
  };
};

interface ActivityReviewsProps {
  activityId: number;
  averageRating?: number;
  totalRatings?: number;
}

type ReviewFormData = z.infer<typeof insertActivityReviewSchema>;

export function ActivityReviews({ activityId, averageRating = 0, totalRatings = 0 }: ActivityReviewsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(insertActivityReviewSchema),
    defaultValues: {
      activity_id: activityId,
      rating: 5,
      review: "",
      photos: [],
      visit_date: new Date()
    }
  });

  // Fetch reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['/api/activities', activityId, 'reviews'],
    queryFn: async () => {
      const response = await fetch(`/api/activities/${activityId}/reviews`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
    enabled: !!activityId
  });

  // Create review mutation
  const createReview = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const response = await fetch(`/api/activities/${activityId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar avaliação');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Avaliação criada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['/api/activities', activityId, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities', activityId] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao criar avaliação", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Mark review as helpful mutation
  const markHelpful = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar avaliação como útil');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities', activityId, 'reviews'] });
    }
  });

  const handleSubmit = (data: ReviewFormData) => {
    if (!user) {
      toast({ 
        title: "Erro de autenticação", 
        description: "Você precisa estar logado para avaliar atividades",
        variant: "destructive" 
      });
      return;
    }
    
    createReview.mutate(data);
  };

  const renderStars = (rating: number, size: "sm" | "md" = "md") => {
    const starSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`${starSize} ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderInteractiveStars = (rating: number, onChange: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className="transition-colors hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating} estrela{rating !== 1 ? 's' : ''})</span>
      </div>
    );
  };

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const hasUserReviewed = reviews.some((review: ActivityReview) => review.user.id === user?.id);

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Avaliações dos Viajantes</span>
            {!hasUserReviewed && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Avaliar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Avaliar Atividade</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="activity_id"
                        render={({ field }) => (
                          <FormItem className="hidden">
                            <FormControl>
                              <Input type="hidden" {...field} value={activityId} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sua Avaliação</FormLabel>
                            <FormControl>
                              <div className="pt-2">
                                {renderInteractiveStars(field.value, field.onChange)}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="review"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comentário (opcional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Conte sobre sua experiência com esta atividade..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="visit_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data da Visita (opcional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="date"
                                {...field}
                                value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2 pt-4">
                        <Button
                          type="submit"
                          disabled={createReview.isPending}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                          {createReview.isPending ? "Enviando..." : "Enviar Avaliação"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>

          {totalRatings > 0 ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {renderStars(Math.round(averageRating))}
                <span className="text-2xl font-bold">{formatBrazilianNumber(Number(averageRating)).replace(',00', ',0')}</span>
              </div>
              <div className="text-sm text-gray-600">
                Baseado em {totalRatings} avaliação{totalRatings !== 1 ? 'ões' : ''}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Ainda não há avaliações para esta atividade
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {displayedReviews.map((review: ActivityReview) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.user.profile_photo || ""} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.user.full_name}</span>
                            {review.user.is_verified && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                            {review.is_verified && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                                Verificado
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating, "sm")}
                            <span className="text-xs text-gray-500">
                              {format(new Date(review.created_at), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>

                        {review.visit_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            Visitou em {format(new Date(review.visit_date), "MMM 'de' yyyy", { locale: ptBR })}
                          </div>
                        )}

                        {review.review && (
                          <p className="text-gray-700 leading-relaxed">{review.review}</p>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markHelpful.mutate(review.id)}
                            disabled={markHelpful.isPending}
                            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Útil ({review.helpful_votes})
                          </Button>
                          
                          {review.user.average_rating && Number(review.user.average_rating) > 0 && (
                            <div className="text-xs text-gray-500">
                              Viajante {formatBrazilianNumber(Number(review.user.average_rating)).replace(',00', ',0')} ⭐
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Show More Button */}
      {reviews.length > 3 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {showAllReviews ? 'Ver Menos' : `Ver Todas (${reviews.length})`}
          </Button>
        </div>
      )}

      {hasUserReviewed && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-blue-700 font-medium">Você já avaliou esta atividade</p>
            <p className="text-sm text-blue-600">Obrigado por compartilhar sua experiência!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}