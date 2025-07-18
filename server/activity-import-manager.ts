import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';
import { eq, and, gte, lte } from 'drizzle-orm';

// Utility functions for activity management

/**
 * Import activities with proposals
 */
export async function importActivities(activitiesData: any[], source: string = 'import') {
  console.log(`🚀 Iniciando importação de ${activitiesData.length} atividades (${source})...`);
  
  const results = [];
  
  try {
    for (const activityData of activitiesData) {
      console.log(`📍 Adicionando: ${activityData.title}`);
      
      // Validate required fields
      if (!activityData.title || !activityData.location || !activityData.category) {
        console.error(`❌ Campos obrigatórios faltando para: ${activityData.title}`);
        continue;
      }
      
      // Insert activity
      const [activity] = await db.insert(activities).values({
        title: activityData.title,
        description: activityData.description,
        location: activityData.location,
        category: activityData.category,
        duration: activityData.duration || 1,
        difficulty: activityData.difficulty || 'easy',
        priceRange: activityData.priceRange || 'Consultar',
        coverImage: activityData.coverImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        rating: activityData.rating || "4.5",
        reviewCount: activityData.reviewCount || 0,
        isActive: true,
        createdById: 1
      });
      
      const activityId = activity.insertId;
      console.log(`✅ Atividade criada com ID: ${activityId}`);
      
      // Add budget proposals
      if (activityData.proposals && activityData.proposals.length > 0) {
        for (const proposal of activityData.proposals) {
          await db.insert(activityBudgetProposals).values({
            activityId: activityId,
            createdBy: 1,
            title: proposal.title,
            description: proposal.description,
            amount: proposal.price.toString(),
            inclusions: JSON.stringify(proposal.inclusions || []),
            exclusions: JSON.stringify(proposal.exclusions || []),
            votes: Math.floor(Math.random() * 60) + 20,
            isActive: true
          });
          
          console.log(`💰 Proposta "${proposal.title}" criada: R$ ${proposal.price}`);
        }
      }
      
      results.push({ id: activityId, title: activityData.title });
      console.log(`✅ "${activityData.title}" configurada!\n`);
    }
    
    console.log(`🎉 Importação concluída! ${results.length} atividades adicionadas.`);
    return results;
    
  } catch (error) {
    console.error('❌ Erro durante a importação:', error);
    throw error;
  }
}

/**
 * Verify activities by location
 */
export async function verifyActivitiesByLocation(location: string) {
  console.log(`🔍 Verificando atividades de ${location}...`);
  
  try {
    const locationActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.location, location));
    
    console.log(`📊 Encontradas ${locationActivities.length} atividades em ${location}`);
    
    for (const activity of locationActivities) {
      const proposals = await db
        .select()
        .from(activityBudgetProposals)
        .where(eq(activityBudgetProposals.activityId, activity.id));
      
      console.log(`🎯 ${activity.title} - ${proposals.length} propostas`);
    }
    
    return locationActivities;
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    return [];
  }
}

/**
 * Delete activities by ID range
 */
export async function deleteActivitiesRange(startId: number, endId: number) {
  console.log(`🗑️ Removendo atividades de ID ${startId} a ${endId}...`);
  
  try {
    // First delete proposals
    await db.delete(activityBudgetProposals).where(
      and(
        gte(activityBudgetProposals.activityId, startId),
        lte(activityBudgetProposals.activityId, endId)
      )
    );
    
    // Then delete activities
    await db.delete(activities).where(
      and(
        gte(activities.id, startId),
        lte(activities.id, endId)
      )
    );
    
    console.log(`✅ Atividades removidas com sucesso!`);
    
  } catch (error) {
    console.error('❌ Erro ao remover atividades:', error);
    throw error;
  }
}

/**
 * Get activity statistics
 */
export async function getActivityStats() {
  console.log('📊 Coletando estatísticas de atividades...');
  
  try {
    const allActivities = await db.select().from(activities);
    const allProposals = await db.select().from(activityBudgetProposals);
    
    // Group by location
    const byLocation = allActivities.reduce((acc, activity) => {
      acc[activity.location] = (acc[activity.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Group by category
    const byCategory = allActivities.reduce((acc, activity) => {
      acc[activity.category] = (acc[activity.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const stats = {
      totalActivities: allActivities.length,
      totalProposals: allProposals.length,
      byLocation,
      byCategory,
      avgProposalsPerActivity: allProposals.length / allActivities.length
    };
    
    console.log('📈 Estatísticas:');
    console.log(`   🎯 Total de atividades: ${stats.totalActivities}`);
    console.log(`   💰 Total de propostas: ${stats.totalProposals}`);
    console.log(`   📊 Média de propostas por atividade: ${stats.avgProposalsPerActivity.toFixed(2)}`);
    
    console.log(`   📍 Por localização:`);
    Object.entries(stats.byLocation).forEach(([location, count]) => {
      console.log(`     - ${location}: ${count} atividades`);
    });
    
    console.log(`   📂 Por categoria:`);
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      console.log(`     - ${category}: ${count} atividades`);
    });
    
    return stats;
    
  } catch (error) {
    console.error('❌ Erro ao coletar estatísticas:', error);
    return null;
  }
}

/**
 * Fix proposal amounts (convert price field to amount)
 */
export async function fixProposalAmounts() {
  console.log('🔧 Corrigindo campos de propostas...');
  
  try {
    const proposals = await db.select().from(activityBudgetProposals);
    
    for (const proposal of proposals) {
      // Check if amount is empty or null
      if (!proposal.amount || proposal.amount === '0' || proposal.amount === '0.00') {
        // Try to extract from description or set default
        const defaultAmount = '100.00';
        await db.update(activityBudgetProposals)
          .set({ amount: defaultAmount })
          .where(eq(activityBudgetProposals.id, proposal.id));
        
        console.log(`🔄 Proposta ${proposal.id} corrigida: R$ ${defaultAmount}`);
      }
    }
    
    console.log('✅ Correção concluída!');
    
  } catch (error) {
    console.error('❌ Erro na correção:', error);
    throw error;
  }
}

// CLI interface
const command = process.argv[2];
const args = process.argv.slice(3);

if (command === 'stats') {
  getActivityStats();
} else if (command === 'verify' && args[0]) {
  verifyActivitiesByLocation(args[0]);
} else if (command === 'delete' && args[0] && args[1]) {
  deleteActivitiesRange(parseInt(args[0]), parseInt(args[1]));
} else if (command === 'fix') {
  fixProposalAmounts();
} else {
  console.log(`
🚀 PartiuTrip Activity Import Manager

Comandos disponíveis:
  npm run activity-manager stats                    - Estatísticas gerais
  npm run activity-manager verify "Cidade, Estado" - Verificar atividades por localização
  npm run activity-manager delete start end        - Remover atividades por range de ID
  npm run activity-manager fix                     - Corrigir campos de propostas

Exemplos:
  npx tsx server/activity-import-manager.ts stats
  npx tsx server/activity-import-manager.ts verify "Rio de Janeiro, RJ"
  npx tsx server/activity-import-manager.ts delete 20 25
  npx tsx server/activity-import-manager.ts fix
  `);
}