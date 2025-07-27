import { db } from './db.js';
import { activities, trips } from '../shared/schema.js';

async function checkLocationMismatch() {
  try {
    console.log('=== VERIFICANDO CORRESPONDÊNCIA DE LOCALIZAÇÕES ===\n');
    
    // Buscar atividades e viagens
    const activitiesData = await db.select().from(activities);
    const tripsData = await db.select().from(trips);
    
    console.log(`📊 Total de atividades: ${activitiesData.length}`);
    console.log(`📊 Total de viagens: ${tripsData.length}\n`);
    
    // Localizações únicas das atividades
    const activityLocations = [...new Set(activitiesData.map(a => a.location))].filter(Boolean);
    console.log('🏛️ LOCALIZAÇÕES DAS ATIVIDADES:');
    activityLocations.forEach(loc => console.log(`  - "${loc}"`));
    
    // Destinos únicos das viagens
    const tripDestinations = [...new Set(tripsData.map(t => t.destination))].filter(Boolean);
    console.log('\n🗺️ DESTINOS DAS VIAGENS:');
    tripDestinations.forEach(dest => console.log(`  - "${dest}"`));
    
    // Verificar correspondências
    console.log('\n🔍 ANÁLISE DE CORRESPONDÊNCIAS:');
    const matched = activityLocations.filter(loc => tripDestinations.includes(loc));
    const unmatched = activityLocations.filter(loc => !tripDestinations.includes(loc));
    
    console.log(`✅ Localizações que correspondem: ${matched.length}`);
    matched.forEach(loc => console.log(`  ✓ "${loc}"`));
    
    console.log(`❌ Localizações sem correspondência: ${unmatched.length}`);
    unmatched.forEach(loc => console.log(`  ✗ "${loc}"`));
    
    // Atividades por localização
    console.log('\n📍 ATIVIDADES POR LOCALIZAÇÃO:');
    activityLocations.forEach(loc => {
      const count = activitiesData.filter(a => a.location === loc).length;
      console.log(`  ${loc}: ${count} atividades`);
    });
    
    // Viagens por destino
    console.log('\n🎯 VIAGENS POR DESTINO:');
    tripDestinations.forEach(dest => {
      const count = tripsData.filter(t => t.destination === dest).length;
      console.log(`  ${dest}: ${count} viagens`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  }
  
  process.exit(0);
}

checkLocationMismatch();