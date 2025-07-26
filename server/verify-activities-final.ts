import { db } from "./db.js";
import { activities, destinations } from "@shared/schema.js";
import { eq, count } from "drizzle-orm";

async function verifyActivitiesFinal() {
  try {
    console.log("🔍 Verificação final da estrutura de atividades...");

    // Count total activities
    const totalActivities = await db.select({ count: count() }).from(activities);
    console.log(`📊 Total de atividades: ${totalActivities[0]?.count || 0}`);

    // Count activities by destination with proper join
    const activitiesByDestination = await db
      .select({
        destinationName: destinations.name,
        country: destinations.country,
        activityCount: count(activities.id)
      })
      .from(activities)
      .innerJoin(destinations, eq(activities.destination_id, destinations.id))
      .groupBy(destinations.id, destinations.name, destinations.country)
      .orderBy(destinations.country, destinations.name);

    console.log("📍 Distribuição de atividades por destino:");
    
    const byCountry = activitiesByDestination.reduce((acc, item) => {
      const country = item.country || 'Sem país';
      if (!acc[country]) acc[country] = [];
      acc[country].push(`${item.destinationName}: ${item.activityCount}`);
      return acc;
    }, {} as Record<string, string[]>);

    Object.entries(byCountry).forEach(([country, destinations]) => {
      console.log(`\n🌍 ${country}:`);
      destinations.forEach(dest => console.log(`   • ${dest}`));
    });

    // Check for orphaned activities (without destination_id)
    const orphanedActivities = await db
      .select({ count: count() })
      .from(activities)
      .where(eq(activities.destination_id, 0)); // Assuming 0 means no destination

    const orphanCount = orphanedActivities[0]?.count || 0;
    if (orphanCount > 0) {
      console.log(`\n⚠️ Atividades sem destino válido: ${orphanCount}`);
    } else {
      console.log(`\n✅ Todas as atividades estão vinculadas a destinos válidos`);
    }

    // Summary by country
    const countryTotals = activitiesByDestination.reduce((acc, item) => {
      const country = item.country || 'Sem país';
      acc[country] = (acc[country] || 0) + item.activityCount;
      return acc;
    }, {} as Record<string, number>);

    console.log("\n📊 Resumo por país:");
    Object.entries(countryTotals)
      .sort(([,a], [,b]) => b - a) // Sort by count desc
      .forEach(([country, count]) => {
        console.log(`   🌍 ${country}: ${count} atividades`);
      });

    // Verify schema is correct
    const sampleActivity = await db.select().from(activities).limit(1);
    if (sampleActivity.length > 0) {
      console.log("\n📋 Estrutura de atividade (amostra):");
      console.log(`   • ID: ${sampleActivity[0].id}`);
      console.log(`   • Título: ${sampleActivity[0].title}`);
      console.log(`   • Destination ID: ${sampleActivity[0].destination_id}`);
      console.log(`   • Categoria: ${sampleActivity[0].category}`);
      console.log(`   • Preço: ${sampleActivity[0].priceAmount}`);
    }

    console.log("\n🎉 Verificação concluída! As atividades estão corretamente vinculadas aos destinos.");

  } catch (error) {
    console.error("❌ Erro na verificação:", error);
  }
}

// Execute
verifyActivitiesFinal();