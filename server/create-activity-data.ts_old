import { db } from "./db";
import { activities, activityBudgetProposals } from "@shared/schema";

// Create missing activities table if it doesn't exist
async function createActivitiesTable() {
  try {
    console.log("🏗️ Creating activities table...");
    
    // Create activity_budget_proposals table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS activity_budget_proposals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        created_by INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price_type VARCHAR(50) NOT NULL DEFAULT 'per_person',
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'BRL' NOT NULL,
        inclusions JSON,
        exclusions JSON,
        valid_until TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        votes INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (activity_id) REFERENCES activities(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    
    console.log("✅ Activities tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating activities table:", error);
  }
}

// Comprehensive activity data for major Brazilian destinations
export const activityData = [
  // Rio de Janeiro Activities
  {
    title: "Cristo Redentor (Corcovado)",
    description: "Visite uma das Sete Maravilhas do Mundo Moderno! Suba de trem pelo Parque Nacional da Tijuca até o topo do Corcovado para ver o Cristo Redentor e ter uma vista panorâmica incrível da cidade.",
    location: "Rio de Janeiro, RJ",
    category: "sightseeing",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 89.00,
    duration: "4 horas",
    difficultyLevel: "easy",
    minParticipants: 1,
    maxParticipants: 50,
    languages: ["português", "inglês", "espanhol"],
    inclusions: ["Ingresso do trem", "Guia turístico", "Transporte até a estação"],
    exclusions: ["Alimentação", "Seguro viagem"],
    requirements: ["Não recomendado para pessoas com problemas cardíacos", "Crianças devem estar acompanhadas"],
    cancellationPolicy: "Cancelamento gratuito até 24 horas antes",
    contactInfo: {
      email: "contato@cristoredentor.com.br",
      phone: "(21) 2558-1329",
      website: "https://www.tremdocorcovado.rio",
      whatsapp: "+5521987654321"
    },
    images: [
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
      "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
    createdById: 1
  },
  {
    title: "Passeio de Bondinho no Pão de Açúcar",
    description: "Experiência única no bondinho mais famoso do Brasil! Dois estágios de teleférico levam você até o topo do Pão de Açúcar para uma vista de 360° da Baía de Guanabara.",
    location: "Rio de Janeiro, RJ",
    category: "sightseeing",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 120.00,
    duration: "3 horas",
    difficultyLevel: "easy",
    minParticipants: 1,
    maxParticipants: 40,
    languages: ["português", "inglês", "espanhol", "francês"],
    inclusions: ["Ingresso do bondinho", "Guia especializado", "Seguro do passeio"],
    exclusions: ["Alimentação", "Transporte até o local"],
    requirements: ["Não recomendado para pessoas com medo de altura", "Horário de funcionamento: 8h às 20h"],
    cancellationPolicy: "Cancelamento gratuito até 2 horas antes",
    contactInfo: {
      email: "info@bondinhopoeacucar.com.br",
      phone: "(21) 2546-8400",
      website: "https://www.bondinhopoeacucar.com.br",
      whatsapp: "+5521912345678"
    },
    images: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
      "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    createdById: 1
  },
  {
    title: "Tour pelas Praias de Copacabana e Ipanema",
    description: "Conheça as praias mais famosas do mundo! Caminhada guiada pelas areias de Copacabana e Ipanema, com paradas para água de coco e explicações sobre a cultura carioca.",
    location: "Rio de Janeiro, RJ",
    category: "beach",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 45.00,
    duration: "3 horas",
    difficultyLevel: "easy",
    minParticipants: 2,
    maxParticipants: 20,
    languages: ["português", "inglês"],
    inclusions: ["Guia local", "Água de coco", "Protetor solar"],
    exclusions: ["Alimentação", "Cadeiras de praia", "Transporte"],
    requirements: ["Usar roupas confortáveis", "Levar toalha e maiô"],
    cancellationPolicy: "Cancelamento gratuito até 1 hora antes",
    contactInfo: {
      email: "praias@rioturismo.com.br",
      phone: "(21) 3544-8888",
      whatsapp: "+5521999887766"
    },
    images: [
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
      "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
    createdById: 1
  },
  {
    title: "Visita ao Jardim Botânico do Rio",
    description: "Explore o paraíso verde do Rio de Janeiro! Mais de 350 hectares com 7.000 espécies de plantas nativas e exóticas, incluindo orquídeas, bromélias e árvores centenárias.",
    location: "Rio de Janeiro, RJ",
    category: "nature",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 25.00,
    duration: "2 horas",
    difficultyLevel: "easy",
    minParticipants: 1,
    maxParticipants: 30,
    languages: ["português", "inglês"],
    inclusions: ["Entrada do jardim", "Guia botânico", "Mapa ilustrado"],
    exclusions: ["Alimentação", "Transporte"],
    requirements: ["Usar sapatos confortáveis", "Levar repelente"],
    cancellationPolicy: "Cancelamento gratuito até 30 minutos antes",
    contactInfo: {
      email: "visitas@jbrj.gov.br",
      phone: "(21) 3204-2000",
      website: "https://www.jbrj.gov.br"
    },
    images: [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    createdById: 1
  },
  {
    title: "Escadaria Selarón e Santa Teresa",
    description: "Descubra a arte de rua mais famosa do Rio! Caminhada pelos 250 degraus coloridos da Escadaria Selarón e pelo charmoso bairro de Santa Teresa.",
    location: "Rio de Janeiro, RJ",
    category: "culture",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 35.00,
    duration: "2.5 horas",
    difficultyLevel: "moderate",
    minParticipants: 3,
    maxParticipants: 15,
    languages: ["português", "inglês"],
    inclusions: ["Guia cultural", "Visita a ateliês locais"],
    exclusions: ["Alimentação", "Transporte", "Compras"],
    requirements: ["Condicionamento físico básico", "Sapatos antiderrapantes"],
    cancellationPolicy: "Cancelamento gratuito até 2 horas antes",
    contactInfo: {
      email: "cultura@santateresa.com.br",
      phone: "(21) 3970-1234",
      whatsapp: "+5521987123456"
    },
    images: [
      "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80",
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80",
    createdById: 1
  },

  // São Paulo Activities
  {
    title: "Tour pelo Parque Ibirapuera",
    description: "Explore o 'Central Park' de São Paulo! Conheça os museus, lagos e áreas verdes deste icônico parque urbano, incluindo o Museu de Arte Moderna e o Planetário.",
    location: "São Paulo, SP",
    category: "culture",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 40.00,
    duration: "3 horas",
    difficultyLevel: "easy",
    minParticipants: 2,
    maxParticipants: 25,
    languages: ["português", "inglês"],
    inclusions: ["Guia especializado", "Entrada nos museus", "Mapa do parque"],
    exclusions: ["Alimentação", "Transporte"],
    requirements: ["Usar roupas confortáveis", "Levar água"],
    cancellationPolicy: "Cancelamento gratuito até 1 hora antes",
    contactInfo: {
      email: "tours@ibirapuera.org.br",
      phone: "(11) 5574-5177",
      website: "https://www.parqueibirapuera.org"
    },
    images: [
      "https://images.unsplash.com/photo-1541370732-3d2c4c3eb567?w=800&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1541370732-3d2c4c3eb567?w=800&q=80",
    createdById: 1
  },
  {
    title: "Experiência Gastronômica no Mercadão",
    description: "Aventura culinária no famoso Mercado Municipal! Deguste o sanduíche de mortadela, pastéis, frutas exóticas e outros sabores únicos de São Paulo.",
    location: "São Paulo, SP",
    category: "food",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 65.00,
    duration: "2.5 horas",
    difficultyLevel: "easy",
    minParticipants: 4,
    maxParticipants: 18,
    languages: ["português", "inglês"],
    inclusions: ["Degustação de 8 especialidades", "Guia gastronômico", "Água mineral"],
    exclusions: ["Bebidas alcoólicas", "Compras adicionais"],
    requirements: ["Informar alergias alimentares", "Não recomendado para veganos"],
    cancellationPolicy: "Cancelamento gratuito até 3 horas antes",
    contactInfo: {
      email: "gastronomia@mercadao.com.br",
      phone: "(11) 3313-3365",
      whatsapp: "+5511987654321"
    },
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      "https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    createdById: 1
  },
  {
    title: "Street Art Tour - Beco do Batman",
    description: "Imersão na arte urbana de São Paulo! Explore o famoso Beco do Batman e outros pontos de street art em Vila Madalena com artistas locais.",
    location: "São Paulo, SP",
    category: "culture",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 50.00,
    duration: "3 horas",
    difficultyLevel: "moderate",
    minParticipants: 3,
    maxParticipants: 12,
    languages: ["português", "inglês"],
    inclusions: ["Guia artista local", "Visita a 5 pontos de street art", "Oficina de stencil"],
    exclusions: ["Alimentação", "Materiais de arte", "Transporte"],
    requirements: ["Condicionamento físico básico", "Roupas que podem sujar"],
    cancellationPolicy: "Cancelamento gratuito até 2 horas antes",
    contactInfo: {
      email: "arte@streetartsp.com.br",
      phone: "(11) 3031-2020",
      whatsapp: "+5511912345678"
    },
    images: [
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
      "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
    createdById: 1
  },
  {
    title: "Visita ao MASP - Museu de Arte",
    description: "Conheça o icônico Museu de Arte de São Paulo! Veja obras de Van Gogh, Picasso e Rembrandt na famosa estrutura suspensa da Avenida Paulista.",
    location: "São Paulo, SP",
    category: "culture",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 30.00,
    duration: "2 horas",
    difficultyLevel: "easy",
    minParticipants: 1,
    maxParticipants: 20,
    languages: ["português", "inglês"],
    inclusions: ["Entrada do museu", "Guia de arte", "Audioguia"],
    exclusions: ["Alimentação", "Estacionamento"],
    requirements: ["Não é permitido fotografar algumas obras"],
    cancellationPolicy: "Cancelamento gratuito até 1 hora antes",
    contactInfo: {
      email: "visitacao@masp.org.br",
      phone: "(11) 3149-5959",
      website: "https://www.masp.org.br"
    },
    images: [
      "https://images.unsplash.com/photo-1594736797933-d0401ba2a89b?w=800&q=80",
      "https://images.unsplash.com/photo-1541370732-3d2c4c3eb567?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1594736797933-d0401ba2a89b?w=800&q=80",
    createdById: 1
  },
  {
    title: "Passeio Cultural pela Liberdade",
    description: "Descubra a maior comunidade japonesa fora do Japão! Explore templos, lojas tradicionais e prove a autêntica culinária japonesa no bairro da Liberdade.",
    location: "São Paulo, SP",
    category: "culture",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 55.00,
    duration: "3.5 horas",
    difficultyLevel: "easy",
    minParticipants: 2,
    maxParticipants: 15,
    languages: ["português", "japonês"],
    inclusions: ["Guia cultural", "Degustação de doces japoneses", "Entrada no templo"],
    exclusions: ["Almoço", "Compras", "Transporte"],
    requirements: ["Respeitar costumes locais", "Tirar sapatos nos templos"],
    cancellationPolicy: "Cancelamento gratuito até 2 horas antes",
    contactInfo: {
      email: "cultura@liberdade.com.br",
      phone: "(11) 3209-5555",
      whatsapp: "+5511987456123"
    },
    images: [
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
    createdById: 1
  },

  // Florianópolis Activities
  {
    title: "Trilha para Lagoinha do Leste",
    description: "A praia mais bonita de Florianópolis! Trilha de 2 horas pela natureza até uma praia paradisíaca com águas cristalinas e dunas de areia.",
    location: "Florianópolis, SC",
    category: "adventure",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 75.00,
    duration: "6 horas",
    difficultyLevel: "moderate",
    minParticipants: 4,
    maxParticipants: 12,
    languages: ["português"],
    inclusions: ["Guia de trilha", "Lanche energético", "Seguro de aventura"],
    exclusions: ["Transporte até o início da trilha", "Equipamentos pessoais"],
    requirements: ["Bom condicionamento físico", "Calçados de trilha", "Protetor solar"],
    cancellationPolicy: "Cancelamento gratuito até 12 horas antes",
    contactInfo: {
      email: "trilhas@floripa.com.br",
      phone: "(48) 3334-5555",
      whatsapp: "+5548999887766"
    },
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    createdById: 1
  },
  {
    title: "Sandboard na Praia da Joaquina",
    description: "Aventura nas dunas de areia branca! Aprenda sandboard nas famosas dunas da Joaquina, uma das praias mais conhecidas para surf em Florianópolis.",
    location: "Florianópolis, SC",
    category: "adventure",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 85.00,
    duration: "3 horas",
    difficultyLevel: "moderate",
    minParticipants: 2,
    maxParticipants: 8,
    languages: ["português", "inglês"],
    inclusions: ["Equipamento de sandboard", "Instrutor", "Seguro de atividade"],
    exclusions: ["Alimentação", "Transporte"],
    requirements: ["Idade mínima: 12 anos", "Roupas que podem sujar"],
    cancellationPolicy: "Cancelamento gratuito até 4 horas antes",
    contactInfo: {
      email: "sandboard@joaquina.com.br",
      phone: "(48) 3232-8888",
      whatsapp: "+5548987654321"
    },
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    createdById: 1
  },
  {
    title: "Esportes Aquáticos na Lagoa da Conceição",
    description: "Diversão na lagoa mais famosa da ilha! Stand-up paddle, caiaque e windsurf na Lagoa da Conceição, com vista para as montanhas e dunas.",
    location: "Florianópolis, SC",
    category: "water_sports",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 95.00,
    duration: "4 horas",
    difficultyLevel: "easy",
    minParticipants: 2,
    maxParticipants: 10,
    languages: ["português", "inglês"],
    inclusions: ["Equipamentos (SUP, caiaque)", "Instrutor", "Colete salva-vidas"],
    exclusions: ["Alimentação", "Roupas de neoprene"],
    requirements: ["Saber nadar", "Trazer roupa de banho"],
    cancellationPolicy: "Cancelamento gratuito até 3 horas antes",
    contactInfo: {
      email: "esportes@lagoa.com.br",
      phone: "(48) 3232-4444",
      whatsapp: "+5548912345678"
    },
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    createdById: 1
  },
  {
    title: "Centro Histórico e Mercado Público",
    description: "Mergulhe na história de Florianópolis! Conheça o centro histórico, a famosa Figueira centenária e deguste pratos típicos no Mercado Público.",
    location: "Florianópolis, SC",
    category: "culture",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 45.00,
    duration: "3 horas",
    difficultyLevel: "easy",
    minParticipants: 3,
    maxParticipants: 20,
    languages: ["português"],
    inclusions: ["Guia histórico", "Degustação de sequência de camarão", "Entrada nos museus"],
    exclusions: ["Bebidas alcoólicas", "Compras no mercado"],
    requirements: ["Documentos com foto"],
    cancellationPolicy: "Cancelamento gratuito até 2 horas antes",
    contactInfo: {
      email: "historia@floripa.com.br",
      phone: "(48) 3251-1234",
      website: "https://www.pmf.sc.gov.br"
    },
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    createdById: 1
  },
  {
    title: "Beach Club em Jurerê Internacional",
    description: "Viva a sofisticação de Florianópolis! Dia completo nos melhores beach clubs de Jurerê, com música ao vivo, gastronomia e vista para o mar.",
    location: "Florianópolis, SC",
    category: "nightlife",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 180.00,
    duration: "8 horas",
    difficultyLevel: "easy",
    minParticipants: 2,
    maxParticipants: 15,
    languages: ["português", "inglês"],
    inclusions: ["Entrada no beach club", "Welcome drink", "Cadeira e sombreiro"],
    exclusions: ["Alimentação", "Bebidas adicionais", "Transporte"],
    requirements: ["Idade mínima: 18 anos", "Traje social beach"],
    cancellationPolicy: "Cancelamento gratuito até 24 horas antes",
    contactInfo: {
      email: "eventos@jurere.com.br",
      phone: "(48) 3261-5555",
      whatsapp: "+5548987123456"
    },
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    createdById: 1
  },

  // Salvador Activities
  {
    title: "Tour pelo Pelourinho",
    description: "Patrimônio Mundial da UNESCO! Caminhada pelas ruas coloridas do centro histórico de Salvador, com visita às igrejas barrocas e museus.",
    location: "Salvador, BA",
    category: "culture",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 55.00,
    duration: "3 horas",
    difficultyLevel: "easy",
    minParticipants: 4,
    maxParticipants: 25,
    languages: ["português", "inglês"],
    inclusions: ["Guia histórico", "Entrada nos museus", "Apresentação de capoeira"],
    exclusions: ["Alimentação", "Lembranças"],
    requirements: ["Sapatos confortáveis", "Protetor solar"],
    cancellationPolicy: "Cancelamento gratuito até 2 horas antes",
    contactInfo: {
      email: "turismo@pelourinho.com.br",
      phone: "(71) 3116-6000",
      website: "https://www.pelourinho.ba.gov.br"
    },
    images: [
      "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80",
    createdById: 1
  },
  {
    title: "Igreja de São Francisco - Arte Barroca",
    description: "Maravilha do barroco brasileiro! Visita guiada à igreja mais ornamentada do Brasil, com altar folheado a ouro e azulejos portugueses.",
    location: "Salvador, BA",
    category: "culture",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 35.00,
    duration: "1.5 horas",
    difficultyLevel: "easy",
    minParticipants: 1,
    maxParticipants: 30,
    languages: ["português", "inglês"],
    inclusions: ["Entrada da igreja", "Guia especializado em arte sacra"],
    exclusions: ["Fotografias do interior"],
    requirements: ["Vestimenta adequada para templo religioso"],
    cancellationPolicy: "Cancelamento gratuito até 1 hora antes",
    contactInfo: {
      email: "visitas@saofrancisco.org.br",
      phone: "(71) 3321-6968"
    },
    images: [
      "https://images.unsplash.com/photo-1594736797933-d0401ba2a89b?w=800&q=80",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1594736797933-d0401ba2a89b?w=800&q=80",
    createdById: 1
  },
  {
    title: "Elevador Lacerda e Cidade Baixa",
    description: "Patrimônio histórico e vista incrível! Suba no primeiro elevador urbano do mundo e explore a Cidade Baixa com o Mercado Modelo.",
    location: "Salvador, BA",
    category: "sightseeing",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 25.00,
    duration: "2 horas",
    difficultyLevel: "easy",
    minParticipants: 2,
    maxParticipants: 20,
    languages: ["português"],
    inclusions: ["Passagem do elevador", "Guia local", "Visita ao Mercado Modelo"],
    exclusions: ["Compras", "Alimentação"],
    requirements: ["Documento com foto"],
    cancellationPolicy: "Cancelamento gratuito até 30 minutos antes",
    contactInfo: {
      email: "elevador@salvador.ba.gov.br",
      phone: "(71) 3116-4800"
    },
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    createdById: 1
  },
  {
    title: "Praia do Porto da Barra",
    description: "A praia urbana mais famosa de Salvador! Relaxe nas areias douradas com vista para o pôr do sol mais bonito da Bahia.",
    location: "Salvador, BA",
    category: "beach",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 40.00,
    duration: "4 horas",
    difficultyLevel: "easy",
    minParticipants: 2,
    maxParticipants: 15,
    languages: ["português"],
    inclusions: ["Cadeira e guarda-sol", "Água de coco", "Protetor solar"],
    exclusions: ["Alimentação", "Transporte"],
    requirements: ["Traje de banho", "Toalha"],
    cancellationPolicy: "Cancelamento gratuito até 2 horas antes",
    contactInfo: {
      email: "praia@portobarra.com.br",
      phone: "(71) 3264-4000",
      whatsapp: "+5571987654321"
    },
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    createdById: 1
  },
  {
    title: "Experiência Gastronômica Baiana",
    description: "Sabores únicos da Bahia! Aprenda a fazer acarajé, prove moqueca de camarão e descubra os temperos e ingredientes típicos baianos.",
    location: "Salvador, BA",
    category: "food",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 80.00,
    duration: "4 horas",
    difficultyLevel: "easy",
    minParticipants: 6,
    maxParticipants: 12,
    languages: ["português"],
    inclusions: ["Aula de culinária", "Degustação completa", "Receitas impressas"],
    exclusions: ["Bebidas alcoólicas", "Transporte"],
    requirements: ["Informar restrições alimentares", "Avental fornecido"],
    cancellationPolicy: "Cancelamento gratuito até 6 horas antes",
    contactInfo: {
      email: "culinaria@bahia.com.br",
      phone: "(71) 3321-9999",
      whatsapp: "+5571912345678"
    },
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      "https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    createdById: 1
  },

  // Campos do Jordão Activities
  {
    title: "Passeio no Parque Amantikir",
    description: "Jardim botânico espetacular! Explore mais de 700 espécies de plantas em 60 mil m² de jardins temáticos com vista para as montanhas.",
    location: "Campos do Jordão, SP",
    category: "nature",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 45.00,
    duration: "3 horas",
    difficultyLevel: "easy",
    minParticipants: 1,
    maxParticipants: 30,
    languages: ["português"],
    inclusions: ["Entrada do parque", "Guia botânico", "Mapa ilustrado"],
    exclusions: ["Alimentação", "Transporte"],
    requirements: ["Sapatos confortáveis", "Roupas adequadas ao clima"],
    cancellationPolicy: "Cancelamento gratuito até 2 horas antes",
    contactInfo: {
      email: "visitas@amantikir.com.br",
      phone: "(12) 3668-1000",
      website: "https://www.amantikir.com.br"
    },
    images: [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    createdById: 1
  },
  {
    title: "Vila Capivari - Gastronomia e Compras",
    description: "Charme europeu no coração de Campos do Jordão! Explore a famosa Vila Capivari com restaurantes, lojas e arquitetura alemã.",
    location: "Campos do Jordão, SP",
    category: "culture",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 60.00,
    duration: "4 horas",
    difficultyLevel: "easy",
    minParticipants: 2,
    maxParticipants: 20,
    languages: ["português"],
    inclusions: ["Guia local", "Degustação de chocolate", "Entrada no Memorial"],
    exclusions: ["Almoço", "Compras", "Transporte"],
    requirements: ["Roupas de frio", "Documentos"],
    cancellationPolicy: "Cancelamento gratuito até 3 horas antes",
    contactInfo: {
      email: "turismo@capivari.com.br",
      phone: "(12) 3664-4000",
      whatsapp: "+5512987654321"
    },
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    createdById: 1
  },
  {
    title: "Horto Florestal - Trilhas e Arvorismo",
    description: "Aventura na natureza! Trilhas no Horto Florestal com arvorismo, tirolesa e contato com a Mata Atlântica preservada.",
    location: "Campos do Jordão, SP",
    category: "adventure",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 85.00,
    duration: "5 horas",
    difficultyLevel: "moderate",
    minParticipants: 4,
    maxParticipants: 15,
    languages: ["português"],
    inclusions: ["Equipamentos de segurança", "Instrutor", "Seguro de atividade"],
    exclusions: ["Alimentação", "Roupas específicas"],
    requirements: ["Idade mínima: 8 anos", "Peso máximo: 120kg", "Condicionamento físico"],
    cancellationPolicy: "Cancelamento gratuito até 12 horas antes",
    contactInfo: {
      email: "aventura@horto.com.br",
      phone: "(12) 3663-3762",
      whatsapp: "+5512912345678"
    },
    images: [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    createdById: 1
  },
  {
    title: "Pico do Itapeva - Nascer do Sol",
    description: "Vista espetacular a 2.000 metros! Excursão para ver o nascer do sol no ponto mais alto de Campos do Jordão com vista do Vale do Paraíba.",
    location: "Campos do Jordão, SP",
    category: "sightseeing",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 70.00,
    duration: "4 horas",
    difficultyLevel: "easy",
    minParticipants: 3,
    maxParticipants: 18,
    languages: ["português"],
    inclusions: ["Transporte 4x4", "Guia de montanha", "Chocolate quente"],
    exclusions: ["Café da manhã", "Roupas de frio"],
    requirements: ["Saída às 5h30", "Roupas muito quentes", "Calçados fechados"],
    cancellationPolicy: "Cancelamento gratuito até 18 horas antes",
    contactInfo: {
      email: "itapeva@montanha.com.br",
      phone: "(12) 3664-7777",
      whatsapp: "+5512987123456"
    },
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    createdById: 1
  },
  {
    title: "Ducha de Prata - Tirolesa e Cachoeiras",
    description: "Diversão e natureza! Complexo de cachoeiras artificiais com tirolesa sobre as águas e trilhas pela mata preservada.",
    location: "Campos do Jordão, SP",
    category: "adventure",
    
    countryType: "nacional",
    region: "Brasil",
    priceType: "per_person",priceType: "per_person",
    priceAmount: 50.00,
    duration: "3 horas",
    difficultyLevel: "easy",
    minParticipants: 2,
    maxParticipants: 25,
    languages: ["português"],
    inclusions: ["Entrada do complexo", "Tirolesa", "Equipamentos"],
    exclusions: ["Alimentação", "Estacionamento"],
    requirements: ["Idade mínima: 6 anos", "Roupas que podem molhar"],
    cancellationPolicy: "Cancelamento gratuito até 1 hora antes",
    contactInfo: {
      email: "info@duchadeprata.com.br",
      phone: "(12) 3664-2988",
      whatsapp: "+5512987456789"
    },
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
    ],
    coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    createdById: 1
  }
];

export async function createActivitiesData() {
  try {
    await createActivitiesTable();
    
    console.log("🎯 Inserindo atividades turísticas...");
    
    for (const activity of activityData) {
      try {
        // Insert activity
        const [result] = await db.insert(activities).values({
          title: activity.title,
          description: activity.description,
          location: activity.location,
          category: activity.category,
          priceType: activity.priceType,
          priceAmount: activity.priceAmount.toString(),
          duration: activity.duration,
          difficultyLevel: activity.difficultyLevel,
          minParticipants: activity.minParticipants,
          maxParticipants: activity.maxParticipants,
          languages: JSON.stringify(activity.languages),
          inclusions: JSON.stringify(activity.inclusions),
          exclusions: JSON.stringify(activity.exclusions),
          requirements: JSON.stringify(activity.requirements),
          cancellationPolicy: activity.cancellationPolicy,
          contactInfo: JSON.stringify(activity.contactInfo),
          images: JSON.stringify(activity.images),
          coverImage: activity.coverImage,
          createdById: activity.createdById,
          averageRating: "4.5",
          totalRatings: Math.floor(Math.random() * 50) + 10
        });
        
        const activityId = result.insertId;
        
        // Create budget proposals for each activity
        const proposals = [
          {
            title: "Opção Básica",
            description: "Pacote básico com o essencial",
            amount: activity.priceAmount,
            inclusions: activity.inclusions.slice(0, 2)
          },
          {
            title: "Opção Completa",
            description: "Pacote completo com todos os extras",
            amount: activity.priceAmount * 1.5,
            inclusions: activity.inclusions
          },
          {
            title: "Opção Premium",
            description: "Experiência premium com serviços exclusivos",
            amount: activity.priceAmount * 2,
            inclusions: [...activity.inclusions, "Transporte privado", "Fotógrafo profissional"]
          }
        ];
        
        for (const proposal of proposals) {
          await db.insert(activityBudgetProposals).values({
            activityId: activityId,
            createdBy: 1,
            title: proposal.title,
            description: proposal.description,
            priceType: "per_person",
            amount: proposal.amount.toString(),
            currency: "BRL",
            inclusions: JSON.stringify(proposal.inclusions),
            exclusions: JSON.stringify(activity.exclusions),
            isActive: true,
            votes: Math.floor(Math.random() * 20) + 1
          });
        }
        
        console.log(`✅ Atividade criada: ${activity.title}`);
        
      } catch (error) {
        console.error(`❌ Erro ao criar atividade ${activity.title}:`, error);
      }
    }
    
    console.log("🎉 Todas as atividades foram criadas com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro ao criar dados de atividades:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createActivitiesData();
}