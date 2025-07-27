import { db } from "./db";
import { users, trips, tripParticipants, messages, activities, activityReviews, expenses, expenseSplits } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Helper function to hash passwords - compatível com autenticação
async function hashPassword(password: string): Promise<string> {
  const salt = "fixed-salt-for-demo";
  const key = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${key.toString("hex")}.${salt}`;
}

// Generate referral code
function generateReferralCode(username: string, id: number): string {
  return `PARTIU-${username.toUpperCase()}${id.toString().padStart(2, '0')}`;
}

export async function seedDatabase() {
  console.log("🌱 Iniciando população completa do banco de dados...");

  // 1. Create 10 users (Tom + 9 referred by Tom)
  const usersData = [
    {
      username: "tom",
      email: "tom@example.com",
      password: await hashPassword("demo123"),
      fullName: "Tom Tubin",
      phone: "(51) 99999-9999",
      bio: "Aventureiro nato, sempre em busca de novas experiências. Criador da comunidade PartiuTrip!",
      location: "Porto Alegre, RS",
      languages: ["Português", "Inglês", "Espanhol"],
      interests: ["Aventura", "Fotografia", "Culinária Local", "História"],
      travelStyle: "aventura",
      isVerified: true,
      verificationMethod: "founder",
      referredBy: null
    },
    {
      username: "maria",
      email: "maria@example.com", 
      password: await hashPassword("demo123"),
      fullName: "Maria Silva",
      phone: "(11) 98888-8888",
      bio: "Apaixonada por culturas diferentes e gastronomia local. Sempre pronta para uma nova aventura!",
      location: "São Paulo, SP",
      languages: ["Português", "Inglês"],
      interests: ["Culinária", "Cultura", "Arte", "Museus"],
      travelStyle: "culturais",
      isVerified: true,
      verificationMethod: "referral",
      referredBy: "PARTIU-TOM01"
    },
    {
      username: "carlos",
      email: "carlos@example.com",
      password: await hashPassword("demo123"),
      fullName: "Carlos Santos",
      phone: "(21) 97777-7777",
      bio: "Surfista e amante da natureza. Sempre em busca das melhores ondas e trilhas!",
      location: "Rio de Janeiro, RJ",
      languages: ["Português", "Inglês"],
      interests: ["Surf", "Natureza", "Trilhas", "Praia"],
      travelStyle: "praia",
      isVerified: true,
      verificationMethod: "referral",
      referredBy: "PARTIU-TOM01"
    },
    {
      username: "ana",
      email: "ana@example.com",
      password: await hashPassword("demo123"),
      fullName: "Ana Costa",
      phone: "(31) 96666-6666",
      bio: "Fotógrafa especializada em paisagens naturais. Amo capturar momentos únicos!",
      location: "Belo Horizonte, MG",
      languages: ["Português", "Inglês", "Francês"],
      interests: ["Fotografia", "Natureza", "Ecoturismo", "Vida Selvagem"],
      travelStyle: "natureza",
      isVerified: true,
      verificationMethod: "referral",
      referredBy: "PARTIU-TOM01"
    },
    {
      username: "ricardo",
      email: "ricardo@example.com",
      password: await hashPassword("demo123"),
      fullName: "Ricardo Oliveira",
      phone: "(85) 95555-5555",
      bio: "Amante de parques temáticos e diversão em família. Sempre planejando a próxima aventura!",
      location: "Fortaleza, CE",
      languages: ["Português", "Inglês"],
      interests: ["Parques Temáticos", "Família", "Diversão", "Tecnologia"],
      travelStyle: "parques",
      isVerified: true,
      verificationMethod: "referral",
      referredBy: "PARTIU-TOM01"
    },
    {
      username: "julia",
      email: "julia@example.com",
      password: await hashPassword("demo123"),
      fullName: "Julia Ferreira",
      phone: "(47) 94444-4444",
      bio: "Profissional de marketing que adora viajar e conhecer grandes cidades urbanas!",
      location: "Florianópolis, SC",
      languages: ["Português", "Inglês", "Italiano"],
      interests: ["Cidades", "Arquitetura", "Gastronomia", "Vida Noturna"],
      travelStyle: "urbanas",
      isVerified: true,
      verificationMethod: "referral",
      referredBy: "PARTIU-TOM01"
    },
    {
      username: "pedro",
      email: "pedro@example.com",
      password: await hashPassword("demo123"),
      fullName: "Pedro Almeida",
      phone: "(62) 93333-3333",
      bio: "Aventureiro que adora explorar destinos gelados e paisagens nevadas!",
      location: "Goiânia, GO",
      languages: ["Português", "Inglês"],
      interests: ["Neve", "Montanhismo", "Esqui", "Aventura"],
      travelStyle: "neve",
      isVerified: true,
      verificationMethod: "referral",
      referredBy: "PARTIU-TOM01"
    },
    {
      username: "fernanda",
      email: "fernanda@example.com",
      password: await hashPassword("demo123"),
      fullName: "Fernanda Lima",
      phone: "(81) 92222-2222",
      bio: "Apaixonada por cruzeiros e experiências marítimas únicas!",
      location: "Recife, PE",
      languages: ["Português", "Inglês", "Espanhol"],
      interests: ["Cruzeiros", "Mar", "Relaxamento", "Gastronomia"],
      travelStyle: "cruzeiros",
      isVerified: true,
      verificationMethod: "referral",
      referredBy: "PARTIU-TOM01"
    },
    {
      username: "marcos",
      email: "marcos@example.com",
      password: await hashPassword("demo123"),
      fullName: "Marcos Rocha",
      phone: "(71) 91111-1111",
      bio: "Historiador que adora explorar sítios históricos e patrimônios culturais!",
      location: "Salvador, BA",
      languages: ["Português", "Inglês", "Espanhol"],
      interests: ["História", "Patrimônio", "Cultura", "Arqueologia"],
      travelStyle: "culturais",
      isVerified: true,
      verificationMethod: "referral",
      referredBy: "PARTIU-TOM01"
    },
    {
      username: "camila",
      email: "camila@example.com",
      password: await hashPassword("demo123"),
      fullName: "Camila Souza",
      phone: "(61) 91000-0000",
      bio: "Bióloga especializada em ecoturismo e conservação ambiental!",
      location: "Brasília, DF",
      languages: ["Português", "Inglês", "Alemão"],
      interests: ["Ecoturismo", "Conservação", "Natureza", "Sustentabilidade"],
      travelStyle: "natureza",
      isVerified: true,
      verificationMethod: "referral",
      referredBy: "PARTIU-TOM01"
    }
  ];

  // Insert users
  console.log("👥 Criando 10 usuários...");
  const createdUsers = [];
  for (const userData of usersData) {
    await db.insert(users).values(userData);
    // Get the created user
    const [user] = await db.select().from(users).where(eq(users.username, userData.username));
    createdUsers.push(user);
    console.log(`✅ Usuário criado: ${user.username}`);
  }

  // 2. Create comprehensive activities by destination
  console.log("🎯 Criando atividades por destino...");
  
  const activitiesData = [
    // Rio de Janeiro
    {
      title: "Trilha do Pão de Açúcar",
      description: "Trilha desafiadora com vista panorâmica da cidade maravilhosa",
      location: "Rio de Janeiro, RJ",
      category: "Aventura",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
      priceAmount: "75.00",
      duration: "4-6 horas",
      difficultyLevel: "moderate",
      minParticipants: 2,
      maxParticipants: 12,
      coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      contactInfo: { phone: "(21) 99999-1111", email: "trilha@rioadventure.com" },
      createdById: createdUsers[0].id
    },
    {
      title: "Passeio de Barco na Baía de Guanabara",
      description: "Passeio relaxante com vista para o Cristo Redentor e Pão de Açúcar",
      location: "Rio de Janeiro, RJ",
      category: "Aquático",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
      priceAmount: "115.00",
      duration: "3-4 horas",
      difficultyLevel: "easy",
      minParticipants: 4,
      maxParticipants: 20,
      coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      contactInfo: { phone: "(21) 99999-2222", email: "passeios@baiaguanabara.com" },
      createdById: createdUsers[1].id
    },
    
    // São Paulo
    {
      title: "Tour Gastronômico no Mercado Municipal",
      description: "Degustação de iguarias paulistanas no famoso Mercadão",
      location: "São Paulo, SP",
      category: "Gastronomia",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
      priceAmount: "90.00",
      duration: "2-3 horas",
      difficultyLevel: "easy",
      minParticipants: 3,
      maxParticipants: 15,
      coverImage: "https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=800&q=80",
      contactInfo: { phone: "(11) 99999-3333", email: "tours@mercadao.com" },
      createdById: createdUsers[2].id
    },
    {
      title: "Visitação ao MASP com Guia Especializado",
      description: "Tour cultural pelo acervo do Museu de Arte de São Paulo",
      location: "São Paulo, SP",
      category: "Cultural",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
      priceAmount: "60.00",
      duration: "2-3 horas",
      difficultyLevel: "easy",
      minParticipants: 5,
      maxParticipants: 20,
      coverImage: "https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=800&q=80",
      contactInfo: { phone: "(11) 99999-4444", email: "cultura@masp.com" },
      createdById: createdUsers[3].id
    },

    // Florianópolis
    {
      title: "Aula de Surf na Praia da Joaquina",
      description: "Aprenda a surfar com instrutores qualificados na famosa praia",
      location: "Florianópolis, SC",
      category: "Aquático",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
      priceAmount: "115.00",
      duration: "3-4 horas",
      difficultyLevel: "moderate",
      minParticipants: 2,
      maxParticipants: 8,
      coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      contactInfo: { phone: "(48) 99999-5555", email: "surf@joaquina.com" },
      createdById: createdUsers[4].id
    },

    // Chapada Diamantina
    {
      title: "Cachoeira do Buracão",
      description: "Trilha até uma das cachoeiras mais impressionantes da Chapada",
      location: "Chapada Diamantina, BA",
      category: "Ecoturismo",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
      priceAmount: "150.00",
      duration: "6-8 horas",
      difficultyLevel: "challenging",
      minParticipants: 4,
      maxParticipants: 12,
      coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      contactInfo: { phone: "(75) 99999-6666", email: "trilhas@chapada.com" },
      createdById: createdUsers[5].id
    },

    // Pantanal
    {
      title: "Safari Fotográfico no Pantanal",
      description: "Observe e fotografe a fauna local em seu habitat natural",
      location: "Pantanal, MT",
      category: "Ecoturismo",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
      priceAmount: "300.00",
      duration: "5-6 horas",
      difficultyLevel: "easy",
      minParticipants: 3,
      maxParticipants: 10,
      coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      contactInfo: { phone: "(65) 99999-7777", email: "safari@pantanal.com" },
      createdById: createdUsers[6].id
    },

    // Fernando de Noronha
    {
      title: "Mergulho nas Piscinas Naturais",
      description: "Mergulho com snorkel em águas cristalinas repletas de vida marinha",
      location: "Fernando de Noronha, PE",
      category: "Aquático",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
      priceAmount: "225.00",
      duration: "4-5 horas",
      difficultyLevel: "moderate",
      minParticipants: 4,
      maxParticipants: 12,
      coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      contactInfo: { phone: "(81) 99999-8888", email: "mergulho@noronha.com" },
      createdById: createdUsers[7].id
    },

    // Bonito
    {
      title: "Flutuação no Rio da Prata",
      description: "Flutuação em águas cristalinas com peixes coloridos",
      location: "Bonito, MS",
      category: "Aquático",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
      priceAmount: "185.00",
      duration: "3-4 horas",
      difficultyLevel: "easy",
      minParticipants: 2,
      maxParticipants: 15,
      coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      contactInfo: { phone: "(67) 99999-9999", email: "flutuacao@bonito.com" },
      createdById: createdUsers[8].id
    },

    // Campos do Jordão
    {
      title: "Passeio de Trem pela Serra da Mantiqueira",
      description: "Viagem panorâmica pelos cenários montanhosos da região",
      location: "Campos do Jordão, SP",
      category: "Turismo",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
      priceAmount: "90.00",
      duration: "2-3 horas",
      difficultyLevel: "easy",
      minParticipants: 1,
      maxParticipants: 50,
      coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      contactInfo: { phone: "(12) 99999-0000", email: "trem@camposjordao.com" },
      createdById: createdUsers[9].id
    }
  ];

  // Insert activities
  const createdActivities = [];
  for (const activityData of activitiesData) {
    await db.insert(activities).values(activityData);
    // Get the created activity
    const [activity] = await db.select().from(activities).where(eq(activities.title, activityData.title));
    createdActivities.push(activity);
    console.log(`✅ Atividade criada: ${activity.title}`);
  }

  // 3. Create comprehensive trips (5 per user = 50 trips total)
  console.log("🧳 Criando 50 viagens completas...");
  
  const tripsData = [];
  const destinations = [
    "Rio de Janeiro, RJ", "São Paulo, SP", "Florianópolis, SC", "Chapada Diamantina, BA",
    "Pantanal, MT", "Fernando de Noronha, PE", "Bonito, MS", "Campos do Jordão, SP",
    "Gramado, RS", "Foz do Iguaçu, PR", "Jericoacoara, CE", "Maragogi, AL",
    "Ouro Preto, MG", "Paraty, RJ", "Búzios, RJ", "Ilha Grande, RJ",
    "Brotas, SP", "Ubatuba, SP", "Caldas Novas, GO", "Pirenópolis, GO"
  ];

  let tripId = 1;
  for (let userIndex = 0; userIndex < createdUsers.length; userIndex++) {
    const creator = createdUsers[userIndex];
    
    for (let tripIndex = 0; tripIndex < 5; tripIndex++) {
      const destination = destinations[(userIndex * 5 + tripIndex) % destinations.length];
      const startDate = new Date(Date.now() + (tripIndex * 7 + userIndex * 2) * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + (3 + tripIndex) * 24 * 60 * 60 * 1000);
      
      const trip = {
        creatorId: creator.id,
        title: `Aventura em ${destination.split(',')[0]} - ${creator.fullName}`,
        destination,
        startDate,
        endDate,
        budget: 1000 + (tripIndex * 500) + (userIndex * 200),
        budgetBreakdown: {
          transport: 300 + (tripIndex * 50),
          accommodation: 400 + (tripIndex * 100),
          food: 200 + (tripIndex * 30),
          activities: 150 + (tripIndex * 20),
          insurance: 50,
          other: 100 + (tripIndex * 10)
        },
        maxParticipants: 4 + (tripIndex % 6),
        description: `Viagem incrível para ${destination} com ${creator.fullName}. Uma experiência única que combina aventura, cultura e diversão!`,
        difficulty: ["Fácil", "Médio", "Difícil"][tripIndex % 3],
        travelStyle: creator.travelStyle,
        coverImage: `https://images.unsplash.com/photo-${1500000000000 + tripId}?w=800&q=80`,
        requirements: ["Documento de identidade", "Seguro de viagem"],
        includes: ["Hospedagem", "Café da manhã", "Guia local"],
        excludes: ["Passagens aéreas", "Seguro pessoal", "Refeições não mencionadas"]
      };
      
      tripsData.push(trip);
      tripId++;
    }
  }

  // Insert trips
  const createdTrips = [];
  for (const tripData of tripsData) {
    await db.insert(trips).values(tripData);
    // Get the created trip
    const [trip] = await db.select().from(trips).where(eq(trips.title, tripData.title));
    createdTrips.push(trip);
    console.log(`✅ Viagem criada: ${trip.title}`);
  }

  // 4. Create trip participants (each trip has 2-4 participants)
  console.log("👥 Adicionando participantes às viagens...");
  
  for (const trip of createdTrips) {
    // Creator is always a participant
    await db.insert(tripParticipants).values({
      tripId: trip.id,
      userId: trip.creatorId,
      status: "accepted",
      joinedAt: new Date()
    });

    // Add 1-3 additional participants
    const participantCount = 1 + Math.floor(Math.random() * 3);
    const availableUsers = createdUsers.filter(u => u.id !== trip.creatorId);
    
    for (let i = 0; i < participantCount && i < availableUsers.length; i++) {
      const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      
      try {
        await db.insert(tripParticipants).values({
          tripId: trip.id,
          userId: randomUser.id,
          status: "accepted",
          joinedAt: new Date()
        });
      } catch (error) {
        // Ignore duplicate participant entries
      }
    }
  }

  // 5. Create chat messages for each trip
  console.log("💬 Criando mensagens de chat...");
  
  for (const trip of createdTrips) {
    // Get trip participants
    const participants = await db.select().from(tripParticipants).where(eq(tripParticipants.tripId, trip.id));
    
    if (participants.length > 0) {
      // Create 5-10 messages per trip
      const messageCount = 5 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < messageCount; i++) {
        const randomParticipant = participants[Math.floor(Math.random() * participants.length)];
        const user = createdUsers.find(u => u.id === randomParticipant.userId);
        
        const messages_samples = [
          "Pessoal, estou muito animado para esta viagem! 🎉",
          "Já confirmei minha hospedagem, e vocês?",
          "Alguma sugestão de restaurante no local?",
          "Que tal nos encontrarmos antes da viagem?",
          "Estou levando minha câmera, vamos tirar muitas fotos!",
          "Pesquisei sobre o clima, melhor levar capa de chuva.",
          "Encontrei um local incrível para visitarmos!",
          "Vamos dividir o transporte? Fica mais barato!",
          "Já estou contando os dias! 😄",
          "Preparei uma playlist para a viagem!"
        ];
        
        await db.insert(messages).values({
          tripId: trip.id,
          senderId: randomParticipant.userId,
          content: messages_samples[i % messages_samples.length],
          sentAt: new Date(Date.now() - (messageCount - i) * 3600000) // Messages spread over hours
        });
      }
    }
  }

  // 6. Create expenses for trips
  console.log("💰 Criando despesas compartilhadas...");
  
  for (const trip of createdTrips) {
    const participants = await db.select().from(tripParticipants).where(eq(tripParticipants.tripId, trip.id));
    
    if (participants.length > 1) {
      // Create 2-4 expenses per trip
      const expenseCount = 2 + Math.floor(Math.random() * 3);
      
      const expenseCategories = ["transport", "accommodation", "food", "activities", "other"];
      const expenseDescriptions = {
        transport: ["Combustível", "Pedágio", "Estacionamento", "Táxi"],
        accommodation: ["Hotel", "Pousada", "Airbnb", "Hostel"],
        food: ["Jantar", "Almoço", "Café da manhã", "Lanche"],
        activities: ["Ingresso", "Passeio", "Guia", "Equipamento"],
        other: ["Farmácia", "Souvenir", "Diversos", "Emergência"]
      };
      
      for (let i = 0; i < expenseCount; i++) {
        const category = expenseCategories[i % expenseCategories.length] as keyof typeof expenseDescriptions;
        const descriptions = expenseDescriptions[category];
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];
        
        const amount = 50 + Math.floor(Math.random() * 200);
        const paidBy = participants[Math.floor(Math.random() * participants.length)].userId;
        
        await db.insert(expenses).values({
          tripId: trip.id,
          paidBy,
          amount,
          description,
          category
        });
        
        // Get the created expense
        const [expense] = await db.select().from(expenses).where(eq(expenses.tripId, trip.id)).orderBy(desc(expenses.id)).limit(1);
        
        // Split expense among all participants
        const amountPerPerson = amount / participants.length;
        
        for (const participant of participants) {
          await db.insert(expenseSplits).values({
            expenseId: expense.id,
            userId: participant.userId,
            amount: amountPerPerson
          });
        }
      }
    }
  }

  // 7. Create activity reviews
  console.log("⭐ Criando avaliações de atividades...");
  
  for (const activity of createdActivities) {
    const reviewCount = 1 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < reviewCount; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      const reviews_samples = [
        "Experiência incrível! Recomendo a todos!",
        "Muito bem organizado, guia excelente!",
        "Superou minhas expectativas!",
        "Atividade divertida e segura.",
        "Vista espetacular, valeu cada centavo!",
        "Profissionais muito atenciosos.",
        "Uma das melhores experiências da minha vida!",
        "Atividade imperdível no destino!"
      ];
      
      try {
        await db.insert(activityReviews).values({
          activityId: activity.id,
          userId: randomUser.id,
          rating: 3 + Math.floor(Math.random() * 3), // 3-5 stars
          review: reviews_samples[i % reviews_samples.length]
        });
      } catch (error) {
        // Ignore duplicate reviews
      }
    }
  }

  console.log("✅ Banco de dados populado com sucesso!");
  console.log(`📊 Resumo:
    - 10 usuários criados
    - ${createdActivities.length} atividades por destino
    - ${createdTrips.length} viagens completas
    - Participantes, mensagens e despesas adicionados
    - Avaliações de atividades criadas`);
}