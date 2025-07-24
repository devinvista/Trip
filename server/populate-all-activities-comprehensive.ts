import { db } from "./db";
import { activities, activityBudgetProposals } from "@shared/schema";

const comprehensiveActivities = [
  // === BRASIL - REGIÃO SUDESTE ===
  {
    title: "Cristo Redentor e Pão de Açúcar",
    description: "Visite os dois cartões postais mais famosos do Rio de Janeiro em um único tour. Inclui transporte pelo bondinho do Pão de Açúcar e trem do Corcovado.",
    location: "Rio de Janeiro, RJ",
    city: "Rio de Janeiro",
    region: "Sudeste",
    countryType: "nacional",
    category: "pontos_turisticos",
    duration: "8 horas",
    difficultyLevel: "easy",
    minParticipants: 1,
    maxParticipants: 15,
    coverImage: "https://images.unsplash.com/photo-1518905208889-90a2ba3d1f93?w=1200&h=800&fit=crop&q=85",
    languages: ["Português", "Inglês", "Espanhol"],
    inclusions: ["Transporte", "Ingressos", "Guia bilíngue"],
    exclusions: ["Refeições", "Bebidas", "Gorjetas"],
    requirements: ["Idade mínima: 3 anos"],
    contactInfo: {
      phone: "+55 21 2558-1329",
      email: "tours@riodejaneiro.com",
      website: "www.christtours.com.br"
    },
    budgetProposals: [
      {
        title: "Econômico",
        description: "Tour básico com transporte compartilhado",
        amount: 85.00,
        inclusions: ["Transporte compartilhado", "Ingressos básicos"],
        exclusions: ["Guia", "Lanche", "Fotos profissionais"]
      },
      {
        title: "Completo",
        description: "Tour completo com guia e lanche",
        amount: 160.00,
        inclusions: ["Van com ar condicionado", "Guia credenciado", "Lanche", "Seguro"],
        exclusions: ["Almoço", "Bebidas alcoólicas"]
      },
      {
        title: "Premium",
        description: "Tour privado com fotógrafo",
        amount: 350.00,
        inclusions: ["Carro privado", "Guia especializado", "Fotógrafo", "Almoço em restaurante", "Certificado"],
        exclusions: ["Bebidas extras", "Compras pessoais"]
      }
    ]
  },
  {
    title: "Trilha na Floresta da Tijuca",
    description: "Aventura pela maior floresta urbana do mundo com cachoeiras, vistas panorâmicas e rica biodiversidade da Mata Atlântica.",
    location: "Rio de Janeiro, RJ", 
    city: "Rio de Janeiro",
    region: "Sudeste",
    countryType: "nacional",
    category: "adventure",
    duration: "6 horas",
    difficultyLevel: "moderate",
    minParticipants: 2,
    maxParticipants: 12,
    coverImage: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=1200&h=800&fit=crop&q=85",
    languages: ["Português", "Inglês"],
    inclusions: ["Guia especializado", "Equipamentos de segurança", "Lanche"],
    exclusions: ["Transporte ao ponto de encontro", "Almoço", "Roupas adequadas"],
    requirements: ["Idade mínima: 12 anos", "Condicionamento físico básico", "Calçado de trilha"],
    budgetProposals: [
      {
        title: "Básico",
        description: "Trilha simples com guia local",
        amount: 45.00,
        inclusions: ["Guia local", "Lanche básico"],
        exclusions: ["Equipamentos", "Transporte", "Seguro"]
      },
      {
        title: "Aventura",
        description: "Trilha completa com equipamentos",
        amount: 95.00,
        inclusions: ["Guia especializado", "Equipamentos completos", "Lanche energético", "Seguro"],
        exclusions: ["Transporte", "Almoço", "Roupas"]
      },
      {
        title: "Expedição",
        description: "Trilha técnica com rapel e escalada",
        amount: 180.00,
        inclusions: ["Instrutor técnico", "Equipamentos premium", "Almoço na trilha", "Fotos", "Certificado"],
        exclusions: ["Transporte privado", "Roupas técnicas"]
      }
    ]
  },
  {
    title: "Tour Gastronômico Santa Teresa",
    description: "Descubra os sabores únicos do bairro boêmio Santa Teresa, visitando restaurantes tradicionais, bares históricos e ateliês de artistas locais.",
    location: "Rio de Janeiro, RJ",
    city: "Rio de Janeiro", 
    region: "Sudeste",
    countryType: "nacional",
    category: "food_tours",
    duration: "4 horas",
    difficultyLevel: "easy",
    minParticipants: 3,
    maxParticipants: 10,
    coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop&q=85",
    languages: ["Português", "Inglês", "Francês"],
    inclusions: ["Guia gastronômico", "Degustações", "Transporte local"],
    exclusions: ["Bebidas alcoólicas extras", "Compras pessoais"],
    requirements: ["Sem restrições dietárias severas"],
    budgetProposals: [
      {
        title: "Degustação",
        description: "Tour básico com 4 paradas",
        amount: 75.00,
        inclusions: ["4 degustações", "Guia local", "Água"],
        exclusions: ["Bebidas", "Refeição completa", "Transporte"]
      },
      {
        title: "Gastronômico",
        description: "Tour completo com refeição",
        amount: 140.00,
        inclusions: ["6 degustações", "Refeição completa", "Bebida incluída", "Guia especializado"],
        exclusions: ["Bebidas premium", "Sobremesas extras"]
      },
      {
        title: "Gourmet",
        description: "Experiência premium com chef",
        amount: 280.00,
        inclusions: ["Chef acompanhante", "Restaurantes selecionados", "Vinhos harmonizados", "Transporte privado"],
        exclusions: ["Compras no mercado", "Lembranças"]
      }
    ]
  },

  // === BONITO, MS ===
  {
    title: "Flutuação no Rio da Prata",
    description: "Uma das mais belas flutuações do Brasil, com águas cristalinas e rica fauna aquática. Visibilidade de até 50 metros de profundidade.",
    location: "Bonito, MS",
    city: "Bonito",
    region: "Centro-Oeste", 
    countryType: "nacional",
    category: "water_sports",
    duration: "5 horas",
    difficultyLevel: "easy",
    minParticipants: 2,
    maxParticipants: 20,
    coverImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop&q=85",
    languages: ["Português", "Inglês", "Espanhol"],
    inclusions: ["Equipamentos de flutuação", "Instruções", "Lanche"],
    exclusions: ["Transporte", "Almoço", "Roupas de neoprene"],
    requirements: ["Saber nadar", "Idade mínima: 5 anos"],
    budgetProposals: [
      {
        title: "Flutuação Simples",
        description: "Flutuação básica de 1.5km",
        amount: 90.00,
        inclusions: ["Equipamentos básicos", "Instruções", "Seguro"],
        exclusions: ["Lanche", "Fotos", "Transporte"]
      },
      {
        title: "Experiência Completa", 
        description: "Flutuação completa com trilha",
        amount: 165.00,
        inclusions: ["Equipamentos completos", "Trilha interpretativa", "Lanche", "Guia especializado"],
        exclusions: ["Transporte", "Almoço", "Fotos subaquáticas"]
      },
      {
        title: "Premium Aquático",
        description: "Experiência exclusiva com fotografia",
        amount: 295.00,
        inclusions: ["Equipamentos premium", "Fotógrafo subaquático", "Almoço incluído", "Transporte", "Vídeo"],
        exclusions: ["Hospedagem", "Bebidas extras"]
      }
    ]
  },

  // === GRAMADO, RS ===
  {
    title: "Mini Mundo",
    description: "Parque temático com miniaturas em escala real de construções famosas do mundo, jardins exuberantes e arquitetura europeia encantadora.",
    location: "Gramado, RS",
    city: "Gramado",
    region: "Sul",
    countryType: "nacional", 
    category: "cultural",
    duration: "3 horas",
    difficultyLevel: "easy",
    minParticipants: 1,
    maxParticipants: 50,
    coverImage: "https://images.unsplash.com/photo-1594736797933-d0c267cbcc2c?w=1200&h=800&fit=crop&q=85",
    languages: ["Português", "Inglês", "Espanhol"],
    inclusions: ["Entrada no parque", "Mapa ilustrativo"],
    exclusions: ["Lanche", "Lembranças", "Transporte"],
    requirements: ["Sem restrições"],
    budgetProposals: [
      {
        title: "Entrada Básica",
        description: "Acesso ao parque por 3 horas",
        amount: 45.00,
        inclusions: ["Entrada", "Mapa"],
        exclusions: ["Guia", "Lanche", "Estacionamento"]
      },
      {
        title: "Visita Guiada",
        description: "Tour com guia especializado",
        amount: 75.00,
        inclusions: ["Entrada", "Guia especializado", "Lanche", "Estacionamento"],
        exclusions: ["Transporte", "Lembranças", "Fotos profissionais"]
      },
      {
        title: "Experiência Premium",
        description: "Tour VIP com fotógrafo",
        amount: 150.00,
        inclusions: ["Entrada VIP", "Guia exclusivo", "Sessão de fotos", "Lanche gourmet", "Lembrança"],
        exclusions: ["Transporte privado", "Hospedagem"]
      }
    ]
  },

  // === PARIS, FRANÇA ===
  {
    title: "Torre Eiffel e Cruzeiro no Sena",
    description: "Suba à Torre Eiffel e navegue pelo Rio Sena admirando os monumentos históricos de Paris iluminados ao entardecer.",
    location: "Paris, França",
    city: "Paris",
    region: "Europa Ocidental",
    countryType: "internacional",
    category: "pontos_turisticos",
    duration: "6 horas",
    difficultyLevel: "easy",
    minParticipants: 2,
    maxParticipants: 25,
    coverImage: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=1200&h=800&fit=crop&q=85",
    languages: ["Français", "English", "Español", "Português"],
    inclusions: ["Torre Eiffel", "Cruzeiro", "Audioguia"],
    exclusions: ["Refeições", "Transporte hotel", "Bebidas"],
    requirements: ["Passaporte válido"],
    budgetProposals: [
      {
        title: "Économique",
        description: "Visite de base avec ascenseur",
        amount: 65.00,
        currency: "EUR",
        inclusions: ["2º andar Torre Eiffel", "Cruzeiro básico"],
        exclusions: ["Topo da torre", "Jantar", "Transporte"]
      },
      {
        title: "Complet",
        description: "Expérience complète avec dîner",
        amount: 120.00,
        currency: "EUR", 
        inclusions: ["Topo da Torre Eiffel", "Cruzeiro com jantar", "Audioguia", "Transporte"],
        exclusions: ["Bebidas premium", "Lembranças"]
      },
      {
        title: "Premium",
        description: "Expérience VIP avec champagne",
        amount: 250.00,
        currency: "EUR",
        inclusions: ["Acesso VIP", "Jantar gourmet", "Champagne", "Guia privado", "Transporte de luxo"],
        exclusions: ["Hotel", "Compras pessoais"]
      }
    ]
  },

  // === NOVA YORK, EUA ===
  {
    title: "Estátua da Liberdade e Ellis Island",
    description: "Visite os símbolos da liberdade americana, incluindo ferry, museu da imigração e vistas espetaculares de Manhattan.",
    location: "Nova York, EUA",
    city: "Nova York",
    region: "América do Norte",
    countryType: "internacional",
    category: "pontos_turisticos", 
    duration: "6 horas",
    difficultyLevel: "easy",
    minParticipants: 1,
    maxParticipants: 30,
    coverImage: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200&h=800&fit=crop&q=85",
    languages: ["English", "Español", "Français", "Português"],
    inclusions: ["Ferry", "Entrada museus", "Audioguia"],
    exclusions: ["Coroa da estátua", "Almoço", "Transporte hotel"],
    requirements: ["Documento de identidade", "Reserva antecipada"],
    budgetProposals: [
      {
        title: "Basic Tour",
        description: "Standard ferry and museum access",
        amount: 45.00,
        currency: "USD",
        inclusions: ["Ferry tickets", "Ellis Island Museum", "Basic audioguide"],
        exclusions: ["Pedestal access", "Food", "Transportation"]
      },
      {
        title: "Complete Experience",
        description: "Full access including pedestal",
        amount: 85.00,
        currency: "USD",
        inclusions: ["Pedestal access", "Both museums", "Enhanced audioguide", "Reserved ferry"],
        exclusions: ["Crown access", "Meals", "Hotel transport"]
      },
      {
        title: "VIP Crown Access",
        description: "Exclusive crown access with priority",
        amount: 180.00,
        currency: "USD",
        inclusions: ["Crown access", "Priority boarding", "Guided tour", "Lunch", "Transportation"],
        exclusions: ["Hotel accommodation", "Personal purchases"]
      }
    ]
  },

  // === LONDRES, REINO UNIDO ===
  {
    title: "Torre de Londres e Joias da Coroa",
    description: "Explore a histórica Torre de Londres, lar das Joias da Coroa Britânica, com mais de 1000 anos de história real inglesa.",
    location: "Londres, Reino Unido",
    city: "Londres", 
    region: "Europa Ocidental",
    countryType: "internacional",
    category: "cultural",
    duration: "4 horas",
    difficultyLevel: "easy",
    minParticipants: 1,
    maxParticipants: 20,
    coverImage: "https://images.unsplash.com/photo-1529655683826-f8e02fb17597?w=1200&h=800&fit=crop&q=85",
    languages: ["English", "Français", "Español", "Deutsch"],
    inclusions: ["Entrada Torre", "Audioguia", "Guia Yeoman"],
    exclusions: ["Transporte", "Refeições", "Lembranças"],
    requirements: ["Reserva antecipada recomendada"],
    budgetProposals: [
      {
        title: "Standard Entry",
        description: "Regular admission with audioguide",
        amount: 35.00,
        currency: "GBP",
        inclusions: ["Tower admission", "Crown Jewels", "Basic audioguide"],
        exclusions: ["Yeoman tour", "Food", "Transport"]
      },
      {
        title: "Guided Experience", 
        description: "Full tour with Yeoman Warder",
        amount: 65.00,
        currency: "GBP",
        inclusions: ["Premium admission", "Yeoman Warder tour", "Enhanced audioguide", "Guidebook"],
        exclusions: ["Meals", "Transportation", "Special exhibitions"]
      },
      {
        title: "Royal Experience",
        description: "VIP access with private guide",
        amount: 120.00,
        currency: "GBP",
        inclusions: ["VIP admission", "Private guide", "Special access areas", "Afternoon tea", "Souvenir"],
        exclusions: ["Hotel transport", "Additional purchases"]
      }
    ]
  },

  // === ROMA, ITÁLIA ===
  {
    title: "Coliseu e Fórum Romano",
    description: "Mergulhe na Roma Antiga visitando o icônico Coliseu, Fórum Romano e Monte Palatino com guia arqueólogo especializado.",
    location: "Roma, Itália",
    city: "Roma",
    region: "Europa do Sul", 
    countryType: "internacional",
    category: "cultural",
    duration: "5 horas",
    difficultyLevel: "moderate",
    minParticipants: 2,
    maxParticipants: 18,
    coverImage: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&h=800&fit=crop&q=85",
    languages: ["Italiano", "English", "Français", "Español"],
    inclusions: ["Ingressos prioritários", "Guia arqueólogo", "Fones de ouvido"],
    exclusions: ["Arena do Coliseu", "Transporte", "Refeições"],
    requirements: ["Calçado confortável", "Protetor solar"],
    budgetProposals: [
      {
        title: "Ingresso Básico",
        description: "Entrada padrão com audioguia",
        amount: 25.00,
        currency: "EUR",
        inclusions: ["Coliseu", "Fórum Romano", "Audioguia básico"],
        exclusions: ["Arena", "Guia humano", "Monte Palatino"]
      },
      {
        title: "Tour Completo",
        description: "Visita guiada com arqueólogo",
        amount: 75.00,
        currency: "EUR",
        inclusions: ["Acesso prioritário", "Guia especializado", "Monte Palatino", "Fones individuais"],
        exclusions: ["Arena do gladiador", "Transporte", "Almoço"]
      },
      {
        title: "Experiência Arena",
        description: "Acesso exclusivo à arena dos gladiadores",
        amount: 150.00,
        currency: "EUR",
        inclusions: ["Arena do gladiador", "Subterrâneos", "Tour privado", "Almoço romano", "Certificado"],
        exclusions: ["Hotel transport", "Jantar", "Lembranças extras"]
      }
    ]
  },

  // === BUENOS AIRES, ARGENTINA ===
  {
    title: "Show de Tango e Jantar",
    description: "Noite autêntica portenha com show de tango profissional, jantar argentino e vinhos selecionados no histórico bairro San Telmo.",
    location: "Buenos Aires, Argentina", 
    city: "Buenos Aires",
    region: "América do Sul",
    countryType: "internacional",
    category: "cultural",
    duration: "4 horas",
    difficultyLevel: "easy",
    minParticipants: 2,
    maxParticipants: 40,
    coverImage: "https://images.unsplash.com/photo-1514222709107-a180c68d716f?w=1200&h=800&fit=crop&q=85",
    languages: ["Español", "English", "Português", "Français"],
    inclusions: ["Show profissional", "Jantar", "Vinho", "Transporte"],
    exclusions: ["Bebidas premium", "Aula de tango", "Gorjetas"],
    requirements: ["Reserva antecipada", "Traje social"],
    budgetProposals: [
      {
        title: "Tango Básico",
        description: "Show e jantar simples",
        amount: 45.00,
        currency: "USD",
        inclusions: ["Show de tango", "Jantar básico", "1 bebida"],
        exclusions: ["Transporte", "Vinhos premium", "Aula de dança"]
      },
      {
        title: "Noche Completa",
        description: "Experiência completa com vinhos",
        amount: 85.00,
        currency: "USD",
        inclusions: ["Show premium", "Jantar gourmet", "Vinhos selecionados", "Transporte incluído"],
        exclusions: ["Aula privada", "Bebidas extras", "Lembranças"]
      },
      {
        title: "Tango VIP",
        description: "Mesa VIP com aula privada",
        amount: 160.00,
        currency: "USD",
        inclusions: ["Mesa VIP", "Aula privada", "Jantar premium", "Vinhos premium", "Transporte executivo"],
        exclusions: ["Hotel", "Compras pessoais", "Noite extra"]
      }
    ]
  }
];

