#!/usr/bin/env tsx
import { db } from "./db.js";

async function checkDatabaseInfo() {
  try {
    console.log("🔍 Checking database connection and basic info...");
    
    // Simple test query
    const result = await db.execute("SELECT 1 as test");
    console.log("✅ Database connection successful:", result);
    
    // Check tables
    const tables = await db.execute("SHOW TABLES");
    console.log("📊 Available tables:");
    for (const table of tables as any[]) {
      const tableName = Object.values(table)[0];
      console.log(`   • ${tableName}`);
    }

    // Check activities table exists and structure
    try {
      const activitiesInfo = await db.execute("SHOW COLUMNS FROM activities");
      console.log("\n📊 Activities table columns:");
      for (const column of activitiesInfo as any[]) {
        console.log(`   • ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'}`);
      }
    } catch (error) {
      console.log("❌ Activities table error:", error);
    }

    // Check destinations table
    try {
      const destinationsInfo = await db.execute("SHOW COLUMNS FROM destinations");
      console.log("\n📊 Destinations table columns:");
      for (const column of destinationsInfo as any[]) {
        console.log(`   • ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'}`);
      }
    } catch (error) {
      console.log("❌ Destinations table error:", error);
    }

    // Quick count check
    try {
      const countResult = await db.execute("SELECT COUNT(*) as count FROM activities");
      console.log(`\n📊 Activities count: ${Object.values(countResult[0] as any)[0]}`);
    } catch (error) {
      console.log("❌ Count error:", error);
    }

  } catch (error) {
    console.error("❌ Database check error:", error);
  }
}

checkDatabaseInfo().then(() => {
  console.log("🏁 Database check completed");
  process.exit(0);
}).catch(error => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});