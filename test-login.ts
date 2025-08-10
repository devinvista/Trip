import { scryptSync } from 'crypto';

// Test scrypt password verification
const storedPassword = "a12047031ebc61c473d03d71cf790fe75c090363be0063900d580499eda9b496cd03a311a486156c7ac3b9ad2ee368b222bf5ec4e5539db491a6b01ae253d9f7.6699e452878774b958cb3f149d7c2830";
const testPassword = "demo123";

console.log("🔍 Testando verificação de senha com scrypt...");
console.log(`Senha armazenada: ${storedPassword}`);
console.log(`Senha testada: ${testPassword}`);

const [hash, salt] = storedPassword.split('.');
console.log(`Hash: ${hash}`);
console.log(`Salt: ${salt}`);

const hashedPassword = scryptSync(testPassword, salt, 64).toString('hex');
console.log(`Hash gerado: ${hashedPassword}`);
console.log(`✅ Senhas coincidem: ${hash === hashedPassword}`);