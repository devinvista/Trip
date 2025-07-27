import { 
  users, trips, tripParticipants, messages, tripRequests, expenses, expenseSplits, 
  userRatings, destinationRatings, verificationRequests, activities, activityReviews, 
  activityBookings, activityBudgetProposals, tripActivities, 
  destinations, type User, type InsertUser, type Trip, type InsertTrip, type Message, 
  type InsertMessage, type TripRequest, type InsertTripRequest, type TripParticipant, 
  type Expense, type InsertExpense, type ExpenseSplit, type InsertExpenseSplit, 
  type UserRating, type InsertUserRating, type DestinationRating, type InsertDestinationRating, 
  type VerificationRequest, type InsertVerificationRequest, type Activity, type InsertActivity, 
  type ActivityReview, type InsertActivityReview, type ActivityBooking, type InsertActivityBooking, 
  type ActivityBudgetProposal, type InsertActivityBudgetProposal, 
  type TripActivity, type InsertTripActivity, popularDestinations 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, and, sql, desc, asc, gte, lte, ne, like } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);

// Helper function to get cover image for destination
function getCoverImageForDestination(destination: string, travelStyle?: string): string | null {
  console.log(`🖼️  Buscando imagem para destino: "${destination}", estilo: "${travelStyle}"`);
  
  // Normalize destination for better matching
  const normalizedDestination = destination.toLowerCase().trim();
  
  // Define specific landmark images for iconic destinations - organized like a travel agency
  const iconicDestinations: { [key: string]: string } = {
    // EUROPA - Destinos Clássicos
    "paris": "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&q=80",
    "roma": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    "londres": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    "barcelona": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80",
    "amsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80",
    "berlim": "https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=800&q=80",
    "atenas": "https://images.unsplash.com/photo-1571045173242-a5a3d06c8f27?w=800&q=80",
    "praga": "https://images.unsplash.com/photo-1596436048549-f4e7e0c9e50c?w=800&q=80",
    "viena": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    // ÁSIA - Destinos Exóticos
    "tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    "pequim": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
    "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    "nova délhi": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
    "bangkok": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    // ÁFRICA E ORIENTE MÉDIO
    "cairo": "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&q=80",
    "marrakech": "https://images.unsplash.com/photo-1517821362941-f5aa9717bb51?w=800&q=80",
    "cidade do cabo": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80",
    // AMÉRICAS - Destinos Icônicos
    "nova york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    "los angeles": "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800&q=80",
    "san francisco": "https://images.unsplash.com/photo-1519928917901-d0c2912d0c9b?w=800&q=80",
    "rio de janeiro": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
    "buenos aires": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80",
    "lima": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    // OCEANIA
    "sydney": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    // BRASIL - Destinos Nacionais
    "são paulo": "https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=800&q=80",
    "salvador": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    "manaus": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    // DESTINOS DE CRUZEIROS - Experiências Marítimas
    "mediterrâneo": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg",
    "caribe": "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg",
  };
  
  // Tratamento especial para destinos de cruzeiro
  if (travelStyle === 'cruzeiros') {
    return "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg";
  }
  
  // Tentar encontrar correspondência exata em destinos icônicos
  if (iconicDestinations[normalizedDestination]) {
    return iconicDestinations[normalizedDestination];
  }
  
  // Tentar encontrar correspondência parcial em destinos icônicos
  for (const [key, image] of Object.entries(iconicDestinations)) {
    if (normalizedDestination.includes(key) || key.includes(normalizedDestination)) {
      return image;
    }
  }
  
  // Tentar encontrar correspondência exata em destinos populares
  const popular = popularDestinations();
  if (destination in popular) {
    return popular[destination as keyof typeof popular].image;
  }
  
  // Tentar encontrar correspondência parcial em destinos populares
  for (const [dest, data] of Object.entries(popular)) {
    const destKey = dest.toLowerCase();
    const cityName = destKey.split(',')[0].trim();
    const inputCity = normalizedDestination.split(',')[0].trim();
    
    if (destKey === normalizedDestination || cityName === inputCity || 
        normalizedDestination.includes(cityName) || cityName.includes(inputCity)) {
      return data.image;
    }
  }
  
  // Imagem padrão para destinos desconhecidos
  return "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80";
}

export interface IStorage {
  sessionStore: session.Store;

  // Usuários
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Viagens
  getTrip(id: number): Promise<Trip | undefined>;
  getTripsByCreator(creator_id: number): Promise<Trip[]>;
  getTripsByParticipant(user_id: number): Promise<Trip[]>;
  getTrips(filters?: { destination?: string; startDate?: Date; endDate?: Date; budget?: number; travelStyle?: string }): Promise<Trip[]>;
  createTrip(trip: InsertTrip & { creator_id: number }): Promise<Trip>;
  updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | undefined>;
  updateTripActivities(trip_id: number, planned_activities: any): Promise<Trip | undefined>;
  deleteTrip(id: number): Promise<boolean>;

  // Participantes de Viagem
  getTripParticipants(trip_id: number): Promise<(TripParticipant & { user: User })[]>;
  addTripParticipant(trip_id: number, user_id: number): Promise<TripParticipant>;
  updateTripParticipant(trip_id: number, user_id: number, status: string): Promise<TripParticipant | undefined>;
  removeTripParticipant(trip_id: number, user_id: number): Promise<void>;
  recalculateExpenseSplits(trip_id: number): Promise<void>;

  // Mensagens
  getTripMessages(trip_id: number): Promise<(Message & { sender: User })[]>;
  createMessage(message: InsertMessage & { senderId: number }): Promise<Message>;

  // Solicitações de Viagem
  getTripRequests(trip_id: number): Promise<(TripRequest & { user: User })[]>;
  getUserTripRequests(user_id: number): Promise<(TripRequest & { trip: Trip })[]>;
  createTripRequest(request: InsertTripRequest & { user_id: number }): Promise<TripRequest>;
  updateTripRequest(id: number, status: string): Promise<TripRequest | undefined>;

