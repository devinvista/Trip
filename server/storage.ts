import { users, trips, tripParticipants, messages, tripRequests, expenses, expenseSplits, userRatings, destinationRatings, verificationRequests, activities, activityReviews, activityBookings, activityBudgetProposals, tripActivities, destinations, referralCodes, type User, type InsertUser, type Trip, type InsertTrip, type Message, type InsertMessage, type TripRequest, type InsertTripRequest, type TripParticipant, type Expense, type InsertExpense, type ExpenseSplit, type InsertExpenseSplit, type UserRating, type InsertUserRating, type DestinationRating, type InsertDestinationRating, type VerificationRequest, type InsertVerificationRequest, type Activity, type InsertActivity, type ActivityReview, type InsertActivityReview, type ActivityBooking, type InsertActivityBooking, type ActivityBudgetProposal, type InsertActivityBudgetProposal, type TripActivity, type InsertTripActivity, type ReferralCode, type InsertReferralCode, type Destination } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte, sql, count, or, inArray, like, ne } from "drizzle-orm";
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

  // Expense splits
  createExpenseSplits(splits: InsertExpenseSplit[]): Promise<ExpenseSplit[]>;
  getExpenseSplits(expenseId: number): Promise<ExpenseSplit[]>;
  updateExpenseSplit(id: number, updates: Partial<ExpenseSplit>): Promise<ExpenseSplit | undefined>;

  // User ratings
  createUserRating(rating: InsertUserRating): Promise<UserRating>;
  getUserRatings(userId: number): Promise<UserRating[]>;
  updateUserRating(id: number, updates: Partial<UserRating>): Promise<UserRating | undefined>;

  // Destination ratings
  createDestinationRating(rating: InsertDestinationRating): Promise<DestinationRating>;
  getDestinationRatings(destination: string): Promise<DestinationRating[]>;

  // Verification requests
  createVerificationRequest(request: InsertVerificationRequest): Promise<VerificationRequest>;
  getVerificationRequests(): Promise<VerificationRequest[]>;
  updateVerificationRequest(id: number, updates: Partial<VerificationRequest>): Promise<VerificationRequest | undefined>;

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

  // Trip activities
  addActivityToTrip(tripActivity: InsertTripActivity): Promise<TripActivity>;
  getTripActivities(tripId: number): Promise<TripActivity[]>;
  removeActivityFromTrip(id: number): Promise<boolean>;

  // Destinations
  getAllDestinations(): Promise<Destination[]>;
  getDestination(id: number): Promise<Destination | undefined>;
  getDestinationByName(name: string): Promise<Destination | undefined>;

  // Referral codes
  createReferralCode(code: InsertReferralCode): Promise<ReferralCode>;
  getReferralCode(code: string): Promise<ReferralCode | undefined>;
  updateReferralCodeUsage(code: string): Promise<boolean>;
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

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const [newUser] = await db
      .insert(users)
      .values({ ...user, password: hashedPassword })
      .returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.createdAt));
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
      .where(eq(trips.creator_id, userId))
      .orderBy(desc(trips.created_at));

    // Get trips user is participating in
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
        created_at: trips.created_at,
      })
      .from(trips)
      .innerJoin(tripParticipants, eq(trips.id, tripParticipants.trip_id))
      .where(and(
        eq(tripParticipants.user_id, userId),
        eq(tripParticipants.status, "accepted")
      ))
      .orderBy(desc(trips.created_at));

    return { created, participating };
  }

  async getAllTrips(): Promise<Trip[]> {
    return await db.select().from(trips).orderBy(desc(trips.created_at));
  }

  async updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | undefined> {
    const [updatedTrip] = await db
      .update(trips)
      .set(updates)
      .where(eq(trips.id, id))
      .returning();
    return updatedTrip || undefined;
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
      // For now, we'll keep it simple and search by destination_id
      conditions.push(eq(trips.destination_id, filters.destination));
    }
    
    if (filters.startDate) {
      conditions.push(gte(trips.startDate, new Date(filters.startDate)));
    }
    
    if (filters.endDate) {
      conditions.push(lte(trips.endDate, new Date(filters.endDate)));
    }
    
    if (filters.maxBudget) {
      conditions.push(lte(trips.budget, filters.maxBudget));
    }
    
    if (filters.travelStyle) {
      conditions.push(eq(trips.travel_style, filters.travelStyle));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(trips.created_at));
  }

  // Trip participants
  async addParticipant(tripId: number, userId: number): Promise<void> {
    await db.insert(tripParticipants).values({
      trip_id: tripId,
      user_id: userId,
      status: "pending"
    });
  }

  async removeParticipant(tripId: number, userId: number): Promise<void> {
    await db
      .delete(tripParticipants)
      .where(and(
        eq(tripParticipants.trip_id, tripId),
        eq(tripParticipants.user_id, userId)
      ));
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
      .where(and(
        eq(tripParticipants.trip_id, tripId),
        eq(tripParticipants.user_id, userId)
      ));
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
      .orderBy(asc(messages.sent_at));
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
      .where(eq(tripRequests.trip_id, tripId))
      .orderBy(desc(tripRequests.created_at));
  }

  async getUserTripRequests(userId: number): Promise<TripRequest[]> {
    return await db
      .select()
      .from(tripRequests)
      .where(eq(tripRequests.user_id, userId))
      .orderBy(desc(tripRequests.created_at));
  }

  async updateTripRequestStatus(id: number, status: string): Promise<TripRequest | undefined> {
    const [updatedRequest] = await db
      .update(tripRequests)
      .set({ status })
      .where(eq(tripRequests.id, id))
      .returning();
    return updatedRequest || undefined;
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
      .where(eq(expenses.trip_id, tripId))
      .orderBy(desc(expenses.created_at));
  }

  async updateExpense(id: number, updates: Partial<Expense>): Promise<Expense | undefined> {
    const [updatedExpense] = await db
      .update(expenses)
      .set(updates)
      .where(eq(expenses.id, id))
      .returning();
    return updatedExpense || undefined;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return result.rowCount > 0;
  }

  // Expense splits
  async createExpenseSplits(splits: InsertExpenseSplit[]): Promise<ExpenseSplit[]> {
    const newSplits = await db.insert(expenseSplits).values(splits).returning();
    return newSplits;
  }

  async getExpenseSplits(expenseId: number): Promise<ExpenseSplit[]> {
    return await db
      .select()
      .from(expenseSplits)
      .where(eq(expenseSplits.expense_id, expenseId));
  }

  async updateExpenseSplit(id: number, updates: Partial<ExpenseSplit>): Promise<ExpenseSplit | undefined> {
    const [updatedSplit] = await db
      .update(expenseSplits)
      .set(updates)
      .where(eq(expenseSplits.id, id))
      .returning();
    return updatedSplit || undefined;
  }

  // User ratings
  async createUserRating(rating: InsertUserRating): Promise<UserRating> {
    const [newRating] = await db.insert(userRatings).values(rating).returning();
    return newRating;
  }

  async getUserRatings(userId: number): Promise<UserRating[]> {
    return await db
      .select()
      .from(userRatings)
      .where(eq(userRatings.rated_user_id, userId))
      .orderBy(desc(userRatings.created_at));
  }

  async updateUserRating(id: number, updates: Partial<UserRating>): Promise<UserRating | undefined> {
    const [updatedRating] = await db
      .update(userRatings)
      .set(updates)
      .where(eq(userRatings.id, id))
      .returning();
    return updatedRating || undefined;
  }

  // Destination ratings
  async createDestinationRating(rating: InsertDestinationRating): Promise<DestinationRating> {
    const [newRating] = await db.insert(destinationRatings).values(rating).returning();
    return newRating;
  }

  async getDestinationRatings(destination: string): Promise<DestinationRating[]> {
    return await db
      .select()
      .from(destinationRatings)
      .where(eq(destinationRatings.destination, destination))
      .orderBy(desc(destinationRatings.created_at));
  }

  // Verification requests
  async createVerificationRequest(request: InsertVerificationRequest): Promise<VerificationRequest> {
    const [newRequest] = await db.insert(verificationRequests).values(request).returning();
    return newRequest;
  }

  async getVerificationRequests(): Promise<VerificationRequest[]> {
    return await db
      .select()
      .from(verificationRequests)
      .orderBy(desc(verificationRequests.created_at));
  }

  async updateVerificationRequest(id: number, updates: Partial<VerificationRequest>): Promise<VerificationRequest | undefined> {
    const [updatedRequest] = await db
      .update(verificationRequests)
      .set(updates)
      .where(eq(verificationRequests.id, id))
      .returning();
    return updatedRequest || undefined;
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
    return await db
      .select()
      .from(activities)
      .where(eq(activities.is_active, true))
      .orderBy(desc(activities.created_at));
  }

  async getActivitiesByDestination(destinationId: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(and(
        eq(activities.destination_id, destinationId),
        eq(activities.is_active, true)
      ))
      .orderBy(desc(activities.created_at));
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined> {
    const [updatedActivity] = await db
      .update(activities)
      .set(updates)
      .where(eq(activities.id, id))
      .returning();
    return updatedActivity || undefined;
  }

  async deleteActivity(id: number): Promise<boolean> {
    const result = await db
      .update(activities)
      .set({ is_active: false })
      .where(eq(activities.id, id));
    return result.rowCount > 0;
  }

  async searchActivities(filters: any): Promise<Activity[]> {
    let query = db.select().from(activities).where(eq(activities.is_active, true));
    
    const conditions = [eq(activities.is_active, true)];
    
    if (filters.destination) {
      conditions.push(eq(activities.destination_id, filters.destination));
    }
    
    if (filters.category) {
      conditions.push(eq(activities.category, filters.category));
    }
    
    if (filters.difficulty) {
      conditions.push(eq(activities.difficulty_level, filters.difficulty));
    }
    
    if (filters.search) {
      conditions.push(
        or(
          like(activities.title, `%${filters.search}%`),
          like(activities.description, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(activities.created_at));
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
      .where(and(
        eq(activityReviews.activity_id, activityId),
        eq(activityReviews.is_hidden, false)
      ))
      .orderBy(desc(activityReviews.created_at));
  }

  async updateActivityReview(id: number, updates: Partial<ActivityReview>): Promise<ActivityReview | undefined> {
    const [updatedReview] = await db
      .update(activityReviews)
      .set(updates)
      .where(eq(activityReviews.id, id))
      .returning();
    return updatedReview || undefined;
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
      .where(eq(activityBookings.activity_id, activityId))
      .orderBy(desc(activityBookings.created_at));
  }

  async getUserActivityBookings(userId: number): Promise<ActivityBooking[]> {
    return await db
      .select()
      .from(activityBookings)
      .where(eq(activityBookings.user_id, userId))
      .orderBy(desc(activityBookings.created_at));
  }

  async updateActivityBooking(id: number, updates: Partial<ActivityBooking>): Promise<ActivityBooking | undefined> {
    const [updatedBooking] = await db
      .update(activityBookings)
      .set(updates)
      .where(eq(activityBookings.id, id))
      .returning();
    return updatedBooking || undefined;
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
      .where(and(
        eq(activityBudgetProposals.activity_id, activityId),
        eq(activityBudgetProposals.is_active, true)
      ))
      .orderBy(asc(activityBudgetProposals.amount));
  }

  async updateActivityBudgetProposal(id: number, updates: Partial<ActivityBudgetProposal>): Promise<ActivityBudgetProposal | undefined> {
    const [updatedProposal] = await db
      .update(activityBudgetProposals)
      .set(updates)
      .where(eq(activityBudgetProposals.id, id))
      .returning();
    return updatedProposal || undefined;
  }

  async deleteActivityBudgetProposal(id: number): Promise<boolean> {
    const result = await db
      .update(activityBudgetProposals)
      .set({ is_active: false })
      .where(eq(activityBudgetProposals.id, id));
    return result.rowCount > 0;
  }

  // Trip activities
  async addActivityToTrip(tripActivity: InsertTripActivity): Promise<TripActivity> {
    const [newTripActivity] = await db.insert(tripActivities).values(tripActivity).returning();
    return newTripActivity;
  }

  async getTripActivities(tripId: number): Promise<TripActivity[]> {
    return await db
      .select()
      .from(tripActivities)
      .where(eq(tripActivities.trip_id, tripId))
      .orderBy(asc(tripActivities.scheduled_date));
  }

  async removeActivityFromTrip(id: number): Promise<boolean> {
    const result = await db.delete(tripActivities).where(eq(tripActivities.id, id));
    return result.rowCount > 0;
  }

  // Destinations
  async getAllDestinations(): Promise<Destination[]> {
    return await db
      .select()
      .from(destinations)
      .where(eq(destinations.isActive, true))
      .orderBy(asc(destinations.name));
  }

  async getDestination(id: number): Promise<Destination | undefined> {
    const [destination] = await db.select().from(destinations).where(eq(destinations.id, id));
    return destination || undefined;
  }

  async getDestinationByName(name: string): Promise<Destination | undefined> {
    const [destination] = await db.select().from(destinations).where(eq(destinations.name, name));
    return destination || undefined;
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
      .where(and(
        eq(referralCodes.code, code),
        eq(referralCodes.is_active, true)
      ));
    return referralCode || undefined;
  }

  async updateReferralCodeUsage(code: string): Promise<boolean> {
    const result = await db
      .update(referralCodes)
      .set({ 
        current_uses: sql`${referralCodes.current_uses} + 1` 
      })
      .where(eq(referralCodes.code, code));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();