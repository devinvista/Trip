import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function addParticipant() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('📊 Conectado ao banco de dados');
    
    // Adicionar Maria (ID: 10) como participante da viagem 23
    const result = await client.query(`
      INSERT INTO trip_participants (trip_id, user_id, status, joined_at)
      VALUES (23, 10, 'approved', NOW())
      ON CONFLICT (trip_id, user_id) DO UPDATE SET 
        status = 'approved'
      RETURNING *;
    `);
    
    console.log('✅ Participante adicionado:', result.rows[0]);
    
    // Verificar participantes atuais da viagem 23
    const participants = await client.query(`
      SELECT tp.*, u.username, u.full_name 
      FROM trip_participants tp 
      JOIN users u ON tp.user_id = u.id 
      WHERE tp.trip_id = 23
      ORDER BY tp.joined_at;
    `);
    
    console.log('📊 Participantes atuais da viagem 23:', participants.rows);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.end();
  }
}

addParticipant();