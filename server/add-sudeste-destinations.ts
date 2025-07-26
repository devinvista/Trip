import { db } from "./db.js";
import { destinations } from "@shared/schema.js";

// Destinos da região Sudeste (48 cidades)
const sudesteDestinations = [
  // Minas Gerais
  { name: "Aiuruoca", state: "MG", region: "Sudeste", latitude: "-21.5167", longitude: "-44.6167", timezone: "America/Sao_Paulo" },
  { name: "Brumadinho", state: "MG", region: "Sudeste", latitude: "-20.1439", longitude: "-44.2100", timezone: "America/Sao_Paulo" },
  { name: "Carrancas", state: "MG", region: "Sudeste", latitude: "-21.4833", longitude: "-44.6500", timezone: "America/Sao_Paulo" },
  { name: "Congonhas", state: "MG", region: "Sudeste", latitude: "-20.4969", longitude: "-43.8614", timezone: "America/Sao_Paulo" },
  { name: "Inhotim", state: "MG", region: "Sudeste", latitude: "-20.1264", longitude: "-44.2086", timezone: "America/Sao_Paulo" },
  { name: "Juiz de Fora", state: "MG", region: "Sudeste", latitude: "-21.7587", longitude: "-43.3500", timezone: "America/Sao_Paulo" },
  { name: "Lavras Novas", state: "MG", region: "Sudeste", latitude: "-20.2833", longitude: "-43.4500", timezone: "America/Sao_Paulo" },
  { name: "Monte Verde", state: "MG", region: "Sudeste", latitude: "-22.8667", longitude: "-46.0500", timezone: "America/Sao_Paulo" },
  { name: "Pampulha", state: "MG", region: "Sudeste", latitude: "-19.8500", longitude: "-43.9667", timezone: "America/Sao_Paulo" },
  { name: "Piracema", state: "MG", region: "Sudeste", latitude: "-19.9500", longitude: "-44.8167", timezone: "America/Sao_Paulo" },
  { name: "Poços de Caldas", state: "MG", region: "Sudeste", latitude: "-21.7879", longitude: "-46.5619", timezone: "America/Sao_Paulo" },

  // São Paulo
  { name: "Águas de Lindóia", state: "SP", region: "Sudeste", latitude: "-22.4750", longitude: "-46.6333", timezone: "America/Sao_Paulo" },
  { name: "Bragança Paulista", state: "SP", region: "Sudeste", latitude: "-22.9519", longitude: "-46.5417", timezone: "America/Sao_Paulo" },
  { name: "Bauru", state: "SP", region: "Sudeste", latitude: "-22.3147", longitude: "-49.0608", timezone: "America/Sao_Paulo" },
  { name: "Franca", state: "SP", region: "Sudeste", latitude: "-20.5386", longitude: "-47.4008", timezone: "America/Sao_Paulo" },
  { name: "Ibirapuera", state: "SP", region: "Sudeste", latitude: "-23.5878", longitude: "-46.6581", timezone: "America/Sao_Paulo" },
  { name: "Itu", state: "SP", region: "Sudeste", latitude: "-23.2644", longitude: "-47.2994", timezone: "America/Sao_Paulo" },
  { name: "Marília", state: "SP", region: "Sudeste", latitude: "-22.2139", longitude: "-49.9456", timezone: "America/Sao_Paulo" },
  { name: "MASP", state: "SP", region: "Sudeste", latitude: "-23.5614", longitude: "-46.6558", timezone: "America/Sao_Paulo" },
  { name: "Piracicaba", state: "SP", region: "Sudeste", latitude: "-22.7253", longitude: "-47.6492", timezone: "America/Sao_Paulo" },
  { name: "Presidente Prudente", state: "SP", region: "Sudeste", latitude: "-22.1256", longitude: "-51.3889", timezone: "America/Sao_Paulo" },
  { name: "Ribeirão Preto", state: "SP", region: "Sudeste", latitude: "-21.1767", longitude: "-47.8208", timezone: "America/Sao_Paulo" },

  // Rio de Janeiro
  { name: "Arraial do Cabo", state: "RJ", region: "Sudeste", latitude: "-22.9661", longitude: "-42.0278", timezone: "America/Sao_Paulo" },
  { name: "Cabo Frio", state: "RJ", region: "Sudeste", latitude: "-22.8794", longitude: "-42.0186", timezone: "America/Sao_Paulo" },
  { name: "Itatiaia", state: "RJ", region: "Sudeste", latitude: "-22.4942", longitude: "-44.5558", timezone: "America/Sao_Paulo" },
  { name: "Mangaratiba", state: "RJ", region: "Sudeste", latitude: "-22.9597", longitude: "-44.0408", timezone: "America/Sao_Paulo" },
  { name: "Resende", state: "RJ", region: "Sudeste", latitude: "-22.4686", longitude: "-44.4264", timezone: "America/Sao_Paulo" },
  { name: "Saquarema", state: "RJ", region: "Sudeste", latitude: "-22.9200", longitude: "-42.5067", timezone: "America/Sao_Paulo" },

  // Paraná
  { name: "Antonina", state: "PR", region: "Sul", latitude: "-25.4281", longitude: "-48.7089", timezone: "America/Sao_Paulo" },
  { name: "Apucarana", state: "PR", region: "Sul", latitude: "-23.5511", longitude: "-51.4608", timezone: "America/Sao_Paulo" },
  { name: "Guarapuava", state: "PR", region: "Sul", latitude: "-25.3945", longitude: "-51.4583", timezone: "America/Sao_Paulo" },
  { name: "Guaratuba", state: "PR", region: "Sul", latitude: "-25.8828", longitude: "-48.5747", timezone: "America/Sao_Paulo" },
  { name: "Londrina", state: "PR", region: "Sul", latitude: "-23.3045", longitude: "-51.1696", timezone: "America/Sao_Paulo" },
  { name: "Ponta Grossa", state: "PR", region: "Sul", latitude: "-25.0916", longitude: "-50.1668", timezone: "America/Sao_Paulo" },

  // Santa Catarina
  { name: "Bombinhas", state: "SC", region: "Sul", latitude: "-27.1394", longitude: "-48.4844", timezone: "America/Sao_Paulo" },
  { name: "Garopaba", state: "SC", region: "Sul", latitude: "-28.0256", longitude: "-48.6156", timezone: "America/Sao_Paulo" },
  { name: "Itapema", state: "SC", region: "Sul", latitude: "-27.0906", longitude: "-48.6108", timezone: "America/Sao_Paulo" },
  { name: "Joinville", state: "SC", region: "Sul", latitude: "-26.3044", longitude: "-48.8461", timezone: "America/Sao_Paulo" },
  { name: "Navegantes", state: "SC", region: "Sul", latitude: "-26.8981", longitude: "-48.6522", timezone: "America/Sao_Paulo" },
  { name: "Nova Veneza", state: "SC", region: "Sul", latitude: "-28.6378", longitude: "-49.4892", timezone: "America/Sao_Paulo" },
  { name: "Pomerode", state: "SC", region: "Sul", latitude: "-26.7406", longitude: "-49.1764", timezone: "America/Sao_Paulo" },
  { name: "Praia do Rosa", state: "SC", region: "Sul", latitude: "-28.1019", longitude: "-48.5931", timezone: "America/Sao_Paulo" },

  // Rio Grande do Sul
  { name: "Igrejinha", state: "RS", region: "Sul", latitude: "-29.5758", longitude: "-50.7900", timezone: "America/Sao_Paulo" },
  { name: "Mostardas", state: "RS", region: "Sul", latitude: "-31.1167", longitude: "-50.9167", timezone: "America/Sao_Paulo" },
  { name: "Nova Petrópolis", state: "RS", region: "Sul", latitude: "-29.3783", longitude: "-51.1133", timezone: "America/Sao_Paulo" },
  { name: "Rio Grande", state: "RS", region: "Sul", latitude: "-32.0350", longitude: "-52.0986", timezone: "America/Sao_Paulo" },

  // Mato Grosso
  { name: "Jaciara", state: "MT", region: "Centro-Oeste", latitude: "-15.9650", longitude: "-54.9683", timezone: "America/Cuiaba" }
];

async function addSudesteDestinations() {
  try {
    console.log("🏞️ Adicionando destinos da região Sudeste e Sul...");
    
    for (const destination of sudesteDestinations) {
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
      } catch (error) {
        // Check if it's a duplicate entry error
        if ((error as any).code === 'ER_DUP_ENTRY') {
          console.log(`ℹ️ Destino já existe: ${destination.name}, ${destination.state}`);
        } else {
          console.error(`❌ Erro ao adicionar ${destination.name}:`, error);
        }
      }
    }
    
    console.log("🎉 Processo de adição de destinos nacionais concluído!");
    
    // Show summary
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
    
    console.log(`📊 Resumo atualizado do banco de destinos:`);
    console.log(`   • Total: ${totalDestinations.length} destinos`);
    console.log(`   • Nacionais: ${nationalCount} destinos`);
    console.log(`   • Internacionais: ${internationalCount} destinos`);
    console.log(`📍 Destinos nacionais por região:`);
    Object.entries(regionCount).forEach(([region, count]) => {
      console.log(`   • ${region}: ${count} destinos`);
    });
    
  } catch (error) {
    console.error("❌ Erro ao adicionar destinos nacionais:", error);
  }
}

// Execute the function
addSudesteDestinations();