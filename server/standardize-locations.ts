import { db } from "./db";
import { trips, activities } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

// Script to standardize location references between trips and activities
async function standardizeLocations() {
  console.log("🗺️ Padronizando referências de localização...");
  
  // Define location mappings for consistency
  const locationMapping = {
    // Trips destinations -> Standardized format
    "Pantanal, MS": {
      city: "Pantanal",
      state: "MS",
      region: "Centro-Oeste",
      country: "Brasil",
      standardized: "Pantanal, MS"
    },
    "Salvador, BA": {
      city: "Salvador",
      state: "BA", 
      region: "Nordeste",
      country: "Brasil",
      standardized: "Salvador, BA"
    },
    "Mantiqueira, MG": {
      city: "Mantiqueira",
      state: "MG",
      region: "Sudeste", 
      country: "Brasil",
      standardized: "Mantiqueira, MG"
    },
    "Maragogi, AL": {
      city: "Maragogi",
      state: "AL",
      region: "Nordeste",
      country: "Brasil", 
      standardized: "Maragogi, AL"
    },
    "Ouro Preto, MG": {
      city: "Ouro Preto",
      state: "MG",
      region: "Sudeste",
      country: "Brasil",
      standardized: "Ouro Preto, MG"
    },
    "Manaus, AM": {
      city: "Manaus",
      state: "AM",
      region: "Norte",
      country: "Brasil",
      standardized: "Manaus, AM"
    },
    "Florianópolis, SC": {
      city: "Florianópolis",
      state: "SC",
      region: "Sul",
      country: "Brasil",
      standardized: "Florianópolis, SC"
    },
    "Gramado, RS": {
      city: "Gramado",
      state: "RS",
      region: "Sul",
      country: "Brasil",
      standardized: "Gramado, RS"
    },
    "Lençóis Maranhenses, MA": {
      city: "Lençóis Maranhenses",
      state: "MA",
      region: "Nordeste",
      country: "Brasil",
      standardized: "Lençóis Maranhenses, MA"
    },
    "Caruaru, PE": {
      city: "Caruaru",
      state: "PE",
      region: "Nordeste",
      country: "Brasil",
      standardized: "Caruaru, PE"
    },
    "Rio de Janeiro, RJ": {
      city: "Rio de Janeiro",
      state: "RJ",
      region: "Sudeste",
      country: "Brasil",
      standardized: "Rio de Janeiro, RJ"
    },
    "El Calafate, Argentina": {
      city: "El Calafate",
      state: "Santa Cruz",
      region: "Patagonia",
      country: "Argentina",
      standardized: "El Calafate, Argentina"
    },
    "Cusco, Peru": {
      city: "Cusco",
      state: "Cusco",
      region: "Andes",
      country: "Peru",
      standardized: "Cusco, Peru"
    },
    "Nairobi, Quênia": {
      city: "Nairobi",
      state: "Nairobi",
      region: "África Oriental",
      country: "Quênia",
      standardized: "Nairobi, Quênia"
    }
  };

  try {
    // Get all trips and activities
    const allTrips = await db.select().from(trips);
    const allActivities = await db.select().from(activities);

    console.log("📊 Análise atual:");
    console.log(`   Viagens: ${allTrips.length}`);
    console.log(`   Atividades: ${allActivities.length}`);

    // Update activities to match trip destinations exactly
    console.log("\n🔄 Atualizando atividades para corresponder aos destinos das viagens...");
    
    for (const trip of allTrips) {
      const mapping = locationMapping[trip.destination as keyof typeof locationMapping];
      if (!mapping) {
        console.log(`⚠️ Mapeamento não encontrado para: ${trip.destination}`);
        continue;
      }

      // Find activities that should belong to this destination
      const relatedActivities = allActivities.filter(activity => {
        // Check if activity city matches trip city
        const activityCity = activity.city || activity.location.split(',')[0].trim();
        return activityCity === mapping.city || 
               activity.location.includes(mapping.city) ||
               activity.location === mapping.standardized;
      });

      console.log(`\n📍 ${trip.destination} (${mapping.city}):`);
      console.log(`   Atividades relacionadas: ${relatedActivities.length}`);

      // Update each related activity to use standardized location
      for (const activity of relatedActivities) {
        try {
          await db.update(activities)
            .set({
              location: mapping.standardized,
              city: mapping.city,
              region: mapping.region,
              countryType: mapping.country === "Brasil" ? "nacional" : "internacional",
              updatedAt: new Date()
            })
            .where(eq(activities.id, activity.id));
          
          console.log(`   ✅ Atualizada: ${activity.title}`);
        } catch (error) {
          console.error(`   ❌ Erro ao atualizar ${activity.title}:`, error);
        }
      }
    }

    // Verify the standardization worked
    console.log("\n🔍 Verificando padronização...");
    
    for (const trip of allTrips) {
      const mapping = locationMapping[trip.destination as keyof typeof locationMapping];
      if (!mapping) continue;

      const matchingActivities = await db.select()
        .from(activities)
        .where(eq(activities.city, mapping.city));

      console.log(`📍 ${trip.destination} -> ${matchingActivities.length} atividades correspondentes`);
    }

    console.log("\n🎉 Padronização concluída com sucesso!");

  } catch (error) {
    console.error("❌ Erro durante padronização:", error);
  }
}

// Execute the function
standardizeLocations().catch(console.error);