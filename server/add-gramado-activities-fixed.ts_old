#!/usr/bin/env tsx
import { db } from './db.js';
import { activities, activityBudgetProposals, activityReviews } from '../shared/schema.js';
import { eq, desc } from 'drizzle-orm';

// Atividades de Gramado compatíveis com schema MySQL
const gramadoActivities = [
  {
    title: 'Mini Mundo',
    description: 'O Mini Mundo é um parque temático único que apresenta réplicas em miniatura de monumentos e construções famosas do mundo inteiro. Com mais de 40 atrações distribuídas em 23 mil m², o parque oferece uma viagem pelo mundo em escala reduzida. As miniaturas são construídas com riqueza de detalhes e incluem sistemas de iluminação e movimento.',
    location: 'Gramado, RS',
    category: 'pontos_turisticos',
    countryType: 'nacional',
    region: 'Sul',
    city: 'Gramado',
    priceType: 'per_person',
    priceAmount: null,
    duration: '2 horas',
    difficultyLevel: 'easy',
    maxParticipants: 30,
    coverImage: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=1200&auto=format&fit=crop',
    averageRating: "4.30",
    totalRatings: 892,
    createdById: 1
  },
  {
    title: 'Dreamland Museu de Cera',
    description: 'O Dreamland Museu de Cera oferece uma experiência única com figuras de cera hiper-realistas de celebridades, personagens históricos e fictícios. O museu conta com cenários temáticos e interativos, proporcionando uma experiência imersiva e divertida para visitantes de todas as idades.',
    location: 'Gramado, RS',
    category: 'cultural',
    countryType: 'nacional',
    region: 'Sul',
    city: 'Gramado',
    priceType: 'per_person',
    priceAmount: null,
    duration: '1.5 horas',
    difficultyLevel: 'easy',
    maxParticipants: 40,
    coverImage: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200&auto=format&fit=crop',
    averageRating: "4.10",
    totalRatings: 654,
    createdById: 1
  },
  {
    title: 'GramadoZoo',
    description: 'O GramadoZoo é um zoológico moderno que abriga mais de 1.500 animais de 200 espécies diferentes, incluindo fauna nativa e exótica. Localizado em meio à natureza preservada da Serra Gaúcha, oferece uma experiência educativa e divertida com habitats naturais e programas de conservação.',
    location: 'Gramado, RS',
    category: 'nature',
    countryType: 'nacional',
    region: 'Sul',
    city: 'Gramado',
    priceType: 'per_person',
    priceAmount: null,
    duration: '3 horas',
    difficultyLevel: 'easy',
    maxParticipants: 50,
    coverImage: 'https://images.unsplash.com/photo-1549366021-9f761d040a94?q=80&w=1200&auto=format&fit=crop',
    averageRating: "4.50",
    totalRatings: 1689,
    createdById: 1
  },
  {
    title: 'Tour de Vinícolas no Vale dos Vinhedos',
    description: 'Tour pelas renomadas vinícolas da região com degustação de diferentes tipos de vinho, harmonizações gastronômicas e vistas panorâmicas dos vinhedos em meio às montanhas da Serra Gaúcha. Inclui visitas ao processo de produção e experiências culturais autênticas.',
    location: 'Gramado, RS',
    category: 'food_tours',
    countryType: 'nacional',
    region: 'Sul',
    city: 'Gramado',
    priceType: 'per_person',
    priceAmount: null,
    duration: '8 horas',
    difficultyLevel: 'easy',
    minParticipants: 2,
    maxParticipants: 25,
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop',
    averageRating: "4.80",
    totalRatings: 756,
    createdById: 1,
    requirements: ['Idade mínima: 18 anos']
  },
  {
    title: 'Snowland - Parque de Neve Indoor',
    description: 'O primeiro parque de neve indoor das Américas oferece experiência única com temperatura controlada a -5°C. Inclui atividades como esqui, snowboard, patinação no gelo e tobogã, com instrutores qualificados e equipamentos de segurança fornecidos.',
    location: 'Gramado, RS',
    category: 'adventure',
    countryType: 'nacional',
    region: 'Sul',
    city: 'Gramado',
    priceType: 'per_person',
    priceAmount: null,
    duration: '4 horas',
    difficultyLevel: 'medium',
    minParticipants: 1,
    maxParticipants: 20,
    coverImage: 'https://images.unsplash.com/photo-1551524164-6cf5ac833fb8?q=80&w=1200&auto=format&fit=crop',
    averageRating: "4.40",
    totalRatings: 1123,
    createdById: 1,
    requirements: ['Idade mínima: 8 anos', 'Roupa e equipamentos fornecidos']
  }
];

