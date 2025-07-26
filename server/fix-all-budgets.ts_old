import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Script para corrigir todos os orçamentos das viagens
 * Aplica valores realistas baseados no destino e duração
 */

interface BudgetData {
  budget: number;
  budgetBreakdown: {
    transport: number;
    accommodation: number;
    food: number;
    insurance?: number;
    medical?: number;
    activities?: number;
    other?: number;
  };
}

// Função para calcular orçamento baseado no destino e duração
function calculateBudgetForTrip(title: string, destination: string, startDate: string, endDate: string): BudgetData {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  // Fallback para casos onde as datas são inválidas
  if (isNaN(days) || days <= 0) {
    days = 7; // 7 dias como padrão
  }
  
  let dailyBudget = 150; // Base diária em reais
  let transportMultiplier = 1;
  let accommodationMultiplier = 1;
  let foodMultiplier = 1;
  
  // Ajustar multiplicadores baseado no destino
  const dest = (destination || '').toLowerCase();
  
  if (dest.includes('quênia') || dest.includes('nairobi')) {
    dailyBudget = 300;
    transportMultiplier = 3;
    accommodationMultiplier = 2;
  } else if (dest.includes('peru') || dest.includes('cusco')) {
    dailyBudget = 200;
    transportMultiplier = 2;
    accommodationMultiplier = 1.5;
  } else if (dest.includes('rio') || dest.includes('copacabana')) {
    dailyBudget = 250;
    transportMultiplier = 1.5;
    accommodationMultiplier = 2;
  } else if (dest.includes('maragogi') || dest.includes('alagoas')) {
    dailyBudget = 180;
    transportMultiplier = 1.2;
    accommodationMultiplier = 1.3;
  } else if (dest.includes('pantanal')) {
    dailyBudget = 220;
    transportMultiplier = 1.8;
    accommodationMultiplier = 1.5;
  } else if (dest.includes('gramado') || dest.includes('serra gaúcha')) {
    dailyBudget = 160;
    transportMultiplier = 1.1;
    accommodationMultiplier = 1.2;
  } else if (dest.includes('florianópolis')) {
    dailyBudget = 170;
    transportMultiplier = 1.2;
    accommodationMultiplier = 1.3;
  } else if (dest.includes('manaus') || dest.includes('amazônia')) {
    dailyBudget = 190;
    transportMultiplier = 1.6;
    accommodationMultiplier = 1.4;
  } else if (dest.includes('ouro preto')) {
    dailyBudget = 140;
    transportMultiplier = 1.1;
    accommodationMultiplier = 1.1;
  } else if (dest.includes('salvador')) {
    dailyBudget = 180;
    transportMultiplier = 1.3;
    accommodationMultiplier = 1.4;
  } else if (dest.includes('lençóis maranhenses')) {
    dailyBudget = 170;
    transportMultiplier = 1.4;
    accommodationMultiplier = 1.2;
  } else if (dest.includes('caruaru')) {
    dailyBudget = 130;
    transportMultiplier = 1.1;
    accommodationMultiplier = 1.1;
  } else if (dest.includes('mantiqueira')) {
    dailyBudget = 140;
    transportMultiplier = 1.2;
    accommodationMultiplier = 1.2;
  }
  
  // Calcular componentes do orçamento
  const totalBudget = Math.round(dailyBudget * days);
  const transport = Math.round(totalBudget * 0.3 * transportMultiplier);
  const accommodation = Math.round(totalBudget * 0.4 * accommodationMultiplier);
  const food = Math.round(totalBudget * 0.2 * foodMultiplier);
  const activities = Math.round(totalBudget * 0.1);
  
  // Ajustar total para que seja coerente
  const calculatedTotal = transport + accommodation + food + activities;
  const finalBudget = Math.round(calculatedTotal * 1.1); // 10% de margem
  
  // Validar que todos os valores são números válidos
  if (isNaN(finalBudget) || isNaN(transport) || isNaN(accommodation) || isNaN(food) || isNaN(activities)) {
    throw new Error(`Erro ao calcular orçamento para ${title}: valores inválidos`);
  }
  
  return {
    budget: finalBudget,
    budgetBreakdown: {
      transport,
      accommodation,
      food,
      activities,
      insurance: Math.round(finalBudget * 0.05),
      medical: Math.round(finalBudget * 0.03),
      other: Math.round(finalBudget * 0.02)
    }
  };
}

async function fixAllBudgets() {
  console.log('🔧 Iniciando correção de todos os orçamentos...');
  
  try {
    // Buscar todas as viagens
    const results = await db.execute(sql`
      SELECT id, title, destination, start_date, end_date, budget, budget_breakdown 
      FROM trips 
      ORDER BY id
    `);
    
    const trips = results.map((row: any) => ({
      id: row.id,
      title: row.title || '',
      destination: row.destination || '',
      startDate: row.start_date,
      endDate: row.end_date,
      currentBudget: row.budget,
      currentBreakdown: row.budget_breakdown
    }));
    
    console.log(`📊 Encontradas ${trips.length} viagens para corrigir`);
    
    let updatedCount = 0;
    
    for (const trip of trips) {
      try {
        const { budget, budgetBreakdown } = calculateBudgetForTrip(
          trip.title,
          trip.destination,
          trip.startDate,
          trip.endDate
        );
        
        // Atualizar no banco
        await db.execute(sql`
          UPDATE trips 
          SET budget = ${budget}, 
              budget_breakdown = ${JSON.stringify(budgetBreakdown)}
          WHERE id = ${trip.id}
        `);
        
        console.log(`✅ Viagem ${trip.id} (${trip.title}): R$ ${trip.currentBudget} → R$ ${budget}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Erro ao processar viagem ${trip.id} (${trip.title}):`, error);
        continue;
      }
    }
    
    console.log(`🎉 Correção concluída! ${updatedCount} viagens atualizadas`);
    
  } catch (error) {
    console.error('❌ Erro ao corrigir orçamentos:', error);
    throw error;
  }
}

// Executar diretamente
fixAllBudgets().catch(console.error);

export { fixAllBudgets };