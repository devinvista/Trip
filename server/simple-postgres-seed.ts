import { db } from "./db";
import { users, destinations } from "@shared/schema";
import { createHash } from "crypto";

export async function createSimpleSeedData() {
  console.log("🌱 Criando dados básicos PostgreSQL...");
  
  try {
    // Create test users with Node.js crypto hash
    const hashPassword = (password: string) => {
      return createHash('sha256').update(password + 'salt').digest('hex');
    };

    const testUsers = [
      {
        username: 'tom',
        email: 'tom@example.com',
        password: hashPassword('password123'),
        fullName: 'Tom Silva',
        isVerified: true,
        averageRating: 5.0,
        totalRatings: 0
      },
      {
        username: 'maria',
        email: 'maria@example.com', 
        password: hashPassword('password123'),
        fullName: 'Maria Santos',
        isVerified: true,
        averageRating: 5.0,
        totalRatings: 0
      }
    ];

    // Insert users
    for (const user of testUsers) {
      try {
        await db.insert(users).values(user).onConflictDoNothing();
      } catch (error) {
        console.log(`User ${user.username} already exists, skipping...`);
      }
    }

    // Create basic destinations
    const basicDestinations = [
      {
        name: 'Rio de Janeiro',
        state: 'RJ',
        country: 'Brasil',
        continent: 'América do Sul',
        timezone: 'America/Sao_Paulo',
        isActive: true
      },
      {
        name: 'São Paulo',
        state: 'SP', 
        country: 'Brasil',
        continent: 'América do Sul',
        timezone: 'America/Sao_Paulo',
        isActive: true
      }
    ];

    // Insert destinations
    for (const destination of basicDestinations) {
      try {
        await db.insert(destinations).values(destination).onConflictDoNothing();
      } catch (error) {
        console.log(`Destination ${destination.name} already exists, skipping...`);
      }
    }

    console.log("✅ Dados básicos PostgreSQL criados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar dados básicos:", error);
    throw error;
  }
}