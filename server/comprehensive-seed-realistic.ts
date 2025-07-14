import { db } from "./db";
import { 
  users, trips, tripParticipants, messages, expenses, expenseSplits,
  activities, activityReviews, activityBookings
} from "../shared/schema";
import bcrypt from "bcryptjs";

// Função para hash de senha
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Função para gerar código de referência
function generateReferralCode(username: string, id: number): string {
  return `PARTIU-${username.toUpperCase()}${id.toString().padStart(2, '0')}`;
}

// Usuários realistas com diversidade geográfica
const realisticUsers = [
  {
    username: "tom",
    email: "tom@email.com",
    password: "demo123",
    fullName: "Tom Tubin",
    phone: "(51) 99999-1111",
    bio: "Aventureiro de Porto Alegre apaixonado por montanhas e trilhas. Sempre em busca de novas experiências!",
    location: "Porto Alegre, RS",
    profilePhoto: "https://thispersondoesnotexist.com/image?seed=tom",
    languages: ["Português", "Inglês"],
    interests: ["Trilhas", "Montanhismo", "Fotografia"],
    travelStyles: ["aventura", "natureza"]
  },
  {
    username: "maria",
    email: "maria@email.com", 
    password: "demo123",
    fullName: "Maria Santos",
    phone: "(21) 98888-2222",
    bio: "Carioca que adora praias e cultura. Viajo para conhecer pessoas incríveis e criar memórias inesquecíveis!",
    location: "Rio de Janeiro, RJ",
    profilePhoto: "https://thispersondoesnotexist.com/image?seed=maria",
    languages: ["Português", "Espanhol"],
    interests: ["Praias", "Cultura", "Gastronomia"],
    travelStyles: ["praia", "culturais"]
  },
  {
    username: "carlos",
    email: "carlos@email.com",
    password: "demo123", 
    fullName: "Carlos Oliveira",
    phone: "(11) 97777-3333",
    bio: "Paulistano urbano que curte explorar grandes cidades. Sempre conectado e em busca de novos negócios!",
    location: "São Paulo, SP",
    profilePhoto: "https://thispersondoesnotexist.com/image?seed=carlos",
    languages: ["Português", "Inglês", "Francês"],
    interests: ["Negócios", "Tecnologia", "Arte"],
    travelStyles: ["urbana", "culturais"]
  },
  {
    username: "ana",
    email: "ana@email.com",
    password: "demo123",
    fullName: "Ana Costa",
    phone: "(31) 96666-4444", 
    bio: "Mineira apaixonada por ecoturismo e natureza. Defendo o turismo sustentável e responsável!",
    location: "Belo Horizonte, MG",
    profilePhoto: "https://thispersondoesnotexist.com/image?seed=ana",
    languages: ["Português", "Inglês"],
    interests: ["Ecoturismo", "Natureza", "Sustentabilidade"],
    travelStyles: ["natureza", "ecoturismo"]
  },
  {
    username: "ricardo",
    email: "ricardo@email.com", 
    password: "demo123",
    fullName: "Ricardo Silva",
    phone: "(71) 95555-5555",
    bio: "Baiano que ama festas e cultura nordestina. Especialista em encontrar os melhores locais para diversão!",
    location: "Salvador, BA",
    profilePhoto: "https://thispersondoesnotexist.com/image?seed=ricardo",
    languages: ["Português"],
    interests: ["Festas", "Música", "Dança"],
    travelStyles: ["culturais", "praia"]
  }
];

