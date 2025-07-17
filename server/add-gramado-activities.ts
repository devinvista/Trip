import { db } from './db.js';
import { activities, activityBudgetProposals, activityReviews } from '../shared/schema.js';
import { eq, desc } from 'drizzle-orm';

const gramadoActivities = [
  {
    title: 'Mini Mundo',
    shortDescription: 'Parque temático com miniaturas em escala de monumentos e paisagens mundiais',
    description: 'O Mini Mundo é um parque temático único que apresenta réplicas em miniatura de monumentos famosos do mundo todo. Com mais de 24 países representados em uma área de 23 mil metros quadrados, o parque oferece uma viagem ao redor do mundo sem sair de Gramado. As miniaturas são construídas em escala 1:24 e incluem desde o Cristo Redentor até a Torre Eiffel, passando por castelos europeus e paisagens típicas de diversos países.',
    location: 'Gramado, RS',
    duration: 2,
    difficulty: 'easy',
    category: 'pontos_turisticos',
    price: 0,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
    includesTransport: false,
    includesFood: false,
    includesGuide: false,
    maxParticipants: 50,
    minAge: 0,
    rating: 4.6,
    reviewCount: 1247,
    createdAt: new Date('2025-01-15T10:00:00Z'),
    updatedAt: new Date('2025-01-15T10:00:00Z')
  },
  {
    title: 'Dreamland Museu de Cera',
    shortDescription: 'Museu de cera com figuras de personalidades famosas e cenários temáticos',
    description: 'O Dreamland Museu de Cera é uma atração imperdível em Gramado, apresentando mais de 40 figuras de cera hiperrealistas de personalidades nacionais e internacionais. O museu conta com cenários temáticos que recriam ambientes históricos e contemporâneos, proporcionando uma experiência interativa única. Além das figuras de cera, o complexo oferece atividades como mini golf, simuladores e espaços para fotos temáticas.',
    location: 'Gramado, RS',
    duration: 1.5,
    difficulty: 'easy',
    category: 'cultural',
    price: 0,
    imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
    includesTransport: false,
    includesFood: false,
    includesGuide: false,
    maxParticipants: 30,
    minAge: 0,
    rating: 4.3,
    reviewCount: 892,
    createdAt: new Date('2025-01-15T10:00:00Z'),
    updatedAt: new Date('2025-01-15T10:00:00Z')
  },
  {
    title: 'GramadoZoo',
    shortDescription: 'Zoológico com animais nativos e exóticos em ambiente natural preservado',
    description: 'O GramadoZoo é um zoológico moderno que abriga mais de 1.500 animais de 200 espécies diferentes, incluindo fauna nativa e exótica. Localizado em meio à natureza preservada da Serra Gaúcha, o zoológico oferece uma experiência educativa e divertida para toda a família. Os visitantes podem observar animais em habitats naturais, participar de atividades de alimentação supervisionada e aprender sobre conservação ambiental através de programas educativos.',
    location: 'Gramado, RS',
    duration: 3,
    difficulty: 'easy',
    category: 'nature',
    price: 0,
    imageUrl: 'https://images.unsplash.com/photo-1549366021-9f761d040a94?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
    includesTransport: false,
    includesFood: false,
    includesGuide: false,
    maxParticipants: 40,
    minAge: 0,
    rating: 4.5,
    reviewCount: 1689,
    createdAt: new Date('2025-01-15T10:00:00Z'),
    updatedAt: new Date('2025-01-15T10:00:00Z')
  },
  {
    title: 'Tour de Vinícolas no Vale dos Vinhedos',
    shortDescription: 'Passeio pelas vinícolas da região com degustação de vinhos e paisagens deslumbrantes',
    description: 'O Tour de Vinícolas no Vale dos Vinhedos é uma experiência imperdível para os amantes de vinho. O passeio inclui visitas a renomadas vinícolas da região, onde os visitantes podem conhecer todo o processo de produção do vinho, desde o cultivo das uvas até o engarrafamento. A experiência inclui degustações de diferentes tipos de vinho, harmonizações gastronômicas e vistas panorâmicas dos vinhedos em meio às montanhas da Serra Gaúcha.',
    location: 'Gramado, RS',
    duration: 8,
    difficulty: 'easy',
    category: 'food_tours',
    price: 0,
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
    includesTransport: false,
    includesFood: false,
    includesGuide: false,
    maxParticipants: 25,
    minAge: 18,
    rating: 4.8,
    reviewCount: 756,
    createdAt: new Date('2025-01-15T10:00:00Z'),
    updatedAt: new Date('2025-01-15T10:00:00Z')
  },
  {
    title: 'Snowland - Parque de Neve Indoor',
    shortDescription: 'Primeiro parque de neve indoor das Américas com atividades de inverno',
    description: 'O Snowland é uma experiência única na América Latina, oferecendo um ambiente de neve artificial com temperatura controlada a -5°C. O parque conta com diversas atividades típicas de inverno, incluindo esqui, snowboard, patinação no gelo e tobogã. Com instrutores qualificados e equipamentos de segurança, é uma oportunidade perfeita para toda a família experimentar esportes de inverno em um ambiente seguro e controlado, independente da estação do ano.',
    location: 'Gramado, RS',
    duration: 4,
    difficulty: 'medium',
    category: 'adventure',
    price: 0,
    imageUrl: 'https://images.unsplash.com/photo-1551524164-6cf5ac833fb8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
    includesTransport: false,
    includesFood: false,
    includesGuide: false,
    maxParticipants: 20,
    minAge: 8,
    rating: 4.4,
    reviewCount: 1123,
    createdAt: new Date('2025-01-15T10:00:00Z'),
    updatedAt: new Date('2025-01-15T10:00:00Z')
  }
];

