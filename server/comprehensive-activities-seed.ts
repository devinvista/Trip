import { db } from './db.js';
import { activities, activityBudgetProposals, activityReviews } from '../shared/schema.js';

// URLs realistas de imagens para atividades (Unsplash)
const activityCovers = {
  'rio': [
    'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop', // Cristo Redentor
    'https://images.unsplash.com/photo-1516712713233-d11f7fa20395?w=800&h=600&fit=crop', // Pão de Açúcar
    'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop', // Copacabana
    'https://images.unsplash.com/photo-1544966503-7cc5ac882d5c?w=800&h=600&fit=crop', // Trilha
    'https://images.unsplash.com/photo-1516712713233-d11f7fa20395?w=800&h=600&fit=crop'  // Centro Cultural
  ],
  'sao_paulo': [
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop', // MASP
    'https://images.unsplash.com/photo-1574032326164-e3bf6f8bd52a?w=800&h=600&fit=crop', // Ibirapuera
    'https://images.unsplash.com/photo-1566139066966-de7e8f3b9095?w=800&h=600&fit=crop', // Mercado Municipal
    'https://images.unsplash.com/photo-1485737788782-2d3b7b8b00d0?w=800&h=600&fit=crop', // Beco Batman
    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=800&h=600&fit=crop'  // Rooftop
  ],
  'foz': [
    'https://images.unsplash.com/photo-1569586580648-f5152c716fde?w=800&h=600&fit=crop', // Cataratas
    'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=800&h=600&fit=crop', // Parque Aves
    'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop', // Itaipu
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=600&fit=crop', // Marco Fronteiras
    'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&h=600&fit=crop'  // Paraguai
  ],
  'salvador': [
    'https://images.unsplash.com/photo-1562788869-4ed32648eb72?w=800&h=600&fit=crop', // Pelourinho
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop', // Farol Barra
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop', // Bonfim
    'https://images.unsplash.com/photo-1592861956120-2d110307df8f?w=800&h=600&fit=crop', // Capoeira
    'https://images.unsplash.com/photo-1530841344095-38b6e6faa13d?w=800&h=600&fit=crop'  // Praia
  ],
  'florianopolis': [
    'https://images.unsplash.com/photo-1539650116574-75c0c6d0dfd0?w=800&h=600&fit=crop', // Praia Mole
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop', // Lagoa
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', // Campeche
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop', // Trilha
    'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop'  // Centro
  ]
};

