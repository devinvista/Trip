import { db } from "./db";
import { activities, destinations } from "../shared/schema";
import { eq } from "drizzle-orm";

async function updateActivitiesWithDestination() {
  console.log("🔄 Atualizando schema das atividades para usar destination_id...");
  
  try {
    // First, add the destination_id column if it doesn't exist
    console.log("📝 Adicionando coluna destination_id...");
    await db.execute(`
      ALTER TABLE activities 
      ADD COLUMN IF NOT EXISTS destination_id INTEGER REFERENCES destinations(id)
    `);

    // Find activities with destination_name and match them to destination IDs
    console.log("🔍 Vinculando atividades existentes aos destinos...");
    const activitiesWithoutDestinationId = await db
      .select({
        id: activities.id,
        destination_name: activities.destination_name
      })
      .from(activities)
      .where(eq(activities.destination_id, null));

    console.log(`📋 Encontradas ${activitiesWithoutDestinationId.length} atividades para vincular`);

    for (const activity of activitiesWithoutDestinationId) {
      if (!activity.destination_name) continue;

      // Find matching destination
      const destination = await db
        .select()
        .from(destinations)
        .where(eq(destinations.name, activity.destination_name))
        .limit(1);

      if (destination.length > 0) {
        const dest = destination[0];
        
        // Update activity with destination_id and inherited fields
        await db
          .update(activities)
          .set({
            destination_id: dest.id,
            destination_name: dest.name,
            city: dest.name,
            state: dest.state,
            country: dest.country,
            country_type: dest.country_type as "nacional" | "internacional",
            region: dest.region,
            continent: dest.continent
          })
          .where(eq(activities.id, activity.id));

        console.log(`✅ Atividade ${activity.id} vinculada ao destino ${dest.name}`);
      } else {
        console.log(`⚠️ Destino não encontrado para: ${activity.destination_name}`);
      }
    }

    console.log("✅ Migração das atividades concluída!");
    
  } catch (error) {
    console.error("❌ Erro na migração:", error);
  }
  
  process.exit(0);
}

updateActivitiesWithDestination();