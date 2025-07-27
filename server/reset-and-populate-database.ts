import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { 
  users, trips, tripParticipants, messages, tripRequests, 
  expenses, expenseSplits, userRatings, activities, 
  activityReviews, activityBudgetProposals, referralCodes 
} from "../shared/schema";
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

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "srv1661.hstgr.io",
  user: process.env.DB_USER || "u298726655_partiutrip",
  password: process.env.DB_PASSWORD || "PartiuTrip2024!",
  database: process.env.DB_NAME || "u298726655_partiutrip",
  ssl: undefined
});

// Remove the global connection and db initialization

async function dropAllTables(connection: any) {
  console.log("🗑️ Removendo todas as tabelas...");
  
  const tables = [
    'expense_splits', 'expenses', 'user_ratings', 'activity_reviews', 
    'activity_budget_proposals', 'trip_requests', 'messages', 
    'trip_participants', 'trips', 'activities', 'referral_codes', 'users'
  ];
  
  for (const table of tables) {
    try {
      await connection.execute(`DROP TABLE IF EXISTS ${table}`);
      console.log(`✅ Tabela ${table} removida`);
    } catch (error) {
      console.log(`⚠️ Erro ao remover ${table}:`, error);
    }
  }
}

async function createTables(connection: any) {
  console.log("🏗️ Criando todas as tabelas...");
  
  // Criar tabela de usuários
  await connection.execute(`
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
  `);

  // Criar tabela de viagens
  await connection.execute(`
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
  `);

  // Criar tabela de participantes
  await connection.execute(`
    CREATE TABLE trip_participants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trip_id INT NOT NULL,
      user_id INT NOT NULL,
      status VARCHAR(50) DEFAULT 'pending' NOT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (trip_id) REFERENCES trips(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Criar tabela de mensagens
  await connection.execute(`
    CREATE TABLE messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trip_id INT NOT NULL,
      sender_id INT NOT NULL,
      content TEXT NOT NULL,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (trip_id) REFERENCES trips(id),
      FOREIGN KEY (sender_id) REFERENCES users(id)
    )
  `);

  // Criar tabela de solicitações
  await connection.execute(`
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
  `);

  // Criar tabela de atividades
  await connection.execute(`
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
  `);

  // Criar outras tabelas necessárias
  await connection.execute(`
    CREATE TABLE expenses (
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
    )
  `);

  await connection.execute(`
    CREATE TABLE expense_splits (
      id INT AUTO_INCREMENT PRIMARY KEY,
      expense_id INT NOT NULL,
      user_id INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      paid BOOLEAN DEFAULT FALSE NOT NULL,
      settled_at TIMESTAMP,
      FOREIGN KEY (expense_id) REFERENCES expenses(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await connection.execute(`
    CREATE TABLE user_ratings (
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
    )
  `);

  await connection.execute(`
    CREATE TABLE activity_reviews (
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
    )
  `);

  await connection.execute(`
    CREATE TABLE activity_budget_proposals (
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
    )
  `);

  await connection.execute(`
    CREATE TABLE referral_codes (
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
    )
  `);

  console.log("✅ Todas as tabelas criadas com sucesso!");
}

async function insertInitialData(connection: any) {
  console.log("📊 Inserindo dados iniciais...");

  // Criar usuários de teste
  const tomPassword = await hashPassword("password123");
  const mariaPassword = await hashPassword("password123");
  const carlosPassword = await hashPassword("password123");

  await connection.execute(`
    INSERT INTO users (username, password, email, full_name, phone, bio, location, languages, interests, travel_styles, is_verified, average_rating, total_ratings) VALUES
    ('tom', ?, 'tom@teste.com', 'Tom Tubin', '(51) 99999-1111', 'Aventureiro nato, amo conhecer novas culturas e fazer amizades pelo mundo.', 'Porto Alegre, RS', '["Português", "Inglês", "Espanhol"]', '["Aventura", "Cultura", "Gastronomia", "Natureza"]', '["aventura", "culturais", "urbanas"]', TRUE, 4.8, 23),
    ('maria', ?, 'maria@teste.com', 'Maria Silva', '(11) 98888-2222', 'Apaixonada por viagens culturais e experiências gastronômicas autênticas.', 'São Paulo, SP', '["Português", "Inglês", "Francês"]', '["Cultura", "Gastronomia", "Arte", "História"]', '["culturais", "gastronômicas", "urbanas"]', TRUE, 4.9, 31),
    ('carlos', ?, 'carlos@teste.com', 'Carlos Santos', '(21) 97777-3333', 'Explorador de praias paradisíacas e trilhas desafiadoras.', 'Rio de Janeiro, RJ', '["Português", "Inglês"]', '["Praia", "Aventura", "Esportes", "Natureza"]', '["praia", "aventura", "natureza"]', TRUE, 4.7, 18)
  `, [tomPassword, mariaPassword, carlosPassword]);

  // Criar atividades brasileiras
  await connection.execute(`
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
  `);

  // Criar viagens de exemplo
  await connection.execute(`
    INSERT INTO trips (creator_id, title, localidade, cover_image, start_date, end_date, budget, max_participants, description, travel_style, status) VALUES
    (1, 'Aventura na Chapada Diamantina', 'Lençóis, BA', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop&q=85', '2025-08-15 08:00:00', '2025-08-20 18:00:00', 2500, 6, 'Exploração completa da Chapada Diamantina com trilhas, cachoeiras e acampamentos sob as estrelas. Uma jornada inesquecível pela natureza baiana.', 'aventura', 'open'),
    (2, 'Cultura e Gastronomia em Ouro Preto', 'Ouro Preto, MG', 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=800&fit=crop&q=85', '2025-09-10 09:00:00', '2025-09-13 17:00:00', 1800, 4, 'Imersão na história colonial brasileira com visitas a museus, igrejas barrocas e degustação da culinária mineira tradicional.', 'culturais', 'open'),
    (3, 'Paraíso em Maragogi', 'Maragogi, AL', 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=1200&h=800&fit=crop&q=85', '2025-07-28 06:00:00', '2025-08-02 20:00:00', 3200, 5, 'Relaxamento total nas praias paradisíacas de Maragogi com mergulhos nas piscinas naturais e hospedagem pé na areia.', 'praia', 'open'),
    (1, 'Ecoturismo em Bonito', 'Bonito, MS', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop&q=85', '2025-10-05 07:00:00', '2025-10-10 19:00:00', 2800, 4, 'Aventura aquática em Bonito com flutuação em rios cristalinos, visita a grutas e observação da fauna local.', 'natureza', 'open'),
    (2, 'Romance na Serra Gaúcha', 'Gramado, RS', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&q=85', '2025-11-20 10:00:00', '2025-11-24 16:00:00', 2200, 2, 'Escapada romântica pela Serra Gaúcha com degustação de vinhos, passeios pela natureza e hospedagem em hotel boutique.', 'romanticas', 'open')
  `);

  // Adicionar participantes às viagens
  await connection.execute(`
    INSERT INTO trip_participants (trip_id, user_id, status) VALUES
    (1, 1, 'accepted'),
    (1, 2, 'accepted'),
    (1, 3, 'pending'),
    (2, 2, 'accepted'),
    (2, 1, 'accepted'),
    (3, 3, 'accepted'),
    (3, 1, 'pending'),
    (4, 1, 'accepted'),
    (4, 3, 'accepted'),
    (5, 2, 'accepted')
  `);

  // Criar propostas de orçamento para atividades
  await connection.execute(`
    INSERT INTO activity_budget_proposals (activity_id, title, description, price_per_person, inclusions, exclusions, vote_count) VALUES
    (1, 'Pacote Econômico', 'Tour básico aos principais pontos turísticos', 180.00, '["Transporte", "Guia local", "Seguro"]', '["Alimentação", "Entrada no Pão de Açúcar"]', 12),
    (1, 'Pacote Completo', 'Experiência completa com todas as atrações', 320.00, '["Transporte", "Guia especializado", "Alimentação", "Entradas", "Seguro"]', '["Hospedagem"]', 8),
    (2, 'Trilha Guiada', 'Caminhada com guia experiente e lanche', 85.00, '["Guia local", "Lanche", "Seguro"]', '["Transporte", "Equipamentos"]', 15),
    (3, 'Passeio Tradicional', 'Tour de escuna com paradas nas ilhas', 120.00, '["Transporte marítimo", "Guia", "Seguro"]', '["Alimentação", "Equipamentos de mergulho"]', 24),
    (4, 'Flutuação Premium', 'Experiência completa com equipamentos inclusos', 280.00, '["Equipamentos", "Guia especializado", "Lanche", "Transporte", "Seguro"]', '["Hospedagem"]', 18)
  `);

  // Criar algumas avaliações de atividades
  await connection.execute(`
    INSERT INTO activity_reviews (activity_id, user_id, rating, comment, visit_date, helpful_count, is_verified) VALUES
    (1, 2, 5, 'Vista espetacular! O Cristo Redentor é realmente uma das maravilhas do mundo. Tour muito bem organizado.', '2025-06-15', 8, TRUE),
    (1, 3, 4, 'Experiência incrível, mas muito movimentado. Recomendo ir bem cedo para evitar multidões.', '2025-06-20', 5, TRUE),
    (2, 1, 5, 'Trilha maravilhosa com uma das melhores vistas do Rio! Perfeita para o pôr do sol.', '2025-06-25', 12, TRUE),
    (3, 2, 5, 'Passeio fantástico! As águas de Angra são cristalinas e o atendimento foi excelente.', '2025-07-01', 9, TRUE),
    (4, 3, 5, 'Flutuação incrível! A natureza de Bonito é única no mundo. Experiência inesquecível!', '2025-07-10', 15, TRUE)
  `);

  // Criar códigos de indicação
  await connection.execute(`
    INSERT INTO referral_codes (code, user_id, type, discount_percentage, max_uses, current_uses, is_active) VALUES
    ('PARTIU-TOM01', 1, 'user_referral', 10, 5, 0, TRUE),
    ('PARTIU-MARIA02', 2, 'user_referral', 10, 5, 1, TRUE),
    ('PARTIU-CARLOS03', 3, 'user_referral', 10, 5, 0, TRUE),
    ('WELCOME2025', NULL, 'promotional', 15, 100, 23, TRUE),
    ('AVENTURA20', NULL, 'promotional', 20, 50, 8, TRUE)
  `);

  console.log("✅ Dados iniciais inseridos com sucesso!");
}

async function main() {
  let connection;
  try {
    console.log("🚀 Iniciando recriação do banco de dados MySQL...");
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "srv1661.hstgr.io",
      user: process.env.DB_USER || "u298726655_partiutrip",
      password: process.env.DB_PASSWORD || "PartiuTrip2024!",
      database: process.env.DB_NAME || "u298726655_partiutrip",
      ssl: undefined
    });
    
    await dropAllTables(connection);
    await createTables(connection);
    await insertInitialData(connection);
    
    console.log("🎉 Banco de dados MySQL recriado com sucesso!");
    console.log("📊 Dados disponíveis:");
    console.log("   - 3 usuários (tom, maria, carlos)");
    console.log("   - 10 atividades brasileiras");
    console.log("   - 5 viagens de exemplo");
    console.log("   - Participantes e avaliações");
    console.log("   - Códigos de indicação ativos");
    
  } catch (error) {
    console.error("❌ Erro durante a recriação:", error);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

main();