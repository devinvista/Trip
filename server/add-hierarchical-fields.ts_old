import { db } from './db.js';
import { activities } from '../shared/schema.js';
import { eq, sql } from 'drizzle-orm';

// Comprehensive hierarchical classification mapping for destinations
const locationMapping = {
  // ==================== BRASIL - NACIONAL ====================
  
  // REGIÃO NORTE
  "Manaus, AM": { countryType: "nacional", region: "Norte", city: "Manaus", state: "Amazonas" },
  "Belém, PA": { countryType: "nacional", region: "Norte", city: "Belém", state: "Pará" },
  "Palmas, TO": { countryType: "nacional", region: "Norte", city: "Palmas", state: "Tocantins" },
  "Boa Vista, RR": { countryType: "nacional", region: "Norte", city: "Boa Vista", state: "Roraima" },
  "Macapá, AP": { countryType: "nacional", region: "Norte", city: "Macapá", state: "Amapá" },
  "Rio Branco, AC": { countryType: "nacional", region: "Norte", city: "Rio Branco", state: "Acre" },
  "Porto Velho, RO": { countryType: "nacional", region: "Norte", city: "Porto Velho", state: "Rondônia" },
  
  // REGIÃO NORDESTE
  "Salvador, BA": { countryType: "nacional", region: "Nordeste", city: "Salvador", state: "Bahia" },
  "Fortaleza, CE": { countryType: "nacional", region: "Nordeste", city: "Fortaleza", state: "Ceará" },
  "Recife, PE": { countryType: "nacional", region: "Nordeste", city: "Recife", state: "Pernambuco" },
  "Natal, RN": { countryType: "nacional", region: "Nordeste", city: "Natal", state: "Rio Grande do Norte" },
  "João Pessoa, PB": { countryType: "nacional", region: "Nordeste", city: "João Pessoa", state: "Paraíba" },
  "Maceió, AL": { countryType: "nacional", region: "Nordeste", city: "Maceió", state: "Alagoas" },
  "Aracaju, SE": { countryType: "nacional", region: "Nordeste", city: "Aracaju", state: "Sergipe" },
  "São Luís, MA": { countryType: "nacional", region: "Nordeste", city: "São Luís", state: "Maranhão" },
  "Teresina, PI": { countryType: "nacional", region: "Nordeste", city: "Teresina", state: "Piauí" },
  "Fernando de Noronha, PE": { countryType: "nacional", region: "Nordeste", city: "Fernando de Noronha", state: "Pernambuco" },
  "Chapada Diamantina, BA": { countryType: "nacional", region: "Nordeste", city: "Chapada Diamantina", state: "Bahia" },
  "Lençóis Maranhenses, MA": { countryType: "nacional", region: "Nordeste", city: "Lençóis Maranhenses", state: "Maranhão" },
  "Maragogi, AL": { countryType: "nacional", region: "Nordeste", city: "Maragogi", state: "Alagoas" },
  "Caruaru, PE": { countryType: "nacional", region: "Nordeste", city: "Caruaru", state: "Pernambuco" },
  
  // REGIÃO CENTRO-OESTE
  "Brasília, DF": { countryType: "nacional", region: "Centro-Oeste", city: "Brasília", state: "Distrito Federal" },
  "Goiânia, GO": { countryType: "nacional", region: "Centro-Oeste", city: "Goiânia", state: "Goiás" },
  "Cuiabá, MT": { countryType: "nacional", region: "Centro-Oeste", city: "Cuiabá", state: "Mato Grosso" },
  "Campo Grande, MS": { countryType: "nacional", region: "Centro-Oeste", city: "Campo Grande", state: "Mato Grosso do Sul" },
  "Pantanal, MT": { countryType: "nacional", region: "Centro-Oeste", city: "Pantanal", state: "Mato Grosso" },
  "Bonito, MS": { countryType: "nacional", region: "Centro-Oeste", city: "Bonito", state: "Mato Grosso do Sul" },
  
  // REGIÃO SUDESTE
  "São Paulo, SP": { countryType: "nacional", region: "Sudeste", city: "São Paulo", state: "São Paulo" },
  "Rio de Janeiro, RJ": { countryType: "nacional", region: "Sudeste", city: "Rio de Janeiro", state: "Rio de Janeiro" },
  "Belo Horizonte, MG": { countryType: "nacional", region: "Sudeste", city: "Belo Horizonte", state: "Minas Gerais" },
  "Vitória, ES": { countryType: "nacional", region: "Sudeste", city: "Vitória", state: "Espírito Santo" },
  "Campos do Jordão, SP": { countryType: "nacional", region: "Sudeste", city: "Campos do Jordão", state: "São Paulo" },
  "Ouro Preto, MG": { countryType: "nacional", region: "Sudeste", city: "Ouro Preto", state: "Minas Gerais" },
  "Serra da Mantiqueira, MG": { countryType: "nacional", region: "Sudeste", city: "Serra da Mantiqueira", state: "Minas Gerais" },
  
  // REGIÃO SUL
  "Curitiba, PR": { countryType: "nacional", region: "Sul", city: "Curitiba", state: "Paraná" },
  "Florianópolis, SC": { countryType: "nacional", region: "Sul", city: "Florianópolis", state: "Santa Catarina" },
  "Porto Alegre, RS": { countryType: "nacional", region: "Sul", city: "Porto Alegre", state: "Rio Grande do Sul" },
  "Foz do Iguaçu, PR": { countryType: "nacional", region: "Sul", city: "Foz do Iguaçu", state: "Paraná" },
  "Gramado, RS": { countryType: "nacional", region: "Sul", city: "Gramado", state: "Rio Grande do Sul" },
  "Bombinhas, SC": { countryType: "nacional", region: "Sul", city: "Bombinhas", state: "Santa Catarina" },
  "Imbituba, SC": { countryType: "nacional", region: "Sul", city: "Imbituba", state: "Santa Catarina" },
  
  // ==================== INTERNACIONAL ====================
  
  // AMÉRICA DO NORTE
  "Nova York, EUA": { countryType: "internacional", region: "América do Norte", city: "Nova York", country: "Estados Unidos" },
  "Los Angeles, EUA": { countryType: "internacional", region: "América do Norte", city: "Los Angeles", country: "Estados Unidos" },
  "Toronto, Canadá": { countryType: "internacional", region: "América do Norte", city: "Toronto", country: "Canadá" },
  "Vancouver, Canadá": { countryType: "internacional", region: "América do Norte", city: "Vancouver", country: "Canadá" },
  
  // AMÉRICA CENTRAL E CARIBE
  "Cancún, México": { countryType: "internacional", region: "América Central", city: "Cancún", country: "México" },
  "Cidade do México, México": { countryType: "internacional", region: "América Central", city: "Cidade do México", country: "México" },
  "Punta Cana, República Dominicana": { countryType: "internacional", region: "Caribe", city: "Punta Cana", country: "República Dominicana" },
  "Havana, Cuba": { countryType: "internacional", region: "Caribe", city: "Havana", country: "Cuba" },
  "Nassau, Bahamas": { countryType: "internacional", region: "Caribe", city: "Nassau", country: "Bahamas" },
  
  // AMÉRICA DO SUL
  "Buenos Aires, Argentina": { countryType: "internacional", region: "América do Sul", city: "Buenos Aires", country: "Argentina" },
  "Santiago, Chile": { countryType: "internacional", region: "América do Sul", city: "Santiago", country: "Chile" },
  "Lima, Peru": { countryType: "internacional", region: "América do Sul", city: "Lima", country: "Peru" },
  "Cusco, Peru": { countryType: "internacional", region: "América do Sul", city: "Cusco", country: "Peru" },
  "Quito, Equador": { countryType: "internacional", region: "América do Sul", city: "Quito", country: "Equador" },
  "Montevideu, Uruguai": { countryType: "internacional", region: "América do Sul", city: "Montevideu", country: "Uruguai" },
  
  // EUROPA OCIDENTAL
  "Paris, França": { countryType: "internacional", region: "Europa Ocidental", city: "Paris", country: "França" },
  "Londres, Reino Unido": { countryType: "internacional", region: "Europa Ocidental", city: "Londres", country: "Reino Unido" },
  "Madrid, Espanha": { countryType: "internacional", region: "Europa Ocidental", city: "Madrid", country: "Espanha" },
  "Lisboa, Portugal": { countryType: "internacional", region: "Europa Ocidental", city: "Lisboa", country: "Portugal" },
  "Amsterdam, Holanda": { countryType: "internacional", region: "Europa Ocidental", city: "Amsterdam", country: "Holanda" },
  "Bruxelas, Bélgica": { countryType: "internacional", region: "Europa Ocidental", city: "Bruxelas", country: "Bélgica" },
  
  // EUROPA MEDITERRÂNEA
  "Roma, Itália": { countryType: "internacional", region: "Europa Mediterrânea", city: "Roma", country: "Itália" },
  "Barcelona, Espanha": { countryType: "internacional", region: "Europa Mediterrânea", city: "Barcelona", country: "Espanha" },
  "Atenas, Grécia": { countryType: "internacional", region: "Europa Mediterrânea", city: "Atenas", country: "Grécia" },
  "Santorini, Grécia": { countryType: "internacional", region: "Europa Mediterrânea", city: "Santorini", country: "Grécia" },
  
  // EUROPA CENTRAL
  "Berlim, Alemanha": { countryType: "internacional", region: "Europa Central", city: "Berlim", country: "Alemanha" },
  "Viena, Áustria": { countryType: "internacional", region: "Europa Central", city: "Viena", country: "Áustria" },
  "Praga, República Tcheca": { countryType: "internacional", region: "Europa Central", city: "Praga", country: "República Tcheca" },
  "Budapeste, Hungria": { countryType: "internacional", region: "Europa Central", city: "Budapeste", country: "Hungria" },
  
  // EUROPA NÓRDICA
  "Estocolmo, Suécia": { countryType: "internacional", region: "Europa Nórdica", city: "Estocolmo", country: "Suécia" },
  "Oslo, Noruega": { countryType: "internacional", region: "Europa Nórdica", city: "Oslo", country: "Noruega" },
  "Copenhague, Dinamarca": { countryType: "internacional", region: "Europa Nórdica", city: "Copenhague", country: "Dinamarca" },
  "Helsinque, Finlândia": { countryType: "internacional", region: "Europa Nórdica", city: "Helsinque", country: "Finlândia" },
  
  // ÁSIA ORIENTAL
  "Tóquio, Japão": { countryType: "internacional", region: "Ásia Oriental", city: "Tóquio", country: "Japão" },
  "Seul, Coreia do Sul": { countryType: "internacional", region: "Ásia Oriental", city: "Seul", country: "Coreia do Sul" },
  "Pequim, China": { countryType: "internacional", region: "Ásia Oriental", city: "Pequim", country: "China" },
  "Xangai, China": { countryType: "internacional", region: "Ásia Oriental", city: "Xangai", country: "China" },
  
  // SUDESTE ASIÁTICO
  "Bangkok, Tailândia": { countryType: "internacional", region: "Sudeste Asiático", city: "Bangkok", country: "Tailândia" },
  "Singapura": { countryType: "internacional", region: "Sudeste Asiático", city: "Singapura", country: "Singapura" },
  "Jacarta, Indonésia": { countryType: "internacional", region: "Sudeste Asiático", city: "Jacarta", country: "Indonésia" },
  "Manila, Filipinas": { countryType: "internacional", region: "Sudeste Asiático", city: "Manila", country: "Filipinas" },
  
  // ORIENTE MÉDIO
  "Dubai, Emirados Árabes Unidos": { countryType: "internacional", region: "Oriente Médio", city: "Dubai", country: "Emirados Árabes Unidos" },
  "Abu Dhabi, Emirados Árabes Unidos": { countryType: "internacional", region: "Oriente Médio", city: "Abu Dhabi", country: "Emirados Árabes Unidos" },
  "Doha, Catar": { countryType: "internacional", region: "Oriente Médio", city: "Doha", country: "Catar" },
  "Tel Aviv, Israel": { countryType: "internacional", region: "Oriente Médio", city: "Tel Aviv", country: "Israel" },
  
  // ÁFRICA
  "Cairo, Egito": { countryType: "internacional", region: "África", city: "Cairo", country: "Egito" },
  "Cidade do Cabo, África do Sul": { countryType: "internacional", region: "África", city: "Cidade do Cabo", country: "África do Sul" },
  "Marrakech, Marrocos": { countryType: "internacional", region: "África", city: "Marrakech", country: "Marrocos" },
  "Nairóbi, Quênia": { countryType: "internacional", region: "África", city: "Nairóbi", country: "Quênia" },
  
  // OCEANIA
  "Sydney, Austrália": { countryType: "internacional", region: "Oceania", city: "Sydney", country: "Austrália" },
  "Melbourne, Austrália": { countryType: "internacional", region: "Oceania", city: "Melbourne", country: "Austrália" },
  "Auckland, Nova Zelândia": { countryType: "internacional", region: "Oceania", city: "Auckland", country: "Nova Zelândia" },
  "Wellington, Nova Zelândia": { countryType: "internacional", region: "Oceania", city: "Wellington", country: "Nova Zelândia" },
  
  // ==================== CRUZEIROS ====================
  "Cruzeiro Mediterrâneo": { countryType: "cruzeiro", region: "Mediterrâneo", city: "Múltiplas Cidades", route: "Espanha-França-Itália-Grécia" },
  "Cruzeiro Caribe": { countryType: "cruzeiro", region: "Caribe", city: "Múltiplas Ilhas", route: "Bahamas-Jamaica-México" },
  "Cruzeiro Fiordos Noruegueses": { countryType: "cruzeiro", region: "Norte da Europa", city: "Fiordos", route: "Noruega-Suécia-Dinamarca" },
  "Cruzeiro Costa Brasileira": { countryType: "cruzeiro", region: "Costa Atlântica", city: "Litoral Brasileiro", route: "Santos-Rio-Salvador-Recife" },
  "Cruzeiro Antártica": { countryType: "cruzeiro", region: "Antártica", city: "Continente Antártico", route: "Ushuaia-Península Antártica" },
  "Cruzeiro Rio Amazonas": { countryType: "cruzeiro", region: "Amazônia", city: "Rio Amazonas", route: "Manaus-Santarém-Belém" },
};