const proposals = [
  // Mini Mundo
  {
    activityId: 1, // Will be updated with actual ID
    title: 'Ingresso Econômico',
    description: 'Entrada simples para explorar o Mini Mundo por conta própria',
    price: 80,
    duration: 2,
    inclusions: ['Entrada para o parque', 'Mapa do local', 'Acesso a todas as miniaturas'],
    exclusions: ['Transporte', 'Alimentação', 'Guia'],
    maxParticipants: 50,
    isPopular: false,
    vote_count: 45
  },
  {
    activityId: 1,
    title: 'Pacote Completo',
    description: 'Entrada com transporte incluso saindo do centro de Gramado',
    price: 120,
    duration: 3,
    inclusions: ['Entrada para o parque', 'Transporte ida e volta', 'Mapa do local', 'Acesso a todas as miniaturas'],
    exclusions: ['Alimentação', 'Guia especializado'],
    maxParticipants: 30,
    isPopular: true,
    vote_count: 89
  },
  {
    activityId: 1,
    title: 'Experiência Premium',
    description: 'Tour completo com guia especializado e almoço incluso',
    price: 200,
    duration: 4,
    inclusions: ['Entrada para o parque', 'Transporte ida e volta', 'Guia especializado', 'Almoço', 'Fotos profissionais'],
    exclusions: ['Bebidas alcoólicas', 'Lembranças'],
    maxParticipants: 15,
    isPopular: false,
    vote_count: 67
  },
  // Dreamland Museu de Cera
  {
    activityId: 2,
    title: 'Entrada Simples',
    description: 'Acesso ao museu de cera com visita autoguiada',
    price: 65,
    duration: 1.5,
    inclusions: ['Entrada para o museu', 'Mapa do local', 'Acesso a todas as figuras'],
    exclusions: ['Atividades extras', 'Fotos profissionais', 'Guia'],
    maxParticipants: 30,
    isPopular: false,
    vote_count: 52
  },
  {
    activityId: 2,
    title: 'Combo Diversão',
    description: 'Museu de cera + atividade extra (mini golf ou simuladores)',
    price: 120,
    duration: 2.5,
    inclusions: ['Entrada para o museu', 'Mini golf OU simuladores', 'Acesso a todas as figuras'],
    exclusions: ['Transporte', 'Alimentação', 'Fotos profissionais'],
    maxParticipants: 25,
    isPopular: true,
    vote_count: 78
  },
  {
    activityId: 2,
    title: 'VIP Experience',
    description: 'Experiência completa com guia exclusivo e sessão de fotos',
    price: 200,
    duration: 3,
    inclusions: ['Entrada para o museu', 'Guia exclusivo', 'Sessão de fotos profissionais', 'Todas as atividades'],
    exclusions: ['Transporte', 'Alimentação'],
    maxParticipants: 10,
    isPopular: false,
    vote_count: 43
  },
  // GramadoZoo
  {
    activityId: 3,
    title: 'Entrada Básica',
    description: 'Acesso ao zoológico para visita livre',
    price: 70,
    duration: 3,
    inclusions: ['Entrada para o zoológico', 'Mapa do local', 'Acesso a todas as áreas'],
    exclusions: ['Alimentação de animais', 'Guia', 'Transporte'],
    maxParticipants: 40,
    isPopular: false,
    vote_count: 61
  },
  {
    activityId: 3,
    title: 'Visita Monitorada',
    description: 'Tour guiado com explicações sobre os animais e conservação',
    price: 110,
    duration: 3,
    inclusions: ['Entrada para o zoológico', 'Guia especializado', 'Atividades educativas', 'Kit educativo'],
    exclusions: ['Alimentação de animais', 'Transporte', 'Lanche'],
    maxParticipants: 20,
    isPopular: true,
    vote_count: 94
  },
  {
    activityId: 3,
    title: 'Tour Especial',
    description: 'Experiência completa com alimentação supervisionada de animais',
    price: 150,
    duration: 4,
    inclusions: ['Entrada para o zoológico', 'Guia especializado', 'Alimentação supervisionada', 'Lanche', 'Certificado de participação'],
    exclusions: ['Transporte', 'Almoço completo'],
    maxParticipants: 12,
    isPopular: false,
    vote_count: 38
  },
  // Tour de Vinícolas
  {
    activityId: 4,
    title: 'Visita Autoguiada',
    description: 'Acesso às vinícolas para visita por conta própria',
    price: 0,
    duration: 6,
    inclusions: ['Mapas das vinícolas', 'Informações básicas', 'Acesso às propriedades'],
    exclusions: ['Degustação', 'Transporte', 'Alimentação', 'Guia'],
    maxParticipants: 25,
    isPopular: false,
    vote_count: 23
  },
  {
    activityId: 4,
    title: 'Tour Clássico',
    description: 'Visita a 2-3 vinícolas com degustação de vinhos',
    price: 150,
    duration: 8,
    inclusions: ['Transporte', 'Visita a 2-3 vinícolas', 'Degustação de vinhos', 'Guia especializado'],
    exclusions: ['Almoço', 'Compras de vinhos', 'Seguro'],
    maxParticipants: 15,
    isPopular: true,
    vote_count: 112
  },
  {
    activityId: 4,
    title: 'Experiência Premium',
    description: 'Tour privativo com almoço harmonizado e degustação especial',
    price: 300,
    duration: 8,
    inclusions: ['Transporte privativo', 'Visita a vinícolas selecionadas', 'Almoço harmonizado', 'Degustação premium', 'Guia sommelier'],
    exclusions: ['Bebidas extras', 'Compras pessoais'],
    maxParticipants: 8,
    isPopular: false,
    vote_count: 76
  },
  // Snowland
  {
    activityId: 5,
    title: 'Entrada Simples',
    description: 'Acesso ao parque de neve com atividades básicas',
    price: 180,
    duration: 3,
    inclusions: ['Entrada para o parque', 'Uso de trenó', 'Acesso à área de neve', 'Equipamentos básicos'],
    exclusions: ['Roupas térmicas', 'Aula de esqui', 'Fotos profissionais'],
    maxParticipants: 20,
    isPopular: false,
    vote_count: 56
  },
  {
    activityId: 5,
    title: 'Pacote Completo',
    description: 'Entrada com aluguel de roupas térmicas incluído',
    price: 300,
    duration: 4,
    inclusions: ['Entrada para o parque', 'Roupas térmicas', 'Todas as atividades', 'Equipamentos completos'],
    exclusions: ['Aula de esqui', 'Fotos profissionais', 'Alimentação'],
    maxParticipants: 15,
    isPopular: true,
    vote_count: 89
  },
  {
    activityId: 5,
    title: 'Experiência Premium',
    description: 'Pacote completo com aula de esqui e fotos profissionais',
    price: 450,
    duration: 4,
    inclusions: ['Entrada para o parque', 'Roupas térmicas', 'Aula de esqui', 'Fotos profissionais', 'Certificado', 'Lanche'],
    exclusions: ['Transporte', 'Almoço completo'],
    maxParticipants: 10,
    isPopular: false,
    vote_count: 47
  }
];

