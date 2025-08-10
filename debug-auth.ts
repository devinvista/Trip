import { db } from "./server/db";
import { users } from "./shared/schema";
import { createHash } from "crypto";

async function debugAuth() {
  console.log("🔍 Verificando usuários e senhas...");
  
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      password: users.password
    }).from(users).limit(5);
    
    console.log("Usuários encontrados:", allUsers.length);
    
    for (const user of allUsers) {
      console.log(`\n👤 Usuário: ${user.username}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Senha hash: ${user.password}`);
      
      // Test with common demo password
      const testPassword = "demo123";
      const expectedHash = createHash('sha256').update(testPassword + 'salt').digest('hex');
      console.log(`🧪 Hash esperado para "demo123": ${expectedHash}`);
      console.log(`✅ Senha coincide: ${user.password === expectedHash}`);
    }
    
  } catch (error) {
    console.error("❌ Erro:", error);
  }
  
  process.exit(0);
}

debugAuth();