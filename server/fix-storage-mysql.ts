#!/usr/bin/env tsx
import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';
import { sql } from 'drizzle-orm';

/**
 * Script to fix storage.ts MySQL compatibility issues and fill missing activity data
 */

async function fixStorageMySQL() {
  console.log('🔧 Fixing storage.ts MySQL compatibility issues...');
  
  // Check activities without proposals
  const activitiesWithoutProposals = await db.select({
    id: activities.id,
    title: activities.title,
    location: activities.location
  }).from(activities)
  .leftJoin(activityBudgetProposals, sql`${activities.id} = ${activityBudgetProposals.activityId}`)
  .where(sql`${activityBudgetProposals.activityId} IS NULL`)
  .limit(10);
  
  console.log(`📊 Found ${activitiesWithoutProposals.length} activities without proposals:`);
  activitiesWithoutProposals.forEach(a => console.log(`- ${a.title} (ID: ${a.id}) - ${a.location}`));
  
  // Check for activities with missing fields
  const activitiesWithMissingFields = await db.select().from(activities)
    .where(sql`${activities.countryType} IS NULL OR ${activities.region} IS NULL OR ${activities.priceType} IS NULL`)
    .limit(10);
  
  console.log(`📊 Found ${activitiesWithMissingFields.length} activities with missing required fields`);
  
  // Update activities with missing fields
  if (activitiesWithMissingFields.length > 0) {
    for (const activity of activitiesWithMissingFields) {
      const updates: any = {};
      
      if (!activity.countryType) {
        updates.countryType = activity.location?.includes('Argentina') || activity.location?.includes('EUA') || 
                             activity.location?.includes('Reino Unido') || activity.location?.includes('Itália') ? 
                             'internacional' : 'nacional';
      }
      
      if (!activity.region) {
        if (activity.location?.includes('Argentina')) updates.region = 'América do Sul';
        else if (activity.location?.includes('EUA')) updates.region = 'América do Norte';
        else if (activity.location?.includes('Reino Unido')) updates.region = 'Europa';
        else if (activity.location?.includes('Itália')) updates.region = 'Europa';
        else updates.region = 'Brasil';
      }
      
      if (!activity.priceType) {
        updates.priceType = 'per_person';
      }
      
      if (Object.keys(updates).length > 0) {
        await db.update(activities).set(updates).where(sql`id = ${activity.id}`);
        console.log(`✅ Updated activity ${activity.id}: ${activity.title}`);
      }
    }
  }
  
  console.log('🎉 Storage MySQL fixes completed!');
}

fixStorageMySQL().catch(console.error);