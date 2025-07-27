import { db } from './db.js';
import { trips } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function debugBudget() {
  console.log('🔍 Debugging budget data for trip 13...');
  
  try {
    const [trip] = await db.select().from(trips).where(eq(trips.id, 13));
    
    if (!trip) {
      console.log('❌ Trip 13 not found');
      return;
    }
    
    console.log('📊 Trip Data:');
    console.log('- Title:', trip.title);
    console.log('- Budget:', trip.budget);
    console.log('- BudgetBreakdown type:', typeof trip.budgetBreakdown);
    console.log('- BudgetBreakdown raw:', trip.budgetBreakdown);
    console.log('- BudgetBreakdown length:', trip.budgetBreakdown?.length);
    
    if (trip.budgetBreakdown) {
      try {
        const parsed = JSON.parse(trip.budgetBreakdown);
        console.log('✅ BudgetBreakdown parsed successfully:', parsed);
        console.log('- Object keys:', Object.keys(parsed));
        console.log('- Object entries:', Object.entries(parsed));
      } catch (e: any) {
        console.log('❌ Parse error:', e.message);
        
        // Try double parsing for escaped JSON
        try {
          const doubleParsed = JSON.parse(JSON.parse(trip.budgetBreakdown));
          console.log('✅ Double-parsed successfully:', doubleParsed);
        } catch (e2: any) {
          console.log('❌ Double-parse also failed:', e2.message);
        }
      }
    } else {
      console.log('⚠️  BudgetBreakdown is null, undefined, or empty');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugBudget();