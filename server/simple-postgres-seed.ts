import { db } from "./db";
import { users, destinations, trips, tripParticipants } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const asyncScrypt = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await asyncScrypt(password, salt, 64);
  return `${(derivedKey as Buffer).toString('hex')}.${salt}`;
}

export async function createSimpleSeedData() {
  console.log("🌱 Criando dados PostgreSQL...");

  try {
    const hashedPassword = await hashPassword("password123");

    // Create basic destinations first
    console.log("📍 Criando destinos...");
    const destinationData = [
      {
        name: "Rio de Janeiro",
        state: "RJ",
        country: "Brasil",
        countryType: "nacional",
        region: "Sudeste",
        continent: "América do Sul",
        latitude: "-22.906847",
        longitude: "-43.172896",
        timezone: "America/Sao_Paulo"
      },
      {
        name: "São Paulo", 
        state: "SP",
        country: "Brasil",
        countryType: "nacional",
        region: "Sudeste",
        continent: "América do Sul",
        latitude: "-23.550520",
        longitude: "-46.633309",
        timezone: "America/Sao_Paulo"
      }
    ];

    const destinationResults = await db.insert(destinations).values(destinationData).returning({ id: destinations.id });
    console.log(`✅ ${destinationResults.length} destinos criados`);

    // Create users
    console.log("👥 Criando usuários...");
    const userData = [
      {
        username: "tom",
        email: "tom@exemplo.com",
        fullName: "Tom Silva",
        phone: "(11) 98765-4321",
        bio: "Aventureiro e amante da natureza",
        location: "São Paulo, SP",
        languages: ["Português", "Inglês"],
        interests: ["Natureza", "Aventura", "Fotografia"],
        travelStyles: ["aventura"],
        isVerified: true,
        verificationMethod: "document",
        averageRating: "4.80",
        totalRatings: 15
      },
      {
        username: "maria",
        email: "maria@exemplo.com", 
        fullName: "Maria Santos",
        phone: "(21) 99888-7766",
        bio: "Exploradora urbana e gastronômica",
        location: "Rio de Janeiro, RJ",
        languages: ["Português", "Espanhol"],
        interests: ["Gastronomia", "Cultura", "Praia"],
        travelStyles: ["cultural"],
        isVerified: true,
        verificationMethod: "social",
        referredBy: "PARTIU-TOM01",
        averageRating: "4.60",
        totalRatings: 12
      }
    ];

    const userResults = await db.insert(users).values(userData.map(u => ({
      ...u,
      password: hashedPassword
    }))).returning({ id: users.id });
    console.log(`✅ ${userResults.length} usuários criados`);

    // Create trips
    console.log("🚗 Criando viagens...");
    const tripData = [
      {
        creator_id: userResults[0].id,
        title: "Rio de Janeiro Completo",
        destination_id: destinationResults[0].id,
        coverImage: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
        startDate: new Date("2025-08-15"),
        endDate: new Date("2025-08-20"),
        budget: 2000,
        budget_breakdown: {
          transport: 400,
          accommodation: 600,
          food: 500,
          insurance: 100,
          other: 400
        },
        max_participants: 6,
        description: "Explore o Rio de Janeiro com praias, trilhas e cultura local.",
        travel_style: "aventura"
      },
      {
        creator_id: userResults[1].id,
        title: "São Paulo Gastronômico",
        destination_id: destinationResults[1].id,
        coverImage: "https://images.unsplash.com/photo-1541344114433-4b3dc3b5c9a1?w=800&q=80",
        startDate: new Date("2025-09-10"),
        endDate: new Date("2025-09-13"),
        budget: 1500,
        budget_breakdown: {
          transport: 300,
          accommodation: 400,
          food: 600,
          insurance: 100,
          other: 100
        },
        max_participants: 4,
        description: "Tour gastronômico pelos melhores restaurantes de São Paulo.",
        travel_style: "cultural"
      }
    ];

    const tripResults = await db.insert(trips).values(tripData).returning({ id: trips.id });
    console.log(`✅ ${tripResults.length} viagens criadas`);

    // Add creators as participants
    console.log("👥 Adicionando criadores como participantes...");
    const participantsData = [
      {
        trip_id: tripResults[0].id,
        user_id: userResults[0].id,
        status: "accepted"
      },
      {
        trip_id: tripResults[1].id,
        user_id: userResults[1].id,
        status: "accepted"
      }
    ];

    await db.insert(tripParticipants).values(participantsData);
    console.log("✅ Participantes adicionados");

    console.log("🎉 Seed de dados PostgreSQL concluído com sucesso!");

  } catch (error) {
    console.error("❌ Erro no seed PostgreSQL:", error);
    throw error;
  }
}