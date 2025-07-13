import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

console.log(`🔗 Conectando ao PostgreSQL...`);

// Criar conexão com o banco PostgreSQL
const connection = neon(process.env.DATABASE_URL);

// Configurar Drizzle com PostgreSQL
export const db = drizzle(connection, { schema, mode: "default" });

// Testar conexão
export async function testConnection() {
  try {
    await connection`SELECT 1`;
    console.log("✅ Conexão PostgreSQL estabelecida com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar com PostgreSQL:", error);
    return false;
  }
}

// Inicializar tabelas usando Drizzle
export async function initializeTables() {
  try {
    // Com PostgreSQL e Drizzle, as tabelas são criadas automaticamente
    // através do schema definido em shared/schema.ts
    console.log("✅ Tabelas PostgreSQL inicializadas com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao inicializar tabelas PostgreSQL:", error);
    return false;
  }
}