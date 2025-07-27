import { db } from './server/db';
import { tripParticipants } from './shared/schema';

async function addParticipants() {
  console.log('🔗 Conectando ao PostgreSQL...');
  console.log('👥 Adicionando participantes às viagens...');

  // Add creator (tom - user 9) as participant in his own trips
  await db.insert(tripParticipants).values([
    {
      trip_id: 5, // Fim de Semana no Rio
      user_id: 9, // tom
      status: 'accepted',
      joined_at: new Date()
    },
    {
      trip_id: 6, // Aventura em Salvador  
      user_id: 9, // tom
      status: 'accepted',
      joined_at: new Date()
    }
  ]);

  // Add other users as participants
  await db.insert(tripParticipants).values([
    {
      trip_id: 5, // Fim de Semana no Rio
      user_id: 10, // maria
      status: 'accepted',
      joined_at: new Date()
    },
    {
      trip_id: 5, // Fim de Semana no Rio
      user_id: 11, // carlos
      status: 'accepted', 
      joined_at: new Date()
    },
    {
      trip_id: 6, // Aventura em Salvador
      user_id: 10, // maria
      status: 'accepted',
      joined_at: new Date()
    }
  ]);

  console.log('✅ Participantes adicionados com sucesso!');
  console.log('- Viagem Rio: 3 participantes (tom, maria, carlos)');
  console.log('- Viagem Salvador: 2 participantes (tom, maria)');
}

addParticipants().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro ao adicionar participantes:', error);
  process.exit(1);
});