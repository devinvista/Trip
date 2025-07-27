
import { db } from "./db";
import mysql from "mysql2/promise";

// Configuração do banco MySQL (mesma do db.ts)
const connection = mysql.createPool({
  host: 'srv1661.hstgr.io',
  port: 3306,
  user: 'u905571261_trip',
  password: 'Dracarys23@',
  database: 'u905571261_trip',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: false
});

export async function resetDatabase() {
  console.log("🗑️ Iniciando reset completo do banco de dados...");
  
  try {
    // Desabilitar verificação de chaves estrangeiras
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    console.log("🔓 Chaves estrangeiras desabilitadas");

    // Lista de todas as tabelas na ordem correta para evitar conflitos
    const tables = [
      'activity_budget_proposals',
      'trip_activities', 
      'activity_bookings',
      'activity_reviews',
      'activities',
      'expense_splits',
      'expenses',
      'verification_requests',
      'destination_ratings',
      'user_ratings',
      'messages',
      'trip_requests',
      'trip_participants',
      'trips',
      'users'
    ];

    // Truncar todas as tabelas (limpa dados e reseta AUTO_INCREMENT)
    for (const table of tables) {
      try {
        await connection.execute(`TRUNCATE TABLE ${table}`);
        console.log(`✅ Tabela ${table} zerada e ID resetado`);
      } catch (error) {
        console.log(`⚠️ Tabela ${table} não encontrada ou erro: ${error.message}`);
      }
    }

    // Reabilitar verificação de chaves estrangeiras
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log("🔒 Chaves estrangeiras reabilitadas");

    // Verificar se as tabelas estão vazias
    console.log("🔍 Verificando status das tabelas...");
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = (rows as any)[0].count;
        console.log(`📊 Tabela ${table}: ${count} registros`);
      } catch (error) {
        console.log(`⚠️ Erro ao verificar ${table}: ${error.message}`);
      }
    }

    console.log("✅ Reset do banco de dados concluído com sucesso!");
    console.log("🆕 Todos os IDs foram resetados para começar em 1");
    
  } catch (error) {
    console.error("❌ Erro durante o reset do banco:", error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  resetDatabase()
    .then(() => {
      console.log("🎉 Reset concluído! O banco está limpo e pronto para novos dados.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Falha no reset:", error);
      process.exit(1);
    });
}
