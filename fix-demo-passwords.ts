import { db } from "./server/db";
import { users } from "./shared/schema";
import { eq } from "drizzle-orm";
import { scryptSync, randomBytes } from 'crypto';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${hash}.${salt}`;
}

async function fixDemoPasswords() {
  console.log("🔧 Corrigindo senhas dos usuários demo...");
  
  try {
    const demoPassword = "demo123";
    const hashedPassword = hashPassword(demoPassword);
    
    console.log(`🔑 Nova senha hash: ${hashedPassword}`);
    
    // Update demo users
    const demoUsers = ['tom', 'maria', 'carlos'];
    
    for (const username of demoUsers) {
      const result = await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.username, username))
        .returning({ id: users.id, username: users.username });
      
      if (result.length > 0) {
        console.log(`✅ Senha atualizada para ${username}`);
      } else {
        console.log(`❌ Usuário ${username} não encontrado`);
      }
    }
    
    console.log("🎉 Senhas dos usuários demo corrigidas!");
    
  } catch (error) {
    console.error("❌ Erro:", error);
  }
  
  process.exit(0);
}

fixDemoPasswords();