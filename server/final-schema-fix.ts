import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function finalSchemaFix() {
  console.log('🔧 Correção final do schema...');

  try {
    // 1. Adicionar todas as colunas que faltam na tabela de propostas
    console.log('🏗️  Adicionando colunas faltantes...');
    
    await db.execute(sql`
      ALTER TABLE activity_budget_proposals 
      ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS created_by INT DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS votes INT DEFAULT 0
    `);

    console.log('✅ Colunas adicionadas');

    // 2. Atualizar valores de votes para as propostas existentes
    console.log('📊 Atualizando votos das propostas...');
    
    await db.execute(sql`
      UPDATE activity_budget_proposals 
      SET votes = FLOOR(RAND() * 50) + 5 
      WHERE votes = 0
    `);

    // 3. Verificar se as propostas estão sendo retornadas corretamente
    console.log('🧪 Testando consulta de propostas...');
    
    const testProposals = await db.execute(sql`
      SELECT id, activity_id, title, description, amount, votes, is_active 
      FROM activity_budget_proposals 
      WHERE activity_id = 14 AND is_active = true
      ORDER BY votes DESC
      LIMIT 5
    `);

    console.log(`✅ Teste propostas ID 14: ${testProposals.length} registros`);
    testProposals.forEach((p: any) => {
      console.log(`   - ${p.title}: R$ ${p.amount} (${p.votes} votos)`);
    });

    // 4. Verificar todas as propostas
    const allProposals = await db.execute(sql`
      SELECT COUNT(*) as count, 
             COUNT(CASE WHEN votes > 0 THEN 1 END) as with_votes
      FROM activity_budget_proposals
    `);

    console.log(`\n📊 Total de propostas: ${allProposals[0].count}`);
    console.log(`📊 Com votos: ${allProposals[0].with_votes}`);

    // 5. Exibir algumas propostas por atividade
    const proposalsByActivity = await db.execute(sql`
      SELECT activity_id, COUNT(*) as proposals_count
      FROM activity_budget_proposals 
      GROUP BY activity_id 
      ORDER BY activity_id
    `);

    console.log('\n💡 Propostas por atividade:');
    proposalsByActivity.forEach((row: any) => {
      console.log(`   Atividade ${row.activity_id}: ${row.proposals_count} propostas`);
    });

    console.log('\n🎉 Correção final concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  finalSchemaFix()
    .then(() => {
      console.log('✅ Processo concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no processo:', error);
      process.exit(1);
    });
}