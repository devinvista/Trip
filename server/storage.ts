import { 
  users, trips, tripParticipants, tripRequests, messages, destinations, activities, 
  activityBookings, activityReviews, activityBudgetProposals, expenses, referralCodes, 
  type User, type InsertUser, type Trip, type InsertTrip, type TripParticipant, 
  type InsertTripParticipant, type TripRequest, type InsertTripRequest, type Message, 
  type InsertMessage, type Destination, type InsertDestination, type Activity, 
  type InsertActivity, type ActivityBooking, type InsertActivityBooking, 
  type ActivityReview, type InsertActivityReview, type ActivityBudgetProposal, 
  type InsertActivityBudgetProposal, type Expense, type InsertExpense, 
  type ReferralCode, type InsertReferralCode
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, sql, like, gte, lte, inArray, ne, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Trip operations
  createTrip(trip: InsertTrip): Promise<Trip>;
  getTrip(id: number): Promise<Trip | undefined>;
  getTripsByUser(userId: number): Promise<{ created: Trip[], participating: Trip[] }>;
  getAllTrips(): Promise<Trip[]>;
  updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | undefined>;
  deleteTrip(id: number): Promise<boolean>;
  searchTrips(filters: any): Promise<Trip[]>;
  
  // Trip participants
  addParticipant(tripId: number, userId: number): Promise<void>;
  removeParticipant(tripId: number, userId: number): Promise<void>;
  getTripParticipants(tripId: number): Promise<TripParticipant[]>;
  updateParticipantStatus(tripId: number, userId: number, status: string): Promise<void>;

  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getTripMessages(tripId: number): Promise<Message[]>;

  // Trip requests
  createTripRequest(request: InsertTripRequest): Promise<TripRequest>;
  getTripRequests(tripId: number): Promise<TripRequest[]>;
  getUserTripRequests(userId: number): Promise<TripRequest[]>;
  updateTripRequestStatus(id: number, status: string): Promise<TripRequest | undefined>;

  // Expenses
  createExpense(expense: InsertExpense): Promise<Expense>;
  getTripExpenses(tripId: number): Promise<Expense[]>;
  updateExpense(id: number, updates: Partial<Expense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;

  // Activities
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivity(id: number): Promise<Activity | undefined>;
  getAllActivities(): Promise<Activity[]>;
  getActivitiesByDestination(destinationId: number): Promise<Activity[]>;
  updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;
  searchActivities(filters: any): Promise<Activity[]>;

  // Activity reviews
  createActivityReview(review: InsertActivityReview): Promise<ActivityReview>;
  getActivityReviews(activityId: number): Promise<ActivityReview[]>;
  updateActivityReview(id: number, updates: Partial<ActivityReview>): Promise<ActivityReview | undefined>;
  deleteActivityReview(id: number): Promise<boolean>;

  // Activity bookings
  createActivityBooking(booking: InsertActivityBooking): Promise<ActivityBooking>;
  getActivityBookings(activityId: number): Promise<ActivityBooking[]>;
  getUserActivityBookings(userId: number): Promise<ActivityBooking[]>;
  updateActivityBooking(id: number, updates: Partial<ActivityBooking>): Promise<ActivityBooking | undefined>;

  // Activity budget proposals
  createActivityBudgetProposal(proposal: InsertActivityBudgetProposal): Promise<ActivityBudgetProposal>;
  getActivityBudgetProposals(activityId: number): Promise<ActivityBudgetProposal[]>;
  updateActivityBudgetProposal(id: number, updates: Partial<ActivityBudgetProposal>): Promise<ActivityBudgetProposal | undefined>;
  deleteActivityBudgetProposal(id: number): Promise<boolean>;

  // Destinations
  createDestination(destination: InsertDestination): Promise<Destination>;
  getDestination(id: number): Promise<Destination | undefined>;
  getAllDestinations(): Promise<Destination[]>;
  searchDestinations(query: string): Promise<Destination[]>;
  updateDestination(id: number, updates: Partial<Destination>): Promise<Destination | undefined>;
  deleteDestination(id: number): Promise<boolean>;

  // Referral codes
  createReferralCode(code: InsertReferralCode): Promise<ReferralCode>;
  getReferralCode(code: string): Promise<ReferralCode | undefined>;
  useReferralCode(code: string): Promise<boolean>;
  getAllReferralCodes(): Promise<ReferralCode[]>;

  // Search and filter functions
  getPopularActivities(limit?: number): Promise<Activity[]>;
  getActivityCategories(): Promise<{ category: string; count: number }[]>;
  getUserByPhone(phone: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Trip operations
  async createTrip(trip: InsertTrip): Promise<Trip> {
    const [newTrip] = await db.insert(trips).values(trip).returning();
    return newTrip;
  }

  async getTrip(id: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip || undefined;
  }

  async getTripsByUser(userId: number): Promise<{ created: Trip[], participating: Trip[] }> {
    // Get trips created by user
    const created = await db
      .select()
      .from(trips)
      .where(eq(trips.creator_id, userId));

    // Get trips where user is a participant
    const participating = await db
      .select({
        id: trips.id,
        title: trips.title,
        destination_id: trips.destination_id,
        startDate: trips.startDate,
        endDate: trips.endDate,
        budget: trips.budget,
        max_participants: trips.max_participants,
        current_participants: trips.current_participants,
        description: trips.description,
        travel_style: trips.travel_style,
        status: trips.status,
        creator_id: trips.creator_id,
        created_at: trips.created_at,
        updated_at: trips.updated_at,
        cover_image: trips.cover_image,
        planned_activities: trips.planned_activities,
        budget_breakdown: trips.budget_breakdown,
        activities_cost: trips.activities_cost
      })
      .from(trips)
      .innerJoin(tripParticipants, eq(trips.id, tripParticipants.trip_id))
      .where(
        and(
          eq(tripParticipants.user_id, userId),
          eq(tripParticipants.status, 'accepted'),
          ne(trips.creator_id, userId)
        )
      );

    return { created, participating };
  }

  async getAllTrips(): Promise<Trip[]> {
    return await db.select().from(trips);
  }

  async updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | undefined> {
    const [trip] = await db
      .update(trips)
      .set(updates)
      .where(eq(trips.id, id))
      .returning();
    return trip || undefined;
  }

  async deleteTrip(id: number): Promise<boolean> {
    const result = await db.delete(trips).where(eq(trips.id, id));
    return result.rowCount > 0;
  }

  async searchTrips(filters: any): Promise<Trip[]> {
    let query = db.select().from(trips);
    
    const conditions = [];
    
    if (filters.destination) {
      // Join with destinations table to search by name
      query = query.leftJoin(destinations, eq(trips.destination_id, destinations.id));
      conditions.push(like(destinations.name, `%${filters.destination}%`));
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

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  // Trip participants
  async addParticipant(tripId: number, userId: number): Promise<void> {
    await db.insert(tripParticipants).values({
      trip_id: tripId,
      user_id: userId,
      status: 'accepted',
      joined_at: new Date()
    });
  }

  async removeParticipant(tripId: number, userId: number): Promise<void> {
    await db
      .delete(tripParticipants)
      .where(
        and(
          eq(tripParticipants.trip_id, tripId),
          eq(tripParticipants.user_id, userId)
        )
      );
  }

  async getTripParticipants(tripId: number): Promise<TripParticipant[]> {
    return await db
      .select()
      .from(tripParticipants)
      .where(eq(tripParticipants.trip_id, tripId));
  }

  async updateParticipantStatus(tripId: number, userId: number, status: string): Promise<void> {
    await db
      .update(tripParticipants)
      .set({ status })
      .where(
        and(
          eq(tripParticipants.trip_id, tripId),
          eq(tripParticipants.user_id, userId)
        )
      );
  }

  // Messages
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getTripMessages(tripId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.trip_id, tripId))
      .orderBy(asc(messages.created_at));
  }

  // Trip requests
  async createTripRequest(request: InsertTripRequest): Promise<TripRequest> {
    const [newRequest] = await db.insert(tripRequests).values(request).returning();
    return newRequest;
  }

  async getTripRequests(tripId: number): Promise<TripRequest[]> {
    return await db
      .select()
      .from(tripRequests)
      .where(eq(tripRequests.trip_id, tripId));
  }

  async getUserTripRequests(userId: number): Promise<TripRequest[]> {
    return await db
      .select()
      .from(tripRequests)
      .where(eq(tripRequests.user_id, userId));
  }

  async updateTripRequestStatus(id: number, status: string): Promise<TripRequest | undefined> {
    const [request] = await db
      .update(tripRequests)
      .set({ status })
      .where(eq(tripRequests.id, id))
      .returning();
    return request || undefined;
  }

  // Expenses
  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async getTripExpenses(tripId: number): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.trip_id, tripId));
  }

  async updateExpense(id: number, updates: Partial<Expense>): Promise<Expense | undefined> {
    const [expense] = await db
      .update(expenses)
      .set(updates)
      .where(eq(expenses.id, id))
      .returning();
    return expense || undefined;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return result.rowCount > 0;
  }

  // Activities
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity || undefined;
  }

  async getAllActivities(): Promise<Activity[]> {
    return await db.select().from(activities).where(eq(activities.is_active, true));
  }

  async getActivitiesByDestination(destinationId: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.destination_id, destinationId),
          eq(activities.is_active, true)
        )
      );
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined> {
    const [activity] = await db
      .update(activities)
      .set(updates)
      .where(eq(activities.id, id))
      .returning();
    return activity || undefined;
  }

  async deleteActivity(id: number): Promise<boolean> {
    const result = await db.delete(activities).where(eq(activities.id, id));
    return result.rowCount > 0;
  }

  async searchActivities(filters: any): Promise<Activity[]> {
    let query = db.select().from(activities).where(eq(activities.is_active, true));
    
    const conditions = [eq(activities.is_active, true)];
    
    if (filters.category && filters.category.length > 0) {
      conditions.push(inArray(activities.category, filters.category));
    }
    
    if (filters.destination_id) {
      conditions.push(eq(activities.destination_id, filters.destination_id));
    }
    
    if (filters.difficulty_level) {
      conditions.push(eq(activities.difficulty_level, filters.difficulty_level));
    }

    if (filters.search) {
      conditions.push(
        or(
          like(activities.title, `%${filters.search}%`),
          like(activities.description, `%${filters.search}%`)
        )
      );
    }

    query = query.where(and(...conditions));

    return await query;
  }

  // Activity reviews
  async createActivityReview(review: InsertActivityReview): Promise<ActivityReview> {
    const [newReview] = await db.insert(activityReviews).values(review).returning();
    return newReview;
  }

  async getActivityReviews(activityId: number): Promise<ActivityReview[]> {
    return await db
      .select()
      .from(activityReviews)
      .where(eq(activityReviews.activity_id, activityId))
      .orderBy(desc(activityReviews.created_at));
  }

  async updateActivityReview(id: number, updates: Partial<ActivityReview>): Promise<ActivityReview | undefined> {
    const [review] = await db
      .update(activityReviews)
      .set(updates)
      .where(eq(activityReviews.id, id))
      .returning();
    return review || undefined;
  }

  async deleteActivityReview(id: number): Promise<boolean> {
    const result = await db.delete(activityReviews).where(eq(activityReviews.id, id));
    return result.rowCount > 0;
  }

  // Activity bookings
  async createActivityBooking(booking: InsertActivityBooking): Promise<ActivityBooking> {
    const [newBooking] = await db.insert(activityBookings).values(booking).returning();
    return newBooking;
  }

  async getActivityBookings(activityId: number): Promise<ActivityBooking[]> {
    return await db
      .select()
      .from(activityBookings)
      .where(eq(activityBookings.activity_id, activityId));
  }

  async getUserActivityBookings(userId: number): Promise<ActivityBooking[]> {
    return await db
      .select()
      .from(activityBookings)
      .where(eq(activityBookings.user_id, userId));
  }

  async updateActivityBooking(id: number, updates: Partial<ActivityBooking>): Promise<ActivityBooking | undefined> {
    const [booking] = await db
      .update(activityBookings)
      .set(updates)
      .where(eq(activityBookings.id, id))
      .returning();
    return booking || undefined;
  }

  // Activity budget proposals
  async createActivityBudgetProposal(proposal: InsertActivityBudgetProposal): Promise<ActivityBudgetProposal> {
    const [newProposal] = await db.insert(activityBudgetProposals).values(proposal).returning();
    return newProposal;
  }

  async getActivityBudgetProposals(activityId: number): Promise<ActivityBudgetProposal[]> {
    return await db
      .select()
      .from(activityBudgetProposals)
      .where(
        and(
          eq(activityBudgetProposals.activity_id, activityId),
          eq(activityBudgetProposals.is_active, true)
        )
      )
      .orderBy(asc(activityBudgetProposals.amount));
  }

  async updateActivityBudgetProposal(id: number, updates: Partial<ActivityBudgetProposal>): Promise<ActivityBudgetProposal | undefined> {
    const [proposal] = await db
      .update(activityBudgetProposals)
      .set(updates)
      .where(eq(activityBudgetProposals.id, id))
      .returning();
    return proposal || undefined;
  }

  async deleteActivityBudgetProposal(id: number): Promise<boolean> {
    const result = await db.delete(activityBudgetProposals).where(eq(activityBudgetProposals.id, id));
    return result.rowCount > 0;
  }

  // Destinations
  async createDestination(destination: InsertDestination): Promise<Destination> {
    const [newDestination] = await db.insert(destinations).values(destination).returning();
    return newDestination;
  }

  async getDestination(id: number): Promise<Destination | undefined> {
    const [destination] = await db.select().from(destinations).where(eq(destinations.id, id));
    return destination || undefined;
  }

  async getAllDestinations(): Promise<Destination[]> {
    return await db.select().from(destinations).where(eq(destinations.isActive, true));
  }

  async searchDestinations(query: string): Promise<Destination[]> {
    return await db
      .select()
      .from(destinations)
      .where(
        and(
          eq(destinations.isActive, true),
          or(
            like(destinations.name, `%${query}%`),
            like(destinations.country, `%${query}%`),
            like(destinations.state, `%${query}%`)
          )
        )
      );
  }

  async updateDestination(id: number, updates: Partial<Destination>): Promise<Destination | undefined> {
    const [destination] = await db
      .update(destinations)
      .set(updates)
      .where(eq(destinations.id, id))
      .returning();
    return destination || undefined;
  }

  async deleteDestination(id: number): Promise<boolean> {
    const result = await db.delete(destinations).where(eq(destinations.id, id));
    return result.rowCount > 0;
  }

  // Referral codes
  async createReferralCode(code: InsertReferralCode): Promise<ReferralCode> {
    const [newCode] = await db.insert(referralCodes).values(code).returning();
    return newCode;
  }

  async getReferralCode(code: string): Promise<ReferralCode | undefined> {
    const [referralCode] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, code));
    return referralCode || undefined;
  }

  async useReferralCode(code: string): Promise<boolean> {
    const result = await db
      .update(referralCodes)
      .set({ 
        current_uses: sql`${referralCodes.current_uses} + 1`
      })
      .where(eq(referralCodes.code, code));
    return result.rowCount > 0;
  }

  async getAllReferralCodes(): Promise<ReferralCode[]> {
    return await db.select().from(referralCodes);
  }

  // Search and filter functions
  async getPopularActivities(limit: number = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.is_active, true))
      .orderBy(desc(activities.average_rating))
      .limit(limit);
  }

  async getActivityCategories(): Promise<{ category: string; count: number }[]> {
    const result = await db
      .select({
        category: activities.category,
        count: sql<number>`count(*)`.as('count')
      })
      .from(activities)
      .where(eq(activities.is_active, true))
      .groupBy(activities.category)
      .orderBy(desc(sql`count(*)`));
    
    return result;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }
}

export const storage = new DatabaseStorage();