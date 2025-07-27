import { db } from "./db";
import { users, destinations, trips, activities, activityBudgetProposals, referralCodes } from "@shared/schema";
import { storage } from "./storage";
import bcrypt from "bcryptjs";

export async function createPostgreSQLSeedData() {
  console.log("🌱 Criando dados de demonstração para PostgreSQL...");
  
  try {
    // Create test users
    const testUsers = [
      {
        username: "tom",
        email: "tom@test.com", 
        password: "password123",
        fullName: "Tom Silva",
        bio: "Aventureiro apaixonado por viagens",
        profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        isVerified: true,
        travelStyles: ["adventure", "nature"],
        interests: ["hiking", "photography"],
        rating: 4.8
      },
      {
        username: "maria",
        email: "maria@test.com",
        password: "password123", 
        fullName: "Maria Costa",
        bio: "Exploradora cultural e gastronômica",
        profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        isVerified: true,
        travelStyles: ["cultural", "food"],
        interests: ["culture", "food", "art"],
        rating: 4.9
      },
      {
        username: "carlos",
        email: "carlos@test.com",
        password: "password123",
        fullName: "Carlos Mendes", 
        bio: "Viajante urbano e tecnológico",
        profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        isVerified: true,
        travelStyles: ["urban", "tech"],
        interests: ["technology", "business"],
        rating: 4.7
      }
    ];

    console.log("👥 Criando usuários de teste...");
    const createdUsers = [];
    for (const userData of testUsers) {
      const user = await storage.createUser(userData);
      createdUsers.push(user);
      console.log(`✅ Usuário criado: ${user.username}`);
    }

    // Create sample destinations
    const sampleDestinations = [
      {
        name: "Rio de Janeiro",
        state: "RJ",
        country: "Brasil",
        description: "Cidade Maravilhosa",
        coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop",
        isActive: true
      },
      {
        name: "Paris", 
        state: "Île-de-France",
        country: "França",
        description: "Cidade Luz",
        coverImage: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop",
        isActive: true
      },
      {
        name: "Gramado",
        state: "RS", 
        country: "Brasil",
        description: "Charme europeu no Sul do Brasil",
        coverImage: "https://images.unsplash.com/photo-1589992602076-c2c6c2547c2c?w=800&h=600&fit=crop",
        isActive: true
      }
    ];

    console.log("🌍 Criando destinos...");
    const createdDestinations = [];
    for (const destData of sampleDestinations) {
      const [destination] = await db.insert(destinations).values(destData).returning();
      createdDestinations.push(destination);
      console.log(`✅ Destino criado: ${destination.name}`);
    }

    // Create sample trips
    const sampleTrips = [
      {
        creator_id: createdUsers[0].id,
        title: "Aventura no Rio de Janeiro", 
        destination_id: createdDestinations[0].id,
        startDate: new Date('2025-03-15'),
        endDate: new Date('2025-03-20'),
        budget: 2500,
        max_participants: 6,
        description: "Explorar as maravilhas do Rio com foco em aventura e natureza",
        travel_style: "adventure",
        status: "open"
      },
      {
        creator_id: createdUsers[1].id,
        title: "Romance em Paris",
        destination_id: createdDestinations[1].id, 
        startDate: new Date('2025-04-10'),
        endDate: new Date('2025-04-17'),
        budget: 4500,
        max_participants: 4,
        description: "Experiência romântica e cultural na Cidade Luz",
        travel_style: "cultural",
        status: "open"
      }
    ];

    console.log("✈️ Criando viagens de exemplo...");
    const createdTrips = [];
    for (const tripData of sampleTrips) {
      const trip = await storage.createTrip(tripData);
      createdTrips.push(trip);
      console.log(`✅ Viagem criada: ${trip.title}`);
    }

    // Create sample activities
    const sampleActivities = [
      {
        title: "Trilha no Pão de Açúcar",
        destination_id: createdDestinations[0].id,
        description: "Trilha com vista panorâmica da cidade",
        duration: "4 horas",
        difficulty_level: "medium",
        category: "hiking",
        cover_image: "https://images.unsplash.com/photo-1518639192441-8fce0c318019?w=800&h=600&fit=crop",
        is_active: true
      },
      {
        title: "Tour pela Torre Eiffel",
        destination_id: createdDestinations[1].id,
        description: "Visita guiada ao símbolo de Paris",
        duration: "3 horas", 
        difficulty_level: "easy",
        category: "cultural",
        cover_image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop",
        is_active: true
      }
    ];

    console.log("🎯 Criando atividades...");
    const createdActivities = [];
    for (const activityData of sampleActivities) {
      const activity = await storage.createActivity(activityData);
      createdActivities.push(activity);
      console.log(`✅ Atividade criada: ${activity.title}`);
    }

    // Create budget proposals for activities
    console.log("💰 Criando propostas de orçamento...");
    for (const activity of createdActivities) {
      const proposals = [
        {
          activity_id: activity.id,
          title: "Econômico",
          amount: "150.00",
          description: "Opção básica com o essencial",
          inclusions: ["Transporte", "Guia"],
          exclusions: ["Alimentação", "Seguro"],
          is_active: true
        },
        {
          activity_id: activity.id,
          title: "Completo", 
          amount: "280.00",
          description: "Experiência completa",
          inclusions: ["Transporte", "Guia", "Alimentação", "Seguro"],
          exclusions: [],
          is_active: true
        }
      ];

      for (const proposalData of proposals) {
        await storage.createActivityBudgetProposal(proposalData);
      }
    }

    console.log("✅ Dados de demonstração criados com sucesso!");
    console.log(`📊 Resumo: ${createdUsers.length} usuários, ${createdDestinations.length} destinos, ${createdTrips.length} viagens, ${createdActivities.length} atividades`);

    return true;
  } catch (error) {
    console.error("❌ Erro ao criar dados de demonstração:", error);
    return false;
  }
}