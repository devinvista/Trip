import { db } from './server/db';
import { users, destinations, trips, activities } from './shared/schema';
import bcryptjs from 'bcryptjs';

async function seedDatabase() {
  console.log('🌱 Criando dados de demonstração...');
  
  try {
    // Create destinations
    const [destination1, destination2] = await db.insert(destinations).values([
      {
        name: 'Rio de Janeiro',
        state: 'RJ',
        country: 'Brasil',
        countryType: 'nacional',
        continent: 'América do Sul',
        latitude: '-22.9068',
        longitude: '-43.1729',
        timezone: 'America/Sao_Paulo'
      },
      {
        name: 'São Paulo',
        state: 'SP', 
        country: 'Brasil',
        countryType: 'nacional',
        continent: 'América do Sul',
        latitude: '-23.5505',
        longitude: '-46.6333',
        timezone: 'America/Sao_Paulo'
      }
    ]).returning();

    // Create users
    const [user1, user2, user3] = await db.insert(users).values([
      {
        username: 'tom',
        email: 'tom@example.com',
        password: bcryptjs.hashSync('t123', 10),
        fullName: 'Tom Silva',
        phone: '+5511999999999',
        bio: 'Aventureiro apaixonado por viagens',
        isVerified: true,
        averageRating: '5.00',
        totalRatings: 0,
        travelStyles: ['adventure', 'cultural']
      },
      {
        username: 'maria',
        email: 'maria@example.com',
        password: bcryptjs.hashSync('t123', 10),
        fullName: 'Maria Santos',
        phone: '+5511888888888',
        bio: 'Exploradora de culturas',
        isVerified: true,
        averageRating: '5.00',
        totalRatings: 0,
        travelStyles: ['cultural', 'nature']
      },
      {
        username: 'carlos',
        email: 'carlos@example.com',
        password: bcryptjs.hashSync('password123', 10),
        fullName: 'Carlos Mendes',
        phone: '+5511777777777',
        bio: 'Fotógrafo de viagem',
        isVerified: false,
        averageRating: '5.00',
        totalRatings: 0,
        travelStyles: ['photography', 'adventure']
      }
    ]).returning();

    // Create trips
    const [trip1, trip2] = await db.insert(trips).values([
      {
        title: 'Aventura no Rio de Janeiro',
        description: 'Explore as belezas naturais do Rio',
        destinationId: destination1.id,
        startDate: new Date('2025-08-15'),
        endDate: new Date('2025-08-20'),
        maxParticipants: 8,
        budget: 2500,
        creatorId: user1.id,
        currentParticipants: 1,
        travelStyle: 'adventure',
        plannedActivities: []
      },
      {
        title: 'Cultura em São Paulo',
        description: 'Descubra a rica cultura paulistana',
        destinationId: destination2.id,
        startDate: new Date('2025-09-10'),
        endDate: new Date('2025-09-15'),
        maxParticipants: 6,
        budget: 1800,
        creatorId: user2.id,
        currentParticipants: 1,
        travelStyle: 'cultural',
        plannedActivities: []
      }
    ]).returning();

    // Create activities
    await db.insert(activities).values([
      {
        title: 'Cristo Redentor',
        description: 'Visita ao famoso Cristo Redentor no Corcovado',
        destinationId: destination1.id,
        category: 'pontos_turisticos',
        difficultyLevel: 'easy',
        duration: '4 horas',
        minParticipants: 1,
        maxParticipants: 20,
        createdById: user1.id,
        coverImage: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325',
        averageRating: '4.80',
        totalRatings: 150
      },
      {
        title: 'Museu de Arte de São Paulo',
        description: 'Explore o famoso MASP na Avenida Paulista',
        destinationId: destination2.id,
        category: 'cultural',
        difficultyLevel: 'easy',
        duration: '3 horas',
        minParticipants: 1,
        maxParticipants: 30,
        createdById: user2.id,
        coverImage: 'https://images.unsplash.com/photo-1544537150-6e4b999de2a3',
        averageRating: '4.60',
        totalRatings: 89
      }
    ]);

    console.log('✅ Dados de demonstração criados com sucesso!');
    console.log(`✅ ${user1.username}, ${user2.username}, ${user3.username} criados`);
    console.log(`✅ ${destination1.name}, ${destination2.name} criados`);
    console.log(`✅ ${trip1.title}, ${trip2.title} criados`);
    
  } catch (error) {
    console.error('❌ Erro ao criar dados:', error);
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0)).catch((error) => {
    console.error('❌ Erro no seeding:', error);
    process.exit(1);
  });
}

export default seedDatabase;