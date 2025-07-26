import { db } from "./db.js";
import { destinations } from "@shared/schema.js";

// Destinos adicionais das regiões Sul e Sudeste (38 cidades)
const additionalDestinations = [
  // Rio Grande do Sul
  { name: "Bagé", state: "RS", region: "Sul", latitude: "-31.3316", longitude: "-54.1063", timezone: "America/Sao_Paulo" },
  { name: "Bento Gonçalves", state: "RS", region: "Sul", latitude: "-29.1717", longitude: "-51.5186", timezone: "America/Sao_Paulo" },
  { name: "Cânions", state: "RS", region: "Sul", latitude: "-29.3200", longitude: "-50.2700", timezone: "America/Sao_Paulo" },
  { name: "Caxias do Sul", state: "RS", region: "Sul", latitude: "-29.1678", longitude: "-51.1794", timezone: "America/Sao_Paulo" },
  { name: "Dom Pedrito", state: "RS", region: "Sul", latitude: "-30.9833", longitude: "-54.6833", timezone: "America/Sao_Paulo" },
  { name: "Erechim", state: "RS", region: "Sul", latitude: "-27.6339", longitude: "-52.2742", timezone: "America/Sao_Paulo" },
  { name: "Esteio", state: "RS", region: "Sul", latitude: "-29.8611", longitude: "-51.1800", timezone: "America/Sao_Paulo" },
  { name: "Farroupilha", state: "RS", region: "Sul", latitude: "-29.2258", longitude: "-51.3472", timezone: "America/Sao_Paulo" },
  { name: "Passo Fundo", state: "RS", region: "Sul", latitude: "-28.2636", longitude: "-52.4061", timezone: "America/Sao_Paulo" },
  { name: "Pelotas", state: "RS", region: "Sul", latitude: "-31.7654", longitude: "-52.3376", timezone: "America/Sao_Paulo" },
  { name: "Rosário do Sul", state: "RS", region: "Sul", latitude: "-30.2581", longitude: "-54.9150", timezone: "America/Sao_Paulo" },
  { name: "Santa Cruz do Sul", state: "RS", region: "Sul", latitude: "-29.7172", longitude: "-52.4267", timezone: "America/Sao_Paulo" },
  { name: "Santa Maria", state: "RS", region: "Sul", latitude: "-29.6842", longitude: "-53.8069", timezone: "America/Sao_Paulo" },
  { name: "Santa Vitória do Palmar", state: "RS", region: "Sul", latitude: "-33.5167", longitude: "-53.3667", timezone: "America/Sao_Paulo" },
  { name: "Santana do Livramento", state: "RS", region: "Sul", latitude: "-30.8906", longitude: "-55.5322", timezone: "America/Sao_Paulo" },
  { name: "São Borja", state: "RS", region: "Sul", latitude: "-28.6611", longitude: "-56.0044", timezone: "America/Sao_Paulo" },
  { name: "São Leopoldo", state: "RS", region: "Sul", latitude: "-29.7603", longitude: "-51.1472", timezone: "America/Sao_Paulo" },
  { name: "São Miguel das Missões", state: "RS", region: "Sul", latitude: "-28.5531", longitude: "-54.5631", timezone: "America/Sao_Paulo" },
  { name: "Torres", state: "RS", region: "Sul", latitude: "-29.3350", longitude: "-49.7269", timezone: "America/Sao_Paulo" },
  { name: "Venâncio Aires", state: "RS", region: "Sul", latitude: "-29.6078", longitude: "-52.1881", timezone: "America/Sao_Paulo" },

  // Santa Catarina
  { name: "Cocal do Sul", state: "SC", region: "Sul", latitude: "-28.5950", longitude: "-49.3267", timezone: "America/Sao_Paulo" },
  { name: "Imbituba", state: "SC", region: "Sul", latitude: "-28.2400", longitude: "-48.6708", timezone: "America/Sao_Paulo" },
  { name: "Itajaí", state: "SC", region: "Sul", latitude: "-26.9078", longitude: "-48.6658", timezone: "America/Sao_Paulo" },
  { name: "Laguna", state: "SC", region: "Sul", latitude: "-28.4811", longitude: "-48.7811", timezone: "America/Sao_Paulo" },
  { name: "São Francisco do Sul", state: "SC", region: "Sul", latitude: "-26.2431", longitude: "-48.6389", timezone: "America/Sao_Paulo" },
  { name: "São Joaquim", state: "SC", region: "Sul", latitude: "-28.2939", longitude: "-49.9331", timezone: "America/Sao_Paulo" },
  { name: "Urubici", state: "SC", region: "Sul", latitude: "-28.0158", longitude: "-49.5881", timezone: "America/Sao_Paulo" },

  // Paraná
  { name: "Cascavel", state: "PR", region: "Sul", latitude: "-24.9558", longitude: "-53.4552", timezone: "America/Sao_Paulo" },
  { name: "Guarapuava", state: "PR", region: "Sul", latitude: "-25.3945", longitude: "-51.4583", timezone: "America/Sao_Paulo" },
  { name: "Maringá", state: "PR", region: "Sul", latitude: "-23.4205", longitude: "-51.9331", timezone: "America/Sao_Paulo" },

  // São Paulo
  { name: "São José dos Campos", state: "SP", region: "Sudeste", latitude: "-23.2237", longitude: "-45.9009", timezone: "America/Sao_Paulo" },
  { name: "Sorocaba", state: "SP", region: "Sudeste", latitude: "-23.5015", longitude: "-47.4526", timezone: "America/Sao_Paulo" },
  { name: "Taubaté", state: "SP", region: "Sudeste", latitude: "-23.0262", longitude: "-45.5553", timezone: "America/Sao_Paulo" },

  // Minas Gerais
  { name: "Piracema", state: "MG", region: "Sudeste", latitude: "-19.9500", longitude: "-44.8167", timezone: "America/Sao_Paulo" },
  { name: "Viçosa", state: "MG", region: "Sudeste", latitude: "-20.7539", longitude: "-42.8819", timezone: "America/Sao_Paulo" },

  // Rio de Janeiro
  { name: "Visconde de Mauá", state: "RJ", region: "Sudeste", latitude: "-22.3667", longitude: "-44.5333", timezone: "America/Sao_Paulo" },

  // Duplicatas removidas que já existem
  // Igrejinha (RS) - já existe
  // Nova Petrópolis (RS) - já existe
];

