import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@shared/schema";

// Configuração da conexão MySQL
const connectionConfig = {
  host: "srv1661.hstgr.io", // ou "193.203.175.156"
  port: 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "partiutrip",
  ssl: {
    rejectUnauthorized: false // Para conectar com SSL em produção
  }
};

console.log(`🔗 Conectando ao MySQL em ${connectionConfig.host}:${connectionConfig.port}`);

// Criar conexão com o banco
const connection = mysql.createConnection(connectionConfig);

// Configurar Drizzle com MySQL
export const db = drizzle(connection, { schema, mode: "default" });

// Testar conexão
export async function testConnection() {
  try {
    const conn = await connection;
    await conn.ping();
    console.log("✅ Conexão MySQL estabelecida com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar com MySQL:", error);
    return false;
  }
}

// Criar tabelas se não existirem
export async function initializeTables() {
  try {
    const conn = await connection;
    
    // Criar tabela de usuários se não existir
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        bio TEXT,
        location VARCHAR(255),
        profile_photo TEXT,
        languages JSON,
        interests JSON,
        travel_style VARCHAR(100),
        is_verified BOOLEAN DEFAULT FALSE NOT NULL,
        verification_method VARCHAR(50),
        average_rating DECIMAL(3,2) DEFAULT 0.00,
        total_ratings INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    
    console.log("✅ Tabelas MySQL criadas/verificadas com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao criar tabelas MySQL:", error);
    return false;
  }
}