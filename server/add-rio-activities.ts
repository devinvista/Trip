import { db } from './db.js';
import { activities, activityBudgetProposals, activityReviews, activityVotes } from '../shared/schema.js';

// Cover images URLs based on search results
const coverImages = {
  cristoRedentor: 'https://images.unsplash.com/photo-1518639192441-8fce0c1b5ac9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', // Cristo Redentor
  paoAcucar: 'https://images.unsplash.com/photo-1544474171-a4f3e7c6e7b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', // Pão de Açúcar
  copacabana: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', // Copacabana
  trilha: 'https://images.unsplash.com/photo-1606870333093-69d6c4de4f35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', // Trilha
  theatro: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' // Theatro Municipal
};

const rioActivities = [
  {
    title: 'Cristo Redentor / Corcovado',
    description: 'Visita ao icônico Cristo Redentor, uma das Novas Sete Maravilhas do Mundo. Localizado no topo do Corcovado, oferece vistas panorâmicas espetaculares da cidade do Rio de Janeiro.',
    location: 'Rio de Janeiro, RJ',
    category: 'pontos_turisticos',
    duration: 4,
    difficulty: 'easy',
    priceRange: 'medium',
    coverImage: coverImages.cristoRedentor,
    rating: 4.8,
    reviewCount: 1247,
    proposals: [
      {
        title: 'Econômico',
        description: 'Transporte de van oficial até o Cristo Redentor',
        price: 85.00,
        inclusions: ['Transporte de van oficial', 'Entrada para o Cristo Redentor'],
        exclusions: ['Alimentação', 'Guia turístico', 'Seguro viagem']
      },
      {
        title: 'Completo',
        description: 'Experiência completa com trem do Corcovado e guia especializado',
        price: 160.00,
        inclusions: ['Trem do Corcovado', 'Entrada para o Cristo Redentor', 'Guia turístico especializado', 'Seguro viagem'],
        exclusions: ['Alimentação', 'Transporte até o trem', 'Souvenirs']
      },
      {
        title: 'Premium',
        description: 'Tour privativo com transporte executivo e experiência VIP',
        price: 320.00,
        inclusions: ['Transporte executivo privado', 'Trem do Corcovado primeira classe', 'Guia turístico exclusivo', 'Seguro premium', 'Água e lanche'],
        exclusions: ['Refeições principais', 'Souvenirs', 'Gorjetas']
      }
    ],
    reviews: [
      {
        userName: 'Carlos Santos',
        rating: 5,
        comment: 'Experiência incrível! Vista espetacular do Rio. O Cristo Redentor é realmente majestoso. Recomendo muito!',
        visitDate: '2024-12-15'
      },
      {
        userName: 'Maria Silva',
        rating: 4,
        comment: 'Muito bonito, mas estava bem cheio. A vista compensa tudo. Melhor ir cedo pela manhã.',
        visitDate: '2024-12-10'
      },
      {
        userName: 'João Pereira',
        rating: 5,
        comment: 'Simplesmente mágico! Uma das experiências mais marcantes da minha vida. O pôr do sol lá em cima é inesquecível.',
        visitDate: '2024-12-08'
      }
    ]
  },
  {
    title: 'Pão de Açúcar (Bondinho)',
    description: 'Passeio no famoso bondinho do Pão de Açúcar com vistas panorâmicas da Baía de Guanabara, praias de Copacabana e Ipanema. Um dos cartões postais mais famosos do Rio.',
    location: 'Rio de Janeiro, RJ',
    category: 'pontos_turisticos',
    duration: 3,
    difficulty: 'easy',
    priceRange: 'medium',
    coverImage: coverImages.paoAcucar,
    rating: 4.7,
    reviewCount: 892,
    proposals: [
      {
        title: 'Econômico',
        description: 'Ingresso padrão para o bondinho',
        price: 120.00,
        inclusions: ['Ingresso do bondinho (ida e volta)', 'Acesso aos dois morros'],
        exclusions: ['Transporte até o local', 'Alimentação', 'Guia turístico']
      },
      {
        title: 'Completo',
        description: 'Bondinho com guia especializado',
        price: 190.00,
        inclusions: ['Ingresso do bondinho', 'Guia turístico', 'Explicações históricas', 'Dicas de fotografia'],
        exclusions: ['Transporte até o local', 'Alimentação', 'Souvenirs']
      },
      {
        title: 'Premium',
        description: 'Experiência premium com tour de helicóptero',
        price: 350.00,
        inclusions: ['Ingresso do bondinho', 'Guia especializado', 'Tour de helicóptero (15 min)', 'Transporte executivo', 'Bebidas'],
        exclusions: ['Refeições', 'Seguro adicional', 'Fotos profissionais']
      }
    ],
    reviews: [
      {
        userName: 'Ana Costa',
        rating: 5,
        comment: 'Vista incrível da cidade! O bondinho é uma experiência única. Recomendo ir no final da tarde para ver o pôr do sol.',
        visitDate: '2024-12-18'
      },
      {
        userName: 'Roberto Lima',
        rating: 4,
        comment: 'Muito legal, mas as filas são grandes. Vale a pena comprar o ingresso antecipado. A vista é espetacular!',
        visitDate: '2024-12-12'
      },
      {
        userName: 'Lucia Martins',
        rating: 5,
        comment: 'Experiência inesquecível! Consegui ver toda a cidade do alto. O bondinho é seguro e a vista é de tirar o fôlego.',
        visitDate: '2024-12-05'
      }
    ]
  },
  {
    title: 'Praia de Copacabana / Ipanema + Esportes',
    description: 'Desfrute das praias mais famosas do mundo com atividades esportivas como surf, vôlei de praia, e passeios de bike. Inclui as icônicas praias de Copacabana e Ipanema.',
    location: 'Rio de Janeiro, RJ',
    category: 'water_sports',
    duration: 6,
    difficulty: 'easy',
    priceRange: 'low',
    coverImage: coverImages.copacabana,
    rating: 4.6,
    reviewCount: 1543,
    proposals: [
      {
        title: 'Econômico',
        description: 'Acesso livre às praias',
        price: 0.00,
        inclusions: ['Acesso às praias', 'Uso de chuveiros públicos', 'Acesso às ciclovias'],
        exclusions: ['Equipamentos esportivos', 'Alimentação', 'Guarda-sol', 'Cadeiras']
      },
      {
        title: 'Completo',
        description: 'Aula de surf ou aluguel de bike',
        price: 100.00,
        inclusions: ['Aula de surf (2h) ou aluguel de bike (4h)', 'Equipamentos inclusos', 'Instrutor qualificado'],
        exclusions: ['Alimentação', 'Transporte', 'Protetor solar', 'Toalha']
      },
      {
        title: 'Premium',
        description: 'Passeio de lancha com drinks',
        price: 300.00,
        inclusions: ['Passeio de lancha (3h)', 'Drinks e petiscos', 'Equipamentos de snorkel', 'Capitão e tripulação'],
        exclusions: ['Transporte até marina', 'Refeições principais', 'Gorjetas']
      }
    ],
    reviews: [
      {
        userName: 'Pedro Oliveira',
        rating: 5,
        comment: 'Praias maravilhosas! Fiz aula de surf e foi incrível. A água estava perfeita e o instrutor muito paciente.',
        visitDate: '2024-12-20'
      },
      {
        userName: 'Camila Santos',
        rating: 4,
        comment: 'Lugar lindo, mas muito movimentado. O passeio de bike foi ótimo, dá para ver tudo com calma.',
        visitDate: '2024-12-14'
      },
      {
        userName: 'Rafael Torres',
        rating: 5,
        comment: 'O passeio de lancha foi o ponto alto da viagem! Vista incrível da cidade pelo mar. Drinks deliciosos!',
        visitDate: '2024-12-11'
      }
    ]
  },
  {
    title: 'Trilha Pedra Bonita ou Dois Irmãos',
    description: 'Trilha moderada com vistas espetaculares da cidade, praias e montanhas. Perfeita para amantes da natureza e fotografia. Opção entre Pedra Bonita e Dois Irmãos.',
    location: 'Rio de Janeiro, RJ',
    category: 'hiking',
    duration: 4,
    difficulty: 'medium',
    priceRange: 'low',
    coverImage: coverImages.trilha,
    rating: 4.5,
    reviewCount: 687,
    proposals: [
      {
        title: 'Econômico',
        description: 'Trilha autoguiada',
        price: 0.00,
        inclusions: ['Acesso à trilha', 'Mapas básicos disponíveis'],
        exclusions: ['Guia turístico', 'Transporte', 'Equipamentos', 'Seguro']
      },
      {
        title: 'Completo',
        description: 'Trilha com guia local experiente',
        price: 100.00,
        inclusions: ['Guia local experiente', 'Informações sobre flora e fauna', 'Dicas de segurança', 'Primeiros socorros'],
        exclusions: ['Transporte', 'Equipamentos pessoais', 'Alimentação', 'Seguro viagem']
      },
      {
        title: 'Premium',
        description: 'Tour privado com transporte',
        price: 280.00,
        inclusions: ['Guia privado', 'Transporte ida e volta', 'Equipamentos profissionais', 'Lanche e água', 'Seguro completo'],
        exclusions: ['Refeições principais', 'Roupas especiais', 'Gorjetas']
      }
    ],
    reviews: [
      {
        userName: 'Fernanda Lima',
        rating: 5,
        comment: 'Trilha incrível! A vista lá de cima é espetacular. Recomendo ir com guia, vale muito a pena.',
        visitDate: '2024-12-16'
      },
      {
        userName: 'Marcos Andrade',
        rating: 4,
        comment: 'Trilha moderada, mas a recompensa é fantástica. Leve água e protetor solar. Vista 360º da cidade!',
        visitDate: '2024-12-09'
      },
      {
        userName: 'Sofia Ribeiro',
        rating: 5,
        comment: 'Fiz a trilha do Dois Irmãos e foi sensacional! O nascer do sol lá em cima é imperdível.',
        visitDate: '2024-12-03'
      }
    ]
  },
  {
    title: 'Tour Cultural Centro (Theatro Municipal, Museu do Amanhã)',
    description: 'Explore o centro histórico do Rio visitando o majestoso Theatro Municipal, Museu do Amanhã, e outros pontos culturais. Mergulhe na rica história e arquitetura carioca.',
    location: 'Rio de Janeiro, RJ',
    category: 'cultural',
    duration: 5,
    difficulty: 'easy',
    priceRange: 'low',
    coverImage: coverImages.theatro,
    rating: 4.4,
    reviewCount: 523,
    proposals: [
      {
        title: 'Econômico',
        description: 'Visita básica aos pontos turísticos',
        price: 30.00,
        inclusions: ['Entrada no Theatro Municipal', 'Mapa turístico', 'Acesso a pontos externos'],
        exclusions: ['Guia turístico', 'Transporte', 'Entrada no Museu do Amanhã', 'Alimentação']
      },
      {
        title: 'Completo',
        description: 'Tour guiado com transporte',
        price: 90.00,
        inclusions: ['Guia especializado', 'Transporte entre pontos', 'Entrada Theatro Municipal', 'Entrada Museu do Amanhã', 'Material informativo'],
        exclusions: ['Alimentação', 'Souvenirs', 'Ingressos extras']
      },
      {
        title: 'Premium',
        description: 'Experiência cultural completa com jantar',
        price: 220.00,
        inclusions: ['Guia especializado', 'Transporte executivo', 'Todas as entradas', 'Jantar em restaurante histórico', 'Degustação de vinhos'],
        exclusions: ['Bebidas extras', 'Gorjetas', 'Transporte de retorno ao hotel']
      }
    ],
    reviews: [
      {
        userName: 'Helena Carvalho',
        rating: 5,
        comment: 'Tour cultural maravilhoso! O Theatro Municipal é deslumbrante e o guia conhecia toda a história. Recomendo muito!',
        visitDate: '2024-12-17'
      },
      {
        userName: 'Gustavo Silva',
        rating: 4,
        comment: 'Muito interessante conhecer a história do Rio. O Museu do Amanhã é impressionante. Vale o investimento!',
        visitDate: '2024-12-13'
      },
      {
        userName: 'Isabela Costa',
        rating: 4,
        comment: 'Centro histórico lindo! O jantar foi um diferencial. Aprendi muito sobre a cultura carioca.',
        visitDate: '2024-12-07'
      }
    ]
  }
];

