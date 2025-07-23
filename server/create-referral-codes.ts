import { db } from "./db";
import { referralCodes } from "@shared/schema";
import { eq } from "drizzle-orm";

async function createReferralCodes() {
  try {
    console.log('🎫 Criando códigos de indicação para teste...');

    const codes = [
      { code: 'BETA2025', maxUses: 100 },
      { code: 'VIAJANTE', maxUses: 50 },
      { code: 'AMIGO123', maxUses: 10 },
      { code: 'TESTE', maxUses: 1 },
      { code: 'EXPLORER', maxUses: 25 },
    ];

    for (const codeData of codes) {
      // Check if code already exists
      const existing = await db.select()
        .from(referralCodes)
        .where(eq(referralCodes.code, codeData.code))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(referralCodes).values({
          code: codeData.code,
          maxUses: codeData.maxUses,
          currentUses: 0,
          isActive: true,
          createdBy: null, // System created
          expiresAt: null, // No expiration
        });
        console.log(`✅ Código criado: ${codeData.code} (${codeData.maxUses} usos)`);
      } else {
        console.log(`ℹ️ Código já existe: ${codeData.code}`);
      }
    }

    console.log('🎉 Códigos de indicação criados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar códigos de indicação:', error);
  }
}

export { createReferralCodes };