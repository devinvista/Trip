import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const COMPREHENSIVE_ACTIVITIES = [
  // Rio de Janeiro, RJ
  {
    title: 'Cristo Redentor e Corcovado',
    description: 'Visita ao Cristo Redentor com trem do Corcovado e vista panorâmica da cidade.',
    location: 'Rio de Janeiro, RJ',
    category: 'pontos_turisticos',
    duration: 240,
    difficulty: 'easy',
    minParticipants: 1,
    maxParticipants: 50,
    coverImage: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b8f?w=1200&h=800&fit=crop&q=85',
    rating: 4.8
  },
  {
    title: 'Pão de Açúcar de Bondinho',
    description: 'Passeio de bondinho até o Pão de Açúcar com vista do Rio e praias.',
    location: 'Rio de Janeiro, RJ',
    category: 'pontos_turisticos',
    duration: 180,
    difficulty: 'easy',
    minParticipants: 1,
    maxParticipants: 40,
    coverImage: 'https://images.unsplash.com/photo-1518639192441-8fce0c4e2b62?w=1200&h=800&fit=crop&q=85',
    rating: 4.7
  },
  {
    title: 'Trilha na Tijuca',
    description: 'Trilha na Floresta da Tijuca até a Cachoeira do Horto.',
    location: 'Rio de Janeiro, RJ',
    category: 'hiking',
    duration: 300,
    difficulty: 'medium',
    minParticipants: 2,
    maxParticipants: 15,
    coverImage: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=800&fit=crop&q=85',
    rating: 4.6
  },

  // São Paulo, SP
  {
    title: 'Mercado Municipal e Centro Histórico',
    description: 'Tour gastronômico pelo Mercadão e pontos históricos do centro de SP.',
    location: 'São Paulo, SP',
    category: 'food_tours',
    duration: 240,
    difficulty: 'easy',
    minParticipants: 1,
    maxParticipants: 20,
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=800&fit=crop&q=85',
    rating: 4.5
  },
  {
    title: 'Museu de Arte Moderna',
    description: 'Visita ao MAM e exposições de arte contemporânea brasileira.',
    location: 'São Paulo, SP',
    category: 'cultural',
    duration: 180,
    difficulty: 'easy',
    minParticipants: 1,
    maxParticipants: 25,
    coverImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=800&fit=crop&q=85',
    rating: 4.4
  },

  // Pantanal, MT
  {
    title: 'Safari Fotográfico Pantanal',
    description: 'Safari para observação de onças, jacarés e aves do Pantanal.',
    location: 'Pantanal, MT',
    category: 'wildlife',
    duration: 480,
    difficulty: 'medium',
    minParticipants: 2,
    maxParticipants: 8,
    coverImage: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=800&fit=crop&q=85',
    rating: 4.9
  },
  {
    title: 'Pescaria no Pantanal',
    description: 'Pescaria esportiva de tucunarés e dourados com guia local.',
    location: 'Pantanal, MT',
    category: 'adventure',
    duration: 360,
    difficulty: 'medium',
    minParticipants: 2,
    maxParticipants: 10,
    coverImage: 'https://images.unsplash.com/photo-1445205039600-5bf9d3d1b338?w=1200&h=800&fit=crop&q=85',
    rating: 4.6
  },

  // Salvador, BA
  {
    title: 'Tour Pelourinho',
    description: 'Caminhada histórica pelo centro histórico de Salvador.',
    location: 'Salvador, BA',
    category: 'cultural',
    duration: 240,
    difficulty: 'easy',
    minParticipants: 1,
    maxParticipants: 20,
    coverImage: 'https://images.unsplash.com/photo-1582639590060-4d48706bb007?w=1200&h=800&fit=crop&q=85',
    rating: 4.7
  },
  {
    title: 'Aulas de Capoeira',
    description: 'Aulas de capoeira com mestres locais na praia.',
    location: 'Salvador, BA',
    category: 'cultural',
    duration: 120,
    difficulty: 'easy',
    minParticipants: 1,
    maxParticipants: 15,
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&q=85',
    rating: 4.5
  },

  // Serra da Mantiqueira, MG
  {
    title: 'Pico da Bandeira',
    description: 'Trilha ao terceiro ponto mais alto do Brasil.',
    location: 'Serra da Mantiqueira, MG',
    category: 'hiking',
    duration: 720,
    difficulty: 'hard',
    minParticipants: 2,
    maxParticipants: 10,
    coverImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=800&fit=crop&q=85',
    rating: 4.8
  },
  {
    title: 'Vale do Matutu',
    description: 'Trilha e banho de cachoeira no Vale do Matutu.',
    location: 'Serra da Mantiqueira, MG',
    category: 'nature',
    duration: 360,
    difficulty: 'medium',
    minParticipants: 2,
    maxParticipants: 12,
    coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop&q=85',
    rating: 4.7
  },

  // Maragogi, AL
  {
    title: 'Galés de Maragogi',
    description: 'Mergulho nas piscinas naturais de águas cristalinas.',
    location: 'Maragogi, AL',
    category: 'water_sports',
    duration: 360,
    difficulty: 'easy',
    minParticipants: 2,
    maxParticipants: 12,
    coverImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop&q=85',
    rating: 4.8
  },
  {
    title: 'Passeio de Catamarã',
    description: 'Passeio de catamarã pela costa com paradas para snorkel.',
    location: 'Maragogi, AL',
    category: 'water_sports',
    duration: 480,
    difficulty: 'easy',
    minParticipants: 4,
    maxParticipants: 30,
    coverImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop&q=85',
    rating: 4.6
  },

  // Ouro Preto, MG
  {
    title: 'Igreja São Francisco de Assis',
    description: 'Visita à obra-prima do barroco brasileiro de Aleijadinho.',
    location: 'Ouro Preto, MG',
    category: 'cultural',
    duration: 120,
    difficulty: 'easy',
    minParticipants: 1,
    maxParticipants: 25,
    coverImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&h=800&fit=crop&q=85',
    rating: 4.7
  },
  {
    title: 'Mina de Ouro do Chico Rei',
    description: 'Visita histórica às antigas minas de ouro.',
    location: 'Ouro Preto, MG',
    category: 'cultural',
    duration: 180,
    difficulty: 'easy',
    minParticipants: 2,
    maxParticipants: 15,
    coverImage: 'https://images.unsplash.com/photo-1578637387394-ed1f6ed2a84d?w=1200&h=800&fit=crop&q=85',
    rating: 4.5
  },

  // Manaus, AM
  {
    title: 'Encontro das Águas',
    description: 'Passeio para ver o encontro dos rios Negro e Solimões.',
    location: 'Manaus, AM',
    category: 'nature',
    duration: 240,
    difficulty: 'easy',
    minParticipants: 2,
    maxParticipants: 20,
    coverImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&h=800&fit=crop&q=85',
    rating: 4.8
  },
  {
    title: 'Teatro Amazonas',
    description: 'Visita ao histórico Teatro Amazonas e apresentação.',
    location: 'Manaus, AM',
    category: 'cultural',
    duration: 180,
    difficulty: 'easy',
    minParticipants: 1,
    maxParticipants: 100,
    coverImage: 'https://images.unsplash.com/photo-1564709586878-b88a19e1a5d1?w=1200&h=800&fit=crop&q=85',
    rating: 4.6
  },

  // Florianópolis, SC
  {
    title: 'Surf na Joaquina',
    description: 'Aulas de surf na famosa praia da Joaquina.',
    location: 'Florianópolis, SC',
    category: 'water_sports',
    duration: 180,
    difficulty: 'easy',
    minParticipants: 1,
    maxParticipants: 6,
    coverImage: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&h=800&fit=crop&q=85',
    rating: 4.5
  },
  {
    title: 'Trilha da Lagoinha do Leste',
    description: 'Trilha até uma das praias mais bonitas da ilha.',
    location: 'Florianópolis, SC',
    category: 'hiking',
    duration: 300,
    difficulty: 'medium',
    minParticipants: 2,
    maxParticipants: 10,
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=85',
    rating: 4.7
  },

  // Serra Gaúcha, RS
  {
    title: 'Tour de Vinícolas',
    description: 'Degustação em vinícolas tradicionais de Bento Gonçalves.',
    location: 'Serra Gaúcha, RS',
    category: 'food_tours',
    duration: 480,
    difficulty: 'easy',
    minParticipants: 2,
    maxParticipants: 20,
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&q=85',
    rating: 4.8
  },
  {
    title: 'Trem Maria Fumaça',
    description: 'Passeio nostálgico de trem pelas vinícolas.',
    location: 'Serra Gaúcha, RS',
    category: 'pontos_turisticos',
    duration: 360,
    difficulty: 'easy',
    minParticipants: 1,
    maxParticipants: 100,
    coverImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=800&fit=crop&q=85',
    rating: 4.6
  },

  // Lençóis Maranhenses, MA
  {
    title: 'Trekking pelas Dunas',
    description: 'Caminhada pelas dunas e lagoas dos Lençóis.',
    location: 'Lençóis Maranhenses, MA',
    category: 'hiking',
    duration: 360,
    difficulty: 'medium',
    minParticipants: 2,
    maxParticipants: 12,
    coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop&q=85',
    rating: 4.9
  },
  {
    title: 'Voo de Ultraleve',
    description: 'Sobrevoo panorâmico dos Lençóis Maranhenses.',
    location: 'Lençóis Maranhenses, MA',
    category: 'adventure',
    duration: 60,
    difficulty: 'easy',
    minParticipants: 1,
    maxParticipants: 2,
    coverImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=800&fit=crop&q=85',
    rating: 4.8
  },

  // Caruaru, PE
  {
    title: 'Festa Junina Autêntica',
    description: 'Participação nas festividades juninas tradicionais.',
    location: 'Caruaru, PE',
    category: 'cultural',
    duration: 480,
    difficulty: 'easy',
    minParticipants: 1,
    maxParticipants: 50,
    coverImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop&q=85',
    rating: 4.7
  },
  {
    title: 'Casa de Cultura Popular',
    description: 'Visita ao memorial da cultura nordestina.',
    location: 'Caruaru, PE',
    category: 'cultural',
    duration: 180,
    difficulty: 'easy',
    minParticipants: 1,
    maxParticipants: 20,
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&q=85',
    rating: 4.4
  }
];

