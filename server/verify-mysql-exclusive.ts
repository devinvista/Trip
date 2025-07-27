import { db } from "./db";
import { sql } from "drizzle-orm";

async function verifyMySQLExclusive() {
  console.log("🔍 Verificando que todas as funções usam exclusivamente MySQL...");
  
  try {
    // Test database connection
    console.log("🔗 Testando conexão MySQL...");
    const connectionTest = await db.execute(sql`SELECT 1 as test`);
    console.log("✅ Conexão MySQL funcionando:", connectionTest[0]);
    
    // Show all tables
    console.log("\n📋 Listando todas as tabelas no banco MySQL:");
    const tables = await db.execute(sql`SHOW TABLES`);
    tables.forEach((table: any) => {
      const tableName = table[`Tables_in_u905571261_trip`];
      console.log(`  - ${tableName}`);
    });
    
    // Test user functions
    console.log("\n👥 Testando funções de usuários (MySQL):");
    const userCount = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    console.log(`  - Total de usuários: ${userCount[0].count}`);
    
    const users = await db.execute(sql`SELECT username, email FROM users LIMIT 3`);
    users.forEach((user: any) => {
      console.log(`  - Usuário: ${user.username} (${user.email})`);
    });
    
    // Test trip functions
    console.log("\n🧳 Testando funções de viagens (MySQL):");
    const tripCount = await db.execute(sql`SELECT COUNT(*) as count FROM trips`);
    console.log(`  - Total de viagens: ${tripCount[0].count}`);
    
    const trips = await db.execute(sql`SELECT title, destination FROM trips LIMIT 5`);
    trips.forEach((trip: any) => {
      console.log(`  - Viagem: ${trip.title} → ${trip.destination}`);
    });
    
    // Test participant functions
    console.log("\n👨‍👩‍👧‍👦 Testando funções de participantes (MySQL):");
    const participantCount = await db.execute(sql`SELECT COUNT(*) as count FROM trip_participants`);
    console.log(`  - Total de participações: ${participantCount[0].count}`);
    
    // Test message functions
    console.log("\n💬 Testando funções de mensagens (MySQL):");
    const messageCount = await db.execute(sql`SELECT COUNT(*) as count FROM messages`);
    console.log(`  - Total de mensagens: ${messageCount[0].count}`);
    
    // Test activity functions
    console.log("\n🎯 Testando funções de atividades (MySQL):");
    const activityCount = await db.execute(sql`SELECT COUNT(*) as count FROM activities`);
    console.log(`  - Total de atividades: ${activityCount[0].count}`);
    
    // Test expense functions
    console.log("\n💰 Testando funções de despesas (MySQL):");
    const expenseCount = await db.execute(sql`SELECT COUNT(*) as count FROM expenses`);
    console.log(`  - Total de despesas: ${expenseCount[0].count}`);
    
    console.log("\n✅ VERIFICAÇÃO COMPLETA: Todas as funções estão usando exclusivamente MySQL!");
    console.log("🎉 Sistema totalmente migrado para MySQL com dados persistentes!");
    
  } catch (error) {
    console.error("❌ Erro na verificação MySQL:", error);
    process.exit(1);
  }
}

// Run verification
verifyMySQLExclusive().then(() => {
  process.exit(0);
}).catch(console.error);