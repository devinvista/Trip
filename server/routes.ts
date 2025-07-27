
import type { Express } from "express";
import { createServer, type Server } from "http";

import { setupAuth } from "./auth";
import { storage } from "./storage";
import { syncTripParticipants } from "./sync-participants.js";
import { insertTripSchema, insertMessageSchema, insertTripRequestSchema, insertExpenseSchema, insertExpenseSplitSchema, insertUserRatingSchema, insertLocalidadeRatingSchema, insertVerificationRequestSchema, insertActivitySchema, insertActivityReviewSchema, insertActivityBookingSchema, insertActivityBudgetProposalSchema, insertTripActivitySchema, insertRatingReportSchema } from "@shared/schema";
import { db } from "./db";
import { activityReviews, activities, activityBudgetProposalVotes, users, userRatings, localidadeRatings, ratingReports, activityRatingHelpfulVotes, referralCodes, interestList } from "@shared/schema";
import { eq, and, desc, sql, ne } from "drizzle-orm";
import { z } from "zod";

// Middleware para verificar autenticação
function requireAuth(req: any, res: any, next: any) {
  console.log(`🔐 Verificando autenticação:`, {
    isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
    hasUser: !!req.user,
    sessionID: req.sessionID,
    session: !!req.session,
    sessionData: req.session,
    cookies: req.cookies,
    url: req.url
  });
  
  // Check both standard authentication and manual authentication
  const isAuth = (req.isAuthenticated && req.isAuthenticated()) || !!req.user;
  
  if (!isAuth || !req.user) {
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

  // Destinations routes
  app.get("/api/destinations", async (req, res) => {
    try {
      const { search } = req.query;
      const destinations = await storage.getDestinations(search as string);
      res.json(destinations);
    } catch (error) {
      console.error('Erro ao buscar destinos:', error);
      res.status(500).json({ message: "Erro ao buscar destinos" });
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
      
      const trips = await storage.getAllTrips();
      
      // Include creator info for each trip
      const tripsWithCreators = await Promise.all(
        trips.map(async (trip) => {
          const creator = await storage.getUserById(trip.creator_id);
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
      const trip = await storage.getTripById(tripId);
      
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      const creator = await storage.getUserById(trip.creator_id);
      const participants = await storage.getTripParticipants(tripId);
      
      // Check if user has a pending request
      let userRequest = null;
      if (req.isAuthenticated() && req.user) {
        const allRequests = await storage.getTripRequests(tripId);
        userRequest = allRequests.find(r => r.user_id === req.user!.id && r.status === 'pending');
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
        creator_id: req.user!.id 
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
      const trip = await storage.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }

      // Check if user is creator or accepted participant
      const isCreator = trip.creator_id === req.user.id;
      const participants = await storage.getTripParticipants(tripId);
      const isAcceptedParticipant = participants.some(
        (p: any) => p.user_id === req.user.id && p.status === 'accepted'
      );
      
      if (!isCreator && !isAcceptedParticipant) {
        return res.status(403).json({ message: "Apenas o criador e participantes aceitos podem editar a viagem" });
      }

      // Validate that max_participants is not less than current participants
      if (updates.max_participants && updates.max_participants < trip.current_participants) {
        return res.status(400).json({ 
          message: `Máximo de participantes não pode ser menor que ${trip.current_participants} (participantes atuais)` 
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
      const trip = await storage.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }

      if (trip.creator_id !== req.user.id) {
        return res.status(403).json({ message: "Apenas o criador pode excluir a viagem" });
      }

      if (trip.current_participants > 1) {
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
          const creator = await storage.getUserById(trip.creator_id);
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
      const { cover_image } = req.body;
      
      if (!cover_image) {
        return res.status(400).json({ message: "URL da imagem é obrigatória" });
      }
      
      const trip = await storage.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      // Only trip creator can update cover image
      if (trip.creator_id !== req.user!.id) {
        return res.status(403).json({ message: "Apenas o criador da viagem pode alterar a imagem" });
      }
      
      const updatedTrip = await storage.updateTrip(tripId, { cover_image });
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
      const { budget, budget_breakdown } = req.body;
      
      if (!budget || budget <= 0) {
        return res.status(400).json({ message: "Orçamento deve ser um valor positivo" });
      }
      
      const trip = await storage.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      // Only trip creator can update budget
      if (trip.creator_id !== req.user!.id) {
        return res.status(403).json({ message: "Apenas o criador da viagem pode alterar o orçamento" });
      }
      
      const updatedTrip = await storage.updateTrip(tripId, { budget, budget_breakdown });
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
      
      const trip = await storage.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      if (trip.creator_id === req.user!.id) {
        return res.status(400).json({ message: "Você não pode solicitar participação na sua própria viagem" });
      }
      
      // Check if user already has a pending request
      const existingRequests = await storage.getTripRequests(tripId);
      const userRequest = existingRequests.find(r => r.user_id === req.user!.id);
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
      const trip = await storage.getTripById(tripId);
      
      if (!trip || trip.creator_id !== req.user!.id) {
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
        await storage.addTripParticipant(request.trip_id, request.user_id);
        
        // Sync trip participant count based on actual accepted participants
        await syncTripParticipants(request.trip_id);
      }
      
      res.json(request);
    } catch (error) {
      console.error('Erro ao atualizar solicitação:', error);
      res.status(500).json({ message: "Erro ao atualizar solicitação" });
    }
  });

  // Get trip participants
  app.get("/api/trips/:id/participants", async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      
      const trip = await storage.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      const participants = await storage.getTripParticipants(tripId);
      res.json(participants);
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      res.status(500).json({ message: "Erro ao buscar participantes" });
    }
  });

  // Update trip planned activities
  app.patch("/api/trips/:id/activities", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const { planned_activities } = req.body;
      
      const trip = await storage.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      // Check if user is creator or participant
      const isCreator = trip.creator_id === req.user!.id;
      const participants = await storage.getTripParticipants(tripId);
      const isParticipant = participants.some(p => p.user_id === req.user!.id && p.status === 'accepted');
      
      if (!isCreator && !isParticipant) {
        return res.status(403).json({ message: "Você não tem permissão para editar as atividades desta viagem" });
      }
      
      const updatedTrip = await storage.updateTripActivities(tripId, planned_activities);
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
      const userIdToRemove = parseInt(req.params.user_id);
      
      const trip = await storage.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      // Verificar se o usuário atual tem permissão (é o próprio participante ou o organizador)
      const isOwnParticipation = req.user!.id === userIdToRemove;
      const isOrganizer = trip.creator_id === req.user!.id;
      
      if (!isOwnParticipation && !isOrganizer) {
        return res.status(403).json({ message: "Você não tem permissão para remover este participante" });
      }
      
      // Verificar se o usuário é realmente um participante
      const participants = await storage.getTripParticipants(tripId);
      const participant = participants.find(p => p.user_id === userIdToRemove && p.status === 'accepted');
      
      if (!participant) {
        return res.status(404).json({ message: "Participante não encontrado nesta viagem" });
      }
      
      // Remover participante
      await storage.removeTripParticipant(tripId, userIdToRemove);
      
      // Atualizar contador de participantes
      const updatedTrip = await storage.getTripById(tripId);
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
      const trip = await storage.getTripById(tripId);
      if (!trip) {
        console.log(`❌ Viagem ${tripId} não encontrada`);
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      console.log(`✅ Viagem encontrada: ${trip.title} (criador: ${trip.creator_id})`);
      
      const participants = await storage.getTripParticipants(tripId);
      console.log(`👥 Participantes da viagem:`, participants.map(p => ({ userId: p.user_id, status: p.status })));
      
      const isParticipant = participants.some(p => p.user_id === req.user!.id && p.status === 'accepted');
      const isCreator = trip.creator_id === req.user!.id;
      
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
      const trip = await storage.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      const participants = await storage.getTripParticipants(tripId);
      const isParticipant = participants.some(p => p.user_id === req.user!.id);
      const isCreator = trip.creator_id === req.user!.id;
      
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
      const user = await storage.getUserById(userId);
      
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
        trip_id: tripId
      });
      
      // Verify user is a participant of the trip
      const participants = await storage.getTripParticipants(tripId);
      const isParticipant = participants.some(p => p.user_id === req.user!.id && p.status === 'accepted');
      
      if (!isParticipant) {
        return res.status(403).json({ message: "Você deve ser um participante da viagem para adicionar despesas" });
      }
      
      // Create the expense
      const expense = await storage.createExpense({
        ...expenseData,
        paid_by: req.user!.id
      });
      
      // Create splits based on selected participants
      let splitParticipants: number[];
      if (req.body.splitWith === 'all') {
        // Split equally among all participants (including future ones)
        splitParticipants = participants.filter(p => p.status === 'accepted').map(p => p.user_id);
      } else {
        splitParticipants = req.body.splitWith || participants.filter(p => p.status === 'accepted').map(p => p.user_id);
      }
      
      const splitAmount = expenseData.amount / splitParticipants.length;
      
      console.log('Split participants:', splitParticipants);
      console.log('Split amount per person:', splitAmount);
      
      const splitData = splitParticipants.map((userId: number) => ({
        user_id: userId,
        amount: splitAmount,
        paid: userId === req.user!.id // Payer's split is automatically marked as paid
      }));
      
      console.log('Split data to create:', splitData);
      
      const splits = await storage.createExpenseSplits(expense.id, splitData);
      
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
      const isParticipant = participants.some(p => p.user_id === req.user!.id && p.status === 'accepted');
      
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
      const trip = await storage.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      const participants = await storage.getTripParticipants(tripId);
      const isParticipant = participants.some(p => p.user_id === req.user!.id && p.status === 'accepted');
      const isCreator = trip.creator_id === req.user!.id;
      
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
      const { fullName, email, phone, bio, location, languages, interests, travelStyle, travelStyles } = req.body;
      
      console.log('🔍 Dados recebidos para atualização de perfil:', {
        userId: req.user!.id,
        fullName,
        email,
        phone,
        bio,
        location,
        languages,
        interests,
        travelStyles: travelStyles || (travelStyle ? [travelStyle] : [])
      });
      
      // Prepare update data with proper field names
      const updateData = {
        fullName,
        email,
        phone: phone.replace(/\D/g, ''), // Remove formatting from phone
        bio,
        location,
        languages,
        interests,
        travelStyles: travelStyles || (travelStyle ? [travelStyle] : [])
      };
      
      console.log('🔍 Dados para atualização no banco:', updateData);
      
      const updatedUser = await storage.updateUser(req.user!.id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      console.log('✅ Perfil atualizado com sucesso:', updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      res.status(500).json({ message: "Erro ao atualizar perfil", error: error.message });
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
          if (p.user_id !== userId) {
            travelPartners.add(p.user_id);
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
      
      // Find all users who were referred by this user's referral code (excluding self-referrals)
      const referredUsers = await db.select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        createdAt: users.createdAt,
        isVerified: users.isVerified
      })
      .from(users)
      .where(and(
        eq(users.referredBy, referralCode),
        ne(users.id, userId) // Exclude self-referrals
      ));
      
      console.log(`🔍 Buscando usuários indicados por código: ${referralCode}`);
      console.log(`📋 Encontrados ${referredUsers.length} usuários indicados`);
      
      const referralData = {
        code: referralCode,
        referredUsers: referredUsers
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
      const user = await storage.getUserById(userId);
      
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

  // Enhanced User Rating routes with verification checks
  app.get("/api/users/:id/ratings", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const ratings = await storage.getUserRatings(userId);
      
      // Filter out hidden ratings
      const visibleRatings = ratings.filter(rating => !rating.isHidden);
      
      res.json(visibleRatings);
    } catch (error) {
      console.error('Erro ao buscar avaliações do usuário:', error);
      res.status(500).json({ message: "Erro ao buscar avaliações" });
    }
  });

  app.post("/api/users/:id/ratings", requireAuth, async (req, res) => {
    try {
      const ratedUserId = parseInt(req.params.id);
      const raterUserId = req.user!.id;
      
      // Only verified users can rate
      if (!req.user!.isVerified) {
        return res.status(403).json({ message: "Apenas usuários verificados podem avaliar" });
      }
      
      // Prevent self-rating
      if (ratedUserId === raterUserId) {
        return res.status(400).json({ message: "Não é possível avaliar a si mesmo" });
      }
      
      // Check if user already rated this user
      const existingRating = await db
        .select()
        .from(userRatings)
        .where(and(
          eq(userRatings.ratedUserId, ratedUserId),
          eq(userRatings.raterUserId, raterUserId)
        ))
        .limit(1);
      
      if (existingRating.length > 0) {
        return res.status(400).json({ message: "Você já avaliou este usuário" });
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

  // Edit user rating (only within 7 days)
  app.put("/api/users/:id/ratings/:ratingId", requireAuth, async (req, res) => {
    try {
      const ratingId = parseInt(req.params.ratingId);
      const userId = req.user!.id;
      
      // Only verified users can edit ratings
      if (!req.user!.isVerified) {
        return res.status(403).json({ message: "Apenas usuários verificados podem editar avaliações" });
      }
      
      // Check if rating exists and belongs to user
      const existingRating = await db
        .select()
        .from(userRatings)
        .where(and(
          eq(userRatings.id, ratingId),
          eq(userRatings.raterUserId, userId)
        ))
        .limit(1);
      
      if (existingRating.length === 0) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }
      
      const rating = existingRating[0];
      
      // Check if rating is within 7 days edit window
      const daysSinceCreation = Math.floor((Date.now() - rating.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 7) {
        return res.status(403).json({ message: "Período de edição expirado (7 dias)" });
      }
      
      const ratingData = insertUserRatingSchema.parse(req.body);
      
      await db
        .update(userRatings)
        .set({
          ...ratingData,
          updatedAt: new Date()
        })
        .where(eq(userRatings.id, ratingId));
      
      res.json({ message: "Avaliação atualizada com sucesso" });
    } catch (error) {
      console.error('Erro ao editar avaliação:', error);
      res.status(400).json({ message: "Erro ao editar avaliação" });
    }
  });

  // Delete user rating (only within 7 days)
  app.delete("/api/users/:id/ratings/:ratingId", requireAuth, async (req, res) => {
    try {
      const ratingId = parseInt(req.params.ratingId);
      const userId = req.user!.id;
      
      // Check if rating exists and belongs to user
      const existingRating = await db
        .select()
        .from(userRatings)
        .where(and(
          eq(userRatings.id, ratingId),
          eq(userRatings.raterUserId, userId)
        ))
        .limit(1);
      
      if (existingRating.length === 0) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }
      
      const rating = existingRating[0];
      
      // Check if rating is within 7 days edit window
      const daysSinceCreation = Math.floor((Date.now() - rating.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 7) {
        return res.status(403).json({ message: "Período de exclusão expirado (7 dias)" });
      }
      
      await db
        .delete(userRatings)
        .where(eq(userRatings.id, ratingId));
      
      res.json({ message: "Avaliação excluída com sucesso" });
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      res.status(500).json({ message: "Erro ao excluir avaliação" });
    }
  });

  // Enhanced Destination Rating routes
  app.get("/api/destinations/:destination/ratings", async (req, res) => {
    try {
      const destination = decodeURIComponent(req.params.destination);
      const ratings = await storage.getDestinationRatings(destination);
      
      // Filter out hidden ratings
      const visibleRatings = ratings.filter(rating => !rating.isHidden);
      
      res.json(visibleRatings);
    } catch (error) {
      console.error('Erro ao buscar avaliações do destino:', error);
      res.status(500).json({ message: "Erro ao buscar avaliações do destino" });
    }
  });

  app.post("/api/destinations/:destination/ratings", requireAuth, async (req, res) => {
    try {
      const destination = decodeURIComponent(req.params.destination);
      const userId = req.user!.id;
      
      // Only verified users can rate
      if (!req.user!.isVerified) {
        return res.status(403).json({ message: "Apenas usuários verificados podem avaliar destinos" });
      }
      
      // Check if user already rated this destination
      const existingRating = await db
        .select()
        .from(destinationRatings)
        .where(and(
          eq(destinationRatings.destination, destination),
          eq(destinationRatings.user_id, userId)
        ))
        .limit(1);
      
      if (existingRating.length > 0) {
        return res.status(400).json({ message: "Você já avaliou este destino" });
      }
      
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

  // Edit destination rating (only within 7 days)
  app.put("/api/destinations/:destination/ratings/:ratingId", requireAuth, async (req, res) => {
    try {
      const ratingId = parseInt(req.params.ratingId);
      const userId = req.user!.id;
      
      // Only verified users can edit ratings
      if (!req.user!.isVerified) {
        return res.status(403).json({ message: "Apenas usuários verificados podem editar avaliações" });
      }
      
      // Check if rating exists and belongs to user
      const existingRating = await db
        .select()
        .from(destinationRatings)
        .where(and(
          eq(destinationRatings.id, ratingId),
          eq(destinationRatings.user_id, userId)
        ))
        .limit(1);
      
      if (existingRating.length === 0) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }
      
      const rating = existingRating[0];
      
      // Check if rating is within 7 days edit window
      const daysSinceCreation = Math.floor((Date.now() - rating.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 7) {
        return res.status(403).json({ message: "Período de edição expirado (7 dias)" });
      }
      
      const ratingData = insertDestinationRatingSchema.parse(req.body);
      
      await db
        .update(destinationRatings)
        .set({
          ...ratingData,
          updatedAt: new Date()
        })
        .where(eq(destinationRatings.id, ratingId));
      
      res.json({ message: "Avaliação atualizada com sucesso" });
    } catch (error) {
      console.error('Erro ao editar avaliação:', error);
      res.status(400).json({ message: "Erro ao editar avaliação" });
    }
  });

  // Delete destination rating (only within 7 days)
  app.delete("/api/destinations/:destination/ratings/:ratingId", requireAuth, async (req, res) => {
    try {
      const ratingId = parseInt(req.params.ratingId);
      const userId = req.user!.id;
      
      // Check if rating exists and belongs to user
      const existingRating = await db
        .select()
        .from(destinationRatings)
        .where(and(
          eq(destinationRatings.id, ratingId),
          eq(destinationRatings.user_id, userId)
        ))
        .limit(1);
      
      if (existingRating.length === 0) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }
      
      const rating = existingRating[0];
      
      // Check if rating is within 7 days edit window
      const daysSinceCreation = Math.floor((Date.now() - rating.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 7) {
        return res.status(403).json({ message: "Período de exclusão expirado (7 dias)" });
      }
      
      await db
        .delete(destinationRatings)
        .where(eq(destinationRatings.id, ratingId));
      
      res.json({ message: "Avaliação excluída com sucesso" });
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      res.status(500).json({ message: "Erro ao excluir avaliação" });
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

  // ============ RATING REPORT ROUTES ============
  
  // Report a rating
  app.post("/api/ratings/report", requireAuth, async (req, res) => {
    try {
      const reporterId = req.user!.id;
      const reportData = insertRatingReportSchema.parse(req.body);
      
      // Check if user already reported this rating
      const existingReport = await db
        .select()
        .from(ratingReports)
        .where(and(
          eq(ratingReports.reporterId, reporterId),
          eq(ratingReports.ratingType, reportData.ratingType),
          eq(ratingReports.ratingId, reportData.ratingId)
        ))
        .limit(1);
      
      if (existingReport.length > 0) {
        return res.status(400).json({ message: "Você já reportou esta avaliação" });
      }
      
      await db.insert(ratingReports).values({
        ...reportData,
        reporterId
      });
      
      console.log('📝 Report de avaliação criado:', {
        reporterId,
        ratingType: reportData.ratingType,
        ratingId: reportData.ratingId,
        reason: reportData.reason
      });
      
      // Increment report count on the rating
      if (reportData.ratingType === 'user') {
        await db
          .update(userRatings)
          .set({
            reportCount: sql`${userRatings.reportCount} + 1`
          })
          .where(eq(userRatings.id, reportData.ratingId));
          
        // Auto-hide if report count >= 5
        const updatedRating = await db
          .select()
          .from(userRatings)
          .where(eq(userRatings.id, reportData.ratingId))
          .limit(1);
          
        if (updatedRating.length > 0 && updatedRating[0].reportCount >= 5) {
          await db
            .update(userRatings)
            .set({ isHidden: true })
            .where(eq(userRatings.id, reportData.ratingId));
        }
      } else if (reportData.ratingType === 'destination') {
        await db
          .update(destinationRatings)
          .set({
            reportCount: sql`${destinationRatings.reportCount} + 1`
          })
          .where(eq(destinationRatings.id, reportData.ratingId));
          
        // Auto-hide if report count >= 5
        const updatedRating = await db
          .select()
          .from(destinationRatings)
          .where(eq(destinationRatings.id, reportData.ratingId))
          .limit(1);
          
        if (updatedRating.length > 0 && updatedRating[0].reportCount >= 5) {
          await db
            .update(destinationRatings)
            .set({ isHidden: true })
            .where(eq(destinationRatings.id, reportData.ratingId));
        }
      } else if (reportData.ratingType === 'activity') {
        await db
          .update(activityReviews)
          .set({
            reportCount: sql`${activityReviews.reportCount} + 1`
          })
          .where(eq(activityReviews.id, reportData.ratingId));
          
        // Auto-hide if report count >= 5
        const updatedRating = await db
          .select()
          .from(activityReviews)
          .where(eq(activityReviews.id, reportData.ratingId))
          .limit(1);
          
        if (updatedRating.length > 0 && updatedRating[0].reportCount >= 5) {
          await db
            .update(activityReviews)
            .set({ isHidden: true })
            .where(eq(activityReviews.id, reportData.ratingId));
        }
      }
      
      res.status(201).json({ message: "Avaliação reportada com sucesso" });
    } catch (error) {
      console.error('Erro ao reportar avaliação:', error);
      res.status(400).json({ message: "Erro ao reportar avaliação" });
    }
  });

  // ============ ACTIVITIES ROUTES ============

  // Get all activities with optional filters
  app.get("/api/activities", async (req, res) => {
    try {
      const { search, category, location, priceRange, difficulty, duration, rating, sortBy } = req.query;
      
      const filters: any = {};
      if (search) filters.search = search as string;
      // Handle multiple categories
      if (category) {
        const categories = Array.isArray(category) ? category : [category];
        filters.categories = categories as string[];
      }
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

  // Get most popular activities (based on ratings count and average)
  // Activities hierarchical grouping endpoints
  app.get("/api/activities/hierarchy", async (req, res) => {
    try {
      const hierarchyData = await db.select({
        countryType: activities.countryType,
        region: activities.region,
        city: activities.city,
        count: sql<number>`count(*)`.as('count')
      })
      .from(activities)
      .where(eq(activities.isActive, true))
      .groupBy(activities.countryType, activities.region, activities.city)
      .orderBy(activities.countryType, activities.region, activities.city);
      
      // Organize data hierarchically
      const hierarchy: { [key: string]: { [key: string]: { [key: string]: number } } } = {};
      
      hierarchyData.forEach(item => {
        if (!hierarchy[item.countryType]) hierarchy[item.countryType] = {};
        if (!hierarchy[item.countryType][item.region || 'Sem Região']) hierarchy[item.countryType][item.region || 'Sem Região'] = {};
        hierarchy[item.countryType][item.region || 'Sem Região'][item.city] = item.count;
      });
      
      res.json(hierarchy);
    } catch (error) {
      console.error("Erro ao buscar hierarquia de atividades:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/activities/by-location", async (req, res) => {
    try {
      const { countryType, region, city, ...filters } = req.query;
      
      let query = db.select().from(activities).where(eq(activities.isActive, true));
      
      if (countryType) {
        query = query.where(eq(activities.countryType, countryType as string));
      }
      if (region) {
        query = query.where(eq(activities.region, region as string));
      }
      if (city) {
        query = query.where(eq(activities.city, city as string));
      }
      
      // Apply other filters
      if (filters.category) {
        query = query.where(eq(activities.category, filters.category as string));
      }
      
      const result = await query.orderBy(desc(activities.averageRating), desc(activities.totalRatings));
      res.json(result);
    } catch (error) {
      console.error("Erro ao buscar atividades por localização:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/activities/suggestions/popular", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      
      const activities = await storage.getActivities({});
      
      // Sort by popularity score (average rating * log(total ratings + 1))
      const popularActivities = activities
        .map(activity => ({
          ...activity,
          popularityScore: Number(activity.averageRating || 0) * Math.log((activity.totalRatings || 0) + 1)
        }))
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(0, limit)
        .map(({ popularityScore, ...activity }) => activity);
      
      res.json(popularActivities);
    } catch (error) {
      console.error('Erro ao buscar atividades populares:', error);
      res.status(500).json({ message: "Erro ao buscar atividades populares" });
    }
  });

  // Get best rated activities (4.5+ stars)
  app.get("/api/activities/suggestions/top-rated", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      
      const activities = await storage.getActivities({});
      
      // Filter by high ratings and sort by average rating
      const topRatedActivities = activities
        .filter(activity => Number(activity.averageRating || 0) >= 4.5)
        .sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0))
        .slice(0, limit);
      
      res.json(topRatedActivities);
    } catch (error) {
      console.error('Erro ao buscar atividades mais bem avaliadas:', error);
      res.status(500).json({ message: "Erro ao buscar atividades mais bem avaliadas" });
    }
  });

  // Get personalized suggestions based on user's upcoming trips
  app.get("/api/activities/suggestions/personalized", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 6;
      
      // Get user's upcoming trips
      const createdTrips = await storage.getTripsByCreator(userId);
      const participatingTrips = await storage.getTripsByParticipant(userId);
      const allTrips = [...createdTrips, ...participatingTrips];
      
      const upcomingTrips = allTrips.filter(trip => {
        const tripDate = new Date(trip.startDate);
        const now = new Date();
        return tripDate > now;
      });
      
      if (upcomingTrips.length === 0) {
        // Fallback to popular activities
        return res.redirect('/api/activities/suggestions/popular?limit=' + limit);
      }
      
      // Extract destinations from upcoming trips
      const upcomingDestinations = upcomingTrips.map(trip => trip.destination);
      
      // Get all activities
      const activities = await storage.getActivities({});
      
      // Filter activities that match upcoming destinations
      const matchingActivities = activities.filter(activity => {
        const activityCity = activity.location.split(',')[0].trim().toLowerCase();
        return upcomingDestinations.some(destination => {
          const destCity = destination.split(',')[0].trim().toLowerCase();
          return activityCity.includes(destCity) || destCity.includes(activityCity);
        });
      });
      
      // Sort by rating and popularity
      const personalizedActivities = matchingActivities
        .map(activity => ({
          ...activity,
          popularityScore: Number(activity.averageRating || 0) * Math.log((activity.totalRatings || 0) + 1)
        }))
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(0, limit)
        .map(({ popularityScore, ...activity }) => activity);
      
      res.json(personalizedActivities);
    } catch (error) {
      console.error('Erro ao buscar sugestões personalizadas:', error);
      res.status(500).json({ message: "Erro ao buscar sugestões personalizadas" });
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

  // Get reviews for an activity (filter out hidden reviews)
  app.get("/api/activities/:id/reviews", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const reviews = await db
        .select({
          id: activityReviews.id,
          activityId: activityReviews.activityId,
          rating: activityReviews.rating,
          review: activityReviews.review,
          photos: activityReviews.photos,
          visitDate: activityReviews.visitDate,
          helpfulVotes: activityReviews.helpfulVotes,
          isVerified: activityReviews.isVerified,
          isHidden: activityReviews.isHidden,
          reportCount: activityReviews.reportCount,
          createdAt: activityReviews.createdAt,
          user: {
            id: users.id,
            username: users.username,
            fullName: users.fullName,
            profilePhoto: users.profilePhoto,
            averageRating: users.averageRating,
            isVerified: users.isVerified
          }
        })
        .from(activityReviews)
        .innerJoin(users, eq(activityReviews.user_id, users.id))
        .where(and(
          eq(activityReviews.activityId, activityId),
          eq(activityReviews.isHidden, false)
        ))
        .orderBy(desc(activityReviews.createdAt))
        .limit(limit)
        .offset(offset);

      res.json(reviews);
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Create a new activity review (enhanced with verification)
  app.post("/api/activities/:id/reviews", requireAuth, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Only verified users can create reviews
      if (!req.user!.isVerified) {
        return res.status(403).json({ message: "Apenas usuários verificados podem criar avaliações" });
      }
      
      console.log('🔍 Creating review - Activity ID:', activityId, 'User ID:', userId);
      console.log('🔍 Request body:', req.body);
      console.log('🔍 User from req:', req.user);
      console.log('🔍 Authentication status:', req.isAuthenticated());
      
      // Validate request body
      const validatedData = insertActivityReviewSchema.parse({
        ...req.body,
        activityId: activityId
      });
      
      console.log('🔍 Validated data:', validatedData);

      // Check if user already reviewed this activity
      const existingReview = await db
        .select()
        .from(activityReviews)
        .where(and(
          eq(activityReviews.activityId, activityId),
          eq(activityReviews.user_id, userId)
        ))
        .limit(1);

      if (existingReview.length > 0) {
        // Check if review is within 7 days edit window
        const daysSinceCreation = Math.floor((Date.now() - existingReview[0].createdAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCreation > 7) {
          return res.status(403).json({ message: "Período de edição expirado (7 dias)" });
        }
        
        // Update existing review instead of creating new one
        await db.update(activityReviews)
          .set({
            rating: validatedData.rating,
            review: validatedData.review,
            photos: validatedData.photos || [],
            visitDate: validatedData.visitDate || null,
            updatedAt: new Date()
          })
          .where(eq(activityReviews.id, existingReview[0].id));
        
        const reviewId = existingReview[0].id;
        
        // Update activity's average rating
        const allReviews = await db
          .select({ rating: activityReviews.rating })
          .from(activityReviews)
          .where(eq(activityReviews.activityId, activityId));

        const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await db.update(activities)
          .set({
            averageRating: averageRating.toFixed(2),
            totalRatings: allReviews.length
          })
          .where(eq(activities.id, activityId));

        // Return the updated review with user data
        const reviewWithUser = await db
          .select({
            id: activityReviews.id,
            activityId: activityReviews.activityId,
            rating: activityReviews.rating,
            review: activityReviews.review,
            photos: activityReviews.photos,
            visitDate: activityReviews.visitDate,
            helpfulVotes: activityReviews.helpfulVotes,
            isVerified: activityReviews.isVerified,
            createdAt: activityReviews.createdAt,
            user: {
              id: users.id,
              username: users.username,
              fullName: users.fullName,
              profilePhoto: users.profilePhoto,
              averageRating: users.averageRating,
              isVerified: users.isVerified
            }
          })
          .from(activityReviews)
          .innerJoin(users, eq(activityReviews.user_id, users.id))
          .where(eq(activityReviews.id, reviewId))
          .limit(1);

        return res.status(200).json(reviewWithUser[0]);
      }

      // Create the review
      const insertResult = await db.insert(activityReviews).values({
        activityId,
        userId,
        rating: validatedData.rating,
        review: validatedData.review,
        photos: validatedData.photos || [],
        visitDate: validatedData.visitDate || null
      });
      
      // Get the inserted review ID
      const reviewId = Number(insertResult.insertId);

      // Update activity's average rating
      const allReviews = await db
        .select({ rating: activityReviews.rating })
        .from(activityReviews)
        .where(eq(activityReviews.activityId, activityId));

      const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await db.update(activities)
        .set({
          averageRating: averageRating.toFixed(2),
          totalRatings: allReviews.length
        })
        .where(eq(activities.id, activityId));

      // Return the new review with user data
      const reviewWithUser = await db
        .select({
          id: activityReviews.id,
          activityId: activityReviews.activityId,
          rating: activityReviews.rating,
          review: activityReviews.review,
          photos: activityReviews.photos,
          visitDate: activityReviews.visitDate,
          helpfulVotes: activityReviews.helpfulVotes,
          isVerified: activityReviews.isVerified,
          createdAt: activityReviews.createdAt,
          user: {
            id: users.id,
            username: users.username,
            fullName: users.fullName,
            profilePhoto: users.profilePhoto,
            averageRating: users.averageRating,
            isVerified: users.isVerified
          }
        })
        .from(activityReviews)
        .innerJoin(users, eq(activityReviews.user_id, users.id))
        .where(eq(activityReviews.id, reviewId))
        .limit(1);

      res.status(201).json(reviewWithUser[0]);
    } catch (error) {
      console.error('❌ Erro ao criar avaliação:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Edit activity review (only within 7 days and by verified users)
  app.put("/api/activities/:id/reviews/:reviewId", requireAuth, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      const userId = req.user!.id;
      
      // Only verified users can edit reviews
      if (!req.user!.isVerified) {
        return res.status(403).json({ message: "Apenas usuários verificados podem editar avaliações" });
      }
      
      // Check if review exists and belongs to user
      const existingReview = await db
        .select()
        .from(activityReviews)
        .where(and(
          eq(activityReviews.id, reviewId),
          eq(activityReviews.user_id, userId)
        ))
        .limit(1);
      
      if (existingReview.length === 0) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }
      
      const review = existingReview[0];
      
      // Check if review is within 7 days edit window
      const daysSinceCreation = Math.floor((Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 7) {
        return res.status(403).json({ message: "Período de edição expirado (7 dias)" });
      }
      
      const reviewData = insertActivityReviewSchema.parse(req.body);
      
      await db
        .update(activityReviews)
        .set({
          ...reviewData,
          updatedAt: new Date()
        })
        .where(eq(activityReviews.id, reviewId));
      
      res.json({ message: "Avaliação atualizada com sucesso" });
    } catch (error) {
      console.error('Erro ao editar avaliação:', error);
      res.status(400).json({ message: "Erro ao editar avaliação" });
    }
  });

  // Delete activity review (only within 7 days)
  app.delete("/api/activities/:id/reviews/:reviewId", requireAuth, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      const userId = req.user!.id;
      
      // Check if review exists and belongs to user
      const existingReview = await db
        .select()
        .from(activityReviews)
        .where(and(
          eq(activityReviews.id, reviewId),
          eq(activityReviews.user_id, userId)
        ))
        .limit(1);
      
      if (existingReview.length === 0) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }
      
      const review = existingReview[0];
      
      // Check if review is within 7 days edit window
      const daysSinceCreation = Math.floor((Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 7) {
        return res.status(403).json({ message: "Período de exclusão expirado (7 dias)" });
      }
      
      await db
        .delete(activityReviews)
        .where(eq(activityReviews.id, reviewId));
      
      res.json({ message: "Avaliação excluída com sucesso" });
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      res.status(500).json({ message: "Erro ao excluir avaliação" });
    }
  });

  // Update helpful votes for a review
  app.post("/api/reviews/:id/helpful", requireAuth, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);

      await db.update(activityReviews)
        .set({
          helpfulVotes: sql`${activityReviews.helpfulVotes} + 1`
        })
        .where(eq(activityReviews.id, reviewId));

      // Get the updated review
      const updatedReview = await db
        .select()
        .from(activityReviews)
        .where(eq(activityReviews.id, reviewId))
        .limit(1);

      res.json(updatedReview[0]);
    } catch (error) {
      console.error('❌ Erro ao marcar avaliação como útil:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
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
        body: req.body
      });
      
      const proposalData = insertActivityBudgetProposalSchema.parse(req.body);
      
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
      const userId = req.user!.id;
      
      const updatedProposal = await storage.voteActivityBudgetProposal(proposalId, userId, increment);
      
      if (!updatedProposal) {
        return res.status(404).json({ message: "Proposta não encontrada" });
      }
      
      res.json(updatedProposal);
    } catch (error) {
      console.error('Erro ao votar na proposta:', error);
      res.status(400).json({ message: "Erro ao votar na proposta" });
    }
  });

  // Check if user has voted on an activity
  app.get("/api/activities/:id/user-vote", requireAuth, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      const vote = await storage.getUserVoteForActivity(userId, activityId);
      
      res.json({ hasVoted: !!vote, vote });
    } catch (error) {
      console.error('Erro ao verificar voto do usuário:', error);
      res.status(500).json({ message: "Erro ao verificar voto" });
    }
  });

  // Check if user has voted on a specific proposal
  app.get("/api/proposals/:id/user-vote", requireAuth, async (req, res) => {
    try {
      const proposalId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      const vote = await storage.getUserVoteForProposal(userId, proposalId);
      
      res.json({ hasVoted: !!vote, vote });
    } catch (error) {
      console.error('Erro ao verificar voto do usuário para proposta:', error);
      res.status(500).json({ message: "Erro ao verificar voto" });
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
      const userId = parseInt(req.params.user_id);
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

  // ===== TRAVEL COMPANIONS ROUTES =====

  // Get user's travel companions
  app.get("/api/user/travel-companions", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get user's trips where they participated
      const createdTrips = await storage.getTripsByCreator(userId);
      const participatingTrips = await storage.getTripsByParticipant(userId);
      
      const allTrips = [...createdTrips, ...participatingTrips];
      const companionsMap = new Map(); // Use Map to track unique companions
      
      // Get all unique companions from all trips
      for (const trip of allTrips) {
        const participants = await storage.getTripParticipants(trip.id);
        for (const participant of participants) {
          if (participant.user_id !== userId && participant.status === 'accepted') {
            const user = await storage.getUserById(participant.user_id);
            if (user) {
              const companionId = user.id;
              
              // Check if we already have this companion
              if (!companionsMap.has(companionId)) {
                companionsMap.set(companionId, {
                  id: user.id,
                  fullName: user.fullName,
                  username: user.username,
                  email: user.email,
                  location: user.location,
                  profilePhoto: user.profilePhoto,
                  isVerified: user.isVerified,
                  bio: user.bio,
                  averageRating: user.averageRating || "0.0",
                  tripsCount: 1,
                  lastTrip: trip.endDate
                });
              } else {
                // Update trip count and last trip date if this trip is more recent
                const existingCompanion = companionsMap.get(companionId);
                existingCompanion.tripsCount += 1;
                
                // Update last trip if this trip is more recent
                if (new Date(trip.endDate) > new Date(existingCompanion.lastTrip)) {
                  existingCompanion.lastTrip = trip.endDate;
                }
              }
            }
          }
        }
      }
      
      const uniqueCompanions = Array.from(companionsMap.values());
      res.json(uniqueCompanions);
    } catch (error) {
      console.error('Erro ao buscar companheiros de viagem:', error);
      res.status(500).json({ message: "Erro ao buscar companheiros de viagem" });
    }
  });

  // Rate a travel companion
  app.post("/api/user/rate-companion", requireAuth, async (req, res) => {
    try {
      const { companionId, rating, comment } = req.body;
      const userId = req.user!.id;
      
      // Only verified users can create ratings
      if (!req.user!.isVerified) {
        return res.status(403).json({ message: "Apenas usuários verificados podem criar avaliações" });
      }
      
      // Validate input
      if (!companionId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Dados inválidos para avaliação" });
      }
      
      // Check if users have traveled together
      const userTrips = await storage.getTripsByCreator(userId);
      const participatingTrips = await storage.getTripsByParticipant(userId);
      const allUserTrips = [...userTrips, ...participatingTrips];
      
      let sharedTripId = null;
      for (const trip of allUserTrips) {
        const participants = await storage.getTripParticipants(trip.id);
        if (participants.some(p => p.user_id === companionId && p.status === 'accepted')) {
          sharedTripId = trip.id;
          break;
        }
      }
      
      if (!sharedTripId) {
        return res.status(400).json({ message: "Você só pode avaliar companheiros de viagem que já viajaram com você" });
      }
      
      // Check if user already rated this companion for this trip
      console.log('🔍 Verificando se usuário já avaliou companheiro:', {
        companionId,
        userId,
        sharedTripId
      });
      
      const existingRating = await db
        .select()
        .from(userRatings)
        .where(and(
          eq(userRatings.ratedUserId, companionId),
          eq(userRatings.raterUserId, userId),
          eq(userRatings.trip_id, sharedTripId)
        ))
        .limit(1);

      console.log('📋 Avaliação existente encontrada:', existingRating.length > 0 ? existingRating[0] : 'Nenhuma');

      if (existingRating.length > 0) {
        // Check if rating is within 7 days edit window
        const daysSinceCreation = Math.floor((Date.now() - existingRating[0].createdAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCreation > 7) {
          return res.status(403).json({ message: "Período de edição expirado (7 dias)" });
        }
        
        // Update existing rating
        await db.update(userRatings)
          .set({
            rating: rating,
            comment: comment || null,
            updatedAt: new Date()
          })
          .where(eq(userRatings.id, existingRating[0].id));
        
        console.log('📝 Avaliação de companheiro atualizada:', {
          ratingId: existingRating[0].id,
          raterId: userId,
          ratedUserId: companionId,
          rating,
          comment: comment || null
        });
      } else {
        // Create new rating
        await db.insert(userRatings).values({
          tripId: sharedTripId,
          ratedUserId: companionId,
          raterUserId: userId,
          rating: rating,
          comment: comment || null,
          isHidden: false,
          reportCount: 0
        });
        
        console.log('📝 Avaliação de companheiro criada:', {
          tripId: sharedTripId,
          ratedUserId: companionId,
          raterUserId: userId,
          rating: rating,
          comment: comment || null
        });
      }
      
      // Update user's average rating
      const allUserRatings = await db
        .select({ rating: userRatings.rating })
        .from(userRatings)
        .where(and(
          eq(userRatings.ratedUserId, companionId),
          eq(userRatings.isHidden, false)
        ));

      const averageRating = allUserRatings.length > 0 
        ? parseFloat((allUserRatings.reduce((sum, r) => sum + r.rating, 0) / allUserRatings.length).toFixed(2))
        : 5.0;

      await db.update(users)
        .set({
          averageRating: averageRating.toString(),
          totalRatings: allUserRatings.length
        })
        .where(eq(users.id, companionId));
      
      console.log('📊 Média de avaliações atualizada para usuário', companionId, ':', averageRating);
      
      res.json({ 
        message: "Avaliação enviada com sucesso!",
        averageRating: averageRating
      });
    } catch (error) {
      console.error('Erro ao avaliar companheiro:', error);
      res.status(500).json({ message: "Erro ao enviar avaliação" });
    }
  });

  // Get user ratings for a specific user
  app.get("/api/user/:userId/ratings", async (req, res) => {
    try {
      const userId = parseInt(req.params.user_id);
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const ratings = await db
        .select({
          id: userRatings.id,
          rating: userRatings.rating,
          comment: userRatings.comment,
          createdAt: userRatings.createdAt,
          rater: {
            id: users.id,
            username: users.username,
            fullName: users.fullName,
            profilePhoto: users.profilePhoto,
            isVerified: users.isVerified
          }
        })
        .from(userRatings)
        .innerJoin(users, eq(userRatings.raterUserId, users.id))
        .where(and(
          eq(userRatings.ratedUserId, userId),
          eq(userRatings.isHidden, false)
        ))
        .orderBy(desc(userRatings.createdAt))
        .limit(limit)
        .offset(offset);

      res.json(ratings);
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações do usuário:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Edit user rating (within 7 days)
  app.put("/api/user/ratings/:ratingId", requireAuth, async (req, res) => {
    try {
      const ratingId = parseInt(req.params.ratingId);
      const userId = req.user!.id;
      const { rating, comment } = req.body;
      
      // Validate input
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Avaliação deve ser entre 1 e 5 estrelas" });
      }
      
      // Check if rating exists and belongs to user
      const existingRating = await db
        .select()
        .from(userRatings)
        .where(and(
          eq(userRatings.id, ratingId),
          eq(userRatings.raterUserId, userId)
        ))
        .limit(1);
      
      if (existingRating.length === 0) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }
      
      const ratingData = existingRating[0];
      
      // Check if rating is within 7 days edit window
      const daysSinceCreation = Math.floor((Date.now() - ratingData.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 7) {
        return res.status(403).json({ message: "Período de edição expirado (7 dias)" });
      }
      
      await db.update(userRatings)
        .set({
          rating: rating,
          comment: comment || null,
          updatedAt: new Date()
        })
        .where(eq(userRatings.id, ratingId));
      
      // Update user's average rating
      const allUserRatings = await db
        .select({ rating: userRatings.rating })
        .from(userRatings)
        .where(and(
          eq(userRatings.ratedUserId, ratingData.ratedUserId),
          eq(userRatings.isHidden, false)
        ));

      const averageRating = allUserRatings.length > 0 
        ? parseFloat((allUserRatings.reduce((sum, r) => sum + r.rating, 0) / allUserRatings.length).toFixed(2))
        : 5.0;

      await db.update(users)
        .set({
          averageRating: averageRating,
          totalRatings: allUserRatings.length
        })
        .where(eq(users.id, ratingData.ratedUserId));
      
      res.json({ message: "Avaliação atualizada com sucesso" });
    } catch (error) {
      console.error('Erro ao editar avaliação:', error);
      res.status(400).json({ message: "Erro ao editar avaliação" });
    }
  });

  // Delete user rating (within 7 days)
  app.delete("/api/user/ratings/:ratingId", requireAuth, async (req, res) => {
    try {
      const ratingId = parseInt(req.params.ratingId);
      const userId = req.user!.id;
      
      // Check if rating exists and belongs to user
      const existingRating = await db
        .select()
        .from(userRatings)
        .where(and(
          eq(userRatings.id, ratingId),
          eq(userRatings.raterUserId, userId)
        ))
        .limit(1);
      
      if (existingRating.length === 0) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }
      
      const ratingData = existingRating[0];
      
      // Check if rating is within 7 days edit window
      const daysSinceCreation = Math.floor((Date.now() - ratingData.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 7) {
        return res.status(403).json({ message: "Período de exclusão expirado (7 dias)" });
      }
      
      await db
        .delete(userRatings)
        .where(eq(userRatings.id, ratingId));
      
      // Update user's average rating
      const allUserRatings = await db
        .select({ rating: userRatings.rating })
        .from(userRatings)
        .where(and(
          eq(userRatings.ratedUserId, ratingData.ratedUserId),
          eq(userRatings.isHidden, false)
        ));

      const averageRating = allUserRatings.length > 0 
        ? parseFloat((allUserRatings.reduce((sum, r) => sum + r.rating, 0) / allUserRatings.length).toFixed(2))
        : 5.0;

      await db.update(users)
        .set({
          averageRating: averageRating,
          totalRatings: allUserRatings.length
        })
        .where(eq(users.id, ratingData.ratedUserId));
      
      res.json({ message: "Avaliação excluída com sucesso" });
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      res.status(500).json({ message: "Erro ao excluir avaliação" });
    }
  });

  // Remove a travel companion from network
  app.delete("/api/user/remove-companion/:companionId", requireAuth, async (req, res) => {
    try {
      const companionId = parseInt(req.params.companionId);
      const userId = req.user!.id;
      
      // Check if companion exists
      const companion = await storage.getUserById(companionId);
      if (!companion) {
        return res.status(404).json({ message: "Companheiro não encontrado" });
      }
      
      // For now, we'll just return success - in a real implementation,
      // this would remove from a companions/connections table
      console.log(`🗑️ Removendo companheiro ${companionId} da rede do usuário ${userId}`);
      
      res.json({ 
        message: "Companheiro removido da sua rede com sucesso!",
        removedCompanion: companion.fullName
      });
    } catch (error) {
      console.error('Erro ao remover companheiro:', error);
      res.status(500).json({ message: "Erro ao remover companheiro" });
    }
  });

  // ===== REFERRAL CODE VALIDATION ROUTES =====

  // Initialize default referral codes (development helper)
  app.post("/api/init-referral-codes", async (req, res) => {
    try {
      const codes = [
        { code: 'BETA2025', maxUses: 100 },
        { code: 'VIAJANTE', maxUses: 50 },
        { code: 'AMIGO123', maxUses: 10 },
        { code: 'TESTE', maxUses: 1 },
        { code: 'EXPLORER', maxUses: 25 },
      ];

      let created = 0;
      for (const codeData of codes) {
        // Check if code already exists
        const existing = await db.select()
          .from(referralCodes)
          .where(eq(referralCodes.code, codeData.code))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(referralCodes).values({
            code: codeData.code,
            maxUses: codeData.maxUses,
            currentUses: 0,
            isActive: true,
            createdBy: null,
            expiresAt: null,
          });
          created++;
        }
      }

      res.json({ 
        message: `${created} códigos de indicação criados com sucesso`,
        codes: codes.map(c => c.code)
      });
    } catch (error) {
      console.error('Erro ao criar códigos de indicação:', error);
      res.status(500).json({ message: "Erro ao criar códigos de indicação" });
    }
  });

  // Validate referral code
  app.post("/api/validate-referral", async (req, res) => {
    try {
      const { referralCode } = req.body;
      
      if (!referralCode) {
        return res.status(400).json({ message: "Código de indicação é obrigatório" });
      }

      const referral = await db.select()
        .from(referralCodes)
        .where(
          and(
            eq(referralCodes.code, referralCode),
            eq(referralCodes.isActive, true)
          )
        )
        .limit(1);

      if (referral.length === 0) {
        return res.status(400).json({ 
          message: "Código de indicação inválido",
          isValid: false
        });
      }

      const code = referral[0];
      
      // Check if code is expired
      if (code.expiresAt && new Date() > code.expiresAt) {
        return res.status(400).json({ 
          message: "Código de indicação expirado",
          isValid: false
        });
      }

      // Check if code has reached max uses
      if (code.currentUses >= code.maxUses) {
        return res.status(400).json({ 
          message: "Código de indicação esgotado",
          isValid: false
        });
      }

      res.json({ 
        message: "Código válido",
        isValid: true
      });
    } catch (error) {
      console.error('Erro ao validar código de indicação:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Add to interest list
  app.post("/api/interest-list", async (req, res) => {
    try {
      const { fullName, email, phone, referralCode } = req.body;
      
      if (!fullName || !email || !phone) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
      }

      // Check if email already exists in interest list
      const existingEntry = await db.select()
        .from(interestList)
        .where(eq(interestList.email, email))
        .limit(1);

      if (existingEntry.length > 0) {
        return res.status(400).json({ message: "Este email já está na lista de interesse" });
      }

      // Add to interest list
      await db.insert(interestList).values({
        fullName,
        email,
        phone,
        referralCode: referralCode || null,
        status: "pending"
      });

      res.json({ 
        message: "Obrigado pelo interesse! Entraremos em contato em breve.",
        success: true
      });
    } catch (error) {
      console.error('Erro ao adicionar à lista de interesse:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // User Requests endpoint
  app.get("/api/user-requests", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const requests = await storage.getUserTripRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      res.status(500).json({ message: "Erro ao buscar solicitações" });
    }
  });

  // Notifications endpoint (placeholder for now)
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      // For now, return empty array as notifications system is not fully implemented
      res.json([]);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      res.status(500).json({ message: "Erro ao buscar notificações" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
