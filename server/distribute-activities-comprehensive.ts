import { db } from "./db.js";
import { activities, destinations } from "@shared/schema.js";
import { eq } from "drizzle-orm";

async function distributeActivitiesComprehensive() {
  try {
    console.log("🔄 Distribuindo atividades de forma abrangente pelos destinos...");

    // Get all destinations organized by country
    const allDestinations = await db.select().from(destinations);
    console.log(`📍 Total de destinos disponíveis: ${allDestinations.length}`);

    // Get all activities
    const allActivities = await db.select().from(activities);
    console.log(`🎯 Total de atividades: ${allActivities.length}`);

    // Organize destinations by country/region
    const brasilDestinations = allDestinations.filter(d => d.country === 'Brasil').slice(0, 30); // Top 30 Brasil destinations
    const internationalDestinations = allDestinations.filter(d => d.country !== 'Brasil').slice(0, 20); // Top 20 international

    console.log(`🇧🇷 Destinos Brasil selecionados: ${brasilDestinations.length}`);
    console.log(`🌍 Destinos internacionais selecionados: ${internationalDestinations.length}`);

    // Specific mapping for known activity patterns
    const activityMappings = [];

    // 1. Gramado activities (Serra Gaúcha, RS)
    const gramadoActivities = allActivities.filter(a => 
      a.title.toLowerCase().includes('gramado') ||
      a.title.includes('Mini Mundo') ||
      a.title.includes('Dreamland') ||
      a.title.includes('GramadoZoo') ||
      a.title.includes('Snowland') ||
      a.title.includes('Vale dos Vinhedos') ||
      a.description.toLowerCase().includes('gramado')
    );
    const gramadoDest = allDestinations.find(d => d.name === 'Gramado');
    if (gramadoDest) {
      gramadoActivities.forEach(a => {
        activityMappings.push({ activityId: a.id, destinationId: gramadoDest.id, destinationName: 'Gramado' });
      });
    }

    // 2. Bonito, MS activities
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
        activityMappings.push({ activityId: a.id, destinationId: bonitoDest.id, destinationName: 'Bonito' });
      });
    }

    // 3. Rio de Janeiro activities
    const rioActivities = allActivities.filter(a => 
      a.title.toLowerCase().includes('rio') ||
      a.title.includes('Corcovado') ||
      a.title.includes('Pão de Açúcar') ||
      a.title.includes('Copacabana') ||
      a.title.includes('Cristo Redentor') ||
      a.title.includes('Ipanema') ||
      a.description.toLowerCase().includes('rio de janeiro')
    );
    const rioDest = allDestinations.find(d => d.name === 'Rio de Janeiro');
    if (rioDest) {
      rioActivities.forEach(a => {
        activityMappings.push({ activityId: a.id, destinationId: rioDest.id, destinationName: 'Rio de Janeiro' });
      });
    }

    // 4. São Paulo activities
    const spActivities = allActivities.filter(a => 
      a.title.toLowerCase().includes('são paulo') ||
      a.title.toLowerCase().includes('sp') ||
      a.description.toLowerCase().includes('são paulo')
    ).slice(0, 8);
    const spDest = allDestinations.find(d => d.name === 'São Paulo');
    if (spDest) {
      spActivities.forEach(a => {
        activityMappings.push({ activityId: a.id, destinationId: spDest.id, destinationName: 'São Paulo' });
      });
    }

    // 5. International destinations
    // Paris
    const parisActivities = allActivities.filter(a => 
      a.title.toLowerCase().includes('paris') ||
      a.title.includes('Eiffel') ||
      a.title.includes('Louvre') ||
      a.title.includes('Versailles') ||
      a.title.includes('Montmartre') ||
      a.description.toLowerCase().includes('paris')
    );
    const parisDest = allDestinations.find(d => d.name === 'Paris');
    if (parisDest) {
      parisActivities.forEach(a => {
        activityMappings.push({ activityId: a.id, destinationId: parisDest.id, destinationName: 'Paris' });
      });
    }

    // London
    const londonActivities = allActivities.filter(a => 
      a.title.toLowerCase().includes('london') ||
      a.title.includes('Westminster') ||
      a.title.includes('Thames') ||
      a.title.includes('Tower Bridge') ||
      a.title.includes('British Museum') ||
      a.description.toLowerCase().includes('london')
    );
    const londonDest = allDestinations.find(d => d.name === 'Londres');
    if (londonDest) {
      londonActivities.forEach(a => {
        activityMappings.push({ activityId: a.id, destinationId: londonDest.id, destinationName: 'Londres' });
      });
    }

    // New York
    const nycActivities = allActivities.filter(a => 
      a.title.toLowerCase().includes('new york') ||
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
        activityMappings.push({ activityId: a.id, destinationId: nycDest.id, destinationName: 'Nova York' });
      });
    }

    // Rome
    const romeActivities = allActivities.filter(a => 
      a.title.toLowerCase().includes('rome') ||
      a.title.toLowerCase().includes('roma') ||
      a.title.includes('Colosseum') ||
      a.title.includes('Vatican') ||
      a.title.includes('Trevi') ||
      a.description.toLowerCase().includes('rome') ||
      a.description.toLowerCase().includes('roma')
    );
    const romeDest = allDestinations.find(d => d.name === 'Roma');
    if (romeDest) {
      romeActivities.forEach(a => {
        activityMappings.push({ activityId: a.id, destinationId: romeDest.id, destinationName: 'Roma' });
      });
    }

    // Buenos Aires
    const buenosAiresActivities = allActivities.filter(a => 
      a.title.toLowerCase().includes('buenos aires') ||
      a.title.includes('Tango') ||
      a.title.includes('La Boca') ||
      a.title.includes('Puerto Madero') ||
      a.description.toLowerCase().includes('buenos aires')
    );
    const buenosAiresDest = allDestinations.find(d => d.name === 'Buenos Aires');
    if (buenosAiresDest) {
      buenosAiresActivities.forEach(a => {
        activityMappings.push({ activityId: a.id, destinationId: buenosAiresDest.id, destinationName: 'Buenos Aires' });
      });
    }

    // Get mapped activity IDs to exclude from random distribution
    const mappedActivityIds = new Set(activityMappings.map(m => m.activityId));
    
    // Distribute remaining activities randomly among other destinations
    const unmappedActivities = allActivities.filter(a => !mappedActivityIds.has(a.id));
    console.log(`🎲 Atividades não mapeadas: ${unmappedActivities.length}`);

    // Mix of Brasil and international destinations for remaining activities
    const remainingDestinations = [
      ...brasilDestinations.filter(d => !['Gramado', 'Bonito', 'Rio de Janeiro', 'São Paulo'].includes(d.name)).slice(0, 15),
      ...internationalDestinations.filter(d => !['Paris', 'Londres', 'Nova York', 'Roma', 'Buenos Aires'].includes(d.name)).slice(0, 10)
    ];

    unmappedActivities.forEach((activity, index) => {
      const destination = remainingDestinations[index % remainingDestinations.length];
      if (destination) {
        activityMappings.push({ 
          activityId: activity.id, 
          destinationId: destination.id, 
          destinationName: destination.name 
        });
      }
    });

    console.log(`🔄 Total de mapeamentos criados: ${activityMappings.length}`);

    // Group by destination for logging
    const mappingsByDestination = activityMappings.reduce((acc, mapping) => {
      acc[mapping.destinationName] = (acc[mapping.destinationName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("📊 Distribuição planejada:");
    Object.entries(mappingsByDestination)
      .sort(([,a], [,b]) => b - a) // Sort by count desc
      .forEach(([destination, count]) => {
        console.log(`   • ${destination}: ${count} atividades`);
      });

    // Apply all mappings
    let updatedCount = 0;
    for (const mapping of activityMappings) {
      try {
        await db
          .update(activities)
          .set({ destination_id: mapping.destinationId })
          .where(eq(activities.id, mapping.activityId));
        
        updatedCount++;
        
        if (updatedCount % 20 === 0) {
          console.log(`📈 Progresso: ${updatedCount}/${activityMappings.length} atividades atualizadas`);
        }
      } catch (error) {
        console.error(`❌ Erro ao atualizar atividade ${mapping.activityId}:`, error);
      }
    }

    console.log(`🎉 Migração concluída! ${updatedCount} atividades atualizadas`);

    // Final verification
    const finalCheck = await db
      .select({
        destinationName: destinations.name,
        country: destinations.country,
        activityCount: activities.id
      })
      .from(activities)
      .leftJoin(destinations, eq(activities.destination_id, destinations.id))
      .groupBy(destinations.name, destinations.country)
      .orderBy(destinations.country, destinations.name);

    console.log("📍 Distribuição final por país:");
    const byCountry = finalCheck.reduce((acc, item) => {
      const country = item.country || 'Sem país';
      acc[country] = (acc[country] || 0) + (item.activityCount || 0);
      return acc;
    }, {} as Record<string, number>);

    Object.entries(byCountry).forEach(([country, count]) => {
      console.log(`   🌍 ${country}: ${count} atividades`);
    });

  } catch (error) {
    console.error("❌ Erro na distribuição:", error);
  }
}

// Execute
distributeActivitiesComprehensive();