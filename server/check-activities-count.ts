import { db } from './db.js';

async function checkActivitiesCount() {
  try {
    console.log('🔍 VERIFICANDO ATIVIDADES NO BANCO...\n');
    
    const [result] = await db.execute('SELECT COUNT(*) as total FROM activities');
    const total = (result as any)[0].total;
    
    console.log(`📊 Total de atividades: ${total}`);
    
    if (total > 0) {
      const [activities] = await db.execute('SELECT title, location FROM activities ORDER BY location, title');
      
      const locationGroups = {};
      (activities as any).forEach(activity => {
        const loc = activity.location || 'Sem localização';
        if (!locationGroups[loc]) locationGroups[loc] = [];
        locationGroups[loc].push(activity.title);
      });
      
      console.log('\n📍 ATIVIDADES POR LOCALIZAÇÃO:');
      Object.entries(locationGroups).forEach(([location, titles]) => {
        console.log(`\n  ${location} (${(titles as string[]).length} atividades):`);
        (titles as string[]).forEach(title => {
          console.log(`    - ${title}`);
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
  
  process.exit(0);
}

checkActivitiesCount();