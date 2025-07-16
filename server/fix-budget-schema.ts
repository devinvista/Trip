import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function fixBudgetSchema() {
  console.log('🔧 Corrigindo schema das tabelas...');

  try {
    // 1. Atualizar tabela de propostas adicionando colunas que faltam
    console.log('🏗️  Atualizando tabela activity_budget_proposals...');
    
    // Adicionar colunas que podem estar faltando
    await db.execute(sql`
      ALTER TABLE activity_budget_proposals 
      ADD COLUMN IF NOT EXISTS created_by INT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS votes INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE
    `);

    // 2. Atualizar tabela de avaliações adicionando colunas que faltam
    console.log('🏗️  Atualizando tabela activity_reviews...');
    
    await db.execute(sql`
      ALTER TABLE activity_reviews 
      ADD COLUMN IF NOT EXISTS review TEXT,
      ADD COLUMN IF NOT EXISTS photos JSON,
      ADD COLUMN IF NOT EXISTS report_count INT DEFAULT 0
    `);

    // Copiar dados de comment para review se necessário
    await db.execute(sql`
      UPDATE activity_reviews 
      SET review = comment 
      WHERE review IS NULL AND comment IS NOT NULL
    `);

    console.log('✅ Schema corrigido');

    // 3. Verificar se tudo está funcionando
    console.log('🧪 Testando consultas...');
    
    const proposalsTest = await db.execute(sql`
      SELECT id, activity_id, created_by, title, description, amount, votes 
      FROM activity_budget_proposals 
      LIMIT 3
    `);
    
    const reviewsTest = await db.execute(sql`
      SELECT id, activity_id, user_id, rating, review, comment, report_count, helpful_votes 
      FROM activity_reviews 
      LIMIT 3
    `);

    console.log(`✅ Teste propostas: ${proposalsTest.length} registros`);
    console.log(`✅ Teste avaliações: ${reviewsTest.length} registros`);

    // 4. Verificar contagens
    const [proposalsCount, reviewsCount] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) as count FROM activity_budget_proposals`),
      db.execute(sql`SELECT COUNT(*) as count FROM activity_reviews`)
    ]);
    
    console.log(`\n📊 Status final:`);
    console.log(`💰 Propostas: ${proposalsCount[0].count}`);
    console.log(`⭐ Avaliações: ${reviewsCount[0].count}`);

    console.log('\n🎉 Correção do schema concluída!');

  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  fixBudgetSchema()
    .then(() => {
      console.log('✅ Processo concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no processo:', error);
      process.exit(1);
    });
}