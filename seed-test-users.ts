import { db } from "./server/db.js";
import { users, destinations, activities, activityBudgetProposals } from "./shared/schema.js";
import bcrypt from "bcryptjs";

async function seedTestUsers() {
  try {
    console.log("🌱 Criando usuários de teste...");
    
    // Create test users
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const testUsers = [
      {
        username: "tom",
        email: "tom@example.com",
        password: hashedPassword,
        fullName: "Tom Silva",
        firstName: "Tom",
        lastName: "Silva",
        phone: "(11) 99999-9999",
        bio: "Aventureiro nato, sempre em busca de novas experiências.",
        location: "São Paulo, SP",
        dateOfBirth: new Date("1990-05-15"),
        emergencyContact: "Maria Silva - (11) 88888-8888",
        travelStyles: ["adventure", "nature"],
        isVerified: true,
        averageRating: "4.80",
        totalRatings: 25,
        profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: "maria",
        email: "maria@example.com", 
        password: hashedPassword,
        fullName: "Maria Santos",
        firstName: "Maria",
        lastName: "Santos",
        phone: "(21) 77777-7777",
        bio: "Apaixonada por cultura e gastronomia local.",
        location: "Rio de Janeiro, RJ",
        dateOfBirth: new Date("1995-08-20"),
        emergencyContact: "João Santos - (21) 66666-6666",
        travelStyles: ["cultural", "food"],
        isVerified: true,
        averageRating: "4.95",
        totalRatings: 40,
        profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b9a0a29e?w=150&h=150&fit=crop&crop=face",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: "carlos",
        email: "carlos@example.com",
        password: hashedPassword,
        fullName: "Carlos Oliveira",
        firstName: "Carlos",
        lastName: "Oliveira", 
        phone: "(31) 55555-5555",
        bio: "Explorador urbano e fotógrafo amador.",
        location: "Belo Horizonte, MG",
        dateOfBirth: new Date("1988-12-10"),
        emergencyContact: "Ana Oliveira - (31) 44444-4444",
        travelStyles: ["urban", "photography"],
        isVerified: false,
        averageRating: "0.00",
        totalRatings: 0,
        profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.insert(users).values(testUsers);
    console.log("✅ Usuários de teste criados!");

    // Create test destinations
    console.log("🌍 Criando destinos de teste...");
    const testDestinations = [
      {
        name: "Rio de Janeiro",
        state: "RJ", 
        country: "Brasil",
        countryType: "national",
        continent: "America do Sul",
        description: "Cidade Maravilhosa com praias deslumbrantes",
        latitude: -22.9068,
        longitude: -43.1729,
        timezone: "America/Sao_Paulo",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "São Paulo",
        state: "SP",
        country: "Brasil", 
        countryType: "national",
        continent: "America do Sul",
        description: "Metrópole cosmopolita com vida cultural intensa",
        latitude: -23.5505,
        longitude: -46.6333,
        timezone: "America/Sao_Paulo",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Paris",
        state: "Île-de-France",
        country: "França",
        countryType: "international",
        continent: "Europa",
        description: "Cidade Luz, capital mundial da arte e cultura",
        latitude: 48.8566,
        longitude: 2.3522,
        timezone: "Europe/Paris",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const insertedDestinations = await db.insert(destinations).values(testDestinations).returning();
    console.log("✅ Destinos de teste criados!");

    // Create test activities
    console.log("🎯 Criando atividades de teste...");
    const testActivities = [
      {
        title: "Cristo Redentor e Corcovado",
        description: "Visita ao icônico Cristo Redentor no topo do Corcovado com vista panorâmica da cidade.",
        destinationId: insertedDestinations[0].id, // Rio de Janeiro
        category: "pontos_turisticos",
        difficultyLevel: "easy",
        duration: "3 horas",
        minParticipants: 1,
        maxParticipants: 15,
        languages: ["português", "inglês"],
        inclusions: ["Transporte", "Guia local", "Seguro"],
        exclusions: ["Alimentação", "Bebidas"],
        requirements: ["Calçado confortável"],
        cancellationPolicy: "Cancelamento gratuito até 24h antes",
        contactInfo: {},
        coverImage: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=1200&h=800&fit=crop",
        images: [],
        averageRating: "4.50",
        totalRatings: 15,
        isActive: true,
        createdById: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Museu do Louvre",
        description: "Explore a maior coleção de arte do mundo no famoso Museu do Louvre.",
        destinationId: insertedDestinations[2].id, // Paris
        category: "cultural",
        difficultyLevel: "easy",
        duration: "4 horas",
        minParticipants: 1,
        maxParticipants: 20,
        languages: ["français", "english"],
        inclusions: ["Entrada", "Audioguia"],
        exclusions: ["Transporte", "Alimentação"],
        requirements: ["Documento de identidade"],
        cancellationPolicy: "Cancelamento gratuito até 48h antes",
        contactInfo: {},
        coverImage: "https://images.unsplash.com/photo-1566139528892-5734e1b82b38?w=1200&h=800&fit=crop",
        images: [],
        averageRating: "4.80",
        totalRatings: 32,
        isActive: true,
        createdById: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const insertedActivities = await db.insert(activities).values(testActivities).returning();
    console.log("✅ Atividades de teste criadas!");

    // Create budget proposals
    console.log("💰 Criando propostas de orçamento...");
    const budgetProposals = [];
    
    for (const activity of insertedActivities) {
      const proposals = [
        {
          activityId: activity.id,
          title: "Econômico",
          description: "Opção básica com o essencial",
          price: "85.00",
          currency: "BRL",
          inclusions: ["Transporte básico", "Entrada"],
          exclusions: ["Alimentação", "Guia"],
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          votes: 5,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          activityId: activity.id,
          title: "Completo", 
          description: "Experiência completa com guia",
          price: "160.00",
          currency: "BRL",
          inclusions: ["Transporte", "Entrada", "Guia local", "Lanche"],
          exclusions: ["Almoço"],
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          votes: 12,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          activityId: activity.id,
          title: "Premium",
          description: "Experiência VIP com tudo incluso",
          price: "280.00",
          currency: "BRL", 
          inclusions: ["Transporte VIP", "Entrada", "Guia especializado", "Refeição completa", "Seguro premium"],
          exclusions: [],
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          votes: 8,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      budgetProposals.push(...proposals);
    }

    await db.insert(activityBudgetProposals).values(budgetProposals);
    console.log("✅ Propostas de orçamento criadas!");

    console.log("🎉 Seed concluído com sucesso!");
    console.log("Credenciais de teste:");
    console.log("- tom / password123");
    console.log("- maria / password123");
    console.log("- carlos / password123");
    
  } catch (error) {
    console.error("❌ Erro no seed:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestUsers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seedTestUsers;