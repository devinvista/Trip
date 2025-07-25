import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

async function fixProposalsInsert() {
  try {
    console.log('🔧 Corrigindo inserção de propostas...');
    
    // Testar inserção em uma atividade específica primeiro
    const testActivity = await db.select().from(activities).limit(1);
    if (testActivity.length === 0) {
      console.error('❌ Nenhuma atividade encontrada');
      return;
    }

    const activity = testActivity[0];
    console.log(`🎯 Testando com atividade: ${activity.title} (ID: ${activity.id})`);

    // Verificar se já existe proposta para esta atividade
    const existingProposals = await db.select()
      .from(activityBudgetProposals)
      .where(eq(activityBudgetProposals.activityId, activity.id));

    console.log(`📋 Propostas existentes: ${existingProposals.length}`);

    if (existingProposals.length === 0) {
      console.log('💡 Inserindo proposta de teste...');
      
      try {
        const insertResult = await db.insert(activityBudgetProposals).values({
          activityId: activity.id,
          createdBy: 1,
          title: "Teste Econômico",
          description: "Proposta de teste econômica",
          amount: "50.00",
          inclusions: JSON.stringify(["Entrada", "Guia"]),
          exclusions: JSON.stringify(["Transporte", "Alimentação"]),
          isActive: true,
          votes: 0
        });
        
        console.log('✅ Proposta inserida com sucesso!', insertResult);
        
        // Verificar se foi inserida
        const newProposals = await db.select()
          .from(activityBudgetProposals)
          .where(eq(activityBudgetProposals.activityId, activity.id));
        
        console.log(`✅ Verificação: ${newProposals.length} propostas encontradas`);
        
      } catch (insertError) {
        console.error('❌ Erro na inserção:', insertError);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixProposalsInsert().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});