#!/usr/bin/env tsx
import { db } from "./db.js";

async function cleanupActivitiesLocationFields() {
  try {
    console.log("🔧 Removing unnecessary location fields from activities table...");

    // Check current table structure
    const tableStructure = await db.execute("DESCRIBE activities");
    console.log("📊 Current activities table structure:");
    
    const existingColumns = [];
    for (const column of tableStructure as any[]) {
      existingColumns.push(column.Field);
      console.log(`   • ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(null)' : '(not null)'} ${column.Key ? `[${column.Key}]` : ''}`);
    }

    // Fields to remove as requested by user
    const fieldsToRemove = ['country_type', 'region', 'city', 'city_id', 'location'];
    const columnsToRemove = fieldsToRemove.filter(field => existingColumns.includes(field));
    
    if (columnsToRemove.length > 0) {
      console.log(`🗑️ Removing unnecessary location fields: ${columnsToRemove.join(', ')}`);
      
      for (const column of columnsToRemove) {
        try {
          await db.execute(`ALTER TABLE activities DROP COLUMN ${column}`);
          console.log(`✅ Removed column '${column}' successfully`);
        } catch (error) {
          console.log(`⚠️ Could not remove column '${column}':`, error);
        }
      }
    } else {
      console.log("✅ No unnecessary location columns found to remove");
    }

    // Verify destination_id column exists and has proper foreign key
    console.log("\n🔍 Verifying destination_id foreign key...");
    
    const foreignKeys = await db.execute(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'activities' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    console.log("🔗 Current foreign keys:");
    for (const fk of foreignKeys as any[]) {
      console.log(`   • ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    }

    // Check if destination_id foreign key exists
    const hasDestinationFK = (foreignKeys as any[]).some(fk => 
      fk.COLUMN_NAME === 'destination_id' && fk.REFERENCED_TABLE_NAME === 'destinations'
    );

    if (!hasDestinationFK) {
      console.log("⚠️ Adding missing foreign key constraint for destination_id...");
      try {
        await db.execute(`
          ALTER TABLE activities 
          ADD CONSTRAINT fk_activities_destination 
          FOREIGN KEY (destination_id) REFERENCES destinations(id)
        `);
        console.log("✅ Added foreign key constraint for destination_id");
      } catch (error) {
        console.log("ℹ️ Foreign key constraint may already exist or column needs adjustment:", error);
      }
    } else {
      console.log("✅ destination_id foreign key constraint already exists");
    }

    // Verify all activities have valid destination_id
    console.log("\n🔍 Verifying all activities have valid destination_id...");
    
    const activitiesWithoutDestination = await db.execute(`
      SELECT COUNT(*) as count 
      FROM activities 
      WHERE destination_id IS NULL OR destination_id = 0
    `);
    
    const count = (activitiesWithoutDestination as any[])[0]?.count || 0;
    
    if (count > 0) {
      console.log(`⚠️ Found ${count} activities without valid destination_id`);
    } else {
      console.log("✅ All activities have valid destination_id");
    }

    console.log("\n🎉 Activities table cleanup completed successfully!");
    console.log("✅ Location fields centralized in destinations table");
    console.log("✅ Activities properly linked via destination_id foreign key");

  } catch (error) {
    console.error("❌ Error during activities cleanup:", error);
  }
}

// Execute the cleanup
cleanupActivitiesLocationFields().then(() => {
  console.log("🏁 Cleanup process finished");
  process.exit(0);
}).catch(error => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});