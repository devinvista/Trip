import { users, trips, tripParticipants, messages, tripRequests, expenses, expenseSplits, type User, type InsertUser, type Trip, type InsertTrip, type Message, type InsertMessage, type TripRequest, type InsertTripRequest, type TripParticipant, type Expense, type InsertExpense, type ExpenseSplit, type InsertExpenseSplit, popularDestinations } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Helper function to get cover image for destination
function getCoverImageForDestination(destination: string): string | null {
  // Try to find exact match first
  if (destination in popularDestinations) {
    return popularDestinations[destination as keyof typeof popularDestinations].image;
  }
  
  // Try to find partial match - more flexible matching
  const destLower = destination.toLowerCase();
  for (const [dest, data] of Object.entries(popularDestinations)) {
    const destKey = dest.toLowerCase();
    const cityName = destKey.split(',')[0].trim();
    const inputCity = destLower.split(',')[0].trim();
    
    if (destKey === destLower || cityName === inputCity || destLower.includes(cityName) || cityName.includes(inputCity)) {
      return data.image;
    }
  }
  
  // Default image for unknown destinations
  return "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80";
}

export interface IStorage {
  sessionStore: session.Store;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Trips
  getTrip(id: number): Promise<Trip | undefined>;
  getTripsByCreator(creatorId: number): Promise<Trip[]>;
  getTripsByParticipant(userId: number): Promise<Trip[]>;
  getTrips(filters?: { destination?: string; startDate?: Date; endDate?: Date; budget?: number; travelStyle?: string }): Promise<Trip[]>;
  createTrip(trip: InsertTrip & { creatorId: number }): Promise<Trip>;
  updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | undefined>;

  // Trip Participants
  getTripParticipants(tripId: number): Promise<(TripParticipant & { user: User })[]>;
  addTripParticipant(tripId: number, userId: number): Promise<TripParticipant>;
  updateTripParticipant(tripId: number, userId: number, status: string): Promise<TripParticipant | undefined>;
  removeTripParticipant(tripId: number, userId: number): Promise<void>;
  recalculateExpenseSplits(tripId: number): Promise<void>;

  // Messages
  getTripMessages(tripId: number): Promise<(Message & { sender: User })[]>;
  createMessage(message: InsertMessage & { senderId: number }): Promise<Message>;

  // Trip Requests
  getTripRequests(tripId: number): Promise<(TripRequest & { user: User })[]>;
  getUserTripRequests(userId: number): Promise<(TripRequest & { trip: Trip })[]>;
  createTripRequest(request: InsertTripRequest & { userId: number }): Promise<TripRequest>;
  updateTripRequest(id: number, status: string): Promise<TripRequest | undefined>;

  // Expenses
  getTripExpenses(tripId: number): Promise<(Expense & { payer: User; splits: (ExpenseSplit & { user: User })[] })[]>;
  createExpense(expense: InsertExpense & { paidBy: number }): Promise<Expense>;
  createExpenseSplits(splits: InsertExpenseSplit[]): Promise<ExpenseSplit[]>;
  updateExpenseSplit(id: number, paid: boolean): Promise<ExpenseSplit | undefined>;
  getTripBalances(tripId: number): Promise<{ userId: number; user: User; balance: number }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trips: Map<number, Trip>;
  private tripParticipants: Map<string, TripParticipant>;
  private messages: Map<number, Message>;
  private tripRequests: Map<number, TripRequest>;
  private expenses: Map<number, Expense>;
  private expenseSplits: Map<number, ExpenseSplit>;
  private currentUserId: number;
  private currentTripId: number;
  private currentMessageId: number;
  private currentRequestId: number;
  private currentParticipantId: number;
  private currentExpenseId: number;
  private currentExpenseSplitId: number;
  public sessionStore: session.Store;

  // Helper function to remove sensitive information from user objects
  private sanitizeUser(user: User): Omit<User, 'password'> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  constructor() {
    this.users = new Map();
    this.trips = new Map();
    this.tripParticipants = new Map();
    this.messages = new Map();
    this.tripRequests = new Map();
    this.expenses = new Map();
    this.expenseSplits = new Map();
    this.currentUserId = 1;
    this.currentTripId = 1;
    this.currentMessageId = 1;
    this.currentRequestId = 1;
    this.currentParticipantId = 1;
    this.currentExpenseId = 1;
    this.currentExpenseSplitId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      profilePhoto: null,
      bio: insertUser.bio || null,
      location: insertUser.location || null,
      languages: insertUser.languages || null,
      interests: insertUser.interests || null,
      travelStyle: insertUser.travelStyle || null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getTrip(id: number): Promise<Trip | undefined> {
    return this.trips.get(id);
  }

  async getTripsByCreator(creatorId: number): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(trip => trip.creatorId === creatorId);
  }

