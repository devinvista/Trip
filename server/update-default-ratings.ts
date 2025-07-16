import { db } from "./db.js";
import { users } from "../shared/schema.js";
import { eq, or } from "drizzle-orm";

async function updateDefaultRatings() {
  try {
    console.log('🔄 Atualizando avaliações padrão para 5.0...');
    
    // Update all users with 0 ratings or 0.00 average rating to 5.00
    const result = await db
      .update(users)
      .set({ 
        averageRating: "5.00"
      })
      .where(or(
        eq(users.totalRatings, 0),
        eq(users.averageRating, "0.00")
      ));

    console.log('✅ Avaliações padrão atualizadas com sucesso!');
    console.log('📊 Usuários atualizados:', result);

    // Log some users to verify
    const sampleUsers = await db
      .select({
        id: users.id,
        username: users.username,
        averageRating: users.averageRating,
        totalRatings: users.totalRatings
      })
      .from(users)
      .limit(5);

    console.log('📋 Amostra de usuários:');
    sampleUsers.forEach(user => {
      console.log(`  - ${user.username}: ${user.averageRating} (${user.totalRatings} avaliações)`);
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar avaliações padrão:', error);
  }
}

// Run the update
updateDefaultRatings().then(() => {
  console.log('🎉 Atualização concluída!');
  process.exit(0);
});