export async function populateAllActivitiesComprehensive() {
  console.log("🏗️ Iniciando população completa de atividades...");
  
  try {
    let totalActivities = 0;
    let totalProposals = 0;

    for (const activityData of comprehensiveActivities) {
      // Insert activity
      const { budgetProposals, ...activity } = activityData;
      
      const [insertedActivity] = await db.insert(activities).values({
        ...activity,
        priceType: "per_person",
        priceAmount: "0.00", // Will be determined by proposals
        averageRating: "4.50",
        totalRatings: Math.floor(Math.random() * 50) + 10,
        isActive: true
      });

      const activityId = insertedActivity.insertId;
      totalActivities++;

      // Insert budget proposals for this activity
      for (const proposal of budgetProposals) {
        await db.insert(activityBudgetProposals).values({
          activityId: activityId,
          createdBy: 1, // Admin user
          title: proposal.title,
          description: proposal.description,
          amount: proposal.amount.toString(),
          currency: (proposal as any).currency || "BRL",
          priceType: "per_person",
          inclusions: JSON.stringify(proposal.inclusions),
          exclusions: JSON.stringify(proposal.exclusions),
          isActive: true,
          votes: Math.floor(Math.random() * 20) + 5
        });
        totalProposals++;
      }

      console.log(`✅ Atividade criada: ${activity.title} (${activity.location}) com ${budgetProposals.length} propostas`);
    }

    console.log(`🎉 População completa finalizada!`);
    console.log(`📊 Resumo:`);
    console.log(`   - ${totalActivities} atividades criadas`);
    console.log(`   - ${totalProposals} propostas de orçamento criadas`);
    console.log(`   - Cobertura: Brasil (Sudeste, Centro-Oeste, Sul) + Internacional (Europa, América do Norte, América do Sul)`);
    
    return { totalActivities, totalProposals };

  } catch (error) {
    console.error("❌ Erro ao popular atividades:", error);
    throw error;
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateAllActivitiesComprehensive()
    .then((result) => {
      console.log("✅ Script executado com sucesso:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erro na execução:", error);
      process.exit(1);
    });
}