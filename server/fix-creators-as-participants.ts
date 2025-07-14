import { db } from "./db";
import { trips, tripParticipants, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Script to fix existing trips by ensuring creators are participants
export async function fixCreatorsAsParticipants() {
  console.log('🔧 Iniciando correção: adicionando criadores como participantes...');
  
  try {
    // Get all trips
    const allTrips = await db.select().from(trips);
    console.log(`📊 Encontradas ${allTrips.length} viagens para verificar`);
    
    let fixedCount = 0;
    
    for (const trip of allTrips) {
      // Check if creator is already a participant
      const existingParticipant = await db.select()
        .from(tripParticipants)
        .where(and(
          eq(tripParticipants.tripId, trip.id),
          eq(tripParticipants.userId, trip.creatorId)
        ))
        .limit(1);
      
      if (existingParticipant.length === 0) {
        // Creator is not a participant, add them
        try {
          await db.insert(tripParticipants).values({
            tripId: trip.id,
            userId: trip.creatorId,
            status: 'accepted',
            joinedAt: new Date()
          });
          
          console.log(`✅ Criador ${trip.creatorId} adicionado como participante na viagem ${trip.id}: "${trip.title}"`);
          fixedCount++;
        } catch (error) {
          console.error(`❌ Erro ao adicionar criador ${trip.creatorId} na viagem ${trip.id}:`, error);
        }
      } else {
        console.log(`ℹ️ Criador ${trip.creatorId} já é participante da viagem ${trip.id}: "${trip.title}"`);
      }
    }
    
    console.log(`🎉 Correção concluída! ${fixedCount} criadores foram adicionados como participantes.`);
    return fixedCount;
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
    throw error;
  }
}

// Execute the fix if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixCreatorsAsParticipants()
    .then((count) => {
      console.log(`✨ Script finalizado. ${count} correções aplicadas.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script falhou:', error);
      process.exit(1);
    });
}