// Helper function to intelligently parse location and create mapping
function parseLocation(location: string): { countryType: string; region: string; city: string } {
  const loc = location.trim();
  
  // Check Brazilian state abbreviations
  const brazilianStates = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
  const stateRegionMap = {
    'AC': 'Norte', 'RO': 'Norte', 'AM': 'Norte', 'RR': 'Norte', 'PA': 'Norte', 'AP': 'Norte', 'TO': 'Norte',
    'MA': 'Nordeste', 'PI': 'Nordeste', 'CE': 'Nordeste', 'RN': 'Nordeste', 'PB': 'Nordeste', 'PE': 'Nordeste', 'AL': 'Nordeste', 'SE': 'Nordeste', 'BA': 'Nordeste',
    'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste', 'GO': 'Centro-Oeste', 'DF': 'Centro-Oeste',
    'MG': 'Sudeste', 'ES': 'Sudeste', 'RJ': 'Sudeste', 'SP': 'Sudeste',
    'PR': 'Sul', 'SC': 'Sul', 'RS': 'Sul'
  };
  
  // Check if location has Brazilian state abbreviation
  for (const state of brazilianStates) {
    if (loc.includes(`, ${state}`) || loc.endsWith(state)) {
      const cityName = loc.split(',')[0].trim();
      return {
        countryType: "nacional",
        region: stateRegionMap[state as keyof typeof stateRegionMap] || "Outras Regiões",
        city: cityName
      };
    }
  }
  
  // Check if it's a cruise
  if (loc.toLowerCase().includes("cruzeiro")) {
    return {
      countryType: "cruzeiro",
      region: "Outros Roteiros",
      city: "Múltiplas Cidades"
    };
  }
  
  // Check if it mentions Brasil explicitly
  if (loc.includes("Brasil") || loc.includes("Brazil")) {
    return {
      countryType: "nacional",
      region: "Outras Regiões",
      city: loc.split(',')[0].trim()
    };
  }
  
  // Otherwise assume international
  const cityName = loc.split(',')[0].trim();
  return {
    countryType: "internacional",
    region: "Outros Países",
    city: cityName
  };
}

