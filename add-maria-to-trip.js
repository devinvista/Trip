// Script para adicionar Maria à viagem 23
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addMariaToTrip() {
  const client = await pool.connect();
  try {
    console.log('Conectando ao banco...');
    
    // Adicionar Maria como participante
    const result = await client.query(`
      INSERT INTO trip_participants (trip_id, user_id, status, joined_at)
      VALUES (23, 10, 'approved', NOW())
      ON CONFLICT (trip_id, user_id) DO UPDATE SET 
        status = 'approved'
      RETURNING *;
    `);
    
    console.log('Maria adicionada:', result.rows[0]);
    
    // Verificar participantes atuais
    const participants = await client.query(`
      SELECT tp.*, u.username, u.full_name 
      FROM trip_participants tp 
      JOIN users u ON tp.user_id = u.id 
      WHERE tp.trip_id = 23
      ORDER BY tp.joined_at;
    `);
    
    console.log('Participantes da viagem 23:', participants.rows);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addMariaToTrip();