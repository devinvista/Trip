import { users, trips, tripParticipants, messages, tripRequests, expenses, expenseSplits, userRatings, destinationRatings, verificationRequests, activities, activityReviews, activityBookings, activityBudgetProposals, activityBudgetProposalVotes, tripActivities, destinations, type User, type InsertUser, type Trip, type InsertTrip, type Message, type InsertMessage, type TripRequest, type InsertTripRequest, type TripParticipant, type Expense, type InsertExpense, type ExpenseSplit, type InsertExpenseSplit, type UserRating, type InsertUserRating, type DestinationRating, type InsertDestinationRating, type VerificationRequest, type InsertVerificationRequest, type Activity, type InsertActivity, type ActivityReview, type InsertActivityReview, type ActivityBooking, type InsertActivityBooking, type ActivityBudgetProposal, type ActivityBudgetProposalVote, type InsertActivityBudgetProposal, type TripActivity, type InsertTripActivity } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db, testConnection } from "./db";
import { eq, and, sql, desc, asc, gte, lte, ne, like, count } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);

// Storage interface for PostgreSQL
export interface IStorage {
  // User management
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByPhone(phone: string): Promise<User | null>;
  updateUser(id: number, updates: Partial<User>): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  
  // Trip management
  createTrip(trip: InsertTrip): Promise<Trip>;
  getTripById(id: number): Promise<Trip | null>;
  getAllTrips(): Promise<Trip[]>;
  getUserTrips(userId: number): Promise<{ created: Trip[], participating: Trip[] }>;
  updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | null>;
  deleteTrip(id: number): Promise<boolean>;
  
  // Participants
  addParticipant(tripId: number, userId: number): Promise<TripParticipant>;
  updateParticipantStatus(tripId: number, userId: number, status: string): Promise<boolean>;
  getTripParticipants(tripId: number): Promise<Array<TripParticipant & { user: User }>>;
  
  // Messages
  addMessage(message: InsertMessage): Promise<Message>;
  getTripMessages(tripId: number): Promise<Array<Message & { sender: User }>>;
  
  // Destinations
  getAllDestinations(): Promise<any[]>;
  getDestinationById(id: number): Promise<any | null>;
  createDestination(destination: any): Promise<any>;
  getDestinations(search?: string): Promise<any[]>;
  
  // Activities
  getAllActivities(): Promise<Activity[]>;
  getActivityById(id: number): Promise<Activity | null>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByLocation(location: string): Promise<Activity[]>;
  getActivities(filters: any): Promise<Activity[]>;
  
  // Trip requests
  getTripRequests(tripId: number): Promise<TripRequest[]>;
  
  // Additional methods for compatibility
  getTripsByCreator(creatorId: number): Promise<Trip[]>;
  getTripsByParticipant(userId: number): Promise<Trip[]>;
  
  // Additional required methods from routes
  getTripExpenses(tripId: number): Promise<Expense[]>;
  getTripBalances(tripId: number): Promise<any[]>;
  getUserActivityBookings(userId: number): Promise<ActivityBooking[]>;
  getUserVoteForActivity(userId: number, activityId: number): Promise<any>;
  getUserVoteForProposal(userId: number, proposalId: number): Promise<any>;
  getTripActivities(tripId: number): Promise<TripActivity[]>;
  getUserTripsInLocation(userId: number, location: string): Promise<Trip[]>;
  getUserRatings(userId: number): Promise<UserRating[]>;
  
  // Additional methods needed by routes
  fixCreatorsAsParticipants(): Promise<number>;
  addTripParticipant(tripId: number, userId: number): Promise<TripParticipant>;
  removeTripParticipant(tripId: number, userId: number): Promise<boolean>;
  createMessage(messageData: InsertMessage): Promise<Message>;
  createExpense(expenseData: InsertExpense): Promise<Expense>;
  createExpenseSplits(expenseId: number, splits: InsertExpenseSplit[]): Promise<ExpenseSplit[]>;
  getUserTripRequests(userId: number): Promise<TripRequest[]>;
  
  // Activity budget proposals
  getActivityBudgetProposals(activityId: number): Promise<ActivityBudgetProposal[]>;
  createActivityBudgetProposal(proposalData: InsertActivityBudgetProposal): Promise<ActivityBudgetProposal>;
  
  // Activity reviews
  getActivityReviews(activityId: number): Promise<ActivityReview[]>;
  createActivityReview(reviewData: InsertActivityReview): Promise<ActivityReview>;
}

// PostgreSQL Storage Implementation
export class PostgreSQLStorage implements IStorage {
  
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || null;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || null;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createTrip(tripData: InsertTrip): Promise<Trip> {
    const [trip] = await db.insert(trips).values(tripData).returning();
    return trip;
  }

