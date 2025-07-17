import { db } from './db.js';
import { activities } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function fixHierarchicalData() {
  try {
    console.log("🔄 Corrigindo classificação hierárquica...");
    
    // Fix incorrect classifications
    const fixes = [
      { title: "Passeio de Catamaran em Bombinhas", countryType: "nacional", region: "Sul", city: "Bombinhas" },
      { title: "Observação de Baleias - Praia do Rosa", countryType: "nacional", region: "Sul", city: "Imbituba" },
      { title: "Aula de Surf - Praia do Campeche", countryType: "nacional", region: "Sul", city: "Florianópolis" },
    ];
    
    for (const fix of fixes) {
      const activity = await db.select().from(activities).where(eq(activities.title, fix.title)).limit(1);
      
      if (activity.length > 0) {
        await db.update(activities)
          .set({
            countryType: fix.countryType,
            region: fix.region,
            city: fix.city
          })
          .where(eq(activities.id, activity[0].id));
        
        console.log(`✅ Corrigida atividade "${fix.title}" - ${fix.countryType}/${fix.region}/${fix.city}`);
      }
    }
    
    console.log("✅ Correções aplicadas com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro ao corrigir dados:", error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fixHierarchicalData().then(() => process.exit(0));
}

export { fixHierarchicalData };