async function addRioActivities() {
  console.log('🏖️ Iniciando adição das atividades do Rio de Janeiro...');
  
  try {
    for (const activityData of rioActivities) {
      console.log(`📍 Adicionando atividade: ${activityData.title}`);
      
      // Insert activity
      const [activity] = await db.insert(activities).values({
        title: activityData.title,
        description: activityData.description,
        location: activityData.location,
        category: activityData.category,
        duration: activityData.duration,
        difficulty: activityData.difficulty,
        priceRange: activityData.priceRange,
        coverImage: activityData.coverImage,
        rating: activityData.rating,
        reviewCount: activityData.reviewCount,
        isActive: true
      });
      
      console.log(`✅ Atividade criada com ID: ${activity.insertId}`);
      
      // Add budget proposals
      for (const proposal of activityData.proposals) {
        const [budgetProposal] = await db.insert(activityBudgetProposals).values({
          activityId: activity.insertId,
          title: proposal.title,
          description: proposal.description,
          price: proposal.price,
          inclusions: JSON.stringify(proposal.inclusions),
          exclusions: JSON.stringify(proposal.exclusions),
          votes: Math.floor(Math.random() * 50) + 10, // Random votes between 10-60
          isActive: true
        });
        
        console.log(`💰 Proposta "${proposal.title}" criada com ID: ${budgetProposal.insertId}`);
      }
      
      // Add reviews
      for (const review of activityData.reviews) {
        // Get a random user (1-6)
        const userId = Math.floor(Math.random() * 6) + 1;
        
        const [reviewRecord] = await db.insert(activityReviews).values({
          userId,
          activityId: activity.insertId,
          rating: review.rating,
          comment: review.comment,
          visitDate: new Date(review.visitDate),
          userName: review.userName,
          isVerified: Math.random() > 0.3, // 70% chance of being verified
          helpfulCount: Math.floor(Math.random() * 20) + 5 // Random helpful count
        });
        
        console.log(`⭐ Review de ${review.userName} criada com ID: ${reviewRecord.insertId}`);
      }
      
      console.log(`✅ Atividade "${activityData.title}" completamente configurada!\n`);
    }
    
    console.log('🎉 Todas as atividades do Rio de Janeiro foram adicionadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar atividades:', error);
  }
}

addRioActivities();