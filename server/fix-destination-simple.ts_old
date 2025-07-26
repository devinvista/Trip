#!/usr/bin/env tsx
import { db } from "./db.js";

async function fixDestinationsSimple() {
  try {
    console.log("🔧 Simple destination fix based on activity titles...");

    // Simple mappings based on clear patterns
    const fixes = [
      // Activities with clear city references
      { pattern: "Rio de Janeiro", city: "Rio de Janeiro" },
      { pattern: "Cristo Redentor", city: "Rio de Janeiro" },
      { pattern: "Pão de Açúcar", city: "Rio de Janeiro" },
      { pattern: "Copacabana", city: "Rio de Janeiro" },
      
      { pattern: "Gramado", city: "Gramado" },
      { pattern: "Mini Mundo", city: "Gramado" },
      { pattern: "Snowland", city: "Gramado" },
      
      { pattern: "Bonito", city: "Bonito" },
      { pattern: "Gruta do Lago Azul", city: "Bonito" },
      { pattern: "Rio da Prata", city: "Bonito" },
      
      { pattern: "Paris", city: "Paris" },
      { pattern: "Torre Eiffel", city: "Paris" },
      { pattern: "Louvre", city: "Paris" },
      
      { pattern: "London", city: "Londres" },
      { pattern: "Londres", city: "Londres" },
      { pattern: "London Eye", city: "Londres" },
      { pattern: "Tower Bridge", city: "Londres" },
      
      { pattern: "New York", city: "Nova York" },
      { pattern: "Nova York", city: "Nova York" },
      { pattern: "Times Square", city: "Nova York" },
      { pattern: "Central Park", city: "Nova York" },
      
      { pattern: "Rome", city: "Roma" },
      { pattern: "Roma", city: "Roma" },
      { pattern: "Colosseum", city: "Roma" },
      { pattern: "Vatican", city: "Roma" },
      
      { pattern: "Buenos Aires", city: "Buenos Aires" },
      { pattern: "Puerto Madero", city: "Buenos Aires" }
    ];

    console.log("🔍 Getting activities and destinations...");
    
    // Get basic counts first
    const actCount = await db.execute("SELECT COUNT(*) as count FROM activities");
    const destCount = await db.execute("SELECT COUNT(*) as count FROM destinations");
    
    console.log(`📊 Found ${Object.values(actCount[0] as any)[0]} activities and ${Object.values(destCount[0] as any)[0]} destinations`);

    // Get simple activity data
    const activities = await db.execute("SELECT id, title FROM activities LIMIT 50");
    console.log(`📊 Processing ${(activities as any[]).length} activities...`);

    // Get destinations with basic info
    const destinations = await db.execute("SELECT id, name FROM destinations");
    console.log(`📊 Available destinations: ${(destinations as any[]).length}`);

    let updates = 0;
    
    for (const activity of activities as any[]) {
      const actTitle = activity.title || "";
      
      for (const fix of fixes) {
        if (actTitle.includes(fix.pattern)) {
          // Find destination
          const dest = (destinations as any[]).find(d => 
            d.name && d.name.toLowerCase().includes(fix.city.toLowerCase())
          );
          
          if (dest) {
            console.log(`🔄 Updating "${actTitle}" -> ${dest.name}`);
            
            await db.execute(
              "UPDATE activities SET destination_id = ? WHERE id = ?",
              [dest.id, activity.id]
            );
            
            updates++;
            break;
          }
        }
      }
    }

    console.log(`✅ Updated ${updates} activities`);

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

fixDestinationsSimple().then(() => {
  process.exit(0);
}).catch(error => {
  console.error("💥 Error:", error);
  process.exit(1);
});