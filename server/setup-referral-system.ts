import { db } from "./db";
import { sql } from "drizzle-orm";

export async function setupReferralSystem() {
  try {
    console.log('🚀 Configurando sistema de códigos de indicação...');

    // Create referral_codes table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS referral_codes (
        id int PRIMARY KEY AUTO_INCREMENT,
        code varchar(50) NOT NULL UNIQUE,
        created_by int DEFAULT NULL,
        max_uses int DEFAULT 1 NOT NULL,
        current_uses int DEFAULT 0 NOT NULL,
        is_active boolean DEFAULT true NOT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        expires_at timestamp DEFAULT NULL,
        INDEX idx_code (code),
        INDEX idx_active (is_active)
      )
    `);

    // Create interest_list table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS interest_list (
        id int PRIMARY KEY AUTO_INCREMENT,
        full_name varchar(255) NOT NULL,
        email varchar(255) NOT NULL UNIQUE,
        phone varchar(20) NOT NULL,
        referral_code varchar(50) DEFAULT NULL,
        status varchar(50) DEFAULT 'pending' NOT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        INDEX idx_email (email),
        INDEX idx_status (status)
      )
    `);

    console.log('✅ Tabelas criadas com sucesso!');

    // Insert default referral codes
    const codes = [
      { code: 'BETA2025', maxUses: 100 },
      { code: 'VIAJANTE', maxUses: 50 },
      { code: 'AMIGO123', maxUses: 10 },
      { code: 'TESTE', maxUses: 1 },
      { code: 'EXPLORER', maxUses: 25 },
    ];

    for (const codeData of codes) {
      await db.execute(sql`
        INSERT IGNORE INTO referral_codes (code, max_uses, current_uses, is_active, created_at) 
        VALUES (${codeData.code}, ${codeData.maxUses}, 0, 1, NOW())
      `);
    }

    console.log('✅ Códigos de indicação criados com sucesso!');
    console.log('📋 Códigos disponíveis:', codes.map(c => c.code).join(', '));

    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar sistema de indicação:', error);
    return false;
  }
}