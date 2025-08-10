import { db } from "./db";
import { activities, destinations } from "../shared/schema";
import { eq } from "drizzle-orm";

async function migrateExistingActivities() {
  console.log("🔄 Migrando atividades existentes para usar destination_id...");

  try {
    // Get activities without destination_id
    const activitiesWithoutDestination = await db
      .select()
      .from(activities)
      .where(eq(activities.destination_id, null));

    console.log(`📋 Encontradas ${activitiesWithoutDestination.length} atividades para migrar`);

    for (const activity of activitiesWithoutDestination) {
      let destinationId: number | null = null;

      // Try to match by city name
      if (activity.city) {
        const matchingDestinations = await db
          .select()
          .from(destinations)
          .where(eq(destinations.name, activity.city));

        if (matchingDestinations.length > 0) {
          destinationId = matchingDestinations[0].id;
          console.log(`✅ Atividade "${activity.title}" vinculada ao destino "${matchingDestinations[0].name}" (ID: ${destinationId})`);
        }
      }

      // If no match found by city, try by destination_name
      if (!destinationId && activity.destination_name) {
        const matchingDestinations = await db
          .select()
          .from(destinations)
          .where(eq(destinations.name, activity.destination_name));

        if (matchingDestinations.length > 0) {
          destinationId = matchingDestinations[0].id;
          console.log(`✅ Atividade "${activity.title}" vinculada ao destino "${matchingDestinations[0].name}" (ID: ${destinationId})`);
        }
      }

      // If still no match, try partial matches
      if (!destinationId) {
        const cityToSearch = activity.city || activity.destination_name;
        if (cityToSearch) {
          const allDestinations = await db.select().from(destinations);
          const fuzzyMatch = allDestinations.find(dest => 
            dest.name.toLowerCase().includes(cityToSearch.toLowerCase()) ||
            cityToSearch.toLowerCase().includes(dest.name.toLowerCase())
          );

          if (fuzzyMatch) {
            destinationId = fuzzyMatch.id;
            console.log(`🔍 Atividade "${activity.title}" vinculada por match parcial ao destino "${fuzzyMatch.name}" (ID: ${destinationId})`);
          }
        }
      }

      // Update activity with destination_id and inherited fields
      if (destinationId) {
        const { getDestinationForActivity } = await import("./activity-destination-helper");
        const destinationFields = await getDestinationForActivity(destinationId);

        await db
          .update(activities)
          .set(destinationFields)
          .where(eq(activities.id, activity.id));

        console.log(`✅ Atividade ${activity.id} atualizada com dados do destino`);
      } else {
        console.log(`⚠️ Não foi possível encontrar destino para a atividade "${activity.title}" (cidade: ${activity.city}, destino: ${activity.destination_name})`);
      }
    }

    console.log("✅ Migração das atividades concluída!");

  } catch (error) {
    console.error("❌ Erro na migração:", error);
  }

  process.exit(0);
}

migrateExistingActivities();