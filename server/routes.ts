
import type { Express } from "express";
import { createServer, type Server } from "http";

import { setupAuth } from "./auth";
import { storage } from "./storage";
import { syncTripParticipants } from "./sync-participants.js";
import { insertTripSchema, insertMessageSchema, insertTripRequestSchema, insertExpenseSchema, insertExpenseSplitSchema, insertUserRatingSchema, insertDestinationRatingSchema, insertVerificationRequestSchema, insertActivitySchema, insertActivityReviewSchema, insertActivityBookingSchema, insertActivityBudgetProposalSchema, insertTripActivitySchema, insertRatingReportSchema } from "@shared/schema";
import { db } from "./db";
import { activityReviews, activities, activityBudgetProposalVotes, activityBudgetProposals, users, userRatings, destinationRatings, ratingReports, activityRatingHelpfulVotes, referralCodes, interestList } from "@shared/schema";
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
      const { destination, start_date, end_date, budget, travelStyle } = req.query;
      const filters: any = {};
      
      if (destination) filters.destination = destination as string;
      if (start_date) filters.start_date = new Date(start_date as string);
      if (end_date) filters.end_date = new Date(end_date as string);
      if (budget) filters.budget = parseInt(budget as string);
      if (travelStyle) filters.travel_style = travelStyle as string;
      
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
      const trip_id = parseInt(req.params.id);
      const trip = await storage.getTripById(trip_id);
      
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      const creator = await storage.getUserById(trip.creator_id);
      const participants = await storage.getTripParticipants(trip_id);
      
      // Check if user has a pending request
      let userRequest = null;
      if (req.isAuthenticated() && req.user) {
        const allRequests = await storage.getTripRequests(trip_id);
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
      const trip = await storage.createTrip(tripData);
      
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
      const trip_id = parseInt(req.params.id);
      const updates = req.body;

      console.log("📝 Atualizando viagem:", trip_id, "Updates:", updates);

      // Get the trip to verify ownership
      const trip = await storage.getTripById(trip_id);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }

      // Check if user is creator or accepted participant
      const isCreator = trip.creator_id === req.user.id;
      const participants = await storage.getTripParticipants(trip_id);
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

      // Process date fields to ensure they are proper Date objects
      const processedUpdates = { ...updates };
      
      if (processedUpdates.start_date) {
        console.log("📅 Original start_date:", processedUpdates.start_date, "Type:", typeof processedUpdates.start_date);
        
        // Always convert to Date object
        processedUpdates.start_date = new Date(processedUpdates.start_date);
        
        // Validate the date
        if (isNaN(processedUpdates.start_date.getTime())) {
          console.error("❌ Invalid start_date:", processedUpdates.start_date);
          return res.status(400).json({ message: "Data de início inválida" });
        }
        
        console.log("📅 Processed start_date:", processedUpdates.start_date, "ISO:", processedUpdates.start_date.toISOString());
      }
      
      if (processedUpdates.end_date) {
        console.log("📅 Original end_date:", processedUpdates.end_date, "Type:", typeof processedUpdates.end_date);
        
        // Always convert to Date object
        processedUpdates.end_date = new Date(processedUpdates.end_date);
        
        // Validate the date
        if (isNaN(processedUpdates.end_date.getTime())) {
          console.error("❌ Invalid end_date:", processedUpdates.end_date);
          return res.status(400).json({ message: "Data de fim inválida" });
        }
        
        console.log("📅 Processed end_date:", processedUpdates.end_date, "ISO:", processedUpdates.end_date.toISOString());
      }

      console.log("📝 Final updates being sent to database:", processedUpdates);

      const updatedTrip = await storage.updateTrip(trip_id, processedUpdates);
      if (!updatedTrip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }

      console.log("✅ Trip updated successfully:", updatedTrip);
      res.json(updatedTrip);
    } catch (error: any) {
      console.error("❌ Erro ao atualizar viagem:", error);
      console.error("❌ Stack trace:", error.stack);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Erro ao atualizar viagem" 
      });
    }
  });

  // Delete a trip (only creator can delete, and only if no other participants)
  app.delete("/api/trips/:id", requireAuth, async (req: any, res: any) => {
    try {
      const trip_id = parseInt(req.params.id);

      // Get the trip to verify ownership and participants
      const trip = await storage.getTripById(trip_id);
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

      const deleted = await storage.deleteTrip(trip_id);
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
      const trip_id = parseInt(req.params.id);
      const { cover_image } = req.body;
      
      if (!cover_image) {
        return res.status(400).json({ message: "URL da imagem é obrigatória" });
      }
      
      const trip = await storage.getTripById(trip_id);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      // Only trip creator can update cover image
      if (trip.creator_id !== req.user!.id) {
        return res.status(403).json({ message: "Apenas o criador da viagem pode alterar a imagem" });
      }
      
      const updatedTrip = await storage.updateTrip(trip_id, { cover_image: cover_image });
      res.json(updatedTrip);
    } catch (error) {
      console.error('Erro ao atualizar imagem da viagem:', error);
      res.status(500).json({ message: "Erro ao atualizar imagem da viagem" });
    }
  });

  // Update trip budget
  app.patch("/api/trips/:id/budget", requireAuth, async (req, res) => {
    try {
      const trip_id = parseInt(req.params.id);
      const { budget, budget_breakdown } = req.body;
      
      if (!budget || budget <= 0) {
        return res.status(400).json({ message: "Orçamento deve ser um valor positivo" });
      }
      
      const trip = await storage.getTripById(trip_id);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      // Only trip creator can update budget
      if (trip.creator_id !== req.user!.id) {
        return res.status(403).json({ message: "Apenas o criador da viagem pode alterar o orçamento" });
      }
      
      const updatedTrip = await storage.updateTrip(trip_id, { budget, budget_breakdown });
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
      if (!req.user!.is_verified) {
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
      const trip_id = parseInt(req.params.id);
      
      // Parse only the message from request body
      const { message } = req.body;
      
      const trip = await storage.getTripById(trip_id);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      if (trip.creator_id === req.user!.id) {
        return res.status(400).json({ message: "Você não pode solicitar participação na sua própria viagem" });
      }
      
      // Check if user already has a pending request
      const existingRequests = await storage.getTripRequests(trip_id);
      const userRequest = existingRequests.find(r => r.user_id === req.user!.id);
      if (userRequest && userRequest.status === 'pending') {
        return res.status(400).json({ message: "Você já tem uma solicitação pendente para esta viagem" });
      }
      
      const request = await storage.createTripRequest({ 
        message: message || "",
        trip_id, 
        user_id: req.user!.id 
      });
      
      res.status(201).json(request);
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      res.status(400).json({ message: "Erro ao enviar solicitação" });
    }
  });

  app.get("/api/trips/:id/requests", requireAuth, async (req, res) => {
    try {
      const trip_id = parseInt(req.params.id);
      const trip = await storage.getTripById(trip_id);
      
      if (!trip || trip.creator_id !== req.user!.id) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const requests = await storage.getTripRequests(trip_id);
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
        
        // Add this new participant to all existing common expenses (splitWith === 'all')
        await addParticipantToCommonExpenses(request.trip_id, request.user_id);
        
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
      const trip_id = parseInt(req.params.id);
      
      const trip = await storage.getTripById(trip_id);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      const participants = await storage.getTripParticipants(trip_id);
      res.json(participants);
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      res.status(500).json({ message: "Erro ao buscar participantes" });
    }
  });

  // Update trip planned activities
  app.patch("/api/trips/:id/activities", requireAuth, async (req, res) => {
    try {
      const trip_id = parseInt(req.params.id);
      const { planned_activities } = req.body;
      
      const trip = await storage.getTripById(trip_id);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      // Check if user is creator or participant
      const isCreator = trip.creator_id === req.user!.id;
      const participants = await storage.getTripParticipants(trip_id);
      const isParticipant = participants.some(p => p.user_id === req.user!.id && p.status === 'accepted');
      
      if (!isCreator && !isParticipant) {
        return res.status(403).json({ message: "Você não tem permissão para editar as atividades desta viagem" });
      }
      
      const updatedTrip = await storage.updateTripActivities(trip_id, planned_activities);
      res.json(updatedTrip);
    } catch (error) {
      console.error('Erro ao atualizar atividades:', error);
      res.status(500).json({ message: "Erro ao atualizar atividades" });
    }
  });

  // Remove participant from trip
  app.delete("/api/trips/:id/participants/:userId", requireAuth, async (req, res) => {
    try {
      const trip_id = parseInt(req.params.id);
      const userIdToRemove = parseInt(req.params.user_id || req.params.userId);
      
      const trip = await storage.getTripById(trip_id);
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
      const participants = await storage.getTripParticipants(trip_id);
      const participant = participants.find(p => p.user_id === userIdToRemove && p.status === 'accepted');
      
      if (!participant) {
        return res.status(404).json({ message: "Participante não encontrado nesta viagem" });
      }
      
      // Remover participante
      await storage.removeTripParticipant(trip_id, userIdToRemove);
      
      // Atualizar contador de participantes
      const updatedTrip = await storage.getTripById(trip_id);
      if (updatedTrip && updatedTrip.status !== 'cancelled') {
        // Sync trip participant count based on actual accepted participants
        await syncTripParticipants(trip_id);
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
      const trip_id = parseInt(req.params.id);
      console.log(`📨 Buscando mensagens para viagem ${trip_id} pelo usuário ${req.user!.id}`);
      
      // Check if user is participant or creator of the trip
      const trip = await storage.getTripById(trip_id);
      if (!trip) {
        console.log(`❌ Viagem ${trip_id} não encontrada`);
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      console.log(`✅ Viagem encontrada: ${trip.title} (criador: ${trip.creator_id})`);
      
      const participants = await storage.getTripParticipants(trip_id);
      console.log(`👥 Participantes da viagem:`, participants.map(p => ({ user_id: p.user_id, status: p.status })));
      
      const isParticipant = participants.some(p => p.user_id === req.user!.id && p.status === 'accepted');
      const isCreator = trip.creator_id === req.user!.id;
      
      console.log(`🔐 Verificação de acesso: isParticipant=${isParticipant}, isCreator=${isCreator}`);
      
      if (!isParticipant && !isCreator) {
        console.log(`❌ Acesso negado para usuário ${req.user!.id}`);
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const messages = await storage.getTripMessages(trip_id);
      console.log(`✅ ${messages.length} mensagens encontradas`);
      res.json(messages);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      res.status(500).json({ message: "Erro ao buscar mensagens" });
    }
  });

  app.post("/api/trips/:id/messages", requireAuth, async (req, res) => {
    try {
      const trip_id = parseInt(req.params.id);
      const messageData = insertMessageSchema.parse(req.body);
      
      // Check if user is participant or creator of the trip
      const trip = await storage.getTripById(trip_id);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      const participants = await storage.getTripParticipants(trip_id);
      const isParticipant = participants.some(p => p.user_id === req.user!.id);
      const isCreator = trip.creator_id === req.user!.id;
      
      if (!isParticipant && !isCreator) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const message = await storage.createMessage({ 
        ...messageData, 
        trip_id,
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
      const trip_id = parseInt(req.params.id);
      console.log('Dados recebidos para criação de despesa:', req.body);
      console.log('Usuário autenticado:', req.user);
      console.log('Trip ID parsed:', trip_id);
      console.log('Dados para schema:', {
        ...req.body,
        trip_id: trip_id
      });
      
      const expenseData = insertExpenseSchema.parse({
        ...req.body,
        trip_id: trip_id
      });
      
      // Verify user is a participant of the trip
      const participants = await storage.getTripParticipants(trip_id);
      const isParticipant = participants.some(p => p.user_id === req.user!.id && (p.status === 'accepted' || p.status === 'approved'));
      
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
      let splitCount: number;
      
      // Get trip details to know max_participants
      const trip = await storage.getTripById(trip_id);
      const approvedParticipants = participants.filter(p => p.status === 'approved');
      
      console.log('🔍 Dados da viagem:', {
        maxParticipants: trip?.max_participants,
        currentApproved: approvedParticipants.length,
        approvedIds: approvedParticipants.map(p => p.user_id)
      });
      
      if (req.body.splitWith === 'all') {
        // Split among current approved participants only
        // When new participants join, they will get their splits added automatically
        splitParticipants = approvedParticipants.map(p => p.user_id);
        splitCount = splitParticipants.length;
        console.log('✅ Dividindo despesa comum entre participantes aprovados atuais:', {
          currentApproved: splitParticipants.length,
          participantIds: splitParticipants,
          splitPerPerson: expenseData.amount / splitCount,
          totalAmount: expenseData.amount,
          note: 'Novos participantes receberão splits automaticamente ao entrar'
        });
      } else {
        // Use specific participants only
        splitParticipants = req.body.splitWith || approvedParticipants.map(p => p.user_id);
        splitCount = splitParticipants.length;
        console.log('✅ Dividindo entre participantes específicos:', {
          participants: splitParticipants,
          splitPerPerson: expenseData.amount / splitCount
        });
      }
      
      // Fallback: if no participants found, include only the payer
      if (splitParticipants.length === 0) {
        splitParticipants = [req.user!.id];
        splitCount = 1;
        console.log('⚠️ Fallback: Dividindo apenas com o pagador:', req.user!.id);
      }
      
      const splitAmount = expenseData.amount / splitCount;
      
      const splitData = splitParticipants.map((user_id: number) => ({
        user_id: user_id,
        amount: splitAmount,
        paid: user_id === req.user!.id // Payer's split is automatically marked as paid
      }));
      
      const splits = await storage.createExpenseSplits(expense.id, splitData);
      
      res.status(201).json({ expense, splits });
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      res.status(400).json({ message: "Erro ao criar despesa" });
    }
  });

  app.get("/api/trips/:id/expenses", requireAuth, async (req, res) => {
    try {
      const trip_id = parseInt(req.params.id);
      
      // Verify user is a participant of the trip
      const participants = await storage.getTripParticipants(trip_id);
      const isParticipant = participants.some(p => p.user_id === req.user!.id && (p.status === 'accepted' || p.status === 'approved'));
      
      if (!isParticipant) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const expenses = await storage.getTripExpenses(trip_id);
      res.json(expenses);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      res.status(500).json({ message: "Erro ao buscar despesas" });
    }
  });

  app.get("/api/trips/:id/balances", requireAuth, async (req, res) => {
    try {
      const trip_id = parseInt(req.params.id);
      
      // Verify user is a participant or creator of the trip
      const trip = await storage.getTripById(trip_id);
      if (!trip) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      
      const participants = await storage.getTripParticipants(trip_id);
      const isParticipant = participants.some(p => p.user_id === req.user!.id && (p.status === 'accepted' || p.status === 'approved'));
      const isCreator = trip.creator_id === req.user!.id;
      
      if (!isParticipant && !isCreator) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const balances = await storage.getTripBalances(trip_id);
      
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
      const { full_name, email, phone, bio, location, languages, interests, travelStyle, travelStyles } = req.body;
      
      console.log('🔍 Dados recebidos para atualização de perfil:', {
        user_id: req.user!.id,
        full_name,
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
        full_name,
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
        trip.status === 'completed' || new Date(trip.end_date) < new Date()
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
        average_rating: "5.0" // Mock rating for now
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
        full_name: users.full_name,
        email: users.email,
        created_at: users.created_at,
        is_verified: users.is_verified
      })
      .from(users)
      .where(and(
        eq(users.referred_by, referralCode),
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
        referrerName: user.full_name,
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
      const visibleRatings = ratings.filter(rating => !rating.is_hidden);
      
      res.json(visibleRatings);
    } catch (error) {
      console.error('Erro ao buscar avaliações do usuário:', error);
      res.status(500).json({ message: "Erro ao buscar avaliações" });
    }
  });

  app.post("/api/users/:id/ratings", requireAuth, async (req, res) => {
    try {
      const rated_user_id = parseInt(req.params.id);
      const rater_user_id = req.user!.id;
      
      // Only verified users can rate
      if (!req.user!.is_verified) {
        return res.status(403).json({ message: "Apenas usuários verificados podem avaliar" });
      }
      
      // Prevent self-rating
      if (rated_user_id === rater_user_id) {
        return res.status(400).json({ message: "Não é possível avaliar a si mesmo" });
      }
      
      // Check if user already rated this user
      const existingRating = await db
        .select()
        .from(userRatings)
        .where(and(
          eq(userRatings.rated_user_id, rated_user_id),
          eq(userRatings.rater_user_id, rater_user_id)
        ))
        .limit(1);
      
      if (existingRating.length > 0) {
        return res.status(400).json({ message: "Você já avaliou este usuário" });
      }
      
      const ratingData = insertUserRatingSchema.parse(req.body);
      const rating = await storage.createUserRating({
        ...ratingData,
        rated_user_id,
        rater_user_id
      });
      
      res.status(201).json(rating);
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      res.status(400).json({ message: "Erro ao criar avaliação" });
    }
  });

  // Edit user rating (only within 7 days)
  app.put("/api/users/:id/ratings/:rating_id", requireAuth, async (req, res) => {
    try {
      const rating_id = parseInt(req.params.rating_id);
      const userId = req.user!.id;
      
      // Only verified users can edit ratings
      if (!req.user!.is_verified) {
        return res.status(403).json({ message: "Apenas usuários verificados podem editar avaliações" });
      }
      
      // Check if rating exists and belongs to user
      const existingRating = await db
        .select()
        .from(userRatings)
        .where(and(
          eq(userRatings.id, rating_id),
          eq(userRatings.rater_user_id, userId)
        ))
        .limit(1);
      
      if (existingRating.length === 0) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }
      
      const rating = existingRating[0];
      
      // Check if rating is within 7 days edit window
      const daysSinceCreation = Math.floor((Date.now() - rating.created_at.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 7) {
        return res.status(403).json({ message: "Período de edição expirado (7 dias)" });
      }
      
      const ratingData = insertUserRatingSchema.parse(req.body);
      
      await db
        .update(userRatings)
        .set({
          ...ratingData,
          updated_at: new Date()
        })
        .where(eq(userRatings.id, rating_id));
      
      res.json({ message: "Avaliação atualizada com sucesso" });
    } catch (error) {
      console.error('Erro ao editar avaliação:', error);
      res.status(400).json({ message: "Erro ao editar avaliação" });
    }
  });

  // Delete user rating (only within 7 days)
  app.delete("/api/users/:id/ratings/:rating_id", requireAuth, async (req, res) => {
    try {
      const rating_id = parseInt(req.params.rating_id);
      const userId = req.user!.id;
      
      // Check if rating exists and belongs to user
      const existingRating = await db
        .select()
        .from(userRatings)
        .where(and(
          eq(userRatings.id, rating_id),
          eq(userRatings.rater_user_id, userId)
        ))
        .limit(1);
      
      if (existingRating.length === 0) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }
      
      const rating = existingRating[0];
      
      // Check if rating is within 7 days edit window
      const daysSinceCreation = Math.floor((Date.now() - rating.created_at.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 7) {
        return res.status(403).json({ message: "Período de exclusão expirado (7 dias)" });
      }
      
      await db
        .delete(userRatings)
        .where(eq(userRatings.id, rating_id));
      
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
      const visibleRatings = ratings.filter(rating => !rating.is_hidden);
      
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
      if (!req.user!.is_verified) {
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
  app.put("/api/destinations/:destination/ratings/:rating_id", requireAuth, async (req, res) => {
    try {
      const rating_id = parseInt(req.params.rating_id);
      const userId = req.user!.id;
      
      // Only verified users can edit ratings
      if (!req.user!.is_verified) {
        return res.status(403).json({ message: "Apenas usuários verificados podem editar avaliações" });
      }
      
      // Check if rating exists and belongs to user
      const existingRating = await db
        .select()
        .from(destinationRatings)
        .where(and(
          eq(destinationRatings.id, rating_id),
          eq(destinationRatings.user_id, userId)
        ))
        .limit(1);
      
      if (existingRating.length === 0) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }
      
      const rating = existingRating[0];
      
      // Check if rating is within 7 days edit window
      const daysSinceCreation = Math.floor((Date.now() - rating.created_at.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 7) {
        return res.status(403).json({ message: "Período de edição expirado (7 dias)" });
      }
      
      const ratingData = insertDestinationRatingSchema.parse(req.body);
      
      await db
        .update(destinationRatings)
        .set({
          ...ratingData,
          updated_at: new Date()
        })
        .where(eq(destinationRatings.id, rating_id));
      
      res.json({ message: "Avaliação atualizada com sucesso" });
    } catch (error) {
      console.error('Erro ao editar avaliação:', error);
      res.status(400).json({ message: "Erro ao editar avaliação" });
    }
  });

  // Delete destination rating (only within 7 days)
  app.delete("/api/destinations/:destination/ratings/:rating_id", requireAuth, async (req, res) => {
    try {
      const rating_id = parseInt(req.params.rating_id);
      const userId = req.user!.id;
      
      // Check if rating exists and belongs to user
      const existingRating = await db
        .select()
        .from(destinationRatings)
        .where(and(
          eq(destinationRatings.id, rating_id),
          eq(destinationRatings.user_id, userId)
        ))
        .limit(1);
      
      if (existingRating.length === 0) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }
      
      const rating = existingRating[0];
      
      // Check if rating is within 7 days edit window
      const daysSinceCreation = Math.floor((Date.now() - rating.created_at.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 7) {
        return res.status(403).json({ message: "Período de exclusão expirado (7 dias)" });
      }
      
      await db
        .delete(destinationRatings)
        .where(eq(destinationRatings.id, rating_id));
      
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
      const reporter_id = req.user!.id;
      const reportData = insertRatingReportSchema.parse(req.body);
      
      // Check if user already reported this rating
      const existingReport = await db
        .select()
        .from(ratingReports)
        .where(and(
          eq(ratingReports.reporter_id, reporter_id),
          eq(ratingReports.rating_type, reportData.rating_type),
          eq(ratingReports.rating_id, reportData.rating_id)
        ))
        .limit(1);
      
      if (existingReport.length > 0) {
        return res.status(400).json({ message: "Você já reportou esta avaliação" });
      }
      
      await db.insert(ratingReports).values({
        ...reportData,
        reporter_id
      });
      
      console.log('📝 Report de avaliação criado:', {
        reporter_id,
        rating_type: reportData.rating_type,
        rating_id: reportData.rating_id,
        reason: reportData.reason
      });
      
      // Increment report count on the rating
      if (reportData.rating_type === 'user') {
        await db
          .update(userRatings)
          .set({
            report_count: sql`${userRatings.report_count} + 1`
          })
          .where(eq(userRatings.id, reportData.rating_id));
          
        // Auto-hide if report count >= 5
        const updatedRating = await db
          .select()
          .from(userRatings)
          .where(eq(userRatings.id, reportData.rating_id))
          .limit(1);
          
        if (updatedRating.length > 0 && updatedRating[0].report_count >= 5) {
          await db
            .update(userRatings)
            .set({ is_hidden: true })
            .where(eq(userRatings.id, reportData.rating_id));
        }
      } else if (reportData.rating_type === 'destination') {
        await db
          .update(destinationRatings)
          .set({
            report_count: sql`${destinationRatings.report_count} + 1`
          })
          .where(eq(destinationRatings.id, reportData.rating_id));
          
        // Auto-hide if report count >= 5
        const updatedRating = await db
          .select()
          .from(destinationRatings)
          .where(eq(destinationRatings.id, reportData.rating_id))
          .limit(1);
          
        if (updatedRating.length > 0 && updatedRating[0].report_count >= 5) {
          await db
            .update(destinationRatings)
            .set({ is_hidden: true })
            .where(eq(destinationRatings.id, reportData.rating_id));
        }
      } else if (reportData.rating_type === 'activity') {
        await db
          .update(activityReviews)
          .set({
            report_count: sql`${activityReviews.report_count} + 1`
          })
          .where(eq(activityReviews.id, reportData.rating_id));
          
        // Auto-hide if report count >= 5
        const updatedRating = await db
          .select()
          .from(activityReviews)
          .where(eq(activityReviews.id, reportData.rating_id))
          .limit(1);
          
        if (updatedRating.length > 0 && updatedRating[0].report_count >= 5) {
          await db
            .update(activityReviews)
            .set({ is_hidden: true })
            .where(eq(activityReviews.id, reportData.rating_id));
        }
      }
      
      res.status(201).json({ message: "Avaliação reportada com sucesso" });
    } catch (error) {
      console.error('Erro ao reportar avaliação:', error);
      res.status(400).json({ message: "Erro ao reportar avaliação" });
    }
  });

  // ============ DESTINATIONS ROUTES ============
  
  // Get all available destinations for activities
  app.get("/api/destinations", async (req, res) => {
    try {
      const destinations = await storage.getAllDestinations();
      res.json(destinations);
    } catch (error) {
      console.error('Erro ao buscar destinos:', error);
      res.status(500).json({ message: "Erro ao buscar destinos" });
    }
  });

  // Get destination by ID
  app.get("/api/destinations/:id", async (req, res) => {
    try {
      const destinationId = parseInt(req.params.id);
      const destination = await storage.getDestinationById(destinationId);
      
      if (!destination) {
        return res.status(404).json({ message: "Destino não encontrado" });
      }
      
      res.json(destination);
    } catch (error) {
      console.error('Erro ao buscar destino:', error);
      res.status(500).json({ message: "Erro ao buscar destino" });
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
        countryType: activities.country_type,
        region: activities.region,
        city: activities.city,
        count: sql<number>`count(*)`.as('count')
      })
      .from(activities)
      .where(eq(activities.is_active, true))
      .groupBy(activities.country_type, activities.region, activities.city)
      .orderBy(activities.country_type, activities.region, activities.city);
      
      // Organize data hierarchically
      const hierarchy: { [key: string]: { [key: string]: { [key: string]: number } } } = {};
      
      hierarchyData.forEach(item => {
        const countryType = item.countryType || 'unknown';
        const region = item.region || 'Sem Região';
        const city = item.city || 'Sem Cidade';
        
        if (!hierarchy[countryType]) hierarchy[countryType] = {};
        if (!hierarchy[countryType][region]) hierarchy[countryType][region] = {};
        hierarchy[countryType][region][city] = item.count;
      });
      
      res.json(hierarchy);
    } catch (error) {
      console.error("Erro ao buscar hierarquia de atividades:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/activities/by-location", async (req, res) => {
    try {
      const { destination_id, countryType, region, city, ...filters } = req.query;
      
      let query = db.select().from(activities).where(eq(activities.is_active, true));
      
      // Prefer destination_id if provided
      if (destination_id) {
        query = query.where(eq(activities.destination_id, parseInt(destination_id as string)));
      } else {
        // Fallback to location filters for compatibility
        if (countryType) {
          query = query.where(eq(activities.country_type, countryType as string));
        }
        if (region) {
          query = query.where(eq(activities.region, region as string));
        }
        if (city) {
          query = query.where(eq(activities.city, city as string));
        }
      }
      
      // Apply other filters
      if (filters.category) {
        query = query.where(eq(activities.category, filters.category as string));
      }
      
      const result = await query.orderBy(desc(activities.average_rating), desc(activities.total_ratings));
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
          popularityScore: Number(activity.average_rating || 0) * Math.log((activity.total_ratings || 0) + 1)
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
        .filter(activity => Number(activity.average_rating || 0) >= 4.5)
        .sort((a, b) => Number(b.average_rating || 0) - Number(a.average_rating || 0))
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
        const tripDate = new Date(trip.start_date);
        const now = new Date();
        return tripDate > now;
      });
      
      if (upcomingTrips.length === 0) {
        // Fallback to popular activities
        return res.redirect('/api/activities/suggestions/popular?limit=' + limit);
      }
      
      // Extract destination IDs from upcoming trips
      const upcomingDestinationIds = upcomingTrips.map(trip => trip.destination_id);
      
      // Get activities that match upcoming destinations
      const matchingActivities = await db
        .select()
        .from(activities)
        .where(and(
          eq(activities.is_active, true),
          sql`${activities.destination_id} IN (${upcomingDestinationIds.join(',')})`
        ));
      
      // Sort by rating and popularity
      const personalizedActivities = matchingActivities
        .map(activity => ({
          ...activity,
          popularityScore: Number(activity.average_rating || 0) * Math.log((activity.total_ratings || 0) + 1)
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
      const activity_id = parseInt(req.params.id);
      const activity = await storage.getActivity(activity_id);
      
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
      
      // Validate destination exists and is active
      const { validateDestination } = await import("./activity-destination-helper");
      const isValidDestination = await validateDestination(activityData.destination_id);
      
      if (!isValidDestination) {
        return res.status(400).json({ message: "Destino inválido ou inativo" });
      }
      
      const activity = await storage.createActivity({
        ...activityData,
        created_by_id: creatorId
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
      const activity_id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if user owns the activity
      const activity = await storage.getActivity(activity_id);
      if (!activity) {
        return res.status(404).json({ message: "Atividade não encontrada" });
      }
      
      if (activity.created_by_id !== userId) {
        return res.status(403).json({ message: "Você não tem permissão para editar esta atividade" });
      }
      
      const updates = req.body;
      const updatedActivity = await storage.updateActivity(activity_id, updates);
      
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
      const activity_id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if user owns the activity
      const activity = await storage.getActivity(activity_id);
      if (!activity) {
        return res.status(404).json({ message: "Atividade não encontrada" });
      }
      
      if (activity.created_by_id !== userId) {
        return res.status(403).json({ message: "Você não tem permissão para deletar esta atividade" });
      }
      
      const deleted = await storage.deleteActivity(activity_id);
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
      const activity_id = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const reviews = await db
        .select({
          id: activityReviews.id,
          activity_id: activityReviews.activity_id,
          rating: activityReviews.rating,
          review: activityReviews.review,
          photos: activityReviews.photos,
          visit_date: activityReviews.visit_date,
          helpful_votes: activityReviews.helpful_votes,
          is_verified: activityReviews.is_verified,
          is_hidden: activityReviews.is_hidden,
          report_count: activityReviews.report_count,
          created_at: activityReviews.created_at,
          user: {
            id: users.id,
            username: users.username,
            full_name: users.full_name,
            profile_photo: users.profile_photo,
            average_rating: users.average_rating,
            is_verified: users.is_verified
          }
        })
        .from(activityReviews)
        .innerJoin(users, eq(activityReviews.user_id, users.id))
        .where(and(
          eq(activityReviews.activity_id, activity_id),
          eq(activityReviews.is_hidden, false)
        ))
        .orderBy(desc(activityReviews.created_at))
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
      const activity_id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Only verified users can create reviews
      if (!req.user!.is_verified) {
        return res.status(403).json({ message: "Apenas usuários verificados podem criar avaliações" });
      }
      
      console.log('🔍 Creating review - Activity ID:', activity_id, 'User ID:', userId);
      console.log('🔍 Request body:', req.body);
      console.log('🔍 User from req:', req.user);
      console.log('🔍 Authentication status:', req.isAuthenticated());
      
      // Validate request body
      const validatedData = insertActivityReviewSchema.parse({
        ...req.body,
        activity_id: activity_id
      });
      
      console.log('🔍 Validated data:', validatedData);

      // Check if user already reviewed this activity
      const existingReview = await db
        .select()
        .from(activityReviews)
        .where(and(
          eq(activityReviews.activity_id, activity_id),
          eq(activityReviews.user_id, userId)
        ))
        .limit(1);

      if (existingReview.length > 0) {
        // Check if review is within 7 days edit window
        const daysSinceCreation = Math.floor((Date.now() - existingReview[0].created_at.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCreation > 7) {
          return res.status(403).json({ message: "Período de edição expirado (7 dias)" });
        }
        
        // Update existing review instead of creating new one
        await db.update(activityReviews)
          .set({
            rating: validatedData.rating,
            review: validatedData.review,
            photos: validatedData.photos || [],
            visit_date: validatedData.visit_date || null,
            updated_at: new Date()
          })
          .where(eq(activityReviews.id, existingReview[0].id));
        
        const reviewId = existingReview[0].id;
        
        // Update activity's average rating
        const allReviews = await db
          .select({ rating: activityReviews.rating })
          .from(activityReviews)
          .where(eq(activityReviews.activity_id, activity_id));

        const average_rating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await db.update(activities)
          .set({
            average_rating: average_rating.toFixed(2),
            total_ratings: allReviews.length
          })
          .where(eq(activities.id, activity_id));

        // Return the updated review with user data
        const reviewWithUser = await db
          .select({
            id: activityReviews.id,
            activity_id: activityReviews.activity_id,
            rating: activityReviews.rating,
            review: activityReviews.review,
            photos: activityReviews.photos,
            visit_date: activityReviews.visit_date,
            helpful_votes: activityReviews.helpful_votes,
            is_verified: activityReviews.is_verified,
            created_at: activityReviews.created_at,
            user: {
              id: users.id,
              username: users.username,
              full_name: users.full_name,
              profile_photo: users.profile_photo,
              average_rating: users.average_rating,
              is_verified: users.is_verified
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
        activity_id,
        userId,
        rating: validatedData.rating,
        review: validatedData.review,
        photos: validatedData.photos || [],
        visit_date: validatedData.visit_date || null
      });
      
      // Get the inserted review ID
      const reviewId = Number(insertResult.insertId);

      // Update activity's average rating
      const allReviews = await db
        .select({ rating: activityReviews.rating })
        .from(activityReviews)
        .where(eq(activityReviews.activity_id, activity_id));

      const average_rating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await db.update(activities)
        .set({
          average_rating: average_rating.toFixed(2),
          total_ratings: allReviews.length
        })
        .where(eq(activities.id, activity_id));

      // Return the new review with user data
      const reviewWithUser = await db
        .select({
          id: activityReviews.id,
          activity_id: activityReviews.activity_id,
          rating: activityReviews.rating,
          review: activityReviews.review,
          photos: activityReviews.photos,
          visit_date: activityReviews.visit_date,
          helpful_votes: activityReviews.helpful_votes,
          is_verified: activityReviews.is_verified,
          created_at: activityReviews.created_at,
          user: {
            id: users.id,
            username: users.username,
            full_name: users.full_name,
            profile_photo: users.profile_photo,
            average_rating: users.average_rating,
            is_verified: users.is_verified
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
      if (!req.user!.is_verified) {
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
      const daysSinceCreation = Math.floor((Date.now() - review.created_at.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 7) {
        return res.status(403).json({ message: "Período de edição expirado (7 dias)" });
      }
      
      const reviewData = insertActivityReviewSchema.parse(req.body);
      
      await db
        .update(activityReviews)
        .set({
          ...reviewData,
          updated_at: new Date()
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
      const daysSinceCreation = Math.floor((Date.now() - review.created_at.getTime()) / (1000 * 60 * 60 * 24));
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
          helpful_votes: sql`${activityReviews.helpful_votes} + 1`
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
      const activity_id = parseInt(req.params.id);
      const bookings = await storage.getActivityBookings(activity_id);
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
      const activity_id = parseInt(req.params.id);
      const userId = req.user!.id;
      const bookingData = insertActivityBookingSchema.parse(req.body);
      
      const booking = await storage.createActivityBooking({
        ...bookingData,
        activity_id,
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
      const activity_id = parseInt(req.params.id);
      const proposals = await storage.getActivityBudgetProposals(activity_id);
      res.json(proposals);
    } catch (error) {
      console.error('Erro ao buscar propostas de orçamento:', error);
      res.status(500).json({ message: "Erro ao buscar propostas de orçamento" });
    }
  });

  // Create new budget proposal for activity (requires authentication)
  app.post("/api/activities/:id/proposals", requireAuth, async (req, res) => {
    try {
      const activity_id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      console.log('🔍 Dados recebidos para criação de proposta:', {
        activity_id,
        userId,
        body: req.body
      });
      
      const proposalData = insertActivityBudgetProposalSchema.parse(req.body);
      
      console.log('✅ Dados validados:', proposalData);
      
      const proposal = await storage.createActivityBudgetProposal({
        ...proposalData,
        activity_id,
        createdBy: user_id
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
      const activity_id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      const vote = await storage.getUserVoteForActivity(userId, activity_id);
      
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
      const trip_id = parseInt(req.params.id);
      const tripActivities = await storage.getTripActivities(trip_id);
      res.json(tripActivities);
    } catch (error) {
      console.error('Erro ao buscar atividades da viagem:', error);
      res.status(500).json({ message: "Erro ao buscar atividades da viagem" });
    }
  });

  // Add activity to trip with selected proposal (requires authentication)
  app.post("/api/trips/:id/activities", requireAuth, async (req, res) => {
    try {
      const trip_id = parseInt(req.params.id);
      const userId = req.user!.id;
      const tripActivityData = insertTripActivitySchema.parse(req.body);
      
      console.log('🔍 Adicionando atividade à viagem:', {
        trip_id,
        userId,
        activity_id: tripActivityData.activity_id,
        budgetProposalId: tripActivityData.budgetProposalId,
        totalCost: tripActivityData.totalCost,
        participants: tripActivityData.participants
      });
      
      const tripActivity = await storage.addActivityToTrip({
        ...tripActivityData,
        trip_id,
        addedBy: user_id
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
      const userId = parseInt(req.params.user_id || req.params.userId);
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
                  full_name: user.full_name,
                  username: user.username,
                  email: user.email,
                  location: user.location,
                  profile_photo: user.profile_photo,
                  is_verified: user.is_verified,
                  bio: user.bio,
                  average_rating: user.average_rating || "0.0",
                  tripsCount: 1,
                  lastTrip: trip.end_date
                });
              } else {
                // Update trip count and last trip date if this trip is more recent
                const existingCompanion = companionsMap.get(companionId);
                existingCompanion.tripsCount += 1;
                
                // Update last trip if this trip is more recent
                if (new Date(trip.end_date) > new Date(existingCompanion.lastTrip)) {
                  existingCompanion.lastTrip = trip.end_date;
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
      if (!req.user!.is_verified) {
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
          eq(userRatings.rated_user_id, companionId),
          eq(userRatings.rater_user_id, userId),
          eq(userRatings.trip_id, sharedTripId)
        ))
        .limit(1);

      console.log('📋 Avaliação existente encontrada:', existingRating.length > 0 ? existingRating[0] : 'Nenhuma');

      if (existingRating.length > 0) {
        // Check if rating is within 7 days edit window
        const daysSinceCreation = Math.floor((Date.now() - existingRating[0].created_at.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCreation > 7) {
          return res.status(403).json({ message: "Período de edição expirado (7 dias)" });
        }
        
        // Update existing rating
        await db.update(userRatings)
          .set({
            rating: rating,
            comment: comment || null,
            updated_at: new Date()
          })
          .where(eq(userRatings.id, existingRating[0].id));
        
        console.log('📝 Avaliação de companheiro atualizada:', {
          rating_id: existingRating[0].id,
          raterId: user_id,
          rated_user_id: companionId,
          rating,
          comment: comment || null
        });
      } else {
        // Create new rating
        await db.insert(userRatings).values({
          trip_id: sharedTripId,
          rated_user_id: companionId,
          rater_user_id: user_id,
          rating: rating,
          comment: comment || null,
          is_hidden: false,
          report_count: 0
        });
        
        console.log('📝 Avaliação de companheiro criada:', {
          trip_id: sharedTripId,
          rated_user_id: companionId,
          rater_user_id: user_id,
          rating: rating,
          comment: comment || null
        });
      }
      
      // Update user's average rating
      const allUserRatings = await db
        .select({ rating: userRatings.rating })
        .from(userRatings)
        .where(and(
          eq(userRatings.rated_user_id, companionId),
          eq(userRatings.is_hidden, false)
        ));

      const average_rating = allUserRatings.length > 0 
        ? parseFloat((allUserRatings.reduce((sum, r) => sum + r.rating, 0) / allUserRatings.length).toFixed(2))
        : 5.0;

      await db.update(users)
        .set({
          average_rating: average_rating.toString(),
          total_ratings: allUserRatings.length
        })
        .where(eq(users.id, companionId));
      
      console.log('📊 Média de avaliações atualizada para usuário', companionId, ':', average_rating);
      
      res.json({ 
        message: "Avaliação enviada com sucesso!",
        average_rating: average_rating
      });
    } catch (error) {
      console.error('Erro ao avaliar companheiro:', error);
      res.status(500).json({ message: "Erro ao enviar avaliação" });
    }
  });

  // Get user ratings for a specific user
  app.get("/api/user/:userId/ratings", async (req, res) => {
    try {
      const userId = parseInt(req.params.user_id || req.params.userId);
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const ratings = await db
        .select({
          id: userRatings.id,
          rating: userRatings.rating,
          comment: userRatings.comment,
          created_at: userRatings.created_at,
          rater: {
            id: users.id,
            username: users.username,
            full_name: users.full_name,
            profile_photo: users.profile_photo,
            is_verified: users.is_verified
          }
        })
        .from(userRatings)
        .innerJoin(users, eq(userRatings.rater_user_id, users.id))
        .where(and(
          eq(userRatings.rated_user_id, userId),
          eq(userRatings.is_hidden, false)
        ))
        .orderBy(desc(userRatings.created_at))
        .limit(limit)
        .offset(offset);

      res.json(ratings);
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações do usuário:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Edit user rating (within 7 days)
  app.put("/api/user/ratings/:rating_id", requireAuth, async (req, res) => {
    try {
      const rating_id = parseInt(req.params.rating_id);
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
          eq(userRatings.id, rating_id),
          eq(userRatings.rater_user_id, userId)
        ))
        .limit(1);
      
      if (existingRating.length === 0) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }
      
      const ratingData = existingRating[0];
      
      // Check if rating is within 7 days edit window
      const daysSinceCreation = Math.floor((Date.now() - ratingData.created_at.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 7) {
        return res.status(403).json({ message: "Período de edição expirado (7 dias)" });
      }
      
      await db.update(userRatings)
        .set({
          rating: rating,
          comment: comment || null,
          updated_at: new Date()
        })
        .where(eq(userRatings.id, rating_id));
      
      // Update user's average rating
      const allUserRatings = await db
        .select({ rating: userRatings.rating })
        .from(userRatings)
        .where(and(
          eq(userRatings.rated_user_id, ratingData.rated_user_id),
          eq(userRatings.is_hidden, false)
        ));

      const average_rating = allUserRatings.length > 0 
        ? parseFloat((allUserRatings.reduce((sum, r) => sum + r.rating, 0) / allUserRatings.length).toFixed(2))
        : 5.0;

      await db.update(users)
        .set({
          average_rating: average_rating,
          total_ratings: allUserRatings.length
        })
        .where(eq(users.id, ratingData.rated_user_id));
      
      res.json({ message: "Avaliação atualizada com sucesso" });
    } catch (error) {
      console.error('Erro ao editar avaliação:', error);
      res.status(400).json({ message: "Erro ao editar avaliação" });
    }
  });

  // Delete user rating (within 7 days)
  app.delete("/api/user/ratings/:rating_id", requireAuth, async (req, res) => {
    try {
      const rating_id = parseInt(req.params.rating_id);
      const userId = req.user!.id;
      
      // Check if rating exists and belongs to user
      const existingRating = await db
        .select()
        .from(userRatings)
        .where(and(
          eq(userRatings.id, rating_id),
          eq(userRatings.rater_user_id, userId)
        ))
        .limit(1);
      
      if (existingRating.length === 0) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }
      
      const ratingData = existingRating[0];
      
      // Check if rating is within 7 days edit window
      const daysSinceCreation = Math.floor((Date.now() - ratingData.created_at.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 7) {
        return res.status(403).json({ message: "Período de exclusão expirado (7 dias)" });
      }
      
      await db
        .delete(userRatings)
        .where(eq(userRatings.id, rating_id));
      
      // Update user's average rating
      const allUserRatings = await db
        .select({ rating: userRatings.rating })
        .from(userRatings)
        .where(and(
          eq(userRatings.rated_user_id, ratingData.rated_user_id),
          eq(userRatings.is_hidden, false)
        ));

      const average_rating = allUserRatings.length > 0 
        ? parseFloat((allUserRatings.reduce((sum, r) => sum + r.rating, 0) / allUserRatings.length).toFixed(2))
        : 5.0;

      await db.update(users)
        .set({
          average_rating: average_rating,
          total_ratings: allUserRatings.length
        })
        .where(eq(users.id, ratingData.rated_user_id));
      
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
        removedCompanion: companion.full_name
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
      const { full_name, email, phone, referralCode } = req.body;
      
      if (!full_name || !email || !phone) {
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
        full_name,
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

  // ===== ROTA REMOVIDA - SEED CONCLUÍDO =====
  /*
  app.post("/api/admin/seed-activities", async (req, res) => {
    try {
      console.log("🌱 Iniciando seed de atividades...");
      
      // Buscar destinos existentes
      const destinations = await storage.getDestinations();
      console.log(`📍 Encontrados ${destinations.length} destinos`);

      const atividadesPorDestino = {
        "Rio de Janeiro": [
          {
            title: "Cristo Redentor / Corcovado",
            description: "Visita ao icônico Cristo Redentor no topo do Corcovado, uma das sete maravilhas do mundo moderno. Desfrute de vistas panorâmicas espetaculares da cidade e baía de Guanabara.",
            category: "pontos_turisticos",
            duration: "3-4 horas",
            cover_image: "https://images.unsplash.com/photo-1539650116574-75c0c6d15f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
            images: ["https://images.unsplash.com/photo-1539650116574-75c0c6d15f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"],
            propostas: [
              { title: "Econômico", price: 85, description: "Van oficial básica até o Cristo Redentor", inclusions: ["Transporte em van oficial", "Entrada no santuário", "Seguro básico"] },
              { title: "Completo", price: 160, description: "Trem panorâmico + entrada + guia", inclusions: ["Trem do Corcovado", "Entrada no santuário", "Guia turístico", "Seguro"] },
              { title: "Premium", price: 320, description: "Tour privativo com transporte executivo", inclusions: ["Transporte privativo", "Guia especializado", "Fotografias profissionais", "Lanche gourmet"] }
            ]
          },
          {
            title: "Pão de Açúcar (Bondinho)",
            description: "Passeio no famoso bondinho do Pão de Açúcar com vistas espetaculares de 360° da cidade, baía de Guanabara e praias.",
            category: "pontos_turisticos",
            duration: "2-3 horas",
            cover_image: "https://images.unsplash.com/photo-1544737151-6e4b9ee48424?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
            images: ["https://images.unsplash.com/photo-1544737151-6e4b9ee48424?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"],
            propostas: [
              { title: "Econômico", price: 120, description: "Ingresso padrão do bondinho", inclusions: ["Bondinho ida e volta", "Acesso aos mirantes"] },
              { title: "Completo", price: 190, description: "Bondinho + guia turístico", inclusions: ["Bondinho ida e volta", "Guia especializado", "História e curiosidades"] },
              { title: "Premium", price: 350, description: "Bondinho + tour + passeio de helicóptero", inclusions: ["Bondinho", "Guia VIP", "Sobrevoo de helicóptero", "Drinks premium"] }
            ]
          },
          {
            title: "Trilha Pedra Bonita ou Dois Irmãos",
            description: "Trilhas com as melhores vistas panorâmicas do Rio de Janeiro. Ideal para amantes da natureza e fotografia.",
            category: "hiking",
            duration: "4-6 horas",
            cover_image: "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
            images: ["https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"],
            propostas: [
              { title: "Econômico", price: 0, description: "Trilha autoguiada com mapa", inclusions: ["Mapa detalhado", "Dicas de segurança"] },
              { title: "Completo", price: 100, description: "Trilha com guia local", inclusions: ["Guia especializado", "Kit primeiros socorros", "Água"] },
              { title: "Premium", price: 280, description: "Tour privado com transporte", inclusions: ["Transporte ida/volta", "Guia fotógrafo", "Lanche trilheiro", "Seguro"] }
            ]
          },
          {
            title: "Praias de Copacabana e Ipanema + Esportes",
            description: "Experiência completa nas praias mais famosas do mundo. Atividades aquáticas, esportes na areia e cultura carioca.",
            category: "water_sports",
            duration: "Dia inteiro",
            cover_image: "https://images.unsplash.com/photo-1544077960-604201fe74bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
            images: ["https://images.unsplash.com/photo-1544077960-604201fe74bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"],
            propostas: [
              { title: "Econômico", price: 0, description: "Acesso livre às praias", inclusions: ["Acesso livre", "Caminhada guiada", "Dicas locais"] },
              { title: "Completo", price: 100, description: "Aula de surf ou aluguel de bike", inclusions: ["Aula de surf (2h)", "Ou aluguel de bike", "Equipamentos incluídos"] },
              { title: "Premium", price: 300, description: "Passeio de lancha com drinks", inclusions: ["Passeio de lancha", "Open bar", "Petiscos", "Equipamentos aquáticos"] }
            ]
          },
          {
            title: "Tour Cultural Centro Histórico",
            description: "Descubra a rica história do Rio visitando o Theatro Municipal, Museu do Amanhã e outros marcos culturais.",
            category: "cultural",
            duration: "4-5 horas",
            cover_image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
            images: ["https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"],
            propostas: [
              { title: "Econômico", price: 30, description: "Ingressos básicos", inclusions: ["Entrada museus", "Mapa autoguiado"] },
              { title: "Completo", price: 90, description: "Tour guiado + transporte", inclusions: ["Guia especializado", "Transporte", "Ingressos incluídos"] },
              { title: "Premium", price: 220, description: "Tour VIP + jantar + transporte executivo", inclusions: ["Guia VIP", "Transporte executivo", "Jantar típico", "Bebidas incluídas"] }
            ]
          }
        ],
        "São Paulo": [
          {
            title: "MASP + Avenida Paulista",
            description: "Visite o icônico Museu de Arte de São Paulo e explore a Avenida Paulista, coração cultural e financeiro da maior metrópole da América do Sul.",
            category: "cultural",
            duration: "3-4 horas",
            cover_image: "https://images.unsplash.com/photo-1564688169631-7e9e0b8f33a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
            images: ["https://images.unsplash.com/photo-1564688169631-7e9e0b8f33a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"],
            propostas: [
              { title: "Econômico", price: 40, description: "Entrada simples no MASP", inclusions: ["Ingresso MASP", "Mapa da Paulista"] },
              { title: "Completo", price: 90, description: "Visita guiada + café", inclusions: ["Visita guiada", "Café incluso", "Material informativo"] },
              { title: "Premium", price: 250, description: "Tour + almoço em rooftop", inclusions: ["Tour VIP", "Almoço panorâmico", "Transporte", "Bebidas"] }
            ]
          },
          {
            title: "Parque Ibirapuera + Museus",
            description: "Explore o principal parque urbano de São Paulo e seus renomados museus: MAM, Museu Afro Brasil, Oca e outros espaços culturais.",
            category: "cultural",
            duration: "Dia inteiro",
            cover_image: "https://images.unsplash.com/photo-1596445827019-ab19d12cc2ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
            images: ["https://images.unsplash.com/photo-1596445827019-ab19d12cc2ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"],
            propostas: [
              { title: "Econômico", price: 0, description: "Acesso livre ao parque", inclusions: ["Caminhada livre", "Mapa do parque"] },
              { title: "Completo", price: 70, description: "Bike + ingressos museus", inclusions: ["Aluguel de bike (4h)", "Ingressos museus", "Kit lanche"] },
              { title: "Premium", price: 180, description: "Tour guiado + transporte", inclusions: ["Guia especializado", "Transporte", "Todos os museus", "Almoço"] }
            ]
          },
          {
            title: "Mercado Municipal + Centro Histórico",
            description: "Degustação gastronômica no famoso Mercadão e tour pelo centro histórico de São Paulo.",
            category: "food_tours",
            duration: "4-5 horas",
            cover_image: "https://images.unsplash.com/photo-1566740933430-b5e70b06d2d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
            images: ["https://images.unsplash.com/photo-1566740933430-b5e70b06d2d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"],
            propostas: [
              { title: "Econômico", price: 0, description: "Visita por conta própria", inclusions: ["Roteiro sugerido", "Dicas gastronômicas"] },
              { title: "Completo", price: 90, description: "Tour guiado com degustação", inclusions: ["Guia gastronômico", "Degustações incluídas", "História local"] },
              { title: "Premium", price: 240, description: "Tour gastronômico VIP + transporte", inclusions: ["Guia chef", "Degustações premium", "Transporte", "Bebidas harmonizadas"] }
            ]
          }
        ],
        "Foz do Iguaçu": [
          {
            title: "Cataratas do Iguaçu (lado brasileiro)",
            description: "Uma das mais impressionantes quedas d'água do mundo com 275 quedas d'água na fronteira Brasil-Argentina. Patrimônio Mundial da UNESCO.",
            category: "nature",
            duration: "Dia inteiro",
            cover_image: "https://images.unsplash.com/photo-1520637836862-4d197d17c86a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
            images: ["https://images.unsplash.com/photo-1520637836862-4d197d17c86a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"],
            propostas: [
              { title: "Econômico", price: 85, description: "Entrada no parque nacional", inclusions: ["Entrada no parque", "Trilha das cataratas", "Transporte interno"] },
              { title: "Completo", price: 160, description: "Parque + transporte", inclusions: ["Entrada parque", "Transporte hotel-parque", "Guia básico"] },
              { title: "Premium", price: 350, description: "Tour completo + Macuco Safari", inclusions: ["Entrada parque", "Macuco Safari", "Almoço", "Transporte", "Guia especializado"] }
            ]
          },
          {
            title: "Parque das Aves",
            description: "Santuário de aves da Mata Atlântica com mais de 1.320 aves de 143 espécies. Experiência imersiva única na América Latina.",
            category: "wildlife",
            duration: "3-4 horas",
            cover_image: "https://images.unsplash.com/photo-1574263867128-ba1b540c5dd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000",
            images: ["https://images.unsplash.com/photo-1574263867128-ba1b540c5dd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800"],
            propostas: [
              { title: "Econômico", price: 90, description: "Ingresso padrão", inclusions: ["Entrada no parque", "Trilhas livres", "Mapa do local"] },
              { title: "Completo", price: 140, description: "Ingresso + traslado", inclusions: ["Entrada", "Transporte hotel-parque", "Audio guide"] },
              { title: "Premium", price: 250, description: "Visita guiada + bastidores", inclusions: ["Entrada VIP", "Tour dos bastidores", "Encontro com tratadores", "Transporte"] }
            ]
          }
        ]
      };

      let totalAtividades = 0;
      let totalPropostas = 0;
      let totalReviews = 0;

      for (const [nomeDestino, atividades] of Object.entries(atividadesPorDestino)) {
        console.log(`🏙️ Processando ${nomeDestino}...`);
        
        // Encontrar o destino correspondente
        const destino = destinations.find(d => 
          d.name?.toLowerCase().includes(nomeDestino.toLowerCase()) ||
          (nomeDestino === "Rio de Janeiro" && d.name?.toLowerCase().includes("rio")) ||
          (nomeDestino === "São Paulo" && d.name?.toLowerCase().includes("são paulo")) ||
          (nomeDestino === "Foz do Iguaçu" && d.name?.toLowerCase().includes("foz"))
        );

        if (!destino) {
          console.log(`❌ Destino não encontrado: ${nomeDestino}`);
          continue;
        }

        console.log(`✅ Destino encontrado: ${destino.name} (ID: ${destino.id})`);

        for (const atividade of atividades) {
          try {
            // Inserir atividade
            const [atividadeInserida] = await db.insert(activities).values({
              title: atividade.title,
              description: atividade.description,
              destination_id: destino.id,
              category: atividade.category as any,
              difficulty_level: "easy",
              duration: atividade.duration,
              min_participants: 1,
              max_participants: 20,
              languages: ["Português", "Inglês", "Espanhol"],
              inclusions: ["Acompanhamento profissional", "Seguro básico", "Suporte 24h"],
              exclusions: ["Alimentação (quando não especificada)", "Transporte pessoal"],
              requirements: ["Idade mínima: 12 anos"],
              cancellation_policy: "Cancelamento gratuito até 24h antes",
              contact_info: {
                email: "atividades@partiutrip.com",
                phone: "+55 11 99999-8888",
                whatsapp: "+55 11 99999-8888"
              },
              cover_image: atividade.cover_image,
              images: atividade.images,
              created_by_id: 9, // Usuário tom
              is_active: true,
              // Campos herdados do destino
              destination_name: destino.name,
              city: destino.name,
              state: destino.state,
              country: destino.country,
              country_type: destino.country_type as any,
              region: destino.region,
              continent: destino.continent
            }).returning();

            console.log(`  ✅ Atividade inserida: ${atividade.title} (ID: ${atividadeInserida.id})`);
            totalAtividades++;

            // Inserir propostas de orçamento
            for (const proposta of atividade.propostas) {
              await db.insert(activityBudgetProposals).values({
                activity_id: atividadeInserida.id,
                created_by: 9,
                title: proposta.title,
                description: proposta.description,
                price_type: "per_person",
                amount: proposta.price.toString(),
                currency: "BRL",
                inclusions: proposta.inclusions,
                exclusions: ["Despesas pessoais", "Gorjetas"],
                is_active: true,
                votes: Math.floor(Math.random() * 50) + 15
              });
              console.log(`    💰 Proposta criada: ${proposta.title} - R$ ${proposta.price}`);
              totalPropostas++;
            }

            // Inserir reviews de exemplo
            const reviewsExemplo = [
              {
                rating: 5,
                review: "Experiência incrível! Vista espetacular e atendimento excepcional.",
                photos: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400"],
                visit_date: new Date("2024-12-15"),
              },
              {
                rating: 4,
                review: "Muito bom! A única observação é que estava bem cheio, mas mesmo assim recomendo.",
                photos: [],
                visit_date: new Date("2024-12-10"),
              },
              {
                rating: 5,
                review: "Perfeito! Superou todas as expectativas. Voltarei com certeza!",
                photos: ["https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400"],
                visit_date: new Date("2024-12-08"),
              }
            ];

            for (const review of reviewsExemplo) {
              await db.insert(activityReviews).values({
                activity_id: atividadeInserida.id,
                user_id: 9,
                rating: review.rating,
                review: review.review,
                photos: review.photos,
                visit_date: review.visit_date,
                helpful_votes: Math.floor(Math.random() * 20) + 5,
                is_verified: true
              });
              totalReviews++;
            }

            // Atualizar contadores da atividade
            await db.update(activities)
              .set({
                average_rating: "4.7",
                total_ratings: reviewsExemplo.length
              })
              .where(eq(activities.id, atividadeInserida.id));

          } catch (error) {
            console.error(`❌ Erro ao inserir atividade ${atividade.title}:`, error);
          }
        }
      }

      const resultado = {
        success: true,
        message: "Atividades cadastradas com sucesso!",
        totalAtividades,
        totalPropostas,
        totalReviews,
        mediaPropostasPorAtividade: (totalPropostas/totalAtividades).toFixed(1)
      };

      console.log("🎉 Seed concluído:", resultado);
      res.json(resultado);

    } catch (error) {
      console.error("❌ Erro no seed de atividades:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro ao cadastrar atividades", 
        error: error instanceof Error ? error.message : "Erro desconhecido" 
      });
    }
  });
  */

  // ===== ENDPOINT DE ESTATÍSTICAS DE ATIVIDADES =====
  app.get("/api/activities/stats", async (req, res) => {
    try {
      // Contar atividades ativas
      const totalActivities = await db
        .select({ count: sql`COUNT(*)` })
        .from(activities)
        .where(eq(activities.is_active, true));

      // Contar propostas ativas
      const totalProposals = await db
        .select({ count: sql`COUNT(*)` })
        .from(activityBudgetProposals)
        .where(eq(activityBudgetProposals.is_active, true));

      // Contar reviews
      const totalReviews = await db
        .select({ count: sql`COUNT(*)` })
        .from(activityReviews)
        .where(eq(activityReviews.is_hidden, false));

      // Estatísticas por categoria
      const byCategory = await db
        .select({
          category: activities.category,
          count: sql`COUNT(*)`
        })
        .from(activities)
        .where(eq(activities.is_active, true))
        .groupBy(activities.category);

      // Estatísticas por destino (consolidando nomes similares)
      const byDestination = await db
        .select({
          destination: activities.destination_name,
          count: sql`COUNT(*)`
        })
        .from(activities)
        .where(eq(activities.is_active, true))
        .groupBy(activities.destination_name)
        .limit(10);

      // Consolidar destinos similares
      const consolidatedDestinations: Record<string, number> = {};
      byDestination.forEach(item => {
        let dest = item.destination || 'Sem destino';
        
        // Normalizar nomes de destinos
        if (dest.includes('São Paulo')) {
          dest = 'São Paulo';
        } else if (dest.includes('Rio de Janeiro')) {
          dest = 'Rio de Janeiro';
        } else if (dest.includes('Salvador')) {
          dest = 'Salvador';
        }
        
        consolidatedDestinations[dest] = (consolidatedDestinations[dest] || 0) + Number(item.count);
      });

      const stats = {
        totalActivities: Number(totalActivities[0]?.count || 0),
        totalProposals: Number(totalProposals[0]?.count || 0),
        totalReviews: Number(totalReviews[0]?.count || 0),
        avgProposalsPerActivity: Number(totalActivities[0]?.count) > 0 ? 
          Math.round((Number(totalProposals[0]?.count || 0) / Number(totalActivities[0]?.count)) * 10) / 10 : 0,
        byCategory: byCategory.reduce((acc, item) => {
          acc[item.category] = Number(item.count);
          return acc;
        }, {} as Record<string, number>),
        byDestination: consolidatedDestinations
      };

      res.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas de atividades:', error);
      res.status(500).json({ message: "Erro ao buscar estatísticas de atividades" });
    }
  });

  // ===== ENDPOINT PARA CORRIGIR DESTINOS DUPLICADOS =====
  app.post("/api/admin/fix-destinations", async (req, res) => {
    try {
      console.log("🔧 Corrigindo destinos duplicados...");
      
      // Corrigir São Paulo
      await db.update(activities)
        .set({ destination_name: "São Paulo" })
        .where(eq(activities.destination_name, "São Paulo, SP"));
      
      // Corrigir Rio de Janeiro
      await db.update(activities)
        .set({ destination_name: "Rio de Janeiro" })
        .where(eq(activities.destination_name, "Rio de Janeiro, RJ"));
      
      // Corrigir Salvador
      await db.update(activities)
        .set({ destination_name: "Salvador" })
        .where(eq(activities.destination_name, "Salvador, BA"));

      // Contar atividades após correção
      const stats = await db
        .select({
          destination: activities.destination_name,
          count: sql`COUNT(*)`
        })
        .from(activities)
        .where(eq(activities.is_active, true))
        .groupBy(activities.destination_name);

      console.log("✅ Destinos corrigidos:");
      stats.forEach(stat => {
        console.log(`  ${stat.destination}: ${stat.count} atividades`);
      });

      res.json({ 
        success: true, 
        message: "Destinos corrigidos com sucesso",
        stats: stats.reduce((acc, item) => {
          acc[item.destination || 'Sem destino'] = Number(item.count);
          return acc;
        }, {} as Record<string, number>)
      });
    } catch (error) {
      console.error('Erro ao corrigir destinos:', error);
      res.status(500).json({ message: "Erro ao corrigir destinos" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Helper function to add new participant to existing common expenses
async function addParticipantToCommonExpenses(tripId: number, newUserId: number) {
  try {
    console.log(`🔄 Adicionando participante ${newUserId} às despesas comuns da viagem ${tripId}`);
    
    // Get all expenses for this trip that were split with 'all' (common expenses)
    const tripExpenses = await storage.getTripExpenses(tripId);
    
    // Get current participants to recalculate splits
    const participants = await storage.getTripParticipants(tripId);
    const approvedParticipants = participants.filter(p => p.status === 'approved');
    const totalParticipants = approvedParticipants.length;
    
    console.log(`📊 Encontradas ${tripExpenses.length} despesas, ${totalParticipants} participantes aprovados`);
    
    for (const expense of tripExpenses) {
      const existingSplits = expense.splits || [];
      
      // Check if this expense was split among all participants (common expense)
      // We identify common expenses by checking if all current participants have splits
      const isCommonExpense = existingSplits.length > 0 && 
        approvedParticipants.every(p => 
          existingSplits.some(split => split.user_id === p.user_id)
        );
      
      if (isCommonExpense) {
        // Recalculate split amount for all participants
        const newSplitAmount = expense.amount / totalParticipants;
        
        console.log(`💰 Recalculando despesa "${expense.title}": R$ ${expense.amount} ÷ ${totalParticipants} = R$ ${newSplitAmount.toFixed(2)} por pessoa`);
        
        // Update existing splits
        for (const split of existingSplits) {
          await db.update(expenseSplits)
            .set({ amount: newSplitAmount.toString() })
            .where(eq(expenseSplits.id, split.id));
        }
        
        // Add split for the new participant (if not already exists)
        const hasNewParticipantSplit = existingSplits.some(split => split.user_id === newUserId);
        if (!hasNewParticipantSplit) {
          await db.insert(expenseSplits).values({
            expense_id: expense.id,
            user_id: newUserId,
            amount: newSplitAmount.toString(),
            paid: false,
            settled_at: null
          });
          
          console.log(`✅ Adicionado split de R$ ${newSplitAmount.toFixed(2)} para usuário ${newUserId} na despesa "${expense.title}"`);
        }
      }
    }
    
    console.log(`🎉 Participante ${newUserId} adicionado com sucesso às despesas comuns`);
  } catch (error) {
    console.error('❌ Erro ao adicionar participante às despesas comuns:', error);
    throw error;
  }
}
