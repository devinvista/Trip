import { db } from './db.js';

async function fixLocalidadesFinal() {
  try {
    console.log('🔄 CORRIGINDO CAMPO LOCALIDADE DAS VIAGENS...\n');
    
    // Mapeamento de títulos para localidades
    const titleToLocalidade = {
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

    let updatedCount = 0;
    
    for (const [title, localidade] of Object.entries(titleToLocalidade)) {
      console.log(`  Atualizando "${title}" → "${localidade}"`);
      
      const result = await db.execute(
        'UPDATE trips SET localidade = ? WHERE title = ?',
        [localidade, title]
      );
      
      const affectedRows = (result as any).affectedRows || 0;
      updatedCount += affectedRows;
      console.log(`    ✅ ${affectedRows} viagens atualizadas`);
    }
    
    console.log(`\n✅ Correção concluída! Total: ${updatedCount} viagens atualizadas.`);
    
    // Verificar resultado
    console.log('\n🔍 VERIFICANDO CORRESPONDÊNCIAS...');
    
    const tripsResult = await db.execute(`
      SELECT localidade, COUNT(*) as count 
      FROM trips 
      WHERE localidade IS NOT NULL AND localidade != '' 
      GROUP BY localidade 
      ORDER BY localidade
    `);
    
    const activitiesResult = await db.execute(`
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
    
    if (localidadesWithoutActivities.length > 0) {
      console.log('\n💡 SUGESTÃO: Adicionar atividades para essas localidades para melhorar a experiência do usuário.');
    }
    
  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  }
  
  process.exit(0);
}

fixLocalidadesFinal();