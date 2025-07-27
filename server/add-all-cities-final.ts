import { db } from './db';
import { destinations } from '../shared/schema';
import { eq } from 'drizzle-orm';

const allCitiesFromComprehensiveList = [
  // Região Sudeste - Rio de Janeiro
  { name: "Rio de Janeiro", state: "RJ", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -22.9068, longitude: -43.1729, timezone: "America/Sao_Paulo" },
  { name: "Paraty", state: "RJ", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -23.2178, longitude: -44.7175, timezone: "America/Sao_Paulo" },
  { name: "Petrópolis", state: "RJ", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -22.5058, longitude: -43.1780, timezone: "America/Sao_Paulo" },
  { name: "Angra dos Reis", state: "RJ", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -23.0067, longitude: -44.3185, timezone: "America/Sao_Paulo" },
  { name: "Búzios", state: "RJ", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -22.7470, longitude: -41.8818, timezone: "America/Sao_Paulo" },
  { name: "Ilha Grande", state: "RJ", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -23.1394, longitude: -44.2186, timezone: "America/Sao_Paulo" },
  { name: "Teresópolis", state: "RJ", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -22.4126, longitude: -42.9664, timezone: "America/Sao_Paulo" },
  { name: "Niterói", state: "RJ", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -22.8833, longitude: -43.1036, timezone: "America/Sao_Paulo" },

  // Região Sudeste - São Paulo
  { name: "São Paulo", state: "SP", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -23.5505, longitude: -46.6333, timezone: "America/Sao_Paulo" },
  { name: "Campos do Jordão", state: "SP", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -22.7389, longitude: -45.5913, timezone: "America/Sao_Paulo" },
  { name: "Ubatuba", state: "SP", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -23.4340, longitude: -45.0839, timezone: "America/Sao_Paulo" },
  { name: "Ilhabela", state: "SP", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -23.7781, longitude: -45.3581, timezone: "America/Sao_Paulo" },
  { name: "Santos", state: "SP", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -23.9618, longitude: -46.3322, timezone: "America/Sao_Paulo" },
  { name: "São Sebastião", state: "SP", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -23.8153, longitude: -45.4063, timezone: "America/Sao_Paulo" },
  { name: "Brotas", state: "SP", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -22.2847, longitude: -47.9859, timezone: "America/Sao_Paulo" },
  { name: "Holambra", state: "SP", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -22.6318, longitude: -47.0534, timezone: "America/Sao_Paulo" },
  { name: "Embu das Artes", state: "SP", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -23.6489, longitude: -46.8520, timezone: "America/Sao_Paulo" },
  { name: "Campinas", state: "SP", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -22.9099, longitude: -47.0626, timezone: "America/Sao_Paulo" },

  // Região Sudeste - Minas Gerais
  { name: "Belo Horizonte", state: "MG", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -19.9245, longitude: -43.9352, timezone: "America/Sao_Paulo" },
  { name: "Ouro Preto", state: "MG", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -20.3856, longitude: -43.5035, timezone: "America/Sao_Paulo" },
  { name: "Tiradentes", state: "MG", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -21.1098, longitude: -44.1748, timezone: "America/Sao_Paulo" },
  { name: "Mariana", state: "MG", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -20.3777, longitude: -43.4168, timezone: "America/Sao_Paulo" },
  { name: "Capitólio", state: "MG", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -20.6172, longitude: -46.0648, timezone: "America/Sao_Paulo" },
  { name: "Diamantina", state: "MG", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -18.2396, longitude: -43.6012, timezone: "America/Sao_Paulo" },
  { name: "São Thomé das Letras", state: "MG", country: "Brasil", countryType: "nacional", region: "Sudeste", continent: "América do Sul", latitude: -21.7147, longitude: -44.9826, timezone: "America/Sao_Paulo" },

  // Região Sul - Paraná
  { name: "Curitiba", state: "PR", country: "Brasil", countryType: "nacional", region: "Sul", continent: "América do Sul", latitude: -25.4284, longitude: -49.2733, timezone: "America/Sao_Paulo" },
  { name: "Foz do Iguaçu", state: "PR", country: "Brasil", countryType: "nacional", region: "Sul", continent: "América do Sul", latitude: -25.5478, longitude: -54.5882, timezone: "America/Sao_Paulo" },
  { name: "Ilha do Mel", state: "PR", country: "Brasil", countryType: "nacional", region: "Sul", continent: "América do Sul", latitude: -25.5167, longitude: -48.3000, timezone: "America/Sao_Paulo" },
  { name: "Morretes", state: "PR", country: "Brasil", countryType: "nacional", region: "Sul", continent: "América do Sul", latitude: -25.4661, longitude: -48.8375, timezone: "America/Sao_Paulo" },

  // Região Sul - Santa Catarina
  { name: "Florianópolis", state: "SC", country: "Brasil", countryType: "nacional", region: "Sul", continent: "América do Sul", latitude: -27.5954, longitude: -48.5480, timezone: "America/Sao_Paulo" },
  { name: "Balneário Camboriú", state: "SC", country: "Brasil", countryType: "nacional", region: "Sul", continent: "América do Sul", latitude: -26.9906, longitude: -48.6349, timezone: "America/Sao_Paulo" },
  { name: "Blumenau", state: "SC", country: "Brasil", countryType: "nacional", region: "Sul", continent: "América do Sul", latitude: -26.9194, longitude: -49.0661, timezone: "America/Sao_Paulo" },

  // Região Sul - Rio Grande do Sul
  { name: "Gramado", state: "RS", country: "Brasil", countryType: "nacional", region: "Sul", continent: "América do Sul", latitude: -29.3788, longitude: -50.8742, timezone: "America/Sao_Paulo" },
  { name: "Canela", state: "RS", country: "Brasil", countryType: "nacional", region: "Sul", continent: "América do Sul", latitude: -29.3648, longitude: -50.8151, timezone: "America/Sao_Paulo" },
  { name: "Porto Alegre", state: "RS", country: "Brasil", countryType: "nacional", region: "Sul", continent: "América do Sul", latitude: -30.0346, longitude: -51.2177, timezone: "America/Sao_Paulo" },

  // Região Nordeste - Bahia
  { name: "Salvador", state: "BA", country: "Brasil", countryType: "nacional", region: "Nordeste", continent: "América do Sul", latitude: -12.9714, longitude: -38.5014, timezone: "America/Bahia" },
  { name: "Porto Seguro", state: "BA", country: "Brasil", countryType: "nacional", region: "Nordeste", continent: "América do Sul", latitude: -16.4497, longitude: -39.0647, timezone: "America/Bahia" },

  // Região Nordeste - Ceará
  { name: "Fortaleza", state: "CE", country: "Brasil", countryType: "nacional", region: "Nordeste", continent: "América do Sul", latitude: -3.7275, longitude: -38.5138, timezone: "America/Fortaleza" },
  { name: "Jericoacoara", state: "CE", country: "Brasil", countryType: "nacional", region: "Nordeste", continent: "América do Sul", latitude: -2.7928, longitude: -40.5142, timezone: "America/Fortaleza" },

  // Região Nordeste - Rio Grande do Norte
  { name: "Natal", state: "RN", country: "Brasil", countryType: "nacional", region: "Nordeste", continent: "América do Sul", latitude: -5.7945, longitude: -35.2110, timezone: "America/Fortaleza" },

  // Região Nordeste - Paraíba
  { name: "João Pessoa", state: "PB", country: "Brasil", countryType: "nacional", region: "Nordeste", continent: "América do Sul", latitude: -7.1195, longitude: -34.8450, timezone: "America/Fortaleza" },

  // Região Nordeste - Pernambuco
  { name: "Recife", state: "PE", country: "Brasil", countryType: "nacional", region: "Nordeste", continent: "América do Sul", latitude: -8.0476, longitude: -34.8770, timezone: "America/Recife" },
  { name: "Fernando de Noronha", state: "PE", country: "Brasil", countryType: "nacional", region: "Nordeste", continent: "América do Sul", latitude: -3.8549, longitude: -32.4297, timezone: "America/Noronha" },
  { name: "Caruaru", state: "PE", country: "Brasil", countryType: "nacional", region: "Nordeste", continent: "América do Sul", latitude: -8.2840, longitude: -35.9708, timezone: "America/Recife" },

  // Região Nordeste - Alagoas
  { name: "Maceió", state: "AL", country: "Brasil", countryType: "nacional", region: "Nordeste", continent: "América do Sul", latitude: -9.6658, longitude: -35.7353, timezone: "America/Maceio" },
  { name: "Maragogi", state: "AL", country: "Brasil", countryType: "nacional", region: "Nordeste", continent: "América do Sul", latitude: -9.0124, longitude: -35.2226, timezone: "America/Maceio" },

  // Região Nordeste - Maranhão
  { name: "Barreirinhas", state: "MA", country: "Brasil", countryType: "nacional", region: "Nordeste", continent: "América do Sul", latitude: -2.7614, longitude: -42.8267, timezone: "America/Fortaleza" },

  // Região Centro-Oeste - Distrito Federal
  { name: "Brasília", state: "DF", country: "Brasil", countryType: "nacional", region: "Centro-Oeste", continent: "América do Sul", latitude: -15.8267, longitude: -47.9218, timezone: "America/Sao_Paulo" },

  // Região Centro-Oeste - Mato Grosso do Sul
  { name: "Bonito", state: "MS", country: "Brasil", countryType: "nacional", region: "Centro-Oeste", continent: "América do Sul", latitude: -21.1269, longitude: -56.4939, timezone: "America/Campo_Grande" },
  { name: "Pantanal", state: "MS", country: "Brasil", countryType: "nacional", region: "Centro-Oeste", continent: "América do Sul", latitude: -19.5830, longitude: -56.1070, timezone: "America/Campo_Grande" },

  // Região Centro-Oeste - Mato Grosso
  { name: "Chapada dos Guimarães", state: "MT", country: "Brasil", countryType: "nacional", region: "Centro-Oeste", continent: "América do Sul", latitude: -15.4611, longitude: -55.7508, timezone: "America/Cuiaba" },

  // Região Norte - Amazonas
  { name: "Manaus", state: "AM", country: "Brasil", countryType: "nacional", region: "Norte", continent: "América do Sul", latitude: -3.1190, longitude: -60.0217, timezone: "America/Manaus" },

  // Região Norte - Pará
  { name: "Belém", state: "PA", country: "Brasil", countryType: "nacional", region: "Norte", continent: "América do Sul", latitude: -1.4558, longitude: -48.5044, timezone: "America/Belem" },

  // América do Sul - Argentina
  { name: "Buenos Aires", state: null, country: "Argentina", countryType: "internacional", region: "América do Sul", continent: "América do Sul", latitude: -34.6118, longitude: -58.3960, timezone: "America/Argentina/Buenos_Aires" },
  { name: "Bariloche", state: null, country: "Argentina", countryType: "internacional", region: "América do Sul", continent: "América do Sul", latitude: -41.1456, longitude: -71.3082, timezone: "America/Argentina/Bariloche" },
  { name: "Mendoza", state: null, country: "Argentina", countryType: "internacional", region: "América do Sul", continent: "América do Sul", latitude: -32.8908, longitude: -68.8272, timezone: "America/Argentina/Mendoza" },

  // América do Sul - Chile
  { name: "Santiago", state: null, country: "Chile", countryType: "internacional", region: "América do Sul", continent: "América do Sul", latitude: -33.4489, longitude: -70.6693, timezone: "America/Santiago" },

  // América do Sul - Peru
  { name: "Lima", state: null, country: "Peru", countryType: "internacional", region: "América do Sul", continent: "América do Sul", latitude: -12.0464, longitude: -77.0428, timezone: "America/Lima" },
  { name: "Cusco", state: null, country: "Peru", countryType: "internacional", region: "América do Sul", continent: "América do Sul", latitude: -13.5170, longitude: -71.9785, timezone: "America/Lima" },
  { name: "Machu Picchu", state: null, country: "Peru", countryType: "internacional", region: "América do Sul", continent: "América do Sul", latitude: -13.1631, longitude: -72.5450, timezone: "America/Lima" },

  // América do Sul - Bolívia
  { name: "La Paz", state: null, country: "Bolívia", countryType: "internacional", region: "América do Sul", continent: "América do Sul", latitude: -16.5000, longitude: -68.1500, timezone: "America/La_Paz" },

  // América do Sul - Uruguai
  { name: "Montevidéu", state: null, country: "Uruguai", countryType: "internacional", region: "América do Sul", continent: "América do Sul", latitude: -34.9011, longitude: -56.1645, timezone: "America/Montevideo" },

  // América do Sul - Colômbia
  { name: "Bogotá", state: null, country: "Colômbia", countryType: "internacional", region: "América do Sul", continent: "América do Sul", latitude: 4.7110, longitude: -74.0721, timezone: "America/Bogota" },

  // América do Norte - Estados Unidos
  { name: "Nova York", state: "NY", country: "Estados Unidos", countryType: "internacional", region: "América do Norte", continent: "América do Norte", latitude: 40.7128, longitude: -74.0060, timezone: "America/New_York" },
  { name: "Los Angeles", state: "CA", country: "Estados Unidos", countryType: "internacional", region: "América do Norte", continent: "América do Norte", latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles" },
  { name: "Miami", state: "FL", country: "Estados Unidos", countryType: "internacional", region: "América do Norte", continent: "América do Norte", latitude: 25.7617, longitude: -80.1918, timezone: "America/New_York" },

  // América do Norte - Canadá
  { name: "Toronto", state: "ON", country: "Canadá", countryType: "internacional", region: "América do Norte", continent: "América do Norte", latitude: 43.6532, longitude: -79.3832, timezone: "America/Toronto" },

  // América do Norte - México
  { name: "Cancún", state: null, country: "México", countryType: "internacional", region: "América do Norte", continent: "América do Norte", latitude: 21.1619, longitude: -86.8515, timezone: "America/Cancun" },
  { name: "Cidade do México", state: null, country: "México", countryType: "internacional", region: "América do Norte", continent: "América do Norte", latitude: 19.4326, longitude: -99.1332, timezone: "America/Mexico_City" },

  // Europa - França
  { name: "Paris", state: null, country: "França", countryType: "internacional", region: "Europa", continent: "Europa", latitude: 48.8566, longitude: 2.3522, timezone: "Europe/Paris" },

  // Europa - Reino Unido
  { name: "Londres", state: null, country: "Reino Unido", countryType: "internacional", region: "Europa", continent: "Europa", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London" },

  // Europa - Itália
  { name: "Roma", state: null, country: "Itália", countryType: "internacional", region: "Europa", continent: "Europa", latitude: 41.9028, longitude: 12.4964, timezone: "Europe/Rome" },

  // Europa - Espanha
  { name: "Barcelona", state: null, country: "Espanha", countryType: "internacional", region: "Europa", continent: "Europa", latitude: 41.3851, longitude: 2.1734, timezone: "Europe/Madrid" },

  // Europa - Holanda
  { name: "Amsterdã", state: null, country: "Holanda", countryType: "internacional", region: "Europa", continent: "Europa", latitude: 52.3676, longitude: 4.9041, timezone: "Europe/Amsterdam" },

  // Europa - Alemanha
  { name: "Berlim", state: null, country: "Alemanha", countryType: "internacional", region: "Europa", continent: "Europa", latitude: 52.5200, longitude: 13.4050, timezone: "Europe/Berlin" },

  // Europa - Portugal
  { name: "Lisboa", state: null, country: "Portugal", countryType: "internacional", region: "Europa", continent: "Europa", latitude: 38.7223, longitude: -9.1393, timezone: "Europe/Lisbon" },
  { name: "Porto", state: null, country: "Portugal", countryType: "internacional", region: "Europa", continent: "Europa", latitude: 41.1579, longitude: -8.6291, timezone: "Europe/Lisbon" },

  // Ásia - Japão
  { name: "Tóquio", state: null, country: "Japão", countryType: "internacional", region: "Ásia", continent: "Ásia", latitude: 35.6762, longitude: 139.6503, timezone: "Asia/Tokyo" },

  // Ásia - Tailândia
  { name: "Bangkok", state: null, country: "Tailândia", countryType: "internacional", region: "Ásia", continent: "Ásia", latitude: 13.7563, longitude: 100.5018, timezone: "Asia/Bangkok" },

  // Ásia - Emirados Árabes Unidos
  { name: "Dubai", state: null, country: "Emirados Árabes", countryType: "internacional", region: "Ásia", continent: "Ásia", latitude: 25.2048, longitude: 55.2708, timezone: "Asia/Dubai" },

  // Ásia - Singapura
  { name: "Cingapura", state: null, country: "Singapura", countryType: "internacional", region: "Ásia", continent: "Ásia", latitude: 1.3521, longitude: 103.8198, timezone: "Asia/Singapore" },

  // África - Egito
  { name: "Cairo", state: null, country: "Egito", countryType: "internacional", region: "África", continent: "África", latitude: 30.0444, longitude: 31.2357, timezone: "Africa/Cairo" },

  // África - África do Sul
  { name: "Cidade do Cabo", state: null, country: "África do Sul", countryType: "internacional", region: "África", continent: "África", latitude: -33.9249, longitude: 18.4241, timezone: "Africa/Johannesburg" },

  // África - Marrocos
  { name: "Marrakech", state: null, country: "Marrocos", countryType: "internacional", region: "África", continent: "África", latitude: 31.6295, longitude: -7.9811, timezone: "Africa/Casablanca" },

  // Oceania - Austrália
  { name: "Sydney", state: "NSW", country: "Austrália", countryType: "internacional", region: "Oceania", continent: "Oceania", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney" },
  { name: "Melbourne", state: "VIC", country: "Austrália", countryType: "internacional", region: "Oceania", continent: "Oceania", latitude: -37.8136, longitude: 144.9631, timezone: "Australia/Melbourne" },
];

export async function addAllCitiesFinal() {
  console.log("🏙️ Iniciando cadastro completo de todas as cidades...");
  
  let addedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const city of allCitiesFromComprehensiveList) {
    try {
      // Check if city already exists
      const existingCity = await db.select()
        .from(destinations)
        .where(eq(destinations.name, city.name))
        .limit(1);
      
      if (existingCity.length > 0) {
        console.log(`⏭️ Cidade já existe: ${city.name}`);
        skippedCount++;
        continue;
      }
      
      // Insert new city
      await db.insert(destinations).values({
        name: city.name,
        state: city.state,
        country: city.country,
        countryType: city.countryType,
        region: city.region,
        continent: city.continent,
        latitude: city.latitude.toString(),
        longitude: city.longitude.toString(),
        timezone: city.timezone,
        isActive: true
      });
      
      console.log(`✅ Cidade adicionada: ${city.name}, ${city.state || city.country}`);
      addedCount++;
      
    } catch (error) {
      console.error(`❌ Erro ao adicionar cidade ${city.name}:`, error);
      errorCount++;
    }
  }
  
  console.log(`\n🎉 Processo concluído!`);
  console.log(`📊 Resumo:`);
  console.log(`   ✅ Cidades adicionadas: ${addedCount}`);
  console.log(`   ⏭️ Cidades já existentes: ${skippedCount}`);
  console.log(`   ❌ Erros: ${errorCount}`);
  console.log(`   🏙️ Total processado: ${allCitiesFromComprehensiveList.length}`);
  
  return {
    added: addedCount,
    skipped: skippedCount,
    errors: errorCount,
    total: allCitiesFromComprehensiveList.length
  };
}

// Run the function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addAllCitiesFinal()
    .then((result) => {
      console.log("✨ Script finalizado com sucesso!");
      console.log(`📈 Resultado final: ${result.added} adicionadas, ${result.skipped} existentes, ${result.errors} erros`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Erro fatal:", error);
      process.exit(1);
    });
}