// Propostas de orçamento para cada atividade
const budgetProposals = [
  // Mini Mundo (3 propostas)
  {
    title: 'Ingresso Econômico',
    description: 'Entrada simples para explorar o Mini Mundo por conta própria',
    amount: "80.00",
    inclusions: ['Entrada para o parque', 'Mapa do local', 'Acesso a todas as miniaturas'],
    exclusions: ['Transporte', 'Alimentação', 'Guia'],
    createdBy: 1
  },
  {
    title: 'Pacote Completo',
    description: 'Entrada com transporte incluso saindo do centro de Gramado',
    amount: "120.00",
    inclusions: ['Entrada para o parque', 'Transporte ida e volta', 'Mapa do local'],
    exclusions: ['Alimentação', 'Guia especializado'],
    votes: 89,
    createdBy: 1
  },
  {
    title: 'Experiência Premium',
    description: 'Tour completo com guia especializado e almoço incluso',
    amount: "200.00",
    inclusions: ['Entrada', 'Transporte', 'Guia especializado', 'Almoço', 'Fotos'],
    exclusions: ['Bebidas alcoólicas', 'Lembranças'],
    votes: 67,
    createdBy: 1
  },
  // Dreamland (3 propostas)
  {
    title: 'Entrada Simples',
    description: 'Acesso ao museu de cera com visita autoguiada',
    amount: "65.00",
    inclusions: ['Entrada para o museu', 'Mapa do local', 'Acesso a todas as figuras'],
    exclusions: ['Atividades extras', 'Fotos profissionais', 'Guia'],
    createdBy: 1
  },
  {
    title: 'Combo Diversão',
    description: 'Museu de cera + atividade extra (mini golf ou simuladores)',
    amount: "120.00",
    inclusions: ['Entrada para o museu', 'Mini golf OU simuladores', 'Acesso completo'],
    exclusions: ['Transporte', 'Alimentação', 'Fotos profissionais'],
    votes: 78,
    createdBy: 1
  },
  {
    title: 'VIP Experience',
    description: 'Experiência completa com guia exclusivo e sessão de fotos',
    amount: "200.00",
    inclusions: ['Entrada', 'Guia exclusivo', 'Sessão de fotos', 'Todas as atividades'],
    exclusions: ['Transporte', 'Alimentação'],
    votes: 43,
    createdBy: 1
  },
  // GramadoZoo (3 propostas)
  {
    title: 'Entrada Individual',
    description: 'Acesso completo ao zoológico com visita livre',
    amount: "45.00",
    inclusions: ['Entrada para o zoológico', 'Mapa das espécies', 'Acesso a todos os habitats'],
    exclusions: ['Alimentação dos animais', 'Transporte', 'Guia'],
    createdBy: 1
  },
  {
    title: 'Experiência Família',
    description: 'Entrada + atividade de alimentação supervisionada',
    amount: "75.00",
    inclusions: ['Entrada', 'Alimentação supervisionada', 'Programa educativo'],
    exclusions: ['Transporte', 'Alimentação pessoal'],
    votes: 156,
    createdBy: 1
  },
  {
    title: 'Tour Educativo',
    description: 'Visita guiada com biólogo e programa de conservação',
    amount: "120.00",
    inclusions: ['Entrada', 'Guia biólogo', 'Programa educativo', 'Material didático'],
    exclusions: ['Transporte', 'Alimentação'],
    votes: 92,
    createdBy: 1
  },
  // Tour de Vinícolas (3 propostas)
  {
    title: 'Tour Básico',
    description: 'Visita a 2 vinícolas com degustação básica',
    amount: "180.00",
    inclusions: ['Transporte', 'Visita a 2 vinícolas', 'Degustação básica'],
    exclusions: ['Almoço', 'Degustação premium', 'Compras'],
    createdBy: 1
  },
  {
    title: 'Tour Completo',
    description: 'Visita a 3 vinícolas com almoço e degustação completa',
    amount: "280.00",
    inclusions: ['Transporte', '3 vinícolas', 'Almoço', 'Degustação completa', 'Guia'],
    exclusions: ['Compras de vinhos', 'Degustação premium'],
    votes: 234,
    createdBy: 1
  },
  {
    title: 'Experiência Premium',
    description: 'Tour exclusivo com sommelier e vinhos especiais',
    amount: "450.00",
    inclusions: ['Transporte privativo', 'Sommelier', 'Vinhos premium', 'Almoço gourmet'],
    exclusions: ['Compras adicionais'],
    votes: 87,
    createdBy: 1
  },
  // Snowland (3 propostas)
  {
    title: 'Entrada Básica',
    description: 'Acesso ao parque com equipamentos básicos',
    amount: "150.00",
    inclusions: ['Entrada', 'Roupas térmicas', 'Equipamentos básicos', '2h de permanência'],
    exclusions: ['Aulas particulares', 'Alimentação', 'Fotos'],
    createdBy: 1
  },
  {
    title: 'Pacote Aventura',
    description: 'Entrada + aula de esqui ou snowboard',
    amount: "250.00",
    inclusions: ['Entrada', 'Equipamentos', 'Aula de 1h', 'Instrutor', '3h no parque'],
    exclusions: ['Alimentação', 'Aulas adicionais'],
    votes: 178,
    createdBy: 1
  },
  {
    title: 'Experiência Completa',
    description: 'Pacote completo com todas as atividades e refeição',
    amount: "380.00",
    inclusions: ['Acesso total', 'Todas as atividades', 'Aulas', 'Refeição quente'],
    exclusions: ['Bebidas alcoólicas'],
    votes: 145,
    createdBy: 1
  }
];

