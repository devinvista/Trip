import { db } from './db';
import { users } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function migrateTravelStyles() {
  console.log('🔄 Iniciando migração de travel_style para travel_styles...');
  
  try {
    // Migrar dados existentes do travel_style para travel_styles
    const allUsers = await db.execute(sql`SELECT id, travel_style FROM users WHERE travel_style IS NOT NULL AND travel_styles IS NULL`);
    
    for (const user of allUsers) {
      const travelStyle = user.travel_style;
      if (travelStyle) {
        await db.execute(sql`UPDATE users SET travel_styles = JSON_ARRAY(${travelStyle}) WHERE id = ${user.id}`);
        console.log(`✅ Usuário ${user.id} migrado: ${travelStyle} -> [${travelStyle}]`);
      }
    }
    
    // Remover coluna antiga
    await db.execute(sql`ALTER TABLE users DROP COLUMN travel_style`);
    console.log('✅ Coluna travel_style removida com sucesso');
    
    console.log('🎉 Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    
    // Se a coluna não existe, apenas continue
    if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
      console.log('ℹ️ Coluna travel_style já foi removida, continuando...');
    } else {
      throw error;
    }
  }
}

// Executar migração se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateTravelStyles().catch(console.error);
}

export { migrateTravelStyles };