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
        full_name: 'Tom Silva',
        phone: '+5511999999999',
        is_verified: true,
        average_rating: '5.00',
        total_ratings: 0
      },
      {
        username: 'maria',
        email: 'maria@example.com', 
        password: hashPassword('password123'),
        full_name: 'Maria Santos',
        phone: '+5511888888888',
        is_verified: true,
        average_rating: '5.00',
        total_ratings: 0
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
        country_type: 'nacional',
        continent: 'América do Sul',
        timezone: 'America/Sao_Paulo',
        is_active: true
      },
      {
        name: 'São Paulo',
        state: 'SP', 
        country: 'Brasil',
        country_type: 'nacional',
        continent: 'América do Sul',
        timezone: 'America/Sao_Paulo',
        is_active: true
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