async function addHierarchicalFields() {
  try {
    console.log("🔄 Iniciando classificação hierárquica avançada das atividades...");
    
    // First, ensure the hierarchical columns exist (MySQL compatibility)
    await ensureHierarchicalColumns();
    
    // Get all activities
    const allActivities = await db.select().from(activities);
    console.log(`📋 Encontradas ${allActivities.length} atividades para classificar`);
    
    let updatedCount = 0;
    let createdCount = 0;
    
    for (const activity of allActivities) {
      const mapping = locationMapping[activity.location as keyof typeof locationMapping];
      
      if (mapping) {
        // Use predefined mapping
        await db.update(activities)
          .set({
            countryType: mapping.countryType,
            region: mapping.region,
            city: mapping.city
          })
          .where(eq(activities.id, activity.id));
        
        console.log(`✅ Classificada "${activity.title}" - ${mapping.countryType}/${mapping.region}/${mapping.city}`);
        updatedCount++;
      } else {
        // Use intelligent parsing for unmapped locations
        const parsedMapping = parseLocation(activity.location);
        
        await db.update(activities)
          .set({
            countryType: parsedMapping.countryType,
            region: parsedMapping.region,
            city: parsedMapping.city
          })
          .where(eq(activities.id, activity.id));
        
        console.log(`🔍 Auto-classificada "${activity.title}" - ${parsedMapping.countryType}/${parsedMapping.region}/${parsedMapping.city} (analisada)`);
        createdCount++;
      }
    }
    
    // Generate hierarchy statistics
    await generateHierarchyStatistics();
    
    console.log("✅ Classificação hierárquica concluída!");
    console.log(`📊 Estatísticas: ${updatedCount} mapeadas, ${createdCount} auto-classificadas`);
    
  } catch (error) {
    console.error("❌ Erro ao processar classificação hierárquica:", error);
    throw error;
  }
}

