import { db } from './db';

async function addRatingColumns() {
  console.log('🔧 Adding missing rating system columns...');
  
  try {
    // Add columns to activity_reviews table
    await db.execute(`
      ALTER TABLE activity_reviews 
      ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
      ADD COLUMN IF NOT EXISTS report_count INT DEFAULT 0 NOT NULL
    `);
    
    // Add columns to user_ratings table
    await db.execute(`
      ALTER TABLE user_ratings 
      ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
      ADD COLUMN IF NOT EXISTS report_count INT DEFAULT 0 NOT NULL
    `);
    
    // Add columns to destination_ratings table
    await db.execute(`
      ALTER TABLE destination_ratings 
      ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
      ADD COLUMN IF NOT EXISTS report_count INT DEFAULT 0 NOT NULL
    `);
    
    console.log('✅ Rating system columns added successfully!');
  } catch (error) {
    console.error('❌ Error adding rating columns:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === new URL(import.meta.url).href) {
  addRatingColumns()
    .then(() => {
      console.log('✅ Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

export { addRatingColumns };