  async getTripsByParticipant(userId: number): Promise<Trip[]> {
    const participantTrips = Array.from(this.tripParticipants.values())
      .filter(p => p.userId === userId && p.status === 'accepted')
      .map(p => this.trips.get(p.tripId))
      .filter((trip): trip is Trip => trip !== undefined)
      .filter(trip => trip.creatorId !== userId); // Excluir viagens onde o usuário é o criador

    return participantTrips;
  }

  async getTrips(filters?: { destination?: string; startDate?: Date; endDate?: Date; budget?: number; travelStyle?: string }): Promise<Trip[]> {
    let allTrips = Array.from(this.trips.values()).filter(trip => trip.status === 'open');

    if (filters) {
      if (filters.destination) {
        allTrips = allTrips.filter(trip => 
          trip.destination.toLowerCase().includes(filters.destination!.toLowerCase())
        );
      }
      if (filters.startDate) {
        allTrips = allTrips.filter(trip => trip.startDate >= filters.startDate!);
      }
      if (filters.endDate) {
        allTrips = allTrips.filter(trip => trip.endDate <= filters.endDate!);
      }
      if (filters.budget) {
        allTrips = allTrips.filter(trip => (trip.budget || 0) <= filters.budget!);
      }
      if (filters.travelStyle) {
        allTrips = allTrips.filter(trip => trip.travelStyle === filters.travelStyle);
      }
    }

    return allTrips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTrip(tripData: InsertTrip & { creatorId: number }): Promise<Trip> {
    const id = this.currentTripId++;
    
    // Automatically assign cover image if not provided
    const coverImage = tripData.coverImage || getCoverImageForDestination(tripData.destination);
    
    const trip: Trip = { 
      ...tripData, 
      id, 
      coverImage,
      budget: tripData.budget ?? null,
      budgetBreakdown: tripData.budgetBreakdown || null,
      currentParticipants: 1,
      status: 'open',
      sharedCosts: tripData.sharedCosts || null,
      createdAt: new Date() 
    };
    this.trips.set(id, trip);

    // Add creator as participant
    await this.addTripParticipant(id, tripData.creatorId);

    return trip;
  }

  async updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | undefined> {
    const trip = this.trips.get(id);
    if (!trip) return undefined;

    const updatedTrip = { ...trip, ...updates };
    this.trips.set(id, updatedTrip);
    return updatedTrip;
  }

  async getTripParticipants(tripId: number): Promise<(TripParticipant & { user: User })[]> {
    const participants = Array.from(this.tripParticipants.values())
      .filter(p => p.tripId === tripId);

    return participants.map(p => {
      const user = this.users.get(p.userId)!;
      return { ...p, user: this.sanitizeUser(user) as User };
    });
  }

  async addTripParticipant(tripId: number, userId: number): Promise<TripParticipant> {
    const id = this.currentParticipantId++;
    const participant: TripParticipant = {
      id,
      tripId,
      userId,
      status: 'accepted',
      joinedAt: new Date()
    };

    this.tripParticipants.set(`${tripId}-${userId}`, participant);
    return participant;
  }

  async updateTripParticipant(tripId: number, userId: number, status: string): Promise<TripParticipant | undefined> {
    const key = `${tripId}-${userId}`;
    const participant = this.tripParticipants.get(key);
    if (!participant) return undefined;

    const updatedParticipant = { ...participant, status };
    this.tripParticipants.set(key, updatedParticipant);
    return updatedParticipant;
  }

  async removeTripParticipant(tripId: number, userId: number): Promise<void> {
    const key = `${tripId}-${userId}`;
    this.tripParticipants.delete(key);
    
    // Se o usuário removido era o organizador, transferir para o primeiro participante
    const trip = this.trips.get(tripId);
    if (trip && trip.creatorId === userId) {
      const participants = await this.getTripParticipants(tripId);
      const activeParticipants = participants.filter(p => p.status === 'accepted');
      
      if (activeParticipants.length > 0) {
        // Transferir organização para o primeiro participante ativo
        const newOrganizer = activeParticipants[0];
        await this.updateTrip(tripId, { creatorId: newOrganizer.userId });
        console.log(`✅ Organização da viagem ${tripId} transferida para usuário ${newOrganizer.user.username}`);
      } else {
        // Se não há mais participantes, marcar viagem como cancelada
        await this.updateTrip(tripId, { status: 'cancelled' });
        console.log(`❌ Viagem ${tripId} cancelada - sem participantes`);
      }
    }
  }

  async recalculateExpenseSplits(tripId: number): Promise<void> {
    // Get all expenses for this trip that were split equally among all participants
    const expenses = await this.getTripExpenses(tripId);
    const participants = await this.getTripParticipants(tripId);
    const activeParticipants = participants.filter(p => p.status === 'accepted');
    
    for (const expense of expenses) {
      // Check if this expense was split equally among all participants
      const splits = Array.from(this.expenseSplits.values())
        .filter(split => split.expenseId === expense.id);
      
      // If the number of splits matches the number of participants at the time,
      // recalculate with new participants
      if (splits.length > 0) {
        const newSplitAmount = expense.amount / activeParticipants.length;
        
        // Remove existing splits
        splits.forEach(split => this.expenseSplits.delete(split.id));
        
        // Create new splits for all current participants
        for (const participant of activeParticipants) {
          const newSplit: ExpenseSplit = {
            id: this.currentExpenseSplitId++,
            expenseId: expense.id,
            userId: participant.userId,
            amount: newSplitAmount,
            paid: participant.userId === expense.paidBy,
            settledAt: null,
          };
          
          this.expenseSplits.set(newSplit.id, newSplit);
        }
      }
    }
  }

  async getTripMessages(tripId: number): Promise<(Message & { sender: User })[]> {
    const tripMessages = Array.from(this.messages.values())
      .filter(m => m.tripId === tripId)
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());

    return tripMessages.map(m => {
      const sender = this.users.get(m.senderId)!;
      return { ...m, sender: this.sanitizeUser(sender) as User };
    });
  }