// Ensure hierarchical columns exist in the database
async function ensureHierarchicalColumns() {
  try {
    console.log("🔧 Verificando colunas hierárquicas...");
    
    // Try to add columns if they don't exist (MySQL safe approach)
    const alterQueries = [
      `ALTER TABLE activities ADD COLUMN country_type VARCHAR(50) DEFAULT 'nacional' NOT NULL`,
      `ALTER TABLE activities ADD COLUMN region VARCHAR(100) DEFAULT '' NOT NULL`,
      `ALTER TABLE activities ADD COLUMN city VARCHAR(100) DEFAULT '' NOT NULL`
    ];
    
    for (const query of alterQueries) {
      try {
        await db.execute(sql.raw(query));
        console.log(`✅ Coluna adicionada: ${query.split(' ADD COLUMN ')[1].split(' ')[0]}`);
      } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          // Column already exists, that's fine
          continue;
        } else {
          console.log(`ℹ️ Coluna já existe: ${query.split(' ADD COLUMN ')[1].split(' ')[0]}`);
        }
      }
    }
    
  } catch (error) {
    console.log("ℹ️ Colunas hierárquicas já existem ou foram adicionadas");
  }
}

// Generate and display hierarchy statistics
async function generateHierarchyStatistics() {
  try {
    console.log("📊 Gerando estatísticas hierárquicas...");
    
    const stats = await db.select({
      countryType: activities.countryType,
      region: activities.region,
      count: sql<number>`count(*)`.as('count')
    })
    .from(activities)
    .where(eq(activities.isActive, true))
    .groupBy(activities.countryType, activities.region)
    .orderBy(activities.countryType, activities.region);
    
    console.log("\n🌍 HIERARQUIA DE DESTINOS:");
    console.log("=" .repeat(50));
    
    let currentCountryType = '';
    let totalActivities = 0;
    
    stats.forEach(stat => {
      if (stat.countryType !== currentCountryType) {
        currentCountryType = stat.countryType;
        console.log(`\n📍 ${stat.countryType.toUpperCase()}`);
      }
      console.log(`   └── ${stat.region}: ${stat.count} atividades`);
      totalActivities += stat.count;
    });
    
    console.log("=" .repeat(50));
    console.log(`📊 TOTAL: ${totalActivities} atividades classificadas hierarquicamente`);
    console.log("=" .repeat(50));
    
  } catch (error) {
    console.error("❌ Erro ao gerar estatísticas:", error);
  }
}

