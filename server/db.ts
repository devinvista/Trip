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

    // Create expenses table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trip_id INT NOT NULL,
        paid_by INT NOT NULL,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        receipt TEXT,
        settled_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create expense_splits table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS expense_splits (
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
    
    // Clear and seed database with comprehensive data
    try {
      console.log("🧹 Limpando dados existentes...");
      
      // Clear tables in correct order (respecting foreign key constraints)
      await connection.execute("DELETE FROM activity_reviews");
      await connection.execute("DELETE FROM activity_bookings");
      await connection.execute("DELETE FROM activities");
      
      // Drop and recreate activities table to ensure correct schema
      await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
      await connection.execute("DROP TABLE IF EXISTS activities");
      await connection.execute("DROP TABLE IF EXISTS activity_reviews");
      await connection.execute("DROP TABLE IF EXISTS activity_bookings");
      await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
      
      // Recreate activities table with correct schema
      await connection.execute(`
        CREATE TABLE activities (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          location VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          price_type VARCHAR(50) NOT NULL DEFAULT 'per_person',
          price_amount DECIMAL(10,2),
          duration VARCHAR(100),
          difficulty_level VARCHAR(50) DEFAULT 'easy',
          min_participants INT DEFAULT 1 NOT NULL,
          max_participants INT,
          languages JSON,
          inclusions JSON,
          exclusions JSON,
          requirements JSON,
          cancellation_policy TEXT,
          contact_info JSON,
          images JSON,
          cover_image TEXT NOT NULL,
          average_rating DECIMAL(3,2) DEFAULT 0.00,
          total_ratings INT DEFAULT 0 NOT NULL,
          is_active BOOLEAN DEFAULT TRUE NOT NULL,
          created_by_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
          FOREIGN KEY (created_by_id) REFERENCES users(id)
        )
      `);

      // Recreate activity_reviews table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS activity_reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          activity_id INT NOT NULL,
          user_id INT NOT NULL,
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          review TEXT,
          photos JSON,
          visit_date TIMESTAMP,
          helpful_votes INT DEFAULT 0 NOT NULL,
          is_verified BOOLEAN DEFAULT FALSE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Recreate activity_bookings table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS activity_bookings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          activity_id INT NOT NULL,
          user_id INT NOT NULL,
          participants INT NOT NULL,
          booking_date TIMESTAMP NOT NULL,
          status VARCHAR(50) DEFAULT 'pending' NOT NULL,
          total_amount DECIMAL(10,2),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      await connection.execute("DELETE FROM expense_splits");
      await connection.execute("DELETE FROM expenses");
      await connection.execute("DELETE FROM messages");
      await connection.execute("DELETE FROM trip_participants");
      await connection.execute("DELETE FROM trip_requests");
      await connection.execute("DELETE FROM trips");
      await connection.execute("DELETE FROM user_ratings");
      await connection.execute("DELETE FROM destination_ratings");
      await connection.execute("DELETE FROM verification_requests");
      await connection.execute("DELETE FROM users");
      
      // Reset auto-increment counters
      await connection.execute("ALTER TABLE users AUTO_INCREMENT = 1");
      await connection.execute("ALTER TABLE trips AUTO_INCREMENT = 1");
      await connection.execute("ALTER TABLE activities AUTO_INCREMENT = 1");
      await connection.execute("ALTER TABLE messages AUTO_INCREMENT = 1");
      await connection.execute("ALTER TABLE expenses AUTO_INCREMENT = 1");
      
      console.log("✅ Dados limpos com sucesso");
      
      console.log("🌱 Iniciando população completa do banco de dados...");
      const { seedDatabase } = await import("./seed-database");
      await seedDatabase();
      
    } catch (error) {
      console.error("❌ Erro ao limpar/popular banco:", error);
    }

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

    console.log("✅ Tabelas MySQL inicializadas com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao inicializar tabelas MySQL:", error);
    return false;
  }
}
  console.log("📦 Migrando dados da memória para o banco MySQL...");
  
