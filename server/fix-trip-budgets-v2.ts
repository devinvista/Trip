import { db } from './db.js';
import { trips } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

// Mapping function to match destinations with realistic budgets
function getBudgetForTrip(title: string, destination: string) {
  // International destinations
  if (destination.includes('Quênia') || title.includes('Safári')) {
    return {
      budget: 15000.00,
      budgetBreakdown: JSON.stringify({
        accommodation: 6000.00,    // Safari lodges
        transport: 4500.00,        // International + safari vehicles
        food: 2000.00,            // Lodge meals
        activities: 2500.00       // Safari tours, park fees
      })
    };
  }
  
  if (destination.includes('Argentina') || destination.includes('El Calafate') || title.includes('Patagônia')) {
    return {
      budget: 8500.00,
      budgetBreakdown: JSON.stringify({
        accommodation: 3200.00,    // Lodge accommodations
        transport: 3000.00,        // Flights + transfers
        food: 1500.00,            // Regional cuisine
        activities: 800.00        // Hiking tours, excursions
      })
    };
  }
  
  if (destination.includes('Peru') || destination.includes('Cusco') || title.includes('Machu Picchu')) {
    return {
      budget: 5500.00,
      budgetBreakdown: JSON.stringify({
        accommodation: 2000.00,    // Hotels in Cusco/Aguas Calientes
        transport: 2200.00,        // Flight + train to Machu Picchu
        food: 800.00,             // Peruvian cuisine
        activities: 500.00        // Machu Picchu entry + guides
      })
    };
  }

  // Brazilian destinations
  if (destination.includes('Pantanal') || destination.includes('MS')) {
    return {
      budget: 3200.00,
      budgetBreakdown: JSON.stringify({
        accommodation: 1200.00,    // Eco lodges
        transport: 800.00,         // Domestic flight + transfers
        food: 600.00,             // Regional meals
        activities: 600.00        // Wildlife tours, fishing
      })
    };
  }
  
  if (destination.includes('Salvador') || destination.includes('BA')) {
    return {
      budget: 2800.00,
      budgetBreakdown: JSON.stringify({
        accommodation: 1000.00,    // Salvador hotels
        transport: 700.00,         // Flight + local transport
        food: 500.00,             // Bahian cuisine
        activities: 600.00        // Carnival, city tours
      })
    };
  }
  
  if (destination.includes('Mantiqueira') || destination.includes('MG')) {
    return {
      budget: 2200.00,
      budgetBreakdown: JSON.stringify({
        accommodation: 800.00,     // Mountain lodges
        transport: 600.00,         // Car rental + gas
        food: 400.00,             // Local restaurants
        activities: 400.00        // Hiking, nature tours
      })
    };
  }
  
  if (destination.includes('Maragogi') || destination.includes('AL')) {
    return {
      budget: 3500.00,
      budgetBreakdown: JSON.stringify({
        accommodation: 1400.00,    // Beach resorts
        transport: 800.00,         // Flight + transfers
        food: 700.00,             // Seafood restaurants
        activities: 600.00        // Diving, boat tours
      })
    };
  }
  
  if (destination.includes('Ouro Preto')) {
    return {
      budget: 2000.00,
      budgetBreakdown: JSON.stringify({
        accommodation: 700.00,     // Historic inns
        transport: 500.00,         // Car/bus transport
        food: 400.00,             // Traditional cuisine
        activities: 400.00        // Museums, historic tours
      })
    };
  }
  
  if (destination.includes('Manaus') || destination.includes('AM')) {
    return {
      budget: 4200.00,
      budgetBreakdown: JSON.stringify({
        accommodation: 1500.00,    // Amazon lodges
        transport: 1200.00,        // Flight + boat transfers
        food: 700.00,             // Regional cuisine
        activities: 800.00        // Amazon tours, boat trips
      })
    };
  }
  
  if (destination.includes('Florianópolis') || destination.includes('SC')) {
    return {
      budget: 2800.00,
      budgetBreakdown: JSON.stringify({
        accommodation: 1100.00,    // Beach hotels
        transport: 600.00,         // Flight + local transport
        food: 500.00,             // Seafood and local food
        activities: 600.00        // Surfing, beach activities
      })
    };
  }
  
  if (destination.includes('Gramado') || destination.includes('RS') || title.includes('Serra Gaúcha')) {
    return {
      budget: 2500.00,
      budgetBreakdown: JSON.stringify({
        accommodation: 900.00,     // Wine country hotels
        transport: 500.00,         // Car rental
        food: 600.00,             // Wine tastings and meals
        activities: 500.00        // Winery tours
      })
    };
  }
  
  if (destination.includes('Lençóis Maranhenses') || destination.includes('MA')) {
    return {
      budget: 3800.00,
      budgetBreakdown: JSON.stringify({
        accommodation: 1300.00,    // Local pousadas
        transport: 1200.00,        // Flight + 4x4 transfers
        food: 600.00,             // Regional cuisine
        activities: 700.00        // Dune tours, lagoon visits
      })
    };
  }
  
  if (destination.includes('Caruaru') || destination.includes('PE')) {
    return {
      budget: 2200.00,
      budgetBreakdown: JSON.stringify({
        accommodation: 700.00,     // Local hotels
        transport: 600.00,         // Transport to interior
        food: 400.00,             // Regional food
        activities: 500.00        // June festivals, cultural tours
      })
    };
  }
  
  if (destination.includes('Rio de Janeiro') || destination.includes('Copacabana') || title.includes('Réveillon')) {
    return {
      budget: 4500.00,
      budgetBreakdown: JSON.stringify({
        accommodation: 1800.00,    // Copacabana hotels for NYE
        transport: 800.00,         // Flight + local transport
        food: 1000.00,            // Restaurant meals
        activities: 900.00        // New Year's celebration, tours
      })
    };
  }

  // Default budget for unmatched destinations
  return {
    budget: 3000.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 1200.00,
      transport: 800.00,
      food: 600.00,
      activities: 400.00
    })
  };
}

async function fixTripBudgetsV2() {
  console.log('💰 Iniciando correção V2 de orçamentos de viagens com mapeamento aprimorado...');
  
  try {
    // Get all trips from database
    const allTrips = await db.select().from(trips);
    console.log(`📊 Encontradas ${allTrips.length} viagens para atualizar`);
    
    let updatedCount = 0;
    
    for (const trip of allTrips) {
      const budgetData = getBudgetForTrip(trip.title, trip.destination);
      
      try {
        await db
          .update(trips)
          .set({
            budget: budgetData.budget,
            budgetBreakdown: budgetData.budgetBreakdown
          })
          .where(eq(trips.id, trip.id));
        
        console.log(`✅ "${trip.title}" (${trip.destination}): R$ ${budgetData.budget.toFixed(2)}`);
        updatedCount++;
      } catch (error: any) {
        console.error(`❌ Erro ao atualizar viagem ${trip.id}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Correção V2 concluída com sucesso!`);
    console.log(`📈 ${updatedCount}/${allTrips.length} viagens atualizadas`);
    console.log(`\n💡 Orçamentos baseados em pesquisa de mercado atual:`);
    console.log(`   • Destinos internacionais: R$ 5.500 - R$ 15.000`);
    console.log(`   • Destinos nacionais premium: R$ 3.200 - R$ 4.500`);
    console.log(`   • Destinos nacionais médios: R$ 2.200 - R$ 2.800`);
    console.log(`   • Destinos nacionais econômicos: R$ 2.000 - R$ 2.500`);
    
  } catch (error) {
    console.error('❌ Erro na correção V2:', error);
  }
}

// Execute the improved budget fix
fixTripBudgetsV2();