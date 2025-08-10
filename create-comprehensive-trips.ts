import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config();

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : 'require'
});

// Get current date for realistic trip planning
const now = new Date();

// Trip data with variety of destinations (national and international)
const tripTemplates = [
  // Nacional - Passadas
  {
    title: "Aventura no Rio de Janeiro",
    destination: "Rio de Janeiro, RJ",
    destination_id: 2, // Rio de Janeiro
    description: "Exploramos os pontos turísticos clássicos do Rio, do Cristo Redentor ao Pão de Açúcar. Uma viagem inesquecível!",
    start_date: new Date(now.getFullYear(), now.getMonth() - 3, 15), // 3 meses atrás
    end_date: new Date(now.getFullYear(), now.getMonth() - 3, 22),
    budget: 2500,
    max_participants: 4,
    travel_style: "urbanas",
    status: "completed"
  },
  {
    title: "Ecoturismo em Bonito",
    destination: "Bonito, MS",
    destination_id: 4, // Bonito
    description: "Mergulho em águas cristalinas, grutas espetaculares e contato com a natureza preservada do MS.",
    start_date: new Date(now.getFullYear(), now.getMonth() - 2, 8), // 2 meses atrás
    end_date: new Date(now.getFullYear(), now.getMonth() - 2, 14),
    budget: 3200,
    max_participants: 6,
    travel_style: "natureza",
    status: "completed"
  },
  
  // Nacional - Próximas/Futuras
  {
    title: "Gramado e Canela - Inverno Gaúcho",
    destination: "Gramado, RS",
    destination_id: 3, // Gramado
    description: "Festival de Inverno, chocolates artesanais, arquitetura alemã e as belezas da Serra Gaúcha.",
    start_date: new Date(now.getFullYear(), now.getMonth() + 1, 20), // mês que vem
    end_date: new Date(now.getFullYear(), now.getMonth() + 1, 27),
    budget: 2800,
    max_participants: 5,
    travel_style: "cultural",
    status: "open"
  },
  {
    title: "Praias de Balneário Camboriú",
    destination: "Balneário Camboriú, SC",
    destination_id: 5, // Balneário Camboriú
    description: "Verão, praia, vida noturna e aventuras aquáticas na Riviera Brasileira.",
    start_date: new Date(now.getFullYear(), now.getMonth() + 2, 5), // 2 meses
    end_date: new Date(now.getFullYear(), now.getMonth() + 2, 12),
    budget: 2200,
    max_participants: 8,
    travel_style: "praia",
    status: "open"
  },
  {
    title: "Salvador - História e Cultura",
    destination: "Salvador, BA",
    destination_id: 1, // Salvador
    description: "Pelourinho, culinária baiana, axé music e o charme histórico da primeira capital do Brasil.",
    start_date: new Date(now.getFullYear(), now.getMonth() + 3, 10), // 3 meses
    end_date: new Date(now.getFullYear(), now.getMonth() + 3, 17),
    budget: 2600,
    max_participants: 6,
    travel_style: "cultural",
    status: "open"
  },

  // Internacional - Passadas  
  {
    title: "Buenos Aires Express",
    destination: "Buenos Aires, Argentina",
    destination_id: 6, // Buenos Aires
    description: "Tango, churrascos, vinhos e a elegância portenha. Uma experiência cultural única na América do Sul.",
    start_date: new Date(now.getFullYear(), now.getMonth() - 4, 18), // 4 meses atrás
    end_date: new Date(now.getFullYear(), now.getMonth() - 4, 25),
    budget: 4500,
    max_participants: 4,
    travel_style: "urbanas",
    status: "completed"
  },
  {
    title: "Londres - História e Modernidade",
    destination: "Londres, Inglaterra",
    destination_id: 7, // Londres
    description: "Big Ben, museus fantásticos, pubs tradicionais e a multiculturalidade londrina.",
    start_date: new Date(now.getFullYear() - 1, now.getMonth() + 2, 12), // ano passado
    end_date: new Date(now.getFullYear() - 1, now.getMonth() + 2, 20),
    budget: 8500,
    max_participants: 3,
    travel_style: "cultural",
    status: "completed"
  },

  // Internacional - Futuras
  {
    title: "Paris - Cidade Luz",
    destination: "Paris, França",
    destination_id: 8, // Paris
    description: "Torre Eiffel, Louvre, gastronomia francesa e o romantismo parisiense.",
    start_date: new Date(now.getFullYear(), now.getMonth() + 4, 15), // 4 meses
    end_date: new Date(now.getFullYear(), now.getMonth() + 4, 23),
    budget: 9200,
    max_participants: 4,
    travel_style: "cultural",
    status: "open"
  },
  {
    title: "Roma - Império e Arte",
    destination: "Roma, Itália",
    destination_id: 9, // Roma
    description: "Coliseu, Vaticano, pasta autêntica e a história milenar da Cidade Eterna.",
    start_date: new Date(now.getFullYear(), now.getMonth() + 5, 8), // 5 meses
    end_date: new Date(now.getFullYear(), now.getMonth() + 5, 16),
    budget: 7800,
    max_participants: 5,
    travel_style: "cultural",
    status: "open"
  },
  {
    title: "Nova York - Big Apple",
    destination: "Nova York, EUA",
    destination_id: 10, // Nova York
    description: "Broadway, Central Park, arranha-céus e a energia vibrante da cidade que nunca dorme.",
    start_date: new Date(now.getFullYear() + 1, 1, 20), // ano que vem
    end_date: new Date(now.getFullYear() + 1, 1, 28),
    budget: 11500,
    max_participants: 3,
    travel_style: "urbanas",
    status: "open"
  }
];

