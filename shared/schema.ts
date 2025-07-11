import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  bio: text("bio"),
  location: text("location"),
  profilePhoto: text("profile_photo"),
  languages: text("languages").array(),
  interests: text("interests").array(),
  travelStyle: text("travel_style"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  destination: text("destination").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  budget: integer("budget"), // Now optional - total estimated budget
  budgetBreakdown: jsonb("budget_breakdown"), // JSON object with expense categories
  maxParticipants: integer("max_participants").notNull(),
  currentParticipants: integer("current_participants").default(1).notNull(),
  description: text("description").notNull(),
  travelStyle: text("travel_style").notNull(),
  sharedCosts: text("shared_costs").array(),
  status: text("status").default("open").notNull(), // open, full, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tripParticipants = pgTable("trip_participants", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => trips.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").default("pending").notNull(), // pending, accepted, rejected
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => trips.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const tripRequests = pgTable("trip_requests", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => trips.id),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message"),
  status: text("status").default("pending").notNull(), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expenses table for trip cost splitting
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => trips.id),
  paidBy: integer("paid_by").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("other"),
  receipt: text("receipt"), // URL or base64 encoded image
  createdAt: timestamp("created_at").defaultNow().notNull(),
  settledAt: timestamp("settled_at"),
});

// Expense splits - who owes what for each expense
export const expenseSplits = pgTable("expense_splits", {
  id: serial("id").primaryKey(),
  expenseId: integer("expense_id").notNull().references(() => expenses.id),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(), // How much this user owes for this expense
  paid: boolean("paid").default(false).notNull(),
  settledAt: timestamp("settled_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  bio: true,
  location: true,
  languages: true,
  interests: true,
  travelStyle: true,
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;
export type TripParticipant = typeof tripParticipants.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type TripRequest = typeof tripRequests.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertTripRequest = z.infer<typeof insertTripRequestSchema>;

// Expense types
export type Expense = typeof expenses.$inferSelect;
export type ExpenseSplit = typeof expenseSplits.$inferSelect;

// Insert schemas for expenses
export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  settledAt: true,
}).extend({
  amount: z.number().positive("O valor deve ser positivo"),
  description: z.string().min(1, "Descrição é obrigatória"),
  receipt: z.string().optional(),
});

export const insertExpenseSplitSchema = createInsertSchema(expenseSplits).omit({
  id: true,
  settledAt: true,
}).extend({
  amount: z.number().positive("O valor deve ser positivo"),
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertExpenseSplit = z.infer<typeof insertExpenseSplitSchema>;

// Budget breakdown interface
export interface BudgetBreakdown {
  transport?: number;
  accommodation?: number;
  food?: number;
  activities?: number;
  shopping?: number;
  insurance?: number;
  visas?: number;
  other?: number;
}

// Expense category labels
export const expenseCategories = {
  transport: "Transporte",
  accommodation: "Hospedagem", 
  food: "Alimentação",
  activities: "Atividades",
  shopping: "Compras",
  insurance: "Seguro",
  visas: "Vistos",
  other: "Outros"
} as const;
