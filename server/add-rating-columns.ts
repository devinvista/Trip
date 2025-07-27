import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function addRatingColumns() {
  console.log('🔧 Adicionando colunas de rating necessárias...');

  try {
    // Verificar se a coluna total_ratings já existe
    const columns = await db.execute(sql`DESCRIBE activities`);
    const hasRatingColumns = columns.some(col => col.Field === 'total_ratings');
    
    if (!hasRatingColumns) {
      // Adicionar colunas de rating se não existirem
      await db.execute(sql`
        ALTER TABLE activities 
        ADD COLUMN total_ratings INT DEFAULT 0 NOT NULL,
        ADD COLUMN rating_sum DECIMAL(10,2) DEFAULT 0.00 NOT NULL
      `);
      console.log('✅ Colunas de rating adicionadas!');
    } else {
      console.log('ℹ️ Colunas de rating já existem');
    }

    // Verificar se a tabela activity_budget_proposals tem as colunas necessárias
    const proposalColumns = await db.execute(sql`DESCRIBE activity_budget_proposals`);
    const hasProposalColumns = proposalColumns.some(col => col.Field === 'votes');
    
    if (!hasProposalColumns) {
      await db.execute(sql`
        ALTER TABLE activity_budget_proposals 
        ADD COLUMN votes INT DEFAULT 0 NOT NULL,
        ADD COLUMN is_popular BOOLEAN DEFAULT FALSE NOT NULL
      `);
      console.log('✅ Colunas de propostas adicionadas!');
    }

  } catch (error) {
    console.error('❌ Erro ao adicionar colunas:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addRatingColumns()
    .then(() => {
      console.log('✅ Processo concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no processo:', error);
      process.exit(1);
    });
}