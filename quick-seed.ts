import { db } from "./server/db";
import { trips, activities, destinations } from "./shared/schema";
import { eq } from "drizzle-orm";

async function quickSeed() {
  try {
    console.log("🌱 Populando banco com dados básicos...");

    // Add some destinations
    const destinationData = [
      { name: "Rio de Janeiro, RJ", state: "RJ", country: "Brasil", region: "Sudeste", countryType: "nacional", continent: "América do Sul" },
      { name: "São Paulo, SP", state: "SP", country: "Brasil", region: "Sudeste", countryType: "nacional", continent: "América do Sul" },
      { name: "Salvador, BA", state: "BA", country: "Brasil", region: "Nordeste", countryType: "nacional", continent: "América do Sul" },
      { name: "Gramado, RS", state: "RS", country: "Brasil", region: "Sul", countryType: "nacional", continent: "América do Sul" },
      { name: "Paris, França", state: "Île-de-France", country: "França", region: "Europa", countryType: "internacional", continent: "Europa" }
    ];

    for (const dest of destinationData) {
      const existing = await db.select().from(destinations).where(
        eq(destinations.name, dest.name)
      ).limit(1);
      
      if (existing.length === 0) {
        await db.insert(destinations).values(dest);
        console.log(`✅ Destino adicionado: ${dest.name}`);
      }
    }

    // Add some activities
    const activityData = [
      {
        title: "Cristo Redentor - Rio de Janeiro",
        description: "Visite um dos pontos turísticos mais famosos do mundo",
        destinationName: "Rio de Janeiro, RJ",
        category: "pontos_turisticos",
        location: "Rio de Janeiro, RJ",
        countryType: "nacional",
        region: "Sudeste",
        city: "Rio de Janeiro",
        priceType: "per_person",
        price: 85,
        duration: "4 horas",
        difficulty: "easy",
        minParticipants: 1,
        maxParticipants: 50,
        coverImage: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=1200&h=800&fit=crop&crop=entropy&auto=format&q=85",
        images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=1200&h=800&fit=crop&crop=entropy&auto=format&q=85"],
        inclusions: ["Transporte", "Ingresso", "Guia"],
        exclusions: ["Alimentação"],
        requirements: ["Documento de identificação"],
        isActive: true,
        averageRating: 4.8,
        totalRatings: 156,
        createdById: 9
      },
      {
        title: "Parque Ibirapuera - São Paulo", 
        description: "Conheça o principal parque de São Paulo",
        destinationName: "São Paulo, SP",
        category: "nature",
        location: "São Paulo, SP",
        countryType: "nacional",
        region: "Sudeste", 
        city: "São Paulo",
        priceType: "per_person",
        price: 0,
        duration: "3 horas",
        difficulty: "easy",
        minParticipants: 1,
        maxParticipants: 20,
        coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=1200&h=800&fit=crop&crop=entropy&auto=format&q=85",
        images: ["https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=1200&h=800&fit=crop&crop=entropy&auto=format&q=85"],
        inclusions: ["Entrada gratuita"],
        exclusions: ["Transporte", "Alimentação"],
        requirements: [],
        isActive: true,
        averageRating: 4.5,
        totalRatings: 89,
        createdById: 9
      },
      {
        title: "Pelourinho - Salvador",
        description: "Explore o centro histórico de Salvador",
        destinationName: "Salvador, BA",
        category: "cultural",
        location: "Salvador, BA",
        countryType: "nacional",
        region: "Nordeste",
        city: "Salvador", 
        priceType: "per_person",
        price: 45,
        duration: "5 horas",
        difficulty: "easy",
        minParticipants: 2,
        maxParticipants: 15,
        coverImage: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=1200&h=800&fit=crop&crop=entropy&auto=format&q=85",
        images: ["https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=1200&h=800&fit=crop&crop=entropy&auto=format&q=85"],
        inclusions: ["Guia local", "Degustação de acarajé"],
        exclusions: ["Transporte", "Outras refeições"],
        requirements: ["Calçado confortável"],
        isActive: true,
        averageRating: 4.7,
        totalRatings: 124,
        createdById: 9
      }
    ];

    for (const activity of activityData) {
      const existing = await db.select().from(activities).where(
        eq(activities.title, activity.title)
      ).limit(1);
      
      if (existing.length === 0) {
        await db.insert(activities).values(activity);
        console.log(`✅ Atividade adicionada: ${activity.title}`);
      }
    }

    // Add some sample trips
    const tripData = [
      {
        title: "Fim de Semana no Rio",
        description: "Viagem relax para curtir as praias e pontos turísticos cariocas",
        destination: "Rio de Janeiro, RJ",
        destination_id: 11,
        startDate: new Date("2025-08-15"),
        endDate: new Date("2025-08-17"),
        max_participants: 8,
        current_participants: 3,
        budget: 600,
        budgetType: "per_person",
        travel_style: "relaxamento",
        creator_id: 9, // User tom
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Aventura em Salvador",
        description: "Explorando a cultura e história baiana",
        destination: "Salvador, BA",
        destination_id: 13, 
        startDate: new Date("2025-09-10"),
        endDate: new Date("2025-09-14"),
        max_participants: 6,
        current_participants: 2,
        budget: 800,
        budgetType: "per_person",
        travel_style: "cultural",
        creator_id: 9, // User tom
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const trip of tripData) {
      const existing = await db.select().from(trips).where(
        eq(trips.title, trip.title)
      ).limit(1);
      
      if (existing.length === 0) {
        await db.insert(trips).values(trip);
        console.log(`✅ Viagem adicionada: ${trip.title}`);
      }
    }

    console.log("✅ Dados básicos adicionados com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro ao popular banco:", error);
  } finally {
    process.exit(0);
  }
}

quickSeed();