async function createComprehensiveTrips() {
  try {
    console.log('🚀 Iniciando criação de viagens abrangentes...');

    // Get user IDs
    const users = await sql`SELECT id, full_name FROM users ORDER BY id`;
    console.log(`👥 Usuários encontrados: ${users.map(u => `${u.full_name} (ID: ${u.id})`).join(', ')}`);

    if (users.length < 3) {
      throw new Error('Não há usuários suficientes no banco de dados');
    }

    const [tom, maria, carlos] = users;

    // Create 5 trips for each user (15 total)
    // Each user will be creator of 5 trips, Tom will participate in all 15
    
    const tripsToCreate = [];
    let tripIndex = 0;

    // 5 trips for each user
    for (let userIndex = 0; userIndex < 3; userIndex++) {
      const creator = users[userIndex];
      
      for (let i = 0; i < 5; i++) {
        const template = tripTemplates[tripIndex];
        
        tripsToCreate.push({
          ...template,
          creator_id: creator.id,
          current_participants: 1, // Creator is always a participant
          created_at: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random creation date within last 90 days
          cover_image: null,
          budget_breakdown: null,
          shared_costs: null,
          planned_activities: null
        });
        
        tripIndex++;
      }
    }

    console.log(`📝 Criando ${tripsToCreate.length} viagens...`);

    // Insert trips
    const insertedTrips = await sql`
      INSERT INTO trips ${sql(tripsToCreate, 'title', 'destination_id', 'description', 'start_date', 'end_date', 'budget', 'max_participants', 'travel_style', 'status', 'creator_id', 'current_participants', 'created_at', 'cover_image', 'budget_breakdown', 'shared_costs', 'planned_activities')}
      RETURNING id, title, creator_id
    `;

    console.log(`✅ ${insertedTrips.length} viagens criadas com sucesso!`);

    // Now add Tom as participant to ALL trips (including ones he didn't create)
    console.log('👤 Adicionando Tom como participante em todas as viagens...');
    
    const participations = [];
    
    for (const trip of insertedTrips) {
      // Add creator as participant
      participations.push({
        trip_id: trip.id,
        user_id: trip.creator_id,
        status: 'approved',
        joined_at: new Date()
      });
      
      // Add Tom to all trips (if he's not already the creator)
      if (trip.creator_id !== tom.id) {
        participations.push({
          trip_id: trip.id,
          user_id: tom.id,
          status: 'approved',
          joined_at: new Date()
        });
      }
    }

    // Insert all participations
    await sql`
      INSERT INTO trip_participants ${sql(participations, 'trip_id', 'user_id', 'status', 'joined_at')}
    `;

    // Update participant counts
    console.log('🔢 Atualizando contadores de participantes...');
    
    for (const trip of insertedTrips) {
      const participantCount = await sql`
        SELECT COUNT(*) as count 
        FROM trip_participants 
        WHERE trip_id = ${trip.id} AND status = 'approved'
      `;
      
      await sql`
        UPDATE trips 
        SET current_participants = ${participantCount[0].count}
        WHERE id = ${trip.id}
      `;
    }

    // Show summary
    console.log('\n📊 RESUMO DAS VIAGENS CRIADAS:');
    console.log('=====================================');

    const summary = await sql`
      SELECT 
        u.full_name as creator,
        t.title,
        t.destination,
        t.start_date,
        t.status,
        t.current_participants,
        t.max_participants
      FROM trips t
      JOIN users u ON t.creator_id = u.id
      ORDER BY t.start_date
    `;

    summary.forEach(trip => {
      const startDate = new Date(trip.start_date).toLocaleDateString('pt-BR');
      console.log(`${trip.creator}: "${trip.title}" - ${trip.destination}`);
      console.log(`  📅 ${startDate} | 👥 ${trip.current_participants}/${trip.max_participants} | 📍 ${trip.status}`);
      console.log('');
    });

    // Show Tom's participation summary
    const tomTrips = await sql`
      SELECT 
        t.title,
        t.destination,
        t.start_date,
        u.full_name as creator,
        tp.status
      FROM trips t
      JOIN trip_participants tp ON t.id = tp.trip_id
      JOIN users u ON t.creator_id = u.id
      WHERE tp.user_id = ${tom.id}
      ORDER BY t.start_date
    `;

    console.log(`🎯 TOM PARTICIPA DE ${tomTrips.length} VIAGENS:`);
    console.log('=========================================');
    tomTrips.forEach(trip => {
      const startDate = new Date(trip.start_date).toLocaleDateString('pt-BR');
      const role = trip.creator === 'Tom Santos' ? '(Criador)' : '(Participante)';
      console.log(`📍 "${trip.title}" - ${trip.destination} ${role}`);
      console.log(`  📅 ${startDate} | Criado por: ${trip.creator}`);
    });

    console.log('\n🎉 Criação de viagens concluída com sucesso!');
    console.log(`Tom agora participa de ${tomTrips.length} viagens!`);

  } catch (error) {
    console.error('❌ Erro ao criar viagens:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Execute the function
createComprehensiveTrips();