
import type { Express } from "express";
import { createServer, type Server } from "http";

import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTripSchema, insertMessageSchema, insertTripRequestSchema, insertExpenseSchema, insertExpenseSplitSchema } from "@shared/schema";

// Middleware para verificar autenticação
function requireAuth(req: any, res: any, next: any) {
  console.log(`🔐 Verificando autenticação:`, {
    isAuthenticated: req.isAuthenticated(),
    hasUser: !!req.user,
    sessionID: req.sessionID,
    session: !!req.session,
    sessionData: req.session,
    cookies: req.cookies,
    url: req.url
  });
  
  if (!req.isAuthenticated() || !req.user) {
    console.log(`❌ Acesso negado - usuário não autenticado`);
    return res.status(401).json({ message: "Não autorizado" });
  }
  
  console.log(`✅ Usuário autenticado: ${req.user.username} (ID: ${req.user.id})`);
  next();
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Google Maps API key
  app.get("/api/google-maps-key", (req, res) => {
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
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
      
      const trips = await storage.getTrips(filters);
      
      // Include creator info for each trip
      const tripsWithCreators = await Promise.all(
        trips.map(async (trip) => {
          const creator = await storage.getUser(trip.creatorId);
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
      
      const creator = await storage.getUser(trip.creatorId);
      const participants = await storage.getTripParticipants(tripId);
      
      // Check if user has a pending request
      let userRequest = null;
      if (req.isAuthenticated() && req.user) {
        const allRequests = await storage.getTripRequests(tripId);
        userRequest = allRequests.find(r => r.userId === req.user!.id && r.status === 'pending');
      }
      
      res.json({ ...trip, creator, participants, userRequest });
    } catch (error) {
      console.error('Erro ao buscar viagem:', error);
      res.status(500).json({ message: "Erro ao buscar viagem" });
    }
  });

  app.post("/api/trips", requireAuth, async (req, res) => {
    try {
      console.log('Dados recebidos para criação de viagem:', req.body);
      console.log('Usuário autenticado:', req.user);
      
      // Validar dados da viagem
      const tripData = insertTripSchema.parse(req.body);
      
      // Criar viagem
      const trip = await storage.createTrip({ 
        ...tripData, 
        creatorId: req.user!.id 
      });
      
      console.log('Viagem criada com sucesso:', trip);
      res.status(201).json(trip);
    } catch (error) {
      console.error('Erro ao criar viagem:', error);
      res.status(400).json({ 
        message: "Erro ao criar viagem", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });



  app.get("/api/my-trips", requireAuth, async (req, res) => {
    try {
      console.log(`🔍 Buscando viagens do usuário ${req.user!.id} (${req.user!.username})`);
      
      const createdTrips = await storage.getTripsByCreator(req.user!.id);
      const participatingTrips = await storage.getTripsByParticipant(req.user!.id);
      
      console.log(`📊 Viagens encontradas: ${createdTrips.length} criadas, ${participatingTrips.length} participando`);
      
      // Add creator info for participating trips
      const participatingTripsWithCreators = await Promise.all(
        participatingTrips.map(async (trip) => {
          const creator = await storage.getUser(trip.creatorId);
          return { ...trip, creator };
        })
      );
      
      res.json({ 
        created: createdTrips, 
        participating: participatingTripsWithCreators 
      });
    } catch (error) {
      console.error('Erro ao buscar suas viagens:', error);
      res.status(500).json({ message: "Erro ao buscar suas viagens" });
    }
  });

  // Update trip cover image
  app.patch("/api/trips/:id/cover-image", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const { coverImage } = req.body;
      
      if (!coverImage) {
        return res.status(400).json({ message: "URL da imagem é obrigatória" });
      }
      
      const trip = await storage.getTrip(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      // Only trip creator can update cover image
      if (trip.creatorId !== req.user!.id) {
        return res.status(403).json({ message: "Apenas o criador da viagem pode alterar a imagem" });
      }
      
      const updatedTrip = await storage.updateTrip(tripId, { coverImage });
      res.json(updatedTrip);
    } catch (error) {
      console.error('Erro ao atualizar imagem da viagem:', error);
      res.status(500).json({ message: "Erro ao atualizar imagem da viagem" });
    }
  });

  // Update trip budget
  app.patch("/api/trips/:id/budget", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const { budget, budgetBreakdown } = req.body;
      
      if (!budget || budget <= 0) {
        return res.status(400).json({ message: "Orçamento deve ser um valor positivo" });
      }
      
      const trip = await storage.getTrip(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      // Only trip creator can update budget
      if (trip.creatorId !== req.user!.id) {
        return res.status(403).json({ message: "Apenas o criador da viagem pode alterar o orçamento" });
      }
      
      const updatedTrip = await storage.updateTrip(tripId, { budget, budgetBreakdown });
      res.json(updatedTrip);
    } catch (error) {
      console.error('Erro ao atualizar orçamento da viagem:', error);
      res.status(500).json({ message: "Erro ao atualizar orçamento da viagem" });
    }
  });

  // Trip request routes
  app.post("/api/trips/:id/request", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      
      // Parse only the message from request body
      const { message } = req.body;
      
      const trip = await storage.getTrip(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      if (trip.creatorId === req.user!.id) {
        return res.status(400).json({ message: "Você não pode solicitar participação na sua própria viagem" });
      }
      
      // Check if user already has a pending request
      const existingRequests = await storage.getTripRequests(tripId);
      const userRequest = existingRequests.find(r => r.userId === req.user!.id);
      if (userRequest && userRequest.status === 'pending') {
        return res.status(400).json({ message: "Você já tem uma solicitação pendente para esta viagem" });
      }
      
      const request = await storage.createTripRequest({ 
        message: message || "",
        tripId, 
        userId: req.user!.id 
      });
      
      res.status(201).json(request);
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      res.status(400).json({ message: "Erro ao enviar solicitação" });
    }
  });

  app.get("/api/trips/:id/requests", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const trip = await storage.getTrip(tripId);
      
      if (!trip || trip.creatorId !== req.user!.id) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const requests = await storage.getTripRequests(tripId);
      res.json(requests);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      res.status(500).json({ message: "Erro ao buscar solicitações" });
    }
  });

  app.patch("/api/trip-requests/:id", requireAuth, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status inválido" });
      }
      
      const request = await storage.updateTripRequest(requestId, status);
      if (!request) {
        return res.status(404).json({ message: "Solicitação não encontrada" });
      }
      
      // If accepted, add user to trip participants
      if (status === 'accepted') {
        await storage.addTripParticipant(request.tripId, request.userId);
        
        // Update trip participant count
        const trip = await storage.getTrip(request.tripId);
        if (trip) {
          await storage.updateTrip(request.tripId, { 
            currentParticipants: trip.currentParticipants + 1 
          });
        }
      }
      
      res.json(request);
    } catch (error) {
      console.error('Erro ao atualizar solicitação:', error);
      res.status(500).json({ message: "Erro ao atualizar solicitação" });
    }
  });

  // Remove participant from trip
  app.delete("/api/trips/:id/participants/:userId", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const userIdToRemove = parseInt(req.params.userId);
      
      const trip = await storage.getTrip(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      // Verificar se o usuário atual tem permissão (é o próprio participante ou o organizador)
      const isOwnParticipation = req.user!.id === userIdToRemove;
      const isOrganizer = trip.creatorId === req.user!.id;
      
      if (!isOwnParticipation && !isOrganizer) {
        return res.status(403).json({ message: "Você não tem permissão para remover este participante" });
      }
      
      // Verificar se o usuário é realmente um participante
      const participants = await storage.getTripParticipants(tripId);
      const participant = participants.find(p => p.userId === userIdToRemove && p.status === 'accepted');
      
      if (!participant) {
        return res.status(404).json({ message: "Participante não encontrado nesta viagem" });
      }
      
      // Remover participante
      await storage.removeTripParticipant(tripId, userIdToRemove);
      
      // Atualizar contador de participantes
      const updatedTrip = await storage.getTrip(tripId);
      if (updatedTrip && updatedTrip.status !== 'cancelled') {
        await storage.updateTrip(tripId, { 
          currentParticipants: Math.max(0, updatedTrip.currentParticipants - 1) 
        });
      }
      
      res.json({ 
        message: isOwnParticipation ? "Você saiu da viagem com sucesso" : "Participante removido com sucesso",
        tripStatus: updatedTrip?.status 
      });
    } catch (error) {
      console.error('Erro ao remover participante:', error);
      res.status(500).json({ message: "Erro ao remover participante" });
    }
  });

  // Message routes
  app.get("/api/trips/:id/messages", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      console.log(`📨 Buscando mensagens para viagem ${tripId} pelo usuário ${req.user!.id}`);
      
      // Check if user is participant or creator of the trip
      const trip = await storage.getTrip(tripId);
      if (!trip) {
        console.log(`❌ Viagem ${tripId} não encontrada`);
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      console.log(`✅ Viagem encontrada: ${trip.title} (criador: ${trip.creatorId})`);
      
      const participants = await storage.getTripParticipants(tripId);
      console.log(`👥 Participantes da viagem:`, participants.map(p => ({ userId: p.userId, status: p.status })));
      
      const isParticipant = participants.some(p => p.userId === req.user!.id && p.status === 'accepted');
      const isCreator = trip.creatorId === req.user!.id;
      
      console.log(`🔐 Verificação de acesso: isParticipant=${isParticipant}, isCreator=${isCreator}`);
      
      if (!isParticipant && !isCreator) {
        console.log(`❌ Acesso negado para usuário ${req.user!.id}`);
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const messages = await storage.getTripMessages(tripId);
      console.log(`✅ ${messages.length} mensagens encontradas`);
      res.json(messages);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      res.status(500).json({ message: "Erro ao buscar mensagens" });
    }
  });

  app.post("/api/trips/:id/messages", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const messageData = insertMessageSchema.parse(req.body);
      
      // Check if user is participant or creator of the trip
      const trip = await storage.getTrip(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      const participants = await storage.getTripParticipants(tripId);
      const isParticipant = participants.some(p => p.userId === req.user!.id);
      const isCreator = trip.creatorId === req.user!.id;
      
      if (!isParticipant && !isCreator) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const message = await storage.createMessage({ 
        ...messageData, 
        tripId,
        senderId: req.user!.id 
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      res.status(400).json({ message: "Erro ao enviar mensagem" });
    }
  });

  // User profile routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Remove sensitive information
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  });

  app.patch("/api/profile", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      delete updates.id;
      delete updates.password;
      delete updates.username;
      delete updates.email;
      
      const updatedUser = await storage.updateUser(req.user!.id, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      const { password, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ message: "Erro ao atualizar perfil" });
    }
  });

  // Expense routes
  app.post("/api/trips/:id/expenses", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      console.log('Dados recebidos para criação de despesa:', req.body);
      console.log('Usuário autenticado:', req.user);
      
      const expenseData = insertExpenseSchema.parse({
        ...req.body,
        tripId
      });
      
      // Verify user is a participant of the trip
      const participants = await storage.getTripParticipants(tripId);
      const isParticipant = participants.some(p => p.userId === req.user!.id && p.status === 'accepted');
      
      if (!isParticipant) {
        return res.status(403).json({ message: "Você deve ser um participante da viagem para adicionar despesas" });
      }
      
      // Create the expense
      const expense = await storage.createExpense({
        ...expenseData,
        paidBy: req.user!.id
      });
      
      // Create splits based on selected participants
      let splitParticipants: number[];
      if (req.body.splitWith === 'all') {
        // Split equally among all participants (including future ones)
        splitParticipants = participants.filter(p => p.status === 'accepted').map(p => p.userId);
      } else {
        splitParticipants = req.body.splitWith || participants.filter(p => p.status === 'accepted').map(p => p.userId);
      }
      
      const splitAmount = expenseData.amount / splitParticipants.length;
      
      const splits = await storage.createExpenseSplits(
        splitParticipants.map((userId: number) => ({
          expenseId: expense.id,
          userId,
          amount: splitAmount,
          paid: userId === req.user!.id // Payer's split is automatically marked as paid
        }))
      );
      
      res.status(201).json({ expense, splits });
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      res.status(400).json({ message: "Erro ao criar despesa" });
    }
  });

  app.get("/api/trips/:id/expenses", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      
      // Verify user is a participant of the trip
      const participants = await storage.getTripParticipants(tripId);
      const isParticipant = participants.some(p => p.userId === req.user!.id && p.status === 'accepted');
      
      if (!isParticipant) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const expenses = await storage.getTripExpenses(tripId);
      res.json(expenses);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      res.status(500).json({ message: "Erro ao buscar despesas" });
    }
  });

  app.get("/api/trips/:id/balances", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      
      // Verify user is a participant of the trip
      const participants = await storage.getTripParticipants(tripId);
      const isParticipant = participants.some(p => p.userId === req.user!.id && p.status === 'accepted');
      
      if (!isParticipant) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const balances = await storage.getTripBalances(tripId);
      
      // Set cache control headers to prevent caching
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.json(balances);
    } catch (error) {
      console.error('Erro ao calcular balanços:', error);
      res.status(500).json({ message: "Erro ao calcular balanços" });
    }
  });

  app.patch("/api/expense-splits/:id", requireAuth, async (req, res) => {
    try {
      const splitId = parseInt(req.params.id);
      const { paid } = req.body;
      
      const updatedSplit = await storage.updateExpenseSplit(splitId, paid);
      if (!updatedSplit) {
        return res.status(404).json({ message: "Divisão não encontrada" });
      }
      
      res.json(updatedSplit);
    } catch (error) {
      console.error('Erro ao atualizar divisão:', error);
      res.status(500).json({ message: "Erro ao atualizar divisão" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
