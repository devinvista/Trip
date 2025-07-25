import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

// Atividades para todos os destinos das viagens
const DESTINATION_ACTIVITIES = {
  'Pantanal, MT': [
    {
      title: 'Safari Fotográfico no Pantanal',
      description: 'Experiência única de observação da vida selvagem pantaneira com guide especializado.',
      location: 'Pantanal, MT',
      category: 'wildlife',
      duration: "480 horas",
      difficulty: 'medium',
      minParticipants: 2,
      maxParticipants: 8,
      coverImage: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=800&fit=crop&q=85',
      rating: 4.8
    }
  ],
  'Salvador, BA': [
    {
      title: 'Tour Cultural Pelourinho',
      description: 'Caminhada histórica pelo centro histórico de Salvador com degustação de acarajé.',
      location: 'Salvador, BA',
      category: 'cultural',
      duration: "240 horas",
      difficulty: 'easy',
      minParticipants: 1,
      maxParticipants: 15,
      coverImage: 'https://images.unsplash.com/photo-1582639590060-4d48706bb007?w=1200&h=800&fit=crop&q=85',
      rating: 4.7
    }
  ],
  'Serra da Mantiqueira, MG': [
    {
      title: 'Trilha do Pico da Bandeira',
      description: 'Aventura de trekking ao terceiro ponto mais alto do Brasil.',
      location: 'Serra da Mantiqueira, MG',
      category: 'hiking',
      duration: "720 horas",
      difficulty: 'hard',
      minParticipants: 2,
      maxParticipants: 10,
      coverImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=800&fit=crop&q=85',
      rating: 4.9
    }
  ],
  'Maragogi, AL': [
    {
      title: 'Mergulho nas Galés de Maragogi',
      description: 'Mergulho com snorkel nas piscinas naturais mais famosas do Brasil.',
      location: 'Maragogi, AL',
      category: 'water_sports',
      duration: "360 horas",
      difficulty: 'easy',
      minParticipants: 2,
      maxParticipants: 12,
      coverImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop&q=85',
      rating: 4.8
    }
  ],
  'Ouro Preto, MG': [
    {
      title: 'Tour pelas Igrejas Históricas',
      description: 'Visita guiada às principais igrejas barrocas de Ouro Preto.',
      location: 'Ouro Preto, MG',
      category: 'cultural',
      duration: "300 horas",
      difficulty: 'easy',
      minParticipants: 1,
      maxParticipants: 20,
      coverImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&h=800&fit=crop&q=85',
      rating: 4.6
    }
  ],
  'Manaus, AM': [
    {
      title: 'Expedição Rio Amazonas',
      description: 'Navegação pelo Rio Amazonas com pernoite em lodge na floresta.',
      location: 'Manaus, AM',
      category: 'nature',
      duration: "1440 horas",
      difficulty: 'medium',
      minParticipants: 2,
      maxParticipants: 16,
      coverImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&h=800&fit=crop&q=85',
      rating: 4.9
    }
  ],
  'Florianópolis, SC': [
    {
      title: 'Aulas de Surf na Joaquina',
      description: 'Aulas de surf para iniciantes na famosa praia da Joaquina.',
      location: 'Florianópolis, SC',
      category: 'water_sports',
      duration: "180 horas",
      difficulty: 'easy',
      minParticipants: 1,
      maxParticipants: 6,
      coverImage: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&h=800&fit=crop&q=85',
      rating: 4.5
    }
  ],
  'Serra Gaúcha, RS': [
    {
      title: 'Tour de Vinícolas',
      description: 'Degustação de vinhos em vinícolas tradicionais da região.',
      location: 'Serra Gaúcha, RS',
      category: 'food_tours',
      duration: "480 horas",
      difficulty: 'easy',
      minParticipants: 2,
      maxParticipants: 20,
      coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&q=85',
      rating: 4.7
    }
  ],
  'Lençóis Maranhenses, MA': [
    {
      title: 'Trekking pelas Dunas',
      description: 'Caminhada pelas dunas e lagoas dos Lençóis Maranhenses.',
      location: 'Lençóis Maranhenses, MA',
      category: 'hiking',
      duration: "360 horas",
      difficulty: 'medium',
      minParticipants: 2,
      maxParticipants: 12,
      coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop&q=85',
      rating: 4.8
    }
  ],
  'Caruaru, PE': [
    {
      title: 'Festival de São João',
      description: 'Participação nas festividades juninas tradicionais de Caruaru.',
      location: 'Caruaru, PE',
      category: 'cultural',
      duration: "480 horas",
      difficulty: 'easy',
      minParticipants: 1,
      maxParticipants: 50,
      coverImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop&q=85',
      rating: 4.6
    }
  ]
};

