import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";
import { users } from "@shared/schema";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

console.log(`🔗 Conectando ao MySQL...`);

// Configuração do banco MySQL usando variáveis de ambiente
const connection = mysql.createPool({
  host: process.env.DB_HOST || 'srv1661.hstgr.io',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'u905571261_trip',
  password: process.env.DB_PASSWORD || 'Dracarys23@',
  database: process.env.DB_NAME || 'u905571261_trip',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
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
        is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
        report_count INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
        is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
        report_count INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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

    // Create activities table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        difficulty VARCHAR(50) DEFAULT 'medium' NOT NULL,
        duration INT NOT NULL,
        price DECIMAL(10,2) DEFAULT 0.00,
        currency VARCHAR(3) DEFAULT 'BRL' NOT NULL,
        images JSON,
        average_rating DECIMAL(3,2) DEFAULT 0.00,
        total_ratings INT DEFAULT 0 NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_by_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create activity_reviews table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activity_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        photos JSON,
        visit_date TIMESTAMP NULL,
        helpful_votes INT DEFAULT 0 NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE NOT NULL,
        is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
        report_count INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_review (activity_id, user_id)
      )
    `);

    // Update activity_reviews table structure if needed
    try {
      await connection.execute(`
        ALTER TABLE activity_reviews 
        CHANGE COLUMN comment review TEXT
      `);
    } catch (err) {
      // Column might already be renamed or not exist
    }

    try {
      await connection.execute(`
        ALTER TABLE activity_reviews 
        ADD COLUMN IF NOT EXISTS photos JSON,
        ADD COLUMN IF NOT EXISTS visit_date TIMESTAMP NULL,
        ADD COLUMN IF NOT EXISTS helpful_votes INT DEFAULT 0 NOT NULL,
        ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE NOT NULL
      `);
    } catch (err) {
      // Columns might already exist
    }

    // Create activity_bookings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activity_bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        user_id INT NOT NULL,
        booking_date TIMESTAMP NOT NULL,
        participants INT DEFAULT 1 NOT NULL,
        total_cost DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create activity_budget_proposals table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activity_budget_proposals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        created_by INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price_type VARCHAR(50) DEFAULT 'per_person' NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'BRL' NOT NULL,
        inclusions JSON,
        exclusions JSON,
        valid_until TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        votes INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create trip_activities table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS trip_activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trip_id INT NOT NULL,
        activity_id INT NOT NULL,
        budget_proposal_id INT NOT NULL,
        added_by INT NOT NULL,
        status VARCHAR(50) DEFAULT 'proposed' NOT NULL,
        participants INT DEFAULT 1 NOT NULL,
        total_cost DECIMAL(10,2) NOT NULL,
        scheduled_date TIMESTAMP NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (budget_proposal_id) REFERENCES activity_budget_proposals(id) ON DELETE CASCADE,
        FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("✅ Todas as tabelas criadas com sucesso!");
    
    // Check if we need to create initial test data
    const [userCount] = await db.select({ count: sql`count(*)` }).from(users);
    if (userCount.count === 0) {
      console.log("🌱 Criando dados básicos de teste...");
      const { createSimpleSeedData } = await import("./comprehensive-seed-simple");
      await createSimpleSeedData();
    }
  } catch (error) {
    console.error("❌ Erro na inicialização do banco:", error);
    throw error;
  }
}
