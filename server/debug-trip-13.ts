import { db } from './db';
import { trips } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function debugTrip13() {
  try {
    const trip = await db.select().from(trips).where(eq(trips.id, 13));
    
    if (trip.length === 0) {
      console.log('Viagem 13 não encontrada');
      return;
    }
    
    console.log('=== DADOS DA VIAGEM 13 ===');
    console.log('ID:', trip[0].id);
    console.log('Título:', trip[0].title);
    console.log('Orçamento:', trip[0].budget);
    console.log('Breakdown raw:', trip[0].budgetBreakdown);
    console.log('Tipo do breakdown:', typeof trip[0].budgetBreakdown);
    
    // Tentar parsear o breakdown
    if (trip[0].budgetBreakdown) {
      try {
        const parsed = JSON.parse(trip[0].budgetBreakdown);
        console.log('Breakdown parseado:', parsed);
      } catch (e) {
        console.log('Erro ao parsear breakdown:', e);
      }
    }
    
    // Corrigir se necessário
    const correctBreakdown = {
      transport: 1680,
      accommodation: 1680,
      food: 840,
      activities: 0
    };
    
    await db.update(trips)
      .set({
        budget: 4200,
        budgetBreakdown: JSON.stringify(correctBreakdown)
      })
      .where(eq(trips.id, 13));
      
    console.log('✅ Viagem 13 corrigida com sucesso!');
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

debugTrip13();