async function addActivitiesForAllDestinations() {
  try {
    console.log('🌟 ADICIONANDO ATIVIDADES PARA TODOS OS DESTINOS...\n');
    
    let totalAdded = 0;
    
    for (const [destination, destinationActivities] of Object.entries(DESTINATION_ACTIVITIES)) {
      console.log(`📍 Adicionando atividades para ${destination}:`);
      
      for (const activityData of destinationActivities) {
        try {
          // Verificar se a atividade já existe
          const existing = await db.select()
            .from(activities)
            .where(eq(activities.title, activityData.title))
            .limit(1);
          
          if (existing.length > 0) {
            console.log(`  ⚠️  Atividade "${activityData.title}" já existe`);
            continue;
          }
          
          // Inserir atividade
          const result = await db.insert(activities).values(activityData);
          const activityId = result.insertId;
          
          console.log(`  ✅ Atividade "${activityData.title}" criada (ID: ${activityId})`);
          
          // Adicionar propostas de orçamento
          const proposals = [
            {
              activityId: Number(activityId),
              title: 'Econômico',
              price: 80,
              inclusions: ['Guia local', 'Seguro'],
              exclusions: ['Transporte', 'Alimentação'],
              description: 'Opção básica com o essencial'
            },
            {
              activityId: Number(activityId),
              title: 'Completo',
              price: 150,
              inclusions: ['Guia especializado', 'Transporte', 'Seguro', 'Lanche'],
              exclusions: ['Alimentação completa'],
              description: 'Experiência completa com conforto'
            },
            {
              activityId: Number(activityId),
              title: 'Premium',
              price: 250,
              inclusions: ['Guia especializado', 'Transporte executivo', 'Seguro', 'Alimentação completa', 'Fotos profissionais'],
              exclusions: [],
              description: 'Experiência de luxo com todos os extras'
            }
          ];
          
          for (const proposal of proposals) {
            await db.insert(activityBudgetProposals).values({
              ...proposal,
              inclusions: JSON.stringify(proposal.inclusions),
              exclusions: JSON.stringify(proposal.exclusions)
            });
          }
          
          console.log(`    💰 3 propostas de orçamento adicionadas`);
          totalAdded++;
          
        } catch (error) {
          console.error(`  ❌ Erro ao adicionar "${activityData.title}":`, error);
        }
      }
    }
    
    console.log(`\n✅ Processo concluído! ${totalAdded} novas atividades adicionadas.`);
    
    // Verificar resultado final
    console.log('\n🔍 VERIFICANDO CORRESPONDÊNCIAS FINAIS...');
    
    const allActivities = await db.select().from(activities);
    const activityLocations = [...new Set(allActivities.map(a => a.location))].filter(Boolean);
    
    console.log('\n🏛️ LOCALIZAÇÕES DAS ATIVIDADES (após adição):');
    activityLocations.forEach(loc => {
      const count = allActivities.filter(a => a.location === loc).length;
      console.log(`  - "${loc}" (${count} atividades)`);
    });
    
    // Verificar quais destinos ainda precisam de atividades
    const tripsResult = await db.execute(`
      SELECT DISTINCT destination 
      FROM trips 
      WHERE destination IS NOT NULL 
        AND destination != 'undefined' 
        AND destination != ''
    `);
    
    const tripDestinations = (tripsResult as any).map(row => row.destination).filter(Boolean);
    
    console.log('\n📍 DESTINOS DAS VIAGENS:');
    tripDestinations.forEach(dest => console.log(`  - "${dest}"`));
    
    const matched = activityLocations.filter(loc => tripDestinations.includes(loc));
    const missingActivities = tripDestinations.filter(dest => !activityLocations.includes(dest));
    
    console.log(`\n✅ Destinos com atividades: ${matched.length}`);
    matched.forEach(loc => console.log(`  ✓ "${loc}"`));
    
    console.log(`\n🚨 Destinos ainda sem atividades: ${missingActivities.length}`);
    missingActivities.forEach(dest => console.log(`  ⚠️ "${dest}"`));
    
  } catch (error) {
    console.error('❌ Erro durante processo:', error);
  }
  
  process.exit(0);
}

addActivitiesForAllDestinations();