async function addGramadoActivitiesFixed() {
  console.log('🎿 Iniciando cadastro das atividades de Gramado (versão corrigida)...');
  
  try {
    const insertedActivities = [];
    
    // Inserir atividades uma por uma
    for (const activity of gramadoActivities) {
      const [result] = await db.insert(activities).values(activity);
      console.log(`✅ Atividade "${activity.title}" cadastrada com sucesso`);
      
      // Buscar ID da atividade inserida
      const [insertedActivity] = await db.select().from(activities)
        .where(eq(activities.title, activity.title))
        .orderBy(desc(activities.id))
        .limit(1);
      
      insertedActivities.push(insertedActivity);
    }

    // Inserir propostas de orçamento
    let proposalIndex = 0;
    for (let i = 0; i < insertedActivities.length; i++) {
      const activity = insertedActivities[i];
      
      // Cada atividade tem 3 propostas
      for (let j = 0; j < 3; j++) {
        const proposal = {
          ...budgetProposals[proposalIndex],
          activityId: activity.id
        };
        
        await db.insert(activityBudgetProposals).values(proposal);
        console.log(`💰 Proposta "${proposal.title}" criada para ${activity.title}`);
        proposalIndex++;
      }
    }

    console.log('🎉 Todas as atividades de Gramado foram adicionadas com sucesso!');
    console.log(`📊 Total: ${insertedActivities.length} atividades, ${budgetProposals.length} propostas`);

  } catch (error) {
    console.error('❌ Erro ao cadastrar atividades:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addGramadoActivitiesFixed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Falha na execução:', error);
      process.exit(1);
    });
}

export { addGramadoActivitiesFixed };