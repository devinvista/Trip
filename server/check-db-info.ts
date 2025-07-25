import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';
import { sql, eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

async function checkDbInfo() {
  try {
    // Verificar total de atividades
    const totalActivities = await db.select({ count: sql`COUNT(*)` }).from(activities);
    console.log('📊 Total de atividades:', totalActivities[0].count);

    // Verificar máximo ID
    const maxId = await db.select({ maxId: sql`MAX(id)` }).from(activities);
    console.log('🔢 Máximo ID de atividades:', maxId[0].maxId);

    // Verificar total de propostas
    const totalProposals = await db.select({ count: sql`COUNT(*)` }).from(activityBudgetProposals);
    console.log('💰 Total de propostas:', totalProposals[0].count);

    // Verificar algumas atividades com seus IDs
    const sampleActivities = await db.select({ id: activities.id, title: activities.title })
      .from(activities)
      .limit(10)
      .orderBy(sql`id DESC`);
    
    console.log('\n🔍 Últimas 10 atividades:');
    sampleActivities.forEach(activity => {
      console.log(`  ID ${activity.id}: ${activity.title}`);
    });

    // Verificar propostas existentes
    const proposalCount = await db.select({ 
      activityId: activityBudgetProposals.activityId,
      count: sql`COUNT(*)` 
    })
    .from(activityBudgetProposals)
    .groupBy(activityBudgetProposals.activityId)
    .limit(10);

    console.log('\n💡 Atividades com propostas:');
    proposalCount.forEach(item => {
      console.log(`  Atividade ${item.activityId}: ${item.count} propostas`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkDbInfo().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});