  async createMessage(messageData: InsertMessage & { senderId: number }): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...messageData, 
      id, 
      sentAt: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }

  async getTripRequests(tripId: number): Promise<(TripRequest & { user: User })[]> {
    const requests = Array.from(this.tripRequests.values())
      .filter(r => r.tripId === tripId);

    return requests.map(r => {
      const user = this.users.get(r.userId)!;
      return { ...r, user: this.sanitizeUser(user) as User };
    });
  }

  async getUserTripRequests(userId: number): Promise<(TripRequest & { trip: Trip })[]> {
    const requests = Array.from(this.tripRequests.values())
      .filter(r => r.userId === userId);

    return requests.map(r => {
      const trip = this.trips.get(r.tripId)!;
      return { ...r, trip };
    });
  }

  async createTripRequest(requestData: InsertTripRequest & { userId: number }): Promise<TripRequest> {
    const id = this.currentRequestId++;
    const request: TripRequest = { 
      ...requestData, 
      id, 
      status: 'pending',
      message: requestData.message || null,
      createdAt: new Date() 
    };
    this.tripRequests.set(id, request);
    return request;
  }

  async updateTripRequest(id: number, status: string): Promise<TripRequest | undefined> {
    const request = this.tripRequests.get(id);
    if (!request) return undefined;

    const updatedRequest = { ...request, status };
    this.tripRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Expense methods
  async getTripExpenses(tripId: number): Promise<(Expense & { payer: User; splits: (ExpenseSplit & { user: User })[] })[]> {
    const tripExpenses = Array.from(this.expenses.values())
      .filter(expense => expense.tripId === tripId);
    
    const result = [];
    for (const expense of tripExpenses) {
      const payer = await this.getUser(expense.paidBy);
      if (!payer) continue;

      const splits = Array.from(this.expenseSplits.values())
        .filter(split => split.expenseId === expense.id);
      
      const splitsWithUsers = [];
      for (const split of splits) {
        const user = await this.getUser(split.userId);
        if (user) {
          splitsWithUsers.push({ ...split, user: this.sanitizeUser(user) as User });
        }
      }

      result.push({ ...expense, payer: this.sanitizeUser(payer) as User, splits: splitsWithUsers });
    }
    
    return result;
  }

  async createExpense(expenseData: InsertExpense & { paidBy: number }): Promise<Expense> {
    const expense: Expense = {
      id: this.currentExpenseId++,
      tripId: expenseData.tripId,
      paidBy: expenseData.paidBy,
      amount: expenseData.amount,
      description: expenseData.description,
      category: expenseData.category,
      receipt: expenseData.receipt || null,
      createdAt: new Date(),
      settledAt: null,
    };
    
    this.expenses.set(expense.id, expense);
    return expense;
  }

  async createExpenseSplits(splits: InsertExpenseSplit[]): Promise<ExpenseSplit[]> {
    const createdSplits: ExpenseSplit[] = [];
    
    for (const split of splits) {
      const expenseSplit: ExpenseSplit = {
        id: this.currentExpenseSplitId++,
        expenseId: split.expenseId,
        userId: split.userId,
        amount: split.amount,
        paid: split.paid || false,
        settledAt: null,
      };
      
      this.expenseSplits.set(expenseSplit.id, expenseSplit);
      createdSplits.push(expenseSplit);
    }
    
    return createdSplits;
  }

  async updateExpenseSplit(id: number, paid: boolean): Promise<ExpenseSplit | undefined> {
    const split = this.expenseSplits.get(id);
    if (!split) return undefined;

    const updatedSplit = { 
      ...split, 
      paid,
      settledAt: paid ? new Date() : null 
    };
    this.expenseSplits.set(id, updatedSplit);
    return updatedSplit;
  }

  async getTripBalances(tripId: number): Promise<{ userId: number; user: User; balance: number }[]> {
    const participants = await this.getTripParticipants(tripId);
    const balances = new Map<number, number>();

    // Initialize balances for all participants
    for (const participant of participants) {
      balances.set(participant.userId, 0);
    }

    // Calculate balances based on expenses and splits
    const expenses = await this.getTripExpenses(tripId);
    for (const expense of expenses) {
      // Payer gets credit for the full amount
      const payerBalance = balances.get(expense.paidBy) || 0;
      balances.set(expense.paidBy, payerBalance + expense.amount);

      // Each person in the split owes their portion
      for (const split of expense.splits) {
        const splitBalance = balances.get(split.userId) || 0;
        balances.set(split.userId, splitBalance - split.amount);
      }
    }

    // Convert to array with user info
    const result = [];
    for (const [userId, balance] of balances.entries()) {
      const user = await this.getUser(userId);
      if (user) {
        result.push({ userId, user: this.sanitizeUser(user) as User, balance });
      }
    }

    return result;
  }
}

