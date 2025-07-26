




export async function addComprehensiveCities() {
  console.log("🏙️ Iniciando cadastro de cidades abrangentes...");
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const city of cities) {
    try {
      // Check if city already exists
      const existingCity = await db.select()
        .from(destinations)
        .where(eq(destinations.name, city.name))
        .limit(1);
      
      if (existingCity.length > 0) {
        console.log(`⏭️ Cidade já existe: ${city.name}`);
        skippedCount++;
        continue;
      }
      
      // Insert new city
      await db.insert(destinations).values({
        name: city.name,
        state: city.state,
        country: city.country,
        countryType: city.countryType,
        region: city.region,
        continent: city.continent,
        latitude: city.latitude.toString(),
        longitude: city.longitude.toString(),
        timezone: city.timezone,
        isActive: true
      });
      
      console.log(`✅ Cidade adicionada: ${city.name}, ${city.state || city.country}`);
      addedCount++;
      
    } catch (error) {
      console.error(`❌ Erro ao adicionar cidade ${city.name}:`, error);
    }
  }
  
  console.log(`\n🎉 Processo concluído!`);
  console.log(`📊 Resumo:`);
  console.log(`   ✅ Cidades adicionadas: ${addedCount}`);
  console.log(`   ⏭️ Cidades já existentes: ${skippedCount}`);
  console.log(`   🏙️ Total processado: ${cities.length}`);
}

// Run the function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addComprehensiveCities()
    .then(() => {
      console.log("✨ Script finalizado com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Erro fatal:", error);
      process.exit(1);
    });
}