  async getTripById(id: number): Promise<Trip | null> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip || null;
  }

  async getAllTrips(): Promise<Trip[]> {
    return await db.select().from(trips).orderBy(desc(trips.created_at));
  }

  async getUserTrips(userId: number): Promise<{ created: Trip[], participating: Trip[] }> {
    // Get created trips
    const created = await db.select().from(trips).where(eq(trips.creator_id, userId));
    
    // Get participating trips
    const participating = await db
      .select({
        id: trips.id,
        creator_id: trips.creator_id,
        title: trips.title,
        destination_id: trips.destination_id,
        coverImage: trips.coverImage,
        startDate: trips.startDate,
        endDate: trips.endDate,
        budget: trips.budget,
        budget_breakdown: trips.budget_breakdown,
        max_participants: trips.max_participants,
        current_participants: trips.current_participants,
        description: trips.description,
        travel_style: trips.travel_style,
        shared_costs: trips.shared_costs,
        planned_activities: trips.planned_activities,
        status: trips.status,
        created_at: trips.created_at
      })
      .from(trips)
      .innerJoin(tripParticipants, eq(trips.id, tripParticipants.trip_id))
      .where(and(
        eq(tripParticipants.user_id, userId),
        eq(tripParticipants.status, 'accepted'),
        ne(trips.creator_id, userId) // Exclude trips they created
      ));

    return { created, participating };
  }

  async updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | null> {
    const [trip] = await db.update(trips).set(updates).where(eq(trips.id, id)).returning();
    return trip || null;
  }

  async deleteTrip(id: number): Promise<boolean> {
    const result = await db.delete(trips).where(eq(trips.id, id));
    return true;
  }

  async addParticipant(tripId: number, userId: number): Promise<TripParticipant> {
    const [participant] = await db.insert(tripParticipants).values({
      trip_id: tripId,
      user_id: userId,
      status: 'pending'
    }).returning();
    return participant;
  }

  async updateParticipantStatus(tripId: number, userId: number, status: string): Promise<boolean> {
    await db.update(tripParticipants)
      .set({ status })
      .where(and(
        eq(tripParticipants.trip_id, tripId),
        eq(tripParticipants.user_id, userId)
      ));
    return true;
  }

  async getTripParticipants(tripId: number): Promise<Array<TripParticipant & { user: User }>> {
    return await db
      .select({
        id: tripParticipants.id,
        trip_id: tripParticipants.trip_id,
        user_id: tripParticipants.user_id,
        status: tripParticipants.status,
        joined_at: tripParticipants.joined_at,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
          phone: users.phone,
          bio: users.bio,
          location: users.location,
          profilePhoto: users.profilePhoto,
          languages: users.languages,
          interests: users.interests,
          travelStyles: users.travelStyles,
          referredBy: users.referredBy,
          isVerified: users.isVerified,
          verificationMethod: users.verificationMethod,
          averageRating: users.averageRating,
          totalRatings: users.totalRatings,
          createdAt: users.createdAt
        }
      })
      .from(tripParticipants)
      .innerJoin(users, eq(tripParticipants.user_id, users.id))
      .where(eq(tripParticipants.trip_id, tripId));
  }

  async addMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values({
      trip_id: messageData.tripId,
      sender_id: messageData.senderId,
      content: messageData.content
    }).returning();
    return message;
  }

  async getTripMessages(tripId: number): Promise<Array<Message & { sender: User }>> {
    return await db
      .select({
        id: messages.id,
        trip_id: messages.trip_id,
        sender_id: messages.sender_id,
        content: messages.content,
        sent_at: messages.sent_at,
        sender: {
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
          phone: users.phone,
          bio: users.bio,
          location: users.location,
          profilePhoto: users.profilePhoto,
          languages: users.languages,
          interests: users.interests,
          travelStyles: users.travelStyles,
          referredBy: users.referredBy,
          isVerified: users.isVerified,
          verificationMethod: users.verificationMethod,
          averageRating: users.averageRating,
          totalRatings: users.totalRatings,
          createdAt: users.createdAt
        }
      })
      .from(messages)
      .innerJoin(users, eq(messages.sender_id, users.id))
      .where(eq(messages.trip_id, tripId))
      .orderBy(asc(messages.sent_at));
  }

  async getAllDestinations(): Promise<any[]> {
    return await db.select().from(destinations).where(eq(destinations.isActive, true));
  }

  async getDestinationById(id: number): Promise<any | null> {
    const [destination] = await db.select().from(destinations).where(eq(destinations.id, id));
    return destination || null;
  }

  async createDestination(destinationData: any): Promise<any> {
    const [destination] = await db.insert(destinations).values(destinationData).returning();
    return destination;
  }

  async getDestinations(search?: string): Promise<any[]> {
    let baseQuery = db.select().from(destinations);
    
    if (search) {
      return await baseQuery
        .where(
          and(
            eq(destinations.isActive, true),
            sql`(${destinations.name} ILIKE ${`%${search}%`} OR ${destinations.region} ILIKE ${`%${search}%`} OR ${destinations.state} ILIKE ${`%${search}%`})`
          )
        )
        .orderBy(asc(destinations.name));
    }
    
    return await baseQuery
      .where(eq(destinations.isActive, true))
      .orderBy(asc(destinations.name));
  }

  async getAllActivities(): Promise<Activity[]> {
    return await db.select().from(activities);
  }

  async getActivityById(id: number): Promise<Activity | null> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity || null;
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(activityData).returning();
    return activity;
  }

  async getActivitiesByLocation(location: string): Promise<Activity[]> {
    return await db.select().from(activities).where(like(activities.location, `%${location}%`));
  }

  async getTripRequests(tripId: number): Promise<TripRequest[]> {
    return await db.select().from(tripRequests).where(eq(tripRequests.trip_id, tripId));
  }

  async getTripsByCreator(creatorId: number): Promise<Trip[]> {
    return await db.select().from(trips).where(eq(trips.creator_id, creatorId));
  }

  async getTripsByParticipant(userId: number): Promise<Trip[]> {
    return await db
      .select({
        id: trips.id,
        creator_id: trips.creator_id,
        title: trips.title,
        destination_id: trips.destination_id,
        coverImage: trips.coverImage,
        startDate: trips.startDate,
        endDate: trips.endDate,
        budget: trips.budget,
        budget_breakdown: trips.budget_breakdown,
        max_participants: trips.max_participants,
        current_participants: trips.current_participants,
        description: trips.description,
        travel_style: trips.travel_style,
        shared_costs: trips.shared_costs,
        planned_activities: trips.planned_activities,
        status: trips.status,
        created_at: trips.created_at
      })
      .from(trips)
      .innerJoin(tripParticipants, eq(trips.id, tripParticipants.trip_id))
      .where(and(
        eq(tripParticipants.user_id, userId),
        eq(tripParticipants.status, 'accepted')
      ));
  }

  // Additional placeholder methods - will be implemented as needed
  async getTripExpenses(tripId: number): Promise<any[]> {
    // First get all expenses with payer info
    const expensesWithPayers = await db
      .select({
        id: expenses.id,
        trip_id: expenses.trip_id,
        paid_by: expenses.paid_by,
        amount: expenses.amount,
        description: expenses.description,
        category: expenses.category,
        receipt: expenses.receipt,
        created_at: expenses.created_at,
        settled_at: expenses.settled_at,
        payer: {
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
          phone: users.phone,
          bio: users.bio,
          location: users.location,
          profilePhoto: users.profilePhoto,
          languages: users.languages,
          interests: users.interests,
          travelStyles: users.travelStyles,
          referredBy: users.referredBy,
          isVerified: users.isVerified,
          verificationMethod: users.verificationMethod,
          averageRating: users.averageRating,
          totalRatings: users.totalRatings,
          createdAt: users.createdAt
        }
      })
      .from(expenses)
      .innerJoin(users, eq(expenses.paid_by, users.id))
      .where(eq(expenses.trip_id, tripId))
      .orderBy(desc(expenses.created_at));
    
    // For each expense, get its splits separately to avoid complex SQL
    const expensesWithSplits = [];
    for (const expense of expensesWithPayers) {
      const splits = await db
        .select({
          id: expenseSplits.id,
          user_id: expenseSplits.user_id,
          amount: expenseSplits.amount,
          paid: expenseSplits.paid,
          settled_at: expenseSplits.settled_at,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            fullName: users.fullName,
            phone: users.phone,
            bio: users.bio,
            location: users.location,
            profilePhoto: users.profilePhoto,
            languages: users.languages,
            interests: users.interests,
            travelStyles: users.travelStyles,
            referredBy: users.referredBy,
            isVerified: users.isVerified,
            verificationMethod: users.verificationMethod,
            averageRating: users.averageRating,
            totalRatings: users.totalRatings,
            createdAt: users.createdAt
          }
        })
        .from(expenseSplits)
        .innerJoin(users, eq(expenseSplits.user_id, users.id))
        .where(eq(expenseSplits.expense_id, expense.id));
      
      expensesWithSplits.push({
        ...expense,
        createdAt: expense.created_at, // Add missing field expected by frontend
        splits
      });
    }
    
    return expensesWithSplits;
  }

  async getTripBalances(tripId: number): Promise<any[]> {
    // Placeholder implementation
    return [];
  }

  async getUserActivityBookings(userId: number): Promise<ActivityBooking[]> {
    return await db.select().from(activityBookings).where(eq(activityBookings.user_id, userId));
  }

  async getUserVoteForActivity(userId: number, activityId: number): Promise<any> {
    // Placeholder implementation
    return null;
  }

  async getUserVoteForProposal(userId: number, proposalId: number): Promise<any> {
    // Placeholder implementation
    return null;
  }

  async getTripActivities(tripId: number): Promise<TripActivity[]> {
    return await db.select().from(tripActivities).where(eq(tripActivities.trip_id, tripId));
  }

  async getUserTripsInLocation(userId: number, location: string): Promise<Trip[]> {
    // Get user's trips and filter by location
    const userTrips = await this.getUserTrips(userId);
    return [...userTrips.created, ...userTrips.participating];
  }

  async getUserRatings(userId: number): Promise<UserRating[]> {
    return await db.select().from(userRatings).where(eq(userRatings.rated_user_id, userId));
  }

  // Additional methods needed by routes
  async fixCreatorsAsParticipants(): Promise<number> {
    // Placeholder - returns 0 for now
    return 0;
  }

  async addTripParticipant(tripId: number, userId: number): Promise<TripParticipant> {
    return this.addParticipant(tripId, userId);
  }

  async removeTripParticipant(tripId: number, userId: number): Promise<boolean> {
    await db.delete(tripParticipants).where(and(
      eq(tripParticipants.trip_id, tripId),
      eq(tripParticipants.user_id, userId)
    ));
    return true;
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    return this.addMessage(messageData);
  }

  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    const [expense] = await db.insert(expenses).values(expenseData).returning();
    return expense;
  }

  async createExpenseSplits(expenseId: number, splits: InsertExpenseSplit[]): Promise<ExpenseSplit[]> {
    console.log('createExpenseSplits called with:', { expenseId, splits });
    
    if (!splits || !Array.isArray(splits)) {
      console.error('Invalid splits data:', splits);
      throw new Error('Splits must be a valid array');
    }
    
    if (splits.length === 0) {
      console.error('Empty splits array');
      throw new Error('Splits array cannot be empty');
    }
    
    const splitData = splits.map(split => ({ ...split, expense_id: expenseId }));
    console.log('Final split data:', splitData);
    
    return await db.insert(expenseSplits).values(splitData).returning();
  }

  async getUserTripRequests(userId: number): Promise<TripRequest[]> {
    return await db.select().from(tripRequests).where(eq(tripRequests.user_id, userId));
  }

  async getActivities(filters: any): Promise<Activity[]> {
    let query = db.select().from(activities);
    
    // Apply filters if provided
    if (filters.category) {
      query = query.where(eq(activities.category, filters.category));
    }
    if (filters.location) {
      query = query.where(eq(activities.destination_name, filters.location));
    }
    if (filters.isActive !== undefined) {
      query = query.where(eq(activities.is_active, filters.isActive));
    }
    
    return await query.orderBy(desc(activities.average_rating), desc(activities.total_ratings));
  }

  async getActivityBudgetProposals(activityId: number): Promise<ActivityBudgetProposal[]> {
    try {
      console.log('🔍 Buscando propostas para atividade:', activityId);
      const result = await db.select().from(activityBudgetProposals)
        .where(eq(activityBudgetProposals.activity_id, activityId))
        .orderBy(asc(activityBudgetProposals.amount));
      console.log('✅ Propostas encontradas:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Erro na query SQL:', error);
      throw error;
    }
  }

  async createActivityBudgetProposal(proposalData: InsertActivityBudgetProposal): Promise<ActivityBudgetProposal> {
    const [proposal] = await db.insert(activityBudgetProposals).values(proposalData).returning();
    return proposal;
  }

  async getActivityReviews(activityId: number): Promise<ActivityReview[]> {
    try {
      console.log('🔍 Buscando avaliações para atividade:', activityId);
      // Use raw SQL as a workaround for Drizzle schema issues
      const result = await db.execute(sql`
        SELECT * FROM activity_reviews 
        WHERE activity_id = ${activityId} 
        ORDER BY created_at DESC
      `);
      console.log('✅ Avaliações encontradas:', result.rows.length);
      return result.rows as unknown as ActivityReview[];
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações:', error);
      throw error;
    }
  }

  async createActivityReview(reviewData: InsertActivityReview): Promise<ActivityReview> {
    const [review] = await db.insert(activityReviews).values(reviewData).returning();
    return review;
  }
}

// Create storage instance
export const storage = new PostgreSQLStorage();

// Session configuration
export const sessionConfig = {
  store: new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET || "fallback-secret-key-for-development",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: false, // Allow client-side access for debugging
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' as const,
  },
};