import { testConnection, initializeTables } from "./db.js";
import { syncParticipantsCount } from "./sync-participants.js";

async function main() {
  try {
    console.log("🔗 Conectando ao MySQL...");
    await testConnection();
    console.log("🏗️ Inicializando tabelas MySQL...");
    await initializeTables();
    
    console.log("🔄 Executando sincronização de participantes...");
    await syncParticipantsCount();
    
    console.log("✅ Sincronização concluída!");
  } catch (error) {
    console.error("❌ Erro na sincronização:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

main().catch(console.error);