async function seedComprehensiveActivities() {
  try {
    console.log('🌟 ADICIONANDO ATIVIDADES COMPLETAS PARA TODOS OS DESTINOS...\n');
    
    let addedCount = 0;
    
    for (const activityData of COMPREHENSIVE_ACTIVITIES) {
      try {
        // Verificar se já existe
        const existing = await db.select()
          .from(activities)
          .where(eq(activities.title, activityData.title))
          .limit(1);
        
        if (existing.length > 0) {
          console.log(`  ⚠️  "${activityData.title}" já existe`);
          continue;
        }
        
        // Inserir atividade
        const result = await db.insert(activities).values(activityData);
        const activityId = Number(result.insertId);
        
        console.log(`  ✅ "${activityData.title}" criada (${activityData.location})`);
        
        // Adicionar 3 propostas de orçamento para cada atividade
        const proposals = [
          {
            activityId,
            title: 'Econômico',
            price: Math.round(Math.random() * 50 + 30), // R$ 30-80
            inclusions: ['Guia local', 'Seguro básico'],
            exclusions: ['Transporte', 'Alimentação', 'Equipamentos'],
            description: 'Opção básica com o essencial para a atividade'
          },
          {
            activityId,
            title: 'Completo',
            price: Math.round(Math.random() * 100 + 80), // R$ 80-180
            inclusions: ['Guia especializado', 'Transporte', 'Seguro', 'Lanche', 'Equipamentos'],
            exclusions: ['Alimentação completa', 'Bebidas'],
            description: 'Experiência completa com conforto e praticidade'
          },
          {
            activityId,
            title: 'Premium',
            price: Math.round(Math.random() * 150 + 150), // R$ 150-300
            inclusions: ['Guia exclusivo', 'Transporte executivo', 'Seguro premium', 'Alimentação completa', 'Equipamentos profissionais', 'Fotos'],
            exclusions: [],
            description: 'Experiência de luxo com todos os extras incluídos'
          }
        ];
        
        for (const proposal of proposals) {
          await db.insert(activityBudgetProposals).values({
            ...proposal,
            inclusions: JSON.stringify(proposal.inclusions),
            exclusions: JSON.stringify(proposal.exclusions)
          });
        }
        
        addedCount++;
        
      } catch (error) {
        console.error(`  ❌ Erro ao adicionar "${activityData.title}":`, error);
      }
    }
    
    console.log(`\n✅ Processo concluído! ${addedCount} atividades adicionadas.`);
    
    // Verificar resultado final
    const allActivities = await db.select().from(activities);
    console.log(`\n📊 Total de atividades no banco: ${allActivities.length}`);
    
    const locationCount = {};
    allActivities.forEach(activity => {
      const loc = activity.location || 'Sem localização';
      locationCount[loc] = (locationCount[loc] || 0) + 1;
    });
    
    console.log('\n📍 ATIVIDADES POR LOCALIZAÇÃO:');
    Object.entries(locationCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([location, count]) => {
        console.log(`  ${location}: ${count} atividades`);
      });
    
  } catch (error) {
    console.error('❌ Erro durante processo:', error);
  }
  
  process.exit(0);
}

seedComprehensiveActivities();