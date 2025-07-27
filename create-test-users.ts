import { db } from "./server/db";
import { users } from "./shared/schema";
import { eq } from "drizzle-orm";

async function createTestUsers() {
  try {
    console.log("🚀 Creating test users...");
    
    // Hash password using scrypt (same method as in auth.ts)
    const { scrypt, randomBytes } = await import('crypto');
    const { promisify } = await import('util');
    const scryptAsync = promisify(scrypt);
    
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync("password123", salt, 64)) as Buffer;
    const hashedPassword = `${buf.toString("hex")}.${salt}`;
    
    // Create test users
    const testUsers = [
      {
        username: "tom",
        password: hashedPassword,
        email: "tom@exemplo.com",
        fullName: "Tom Silva",
        phone: "+5511987654321",
        bio: "Aventureiro experiente",
        location: "São Paulo, SP",
        languages: ["português", "inglês"],
        interests: ["aventura", "natureza", "cultura"],
        travelStyles: ["aventura", "cultural"],
        isVerified: true,
        verificationMethod: "referral"
      },
      {
        username: "maria",
        password: hashedPassword,
        email: "maria@exemplo.com", 
        fullName: "Maria Santos",
        phone: "+5511987654322",
        bio: "Apaixonada por novas culturas",
        location: "Rio de Janeiro, RJ",
        languages: ["português", "espanhol"],
        interests: ["cultura", "gastronomia", "praia"],
        travelStyles: ["cultural", "relaxante"],
        isVerified: true,
        verificationMethod: "referral"
      },
      {
        username: "carlos",
        password: hashedPassword,
        email: "carlos@exemplo.com",
        fullName: "Carlos Oliveira", 
        phone: "+5511987654323",
        bio: "Explorador urbano",
        location: "Belo Horizonte, MG",
        languages: ["português"],
        interests: ["urbano", "gastronomia", "história"],
        travelStyles: ["urbano", "cultural"],
        isVerified: true,
        verificationMethod: "referral"
      }
    ];
    
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.username, userData.username));
      
      if (existingUser.length === 0) {
        await db.insert(users).values(userData);
        console.log(`✅ Created user: ${userData.username}`);
      } else {
        console.log(`⚠️ User ${userData.username} already exists, skipping...`);
      }
    }
    
    // Verify users were created
    const allUsers = await db.select().from(users);
    console.log(`📊 Total users in database: ${allUsers.length}`);
    
  } catch (error) {
    console.error("❌ Error creating test users:", error);
  } finally {
    process.exit(0);
  }
}

createTestUsers();