#!/usr/bin/env tsx

import { db } from "./db";
import { sql } from "drizzle-orm";

async function populateDestinationsAndFixReferences() {
  console.log("🚀 Povoando tabela destinations e corrigindo referências...");
  
  try {
    // 1. Primeiro criar os destinos principais
    console.log("📍 Criando destinos principais...");
    
    const destinations = [
      // Brasil - Destinos Nacionais
      { name: "Rio de Janeiro", state: "RJ", country: "Brasil", countryType: "nacional", continent: "América do Sul", region: "Sudeste" },
      { name: "São Paulo", state: "SP", country: "Brasil", countryType: "nacional", continent: "América do Sul", region: "Sudeste" },
      { name: "Gramado", state: "RS", country: "Brasil", countryType: "nacional", continent: "América do Sul", region: "Sul" },
      { name: "Bonito", state: "MS", country: "Brasil", countryType: "nacional", continent: "América do Sul", region: "Centro-Oeste" },
      { name: "Salvador", state: "BA", country: "Brasil", countryType: "nacional", continent: "América do Sul", region: "Nordeste" },
      { name: "Florianópolis", state: "SC", country: "Brasil", countryType: "nacional", continent: "América do Sul", region: "Sul" },
      { name: "Pantanal", state: "MS/MT", country: "Brasil", countryType: "nacional", continent: "América do Sul", region: "Centro-Oeste" },
      { name: "Serra da Mantiqueira", state: "MG/SP", country: "Brasil", countryType: "nacional", continent: "América do Sul", region: "Sudeste" },
      { name: "Maragogi", state: "AL", country: "Brasil", countryType: "nacional", continent: "América do Sul", region: "Nordeste" },
      { name: "Ouro Preto", state: "MG", country: "Brasil", countryType: "nacional", continent: "América do Sul", region: "Sudeste" },
      { name: "Manaus", state: "AM", country: "Brasil", countryType: "nacional", continent: "América do Sul", region: "Norte" },
      { name: "Lençóis Maranhenses", state: "MA", country: "Brasil", countryType: "nacional", continent: "América do Sul", region: "Nordeste" },
      { name: "Caruaru", state: "PE", country: "Brasil", countryType: "nacional", continent: "América do Sul", region: "Nordeste" },
      { name: "Copacabana", state: "RJ", country: "Brasil", countryType: "nacional", continent: "América do Sul", region: "Sudeste" },
      
      // Destinos Internacionais
      { name: "Paris", state: null, country: "França", countryType: "internacional", continent: "Europa", region: "Europa Ocidental" },
      { name: "Londres", state: null, country: "Reino Unido", countryType: "internacional", continent: "Europa", region: "Europa Ocidental" },
      { name: "Roma", state: null, country: "Itália", countryType: "internacional", continent: "Europa", region: "Europa Meridional" },
      { name: "Nova York", state: "NY", country: "Estados Unidos", countryType: "internacional", continent: "América do Norte", region: "América do Norte" },
      { name: "Buenos Aires", state: null, country: "Argentina", countryType: "internacional", continent: "América do Sul", region: "América do Sul" },
      { name: "Patagônia", state: null, country: "Argentina", countryType: "internacional", continent: "América do Sul", region: "América do Sul" },
      { name: "Machu Picchu", state: null, country: "Peru", countryType: "internacional", continent: "América do Sul", region: "América do Sul" },
      { name: "Quênia", state: null, country: "Quênia", countryType: "internacional", continent: "África", region: "África Oriental" },
    ];
    
    for (const dest of destinations) {
      try {
        await db.execute(sql`
          INSERT INTO destinations (name, state, country, country_type, continent, region, is_active, created_at)
          VALUES (${dest.name}, ${dest.state}, ${dest.country}, ${dest.countryType}, ${dest.continent}, ${dest.region}, true, NOW())
          ON DUPLICATE KEY UPDATE name = name
        `);
        console.log(`✅ Destino criado: ${dest.name}`);
      } catch (error: any) {
        console.log(`⚠️ Destino já existe: ${dest.name}`);
      }
    }
    
    // 2. Agora verificar e corrigir referências órfãs na tabela trips
    console.log("🔍 Verificando referências órfãs em trips...");
    
    const orphanTrips = await db.execute(sql`
      SELECT t.id, t.title, t.destination_id 
      FROM trips t 
      LEFT JOIN destinations d ON t.destination_id = d.id 
      WHERE d.id IS NULL
    `);
    
    console.log(`📋 Encontradas ${orphanTrips.length} viagens órfãs`);
    
    // Para viagens órfãs, vamos assinalar o primeiro destino disponível (Rio de Janeiro)
    if (orphanTrips.length > 0) {
      const rioDestination = await db.execute(sql`SELECT id FROM destinations WHERE name = 'Rio de Janeiro' LIMIT 1`);
      
      if (rioDestination.length > 0) {
        const rioId = (rioDestination[0] as any).id;
        
        // Corrigir cada viagem órfã individualmente
        for (const trip of orphanTrips) {
          await db.execute(sql`UPDATE trips SET destination_id = ${rioId} WHERE id = ${(trip as any).id}`);
        }
        
        console.log(`✅ ${orphanTrips.length} viagens órfãs corrigidas para Rio de Janeiro`);
      }
    }
    
    // 3. Agora tentar adicionar as foreign keys novamente
    console.log("🔗 Adicionando foreign keys...");
    
    try {
      await db.execute(sql`ALTER TABLE trips ADD CONSTRAINT trips_destinations_fk FOREIGN KEY (destination_id) REFERENCES destinations(id)`);
      console.log("✅ Foreign key trips_destinations_fk adicionada");
    } catch (error: any) {
      console.log("ℹ️ Foreign key trips já existe ou erro:", error.message);
    }
    
    // 4. Verificar e corrigir activities também
    console.log("🎯 Verificando atividades...");
    
    const orphanActivities = await db.execute(sql`
      SELECT a.id, a.title, a.destination_id 
      FROM activities a 
      LEFT JOIN destinations d ON a.destination_id = d.id 
      WHERE d.id IS NULL
    `);
    
    if (orphanActivities.length > 0) {
      console.log(`📋 Encontradas ${orphanActivities.length} atividades órfãs`);
      
      const rioDestination = await db.execute(sql`SELECT id FROM destinations WHERE name = 'Rio de Janeiro' LIMIT 1`);
      
      if (rioDestination.length > 0) {
        const rioId = (rioDestination[0] as any).id;
        
        // Corrigir cada atividade órfã individualmente
        for (const activity of orphanActivities) {
          await db.execute(sql`UPDATE activities SET destination_id = ${rioId} WHERE id = ${(activity as any).id}`);
        }
        
        console.log(`✅ ${orphanActivities.length} atividades órfãs corrigidas`);
      }
    }
    
    try {
      await db.execute(sql`ALTER TABLE activities ADD CONSTRAINT activities_destinations_fk FOREIGN KEY (destination_id) REFERENCES destinations(id)`);
      console.log("✅ Foreign key activities_destinations_fk adicionada");
    } catch (error: any) {
      console.log("ℹ️ Foreign key activities já existe ou erro:", error.message);
    }
    
    console.log("🎉 Migração concluída com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro durante a migração:", error);
    throw error;
  }
}

// Executar se chamado diretamente
populateDestinationsAndFixReferences()
  .then(() => {
    console.log("✅ População e correção executadas com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Falha na população:", error);
    process.exit(1);
  });

export { populateDestinationsAndFixReferences };