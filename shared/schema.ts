import { pgTable, text, integer, boolean, timestamp, json, numeric, varchar, pgEnum, index, serial, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Destinations table - central repository for all locations/destinations
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Rio de Janeiro"
  state: varchar("state", { length: 255 }), // e.g., "RJ" 
  country: varchar("country", { length: 255 }).notNull(), // e.g., "Brasil"
  countryType: varchar("countryType", { length: 50 }).notNull(), // "nacional" or "internacional"
  region: varchar("region", { length: 255 }), // e.g., "Sudeste", "Europa"
  continent: varchar("continent", { length: 100 }).notNull(), // e.g., "América do Sul", "Europa", "Ásia"
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  timezone: varchar("timezone", { length: 50 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  bio: text("bio"),
  location: varchar("location", { length: 255 }),
  profilePhoto: text("profilePhoto"),
  languages: json("languages"),
  interests: json("interests"),
  travelStyles: json("travelStyles"), // User's travel style preferences (array)
  referredBy: varchar("referredBy", { length: 50 }), // Referral code used during registration
  isVerified: boolean("isVerified").default(false).notNull(), // User verification status
  verificationMethod: varchar("verificationMethod", { length: 50 }), // email, phone, document, etc.
  averageRating: numeric("averageRating", { precision: 3, scale: 2 }).default("5.00"), // Average rating from other users
  totalRatings: integer("totalRatings").default(0).notNull(), // Total number of ratings received
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  creatorId: integer("creatorId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  destinationId: integer("destinationId").notNull().references(() => destinations.id), // Reference to destinations table
  coverImage: text("coverImage"), // URL for trip cover image
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  budget: integer("budget"), // Now optional - total estimated budget
  budgetBreakdown: json("budgetBreakdown"), // JSON object with expense categories
  maxParticipants: integer("maxParticipants").notNull(),
  currentParticipants: integer("currentParticipants").default(1).notNull(),
  description: text("description").notNull(),
  travelStyle: varchar("travelStyle", { length: 100 }).notNull(),
  sharedCosts: json("sharedCosts"),
  plannedActivities: json("plannedActivities"), // Advanced activities with attachments, links, costs
  status: varchar("status", { length: 50 }).default("open").notNull(), // open, full, cancelled
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const tripParticipants = pgTable("tripParticipants", {
  id: serial("id").primaryKey(),
  tripId: integer("tripId").notNull().references(() => trips.id),
  userId: integer("userId").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, accepted, rejected
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  tripId: integer("tripId").notNull().references(() => trips.id),
  senderId: integer("senderId").notNull().references(() => users.id),
  content: text("content").notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export const tripRequests = pgTable("tripRequests", {
  id: serial("id").primaryKey(),
  tripId: integer("tripId").notNull().references(() => trips.id),
  userId: integer("userId").notNull().references(() => users.id),
  message: text("message"),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, accepted, rejected
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Expenses table for trip cost splitting
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  tripId: integer("tripId").notNull().references(() => trips.id),
  paidBy: integer("paidBy").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull().default("other"),
  receipt: text("receipt"), // URL or base64 encoded image
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  settledAt: timestamp("settledAt"),
});

// Expense splits - who owes what for each expense
export const expenseSplits = pgTable("expenseSplits", {
  id: serial("id").primaryKey(),
  expenseId: integer("expenseId").notNull().references(() => expenses.id),
  userId: integer("userId").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(), // How much this user owes for this expense
  paid: boolean("paid").default(false).notNull(),
  settledAt: timestamp("settledAt"),
});

// User ratings - for rating travel companions
export const userRatings = pgTable("userRatings", {
  id: serial("id").primaryKey(),
  tripId: integer("tripId").notNull().references(() => trips.id),
  ratedUserId: integer("ratedUserId").notNull().references(() => users.id), // User being rated
  raterUserId: integer("raterUserId").notNull().references(() => users.id), // User giving the rating
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"), // Optional comment
  isHidden: boolean("isHidden").default(false).notNull(), // Hidden if reported multiple times
  reportCount: integer("reportCount").default(0).notNull(), // Number of reports
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Destination ratings - for rating destinations  
export const destinationRatings = pgTable("destinationRatings", {
  id: serial("id").primaryKey(),
  destination: varchar("destination", { length: 255 }).notNull(), // Destination name
  userId: integer("userId").notNull().references(() => users.id), // User giving the rating
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"), // Optional comment
  isHidden: boolean("isHidden").default(false).notNull(), // Hidden if reported multiple times
  reportCount: integer("reportCount").default(0).notNull(), // Number of reports
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// User verification requests
export const verificationRequests = pgTable("verificationRequests", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // document, phone, social_media, etc.
  documentUrl: text("documentUrl"), // URL for uploaded document
  socialMediaProfile: text("socialMediaProfile"), // Social media profile URL
  phoneNumber: varchar("phoneNumber", { length: 20 }), // Phone number for verification
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, approved, rejected
  reviewedBy: integer("reviewedBy").references(() => users.id), // Admin who reviewed
  reviewedAt: timestamp("reviewedAt"), // When reviewed
  rejectionReason: text("rejectionReason"), // Reason for rejection if applicable
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Activities table for tourist activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  destinationId: integer("destinationId").notNull().references(() => destinations.id), // Reference to destinations table
  category: varchar("category", { length: 100 }).notNull(),
  difficultyLevel: varchar("difficultyLevel", { length: 50 }).default("medium").notNull(),
  duration: varchar("duration", { length: 50 }).notNull(), // e.g., "3 horas", "Dia inteiro"
  minParticipants: integer("minParticipants").default(1).notNull(),
  maxParticipants: integer("maxParticipants").default(50).notNull(),
  languages: json("languages").default("[]"), // Supported languages
  inclusions: json("inclusions").default("[]"), // What's included
  exclusions: json("exclusions").default("[]"), // What's not included
  requirements: json("requirements").default("[]"), // Requirements for participation
  cancellationPolicy: text("cancellationPolicy").default("Cancelamento gratuito até 24h antes"), // Cancellation policy
  contactInfo: json("contactInfo").default("{}"), // Contact information
  coverImage: text("coverImage"), // Main image URL
  images: json("images").default("[]"), // Additional images
  averageRating: numeric("averageRating", { precision: 3, scale: 2 }).default("0.00"),
  totalRatings: integer("totalRatings").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdById: integer("createdById").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Activity reviews
export const activityReviews = pgTable("activityReviews", {
  id: serial("id").primaryKey(),
  activityId: integer("activityId").notNull().references(() => activities.id),
  userId: integer("userId").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  photos: json("photos").default("[]"), // Array of photo URLs
  visitDate: timestamp("visitDate"), // When the user visited
  helpfulVotes: integer("helpfulVotes").default(0).notNull(), // How many users found this helpful
  isVerified: boolean("isVerified").default(false).notNull(), // Verified review badge
  isHidden: boolean("isHidden").default(false).notNull(), // Hidden if reported multiple times
  reportCount: integer("reportCount").default(0).notNull(), // Number of reports
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  uniqueReview: unique().on(table.activityId, table.userId), // One review per user per activity
}));

// Activity bookings
export const activityBookings = pgTable("activityBookings", {
  id: serial("id").primaryKey(),
  activityId: integer("activityId").notNull().references(() => activities.id),
  userId: integer("userId").notNull().references(() => users.id),
  bookingDate: timestamp("bookingDate").notNull(),
  participants: integer("participants").default(1).notNull(),
  totalCost: numeric("totalCost", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, confirmed, cancelled
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Activity budget proposals  
export const activityBudgetProposals = pgTable("activityBudgetProposals", {
  id: serial("id").primaryKey(),
  activityId: integer("activityId").notNull().references(() => activities.id),
  createdBy: integer("createdBy").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(), // e.g., "Pacote Econômico", "Experiência Premium"
  description: text("description"),
  priceType: varchar("priceType", { length: 50 }).default("per_person").notNull(), // per_person, per_group, fixed
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
  inclusions: json("inclusions").default("[]"), // What's included in this package
  exclusions: json("exclusions").default("[]"), // What's not included
  validUntil: timestamp("validUntil"), // Optional expiration date
  isActive: boolean("isActive").default(true).notNull(),
  votes: integer("votes").default(0).notNull(), // Community votes for this proposal
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Trip activities - linking trips to activities with specific proposals
export const tripActivities = pgTable("tripActivities", {
  id: serial("id").primaryKey(),
  tripId: integer("tripId").notNull().references(() => trips.id),
  activityId: integer("activityId").notNull().references(() => activities.id),
  budgetProposalId: integer("budgetProposalId").notNull().references(() => activityBudgetProposals.id),
  addedBy: integer("addedBy").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).default("proposed").notNull(), // proposed, confirmed, cancelled
  participants: integer("participants").default(1).notNull(),
  totalCost: numeric("totalCost", { precision: 10, scale: 2 }).notNull(),
  scheduledDate: timestamp("scheduledDate"), // When the activity is scheduled
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Referral codes for user invitations and verification
export const referralCodes = pgTable("referralCodes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // The referral code
  createdBy: integer("createdBy").references(() => users.id), // User who created it (null for system codes)
  type: varchar("type", { length: 50 }).default("user").notNull(), // user, system, beta, etc.
  maxUses: integer("maxUses"), // Maximum number of times it can be used (null = unlimited)
  currentUses: integer("currentUses").default(0).notNull(), // How many times it's been used
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"), // Optional expiration date
  createdAt: timestamp("createdAt").defaultNow().notNull(),
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
  currentParticipants: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  sentAt: true,
});

export const insertTripRequestSchema = createInsertSchema(tripRequests).omit({
  id: true,
  createdAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  settledAt: true,
});

export const insertExpenseSplitSchema = createInsertSchema(expenseSplits).omit({
  id: true,
  settledAt: true,
});

export const insertUserRatingSchema = createInsertSchema(userRatings).omit({
  id: true,
  isHidden: true,
  reportCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDestinationRatingSchema = createInsertSchema(destinationRatings).omit({
  id: true,
  isHidden: true,
  reportCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).omit({
  id: true,
  reviewedBy: true,
  reviewedAt: true,
  rejectionReason: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  averageRating: true,
  totalRatings: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityReviewSchema = createInsertSchema(activityReviews).omit({
  id: true,
  helpfulVotes: true,
  isVerified: true,
  isHidden: true,
  reportCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityBookingSchema = createInsertSchema(activityBookings).omit({
  id: true,
  createdAt: true,
});

export const insertActivityBudgetProposalSchema = createInsertSchema(activityBudgetProposals).omit({
  id: true,
  votes: true,
  createdAt: true,
  updatedAt: true,
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