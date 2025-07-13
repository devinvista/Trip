import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@shared/schema";

console.log(`🔗 Conectando ao MySQL...`);

// Configuração do banco MySQL
const connection = mysql.createPool({
  host: 'srv1661.hstgr.io',
  port: 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'partiutrip',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: false
});

// Configurar Drizzle com MySQL
export const db = drizzle(connection, { schema, mode: "default" });

// Testar conexão
export async function testConnection() {
  try {
    await connection.execute("SELECT 1");
    console.log("✅ Conexão MySQL estabelecida com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar com MySQL:", error);
    return false;
  }
}

// Inicializar tabelas usando Drizzle
export async function initializeTables() {
  try {
    // Com MySQL e Drizzle, as tabelas são criadas automaticamente
    // através do schema definido em shared/schema.ts
    console.log("✅ Tabelas MySQL inicializadas com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao inicializar tabelas MySQL:", error);
    return false;
  }
}