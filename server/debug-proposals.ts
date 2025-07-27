import { db } from './db.js';
import { activityBudgetProposals, activities } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

async function debugProposals() {
  try {
    console.log('🔍 Debugando propostas para atividade 163...');
    
    // Verificar se a atividade existe
    const activity = await db.select().from(activities).where(eq(activities.id, 163));
    console.log('Atividade 163:', activity[0]?.title || 'NÃO ENCONTRADA');
    
    // Verificar propostas para atividade 163
    const proposals = await db.select().from(activityBudgetProposals)
      .where(eq(activityBudgetProposals.activityId, 163));
    
    console.log(`Total de propostas para atividade 163: ${proposals.length}`);
    
    if (proposals.length > 0) {
      proposals.forEach((proposal, index) => {
        console.log(`  ${index + 1}. ${proposal.title} - R$ ${proposal.amount} (Ativo: ${proposal.isActive})`);
      });
    }
    
    // Verificar o método storage diretamente
    const { storage } = await import('./storage.js');
    const storageProposals = await storage.getActivityBudgetProposals(163);
    console.log(`Propostas via storage: ${storageProposals.length}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

debugProposals().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});