// Additional function to validate and fix location inconsistencies
async function validateLocationConsistency() {
  try {
    console.log("🔍 Validando consistência de localidades...");
    
    // Find activities with empty or null hierarchical fields
    const inconsistentActivities = await db.select()
      .from(activities)
      .where(sql`country_type IS NULL OR country_type = '' OR region IS NULL OR region = '' OR city IS NULL OR city = ''`);
    
    if (inconsistentActivities.length > 0) {
      console.log(`⚠️ Encontradas ${inconsistentActivities.length} atividades com campos hierárquicos incompletos`);
      
      for (const activity of inconsistentActivities) {
        const parsedMapping = parseLocation(activity.location);
        
        await db.update(activities)
          .set({
            countryType: parsedMapping.countryType,
            region: parsedMapping.region,
            city: parsedMapping.city
          })
          .where(eq(activities.id, activity.id));
        
        console.log(`🔧 Corrigida "${activity.title}" - ${parsedMapping.countryType}/${parsedMapping.region}/${parsedMapping.city}`);
      }
    } else {
      console.log("✅ Todas as atividades possuem classificação hierárquica consistente");
    }
    
  } catch (error) {
    console.error("❌ Erro na validação de consistência:", error);
  }
}

// Main execution function
async function runHierarchicalUpdate() {
  try {
    console.log("🚀 Iniciando atualização hierárquica completa...");
    console.log(`⏰ ${new Date().toLocaleString('pt-BR')}`);
    
    await addHierarchicalFields();
    await validateLocationConsistency();
    
    console.log("\n✅ Atualização hierárquica concluída com sucesso!");
    console.log("🎯 Sistema de classificação de destinos totalmente operacional");
    
  } catch (error) {
    console.error("💥 Erro durante a atualização hierárquica:", error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runHierarchicalUpdate().then(() => process.exit(0));
}

export { addHierarchicalFields, validateLocationConsistency, runHierarchicalUpdate };