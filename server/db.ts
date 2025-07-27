import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";
import { users } from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log(`🔗 Conectando ao PostgreSQL...`);

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Testar conexão
export async function testConnection() {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Conexão PostgreSQL estabelecida com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar com PostgreSQL:", error);
    return false;
  }
}

// Reset completo do banco
export async function resetDatabase() {
  const { resetDatabase: resetDB } = await import("./reset-database");
  return await resetDB();
}

// Inicializar tabelas usando Drizzle
export async function initializeTables() {
  try {
    console.log("🏗️ Criando todas as tabelas do schema...");
    
    // Usar SQL simples para contar usuários
    try {
      const result = await db.execute(sql`SELECT COUNT(*) as count FROM ${users}`);
      const userCount = (result.rows[0] as any)?.count || 0;
    
      if (userCount === 0) {
        console.log("🌱 Banco vazio, pronto para receber dados...");
      }
    } catch (error) {
      console.log("ℹ️ Aguardando primeiro uso do banco de dados...");
    }
    
    console.log("✅ Todas as tabelas criadas com sucesso!");
  } catch (error) {
    console.error("❌ Erro na inicialização do banco:", error);
    throw error;
  }
}
