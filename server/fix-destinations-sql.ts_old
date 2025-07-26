import { db } from './db.js';

async function fixDestinationsWithSQL() {
  try {
    console.log('🔄 CORRIGINDO DESTINOS DAS VIAGENS COM SQL DIRETO...\n');
    
    // Definir as correções por título
    const corrections = [
      { title: 'Rio de Janeiro Completo', destination: 'Rio de Janeiro, RJ' },
      { title: 'São Paulo Gastronômico', destination: 'São Paulo, SP' },
      { title: 'Aventura no Pantanal', destination: 'Pantanal, MT' },
      { title: 'Carnaval em Salvador', destination: 'Salvador, BA' },
      { title: 'Trilha na Serra da Mantiqueira', destination: 'Serra da Mantiqueira, MG' },
      { title: 'Praias de Maragogi', destination: 'Maragogi, AL' },
      { title: 'Cultura em Ouro Preto', destination: 'Ouro Preto, MG' },
      { title: 'Amazônia - Manaus', destination: 'Manaus, AM' },
      { title: 'Surf em Florianópolis', destination: 'Florianópolis, SC' },
      { title: 'Vinícolas na Serra Gaúcha', destination: 'Serra Gaúcha, RS' },
      { title: 'Lençóis Maranhenses', destination: 'Lençóis Maranhenses, MA' },
      { title: 'Festa Junina em Caruaru', destination: 'Caruaru, PE' },
      { title: 'Réveillon em Copacabana', destination: 'Rio de Janeiro, RJ' },
      { title: 'Patagônia Argentina', destination: 'El Calafate, Argentina' },
      { title: 'Machu Picchu', destination: 'Cusco, Peru' },
      { title: 'Safári no Quênia', destination: 'Nairobi, Quênia' }
    ];
    
    let updatedCount = 0;
    
    for (const correction of corrections) {
      console.log(`  Atualizando "${correction.title}" → "${correction.destination}"`);
      
      const result = await db.execute(`
        UPDATE trips 
        SET destination = ? 
        WHERE title = ?
      `, [correction.destination, correction.title]);
      
      updatedCount += (result as any).affectedRows || 0;
    }
    
    console.log(`\n✅ Correção concluída! ${updatedCount} viagens atualizadas.`);
    
    // Verificar resultado
    console.log('\n🔍 VERIFICANDO RESULTADO...');
    
    const tripsResult = await db.execute('SELECT DISTINCT destination FROM trips WHERE destination IS NOT NULL ORDER BY destination');
    const activitiesResult = await db.execute('SELECT DISTINCT location FROM activities WHERE location IS NOT NULL ORDER BY location');
    
    const tripDestinations = (tripsResult as any).map((row: any) => row.destination);
    const activityLocations = (activitiesResult as any).map((row: any) => row.location);
    
    console.log('\n📍 DESTINOS DAS VIAGENS (após correção):');
    for (const dest of tripDestinations) {
      const countResult = await db.execute('SELECT COUNT(*) as count FROM trips WHERE destination = ?', [dest]);
      const count = (countResult as any)[0].count;
      console.log(`  - "${dest}" (${count} viagens)`);
    }
    
    console.log('\n🏛️ LOCALIZAÇÕES DAS ATIVIDADES:');
    for (const loc of activityLocations) {
      const countResult = await db.execute('SELECT COUNT(*) as count FROM activities WHERE location = ?', [loc]);
      const count = (countResult as any)[0].count;
      console.log(`  - "${loc}" (${count} atividades)`);
    }
    
    const matched = activityLocations.filter(loc => tripDestinations.includes(loc));
    const unmatched = activityLocations.filter(loc => !tripDestinations.includes(loc));
    
    console.log(`\n✅ Localizações correspondentes: ${matched.length}`);
    matched.forEach(loc => console.log(`  ✓ "${loc}"`));
    
    console.log(`\n❌ Localizações sem correspondência: ${unmatched.length}`);
    unmatched.forEach(loc => console.log(`  ✗ "${loc}"`));
    
    // Destinos sem atividades
    const destinationsWithoutActivities = tripDestinations.filter(dest => !activityLocations.includes(dest));
    console.log(`\n🚨 DESTINOS SEM ATIVIDADES (${destinationsWithoutActivities.length}):`);
    destinationsWithoutActivities.forEach(dest => console.log(`  - "${dest}"`));
    
  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  }
  
  process.exit(0);
}

fixDestinationsWithSQL();