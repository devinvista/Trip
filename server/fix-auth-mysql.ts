import { db } from "./db";
import { users } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const asyncScrypt = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await asyncScrypt(password, salt, 64);
  return `${(derivedKey as Buffer).toString('hex')}.${salt}`;
}

async function fixAuthenticationPasswords() {
  console.log("🔧 Corrigindo senhas dos usuários para formato correto...");
  
  try {
    const hashedPassword = await hashPassword("demo123");
    
    // Update all existing users with correct password format
    const allUsers = await db.select().from(users);
    
    for (const user of allUsers) {
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id));
      
      console.log(`✅ Senha corrigida para usuário: ${user.username}`);
    }
    
    console.log("✅ Todas as senhas foram corrigidas para o formato correto!");
    
  } catch (error) {
    console.error("❌ Erro ao corrigir senhas:", error);
  }
}

// Run the fix
fixAuthenticationPasswords().then(() => {
  console.log("🎉 Correção de autenticação concluída!");
  process.exit(0);
}).catch(console.error);