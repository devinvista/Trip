import { db } from "./db";
import { cities, trips, activities } from "@shared/schema";
import { sql, eq } from "drizzle-orm";

interface LocationData {
  name: string;
  state?: string;
  country: string;
  countryType: 'nacional' | 'internacional';
  region?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

// Mapping of existing locations to structured city data
const cityMappings: Record<string, LocationData> = {
  // National destinations
  "Rio de Janeiro, RJ": {
    name: "Rio de Janeiro",
    state: "RJ",
    country: "Brasil",
    countryType: "nacional",
    region: "Sudeste",
    latitude: -22.9068,
    longitude: -43.1729,
    timezone: "America/Sao_Paulo"
  },
  "São Paulo, SP": {
    name: "São Paulo", 
    state: "SP",
    country: "Brasil",
    countryType: "nacional",
    region: "Sudeste",
    latitude: -23.5505,
    longitude: -46.6333,
    timezone: "America/Sao_Paulo"
  },
  "Salvador, BA": {
    name: "Salvador",
    state: "BA", 
    country: "Brasil",
    countryType: "nacional",
    region: "Nordeste",
    latitude: -12.9714,
    longitude: -38.5124,
    timezone: "America/Bahia"
  },
  "Mantiqueira, MG": {
    name: "Serra da Mantiqueira",
    state: "MG",
    country: "Brasil", 
    countryType: "nacional",
    region: "Sudeste",
    latitude: -22.4667,
    longitude: -44.6167,
    timezone: "America/Sao_Paulo"
  },
  "Maragogi, AL": {
    name: "Maragogi",
    state: "AL",
    country: "Brasil",
    countryType: "nacional", 
    region: "Nordeste",
    latitude: -9.0122,
    longitude: -35.2225,
    timezone: "America/Maceio"
  },
  "Ouro Preto, MG": {
    name: "Ouro Preto",
    state: "MG",
    country: "Brasil",
    countryType: "nacional",
    region: "Sudeste", 
    latitude: -20.3856,
    longitude: -43.5035,
    timezone: "America/Sao_Paulo"
  },
  "Manaus, AM": {
    name: "Manaus",
    state: "AM",
    country: "Brasil",
    countryType: "nacional",
    region: "Norte",
    latitude: -3.1190,
    longitude: -60.0217,
    timezone: "America/Manaus"
  },
  "Florianópolis, SC": {
    name: "Florianópolis",
    state: "SC", 
    country: "Brasil",
    countryType: "nacional",
    region: "Sul",
    latitude: -27.5954,
    longitude: -48.5480,
    timezone: "America/Sao_Paulo"
  },
  "Gramado, RS": {
    name: "Gramado",
    state: "RS",
    country: "Brasil",
    countryType: "nacional",
    region: "Sul",
    latitude: -29.3788,
    longitude: -50.8740,
    timezone: "America/Sao_Paulo"
  },
  "Lençóis Maranhenses, MA": {
    name: "Lençóis Maranhenses",
    state: "MA",
    country: "Brasil", 
    countryType: "nacional",
    region: "Nordeste",
    latitude: -2.4856,
    longitude: -43.1283,
    timezone: "America/Fortaleza"
  },
  "Caruaru, PE": {
    name: "Caruaru",
    state: "PE",
    country: "Brasil",
    countryType: "nacional",
    region: "Nordeste",
    latitude: -8.2837,
    longitude: -35.9708,
    timezone: "America/Recife"
  },
  "Bonito, MS": {
    name: "Bonito",
    state: "MS",
    country: "Brasil",
    countryType: "nacional", 
    region: "Centro-Oeste",
    latitude: -21.1295,
    longitude: -56.4890,
    timezone: "America/Campo_Grande"
  },
  "Pantanal, MT": {
    name: "Pantanal",
    state: "MT",
    country: "Brasil",
    countryType: "nacional",
    region: "Centro-Oeste",
    latitude: -16.4896,
    longitude: -56.4896,
    timezone: "America/Cuiaba"
  },

  // International destinations
  "Paris, França": {
    name: "Paris",
    country: "França",
    countryType: "internacional",
    region: "Europa",
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: "Europe/Paris"
  },
  "Nova York, EUA": {
    name: "Nova York", 
    country: "Estados Unidos",
    countryType: "internacional",
    region: "América do Norte",
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: "America/New_York"
  },
  "Londres, Reino Unido": {
    name: "Londres",
    country: "Reino Unido",
    countryType: "internacional",
    region: "Europa",
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: "Europe/London"
  },
  "Roma, Itália": {
    name: "Roma",
    country: "Itália", 
    countryType: "internacional",
    region: "Europa",
    latitude: 41.9028,
    longitude: 12.4964,
    timezone: "Europe/Rome"
  },
  "Buenos Aires, Argentina": {
    name: "Buenos Aires",
    country: "Argentina",
    countryType: "internacional",
    region: "América do Sul",
    latitude: -34.6118,
    longitude: -58.3960,
    timezone: "America/Argentina/Buenos_Aires"
  },
  "Patagônia, Argentina": {
    name: "Patagônia",
    country: "Argentina",
    countryType: "internacional", 
    region: "América do Sul",
    latitude: -49.3273,
    longitude: -67.7027,
    timezone: "America/Argentina/Rio_Gallegos"
  },
  "Machu Picchu, Peru": {
    name: "Machu Picchu",
    country: "Peru",
    countryType: "internacional",
    region: "América do Sul",
    latitude: -13.1631,
    longitude: -72.5450,
    timezone: "America/Lima"
  },
  "Quênia": {
    name: "Nairobi",
    country: "Quênia", 
    countryType: "internacional",
    region: "África",
    latitude: -1.2921,
    longitude: 36.8219,
    timezone: "Africa/Nairobi"
  },
  "Copacabana, RJ": {
    name: "Rio de Janeiro",
    state: "RJ",
    country: "Brasil",
    countryType: "nacional",
    region: "Sudeste", 
    latitude: -22.9068,
    longitude: -43.1729,
    timezone: "America/Sao_Paulo"
  }
};

export async function migrateToCitiesTable() {
  try {
    console.log("🏗️ Criando tabela cities...");
    
    // Create cities table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        state VARCHAR(255),
        country VARCHAR(255) NOT NULL,
        country_type VARCHAR(50) NOT NULL,
        region VARCHAR(255),
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8), 
        timezone VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        UNIQUE KEY unique_city (name, state, country)
      )
    `);

    console.log("✅ Tabela cities criada!");

    // Insert all unique cities
    console.log("📍 Inserindo cidades...");
    
    const cityInserts = Object.values(cityMappings).reduce((acc: LocationData[], city) => {
      const existing = acc.find(c => c.name === city.name && c.country === city.country);
      if (!existing) {
        acc.push(city);
      }
      return acc;
    }, []);

    for (const cityData of cityInserts) {
      try {
        await db.insert(cities).values(cityData).ignore();
        console.log(`   ✅ Cidade inserida: ${cityData.name}, ${cityData.country}`);
      } catch (error) {
        console.log(`   ⚠️ Cidade já existe: ${cityData.name}, ${cityData.country}`);
      }
    }

    console.log("🔄 Migrando dados das viagens...");

    // Add cityId column to trips table if not exists
    try {
      await db.execute(sql`
        ALTER TABLE trips 
        ADD COLUMN city_id INT,
        ADD FOREIGN KEY (city_id) REFERENCES cities(id)
      `);
      console.log("   ✅ Coluna city_id adicionada à tabela trips");
    } catch (error) {
      console.log("   ⚠️ Coluna city_id já existe em trips");
    }

    // Get all trips with their current localidade (use raw SQL to avoid schema conflicts)
    const allTripsResult = await db.execute(sql`
      SELECT id, title, localidade FROM trips
    `);
    const allTrips = allTripsResult as Array<{id: number, title: string, localidade: string}>;

    // Update trips with cityId
    for (const trip of allTrips) {
      const cityMapping = cityMappings[trip.localidade as string];
      if (cityMapping) {
        // Find the city ID
        const [city] = await db.select().from(cities).where(
          sql`name = ${cityMapping.name} AND country = ${cityMapping.country}`
        );
        
        if (city) {
          await db.execute(sql`
            UPDATE trips SET city_id = ${city.id} WHERE id = ${trip.id}
          `);
          console.log(`   ✅ Viagem "${trip.title}" vinculada à cidade ${cityMapping.name}`);
        }
      } else {
        console.log(`   ⚠️ Mapeamento não encontrado para: ${trip.localidade}`);
      }
    }

    console.log("🎯 Migrando dados das atividades...");
    
    // Add cityId column to activities table if not exists
    try {
      await db.execute(sql`
        ALTER TABLE activities 
        ADD COLUMN city_id INT,
        ADD FOREIGN KEY (city_id) REFERENCES cities(id)
      `);
      console.log("   ✅ Coluna city_id adicionada à tabela activities");
    } catch (error) {
      console.log("   ⚠️ Coluna city_id já existe em activities");
    }
    
    // Get all activities using raw SQL to avoid schema conflicts
    const allActivitiesResult = await db.execute(sql`
      SELECT id, title, location, city FROM activities
    `);
    const allActivities = allActivitiesResult as Array<{id: number, title: string, location?: string, city?: string}>;

    // Update activities with cityId based on location field
    for (const activity of allActivities) {
      const activityLocation = activity.location || activity.city;
      
      // Skip if no location data
      if (!activityLocation) {
        console.log(`   ⚠️ Atividade sem localização: ${activity.title}`);
        continue;
      }
      
      // Try to find matching city mapping
      let cityMapping: LocationData | undefined;
      
      // Direct mapping lookup
      cityMapping = cityMappings[activityLocation];
      
      // If not found, try partial matching
      if (!cityMapping) {
        const mappingKey = Object.keys(cityMappings).find(key => 
          key.includes(activityLocation) || activityLocation.includes(key.split(',')[0])
        );
        if (mappingKey) {
          cityMapping = cityMappings[mappingKey];
        }
      }

      if (cityMapping) {
        // Find the city ID
        const [city] = await db.select().from(cities).where(
          sql`name = ${cityMapping.name} AND country = ${cityMapping.country}`
        );
        
        if (city) {
          await db.execute(sql`
            UPDATE activities SET city_id = ${city.id} WHERE id = ${activity.id}
          `);
          console.log(`   ✅ Atividade "${activity.title}" vinculada à cidade ${cityMapping.name}`);
        }
      } else {
        console.log(`   ⚠️ Mapeamento não encontrado para atividade: ${activityLocation}`);
      }
    }

    console.log("✅ Migração para tabela cities concluída com sucesso!");
    
    // Show summary
    const cityCount = await db.select({ count: sql`count(*)` }).from(cities);
    console.log(`📊 Total de cidades cadastradas: ${cityCount[0].count}`);

  } catch (error) {
    console.error("❌ Erro na migração:", error);
    throw error;
  }
}

// Execute migration if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToCitiesTable()
    .then(() => {
      console.log("🎉 Migração concluída!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Erro na migração:", error);
      process.exit(1);
    });
}