// Viagens realistas com status diversos
const realisticTrips = [
  // VIAGENS CONCLUÍDAS (30%)
  {
    creatorId: 1,
    title: "Aventura na Chapada Diamantina",
    description: "Trilhas incríveis, cachoeiras cristalinas e paisagens de tirar o fôlego na Chapada Diamantina.",
    destination: "Chapada Diamantina, BA",
    startDate: new Date("2024-08-15"),
    endDate: new Date("2024-08-22"),
    budget: 2800,
    maxParticipants: 6,
    currentParticipants: 4,
    travelStyle: "aventura",
    status: "completed",
    coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    budgetBreakdown: {
      transport: 600,
      accommodation: 800,
      food: 700,
      activities: 500,
      insurance: 100,
      other: 100
    }
  },
  {
    creatorId: 2,
    title: "Relax em Fernando de Noronha",
    description: "Paraíso tropical com praias paradisíacas e vida marinha exuberante.",
    destination: "Fernando de Noronha, PE",
    startDate: new Date("2024-09-10"),
    endDate: new Date("2024-09-17"),
    budget: 8500,
    maxParticipants: 4,
    currentParticipants: 3,
    travelStyle: "praia",
    status: "completed",
    coverImage: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&q=80",
    budgetBreakdown: {
      transport: 2000,
      accommodation: 3000,
      food: 1500,
      activities: 1500,
      insurance: 200,
      other: 300
    }
  },
  {
    creatorId: 3,
    title: "Cultura em Buenos Aires",
    description: "Explore a rica cultura argentina: tango, gastronomia e arquitetura europeia.",
    destination: "Buenos Aires, Argentina",
    startDate: new Date("2024-10-05"),
    endDate: new Date("2024-10-12"),
    budget: 4200,
    maxParticipants: 5,
    currentParticipants: 4,
    travelStyle: "culturais",
    status: "completed",
    coverImage: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80",
    budgetBreakdown: {
      transport: 1200,
      accommodation: 1000,
      food: 800,
      activities: 900,
      insurance: 150,
      other: 150
    }
  },
  // VIAGENS EM ANDAMENTO (30%)
  {
    creatorId: 4,
    title: "Ecoturismo em Bonito",
    description: "Águas cristalinas, grutas fantásticas e natureza preservada no MS.",
    destination: "Bonito, MS",
    startDate: new Date("2025-07-10"),
    endDate: new Date("2025-07-18"),
    budget: 3500,
    maxParticipants: 6,
    currentParticipants: 5,
    travelStyle: "natureza",
    status: "in_progress",
    coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    budgetBreakdown: {
      transport: 800,
      accommodation: 1000,
      food: 600,
      activities: 800,
      insurance: 150,
      other: 150
    }
  },
  {
    creatorId: 5,
    title: "Carnaval em Salvador",
    description: "Viva o melhor carnaval do Brasil com trio elétrico, axé e muita festa!",
    destination: "Salvador, BA",
    startDate: new Date("2025-07-12"),
    endDate: new Date("2025-07-18"),
    budget: 2200,
    maxParticipants: 8,
    currentParticipants: 6,
    travelStyle: "culturais",
    status: "in_progress",
    coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    budgetBreakdown: {
      transport: 500,
      accommodation: 700,
      food: 400,
      activities: 400,
      insurance: 100,
      other: 100
    }
  },
  {
    creatorId: 1,
    title: "Aventura no Pantanal",
    description: "Safari brasileiro: onças, jacarés, araras e toda biodiversidade pantaneira.",
    destination: "Pantanal, MT",
    startDate: new Date("2025-07-14"),
    endDate: new Date("2025-07-20"),
    budget: 4800,
    maxParticipants: 4,
    currentParticipants: 3,
    travelStyle: "natureza",
    status: "in_progress",
    coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    budgetBreakdown: {
      transport: 1000,
      accommodation: 1500,
      food: 800,
      activities: 1200,
      insurance: 200,
      other: 100
    }
  },
  // VIAGENS PLANEJADAS (40%)
  {
    creatorId: 2,
    title: "Machu Picchu Místico",
    description: "Trilha Inca clássica até a cidadela perdida dos Incas no Peru.",
    destination: "Machu Picchu, Peru",
    startDate: new Date("2025-08-20"),
    endDate: new Date("2025-08-28"),
    budget: 6500,
    maxParticipants: 6,
    currentParticipants: 4,
    travelStyle: "aventura",
    status: "planning",
    coverImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
    budgetBreakdown: {
      transport: 2000,
      accommodation: 1500,
      food: 1000,
      activities: 1500,
      insurance: 300,
      other: 200
    }
  },
  {
    creatorId: 3,
    title: "Roteiro Cultural Lisboa",
    description: "Descubra a história, gastronomia e charme da capital portuguesa.",
    destination: "Lisboa, Portugal",
    startDate: new Date("2025-09-15"),
    endDate: new Date("2025-09-22"),
    budget: 5800,
    maxParticipants: 4,
    currentParticipants: 3,
    travelStyle: "culturais",
    status: "planning",
    coverImage: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
    budgetBreakdown: {
      transport: 2200,
      accommodation: 1400,
      food: 1000,
      activities: 800,
      insurance: 250,
      other: 150
    }
  },
  {
    creatorId: 4,
    title: "Mistérios do Antigo Egito",
    description: "Pirâmides, templos e a rica história do berço da civilização.",
    destination: "Cairo, Egito",
    startDate: new Date("2025-10-10"),
    endDate: new Date("2025-10-18"),
    budget: 12000,
    maxParticipants: 6,
    currentParticipants: 2,
    travelStyle: "culturais",
    status: "planning",
    coverImage: "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&q=80",
    budgetBreakdown: {
      transport: 4000,
      accommodation: 3000,
      food: 2000,
      activities: 2500,
      insurance: 300,
      other: 200
    }
  },
  {
    creatorId: 5,
    title: "Roma Eterna",
    description: "Arte, história e gastronomia na cidade eterna. Coliseu, Vaticano e muito mais!",
    destination: "Roma, Itália",
    startDate: new Date("2025-11-05"),
    endDate: new Date("2025-11-12"),
    budget: 7200,
    maxParticipants: 5,
    currentParticipants: 3,
    travelStyle: "culturais",
    status: "planning",
    coverImage: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80",
    budgetBreakdown: {
      transport: 2500,
      accommodation: 2000,
      food: 1200,
      activities: 1000,
      insurance: 300,
      other: 200
    }
  }
];

