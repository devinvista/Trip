import { createRealisticSeedData } from "./comprehensive-seed-realistic";

async function main() {
  console.log("🌱 Executando seed de dados realistas...");
  
  try {
    await createRealisticSeedData();
    console.log("✅ Seed de dados realistas concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao executar seed de dados realistas:", error);
    process.exit(1);
  }
}

main();