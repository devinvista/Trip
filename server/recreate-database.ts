import { db } from "./db";
import * as crypto from "crypto";

// Hash password function  
function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex') + '.' + salt);
    });
  });
}

async function recreateDatabase() {
  console.log("🚀 Recriando banco de dados MySQL com dados em português...");

  try {
    // Drop all tables
    console.log("🗑️ Removendo tabelas existentes...");
    const tables = [
      'expense_splits', 'expenses', 'user_ratings', 'activity_reviews',
      'activity_budget_proposals', 'trip_requests', 'messages',
      'trip_participants', 'trips', 'activities', 'referral_codes', 'users'
    ];

    for (const table of tables) {
      try {
        await db.execute(`DROP TABLE IF EXISTS ${table}` as any);
        console.log(`✅ Tabela ${table} removida`);
      } catch (error) {
        console.log(`⚠️ Tabela ${table} não existia`);
      }
    }

    // Create users table
    console.log("🏗️ Criando tabela de usuários...");
    await db.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        bio TEXT,
        location VARCHAR(255),
        profile_photo TEXT,
        languages JSON,
        interests JSON,
        travel_styles JSON,
        referred_by VARCHAR(50),
        is_verified BOOLEAN DEFAULT FALSE NOT NULL,
        verification_method VARCHAR(50),
        average_rating DECIMAL(3,2) DEFAULT 5.00,
        total_ratings INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    ` as any);

    // Create trips table
    console.log("🏗️ Criando tabela de viagens...");
    await db.execute(`
      CREATE TABLE trips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        creator_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        localidade VARCHAR(255) NOT NULL,
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
    ` as any);

    // Create trip_participants table
    console.log("🏗️ Criando tabela de participantes...");
    await db.execute(`
      CREATE TABLE trip_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trip_id INT NOT NULL,
        user_id INT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    ` as any);

    // Create activities table
    console.log("🏗️ Criando tabela de atividades...");
    await db.execute(`
      CREATE TABLE activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        duration_hours INT NOT NULL,
        difficulty_level VARCHAR(50) NOT NULL,
        price_range VARCHAR(50) NOT NULL,
        image_url TEXT,
        rating DECIMAL(3,2) DEFAULT 0.00,
        review_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    ` as any);

    // Create other essential tables
    await db.execute(`
      CREATE TABLE messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trip_id INT NOT NULL,
        sender_id INT NOT NULL,
        content TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips(id),
        FOREIGN KEY (sender_id) REFERENCES users(id)
      )
    ` as any);

    await db.execute(`
      CREATE TABLE trip_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trip_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    ` as any);

    // Create remaining tables quickly
    const otherTables = [
      `CREATE TABLE expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trip_id INT NOT NULL,
        paid_by INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'other' NOT NULL,
        receipt TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        settled_at TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id),
        FOREIGN KEY (paid_by) REFERENCES users(id)
      )`,
      `CREATE TABLE expense_splits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        expense_id INT NOT NULL,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        paid BOOLEAN DEFAULT FALSE NOT NULL,
        settled_at TIMESTAMP,
        FOREIGN KEY (expense_id) REFERENCES expenses(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      `CREATE TABLE user_ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trip_id INT NOT NULL,
        rated_user_id INT NOT NULL,
        rater_user_id INT NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips(id),
        FOREIGN KEY (rated_user_id) REFERENCES users(id),
        FOREIGN KEY (rater_user_id) REFERENCES users(id)
      )`,
      `CREATE TABLE activity_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        photos JSON,
        visit_date DATE,
        helpful_count INT DEFAULT 0,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (activity_id) REFERENCES activities(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      `CREATE TABLE activity_budget_proposals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price_per_person DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'BRL' NOT NULL,
        inclusions JSON,
        exclusions JSON,
        vote_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (activity_id) REFERENCES activities(id)
      )`,
      `CREATE TABLE referral_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        user_id INT,
        type VARCHAR(50) NOT NULL,
        discount_percentage INT DEFAULT 0,
        max_uses INT DEFAULT 1,
        current_uses INT DEFAULT 0,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`
    ];

    for (const sql of otherTables) {
      await db.execute(sql as any);
    }

    console.log("✅ Todas as tabelas criadas!");

    // Insert initial data
    console.log("📊 Inserindo dados iniciais...");

    // Create test users
    const tomPassword = await hashPassword("password123");
    const mariaPassword = await hashPassword("password123");
    const carlosPassword = await hashPassword("password123");

    await db.execute(`
      INSERT INTO users (username, password, email, full_name, phone, bio, location, languages, interests, travel_styles, is_verified, average_rating, total_ratings) VALUES
      ('tom', ?, 'tom@teste.com', 'Tom Tubin', '(51) 99999-1111', 'Aventureiro nato, amo conhecer novas culturas e fazer amizades pelo mundo.', 'Porto Alegre, RS', '["Português", "Inglês", "Espanhol"]', '["Aventura", "Cultura", "Gastronomia", "Natureza"]', '["aventura", "culturais", "urbanas"]', TRUE, 4.8, 23),
      ('maria', ?, 'maria@teste.com', 'Maria Silva', '(11) 98888-2222', 'Apaixonada por viagens culturais e experiências gastronômicas autênticas.', 'São Paulo, SP', '["Português", "Inglês", "Francês"]', '["Cultura", "Gastronomia", "Arte", "História"]', '["culturais", "gastronômicas", "urbanas"]', TRUE, 4.9, 31),
      ('carlos', ?, 'carlos@teste.com', 'Carlos Santos', '(21) 97777-3333', 'Explorador de praias paradisíacas e trilhas desafiadoras.', 'Rio de Janeiro, RJ', '["Português", "Inglês"]', '["Praia", "Aventura", "Esportes", "Natureza"]', '["praia", "aventura", "natureza"]', TRUE, 4.7, 18)
    ` as any, [tomPassword, mariaPassword, carlosPassword]);

    // Create Brazilian activities
    await db.execute(`
      INSERT INTO activities (title, description, location, category, duration_hours, difficulty_level, price_range, image_url, rating, review_count) VALUES
      ('Cristo Redentor e Pão de Açúcar', 'Tour completo pelos principais cartões postais do Rio de Janeiro com vista panorâmica da cidade maravilhosa.', 'Rio de Janeiro, RJ', 'pontos_turisticos', 8, 'fácil', 'R$ 150-300', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&h=800&fit=crop&q=85', 4.8, 145),
      ('Trilha da Pedra Bonita', 'Caminhada moderada com vista espetacular da Barra da Tijuca e São Conrado, ideal para o pôr do sol.', 'Rio de Janeiro, RJ', 'hiking', 4, 'moderada', 'R$ 50-100', 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=1200&h=800&fit=crop&q=85', 4.6, 89),
      ('Passeio de Escuna em Angra dos Reis', 'Tour de barco pelas ilhas paradisíacas com paradas para banho em águas cristalinas.', 'Angra dos Reis, RJ', 'water_sports', 6, 'fácil', 'R$ 80-200', 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=1200&h=800&fit=crop&q=85', 4.7, 203),
      ('Flutuação no Rio da Prata', 'Experiência única de snorkeling em águas cristalinas com peixes coloridos em Bonito.', 'Bonito, MS', 'water_sports', 3, 'fácil', 'R$ 200-350', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop&q=85', 4.9, 167),
      ('Gruta do Lago Azul', 'Visita à impressionante caverna com lago de águas azul-turquesa, patrimônio natural de Bonito.', 'Bonito, MS', 'nature', 2, 'fácil', 'R$ 60-120', 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1200&h=800&fit=crop&q=85', 4.8, 134),
      ('Mini Mundo Gramado', 'Parque temático com réplicas em miniatura de famosos monumentos e paisagens europeias.', 'Gramado, RS', 'cultural', 3, 'fácil', 'R$ 40-80', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&q=85', 4.5, 98),
      ('Tour de Vinícolas no Vale dos Vinhedos', 'Degustação de vinhos artesanais nas melhores vinícolas da Serra Gaúcha.', 'Bento Gonçalves, RS', 'food_tours', 6, 'fácil', 'R$ 120-250', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&q=85', 4.7, 76),
      ('Parque Nacional da Chapada Diamantina', 'Trekking pelas cachoeiras e formações rochosas mais belas da Bahia.', 'Lençóis, BA', 'hiking', 8, 'difícil', 'R$ 100-250', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop&q=85', 4.9, 112),
      ('Passeio de Jangada em Maragogi', 'Tour pelas piscinas naturais de águas cristalinas no Caribe brasileiro.', 'Maragogi, AL', 'water_sports', 4, 'fácil', 'R$ 70-150', 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=1200&h=800&fit=crop&q=85', 4.8, 189),
      ('Centro Histórico de Ouro Preto', 'Caminhada guiada pelas ruas históricas e igrejas barrocas da cidade colonial.', 'Ouro Preto, MG', 'cultural', 4, 'fácil', 'R$ 30-80', 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=800&fit=crop&q=85', 4.6, 87)
    ` as any);

    // Create sample trips
    await db.execute(`
      INSERT INTO trips (creator_id, title, localidade, cover_image, start_date, end_date, budget, max_participants, description, travel_style, status) VALUES
      (1, 'Aventura na Chapada Diamantina', 'Lençóis, BA', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop&q=85', '2025-08-15 08:00:00', '2025-08-20 18:00:00', 2500, 6, 'Exploração completa da Chapada Diamantina com trilhas, cachoeiras e acampamentos sob as estrelas. Uma jornada inesquecível pela natureza baiana.', 'aventura', 'open'),
      (2, 'Cultura e Gastronomia em Ouro Preto', 'Ouro Preto, MG', 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=800&fit=crop&q=85', '2025-09-10 09:00:00', '2025-09-13 17:00:00', 1800, 4, 'Imersão na história colonial brasileira com visitas a museus, igrejas barrocas e degustação da culinária mineira tradicional.', 'culturais', 'open'),
      (3, 'Paraíso em Maragogi', 'Maragogi, AL', 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=1200&h=800&fit=crop&q=85', '2025-07-28 06:00:00', '2025-08-02 20:00:00', 3200, 5, 'Relaxamento total nas praias paradisíacas de Maragogi com mergulhos nas piscinas naturais e hospedagem pé na areia.', 'praia', 'open'),
      (1, 'Ecoturismo em Bonito', 'Bonito, MS', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop&q=85', '2025-10-05 07:00:00', '2025-10-10 19:00:00', 2800, 4, 'Aventura aquática em Bonito com flutuação em rios cristalinos, visita a grutas e observação da fauna local.', 'natureza', 'open'),
      (2, 'Romance na Serra Gaúcha', 'Gramado, RS', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&q=85', '2025-11-20 10:00:00', '2025-11-24 16:00:00', 2200, 2, 'Escapada romântica pela Serra Gaúcha com degustação de vinhos, passeios pela natureza e hospedagem em hotel boutique.', 'romanticas', 'open')
    ` as any);

    // Add trip participants
    await db.execute(`
      INSERT INTO trip_participants (trip_id, user_id, status) VALUES
      (1, 1, 'accepted'),
      (1, 2, 'accepted'),
      (2, 2, 'accepted'),
      (2, 1, 'accepted'),
      (3, 3, 'accepted'),
      (4, 1, 'accepted'),
      (5, 2, 'accepted')
    ` as any);

    console.log("🎉 Banco de dados recriado com sucesso!");
    console.log("📊 Dados carregados:");
    console.log("   - 3 usuários: tom, maria, carlos");
    console.log("   - 10 atividades brasileiras");
    console.log("   - 5 viagens de exemplo");
    console.log("   - Participantes configurados");
    console.log("💻 Login: tom / password123");

  } catch (error) {
    console.error("❌ Erro durante recriação:", error);
  }
}

recreateDatabase();