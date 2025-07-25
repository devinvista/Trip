import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';
import { eq, sql, notInArray } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

async function fixAllMissingProposals() {
  try {
    console.log('🔍 Verificando quais atividades não têm propostas...');
    
    // Primeiro, vamos ver quais atividades têm propostas
    const activitiesWithProposals = await db.select({ 
      activityId: activityBudgetProposals.activityId 
    })
    .from(activityBudgetProposals)
    .groupBy(activityBudgetProposals.activityId);

    const activityIdsWithProposals = activitiesWithProposals.map(p => p.activityId);
    console.log(`📊 ${activityIdsWithProposals.length} atividades já têm propostas`);

    // Buscar todas as atividades
    const allActivities = await db.select().from(activities);
    console.log(`📊 Total de atividades: ${allActivities.length}`);

    // Filtrar atividades sem propostas
    const activitiesWithoutProposals = allActivities.filter(
      activity => !activityIdsWithProposals.includes(activity.id)
    );

    console.log(`📊 ${activitiesWithoutProposals.length} atividades SEM propostas`);

    let addedCount = 0;

    for (const activity of activitiesWithoutProposals) {
      console.log(`🔧 Adicionando propostas para: ${activity.title} (ID: ${activity.id})`);
      
      // Definir preços baseados na localização
      let basePrice = 30;
      const location = activity.location.toLowerCase();
      
      if (location.includes('paris') || location.includes('londres') || location.includes('nova york')) {
        basePrice = 50; // Destinos internacionais mais caros
      } else if (location.includes('rio') || location.includes('são paulo')) {
        basePrice = 40; // Grandes capitais
      } else if (location.includes('pantanal') || location.includes('amazônia')) {
        basePrice = 60; // Turismo de natureza
      }

      const proposalsToAdd = [
        {
          title: "Econômico",
          description: "Opção básica com essenciais incluídos",
          amount: basePrice.toFixed(2),
          inclusions: ["Entrada básica", "Informações gerais"],
          exclusions: ["Guia especializado", "Transporte", "Alimentação"]
        },
        {
          title: "Completo", 
          description: "Experiência completa com serviços extras",
          amount: (basePrice * 2.5).toFixed(2),
          inclusions: ["Entrada premium", "Guia especializado", "Material informativo"],
          exclusions: ["Transporte", "Alimentação", "Souvenirs"]
        },
        {
          title: "Premium",
          description: "Experiência VIP com todos os luxos incluídos",
          amount: (basePrice * 4.5).toFixed(2),
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
          currency: "BRL",
          priceType: "per_person",
          inclusions: JSON.stringify(proposal.inclusions),
          exclusions: JSON.stringify(proposal.exclusions),
          isActive: true,
          votes: Math.floor(Math.random() * 50) + 1
        });
        addedCount++;
      }
    }

    console.log(`✅ Adicionadas ${addedCount} propostas para ${activitiesWithoutProposals.length} atividades`);

    // Verificação final
    const finalProposalCount = await db.select({ count: sql`COUNT(*)` }).from(activityBudgetProposals);
    console.log(`📊 Total final de propostas no banco: ${finalProposalCount[0].count}`);

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

fixAllMissingProposals().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});