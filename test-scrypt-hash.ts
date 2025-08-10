import { scryptSync } from 'crypto';

// Test the exact hash that was stored
const storedPassword = "0d93ec9902566f2e28ff605ba5f79d133ea09ba341a8d3d8f54060f4df92e3ff90d0d79998612a58d812859051e2e8b3993142f6466fa57625caaa0cf85c3ec4.b9719640e717179a3ebf6b6b95a4e779";
const testPassword = "demo123";

console.log("🔍 Testando verificação de senha com nova hash armazenada...");
console.log(`Senha armazenada: ${storedPassword}`);
console.log(`Senha testada: ${testPassword}`);

const [hash, salt] = storedPassword.split('.');
console.log(`Hash: ${hash}`);
console.log(`Salt: ${salt}`);

const hashedPassword = scryptSync(testPassword, salt, 64).toString('hex');
console.log(`Hash gerado: ${hashedPassword}`);
console.log(`✅ Senhas coincidem: ${hash === hashedPassword}`);

// Test with different common passwords
const testPasswords = ["demo123", "123456", "password", "admin"];
for (const pwd of testPasswords) {
  const testHash = scryptSync(pwd, salt, 64).toString('hex');
  console.log(`Testando "${pwd}": ${hash === testHash ? "✅ MATCH" : "❌"}`);
}