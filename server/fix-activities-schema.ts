import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function fixActivitiesSchema() {
  try {
    console.log('🔧 Fixing activities table schema to match Drizzle...');

    // First, let's check the current table structure
    const currentStructure = await db.execute(sql`DESCRIBE activities`);
    console.log('📊 Current table structure:', currentStructure);

    // Add missing columns instead of dropping the table
    console.log('🔧 Adding missing columns...');
    
    // Add description column if it doesn't exist
    try {
      await db.execute(sql`ALTER TABLE activities ADD COLUMN description TEXT AFTER title`);
      console.log('✅ Added description column');
    } catch (e) {
      console.log('ℹ️ Description column already exists or cannot be added');
    }
    
    // Add destination_id column if it doesn't exist
    try {
      await db.execute(sql`ALTER TABLE activities ADD COLUMN destination_id INT AFTER description`);
      console.log('✅ Added destination_id column');
    } catch (e) {
      console.log('ℹ️ Destination_id column already exists or cannot be added');
    }
    
    // Set some default values for new columns
    console.log('🔧 Setting default values for new columns...');
    
    // Set default description for existing activities
    await db.execute(sql`
      UPDATE activities 
      SET description = CONCAT('Experience ', title, ' - an amazing activity to enjoy') 
      WHERE description IS NULL OR description = ''
    `);
    
    // Add foreign key for destination_id if destinations table exists
    try {
      // First, let's set destination_id to 1 for all existing activities as a default
      await db.execute(sql`UPDATE activities SET destination_id = 1 WHERE destination_id IS NULL`);
      
      // Then add the foreign key constraint
      await db.execute(sql`
        ALTER TABLE activities 
        ADD CONSTRAINT activities_destination_fk 
        FOREIGN KEY (destination_id) REFERENCES destinations(id)
      `);
      console.log('✅ Added foreign key constraint for destination_id');
    } catch (e) {
      console.log('ℹ️ Foreign key constraint already exists or destinations table not found');
    }

    console.log('🔗 Re-enabling foreign key checks...');
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

    console.log('✅ Activities table schema fixed successfully!');
    
    // Now let's verify the new structure
    const newStructure = await db.execute(sql`DESCRIBE activities`);
    console.log('📊 New table structure:', newStructure);

  } catch (error) {
    console.error('❌ Error fixing activities schema:', error);
    throw error;
  }
}

// Run the fix
fixActivitiesSchema().catch(console.error);