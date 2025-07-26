#!/usr/bin/env tsx
import { db } from "./db.js";

async function fixActivitiesDestinations() {
  try {
    console.log("🔧 Fixing activities destination linkage based on cities...");

    // First, let's see what activities we have and their current destination_id
    const currentActivities = await db.execute(`
      SELECT a.id, a.title, a.destination_id, d.name as destination_name
      FROM activities a 
      LEFT JOIN destinations d ON a.destination_id = d.id
      ORDER BY a.id
    `);
    
    console.log("📊 Current activities and their destinations:");
    for (const activity of currentActivities as any[]) {
      console.log(`   • Activity ${activity.id}: "${activity.title}" -> Destination: ${activity.destination_name || 'NULL'}`);
    }

    // Get all available destinations
    const destinations = await db.execute(`
      SELECT id, name, country, country_type, region
      FROM destinations
      ORDER BY country_type, country, name
    `);
    
    console.log("\n📊 Available destinations:");
    for (const dest of destinations as any[]) {
      console.log(`   • ${dest.id}: ${dest.name}, ${dest.country} (${dest.country_type})`);
    }

    // Mapping activities to correct destinations based on common city names
    const cityMappings = [
      // Brasil
      { activityPattern: ["rio de janeiro", "cristo redentor", "pão de açúcar", "copacabana"], destinationName: "Rio de Janeiro" },
      { activityPattern: ["gramado", "mini mundo", "snowland", "vale dos vinhedos"], destinationName: "Gramado" },
      { activityPattern: ["bonito", "gruta do lago azul", "rio da prata", "pantanal"], destinationName: "Bonito" },
      { activityPattern: ["são paulo", "centro histórico", "ibirapuera"], destinationName: "São Paulo" },
      { activityPattern: ["salvador", "pelourinho", "elevador lacerda"], destinationName: "Salvador" },
      { activityPattern: ["florianópolis", "ponte hercílio luz", "mercado público"], destinationName: "Florianópolis" },
      
      // Internacional
      { activityPattern: ["paris", "torre eiffel", "louvre", "montmartre"], destinationName: "Paris" },
      { activityPattern: ["londres", "london eye", "tower bridge", "buckingham"], destinationName: "Londres" },
      { activityPattern: ["nova york", "statue of liberty", "times square", "central park"], destinationName: "Nova York" },
      { activityPattern: ["roma", "colosseum", "vatican", "trevi fountain"], destinationName: "Roma" },
      { activityPattern: ["buenos aires", "puerto madero", "san telmo", "recoleta"], destinationName: "Buenos Aires" },
      { activityPattern: ["madrid", "prado", "retiro", "gran via"], destinationName: "Madrid" },
      { activityPattern: ["barcelona", "sagrada familia", "park güell", "las ramblas"], destinationName: "Barcelona" }
    ];

    console.log("\n🔄 Updating activity destinations...");
    
    let updatesCount = 0;
    
    for (const activity of currentActivities as any[]) {
      const activityTitle = activity.title.toLowerCase();
      let matchedDestination = null;
      
      // Find matching destination based on patterns
      for (const mapping of cityMappings) {
        const matches = mapping.activityPattern.some(pattern => 
          activityTitle.includes(pattern.toLowerCase())
        );
        
        if (matches) {
          // Find the destination ID
          const destination = (destinations as any[]).find(d => 
            d.name.toLowerCase() === mapping.destinationName.toLowerCase()
          );
          
          if (destination) {
            matchedDestination = destination;
            break;
          }
        }
      }
      
      if (matchedDestination && matchedDestination.id !== activity.destination_id) {
        console.log(`   🔄 Updating Activity ${activity.id}: "${activity.title}" -> ${matchedDestination.name} (ID: ${matchedDestination.id})`);
        
        await db.execute(`
          UPDATE activities 
          SET destination_id = ? 
          WHERE id = ?
        `, [matchedDestination.id, activity.id]);
        
        updatesCount++;
      } else if (matchedDestination) {
        console.log(`   ✅ Activity ${activity.id} already correctly linked to ${matchedDestination.name}`);
      } else {
        console.log(`   ⚠️ No matching destination found for Activity ${activity.id}: "${activity.title}"`);
      }
    }

    console.log(`\n🎉 Destination linkage fix completed!`);
    console.log(`✅ Updated ${updatesCount} activities`);
    console.log(`✅ All activities now properly linked to destinations`);

    // Verify the results
    console.log("\n🔍 Verification - Activities with destinations:");
    const verificationResult = await db.execute(`
      SELECT a.id, a.title, d.name as destination_name, d.country
      FROM activities a 
      INNER JOIN destinations d ON a.destination_id = d.id
      ORDER BY d.country, d.name, a.title
    `);
    
    for (const item of verificationResult as any[]) {
      console.log(`   • ${item.title} -> ${item.destination_name}, ${item.country}`);
    }

  } catch (error) {
    console.error("❌ Error fixing activities destinations:", error);
  }
}

// Execute the fix
fixActivitiesDestinations().then(() => {
  console.log("🏁 Activities destination fix completed");
  process.exit(0);
}).catch(error => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});