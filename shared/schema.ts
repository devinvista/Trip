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
  coverImage: text("cover_image"), // URL for trip cover image
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  budget: integer("budget"), // Now optional - total estimated budget
  budgetBreakdown: jsonb("budget_breakdown"), // JSON object with expense categories
  maxParticipants: integer("max_participants").notNull(),
  currentParticipants: integer("current_participants").default(1).notNull(),
  description: text("description").notNull(),
  travelStyle: text("travel_style").notNull(),
  sharedCosts: text("shared_costs").array(),
  plannedActivities: jsonb("planned_activities"), // Advanced activities with attachments, links, costs
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
  createdAt: string;
}

// Activity categories with labels and icons
export const activityCategories = {
  sightseeing: { label: "Pontos Turísticos", icon: "🏛️" },
  food: { label: "Gastronomia", icon: "🍽️" },
  adventure: { label: "Aventura", icon: "🏔️" },
  culture: { label: "Cultura", icon: "🎭" },
  relaxation: { label: "Relaxamento", icon: "🧘" },
  nightlife: { label: "Vida Noturna", icon: "🌙" },
  shopping: { label: "Compras", icon: "🛍️" },
  other: { label: "Outros", icon: "📋" }
} as const;

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
  }
} as const;
