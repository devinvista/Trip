import { db } from "./db.js";
import { trips, tripParticipants, messages } from "@shared/schema.js";
import { eq, and, inArray } from "drizzle-orm";

async function removeDuplicateTrips() {
  try {
    console.log("🔍 Identificando viagens duplicadas...");

    // Find duplicate trips based on title, creator_id, and destination
    const allTrips = await db.select().from(trips).orderBy(trips.id);
    console.log(`📊 Total de viagens encontradas: ${allTrips.length}`);

    // Group trips by key characteristics
    const tripGroups = allTrips.reduce((groups, trip) => {
      const key = `${trip.title}_${trip.creator_id}_${trip.destination}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(trip);
      return groups;
    }, {} as Record<string, typeof allTrips>);

    // Find duplicates (groups with more than 1 trip)
    const duplicateGroups = Object.entries(tripGroups).filter(([key, trips]) => trips.length > 1);
    
    console.log(`🔄 Grupos de viagens duplicadas encontrados: ${duplicateGroups.length}`);

    let totalDuplicates = 0;
    const tripsToDelete: number[] = [];

    for (const [key, duplicateTrips] of duplicateGroups) {
      console.log(`\n📋 Grupo duplicado: ${duplicateTrips[0].title}`);
      console.log(`   • IDs: ${duplicateTrips.map(t => t.id).join(', ')}`);
      console.log(`   • Criador: ${duplicateTrips[0].creator_id}`);
      console.log(`   • Destino: ${duplicateTrips[0].destination}`);
      
      // Keep the first trip (lowest ID) and mark others for deletion
      const [keepTrip, ...deleteTrips] = duplicateTrips.sort((a, b) => a.id - b.id);
      
      console.log(`   ✅ Mantendo viagem ID: ${keepTrip.id}`);
      console.log(`   🗑️ Removendo viagens IDs: ${deleteTrips.map(t => t.id).join(', ')}`);
      
      tripsToDelete.push(...deleteTrips.map(t => t.id));
      totalDuplicates += deleteTrips.length;
    }

    if (tripsToDelete.length === 0) {
      console.log("✅ Nenhuma viagem duplicada encontrada!");
      return;
    }

    console.log(`\n🗑️ Total de viagens a serem removidas: ${tripsToDelete.length}`);

    // Remove related data first (foreign key constraints)
    
    // 1. Remove trip participants
    console.log("🔄 Removendo participantes das viagens duplicadas...");
    const deletedParticipants = await db
      .delete(tripParticipants)
      .where(inArray(tripParticipants.trip_id, tripsToDelete));
    
    console.log(`✅ ${deletedParticipants.changes} participantes removidos`);

    // 2. Remove messages
    console.log("🔄 Removendo mensagens das viagens duplicadas...");
    const deletedMessages = await db
      .delete(messages)
      .where(inArray(messages.trip_id, tripsToDelete));
    
    console.log(`✅ ${deletedMessages.changes} mensagens removidas`);

    // 3. Remove the duplicate trips
    console.log("🔄 Removendo viagens duplicadas...");
    const deletedTrips = await db
      .delete(trips)
      .where(inArray(trips.id, tripsToDelete));
    
    console.log(`✅ ${deletedTrips.changes} viagens removidas`);

    // Final verification
    const remainingTrips = await db.select().from(trips);
    console.log(`\n📊 Resultado final:`);
    console.log(`   • Viagens removidas: ${totalDuplicates}`);
    console.log(`   • Viagens restantes: ${remainingTrips.length}`);

    // Check for any remaining duplicates
    const finalGroups = remainingTrips.reduce((groups, trip) => {
      const key = `${trip.title}_${trip.creator_id}_${trip.destination}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(trip);
      return groups;
    }, {} as Record<string, typeof remainingTrips>);

    const finalDuplicates = Object.entries(finalGroups).filter(([key, trips]) => trips.length > 1);
    
    if (finalDuplicates.length === 0) {
      console.log("🎉 Todas as duplicatas foram removidas com sucesso!");
    } else {
      console.log(`⚠️ Ainda existem ${finalDuplicates.length} grupos duplicados`);
    }

    // Show summary by trip title
    const tripCounts = remainingTrips.reduce((counts, trip) => {
      counts[trip.title] = (counts[trip.title] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    console.log("\n📋 Contagem final por título de viagem:");
    Object.entries(tripCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([title, count]) => {
        const status = count > 1 ? "⚠️" : "✅";
        console.log(`   ${status} ${title}: ${count} viagem(ns)`);
      });

  } catch (error) {
    console.error("❌ Erro ao remover viagens duplicadas:", error);
  }
}

// Execute
removeDuplicateTrips();