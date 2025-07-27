import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

async function checkProposals() {
  try {
    console.log('🔍 Verificando propostas de orçamento no banco...');
    
    // Verificar total de propostas
    const totalProposals = await db.select().from(activityBudgetProposals);
    console.log(`📊 Total de propostas no banco: ${totalProposals.length}`);
    
    // Verificar propostas por atividade específica (ID 84 mencionado no log)
    const proposalsForActivity84 = await db.select()
      .from(activityBudgetProposals)
      .where(eq(activityBudgetProposals.activityId, 84));
    
    console.log(`🎯 Propostas para atividade ID 84: ${proposalsForActivity84.length}`);
    
    if (proposalsForActivity84.length > 0) {
      console.log('📋 Detalhes das propostas:');
      proposalsForActivity84.forEach((proposal, index) => {
        console.log(`  ${index + 1}. ${proposal.title} - R$ ${proposal.amount} (Ativo: ${proposal.isActive})`);
      });
    }
    
    // Verificar algumas atividades aleatórias
    const sampleActivities = await db.select().from(activities).limit(5);
    console.log('\n🔍 Verificando propostas para atividades de exemplo:');
    
    for (const activity of sampleActivities) {
      const proposals = await db.select()
        .from(activityBudgetProposals)
        .where(eq(activityBudgetProposals.activityId, activity.id));
      
      console.log(`  • ${activity.title} (ID: ${activity.id}): ${proposals.length} propostas`);
    }
    
    // Verificar se há propostas inativas
    const inactiveProposals = await db.select()
      .from(activityBudgetProposals)
      .where(eq(activityBudgetProposals.isActive, false));
    
    console.log(`\n❌ Propostas inativas: ${inactiveProposals.length}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar propostas:', error);
  }
}

checkProposals().then(() => {
  console.log('✅ Verificação concluída');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro durante verificação:', error);
  process.exit(1);
});