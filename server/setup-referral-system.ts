import { db } from "./db";
import { referralCodes } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function setupReferralSystem() {
  try {
    console.log('🚀 Configurando sistema de códigos de indicação...');

    // The tables are already created by Drizzle schema
    console.log('✅ Tabelas disponíveis no schema PostgreSQL!');

    // Insert default referral codes using Drizzle ORM
    const codes = [
      { code: 'BETA2025', max_uses: 100 },
      { code: 'VIAJANTE', max_uses: 50 },
      { code: 'AMIGO123', max_uses: 10 },
      { code: 'TESTE', max_uses: 1 },
      { code: 'EXPLORER', max_uses: 25 },
      { code: 'PARTIU-TOM01', max_uses: 50 },
      { code: 'PARTIU-MARIA01', max_uses: 50 },
    ];

    for (const codeData of codes) {
      try {
        // Check if code already exists
        const [existingCode] = await db
          .select()
          .from(referralCodes)
          .where(eq(referralCodes.code, codeData.code));

        if (!existingCode) {
          await db.insert(referralCodes).values({
            code: codeData.code,
            max_uses: codeData.max_uses,
            current_uses: 0,
            is_active: true,
          });
          console.log(`✅ Código ${codeData.code} criado`);
        } else {
          console.log(`ℹ️ Código ${codeData.code} já existe`);
        }
      } catch (error) {
        console.log(`⚠️ Erro ao criar código ${codeData.code}:`, error);
      }
    }

    console.log('✅ Códigos de indicação configurados!');
    console.log('📋 Códigos disponíveis:', codes.map(c => c.code).join(', '));

    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar sistema de indicação:', error);
    return false;
  }
}