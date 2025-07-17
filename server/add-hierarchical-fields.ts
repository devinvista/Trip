import { db } from './db.js';
import { activities } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

// Mapping for hierarchical classification
const locationMapping = {
  // BRASIL - NACIONAL
  "Rio de Janeiro, RJ": { countryType: "nacional", region: "Sudeste", city: "Rio de Janeiro" },
  "Brasília, DF": { countryType: "nacional", region: "Centro-Oeste", city: "Brasília" },
  "São Paulo, SP": { countryType: "nacional", region: "Sudeste", city: "São Paulo" },
  "Salvador, BA": { countryType: "nacional", region: "Nordeste", city: "Salvador" },
  "Fortaleza, CE": { countryType: "nacional", region: "Nordeste", city: "Fortaleza" },
  "Recife, PE": { countryType: "nacional", region: "Nordeste", city: "Recife" },
  "Manaus, AM": { countryType: "nacional", region: "Norte", city: "Manaus" },
  "Curitiba, PR": { countryType: "nacional", region: "Sul", city: "Curitiba" },
  "Porto Alegre, RS": { countryType: "nacional", region: "Sul", city: "Porto Alegre" },
  "Belo Horizonte, MG": { countryType: "nacional", region: "Sudeste", city: "Belo Horizonte" },
  "Foz do Iguaçu, PR": { countryType: "nacional", region: "Sul", city: "Foz do Iguaçu" },
  "Gramado, RS": { countryType: "nacional", region: "Sul", city: "Gramado" },
  "Campos do Jordão, SP": { countryType: "nacional", region: "Sudeste", city: "Campos do Jordão" },
  "Fernando de Noronha, PE": { countryType: "nacional", region: "Nordeste", city: "Fernando de Noronha" },
  "Pantanal, MT": { countryType: "nacional", region: "Centro-Oeste", city: "Pantanal" },
  "Chapada Diamantina, BA": { countryType: "nacional", region: "Nordeste", city: "Chapada Diamantina" },
  "Bonito, MS": { countryType: "nacional", region: "Centro-Oeste", city: "Bonito" },
  "Lençóis Maranhenses, MA": { countryType: "nacional", region: "Nordeste", city: "Lençóis Maranhenses" },
  
  // INTERNACIONAL
  "Paris, França": { countryType: "internacional", region: "Europa Ocidental", city: "Paris" },
  "Londres, Reino Unido": { countryType: "internacional", region: "Europa Ocidental", city: "Londres" },
  "Roma, Itália": { countryType: "internacional", region: "Europa Mediterrânea", city: "Roma" },
  "Barcelona, Espanha": { countryType: "internacional", region: "Europa Mediterrânea", city: "Barcelona" },
  "Nova York, EUA": { countryType: "internacional", region: "América do Norte", city: "Nova York" },
  "Tóquio, Japão": { countryType: "internacional", region: "Ásia Oriental", city: "Tóquio" },
  "Dubai, Emirados Árabes": { countryType: "internacional", region: "Oriente Médio", city: "Dubai" },
  "Buenos Aires, Argentina": { countryType: "internacional", region: "América do Sul", city: "Buenos Aires" },
  "Santiago, Chile": { countryType: "internacional", region: "América do Sul", city: "Santiago" },
  "Lima, Peru": { countryType: "internacional", region: "América do Sul", city: "Lima" },
  "Cancún, México": { countryType: "internacional", region: "América Central", city: "Cancún" },
  "Punta Cana, República Dominicana": { countryType: "internacional", region: "Caribe", city: "Punta Cana" },
  "Havana, Cuba": { countryType: "internacional", region: "Caribe", city: "Havana" },
  "Cairo, Egito": { countryType: "internacional", region: "África", city: "Cairo" },
  "Cidade do Cabo, África do Sul": { countryType: "internacional", region: "África", city: "Cidade do Cabo" },
  "Bangkok, Tailândia": { countryType: "internacional", region: "Sudeste Asiático", city: "Bangkok" },
  "Singapura": { countryType: "internacional", region: "Sudeste Asiático", city: "Singapura" },
  "Sydney, Austrália": { countryType: "internacional", region: "Oceania", city: "Sydney" },
  "Auckland, Nova Zelândia": { countryType: "internacional", region: "Oceania", city: "Auckland" },
  
  // CRUZEIROS
  "Cruzeiro Mediterrâneo": { countryType: "cruzeiro", region: "Mediterrâneo", city: "Múltiplas Cidades" },
  "Cruzeiro Caribe": { countryType: "cruzeiro", region: "Caribe", city: "Múltiplas Ilhas" },
  "Cruzeiro Fiordos Noruegueses": { countryType: "cruzeiro", region: "Norte da Europa", city: "Fiordos" },
  "Cruzeiro Costa Brasileira": { countryType: "cruzeiro", region: "Costa Atlântica", city: "Litoral Brasileiro" },
  "Cruzeiro Antártica": { countryType: "cruzeiro", region: "Antártica", city: "Continente Antártico" },
  "Cruzeiro Rio Amazonas": { countryType: "cruzeiro", region: "Amazônia", city: "Rio Amazonas" },
};

async function addHierarchicalFields() {
  try {
    console.log("🔄 Adicionando campos hierárquicos às atividades...");
    
    // Get all activities
    const allActivities = await db.select().from(activities);
    console.log(`📋 Encontradas ${allActivities.length} atividades para atualizar`);
    
    for (const activity of allActivities) {
      const mapping = locationMapping[activity.location as keyof typeof locationMapping];
      
      if (mapping) {
        await db.update(activities)
          .set({
            countryType: mapping.countryType,
            region: mapping.region,
            city: mapping.city
          })
          .where(eq(activities.id, activity.id));
        
        console.log(`✅ Atualizada atividade "${activity.title}" - ${mapping.countryType}/${mapping.region}/${mapping.city}`);
      } else {
        // Default classification for unmapped locations
        const defaultMapping = activity.location.includes("Brasil") || 
                              activity.location.includes("RJ") || 
                              activity.location.includes("SP") ||
                              activity.location.includes("MG") ||
                              activity.location.includes("PR") ||
                              activity.location.includes("RS") ||
                              activity.location.includes("BA") ||
                              activity.location.includes("CE") ||
                              activity.location.includes("PE") ||
                              activity.location.includes("AM") ||
                              activity.location.includes("DF") ||
                              activity.location.includes("MS") ||
                              activity.location.includes("MT") ||
                              activity.location.includes("MA")
          ? { countryType: "nacional", region: "Outras Regiões", city: activity.location.split(",")[0] }
          : activity.location.toLowerCase().includes("cruzeiro")
          ? { countryType: "cruzeiro", region: "Outros Roteiros", city: "Múltiplas Cidades" }
          : { countryType: "internacional", region: "Outros Países", city: activity.location.split(",")[0] };
        
        await db.update(activities)
          .set({
            countryType: defaultMapping.countryType,
            region: defaultMapping.region,
            city: defaultMapping.city
          })
          .where(eq(activities.id, activity.id));
        
        console.log(`✅ Atualizada atividade "${activity.title}" - ${defaultMapping.countryType}/${defaultMapping.region}/${defaultMapping.city} (padrão)`);
      }
    }
    
    console.log("✅ Classificação hierárquica concluída!");
    
  } catch (error) {
    console.error("❌ Erro ao adicionar campos hierárquicos:", error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  addHierarchicalFields().then(() => process.exit(0));
}

export { addHierarchicalFields };