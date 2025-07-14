import { createSimpleSeedData } from "./comprehensive-seed-simple";

async function main() {
  console.log("🌱 Criando dados de teste simples...");
  
  try {
    await createSimpleSeedData();
    console.log("✅ Dados de teste criados com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao criar dados de teste:", error);
    process.exit(1);
  }
}

main();