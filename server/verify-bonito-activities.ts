import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function verifyBonitoActivities() {
  console.log('🌿 Verificando atividades de Bonito (MS)...');
  
  try {
    // Get all Bonito activities
    const bonitoActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.location, 'Bonito, MS'));
    
    console.log(`📊 Encontradas ${bonitoActivities.length} atividades em Bonito (MS):`);
    
    for (const activity of bonitoActivities) {
      console.log(`\n🎯 ${activity.title} (ID: ${activity.id})`);
      console.log(`   📍 Localização: ${activity.location}`);
      console.log(`   📂 Categoria: ${activity.category}`);
      console.log(`   ⭐ Rating: ${activity.rating}/5`);
      console.log(`   🕐 Duração: ${activity.duration}h`);
      console.log(`   💰 Faixa de preço: ${activity.priceRange}`);
      console.log(`   📝 Descrição: ${activity.description?.substring(0, 100)}...`);
      
      // Get budget proposals for this activity
      const proposals = await db
        .select()
        .from(activityBudgetProposals)
        .where(eq(activityBudgetProposals.activityId, activity.id));
      
      console.log(`   💵 Propostas de orçamento (${proposals.length}):`);
      for (const proposal of proposals) {
        console.log(`     - ${proposal.title}: R$ ${proposal.amount} (${proposal.votes} votos)`);
        console.log(`       ${proposal.description}`);
      }
    }
    
    console.log('\n✅ Verificação concluída com sucesso!');
    console.log(`🎉 Total: ${bonitoActivities.length} atividades em Bonito (MS) com propostas completas`);
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

verifyBonitoActivities();