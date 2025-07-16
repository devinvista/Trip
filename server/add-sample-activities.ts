import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function addSampleActivities() {
  console.log('🌱 Adicionando atividades complementares para o sistema...');

  try {
    // Verificar quantas atividades já existem
    const existingCount = await db.execute(sql`SELECT COUNT(*) as count FROM activities`);
    console.log(`📊 Atividades existentes: ${existingCount[0].count}`);

    // Adicionar atividades do arquivo fornecido pelo usuário
    const newActivities = [
      {
        title: 'Pão de Açúcar (Bondinho)',
        description: 'Passeio no famoso bondinho do Pão de Açúcar com vista espetacular da Baía de Guanabara. O percurso inclui duas estações: primeiro a Urca e depois o topo do Pão de Açúcar a 396m de altura.',
        location: 'Rio de Janeiro, RJ',
        category: 'pontos_turisticos',
        priceType: 'per_person',
        priceAmount: '120.00',
        duration: '3 horas',
        difficultyLevel: 'easy',
        minParticipants: 1,
        maxParticipants: 65,
        requirements: '["Não possui restrições", "Adequado para todas as idades"]',
        cancellationPolicy: 'Cancelamento gratuito até 24h antes',
        contactInfo: '"Bondinho Pão de Açúcar: (21) 2546-8400"',
        coverImage: 'https://images.unsplash.com/photo-1516712713233-d11f7fa20395?w=800&h=600&fit=crop',
        averageRating: '4.70',
        totalRatings: 0,
        createdById: 1
      },
      {
        title: 'Praia de Copacabana / Ipanema + Esportes',
        description: 'Aproveite as praias mais famosas do Rio de Janeiro. Atividades incluem aulas de surf, vôlei de praia, futevôlei e passeios de bike pela orla. Desfrute da energia carioca e da beleza natural.',
        location: 'Rio de Janeiro, RJ',
        category: 'water_sports',
        priceType: 'per_person',
        priceAmount: '100.00',
        duration: '6 horas',
        difficultyLevel: 'easy',
        minParticipants: 1,
        maxParticipants: 50,
        requirements: '["Saber nadar para atividades aquáticas", "Protetor solar", "Roupa de banho"]',
        cancellationPolicy: 'Cancelamento gratuito até 12h antes',
        contactInfo: '"WhatsApp: (21) 99999-1234"',
        coverImage: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop',
        averageRating: '4.50',
        totalRatings: 0,
        createdById: 1
      },
      {
        title: 'MASP + Avenida Paulista',
        description: 'Visite o icônico Museu de Arte de São Paulo e explore a Avenida Paulista, coração financeiro e cultural da cidade. Conheça as obras de arte mais importantes do Brasil.',
        location: 'São Paulo, SP',
        category: 'cultural',
        priceType: 'per_person',
        priceAmount: '40.00',
        duration: '4 horas',
        difficultyLevel: 'easy',
        minParticipants: 1,
        maxParticipants: 30,
        requirements: '["Interesse em arte", "Sapatos confortáveis"]',
        cancellationPolicy: 'Cancelamento gratuito até 2h antes',
        contactInfo: '"MASP: (11) 3149-5959"',
        coverImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
        averageRating: '4.50',
        totalRatings: 0,
        createdById: 1
      },
      {
        title: 'Pelourinho + Elevador Lacerda',
        description: 'Explore o centro histórico de Salvador, Patrimônio Mundial da UNESCO. Visite as igrejas barrocas, casarões coloniais e sinta a energia da cultura afro-brasileira no coração da Bahia.',
        location: 'Salvador, BA',
        category: 'cultural',
        priceType: 'per_person',
        priceAmount: '60.00',
        duration: '5 horas',
        difficultyLevel: 'easy',
        minParticipants: 1,
        maxParticipants: 20,
        requirements: '["Sapatos confortáveis", "Protetor solar", "Câmera fotográfica"]',
        cancellationPolicy: 'Cancelamento gratuito até 24h antes',
        contactInfo: '"Turismo Bahia: (71) 3117-3000"',
        coverImage: 'https://images.unsplash.com/photo-1562788869-4ed32648eb72?w=800&h=600&fit=crop',
        averageRating: '4.60',
        totalRatings: 0,
        createdById: 1
      },
      {
        title: 'Cataratas do Iguaçu (lado brasileiro)',
        description: 'Conheça uma das maiores quedas d água do mundo. Vista panorâmica impressionante das 275 quedas que formam as Cataratas do Iguaçu, Patrimônio Natural da Humanidade.',
        location: 'Foz do Iguaçu, PR',
        category: 'nature',
        priceType: 'per_person',
        priceAmount: '85.00',
        duration: '6 horas',
        difficultyLevel: 'easy',
        minParticipants: 1,
        maxParticipants: 40,
        requirements: '["Sapatos confortáveis", "Protetor solar", "Capa de chuva", "Câmera à prova d\'água"]',
        cancellationPolicy: 'Cancelamento gratuito até 24h antes',
        contactInfo: '"Parque Nacional: (45) 3521-4400"',
        coverImage: 'https://images.unsplash.com/photo-1569586580648-f5152c716fde?w=800&h=600&fit=crop',
        averageRating: '4.90',
        totalRatings: 0,
        createdById: 1
      }
    ];

    // Inserir cada atividade
    for (const activity of newActivities) {
      await db.execute(sql`
        INSERT INTO activities (
          title, description, location, category, price_type, price_amount,
          duration, difficulty_level, min_participants, max_participants,
          requirements, cancellation_policy, contact_info, cover_image,
          average_rating, total_ratings, created_by_id
        ) VALUES (
          ${activity.title},
          ${activity.description},
          ${activity.location},
          ${activity.category},
          ${activity.priceType},
          ${activity.priceAmount},
          ${activity.duration},
          ${activity.difficultyLevel},
          ${activity.minParticipants},
          ${activity.maxParticipants},
          ${activity.requirements},
          ${activity.cancellationPolicy},
          ${activity.contactInfo},
          ${activity.coverImage},
          ${activity.averageRating},
          ${activity.totalRatings},
          ${activity.createdById}
        )
      `);
      
      console.log(`✅ Atividade adicionada: ${activity.title}`);
    }

    console.log('🎉 Todas as atividades complementares foram adicionadas!');

    // Verificar total final
    const finalCount = await db.execute(sql`SELECT COUNT(*) as count FROM activities`);
    console.log(`📊 Total de atividades agora: ${finalCount[0].count}`);

  } catch (error) {
    console.error('❌ Erro ao adicionar atividades:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addSampleActivities()
    .then(() => {
      console.log('✅ Processo concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no processo:', error);
      process.exit(1);
    });
}