// Participantes das viagens (IDs cruzados)
const tripParticipantsData = [
  // Viagem 1: Chapada Diamantina (Tom criador)
  { tripId: 1, userId: 1, status: "accepted" }, // Tom (criador)
  { tripId: 1, userId: 2, status: "accepted" }, // Maria
  { tripId: 1, userId: 3, status: "accepted" }, // Carlos
  { tripId: 1, userId: 4, status: "accepted" }, // Ana
  
  // Viagem 2: Fernando de Noronha (Maria criador)
  { tripId: 2, userId: 2, status: "accepted" }, // Maria (criador)
  { tripId: 2, userId: 1, status: "accepted" }, // Tom
  { tripId: 2, userId: 5, status: "accepted" }, // Ricardo
  
  // Viagem 3: Buenos Aires (Carlos criador)
  { tripId: 3, userId: 3, status: "accepted" }, // Carlos (criador)
  { tripId: 3, userId: 1, status: "accepted" }, // Tom
  { tripId: 3, userId: 2, status: "accepted" }, // Maria
  { tripId: 3, userId: 4, status: "accepted" }, // Ana
  
  // Viagem 4: Bonito (Ana criador)
  { tripId: 4, userId: 4, status: "accepted" }, // Ana (criador)
  { tripId: 4, userId: 1, status: "accepted" }, // Tom
  { tripId: 4, userId: 2, status: "accepted" }, // Maria
  { tripId: 4, userId: 3, status: "accepted" }, // Carlos
  { tripId: 4, userId: 5, status: "accepted" }, // Ricardo
  
  // Viagem 5: Salvador (Ricardo criador)
  { tripId: 5, userId: 5, status: "accepted" }, // Ricardo (criador)
  { tripId: 5, userId: 1, status: "accepted" }, // Tom
  { tripId: 5, userId: 2, status: "accepted" }, // Maria
  { tripId: 5, userId: 3, status: "accepted" }, // Carlos
  { tripId: 5, userId: 4, status: "accepted" }, // Ana
  { tripId: 5, userId: 3, status: "pending" }, // Carlos pendente
  
  // Viagem 6: Pantanal (Tom criador)
  { tripId: 6, userId: 1, status: "accepted" }, // Tom (criador)
  { tripId: 6, userId: 4, status: "accepted" }, // Ana
  { tripId: 6, userId: 5, status: "accepted" }, // Ricardo
  
  // Viagem 7: Machu Picchu (Maria criador)
  { tripId: 7, userId: 2, status: "accepted" }, // Maria (criador)
  { tripId: 7, userId: 1, status: "accepted" }, // Tom
  { tripId: 7, userId: 3, status: "accepted" }, // Carlos
  { tripId: 7, userId: 4, status: "accepted" }, // Ana
  
  // Viagem 8: Lisboa (Carlos criador)
  { tripId: 8, userId: 3, status: "accepted" }, // Carlos (criador)
  { tripId: 8, userId: 2, status: "accepted" }, // Maria
  { tripId: 8, userId: 5, status: "accepted" }, // Ricardo
  
  // Viagem 9: Egito (Ana criador)
  { tripId: 9, userId: 4, status: "accepted" }, // Ana (criador)
  { tripId: 9, userId: 1, status: "accepted" }, // Tom
  
  // Viagem 10: Roma (Ricardo criador)
  { tripId: 10, userId: 5, status: "accepted" }, // Ricardo (criador)
  { tripId: 10, userId: 2, status: "accepted" }, // Maria
  { tripId: 10, userId: 3, status: "accepted" }, // Carlos
];

