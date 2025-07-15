import { db } from "./db.js";
import { trips, tripParticipants } from "@shared/schema.js";
import { eq, count } from "drizzle-orm";

/**
 * Synchronizes the currentParticipants field with actual accepted participants count
 * This ensures data consistency across the application
 */
export async function syncParticipantsCount() {
  console.log('🔄 Sincronizando contagem de participantes...');
  
  try {
    // Get all trips
    const allTrips = await db.select({
      id: trips.id,
      title: trips.title,
      currentParticipants: trips.currentParticipants
    }).from(trips);

    console.log(`📊 Verificando ${allTrips.length} viagens...`);

    let updatedCount = 0;

    for (const trip of allTrips) {
      // Count actual accepted participants for this trip
      const [result] = await db
        .select({ count: count() })
        .from(tripParticipants)
        .where(eq(tripParticipants.tripId, trip.id))
        .where(eq(tripParticipants.status, 'accepted'));

      const realParticipantsCount = result.count;

      // Only update if counts don't match
      if (trip.currentParticipants !== realParticipantsCount) {
        await db
          .update(trips)
          .set({ currentParticipants: realParticipantsCount })
          .where(eq(trips.id, trip.id));

        console.log(`✅ Viagem "${trip.title}" atualizada: ${trip.currentParticipants} → ${realParticipantsCount} participantes`);
        updatedCount++;
      }
    }

    if (updatedCount === 0) {
      console.log('✅ Todas as contagens de participantes já estão sincronizadas');
    } else {
      console.log(`✅ Sincronização concluída: ${updatedCount} viagens atualizadas`);
    }

  } catch (error) {
    console.error('❌ Erro ao sincronizar participantes:', error);
    throw error;
  }
}

/**
 * Updates currentParticipants for a specific trip based on accepted participants
 */
export async function syncTripParticipants(tripId: number) {
  try {
    const [result] = await db
      .select({ count: count() })
      .from(tripParticipants)
      .where(eq(tripParticipants.tripId, tripId))
      .where(eq(tripParticipants.status, 'accepted'));

    const realParticipantsCount = result.count;

    await db
      .update(trips)
      .set({ currentParticipants: realParticipantsCount })
      .where(eq(trips.id, tripId));

    console.log(`✅ Viagem ${tripId} sincronizada: ${realParticipantsCount} participantes aceitos`);
    
    return realParticipantsCount;
  } catch (error) {
    console.error(`❌ Erro ao sincronizar viagem ${tripId}:`, error);
    throw error;
  }
}