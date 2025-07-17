import { db } from './db.js';

async function addHierarchicalColumns() {
  try {
    console.log("🔄 Adicionando colunas hierárquicas à tabela activities...");
    
    // Add the new columns to the activities table
    await db.execute(`
      ALTER TABLE activities 
      ADD COLUMN country_type VARCHAR(50) DEFAULT 'nacional' NOT NULL,
      ADD COLUMN region VARCHAR(100),
      ADD COLUMN city VARCHAR(100) NOT NULL DEFAULT ''
    `);
    
    console.log("✅ Colunas hierárquicas adicionadas com sucesso!");
    
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("ℹ️ Colunas já existem, continuando...");
    } else {
      console.error("❌ Erro ao adicionar colunas hierárquicas:", error);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  addHierarchicalColumns().then(() => process.exit(0));
}

export { addHierarchicalColumns };