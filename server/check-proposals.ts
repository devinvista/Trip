import { db } from './db.js';
import { activityBudgetProposals } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function checkProposals() {
  console.log('🔍 Verificando propostas de orçamento...');
  
  try {
    const proposals = await db.select().from(activityBudgetProposals);
    console.log(`Total de propostas: ${proposals.length}`);
    
    // Check for Rio activities (IDs 16-20)
    for (let i = 16; i <= 20; i++) {
      const activityProposals = await db.select().from(activityBudgetProposals).where(eq(activityBudgetProposals.activityId, i));
      console.log(`Atividade ${i}: ${activityProposals.length} propostas`);
      activityProposals.forEach(p => console.log(`  - ${p.title}: R$ ${p.amount}`));
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

checkProposals();