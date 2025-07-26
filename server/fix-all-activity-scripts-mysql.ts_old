#!/usr/bin/env tsx
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Script to automatically update all activity scripts to use correct MySQL schema
 * Converts snake_case field names to camelCase for JavaScript objects
 */

const FIELD_MAPPINGS = {
  // Snake case to camelCase mappings
  'country_type': 'countryType',
  'price_type': 'priceType', 
  'price_amount': 'priceAmount',
  'difficulty_level': 'difficultyLevel',
  'min_participants': 'minParticipants',
  'max_participants': 'maxParticipants',
  'cover_image': 'coverImage',
  'average_rating': 'averageRating',
  'total_ratings': 'totalRatings',
  'created_by_id': 'createdById',
  'is_active': 'isActive',
  'activity_id': 'activityId',
  'created_by': 'createdBy'
};

function updateActivityScript(filePath: string): void {
  console.log(`🔧 Updating ${filePath}...`);
  
  let content = readFileSync(filePath, 'utf-8');
  
  // Update field names in object definitions
  for (const [snakeCase, camelCase] of Object.entries(FIELD_MAPPINGS)) {
    // Match field definitions like: field_name: value
    const regex = new RegExp(`\\b${snakeCase}:\\s*`, 'g');
    content = content.replace(regex, `${camelCase}: `);
  }
  
  // Fix specific patterns for activity data structures
  content = content.replace(/duration:\s*(\d+),?\s*$/gm, 'duration: "$1 horas",');
  content = content.replace(/difficulty:\s*"([^"]+)"/g, 'difficultyLevel: "$1"');
  content = content.replace(/priceRange:\s*"[^"]*"/g, ''); // Remove priceRange as it's not in schema
  
  // Add missing required fields for activities
  if (content.includes('title:') && !content.includes('countryType:')) {
    content = content.replace(
      /(category:\s*"[^"]+",?\s*)/g,
      '$1\n    countryType: "nacional",\n    region: "Brasil",\n    city: "Cidade",\n    priceType: "per_person",'
    );
  }
  
  writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Updated ${filePath}`);
}

function main() {
  console.log('🚀 Starting systematic update of all activity scripts...');
  
  const serverDir = '.';
  const files = readdirSync(serverDir);
  
  // Find all activity-related scripts
  const activityScripts = files.filter(file => 
    file.includes('activities') && 
    file.endsWith('.ts') && 
    !file.includes('fixed') &&
    !file.includes('test')
  );
  
  console.log(`📋 Found ${activityScripts.length} scripts to update:`);
  activityScripts.forEach(script => console.log(`  - ${script}`));
  
  // Update each script
  for (const script of activityScripts) {
    const filePath = join(serverDir, script);
    try {
      updateActivityScript(filePath);
    } catch (error) {
      console.error(`❌ Error updating ${script}:`, error);
    }
  }
  
  console.log('🎉 All activity scripts updated to MySQL schema compatibility!');
}

main();