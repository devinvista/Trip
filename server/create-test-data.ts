import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('🌱 Criando dados de teste completos...');

  try {
    // 1. Primeiro verificar quantas atividades temos
    console.log('📊 Verificando atividades existentes...');
    const activities = await db.execute(sql`SELECT id, title FROM activities WHERE id IS NOT NULL`);
    console.log(`✅ Encontradas ${activities.length} atividades:`);
    activities.forEach(activity => {
      console.log(`   - ID ${activity.id}: ${activity.title}`);
    });

    // 2. Criar propostas de orçamento usando IDs específicos
    console.log('\n💰 Criando propostas de orçamento...');
    
    // Limpar propostas existentes
    await db.execute(sql`DELETE FROM activity_budget_proposals WHERE 1=1`);
    
    // Cristo Redentor (ID 9)
    await db.execute(sql`
      INSERT INTO activity_budget_proposals 
      (activity_id, title, description, amount, currency, inclusions, exclusions, votes, is_popular) 
      VALUES 
      (9, 'Van Oficial', 'Transporte em van oficial até o Cristo Redentor', 85.00, 'BRL', 
       '["Transporte van", "Entrada do monumento"]', '["Alimentação", "Bebidas"]', 28, false),
      (9, 'Trem do Corcovado', 'Experiência completa com trem e guia turístico', 160.00, 'BRL', 
       '["Trem do Corcovado", "Guia turístico", "Entrada"]', '["Bebidas alcoólicas"]', 45, true),
      (9, 'Tour Premium', 'Tour privativo com transporte executivo e fotografia', 320.00, 'BRL', 
       '["Transporte privativo", "Guia exclusivo", "Fotos profissionais"]', '["Compras pessoais"]', 18, false)
    `);
    
    // Pão de Açúcar (ID 10)
    await db.execute(sql`
      INSERT INTO activity_budget_proposals 
      (activity_id, title, description, amount, currency, inclusions, exclusions, votes, is_popular) 
      VALUES 
      (10, 'Ingresso Simples', 'Bondinho ida e volta com acesso aos mirantes', 120.00, 'BRL', 
       '["Bondinho ida/volta", "Acesso mirantes"]', '["Alimentação", "Bebidas"]', 15, false),
      (10, 'Com Guia Turístico', 'Bondinho com guia especializado e material informativo', 190.00, 'BRL', 
       '["Bondinho", "Guia turístico", "Material informativo"]', '["Fotos profissionais"]', 32, true),
      (10, 'Experiência VIP', 'Bondinho + voo de helicóptero + jantar com vista', 650.00, 'BRL', 
       '["Bondinho", "Helicóptero 15min", "Jantar panorâmico"]', '["Compras pessoais"]', 12, false)
    `);

    // Copacabana/Ipanema (ID 11)
    await db.execute(sql`
      INSERT INTO activity_budget_proposals 
      (activity_id, title, description, amount, currency, inclusions, exclusions, votes, is_popular) 
      VALUES 
      (11, 'Aula de Surf', 'Aula básica de surf com instrutor qualificado', 100.00, 'BRL', 
       '["Aula de surf", "Prancha", "Instrutor"]', '["Transporte", "Alimentação"]', 22, false),
      (11, 'Dia Completo', 'Surf + vôlei + bike tour pela orla', 180.00, 'BRL', 
       '["Surf", "Vôlei", "Bike tour", "Equipamentos"]', '["Refeições"]', 35, true),
      (11, 'Experiência Premium', 'Aulas privadas + almoço + massagem na praia', 350.00, 'BRL', 
       '["Aulas privadas", "Almoço", "Massagem", "Bebidas"]', '["Compras pessoais"]', 15, false)
    `);

    // MASP (ID 12) 
    await db.execute(sql`
      INSERT INTO activity_budget_proposals 
      (activity_id, title, description, amount, currency, inclusions, exclusions, votes, is_popular) 
      VALUES 
      (12, 'Entrada Básica', 'Visita livre ao museu', 40.00, 'BRL', 
       '["Entrada do museu"]', '["Guia", "Audioguia"]', 18, false),
      (12, 'Visita Guiada', 'Tour com guia especializado em arte', 75.00, 'BRL', 
       '["Entrada", "Guia especializado", "Material informativo"]', '["Transporte"]', 28, true),
      (12, 'Tour Completo', 'MASP + Paulista + Pinacoteca', 120.00, 'BRL', 
       '["MASP", "Paulista", "Pinacoteca", "Guia", "Transporte"]', '["Refeições"]', 12, false)
    `);

    // Pelourinho (ID 13)
    await db.execute(sql`
      INSERT INTO activity_budget_proposals 
      (activity_id, title, description, amount, currency, inclusions, exclusions, votes, is_popular) 
      VALUES 
      (13, 'Caminhada Histórica', 'Tour a pé pelo centro histórico', 60.00, 'BRL', 
       '["Tour guiado", "Elevador Lacerda"]', '["Alimentação", "Bebidas"]', 25, false),
      (13, 'Experiência Cultural', 'Tour + show de capoeira + degustação', 120.00, 'BRL', 
       '["Tour", "Show capoeira", "Degustação", "Guia"]', '["Compras"]', 40, true),
      (13, 'Vivência Completa', 'Tour + oficina + almoço típico + apresentação', 200.00, 'BRL', 
       '["Tour completo", "Oficina", "Almoço", "Apresentação"]', '["Compras pessoais"]', 18, false)
    `);

    // Cataratas (ID 14)
    await db.execute(sql`
      INSERT INTO activity_budget_proposals 
      (activity_id, title, description, amount, currency, inclusions, exclusions, votes, is_popular) 
      VALUES 
      (14, 'Entrada Básica', 'Acesso ao parque com trilha panorâmica', 85.00, 'BRL', 
       '["Entrada do parque", "Trilha panorâmica"]', '["Transporte", "Alimentação"]', 22, false),
      (14, 'Tour Completo', 'Parque + transporte + guia especializado', 150.00, 'BRL', 
       '["Entrada", "Transporte", "Guia especializado", "Capa de chuva"]', '["Refeições"]', 38, true),
      (14, 'Experiência Premium', 'Tour completo + voo de helicóptero sobre as cataratas', 450.00, 'BRL', 
       '["Tour completo", "Voo helicóptero", "Almoço", "Fotos aéreas"]', '["Compras pessoais"]', 15, false)
    `);

    console.log('✅ Propostas de orçamento criadas!');

    // 3. Criar avaliações realísticas
    console.log('\n⭐ Criando avaliações...');
    
    // Limpar avaliações existentes
    await db.execute(sql`DELETE FROM activity_reviews WHERE 1=1`);
    
    // Obter usuários
    const users = await db.execute(sql`SELECT id, username FROM users LIMIT 5`);
    console.log(`👥 Usuários disponíveis: ${users.length}`);

    if (users.length > 0) {
      // Cristo Redentor - avaliações
      await db.execute(sql`
        INSERT INTO activity_reviews 
        (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes) 
        VALUES 
        (9, ${users[0].id}, 5, 'Experiência incrível! A vista é de tirar o fôlego. O Cristo Redentor é realmente uma das maravilhas do mundo.', '2024-12-15', true, 12),
        (9, ${users[1] ? users[1].id : users[0].id}, 4, 'Muito bonito, mas estava bem cheio. O trem demora um pouco para subir, mas vale a pena. Leve protetor solar!', '2024-12-10', true, 8)
      `);

      // Pão de Açúcar - avaliações
      await db.execute(sql`
        INSERT INTO activity_reviews 
        (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes) 
        VALUES 
        (10, ${users[0].id}, 5, 'O bondinho é uma experiência única! A vista da Baía de Guanabara é espetacular. Recomendo ir no final da tarde.', '2024-12-08', true, 15),
        (10, ${users[1] ? users[1].id : users[0].id}, 4, 'Vista incrível! O bondinho histórico funciona muito bem. Só achei um pouco caro, mas é um passeio clássico do Rio.', '2024-12-05', true, 6)
      `);

      // Cataratas - avaliações
      await db.execute(sql`
        INSERT INTO activity_reviews 
        (activity_id, user_id, rating, comment, visit_date, is_verified, helpful_votes) 
        VALUES 
        (14, ${users[0].id}, 5, 'Uma das experiências mais impressionantes que já tive! As cataratas são majestosas e a força da natureza é esmagadora.', '2024-11-28', true, 22),
        (14, ${users[1] ? users[1].id : users[0].id}, 4, 'Incrível! As 275 quedas são um espetáculo da natureza. O parque é bem organizado, mas prepare-se para se molhar!', '2024-11-25', true, 14)
      `);

      console.log('✅ Avaliações criadas!');
    } else {
      console.log('⚠️ Nenhum usuário encontrado para criar avaliações');
    }

    // 4. Atualizar médias de rating
    console.log('\n📊 Atualizando médias de rating...');
    await db.execute(sql`
      UPDATE activities a
      SET 
        average_rating = (
          SELECT COALESCE(AVG(r.rating), 0)
          FROM activity_reviews r 
          WHERE r.activity_id = a.id AND r.is_hidden = FALSE
        ),
        total_ratings = (
          SELECT COUNT(*)
          FROM activity_reviews r 
          WHERE r.activity_id = a.id AND r.is_hidden = FALSE
        )
    `);

    console.log('✅ Médias atualizadas!');

    // 5. Verificar resultados finais
    console.log('\n📋 Verificando resultados...');
    const proposalsCount = await db.execute(sql`SELECT COUNT(*) as count FROM activity_budget_proposals`);
    const reviewsCount = await db.execute(sql`SELECT COUNT(*) as count FROM activity_reviews`);
    
    console.log(`💰 Propostas criadas: ${proposalsCount[0].count}`);
    console.log(`⭐ Avaliações criadas: ${reviewsCount[0].count}`);

    console.log('\n🎉 Dados de teste criados com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('✅ Processo concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no processo:', error);
    process.exit(1);
  });