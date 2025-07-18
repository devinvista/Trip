import { db } from './db.js';
import { trips } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

// Realistic budget values based on destination and trip duration
const realisticBudgets = {
  // International destinations (per person)
  'Paris, França': {
    budget: 8500.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 3200.00,    // Hotels 4-5 star for 7-10 days
      transport: 2500.00,        // Flight + local transport
      food: 1800.00,            // Restaurant meals
      activities: 1000.00       // Museums, tours, attractions
    })
  },
  'Londres, Reino Unido': {
    budget: 9200.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 3800.00,    // London hotels are expensive
      transport: 2800.00,        // Flight + tube/taxi
      food: 1800.00,            // Pub meals, restaurants
      activities: 800.00         // Attractions, theaters
    })
  },
  'Nova York, EUA': {
    budget: 12000.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 4500.00,    // Manhattan hotels
      transport: 3200.00,        // Flight + subway/taxi
      food: 2500.00,            // NYC dining
      activities: 1800.00       // Broadway, museums, tours
    })
  },
  'Roma, Itália': {
    budget: 7200.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 2800.00,    // Mid-range hotels
      transport: 2200.00,        // Flight + local transport
      food: 1400.00,            // Italian cuisine
      activities: 800.00        // Vatican, Colosseum, etc
    })
  },
  'Buenos Aires, Argentina': {
    budget: 4500.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 1800.00,    // Good hotels in Argentina
      transport: 1500.00,        // Flight + local transport
      food: 800.00,             // Local cuisine
      activities: 400.00        // Tango shows, tours
    })
  },
  'Barcelona, Espanha': {
    budget: 6800.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 2600.00,    // Barcelona hotels
      transport: 2400.00,        // Flight + metro
      food: 1200.00,            // Spanish cuisine
      activities: 600.00        // Gaudi sites, beaches
    })
  },
  'Quênia, África': {
    budget: 15000.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 6000.00,    // Safari lodges
      transport: 4500.00,        // International + safari vehicles
      food: 2000.00,            // Lodge meals
      activities: 2500.00       // Safari tours, park fees
    })
  },
  'Patagônia, Argentina': {
    budget: 8500.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 3200.00,    // Lodge accommodations
      transport: 3000.00,        // Flights + transfers
      food: 1500.00,            // Regional cuisine
      activities: 800.00        // Hiking tours, excursions
    })
  },
  'Machu Picchu, Peru': {
    budget: 5500.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 2000.00,    // Hotels in Cusco/Aguas Calientes
      transport: 2200.00,        // Flight + train to Machu Picchu
      food: 800.00,             // Peruvian cuisine
      activities: 500.00        // Machu Picchu entry + guides
    })
  },

  // Brazilian destinations (per person)
  'Pantanal, MT': {
    budget: 3200.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 1200.00,    // Eco lodges
      transport: 800.00,         // Domestic flight + transfers
      food: 600.00,             // Regional meals
      activities: 600.00        // Wildlife tours, fishing
    })
  },
  'Salvador, BA': {
    budget: 2800.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 1000.00,    // Salvador hotels
      transport: 700.00,         // Flight + local transport
      food: 500.00,             // Bahian cuisine
      activities: 600.00        // Carnival, city tours
    })
  },
  'Serra da Mantiqueira, MG': {
    budget: 2200.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 800.00,     // Mountain lodges
      transport: 600.00,         // Car rental + gas
      food: 400.00,             // Local restaurants
      activities: 400.00        // Hiking, nature tours
    })
  },
  'Maragogi, AL': {
    budget: 3500.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 1400.00,    // Beach resorts
      transport: 800.00,         // Flight + transfers
      food: 700.00,             // Seafood restaurants
      activities: 600.00        // Diving, boat tours
    })
  },
  'Ouro Preto, MG': {
    budget: 2000.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 700.00,     // Historic inns
      transport: 500.00,         // Car/bus transport
      food: 400.00,             // Traditional cuisine
      activities: 400.00        // Museums, historic tours
    })
  },
  'Manaus, AM': {
    budget: 4200.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 1500.00,    // Amazon lodges
      transport: 1200.00,        // Flight + boat transfers
      food: 700.00,             // Regional cuisine
      activities: 800.00        // Amazon tours, boat trips
    })
  },
  'Florianópolis, SC': {
    budget: 2800.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 1100.00,    // Beach hotels
      transport: 600.00,         // Flight + local transport
      food: 500.00,             // Seafood and local food
      activities: 600.00        // Surfing, beach activities
    })
  },
  'Serra Gaúcha, RS': {
    budget: 2500.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 900.00,     // Wine country hotels
      transport: 500.00,         // Car rental
      food: 600.00,             // Wine tastings and meals
      activities: 500.00        // Winery tours
    })
  },
  'Lençóis Maranhenses, MA': {
    budget: 3800.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 1300.00,    // Local pousadas
      transport: 1200.00,        // Flight + 4x4 transfers
      food: 600.00,             // Regional cuisine
      activities: 700.00        // Dune tours, lagoon visits
    })
  },
  'Caruaru, PE': {
    budget: 2200.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 700.00,     // Local hotels
      transport: 600.00,         // Transport to interior
      food: 400.00,             // Regional food
      activities: 500.00        // June festivals, cultural tours
    })
  },
  'Copacabana, RJ': {
    budget: 4500.00,
    budgetBreakdown: JSON.stringify({
      accommodation: 1800.00,    // Copacabana hotels for NYE
      transport: 800.00,         // Flight + local transport
      food: 1000.00,            // Restaurant meals
      activities: 900.00        // New Year's celebration, tours
    })
  }
};

