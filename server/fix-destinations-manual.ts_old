import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

async function fixDestinationsManual() {
  let connection;
  
  try {
    console.log('🔄 CONECTANDO AO MYSQL E CORRIGINDO DESTINOS...\n');
    
    // Conectar ao MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'srv1661.hstgr.io',
      user: process.env.DB_USER || 'u574849128_partiutrip',
      password: process.env.DB_PASSWORD || 'PartiuTrip2024!',
      database: process.env.DB_NAME || 'u574849128_partiutrip',
      ssl: undefined
    });
    
    console.log('✅ Conectado ao MySQL!');
    
    // Verificar schema da tabela trips
    const [schemaRows] = await connection.execute('DESCRIBE trips');
    console.log('\n📋 SCHEMA DA TABELA TRIPS:');
    (schemaRows as any[]).forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} (${row.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Verificar viagens atuais
    const [trips] = await connection.execute('SELECT id, title, destination FROM trips LIMIT 10');
    console.log('\n📝 VIAGENS ATUAIS:');
    (trips as any[]).forEach(trip => {
      console.log(`  ID ${trip.id}: "${trip.title}" → "${trip.destination}"`);
    });
    
    // Definir as correções
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
    
    console.log('\n🔧 APLICANDO CORREÇÕES...');
    let totalUpdated = 0;
    
    for (const correction of corrections) {
      console.log(`  Atualizando "${correction.title}" → "${correction.destination}"`);
      
      const [result] = await connection.execute(
        'UPDATE trips SET destination = ? WHERE title = ?',
        [correction.destination, correction.title]
      );
      
      const affectedRows = (result as any).affectedRows;
      totalUpdated += affectedRows;
      console.log(`    ✅ ${affectedRows} viagens atualizadas`);
    }
    
    console.log(`\n✅ Correção concluída! Total: ${totalUpdated} viagens atualizadas.`);
    
    // Verificar resultado
    console.log('\n🔍 VERIFICANDO RESULTADO...');
    
    const [destinationsResult] = await connection.execute(`
      SELECT destination, COUNT(*) as count 
      FROM trips 
      WHERE destination IS NOT NULL AND destination != 'undefined' 
      GROUP BY destination 
      ORDER BY destination
    `);
    
    const [activitiesResult] = await connection.execute(`
      SELECT location, COUNT(*) as count 
      FROM activities 
      WHERE location IS NOT NULL 
      GROUP BY location 
      ORDER BY location
    `);
    
    console.log('\n📍 DESTINOS DAS VIAGENS (após correção):');
    (destinationsResult as any[]).forEach(row => {
      console.log(`  - "${row.destination}" (${row.count} viagens)`);
    });
    
    console.log('\n🏛️ LOCALIZAÇÕES DAS ATIVIDADES:');
    (activitiesResult as any[]).forEach(row => {
      console.log(`  - "${row.location}" (${row.count} atividades)`);
    });
    
    // Verificar correspondências
    const tripDestinations = (destinationsResult as any[]).map(row => row.destination);
    const activityLocations = (activitiesResult as any[]).map(row => row.location);
    
    const matched = activityLocations.filter(loc => tripDestinations.includes(loc));
    const unmatched = activityLocations.filter(loc => !tripDestinations.includes(loc));
    
    console.log(`\n✅ Localizações correspondentes: ${matched.length}`);
    matched.forEach(loc => console.log(`  ✓ "${loc}"`));
    
    console.log(`\n❌ Localizações sem correspondência: ${unmatched.length}`);
    unmatched.forEach(loc => console.log(`  ✗ "${loc}"`));
    
    const destinationsWithoutActivities = tripDestinations.filter(dest => !activityLocations.includes(dest));
    console.log(`\n🚨 DESTINOS SEM ATIVIDADES (${destinationsWithoutActivities.length}):`);
    destinationsWithoutActivities.forEach(dest => console.log(`  - "${dest}"`));
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão MySQL fechada');
    }
  }
}

fixDestinationsManual();