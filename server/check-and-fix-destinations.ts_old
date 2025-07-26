#!/usr/bin/env tsx

import { db } from "./db";
import { sql } from "drizzle-orm";

async function checkAndFixDestinations() {
  console.log("🔍 Checando estrutura atual...");
  
  try {
    // 1. Verificar se tabela destinations existe
    console.log("📋 Verificando tabela destinations...");
    const checkTable = await db.execute(sql`SHOW TABLES LIKE 'destinations'`);
    console.log("Tabelas encontradas:", checkTable);
    
    // 2. Se não existir, criar
    if (checkTable.length === 0) {
      console.log("📝 Criando tabela destinations...");
      await db.execute(sql`
        CREATE TABLE destinations (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          state VARCHAR(10),
          country VARCHAR(100) NOT NULL,
          country_type VARCHAR(20) NOT NULL,
          continent VARCHAR(50) NOT NULL,
          region VARCHAR(100) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    
    // 3. Verificar se Rio de Janeiro existe
    console.log("📍 Verificando Rio de Janeiro...");
    const rioCheck = await db.execute(sql`SELECT * FROM destinations WHERE name = 'Rio de Janeiro'`);
    console.log("Rio de Janeiro:", rioCheck);
    
    if (rioCheck.length === 0) {
      console.log("➕ Inserindo Rio de Janeiro...");
      await db.execute(sql`
        INSERT INTO destinations (name, state, country, country_type, continent, region, is_active)
        VALUES ('Rio de Janeiro', 'RJ', 'Brasil', 'nacional', 'América do Sul', 'Sudeste', true)
      `);
    }
    
    // 4. Pegar ID do Rio
    const rioResult = await db.execute(sql`SELECT id FROM destinations WHERE name = 'Rio de Janeiro' LIMIT 1`);
    console.log("Resultado bruto Rio:", rioResult);
    
    // O resultado vem como [rows, metadata] - pegar rows[0]
    const rows = rioResult[0] as any[];
    const rioRow = rows?.[0];
    const rioId = rioRow?.id;
    
    console.log("🎯 Rio ID:", rioId);
    
    if (!rioId) {
      throw new Error("Não foi possível obter ID do Rio de Janeiro");
    }
    
    // 5. Verificar trips órfãos
    console.log("🔍 Verificando trips órfãos...");
    const orphanTrips = await db.execute(sql`
      SELECT t.id, t.title, t.destination_id 
      FROM trips t 
      LEFT JOIN destinations d ON t.destination_id = d.id 
      WHERE d.id IS NULL
      LIMIT 5
    `);
    
    console.log(`📊 Trips órfãos encontrados: ${orphanTrips.length}`);
    
    // 6. Corrigir trips órfãos um por um
    if (orphanTrips.length > 0) {
      // Como os dados vêm em formato [rows, metadata], precisamos acessar corretamente
      const tripRows = orphanTrips[0] as any[];
      for (const tripData of tripRows) {
        console.log(`🔧 Corrigindo trip ID ${tripData.id}: ${tripData.title}`);
        await db.execute(sql`UPDATE trips SET destination_id = ${rioId} WHERE id = ${tripData.id}`);
      }
      console.log("✅ Trips órfãos corrigidos");
    }
    
    // 7. Verificar activities órfãos
    console.log("🔍 Verificando activities órfãos...");
    const orphanActivities = await db.execute(sql`
      SELECT a.id, a.title, a.destination_id 
      FROM activities a 
      LEFT JOIN destinations d ON a.destination_id = d.id 
      WHERE d.id IS NULL
      LIMIT 5
    `);
    
    console.log(`📊 Activities órfãos encontrados: ${orphanActivities.length}`);
    
    // 8. Corrigir activities órfãos um por um
    if (orphanActivities.length > 0) {
      // Como os dados vêm em formato [rows, metadata], precisamos acessar corretamente
      const activityRows = orphanActivities[0] as any[];
      for (const activityData of activityRows) {
        console.log(`🔧 Corrigindo activity ID ${activityData.id}: ${activityData.title}`);
        await db.execute(sql`UPDATE activities SET destination_id = ${rioId} WHERE id = ${activityData.id}`);
      }
      console.log("✅ Activities órfãos corrigidos");
    }
    
    // 9. Tentar adicionar foreign keys se ainda não existem
    console.log("🔗 Verificando foreign keys...");
    
    try {
      await db.execute(sql`ALTER TABLE trips ADD CONSTRAINT trips_destinations_fk FOREIGN KEY (destination_id) REFERENCES destinations(id)`);
      console.log("✅ FK trips adicionada");
    } catch (e: any) {
      if (e.message.includes('already exists') || e.message.includes('duplicate')) {
        console.log("ℹ️ FK trips já existe");
      } else {
        console.log("⚠️ Erro FK trips:", e.message.substring(0, 100));
      }
    }
    
    try {
      await db.execute(sql`ALTER TABLE activities ADD CONSTRAINT activities_destinations_fk FOREIGN KEY (destination_id) REFERENCES destinations(id)`);
      console.log("✅ FK activities adicionada");
    } catch (e: any) {
      if (e.message.includes('already exists') || e.message.includes('duplicate')) {
        console.log("ℹ️ FK activities já existe");
      } else {
        console.log("⚠️ Erro FK activities:", e.message.substring(0, 100));
      }
    }
    
    console.log("🎉 Verificação e correção concluídas!");
    
  } catch (error) {
    console.error("❌ Erro:", error);
    throw error;
  }
}

// Executar
checkAndFixDestinations()
  .then(() => {
    console.log("✅ Sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Falha:", error);
    process.exit(1);
  });