export async function seedActivitiesWithBudgets() {
  console.log('🌱 Iniciando cadastro de atividades turísticas com orçamentos...');

  // Atividades do Rio de Janeiro
  const rioActivities = [
    {
      title: 'Cristo Redentor / Corcovado',
      description: 'Visite um dos símbolos mais famosos do Brasil. O Cristo Redentor oferece uma vista panorâmica de 360° da cidade do Rio de Janeiro. Localizado no topo do Corcovado, a 710m de altura, é considerado uma das Sete Maravilhas do Mundo Moderno.',
      location: 'Rio de Janeiro, RJ',
      category: 'Pontos Turísticos',
      coverImage: activityCovers.rio[0],
      averageRating: 4.8,
      totalReviews: 15420,
      isVerified: true,
      duration: '4 horas',
      groupSize: 'Até 50 pessoas',
      amenities: ['Transporte incluído', 'Guia turístico', 'Entrada incluída', 'Seguro viagem'],
      highlights: ['Vista 360° da cidade', 'Uma das 7 Maravilhas', 'Experiência única', 'Fotos inesquecíveis']
    },
    {
      title: 'Pão de Açúcar (Bondinho)',
      description: 'Passeio no famoso bondinho do Pão de Açúcar com vista espetacular da Baía de Guanabara. O percurso inclui duas estações: primeiro a Urca e depois o topo do Pão de Açúcar a 396m de altura.',
      location: 'Rio de Janeiro, RJ', 
      category: 'Pontos Turísticos',
      coverImage: activityCovers.rio[1],
      averageRating: 4.7,
      totalReviews: 12350,
      isVerified: true,
      duration: '3 horas',
      groupSize: 'Até 65 pessoas',
      amenities: ['Bondinho histórico', 'Vista panorâmica', 'Loja de souvenirs', 'Restaurante no local'],
      highlights: ['Vista da Baía de Guanabara', 'Bondinho centenário', 'Pôr do sol inesquecível', 'Patrimônio histórico']
    },
    {
      title: 'Praia de Copacabana / Ipanema + Esportes',
      description: 'Aproveite as praias mais famosas do Rio de Janeiro. Atividades incluem aulas de surf, vôlei de praia, futevôlei e passeios de bike pela orla. Desfrute da energia carioca e da beleza natural.',
      location: 'Rio de Janeiro, RJ',
      category: 'Praia e Esportes',
      coverImage: activityCovers.rio[2],
      averageRating: 4.5,
      totalReviews: 8760,
      isVerified: true,
      duration: '6 horas',
      groupSize: 'Flexível',
      amenities: ['Equipamentos incluídos', 'Instrutor qualificado', 'Água e lanche', 'Seguro esportivo'],
      highlights: ['Praias mundialmente famosas', 'Esportes aquáticos', 'Cultura carioca', 'Atividades para todos os níveis']
    },
    {
      title: 'Trilha Pedra Bonita ou Dois Irmãos',
      description: 'Trilhas com níveis moderados e vistas incríveis da cidade. A Pedra Bonita é famosa pelo voo livre, enquanto os Dois Irmãos oferece uma das vistas mais fotogênicas do Rio.',
      location: 'Rio de Janeiro, RJ',
      category: 'Aventura e Natureza',
      coverImage: activityCovers.rio[3],
      averageRating: 4.6,
      totalReviews: 6540,
      isVerified: true,
      duration: '5 horas',
      groupSize: 'Até 15 pessoas',
      amenities: ['Guia especializado', 'Equipamentos de segurança', 'Água incluída', 'Seguro aventura'],
      highlights: ['Vista panorâmica única', 'Experiência na natureza', 'Exercício ao ar livre', 'Fotos incríveis']
    },
    {
      title: 'Tour Cultural Centro (Theatro Municipal, Museu do Amanhã)',
      description: 'Explore o centro histórico do Rio com visitas ao Theatro Municipal, Museu do Amanhã, Biblioteca Nacional e outros pontos culturais importantes da cidade.',
      location: 'Rio de Janeiro, RJ',
      category: 'Cultura e História',
      coverImage: activityCovers.rio[4],
      averageRating: 4.4,
      totalReviews: 4320,
      isVerified: true,
      duration: '4 horas',
      groupSize: 'Até 25 pessoas',
      amenities: ['Guia cultural', 'Entradas incluídas', 'Transporte', 'Material informativo'],
      highlights: ['Arquitetura histórica', 'Museus renomados', 'História do Rio', 'Arte e cultura']
    }
  ];

  // Atividades de São Paulo
  const spActivities = [
    {
      title: 'MASP + Avenida Paulista',
      description: 'Visite o icônico Museu de Arte de São Paulo e explore a Avenida Paulista, coração financeiro e cultural da cidade. Conheça as obras de arte mais importantes do Brasil.',
      location: 'São Paulo, SP',
      category: 'Cultura e História',
      coverImage: activityCovers.sao_paulo[0],
      averageRating: 4.5,
      totalReviews: 9870,
      isVerified: true,
      duration: '4 horas',
      groupSize: 'Até 30 pessoas',
      amenities: ['Entrada para museus', 'Guia especializado', 'Audioguia', 'Café incluso'],
      highlights: ['Acervo de arte mundial', 'Arquitetura icônica', 'Centro cultural', 'Vista da cidade']
    },
    {
      title: 'Parque Ibirapuera + Museus (MAM, Afro Brasil)',
      description: 'Explore o maior parque urbano de São Paulo e seus museus. O complexo inclui o MAM (Museu de Arte Moderna) e o Museu Afro Brasil, além de áreas verdes para relaxar.',
      location: 'São Paulo, SP',
      category: 'Cultura e História',
      coverImage: activityCovers.sao_paulo[1],
      averageRating: 4.6,
      totalReviews: 7450,
      isVerified: true,
      duration: '5 horas',
      groupSize: 'Até 20 pessoas',
      amenities: ['Aluguel de bikes', 'Entradas museus', 'Mapa do parque', 'Lanche incluso'],
      highlights: ['Maior parque urbano', 'Arte contemporânea', 'Área verde extensa', 'Atividades familiares']
    },
    {
      title: 'Mercado Municipal + Centro Histórico',
      description: 'Descubra a gastronomia paulistana no famoso Mercadão e explore o centro histórico da cidade, incluindo o Pátio do Colégio e a Catedral da Sé.',
      location: 'São Paulo, SP',
      category: 'Gastronomia',
      coverImage: activityCovers.sao_paulo[2],
      averageRating: 4.7,
      totalReviews: 11200,
      isVerified: true,
      duration: '4 horas',
      groupSize: 'Até 25 pessoas',
      amenities: ['Degustação incluída', 'Guia gastronômico', 'Transporte', 'Voucher para compras'],
      highlights: ['Gastronomia tradicional', 'Arquitetura histórica', 'Produtos locais', 'Experiência cultural']
    },
    {
      title: 'Beco do Batman + Vila Madalena',
      description: 'Explore a arte de rua no famoso Beco do Batman e descubra a vida noturna e cultural da Vila Madalena, bairro boêmio de São Paulo.',
      location: 'São Paulo, SP',
      category: 'Arte e Cultura',
      coverImage: activityCovers.sao_paulo[3],
      averageRating: 4.3,
      totalReviews: 5680,
      isVerified: true,
      duration: '3 horas',
      groupSize: 'Até 15 pessoas',
      amenities: ['Tour com artista', 'Workshop de grafite', 'Drink incluso', 'Fotos profissionais'],
      highlights: ['Arte urbana autêntica', 'Cultura alternativa', 'Bairro boêmio', 'Experiência criativa']
    },
    {
      title: 'Noite em Rooftop / Jantar Gourmet',
      description: 'Experimente a gastronomia de São Paulo em rooftops com vista panorâmica da cidade. Desfrute de coquetéis autorais e pratos de chefs renomados.',
      location: 'São Paulo, SP',
      category: 'Gastronomia',
      coverImage: activityCovers.sao_paulo[4],
      averageRating: 4.8,
      totalReviews: 3920,
      isVerified: true,
      duration: '4 horas',
      groupSize: 'Até 12 pessoas',
      amenities: ['Menu degustação', 'Drinks incluídos', 'Vista panorâmica', 'Sommelier'],
      highlights: ['Alta gastronomia', 'Vista da cidade', 'Ambiente sofisticado', 'Experiência premium']
    }
  ];

  try {
    // Inserir atividades do Rio de Janeiro
    console.log('📍 Cadastrando atividades do Rio de Janeiro...');
    for (const activity of rioActivities) {
      const result = await db.insert(activities).values(activity);
      const activityId = result.insertId;
      console.log(`✅ Atividade criada: ${activity.title} (ID: ${activityId})`);

      // Criar propostas de orçamento para cada atividade
      await createBudgetProposals(Number(activityId), activity.title);
      
      // Criar avaliações realistas
      await createActivityReviews(Number(activityId));
    }

    // Inserir atividades de São Paulo
    console.log('📍 Cadastrando atividades de São Paulo...');
    for (const activity of spActivities) {
      const result = await db.insert(activities).values(activity);
      const activityId = result.insertId;
      console.log(`✅ Atividade criada: ${activity.title} (ID: ${activityId})`);

      // Criar propostas de orçamento para cada atividade
      await createBudgetProposals(Number(activityId), activity.title);
      
      // Criar avaliações realistas
      await createActivityReviews(Number(activityId));
    }

    console.log('🎉 Todas as atividades foram cadastradas com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao cadastrar atividades:', error);
    throw error;
  }
}

