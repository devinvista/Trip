import { createRealisticSeedData } from "./comprehensive-seed-realistic";
import { resetDatabase } from "./reset-database";

async function main() {
  console.log("🚀 Iniciando processo de seed completo...");
  
  try {
    // Reset database first
    console.log("🔄 Resetando banco de dados...");
    await resetDatabase();
    
    // Create comprehensive seed data
    console.log("🌱 Criando dados de teste realistas...");
    await createRealisticSeedData();
    
    console.log("✅ Processo completo de seed finalizado com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro no processo de seed:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

main().catch(console.error);