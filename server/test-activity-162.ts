import { db } from './db.js';
import { activityBudgetProposals } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

async function testActivity162() {
  try {
    console.log('🔍 Testando atividade 162...');
    
    const proposals = await db.select()
      .from(activityBudgetProposals)
      .where(eq(activityBudgetProposals.activityId, 162));
    
    console.log(`📊 Propostas encontradas: ${proposals.length}`);
    
    proposals.forEach((proposal, index) => {
      console.log(`${index + 1}. ${proposal.title} - R$ ${proposal.amount}`);
      console.log(`   Descrição: ${proposal.description}`);
      console.log(`   Ativo: ${proposal.isActive}`);
      console.log(`   Inclusões: ${proposal.inclusions}`);
      console.log(`   Exclusões: ${proposal.exclusions}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testActivity162().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});