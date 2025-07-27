import { db } from './db.js';

async function checkTableSchema() {
  try {
    console.log('🔍 VERIFICANDO SCHEMA DA TABELA ACTIVITIES...\n');
    
    const [result] = await db.execute('DESCRIBE activities');
    
    console.log('📋 CAMPOS DA TABELA ACTIVITIES:');
    (result as any).forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} (${row.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
  
  process.exit(0);
}

checkTableSchema();