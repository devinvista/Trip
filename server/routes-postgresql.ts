import type { Express } from "express";
import { setupAuth } from "./auth-postgresql";
import { storage } from "./storage";
import { insertTripSchema, insertUserSchema, insertActivitySchema, insertExpenseSchema, insertMessageSchema, insertTripRequestSchema } from "@shared/schema";
import { createServer } from "http";
import { WebSocketServer } from "ws";

function requireAuth(req: any, res: any, next: any) {
  console.log(`🔍 Verificando autenticação para rota: ${req.method} ${req.path}`);
  
  const isAuth = (req.isAuthenticated && req.isAuthenticated()) || !!req.user;
  
  if (!isAuth || !req.user) {
    console.log(`❌ Acesso negado - usuário não autenticado`);
    return res.status(401).json({ message: "Não autorizado" });
  }
  
  console.log(`✅ Usuário autenticado: ${req.user.username} (ID: ${req.user.id})`);
  next();
}

export function registerPostgreSQLRoutes(app: Express) {
  setupAuth(app);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", database: "postgresql" });
  });

  // User routes
  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.json({ user: null });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });

  // Trip routes
  app.get("/api/trips", async (req, res) => {
    try {
      const { destination, startDate, endDate, budget, travelStyle } = req.query;
      const filters: any = {};
      
      if (destination) filters.destination = destination as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (budget) filters.budget = parseInt(budget as string);
      if (travelStyle) filters.travelStyle = travelStyle as string;
      
      const trips = await storage.searchTrips(filters);
      
      const tripsWithCreators = await Promise.all(
        trips.map(async (trip) => {
          const creator = await storage.getUser(trip.creator_id);
          return { ...trip, creator };
        })
      );
      
      res.json(tripsWithCreators);
    } catch (error) {
      console.error('Erro ao buscar viagens:', error);
      res.status(500).json({ message: "Erro ao buscar viagens" });
    }
  });

  app.get("/api/trips/:id", async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const trip = await storage.getTrip(tripId);
      
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      const creator = await storage.getUser(trip.creator_id);
      const participants = await storage.getTripParticipants(tripId);
      
      res.json({ ...trip, creator, participants });
    } catch (error) {
      console.error('Erro ao buscar viagem:', error);
      res.status(500).json({ message: "Erro ao buscar viagem" });
    }
  });

  app.post("/api/trips", requireAuth, async (req, res) => {
    try {
      const tripData = insertTripSchema.parse({
        ...req.body,
        creator_id: req.user!.id,
        current_participants: 1
      });
      
      const trip = await storage.createTrip(tripData);
      
      // Add creator as participant
      await storage.addParticipant(trip.id, req.user!.id);
      
      res.json(trip);
    } catch (error) {
      console.error('Erro ao criar viagem:', error);
      res.status(500).json({ message: "Erro ao criar viagem" });
    }
  });

  app.get("/api/my-trips", requireAuth, async (req, res) => {
    try {
      const userTrips = await storage.getTripsByUser(req.user!.id);
      
      const participatingTripsWithCreators = await Promise.all(
        userTrips.participating.map(async (trip) => {
          const creator = await storage.getUser(trip.creator_id);
          return { ...trip, creator };
        })
      );
      
      res.json({ 
        created: userTrips.created, 
        participating: participatingTripsWithCreators 
      });
    } catch (error) {
      console.error('Erro ao buscar suas viagens:', error);
      res.status(500).json({ message: "Erro ao buscar suas viagens" });
    }
  });

  // Activity routes
  app.get("/api/activities", async (req, res) => {
    try {
      const { search, category, destination_id, difficulty_level } = req.query;
      
      const filters: any = {};
      if (search) filters.search = search as string;
      if (category) {
        const categories = Array.isArray(category) ? category : [category];
        filters.category = categories as string[];
      }
      if (destination_id) filters.destination_id = parseInt(destination_id as string);
      if (difficulty_level) filters.difficulty_level = difficulty_level as string;
      
      const activities = await storage.searchActivities(filters);
      res.json(activities);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      res.status(500).json({ message: "Erro ao buscar atividades" });
    }
  });

  app.get("/api/activities/popular", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getPopularActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error('Erro ao buscar atividades populares:', error);
      res.status(500).json({ message: "Erro ao buscar atividades populares" });
    }
  });

  app.get("/api/activities/categories", async (req, res) => {
    try {
      const categories = await storage.getActivityCategories();
      res.json(categories);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  });

  app.get("/api/activities/:id", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const activity = await storage.getActivity(activityId);
      
      if (!activity) {
        return res.status(404).json({ message: "Atividade não encontrada" });
      }
      
      const proposals = await storage.getActivityBudgetProposals(activityId);
      const reviews = await storage.getActivityReviews(activityId);
      
      res.json({ ...activity, proposals, reviews });
    } catch (error) {
      console.error('Erro ao buscar atividade:', error);
      res.status(500).json({ message: "Erro ao buscar atividade" });
    }
  });

  app.get("/api/activities/:id/proposals", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const proposals = await storage.getActivityBudgetProposals(activityId);
      res.json(proposals);
    } catch (error) {
      console.error('Erro ao buscar propostas:', error);
      res.status(500).json({ message: "Erro ao buscar propostas" });
    }
  });

  // Destination routes
  app.get("/api/destinations", async (req, res) => {
    try {
      const destinations = await storage.getAllDestinations();
      res.json(destinations);
    } catch (error) {
      console.error('Erro ao buscar destinos:', error);
      res.status(500).json({ message: "Erro ao buscar destinos" });
    }
  });

  app.get("/api/destinations/search", async (req, res) => {
    try {
      const query = req.query.q as string || '';
      const destinations = await storage.searchDestinations(query);
      res.json(destinations);
    } catch (error) {
      console.error('Erro ao buscar destinos:', error);
      res.status(500).json({ message: "Erro ao buscar destinos" });
    }
  });

  // Message routes
  app.get("/api/trips/:id/messages", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const messages = await storage.getTripMessages(tripId);
      res.json(messages);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      res.status(500).json({ message: "Erro ao buscar mensagens" });
    }
  });

  app.post("/api/trips/:id/messages", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const messageData = {
        trip_id: tripId,
        user_id: req.user!.id,
        content: req.body.content
      };
      
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error('Erro ao criar mensagem:', error);
      res.status(500).json({ message: "Erro ao criar mensagem" });
    }
  });

  // Expense routes
  app.get("/api/trips/:id/expenses", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const expenses = await storage.getTripExpenses(tripId);
      res.json(expenses);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      res.status(500).json({ message: "Erro ao buscar despesas" });
    }
  });

  app.post("/api/trips/:id/expenses", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const expenseData = {
        ...req.body,
        trip_id: tripId,
        created_by: req.user!.id
      };
      
      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      res.status(500).json({ message: "Erro ao criar despesa" });
    }
  });

  return createServer(app);
}