import { db } from "./db";
import { activities } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

// Mapping from old categories to new standardized categories
const categoryMapping: { [key: string]: string } = {
  // Current database categories -> New standardized categories
  "adventure": "adventure",
  "cultural": "culture", 
  "food_tours": "food",
  "hiking": "nature", // Hiking becomes part of nature
  "nature": "nature",
  "pontos_turisticos": "sightseeing",
  "Pontos Turísticos": "sightseeing", // Handle case variations
  "water_sports": "adventure", // Water sports become part of adventure
  "wildlife": "nature", // Wildlife becomes part of nature
  
  // Legacy categories that might exist
  "food": "food",
  "culture": "culture",
  "sightseeing": "sightseeing",
  "shopping": "shopping",
  "nightlife": "nightlife",
  "wellness": "wellness",
  "other": "other"
};

async function updateActivityCategories() {
  console.log("🔄 Atualizando categorias de atividades...");
  
  try {
    // Get all activities with their current categories
    const allActivities = await db.select({
      id: activities.id,
      title: activities.title,
      category: activities.category
    }).from(activities);
    
    console.log(`📋 Encontradas ${allActivities.length} atividades para atualizar`);
    
    let updatedCount = 0;
    
    for (const activity of allActivities) {
      const oldCategory = activity.category;
      const newCategory = categoryMapping[oldCategory] || "other";
      
      if (oldCategory !== newCategory) {
        await db.update(activities)
          .set({ category: newCategory })
          .where(eq(activities.id, activity.id));
        
        console.log(`✅ Atividade "${activity.title}": ${oldCategory} → ${newCategory}`);
        updatedCount++;
      } else {
        console.log(`⏭️  Atividade "${activity.title}": mantendo categoria "${oldCategory}"`);
      }
    }
    
    console.log(`\n🎉 Atualização concluída! ${updatedCount} atividades foram atualizadas.`);
    
    // Show final category distribution
    const categoryStats = await db.select({
      category: activities.category,
      count: sql<number>`count(*)`.as('count')
    }).from(activities)
      .groupBy(activities.category)
      .orderBy(activities.category);
    
    console.log("\n📊 Distribuição final de categorias:");
    categoryStats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat.count} atividades`);
    });
    
  } catch (error) {
    console.error("❌ Erro ao atualizar categorias:", error);
    throw error;
  }
}

// Execute if run directly
updateActivityCategories()
  .then(() => {
    console.log("✅ Script executado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro na execução:", error);
    process.exit(1);
  });

export { updateActivityCategories };