async function createBudgetProposals(activityId: number, activityTitle: string) {
  const budgetData = getBudgetDataForActivity(activityTitle);
  
  if (budgetData) {
    const proposals = [
      {
        activityId,
        title: 'Opção Econômica',
        description: budgetData.low.description,
        pricePerPerson: budgetData.low.price,
        currency: 'BRL',
        inclusions: budgetData.low.inclusions,
        exclusions: ['Alimentação', 'Bebidas', 'Compras pessoais'],
        maxParticipants: 50,
        isPopular: false,
        votes: Math.floor(Math.random() * 25) + 5
      },
      {
        activityId,
        title: 'Opção Intermediária',
        description: budgetData.medium.description,
        pricePerPerson: budgetData.medium.price,
        currency: 'BRL',
        inclusions: budgetData.medium.inclusions,
        exclusions: ['Bebidas alcoólicas', 'Compras pessoais'],
        maxParticipants: 30,
        isPopular: true,
        votes: Math.floor(Math.random() * 45) + 20
      },
      {
        activityId,
        title: 'Opção Premium',
        description: budgetData.high.description,
        pricePerPerson: budgetData.high.price,
        currency: 'BRL',
        inclusions: budgetData.high.inclusions,
        exclusions: ['Compras pessoais'],
        maxParticipants: 12,
        isPopular: false,
        votes: Math.floor(Math.random() * 20) + 8
      }
    ];

    for (const proposal of proposals) {
      await db.insert(activityBudgetProposals).values(proposal);
    }
  }
}

