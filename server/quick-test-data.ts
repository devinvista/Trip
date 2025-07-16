import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function generateReferralCode(username: string, id: number): Promise<string> {
  return `${username.substring(0, 3).toUpperCase()}${id.toString().padStart(3, '0')}`;
}

async function createQuickTestData() {
  console.log('🚀 Criando dados completos de teste...');

  try {
    // 1. Remover tabelas antigas
    console.log('🧹 Removendo dados antigos...');
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
    await db.execute(sql`DROP TABLE IF EXISTS activity_budget_proposals`);
    await db.execute(sql`DROP TABLE IF EXISTS activity_reviews`);
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

    // 2. Criar tabelas
    console.log('🔧 Criando estrutura...');
    await db.execute(sql`
      CREATE TABLE activity_budget_proposals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price_type VARCHAR(50) DEFAULT 'per_person' NOT NULL,
        amount DECIMAL(10,2),
        currency VARCHAR(10) DEFAULT 'BRL' NOT NULL,
        inclusions TEXT,
        exclusions TEXT,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE activity_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        visit_date DATE,
        is_verified BOOLEAN DEFAULT TRUE NOT NULL,
        helpful_votes INT DEFAULT 0 NOT NULL,
        is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);

    console.log('✅ Estrutura criada');

    // 3. Inserir propostas usando execução múltipla
    console.log('💰 Inserindo propostas...');
    
    const proposals = [
      [9, 'Van Oficial', 'Transporte em van oficial', 85.00, 'Van oficial, Entrada', 'Alimentação, Bebidas'],
      [9, 'Trem do Corcovado', 'Trem + guia turístico', 160.00, 'Trem, Guia, Entrada', 'Bebidas alcoólicas'],
      [9, 'Tour Premium', 'Tour privativo VIP', 320.00, 'Transporte privativo, Guia exclusivo, Fotos', 'Compras pessoais'],
      
      [10, 'Ingresso Padrão', 'Bondinho ida e volta', 120.00, 'Bondinho, Mirantes', 'Alimentação, Fotos'],
      [10, 'Com Guia', 'Bondinho com guia especializado', 190.00, 'Bondinho, Guia, Material', 'Fotos profissionais'],
      [10, 'Experiência VIP', 'Bondinho + helicóptero + jantar', 650.00, 'Bondinho, Helicóptero, Jantar', 'Compras pessoais'],
      
      [14, 'Entrada Básica', 'Acesso ao parque', 85.00, 'Entrada parque, Trilha', 'Transporte, Alimentação'],
      [14, 'Tour Completo', 'Parque + transporte + guia', 150.00, 'Entrada, Transporte, Guia', 'Refeições'],
      [14, 'Premium Aéreo', 'Tour + helicóptero + almoço', 450.00, 'Tour completo, Helicóptero, Almoço', 'Compras pessoais'],
      
      [12, 'Entrada Livre', 'Visita livre ao museu', 40.00, 'Entrada MASP', 'Guia, Transporte'],
      [12, 'Tour Guiado', 'MASP + Paulista com guia', 75.00, 'MASP, Guia, Paulista', 'Transporte'],
      [12, 'Cultural Completo', 'MASP + Pinacoteca + almoço', 120.00, 'MASP, Pinacoteca, Almoço, Transporte', 'Compras'],
      
      [13, 'Caminhada Histórica', 'Tour a pé pelo centro', 60.00, 'Tour, Elevador Lacerda', 'Alimentação, Bebidas'],
      [13, 'Cultural', 'Tour + capoeira + degustação', 120.00, 'Tour, Capoeira, Degustação', 'Compras'],
      [13, 'Vivência Completa', 'Tour + oficinas + almoço', 200.00, 'Tour completo, Oficinas, Almoço baiano', 'Gorjetas'],
      
      [11, 'Aula de Surf', 'Aula básica com instrutor', 100.00, 'Aula surf, Prancha, Instrutor', 'Transporte, Alimentação'],
      [11, 'Dia Completo', 'Surf + vôlei + bike tour', 180.00, 'Surf, Vôlei, Bike tour', 'Refeições'],
      [11, 'Premium', 'Aulas privadas + spa', 350.00, 'Aulas privadas, Spa, Almoço', 'Gorjetas']
    ];

    for (const [activityId, title, description, amount, inclusions, exclusions] of proposals) {
      await db.execute(sql`
        INSERT INTO activity_budget_proposals 
        (activity_id, title, description, amount, currency, inclusions, exclusions, price_type, is_active) 
        VALUES 
        (${activityId}, ${title}, ${description}, ${amount}, 'BRL', ${inclusions}, ${exclusions}, 'per_person', true)
      `);
    }

    console.log(`✅ ${proposals.length} propostas criadas`);

    // 4. Criar usuários teste se não existirem
    console.log('👥 Verificando usuários...');
    const existingUsers = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    
    if (existingUsers[0].count === 0) {
      console.log('Criando usuários teste...');
      
      const users = [
        ['testuser1', 'Test User 1', 'test1@example.com', '(11) 99999-1111'],
        ['testuser2', 'Test User 2', 'test2@example.com', '(11) 99999-2222'],
        ['testuser3', 'Test User 3', 'test3@example.com', '(11) 99999-3333']
      ];

      for (const [username, fullName, email, phone] of users) {
        const hashedPassword = await hashPassword('123456');
        await db.execute(sql`
          INSERT INTO users 
          (username, password, email, full_name, phone, is_verified, created_at, updated_at) 
          VALUES 
          (${username}, ${hashedPassword}, ${email}, ${fullName}, ${phone}, true, NOW(), NOW())
        `);
      }
      console.log(`✅ ${users.length} usuários criados`);
    } else {
      console.log(`✅ ${existingUsers[0].count} usuários já existem`);
    }

    // 5. Inserir avaliações
    console.log('⭐ Inserindo avaliações...');
    
    const reviews = [
      [9, 1, 5, 'Vista incrível! O Cristo Redentor é realmente majestoso. Vale muito a pena!', '2024-12-01', 15],
      [9, 2, 4, 'Muito bonito, mas estava bem cheio. Recomendo ir cedo pela manhã.', '2024-11-28', 8],
      [10, 1, 5, 'O bondinho é uma experiência única! Vista espetacular da cidade.', '2024-12-05', 12],
      [10, 2, 4, 'Vista maravilhosa, mas achei um pouco caro. Ainda assim recomendo!', '2024-11-30', 6],
      [14, 1, 5, 'Uma das experiências mais impressionantes da minha vida! As cataratas são majestosas.', '2024-11-15', 22],
      [14, 2, 5, 'Espetacular! Prepare-se para se molhar e leve capa de chuva. Vale cada centavo!', '2024-11-20', 18],
      [12, 1, 4, 'Excelente museu com obras incríveis. O acervo é muito rico e diversificado.', '2024-12-03', 9],
      [12, 2, 4, 'Muito interessante para quem gosta de arte. A arquitetura do prédio também é impressionante.', '2024-11-25', 7],
      [13, 1, 5, 'O centro histórico de Salvador é maravilhoso! Rica cultura e história em cada esquina.', '2024-11-18', 14],
      [13, 2, 4, 'Muito bonito e cheio de história. O show de capoeira foi o ponto alto!', '2024-11-22', 10]
    ];

    for (const [activityId, userId, rating, comment, visitDate, helpfulVotes] of reviews) {
      try {
        await db.execute(sql`
          INSERT INTO activity_reviews 
          (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes, is_hidden) 
          VALUES 
          (${activityId}, ${userId}, ${rating}, ${comment}, ${visitDate}, true, ${helpfulVotes}, false)
        `);
      } catch (error) {
        // Ignora duplicatas
        if (!error.message.includes('Duplicate') && !error.message.includes('foreign key')) {
          console.error(`Erro na avaliação: ${error.message}`);
        }
      }
    }

    console.log(`✅ ${reviews.length} avaliações inseridas`);

    // 6. Atualizar médias
    console.log('📊 Atualizando médias...');
    await db.execute(sql`
      UPDATE activities a
      SET 
        average_rating = COALESCE((
          SELECT AVG(r.rating)
          FROM activity_reviews r 
          WHERE r.activity_id = a.id AND r.is_hidden = FALSE
        ), 0),
        total_ratings = COALESCE((
          SELECT COUNT(*)
          FROM activity_reviews r 
          WHERE r.activity_id = a.id AND r.is_hidden = FALSE
        ), 0)
    `);

    // 7. Verificar resultados
    const [proposalsResult, reviewsResult] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) as count FROM activity_budget_proposals`),
      db.execute(sql`SELECT COUNT(*) as count FROM activity_reviews`)
    ]);
    
    console.log(`\n📋 Resultado:`);
    console.log(`💰 Propostas: ${proposalsResult[0].count}`);
    console.log(`⭐ Avaliações: ${reviewsResult[0].count}`);

    console.log('\n🎉 Sistema de propostas e avaliações criado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}

async function main() {
  try {
    await createQuickTestData();
    console.log('✅ Processo concluído!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no processo:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}