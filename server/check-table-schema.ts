#!/usr/bin/env tsx
import { db } from "./db.js";

async function checkTableSchema() {
  try {
    console.log("🔍 Checking current activities table structure...");
    
    const tableStructure = await db.execute("DESCRIBE activities");
    console.log("📊 Activities table columns:");
    
    for (const column of tableStructure as any[]) {
      console.log(`   • ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'} ${column.Key ? `[${column.Key}]` : ''} ${column.Default !== null ? `(default: ${column.Default})` : ''}`);
    }

    // Check destinations table
    console.log("\n🔍 Checking destinations table structure...");
    const destinationsStructure = await db.execute("DESCRIBE destinations");
    console.log("📊 Destinations table columns:");
    
    for (const column of destinationsStructure as any[]) {
      console.log(`   • ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'} ${column.Key ? `[${column.Key}]` : ''} ${column.Default !== null ? `(default: ${column.Default})` : ''}`);
    }

    // Check foreign key constraints
    console.log("\n🔗 Checking foreign key constraints...");
    const foreignKeys = await db.execute(`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY TABLE_NAME, COLUMN_NAME
    `);
    
    console.log("🔗 Foreign key constraints:");
    for (const fk of foreignKeys as any[]) {
      console.log(`   • ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    }

    // Verify data integrity
    console.log("\n🔍 Checking data integrity...");
    
    const activitiesCount = await db.execute("SELECT COUNT(*) as count FROM activities");
    const destinationsCount = await db.execute("SELECT COUNT(*) as count FROM destinations");
    const activitiesWithDestinations = await db.execute(`
      SELECT COUNT(*) as count 
      FROM activities a 
      INNER JOIN destinations d ON a.destination_id = d.id
    `);
    
    console.log(`📊 Data summary:`);
    console.log(`   • Total activities: ${(activitiesCount as any[])[0].count}`);
    console.log(`   • Total destinations: ${(destinationsCount as any[])[0].count}`);
    console.log(`   • Activities with valid destinations: ${(activitiesWithDestinations as any[])[0].count}`);

  } catch (error) {
    console.error("❌ Error checking table schema:", error);
  }
}

// Execute the check
checkTableSchema().then(() => {
  console.log("🏁 Schema check completed");
  process.exit(0);
}).catch(error => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});