function getBudgetDataForActivity(title: string) {
  const budgets: Record<string, any> = {
    'Cristo Redentor / Corcovado': {
      low: { 
        price: 85, 
        description: 'Van oficial até o Cristo Redentor',
        inclusions: ['Transporte van oficial', 'Entrada para o monumento']
      },
      medium: { 
        price: 160, 
        description: 'Trem do Corcovado + entrada + guia',
        inclusions: ['Trem do Corcovado', 'Entrada para o monumento', 'Guia turístico']
      },
      high: { 
        price: 320, 
        description: 'Tour privativo com transporte executivo',
        inclusions: ['Transporte privativo', 'Guia exclusivo', 'Entrada VIP', 'Fotos profissionais']
      }
    },
    'Pão de Açúcar (Bondinho)': {
      low: { 
        price: 120, 
        description: 'Ingresso padrão para o bondinho',
        inclusions: ['Bondinho ida e volta', 'Acesso aos mirantes']
      },
      medium: { 
        price: 190, 
        description: 'Bondinho + guia turístico',
        inclusions: ['Bondinho ida e volta', 'Guia turístico', 'Mapa da região']
      },
      high: { 
        price: 350, 
        description: 'Bondinho + tour + passeio de helicóptero',
        inclusions: ['Bondinho ida e volta', 'Tour guiado', 'Voo de helicóptero 15min', 'Foto aérea']
      }
    },
    'Praia de Copacabana / Ipanema + Esportes': {
      low: { 
        price: 0, 
        description: 'Acesso livre às praias',
        inclusions: ['Acesso às praias', 'Mapa da região']
      },
      medium: { 
        price: 100, 
        description: 'Aula de surf ou aluguel de bike',
        inclusions: ['Aula de surf/bike 2h', 'Equipamentos', 'Instrutor']
      },
      high: { 
        price: 300, 
        description: 'Passeio de lancha com drinks',
        inclusions: ['Passeio de lancha 3h', 'Drinks incluídos', 'Capitão/guia', 'Snorkel']
      }
    },
    'Trilha Pedra Bonita ou Dois Irmãos': {
      low: { 
        price: 0, 
        description: 'Trilha autoguiada',
        inclusions: ['Mapa da trilha', 'Dicas de segurança']
      },
      medium: { 
        price: 100, 
        description: 'Trilha com guia local experiente',
        inclusions: ['Guia especializado', 'Equipamentos de segurança', 'Água']
      },
      high: { 
        price: 280, 
        description: 'Tour privado com transporte e fotógrafo',
        inclusions: ['Transporte ida/volta', 'Guia privado', 'Fotógrafo', 'Lanche', 'Seguro']
      }
    },
    'Tour Cultural Centro (Theatro Municipal, Museu do Amanhã)': {
      low: { 
        price: 30, 
        description: 'Entradas para os principais pontos',
        inclusions: ['Entrada Theatro Municipal', 'Entrada Museu do Amanhã']
      },
      medium: { 
        price: 90, 
        description: 'Tour guiado + transporte',
        inclusions: ['Guia cultural', 'Transporte urbano', 'Entradas incluídas', 'Material informativo']
      },
      high: { 
        price: 220, 
        description: 'Tour VIP + jantar + transporte executivo',
        inclusions: ['Guia exclusivo', 'Transporte executivo', 'Jantar em restaurante histórico', 'Acesso VIP']
      }
    },
    'MASP + Avenida Paulista': {
      low: { 
        price: 40, 
        description: 'Entrada simples para o MASP',
        inclusions: ['Entrada MASP', 'Mapa da Paulista']
      },
      medium: { 
        price: 90, 
        description: 'Visita guiada + café na região',
        inclusions: ['Entrada MASP', 'Guia especializado', 'Café em local tradicional']
      },
      high: { 
        price: 250, 
        description: 'Tour completo + almoço em rooftop',
        inclusions: ['Entrada MASP', 'Guia exclusivo', 'Almoço rooftop Paulista', 'Transporte']
      }
    },
    'Parque Ibirapuera + Museus (MAM, Afro Brasil)': {
      low: { 
        price: 0, 
        description: 'Acesso livre ao parque',
        inclusions: ['Entrada parque', 'Mapa dos museus']
      },
      medium: { 
        price: 70, 
        description: 'Aluguel de bike + ingressos museus',
        inclusions: ['Bike por 4h', 'Entrada MAM', 'Entrada Museu Afro Brasil']
      },
      high: { 
        price: 180, 
        description: 'Tour guiado completo + transporte',
        inclusions: ['Guia especializado', 'Entradas todos museus', 'Transporte', 'Lanche no parque']
      }
    },
    'Mercado Municipal + Centro Histórico': {
      low: { 
        price: 0, 
        description: 'Visita autoguiada',
        inclusions: ['Mapa do centro histórico', 'Lista de pontos turísticos']
      },
      medium: { 
        price: 90, 
        description: 'Visita guiada com degustação',
        inclusions: ['Guia gastronômico', 'Degustação no Mercadão', 'Tour centro histórico']
      },
      high: { 
        price: 240, 
        description: 'Tour gastronômico + guia + transporte',
        inclusions: ['Guia especializado', 'Degustação premium', 'Transporte executivo', 'Almoço incluso']
      }
    },
    'Beco do Batman + Vila Madalena': {
      low: { 
        price: 0, 
        description: 'Visita autoguiada',
        inclusions: ['Mapa da Vila Madalena', 'Lista dos murais']
      },
      medium: { 
        price: 70, 
        description: 'Tour com artista de rua',
        inclusions: ['Tour com artista local', 'História do grafite', 'Workshop básico']
      },
      high: { 
        price: 220, 
        description: 'Roteiro artístico + bar temático',
        inclusions: ['Tour privado', 'Workshop de grafite', 'Drink em bar temático', 'Kit de materiais']
      }
    },
    'Noite em Rooftop / Jantar Gourmet': {
      low: { 
        price: 50, 
        description: 'Entrada em bar com vista',
        inclusions: ['Entrada em rooftop', 'Welcome drink']
      },
      medium: { 
        price: 150, 
        description: 'Drink + petiscos',
        inclusions: ['2 drinks autorais', 'Tábua de petiscos', 'Vista panorâmica']
      },
      high: { 
        price: 400, 
        description: 'Jantar completo com vista panorâmica',
        inclusions: ['Menu degustação 7 pratos', 'Harmonização com vinhos', 'Vista 360°', 'Sommelier']
      }
    }
  };

  return budgets[title];
}

