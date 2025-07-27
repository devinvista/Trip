import { db } from './db';
import { destinations, activities, trips, users, activityBudgetProposals } from '../shared/schema';

async function checkDatabaseStatus() {
  console.log("🔗 Conectando ao MySQL...");
  
  try {
    const destinationsCount = await db.select().from(destinations);
    const activitiesCount = await db.select().from(activities);
    const tripsCount = await db.select().from(trips);
    const usersCount = await db.select().from(users);
    const proposalsCount = await db.select().from(activityBudgetProposals);
    
    console.log("📊 STATUS DO BANCO DE DADOS:");
    console.log(`   🏙️ Destinos: ${destinationsCount.length}`);
    console.log(`   🎯 Atividades: ${activitiesCount.length}`);
    console.log(`   ✈️ Viagens: ${tripsCount.length}`);
    console.log(`   👤 Usuários: ${usersCount.length}`);
    console.log(`   💰 Propostas: ${proposalsCount.length}`);
    
    console.log("\n🌎 DISTRIBUIÇÃO DE DESTINOS POR CONTINENTE:");
    const continents = destinationsCount.reduce((acc, dest) => {
      acc[dest.continent] = (acc[dest.continent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    for (const [continent, count] of Object.entries(continents)) {
      console.log(`   ${continent}: ${count} cidades`);
    }
    
  } catch (error) {
    console.error("❌ Erro ao verificar status do banco:", error);
  }
}

checkDatabaseStatus().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