const sampleReviews = [
  // Mini Mundo
  {
    activityId: 1,
    userId: 1,
    rating: 5,
    comment: 'Experiência incrível! As miniaturas são muito bem feitas e detalhadas. Perfeito para toda a família.',
    visitDate: new Date('2025-01-10T14:00:00Z'),
    helpful: 12,
    photos: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=400'],
    isVerified: true
  },
  {
    activityId: 1,
    userId: 3,
    rating: 4,
    comment: 'Muito legal, especialmente para crianças. Algumas áreas poderiam ter mais manutenção.',
    visitDate: new Date('2025-01-08T16:30:00Z'),
    helpful: 8,
    photos: [],
    isVerified: false
  },
  // Dreamland
  {
    activityId: 2,
    userId: 2,
    rating: 4,
    comment: 'As figuras de cera são impressionantes! Muito realistas. O museu é bem organizado.',
    visitDate: new Date('2025-01-12T10:00:00Z'),
    helpful: 15,
    photos: ['https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=400'],
    isVerified: true
  },
  // GramadoZoo
  {
    activityId: 3,
    userId: 1,
    rating: 5,
    comment: 'Zoológico fantástico! Os animais parecem bem cuidados e há muita diversidade.',
    visitDate: new Date('2025-01-09T11:00:00Z'),
    helpful: 20,
    photos: ['https://images.unsplash.com/photo-1549366021-9f761d040a94?q=80&w=400'],
    isVerified: true
  },
  // Tour de Vinícolas
  {
    activityId: 4,
    userId: 2,
    rating: 5,
    comment: 'Tour excepcional! Os vinhos são excelentes e as paisagens são de tirar o fôlego.',
    visitDate: new Date('2025-01-11T09:00:00Z'),
    helpful: 18,
    photos: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400'],
    isVerified: true
  },
  // Snowland
  {
    activityId: 5,
    userId: 3,
    rating: 4,
    comment: 'Experiência única! Nunca havia esquiado antes e foi muito divertido.',
    visitDate: new Date('2025-01-07T13:00:00Z'),
    helpful: 11,
    photos: ['https://images.unsplash.com/photo-1551524164-6cf5ac833fb8?q=80&w=400'],
    isVerified: false
  }
];

