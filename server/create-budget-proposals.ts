import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function createBudgetProposals() {
  console.log('🌱 Criando sistema completo: propostas de orçamento + avaliações...');

  try {
    // 1. Remover tabelas antigas se existirem
    await db.execute(sql`DROP TABLE IF EXISTS activity_budget_proposals`);
    await db.execute(sql`DROP TABLE IF EXISTS activity_reviews`);
    console.log('🧹 Tabelas antigas removidas');

    // 2. Criar tabelas sem constraints problemáticas
    console.log('🔧 Criando estrutura das tabelas...');
    
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX (activity_id)
      )
    `);

    await db.execute(sql`
      CREATE TABLE activity_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        activity_id INT NOT NULL,
        user_id INT DEFAULT 1,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        visit_date DATE,
        is_verified BOOLEAN DEFAULT TRUE NOT NULL,
        helpful_votes INT DEFAULT 0 NOT NULL,
        is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX (activity_id)
      )
    `);

    console.log('✅ Estrutura das tabelas criada');

    // 3. Inserir propostas de orçamento direto via SQL
    console.log('💰 Criando propostas de orçamento...');
    
    const proposalsSQL = `
      INSERT INTO activity_budget_proposals 
      (activity_id, title, description, amount, currency, inclusions, exclusions, price_type, is_active) 
      VALUES 
      (1, 'Básico', 'Passeio básico de catamaran', 95.00, 'BRL', 'Passeio de catamaran, Equipamentos', 'Alimentação, Bebidas', 'per_person', true),
      (1, 'Completo', 'Passeio com almoço e bebidas', 170.00, 'BRL', 'Passeio, Almoço, Bebidas', 'Compras pessoais', 'per_person', true),
      (1, 'Premium', 'Passeio privativo com chef', 304.00, 'BRL', 'Passeio privativo, Chef, Bebidas premium', 'Gorjetas', 'per_person', true),
      
      (2, 'Básico', 'Trilha básica com guia', 70.00, 'BRL', 'Guia, Equipamentos básicos', 'Alimentação, Transporte', 'per_person', true),
      (2, 'Completo', 'Trilha com refeições e transporte', 126.00, 'BRL', 'Guia, Refeições, Transporte', 'Equipamentos especiais', 'per_person', true),
      (2, 'Premium', 'Trilha VIP com acampamento', 224.00, 'BRL', 'Guia privativo, Acampamento, Todas as refeições', 'Compras pessoais', 'per_person', true),
      
      (9, 'Van Oficial', 'Transporte em van oficial', 85.00, 'BRL', 'Van oficial, Entrada', 'Alimentação, Bebidas', 'per_person', true),
      (9, 'Trem do Corcovado', 'Trem + guia turístico', 160.00, 'BRL', 'Trem, Guia, Entrada', 'Bebidas alcoólicas', 'per_person', true),
      (9, 'Tour Premium', 'Tour privativo VIP', 320.00, 'BRL', 'Transporte privativo, Guia exclusivo, Fotos', 'Compras pessoais', 'per_person', true),
      
      (10, 'Ingresso Padrão', 'Bondinho ida e volta', 120.00, 'BRL', 'Bondinho, Mirantes', 'Alimentação, Fotos', 'per_person', true),
      (10, 'Com Guia', 'Bondinho com guia especializado', 190.00, 'BRL', 'Bondinho, Guia, Material', 'Fotos profissionais', 'per_person', true),
      (10, 'Experiência VIP', 'Bondinho + helicóptero + jantar', 650.00, 'BRL', 'Bondinho, Helicóptero, Jantar', 'Compras pessoais', 'per_person', true),
      
      (11, 'Aula de Surf', 'Aula básica com instrutor', 100.00, 'BRL', 'Aula surf, Prancha, Instrutor', 'Transporte, Alimentação', 'per_person', true),
      (11, 'Dia Completo', 'Surf + vôlei + bike tour', 180.00, 'BRL', 'Surf, Vôlei, Bike tour', 'Refeições', 'per_person', true),
      (11, 'Premium', 'Aulas privadas + spa', 350.00, 'BRL', 'Aulas privadas, Spa, Almoço', 'Gorjetas', 'per_person', true),
      
      (12, 'Entrada Livre', 'Visita livre ao museu', 40.00, 'BRL', 'Entrada MASP', 'Guia, Transporte', 'per_person', true),
      (12, 'Tour Guiado', 'MASP + Paulista com guia', 75.00, 'BRL', 'MASP, Guia, Paulista', 'Transporte', 'per_person', true),
      (12, 'Cultural Completo', 'MASP + Pinacoteca + almoço', 120.00, 'BRL', 'MASP, Pinacoteca, Almoço, Transporte', 'Compras', 'per_person', true),
      
      (13, 'Caminhada Histórica', 'Tour a pé pelo centro', 60.00, 'BRL', 'Tour, Elevador Lacerda', 'Alimentação, Bebidas', 'per_person', true),
      (13, 'Cultural', 'Tour + capoeira + degustação', 120.00, 'BRL', 'Tour, Capoeira, Degustação', 'Compras', 'per_person', true),
      (13, 'Vivência Completa', 'Tour + oficinas + almoço', 200.00, 'BRL', 'Tour completo, Oficinas, Almoço baiano', 'Gorjetas', 'per_person', true),
      
      (14, 'Entrada Básica', 'Acesso ao parque', 85.00, 'BRL', 'Entrada parque, Trilha', 'Transporte, Alimentação', 'per_person', true),
      (14, 'Tour Completo', 'Parque + transporte + guia', 150.00, 'BRL', 'Entrada, Transporte, Guia', 'Refeições', 'per_person', true),
      (14, 'Premium Aéreo', 'Tour + helicóptero + almoço', 450.00, 'BRL', 'Tour completo, Helicóptero, Almoço', 'Compras pessoais', 'per_person', true)
    `;

    await db.execute(sql.raw(proposalsSQL));
    console.log('✅ Propostas de orçamento criadas!');

    // 4. Inserir avaliações
    console.log('⭐ Criando avaliações...');
    
    const reviewsSQL = `
      INSERT INTO activity_reviews 
      (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes, is_hidden) 
      VALUES 
      (9, 1, 5, 'Vista incrível! O Cristo Redentor é realmente majestoso. Vale muito a pena!', '2024-12-01', true, 15, false),
      (9, 2, 4, 'Muito bonito, mas estava bem cheio. Recomendo ir cedo pela manhã.', '2024-11-28', true, 8, false),
      
      (10, 1, 5, 'O bondinho é uma experiência única! Vista espetacular da cidade.', '2024-12-05', true, 12, false),
      (10, 2, 4, 'Vista maravilhosa, mas achei um pouco caro. Ainda assim recomendo!', '2024-11-30', true, 6, false),
      
      (14, 1, 5, 'Uma das experiências mais impressionantes da minha vida! As cataratas são majestosas.', '2024-11-15', true, 22, false),
      (14, 2, 5, 'Espetacular! Prepare-se para se molhar e leve capa de chuva. Vale cada centavo!', '2024-11-20', true, 18, false),
      
      (12, 1, 4, 'Excelente museu com obras incríveis. O acervo é muito rico e diversificado.', '2024-12-03', true, 9, false),
      (12, 2, 4, 'Muito interessante para quem gosta de arte. A arquitetura do prédio também é impressionante.', '2024-11-25', true, 7, false),
      
      (13, 1, 5, 'O centro histórico de Salvador é maravilhoso! Rica cultura e história em cada esquina.', '2024-11-18', true, 14, false),
      (13, 2, 4, 'Muito bonito e cheio de história. O show de capoeira foi o ponto alto!', '2024-11-22', true, 10, false),
      
      (1, 1, 5, 'Passeio incrível em Búzios! Mar cristalino e paisagens deslumbrantes.', '2024-11-10', true, 8, false),
      (2, 1, 4, 'Trilha desafiadora mas recompensadora. Vista do topo é espetacular!', '2024-10-25', true, 6, false),
      (11, 1, 5, 'Aula de surf fantástica! Instrutor muito paciente e experiente.', '2024-12-08', true, 11, false)
    `;

    await db.execute(sql.raw(reviewsSQL));
    console.log('✅ Avaliações criadas!');

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

    // 6. Verificar resultados finais
    const proposalsCount = await db.execute(sql`SELECT COUNT(*) as count FROM activity_budget_proposals`);
    const reviewsCount = await db.execute(sql`SELECT COUNT(*) as count FROM activity_reviews`);
    
    console.log(`\n📋 Resultado final:`);
    console.log(`💰 Propostas criadas: ${proposalsCount[0].count}`);
    console.log(`⭐ Avaliações criadas: ${reviewsCount[0].count}`);

    // 7. Testar alguns dados
    const sampleProposals = await db.execute(sql`
      SELECT a.title as activity_title, p.title, p.amount 
      FROM activity_budget_proposals p 
      JOIN activities a ON p.activity_id = a.id 
      LIMIT 5
    `);
    
    console.log(`\n💡 Exemplos de propostas criadas:`);
    sampleProposals.forEach((p: any) => {
      console.log(`   ${p.activity_title}: ${p.title} - R$ ${p.amount}`);
    });

    console.log('\n🎉 Sistema de propostas de orçamento e avaliações completamente implementado!');

  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createBudgetProposals()
    .then(() => {
      console.log('✅ Processo concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no processo:', error);
      process.exit(1);
    });
}