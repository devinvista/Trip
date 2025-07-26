import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function rebuildActivitiesSchema() {
  try {
    console.log('🔄 Reconstruindo schema completo de atividades...');

    // 1. Desabilitar verificações de chave estrangeira temporariamente
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);

    // 2. Remover tabela de atividades existente
    console.log('🗑️ Removendo tabela de atividades antiga...');
    await db.execute(sql`DROP TABLE IF EXISTS activities`);
    await db.execute(sql`DROP TABLE IF EXISTS activity_reviews`);
    await db.execute(sql`DROP TABLE IF EXISTS activity_budget_proposals`);

    // 3. Primeiro, vamos garantir que temos uma tabela de destinos robusta
    console.log('🌍 Criando/atualizando tabela de destinos...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS destinations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        state VARCHAR(100),
        country VARCHAR(100) NOT NULL,
        country_type ENUM('nacional', 'internacional') NOT NULL,
        region VARCHAR(100),
        continent VARCHAR(100) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        timezone VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX idx_name (name),
        INDEX idx_country_type (country_type),
        INDEX idx_region (region)
      )
    `);

    // 4. Inserir destinos básicos
    console.log('📍 Inserindo destinos básicos...');
    await db.execute(sql`
      INSERT IGNORE INTO destinations (name, state, country, country_type, region, continent) VALUES
      ('Rio de Janeiro', 'RJ', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'),
      ('São Paulo', 'SP', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'),
      ('Salvador', 'BA', 'Brasil', 'nacional', 'Nordeste', 'América do Sul'),
      ('Gramado', 'RS', 'Brasil', 'nacional', 'Sul', 'América do Sul'),
      ('Bonito', 'MS', 'Brasil', 'nacional', 'Centro-Oeste', 'América do Sul'),
      ('Paris', NULL, 'França', 'internacional', 'Europa Ocidental', 'Europa'),
      ('Londres', NULL, 'Reino Unido', 'internacional', 'Europa Ocidental', 'Europa'),
      ('Nova York', 'NY', 'Estados Unidos', 'internacional', 'América do Norte', 'América do Norte'),
      ('Buenos Aires', NULL, 'Argentina', 'internacional', 'América do Sul', 'América do Sul'),
      ('Roma', NULL, 'Itália', 'internacional', 'Europa Meridional', 'Europa')
    `);

    // 5. Criar nova tabela de atividades com relacionamento por nome de destino
    console.log('🎯 Criando nova tabela de atividades...');
    await db.execute(sql`
      CREATE TABLE activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        destination_name VARCHAR(255) NOT NULL,
        category ENUM('adventure', 'cultural', 'food_tours', 'hiking', 'nature', 'pontos_turisticos', 'water_sports', 'wildlife') NOT NULL,
        difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'easy' NOT NULL,
        duration VARCHAR(100) NOT NULL,
        min_participants INT DEFAULT 1 NOT NULL,
        max_participants INT DEFAULT 50 NOT NULL,
        languages JSON,
        inclusions JSON,
        exclusions JSON,
        requirements JSON,
        cancellation_policy TEXT,
        contact_info JSON,
        cover_image TEXT NOT NULL,
        images JSON,
        average_rating DECIMAL(3, 2) DEFAULT 5.00 NOT NULL,
        total_ratings INT DEFAULT 0 NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_by_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        
        -- Campos herdados do destino (preenchidos automaticamente via trigger)
        city VARCHAR(255),
        state VARCHAR(100),
        country VARCHAR(100),
        country_type ENUM('nacional', 'internacional'),
        region VARCHAR(100),
        continent VARCHAR(100),
        
        FOREIGN KEY (destination_name) REFERENCES destinations(name) ON UPDATE CASCADE,
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_destination (destination_name),
        INDEX idx_category (category),
        INDEX idx_difficulty (difficulty_level),
        INDEX idx_country_type (country_type),
        INDEX idx_region (region),
        INDEX idx_active (is_active)
      )
    `);

    // 6. Criar tabela de reviews
    console.log('⭐ Criando tabela de avaliações...');
    await db.execute(sql`
      CREATE TABLE activity_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        photos JSON,
        visit_date DATE,
        helpful_votes INT DEFAULT 0 NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE NOT NULL,
        is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
        report_count INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_review (activity_id, user_id),
        INDEX idx_rating (rating),
        INDEX idx_verified (is_verified)
      )
    `);

    // 7. Criar tabela de propostas de orçamento
    console.log('💰 Criando tabela de propostas de orçamento...');
    await db.execute(sql`
      CREATE TABLE activity_budget_proposals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        created_by INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price_type ENUM('per_person', 'per_group', 'fixed') DEFAULT 'per_person' NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'BRL' NOT NULL,
        inclusions JSON,
        exclusions JSON,
        valid_until TIMESTAMP NULL,
        votes INT DEFAULT 0 NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_activity (activity_id),
        INDEX idx_price (amount),
        INDEX idx_active (is_active)
      )
    `);

    // 8. Reabilitar verificações de chave estrangeira
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

    // 9. Inserir atividades de exemplo
    console.log('🎨 Inserindo atividades de exemplo...');
    await db.execute(sql`
      INSERT INTO activities (
        title, description, destination_name, category, difficulty_level, duration,
        min_participants, max_participants, cover_image, created_by_id
      ) VALUES
      (
        'Cristo Redentor e Corcovado',
        'Visite o icônico Cristo Redentor no topo do Corcovado com vistas panorâmicas espetaculares da cidade maravilhosa.',
        'Rio de Janeiro', 'pontos_turisticos', 'easy', '4 horas',
        1, 15, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200&h=800&fit=crop&crop=center&q=85', 1
      ),
      (
        'Pão de Açúcar de Bondinho',
        'Experimente o famoso bondinho do Pão de Açúcar e desfrute de vistas de 360° da baía de Guanabara.',
        'Rio de Janeiro', 'adventure', 'easy', '3 horas',
        1, 20, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&h=800&fit=crop&crop=center&q=85', 1
      ),
      (
        'Museu do Louvre',
        'Explore o maior museu de arte do mundo e monumento histórico em Paris, lar da Mona Lisa.',
        'Paris', 'cultural', 'easy', '5 horas',
        1, 25, 'https://images.unsplash.com/photo-1541950516757-052fbb2c2f9c?w=1200&h=800&fit=crop&crop=center&q=85', 1
      ),
      (
        'Torre Eiffel e Cruzeiro no Sena',
        'Visite o símbolo de Paris e faça um romântico cruzeiro pelo Rio Sena ao pôr do sol.',
        'Paris', 'pontos_turisticos', 'easy', '4 horas',
        1, 30, 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1200&h=800&fit=crop&crop=center&q=85', 1
      ),
      (
        'Tower Bridge Experience',
        'Caminhe pelo piso de vidro da famosa Tower Bridge e visite as salas de máquinas vitorianas.',
        'Londres', 'pontos_turisticos', 'easy', '2 horas',
        1, 30, 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800&fit=crop&crop=center&q=85', 1
      ),
      (
        'Central Park Walking Tour',
        'Descubra as joias escondidas e marcos famosos do Central Park de Manhattan.',
        'Nova York', 'hiking', 'medium', '3 horas',
        1, 12, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop&crop=center&q=85', 1
      ),
      (
        'Floating no Rio da Prata',
        'Flutuação cristalina no Rio da Prata com visibilidade de mais de 50 metros de profundidade.',
        'Bonito', 'water_sports', 'easy', '4 horas',
        2, 8, 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1200&h=800&fit=crop&crop=center&q=85', 1
      ),
      (
        'Gramado Zoo',
        'Visite o zoológico de Gramado e conheça mais de 600 animais de 200 espécies diferentes.',
        'Gramado', 'wildlife', 'easy', '3 horas',
        1, 20, 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=1200&h=800&fit=crop&crop=center&q=85', 1
      )
    `);

    // 10. Inserir propostas de orçamento para as atividades
    console.log('💡 Criando propostas de orçamento...');
    await db.execute(sql`
      INSERT INTO activity_budget_proposals (activity_id, title, description, amount, inclusions, exclusions) VALUES
      (1, 'Econômico', 'Van oficial com entrada incluída', 85.00, '["Transporte", "Entrada", "Seguro"]', '["Alimentação", "Bebidas"]'),
      (1, 'Completo', 'Trem do Corcovado com guia', 160.00, '["Trem histórico", "Guia especializado", "Entrada"]', '["Bebidas alcoólicas"]'),
      (1, 'Premium VIP', 'Tour privativo com fotografia', 320.00, '["Transporte executivo", "Guia bilíngue", "Fotos profissionais"]', '["Compras pessoais"]'),
      (2, 'Ingresso Padrão', 'Bondinho ida e volta', 120.00, '["Bondinho", "Acesso aos dois morros"]', '["Alimentação", "Fotos"]'),
      (2, 'Tour Guiado', 'Com guia e lanche incluído', 180.00, '["Bondinho", "Guia especializado", "Lanche"]', '["Bebidas alcoólicas"]'),
      (2, 'Experiência Sunset', 'Pôr do sol com jantar', 280.00, '["Bondinho", "Jantar romântico", "Guia"]', '["Transporte hotel"]'),
      (3, 'Entrada Padrão', 'Acesso geral ao museu', 89.00, '["Entrada", "Mapa do museu"]', '["Audioguia", "Tours especiais"]'),
      (3, 'Com Audioguia', 'Entrada com audioguia', 125.00, '["Entrada", "Audioguia multilíngue"]', '["Tours privativos"]'),
      (3, 'Tour Privativo', 'Guia especializado exclusivo', 350.00, '["Entrada VIP", "Guia art expert", "Acesso especial"]', '["Transporte"]')
    `);

    // 10. Preencher campos de localização para atividades existentes
    console.log('🌍 Preenchendo campos de localização das atividades...');
    await db.execute(sql`
      UPDATE activities a
      JOIN destinations d ON a.destination_name = d.name
      SET 
        a.city = d.name,
        a.state = d.state,
        a.country = d.country,
        a.country_type = d.country_type,
        a.region = d.region,
        a.continent = d.continent
    `);

    console.log('✅ Schema de atividades reconstruído com sucesso!');
    
    // 11. Verificar resultado final
    const verification = await db.execute(sql`
      SELECT 
        a.id, 
        a.title, 
        a.destination_name,
        a.city,
        a.state,
        a.country,
        a.country_type,
        a.region,
        a.continent,
        COUNT(p.id) as proposals_count
      FROM activities a
      LEFT JOIN activity_budget_proposals p ON a.id = p.activity_id
      GROUP BY a.id
      ORDER BY a.id
    `);
    
    console.log('🔍 Verificação final - Atividades com localização herdada:');
    console.log(verification);

  } catch (error) {
    console.error('❌ Erro ao reconstruir schema:', error);
    throw error;
  }
}

// Executar reconstrução
rebuildActivitiesSchema().catch(console.error);