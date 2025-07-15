
import type { Express } from "express";
import { createServer, type Server } from "http";

import { setupAuth } from "./auth";
import { storage } from "./storage";
import { syncTripParticipants } from "./sync-participants.js";
import { insertTripSchema, insertMessageSchema, insertTripRequestSchema, insertExpenseSchema, insertExpenseSplitSchema, insertUserRatingSchema, insertDestinationRatingSchema, insertVerificationRequestSchema, insertActivitySchema, insertActivityReviewSchema, insertActivityBookingSchema, insertActivityBudgetProposalSchema, insertTripActivitySchema } from "@shared/schema";

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

  // Update a trip (only creator can update)
  app.patch("/api/trips/:id", requireAuth, async (req: any, res: any) => {
    try {
      const tripId = parseInt(req.params.id);
      const updates = req.body;

      // Get the trip to verify ownership
      const trip = await storage.getTrip(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }

      if (trip.creatorId !== req.user.id) {
        return res.status(403).json({ message: "Apenas o criador pode editar a viagem" });
      }

      // Validate that maxParticipants is not less than current participants
      if (updates.maxParticipants && updates.maxParticipants < trip.currentParticipants) {
        return res.status(400).json({ 
          message: `Máximo de participantes não pode ser menor que ${trip.currentParticipants} (participantes atuais)` 
        });
      }

      const updatedTrip = await storage.updateTrip(tripId, updates);
      if (!updatedTrip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }

      res.json(updatedTrip);
    } catch (error: any) {
      console.error("❌ Erro ao atualizar viagem:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Erro ao atualizar viagem" 
      });
    }
  });

  // Delete a trip (only creator can delete, and only if no other participants)
  app.delete("/api/trips/:id", requireAuth, async (req: any, res: any) => {
    try {
      const tripId = parseInt(req.params.id);

      // Get the trip to verify ownership and participants
      const trip = await storage.getTrip(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }

      if (trip.creatorId !== req.user.id) {
        return res.status(403).json({ message: "Apenas o criador pode excluir a viagem" });
      }

      if (trip.currentParticipants > 1) {
        return res.status(400).json({ 
          message: "Não é possível excluir viagem com outros participantes. Use a opção 'Cancelar' para transferir a organização." 
        });
      }

      const deleted = await storage.deleteTrip(tripId);
      if (!deleted) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }

      res.json({ message: "Viagem excluída com sucesso" });
    } catch (error: any) {
      console.error("❌ Erro ao excluir viagem:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Erro ao excluir viagem" 
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

  // Admin endpoint: Fix creators as participants
  app.post('/api/admin/fix-creators-participants', requireAuth, async (req, res) => {
    try {
      // Only allow verified users to run this fix
      if (!req.user!.isVerified) {
        return res.status(403).json({ message: 'Acesso negado. Apenas usuários verificados podem executar esta correção.' });
      }

      const fixedCount = await storage.fixCreatorsAsParticipants();
      
      res.json({ 
        message: `Correção executada com sucesso! ${fixedCount} criadores foram adicionados como participantes.`,
        fixedCount
      });
    } catch (error) {
      console.error('❌ Erro na correção de criadores como participantes:', error);
      res.status(500).json({ message: 'Erro interno do servidor ao executar correção.' });
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
        
        // Sync trip participant count based on actual accepted participants
        await syncTripParticipants(request.tripId);
      }
      
      res.json(request);
    } catch (error) {
      console.error('Erro ao atualizar solicitação:', error);
      res.status(500).json({ message: "Erro ao atualizar solicitação" });
    }
  });

  // Update trip planned activities
  app.patch("/api/trips/:id/activities", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const { plannedActivities } = req.body;
      
      const trip = await storage.getTrip(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      // Check if user is creator or participant
      const isCreator = trip.creatorId === req.user!.id;
      const participants = await storage.getTripParticipants(tripId);
      const isParticipant = participants.some(p => p.userId === req.user!.id && p.status === 'accepted');
      
      if (!isCreator && !isParticipant) {
        return res.status(403).json({ message: "Você não tem permissão para editar as atividades desta viagem" });
      }
      
      const updatedTrip = await storage.updateTripActivities(tripId, plannedActivities);
      res.json(updatedTrip);
    } catch (error) {
      console.error('Erro ao atualizar atividades:', error);
      res.status(500).json({ message: "Erro ao atualizar atividades" });
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
        // Sync trip participant count based on actual accepted participants
        await syncTripParticipants(tripId);
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
      
      // Verify user is a participant or creator of the trip
      const trip = await storage.getTrip(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      const participants = await storage.getTripParticipants(tripId);
      const isParticipant = participants.some(p => p.userId === req.user!.id && p.status === 'accepted');
      const isCreator = trip.creatorId === req.user!.id;
      
      if (!isParticipant && !isCreator) {
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

  // Profile routes
  app.put("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const { fullName, email, bio, location, languages, interests, travelStyle } = req.body;
      
      const updatedUser = await storage.updateUser(req.user!.id, {
        fullName,
        email,
        bio,
        location,
        languages,
        interests,
        travelStyle
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ message: "Erro ao atualizar perfil" });
    }
  });

  app.get("/api/user/stats", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get user's trips
      const createdTrips = await storage.getTripsByCreator(userId);
      const participatingTrips = await storage.getTripsByParticipant(userId);
      
      const totalTrips = createdTrips.length + participatingTrips.length;
      const completedTrips = [...createdTrips, ...participatingTrips].filter(trip => 
        trip.status === 'completed' || new Date(trip.endDate) < new Date()
      ).length;
      
      // Get travel partners (unique users from all trips)
      const allTrips = [...createdTrips, ...participatingTrips];
      const travelPartners = new Set();
      
      for (const trip of allTrips) {
        const participants = await storage.getTripParticipants(trip.id);
        participants.forEach(p => {
          if (p.userId !== userId) {
            travelPartners.add(p.userId);
          }
        });
      }
      
      const stats = {
        totalTrips,
        completedTrips,
        travelPartners: travelPartners.size,
        averageRating: "5.0" // Mock rating for now
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  app.get("/api/user/referral", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const username = req.user!.username.toUpperCase();
      
      // Generate referral code based on username and user ID
      const referralCode = `PARTIU-${username}${userId.toString().padStart(2, '0')}`;
      
      // For now, return empty referred users (would need referral system implementation)
      const referralData = {
        code: referralCode,
        referredUsers: []
      };
      
      res.json(referralData);
    } catch (error) {
      console.error('Erro ao buscar dados de indicação:', error);
      res.status(500).json({ message: "Erro ao buscar dados de indicação" });
    }
  });

  // Validate referral code
  app.post("/api/user/validate-referral", async (req, res) => {
    try {
      const { referralCode } = req.body;
      
      if (!referralCode) {
        return res.status(400).json({ message: "Código de indicação é obrigatório" });
      }
      
      // Check if referral code matches the format PARTIU-{USERNAME}{ID}
      const referralRegex = /^PARTIU-([A-Z]+)(\d+)$/;
      const match = referralCode.match(referralRegex);
      
      if (!match) {
        return res.status(400).json({ message: "Formato de código de indicação inválido" });
      }
      
      const [, username, userIdStr] = match;
      const userId = parseInt(userIdStr);
      
      // Find the user with this username and ID
      const user = await storage.getUser(userId);
      
      if (!user || user.username.toUpperCase() !== username) {
        return res.status(400).json({ message: "Código de indicação inválido" });
      }
      
      res.json({ 
        valid: true, 
        referrerName: user.fullName,
        referrerUsername: user.username
      });
    } catch (error) {
      console.error('Erro ao validar código de indicação:', error);
      res.status(500).json({ message: "Erro ao validar código de indicação" });
    }
  });

  // User Rating routes
  app.get("/api/users/:id/ratings", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const ratings = await storage.getUserRatings(userId);
      res.json(ratings);
    } catch (error) {
      console.error('Erro ao buscar avaliações do usuário:', error);
      res.status(500).json({ message: "Erro ao buscar avaliações" });
    }
  });

  app.post("/api/users/:id/ratings", requireAuth, async (req, res) => {
    try {
      const ratedUserId = parseInt(req.params.id);
      const raterUserId = req.user!.id;
      
      // Prevent self-rating
      if (ratedUserId === raterUserId) {
        return res.status(400).json({ message: "Não é possível avaliar a si mesmo" });
      }
      
      const ratingData = insertUserRatingSchema.parse(req.body);
      const rating = await storage.createUserRating({
        ...ratingData,
        ratedUserId,
        raterUserId
      });
      
      res.status(201).json(rating);
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      res.status(400).json({ message: "Erro ao criar avaliação" });
    }
  });

  // Destination Rating routes
  app.get("/api/destinations/:destination/ratings", async (req, res) => {
    try {
      const destination = decodeURIComponent(req.params.destination);
      const ratings = await storage.getDestinationRatings(destination);
      res.json(ratings);
    } catch (error) {
      console.error('Erro ao buscar avaliações do destino:', error);
      res.status(500).json({ message: "Erro ao buscar avaliações do destino" });
    }
  });

  app.post("/api/destinations/:destination/ratings", requireAuth, async (req, res) => {
    try {
      const destination = decodeURIComponent(req.params.destination);
      const userId = req.user!.id;
      
      const ratingData = insertDestinationRatingSchema.parse(req.body);
      const rating = await storage.createDestinationRating({
        ...ratingData,
        destination,
        userId
      });
      
      res.status(201).json(rating);
    } catch (error) {
      console.error('Erro ao criar avaliação do destino:', error);
      res.status(400).json({ message: "Erro ao criar avaliação do destino" });
    }
  });

  app.get("/api/destinations/:destination/rating-average", async (req, res) => {
    try {
      const destination = decodeURIComponent(req.params.destination);
      const average = await storage.getDestinationAverageRating(destination);
      res.json(average);
    } catch (error) {
      console.error('Erro ao calcular média do destino:', error);
      res.status(500).json({ message: "Erro ao calcular média do destino" });
    }
  });

  // Verification routes
  app.get("/api/verification/requests", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const requests = await storage.getVerificationRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error('Erro ao buscar solicitações de verificação:', error);
      res.status(500).json({ message: "Erro ao buscar solicitações de verificação" });
    }
  });

  app.post("/api/verification/requests", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const requestData = insertVerificationRequestSchema.parse(req.body);
      
      const request = await storage.createVerificationRequest({
        ...requestData,
        userId
      });
      
      res.status(201).json(request);
    } catch (error) {
      console.error('Erro ao criar solicitação de verificação:', error);
      res.status(400).json({ message: "Erro ao criar solicitação de verificação" });
    }
  });

  app.patch("/api/verification/requests/:id", requireAuth, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { status, rejectionReason } = req.body;
      const reviewerId = req.user!.id;
      
      const updatedRequest = await storage.updateVerificationRequest(
        requestId,
        status,
        reviewerId,
        rejectionReason
      );
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "Solicitação não encontrada" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      console.error('Erro ao atualizar solicitação de verificação:', error);
      res.status(400).json({ message: "Erro ao atualizar solicitação de verificação" });
    }
  });

  // ============ ACTIVITIES ROUTES ============

  // Get all activities with optional filters
  app.get("/api/activities", async (req, res) => {
    try {
      const { search, category, location, priceRange, difficulty, duration, rating, sortBy } = req.query;
      
      const filters: any = {};
      if (search) filters.search = search as string;
      if (category) filters.category = category as string;
      if (location) filters.location = location as string;
      if (priceRange) filters.priceRange = priceRange as string;
      if (difficulty) filters.difficulty = difficulty as string;
      if (duration) filters.duration = duration as string;
      if (rating) filters.rating = rating as string;
      if (sortBy) filters.sortBy = sortBy as string;
      
      const activities = await storage.getActivities(filters);
      res.json(activities);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      res.status(500).json({ message: "Erro ao buscar atividades" });
    }
  });

  // Get single activity
  app.get("/api/activities/:id", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const activity = await storage.getActivity(activityId);
      
      if (!activity) {
        return res.status(404).json({ message: "Atividade não encontrada" });
      }
      
      res.json(activity);
    } catch (error) {
      console.error('Erro ao buscar atividade:', error);
      res.status(500).json({ message: "Erro ao buscar atividade" });
    }
  });

  // Create new activity (requires authentication)
  app.post("/api/activities", requireAuth, async (req, res) => {
    try {
      const creatorId = req.user!.id;
      const activityData = insertActivitySchema.parse(req.body);
      
      const activity = await storage.createActivity({
        ...activityData,
        createdById: creatorId
      });
      
      res.status(201).json(activity);
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      res.status(400).json({ message: "Erro ao criar atividade" });
    }
  });

  // Update activity (requires authentication and ownership)
  app.put("/api/activities/:id", requireAuth, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if user owns the activity
      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Atividade não encontrada" });
      }
      
      if (activity.createdById !== userId) {
        return res.status(403).json({ message: "Você não tem permissão para editar esta atividade" });
      }
      
      const updates = req.body;
      const updatedActivity = await storage.updateActivity(activityId, updates);
      
      if (!updatedActivity) {
        return res.status(404).json({ message: "Atividade não encontrada" });
      }
      
      res.json(updatedActivity);
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      res.status(400).json({ message: "Erro ao atualizar atividade" });
    }
  });

  // Delete activity (requires authentication and ownership)
  app.delete("/api/activities/:id", requireAuth, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if user owns the activity
      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Atividade não encontrada" });
      }
      
      if (activity.createdById !== userId) {
        return res.status(403).json({ message: "Você não tem permissão para deletar esta atividade" });
      }
      
      const deleted = await storage.deleteActivity(activityId);
      if (!deleted) {
        return res.status(404).json({ message: "Atividade não encontrada" });
      }
      
      res.json({ message: "Atividade deletada com sucesso" });
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
      res.status(500).json({ message: "Erro ao deletar atividade" });
    }
  });

  // ============ ACTIVITY REVIEWS ROUTES ============

  // Get reviews for an activity
  app.get("/api/activities/:id/reviews", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const reviews = await storage.getActivityReviews(activityId);
      res.json(reviews);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      res.status(500).json({ message: "Erro ao buscar avaliações" });
    }
  });

  // Create review for an activity (requires authentication)
  app.post("/api/activities/:id/reviews", requireAuth, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const userId = req.user!.id;
      const reviewData = insertActivityReviewSchema.parse(req.body);
      
      const review = await storage.createActivityReview({
        ...reviewData,
        activityId,
        userId
      });
      
      res.status(201).json(review);
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      res.status(400).json({ message: "Erro ao criar avaliação" });
    }
  });

  // ============ ACTIVITY BOOKINGS ROUTES ============

  // Get bookings for an activity
  app.get("/api/activities/:id/bookings", requireAuth, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const bookings = await storage.getActivityBookings(activityId);
      res.json(bookings);
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      res.status(500).json({ message: "Erro ao buscar reservas" });
    }
  });

  // Get user's bookings
  app.get("/api/users/bookings", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const bookings = await storage.getUserActivityBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error('Erro ao buscar reservas do usuário:', error);
      res.status(500).json({ message: "Erro ao buscar reservas do usuário" });
    }
  });

  // Create booking for an activity (requires authentication)
  app.post("/api/activities/:id/bookings", requireAuth, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const userId = req.user!.id;
      const bookingData = insertActivityBookingSchema.parse(req.body);
      
      const booking = await storage.createActivityBooking({
        ...bookingData,
        activityId,
        userId
      });
      
      res.status(201).json(booking);
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      res.status(400).json({ message: "Erro ao criar reserva" });
    }
  });

  // Update booking status (requires authentication)
  app.patch("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { status } = req.body;
      
      const updatedBooking = await storage.updateActivityBooking(bookingId, status);
      
      if (!updatedBooking) {
        return res.status(404).json({ message: "Reserva não encontrada" });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
      res.status(400).json({ message: "Erro ao atualizar reserva" });
    }
  });

  // ===== ACTIVITY BUDGET PROPOSALS ROUTES =====
  
  // Get all budget proposals for an activity
  app.get("/api/activities/:id/proposals", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const proposals = await storage.getActivityBudgetProposals(activityId);
      res.json(proposals);
    } catch (error) {
      console.error('Erro ao buscar propostas de orçamento:', error);
      res.status(500).json({ message: "Erro ao buscar propostas de orçamento" });
    }
  });

  // Create new budget proposal for activity (requires authentication)
  app.post("/api/activities/:id/proposals", requireAuth, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      console.log('🔍 Dados recebidos para criação de proposta:', {
        activityId,
        userId,
        body: req.body,
        bodyType: typeof req.body,
        inclusionsType: typeof req.body.inclusions,
        exclusionsType: typeof req.body.exclusions,
        inclusionsValue: req.body.inclusions,
        exclusionsValue: req.body.exclusions
      });
      
      // Pré-processar dados se necessário
      const processedBody = {
        ...req.body,
        inclusions: Array.isArray(req.body.inclusions) ? req.body.inclusions : [],
        exclusions: Array.isArray(req.body.exclusions) ? req.body.exclusions : []
      };
      
      console.log('🔧 Dados pré-processados:', processedBody);
      
      const proposalData = insertActivityBudgetProposalSchema.parse(processedBody);
      
      console.log('✅ Dados validados:', proposalData);
      
      const proposal = await storage.createActivityBudgetProposal({
        ...proposalData,
        activityId,
        createdBy: userId
      });
      
      console.log('✅ Proposta criada com sucesso:', proposal);
      
      res.status(201).json(proposal);
    } catch (error) {
      console.error('❌ Erro ao criar proposta de orçamento:', error);
      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
      res.status(400).json({ message: "Erro ao criar proposta de orçamento", error: error.message });
    }
  });

  // Update budget proposal (requires authentication)
  app.patch("/api/proposals/:id", requireAuth, async (req, res) => {
    try {
      const proposalId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedProposal = await storage.updateActivityBudgetProposal(proposalId, updates);
      
      if (!updatedProposal) {
        return res.status(404).json({ message: "Proposta não encontrada" });
      }
      
      res.json(updatedProposal);
    } catch (error) {
      console.error('Erro ao atualizar proposta:', error);
      res.status(400).json({ message: "Erro ao atualizar proposta" });
    }
  });

  // Delete budget proposal (requires authentication)
  app.delete("/api/proposals/:id", requireAuth, async (req, res) => {
    try {
      const proposalId = parseInt(req.params.id);
      const deleted = await storage.deleteActivityBudgetProposal(proposalId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Proposta não encontrada" });
      }
      
      res.json({ message: "Proposta excluída com sucesso" });
    } catch (error) {
      console.error('Erro ao excluir proposta:', error);
      res.status(400).json({ message: "Erro ao excluir proposta" });
    }
  });

  // Vote on budget proposal (requires authentication)
  app.post("/api/proposals/:id/vote", requireAuth, async (req, res) => {
    try {
      const proposalId = parseInt(req.params.id);
      const { increment } = req.body; // true for upvote, false for downvote
      
      const updatedProposal = await storage.voteActivityBudgetProposal(proposalId, increment);
      
      if (!updatedProposal) {
        return res.status(404).json({ message: "Proposta não encontrada" });
      }
      
      res.json(updatedProposal);
    } catch (error) {
      console.error('Erro ao votar na proposta:', error);
      res.status(400).json({ message: "Erro ao votar na proposta" });
    }
  });

  // ===== TRIP ACTIVITIES ROUTES =====
  
  // Get all activities for a trip
  app.get("/api/trips/:id/activities", async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const tripActivities = await storage.getTripActivities(tripId);
      res.json(tripActivities);
    } catch (error) {
      console.error('Erro ao buscar atividades da viagem:', error);
      res.status(500).json({ message: "Erro ao buscar atividades da viagem" });
    }
  });

  // Add activity to trip with selected proposal (requires authentication)
  app.post("/api/trips/:id/activities", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const userId = req.user!.id;
      const tripActivityData = insertTripActivitySchema.parse(req.body);
      
      console.log('🔍 Adicionando atividade à viagem:', {
        tripId,
        userId,
        activityId: tripActivityData.activityId,
        budgetProposalId: tripActivityData.budgetProposalId,
        totalCost: tripActivityData.totalCost,
        participants: tripActivityData.participants
      });
      
      const tripActivity = await storage.addActivityToTrip({
        ...tripActivityData,
        tripId,
        addedBy: userId
      });
      
      console.log('✅ Atividade adicionada com sucesso:', tripActivity);
      res.status(201).json(tripActivity);
    } catch (error) {
      console.error('Erro ao adicionar atividade à viagem:', error);
      res.status(400).json({ message: "Erro ao adicionar atividade à viagem" });
    }
  });

  // Update trip activity (requires authentication)
  app.patch("/api/trip-activities/:id", requireAuth, async (req, res) => {
    try {
      const tripActivityId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedTripActivity = await storage.updateTripActivity(tripActivityId, updates);
      
      if (!updatedTripActivity) {
        return res.status(404).json({ message: "Atividade da viagem não encontrada" });
      }
      
      res.json(updatedTripActivity);
    } catch (error) {
      console.error('Erro ao atualizar atividade da viagem:', error);
      res.status(400).json({ message: "Erro ao atualizar atividade da viagem" });
    }
  });

  // Remove activity from trip (requires authentication)
  app.delete("/api/trip-activities/:id", requireAuth, async (req, res) => {
    try {
      const tripActivityId = parseInt(req.params.id);
      const deleted = await storage.removeTripActivity(tripActivityId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Atividade da viagem não encontrada" });
      }
      
      res.json({ message: "Atividade removida da viagem com sucesso" });
    } catch (error) {
      console.error('Erro ao remover atividade da viagem:', error);
      res.status(400).json({ message: "Erro ao remover atividade da viagem" });
    }
  });

  // Get user trips in same location as activity (for adding activities to trips)
  app.get("/api/users/:userId/trips-in-location", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { location } = req.query;
      
      if (!location) {
        return res.status(400).json({ message: "Localização é obrigatória" });
      }
      
      // Ensure user can only see their own trips
      if (userId !== req.user!.id) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const trips = await storage.getUserTripsInLocation(userId, location as string);
      res.json(trips);
    } catch (error) {
      console.error('Erro ao buscar viagens do usuário na localização:', error);
      res.status(500).json({ message: "Erro ao buscar viagens do usuário" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