// Atividades turísticas por destino (25 atividades)
const touristActivities = [
  // RIO DE JANEIRO (5 atividades)
  {
    title: "Trilha no Pão de Açúcar",
    description: "Trilha guiada até o topo do Pão de Açúcar com vista panorâmica da cidade maravilhosa.",
    category: "adventure",
    location: "Rio de Janeiro, RJ",
    price: 85,
    duration: 4,
    difficulty: "medium",
    minParticipants: 2,
    maxParticipants: 12,
    coverImage: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80"],
    inclusions: ["Guia especializado", "Equipamentos de segurança", "Água", "Seguro"],
    exclusions: ["Transporte até o local", "Alimentação"],
    requirements: ["Condicionamento físico básico", "Calçado adequado", "Idade mínima 12 anos"],
    createdById: 2
  },
  {
    title: "City Tour Rio Histórico",
    description: "Conheça os principais pontos turísticos e históricos do Rio de Janeiro em um tour completo.",
    category: "sightseeing",
    location: "Rio de Janeiro, RJ",
    price: 120,
    duration: 8,
    difficulty: "easy",
    minParticipants: 4,
    maxParticipants: 20,
    coverImage: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80"],
    inclusions: ["Transporte", "Guia turístico", "Entrada nos pontos turísticos", "Almoço"],
    exclusions: ["Bebidas extras", "Compras pessoais"],
    requirements: ["Documento de identificação"],
    createdById: 2
  },
  {
    title: "Aula de Surf em Ipanema",
    description: "Aprenda a surfar nas ondas de Ipanema com instrutores experientes.",
    category: "sports",
    location: "Rio de Janeiro, RJ",
    price: 100,
    duration: 3,
    difficulty: "beginner",
    minParticipants: 1,
    maxParticipants: 8,
    coverImage: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80"],
    inclusions: ["Prancha", "Roupa de neoprene", "Instrutor", "Seguro"],
    exclusions: ["Transporte", "Alimentação"],
    requirements: ["Saber nadar", "Condicionamento físico básico"],
    createdById: 2
  },
  {
    title: "Tour Gastronômico Santa Teresa",
    description: "Deguste os sabores autênticos do Rio no charmoso bairro de Santa Teresa.",
    category: "food",
    location: "Rio de Janeiro, RJ",
    price: 95,
    duration: 4,
    difficulty: "easy",
    minParticipants: 4,
    maxParticipants: 15,
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"],
    inclusions: ["Degustações", "Guia gastronômico", "Bebidas", "Sobremesas"],
    exclusions: ["Transporte", "Refeições completas"],
    requirements: ["Informar restrições alimentares"],
    createdById: 2
  },
  {
    title: "Passeio de Barco Baía de Guanabara",
    description: "Navegue pela belíssima Baía de Guanabara com vista para os cartões-postais do Rio.",
    category: "leisure",
    location: "Rio de Janeiro, RJ",
    price: 80,
    duration: 3,
    difficulty: "easy",
    minParticipants: 6,
    maxParticipants: 25,
    coverImage: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80"],
    inclusions: ["Embarcação", "Guia", "Bebidas", "Seguro"],
    exclusions: ["Transporte ao porto", "Alimentação"],
    requirements: ["Documento de identificação"],
    createdById: 2
  },
  
  // SÃO PAULO (5 atividades)
  {
    title: "Tour Cultural Vila Madalena",
    description: "Explore o coração criativo de São Paulo: grafites, galerias e vida noturna.",
    category: "culture",
    location: "São Paulo, SP",
    price: 75,
    duration: 4,
    difficulty: "easy",
    minParticipants: 4,
    maxParticipants: 15,
    coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=800&q=80"],
    inclusions: ["Guia local", "Entrada em galerias", "Drink de boas-vindas"],
    exclusions: ["Transporte", "Alimentação", "Compras"],
    requirements: ["Idade mínima 18 anos para bebidas"],
    createdById: 3
  },
  {
    title: "Experiência Gastronômica Mercadão",
    description: "Sabores tradicionais paulistanos no icônico Mercado Municipal.",
    category: "food",
    location: "São Paulo, SP",
    price: 90,
    duration: 3,
    difficulty: "easy",
    minParticipants: 3,
    maxParticipants: 12,
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"],
    inclusions: ["Degustações", "Guia gastronômico", "Sanduíche de mortadela"],
    exclusions: ["Transporte", "Bebidas alcoólicas"],
    requirements: ["Informar restrições alimentares"],
    createdById: 3
  },
  {
    title: "Bike Tour Parque Ibirapuera",
    description: "Pedale pelos principais pontos do maior parque urbano de São Paulo.",
    category: "sports",
    location: "São Paulo, SP",
    price: 65,
    duration: 3,
    difficulty: "easy",
    minParticipants: 3,
    maxParticipants: 10,
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"],
    inclusions: ["Bicicleta", "Capacete", "Guia", "Água"],
    exclusions: ["Transporte ao parque", "Alimentação"],
    requirements: ["Saber andar de bicicleta", "Roupas adequadas"],
    createdById: 3
  },
  {
    title: "Teatro Municipal e Centro Histórico",
    description: "Mergulhe na história e arquitetura do centro de São Paulo.",
    category: "culture",
    location: "São Paulo, SP",
    price: 55,
    duration: 4,
    difficulty: "easy",
    minParticipants: 5,
    maxParticipants: 20,
    coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=800&q=80"],
    inclusions: ["Guia especializado", "Entrada no Teatro Municipal", "Mapa da cidade"],
    exclusions: ["Transporte", "Alimentação"],
    requirements: ["Documento de identificação"],
    createdById: 3
  },
  {
    title: "Rooftop e Skyline Paulistano",
    description: "Vistas panorâmicas da metrópole paulistana em rooftops exclusivos.",
    category: "leisure",
    location: "São Paulo, SP",
    price: 110,
    duration: 3,
    difficulty: "easy",
    minParticipants: 4,
    maxParticipants: 12,
    coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=800&q=80"],
    inclusions: ["Acesso a rooftops", "Welcome drink", "Guia", "Seguro"],
    exclusions: ["Transporte", "Bebidas extras", "Alimentação"],
    requirements: ["Idade mínima 18 anos", "Traje adequado"],
    createdById: 3
  },
  
  // FLORIANÓPOLIS (5 atividades)
  {
    title: "Trilha Lagoinha do Leste",
    description: "Uma das trilhas mais bonitas de Floripa com praia selvagem no final.",
    category: "adventure",
    location: "Florianópolis, SC",
    price: 70,
    duration: 6,
    difficulty: "medium",
    minParticipants: 3,
    maxParticipants: 12,
    coverImage: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80"],
    inclusions: ["Guia especializado", "Lanche", "Água", "Seguro"],
    exclusions: ["Transporte até o local", "Equipamentos pessoais"],
    requirements: ["Condicionamento físico", "Calçado de trilha", "Protetor solar"],
    createdById: 1
  },
  {
    title: "Aula de Surfe Praia Mole",
    description: "Aprenda a surfar em uma das melhores praias de Florianópolis.",
    category: "sports",
    location: "Florianópolis, SC",
    price: 85,
    duration: 3,
    difficulty: "beginner",
    minParticipants: 1,
    maxParticipants: 6,
    coverImage: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80"],
    inclusions: ["Prancha", "Roupa de neoprene", "Instrutor", "Seguro"],
    exclusions: ["Transporte", "Alimentação"],
    requirements: ["Saber nadar", "Condicionamento físico básico"],
    createdById: 1
  },
  {
    title: "Passeio de Barco Ilha do Campeche",
    description: "Conheça a ilha com mar azul turquesa e sítios arqueológicos.",
    category: "leisure",
    location: "Florianópolis, SC",
    price: 95,
    duration: 8,
    difficulty: "easy",
    minParticipants: 6,
    maxParticipants: 20,
    coverImage: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80"],
    inclusions: ["Transporte marítimo", "Guia", "Almoço", "Snorkeling"],
    exclusions: ["Transporte terrestre", "Bebidas extras"],
    requirements: ["Documento de identificação", "Protetor solar"],
    createdById: 1
  },
  {
    title: "Tour Gastronômico Mercado Público",
    description: "Sabores da culinária açoriana no coração histórico de Floripa.",
    category: "food",
    location: "Florianópolis, SC",
    price: 80,
    duration: 3,
    difficulty: "easy",
    minParticipants: 4,
    maxParticipants: 15,
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"],
    inclusions: ["Degustações", "Guia gastronômico", "Cachaça artesanal", "Sobremesas"],
    exclusions: ["Transporte", "Refeições completas"],
    requirements: ["Informar restrições alimentares"],
    createdById: 1
  },
  {
    title: "Paragliding Praia da Joaquina",
    description: "Voe sobre as dunas e praias mais famosas de Florianópolis.",
    category: "adventure",
    location: "Florianópolis, SC",
    price: 180,
    duration: 2,
    difficulty: "medium",
    minParticipants: 1,
    maxParticipants: 4,
    coverImage: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80"],
    inclusions: ["Equipamentos", "Instrutor", "Seguro", "Vídeo do voo"],
    exclusions: ["Transporte", "Alimentação"],
    requirements: ["Peso entre 45-100kg", "Condições climáticas favoráveis"],
    createdById: 1
  },
  
  // CHAPADA DIAMANTINA (5 atividades)
  {
    title: "Trilha Cachoeira da Fumaça",
    description: "Trilha até a cachoeira mais alta do Brasil com 340 metros de queda.",
    category: "adventure",
    location: "Chapada Diamantina, BA",
    price: 120,
    duration: 8,
    difficulty: "hard",
    minParticipants: 3,
    maxParticipants: 10,
    coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80"],
    inclusions: ["Guia especializado", "Lanche", "Água", "Seguro"],
    exclusions: ["Transporte", "Equipamentos pessoais"],
    requirements: ["Excelente condicionamento físico", "Experiência em trilhas"],
    createdById: 1
  },
  {
    title: "Poço Azul e Poço Encantado",
    description: "Mergulhe nas águas cristalinas dos poços mais famosos da Chapada.",
    category: "leisure",
    location: "Chapada Diamantina, BA",
    price: 100,
    duration: 6,
    difficulty: "easy",
    minParticipants: 4,
    maxParticipants: 15,
    coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80"],
    inclusions: ["Transporte", "Guia", "Entrada nos poços", "Snorkeling"],
    exclusions: ["Alimentação", "Bebidas"],
    requirements: ["Saber nadar", "Máscara e snorkel próprios"],
    createdById: 1
  },
  {
    title: "Gruta da Lapa Doce",
    description: "Explore uma das maiores cavernas da América do Sul.",
    category: "adventure",
    location: "Chapada Diamantina, BA",
    price: 85,
    duration: 4,
    difficulty: "medium",
    minParticipants: 2,
    maxParticipants: 12,
    coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80"],
    inclusions: ["Guia espeleológico", "Equipamentos", "Lanternas", "Seguro"],
    exclusions: ["Transporte", "Alimentação"],
    requirements: ["Não ter claustrofobia", "Roupas adequadas"],
    createdById: 1
  },
  {
    title: "Vale do Pati Trekking",
    description: "Trekking de 3 dias pelo vale mais bonito do Brasil.",
    category: "adventure",
    location: "Chapada Diamantina, BA",
    price: 450,
    duration: 72,
    difficulty: "hard",
    minParticipants: 4,
    maxParticipants: 8,
    coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80"],
    inclusions: ["Guia", "Hospedagem", "Alimentação", "Transporte interno"],
    exclusions: ["Transporte até Lençóis", "Equipamentos pessoais"],
    requirements: ["Excelente condicionamento", "Experiência em trekking"],
    createdById: 1
  },
  {
    title: "Morro do Pai Inácio Sunset",
    description: "Assista ao pôr do sol mais famoso da Chapada Diamantina.",
    category: "leisure",
    location: "Chapada Diamantina, BA",
    price: 45,
    duration: 3,
    difficulty: "easy",
    minParticipants: 2,
    maxParticipants: 20,
    coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80"],
    inclusions: ["Guia", "Transporte", "Lanche", "Água"],
    exclusions: ["Bebidas alcoólicas", "Jantar"],
    requirements: ["Condicionamento físico básico"],
    createdById: 1
  }
];

