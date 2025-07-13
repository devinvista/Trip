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
  entertainment: "Entretenimento",
  medical: "Saúde e Medicamentos",
  communication: "Comunicação",
  tips: "Gorjetas",
  souvenirs: "Lembranças",
  parking: "Estacionamento",
  fuel: "Combustível",
  tolls: "Pedágios",
  emergency: "Emergências",
  other: "Outros"
} as const;

// Budget categories (for budget breakdown - excludes activities)
export const budgetCategories = {
  transport: "Transporte (Passagens, Combustível, Pedágios, Estacionamento)",
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
