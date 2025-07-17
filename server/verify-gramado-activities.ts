import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function verifyGramadoActivities() {
  console.log('🔍 Verificando atividades de Gramado...');
  
  const gramadoActivities = await db.select().from(activities).where(eq(activities.location, 'Gramado, RS'));
  
  console.log(`📊 Encontradas ${gramadoActivities.length} atividades de Gramado:`);
  
  for (const activity of gramadoActivities) {
    console.log(`- ${activity.title} (ID: ${activity.id})`);
    
    const proposals = await db.select().from(activityBudgetProposals).where(eq(activityBudgetProposals.activityId, activity.id));
    console.log(`  📋 ${proposals.length} propostas de orçamento`);
    
    for (const proposal of proposals) {
      console.log(`    - ${proposal.title}: R$ ${proposal.price}`);
    }
  }
  
  console.log('✅ Verificação concluída!');
}

verifyGramadoActivities().catch(console.error);