import { db } from './db.js';
import { activities, trips } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

// Mapeamento padronizado de destinos
const LOCATION_MAPPING = {
  // Destinos nacionais
  'Rio de Janeiro': 'Rio de Janeiro, RJ',
  'São Paulo': 'São Paulo, SP',
  'Pantanal': 'Pantanal, MT',
  'Salvador': 'Salvador, BA',
  'Serra da Mantiqueira': 'Serra da Mantiqueira, MG',
  'Maragogi': 'Maragogi, AL',
  'Ouro Preto': 'Ouro Preto, MG',
  'Manaus': 'Manaus, AM',
  'Florianópolis': 'Florianópolis, SC',
  'Serra Gaúcha': 'Serra Gaúcha, RS',
  'Gramado': 'Gramado, RS',
  'Lençóis Maranhenses': 'Lençóis Maranhenses, MA',
  'Caruaru': 'Caruaru, PE',
  'Bonito': 'Bonito, MS',
  'Copacabana': 'Rio de Janeiro, RJ',
  
  // Destinos internacionais
  'Patagônia Argentina': 'El Calafate, Argentina',
  'Machu Picchu': 'Cusco, Peru',
  'Safári no Quênia': 'Nairobi, Quênia',
  'Paris': 'Paris, França',
  'Nova York': 'Nova York, EUA',
  'Londres': 'Londres, Reino Unido',
  'Roma': 'Roma, Itália',
  'Buenos Aires': 'Buenos Aires, Argentina'
};

async function standardizeLocations() {
  try {
    console.log('🔄 INICIANDO PADRONIZAÇÃO DE LOCALIZAÇÕES...\n');
    
    // Verificar viagens atuais
    const allTrips = await db.select().from(trips);
    console.log(`📊 Total de viagens encontradas: ${allTrips.length}`);
    
    // Agrupar por destino
    const destinationGroups = allTrips.reduce((acc, trip) => {
      if (!acc[trip.destination]) acc[trip.destination] = [];
      acc[trip.destination].push(trip);
      return acc;
    }, {} as Record<string, any[]>);
    
    console.log('\n🗺️ DESTINOS ATUAIS DAS VIAGENS:');
    Object.keys(destinationGroups).forEach(dest => {
      console.log(`  "${dest}" (${destinationGroups[dest].length} viagens)`);
    });
    
    // Aplicar padronização
    console.log('\n🔧 APLICANDO PADRONIZAÇÃO...');
    let updatedCount = 0;
    
    for (const [oldDestination, newLocation] of Object.entries(LOCATION_MAPPING)) {
      const tripsToUpdate = allTrips.filter(trip => trip.destination === oldDestination);
      
      if (tripsToUpdate.length > 0) {
        console.log(`  Atualizando "${oldDestination}" → "${newLocation}" (${tripsToUpdate.length} viagens)`);
        
        for (const trip of tripsToUpdate) {
          await db.update(trips)
            .set({ destination: newLocation })
            .where(eq(trips.id, trip.id));
          updatedCount++;
        }
      }
    }
    
    console.log(`\n✅ Padronização concluída! ${updatedCount} viagens atualizadas.`);
    
    // Verificar correspondências após padronização
    console.log('\n🔍 VERIFICANDO CORRESPONDÊNCIAS APÓS PADRONIZAÇÃO...');
    
    const updatedTrips = await db.select().from(trips);
    const allActivities = await db.select().from(activities);
    
    const tripDestinations = [...new Set(updatedTrips.map(t => t.destination))].filter(Boolean);
    const activityLocations = [...new Set(allActivities.map(a => a.location))].filter(Boolean);
    
    console.log('\n📍 DESTINOS DAS VIAGENS (após padronização):');
    tripDestinations.forEach(dest => console.log(`  - "${dest}"`));
    
    console.log('\n🏛️ LOCALIZAÇÕES DAS ATIVIDADES:');
    activityLocations.forEach(loc => console.log(`  - "${loc}"`));
    
    const matched = activityLocations.filter(loc => tripDestinations.includes(loc));
    const unmatched = activityLocations.filter(loc => !tripDestinations.includes(loc));
    
    console.log(`\n✅ Localizações correspondentes: ${matched.length}`);
    matched.forEach(loc => console.log(`  ✓ "${loc}"`));
    
    console.log(`\n❌ Localizações sem correspondência: ${unmatched.length}`);
    unmatched.forEach(loc => console.log(`  ✗ "${loc}"`));
    
    // Adicionar atividades para destinos sem atividades
    const destinationsWithoutActivities = tripDestinations.filter(dest => !activityLocations.includes(dest));
    
    if (destinationsWithoutActivities.length > 0) {
      console.log(`\n🚨 DESTINOS SEM ATIVIDADES (${destinationsWithoutActivities.length}):`);
      destinationsWithoutActivities.forEach(dest => {
        const tripCount = updatedTrips.filter(t => t.destination === dest).length;
        console.log(`  - "${dest}" (${tripCount} viagens)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro durante padronização:', error);
  }
  
  process.exit(0);
}

standardizeLocations();