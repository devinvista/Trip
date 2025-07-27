import { db } from '../db.js';
import { activities, activityBudgetProposals } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

// TEMPLATE: Activity Verification Script
// Use this template to verify activities after import

async function verifyActivitiesByLocation(location: string) {
  console.log(`🔍 Verificando atividades de ${location}...`);
  
  try {
    // Get all activities for the location
    const locationActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.location, location));
    
    console.log(`📊 Encontradas ${locationActivities.length} atividades em ${location}:`);
    
    for (const activity of locationActivities) {
      console.log(`\n🎯 ${activity.title} (ID: ${activity.id})`);
      console.log(`   📍 Localização: ${activity.location}`);
      console.log(`   📂 Categoria: ${activity.category}`);
      console.log(`   ⭐ Rating: ${activity.rating}/5`);
      console.log(`   🕐 Duração: ${activity.duration}h`);
      console.log(`   🎯 Dificuldade: ${activity.difficulty}`);
      console.log(`   💰 Faixa de preço: ${activity.priceRange}`);
      console.log(`   🖼️ Imagem: ${activity.coverImage}`);
      console.log(`   📝 Descrição: ${activity.description?.substring(0, 100)}...`);
      
      // Get budget proposals for this activity
      const proposals = await db
        .select()
        .from(activityBudgetProposals)
        .where(eq(activityBudgetProposals.activityId, activity.id));
      
      console.log(`   💵 Propostas de orçamento (${proposals.length}):`);
      for (const proposal of proposals) {
        console.log(`     - ${proposal.title}: R$ ${proposal.amount} (${proposal.votes} votos)`);
        console.log(`       📋 ${proposal.description}`);
        
        // Parse inclusions safely
        try {
          const inclusions = JSON.parse(proposal.inclusions || '[]');
          console.log(`       ✅ Inclui: ${inclusions.join(', ')}`);
        } catch (e) {
          console.log(`       ⚠️ Erro ao parsear inclusões: ${proposal.inclusions}`);
        }
      }
    }
    
    console.log('\n✅ Verificação concluída com sucesso!');
    console.log(`🎉 Total: ${locationActivities.length} atividades em ${location} verificadas`);
    
    return locationActivities;
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    return [];
  }
}

// Função para verificar todas as atividades
async function verifyAllActivities() {
  console.log('🔍 Verificando todas as atividades...');
  
  try {
    const allActivities = await db.select().from(activities);
    const allProposals = await db.select().from(activityBudgetProposals);
    
    console.log(`📊 Resumo geral:`);
    console.log(`   🎯 Total de atividades: ${allActivities.length}`);
    console.log(`   💰 Total de propostas: ${allProposals.length}`);
    
    // Agrupa por localização
    const byLocation = allActivities.reduce((acc, activity) => {
      acc[activity.location] = (acc[activity.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`   📍 Por localização:`);
    for (const [location, count] of Object.entries(byLocation)) {
      console.log(`     - ${location}: ${count} atividades`);
    }
    
    // Agrupa por categoria
    const byCategory = allActivities.reduce((acc, activity) => {
      acc[activity.category] = (acc[activity.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`   📂 Por categoria:`);
    for (const [category, count] of Object.entries(byCategory)) {
      console.log(`     - ${category}: ${count} atividades`);
    }
    
    return { activities: allActivities, proposals: allProposals };
    
  } catch (error) {
    console.error('❌ Erro na verificação geral:', error);
    return null;
  }
}

export { verifyActivitiesByLocation, verifyAllActivities };