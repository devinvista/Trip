#!/usr/bin/env tsx
import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';

/**
 * Script para criar atividades abrangentes para todos os destinos
 * Compatível com esquema MySQL atual
 */
async function createComprehensiveActivities() {
  console.log('🏛️ Criando atividades abrangentes no banco MySQL...');

  try {
    const comprehensiveActivities = [
      // Rio de Janeiro
      {
        title: 'Christ the Redeemer & Corcovado Train',
        description: 'Visit one of the New Seven Wonders of the World! Christ the Redeemer is Rio\'s most famous symbol. Includes transport via the historic Corcovado Train through Tijuca Forest.',
        destinationName: 'Rio de Janeiro',
        category: 'pontos_turisticos' as const,
        difficultyLevel: 'easy' as const,
        duration: '3 horas',
        minParticipants: 1,
        maxParticipants: 25,
        languages: ['Português', 'Inglês', 'Espanhol'],
        inclusions: ['Train transport', 'Licensed guide', 'Access to viewpoints', 'Insurance'],
        exclusions: ['Meals', 'Drinks', 'Personal purchases'],
        requirements: ['Wear comfortable shoes', 'Bring sunscreen', 'Photo ID required'],
        cancellationPolicy: 'Free cancellation up to 24h before',
        contactInfo: { phone: '(21) 2558-1329', website: 'https://www.tremdocorcovado.rio' },
        coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop'],
        averageRating: '4.75',
        totalRatings: 1247,
        isActive: true,
        createdById: 1,
        city: 'Rio de Janeiro',
        state: 'RJ',
        country: 'Brasil',
        countryType: 'nacional' as const,
        region: 'Sudeste',
        continent: 'América do Sul'
      },
      {
        title: 'Sugarloaf Mountain Cable Car',
        description: 'Ascend the famous Sugarloaf Mountain on the original cable car! The two-stage journey offers spectacular views of the city, Copacabana and Ipanema beaches.',
        destinationName: 'Rio de Janeiro',
        category: 'pontos_turisticos' as const,
        difficultyLevel: 'easy' as const,
        duration: '2 horas',
        minParticipants: 1,
        maxParticipants: 40,
        languages: ['Português', 'Inglês', 'Espanhol'],
        inclusions: ['Round-trip cable car', 'Access to viewpoints', 'Insurance'],
        exclusions: ['Meals', 'Drinks', 'Parking'],
        requirements: ['Not recommended for people with fear of heights'],
        cancellationPolicy: 'Free cancellation up to 24h before',
        contactInfo: { phone: '(21) 2546-8400', website: 'https://www.bondinho.com.br' },
        coverImage: 'https://images.unsplash.com/photo-1576992021885-42b8ec06d6b0?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1576992021885-42b8ec06d6b0?q=80&w=1200&auto=format&fit=crop'],
        averageRating: '4.60',
        totalRatings: 987,
        isActive: true,
        createdById: 1,
        city: 'Rio de Janeiro',
        state: 'RJ',
        country: 'Brasil',
        countryType: 'nacional' as const,
        region: 'Sudeste',
        continent: 'América do Sul'
      },

      // São Paulo
      {
        title: 'MASP + Paulista Avenue Cultural Tour',
        description: 'Explore São Paulo\'s cultural heart! Visit the iconic MASP museum and walk down the famous Paulista Avenue, experiencing the city\'s vibrant art and culture scene.',
        destinationName: 'São Paulo',
        category: 'cultural' as const,
        difficultyLevel: 'easy' as const,
        duration: '3 horas',
        minParticipants: 1,
        maxParticipants: 20,
        languages: ['Português', 'Inglês'],
        inclusions: ['MASP entrance', 'Art specialist guide', 'Paulista Avenue tour', 'Educational material'],
        exclusions: ['Transport', 'Meals'],
        requirements: ['Wear comfortable shoes'],
        cancellationPolicy: 'Free cancellation up to 24h before',
        contactInfo: { phone: '(11) 3251-5644', website: 'https://masp.org.br' },
        coverImage: 'https://images.unsplash.com/photo-1541696432-82e5c34e29c8?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1541696432-82e5c34e29c8?q=80&w=1200&auto=format&fit=crop'],
        averageRating: '4.40',
        totalRatings: 623,
        isActive: true,
        createdById: 1,
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        countryType: 'nacional' as const,
        region: 'Sudeste',
        continent: 'América do Sul'
      },

      // Salvador
      {
        title: 'Pelourinho Historic Center',
        description: 'UNESCO World Heritage Site, Salvador\'s historic center preserves colonial architecture and Afro-Brazilian culture. Explore cobblestone streets and baroque churches.',
        destinationName: 'Salvador',
        category: 'cultural' as const,
        difficultyLevel: 'easy' as const,
        duration: '3 horas',
        minParticipants: 1,
        maxParticipants: 20,
        languages: ['Português'],
        inclusions: ['Guided tour', 'Entry to main churches', 'Informative material'],
        exclusions: ['Meals', 'Drinks', 'Shopping'],
        requirements: ['Wear comfortable shoes', 'Respect religious sites'],
        cancellationPolicy: 'Free cancellation up to 24h before',
        contactInfo: { phone: '(71) 3116-6600', website: 'https://www.salvador.ba.gov.br' },
        coverImage: 'https://images.unsplash.com/photo-1516306580618-7c189afc33b6?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1516306580618-7c189afc33b6?q=80&w=1200&auto=format&fit=crop'],
        averageRating: '4.40',
        totalRatings: 756,
        isActive: true,
        createdById: 1,
        city: 'Salvador',
        state: 'BA',
        country: 'Brasil',
        countryType: 'nacional' as const,
        region: 'Nordeste',
        continent: 'América do Sul'
      },

      // Gramado
      {
        title: 'Mini Mundo Theme Park',
        description: 'Unique theme park featuring miniature replicas of famous world monuments. Over 40 attractions across 23,000 m² with incredible detail and lighting systems.',
        destinationName: 'Gramado',
        category: 'pontos_turisticos' as const,
        difficultyLevel: 'easy' as const,
        duration: '2 horas',
        minParticipants: 1,
        maxParticipants: 30,
        languages: ['Português'],
        inclusions: ['Park entrance', 'Access to all attractions', 'Guide map'],
        exclusions: ['Meals', 'Drinks', 'Parking'],
        requirements: ['Suitable for all ages'],
        cancellationPolicy: 'Free cancellation up to 24h before',
        contactInfo: { phone: '(54) 3286-4055', website: 'https://www.minimundo.com.br' },
        coverImage: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=1200&auto=format&fit=crop'],
        averageRating: '4.30',
        totalRatings: 892,
        isActive: true,
        createdById: 1,
        city: 'Gramado',
        state: 'RS',
        country: 'Brasil',
        countryType: 'nacional' as const,
        region: 'Sul',
        continent: 'América do Sul'
      },

      // Foz do Iguaçu
      {
        title: 'Iguazu Falls - Brazilian Side',
        description: 'One of the world\'s largest waterfalls with breathtaking panoramic views. UNESCO World Heritage Site with ecological trails and stunning natural beauty.',
        destinationName: 'Foz do Iguaçu',
        category: 'nature' as const,
        difficultyLevel: 'easy' as const,
        duration: '4 horas',
        minParticipants: 1,
        maxParticipants: 50,
        languages: ['Português', 'Inglês', 'Espanhol'],
        inclusions: ['National Park entrance', 'Panoramic trail', 'Internal bus', 'Park map'],
        exclusions: ['Transport to park', 'Meals', 'Extra activities'],
        requirements: ['Wear non-slip shoes', 'Bring raincoat'],
        cancellationPolicy: 'Free cancellation up to 48h before',
        contactInfo: { phone: '(45) 3521-4400', website: 'https://www.cataratasdoiguacu.com.br' },
        coverImage: 'https://images.unsplash.com/photo-1544550285-f813152fb2fd?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1544550285-f813152fb2fd?q=80&w=1200&auto=format&fit=crop'],
        averageRating: '4.85',
        totalRatings: 2156,
        isActive: true,
        createdById: 1,
        city: 'Foz do Iguaçu',
        state: 'PR',
        country: 'Brasil',
        countryType: 'nacional' as const,
        region: 'Sul',
        continent: 'América do Sul'
      },

      // Bonito
      {
        title: 'Blue Lake Cave (Gruta do Lago Azul)',
        description: 'Incredible underground cave with a crystal-clear blue lake. One of Bonito\'s most famous attractions with stunning geological formations and unique lighting.',
        destinationName: 'Bonito',
        category: 'nature' as const,
        difficultyLevel: 'medium' as const,
        duration: '2 horas',
        minParticipants: 1,
        maxParticipants: 20,
        languages: ['Português', 'Inglês'],
        inclusions: ['Cave entrance', 'Specialized guide', 'Safety equipment', 'Insurance'],
        exclusions: ['Transport', 'Meals', 'Photography service'],
        requirements: ['Good physical condition', 'Minimum age 5 years', 'Wear comfortable shoes'],
        cancellationPolicy: 'Free cancellation up to 24h before',
        contactInfo: { phone: '(67) 3255-1200', website: 'https://www.bonito-ms.com.br' },
        coverImage: 'https://images.unsplash.com/photo-1544946503-7ad5ac882d5d?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1544946503-7ad5ac882d5d?q=80&w=1200&auto=format&fit=crop'],
        averageRating: '4.70',
        totalRatings: 1089,
        isActive: true,
        createdById: 1,
        city: 'Bonito',
        state: 'MS',
        country: 'Brasil',
        countryType: 'nacional' as const,
        region: 'Centro-Oeste',
        continent: 'América do Sul'
      },

      // Paris
      {
        title: 'Louvre Museum & Mona Lisa',
        description: 'Visit the world\'s largest art museum and see the famous Mona Lisa. Explore masterpieces from ancient civilizations to 19th century art in this iconic palace.',
        destinationName: 'Paris',
        category: 'cultural' as const,
        difficultyLevel: 'easy' as const,
        duration: '3 horas',
        minParticipants: 1,
        maxParticipants: 25,
        languages: ['Francês', 'Inglês', 'Espanhol'],
        inclusions: ['Museum entrance', 'Audio guide', 'Priority access', 'Map'],
        exclusions: ['Transport', 'Meals', 'Souvenir photos'],
        requirements: ['Book in advance', 'Photo ID required'],
        cancellationPolicy: 'Free cancellation up to 24h before',
        contactInfo: { phone: '+33 1 40 20 50 50', website: 'https://www.louvre.fr' },
        coverImage: 'https://images.unsplash.com/photo-1566139430691-e58d0b1bb7ef?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1566139430691-e58d0b1bb7ef?q=80&w=1200&auto=format&fit=crop'],
        averageRating: '4.60',
        totalRatings: 15647,
        isActive: true,
        createdById: 1,
        city: 'Paris',
        state: 'Île-de-France',
        country: 'França',
        countryType: 'internacional' as const,
        region: 'Europa Ocidental',
        continent: 'Europa'
      },

      // Nova York
      {
        title: 'Central Park & Strawberry Fields',
        description: 'Explore NYC\'s green oasis! Walk through Central Park\'s most famous areas including Strawberry Fields (John Lennon Memorial), Bethesda Fountain, and Bow Bridge.',
        destinationName: 'Nova York',
        category: 'nature' as const,
        difficultyLevel: 'easy' as const,
        duration: '2.5 horas',
        minParticipants: 1,
        maxParticipants: 20,
        languages: ['Inglês', 'Espanhol'],
        inclusions: ['Guided walking tour', 'Park map', 'Photo opportunities'],
        exclusions: ['Transport', 'Meals', 'Museum entries'],
        requirements: ['Wear comfortable walking shoes', 'Dress for weather'],
        cancellationPolicy: 'Free cancellation up to 24h before',
        contactInfo: { phone: '+1 212 310-6600', website: 'https://www.centralparknyc.org' },
        coverImage: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1522083165195-3424ed129620?q=80&w=1200&auto=format&fit=crop'],
        averageRating: '4.45',
        totalRatings: 8934,
        isActive: true,
        createdById: 1,
        city: 'Nova York',
        state: 'NY',
        country: 'Estados Unidos',
        countryType: 'internacional' as const,
        region: 'Costa Leste',
        continent: 'América do Norte'
      },

      // Londres
      {
        title: 'London Eye & Thames River',
        description: 'Experience spectacular panoramic views of London from 135 meters high! The London Eye is Europe\'s tallest observation wheel with 360-degree city views.',
        destinationName: 'Londres',
        category: 'pontos_turisticos' as const,
        difficultyLevel: 'easy' as const,
        duration: '1 hora',
        minParticipants: 1,
        maxParticipants: 25,
        languages: ['Inglês', 'Espanhol', 'Francês', 'Alemão', 'Português'],
        inclusions: ['London Eye entrance', 'Complete 30-min rotation', 'Panoramic views', 'Digital audio guide'],
        exclusions: ['Transport', 'Meals', 'Photography', 'Souvenirs', 'Champagne'],
        requirements: ['Arrive 15 min early', 'Children under 16 with adult', 'Not recommended for claustrophobia'],
        cancellationPolicy: 'Free cancellation up to 24h before visit',
        contactInfo: { phone: '+44 871 781 3000', website: 'https://www.londoneye.com' },
        coverImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop'],
        averageRating: '4.35',
        totalRatings: 12456,
        isActive: true,
        createdById: 1,
        city: 'Londres',
        state: 'Inglaterra',
        country: 'Reino Unido',
        countryType: 'internacional' as const,
        region: 'Europa Ocidental',
        continent: 'Europa'
      },

      // Roma
      {
        title: 'Colosseum & Roman Forum',
        description: 'Step into ancient Rome! Explore the iconic Colosseum where gladiators fought, then walk through the Roman Forum to see the heart of the ancient empire.',
        destinationName: 'Roma',
        category: 'cultural' as const,
        difficultyLevel: 'medium' as const,
        duration: '3 horas',
        minParticipants: 1,
        maxParticipants: 25,
        languages: ['Italiano', 'Inglês', 'Espanhol', 'Francês'],
        inclusions: ['Colosseum entrance', 'Roman Forum access', 'Audio guide', 'Skip-the-line tickets'],
        exclusions: ['Transport', 'Meals', 'Underground levels', 'Arena floor'],
        requirements: ['Comfortable walking shoes', 'Photo ID required', 'Security check'],
        cancellationPolicy: 'Free cancellation up to 24h before',
        contactInfo: { phone: '+39 06 3996 7700', website: 'https://www.coopculture.it' },
        coverImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1200&auto=format&fit=crop'],
        averageRating: '4.65',
        totalRatings: 18923,
        isActive: true,
        createdById: 1,
        city: 'Roma',
        state: 'Lazio',
        country: 'Itália',
        countryType: 'internacional' as const,
        region: 'Europa Meridional',
        continent: 'Europa'
      },

      // Buenos Aires
      {
        title: 'Tango Show in San Telmo',
        description: 'Experience authentic Argentine tango in the historic San Telmo neighborhood. Professional dancers perform passionate tango while you enjoy traditional dinner.',
        destinationName: 'Buenos Aires',
        category: 'cultural' as const,
        difficultyLevel: 'easy' as const,
        duration: '3 horas',
        minParticipants: 2,
        maxParticipants: 40,
        languages: ['Espanhol', 'Inglês'],
        inclusions: ['Tango show', 'Traditional dinner', 'Welcome drink', 'Live orchestra'],
        exclusions: ['Transport', 'Additional drinks', 'Tipping', 'Souvenirs'],
        requirements: ['Smart casual dress code', 'Advance reservation required'],
        cancellationPolicy: 'Free cancellation up to 48h before',
        contactInfo: { phone: '+54 11 4307-6696', website: 'https://www.tangoporteno.com.ar' },
        coverImage: 'https://images.unsplash.com/photo-1574476664959-b4e33efcf75e?q=80&w=1200&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1574476664959-b4e33efcf75e?q=80&w=1200&auto=format&fit=crop'],
        averageRating: '4.55',
        totalRatings: 3467,
        isActive: true,
        createdById: 1,
        city: 'Buenos Aires',
        state: 'Buenos Aires',
        country: 'Argentina',
        countryType: 'internacional' as const,
        region: 'América do Sul',
        continent: 'América do Sul'
      }
    ];

    console.log(`📥 Inserindo ${comprehensiveActivities.length} atividades abrangentes...`);
    
    const insertedActivities = [];
    for (const activity of comprehensiveActivities) {
      try {
        const [result] = await db.insert(activities).values(activity);
        insertedActivities.push({ ...activity, id: result.insertId });
        console.log(`✅ ${activity.title} - ID: ${result.insertId}`);
      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  ${activity.title} já existe - ignorando`);
        } else {
          console.error(`❌ Erro ao inserir ${activity.title}:`, error.message);
        }
      }
    }

    console.log(`✅ ${insertedActivities.length} atividades inseridas com sucesso!`);

    // Criar propostas de orçamento para cada atividade
    console.log('💰 Criando propostas de orçamento...');
    
    const budgetProposals = [];
    for (const activity of insertedActivities) {
      // Definir preços baseados no destino e categoria
      let basePrice = 80;
      if (activity.countryType === 'internacional') {
        basePrice = activity.country === 'Estados Unidos' ? 120 : 
                   activity.country === 'França' ? 100 :
                   activity.country === 'Reino Unido' ? 110 :
                   activity.country === 'Itália' ? 95 : 85;
      } else {
        basePrice = activity.category === 'nature' ? 90 :
                   activity.category === 'cultural' ? 70 :
                   activity.category === 'pontos_turisticos' ? 85 : 75;
      }
      
      const proposals = [
        {
          activityId: activity.id,
          createdBy: 1,
          title: 'Econômico',
          description: 'Opção básica com experiência autêntica e tudo que você precisa',
          priceType: 'per_person',
          amount: basePrice.toString(),
          currency: activity.countryType === 'internacional' ? 
            (activity.country === 'Estados Unidos' ? 'USD' :
             activity.country === 'França' ? 'EUR' :
             activity.country === 'Reino Unido' ? 'GBP' :
             activity.country === 'Itália' ? 'EUR' :
             activity.country === 'Argentina' ? 'USD' : 'BRL') : 'BRL',
          inclusions: ['Atividade principal', 'Guia básico', 'Seguro obrigatório'],
          exclusions: ['Alimentação', 'Bebidas', 'Transporte'],
          isActive: true,
          votes: Math.floor(Math.random() * 50) + 10
        },
        {
          activityId: activity.id,
          createdBy: 1,
          title: 'Completo',
          description: 'Experiência completa com guia especializado e serviços extras',
          priceType: 'per_person',
          amount: Math.floor(basePrice * 1.8).toString(),
          currency: activity.countryType === 'internacional' ? 
            (activity.country === 'Estados Unidos' ? 'USD' :
             activity.country === 'França' ? 'EUR' :
             activity.country === 'Reino Unido' ? 'GBP' :
             activity.country === 'Itália' ? 'EUR' :
             activity.country === 'Argentina' ? 'USD' : 'BRL') : 'BRL',
          inclusions: ['Tudo do econômico', 'Guia especializado', 'Material educativo', 'Lanche incluído', 'Fotos digitais'],
          exclusions: ['Bebidas alcoólicas', 'Compras pessoais', 'Gorjetas'],
          isActive: true,
          votes: Math.floor(Math.random() * 35) + 5
        },
        {
          activityId: activity.id,
          createdBy: 1,
          title: 'Premium',
          description: 'Experiência exclusiva e luxuosa com serviço VIP personalizado',
          priceType: 'per_person',
          amount: Math.floor(basePrice * 3.2).toString(),
          currency: activity.countryType === 'internacional' ? 
            (activity.country === 'Estados Unidos' ? 'USD' :
             activity.country === 'França' ? 'EUR' :
             activity.country === 'Reino Unido' ? 'GBP' :
             activity.country === 'Itália' ? 'EUR' :
             activity.country === 'Argentina' ? 'USD' : 'BRL') : 'BRL',
          inclusions: ['Tudo do completo', 'Guia privativo', 'Transporte executivo', 'Refeição gourmet', 'Sessão fotográfica profissional'],
          exclusions: ['Compras pessoais', 'Bebidas premium extras'],
          isActive: true,
          votes: Math.floor(Math.random() * 25) + 2
        }
      ];
      
      for (const proposal of proposals) {
        await db.insert(activityBudgetProposals).values(proposal);
        budgetProposals.push(proposal);
      }
      
      console.log(`💰 3 propostas criadas para ${activity.title}`);
    }

    // Verificar resultados finais
    const totalActivities = await db.select().from(activities);
    const totalProposals = await db.select().from(activityBudgetProposals);
    
    console.log('\n📊 RESUMO DA CRIAÇÃO:');
    console.log(`   🏛️  Atividades inseridas: ${insertedActivities.length}`);
    console.log(`   🏛️  Atividades totais: ${totalActivities.length}`);
    console.log(`   💰 Propostas criadas: ${budgetProposals.length}`);
    console.log(`   💰 Propostas totais: ${totalProposals.length}`);
    console.log('\n🎉 Criação de atividades abrangentes concluída!');

    return {
      activities: insertedActivities.length,
      proposals: budgetProposals.length
    };

  } catch (error) {
    console.error('❌ Erro durante a criação:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createComprehensiveActivities()
    .then((result) => {
      console.log(`✅ Processo concluído! ${result.activities} atividades e ${result.proposals} propostas criadas.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no processo:', error);
      process.exit(1);
    });
}

export { createComprehensiveActivities };