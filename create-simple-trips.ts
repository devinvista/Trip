import postgres from 'postgres';
import { config } from 'dotenv';

config();

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : 'require'
});

async function createSimpleTrips() {
  try {
    console.log('🚀 Criando viagens para todos os usuários...');

    // Get users
    const users = await sql`SELECT id, full_name FROM users ORDER BY id`;
    console.log(`👥 Usuários: ${users.map(u => u.full_name).join(', ')}`);

    const [tom, maria, carlos] = users;
    const now = new Date();

    // Create trips one by one to avoid issues
    const trips = [
      // Tom's trips
      {
        creator_id: tom.id,
        title: "Rio de Janeiro Clássico",
        destination_id: 2,
        description: "Explorando os pontos turísticos icônicos do Rio de Janeiro",
        start_date: new Date(now.getFullYear(), now.getMonth() - 2, 15),
        end_date: new Date(now.getFullYear(), now.getMonth() - 2, 22),
        budget: 2500,
        max_participants: 4,
        travel_style: "urbanas",
        status: "completed"
      },
      {
        creator_id: tom.id,
        title: "Gramado Romântico",
        destination_id: 3,
        description: "Festival de inverno e chocolates artesanais na Serra Gaúcha",
        start_date: new Date(now.getFullYear(), now.getMonth() + 1, 10),
        end_date: new Date(now.getFullYear(), now.getMonth() + 1, 17),
        budget: 2800,
        max_participants: 5,
        travel_style: "cultural",
        status: "open"
      },
      {
        creator_id: tom.id,
        title: "Buenos Aires Tango",
        destination_id: 6,
        description: "Cultura portenha, tango e gastronomia argentina",
        start_date: new Date(now.getFullYear(), now.getMonth() - 3, 8),
        end_date: new Date(now.getFullYear(), now.getMonth() - 3, 15),
        budget: 4500,
        max_participants: 4,
        travel_style: "cultural",
        status: "completed"
      },
      {
        creator_id: tom.id,
        title: "Paris Cidade Luz",
        destination_id: 8,
        description: "Torre Eiffel, Louvre e romance parisiense",
        start_date: new Date(now.getFullYear(), now.getMonth() + 3, 20),
        end_date: new Date(now.getFullYear(), now.getMonth() + 3, 28),
        budget: 9200,
        max_participants: 4,
        travel_style: "cultural",
        status: "open"
      },
      {
        creator_id: tom.id,
        title: "Nova York Big Apple",
        destination_id: 10,
        description: "Broadway, Central Park e a energia nova-iorquina",
        start_date: new Date(now.getFullYear() + 1, 1, 15),
        end_date: new Date(now.getFullYear() + 1, 1, 23),
        budget: 11500,
        max_participants: 3,
        travel_style: "urbanas",
        status: "open"
      },

      // Maria's trips
      {
        creator_id: maria.id,
        title: "Salvador Histórico",
        destination_id: 1,
        description: "Pelourinho, cultura baiana e culinária única",
        start_date: new Date(now.getFullYear(), now.getMonth() - 1, 5),
        end_date: new Date(now.getFullYear(), now.getMonth() - 1, 12),
        budget: 2600,
        max_participants: 6,
        travel_style: "cultural",
        status: "completed"
      },
      {
        creator_id: maria.id,
        title: "Bonito Ecoturismo",
        destination_id: 4,
        description: "Águas cristalinas e natureza preservada",
        start_date: new Date(now.getFullYear(), now.getMonth() + 2, 8),
        end_date: new Date(now.getFullYear(), now.getMonth() + 2, 15),
        budget: 3200,
        max_participants: 6,
        travel_style: "natureza",
        status: "open"
      },
      {
        creator_id: maria.id,
        title: "Londres Histórica",
        destination_id: 7,
        description: "Big Ben, museus e tradição britânica",
        start_date: new Date(now.getFullYear() - 1, now.getMonth() + 1, 12),
        end_date: new Date(now.getFullYear() - 1, now.getMonth() + 1, 20),
        budget: 8500,
        max_participants: 3,
        travel_style: "cultural",
        status: "completed"
      },
      {
        creator_id: maria.id,
        title: "Roma Imperial",
        destination_id: 9,
        description: "Coliseu, Vaticano e história milenar",
        start_date: new Date(now.getFullYear(), now.getMonth() + 4, 10),
        end_date: new Date(now.getFullYear(), now.getMonth() + 4, 18),
        budget: 7800,
        max_participants: 5,
        travel_style: "cultural",
        status: "open"
      },
      {
        creator_id: maria.id,
        title: "Balneário Camboriú Verão",
        destination_id: 5,
        description: "Praias, vida noturna e diversão garantida",
        start_date: new Date(now.getFullYear(), now.getMonth() + 1, 25),
        end_date: new Date(now.getFullYear(), now.getMonth() + 2, 2),
        budget: 2200,
        max_participants: 8,
        travel_style: "praia",
        status: "open"
      },

      // Carlos's trips
      {
        creator_id: carlos.id,
        title: "Foz do Iguaçu Aventura",
        destination_id: 11,
        description: "Cataratas espetaculares e aventuras na natureza",
        start_date: new Date(now.getFullYear(), now.getMonth() - 4, 18),
        end_date: new Date(now.getFullYear(), now.getMonth() - 4, 25),
        budget: 1800,
        max_participants: 6,
        travel_style: "natureza",
        status: "completed"
      },
      {
        creator_id: carlos.id,
        title: "São Paulo Cosmopolita",
        destination_id: 12,
        description: "Gastronomia, arte e vida urbana paulistana",
        start_date: new Date(now.getFullYear(), now.getMonth() + 1, 5),
        end_date: new Date(now.getFullYear(), now.getMonth() + 1, 12),
        budget: 2000,
        max_participants: 5,
        travel_style: "urbanas",
        status: "open"
      },
      {
        creator_id: carlos.id,
        title: "Montevidéu Charme",
        destination_id: 13,
        description: "Cidade Velha uruguaia e gastronomia única",
        start_date: new Date(now.getFullYear(), now.getMonth() - 5, 20),
        end_date: new Date(now.getFullYear(), now.getMonth() - 5, 27),
        budget: 3500,
        max_participants: 4,
        travel_style: "cultural",
        status: "completed"
      },
      {
        creator_id: carlos.id,
        title: "Barcelona Modernista",
        destination_id: 14,
        description: "Gaudí, tapas e arquitetura impressionante",
        start_date: new Date(now.getFullYear(), now.getMonth() + 5, 15),
        end_date: new Date(now.getFullYear(), now.getMonth() + 5, 23),
        budget: 8200,
        max_participants: 4,
        travel_style: "cultural",
        status: "open"
      },
      {
        creator_id: carlos.id,
        title: "Tóquio Futuro",
        destination_id: 15,
        description: "Tradição e modernidade na capital japonesa",
        start_date: new Date(now.getFullYear() + 1, 2, 10),
        end_date: new Date(now.getFullYear() + 1, 2, 20),
        budget: 12000,
        max_participants: 3,
        travel_style: "cultural",
        status: "open"
      }
    ];

    console.log(`📝 Criando ${trips.length} viagens...`);

    const createdTrips = [];

    // Create trips one by one
    for (const trip of trips) {
      try {
        const result = await sql`
          INSERT INTO trips (
            creator_id, title, destination_id, description, 
            start_date, end_date, budget, max_participants, 
            travel_style, status, current_participants
          ) VALUES (
            ${trip.creator_id}, ${trip.title}, ${trip.destination_id}, ${trip.description},
            ${trip.start_date}, ${trip.end_date}, ${trip.budget}, ${trip.max_participants},
            ${trip.travel_style}, ${trip.status}, 1
          ) RETURNING id, title, creator_id
        `;
        
        createdTrips.push(result[0]);
        console.log(`✅ Viagem criada: "${trip.title}"`);
      } catch (error) {
        console.error(`❌ Erro ao criar viagem "${trip.title}":`, error);
      }
    }

    console.log(`\n🎯 Adicionando Tom em todas as viagens...`);

    // Add participants (Tom joins all trips)
    for (const trip of createdTrips) {
      // Check if creator is already a participant
      const creatorExists = await sql`
        SELECT id FROM trip_participants 
        WHERE trip_id = ${trip.id} AND user_id = ${trip.creator_id}
      `;
      
      if (creatorExists.length === 0) {
        await sql`
          INSERT INTO trip_participants (trip_id, user_id, status, joined_at)
          VALUES (${trip.id}, ${trip.creator_id}, 'approved', NOW())
        `;
      }

      // Add Tom to all trips (if he's not the creator)
      if (trip.creator_id !== tom.id) {
        const tomExists = await sql`
          SELECT id FROM trip_participants 
          WHERE trip_id = ${trip.id} AND user_id = ${tom.id}
        `;
        
        if (tomExists.length === 0) {
          await sql`
            INSERT INTO trip_participants (trip_id, user_id, status, joined_at)
            VALUES (${trip.id}, ${tom.id}, 'approved', NOW())
          `;
        }
      }
    }

    // Update participant counts
    console.log('🔢 Atualizando contadores...');
    for (const trip of createdTrips) {
      const count = await sql`
        SELECT COUNT(*) as total
        FROM trip_participants 
        WHERE trip_id = ${trip.id} AND status = 'approved'
      `;
      
      await sql`
        UPDATE trips 
        SET current_participants = ${count[0].total}
        WHERE id = ${trip.id}
      `;
    }

    // Show summary
    console.log('\n📊 RESUMO FINAL:');
    console.log('================');

    const finalTrips = await sql`
      SELECT 
        u.full_name as creator,
        t.title,
        t.start_date,
        t.current_participants,
        t.max_participants,
        t.status
      FROM trips t
      JOIN users u ON t.creator_id = u.id
      ORDER BY t.start_date
    `;

    finalTrips.forEach(trip => {
      const date = new Date(trip.start_date).toLocaleDateString('pt-BR');
      console.log(`${trip.creator}: "${trip.title}" - ${date} (${trip.current_participants}/${trip.max_participants}) [${trip.status}]`);
    });

    // Tom's participation summary
    const tomParticipation = await sql`
      SELECT COUNT(*) as total FROM trip_participants WHERE user_id = ${tom.id}
    `;

    console.log(`\n🎉 Tom participa de ${tomParticipation[0].total} viagens!`);
    console.log(`✅ ${createdTrips.length} viagens criadas com sucesso!`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sql.end();
  }
}

createSimpleTrips();