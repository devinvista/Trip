#!/usr/bin/env tsx

import { db } from "./db";
import { sql } from "drizzle-orm";

async function fixDestinationSimple() {
  console.log("🚀 Corrigindo referências destination_id de forma simples...");
  
  try {
    // 1. Primeiro, garantir que temos o Rio de Janeiro
    console.log("📍 Verificando destino Rio de Janeiro...");
    const rioCheck = await db.execute(sql`SELECT id FROM destinations WHERE name = 'Rio de Janeiro'`);
    
    let rioId: number;
    if (rioCheck.length === 0) {
      console.log("📍 Criando Rio de Janeiro...");
      await db.execute(sql`
        INSERT INTO destinations (name, state, country, country_type, continent, region, is_active, created_at)
        VALUES ('Rio de Janeiro', 'RJ', 'Brasil', 'nacional', 'América do Sul', 'Sudeste', true, NOW())
      `);
      const newRio = await db.execute(sql`SELECT id FROM destinations WHERE name = 'Rio de Janeiro'`);
      rioId = (newRio[0] as any).id;
    } else {
      rioId = (rioCheck[0] as any).id;
    }
    
    console.log(`✅ Rio de Janeiro ID: ${rioId}`);
    
    // 2. Corrigir trips órfãos de forma simples
    console.log("🔧 Corrigindo trips órfãos...");
    await db.execute(sql.raw(`UPDATE trips SET destination_id = ${rioId} WHERE destination_id = 999 OR destination_id = 998 OR destination_id NOT IN (SELECT id FROM destinations)`));
    console.log("✅ Trips corrigidos");
    
    // 3. Corrigir activities órfãos de forma simples
    console.log("🔧 Corrigindo activities órfãos...");
    await db.execute(sql.raw(`UPDATE activities SET destination_id = ${rioId} WHERE destination_id = 999 OR destination_id = 998 OR destination_id NOT IN (SELECT id FROM destinations)`));
    console.log("✅ Activities corrigidos");
    
    // 4. Tentar adicionar foreign keys
    console.log("🔗 Adicionando foreign keys...");
    
    try {
      await db.execute(sql.raw(`ALTER TABLE trips ADD CONSTRAINT trips_destinations_fk FOREIGN KEY (destination_id) REFERENCES destinations(id)`));
      console.log("✅ FK trips adicionada");
    } catch (e: any) {
      console.log("ℹ️ FK trips:", e.message.substring(0, 50));
    }
    
    try {
      await db.execute(sql.raw(`ALTER TABLE activities ADD CONSTRAINT activities_destinations_fk FOREIGN KEY (destination_id) REFERENCES destinations(id)`));
      console.log("✅ FK activities adicionada");
    } catch (e: any) {
      console.log("ℹ️ FK activities:", e.message.substring(0, 50));
    }
    
    console.log("🎉 Migração concluída!");
    
  } catch (error) {
    console.error("❌ Erro:", error);
    throw error;
  }
}

// Executar
fixDestinationSimple()
  .then(() => {
    console.log("✅ Sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Falha:", error);
    process.exit(1);
  });