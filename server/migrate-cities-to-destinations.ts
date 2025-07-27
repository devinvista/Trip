#!/usr/bin/env tsx

import { db } from "./db";
import { sql } from "drizzle-orm";

async function migrateCitiesToDestinations() {
  console.log("🚀 Iniciando migração de cities para destinations...");
  
  try {
    // 1. Renomear tabela cities para destinations
    console.log("📋 Renomeando tabela cities para destinations...");
    await db.execute(sql`RENAME TABLE cities TO destinations`);
    console.log("✅ Tabela renomeada com sucesso");
    
    // 2. Atualizar foreign keys na tabela trips
    console.log("🔗 Atualizando foreign keys na tabela trips...");
    
    // Primeiro remover a constraint existente
    try {
      await db.execute(sql`ALTER TABLE trips DROP FOREIGN KEY trips_ibfk_2`);
      console.log("✅ Foreign key antiga removida");
    } catch (error: any) {
      console.log("ℹ️ Foreign key trips_ibfk_2 não encontrada, continuando...");
    }
    
    // Renomear coluna city_id para destination_id
    await db.execute(sql`ALTER TABLE trips CHANGE COLUMN city_id destination_id INT NOT NULL`);
    console.log("✅ Coluna city_id renomeada para destination_id");
    
    // Adicionar nova foreign key
    await db.execute(sql`ALTER TABLE trips ADD CONSTRAINT trips_destinations_fk FOREIGN KEY (destination_id) REFERENCES destinations(id)`);
    console.log("✅ Nova foreign key adicionada");
    
    // 3. Atualizar foreign keys na tabela activities
    console.log("🎯 Atualizando foreign keys na tabela activities...");
    
    // Verificar se a coluna city_id existe
    try {
      await db.execute(sql`ALTER TABLE activities CHANGE COLUMN city_id destination_id INT NOT NULL`);
      console.log("✅ Coluna city_id em activities renomeada para destination_id");
      
      // Adicionar foreign key se não existir
      await db.execute(sql`ALTER TABLE activities ADD CONSTRAINT activities_destinations_fk FOREIGN KEY (destination_id) REFERENCES destinations(id)`);
      console.log("✅ Foreign key adicionada em activities");
    } catch (error: any) {
      console.log("ℹ️ Coluna city_id em activities não encontrada ou já migrada:", error.message);
    }
    
    // 4. Atualizar tabela destination_ratings se existir
    console.log("⭐ Atualizando tabela de ratings...");
    try {
      await db.execute(sql`RENAME TABLE city_ratings TO destination_ratings`);
      console.log("✅ Tabela city_ratings renomeada para destination_ratings");
      
      await db.execute(sql`ALTER TABLE destination_ratings CHANGE COLUMN city_id destination_id INT NOT NULL`);
      console.log("✅ Coluna em destination_ratings atualizada");
    } catch (error) {
      console.log("ℹ️ Tabela city_ratings não encontrada:", error.message);
    }
    
    console.log("🎉 Migração concluída com sucesso!");
    console.log("📝 Resumo das mudanças:");
    console.log("   - cities → destinations");
    console.log("   - city_id → destination_id em todas as tabelas");
    console.log("   - Foreign keys atualizadas");
    
  } catch (error) {
    console.error("❌ Erro durante a migração:", error);
    throw error;
  }
}

// Executar se chamado diretamente
migrateCitiesToDestinations()
  .then(() => {
    console.log("✅ Migração executada com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Falha na migração:", error);
    process.exit(1);
  });

export { migrateCitiesToDestinations };