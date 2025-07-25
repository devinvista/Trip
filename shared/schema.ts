import { mysqlTable, text, int, boolean, timestamp, json, decimal, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Cities table - central repository for all locations/destinations
export const cities = mysqlTable("cities", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Rio de Janeiro"
  state: varchar("state", { length: 255 }), // e.g., "RJ" 
  country: varchar("country", { length: 255 }).notNull(), // e.g., "Brasil"
  countryType: varchar("country_type", { length: 50 }).notNull(), // "nacional" or "internacional"
  region: varchar("region", { length: 255 }), // e.g., "Sudeste", "Europa"
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  timezone: varchar("timezone", { length: 50 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
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
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("5.00"), // Average rating from other users
  totalRatings: int("total_ratings").default(0).notNull(), // Total number of ratings received
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trips = mysqlTable("trips", {
  id: int("id").primaryKey().autoincrement(),
  creatorId: int("creator_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  cityId: int("city_id").notNull().references(() => cities.id), // Reference to cities table
  coverImage: text("cover_image"), // URL for trip cover image
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  budget: int("budget"), // Now optional - total estimated budget
  budgetBreakdown: json("budget_breakdown"), // JSON object with expense categories
  maxParticipants: int("max_participants").notNull(),
  currentParticipants: int("current_participants").default(1).notNull(),
  description: text("description").notNull(),
  travelStyle: varchar("travel_style", { length: 100 }).notNull(),
  sharedCosts: json("shared_costs"),
  plannedActivities: json("planned_activities"), // Advanced activities with attachments, links, costs
  status: varchar("status", { length: 50 }).default("open").notNull(), // open, full, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tripParticipants = mysqlTable("trip_participants", {
  id: int("id").primaryKey().autoincrement(),
  tripId: int("trip_id").notNull().references(() => trips.id),
  userId: int("user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, accepted, rejected
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const messages = mysqlTable("messages", {
  id: int("id").primaryKey().autoincrement(),
  tripId: int("trip_id").notNull().references(() => trips.id),
  senderId: int("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const tripRequests = mysqlTable("trip_requests", {
  id: int("id").primaryKey().autoincrement(),
  tripId: int("trip_id").notNull().references(() => trips.id),
  userId: int("user_id").notNull().references(() => users.id),
  message: text("message"),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expenses table for trip cost splitting
export const expenses = mysqlTable("expenses", {
  id: int("id").primaryKey().autoincrement(),
  tripId: int("trip_id").notNull().references(() => trips.id),
  paidBy: int("paid_by").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull().default("other"),
  receipt: text("receipt"), // URL or base64 encoded image
  createdAt: timestamp("created_at").defaultNow().notNull(),
  settledAt: timestamp("settled_at"),
});

// Expense splits - who owes what for each expense
export const expenseSplits = mysqlTable("expense_splits", {
  id: int("id").primaryKey().autoincrement(),
  expenseId: int("expense_id").notNull().references(() => expenses.id),
  userId: int("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // How much this user owes for this expense
  paid: boolean("paid").default(false).notNull(),
  settledAt: timestamp("settled_at"),
});

// User ratings - for rating travel companions
export const userRatings = mysqlTable("user_ratings", {
  id: int("id").primaryKey().autoincrement(),
  tripId: int("trip_id").notNull().references(() => trips.id),
  ratedUserId: int("rated_user_id").notNull().references(() => users.id), // User being rated
  raterUserId: int("rater_user_id").notNull().references(() => users.id), // User giving the rating
  rating: int("rating").notNull(), // 1-5 stars
  comment: text("comment"), // Optional comment
  isHidden: boolean("is_hidden").default(false).notNull(), // Hidden if reported multiple times
  reportCount: int("report_count").default(0).notNull(), // Number of reports
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// City ratings - for rating cities/destinations  
export const cityRatings = mysqlTable("city_ratings", {
  id: int("id").primaryKey().autoincrement(),
  cityId: int("city_id").notNull().references(() => cities.id), // Reference to cities table
  userId: int("user_id").notNull().references(() => users.id), // User who rated
  tripId: int("trip_id").references(() => trips.id), // Optional: trip this rating is from
  rating: int("rating").notNull(), // 1-5 stars
  comment: text("comment"), // Optional comment
  photos: json("photos"), // Array of photo URLs
  visitDate: timestamp("visit_date"), // When they visited
  isHidden: boolean("is_hidden").default(false).notNull(), // Hidden if reported multiple times
  reportCount: int("report_count").default(0).notNull(), // Number of reports
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User verification requests
export const verificationRequests = mysqlTable("verification_requests", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  verificationType: varchar("verification_type", { length: 100 }).notNull(), // email, phone, document, social_media
  verificationData: json("verification_data"), // Store verification info (phone, document images, etc.)
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, approved, rejected
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: int("reviewed_by").references(() => users.id), // Admin who reviewed
  rejectionReason: text("rejection_reason"), // If rejected, why
});

// Rating reports - for reporting inappropriate reviews
export const ratingReports = mysqlTable("rating_reports", {
  id: int("id").primaryKey().autoincrement(),
  reporterId: int("reporter_id").notNull().references(() => users.id), // User who reported
  ratingType: varchar("rating_type", { length: 50 }).notNull(), // 'user', 'localidade', 'activity'
  ratingId: int("rating_id").notNull(), // ID of the rating being reported
  reason: varchar("reason", { length: 100 }).notNull(), // 'offensive', 'spam', 'inappropriate', 'fake'
  description: text("description"), // Optional detailed description
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, reviewed, dismissed
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: int("reviewed_by").references(() => users.id), // Admin who reviewed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity rating helpful votes - track who found reviews helpful
export const activityRatingHelpfulVotes = mysqlTable("activity_rating_helpful_votes", {
  id: int("id").primaryKey().autoincrement(),
  reviewId: int("review_id").notNull().references(() => activityReviews.id),
  userId: int("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Interest list table for users without valid referral codes
export const interestList = mysqlTable("interest_list", {
  id: int("id").primaryKey().autoincrement(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  referralCode: varchar("referral_code", { length: 50 }), // Invalid code they tried to use
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, contacted, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Referral codes table to manage valid invitation codes
export const referralCodes = mysqlTable("referral_codes", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  createdBy: int("created_by").references(() => users.id),
  maxUses: int("max_uses").default(1).notNull(),
  currentUses: int("current_uses").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  phone: true,
  bio: true,
  location: true,
  languages: true,
  interests: true,
  travelStyles: true,
}).extend({
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos").max(20, "Telefone deve ter no máximo 20 dígitos"),
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  creatorId: true,
  currentParticipants: true,
  status: true,
  createdAt: true,
}).extend({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  budget: z.number().optional(),
  coverImage: z.string().optional(),
  budgetBreakdown: z.object({
    transport: z.number().optional(),
    accommodation: z.number().optional(),
    food: z.number().optional(),
    activities: z.number().optional(),
    shopping: z.number().optional(),
    insurance: z.number().optional(),
    visas: z.number().optional(),
    other: z.number().optional(),
  }).optional(),
  startDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
  endDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  senderId: true,
  sentAt: true,
});

export const insertTripRequestSchema = createInsertSchema(tripRequests).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
});

export const insertRatingReportSchema = createInsertSchema(ratingReports).omit({
  id: true,
  reporterId: true,
  status: true,
  reviewedAt: true,
  reviewedBy: true,
  createdAt: true,
}).extend({
  reason: z.enum(["offensive", "spam", "inappropriate", "fake"], {
    errorMap: () => ({ message: "Motivo inválido" })
  }),
  description: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;
export type TripParticipant = typeof tripParticipants.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type TripRequest = typeof tripRequests.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertTripRequest = z.infer<typeof insertTripRequestSchema>;

// City types
export type City = typeof cities.$inferSelect;
export type InsertCity = typeof cities.$inferInsert;
export type CityRating = typeof cityRatings.$inferSelect;

// Expense types
export type Expense = typeof expenses.$inferSelect;
export type ExpenseSplit = typeof expenseSplits.$inferSelect;

// Insert schemas for expenses
export const insertExpenseSchema = z.object({
  tripId: z.number(),
  amount: z.number().positive("O valor deve ser positivo"),
  description: z.string().min(1, "Descrição é obrigatória"),
  category: z.string().default("other"),
  receipt: z.string().nullable().optional(),
});

export const insertExpenseSplitSchema = createInsertSchema(expenseSplits).omit({
  id: true,
  settledAt: true,
}).extend({
  amount: z.number().positive("O valor deve ser positivo"),
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertExpenseSplit = z.infer<typeof insertExpenseSplitSchema>;

// Interest list schema and types
export const insertInterestListSchema = createInsertSchema(interestList, {
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
}).omit({ 
  id: true, 
  createdAt: true,
  status: true
});

export type InterestList = typeof interestList.$inferSelect;
export type InsertInterestList = z.infer<typeof insertInterestListSchema>;
export type ReferralCode = typeof referralCodes.$inferSelect;

// Rating types
export type UserRating = typeof userRatings.$inferSelect;
export type VerificationRequest = typeof verificationRequests.$inferSelect;

// Rating insert schemas (updated for enhanced system)
export const insertUserRatingSchema = createInsertSchema(userRatings).omit({
  id: true,
  raterUserId: true,
  isHidden: true,
  reportCount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  rating: z.number().min(1, "Avaliação deve ser entre 1 e 5 estrelas").max(5, "Avaliação deve ser entre 1 e 5 estrelas"),
  comment: z.string().optional(),
  categories: z.object({
    reliability: z.number().min(1).max(5).optional(),
    friendliness: z.number().min(1).max(5).optional(),
    communication: z.number().min(1).max(5).optional(),
    punctuality: z.number().min(1).max(5).optional(),
    helpfulness: z.number().min(1).max(5).optional(),
  }).optional(),
});

export const insertCityRatingSchema = createInsertSchema(cityRatings).omit({
  id: true,
  userId: true,
  isHidden: true,
  reportCount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  rating: z.number().min(1, "Avaliação deve ser entre 1 e 5 estrelas").max(5, "Avaliação deve ser entre 1 e 5 estrelas"),
  comment: z.string().optional(),
  categories: z.object({
    attractions: z.number().min(1).max(5).optional(),
    food: z.number().min(1).max(5).optional(),
    safety: z.number().min(1).max(5).optional(),
    value: z.number().min(1).max(5).optional(),
    transportation: z.number().min(1).max(5).optional(),
    nightlife: z.number().min(1).max(5).optional(),
  }).optional(),
  photos: z.array(z.string()).optional(),
  visitDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
  reviewedBy: true,
  status: true,
});

export type InsertUserRating = z.infer<typeof insertUserRatingSchema>;
export type InsertCityRating = z.infer<typeof insertCityRatingSchema>;
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type InsertRatingReport = z.infer<typeof insertRatingReportSchema>;
export type RatingReport = typeof ratingReports.$inferSelect;
export type ActivityRatingHelpfulVote = typeof activityRatingHelpfulVotes.$inferSelect;

// Activities System - TripAdvisor-style activities
export const activities = mysqlTable("activities", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  cityId: int("city_id").notNull().references(() => cities.id), // Reference to cities table
  category: varchar("category", { length: 100 }).notNull(), // sightseeing, food, adventure, culture, etc.
  priceType: varchar("price_type", { length: 50 }).notNull().default("per_person"), // per_person, per_group, free
  priceAmount: decimal("price_amount", { precision: 10, scale: 2 }), // null for free activities
  duration: varchar("duration", { length: 100 }), // "2 hours", "full day", etc.
  difficultyLevel: varchar("difficulty_level", { length: 50 }).default("easy"), // easy, moderate, challenging
  minParticipants: int("min_participants").default(1).notNull(),
  maxParticipants: int("max_participants"),
  languages: json("languages"), // Available languages
  inclusions: json("inclusions"), // What's included
  exclusions: json("exclusions"), // What's not included
  requirements: json("requirements"), // Age restrictions, fitness level, etc.
  cancellationPolicy: text("cancellation_policy"),
  contactInfo: json("contact_info"), // { email, phone, website, whatsapp }
  images: json("images"), // Array of image URLs
  coverImage: text("cover_image").notNull(), // Main image
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0.00"),
  totalRatings: int("total_ratings").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdById: int("created_by_id").references(() => users.id), // Who added this activity
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activity Reviews/Ratings
export const activityReviews = mysqlTable("activity_reviews", {
  id: int("id").primaryKey().autoincrement(),
  activityId: int("activity_id").notNull().references(() => activities.id),
  userId: int("user_id").notNull().references(() => users.id),
  rating: int("rating").notNull(), // 1-5 stars
  review: text("review"), // Optional review text
  photos: json("photos"), // Optional review photos
  visitDate: timestamp("visit_date"), // When they participated
  helpfulVotes: int("helpful_votes").default(0).notNull(), // How many found this helpful
  isVerified: boolean("is_verified").default(false).notNull(), // Verified purchase/participation
  isHidden: boolean("is_hidden").default(false).notNull(), // Hidden if reported multiple times
  reportCount: int("report_count").default(0).notNull(), // Number of reports
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activity Budget Proposals - Multiple budget options per activity
export const activityBudgetProposals = mysqlTable("activity_budget_proposals", {
  id: int("id").primaryKey().autoincrement(),
  activityId: int("activity_id").notNull().references(() => activities.id),
  createdBy: int("created_by").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(), // "Opção Básica", "Pacote Premium", etc.
  description: text("description"), // Description of what's included
  priceType: varchar("price_type", { length: 50 }).notNull().default("per_person"), // per_person, per_group
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("BRL").notNull(),
  inclusions: json("inclusions"), // What's included in this proposal
  exclusions: json("exclusions"), // What's not included
  validUntil: timestamp("valid_until"), // Optional expiry date
  isActive: boolean("is_active").default(true).notNull(),
  votes: int("votes").default(0).notNull(), // Community votes for this proposal
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activity Budget Proposal Votes - Track user votes on proposals
export const activityBudgetProposalVotes = mysqlTable("activity_budget_proposal_votes", {
  id: int("id").primaryKey().autoincrement(),
  proposalId: int("proposal_id").notNull().references(() => activityBudgetProposals.id),
  userId: int("user_id").notNull().references(() => users.id),
  activityId: int("activity_id").notNull().references(() => activities.id),
  voteType: varchar("vote_type", { length: 10 }).notNull(), // "up" or "down"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Trip Activities - Links activities to trips with selected budget proposal
export const tripActivities = mysqlTable("trip_activities", {
  id: int("id").primaryKey().autoincrement(),
  tripId: int("trip_id").notNull().references(() => trips.id),
  activityId: int("activity_id").notNull().references(() => activities.id),
  budgetProposalId: int("budget_proposal_id").notNull().references(() => activityBudgetProposals.id),
  addedBy: int("added_by").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).default("proposed").notNull(), // proposed, approved, rejected
  participants: int("participants").notNull().default(1),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  scheduledDate: timestamp("scheduled_date"), // When in the trip this activity is scheduled
  notes: text("notes"), // Additional notes about this activity for the trip
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity Bookings/Reservations
export const activityBookings = mysqlTable("activity_bookings", {
  id: int("id").primaryKey().autoincrement(),
  activityId: int("activity_id").notNull().references(() => activities.id),
  userId: int("user_id").notNull().references(() => users.id),
  tripId: int("trip_id").references(() => trips.id), // Optional: if booked for a specific trip
  participants: int("participants").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  bookingDate: timestamp("booking_date").notNull(), // When activity will happen
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, confirmed, cancelled, completed
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity types and schemas
export type Activity = typeof activities.$inferSelect;
export type ActivityReview = typeof activityReviews.$inferSelect;
export type ActivityBooking = typeof activityBookings.$inferSelect;
export type ActivityBudgetProposal = typeof activityBudgetProposals.$inferSelect;
export type ActivityBudgetProposalVote = typeof activityBudgetProposalVotes.$inferSelect;
export type TripActivity = typeof tripActivities.$inferSelect;

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  averageRating: true,
  totalRatings: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityReviewSchema = createInsertSchema(activityReviews).omit({
  id: true,
  userId: true,
  helpfulVotes: true,
  isVerified: true,
  createdAt: true,
}).extend({
  activityId: z.number().positive("ID da atividade é obrigatório"),
  rating: z.number().min(1, "Avaliação deve ser entre 1 e 5 estrelas").max(5, "Avaliação deve ser entre 1 e 5 estrelas"),
  review: z.string().optional().or(z.literal("")),
  photos: z.array(z.string()).optional(),
  visitDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export const insertActivityBookingSchema = createInsertSchema(activityBookings).omit({
  id: true,
  status: true,
  createdAt: true,
}).extend({
  participants: z.number().min(1),
  totalAmount: z.number().positive(),
});

export const insertActivityBudgetProposalSchema = createInsertSchema(activityBudgetProposals).omit({
  id: true,
  activityId: true,
  createdBy: true,
  votes: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.number().positive("Valor deve ser positivo"),
  title: z.string().min(1, "Título é obrigatório"),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
});

export const insertTripActivitySchema = createInsertSchema(tripActivities).omit({
  id: true,
  tripId: true,
  addedBy: true,
  status: true,
  createdAt: true,
}).extend({
  participants: z.number().min(1),
  totalCost: z.number().positive(),
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertActivityReview = z.infer<typeof insertActivityReviewSchema>;
export type InsertActivityBooking = z.infer<typeof insertActivityBookingSchema>;
export type InsertActivityBudgetProposal = z.infer<typeof insertActivityBudgetProposalSchema>;
export type InsertTripActivity = z.infer<typeof insertTripActivitySchema>;

// Budget breakdown interface (simplified for budget base)
export interface BudgetBreakdown {
  transport?: number;
  accommodation?: number;
  food?: number;
  insurance?: number;
  medical?: number;
  other?: number;
}

// Advanced planned activity interface
export interface PlannedActivity {
  id: string;
  title: string;
  description?: string;
  estimatedCost?: number;
  priority: 'high' | 'medium' | 'low';
  category: 'sightseeing' | 'food' | 'adventure' | 'culture' | 'relaxation' | 'nightlife' | 'shopping' | 'other';
  duration?: string; // e.g., "2 hours", "full day"
  links?: string[]; // URLs for reference
  attachments?: Array<{
    name: string;
    url: string;
    type: 'image' | 'document' | 'video' | 'other';
  }>;
  notes?: string;
  completed?: boolean;
  scheduledDate?: string; // ISO date string
  location?: string;
  status?: string; // Add status property for compatibility
  createdAt: string;
}

// Activity categories with labels and icons (standardized across app)
export const activityCategories = {
  sightseeing: { label: "Pontos Turísticos", icon: "🏛️" },
  adventure: { label: "Aventura", icon: "🏔️" },
  culture: { label: "Cultura", icon: "🎨" },
  food: { label: "Gastronomia", icon: "🍽️" },
  shopping: { label: "Compras", icon: "🛍️" },
  nature: { label: "Natureza", icon: "🌲" },
  nightlife: { label: "Vida Noturna", icon: "🌙" },
  wellness: { label: "Bem-estar", icon: "🧘" },
  other: { label: "Outros", icon: "📋" }
} as const;

// Expense category labels (same as budget categories but includes activities)
export const expenseCategories = {
  transport: "Transporte",
  accommodation: "Hospedagem",
  food: "Alimentação",
  activities: "Atividades",
  insurance: "Seguro e Documentos (Seguros, Vistos)",
  medical: "Saúde e Emergências",
  other: "Outros"
} as const;

// Budget categories (for budget breakdown - excludes activities)
export const budgetCategories = {
  transport: "Transporte",
  accommodation: "Hospedagem",
  food: "Alimentação",
  insurance: "Seguro e Documentos (Seguros, Vistos)",
  medical: "Saúde e Emergências",
  other: "Outros"
} as const;

// Popular destinations in Brazil with cover images
export const popularDestinations = {
  // Beach destinations
  "Rio de Janeiro, RJ": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "praia",
    description: "Cidade maravilhosa com praias icônicas e Cristo Redentor"
  },
  "Florianópolis, SC": {
    image: "https://images.unsplash.com/photo-1544963150-889d45c4e2f8?w=800&q=80",
    category: "praia",
    description: "Ilha da Magia com praias paradisíacas"
  },
  "Salvador, BA": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "praia",
    description: "Capital baiana com cultura rica e praias belíssimas"
  },
  "Maceió, AL": {
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    category: "praia",
    description: "Paraíso tropical com águas cristalinas"
  },
  "Natal, RN": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "praia",
    description: "Cidade do sol com dunas e praias espetaculares"
  },
  "Fortaleza, CE": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "praia",
    description: "Litoral cearense com praias urbanas e vida noturna"
  },
  "Recife, PE": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "praia",
    description: "Veneza brasileira com cultura pernambucana"
  },
  "Búzios, RJ": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "praia",
    description: "Península charmosa com praias exclusivas"
  },
  "Ilhéus, BA": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "praia",
    description: "Terra de Jorge Amado com praias e cacau"
  },
  "Ubatuba, SP": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "praia",
    description: "Litoral norte paulista com praias selvagens"
  },

  // Mountain destinations
  "Campos do Jordão, SP": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "neve",
    description: "Suíça brasileira com clima de montanha"
  },
  "Gramado, RS": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "neve",
    description: "Cidade encantadora com arquitetura europeia"
  },
  "Canela, RS": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "neve",
    description: "Serra gaúcha com natureza exuberante"
  },
  "Monte Verde, MG": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "neve",
    description: "Vila de montanha com clima europeu"
  },
  "Penedo, RJ": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "neve",
    description: "Pequena Finlândia brasileira"
  },

  // Nature and ecotourism
  "Chapada Diamantina, BA": {
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    category: "natureza",
    description: "Paraíso natural com cachoeiras e trilhas"
  },
  "Pantanal, MT": {
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    category: "natureza",
    description: "Maior planície alagável do mundo"
  },
  "Amazônia, AM": {
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    category: "natureza",
    description: "Floresta tropical com biodiversidade única"
  },
  "Chapada dos Veadeiros, GO": {
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    category: "natureza",
    description: "Cerrado brasileiro com formações rochosas"
  },
  "Bonito, MS": {
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    category: "natureza",
    description: "Ecoturismo com rios cristalinos"
  },
  "Jalapão, TO": {
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    category: "natureza",
    description: "Oásis no cerrado com dunas douradas"
  },

  // Cultural and historical
  "Ouro Preto, MG": {
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    category: "culturais",
    description: "Patrimônio histórico com arquitetura colonial"
  },
  "Paraty, RJ": {
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    category: "culturais",
    description: "Cidade histórica com centro preservado"
  },
  "Tiradentes, MG": {
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    category: "culturais",
    description: "Charme colonial mineiro"
  },
  "São Luís, MA": {
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    category: "culturais",
    description: "Patrimônio da UNESCO com azulejos portugueses"
  },
  "Diamantina, MG": {
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    category: "culturais",
    description: "Berço de JK com arquitetura barroca"
  },

  // Adventure destinations
  "Brotas, SP": {
    image: "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80",
    category: "aventura",
    description: "Capital do ecoturismo radical"
  },
  "Socorro, SP": {
    image: "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80",
    category: "aventura",
    description: "Aventura com rafting e rapel"
  },
  "Capitólio, MG": {
    image: "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80",
    category: "aventura",
    description: "Mar de Minas com cânions e cachoeiras"
  },
  "Arraial do Cabo, RJ": {
    image: "https://images.unsplash.com/photo-1464822759844-d150065c7fb5?w=800&q=80",
    category: "aventura",
    description: "Caribe brasileiro com mergulho"
  },

  // Theme parks and urban
  "Orlando, FL": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "parques",
    description: "Capital mundial dos parques temáticos"
  },
  "São Paulo, SP": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "urbanas",
    description: "Metrópole com gastronomia e cultura"
  },
  "Brasília, DF": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "urbanas",
    description: "Capital federal com arquitetura modernista"
  },
  "Belo Horizonte, MG": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "urbanas",
    description: "Cidade planejada com vida cultural intensa"
  },
  "Curitiba, PR": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "urbanas",
    description: "Modelo de sustentabilidade urbana"
  },
  "Porto Alegre, RS": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "urbanas",
    description: "Capital gaúcha com tradição e modernidade"
  },

  // DESTINOS INTERNACIONAIS
  
  // Europa - Cidades Urbanas
  "Londres, Reino Unido": {
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    category: "urbanas",
    description: "Capital britânica com Big Ben e Tower Bridge"
  },
  "Paris, França": {
    image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&q=80",
    category: "urbanas",
    description: "Cidade Luz com Torre Eiffel e Louvre"
  },
  "Roma, Itália": {
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    category: "cultural",
    description: "Cidade Eterna com Coliseu e Vaticano"
  },
  "Tóquio, Japão": {
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    category: "urbanas",
    description: "Shibuya Crossing e cultura pop"
  },
  "Barcelona, Espanha": {
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
    category: "urbanas",
    description: "Arte moderna com Sagrada Família e Park Güell"
  },
  "Amsterdam, Holanda": {
    image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80",
    category: "urbanas",
    description: "Canais históricos e cultura liberal"
  },
  "Berlim, Alemanha": {
    image: "https://images.unsplash.com/photo-1560930950-5cc20e80e392?w=800&q=80",
    category: "cultural",
    description: "História moderna e vida noturna vibrante"
  },
  "Praga, República Tcheca": {
    image: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80",
    category: "cultural",
    description: "Cidade de contos de fadas no coração da Europa"
  },
  "Viena, Áustria": {
    image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&q=80",
    category: "cultural",
    description: "Capital da música clássica e arquitetura imperial"
  },
  "Budapeste, Hungria": {
    image: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80",
    category: "cultural",
    description: "Pérola do Danúbio com termas históricas"
  },
  "Zurich, Suíça": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "neve",
    description: "Cidade alpina com qualidade de vida excepcional"
  },
  "Estocolmo, Suécia": {
    image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&q=80",
    category: "urbanas",
    description: "Veneza do Norte com design escandinavo"
  },
  "Copenhague, Dinamarca": {
    image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&q=80",
    category: "urbanas",
    description: "Cidade hygge com arquitetura contemporânea"
  },

  // América do Norte
  "Nova York, EUA": {
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    category: "urbanas",
    description: "Times Square, Central Park e Estátua da Liberdade"
  },
  "Los Angeles, EUA": {
    image: "https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=800&q=80",
    category: "urbanas",
    description: "Hollywood, Beverly Hills e praias de Malibu"
  },
  "Las Vegas, EUA": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "urbanas",
    description: "Capital mundial dos cassinos e shows"
  },
  "San Francisco, EUA": {
    image: "https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=800&q=80",
    category: "urbanas",
    description: "Cidade das colinas e tecnologia"
  },
  "Chicago, EUA": {
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
    category: "urbanas",
    description: "Cidade dos ventos com arquitetura icônica"
  },
  "Miami, EUA": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "praia",
    description: "Praias de South Beach e vida noturna"
  },
  "Toronto, Canadá": {
    image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&q=80",
    category: "urbanas",
    description: "Metrópole multicultural canadense"
  },
  "Vancouver, Canadá": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "natureza",
    description: "Cidade costeira entre montanhas e oceano"
  },
  "Cidade do México, México": {
    image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80",
    category: "cultural",
    description: "Metrópole com rica herança asteca"
  },
  "Cancún, México": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "praia",
    description: "Riviera Maya com praias paradisíacas"
  },

  // América do Sul
  "Buenos Aires, Argentina": {
    image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80",
    category: "urbanas",
    description: "Tango em San Telmo e arquitetura europeia"
  },
  "Bariloche, Argentina": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "neve",
    description: "Cerro Catedral e Lago Nahuel Huapi"
  },
  "Santiago, Chile": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "urbanas",
    description: "Capital chilena cercada pelos Andes"
  },
  "Valparaíso, Chile": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "cultural",
    description: "Porto histórico com arte de rua vibrante"
  },
  "Lima, Peru": {
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    category: "cultural",
    description: "Capital gastronômica da América do Sul"
  },
  "Cusco, Peru": {
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    category: "cultural",
    description: "Portal para Machu Picchu e cultura inca"
  },
  "Machu Picchu, Peru": {
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    category: "aventura",
    description: "Cidadela inca nas montanhas dos Andes"
  },
  "Quito, Equador": {
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    category: "cultural",
    description: "Centro histórico patrimônio da UNESCO"
  },
  "Bogotá, Colômbia": {
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    category: "urbanas",
    description: "Capital colombiana com rica vida cultural"
  },
  "Cartagena, Colômbia": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "cultural",
    description: "Cidade colonial murada no Caribe"
  },
  "Montevidéu, Uruguai": {
    image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80",
    category: "urbanas",
    description: "Capital uruguaia com charme portenho"
  },
  "La Paz, Bolívia": {
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    category: "cultural",
    description: "Capital mais alta do mundo nos Andes"
  },

  // Ásia (removendo duplicatas)
  "Kyoto, Japão": {
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    category: "cultural",
    description: "Templo Dourado e distrito de Gion"
  },
  "Pequim, China": {
    image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
    category: "cultural",
    description: "Capital chinesa com a Grande Muralha"
  },
  "Xangai, China": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "urbanas",
    description: "Metrópole moderna com skyline impressionante"
  },
  "Hong Kong": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "urbanas",
    description: "Cidade cosmopolita entre Oriente e Ocidente"
  },
  "Singapura": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "urbanas",
    description: "Cidade-estado com arquitetura futurista"
  },
  "Bangkok, Tailândia": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "urbanas",
    description: "Capital do sorriso com templos dourados"
  },
  "Phuket, Tailândia": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "praia",
    description: "Praias paradisíacas e vida noturna asiática"
  },
  "Bali, Indonésia": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "praia",
    description: "Ilha dos deuses com praias e cultura hindu"
  },
  "Kuala Lumpur, Malásia": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "urbanas",
    description: "Torres Petronas e diversidade cultural"
  },
  "Seul, Coreia do Sul": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "urbanas",
    description: "Capital do K-pop e tecnologia avançada"
  },
  "Mumbai, Índia": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "urbanas",
    description: "Bollywood e contrastes urbanos indianos"
  },
  "Nova Déli, Índia": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "cultural",
    description: "Capital indiana com patrimônio mogol"
  },
  "Istambul, Turquia": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "cultural",
    description: "Ponte entre Europa e Ásia com história otomana"
  },
  "Dubai, Emirados Árabes": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "urbanas",
    description: "Burj Khalifa, Palm Jumeirah e Dubai Mall"
  },
  "Tel Aviv, Israel": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "urbanas",
    description: "Cidade costeira com vida noturna e inovação"
  },

  // África
  "Cairo, Egito": {
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a73?w=800&q=80",
    category: "cultural",
    description: "Pirâmides de Gizé, Esfinge e Museu Egípcio"
  },
  "Marrakech, Marrocos": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "cultural",
    description: "Cidade imperial com souks e cultura berber"
  },
  "Cidade do Cabo, África do Sul": {
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80",
    category: "natureza",
    description: "Beleza natural com Table Mountain e vinícolas"
  },
  "Joanesburgo, África do Sul": {
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80",
    category: "urbanas",
    description: "Cidade do ouro com história do apartheid"
  },
  "Nairóbi, Quênia": {
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80",
    category: "aventura",
    description: "Portal para safáris no coração da África"
  },

  // Oceania
  "Sydney, Austrália": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "urbanas",
    description: "Ópera House icônica e praias urbanas"
  },
  "Melbourne, Austrália": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "urbanas",
    description: "Capital cultural australiana com café e arte"
  },
  "Auckland, Nova Zelândia": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "natureza",
    description: "Cidade dos veleiros com paisagens épicas"
  },
  "Queenstown, Nova Zelândia": {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "aventura",
    description: "Capital mundial dos esportes radicais"
  },
  "Fiji": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "praia",
    description: "Ilhas paradisíacas com águas cristalinas"
  },
  "Tahiti, Polinésia Francesa": {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "praia",
    description: "Paraíso tropical com bangalôs sobre a água"
  },

  // Destinos de cruzeiro
  "Mediterrâneo": {
    image: "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg",
    category: "cruzeiros",
    description: "Rota clássica entre ilhas gregas e cidades históricas"
  },
  "Caribe": {
    image: "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg",
    category: "cruzeiros",
    description: "Ilhas tropicais com praias de areia branca"
  },
  "Fiorde Norueguês": {
    image: "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg",
    category: "cruzeiros",
    description: "Paisagens dramáticas da Escandinávia"
  },
  "Alasca": {
    image: "https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg",
    category: "cruzeiros",
    description: "Natureza selvagem e geleiras impressionantes"
  }
} as const;