async function addAdditionalDestinations() {
  try {
    console.log("🏞️ Adicionando destinos adicionais das regiões Sul e Sudeste...");
    
    let addedCount = 0;
    let duplicateCount = 0;
    
    for (const destination of additionalDestinations) {
      try {
        await db.insert(destinations).values({
          name: destination.name,
          state: destination.state,
          country: "Brasil",
          countryType: "nacional",
          region: destination.region,
          continent: "América do Sul",
          latitude: destination.latitude,
          longitude: destination.longitude,
          timezone: destination.timezone,
          isActive: true
        });
        
        console.log(`✅ Adicionado: ${destination.name}, ${destination.state}`);
        addedCount++;
      } catch (error) {
        // Check if it's a duplicate entry error
        if ((error as any).code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️ Destino já existe: ${destination.name}, ${destination.state}`);
          duplicateCount++;
        } else {
          console.error(`❌ Erro ao adicionar ${destination.name}:`, error);
        }
      }
    }
    
    console.log(`🎉 Processo de adição concluído!`);
    console.log(`📊 Resultado: ${addedCount} novos destinos adicionados, ${duplicateCount} duplicatas encontradas`);
    
    // Show updated summary
    const totalDestinations = await db.select().from(destinations);
    const internationalCount = totalDestinations.filter(d => d.countryType === 'internacional').length;
    const nationalCount = totalDestinations.filter(d => d.countryType === 'nacional').length;
    
    // Group by region
    const regionCount = totalDestinations.reduce((acc, dest) => {
      if (dest.countryType === 'nacional') {
        acc[dest.region || 'Sem região'] = (acc[dest.region || 'Sem região'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`📊 Resumo final do banco de destinos:`);
    console.log(`   • Total: ${totalDestinations.length} destinos`);
    console.log(`   • Nacionais: ${nationalCount} destinos`);
    console.log(`   • Internacionais: ${internationalCount} destinos`);
    console.log(`📍 Destinos nacionais por região:`);
    Object.entries(regionCount).forEach(([region, count]) => {
      console.log(`   • ${region}: ${count} destinos`);
    });
    
  } catch (error) {
    console.error("❌ Erro ao adicionar destinos adicionais:", error);
  }
}

// Execute the function
addAdditionalDestinations();