import { db } from "./db";
import { 
  users, trips, tripParticipants, messages, expenses, expenseSplits,
  activities, activityReviews, activityBookings
} from "../shared/schema";
import bcrypt from "bcryptjs";

const destinationActivities = {
  "Rio de Janeiro, RJ": [
    {
      title: "Trilha no Pão de Açúcar",
      description: "Trilha guiada até o topo do Pão de Açúcar com vista panorâmica da cidade maravilhosa.",
      category: "adventure",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",location: "Rio de Janeiro, RJ",
      price: 80,
      duration: "4 horas",
      difficulty: "medium",
      minParticipants: 2,
      maxParticipants: 12,
      coverImage: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80"],
      inclusions: ["Guia especializado", "Equipamentos de segurança", "Água", "Seguro"],
      exclusions: ["Transporte até o local", "Alimentação"],
      requirements: ["Condicionamento físico básico", "Calçado adequado", "Idade mínima 12 anos"]
    },
    {
      title: "City Tour Rio Histórico",
      description: "Conheça os principais pontos turísticos e históricos do Rio de Janeiro em um tour completo.",
      category: "sightseeing",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",location: "Rio de Janeiro, RJ",
      price: 120,
      duration: "8 horas",
      difficulty: "easy",
      minParticipants: 4,
      maxParticipants: 20,
      coverImage: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80"],
      inclusions: ["Transporte", "Guia turístico", "Entrada nos pontos turísticos", "Almoço"],
      exclusions: ["Bebidas extras", "Compras pessoais"],
      requirements: ["Documento de identificação"]
    },
    {
      title: "Aula de Surf em Ipanema",
      description: "Aprenda a surfar nas ondas de Ipanema com instrutores experientes.",
      category: "sports",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",location: "Rio de Janeiro, RJ", 
      price: 100,
      duration: "3 horas",
      difficulty: "beginner",
      minParticipants: 1,
      maxParticipants: 8,
      coverImage: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80"],
      inclusions: ["Prancha", "Roupa de neoprene", "Instrutor", "Seguro"],
      exclusions: ["Transporte", "Alimentação"],
      requirements: ["Saber nadar", "Condicionamento físico básico"]
    },
    {
      title: "Tour Gastronômico Santa Teresa",
      description: "Deguste os sabores autênticos do Rio no charmoso bairro de Santa Teresa.",
      category: "food",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",location: "Rio de Janeiro, RJ",
      price: 95,
      duration: "4 horas",
      difficulty: "easy",
      minParticipants: 4,
      maxParticipants: 15,
      coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"],
      inclusions: ["Degustações", "Guia gastronômico", "Bebidas", "Sobremesas"],
      exclusions: ["Transporte", "Refeições completas"],
      requirements: ["Informar restrições alimentares"]
    },
    {
      title: "Passeio de Barco Baía de Guanabara",
      description: "Navegue pela Baía de Guanabara e aprecie o Rio de Janeiro de uma perspectiva única.",
      category: "boat",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",location: "Rio de Janeiro, RJ",
      price: 150,
      duration: "6 horas",
      difficulty: "easy",
      minParticipants: 8,
      maxParticipants: 30,
      coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"],
      inclusions: ["Embarcação", "Tripulação", "Colete salva-vidas", "Bebidas", "Lanche"],
      exclusions: ["Transporte até o pier", "Refeições principais"],
      requirements: ["Documento de identificação", "Não ter enjoo marítimo"]
    }
  ],
  "São Paulo, SP": [
    {
      title: "Tour Gastronômico Vila Madalena",
      description: "Explore os melhores restaurantes e bares da boêmia Vila Madalena.",
      category: "food",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",location: "São Paulo, SP",
      price: 110,
      duration: "5 horas",
      difficulty: "easy",
      minParticipants: 4,
      maxParticipants: 12,
      coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"],
      inclusions: ["Degustações", "Guia gastronômico", "3 estabelecimentos", "Bebidas"],
      exclusions: ["Transporte", "Refeições completas"],
      requirements: ["Idade mínima 18 anos", "Informar restrições alimentares"]
    },
    {
      title: "Visita ao MASP e Pinacoteca",
      description: "Conheça os principais museus de arte de São Paulo em uma visita guiada.",
      category: "culture",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",location: "São Paulo, SP",
      price: 85,
      duration: "6 horas",
      difficulty: "easy",
      minParticipants: 2,
      maxParticipants: 15,
      coverImage: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80"],
      inclusions: ["Entrada nos museus", "Guia especializado", "Material educativo"],
      exclusions: ["Transporte", "Alimentação", "Audioguia"],
      requirements: ["Documento de identificação"]
    },
    {
      title: "Escalada Indoor Urban Climb",
      description: "Desafie-se nas paredes de escalada indoor mais modernas da cidade.",
      category: "sports",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",location: "São Paulo, SP",
      price: 75,
      duration: "3 horas",
      difficulty: "medium",
      minParticipants: 1,
      maxParticipants: 10,
      coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80"],
      inclusions: ["Equipamentos", "Instrutor", "Seguro", "Vestiário"],
      exclusions: ["Calçado específico", "Alimentação"],
      requirements: ["Condicionamento físico básico", "Roupa adequada", "Idade mínima 12 anos"]
    },
    {
      title: "City Tour Arquitetônico",
      description: "Descubra a arquitetura única de São Paulo com especialista em urbanismo.",
      category: "sightseeing",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",location: "São Paulo, SP",
      price: 95,
      duration: "4 horas",
      difficulty: "easy",
      minParticipants: 6,
      maxParticipants: 20,
      coverImage: "https://images.unsplash.com/photo-1541578460-2c70e5a12c14?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1541578460-2c70e5a12c14?w=800&q=80"],
      inclusions: ["Transporte", "Guia arquiteto", "Material informativo", "Água"],
      exclusions: ["Entrada em edifícios privados", "Alimentação"],
      requirements: ["Disposição para caminhar"]
    },
    {
      title: "Aula de Culinária Brasileira",
      description: "Aprenda a preparar pratos típicos brasileiros com chef renomado.",
      category: "food",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",location: "São Paulo, SP",
      price: 130,
      duration: "4 horas",
      difficulty: "easy",
      minParticipants: 6,
      maxParticipants: 12,
      coverImage: "https://images.unsplash.com/photo-1556909202-f58e882332fb?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1556909202-f58e882332fb?w=800&q=80"],
      inclusions: ["Ingredientes", "Chef instrutor", "Degustação", "Receitas", "Avental"],
      exclusions: ["Transporte", "Bebidas alcoólicas"],
      requirements: ["Informar alergias alimentares"]
    }
  ],
  "Florianópolis, SC": [
    {
      title: "Trilha Lagoa do Peri",
      description: "Trilha ecológica pela maior lagoa de água doce da ilha com banho refrescante.",
      category: "adventure",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",location: "Florianópolis, SC",
      price: 60,
      duration: "5 horas",
      difficulty: "medium",
      minParticipants: 4,
      maxParticipants: 15,
      coverImage: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80"],
      inclusions: ["Guia ambiental", "Lanche", "Água", "Seguro"],
      exclusions: ["Transporte", "Equipamentos de mergulho"],
      requirements: ["Condicionamento físico básico", "Roupa de banho", "Protetor solar"]
    },
    {
      title: "Tour Histórico Centro de Florianópolis",
      description: "Conheça a história e cultura açoriana da capital catarinense.",
      category: "culture",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",location: "Florianópolis, SC",
      price: 50,
      duration: "3 horas",
      difficulty: "easy",
      minParticipants: 4,
      maxParticipants: 20,
      coverImage: "https://images.unsplash.com/photo-1574798834391-25b2b7f98b58?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1574798834391-25b2b7f98b58?w=800&q=80"],
      inclusions: ["Guia histórico", "Entrada em museus", "Material educativo"],
      exclusions: ["Transporte", "Alimentação"],
      requirements: ["Documento de identificação"]
    },
    {
      title: "Aula de Surf na Joaquina",
      description: "Aprenda a surfar na praia mais famosa para surf de Santa Catarina.",
      category: "sports",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",location: "Florianópolis, SC",
      price: 90,
      duration: "3 horas",
      difficulty: "beginner",
      minParticipants: 2,
      maxParticipants: 8,
      coverImage: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80"],
      inclusions: ["Prancha", "Roupa de neoprene", "Instrutor certificado", "Seguro"],
      exclusions: ["Transporte", "Alimentação"],
      requirements: ["Saber nadar", "Idade mínima 12 anos"]
    },
    {
      title: "Passeio de Barco Ilha do Campeche",
      description: "Navegue até a paradisíaca Ilha do Campeche com snorkeling incluso.",
      category: "boat",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",location: "Florianópolis, SC",
      price: 180,
      duration: "8 horas",
      difficulty: "easy",
      minParticipants: 8,
      maxParticipants: 25,
      coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"],
      inclusions: ["Embarcação", "Equipamento snorkeling", "Almoço", "Bebidas", "Guia"],
      exclusions: ["Transporte até o pier", "Equipamentos profissionais"],
      requirements: ["Saber nadar", "Documento de identificação"]
    },
    {
      title: "Degustação de Ostras Santo Antônio",
      description: "Experimente as melhores ostras da região em fazenda marinha tradicional.",
      category: "food",
      
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",location: "Florianópolis, SC",
      price: 85,
      duration: "4 horas",
      difficulty: "easy",
      minParticipants: 4,
      maxParticipants: 12,
      coverImage: "https://images.unsplash.com/photo-1562342140-ad31c9b41e77?w=800&q=80",
      images: ["https://images.unsplash.com/photo-1562342140-ad31c9b41e77?w=800&q=80"],
      inclusions: ["Degustação ostras", "Guia especializado", "Bebidas", "Aperitivos"],
      exclusions: ["Transporte", "Refeições principais"],
      requirements: ["Não ter alergia a frutos do mar"]
    }
  ]
};

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function createComprehensiveSeedData() {
  console.log("🌱 Criando dados abrangentes de teste...");
  
  try {
    // Clear existing data
    console.log("🧹 Limpando dados existentes...");
    await db.delete(activityReviews);
    await db.delete(activityBookings);
    await db.delete(activities);
    await db.delete(expenseSplits);
    await db.delete(expenses);
    await db.delete(messages);
    await db.delete(tripParticipants);
    await db.delete(trips);
    await db.delete(users);

    // Create users
    console.log("👥 Criando usuários...");
    const hashedPassword = await hashPassword("demo123");
    
    const usersList = [
      {
        username: "tom",
        email: "tom@example.com",
        fullName: "Tom Tubin",
        phone: "(51) 99999-9999",
        bio: "Aventureiro nato, sempre em busca de novas experiências. Criador da comunidade PartiuTrip!",
        location: "Porto Alegre, RS",
        languages: JSON.stringify(["Português", "Inglês", "Espanhol"]),
        interests: JSON.stringify(["Aventura", "Fotografia", "Culinária Local", "História"]),
        travelStyle: "aventura",
        isVerified: true,
        verificationMethod: "founder"
      },
      {
        username: "maria",
        email: "maria@example.com", 
        fullName: "Maria Silva",
        phone: "(11) 98888-8888",
        bio: "Apaixonada por praias e culturas diferentes. Sempre pronta para uma nova aventura!",
        location: "São Paulo, SP",
        languages: JSON.stringify(["Português", "Inglês"]),
        interests: JSON.stringify(["Praia", "Cultura", "Gastronomia", "Fotografia"]),
        travelStyle: "praia",
        isVerified: true,
        verificationMethod: "referral"
      },
      {
        username: "carlos",
        email: "carlos@example.com",
        fullName: "Carlos Mendes",
        phone: "(21) 97777-7777", 
        bio: "Montanhista experiente, guia de trilhas e amante da natureza.",
        location: "Rio de Janeiro, RJ",
        languages: JSON.stringify(["Português", "Inglês", "Francês"]),
        interests: JSON.stringify(["Montanhismo", "Trilhas", "Natureza", "Escalada"]),
        travelStyle: "natureza",
        isVerified: true,
        verificationMethod: "referral"
      },
      {
        username: "ana",
        email: "ana@example.com",
        fullName: "Ana Costa",
        phone: "(47) 96666-6666",
        bio: "Historiadora e especialista em turismo cultural. Amo descobrir histórias locais!",
        location: "Florianópolis, SC",
        languages: JSON.stringify(["Português", "Espanhol", "Italiano"]),
        interests: JSON.stringify(["História", "Museus", "Arquitetura", "Arte"]),
        travelStyle: "cultural",
        isVerified: true,
        verificationMethod: "referral"
      },
      {
        username: "ricardo",
        email: "ricardo@example.com",
        fullName: "Ricardo Santos",
        phone: "(85) 95555-5555",
        bio: "Chef de cozinha e especialista em gastronomia regional brasileira.",
        location: "Fortaleza, CE",
        languages: JSON.stringify(["Português", "Inglês"]),
        interests: JSON.stringify(["Gastronomia", "Culinária Regional", "Mercados Locais", "Vinhos"]),
        travelStyle: "cultural",
        isVerified: true,
        verificationMethod: "referral"
      }
    ];

    const userIds: number[] = [];
    for (const userData of usersList) {
      const [insertResult] = await db.insert(users).values({
        ...userData,
        password: hashedPassword
      });
      userIds.push(insertResult.insertId);
      console.log(`✅ Usuário criado: ${userData.username} (ID: ${insertResult.insertId})`);
    }

    // Create comprehensive trips
    console.log("🚗 Criando viagens abrangentes...");
    
    const tripsData = [
      // Tom's trips
      {
        creatorId: userIds[0], // tom
        title: "Aventura Completa no Rio de Janeiro",
        destination: "Rio de Janeiro, RJ",
        startDate: new Date("2025-08-15"),
        endDate: new Date("2025-08-20"),
        budget: 2500,
        budgetBreakdown: JSON.stringify({
          transport: 600,
          accommodation: 800,
          food: 500,
          activities: 400,
          insurance: 100,
          other: 100
        }),
        maxParticipants: 8,
        description: "Explore o Rio de Janeiro com trilhas, praias, gastronomia e cultura local. Uma experiência completa na cidade maravilhosa!",
        travelStyle: "aventura",
        status: "open"
      },
      {
        creatorId: userIds[0], // tom
        title: "Descobrindo São Paulo Cultural",
        destination: "São Paulo, SP",
        startDate: new Date("2025-09-10"),
        endDate: new Date("2025-09-14"),
        budget: 1800,
        budgetBreakdown: JSON.stringify({
          transport: 400,
          accommodation: 600,
          food: 450,
          activities: 250,
          insurance: 50,
          other: 50
        }),
        maxParticipants: 6,
        description: "Mergulhe na cultura paulistana: museus, gastronomia, arquitetura e vida noturna da maior metrópole do Brasil.",
        travelStyle: "urbanas",
        status: "open"
      },
      {
        creatorId: userIds[0], // tom
        title: "Relaxamento em Florianópolis",
        destination: "Florianópolis, SC", 
        startDate: new Date("2025-10-05"),
        endDate: new Date("2025-10-10"),
        budget: 2200,
        budgetBreakdown: JSON.stringify({
          transport: 500,
          accommodation: 700,
          food: 400,
          activities: 450,
          insurance: 75,
          other: 75
        }),
        maxParticipants: 10,
        description: "Praias paradisíacas, trilhas ecológicas e gastronomia local em uma das ilhas mais belas do Brasil.",
        travelStyle: "praia",
        status: "open"
      },
      {
        creatorId: userIds[0], // tom
        title: "Expedição Pantanal Selvagem",
        destination: "Pantanal, MS",
        startDate: new Date("2025-11-20"),
        endDate: new Date("2025-11-26"),
        budget: 3500,
        budgetBreakdown: JSON.stringify({
          transport: 800,
          accommodation: 1200,
          food: 600,
          activities: 700,
          insurance: 100,
          other: 100
        }),
        maxParticipants: 12,
        description: "Safari fotográfico na maior planície alagável do mundo. Encontros únicos com a fauna brasileira.",
        travelStyle: "natureza",
        status: "open"
      },
      {
        creatorId: userIds[0], // tom
        title: "Aventura no Nordeste - Chapada Diamantina",
        destination: "Chapada Diamantina, BA",
        startDate: new Date("2025-12-15"),
        endDate: new Date("2025-12-22"),
        budget: 2800,
        budgetBreakdown: JSON.stringify({
          transport: 700,
          accommodation: 900,
          food: 450,
          activities: 550,
          insurance: 100,
          other: 100
        }),
        maxParticipants: 8,
        description: "Cachoeiras cristalinas, cavernas misteriosas e trilhas desafiadoras na joia baiana.",
        travelStyle: "natureza",
        status: "open"
      },
      // Maria's trips
      {
        creatorId: userIds[1], // maria
        title: "Praias Secretas de São Paulo",
        destination: "Ubatuba, SP",
        startDate: new Date("2025-08-22"),
        endDate: new Date("2025-08-26"),
        budget: 1600,
        budgetBreakdown: JSON.stringify({
          transport: 350,
          accommodation: 600,
          food: 350,
          activities: 200,
          insurance: 50,
          other: 50
        }),
        maxParticipants: 6,
        description: "Explore praias selvagens e intocadas do litoral norte paulista com acesso exclusivo.",
        travelStyle: "praia",
        status: "open"
      },
      {
        creatorId: userIds[1], // maria
        title: "Cultural Rio de Janeiro",
        destination: "Rio de Janeiro, RJ",
        startDate: new Date("2025-09-18"),
        endDate: new Date("2025-09-22"),
        budget: 2000,
        budgetBreakdown: JSON.stringify({
          transport: 450,
          accommodation: 700,
          food: 400,
          activities: 350,
          insurance: 50,
          other: 50
        }),
        maxParticipants: 10,
        description: "Mergulhe na cultura carioca: museus, centros culturais, música e gastronomia local.",
        travelStyle: "cultural",
        status: "open"
      },
      {
        creatorId: userIds[1], // maria
        title: "Gastronomia de Minas Gerais",
        destination: "Ouro Preto, MG",
        startDate: new Date("2025-10-12"),
        endDate: new Date("2025-10-16"),
        budget: 1400,
        budgetBreakdown: JSON.stringify({
          transport: 300,
          accommodation: 500,
          food: 350,
          activities: 200,
          insurance: 25,
          other: 25
        }),
        maxParticipants: 8,
        description: "Patrimônio histórico e culinária mineira tradicional em uma das cidades mais charmosas do Brasil.",
        travelStyle: "cultural",
        status: "open"
      },
      {
        creatorId: userIds[1], // maria
        title: "Praias do Nordeste - Jericoacoara",
        destination: "Jericoacoara, CE",
        startDate: new Date("2025-11-10"),
        endDate: new Date("2025-11-15"),
        budget: 2400,
        budgetBreakdown: JSON.stringify({
          transport: 650,
          accommodation: 800,
          food: 400,
          activities: 450,
          insurance: 50,
          other: 50
        }),
        maxParticipants: 12,
        description: "Paraíso nordestino com dunas, lagoas cristalinas e pôr do sol inesquecível.",
        travelStyle: "praia",
        status: "open"
      },
      {
        creatorId: userIds[1], // maria
        title: "Arquitetura e Design em Brasília",
        destination: "Brasília, DF",
        startDate: new Date("2025-12-08"),
        endDate: new Date("2025-12-11"),
        budget: 1200,
        budgetBreakdown: JSON.stringify({
          transport: 400,
          accommodation: 450,
          food: 200,
          activities: 120,
          insurance: 15,
          other: 15
        }),
        maxParticipants: 8,
        description: "Descubra a arquitetura modernista única da capital federal e sua história.",
        travelStyle: "cultural",
        status: "open"
      }
    ];

    // Insert trips
    const tripIds: number[] = [];
    for (const tripData of tripsData) {
      const [insertResult] = await db.insert(trips).values(tripData);
      const tripId = insertResult.insertId;
      tripIds.push(tripId);
      console.log(`✅ Viagem criada: ${tripData.title} (ID: ${tripId})`);
    }

    // Create activities for each destination
    console.log("🎯 Criando atividades por destino...");
    
    const allActivities: any[] = [];
    for (const [destination, destinationActivitiesList] of Object.entries(destinationActivities)) {
      for (const activity of destinationActivitiesList) {
        const [insertResult] = await db.insert(activities).values({
          ...activity,
          createdById: userIds[0], // tom as creator
          averageRating: 4 + Math.random(), // 4.0-5.0 rating
          totalReviews: Math.floor(Math.random() * 50) + 10 // 10-60 reviews
        });
        allActivities.push({ id: insertResult.insertId, ...activity });
        console.log(`✅ Atividade criada: ${activity.title}`);
      }
    }

    // Create trip participants
    console.log("👥 Adicionando participantes às viagens...");
    
    const participantCombos = [
      [1, 2, 3], // tom, maria, carlos
      [1, 4, 5], // tom, ana, ricardo
      [2, 3, 4], // maria, carlos, ana
      [2, 1, 5], // maria, tom, ricardo
      [3, 4, 5], // carlos, ana, ricardo
    ];

    for (let i = 0; i < tripIds.length; i++) {
      const tripId = tripIds[i];
      const participants = participantCombos[i % participantCombos.length];
      
      for (const userId of participants) {
        await db.insert(tripParticipants).values({
          tripId,
          userId,
          status: "accepted",
          joinedAt: new Date()
        });
      }
      
      // Update trip currentParticipants count
      await db.update(trips).set({ 
        currentParticipants: participants.length 
      }).where({ id: tripId });
    }

    // Create messages for each trip
    console.log("💬 Criando mensagens de chat...");
    
    const sampleMessages = [
      "Pessoal, estou muito animado para essa viagem! 🎉",
      "Já confirmei a hospedagem, está tudo certo!",
      "Que horas vocês chegam no aeroporto?",
      "Encontrei um restaurante incrível para experimentarmos",
      "Não esqueçam do protetor solar! ☀️",
      "Viagem vai ser épica! Mal posso esperar",
      "Já separei as roupas, falta pouco!",
      "Checklist da viagem: passagens ✓ hospedagem ✓ diversão ✓",
      "Vocês viram a previsão do tempo? Perfeita!",
      "Essa vai ser inesquecível!"
    ];

    for (let i = 0; i < tripIds.length; i++) {
      const tripId = tripIds[i];
      const participants = participantCombos[i % participantCombos.length];
      
      // Create 3-5 messages per trip
      const messageCount = Math.floor(Math.random() * 3) + 3;
      for (let j = 0; j < messageCount; j++) {
        const senderId = participants[Math.floor(Math.random() * participants.length)];
        const message = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
        
        await db.insert(messages).values({
          tripId,
          senderId,
          content: message,
          sentAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last week
        });
      }
    }

    // Create expenses for each trip
    console.log("💰 Criando despesas compartilhadas...");
    
    const expenseCategories = [
      { category: "transport", 
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",description: "Passagens aéreas", amount: 400 },
      { category: "accommodation", 
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",description: "Hospedagem 3 noites", amount: 300 },
      { category: "food", 
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",description: "Jantar no restaurante local", amount: 150 },
      { category: "activities", 
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",description: "Passeio guiado", amount: 100 },
      { category: "transport", 
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",description: "Táxi do aeroporto", amount: 80 },
      { category: "food", 
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",description: "Almoço na praia", amount: 120 },
      { category: "other", 
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",description: "Souvenirs", amount: 60 }
    ];

    for (let i = 0; i < tripIds.length; i++) {
      const tripId = tripIds[i];
      const participants = participantCombos[i % participantCombos.length];
      
      // Create 2-4 expenses per trip
      const expenseCount = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < expenseCount; j++) {
        const expense = expenseCategories[j % expenseCategories.length];
        const paidBy = participants[Math.floor(Math.random() * participants.length)];
        
        const [expenseResult] = await db.insert(expenses).values({
          tripId,
          paidBy,
          amount: expense.amount,
          description: expense.description,
          category: expense.category
        });
        
        const expenseId = expenseResult.insertId;
        
        // Create expense splits for all participants
        const amountPerPerson = expense.amount / participants.length;
        for (const userId of participants) {
          await db.insert(expenseSplits).values({
            expenseId,
            userId,
            amount: amountPerPerson,
            paid: userId === paidBy || Math.random() > 0.5 // Payer or 50% chance others paid
          });
        }
      }
    }

    // Create activity reviews
    console.log("⭐ Criando avaliações de atividades...");
    
    const reviewComments = [
      "Experiência incrível! Recomendo muito!",
      "Superou todas as expectativas. Guia excelente!",
      "Vale muito a pena! Voltaria sem dúvida.",
      "Atividade bem organizada e divertida.",
      "Momentos inesquecíveis! Equipe muito profissional.",
      "Perfeito para quem busca aventura!",
      "Ótimo custo-benefício. Adorei!",
      "Experiência única! Staff muito atencioso."
    ];

    for (const activity of allActivities) {
      // Create 3-8 reviews per activity
      const reviewCount = Math.floor(Math.random() * 6) + 3;
      for (let i = 0; i < reviewCount; i++) {
        const userId = userIds[Math.floor(Math.random() * userIds.length)]; // Random user 1-5
        const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
        const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
        
        await db.insert(activityReviews).values({
          activityId: activity.id,
          userId,
          rating,
          review: comment,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
      }
    }

    // Create some activity bookings
    console.log("📅 Criando reservas de atividades...");
    
    for (let i = 0; i < 20; i++) {
      const activity = allActivities[Math.floor(Math.random() * allActivities.length)];
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      
      await db.insert(activityBookings).values({
        activityId: activity.id,
        userId,
        participants: Math.floor(Math.random() * 4) + 1,
        contactName: `Usuário ${userId}`,
        contactEmail: `user${userId}@example.com`,
        contactPhone: `(11) 9999${userId}-000${userId}`,
        bookingDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000), // Random future date within 60 days
        totalAmount: activity.price * (Math.floor(Math.random() * 4) + 1),
        status: Math.random() > 0.2 ? "confirmed" : "pending"
      });
    }
    
    console.log("✅ Sistema abrangente de dados criado com sucesso!");
    console.log(`📊 Resumo criado:`);
    console.log(`👥 5 usuários completos`);
    console.log(`🚗 ${tripsData.length} viagens com orçamentos detalhados`);
    console.log(`🎯 ${allActivities.length} atividades por destino`);
    console.log(`💬 Mensagens de chat em todas as viagens`);
    console.log(`💰 Despesas compartilhadas com divisão`);
    console.log(`⭐ Avaliações e reservas de atividades`);
    
  } catch (error) {
    console.error("❌ Erro ao criar dados abrangentes:", error);
    throw error;
  }
}