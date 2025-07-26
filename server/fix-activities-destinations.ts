import { db } from "./db.js";
import { activities, destinations } from "@shared/schema.js";
import { eq, inArray } from "drizzle-orm";

async function fixActivitiesDestinations() {
  try {
    console.log("🔄 Corrigindo vinculação de atividades com destinos...");

    // Get all destinations to see what we have
    const allDestinations = await db.select().from(destinations);
    console.log(`📍 Total de destinos disponíveis: ${allDestinations.length}`);

    // Log some key destinations to understand the mapping
    const keyDestinations = allDestinations.filter(d => 
      ['Rio de Janeiro', 'São Paulo', 'Gramado', 'Bonito', 'Londres', 'Paris', 'Nova York', 'Roma', 'Buenos Aires'].includes(d.name)
    );
    
    console.log("🗺️ Destinos principais encontrados:");
    keyDestinations.forEach(dest => {
      console.log(`   • ${dest.name} (ID: ${dest.id}) - ${dest.country}`);
    });

    // Get all activities to see the current state
    const allActivities = await db.select().from(activities);
    console.log(`🎯 Total de atividades: ${allActivities.length}`);

    // Create mapping based on activity titles/descriptions to proper destinations
    const activityDestinationMappings = [];

    // Gramado activities (based on titles)
    const gramadoActivities = allActivities.filter(a => 
      a.title.toLowerCase().includes('gramado') ||
      a.title.includes('Mini Mundo') ||
      a.title.includes('Dreamland') ||
      a.title.includes('GramadoZoo') ||
      a.title.includes('Snowland') ||
      a.title.includes('Vale dos Vinhedos')
    );
    const gramadoDest = allDestinations.find(d => d.name === 'Gramado');
    if (gramadoDest) {
      gramadoActivities.forEach(a => {
        activityDestinationMappings.push({ activityId: a.id, destinationId: gramadoDest.id, location: 'Gramado' });
      });
    }

    // Bonito activities
    const bonitoActivities = allActivities.filter(a => 
      a.title.toLowerCase().includes('bonito') ||
      a.title.includes('Gruta do Lago Azul') ||
      a.title.includes('Rio Sucuri') ||
      a.title.includes('Abismo Anhumas') ||
      a.description.toLowerCase().includes('bonito')
    );
    const bonitoDest = allDestinations.find(d => d.name === 'Bonito');
    if (bonitoDest) {
      bonitoActivities.forEach(a => {
        activityDestinationMappings.push({ activityId: a.id, destinationId: bonitoDest.id, location: 'Bonito' });
      });
    }

    // London activities
    const londonActivities = allActivities.filter(a => 
      a.title.includes('London') ||
      a.title.includes('Westminster') ||
      a.title.includes('Thames') ||
      a.title.includes('Tower Bridge') ||
      a.title.includes('British Museum') ||
      a.description.toLowerCase().includes('london')
    );
    const londonDest = allDestinations.find(d => d.name === 'Londres');
    if (londonDest) {
      londonActivities.forEach(a => {
        activityDestinationMappings.push({ activityId: a.id, destinationId: londonDest.id, location: 'Londres' });
      });
    }

    // Paris activities
    const parisActivities = allActivities.filter(a => 
      a.title.includes('Paris') ||
      a.title.includes('Eiffel') ||
      a.title.includes('Louvre') ||
      a.title.includes('Versailles') ||
      a.title.includes('Montmartre') ||
      a.description.toLowerCase().includes('paris')
    );
    const parisDest = allDestinations.find(d => d.name === 'Paris');
    if (parisDest) {
      parisActivities.forEach(a => {
        activityDestinationMappings.push({ activityId: a.id, destinationId: parisDest.id, location: 'Paris' });
      });
    }

    // New York activities
    const nycActivities = allActivities.filter(a => 
      a.title.includes('New York') ||
      a.title.includes('NYC') ||
      a.title.includes('Manhattan') ||
      a.title.includes('Brooklyn') ||
      a.title.includes('Central Park') ||
      a.title.includes('Statue of Liberty') ||
      a.description.toLowerCase().includes('new york')
    );
    const nycDest = allDestinations.find(d => d.name === 'Nova York');
    if (nycDest) {
      nycActivities.forEach(a => {
        activityDestinationMappings.push({ activityId: a.id, destinationId: nycDest.id, location: 'Nova York' });
      });
    }

    // Rome activities
    const romeActivities = allActivities.filter(a => 
      a.title.includes('Rome') ||
      a.title.includes('Roma') ||
      a.title.includes('Colosseum') ||
      a.title.includes('Vatican') ||
      a.title.includes('Trevi') ||
      a.description.toLowerCase().includes('rome') ||
      a.description.toLowerCase().includes('roma')
    );
    const romeDest = allDestinations.find(d => d.name === 'Roma');
    if (romeDest) {
      romeActivities.forEach(a => {
        activityDestinationMappings.push({ activityId: a.id, destinationId: romeDest.id, location: 'Roma' });
      });
    }

    // Buenos Aires activities
    const buenosAiresActivities = allActivities.filter(a => 
      a.title.includes('Buenos Aires') ||
      a.title.includes('Tango') ||
      a.title.includes('La Boca') ||
      a.title.includes('Puerto Madero') ||
      a.description.toLowerCase().includes('buenos aires')
    );
    const buenosAiresDest = allDestinations.find(d => d.name === 'Buenos Aires');
    if (buenosAiresDest) {
      buenosAiresActivities.forEach(a => {
        activityDestinationMappings.push({ activityId: a.id, destinationId: buenosAiresDest.id, location: 'Buenos Aires' });
      });
    }

    // Rio de Janeiro activities (keep existing ones)
    const rioActivities = allActivities.filter(a => 
      a.title.includes('Rio') ||
      a.title.includes('Corcovado') ||
      a.title.includes('Pão de Açúcar') ||
      a.title.includes('Copacabana') ||
      a.title.includes('Cristo Redentor') ||
      a.description.toLowerCase().includes('rio de janeiro')
    );
    const rioDest = allDestinations.find(d => d.name === 'Rio de Janeiro');
    if (rioDest) {
      rioActivities.forEach(a => {
        activityDestinationMappings.push({ activityId: a.id, destinationId: rioDest.id, location: 'Rio de Janeiro' });
      });
    }

    console.log(`🔄 Mapeamentos criados: ${activityDestinationMappings.length}`);
    
    // Group by location for logging
    const mappingsByLocation = activityDestinationMappings.reduce((acc, mapping) => {
      acc[mapping.location] = (acc[mapping.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("📊 Distribuição de atividades por destino:");
    Object.entries(mappingsByLocation).forEach(([location, count]) => {
      console.log(`   • ${location}: ${count} atividades`);
    });

    // Apply the mappings
    let updatedCount = 0;
    for (const mapping of activityDestinationMappings) {
      try {
        await db
          .update(activities)
          .set({ destination_id: mapping.destinationId })
          .where(eq(activities.id, mapping.activityId));
        
        console.log(`✅ Atividade ${mapping.activityId} → ${mapping.location} (${mapping.destinationId})`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Erro ao atualizar atividade ${mapping.activityId}:`, error);
      }
    }

    console.log(`🎉 Migração concluída! ${updatedCount} atividades atualizadas`);

    // Verify the final distribution
    const finalDistribution = await db
      .select({
        destinationName: destinations.name,
        count: activities.id
      })
      .from(activities)
      .leftJoin(destinations, eq(activities.destination_id, destinations.id))
      .groupBy(destinations.name);

    console.log("📍 Distribuição final:");
    finalDistribution.forEach(item => {
      console.log(`   • ${item.destinationName || 'Sem destino'}: ${item.count || 0} atividades`);
    });

  } catch (error) {
    console.error("❌ Erro na migração:", error);
  }
}

// Execute the migration
fixActivitiesDestinations();