import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function fixUserVerificationStatus() {
  try {
    // Update verification status for test users
    const testUsers = ['tom', 'maria', 'carlos'];
    
    for (const username of testUsers) {
      await db.update(users)
        .set({ isVerified: true, averageRating: 5 })
        .where(eq(users.username, username));
      
      console.log(`✅ Status de verificação corrigido para ${username}`);
    }
  } catch (error) {
    console.log("⚠️ Erro ao corrigir status de verificação:", error);
  }
}