#!/usr/bin/env tsx
import { db } from "./db.js";

async function fixDestinationReferences() {
  try {
    console.log("🔧 Fixing activity-destination references comprehensively...");

    // First, get all activities and their current state
    const activities = await db.execute(`
      SELECT a.id, a.title, a.destination_id, d.name as current_destination
      FROM activities a 
      LEFT JOIN destinations d ON a.destination_id = d.id
      ORDER BY a.id
    `);
    
    console.log(`📊 Found ${(activities as any[]).length} activities to process`);

    // Get all available destinations
    const destinations = await db.execute(`
      SELECT id, name, country, region
      FROM destinations
      ORDER BY name
    `);
    
    console.log(`📊 Available destinations: ${(destinations as any[]).length}`);

    // Comprehensive activity-to-destination mapping
    const mappings = [
      // Rio de Janeiro activities
      { keywords: ["rio de janeiro", "cristo redentor", "corcovado", "pão de açúcar", "copacabana", "ipanema", "maracanã", "santa teresa", "tijuca", "lapa"], destination: "Rio de Janeiro" },
      
      // São Paulo activities
      { keywords: ["são paulo", "ibirapuera", "centro histórico", "vila madalena", "liberdade", "bela vista", "jardins"], destination: "São Paulo" },
      
      // Salvador activities
      { keywords: ["salvador", "pelourinho", "elevador lacerda", "mercado modelo", "barra"], destination: "Salvador" },
      
      // Florianópolis activities
      { keywords: ["florianópolis", "ponte hercílio luz", "mercado público", "lagoa da conceição"], destination: "Florianópolis" },
      
      // Gramado activities
      { keywords: ["gramado", "mini mundo", "snowland", "vale dos vinhedos", "dreamland", "gramado zoo", "canela"], destination: "Gramado" },
      
      // Bonito activities
      { keywords: ["bonito", "gruta do lago azul", "rio da prata", "pantanal", "aquário natural", "abismo anhumas"], destination: "Bonito" },
      
      // International destinations
      { keywords: ["paris", "torre eiffel", "louvre", "montmartre", "champs elysées", "sacré-cœur", "arc de triomphe"], destination: "Paris" },
      
      { keywords: ["london", "londres", "london eye", "tower bridge", "buckingham", "westminster", "tate modern", "covent garden"], destination: "Londres" },
      
      { keywords: ["new york", "nova york", "times square", "central park", "statue of liberty", "brooklyn bridge", "empire state"], destination: "Nova York" },
      
      { keywords: ["rome", "roma", "colosseum", "vatican", "trevi fountain", "pantheon", "roman forum"], destination: "Roma" },
      
      { keywords: ["buenos aires", "puerto madero", "san telmo", "recoleta", "la boca", "palermo"], destination: "Buenos Aires" },
      
      { keywords: ["madrid", "prado", "retiro", "gran via", "puerta del sol"], destination: "Madrid" },
      
      { keywords: ["barcelona", "sagrada familia", "park güell", "las ramblas", "gothic quarter"], destination: "Barcelona" }
    ];

    let updatesCount = 0;
    let matchedCount = 0;

    for (const activity of activities as any[]) {
      const activityTitle = (activity.title || "").toLowerCase();
      let matchedDestination = null;

      // Try to find a matching destination
      for (const mapping of mappings) {
        const hasMatch = mapping.keywords.some(keyword => 
          activityTitle.includes(keyword.toLowerCase())
        );

        if (hasMatch) {
          // Find the destination in our destinations list
          const destination = (destinations as any[]).find(d => 
            d.name.toLowerCase() === mapping.destination.toLowerCase() ||
            d.name.toLowerCase().includes(mapping.destination.toLowerCase())
          );

          if (destination) {
            matchedDestination = destination;
            break;
          }
        }
      }

      if (matchedDestination) {
        matchedCount++;
        
        // Only update if destination_id is different
        if (activity.destination_id !== matchedDestination.id) {
          console.log(`🔄 Linking: "${activity.title}" → ${matchedDestination.name} (${matchedDestination.country})`);
          
          await db.execute(`
            UPDATE activities 
            SET destination_id = ? 
            WHERE id = ?
          `, [matchedDestination.id, activity.id]);
          
          updatesCount++;
        } else {
          console.log(`✅ Already linked: "${activity.title}" → ${matchedDestination.name}`);
        }
      } else {
        console.log(`⚠️ No match found for: "${activity.title}"`);
      }
    }

    console.log(`\n🎉 Destination linkage completed!`);
    console.log(`✅ Matched ${matchedCount} activities to destinations`);
    console.log(`✅ Updated ${updatesCount} activity records`);

    // Verification: show activities with their destinations
    console.log(`\n🔍 Final verification:`);
    const verification = await db.execute(`
      SELECT a.id, a.title, d.name as destination_name, d.country
      FROM activities a 
      INNER JOIN destinations d ON a.destination_id = d.id
      ORDER BY d.country, d.name, a.title
      LIMIT 20
    `);

    for (const item of verification as any[]) {
      console.log(`   ✓ ${item.title} → ${item.destination_name}, ${item.country}`);
    }

    // Count activities by destination
    const destinationCounts = await db.execute(`
      SELECT d.name, d.country, COUNT(a.id) as activity_count
      FROM destinations d
      LEFT JOIN activities a ON d.id = a.destination_id
      GROUP BY d.id, d.name, d.country
      HAVING activity_count > 0
      ORDER BY activity_count DESC
    `);

    console.log(`\n📊 Activities by destination:`);
    for (const dest of destinationCounts as any[]) {
      console.log(`   • ${dest.name}, ${dest.country}: ${dest.activity_count} activities`);
    }

  } catch (error) {
    console.error("❌ Error fixing destination references:", error);
  }
}

// Execute the fix
fixDestinationReferences().then(() => {
  console.log("🏁 Destination reference fix completed");
  process.exit(0);
}).catch(error => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});