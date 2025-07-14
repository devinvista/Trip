import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@shared/schema";

console.log(`🔗 Conectando ao MySQL...`);

// Configuração do banco MySQL (srv1661.hstgr.io)
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
    // Create tables with current schema structure
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        bio TEXT,
        location VARCHAR(255),
        profile_photo TEXT,
        languages JSON,
        interests JSON,
        travel_style VARCHAR(100),
        referred_by VARCHAR(50),
        is_verified BOOLEAN DEFAULT FALSE NOT NULL,
        verification_method VARCHAR(50),
        average_rating DECIMAL(3,2) DEFAULT 0.00,
        total_ratings INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // Check if phone column exists and add it if missing
    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN phone VARCHAR(20) NOT NULL DEFAULT ''`);
      console.log("✅ Campo phone adicionado à tabela users");
    } catch (error) {
      // Column already exists, this is fine
    }

    // Check if is_verified column exists and add it if missing
    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE NOT NULL`);
      console.log("✅ Campo is_verified adicionado à tabela users");
    } catch (error) {
      // Column already exists, this is fine
    }

    // Check if verification_method column exists and add it if missing
    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN verification_method VARCHAR(50)`);
      console.log("✅ Campo verification_method adicionado à tabela users");
    } catch (error) {
      // Column already exists, this is fine
    }

    // Fix travel_styles column name if it exists
    try {
      await connection.execute(`ALTER TABLE users CHANGE travel_styles travel_style JSON`);
      console.log("✅ Campo travel_styles renomeado para travel_style");
    } catch (error) {
      // Column doesn't exist or already renamed
    }

    // Add missing columns that may not exist
    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN referred_by VARCHAR(50)`);
      console.log("✅ Campo referred_by adicionado à tabela users");
    } catch (error) {
      // Column already exists, this is fine
    }

    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.00`);
      console.log("✅ Campo average_rating adicionado à tabela users");
    } catch (error) {
      // Column already exists, this is fine
    }

    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN total_ratings INT DEFAULT 0 NOT NULL`);
      console.log("✅ Campo total_ratings adicionado à tabela users");
    } catch (error) {
      // Column already exists, this is fine
    }

    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL`);
      console.log("✅ Campo created_at adicionado à tabela users");
    } catch (error) {
      // Column already exists, this is fine
    }

    // Check current table structure
    try {
      const [columns] = await connection.execute(`DESCRIBE users`);
      console.log("📊 Estrutura atual da tabela users:", columns);
    } catch (error) {
      console.log("❌ Erro ao descrever tabela users:", error);
    }

    console.log("✅ Tabelas MySQL inicializadas com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao inicializar tabelas MySQL:", error);
    return false;
  }
}