// Mensagens de chat realistas
const chatMessages = [
  // Viagem 1: Chapada Diamantina
  { tripId: 1, senderId: 1, message: "Pessoal, que tal acordarmos às 6h amanhã para pegar o nascer do sol no Pai Inácio?" },
  { tripId: 1, senderId: 2, message: "Perfeito Tom! Vou preparar um café reforçado para todos 😊" },
  { tripId: 1, senderId: 3, message: "Ótima ideia! Já deixei a câmera carregando para as fotos" },
  { tripId: 1, senderId: 4, message: "Que experiência incrível! A Cachoeira da Fumaça superou minhas expectativas" },
  
  // Viagem 2: Fernando de Noronha
  { tripId: 2, senderId: 2, message: "Gente, o mergulho de hoje foi surreal! Vimos tubarões e tartarugas" },
  { tripId: 2, senderId: 1, message: "Demais Maria! E aquela praia do Sancho? Parece que estamos no paraíso" },
  { tripId: 2, senderId: 5, message: "Melhor viagem da minha vida! Já estou com saudades e nem acabou ainda" },
  
  // Viagem 3: Buenos Aires
  { tripId: 3, senderId: 3, message: "Hoje é noite de tango! Quem topa uma aula antes do jantar?" },
  { tripId: 3, senderId: 1, message: "Eu topo! Sempre quis aprender a dançar tango argentino" },
  { tripId: 3, senderId: 2, message: "Vai ser épico! E depois podemos ir naquele restaurante de carnes" },
  { tripId: 3, senderId: 4, message: "Perfeito! Vou usar aquele vestido que trouxe especialmente para isso" },
  
  // Viagem 4: Bonito (em andamento)
  { tripId: 4, senderId: 4, message: "Acabamos de chegar no hotel! A recepção está servindo um suco de pequi delicioso" },
  { tripId: 4, senderId: 1, message: "Que legal Ana! Mal posso esperar para mergulhar no Rio da Prata amanhã" },
  { tripId: 4, senderId: 2, message: "Estou ansiosa para a flutuação! Dizem que a visibilidade é incrível" },
  { tripId: 4, senderId: 3, message: "E eu para conhecer a Gruta Azul! Deve ser uma experiência única" },
  { tripId: 4, senderId: 5, message: "Bonito realmente faz jus ao nome! Que lugar espetacular" },
  
  // Viagem 5: Salvador (em andamento)
  { tripId: 5, senderId: 5, message: "Axé galera! Hoje é dia de trio elétrico! Encontro às 14h no Pelourinho" },
  { tripId: 5, senderId: 1, message: "Vai ser demais! Já estou no clima baiano 🎵" },
  { tripId: 5, senderId: 2, message: "Que energia contagiante! Salvador é pura magia" },
  { tripId: 5, senderId: 3, message: "Primeira vez no carnaval baiano e já estou apaixonado!" },
  { tripId: 5, senderId: 4, message: "A culinária aqui é sensacional! Provei um acarajé incrível ontem" },
  
  // Viagem 6: Pantanal (em andamento)
  { tripId: 6, senderId: 1, message: "Pessoal, acabamos de avistar uma onça! Que momento incrível!" },
  { tripId: 6, senderId: 4, message: "Que emoção Tom! A natureza aqui é exuberante" },
  { tripId: 6, senderId: 5, message: "Safari brasileiro é único! Já vimos jacarés, araras e capivaras" },
  
  // Viagem 7: Machu Picchu (planejada)
  { tripId: 7, senderId: 2, message: "Gente, consegui confirmar o guia local para a trilha Inca!" },
  { tripId: 7, senderId: 1, message: "Excelente Maria! Estou me preparando fisicamente há meses" },
  { tripId: 7, senderId: 3, message: "Que ansiedade! Sempre sonhei em conhecer Machu Picchu" },
  { tripId: 7, senderId: 4, message: "Vou levar minha câmera profissional para registrar tudo" },
  
  // Viagem 8: Lisboa (planejada)
  { tripId: 8, senderId: 3, message: "Galera, já reservei o passeio de elétrico pelo centro histórico" },
  { tripId: 8, senderId: 2, message: "Que legal Carlos! E aquele jantar de fado que você mencionou?" },
  { tripId: 8, senderId: 5, message: "Estou muito curioso para provar os pastéis de nata originais!" },
  
  // Viagem 9: Egito (planejada)
  { tripId: 9, senderId: 4, message: "Tom, você viu que precisa de visto? Já providenciou?" },
  { tripId: 9, senderId: 1, message: "Sim Ana! Já está tudo encaminhado. Mal posso esperar para ver as pirâmides" },
  
  // Viagem 10: Roma (planejada)
  { tripId: 10, senderId: 5, message: "Pessoal, consegui ingressos para o Coliseu! Evitamos a fila" },
  { tripId: 10, senderId: 2, message: "Perfeito Ricardo! E para o Vaticano?" },
  { tripId: 10, senderId: 3, message: "Já providenciei! Vamos ter uma experiência completa em Roma" }
];

