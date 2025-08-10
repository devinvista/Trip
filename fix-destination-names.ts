import { db } from './server/db.js';
import { activities } from './shared/schema.js';
import { eq, sql } from 'drizzle-orm';

async function fixDestinationNames() {
  console.log('🔧 Corrigindo nomes de destinos duplicados...');
  
  try {
    // Mostrar estado atual
    console.log('\n📊 Estado atual:');
    const current = await db
      .select({
        destination: activities.destination_name,
        count: sql`COUNT(*)`
      })
      .from(activities)
      .where(eq(activities.is_active, true))
      .groupBy(activities.destination_name);
    
    current.forEach(item => {
      console.log(`  ${item.destination}: ${item.count} atividades`);
    });
    
    // Corrigir São Paulo
    const spResult = await db.update(activities)
      .set({ destination_name: "São Paulo" })
      .where(eq(activities.destination_name, "São Paulo, SP"));
    console.log(`\n✅ Corrigido São Paulo, SP -> São Paulo`);
    
    // Corrigir Rio de Janeiro
    const rjResult = await db.update(activities)
      .set({ destination_name: "Rio de Janeiro" })
      .where(eq(activities.destination_name, "Rio de Janeiro, RJ"));
    console.log(`✅ Corrigido Rio de Janeiro, RJ -> Rio de Janeiro`);
    
    // Corrigir Salvador
    const salResult = await db.update(activities)
      .set({ destination_name: "Salvador" })
      .where(eq(activities.destination_name, "Salvador, BA"));
    console.log(`✅ Corrigido Salvador, BA -> Salvador`);
    
    // Mostrar resultado final
    console.log('\n📈 Estado após correção:');
    const final = await db
      .select({
        destination: activities.destination_name,
        count: sql`COUNT(*)`
      })
      .from(activities)
      .where(eq(activities.is_active, true))
      .groupBy(activities.destination_name);
    
    final.forEach(item => {
      console.log(`  ${item.destination}: ${item.count} atividades`);
    });
    
    console.log('\n✅ Correção de destinos concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir destinos:', error);
  } finally {
    process.exit(0);
  }
}

fixDestinationNames();