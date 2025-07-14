import { db } from "./db";
import { users, trips, tripParticipants, messages, activities, activityReviews } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const asyncScrypt = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await asyncScrypt(password, salt, 64);
  return `${(derivedKey as Buffer).toString('hex')}.${salt}`;
}

async function generateReferralCode(username: string, id: number): Promise<string> {
  return `PARTIU-${username.toUpperCase()}${id.toString().padStart(2, '0')}`;
}

async function createQuickTestData() {
  console.log("🌱 Criando dados de teste rápidos...");
  
  try {
    // First, clear existing data
    await db.delete(messages);
    await db.delete(tripParticipants);
    await db.delete(activityReviews);
    await db.delete(activities);
    await db.delete(trips);
    await db.delete(users);
    console.log("✅ Dados existentes removidos");
    
    const hashedPassword = await hashPassword("demo123");
    
    // Create users
    const userResult1 = await db.insert(users).values({
      username: "tom",
      email: "tom@exemplo.com",
      password: hashedPassword,
      fullName: "Tom Silva",
      phone: "11987654321",
      bio: "Aventureiro e amante da natureza",
      location: "São Paulo, SP",
      languages: JSON.stringify(["Português", "Inglês"]),
      interests: JSON.stringify(["Natureza", "Aventura", "Fotografia"]),
      travelStyle: JSON.stringify(["aventura"]),
      isVerified: true,
      verificationMethod: "document",
      referralCode: await generateReferralCode("tom", 1),
      averageRating: 4.8,
      totalRatings: 15
    });
    
    const userResult2 = await db.insert(users).values({
      username: "maria",
      email: "maria@exemplo.com",
      password: hashedPassword,
      fullName: "Maria Santos",
      phone: "21998887766",
      bio: "Exploradora urbana e gastronômica",
      location: "Rio de Janeiro, RJ",
      languages: JSON.stringify(["Português", "Espanhol"]),
      interests: JSON.stringify(["Gastronomia", "Cultura", "Praia"]),
      travelStyle: JSON.stringify(["culturais"]),
      isVerified: true,
      verificationMethod: "social",
      referralCode: await generateReferralCode("maria", 2),
      averageRating: 4.6,
      totalRatings: 12
    });
    
    console.log("✅ Usuários criados: tom, maria");
    
    // Create trips
    const tripResult1 = await db.insert(trips).values({
      creatorId: Number(userResult1.insertId),
      title: "Rio de Janeiro Completo",
      description: "Viagem completa pelo Rio de Janeiro incluindo pontos turísticos, praias e vida noturna",
      destination: "Rio de Janeiro, RJ",
      startDate: new Date("2025-08-15"),
      endDate: new Date("2025-08-22"),
      budget: 2500,
      maxParticipants: 6,
      currentParticipants: 2,
      travelStyle: "praia",
      status: "planned",
      coverImage: "https://images.unsplash.com/photo-1593995508197-85b2d6c72a8e?ixlib=rb-4.0.3",
      budgetBreakdown: JSON.stringify({
        transport: 600,
        accommodation: 800,
        food: 500,
        activities: 400,
        insurance: 100,
        other: 100
      })
    });
    
    const tripResult2 = await db.insert(trips).values({
      creatorId: Number(userResult2.insertId),
      title: "São Paulo Gastronômico",
      description: "Roteiro gastronômico por São Paulo com os melhores restaurantes e experiências culinárias",
      destination: "São Paulo, SP",
      startDate: new Date("2025-09-10"),
      endDate: new Date("2025-09-14"),
      budget: 1800,
      maxParticipants: 4,
      currentParticipants: 1,
      travelStyle: "culturais",
      status: "planned",
      coverImage: "https://images.unsplash.com/photo-1541219046-41d77e1b3e3b?ixlib=rb-4.0.3",
      budgetBreakdown: JSON.stringify({
        transport: 300,
        accommodation: 500,
        food: 700,
        activities: 200,
        insurance: 50,
        other: 50
      })
    });
    
    console.log("✅ Viagens criadas: Rio de Janeiro, São Paulo");
    
    // Add participants
    await db.insert(tripParticipants).values([
      {
        tripId: Number(tripResult1.insertId),
        userId: Number(userResult1.insertId),
        status: "accepted",
        joinedAt: new Date()
      },
      {
        tripId: Number(tripResult1.insertId),
        userId: Number(userResult2.insertId),
        status: "accepted", 
        joinedAt: new Date()
      },
      {
        tripId: Number(tripResult2.insertId),
        userId: Number(userResult2.insertId),
        status: "accepted",
        joinedAt: new Date()
      }
    ]);
    
    console.log("✅ Participantes adicionados");
    
    // Create activities
    const activityResult1 = await db.insert(activities).values({
      title: "Trilha no Pão de Açúcar",
      description: "Trilha guiada até o topo do Pão de Açúcar com vista panorâmica do Rio",
      category: "natureza",
      location: "Rio de Janeiro, RJ",
      price: 120,
      duration: "4 horas",
      difficulty: "médio",
      createdById: Number(userResult1.insertId),
      averageRating: 4.8,
      totalReviews: 25
    });
    
    const activityResult2 = await db.insert(activities).values({
      title: "Tour Gastronômico Vila Madalena",
      description: "Tour pelos melhores restaurantes e bares da Vila Madalena",
      category: "gastronomia",
      location: "São Paulo, SP",
      price: 180,
      duration: "6 horas",
      difficulty: "fácil",
      createdById: Number(userResult2.insertId),
      averageRating: 4.7,
      totalReviews: 18
    });
    
    console.log("✅ Atividades criadas");
    
    // Create messages
    await db.insert(messages).values([
      {
        tripId: Number(tripResult1.insertId),
        senderId: Number(userResult1.insertId),
        message: "Pessoal, estou muito animado para esta viagem ao Rio! Já separei as principais atrações.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        tripId: Number(tripResult1.insertId),
        senderId: Number(userResult2.insertId),
        message: "Que legal Tom! Já pesquisei alguns restaurantes incríveis que não podemos perder.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]);
    
    console.log("✅ Mensagens criadas");
    
    console.log("🎉 Dados de teste rápidos criados com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro ao criar dados de teste:", error);
    throw error;
  }
}

async function main() {
  await createQuickTestData();
  process.exit(0);
}

main().catch(console.error);