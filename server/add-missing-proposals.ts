import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';
import { eq, sql } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

async function addMissingProposals() {
  try {
    console.log('🔍 Verificando atividades sem propostas...');
    
    // Buscar atividades que não têm propostas
    const activitiesWithoutProposals = await db.select({ 
      id: activities.id, 
      title: activities.title,
      location: activities.location 
    })
    .from(activities)
    .leftJoin(activityBudgetProposals, eq(activities.id, activityBudgetProposals.activityId))
    .where(sql`${activityBudgetProposals.id} IS NULL`)
    .groupBy(activities.id);

    console.log(`📊 Encontradas ${activitiesWithoutProposals.length} atividades sem propostas`);

    let addedCount = 0;

    for (const activity of activitiesWithoutProposals) {
      console.log(`🔧 Adicionando propostas para: ${activity.title} (ID: ${activity.id})`);
      
      const proposalsToAdd = [
        {
          title: "Econômico",
          description: "Opção básica com essenciais incluídos",
          amount: "30.00",
          inclusions: ["Entrada básica", "Informações gerais"],
          exclusions: ["Guia especializado", "Transporte", "Alimentação"]
        },
        {
          title: "Completo", 
          description: "Experiência completa com serviços extras",
          amount: "80.00",
          inclusions: ["Entrada premium", "Guia especializado", "Material informativo"],
          exclusions: ["Transporte", "Alimentação", "Souvenirs"]
        },
        {
          title: "Premium",
          description: "Experiência VIP com todos os luxos incluídos",
          amount: "150.00",
          inclusions: ["Acesso VIP", "Guia privado", "Transporte premium", "Cortesias"],
          exclusions: ["Alimentação externa", "Compras pessoais"]
        }
      ];

      for (const proposal of proposalsToAdd) {
        await db.insert(activityBudgetProposals).values({
          activityId: activity.id,
          createdBy: 1,
          title: proposal.title,
          description: proposal.description,
          amount: proposal.amount,
          inclusions: JSON.stringify(proposal.inclusions),
          exclusions: JSON.stringify(proposal.exclusions),
          isActive: true,
          votes: Math.floor(Math.random() * 50) + 1
        });
        addedCount++;
      }
    }

    console.log(`✅ Adicionadas ${addedCount} propostas para ${activitiesWithoutProposals.length} atividades`);

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

addMissingProposals().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});