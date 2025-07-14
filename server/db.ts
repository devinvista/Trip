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
        receipt_url TEXT,
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

    // Create activities table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price_range VARCHAR(50) NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        min_participants INT NOT NULL,
        max_participants INT NOT NULL,
        image_url TEXT,
        contact_info JSON,
        created_by_id INT NOT NULL,
        average_rating DECIMAL(3,2) DEFAULT 0.00,
        total_reviews INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
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
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_activity_review (activity_id, user_id)
      )
    `);

    // Create activity_bookings table
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

    console.log("✅ Todas as tabelas criadas com sucesso!");
    
    // Migrate data from memory storage to database
    await migrateDataToDatabase();

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

// Migrate existing data from memory storage to database
async function migrateDataToDatabase() {
  console.log("📦 Migrando dados da memória para o banco MySQL...");
  
  try {
    // Clear existing data for fresh migration
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    await connection.execute("TRUNCATE TABLE expense_splits");
    await connection.execute("TRUNCATE TABLE expenses");
    await connection.execute("TRUNCATE TABLE activity_reviews");
    await connection.execute("TRUNCATE TABLE activity_bookings");
    await connection.execute("TRUNCATE TABLE activities");
    await connection.execute("TRUNCATE TABLE verification_requests");
    await connection.execute("TRUNCATE TABLE destination_ratings");
    await connection.execute("TRUNCATE TABLE user_ratings");
    await connection.execute("TRUNCATE TABLE messages");
    await connection.execute("TRUNCATE TABLE trip_requests");
    await connection.execute("TRUNCATE TABLE trip_participants");
    await connection.execute("TRUNCATE TABLE trips");
    await connection.execute("TRUNCATE TABLE users");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
    
    // Create test users
    const testUsers = [
      {
        username: 'tom',
        password: '$scrypt$N=16384,r=8,p=1$7fW/8E1YKqmH0dY8S8E6ZQ$rCcmJzPcLPKVQWq4ZG7eJcFdB8S5Wt6XyQcLkMv4pAz7nR9T2Y5L8aF3vH1mK9sE',
        email: 'tom@email.com',
        full_name: 'Tom Tubin',
        phone: '(51) 99999-0001',
        bio: 'Aventureiro apaixonado por trilhas e natureza',
        location: 'Porto Alegre, RS',
        travel_style: 'aventura',
        is_verified: true,
        verification_method: 'email'
      },
      {
        username: 'maria',
        password: '$scrypt$N=16384,r=8,p=1$7fW/8E1YKqmH0dY8S8E6ZQ$rCcmJzPcLPKVQWq4ZG7eJcFdB8S5Wt6XyQcLkMv4pAz7nR9T2Y5L8aF3vH1mK9sE',
        email: 'maria@email.com',
        full_name: 'Maria Santos',
        phone: '(11) 98888-0002',
        bio: 'Exploradora urbana que ama conhecer culturas',
        location: 'São Paulo, SP',
        travel_style: 'culturais',
        is_verified: true,
        verification_method: 'phone'
      },
      {
        username: 'carlos',
        password: '$scrypt$N=16384,r=8,p=1$7fW/8E1YKqmH0dY8S8E6ZQ$rCcmJzPcLPKVQWq4ZG7eJcFdB8S5Wt6XyQcLkMv4pAz7nR9T2Y5L8aF3vH1mK9sE',
        email: 'carlos@email.com',
        full_name: 'Carlos Oliveira',
        phone: '(21) 97777-0003',
        bio: 'Surfista carioca apaixonado por praias',
        location: 'Rio de Janeiro, RJ',
        travel_style: 'praia',
        is_verified: true,
        verification_method: 'document'
      },
      {
        username: 'ana',
        password: '$scrypt$N=16384,r=8,p=1$7fW/8E1YKqmH0dY8S8E6ZQ$rCcmJzPcLPKVQWq4ZG7eJcFdB8S5Wt6XyQcLkMv4pAz7nR9T2Y5L8aF3vH1mK9sE',
        email: 'ana@email.com',
        full_name: 'Ana Costa',
        phone: '(31) 96666-0004',
        bio: 'Fotógrafa que documenta suas viagens',
        location: 'Belo Horizonte, MG',
        travel_style: 'natureza',
        is_verified: false
      },
      {
        username: 'ricardo',
        password: '$scrypt$N=16384,r=8,p=1$7fW/8E1YKqmH0dY8S8E6ZQ$rCcmJzPcLPKVQWq4ZG7eJcFdB8S5Wt6XyQcLkMv4pAz7nR9T2Y5L8aF3vH1mK9sE',
        email: 'ricardo@email.com',
        full_name: 'Ricardo Silva',
        phone: '(85) 95555-0005',
        bio: 'Empresário que busca aventuras radicais',
        location: 'Fortaleza, CE',
        travel_style: 'aventura',
        is_verified: false
      },
      {
        username: 'julia',
        password: '$scrypt$N=16384,r=8,p=1$7fW/8E1YKqmH0dY8S8E6ZQ$rCcmJzPcLPKVQWq4ZG7eJcFdB8S5Wt6XyQcLkMv4pAz7nR9T2Y5L8aF3vH1mK9sE',
        email: 'julia@email.com',
        full_name: 'Julia Fernandes',
        phone: '(47) 94444-0006',
        bio: 'Professora que adora história e patrimônio',
        location: 'Florianópolis, SC',
        travel_style: 'culturais',
        is_verified: false
      }
    ];

    // Insert users
    for (const user of testUsers) {
      await connection.execute(`
        INSERT INTO users (username, password, email, full_name, phone, bio, location, travel_style, is_verified, verification_method)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        user.username, 
        user.password, 
        user.email, 
        user.full_name, 
        user.phone, 
        user.bio || null, 
        user.location || null, 
        user.travel_style || null, 
        user.is_verified || false, 
        user.verification_method || null
      ]);
    }
    console.log("✅ Usuários de teste migrados para o banco");

    // Create test trips
    const testTrips = [
      {
        creator_id: 1, // tom
        title: 'Trilha na Chapada Diamantina',
        destination: 'Chapada Diamantina, BA',
        cover_image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
        start_date: '2025-08-15',
        end_date: '2025-08-20',
        budget: 2500,
        budget_breakdown: JSON.stringify({
          transport: 800,
          accommodation: 600,
          food: 500,
          activities: 400,
          insurance: 100,
          other: 100
        }),
        max_participants: 8,
        current_participants: 1,
        description: 'Aventura incrível pela Chapada Diamantina com trilhas, cachoeiras e paisagens de tirar o fôlego.',
        travel_style: 'aventura',
        planned_activities: JSON.stringify([
          {
            id: 1,
            name: 'Cachoeira da Fumaça',
            description: 'Trilha até a impressionante Cachoeira da Fumaça',
            estimatedCost: 150,
            priority: 'high'
          }
        ])
      },
      {
        creator_id: 1, // tom
        title: 'Fim de semana relaxante em Campos do Jordão',
        destination: 'Campos do Jordão, SP',
        cover_image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
        start_date: '2025-07-25',
        end_date: '2025-07-27',
        budget: 1200,
        budget_breakdown: JSON.stringify({
          transport: 300,
          accommodation: 400,
          food: 300,
          activities: 150,
          other: 50
        }),
        max_participants: 4,
        current_participants: 1,
        description: 'Escapada relaxante para Campos do Jordão com clima de montanha, vinícolas e gastronomia.',
        travel_style: 'natureza',
        planned_activities: JSON.stringify([])
      },
      {
        creator_id: 2, // maria
        title: 'Praia e Cultura no Rio de Janeiro',
        destination: 'Rio de Janeiro, RJ',
        cover_image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80',
        start_date: '2025-09-10',
        end_date: '2025-09-15',
        budget: 3000,
        budget_breakdown: JSON.stringify({
          transport: 600,
          accommodation: 800,
          food: 700,
          activities: 600,
          insurance: 150,
          other: 150
        }),
        max_participants: 6,
        current_participants: 2,
        description: 'Combine o melhor do Rio: praias paradisíacas, pontos turísticos icônicos e vida cultural vibrante.',
        travel_style: 'praia',
        planned_activities: JSON.stringify([])
      },
      {
        creator_id: 1, // tom
        title: 'Cruzeiro pelo Mediterrâneo',
        destination: 'Mediterrâneo',
        cover_image: 'https://guiaviajarmelhor.com.br/wp-content/uploads/2019/01/Curiosidades-cruzeiro-navio-1.jpg',
        start_date: '2025-10-20',
        end_date: '2025-10-30',
        budget: 8000,
        budget_breakdown: JSON.stringify({
          transport: 2000,
          accommodation: 3000,
          food: 1500,
          activities: 1000,
          insurance: 300,
          other: 200
        }),
        max_participants: 12,
        current_participants: 1,
        description: 'Cruzeiro luxuoso pelo Mar Mediterrâneo visitando destinos icônicos da Europa.',
        travel_style: 'cruzeiros',
        planned_activities: JSON.stringify([])
      }
    ];

    // Insert trips
    for (const trip of testTrips) {
      await connection.execute(`
        INSERT INTO trips (creator_id, title, destination, cover_image, start_date, end_date, budget, budget_breakdown, max_participants, current_participants, description, travel_style, planned_activities)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        trip.creator_id, 
        trip.title, 
        trip.destination, 
        trip.cover_image || null, 
        trip.start_date, 
        trip.end_date, 
        trip.budget || null, 
        trip.budget_breakdown, 
        trip.max_participants, 
        trip.current_participants, 
        trip.description, 
        trip.travel_style, 
        trip.planned_activities
      ]);
    }
    console.log("✅ Viagens de teste migradas para o banco");

    // Add trip participants
    const tripParticipants = [
      { trip_id: 3, user_id: 1, status: 'accepted' }, // tom participa da viagem da maria
      { trip_id: 1, user_id: 1, status: 'accepted' }, // tom é criador da primeira viagem
      { trip_id: 2, user_id: 1, status: 'accepted' }, // tom é criador da segunda viagem
      { trip_id: 3, user_id: 2, status: 'accepted' }, // maria é criadora da terceira viagem
      { trip_id: 4, user_id: 1, status: 'accepted' }  // tom é criador da quarta viagem
    ];

    for (const participant of tripParticipants) {
      await connection.execute(`
        INSERT INTO trip_participants (trip_id, user_id, status)
        VALUES (?, ?, ?)
      `, [participant.trip_id, participant.user_id, participant.status]);
    }
    console.log("✅ Participantes das viagens migrados para o banco");

    console.log("✅ Migração de dados concluída com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro na migração de dados:", error);
  }
}