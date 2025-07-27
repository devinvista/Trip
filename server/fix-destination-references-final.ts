#!/usr/bin/env tsx

import { db } from "./db";
import { sql } from "drizzle-orm";

async function fixDestinationReferences() {
  console.log("🚀 Corrigindo referências de destination_id...");
  
  try {
    // 1. Verificar qual destination ID usar (Rio de Janeiro)
    const rioCheck = await db.execute(sql`SELECT id FROM destinations WHERE name = 'Rio de Janeiro' LIMIT 1`);
    
    if (rioCheck.length === 0) {
      console.log("❌ Destino Rio de Janeiro não encontrado. Criando...");
      await db.execute(sql`
        INSERT INTO destinations (name, state, country, country_type, continent, region, is_active, created_at)
        VALUES ('Rio de Janeiro', 'RJ', 'Brasil', 'nacional', 'América do Sul', 'Sudeste', true, NOW())
      `);
    }
    
    const rioDestination = await db.execute(sql`SELECT id FROM destinations WHERE name = 'Rio de Janeiro' LIMIT 1`);
    const rioId = (rioDestination[0] as any).id;
    console.log(`📍 Usando Rio de Janeiro como destino padrão (ID: ${rioId})`);
    
    // 2. Corrigir trips órfãos
    console.log("🔍 Verificando trips órfãos...");
    const orphanTripsResult = await db.execute(sql`
      SELECT t.id, t.title, t.destination_id 
      FROM trips t 
      LEFT JOIN destinations d ON t.destination_id = d.id 
      WHERE d.id IS NULL
    `);
    
    console.log(`📋 Encontrados ${orphanTripsResult.length} trips órfãos`);
    
    if (orphanTripsResult.length > 0) {
      await db.execute(sql`
        UPDATE trips 
        SET destination_id = ${rioId}
        WHERE id IN (
          SELECT trip_id FROM (
            SELECT t.id as trip_id
            FROM trips t 
            LEFT JOIN destinations d ON t.destination_id = d.id 
            WHERE d.id IS NULL
          ) as orphan_trips
        )
      `);
      console.log(`✅ ${orphanTripsResult.length} trips órfãos corrigidos`);
    }
    
    // 3. Corrigir activities órfãos
    console.log("🎯 Verificando activities órfãos...");
    const orphanActivitiesResult = await db.execute(sql`
      SELECT a.id, a.title, a.destination_id 
      FROM activities a 
      LEFT JOIN destinations d ON a.destination_id = d.id 
      WHERE d.id IS NULL
    `);
    
    console.log(`📋 Encontrados ${orphanActivitiesResult.length} activities órfãos`);
    
    if (orphanActivitiesResult.length > 0) {
      await db.execute(sql`
        UPDATE activities 
        SET destination_id = ${rioId}
        WHERE id IN (
          SELECT activity_id FROM (
            SELECT a.id as activity_id
            FROM activities a 
            LEFT JOIN destinations d ON a.destination_id = d.id 
            WHERE d.id IS NULL
          ) as orphan_activities
        )
      `);
      console.log(`✅ ${orphanActivitiesResult.length} activities órfãos corrigidos`);
    }
    
    // 4. Agora tentar adicionar as foreign keys
    console.log("🔗 Adicionando foreign keys...");
    
    try {
      await db.execute(sql`ALTER TABLE trips ADD CONSTRAINT trips_destinations_fk FOREIGN KEY (destination_id) REFERENCES destinations(id)`);
      console.log("✅ Foreign key trips_destinations_fk adicionada");
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log("ℹ️ Foreign key trips_destinations_fk já existe");
      } else {
        console.log("⚠️ Erro ao adicionar FK trips:", error.message);
      }
    }
    
    try {
      await db.execute(sql`ALTER TABLE activities ADD CONSTRAINT activities_destinations_fk FOREIGN KEY (destination_id) REFERENCES destinations(id)`);
      console.log("✅ Foreign key activities_destinations_fk adicionada");
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log("ℹ️ Foreign key activities_destinations_fk já existe");
      } else {
        console.log("⚠️ Erro ao adicionar FK activities:", error.message);
      }
    }
    
    // 5. Verificação final
    console.log("🔍 Verificação final...");
    
    const finalOrphanTrips = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM trips t 
      LEFT JOIN destinations d ON t.destination_id = d.id 
      WHERE d.id IS NULL
    `);
    
    const finalOrphanActivities = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM activities a 
      LEFT JOIN destinations d ON a.destination_id = d.id 
      WHERE d.id IS NULL
    `);
    
    console.log(`📊 Trips órfãos restantes: ${(finalOrphanTrips[0] as any).count}`);
    console.log(`📊 Activities órfãos restantes: ${(finalOrphanActivities[0] as any).count}`);
    
    console.log("🎉 Migração de cities → destinations concluída com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro durante a correção:", error);
    throw error;
  }
}

// Executar se chamado diretamente
fixDestinationReferences()
  .then(() => {
    console.log("✅ Correção executada com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Falha na correção:", error);
    process.exit(1);
  });

export { fixDestinationReferences };