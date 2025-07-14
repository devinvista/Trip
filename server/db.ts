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

// Reset completo do banco
export async function resetDatabase() {
  const { resetDatabase: resetDB } = await import("./reset-database");
  return await resetDB();
}

// Inicializar tabelas usando Drizzle
export async function initializeTables() {
  try {
    console.log("🏗️ Criando todas as tabelas do schema...");
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL DEFAULT '',
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

    // Create trips table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS trips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        creator_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        cover_image TEXT,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        budget INT,
        budget_breakdown JSON,
        max_participants INT NOT NULL,
        current_participants INT DEFAULT 1 NOT NULL,
        description TEXT NOT NULL,
        travel_style VARCHAR(100) NOT NULL,
        shared_costs JSON,
        planned_activities JSON,
        status VARCHAR(50) DEFAULT 'open' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (creator_id) REFERENCES users(id)
      )
    `);

    // Create trip_participants table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS trip_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trip_id INT NOT NULL,
        user_id INT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_trip_user (trip_id, user_id)
      )
    `);

    // Create messages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trip_id INT NOT NULL,
        sender_id INT NOT NULL,
        content TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create trip_requests table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS trip_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trip_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Drop and recreate expenses table to ensure correct schema
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    await connection.execute("DROP TABLE IF EXISTS expense_splits");
    await connection.execute("DROP TABLE IF EXISTS expenses");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
    
    // Create expenses table
    await connection.execute(`
      CREATE TABLE expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trip_id INT NOT NULL,
        paid_by INT NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'other',
        receipt TEXT,
        settled_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create expense_splits table
    await connection.execute(`
      CREATE TABLE expense_splits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        expense_id INT NOT NULL,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        paid BOOLEAN DEFAULT FALSE NOT NULL,
        settled_at TIMESTAMP NULL,
        FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create user_ratings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        rated_user_id INT NOT NULL,
        rater_user_id INT NOT NULL,
        trip_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (rated_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (rater_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        UNIQUE KEY unique_rating (rated_user_id, rater_user_id, trip_id)
      )
    `);

    // Create destination_ratings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS destination_ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        destination VARCHAR(255) NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create verification_requests table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS verification_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        document_url TEXT,
        social_media_profile TEXT,
        phone_number VARCHAR(20),
        status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        reviewed_by INT,
        reviewed_at TIMESTAMP NULL,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES users(id)
      )
    `);



    console.log("✅ Todas as tabelas criadas com sucesso!");
    
    // Import and run simple seed data
    const { createSimpleSeedData } = await import("./comprehensive-seed-simple");
    await createSimpleSeedData();
  } catch (error) {
    console.error("❌ Erro na inicialização do banco:", error);
    throw error;
  }
}
