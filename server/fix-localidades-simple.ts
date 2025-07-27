import { db } from './db.js';

async function fixLocalidadesSimple() {
  try {
    console.log('🔄 CORRIGINDO LOCALIDADES DAS VIAGENS (SQL DIRETO)...\n');
    
    const updates = [
      { title: 'Rio de Janeiro Completo', localidade: 'Rio de Janeiro, RJ' },
      { title: 'São Paulo Gastronômico', localidade: 'São Paulo, SP' },
      { title: 'Aventura no Pantanal', localidade: 'Pantanal, MT' },
      { title: 'Carnaval em Salvador', localidade: 'Salvador, BA' },
      { title: 'Trilha na Serra da Mantiqueira', localidade: 'Serra da Mantiqueira, MG' },
      { title: 'Praias de Maragogi', localidade: 'Maragogi, AL' },
      { title: 'Cultura em Ouro Preto', localidade: 'Ouro Preto, MG' },
      { title: 'Amazônia - Manaus', localidade: 'Manaus, AM' },
      { title: 'Surf em Florianópolis', localidade: 'Florianópolis, SC' },
      { title: 'Vinícolas na Serra Gaúcha', localidade: 'Serra Gaúcha, RS' },
      { title: 'Lençóis Maranhenses', localidade: 'Lençóis Maranhenses, MA' },
      { title: 'Festa Junina em Caruaru', localidade: 'Caruaru, PE' },
      { title: 'Réveillon em Copacabana', localidade: 'Rio de Janeiro, RJ' },
      { title: 'Patagônia Argentina', localidade: 'El Calafate, Argentina' },
      { title: 'Machu Picchu', localidade: 'Cusco, Peru' },
      { title: 'Safári no Quênia', localidade: 'Nairobi, Quênia' }
    ];

    let totalUpdated = 0;
    
    for (const update of updates) {
      console.log(`  Atualizando "${update.title}" → "${update.localidade}"`);
      
      const sql = `UPDATE trips SET localidade = '${update.localidade}' WHERE title = '${update.title}'`;
      const result = await db.execute(sql);
      
      const affectedRows = (result as any).affectedRows || 0;
      totalUpdated += affectedRows;
      console.log(`    ✅ ${affectedRows} viagens atualizadas`);
    }
    
    console.log(`\n✅ Correção concluída! Total: ${totalUpdated} viagens atualizadas.`);
    
    // Verificar resultado
    console.log('\n🔍 VERIFICANDO CORRESPONDÊNCIAS...');
    
    const [tripsResult] = await db.execute(`
      SELECT localidade, COUNT(*) as count 
      FROM trips 
      WHERE localidade IS NOT NULL AND localidade != '' 
      GROUP BY localidade 
      ORDER BY localidade
    `);
    
    const [activitiesResult] = await db.execute(`
      SELECT location, COUNT(*) as count 
      FROM activities 
      WHERE location IS NOT NULL 
      GROUP BY location 
      ORDER BY location
    `);
    
    console.log('\n📍 LOCALIDADES DAS VIAGENS (após correção):');
    (tripsResult as any).forEach(row => {
      console.log(`  - "${row.localidade}" (${row.count} viagens)`);
    });
    
    console.log('\n🏛️ LOCALIZAÇÕES DAS ATIVIDADES:');
    (activitiesResult as any).forEach(row => {
      console.log(`  - "${row.location}" (${row.count} atividades)`);
    });
    
    // Verificar correspondências
    const tripLocalidades = (tripsResult as any).map(row => row.localidade);
    const activityLocations = (activitiesResult as any).map(row => row.location);
    
    const matched = activityLocations.filter(loc => tripLocalidades.includes(loc));
    const unmatched = activityLocations.filter(loc => !tripLocalidades.includes(loc));
    
    console.log(`\n✅ Localizações correspondentes: ${matched.length}`);
    matched.forEach(loc => console.log(`  ✓ "${loc}"`));
    
    console.log(`\n❌ Localizações sem correspondência: ${unmatched.length}`);
    unmatched.forEach(loc => console.log(`  ✗ "${loc}"`));
    
    // Localidades sem atividades  
    const localidadesWithoutActivities = tripLocalidades.filter(loc => !activityLocations.includes(loc));
    console.log(`\n🚨 LOCALIDADES SEM ATIVIDADES (${localidadesWithoutActivities.length}):`);
    localidadesWithoutActivities.forEach(loc => console.log(`  - "${loc}"`));
    
    console.log(`\n📊 RESUMO FINAL:`);
    console.log(`  • Total de localidades com viagens: ${tripLocalidades.length}`);
    console.log(`  • Total de localizações com atividades: ${activityLocations.length}`);
    console.log(`  • Correspondências: ${matched.length}`);
    console.log(`  • Taxa de correspondência: ${Math.round((matched.length / Math.max(tripLocalidades.length, 1)) * 100)}%`);
    
  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  }
  
  process.exit(0);
}

fixLocalidadesSimple();