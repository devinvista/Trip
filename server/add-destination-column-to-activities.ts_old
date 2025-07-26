#!/usr/bin/env tsx

import { db } from "./db";
import { sql } from "drizzle-orm";

async function addDestinationColumnToActivities() {
  console.log("🚀 Adicionando coluna destination_id à tabela activities...");
  
  try {
    // 1. Verificar se a coluna já existe
    console.log("🔍 Verificando estrutura da tabela activities...");
    const columns = await db.execute(sql`SHOW COLUMNS FROM activities LIKE 'destination_id'`);
    
    if (columns[0] && (columns[0] as any[]).length > 0) {
      console.log("ℹ️ Coluna destination_id já existe em activities");
    } else {
      console.log("➕ Adicionando coluna destination_id...");
      await db.execute(sql`ALTER TABLE activities ADD COLUMN destination_id INT NOT NULL DEFAULT 1`);
      console.log("✅ Coluna destination_id adicionada");
    }
    
    // 2. Verificar se há atividades órfãos agora
    console.log("🔍 Verificando activities órfãos...");
    const orphanActivities = await db.execute(sql`
      SELECT a.id, a.title, a.destination_id 
      FROM activities a 
      LEFT JOIN destinations d ON a.destination_id = d.id 
      WHERE d.id IS NULL
      LIMIT 5
    `);
    
    const activityRows = orphanActivities[0] as any[];
    console.log(`📊 Activities órfãos encontrados: ${activityRows.length}`);
    
    // 3. Corrigir activities órfãos se existirem
    if (activityRows.length > 0) {
      for (const activityData of activityRows) {
        console.log(`🔧 Corrigindo activity ID ${activityData.id}: ${activityData.title}`);
        await db.execute(sql`UPDATE activities SET destination_id = 1 WHERE id = ${activityData.id}`);
      }
      console.log("✅ Activities órfãos corrigidos");
    }
    
    // 4. Tentar adicionar foreign key para activities
    console.log("🔗 Adicionando foreign key para activities...");
    try {
      await db.execute(sql`ALTER TABLE activities ADD CONSTRAINT activities_destinations_fk FOREIGN KEY (destination_id) REFERENCES destinations(id)`);
      console.log("✅ FK activities_destinations_fk adicionada");
    } catch (e: any) {
      if (e.message.includes('already exists') || e.message.includes('duplicate')) {
        console.log("ℹ️ FK activities já existe");
      } else {
        console.log("⚠️ Erro FK activities:", e.message.substring(0, 100));
      }
    }
    
    console.log("🎉 Migração de activities concluída!");
    
  } catch (error) {
    console.error("❌ Erro:", error);
    throw error;
  }
}

// Executar
addDestinationColumnToActivities()
  .then(() => {
    console.log("✅ Sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Falha:", error);
    process.exit(1);
  });