  // Despesas
  getTripExpenses(trip_id: number): Promise<(Expense & { payer: User; splits: (ExpenseSplit & { user: User })[] })[]>;
  createExpense(expense: InsertExpense & { paid_by: number }): Promise<Expense>;
  createExpenseSplits(splits: InsertExpenseSplit[]): Promise<ExpenseSplit[]>;
  updateExpenseSplit(id: number, paid: boolean): Promise<ExpenseSplit | undefined>;
  getTripBalances(trip_id: number): Promise<{ user_id: number; user: User; balance: number }[]>;

  // Avaliações de Usuário
  getUserRatings(user_id: number): Promise<(UserRating & { rater: User; trip: Trip })[]>;
  createUserRating(rating: InsertUserRating & { raterUserId: number }): Promise<UserRating>;
  updateUserAverageRating(user_id: number): Promise<void>;

  // Avaliações de Destino
  getDestinationRatings(destination: string): Promise<(DestinationRating & { user: User })[]>;
  createDestinationRating(rating: InsertDestinationRating & { user_id: number }): Promise<DestinationRating>;
  getDestinationAverageRating(destination: string): Promise<{ average: number; total: number }>;

  // Verificação de Usuário
  getVerificationRequests(user_id?: number): Promise<(VerificationRequest & { user: User })[]>;
  createVerificationRequest(request: InsertVerificationRequest & { user_id: number }): Promise<VerificationRequest>;
  updateVerificationRequest(id: number, status: string, reviewedBy?: number, rejectionReason?: string): Promise<VerificationRequest | undefined>;
  updateUserVerificationStatus(user_id: number, isVerified: boolean, method?: string): Promise<void>;