async function fixTripBudgets() {
  console.log('💰 Iniciando correção de orçamentos de viagens para valores realistas...');
  
  try {
    // Get all trips from database
    const allTrips = await db.select().from(trips);
    console.log(`📊 Encontradas ${allTrips.length} viagens para atualizar`);
    
    let updatedCount = 0;
    
    for (const trip of allTrips) {
      const budgetData = realisticBudgets[trip.destination as keyof typeof realisticBudgets];
      
      if (budgetData) {
        try {
          await db
            .update(trips)
            .set({
              budget: budgetData.budget,
              budgetBreakdown: budgetData.budgetBreakdown,
              updatedAt: new Date()
            })
            .where(eq(trips.id, trip.id));
          
          console.log(`✅ Orçamento atualizado para "${trip.title}" (${trip.destination}): R$ ${budgetData.budget.toFixed(2)}`);
          updatedCount++;
        } catch (error: any) {
          console.error(`❌ Erro ao atualizar viagem ${trip.id}:`, error.message);
        }
      } else {
        // Set default budget for destinations not in our list
        const defaultBudget = 3000.00;
        const defaultBreakdown = JSON.stringify({
          accommodation: 1200.00,
          transport: 800.00,
          food: 600.00,
          activities: 400.00
        });
        
        try {
          await db
            .update(trips)
            .set({
              budget: defaultBudget,
              budgetBreakdown: defaultBreakdown,
              updatedAt: new Date()
            })
            .where(eq(trips.id, trip.id));
          
          console.log(`✅ Orçamento padrão aplicado para "${trip.title}" (${trip.destination}): R$ ${defaultBudget.toFixed(2)}`);
          updatedCount++;
        } catch (error: any) {
          console.error(`❌ Erro ao aplicar orçamento padrão para viagem ${trip.id}:`, error.message);
        }
      }
    }
    
    console.log(`\n🎉 Correção concluída!`);
    console.log(`📈 ${updatedCount} viagens tiveram seus orçamentos atualizados`);
    console.log(`💡 Orçamentos agora refletem valores realistas baseados em:`)
    console.log(`   • Destino e custo de vida local`);
    console.log(`   • Duração típica da viagem`);
    console.log(`   • Qualidade de acomodação e atividades`);
    console.log(`   • Custos de transporte atual`);
    console.log(`\n💰 Categorias de orçamento incluem:`);
    console.log(`   • Acomodação (hotéis, pousadas, lodges)`);
    console.log(`   • Transporte (voos, transfers, local)`);
    console.log(`   • Alimentação (restaurantes, refeições)`);
    console.log(`   • Atividades (tours, ingressos, experiências)`);
    
  } catch (error) {
    console.error('❌ Erro na correção geral de orçamentos:', error);
  }
}

// Execute the budget fix
fixTripBudgets();