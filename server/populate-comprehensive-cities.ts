import { config } from "dotenv";
import { db } from "./db";
import { destinations } from "@shared/schema";
import { sql } from "drizzle-orm";

config();

interface CityData {
  name: string;
  state?: string;
  country: string;
  countryType: "nacional" | "internacional";
  region: string;
  continent: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

const comprehensiveCities: CityData[] = [
  // CIDADES NACIONAIS - BRASIL
  // Região Sudeste
  {
    name: "Rio de Janeiro",
    state: "RJ", 
    country: "Brasil",
    countryType: "nacional",
    region: "Sudeste",
    continent: "América do Sul",
    latitude: -22.9068,
    longitude: -43.1729,
    timezone: "America/Sao_Paulo"
  },
  {
    name: "São Paulo",
    state: "SP",
    country: "Brasil", 
    countryType: "nacional",
    region: "Sudeste",
    continent: "América do Sul",
    latitude: -23.5558,
    longitude: -46.6396,
    timezone: "America/Sao_Paulo"
  },
  {
    name: "Serra da Mantiqueira",
    state: "MG/SP/RJ",
    country: "Brasil",
    countryType: "nacional", 
    region: "Sudeste",
    continent: "América do Sul",
    latitude: -22.4009,
    longitude: -45.4734,
    timezone: "America/Sao_Paulo"
  },
  {
    name: "Ouro Preto",
    state: "MG",
    country: "Brasil",
    countryType: "nacional",
    region: "Sudeste", 
    continent: "América do Sul",
    latitude: -20.3856,
    longitude: -43.5054,
    timezone: "America/Sao_Paulo"
  },

  // Região Nordeste
  {
    name: "Salvador",
    state: "BA",
    country: "Brasil", 
    countryType: "nacional",
    region: "Nordeste",
    continent: "América do Sul",
    latitude: -12.9714,
    longitude: -38.5014,
    timezone: "America/Bahia"
  },
  {
    name: "Maragogi", 
    state: "AL",
    country: "Brasil",
    countryType: "nacional",
    region: "Nordeste",
    continent: "América do Sul",
    latitude: -9.0122,
    longitude: -35.2228,
    timezone: "America/Maceio"
  },
  {
    name: "Lençóis Maranhenses",
    state: "MA",
    country: "Brasil",
    countryType: "nacional", 
    region: "Nordeste",
    continent: "América do Sul",
    latitude: -2.4856,
    longitude: -43.1281,
    timezone: "America/Fortaleza"
  },
  {
    name: "Caruaru",
    state: "PE",
    country: "Brasil",
    countryType: "nacional",
    region: "Nordeste",
    continent: "América do Sul",
    latitude: -8.2837,
    longitude: -35.9761,
    timezone: "America/Recife" 
  },

  // Região Norte
  {
    name: "Manaus",
    state: "AM",
    country: "Brasil",
    countryType: "nacional",
    region: "Norte", 
    continent: "América do Sul",
    latitude: -3.1190,
    longitude: -60.0217,
    timezone: "America/Manaus"
  },

  // Região Sul
  {
    name: "Florianópolis", 
    state: "SC",
    country: "Brasil",
    countryType: "nacional",
    region: "Sul",
    continent: "América do Sul",
    latitude: -27.5954,
    longitude: -48.5480,
    timezone: "America/Sao_Paulo"
  },
  {
    name: "Gramado",
    state: "RS", 
    country: "Brasil",
    countryType: "nacional",
    region: "Sul",
    continent: "América do Sul",
    latitude: -29.3788,
    longitude: -50.8719,
    timezone: "America/Sao_Paulo"
  },

  // Região Centro-Oeste
  {
    name: "Pantanal",
    state: "MT/MS",
    country: "Brasil",
    countryType: "nacional",
    region: "Centro-Oeste",
    continent: "América do Sul", 
    latitude: -19.0208,
    longitude: -57.6531,
    timezone: "America/Campo_Grande"
  },
  {
    name: "Bonito",
    state: "MS",
    country: "Brasil", 
    countryType: "nacional",
    region: "Centro-Oeste",
    continent: "América do Sul",
    latitude: -21.1295,
    longitude: -56.4886,
    timezone: "America/Campo_Grande"
  },

  // CIDADES INTERNACIONAIS

  // Europa
  {
    name: "Paris",
    country: "França",
    countryType: "internacional",
    region: "Europa Ocidental",
    continent: "Europa",
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: "Europe/Paris"
  },
  {
    name: "Londres", 
    country: "Reino Unido",
    countryType: "internacional",
    region: "Europa Ocidental",
    continent: "Europa",
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: "Europe/London"
  },
  {
    name: "Roma",
    country: "Itália",
    countryType: "internacional", 
    region: "Europa Mediterrânea",
    continent: "Europa",
    latitude: 41.9028,
    longitude: 12.4964,
    timezone: "Europe/Rome"
  },
  {
    name: "Madrid",
    country: "Espanha",
    countryType: "internacional",
    region: "Europa Mediterrânea",
    continent: "Europa",
    latitude: 40.4168,
    longitude: -3.7038,
    timezone: "Europe/Madrid"
  },
  {
    name: "Barcelona",
    country: "Espanha", 
    countryType: "internacional",
    region: "Europa Mediterrânea",
    continent: "Europa",
    latitude: 41.3851,
    longitude: 2.1734,
    timezone: "Europe/Madrid"
  },
  {
    name: "Amsterdam",
    country: "Holanda",
    countryType: "internacional",
    region: "Europa Ocidental",
    continent: "Europa",
    latitude: 52.3676,
    longitude: 4.9041,
    timezone: "Europe/Amsterdam"
  },
  {
    name: "Berlim",
    country: "Alemanha",
    countryType: "internacional",
    region: "Europa Central", 
    continent: "Europa",
    latitude: 52.5200,
    longitude: 13.4050,
    timezone: "Europe/Berlin"
  },

  // América do Norte
  {
    name: "Nova York",
    country: "Estados Unidos",
    countryType: "internacional",
    region: "Costa Leste",
    continent: "América do Norte",
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: "America/New_York"
  },
  {
    name: "Los Angeles",
    country: "Estados Unidos", 
    countryType: "internacional",
    region: "Costa Oeste",
    continent: "América do Norte",
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: "America/Los_Angeles"
  },
  {
    name: "Las Vegas",
    country: "Estados Unidos",
    countryType: "internacional",
    region: "Oeste",
    continent: "América do Norte",
    latitude: 36.1699,
    longitude: -115.1398,
    timezone: "America/Los_Angeles"
  },
  {
    name: "Miami",
    country: "Estados Unidos",
    countryType: "internacional", 
    region: "Sudeste",
    continent: "América do Norte",
    latitude: 25.7617,
    longitude: -80.1918,
    timezone: "America/New_York"
  },

  // América do Sul (outros países)
  {
    name: "Buenos Aires",
    country: "Argentina",
    countryType: "internacional",
    region: "Cone Sul",
    continent: "América do Sul",
    latitude: -34.6037,
    longitude: -58.3816,
    timezone: "America/Argentina/Buenos_Aires"
  },
  {
    name: "Patagônia",
    country: "Argentina", 
    countryType: "internacional",  
    region: "Cone Sul",
    continent: "América do Sul",
    latitude: -41.8182,
    longitude: -68.9061,
    timezone: "America/Argentina/Rio_Gallegos"
  },
  {
    name: "Machu Picchu",
    country: "Peru",
    countryType: "internacional",
    region: "Andes",
    continent: "América do Sul",
    latitude: -13.1631,
    longitude: -72.5450,
    timezone: "America/Lima"
  },
  {
    name: "Santiago",
    country: "Chile",
    countryType: "internacional",
    region: "Cone Sul", 
    continent: "América do Sul",
    latitude: -33.4489,
    longitude: -70.6693,
    timezone: "America/Santiago"
  },

  // Ásia
  {
    name: "Tóquio",
    country: "Japão",
    countryType: "internacional",
    region: "Ásia Oriental", 
    continent: "Ásia",
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: "Asia/Tokyo"
  },
  {
    name: "Bangkok",
    country: "Tailândia",
    countryType: "internacional",
    region: "Sudeste Asiático",
    continent: "Ásia",
    latitude: 13.7563,
    longitude: 100.5018,
    timezone: "Asia/Bangkok"
  },
  {
    name: "Singapura",
    country: "Singapura", 
    countryType: "internacional",
    region: "Sudeste Asiático",
    continent: "Ásia",
    latitude: 1.3521,
    longitude: 103.8198,
    timezone: "Asia/Singapore"
  },

  // África
  {
    name: "Nairobi",
    country: "Quênia",
    countryType: "internacional",
    region: "África Oriental",
    continent: "África",
    latitude: -1.2864,
    longitude: 36.8172,
    timezone: "Africa/Nairobi"
  },
  {
    name: "Cidade do Cabo", 
    country: "África do Sul",
    countryType: "internacional",
    region: "África Austral",
    continent: "África",
    latitude: -33.9249,
    longitude: 18.4241,
    timezone: "Africa/Johannesburg"
  },

  // Oceania
  {
    name: "Sydney",
    country: "Austrália",
    countryType: "internacional",
    region: "Oceania",
    continent: "Oceania",
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: "Australia/Sydney"
  }
];

async function populateComprehensiveCities() {
  try {
    console.log("🔗 Conectando ao MySQL...");
    
    // Add continent column if not exists
    try {
      await db.execute(sql`
        ALTER TABLE destinations ADD COLUMN continent VARCHAR(100) NOT NULL DEFAULT 'América do Sul'
      `);
      console.log("   ✅ Coluna continent adicionada à tabela destinations");
    } catch (error) {
      console.log("   ⚠️ Coluna continent já existe ou erro:", (error as Error).message);
    }

    console.log("🏙️ Inserindo cidades abrangentes...");
    
    for (const cityData of comprehensiveCities) {
      try {
        // Check if city already exists
        const [existingCity] = await db.execute(sql`
          SELECT id FROM destinations WHERE name = ${cityData.name} AND country = ${cityData.country}
        `);
        
        if (existingCity && Array.isArray(existingCity) && existingCity.length > 0) {
          // Update existing city with new data including continent
          await db.execute(sql`
            UPDATE destinations SET
              state = ${cityData.state || null},
              country_type = ${cityData.countryType},
              region = ${cityData.region},
              continent = ${cityData.continent},
              latitude = ${cityData.latitude || null},
              longitude = ${cityData.longitude || null},
              timezone = ${cityData.timezone || null}
            WHERE name = ${cityData.name} AND country = ${cityData.country}
          `);
          console.log(`   🔄 Cidade atualizada: ${cityData.name}, ${cityData.country} (${cityData.continent})`);
        } else {
          // Insert new city
          await db.execute(sql`
            INSERT INTO destinations (name, state, country, country_type, region, continent, latitude, longitude, timezone, is_active)
            VALUES (${cityData.name}, ${cityData.state || null}, ${cityData.country}, ${cityData.countryType}, 
                    ${cityData.region}, ${cityData.continent}, ${cityData.latitude || null}, 
                    ${cityData.longitude || null}, ${cityData.timezone || null}, true)
          `);
          console.log(`   ✅ Cidade inserida: ${cityData.name}, ${cityData.country} (${cityData.continent})`);
        }
      } catch (error) {
        console.log(`   ❌ Erro ao processar ${cityData.name}: ${(error as Error).message}`);
      }
    }

    // Get final count
    const [countResult] = await db.execute(sql`SELECT COUNT(*) as total FROM destinations WHERE is_active = true`);
    const totalCities = Array.isArray(countResult) ? (countResult[0] as any)?.total || 0 : 0;
    
    console.log(`📊 Total de cidades ativas: ${totalCities}`);
    console.log("🎉 População abrangente de cidades concluída!");
    
  } catch (error) {
    console.error("💥 Erro na população de cidades:", error);
    throw error;
  }
}

// Execute if this module is run directly
populateComprehensiveCities()
  .then(() => {
    console.log("✅ Script executado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Falha na execução:", error);
    process.exit(1);
  });

export { populateComprehensiveCities };