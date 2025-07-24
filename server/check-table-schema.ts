import { db } from './db.js';

async function checkTableSchema() {
  try {
    console.log('🔍 VERIFICANDO SCHEMA DAS TABELAS...\n');
    
    // Verificar schema da tabela trips
    console.log('📋 SCHEMA DA TABELA TRIPS:');
    const tripsSchema = await db.execute('DESCRIBE trips');
    (tripsSchema as any).forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} (${row.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Verificar schema da tabela activities  
    console.log('\n📋 SCHEMA DA TABELA ACTIVITIES:');
    const activitiesSchema = await db.execute('DESCRIBE activities');
    (activitiesSchema as any).forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} (${row.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // Verificar dados das tabelas (sem colunas específicas primeiro)
    console.log('\n📊 SAMPLE DOS DADOS:');
    const sampleTrips = await db.execute('SELECT * FROM trips LIMIT 3');
    console.log('TRIPS (primeiras 3 linhas):');
    (sampleTrips as any).forEach(trip => {
      console.log(`  Trip:`, trip);
    });
    
    const sampleActivities = await db.execute('SELECT * FROM activities LIMIT 3');
    console.log('\nACTIVITIES (primeiras 3 linhas):');
    (sampleActivities as any).forEach(activity => {
      console.log(`  Activity:`, activity);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
  
  process.exit(0);
}

checkTableSchema();