export const storage = new MemStorage();

// Create default test user
async function createDefaultTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await storage.getUserByUsername('tom');

    if (!existingUser) {
      // Import crypto functions for password hashing
      const { scrypt, randomBytes } = await import('crypto');
      const { promisify } = await import('util');
      const scryptAsync = promisify(scrypt);

      // Hash the password
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync('demo123', salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;

      // Create the test user
      const user = await storage.createUser({
        username: 'tom',
        email: 'tom@teste.com',
        fullName: 'Tom Teste',
        password: hashedPassword,
        bio: 'Usuário de teste padrão',
        location: 'São Paulo, SP',
        travelStyle: 'urbanas',
        languages: ['Português', 'Inglês'],
        interests: ['Aventura', 'Cultura', 'Gastronomia']
      });

      console.log('✅ Usuário de teste criado: tom / demo123');
      
      // Criar viagens padrão para o usuário Tom
      await createDefaultTrips(user);
    } else {
      console.log('ℹ️ Usuário de teste já existe: tom');
    }
    
    // Criar segundo usuário para teste de participação
    await createSecondTestUser();
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
  }
}

// Create second test user for participation testing
async function createSecondTestUser() {
  try {
    // Check if second test user already exists
    const existingUser = await storage.getUserByUsername('maria');

    if (!existingUser) {
      // Import crypto functions for password hashing
      const { scrypt, randomBytes } = await import('crypto');
      const { promisify } = await import('util');
      const scryptAsync = promisify(scrypt);

      // Hash the password
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync('demo123', salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;

      // Create the second test user
      const user = await storage.createUser({
        username: 'maria',
        email: 'maria@teste.com',
        fullName: 'Maria Santos',
        password: hashedPassword,
        bio: 'Usuária de teste para participação',
        location: 'Rio de Janeiro, RJ',
        travelStyle: 'praia',
        languages: ['Português', 'Espanhol'],
        interests: ['Praia', 'Cultura', 'Fotografia']
      });

      console.log('✅ Segundo usuário de teste criado: maria / demo123');
      
      // Criar viagem da Maria e adicionar Tom como participante
      await createMariaTripsWithTomAsParticipant(user);
    } else {
      console.log('ℹ️ Segundo usuário de teste já existe: maria');
    }
  } catch (error) {
    console.error('❌ Erro ao criar segundo usuário de teste:', error);
  }
}

// Create Maria's trips and add Tom as participant
async function createMariaTripsWithTomAsParticipant(maria: User) {
  try {
    // Verificar se já existem viagens da Maria
    const existingTrips = await storage.getTripsByCreator(maria.id);
    if (existingTrips.length > 0) {
      console.log('ℹ️ Viagens da Maria já existem');
      return;
    }

    // Criar viagem da Maria
    const trip = await storage.createTrip({
      title: 'Praia e Cultura no Rio de Janeiro',
      destination: 'Rio de Janeiro, RJ',
      coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
      startDate: new Date('2025-09-10'),
      endDate: new Date('2025-09-15'),
      budget: 1800,
      maxParticipants: 4,
      description: 'Descubra o Rio de Janeiro! Praias de Copacabana e Ipanema, Cristo Redentor, Pão de Açúcar, e muito mais. Inclui hospedagem em Copacabana e passeios culturais.',
      travelStyle: 'praia',
      sharedCosts: ['accommodation', 'transport', 'activities'],
      budgetBreakdown: {
        transport: 400,
        accommodation: 800,
        food: 400,
        activities: 200
      },
      creatorId: maria.id
    });

    // Adicionar Tom como participante aceito
    const tomUser = await storage.getUserByUsername('tom');
    if (tomUser) {
      await storage.addTripParticipant(trip.id, tomUser.id);
      console.log('✅ Tom adicionado como participante na viagem da Maria');
    }

    console.log('✅ Viagem da Maria criada com Tom como participante');
  } catch (error) {
    console.error('❌ Erro ao criar viagem da Maria:', error);
  }
}

async function createDefaultTrips(user: User) {
  try {
    // Verificar se já existem viagens
    const existingTrips = await storage.getTripsByCreator(user.id);
    if (existingTrips.length > 0) {
      console.log('ℹ️ Viagens de teste já existem para o usuário tom');
      return;
    }

    // Criar viagem 1: Trilha na Chapada Diamantina
    const trip1 = await storage.createTrip({
      title: 'Trilha na Chapada Diamantina',
      destination: 'Chapada Diamantina, BA',
      coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
      startDate: new Date('2025-08-15'),
      endDate: new Date('2025-08-22'),
      budget: 2500,
      maxParticipants: 6,
      description: 'Aventura incrível na Chapada Diamantina! Vamos explorar cachoeiras, fazer trilhas e acampar sob as estrelas. Inclui visitas ao Poço Azul, Cachoeira da Fumaça e Vale do Pati.',
      travelStyle: 'aventura',
      sharedCosts: ['accommodation', 'transport', 'food'],
      creatorId: user.id,
      budgetBreakdown: {
        transport: 800,
        accommodation: 600,
        food: 700,
        activities: 400
      }
    });

    // Criar viagem 2: Fim de semana em Campos do Jordão
    const trip2 = await storage.createTrip({
      title: 'Fim de semana relaxante em Campos do Jordão',
      destination: 'Campos do Jordão, SP',
      coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      startDate: new Date('2025-08-01'),
      endDate: new Date('2025-08-03'),
      budget: 1200,
      maxParticipants: 4,
      description: 'Escapada perfeita para relaxar no clima de montanha. Pousada aconchegante, gastronomia local, passeios de teleférico e muito chocolate! Ideal para quem quer descansar.',
      travelStyle: 'neve',
      sharedCosts: ['accommodation', 'transport'],
      creatorId: user.id,
      budgetBreakdown: {
        transport: 300,
        accommodation: 600,
        food: 300
      }
    });

    console.log('✅ Viagens padrão criadas:', trip1.title, 'e', trip2.title);
  } catch (error) {
    console.error('❌ Erro ao criar viagens padrão:', error);
  }
}

// Initialize default test user after storage is created
createDefaultTestUser();