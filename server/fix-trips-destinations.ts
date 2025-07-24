import { db } from './db.js';
import { activities, trips } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

// Definições de destinos baseados nos títulos das viagens
const TRIP_DESTINATIONS = {
  'Rio de Janeiro Completo': 'Rio de Janeiro, RJ',
  'São Paulo Gastronômico': 'São Paulo, SP',
  'Aventura no Pantanal': 'Pantanal, MT',
  'Carnaval em Salvador': 'Salvador, BA',
  'Trilha na Serra da Mantiqueira': 'Serra da Mantiqueira, MG',
  'Praias de Maragogi': 'Maragogi, AL',
  'Cultura em Ouro Preto': 'Ouro Preto, MG',
  'Amazônia - Manaus': 'Manaus, AM',
  'Surf em Florianópolis': 'Florianópolis, SC',
  'Vinícolas na Serra Gaúcha': 'Serra Gaúcha, RS',
  'Lençóis Maranhenses': 'Lençóis Maranhenses, MA',
  'Festa Junina em Caruaru': 'Caruaru, PE',
  'Réveillon em Copacabana': 'Rio de Janeiro, RJ',
  'Patagônia Argentina': 'El Calafate, Argentina',
  'Machu Picchu': 'Cusco, Peru',
  'Safári no Quênia': 'Nairobi, Quênia'
};

async function fixTripsDestinations() {
  try {
    console.log('🔄 CORRIGINDO DESTINOS DAS VIAGENS...\n');
    
    // Buscar todas as viagens
    const allTrips = await db.select().from(trips);
    console.log(`📊 Total de viagens encontradas: ${allTrips.length}`);
    
    // Mostrar títulos atuais
    console.log('\n📝 TÍTULOS DAS VIAGENS:');
    allTrips.forEach(trip => {
      console.log(`  ID ${trip.id}: "${trip.title}" → destination: "${trip.destination}"`);
    });
    
    // Aplicar correções
    console.log('\n🔧 APLICANDO CORREÇÕES DE DESTINOS...');
    let updatedCount = 0;
    
    for (const trip of allTrips) {
      // Buscar destino baseado no título
      let newDestination = null;
      
      // Busca exata primeiro
      if (TRIP_DESTINATIONS[trip.title]) {
        newDestination = TRIP_DESTINATIONS[trip.title];
      } else {
        // Busca por palavras-chave no título
        const title = trip.title.toLowerCase();
        if (title.includes('rio de janeiro') || title.includes('copacabana')) {
          newDestination = 'Rio de Janeiro, RJ';
        } else if (title.includes('são paulo')) {
          newDestination = 'São Paulo, SP';
        } else if (title.includes('pantanal')) {
          newDestination = 'Pantanal, MT';
        } else if (title.includes('salvador')) {
          newDestination = 'Salvador, BA';
        } else if (title.includes('mantiqueira')) {
          newDestination = 'Serra da Mantiqueira, MG';
        } else if (title.includes('maragogi')) {
          newDestination = 'Maragogi, AL';
        } else if (title.includes('ouro preto')) {
          newDestination = 'Ouro Preto, MG';
        } else if (title.includes('manaus') || title.includes('amazônia')) {
          newDestination = 'Manaus, AM';
        } else if (title.includes('florianópolis')) {
          newDestination = 'Florianópolis, SC';
        } else if (title.includes('serra gaúcha') || title.includes('gramado')) {
          newDestination = 'Serra Gaúcha, RS';
        } else if (title.includes('lençóis maranhenses')) {
          newDestination = 'Lençóis Maranhenses, MA';
        } else if (title.includes('caruaru')) {
          newDestination = 'Caruaru, PE';
        } else if (title.includes('patagônia')) {
          newDestination = 'El Calafate, Argentina';
        } else if (title.includes('machu picchu')) {
          newDestination = 'Cusco, Peru';
        } else if (title.includes('quênia') || title.includes('safári')) {
          newDestination = 'Nairobi, Quênia';
        } else if (title.includes('bonito')) {
          newDestination = 'Bonito, MS';
        } else if (title.includes('paris')) {
          newDestination = 'Paris, França';
        } else if (title.includes('nova york')) {
          newDestination = 'Nova York, EUA';
        } else if (title.includes('londres')) {
          newDestination = 'Londres, Reino Unido';
        } else if (title.includes('roma')) {
          newDestination = 'Roma, Itália';
        } else if (title.includes('buenos aires')) {
          newDestination = 'Buenos Aires, Argentina';
        } else {
          // Fallback baseado em padrões comuns
          newDestination = 'Rio de Janeiro, RJ'; // padrão
        }
      }
      
      if (newDestination && (trip.destination === undefined || trip.destination === null || trip.destination === 'undefined' || trip.destination !== newDestination)) {
        console.log(`  Atualizando viagem "${trip.title}" → "${newDestination}"`);
        try {
          await db.update(trips)
            .set({ destination: newDestination })
            .where(eq(trips.id, trip.id));
          updatedCount++;
        } catch (updateError) {
          console.error(`    Erro ao atualizar viagem ${trip.id}:`, updateError);
        }
      }
    }
    
    console.log(`\n✅ Correção concluída! ${updatedCount} viagens atualizadas.`);
    
    // Verificar resultado
    console.log('\n🔍 VERIFICANDO RESULTADO...');
    const updatedTrips = await db.select().from(trips);
    const allActivities = await db.select().from(activities);
    
    const tripDestinations = [...new Set(updatedTrips.map(t => t.destination))].filter(Boolean);
    const activityLocations = [...new Set(allActivities.map(a => a.location))].filter(Boolean);
    
    console.log('\n📍 DESTINOS DAS VIAGENS (após correção):');
    tripDestinations.forEach(dest => {
      const count = updatedTrips.filter(t => t.destination === dest).length;
      console.log(`  - "${dest}" (${count} viagens)`);
    });
    
    console.log('\n🏛️ LOCALIZAÇÕES DAS ATIVIDADES:');
    activityLocations.forEach(loc => {
      const count = allActivities.filter(a => a.location === loc).length;
      console.log(`  - "${loc}" (${count} atividades)`);
    });
    
    const matched = activityLocations.filter(loc => tripDestinations.includes(loc));
    const unmatched = activityLocations.filter(loc => !tripDestinations.includes(loc));
    
    console.log(`\n✅ Localizações correspondentes: ${matched.length}`);
    matched.forEach(loc => console.log(`  ✓ "${loc}"`));
    
    console.log(`\n❌ Localizações sem correspondência: ${unmatched.length}`);
    unmatched.forEach(loc => console.log(`  ✗ "${loc}"`));
    
    // Destinos sem atividades
    const destinationsWithoutActivities = tripDestinations.filter(dest => !activityLocations.includes(dest));
    console.log(`\n🚨 DESTINOS SEM ATIVIDADES (${destinationsWithoutActivities.length}):`);
    destinationsWithoutActivities.forEach(dest => {
      const tripCount = updatedTrips.filter(t => t.destination === dest).length;
      console.log(`  - "${dest}" (${tripCount} viagens)`);
    });
    
  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  }
  
  process.exit(0);
}

fixTripsDestinations();