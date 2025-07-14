import { db } from "./db";
import { users, trips, tripParticipants, messages, activities, activityReviews } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const asyncScrypt = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await asyncScrypt(password, salt, 64);
  return `${salt}:${(derivedKey as Buffer).toString('hex')}`;
}

export async function createSimpleSeedData() {
  try {
    console.log("🌱 Iniciando seed data simplificado...");
    
    const hashedPassword = await hashPassword("demo123");

    // Create 5 users
    const usersList = [
      {
        username: "tom",
        email: "tom@exemplo.com",
        fullName: "Tom Silva",
        phone: "(11) 98765-4321",
        bio: "Aventureiro e amante da natureza",
        location: "São Paulo, SP",
        languages: JSON.stringify(["Português", "Inglês"]),
        interests: JSON.stringify(["Natureza", "Aventura", "Fotografia"]),
        travelStyle: JSON.stringify(["aventura"]),
        isVerified: true,
        verificationMethod: "document",
        referredBy: null,
        averageRating: 4.8,
        totalRatings: 15
      },
      {
        username: "maria",
        email: "maria@exemplo.com", 
        fullName: "Maria Santos",
        phone: "(21) 99888-7766",
        bio: "Exploradora urbana e gastronômica",
        location: "Rio de Janeiro, RJ",
        languages: JSON.stringify(["Português", "Espanhol"]),
        interests: JSON.stringify(["Gastronomia", "Cultura", "Praia"]),
        travelStyle: JSON.stringify(["culturais"]),
        isVerified: true,
        verificationMethod: "social",
        referredBy: "PARTIU-TOM01",
        averageRating: 4.6,
        totalRatings: 12
      },
      {
        username: "carlos",
        email: "carlos@exemplo.com",
        fullName: "Carlos Oliveira", 
        phone: "(31) 97777-5544",
        bio: "Viajante econômico e backpacker",
        location: "Belo Horizonte, MG",
        languages: JSON.stringify(["Português"]),
        interests: JSON.stringify(["Mochilão", "Economia", "Montanha"]),
        travelStyle: JSON.stringify(["natureza"]),
        isVerified: false,
        verificationMethod: null,
        referredBy: "PARTIU-MARIA02",
        averageRating: 4.2,
        totalRatings: 8
      }
    ];

    console.log("👥 Criando usuários...");
    const userIds: number[] = [];
    for (const userData of usersList) {
      const [insertResult] = await db.insert(users).values({
        ...userData,
        password: hashedPassword
      });
      userIds.push(insertResult.insertId);
      console.log(`✅ Usuário criado: ${userData.username} (ID: ${insertResult.insertId})`);
    }

    // Create 3 trips
    console.log("🚗 Criando viagens...");
    const tripsData = [
      {
        creatorId: userIds[0], // tom
        title: "Rio de Janeiro Completo",
        destination: "Rio de Janeiro, RJ",
        startDate: new Date("2025-08-15"),
        endDate: new Date("2025-08-20"),
        budget: 2000,
        budgetBreakdown: JSON.stringify({
          transport: 400,
          accommodation: 600,
          food: 500,
          insurance: 100,
          other: 400
        }),
        maxParticipants: 6,
        description: "Explore o Rio de Janeiro com praias, trilhas e cultura local.",
        travelStyle: "aventura",
        status: "open"
      },
      {
        creatorId: userIds[1], // maria
        title: "São Paulo Gastronômico",
        destination: "São Paulo, SP", 
        startDate: new Date("2025-09-10"),
        endDate: new Date("2025-09-13"),
        budget: 1500,
        budgetBreakdown: JSON.stringify({
          transport: 300,
          accommodation: 400,
          food: 600,
          insurance: 50,
          other: 150
        }),
        maxParticipants: 4,
        description: "Tour gastronômico pelos melhores restaurantes de SP.",
        travelStyle: "culturais",
        status: "open"
      }
    ];

    const tripIds: number[] = [];
    for (const tripData of tripsData) {
      const [insertResult] = await db.insert(trips).values(tripData);
      tripIds.push(insertResult.insertId);
      console.log(`✅ Viagem criada: ${tripData.title} (ID: ${insertResult.insertId})`);
      
      // Add creator as participant
      await db.insert(tripParticipants).values({
        tripId: insertResult.insertId,
        userId: tripData.creatorId,
        status: "accepted",
        joinedAt: new Date()
      });
    }

    // Add some participants
    console.log("👥 Adicionando participantes...");
    // Tom joins Maria's trip
    await db.insert(tripParticipants).values({
      tripId: tripIds[1],
      userId: userIds[0],
      status: "accepted", 
      joinedAt: new Date()
    });
    
    // Carlos joins both trips
    await db.insert(tripParticipants).values({
      tripId: tripIds[0],
      userId: userIds[2],
      status: "accepted",
      joinedAt: new Date()
    });

    // Create some chat messages
    console.log("💬 Criando mensagens...");
    const messagesData = [
      {
        tripId: tripIds[0],
        senderId: userIds[0],
        content: "Pessoal, que animação para essa viagem ao Rio!",
        timestamp: new Date("2025-07-10T10:00:00")
      },
      {
        tripId: tripIds[0], 
        senderId: userIds[2],
        content: "Também estou muito empolgado! Alguém tem sugestões de praias?",
        timestamp: new Date("2025-07-10T10:30:00")
      },
      {
        tripId: tripIds[1],
        senderId: userIds[1], 
        content: "Galera, já reservei mesa no restaurante Mocotó para sexta!",
        timestamp: new Date("2025-07-11T14:00:00")
      }
    ];

    for (const messageData of messagesData) {
      await db.insert(messages).values(messageData);
    }

    // Create some activities
    console.log("🎯 Criando atividades...");
    const activitiesData = [
      {
        title: "Trilha no Pão de Açúcar",
        description: "Trilha guiada até o topo do Pão de Açúcar com vista panorâmica da cidade.",
        location: "Rio de Janeiro, RJ",
        category: "aventura",
        priceAmount: 120.00,
        duration: "4 horas",
        difficultyLevel: "intermediário",
        minParticipants: 2,
        maxParticipants: 12,
        coverImage: "https://images.unsplash.com/photo-1518639192441-8fce0c4e2b62",
        averageRating: 4.7,
        totalRatings: 25,
        createdById: userIds[0]
      },
      {
        title: "Tour Gastronômico na Vila Madalena",
        description: "Degustação nos melhores bares e restaurantes da Vila Madalena.",
        location: "São Paulo, SP", 
        category: "gastronomia",
        priceAmount: 180.00,
        duration: "5 horas",
        difficultyLevel: "fácil",
        minParticipants: 4,
        maxParticipants: 10,
        coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
        averageRating: 4.9,
        totalRatings: 18,
        createdById: userIds[1]
      }
    ];

    const activityIds: number[] = [];
    for (const activityData of activitiesData) {
      const [insertResult] = await db.insert(activities).values(activityData);
      activityIds.push(insertResult.insertId);
      console.log(`✅ Atividade criada: ${activityData.title} (ID: ${insertResult.insertId})`);
    }

    // Create some activity reviews
    console.log("⭐ Criando avaliações...");
    const reviewsData = [
      {
        activityId: activityIds[0],
        userId: userIds[1],
        rating: 5,
        review: "Trilha incrível! Vista espetacular e guia muito atencioso.",
        visitDate: new Date("2025-06-15"),
        isVerified: true
      },
      {
        activityId: activityIds[1], 
        userId: userIds[0],
        rating: 5,
        review: "Melhor tour gastronômico que já fiz! Lugares incríveis.",
        visitDate: new Date("2025-06-20"),
        isVerified: true
      }
    ];

    for (const reviewData of reviewsData) {
      await db.insert(activityReviews).values(reviewData);
    }

    console.log("✅ Seed data simplificado criado com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro ao criar seed data:", error);
    throw error;
  }
}