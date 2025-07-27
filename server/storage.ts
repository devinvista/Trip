import { db } from './db';
import { users, trips, tripParticipants, messages, activities, expenses, tripRequests, destinations, activityBudgetProposals, activityReviews } from '@shared/schema';
import { eq, and, desc, like, sql } from 'drizzle-orm';
import type { 
  InsertUser, 
  InsertTrip, 
  InsertActivity, 
  InsertExpense, 
  InsertMessage, 
  InsertTripRequest,
  User,
  Trip,
  Activity,
  Expense,
  Message,
  TripRequest
} from '@shared/schema';

export interface IStorage {
  // User methods
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<boolean>;

  // Trip methods
  getAllTrips(): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  getTripById(id: number): Promise<Trip | null>;
  updateTrip(id: number, updates: Partial<InsertTrip>): Promise<Trip>;
  deleteTrip(id: number): Promise<boolean>;

  // Activity methods
  getAllActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivityById(id: number): Promise<Activity | null>;
  updateActivity(id: number, updates: Partial<InsertActivity>): Promise<Activity>;

  // Expense methods
  getExpensesByTripId(tripId: number): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;

  // Message methods
  getMessagesByTripId(tripId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Trip request methods
  getTripRequestsByTripId(tripId: number): Promise<TripRequest[]>;
  createTripRequest(request: InsertTripRequest): Promise<TripRequest>;
  updateTripRequest(id: number, updates: Partial<InsertTripRequest>): Promise<TripRequest>;

  // Extended methods required by routes
  searchTrips(query: string): Promise<Trip[]>;
  getUser(id: number): Promise<User | null>;
  getTrip(id: number): Promise<Trip | null>;
  getTripParticipants(tripId: number): Promise<any[]>;
  addParticipant(tripId: number, userId: number): Promise<any>;
  getTripsByUser(userId: number): Promise<Trip[]>;
  searchActivities(query: string): Promise<Activity[]>;
  getPopularActivities(): Promise<Activity[]>;
  getActivityCategories(): Promise<string[]>;
  getActivity(id: number): Promise<Activity | null>;
  getActivityBudgetProposals(activityId: number): Promise<any[]>;
  getActivityReviews(activityId: number): Promise<any[]>;
  getAllDestinations(): Promise<any[]>;
  searchDestinations(query: string): Promise<any[]>;
  getTripMessages(tripId: number): Promise<Message[]>;
  getTripExpenses(tripId: number): Promise<Expense[]>;
}

class DatabaseStorage implements IStorage {
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserById(id: number): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || null;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllTrips(): Promise<Trip[]> {
    return await db.select().from(trips).orderBy(desc(trips.created_at));
  }

  async createTrip(trip: InsertTrip): Promise<Trip> {
    const [newTrip] = await db.insert(trips).values(trip).returning();
    return newTrip;
  }

  async getTripById(id: number): Promise<Trip | null> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip || null;
  }

  async updateTrip(id: number, updates: Partial<InsertTrip>): Promise<Trip> {
    const [updatedTrip] = await db.update(trips)
      .set(updates)
      .where(eq(trips.id, id))
      .returning();
    return updatedTrip;
  }

  async deleteTrip(id: number): Promise<boolean> {
    const result = await db.delete(trips).where(eq(trips.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllActivities(): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.createdAt));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async getActivityById(id: number): Promise<Activity | null> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity || null;
  }

  async updateActivity(id: number, updates: Partial<InsertActivity>): Promise<Activity> {
    const [updatedActivity] = await db.update(activities)
      .set(updates)
      .where(eq(activities.id, id))
      .returning();
    return updatedActivity;
  }

  async getExpensesByTripId(tripId: number): Promise<Expense[]> {
    return await db.select().from(expenses).where(eq(expenses.tripId, tripId));
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async getMessagesByTripId(tripId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.tripId, tripId)).orderBy(desc(messages.sentAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getTripRequestsByTripId(tripId: number): Promise<TripRequest[]> {
    return await db.select().from(tripRequests).where(eq(tripRequests.tripId, tripId));
  }

  async createTripRequest(request: InsertTripRequest): Promise<TripRequest> {
    const [newRequest] = await db.insert(tripRequests).values(request).returning();
    return newRequest;
  }

  async updateTripRequest(id: number, updates: Partial<InsertTripRequest>): Promise<TripRequest> {
    const [updatedRequest] = await db.update(tripRequests)
      .set(updates)
      .where(eq(tripRequests.id, id))
      .returning();
    return updatedRequest;
  }

  // Extended methods implementation
  async searchTrips(query: string): Promise<Trip[]> {
    return await db.select().from(trips)
      .where(like(trips.title, `%${query}%`))
      .orderBy(desc(trips.createdAt));
  }

  async getUser(id: number): Promise<User | null> {
    return await this.getUserById(id);
  }

  async getTrip(id: number): Promise<Trip | null> {
    return await this.getTripById(id);
  }

  async getTripParticipants(tripId: number): Promise<any[]> {
    return await db.select().from(tripParticipants).where(eq(tripParticipants.tripId, tripId));
  }

  async addParticipant(tripId: number, userId: number): Promise<any> {
    const [participant] = await db.insert(tripParticipants)
      .values({ tripId: tripId, userId: userId })
      .returning();
    return participant;
  }

  async getTripsByUser(userId: number): Promise<Trip[]> {
    return await db.select().from(trips).where(eq(trips.creatorId, userId));
  }

  async searchActivities(query: string): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(like(activities.title, `%${query}%`))
      .orderBy(desc(activities.createdAt));
  }

  async getPopularActivities(): Promise<Activity[]> {
    return await db.select().from(activities)
      .orderBy(desc(activities.averageRating))
      .limit(10);
  }

  async getActivityCategories(): Promise<string[]> {
    const result = await db.selectDistinct({ category: activities.category }).from(activities);
    return result.map(r => r.category);
  }

  async getActivity(id: number): Promise<Activity | null> {
    return await this.getActivityById(id);
  }

  async getActivityBudgetProposals(activityId: number): Promise<any[]> {
    return await db.select().from(activityBudgetProposals)
      .where(eq(activityBudgetProposals.activityId, activityId));
  }

  async getActivityReviews(activityId: number): Promise<any[]> {
    return await db.select().from(activityReviews)
      .where(eq(activityReviews.activityId, activityId));
  }

  async getAllDestinations(): Promise<any[]> {
    return await db.select().from(destinations);
  }

  async searchDestinations(query: string): Promise<any[]> {
    return await db.select().from(destinations)
      .where(like(destinations.name, `%${query}%`));
  }

  async getTripMessages(tripId: number): Promise<Message[]> {
    return await this.getMessagesByTripId(tripId);
  }

  async getTripExpenses(tripId: number): Promise<Expense[]> {
    return await this.getExpensesByTripId(tripId);
  }
}

export const storage = new DatabaseStorage();