import { db } from './db';
import { trips } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function fixBudgetsSimple() {
  console.log('🔧 Iniciando correção simplificada de orçamentos...');
  
  try {
    // Buscar todas as viagens
    const allTrips = await db.select().from(trips);
    console.log(`📊 Encontradas ${allTrips.length} viagens`);
    
    let updatedCount = 0;
    
    for (const trip of allTrips) {
      // Calcular orçamento baseado no destino
      let budget = 2000; // Base padrão
      let budgetData = {
        transport: 600,
        accommodation: 800,
        food: 400,
        activities: 200
      };
      
      const dest = (trip.destination || '').toLowerCase();
      
      if (dest.includes('quênia') || dest.includes('nairobi')) {
        budget = 5800;
        budgetData = { transport: 2320, accommodation: 2320, food: 1160, activities: 0 };
      } else if (dest.includes('peru') || dest.includes('cusco')) {
        budget = 4200;
        budgetData = { transport: 1680, accommodation: 1680, food: 840, activities: 0 };
      } else if (dest.includes('rio') || dest.includes('copacabana')) {
        budget = 3500;
        budgetData = { transport: 1050, accommodation: 1400, food: 700, activities: 350 };
      } else if (dest.includes('maragogi')) {
        budget = 2200;
        budgetData = { transport: 880, accommodation: 880, food: 440, activities: 0 };
      } else if (dest.includes('pantanal')) {
        budget = 2800;
        budgetData = { transport: 1120, accommodation: 1120, food: 560, activities: 0 };
      } else if (dest.includes('gramado')) {
        budget = 1800;
        budgetData = { transport: 540, accommodation: 720, food: 360, activities: 180 };
      } else if (dest.includes('florianópolis')) {
        budget = 1600;
        budgetData = { transport: 480, accommodation: 640, food: 320, activities: 160 };
      } else if (dest.includes('manaus')) {
        budget = 2400;
        budgetData = { transport: 960, accommodation: 960, food: 480, activities: 0 };
      } else if (dest.includes('ouro preto')) {
        budget = 1400;
        budgetData = { transport: 420, accommodation: 560, food: 280, activities: 140 };
      } else if (dest.includes('salvador')) {
        budget = 1800;
        budgetData = { transport: 720, accommodation: 720, food: 360, activities: 0 };
      } else if (dest.includes('lençóis')) {
        budget = 2000;
        budgetData = { transport: 800, accommodation: 800, food: 400, activities: 0 };
      } else if (dest.includes('caruaru')) {
        budget = 1300;
        budgetData = { transport: 520, accommodation: 520, food: 260, activities: 0 };
      } else if (dest.includes('mantiqueira')) {
        budget = 1500;
        budgetData = { transport: 600, accommodation: 600, food: 300, activities: 0 };
      }
      
      // Atualizar a viagem
      await db.update(trips)
        .set({
          budget: budget,
          budgetBreakdown: JSON.stringify(budgetData)
        })
        .where(eq(trips.id, trip.id));
      
      console.log(`✅ Viagem ${trip.id} (${trip.title}): R$ ${budget}`);
      updatedCount++;
    }
    
    console.log(`🎉 Correção concluída! ${updatedCount} viagens atualizadas`);
    
  } catch (error) {
    console.error('❌ Erro ao corrigir orçamentos:', error);
    throw error;
  }
}

// Executar
fixBudgetsSimple().catch(console.error);