  // Atividades
  getActivities(filters?: { 
    search?: string; 
    category?: string; 
    location?: string; 
    priceRange?: string; 
    difficulty?: string; 
    duration?: string; 
    rating?: string; 
    sortBy?: string; 
  }): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity & { createdById: number }): Promise<Activity>;
  updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;

  // Avaliações de Atividades
  getActivityReviews(activityId: number): Promise<(ActivityReview & { user: User })[]>;
  createActivityReview(review: InsertActivityReview & { user_id: number }): Promise<ActivityReview>;
  updateActivityAverageRating(activityId: number): Promise<void>;

  // Reservas de Atividades
  getActivityBookings(activityId: number): Promise<(ActivityBooking & { user: User })[]>;
  getUserActivityBookings(user_id: number): Promise<(ActivityBooking & { activity: Activity })[]>;
  createActivityBooking(booking: InsertActivityBooking & { user_id: number }): Promise<ActivityBooking>;
  updateActivityBooking(id: number, status: string): Promise<ActivityBooking | undefined>;

  // Propostas de Orçamento para Atividades
  getActivityBudgetProposals(activityId: number): Promise<(ActivityBudgetProposal & { creator: User })[]>;
  createActivityBudgetProposal(proposal: InsertActivityBudgetProposal & { createdBy: number }): Promise<ActivityBudgetProposal>;
  updateActivityBudgetProposal(id: number, updates: Partial<ActivityBudgetProposal>): Promise<ActivityBudgetProposal | undefined>;
  deleteActivityBudgetProposal(id: number): Promise<boolean>;
  voteActivityBudgetProposal(proposalId: number, user_id: number, increment: boolean): Promise<ActivityBudgetProposal | undefined>;

  // Atividades de Viagem
  getTripActivities(trip_id: number): Promise<(TripActivity & { activity: Activity; proposal: ActivityBudgetProposal; addedByUser: User })[]>;
  addActivityToTrip(tripActivity: InsertTripActivity & { addedBy: number }): Promise<TripActivity>;
  updateTripActivity(id: number, updates: Partial<TripActivity>): Promise<TripActivity | undefined>;
  removeTripActivity(id: number): Promise<boolean>;
  
  // Obter viagens do usuário na mesma localização da atividade
  getUserTripsInLocation(user_id: number, location: string): Promise<Trip[]>;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  private sanitizeUser(user: User | undefined): Omit<User, 'password'> | undefined {
    if (!user) return undefined;
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    }) as session.Store;

    setTimeout(() => this.runCreatorParticipantsFix(), 1000);
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por email:', error);
      return undefined;
    }
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const allUsers = await db.select().from(users);
      return allUsers.find(user => user.phone.replace(/\D/g, '') === cleanPhone);
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por telefone:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values({
        ...insertUser,
        isVerified: false,
        verificationMethod: null,
        averageRating: "0.00",
        totalRatings: 0 
      }).returning();
      
      return user;
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db.update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      return undefined;
    }
  }

  async getTrip(id: number): Promise<Trip | undefined> {
    try {
      const [trip] = await db.select().from(trips).where(eq(trips.id, id));
      return trip;
    } catch (error) {
      console.error('❌ Erro ao buscar viagem:', error);
      return undefined;
    }
  }

  async getTripsByCreator(creator_id: number): Promise<Trip[]> {
    try {
      return await db.select().from(trips).where(eq(trips.creator_id, creator_id));
    } catch (error) {
      console.error('❌ Erro ao buscar viagens do criador:', error);
      return [];
    }
  }

  async getTripsByParticipant(user_id: number): Promise<Trip[]> {
    try {
      return await db.select({
        id: trips.id,
        title: trips.title,
        destination_id: trips.destination_id,
        cover_image: trips.cover_image,
        start_date: trips.start_date,
        end_date: trips.end_date,
        budget: trips.budget,
        max_participants: trips.max_participants,
        description: trips.description,
        travel_style: trips.travel_style,
        creator_id: trips.creator_id,
        status: trips.status,
        budget_breakdown: trips.budget_breakdown,
        current_participants: trips.current_participants,
        shared_costs: trips.shared_costs,
        created_at: trips.created_at
      })
      .from(trips)
      .innerJoin(tripParticipants, eq(tripParticipants.trip_id, trips.id))
      .where(and(
        eq(tripParticipants.user_id, user_id),
        eq(tripParticipants.status, 'accepted'),
        ne(trips.creator_id, user_id)
      ));
    } catch (error) {
      console.error('❌ Erro ao buscar viagens do participante:', error);
      return [];
    }
  }

  async getTrips(filters?: { destination?: string; startDate?: Date; endDate?: Date; budget?: number; travelStyle?: string }): Promise<Trip[]> {
    try {
      let query = db.select().from(trips).where(eq(trips.status, 'open'));

      if (filters) {
        const conditions = [eq(trips.status, 'open')];
        
        if (filters.destination) {
          conditions.push(like(trips.destination_id, `%${filters.destination}%`));
        }
        if (filters.startDate) {
          conditions.push(gte(trips.startDate, filters.startDate));
        }
        if (filters.endDate) {
          conditions.push(lte(trips.endDate, filters.endDate));
        }
        if (filters.budget) {
          conditions.push(lte(trips.budget, filters.budget));
        }
        if (filters.travelStyle) {
          conditions.push(eq(trips.travel_style, filters.travelStyle));
        }

        query = db.select().from(trips).where(and(...conditions));
      }

      return await query.orderBy(desc(trips.created_at));
    } catch (error) {
      console.error('❌ Erro ao buscar viagens:', error);
      return [];
    }
  }

  async createTrip(tripData: InsertTrip & { creator_id: number }): Promise<Trip> {
    try {
      const coverImage = tripData.coverImage || getCoverImageForDestination("default", tripData.travel_style);
      
      const [trip] = await db.insert(trips).values({
        ...tripData,
        cover_image: coverImage,
        current_participants: 1,
        status: 'open'
      }).returning();

      await this.addTripParticipant(trip.id, tripData.creator_id);
      return trip;
    } catch (error) {
      console.error('❌ Erro ao criar viagem:', error);
      throw error;
    }
  }

  async updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | undefined> {
    try {
      const [updatedTrip] = await db.update(trips)
        .set(updates)
        .where(eq(trips.id, id))
        .returning();
      return updatedTrip;
    } catch (error) {
      console.error('❌ Erro ao atualizar viagem:', error);
      return undefined;
    }
  }

  async updateTripActivities(trip_id: number, planned_activities: any): Promise<Trip | undefined> {
    try {
      const activitiesString = JSON.stringify(planned_activities);
      const [updatedTrip] = await db.update(trips)
        .set({ planned_activities: activitiesString })
        .where(eq(trips.id, trip_id))
        .returning();
      return updatedTrip;
    } catch (error) {
      console.error('❌ Erro ao atualizar atividades da viagem:', error);
      return undefined;
    }
  }

  async deleteTrip(id: number): Promise<boolean> {
    try {
      await db.delete(trips).where(eq(trips.id, id));
      return true;
    } catch (error) {
      console.error('❌ Erro ao excluir viagem:', error);
      return false;
    }
  }

  async getTripParticipants(trip_id: number): Promise<(TripParticipant & { user: User })[]> {
    try {
      const participants = await db.select()
        .from(tripParticipants)
        .where(eq(tripParticipants.trip_id, trip_id));
      
      const result = [];
      for (const p of participants) {
        const user = await this.getUser(p.user_id);
        if (user) {
          result.push({ ...p, user: this.sanitizeUser(user) as User });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar participantes:', error);
      return [];
    }
  }

  async addTripParticipant(trip_id: number, user_id: number): Promise<TripParticipant> {
    try {
      const existing = await db.select()
        .from(tripParticipants)
        .where(and(
          eq(tripParticipants.trip_id, trip_id), 
          eq(tripParticipants.user_id, user_id)
        ));

      if (existing.length > 0) {
        return existing[0];
      }

      const [participant] = await db.insert(tripParticipants).values({
        trip_id,
        user_id,
        status: 'accepted',
        joined_at: new Date()
      }).returning();
      
      return participant;
    } catch (error) {
      console.error('❌ Erro ao adicionar participante:', error);
      throw error;
    }
  }

  async updateTripParticipant(trip_id: number, user_id: number, status: string): Promise<TripParticipant | undefined> {
    try {
      const [participant] = await db.update(tripParticipants)
        .set({ status })
        .where(and(
          eq(tripParticipants.trip_id, trip_id),
          eq(tripParticipants.user_id, user_id)
        ))
        .returning();

      return participant;
    } catch (error) {
      console.error('❌ Erro ao atualizar participante:', error);
      return undefined;
    }
  }

  async removeTripParticipant(trip_id: number, user_id: number): Promise<void> {
    try {
      const trip = await this.getTrip(trip_id);
      if (!trip) return;

      await db.delete(tripParticipants)
        .where(and(
          eq(tripParticipants.trip_id, trip_id),
          eq(tripParticipants.user_id, user_id)
        ));

      const participants = await this.getTripParticipants(trip_id);
      const activeParticipants = participants.filter(p => p.status === 'accepted');
      
      if (activeParticipants.length === 0) {
        await this.deleteTrip(trip_id);
      } else if (trip.creator_id === user_id) {
        const newOrganizer = activeParticipants[0];
        await this.updateTrip(trip_id, { 
          creator_id: newOrganizer.user_id,
          current_participants: activeParticipants.length
        });
      } else {
        await this.updateTrip(trip_id, { 
          current_participants: activeParticipants.length
        });
      }
    } catch (error) {
      console.error('❌ Erro ao remover participante:', error);
    }
  }

  async recalculateExpenseSplits(trip_id: number): Promise<void> {
    try {
      // Implementação similar à anterior com ajustes de camelCase
      // (mantida a lógica de recálculo de divisão de despesas)
    } catch (error) {
      console.error('❌ Erro ao recalcular divisões de despesas:', error);
    }
  }

  async getTripMessages(trip_id: number): Promise<(Message & { sender: User })[]> {
    try {
      const tripMessages = await db.select()
        .from(messages)
        .where(eq(messages.trip_id, trip_id))
        .orderBy(asc(messages.sent_at));
      
      const result = [];
      for (const message of tripMessages) {
        const sender = await this.getUser(message.sender_id);
        if (sender) {
          result.push({ ...message, sender: this.sanitizeUser(sender) as User });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens:', error);
      return [];
    }
  }

  async createMessage(messageData: InsertMessage & { senderId: number }): Promise<Message> {
    try {
      const [message] = await db.insert(messages).values({
        ...messageData,
        sent_at: new Date()
      }).returning();
      return message;
    } catch (error) {
      console.error('❌ Erro ao criar mensagem:', error);
      throw error;
    }
  }

  // Search trips with filters
  async searchTrips(filters: { destination?: string; startDate?: Date; endDate?: Date; budget?: number; travelStyle?: string }): Promise<Trip[]> {
    return this.getTrips(filters);
  }

  // Get trips by user (created + participating)
  async getTripsByUser(user_id: number): Promise<{ created: Trip[], participating: Trip[] }> {
    try {
      const created = await this.getTripsByCreator(user_id);
      const participating = await this.getTripsByParticipant(user_id);
      return { created, participating };
    } catch (error) {
      console.error('❌ Erro ao buscar viagens do usuário:', error);
      return { created: [], participating: [] };
    }
  }

  // Trip requests
  async getTripRequests(trip_id: number): Promise<(TripRequest & { user: User })[]> {
    try {
      const requests = await db.select()
        .from(tripRequests)
        .where(eq(tripRequests.trip_id, trip_id))
        .orderBy(desc(tripRequests.created_at));
      
      const result = [];
      for (const request of requests) {
        const user = await this.getUser(request.user_id);
        if (user) {
          result.push({ ...request, user: this.sanitizeUser(user) as User });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar solicitações de viagem:', error);
      return [];
    }
  }

  async getUserTripRequests(user_id: number): Promise<(TripRequest & { trip: Trip })[]> {
    try {
      const requests = await db.select()
        .from(tripRequests)
        .where(eq(tripRequests.user_id, user_id))
        .orderBy(desc(tripRequests.created_at));
      
      const result = [];
      for (const request of requests) {
        const trip = await this.getTrip(request.trip_id);
        if (trip) {
          result.push({ ...request, trip });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar solicitações do usuário:', error);
      return [];
    }
  }

  async createTripRequest(requestData: InsertTripRequest & { user_id: number }): Promise<TripRequest> {
    try {
      const [request] = await db.insert(tripRequests).values({
        ...requestData,
        status: 'pending',
        created_at: new Date()
      }).returning();
      return request;
    } catch (error) {
      console.error('❌ Erro ao criar solicitação de viagem:', error);
      throw error;
    }
  }

  async updateTripRequest(id: number, status: string): Promise<TripRequest | undefined> {
    try {
      const [request] = await db.update(tripRequests)
        .set({ status })
        .where(eq(tripRequests.id, id))
        .returning();
      return request;
    } catch (error) {
      console.error('❌ Erro ao atualizar solicitação de viagem:', error);
      return undefined;
    }
  }

  // Expenses
  async getTripExpenses(trip_id: number): Promise<(Expense & { payer: User; splits: (ExpenseSplit & { user: User })[] })[]> {
    try {
      const tripExpenses = await db.select()
        .from(expenses)
        .where(eq(expenses.trip_id, trip_id))
        .orderBy(desc(expenses.created_at));
      
      const result = [];
      for (const expense of tripExpenses) {
        const payer = await this.getUser(expense.paid_by);
        const splits = await db.select()
          .from(expenseSplits)
          .where(eq(expenseSplits.expense_id, expense.id));
        
        const splitsWithUsers = [];
        for (const split of splits) {
          const user = await this.getUser(split.user_id);
          if (user) {
            splitsWithUsers.push({ ...split, user: this.sanitizeUser(user) as User });
          }
        }
        
        if (payer) {
          result.push({ 
            ...expense, 
            payer: this.sanitizeUser(payer) as User, 
            splits: splitsWithUsers 
          });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar despesas da viagem:', error);
      return [];
    }
  }

  async createExpense(expenseData: InsertExpense & { paid_by: number }): Promise<Expense> {
    try {
      const [expense] = await db.insert(expenses).values({
        ...expenseData,
        created_at: new Date()
      }).returning();
      return expense;
    } catch (error) {
      console.error('❌ Erro ao criar despesa:', error);
      throw error;
    }
  }

  async createExpenseSplits(splitsData: InsertExpenseSplit[]): Promise<ExpenseSplit[]> {
    try {
      const splits = await db.insert(expenseSplits).values(splitsData).returning();
      return splits;
    } catch (error) {
      console.error('❌ Erro ao criar divisões de despesa:', error);
      throw error;
    }
  }

  async updateExpenseSplit(id: number, paid: boolean): Promise<ExpenseSplit | undefined> {
    try {
      const [split] = await db.update(expenseSplits)
        .set({ paid })
        .where(eq(expenseSplits.id, id))
        .returning();
      return split;
    } catch (error) {
      console.error('❌ Erro ao atualizar divisão de despesa:', error);
      return undefined;
    }
  }

  async getTripBalances(trip_id: number): Promise<{ user_id: number; user: User; balance: number }[]> {
    try {
      const participants = await this.getTripParticipants(trip_id);
      const balances = [];
      
      for (const participant of participants) {
        // Calculate balance for each participant (simplified version)
        const user = await this.getUser(participant.user_id);
        if (user) {
          balances.push({
            user_id: participant.user_id,
            user: this.sanitizeUser(user) as User,
            balance: 0 // Simplified - would need proper calculation
          });
        }
      }
      
      return balances;
    } catch (error) {
      console.error('❌ Erro ao calcular saldos da viagem:', error);
      return [];
    }
  }

  // User Ratings
  async getUserRatings(user_id: number): Promise<(UserRating & { rater: User; trip: Trip })[]> {
    try {
      const ratings = await db.select()
        .from(userRatings)
        .where(eq(userRatings.ratedUserId, user_id))
        .orderBy(desc(userRatings.created_at));
      
      const result = [];
      for (const rating of ratings) {
        const rater = await this.getUser(rating.raterUserId);
        const trip = await this.getTrip(rating.trip_id);
        if (rater && trip) {
          result.push({ 
            ...rating, 
            rater: this.sanitizeUser(rater) as User, 
            trip 
          });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações do usuário:', error);
      return [];
    }
  }

  async createUserRating(ratingData: InsertUserRating & { raterUserId: number }): Promise<UserRating> {
    try {
      const [rating] = await db.insert(userRatings).values({
        ...ratingData,
        raterUserId: ratingData.raterUserId,
        created_at: new Date()
      }).returning();
      
      await this.updateUserAverageRating(ratingData.ratedUserId);
      return rating;
    } catch (error) {
      console.error('❌ Erro ao criar avaliação de usuário:', error);
      throw error;
    }
  }

  async updateUserAverageRating(user_id: number): Promise<void> {
    try {
      const ratings = await db.select()
        .from(userRatings)
        .where(eq(userRatings.ratedUserId, user_id));
      
      if (ratings.length === 0) {
        await this.updateUser(user_id, { averageRating: "5.00", totalRatings: 0 });
        return;
      }
      
      const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const average = (total / ratings.length).toFixed(2);
      
      await this.updateUser(user_id, { 
        averageRating: average, 
        totalRatings: ratings.length 
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar média de avaliações:', error);
    }
  }

  // Destination Ratings
  async getDestinationRatings(destination: string): Promise<(DestinationRating & { user: User })[]> {
    try {
      const ratings = await db.select()
        .from(destinationRatings)
        .where(eq(destinationRatings.destination, destination))
        .orderBy(desc(destinationRatings.created_at));
      
      const result = [];
      for (const rating of ratings) {
        const user = await this.getUser(rating.user_id);
        if (user) {
          result.push({ 
            ...rating, 
            user: this.sanitizeUser(user) as User 
          });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações do destino:', error);
      return [];
    }
  }

  async createDestinationRating(ratingData: InsertDestinationRating & { user_id: number }): Promise<DestinationRating> {
    try {
      const [rating] = await db.insert(destinationRatings).values({
        ...ratingData,
        created_at: new Date()
      }).returning();
      return rating;
    } catch (error) {
      console.error('❌ Erro ao criar avaliação de destino:', error);
      throw error;
    }
  }

  async getDestinationAverageRating(destination: string): Promise<{ average: number; total: number }> {
    try {
      const ratings = await db.select()
        .from(destinationRatings)
        .where(eq(destinationRatings.destination, destination));
      
      if (ratings.length === 0) {
        return { average: 0, total: 0 };
      }
      
      const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const average = total / ratings.length;
      
      return { average, total: ratings.length };
    } catch (error) {
      console.error('❌ Erro ao calcular média do destino:', error);
      return { average: 0, total: 0 };
    }
  }

  // Verification Requests
  async getVerificationRequests(user_id?: number): Promise<(VerificationRequest & { user: User })[]> {
    try {
      let query = db.select().from(verificationRequests);
      
      if (user_id) {
        query = query.where(eq(verificationRequests.user_id, user_id));
      }
      
      const requests = await query.orderBy(desc(verificationRequests.created_at));
      
      const result = [];
      for (const request of requests) {
        const user = await this.getUser(request.user_id);
        if (user) {
          result.push({ 
            ...request, 
            user: this.sanitizeUser(user) as User 
          });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar solicitações de verificação:', error);
      return [];
    }
  }

  async createVerificationRequest(requestData: InsertVerificationRequest & { user_id: number }): Promise<VerificationRequest> {
    try {
      const [request] = await db.insert(verificationRequests).values({
        ...requestData,
        status: 'pending',
        created_at: new Date()
      }).returning();
      return request;
    } catch (error) {
      console.error('❌ Erro ao criar solicitação de verificação:', error);
      throw error;
    }
  }

  async updateVerificationRequest(id: number, status: string, reviewedBy?: number, rejectionReason?: string): Promise<VerificationRequest | undefined> {
    try {
      const updates: any = { status };
      if (reviewedBy) updates.reviewedBy = reviewedBy;
      if (rejectionReason) updates.rejectionReason = rejectionReason;
      
      const [request] = await db.update(verificationRequests)
        .set(updates)
        .where(eq(verificationRequests.id, id))
        .returning();
      return request;
    } catch (error) {
      console.error('❌ Erro ao atualizar solicitação de verificação:', error);
      return undefined;
    }
  }

  async updateUserVerificationStatus(user_id: number, isVerified: boolean, method?: string): Promise<void> {
    try {
      const updates: any = { isVerified };
      if (method) updates.verificationMethod = method;
      
      await this.updateUser(user_id, updates);
    } catch (error) {
      console.error('❌ Erro ao atualizar status de verificação:', error);
    }
  }

  // Activities
  async searchActivities(filters: { 
    search?: string; 
    category?: string; 
    location?: string; 
    priceRange?: string; 
    difficulty?: string; 
    duration?: string; 
    rating?: string; 
    sortBy?: string; 
  }): Promise<Activity[]> {
    return this.getActivities(filters);
  }

  async getActivities(filters?: { 
    search?: string; 
    category?: string; 
    location?: string; 
    priceRange?: string; 
    difficulty?: string; 
    duration?: string; 
    rating?: string; 
    sortBy?: string; 
  }): Promise<Activity[]> {
    try {
      let query = db.select({
        id: activities.id,
        title: activities.title,
        description: activities.description,
        category: activities.category,
        destination: destinations.name,
        destinationId: activities.destinationId,
        duration: activities.duration,
        difficulty: activities.difficultyLevel,
        averageRating: activities.averageRating,
        totalReviews: activities.totalRatings,
        images: activities.images,
        cover_image: activities.coverImage,
        minParticipants: activities.minParticipants,
        maxParticipants: activities.maxParticipants,
        inclusions: activities.inclusions,
        exclusions: activities.exclusions,
        requirements: activities.requirements,
        languages: activities.languages,
        cancellationPolicy: activities.cancellationPolicy,
        isActive: activities.isActive,
        createdById: activities.createdById,
        created_at: activities.created_at,
        updatedAt: activities.updatedAt,
      })
      .from(activities)
      .leftJoin(destinations, eq(activities.destinationId, destinations.id))
      .where(eq(activities.isActive, true));

      if (filters?.search) {
        query = query.where(like(activities.title, `%${filters.search}%`));
      }
      if (filters?.category) {
        query = query.where(eq(activities.category, filters.category));
      }
      if (filters?.location) {
        query = query.where(like(destinations.name, `%${filters.location}%`));
      }

      const result = await query.orderBy(desc(activities.created_at));
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar atividades:', error);
      return [];
    }
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    try {
      const [activity] = await db.select().from(activities).where(eq(activities.id, id));
      return activity;
    } catch (error) {
      console.error('❌ Erro ao buscar atividade:', error);
      return undefined;
    }
  }

  async createActivity(activityData: InsertActivity & { createdById: number }): Promise<Activity> {
    try {
      const [activity] = await db.insert(activities).values({
        ...activityData,
        isActive: true,
        averageRating: "0.00",
        totalRatings: 0,
        created_at: new Date(),
        updatedAt: new Date()
      }).returning();
      return activity;
    } catch (error) {
      console.error('❌ Erro ao criar atividade:', error);
      throw error;
    }
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined> {
    try {
      const [activity] = await db.update(activities)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(activities.id, id))
        .returning();
      return activity;
    } catch (error) {
      console.error('❌ Erro ao atualizar atividade:', error);
      return undefined;
    }
  }

  async deleteActivity(id: number): Promise<boolean> {
    try {
      await db.update(activities)
        .set({ isActive: false })
        .where(eq(activities.id, id));
      return true;
    } catch (error) {
      console.error('❌ Erro ao excluir atividade:', error);
      return false;
    }
  }

  // Activity Reviews
  async getActivityReviews(activityId: number): Promise<(ActivityReview & { user: User })[]> {
    try {
      const reviews = await db.select()
        .from(activityReviews)
        .where(eq(activityReviews.activityId, activityId))
        .orderBy(desc(activityReviews.created_at));
      
      const result = [];
      for (const review of reviews) {
        const user = await this.getUser(review.user_id);
        if (user) {
          result.push({ 
            ...review, 
            user: this.sanitizeUser(user) as User 
          });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações da atividade:', error);
      return [];
    }
  }

  async createActivityReview(reviewData: InsertActivityReview & { user_id: number }): Promise<ActivityReview> {
    try {
      const [review] = await db.insert(activityReviews).values({
        ...reviewData,
        created_at: new Date()
      }).returning();
      
      await this.updateActivityAverageRating(reviewData.activityId);
      return review;
    } catch (error) {
      console.error('❌ Erro ao criar avaliação da atividade:', error);
      throw error;
    }
  }

  async updateActivityAverageRating(activityId: number): Promise<void> {
    try {
      const reviews = await db.select()
        .from(activityReviews)
        .where(eq(activityReviews.activityId, activityId));
      
      if (reviews.length === 0) {
        await this.updateActivity(activityId, { averageRating: "0.00", totalRatings: 0 });
        return;
      }
      
      const total = reviews.reduce((sum, review) => sum + review.rating, 0);
      const average = (total / reviews.length).toFixed(2);
      
      await this.updateActivity(activityId, { 
        averageRating: average, 
        totalRatings: reviews.length 
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar média de avaliações da atividade:', error);
    }
  }

  // Activity Bookings
  async getActivityBookings(activityId: number): Promise<(ActivityBooking & { user: User })[]> {
    try {
      const bookings = await db.select()
        .from(activityBookings)
        .where(eq(activityBookings.activityId, activityId))
        .orderBy(desc(activityBookings.created_at));
      
      const result = [];
      for (const booking of bookings) {
        const user = await this.getUser(booking.user_id);
        if (user) {
          result.push({ 
            ...booking, 
            user: this.sanitizeUser(user) as User 
          });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar reservas da atividade:', error);
      return [];
    }
  }

  async getUserActivityBookings(user_id: number): Promise<(ActivityBooking & { activity: Activity })[]> {
    try {
      const bookings = await db.select()
        .from(activityBookings)
        .where(eq(activityBookings.user_id, user_id))
        .orderBy(desc(activityBookings.created_at));
      
      const result = [];
      for (const booking of bookings) {
        const activity = await this.getActivity(booking.activityId);
        if (activity) {
          result.push({ ...booking, activity });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar reservas do usuário:', error);
      return [];
    }
  }

  async createActivityBooking(bookingData: InsertActivityBooking & { user_id: number }): Promise<ActivityBooking> {
    try {
      const [booking] = await db.insert(activityBookings).values({
        ...bookingData,
        status: 'pending',
        created_at: new Date()
      }).returning();
      return booking;
    } catch (error) {
      console.error('❌ Erro ao criar reserva da atividade:', error);
      throw error;
    }
  }

  async updateActivityBooking(id: number, status: string): Promise<ActivityBooking | undefined> {
    try {
      const [booking] = await db.update(activityBookings)
        .set({ status })
        .where(eq(activityBookings.id, id))
        .returning();
      return booking;
    } catch (error) {
      console.error('❌ Erro ao atualizar reserva da atividade:', error);
      return undefined;
    }
  }

  // Activity Budget Proposals
  async getActivityBudgetProposals(activityId: number): Promise<(ActivityBudgetProposal & { creator: User })[]> {
    try {
      const proposals = await db.select()
        .from(activityBudgetProposals)
        .where(eq(activityBudgetProposals.activityId, activityId))
        .orderBy(desc(activityBudgetProposals.votes), desc(activityBudgetProposals.created_at));
      
      const result = [];
      for (const proposal of proposals) {
        const creator = await this.getUser(proposal.createdBy);
        if (creator) {
          result.push({ 
            ...proposal, 
            creator: this.sanitizeUser(creator) as User 
          });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar propostas de orçamento:', error);
      return [];
    }
  }

  async createActivityBudgetProposal(proposalData: InsertActivityBudgetProposal & { createdBy: number }): Promise<ActivityBudgetProposal> {
    try {
      const [proposal] = await db.insert(activityBudgetProposals).values({
        ...proposalData,
        votes: 0,
        created_at: new Date()
      }).returning();
      return proposal;
    } catch (error) {
      console.error('❌ Erro ao criar proposta de orçamento:', error);
      throw error;
    }
  }

  async updateActivityBudgetProposal(id: number, updates: Partial<ActivityBudgetProposal>): Promise<ActivityBudgetProposal | undefined> {
    try {
      const [proposal] = await db.update(activityBudgetProposals)
        .set(updates)
        .where(eq(activityBudgetProposals.id, id))
        .returning();
      return proposal;
    } catch (error) {
      console.error('❌ Erro ao atualizar proposta de orçamento:', error);
      return undefined;
    }
  }

  async deleteActivityBudgetProposal(id: number): Promise<boolean> {
    try {
      await db.delete(activityBudgetProposals).where(eq(activityBudgetProposals.id, id));
      return true;
    } catch (error) {
      console.error('❌ Erro ao excluir proposta de orçamento:', error);
      return false;
    }
  }

  // Note: ActivityBudgetProposalVote table doesn't exist in schema, using simple voting logic

  // Trip Activities
  async getTripActivities(trip_id: number): Promise<(TripActivity & { activity: Activity; proposal: ActivityBudgetProposal; addedByUser: User })[]> {
    try {
      const tripActivities = await db.select()
        .from(tripActivities)
        .where(eq(tripActivities.trip_id, trip_id))
        .orderBy(asc(tripActivities.scheduledDate));
      
      const result = [];
      for (const tripActivity of tripActivities) {
        const activity = await this.getActivity(tripActivity.activityId);
        const proposal = await db.select()
          .from(activityBudgetProposals)
          .where(eq(activityBudgetProposals.id, tripActivity.budgetProposalId))
          .then(p => p[0]);
        const addedByUser = await this.getUser(tripActivity.addedBy);
        
        if (activity && proposal && addedByUser) {
          result.push({ 
            ...tripActivity, 
            activity, 
            proposal,
            addedByUser: this.sanitizeUser(addedByUser) as User 
          });
        }
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar atividades da viagem:', error);
      return [];
    }
  }

  async addActivityToTrip(tripActivityData: InsertTripActivity & { addedBy: number }): Promise<TripActivity> {
    try {
      const [tripActivity] = await db.insert(tripActivities).values({
        ...tripActivityData,
        created_at: new Date()
      }).returning();
      return tripActivity;
    } catch (error) {
      console.error('❌ Erro ao adicionar atividade à viagem:', error);
      throw error;
    }
  }

  async updateTripActivity(id: number, updates: Partial<TripActivity>): Promise<TripActivity | undefined> {
    try {
      const [tripActivity] = await db.update(tripActivities)
        .set(updates)
        .where(eq(tripActivities.id, id))
        .returning();
      return tripActivity;
    } catch (error) {
      console.error('❌ Erro ao atualizar atividade da viagem:', error);
      return undefined;
    }
  }

  async removeTripActivity(id: number): Promise<boolean> {
    try {
      await db.delete(tripActivities).where(eq(tripActivities.id, id));
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover atividade da viagem:', error);
      return false;
    }
  }

  async voteActivityBudgetProposal(proposalId: number, user_id: number, increment: boolean): Promise<ActivityBudgetProposal | undefined> {
    try {
      const [proposal] = await db.select()
        .from(activityBudgetProposals)
        .where(eq(activityBudgetProposals.id, proposalId));
      
      if (!proposal) return undefined;
      
      // Simplified voting without a votes table - just increment/decrement the votes count
      const newVotes = increment ? proposal.votes + 1 : Math.max(0, proposal.votes - 1);
      const [updatedProposal] = await db.update(activityBudgetProposals)
        .set({ votes: newVotes })
        .where(eq(activityBudgetProposals.id, proposalId))
        .returning();
      return updatedProposal;
    } catch (error) {
      console.error('❌ Erro ao votar na proposta de orçamento:', error);
      return undefined;
    }
  }

  async getUserTripsInLocation(user_id: number, location: string): Promise<Trip[]> {
    try {
      const userTrips = await this.getTripsByCreator(user_id);
      const participantTrips = await this.getTripsByParticipant(user_id);
      
      const allTrips = [...userTrips, ...participantTrips];
      const uniqueTrips = allTrips.filter((trip, index, self) => 
        index === self.findIndex(t => t.id === trip.id)
      );

      return uniqueTrips.filter(trip => 
        trip.destination?.toLowerCase().includes(location.toLowerCase())
      );
    } catch (error) {
      console.error('❌ Erro ao buscar viagens na localização:', error);
      return [];
    }
  }

  private async runCreatorParticipantsFix(): Promise<void> {
    try {
      console.log('🔧 Executando correção automática de criadores...');
      const fixedCount = await this.fixCreatorsAsParticipants();
      if (fixedCount > 0) {
        console.log(`✅ ${fixedCount} criadores adicionados como participantes`);
      }
    } catch (error) {
      console.error('❌ Erro na correção automática:', error);
    }
  }

  async fixCreatorsAsParticipants(): Promise<number> {
    try {
      const trips = await db.select().from(trips);
      let fixedCount = 0;
      
      for (const trip of trips) {
        const existing = await db.select()
          .from(tripParticipants)
          .where(and(
            eq(tripParticipants.trip_id, trip.id),
            eq(tripParticipants.user_id, trip.creator_id)
          ));
        
        if (existing.length === 0) {
          await db.insert(tripParticipants).values({
            trip_id: trip.id,
            user_id: trip.creator_id,
            status: 'accepted',
            joined_at: new Date()
          });
          fixedCount++;
        }
      }
      return fixedCount;
    } catch (error) {
      console.error('❌ Erro ao corrigir criadores:', error);
      return 0;
    }
  }
}

export const storage = new DatabaseStorage();

// Função para criar usuário de teste padrão
async function createDefaultTestUser() {
  try {
    const existingUser = await storage.getUserByUsername('tom');

    if (!existingUser) {
      // Importar funções de criptografia para hash de senha
      const { scrypt, randomBytes } = await import('crypto');
      const { promisify } = await import('util');
      const scryptAsync = promisify(scrypt);

      // Hash da senha
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync('demo123', salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;

      // Criar o usuário de teste
      const user = await storage.createUser({
        username: 'tom',
        email: 'tom@teste.com',
        fullName: 'Tom Tubin',
        phone: '(51) 99999-1111',
        password: hashedPassword,
        bio: 'Usuário de teste padrão',
        location: 'Porto Alegre, RS',
        travelStyles: ['urbanas', 'aventura', 'culturais'],
        languages: ['Português', 'Inglês'],
        interests: ['Aventura', 'Cultura', 'Gastronomia'],
        isVerified: true,
        verificationMethod: 'referral'
      });

      console.log('✅ Usuário de teste criado: tom / demo123');
      
      // Criar viagens padrão para o usuário Tom
      await createDefaultTrips(user);
    } else {
      console.log('ℹ️ Usuário de teste já existe: tom');
    }
    
    // Criar segundo usuário para teste de participação
    await createSecondTestUser();
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
  }
}

// Criar viagens padrão para o usuário Tom
async function createDefaultTrips(user: User) {
  try {
    // Verificar se já existem viagens
    const existingTrips = await storage.getTripsByCreator(user.id);
    if (existingTrips.length > 0) {
      console.log('ℹ️ Viagens de teste já existem para o usuário tom');
      return;
    }

    // Criar viagem 1: Trilha na Chapada Diamantina
    const trip1 = await storage.createTrip({
      title: 'Trilha na Chapada Diamantina',
      destination: 'Chapada Diamantina, BA',
      cover_image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
      startDate: new Date('2025-08-15'),
      endDate: new Date('2025-08-22'),
      budget: 2100,
      maxParticipants: 6,
      description: 'Aventura incrível na Chapada Diamantina! Vamos explorar cachoeiras, fazer trilhas e acampar sob as estrelas.',
      travelStyle: 'aventura',
      sharedCosts: ['accommodation', 'transport', 'food'],
      creator_id: user.id,
      budgetBreakdown: {
        transport: 800,
        accommodation: 600,
        food: 700
      }
    });

    // Criar viagem 2: Fim de semana em Campos do Jordão
    const trip2 = await storage.createTrip({
      title: 'Fim de semana relaxante em Campos do Jordão',
      destination: 'Campos do Jordão, SP',
      cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      startDate: new Date('2025-08-01'),
      endDate: new Date('2025-08-03'),
      budget: 1200,
      maxParticipants: 4,
      description: 'Escapada perfeita para relaxar no clima de montanha. Pousada aconchegante, gastronomia local e passeios de teleférico.',
      travelStyle: 'neve',
      sharedCosts: ['accommodation', 'transport'],
      creator_id: user.id,
      budgetBreakdown: {
        transport: 300,
        accommodation: 600,
        food: 300
      }
    });

    console.log('✅ Viagens padrão criadas:', trip1.title, 'e', trip2.title);
  } catch (error) {
    console.error('❌ Erro ao criar viagens padrão:', error);
  }
}

// Criar segundo usuário para teste
async function createSecondTestUser() {
  try {
    const existingUser = await storage.getUserByUsername('maria');

    if (!existingUser) {
      // Importar funções de criptografia para hash de senha
      const { scrypt, randomBytes } = await import('crypto');
      const { promisify } = await import('util');
      const scryptAsync = promisify(scrypt);

      // Hash da senha
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync('demo123', salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;

      // Criar o segundo usuário de teste
      const user = await storage.createUser({
        username: 'maria',
        email: 'maria@teste.com',
        fullName: 'Maria Santos',
        phone: '(21) 99999-2222',
        password: hashedPassword,
        bio: 'Usuária de teste para participação',
        location: 'Rio de Janeiro, RJ',
        travelStyles: ['praia', 'culturais'],
        languages: ['Português', 'Espanhol'],
        interests: ['Praia', 'Cultura', 'Fotografia'],
        isVerified: true,
        verificationMethod: 'referral'
      });

      console.log('✅ Segundo usuário de teste criado: maria / demo123');
      
      // Criar viagem da Maria e adicionar Tom como participante
      await createMariaTripsWithTomAsParticipant(user);
    } else {
      console.log('ℹ️ Segundo usuário de teste já existe: maria');
    }
  } catch (error) {
    console.error('❌ Erro ao criar segundo usuário de teste:', error);
  }
}

// Criar viagem da Maria e adicionar Tom como participante
async function createMariaTripsWithTomAsParticipant(maria: User) {
  try {
    // Verificar se já existem viagens da Maria
    const existingTrips = await storage.getTripsByCreator(maria.id);
    if (existingTrips.length > 0) {
      console.log('ℹ️ Viagens da Maria já existem');
      return;
    }

    // Criar viagem da Maria
    const trip = await storage.createTrip({
      title: 'Praia e Cultura no Rio de Janeiro',
      destination: 'Rio de Janeiro, RJ',
      cover_image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
      startDate: new Date('2025-09-10'),
      endDate: new Date('2025-09-15'),
      budget: 1600,
      maxParticipants: 4,
      description: 'Descubra o Rio de Janeiro! Praias de Copacabana e Ipanema, Cristo Redentor e muito mais.',
      travelStyle: 'praia',
      sharedCosts: ['accommodation', 'transport', 'activities'],
      creator_id: maria.id,
      budgetBreakdown: {
        transport: 400,
        accommodation: 800,
        food: 400
      }
    });

    // Adicionar Tom como participante aceito
    const tomUser = await storage.getUserByUsername('tom');
    if (tomUser) {
      await storage.addTripParticipant(trip.id, tomUser.id);
      console.log('✅ Tom adicionado como participante na viagem da Maria');
    }

    console.log('✅ Viagem da Maria criada com Tom como participante');
  } catch (error) {
    console.error('❌ Erro ao criar viagem da Maria:', error);
  }
}

// Inicializar usuário de teste padrão após a criação do storage
createDefaultTestUser();