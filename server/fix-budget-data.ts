import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Script para corrigir dados de orçamento das viagens
 * Converte strings JSON malformadas para objetos válidos
 */

interface BudgetBreakdown {
  transport?: number;
  accommodation?: number;
  food?: number;
  insurance?: number;
  medical?: number;
  activities?: number;
  other?: number;
}

async function fixBudgetData() {
  console.log('🔧 Iniciando correção dos dados de orçamento...');
  
  try {
    // Buscar todas as viagens com problemas de orçamento
    const results = await db.execute(sql`
      SELECT id, title, budget, budget_breakdown 
      FROM trips 
      WHERE budget_breakdown IS NOT NULL
    `);
    
    const trips = results.map((row: any) => ({
      id: row.id,
      title: row.title,
      budget: row.budget,
      budget_breakdown: row.budget_breakdown
    }));
    
    console.log(`📊 Encontradas ${trips.length} viagens com dados de orçamento`);
    
    let fixedCount = 0;
    
    for (const trip of trips) {
      const tripData = trip as any;
      let needsUpdate = false;
      let fixedBreakdown: BudgetBreakdown | null = null;
      
      // Tentar parsear o budget_breakdown
      if (tripData.budget_breakdown) {
        try {
          let parsed = tripData.budget_breakdown;
          
          // Se for string, tentar parsear
          if (typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed);
            } catch (e) {
              // Pode estar duplamente escapado
              try {
                parsed = JSON.parse(parsed);
              } catch (e2) {
                console.warn(`⚠️ Não foi possível parsear orçamento da viagem ${tripData.id}: ${tripData.title}`);
                continue;
              }
            }
          }
          
          // Verificar se o objeto está válido
          if (typeof parsed === 'object' && parsed !== null) {
            // Garantir que todos os valores são números
            const validBreakdown: BudgetBreakdown = {};
            let hasValidData = false;
            
            const categories = ['transport', 'accommodation', 'food', 'insurance', 'medical', 'activities', 'other'];
            
            for (const category of categories) {
              if (parsed[category] !== undefined && parsed[category] !== null) {
                const value = Number(parsed[category]);
                if (!isNaN(value) && value >= 0) {
                  validBreakdown[category as keyof BudgetBreakdown] = value;
                  hasValidData = true;
                }
              }
            }
            
            if (hasValidData) {
              // Verificar se o total bate com o orçamento
              const totalFromBreakdown = Object.values(validBreakdown).reduce((sum, value) => sum + (value || 0), 0);
              
              if (totalFromBreakdown > 0) {
                fixedBreakdown = validBreakdown;
                
                // Se o budget total não existe ou está incorreto, corrigir
                if (!tripData.budget || Math.abs(tripData.budget - totalFromBreakdown) > 1) {
                  console.log(`💰 Corrigindo budget total da viagem ${tripData.id}: ${tripData.budget} → ${totalFromBreakdown}`);
                  
                  await db.execute(sql`
                    UPDATE trips 
                    SET budget = ${totalFromBreakdown}, budget_breakdown = ${JSON.stringify(fixedBreakdown)}
                    WHERE id = ${tripData.id}
                  `);
                  
                  fixedCount++;
                } else {
                  // Apenas atualizar o breakdown se necessário
                  if (JSON.stringify(parsed) !== JSON.stringify(fixedBreakdown)) {
                    await db.execute(sql`
                      UPDATE trips 
                      SET budget_breakdown = ${JSON.stringify(fixedBreakdown)}
                      WHERE id = ${tripData.id}
                    `);
                    
                    fixedCount++;
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error(`❌ Erro ao processar viagem ${tripData.id}:`, error);
        }
      } else if (tripData.budget && tripData.budget > 0) {
        // Se não tem breakdown mas tem budget, criar um breakdown padrão
        const defaultBreakdown: BudgetBreakdown = {
          transport: Math.round(tripData.budget * 0.4),
          accommodation: Math.round(tripData.budget * 0.4),
          food: Math.round(tripData.budget * 0.2)
        };
        
        console.log(`🔨 Criando breakdown padrão para viagem ${tripData.id}: ${tripData.title}`);
        
        await db.execute(sql`
          UPDATE trips 
          SET budget_breakdown = ${JSON.stringify(defaultBreakdown)}
          WHERE id = ${tripData.id}
        `);
        
        fixedCount++;
      }
    }
    
    console.log(`✅ Correção concluída! ${fixedCount} viagens foram corrigidas.`);
    
    // Verificar resultados
    const verificationResults = await db.execute(sql`
      SELECT id, title, budget, budget_breakdown 
      FROM trips 
      WHERE budget_breakdown IS NOT NULL
      LIMIT 5
    `);
    
    const verificationTrips = verificationResults.map((row: any) => ({
      id: row.id,
      title: row.title,
      budget: row.budget,
      budget_breakdown: row.budget_breakdown
    }));
    
    console.log('\n📋 Verificação dos dados corrigidos:');
    for (const trip of verificationTrips) {
      const tripData = trip as any;
      console.log(`- Viagem ${tripData.id}: ${tripData.title}`);
      console.log(`  Budget: R$ ${tripData.budget}`);
      console.log(`  Breakdown: ${tripData.budget_breakdown}`);
      
      try {
        const parsed = JSON.parse(tripData.budget_breakdown);
        const total = Object.values(parsed).reduce((sum: number, value: any) => sum + (Number(value) || 0), 0);
        console.log(`  Total calculado: R$ ${total}`);
      } catch (e) {
        console.log(`  ⚠️ Ainda com problema de parsing`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  fixBudgetData().then(() => {
    console.log('🎉 Script de correção finalizado!');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

export { fixBudgetData };