async function addGramadoActivities() {
  console.log('🎿 Iniciando cadastro das atividades de Gramado...');
  
  try {
    // Insert activities
    const insertedActivities = [];
    for (const activity of gramadoActivities) {
      const result = await db.insert(activities).values(activity);
      
      // Get the ID of the inserted activity
      const [insertedActivity] = await db.select().from(activities).where(eq(activities.title, activity.title)).orderBy(desc(activities.id)).limit(1);
      
      insertedActivities.push({ ...activity, id: insertedActivity.id });
      console.log(`✅ Atividade "${activity.title}" cadastrada com ID: ${insertedActivity.id}`);
    }

    // Insert proposals with correct activity IDs
    let proposalIndex = 0;
    for (let i = 0; i < insertedActivities.length; i++) {
      const activityId = insertedActivities[i].id;
      
      // Each activity has 3 proposals
      for (let j = 0; j < 3; j++) {
        const proposal = {
          ...proposals[proposalIndex],
          activityId: activityId
        };
        
        await db.insert(activityBudgetProposals).values(proposal);
        console.log(`✅ Proposta "${proposal.title}" cadastrada para atividade ${activityId}`);
        proposalIndex++;
      }
    }

    // Insert reviews with correct activity IDs
    for (const review of sampleReviews) {
      const activityId = insertedActivities[review.activityId - 1].id;
      await db.insert(activityReviews).values({
        ...review,
        activityId: activityId
      });
      console.log(`✅ Avaliação cadastrada para atividade ${activityId}`);
    }

    console.log('🎉 Todas as atividades de Gramado foram cadastradas com sucesso!');
    console.log(`📊 Total: ${gramadoActivities.length} atividades, ${proposals.length} propostas, ${sampleReviews.length} avaliações`);

  } catch (error) {
    console.error('❌ Erro ao cadastrar atividades:', error);
    throw error;
  }
}

// Execute if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addGramadoActivities()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Falha na execução:', error);
      process.exit(1);
    });
}

export { addGramadoActivities };