// Despesas compartilhadas realistas
const sharedExpenses = [
  // Viagem 1: Chapada Diamantina (concluída)
  { tripId: 1, paidBy: 1, description: "Hospedagem 3 noites Lençóis", amount: 480, category: "accommodation" },
  { tripId: 1, paidBy: 2, description: "Combustível van alugada", amount: 320, category: "transport" },
  { tripId: 1, paidBy: 3, description: "Guia trilha Cachoeira da Fumaça", amount: 200, category: "activities" },
  { tripId: 1, paidBy: 4, description: "Almoço restaurante Pai Inácio", amount: 160, category: "food" },
  
  // Viagem 2: Fernando de Noronha (concluída)
  { tripId: 2, paidBy: 2, description: "Pousada 4 noites", amount: 1200, category: "accommodation" },
  { tripId: 2, paidBy: 1, description: "Passeio barco Baía do Sancho", amount: 450, category: "activities" },
  { tripId: 2, paidBy: 5, description: "Jantar restaurante Mergulhão", amount: 280, category: "food" },
  
  // Viagem 3: Buenos Aires (concluída)
  { tripId: 3, paidBy: 3, description: "Hotel 5 noites Palermo", amount: 800, category: "accommodation" },
  { tripId: 3, paidBy: 1, description: "Uber e táxis", amount: 180, category: "transport" },
  { tripId: 3, paidBy: 2, description: "Show de tango El Querandí", amount: 320, category: "activities" },
  { tripId: 3, paidBy: 4, description: "Jantar Puerto Madero", amount: 240, category: "food" },
  
  // Viagem 4: Bonito (em andamento)
  { tripId: 4, paidBy: 4, description: "Hotel fazenda 4 noites", amount: 600, category: "accommodation" },
  { tripId: 4, paidBy: 1, description: "Aluguel van para grupo", amount: 400, category: "transport" },
  { tripId: 4, paidBy: 2, description: "Flutuação Rio da Prata", amount: 375, category: "activities" },
  
  // Viagem 5: Salvador (em andamento)
  { tripId: 5, paidBy: 5, description: "Pousada Pelourinho 3 noites", amount: 450, category: "accommodation" },
  { tripId: 5, paidBy: 1, description: "Abadás trio elétrico", amount: 300, category: "activities" },
  { tripId: 5, paidBy: 2, description: "Jantar acarajé e moqueca", amount: 200, category: "food" },
  
  // Viagem 6: Pantanal (em andamento)
  { tripId: 6, paidBy: 1, description: "Pousada fazenda 4 noites", amount: 720, category: "accommodation" },
  { tripId: 6, paidBy: 4, description: "Safari fotográfico", amount: 450, category: "activities" },
  { tripId: 6, paidBy: 5, description: "Combustível e pedágios", amount: 280, category: "transport" }
];

