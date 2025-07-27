import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function addSampleReviews() {
  console.log('🌱 Criando propostas de orçamento e avaliações com dados diretos...');

  try {
    // 1. Criar tabelas se não existirem
    console.log('🔧 Criando estrutura das tabelas...');
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activity_budget_proposals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        created_by INT DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price_type VARCHAR(50) DEFAULT 'per_person' NOT NULL,
        amount DECIMAL(10,2),
        currency VARCHAR(10) DEFAULT 'BRL' NOT NULL,
        inclusions JSON,
        exclusions JSON,
        valid_until TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX (activity_id)
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activity_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        visit_date DATE,
        photos JSON,
        is_verified BOOLEAN DEFAULT FALSE NOT NULL,
        helpful_votes INT DEFAULT 0 NOT NULL,
        is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX (activity_id),
        INDEX (user_id)
      )
    `);

    console.log('✅ Estrutura das tabelas criada');

    // 2. Limpar dados existentes
    await db.execute(sql`DELETE FROM activity_budget_proposals`);
    await db.execute(sql`DELETE FROM activity_reviews`);
    console.log('🧹 Dados antigos removidos');

    // 3. Criar propostas de orçamento com IDs específicos das atividades
    console.log('💰 Criando propostas de orçamento...');
    
    // IDs das atividades que sabemos que existem (de 1 a 14)
    const activityProposals = [
      // Atividade 1 - Passeio de Catamaran em Búzios
      { activityId: 1, title: 'Básico', description: 'Passeio básico de catamaran', amount: 95, inclusions: '["Passeio de catamaran", "Equipamentos"]', exclusions: '["Alimentação", "Bebidas"]' },
      { activityId: 1, title: 'Completo', description: 'Passeio com almoço e bebidas', amount: 170, inclusions: '["Passeio", "Almoço", "Bebidas"]', exclusions: '["Compras pessoais"]' },
      { activityId: 1, title: 'Premium', description: 'Passeio privativo com chef', amount: 304, inclusions: '["Passeio privativo", "Chef", "Bebidas premium"]', exclusions: '["Gorjetas"]' },

      // Atividade 2 - Trilha no Pico da Bandeira
      { activityId: 2, title: 'Básico', description: 'Trilha básica com guia', amount: 70, inclusions: '["Guia", "Equipamentos básicos"]', exclusions: '["Alimentação", "Transporte"]' },
      { activityId: 2, title: 'Completo', description: 'Trilha com refeições e transporte', amount: 126, inclusions: '["Guia", "Refeições", "Transporte"]', exclusions: '["Equipamentos especiais"]' },
      { activityId: 2, title: 'Premium', description: 'Trilha VIP com acampamento', amount: 224, inclusions: '["Guia privativo", "Acampamento", "Todas as refeições"]', exclusions: '["Compras pessoais"]' },

      // Atividade 3 - City Tour Ouro Preto
      { activityId: 3, title: 'Básico', description: 'Tour básico pelo centro histórico', amount: 55, inclusions: '["Tour guiado", "Entrada museus"]', exclusions: '["Alimentação", "Transporte"]' },
      { activityId: 3, title: 'Completo', description: 'Tour com almoço típico', amount: 99, inclusions: '["Tour completo", "Almoço típico", "Transporte"]', exclusions: '["Compras"]' },
      { activityId: 3, title: 'Premium', description: 'Tour privativo com degustação', amount: 176, inclusions: '["Tour privativo", "Degustação cachaça", "Transfer executivo"]', exclusions: '["Gorjetas"]' },

      // Atividade 4 - Rafting
      { activityId: 4, title: 'Básico', description: 'Rafting básico com equipamentos', amount: 85, inclusions: '["Rafting", "Equipamentos", "Seguro"]', exclusions: '["Alimentação", "Transporte"]' },
      { activityId: 4, title: 'Completo', description: 'Rafting com almoço e transporte', amount: 153, inclusions: '["Rafting", "Almoço", "Transporte", "Instrutor"]', exclusions: '["Bebidas alcoólicas"]' },
      { activityId: 4, title: 'Premium', description: 'Rafting VIP com fotografia', amount: 272, inclusions: '["Rafting exclusivo", "Fotografia", "Refeição completa"]', exclusions: '["Compras pessoais"]' },

      // Atividade 9 - Cristo Redentor
      { activityId: 9, title: 'Van Oficial', description: 'Transporte em van oficial', amount: 85, inclusions: '["Van oficial", "Entrada"]', exclusions: '["Alimentação", "Bebidas"]' },
      { activityId: 9, title: 'Trem do Corcovado', description: 'Trem + guia turístico', amount: 160, inclusions: '["Trem", "Guia", "Entrada"]', exclusions: '["Bebidas alcoólicas"]' },
      { activityId: 9, title: 'Tour Premium', description: 'Tour privativo VIP', amount: 320, inclusions: '["Transporte privativo", "Guia exclusivo", "Fotos"]', exclusions: '["Compras pessoais"]' },

      // Atividade 10 - Pão de Açúcar
      { activityId: 10, title: 'Ingresso Padrão', description: 'Bondinho ida e volta', amount: 120, inclusions: '["Bondinho", "Mirantes"]', exclusions: '["Alimentação", "Fotos"]' },
      { activityId: 10, title: 'Com Guia', description: 'Bondinho com guia especializado', amount: 190, inclusions: '["Bondinho", "Guia", "Material"]', exclusions: '["Fotos profissionais"]' },
      { activityId: 10, title: 'Experiência VIP', description: 'Bondinho + helicóptero + jantar', amount: 650, inclusions: '["Bondinho", "Helicóptero", "Jantar"]', exclusions: '["Compras pessoais"]' },

      // Atividade 11 - Copacabana/Ipanema
      { activityId: 11, title: 'Aula de Surf', description: 'Aula básica com instrutor', amount: 100, inclusions: '["Aula surf", "Prancha", "Instrutor"]', exclusions: '["Transporte", "Alimentação"]' },
      { activityId: 11, title: 'Dia Completo', description: 'Surf + vôlei + bike tour', amount: 180, inclusions: '["Surf", "Vôlei", "Bike tour"]', exclusions: '["Refeições"]' },
      { activityId: 11, title: 'Premium', description: 'Aulas privadas + spa', amount: 350, inclusions: '["Aulas privadas", "Spa", "Almoço"]', exclusions: '["Gorjetas"]' },

      // Atividade 12 - MASP
      { activityId: 12, title: 'Entrada Livre', description: 'Visita livre ao museu', amount: 40, inclusions: '["Entrada MASP"]', exclusions: '["Guia", "Transporte"]' },
      { activityId: 12, title: 'Tour Guiado', description: 'MASP + Paulista com guia', amount: 75, inclusions: '["MASP", "Guia", "Paulista"]', exclusions: '["Transporte"]' },
      { activityId: 12, title: 'Cultural Completo', description: 'MASP + Pinacoteca + almoço', amount: 120, inclusions: '["MASP", "Pinacoteca", "Almoço", "Transporte"]', exclusions: '["Compras"]' },

      // Atividade 13 - Pelourinho
      { activityId: 13, title: 'Caminhada Histórica', description: 'Tour a pé pelo centro', amount: 60, inclusions: '["Tour", "Elevador Lacerda"]', exclusions: '["Alimentação", "Bebidas"]' },
      { activityId: 13, title: 'Cultural', description: 'Tour + capoeira + degustação', amount: 120, inclusions: '["Tour", "Capoeira", "Degustação"]', exclusions: '["Compras"]' },
      { activityId: 13, title: 'Vivência Completa', description: 'Tour + oficinas + almoço', amount: 200, inclusions: '["Tour completo", "Oficinas", "Almoço baiano"]', exclusions: '["Gorjetas"]' },

      // Atividade 14 - Cataratas
      { activityId: 14, title: 'Entrada Básica', description: 'Acesso ao parque', amount: 85, inclusions: '["Entrada parque", "Trilha"]', exclusions: '["Transporte", "Alimentação"]' },
      { activityId: 14, title: 'Tour Completo', description: 'Parque + transporte + guia', amount: 150, inclusions: '["Entrada", "Transporte", "Guia"]', exclusions: '["Refeições"]' },
      { activityId: 14, title: 'Premium Aéreo', description: 'Tour + helicóptero + almoço', amount: 450, inclusions: '["Tour completo", "Helicóptero", "Almoço"]', exclusions: '["Compras pessoais"]' }
    ];

    // Inserir propostas
    for (const proposal of activityProposals) {
      await db.execute(sql`
        INSERT INTO activity_budget_proposals 
        (activity_id, title, description, amount, currency, inclusions, exclusions, price_type, is_active) 
        VALUES 
        (${proposal.activityId}, ${proposal.title}, ${proposal.description}, ${proposal.amount}, 'BRL', 
         ${proposal.inclusions}, ${proposal.exclusions}, 'per_person', true)
      `);
    }

    console.log(`✅ ${activityProposals.length} propostas de orçamento criadas!`);

    // 4. Criar avaliações
    console.log('⭐ Criando avaliações...');
    
    const reviewsData = [
      // Cristo Redentor (ID 9)
      { activityId: 9, userId: 1, rating: 5, comment: 'Vista incrível! O Cristo Redentor é realmente majestoso. Vale muito a pena!', visitDate: '2024-12-01', helpfulVotes: 15 },
      { activityId: 9, userId: 2, rating: 4, comment: 'Muito bonito, mas estava bem cheio. Recomendo ir cedo pela manhã.', visitDate: '2024-11-28', helpfulVotes: 8 },
      
      // Pão de Açúcar (ID 10)
      { activityId: 10, userId: 1, rating: 5, comment: 'O bondinho é uma experiência única! Vista espetacular da cidade.', visitDate: '2024-12-05', helpfulVotes: 12 },
      { activityId: 10, userId: 2, rating: 4, comment: 'Vista maravilhosa, mas achei um pouco caro. Ainda assim recomendo!', visitDate: '2024-11-30', helpfulVotes: 6 },
      
      // Cataratas (ID 14)
      { activityId: 14, userId: 1, rating: 5, comment: 'Uma das experiências mais impressionantes da minha vida! As cataratas são majestosas.', visitDate: '2024-11-15', helpfulVotes: 22 },
      { activityId: 14, userId: 2, rating: 5, comment: 'Espetacular! Prepare-se para se molhar e leve capa de chuva. Vale cada centavo!', visitDate: '2024-11-20', helpfulVotes: 18 },
      
      // MASP (ID 12)
      { activityId: 12, userId: 1, rating: 4, comment: 'Excelente museu com obras incríveis. O acervo é muito rico e diversificado.', visitDate: '2024-12-03', helpfulVotes: 9 },
      { activityId: 12, userId: 2, rating: 4, comment: 'Muito interessante para quem gosta de arte. A arquitetura do prédio também é impressionante.', visitDate: '2024-11-25', helpfulVotes: 7 },
      
      // Pelourinho (ID 13)
      { activityId: 13, userId: 1, rating: 5, comment: 'O centro histórico de Salvador é maravilhoso! Rica cultura e história em cada esquina.', visitDate: '2024-11-18', helpfulVotes: 14 },
      { activityId: 13, userId: 2, rating: 4, comment: 'Muito bonito e cheio de história. O show de capoeira foi o ponto alto!', visitDate: '2024-11-22', helpfulVotes: 10 }
    ];

    // Inserir avaliações
    for (const review of reviewsData) {
      try {
        await db.execute(sql`
          INSERT INTO activity_reviews 
          (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes, is_hidden) 
          VALUES 
          (${review.activityId}, ${review.userId}, ${review.rating}, ${review.comment}, 
           ${review.visitDate}, true, ${review.helpfulVotes}, false)
        `);
      } catch (error) {
        // Ignora erros de foreign key ou duplicatas
        if (!error.message.includes('Duplicate entry') && !error.message.includes('foreign key')) {
          console.error(`Erro ao criar avaliação: ${error.message}`);
        }
      }
    }

    console.log(`✅ ${reviewsData.length} avaliações criadas!`);

    // 5. Atualizar médias de rating
    console.log('📊 Atualizando médias de rating...');
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

    // 6. Verificar resultados
    const proposalsCount = await db.execute(sql`SELECT COUNT(*) as count FROM activity_budget_proposals`);
    const reviewsCount = await db.execute(sql`SELECT COUNT(*) as count FROM activity_reviews`);
    
    console.log(`\n📋 Resultado final:`);
    console.log(`💰 Propostas criadas: ${proposalsCount[0].count}`);
    console.log(`⭐ Avaliações criadas: ${reviewsCount[0].count}`);

    console.log('\n🎉 Sistema de propostas de orçamento e avaliações completamente implementado!');

  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addSampleReviews()
    .then(() => {
      console.log('✅ Processo concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no processo:', error);
      process.exit(1);
    });
}