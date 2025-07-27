import { pgTable, text, integer, boolean, timestamp, json, numeric, varchar, pgEnum, index, serial, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Destinations table - central repository for all locations/destinations
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Rio de Janeiro"
  state: varchar("state", { length: 255 }), // e.g., "RJ" 
  country: varchar("country", { length: 255 }).notNull(), // e.g., "Brasil"
  countryType: varchar("country_type", { length: 50 }).notNull(), // "nacional" or "internacional"
  region: varchar("region", { length: 255 }), // e.g., "Sudeste", "Europa"
  continent: varchar("continent", { length: 100 }).notNull(), // e.g., "América do Sul", "Europa", "Ásia"
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  timezone: varchar("timezone", { length: 50 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  bio: text("bio"),
  location: varchar("location", { length: 255 }),
  profilePhoto: text("profile_photo"),
  languages: json("languages"),
  interests: json("interests"),
  travelStyles: json("travel_styles"), // User's travel style preferences (array)
  referredBy: varchar("referred_by", { length: 50 }), // Referral code used during registration
  isVerified: boolean("is_verified").default(false).notNull(), // User verification status
  verificationMethod: varchar("verification_method", { length: 50 }), // email, phone, document, etc.
  averageRating: numeric("average_rating", { precision: 3, scale: 2 }).default("5.00"), // Average rating from other users
  totalRatings: integer("total_ratings").default(0).notNull(), // Total number of ratings received
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  creator_id: integer("creator_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  destination_id: integer("destination_id").notNull().references(() => destinations.id), // Reference to destinations table
  coverImage: text("cover_image"), // URL for trip cover image
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  budget: integer("budget"), // Now optional - total estimated budget
  budget_breakdown: json("budget_breakdown"), // JSON object with expense categories
  max_participants: integer("max_participants").notNull(),
  current_participants: integer("current_participants").default(1).notNull(),
  description: text("description").notNull(),
  travel_style: varchar("travel_style", { length: 100 }).notNull(),
  shared_costs: json("shared_costs"),
  planned_activities: json("planned_activities"), // Advanced activities with attachments, links, costs
  status: varchar("status", { length: 50 }).default("open").notNull(), // open, full, cancelled
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const tripParticipants = pgTable("trip_participants", {
  id: serial("id").primaryKey(),
  trip_id: integer("trip_id").notNull().references(() => trips.id),
  user_id: integer("user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, accepted, rejected
  joined_at: timestamp("joined_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  trip_id: integer("trip_id").notNull().references(() => trips.id),
  sender_id: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  sent_at: timestamp("sent_at").defaultNow().notNull(),
});

export const tripRequests = pgTable("trip_requests", {
  id: serial("id").primaryKey(),
  trip_id: integer("trip_id").notNull().references(() => trips.id),
  user_id: integer("user_id").notNull().references(() => users.id),
  message: text("message"),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, accepted, rejected
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Expenses table for trip cost splitting
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  trip_id: integer("trip_id").notNull().references(() => trips.id),
  paid_by: integer("paid_by").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull().default("other"),
  receipt: text("receipt"), // URL or base64 encoded image
  created_at: timestamp("created_at").defaultNow().notNull(),
  settled_at: timestamp("settled_at"),
});

// Expense splits - who owes what for each expense
export const expenseSplits = pgTable("expense_splits", {
  id: serial("id").primaryKey(),
  expense_id: integer("expense_id").notNull().references(() => expenses.id),
  user_id: integer("user_id").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(), // How much this user owes for this expense
  paid: boolean("paid").default(false).notNull(),
  settled_at: timestamp("settled_at"),
});

// User ratings - for rating travel companions
export const userRatings = pgTable("user_ratings", {
  id: serial("id").primaryKey(),
  trip_id: integer("trip_id").notNull().references(() => trips.id),
  rated_user_id: integer("rated_user_id").notNull().references(() => users.id), // User being rated
  rater_user_id: integer("rater_user_id").notNull().references(() => users.id), // User giving the rating
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"), // Optional comment
  is_hidden: boolean("is_hidden").default(false).notNull(), // Hidden if reported multiple times
  report_count: integer("report_count").default(0).notNull(), // Number of reports
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Destination ratings - for rating destinations  
export const destinationRatings = pgTable("destination_ratings", {
  id: serial("id").primaryKey(),
  destination: varchar("destination", { length: 255 }).notNull(), // Destination name
  user_id: integer("user_id").notNull().references(() => users.id), // User giving the rating
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"), // Optional comment
  is_hidden: boolean("is_hidden").default(false).notNull(), // Hidden if reported multiple times
  report_count: integer("report_count").default(0).notNull(), // Number of reports
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// User verification requests
export const verificationRequests = pgTable("verification_requests", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // document, phone, social_media, etc.
  document_url: text("document_url"), // URL for uploaded document
  social_media_profile: text("social_media_profile"), // Social media profile URL
  phone_number: varchar("phone_number", { length: 20 }), // Phone number for verification
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, approved, rejected
  reviewed_by: integer("reviewed_by").references(() => users.id), // Admin who reviewed
  reviewed_at: timestamp("reviewed_at"), // When reviewed
  rejection_reason: text("rejection_reason"), // Reason for rejection if applicable
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Activities table for tourist activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  destination_id: integer("destination_id").notNull().references(() => destinations.id), // Reference to destinations table
  category: varchar("category", { length: 100 }).notNull(),
  difficulty_level: varchar("difficulty_level", { length: 50 }).default("medium").notNull(),
  duration: varchar("duration", { length: 50 }).notNull(), // e.g., "3 horas", "Dia inteiro"
  min_participants: integer("min_participants").default(1).notNull(),
  max_participants: integer("max_participants").default(50).notNull(),
  languages: json("languages").default("[]"), // Supported languages
  inclusions: json("inclusions").default("[]"), // What's included
  exclusions: json("exclusions").default("[]"), // What's not included
  requirements: json("requirements").default("[]"), // Requirements for participation
  cancellation_policy: text("cancellation_policy").default("Cancelamento gratuito até 24h antes"), // Cancellation policy
  contact_info: json("contact_info").default("{}"), // Contact information
  cover_image: text("cover_image"), // Main image URL
  images: json("images").default("[]"), // Additional images
  average_rating: numeric("average_rating", { precision: 3, scale: 2 }).default("0.00"),
  total_ratings: integer("total_ratings").default(0).notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  created_by_id: integer("created_by_id").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Activity reviews
export const activityReviews = pgTable("activity_reviews", {
  id: serial("id").primaryKey(),
  activity_id: integer("activity_id").notNull().references(() => activities.id),
  user_id: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  photos: json("photos").default("[]"), // Array of photo URLs
  visit_date: timestamp("visit_date"), // When the user visited
  helpful_votes: integer("helpful_votes").default(0).notNull(), // How many users found this helpful
  is_verified: boolean("is_verified").default(false).notNull(), // Verified review badge
  is_hidden: boolean("is_hidden").default(false).notNull(), // Hidden if reported multiple times
  report_count: integer("report_count").default(0).notNull(), // Number of reports
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueReview: unique().on(table.activity_id, table.user_id), // One review per user per activity
}));

// Activity bookings
export const activityBookings = pgTable("activity_bookings", {
  id: serial("id").primaryKey(),
  activity_id: integer("activity_id").notNull().references(() => activities.id),
  user_id: integer("user_id").notNull().references(() => users.id),
  booking_date: timestamp("booking_date").notNull(),
  participants: integer("participants").default(1).notNull(),
  total_cost: numeric("total_cost", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, confirmed, cancelled
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Activity budget proposals  
export const activityBudgetProposals = pgTable("activity_budget_proposals", {
  id: serial("id").primaryKey(),
  activity_id: integer("activity_id").notNull().references(() => activities.id),
  created_by: integer("created_by").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(), // e.g., "Pacote Econômico", "Experiência Premium"
  description: text("description"),
  price_type: varchar("price_type", { length: 50 }).default("per_person").notNull(), // per_person, per_group, fixed
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
  inclusions: json("inclusions").default("[]"), // What's included in this package
  exclusions: json("exclusions").default("[]"), // What's not included
  valid_until: timestamp("valid_until"), // Optional expiration date
  is_active: boolean("is_active").default(true).notNull(),
  votes: integer("votes").default(0).notNull(), // Community votes for this proposal
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Trip activities - linking trips to activities with specific proposals
export const tripActivities = pgTable("trip_activities", {
  id: serial("id").primaryKey(),
  trip_id: integer("trip_id").notNull().references(() => trips.id),
  activity_id: integer("activity_id").notNull().references(() => activities.id),
  budget_proposal_id: integer("budget_proposal_id").notNull().references(() => activityBudgetProposals.id),
  added_by: integer("added_by").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).default("proposed").notNull(), // proposed, confirmed, cancelled
  participants: integer("participants").default(1).notNull(),
  total_cost: numeric("total_cost", { precision: 10, scale: 2 }).notNull(),
  scheduled_date: timestamp("scheduled_date"), // When the activity is scheduled
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Referral codes for user invitations and verification
export const referralCodes = pgTable("referral_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // The referral code
  created_by: integer("created_by").references(() => users.id), // User who created it (null for system codes)
  type: varchar("type", { length: 50 }).default("user").notNull(), // user, system, beta, etc.
  max_uses: integer("max_uses"), // Maximum number of times it can be used (null = unlimited)
  current_uses: integer("current_uses").default(0).notNull(), // How many times it's been used
  is_active: boolean("is_active").default(true).notNull(),
  expires_at: timestamp("expires_at"), // Optional expiration date
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for form validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  averageRating: true,
  totalRatings: true,
  createdAt: true,
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  current_participants: true,
  created_at: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  sent_at: true,
});

export const insertTripRequestSchema = createInsertSchema(tripRequests).omit({
  id: true,
  created_at: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  created_at: true,
  settled_at: true,
});

export const insertExpenseSplitSchema = createInsertSchema(expenseSplits).omit({
  id: true,
  settled_at: true,
});

export const insertUserRatingSchema = createInsertSchema(userRatings).omit({
  id: true,
  is_hidden: true,
  report_count: true,
  created_at: true,
  updated_at: true,
});

export const insertDestinationRatingSchema = createInsertSchema(destinationRatings).omit({
  id: true,
  is_hidden: true,
  report_count: true,
  created_at: true,
  updated_at: true,
});

export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).omit({
  id: true,
  reviewed_by: true,
  reviewed_at: true,
  rejection_reason: true,
  created_at: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  average_rating: true,
  total_ratings: true,
  created_at: true,
  updated_at: true,
});

export const insertActivityReviewSchema = createInsertSchema(activityReviews).omit({
  id: true,
  helpful_votes: true,
  is_verified: true,
  is_hidden: true,
  report_count: true,
  created_at: true,
  updated_at: true,
});

export const insertActivityBookingSchema = createInsertSchema(activityBookings).omit({
  id: true,
  created_at: true,
});

export const insertActivityBudgetProposalSchema = createInsertSchema(activityBudgetProposals).omit({
  id: true,
  votes: true,
  created_at: true,
  updated_at: true,
});

export const insertTripActivitySchema = createInsertSchema(tripActivities).omit({
  id: true,
  created_at: true,
});

export const insertReferralCodeSchema = createInsertSchema(referralCodes).omit({
  id: true,
  current_uses: true,
  created_at: true,
});

// Select types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;

export type TripParticipant = typeof tripParticipants.$inferSelect;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type TripRequest = typeof tripRequests.$inferSelect;
export type InsertTripRequest = z.infer<typeof insertTripRequestSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type ExpenseSplit = typeof expenseSplits.$inferSelect;
export type InsertExpenseSplit = z.infer<typeof insertExpenseSplitSchema>;

export type UserRating = typeof userRatings.$inferSelect;
export type InsertUserRating = z.infer<typeof insertUserRatingSchema>;

export type DestinationRating = typeof destinationRatings.$inferSelect;
export type InsertDestinationRating = z.infer<typeof insertDestinationRatingSchema>;

export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type ActivityReview = typeof activityReviews.$inferSelect;
export type InsertActivityReview = z.infer<typeof insertActivityReviewSchema>;

export type ActivityBooking = typeof activityBookings.$inferSelect;
export type InsertActivityBooking = z.infer<typeof insertActivityBookingSchema>;

export type ActivityBudgetProposal = typeof activityBudgetProposals.$inferSelect;
export type InsertActivityBudgetProposal = z.infer<typeof insertActivityBudgetProposalSchema>;

export type TripActivity = typeof tripActivities.$inferSelect;
export type InsertTripActivity = z.infer<typeof insertTripActivitySchema>;

export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = z.infer<typeof insertReferralCodeSchema>;

export type Destination = typeof destinations.$inferSelect;

// PlannedActivity type for trip planning interface
export interface PlannedActivity {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  duration?: string;
  location?: string;
  cost?: number;
  category?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  participants?: string[];
  notes?: string;
  status?: "planned" | "confirmed" | "cancelled";
}

// Budget breakdown interface
export interface BudgetBreakdown {
  accommodation?: number;
  transport?: number;
  food?: number;
  activities?: number;
  shopping?: number;
  emergencies?: number;
  other?: number;
}

// Utility constants for frontend
export const activityCategories = [
  "adventure",
  "cultural", 
  "food_tours",
  "hiking",
  "nature",
  "pontos_turisticos",
  "water_sports",
  "wildlife"
];

export const budgetCategories = [
  "accommodation",
  "transport", 
  "food",
  "activities",
  "shopping", 
  "emergencies",
  "other"
];

export const expenseCategories = [
  "accommodation",
  "transport",
  "food", 
  "activities",
  "shopping",
  "other"
];

export const popularDestinations = [
  "Rio de Janeiro, RJ",
  "São Paulo, SP", 
  "Paris, França",
  "Londres, Reino Unido",
  "Nova York, EUA",
  "Roma, Itália",
  "Barcelona, Espanha",
  "Gramado, RS",
  "Bonito, MS",
  "Buenos Aires, Argentina"
];

// Insert schema for interests (simplified for compatibility)
export const insertInterestListSchema = createInsertSchema(users).pick({
  interests: true
});