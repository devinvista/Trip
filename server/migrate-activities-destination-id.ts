import { db } from "./db.js";
import { activities, destinations } from "@shared/schema.js";
import { eq, and } from "drizzle-orm";

async function migrateActivitiesToDestinationId() {
  try {
    console.log("🔄 Iniciando migração de atividades para usar destination_id...");

    // First, let's check current activity structure
    const currentActivities = await db.select().from(activities).limit(5);
    console.log("📊 Estrutura atual das atividades:", JSON.stringify(currentActivities[0], null, 2));

    // Get all activities that might need destination linking
    const allActivities = await db.select().from(activities);
    console.log(`📊 Total de atividades encontradas: ${allActivities.length}`);

    let updatedCount = 0;
    let errors = 0;

    for (const activity of allActivities) {
      try {
        // Skip if already has destination_id
        if (activity.destination_id) {
          console.log(`✅ Atividade ${activity.id} já possui destination_id: ${activity.destination_id}`);
          continue;
        }

        // Try to find matching destination based on existing location data
        // This would need to be customized based on what location fields exist
        console.log(`🔍 Processando atividade: ${activity.title}`);
        
        // For now, let's assume we need to manually map based on the activity data
        // If there are location fields, we'd use them here
        console.log(`ℹ️ Atividade ${activity.id} precisa de mapeamento manual de destino`);

      } catch (error) {
        console.error(`❌ Erro ao processar atividade ${activity.id}:`, error);
        errors++;
      }
    }

    console.log(`🎉 Migração concluída!`);
    console.log(`📊 Resultado: ${updatedCount} atividades atualizadas, ${errors} erros`);

    // Show summary of activities by destination
    const activitiesWithDestinations = await db
      .select({
        destinationId: activities.destination_id,
        destinationName: destinations.name,
        activityCount: activities.id
      })
      .from(activities)
      .leftJoin(destinations, eq(activities.destination_id, destinations.id))
      .groupBy(activities.destination_id, destinations.name);

    console.log("📍 Atividades por destino:");
    const groupedActivities = activitiesWithDestinations.reduce((acc, curr) => {
      const key = curr.destinationName || 'Sem destino';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(groupedActivities).forEach(([destination, count]) => {
      console.log(`   • ${destination}: ${count} atividades`);
    });

  } catch (error) {
    console.error("❌ Erro na migração:", error);
  }
}

// Execute the migration
migrateActivitiesToDestinationId();