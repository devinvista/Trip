import { db } from "./server/db";
import { destinations, activities } from "./shared/schema";
import { eq } from "drizzle-orm";

async function testDestinationAPI() {
  console.log("🔍 Testando API de destinos e vinculação com atividades...");

  try {
    // 1. Verificar destinos disponíveis
    const allDestinations = await db.select().from(destinations).where(eq(destinations.is_active, true)).limit(5);
    console.log(`✅ Destinos disponíveis: ${allDestinations.length}`);
    console.log("Primeiros 5 destinos:", allDestinations.map(d => ({ id: d.id, name: d.name, country: d.country })));

    // 2. Verificar atividades e seus destinos
    const activitiesWithDestinations = await db
      .select({
        activity_id: activities.id,
        activity_title: activities.title,
        destination_id: activities.destination_id,
        destination_name: activities.destination_name,
        city: activities.city,
        country: activities.country
      })
      .from(activities)
      .limit(5);

    console.log(`✅ Atividades: ${activitiesWithDestinations.length}`);
    activitiesWithDestinations.forEach(activity => {
      console.log(`- ${activity.activity_title}: destino_id=${activity.destination_id}, cidade=${activity.city}, país=${activity.country}`);
    });

    // 3. Test helper functions
    const { validateDestination, getDestinationForActivity } = await import("./server/activity-destination-helper");
    
    if (allDestinations.length > 0) {
      const firstDestination = allDestinations[0];
      console.log(`🔍 Testando validação do destino ${firstDestination.id} (${firstDestination.name})...`);
      
      const isValid = await validateDestination(firstDestination.id);
      console.log(`✅ Destino válido: ${isValid}`);
      
      const destinationData = await getDestinationForActivity(firstDestination.id);
      console.log("📍 Dados do destino:", destinationData);
    }

    console.log("\n✅ Teste da API de destinos concluído com sucesso!");

  } catch (error) {
    console.error("❌ Erro no teste:", error);
  }

  process.exit(0);
}

testDestinationAPI();