// Função principal para criar dados realistas
export async function createRealisticSeedData() {
  console.log("🌱 Criando dados realistas abrangentes...");
  
  try {
    // Reset database first
    const { resetDatabase } = await import("./reset-database");
    await resetDatabase();
    console.log("✅ Database resetado com sucesso!");
    
    // 1. Criar usuários (verificar se já existem)
    console.log("👥 Criando usuários realistas...");
    const createdUsers = [];
    for (let i = 0; i < realisticUsers.length; i++) {
      const userData = realisticUsers[i];
      
      // Verificar se usuário já existe
      const existingUser = await db.query.users.findFirst({
        where: (user, { eq }) => eq(user.username, userData.username)
      });
      
      if (existingUser) {
        console.log(`ℹ️ Usuário já existe: ${userData.username} (ID: ${existingUser.id})`);
        createdUsers.push(existingUser);
        continue;
      }
      
      const hashedPassword = await hashPassword(userData.password);
      const referralCode = generateReferralCode(userData.username, i + 1);
      
      const result = await db.insert(users).values({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
        phone: userData.phone,
        bio: userData.bio,
        location: userData.location,
        profilePhoto: userData.profilePhoto,
        languages: userData.languages,
        interests: userData.interests,
        travelStyles: userData.travelStyles,
        referralCode: referralCode,
        isVerified: i < 3 // Primeiros 3 usuários verificados
      });
      
      const userId = Number(result.insertId);
      const userWithId = { id: userId, ...userData };
      createdUsers.push(userWithId);
      console.log(`✅ Usuário criado: ${userData.username} (ID: ${userId})`);
    }
    
    // 2. Criar viagens
    console.log("🚗 Criando viagens realistas...");
    const createdTrips = [];
    for (let i = 0; i < realisticTrips.length; i++) {
      const tripData = realisticTrips[i];
      const result = await db.insert(trips).values({
        creatorId: tripData.creatorId,
        title: tripData.title,
        description: tripData.description,
        destination: tripData.destination,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        budget: tripData.budget,
        maxParticipants: tripData.maxParticipants,
        currentParticipants: tripData.currentParticipants,
        travelStyle: tripData.travelStyle,
        status: tripData.status,
        coverImage: tripData.coverImage,
        budgetBreakdown: tripData.budgetBreakdown
      });
      
      const tripId = Number(result.insertId);
      const trip = { id: tripId, ...tripData };
      createdTrips.push(trip);
      console.log(`✅ Viagem criada: ${trip.title} (ID: ${tripId})`);
    }
    
    // 3. Adicionar participantes
    console.log("👥 Adicionando participantes...");
    for (const participant of tripParticipantsData) {
      try {
        await db.insert(tripParticipants).values({
          tripId: participant.tripId,
          userId: participant.userId,
          status: participant.status,
          joinedAt: new Date()
        });
        console.log(`✅ Participante ${participant.userId} adicionado à viagem ${participant.tripId}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️ Participante ${participant.userId} já existe na viagem ${participant.tripId}`);
        } else {
          throw error;
        }
      }
    }
    
    // 4. Criar mensagens
    console.log("💬 Criando mensagens realistas...");
    for (const msgData of chatMessages) {
      await db.insert(messages).values({
        tripId: msgData.tripId,
        senderId: msgData.senderId,
        message: msgData.message,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
      });
    }
    console.log("✅ Mensagens criadas com sucesso!");
    
    // 5. Criar atividades turísticas
    console.log("🎯 Criando atividades turísticas...");
    const createdActivities = [];
    for (let i = 0; i < touristActivities.length; i++) {
      const activityData = touristActivities[i];
      const result = await db.insert(activities).values({
        title: activityData.title,
        description: activityData.description,
        category: activityData.category,
        location: activityData.location,
        price: activityData.price,
        duration: activityData.duration,
        difficulty: activityData.difficulty,
        minParticipants: activityData.minParticipants,
        maxParticipants: activityData.maxParticipants,
        coverImage: activityData.coverImage,
        images: activityData.images,
        inclusions: activityData.inclusions,
        exclusions: activityData.exclusions,
        requirements: activityData.requirements,
        createdById: activityData.createdById,
        isActive: true,
        averageRating: 4.0 + Math.random() * 1.0, // Rating entre 4.0 e 5.0
        totalReviews: Math.floor(Math.random() * 50) + 5 // Entre 5 e 55 reviews
      });
      
      const activityId = Number(result.insertId);
      const activity = { id: activityId, ...activityData };
      createdActivities.push(activity);
      console.log(`✅ Atividade criada: ${activity.title} (ID: ${activityId})`);
    }
    
    // 6. Criar avaliações de atividades
    console.log("⭐ Criando avaliações de atividades...");
    for (let i = 0; i < createdActivities.length; i++) {
      const activity = createdActivities[i];
      const numReviews = Math.floor(Math.random() * 3) + 1; // 1-3 reviews por atividade
      
      for (let j = 0; j < numReviews; j++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        await db.insert(activityReviews).values({
          activityId: activity.id,
          userId: randomUser.id,
          rating: Math.floor(Math.random() * 2) + 4, // Rating 4 ou 5
          review: `Experiência incrível! ${activity.title} superou minhas expectativas.`,
          visitDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          helpfulVotes: Math.floor(Math.random() * 10),
          isVerified: Math.random() > 0.3
        });
      }
    }
    console.log("✅ Avaliações criadas com sucesso!");
    
    // 7. Criar reservas de atividades
    console.log("📅 Criando reservas de atividades...");
    for (let i = 0; i < 20; i++) { // 20 reservas aleatórias
      const randomActivity = createdActivities[Math.floor(Math.random() * createdActivities.length)];
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      await db.insert(activityBookings).values({
        activityId: randomActivity.id,
        userId: randomUser.id,
        bookingDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000), // Próximos 60 dias
        participants: Math.floor(Math.random() * 3) + 1,
        totalAmount: randomActivity.price * (Math.floor(Math.random() * 3) + 1),
        status: Math.random() > 0.2 ? "confirmed" : "pending",
        paymentStatus: Math.random() > 0.1 ? "paid" : "pending",
        specialRequests: Math.random() > 0.7 ? "Vegetariano" : null
      });
    }
    console.log("✅ Reservas criadas com sucesso!");
    
    // 8. Criar despesas compartilhadas
    console.log("💳 Criando despesas compartilhadas...");
    for (const expenseData of sharedExpenses) {
      const result = await db.insert(expenses).values({
        tripId: expenseData.tripId,
        paidBy: expenseData.paidBy,
        description: expenseData.description,
        amount: expenseData.amount,
        category: expenseData.category,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        receipt: null,
        settledAt: null
      });
      
      const expenseId = Number(result.insertId);
      const expense = { id: expenseId, ...expenseData };
      
      // Criar divisões de despesa
      const tripParticipants = tripParticipantsData.filter(p => p.tripId === expenseData.tripId);
      const splitAmount = expenseData.amount / tripParticipants.length;
      
      for (const participant of tripParticipants) {
        await db.insert(expenseSplits).values({
          expenseId: expenseId,
          userId: participant.userId,
          amount: splitAmount,
          paid: participant.userId === expenseData.paidBy, // Quem pagou já tem como "paid"
          settledAt: participant.userId === expenseData.paidBy ? new Date() : null
        });
      }
    }
    console.log("✅ Despesas compartilhadas criadas com sucesso!");
    
    console.log("🎉 Dados realistas abrangentes criados com sucesso!");
    console.log(`📊 Resumo:`);
    console.log(`   • ${createdUsers.length} usuários completos`);
    console.log(`   • ${createdTrips.length} viagens detalhadas`);
    console.log(`   • ${createdActivities.length} atividades turísticas`);
    console.log(`   • ${chatMessages.length} mensagens de chat`);
    console.log(`   • ${sharedExpenses.length} despesas compartilhadas`);
    console.log(`   • Avaliações e reservas de atividades`);
    
  } catch (error) {
    console.error("❌ Erro ao criar dados realistas:", error);
    throw error;
  }
}