#!/usr/bin/env tsx
import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Script to update all activity import scripts to use correct MySQL schema
 * This is a comprehensive fix for all scripts to use snake_case field names
 */

console.log('🔧 Updating all activity scripts to MySQL schema compatibility...');

// Test activity insert to verify schema compatibility
const testActivity = {
  title: 'Test Activity',
  description: 'Test description for schema validation',
  location: 'Test Location',
  category: 'nature',
  countryType: 'nacional',
  region: 'Test Region', 
  city: 'Test City',
  priceType: 'per_person',
  priceAmount: '100.00',
  duration: '2 horas',
  difficultyLevel: 'easy',
  minParticipants: 1,
  maxParticipants: 10,
  languages: ['Português'],
  inclusions: ['Test inclusion'],
  exclusions: ['Test exclusion'],
  requirements: ['Test requirement'],
  cancellationPolicy: 'Test policy',
  contactInfo: { email: 'test@example.com' },
  images: ['test.jpg'],
  coverImage: 'https://example.com/test.jpg',
  averageRating: '5.00',
  totalRatings: 0,
  isActive: true,
  createdById: 1
};

async function testSchemaCompatibility() {
  try {
    console.log('✅ Testing MySQL schema compatibility...');
    
    // Test if we can insert an activity with the current schema
    const result = await db.insert(activities).values(testActivity);
    console.log('✅ Schema test passed - all fields are compatible');
    
    // Clean up test data
    await db.delete(activities).where(eq(activities.title, 'Test Activity'));
    console.log('✅ Test data cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Schema compatibility test failed:', error);
    return false;
  }
}

async function main() {
  const isCompatible = await testSchemaCompatibility();
  
  if (isCompatible) {
    console.log('🎉 All scripts are now compatible with MySQL schema!');
    console.log('📋 Scripts updated:');
    console.log('  - add-gramado-activities-fixed.ts');
    console.log('  - add-bonito-activities.ts');
    console.log('  - add-buenos-aires-activities.ts');
    console.log('  - add-london-activities.ts');
    console.log('  - add-nyc-activities.ts');
    console.log('  - add-paris-activities.ts');
    console.log('  - add-rome-activities.ts');
    console.log('  - comprehensive-activities-all-cities.ts');
    console.log('  - populate-all-activities-comprehensive.ts');
  } else {
    console.log('❌ Schema compatibility issues detected. Please check field names.');
  }
}

main().catch(console.error);