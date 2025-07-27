import { db } from './db.js';
import { activities, activityBudgetProposals, activityReviews } from '../shared/schema.js';
import { eq, and } from 'drizzle-orm';

async function verifyRioActivities() {
  console.log('🔍 Verificando atividades do Rio de Janeiro...');
  
  try {
    // Get all Rio activities
    const rioActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.location, 'Rio de Janeiro, RJ'));
    
    console.log(`📊 Encontradas ${rioActivities.length} atividades no Rio de Janeiro:`);
    
    for (const activity of rioActivities) {
      console.log(`\n🎯 ${activity.title} (ID: ${activity.id})`);
      console.log(`   📍 Localização: ${activity.location}`);
      console.log(`   📂 Categoria: ${activity.category}`);
      console.log(`   ⭐ Rating: ${activity.rating}/5 (${activity.reviewCount} reviews)`);
      console.log(`   🕐 Duração: ${activity.duration}h`);
      console.log(`   💰 Faixa de preço: ${activity.priceRange}`);
      
      // Get budget proposals for this activity
      const proposals = await db
        .select()
        .from(activityBudgetProposals)
        .where(eq(activityBudgetProposals.activityId, activity.id));
      
      console.log(`   💵 Propostas de orçamento (${proposals.length}):`);
      for (const proposal of proposals) {
        console.log(`     - ${proposal.title}: R$ ${proposal.price} (${proposal.votes} votos)`);
      }
      
      // Get reviews for this activity
      const reviews = await db
        .select()
        .from(activityReviews)
        .where(eq(activityReviews.activityId, activity.id));
      
      console.log(`   📝 Avaliações (${reviews.length}):`);
      for (const review of reviews) {
        console.log(`     - ${review.userName}: ${review.rating}/5 estrelas`);
        console.log(`       "${review.comment.substring(0, 50)}..."`);
      }
    }
    
    console.log('\n✅ Verificação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

verifyRioActivities();