async function createActivityReviews(activityId: number) {
  const sampleReviews = [
    {
      activityId,
      userId: 1, // tom
      rating: 5,
      comment: 'Experiência incrível! Superou todas as expectativas. O guia foi muito atencioso e conhecedor da história local.',
      visitDate: new Date('2024-12-15'),
      isVerified: true,
      helpfulVotes: Math.floor(Math.random() * 15) + 5,
      photos: ['https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&h=300&fit=crop']
    },
    {
      activityId,
      userId: 2, // maria  
      rating: 4,
      comment: 'Muito boa a atividade, mas o tempo poderia ser um pouco maior. Vale muito a pena!',
      visitDate: new Date('2024-12-10'),
      isVerified: true,
      helpfulVotes: Math.floor(Math.random() * 12) + 3,
      photos: []
    },
    {
      activityId,
      userId: 3, // carlos
      rating: 5,
      comment: 'Perfeito! Vista sensacional e organização impecável. Recomendo para todos.',
      visitDate: new Date('2024-12-08'),
      isVerified: true,
      helpfulVotes: Math.floor(Math.random() * 18) + 7,
      photos: ['https://images.unsplash.com/photo-1516712713233-d11f7fa20395?w=400&h=300&fit=crop']
    },
    {
      activityId,
      userId: 4, // ana
      rating: 4,
      comment: 'Experiência boa, mas achei um pouco caro para o que oferece. O local é lindo!',
      visitDate: new Date('2024-12-05'),
      isVerified: false,
      helpfulVotes: Math.floor(Math.random() * 8) + 2,
      photos: []
    }
  ];

  for (const review of sampleReviews) {
    try {
      await db.insert(activityReviews).values(review);
    } catch (error) {
      // Ignora erro de duplicata (usuário já avaliou)
      console.log(`ℹ️ Avaliação já existe para usuário ${review.userId} na atividade ${activityId}`);
    }
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedActivitiesWithBudgets()
    .then(() => {
      console.log('✅ Seed de atividades concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no seed:', error);
      process.exit(1);
    });
}