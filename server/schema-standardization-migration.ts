#!/usr/bin/env tsx
import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * Schema Standardization Migration
 * 
 * Changes:
 * 1. Rename "destination" columns to "localidade"
 * 2. Standardize ID field naming to camelCase (user_id -> userId, trip_id -> tripId, etc.)
 * 3. Update all references in the database
 */

async function runSchemaStandardizationMigration() {
  console.log("🔄 Iniciando migração de padronização do schema...");
  
  try {
    console.log("📋 Etapa 1: Renomeando colunas 'destination' para 'localidade'");
    
    // 1. Rename destination column in trips table
    await db.execute(sql`ALTER TABLE trips CHANGE COLUMN destination localidade VARCHAR(255) NOT NULL`);
    console.log("✅ trips.destination → trips.localidade");
    
    // 2. Rename destination column in destination_ratings table  
    await db.execute(sql`ALTER TABLE destination_ratings CHANGE COLUMN destination localidade VARCHAR(255) NOT NULL`);
    console.log("✅ destination_ratings.destination → destination_ratings.localidade");
    
    console.log("📋 Etapa 2: Padronizando nomes de colunas ID (snake_case -> camelCase)");
    
    // Update trips table
    await db.execute(sql`ALTER TABLE trips CHANGE COLUMN creator_id creatorId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE trips CHANGE COLUMN max_participants maxParticipants INT NOT NULL`);
    await db.execute(sql`ALTER TABLE trips CHANGE COLUMN current_participants currentParticipants INT NOT NULL`);
    await db.execute(sql`ALTER TABLE trips CHANGE COLUMN start_date startDate TIMESTAMP NOT NULL`);
    await db.execute(sql`ALTER TABLE trips CHANGE COLUMN end_date endDate TIMESTAMP NOT NULL`);
    await db.execute(sql`ALTER TABLE trips CHANGE COLUMN budget_breakdown budgetBreakdown JSON`);
    await db.execute(sql`ALTER TABLE trips CHANGE COLUMN travel_style travelStyle VARCHAR(100) NOT NULL`);
    await db.execute(sql`ALTER TABLE trips CHANGE COLUMN shared_costs sharedCosts JSON`);
    await db.execute(sql`ALTER TABLE trips CHANGE COLUMN planned_activities plannedActivities JSON`);
    await db.execute(sql`ALTER TABLE trips CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL`);
    console.log("✅ trips table ID fields standardized");
    
    // Update trip_participants table
    await db.execute(sql`ALTER TABLE trip_participants CHANGE COLUMN trip_id tripId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE trip_participants CHANGE COLUMN user_id userId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE trip_participants CHANGE COLUMN joined_at joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL`);
    console.log("✅ trip_participants table ID fields standardized");
    
    // Update messages table
    await db.execute(sql`ALTER TABLE messages CHANGE COLUMN trip_id tripId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE messages CHANGE COLUMN sender_id senderId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE messages CHANGE COLUMN sent_at sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL`);
    console.log("✅ messages table ID fields standardized");
    
    // Update trip_requests table
    await db.execute(sql`ALTER TABLE trip_requests CHANGE COLUMN trip_id tripId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE trip_requests CHANGE COLUMN user_id userId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE trip_requests CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL`);
    console.log("✅ trip_requests table ID fields standardized");
    
    // Update expenses table
    await db.execute(sql`ALTER TABLE expenses CHANGE COLUMN trip_id tripId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE expenses CHANGE COLUMN paid_by paidBy INT NOT NULL`);
    await db.execute(sql`ALTER TABLE expenses CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL`);
    await db.execute(sql`ALTER TABLE expenses CHANGE COLUMN settled_at settledAt TIMESTAMP`);
    console.log("✅ expenses table ID fields standardized");
    
    // Update expense_splits table
    await db.execute(sql`ALTER TABLE expense_splits CHANGE COLUMN expense_id expenseId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE expense_splits CHANGE COLUMN user_id userId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE expense_splits CHANGE COLUMN settled_at settledAt TIMESTAMP`);
    console.log("✅ expense_splits table ID fields standardized");
    
    // Update user_ratings table
    await db.execute(sql`ALTER TABLE user_ratings CHANGE COLUMN trip_id tripId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE user_ratings CHANGE COLUMN rated_user_id ratedUserId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE user_ratings CHANGE COLUMN rater_user_id raterUserId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE user_ratings CHANGE COLUMN is_hidden isHidden BOOLEAN DEFAULT FALSE NOT NULL`);
    await db.execute(sql`ALTER TABLE user_ratings CHANGE COLUMN report_count reportCount INT DEFAULT 0 NOT NULL`);
    await db.execute(sql`ALTER TABLE user_ratings CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL`);
    await db.execute(sql`ALTER TABLE user_ratings CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL`);
    console.log("✅ user_ratings table ID fields standardized");
    
    // Update destination_ratings table (now localidade_ratings)
    await db.execute(sql`RENAME TABLE destination_ratings TO localidade_ratings`);
    await db.execute(sql`ALTER TABLE localidade_ratings CHANGE COLUMN user_id userId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE localidade_ratings CHANGE COLUMN trip_id tripId INT`);
    await db.execute(sql`ALTER TABLE localidade_ratings CHANGE COLUMN visit_date visitDate TIMESTAMP`);
    await db.execute(sql`ALTER TABLE localidade_ratings CHANGE COLUMN is_hidden isHidden BOOLEAN DEFAULT FALSE NOT NULL`);
    await db.execute(sql`ALTER TABLE localidade_ratings CHANGE COLUMN report_count reportCount INT DEFAULT 0 NOT NULL`);
    await db.execute(sql`ALTER TABLE localidade_ratings CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL`);
    await db.execute(sql`ALTER TABLE localidade_ratings CHANGE COLUMN updated_at updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL`);
    console.log("✅ destination_ratings → localidade_ratings table ID fields standardized");
    
    // Update users table
    await db.execute(sql`ALTER TABLE users CHANGE COLUMN full_name fullName VARCHAR(255) NOT NULL`);
    await db.execute(sql`ALTER TABLE users CHANGE COLUMN profile_photo profilePhoto TEXT`);
    await db.execute(sql`ALTER TABLE users CHANGE COLUMN travel_styles travelStyles JSON`);
    await db.execute(sql`ALTER TABLE users CHANGE COLUMN referred_by referredBy VARCHAR(50)`);
    await db.execute(sql`ALTER TABLE users CHANGE COLUMN is_verified isVerified BOOLEAN DEFAULT FALSE NOT NULL`);
    await db.execute(sql`ALTER TABLE users CHANGE COLUMN verification_method verificationMethod VARCHAR(50)`);
    await db.execute(sql`ALTER TABLE users CHANGE COLUMN average_rating averageRating DECIMAL(3,2) DEFAULT 5.00`);
    await db.execute(sql`ALTER TABLE users CHANGE COLUMN total_ratings totalRatings INT DEFAULT 0 NOT NULL`);
    await db.execute(sql`ALTER TABLE users CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL`);
    console.log("✅ users table fields standardized");
    
    // Update verification_requests table
    await db.execute(sql`ALTER TABLE verification_requests CHANGE COLUMN user_id userId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE verification_requests CHANGE COLUMN verification_type verificationType VARCHAR(100) NOT NULL`);
    await db.execute(sql`ALTER TABLE verification_requests CHANGE COLUMN verification_data verificationData JSON`);
    await db.execute(sql`ALTER TABLE verification_requests CHANGE COLUMN submitted_at submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL`);
    await db.execute(sql`ALTER TABLE verification_requests CHANGE COLUMN reviewed_at reviewedAt TIMESTAMP`);
    await db.execute(sql`ALTER TABLE verification_requests CHANGE COLUMN reviewed_by reviewedBy INT`);
    await db.execute(sql`ALTER TABLE verification_requests CHANGE COLUMN rejection_reason rejectionReason TEXT`);
    console.log("✅ verification_requests table ID fields standardized");
    
    // Update rating_reports table
    await db.execute(sql`ALTER TABLE rating_reports CHANGE COLUMN reporter_id reporterId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE rating_reports CHANGE COLUMN rating_type ratingType VARCHAR(50) NOT NULL`);
    await db.execute(sql`ALTER TABLE rating_reports CHANGE COLUMN rating_id ratingId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE rating_reports CHANGE COLUMN reviewed_at reviewedAt TIMESTAMP`);
    await db.execute(sql`ALTER TABLE rating_reports CHANGE COLUMN reviewed_by reviewedBy INT`);
    await db.execute(sql`ALTER TABLE rating_reports CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL`);
    console.log("✅ rating_reports table ID fields standardized");
    
    // Update activity_rating_helpful_votes table
    await db.execute(sql`ALTER TABLE activity_rating_helpful_votes CHANGE COLUMN review_id reviewId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE activity_rating_helpful_votes CHANGE COLUMN user_id userId INT NOT NULL`);
    await db.execute(sql`ALTER TABLE activity_rating_helpful_votes CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL`);
    console.log("✅ activity_rating_helpful_votes table ID fields standardized");
    
    // Update interest_list table
    await db.execute(sql`ALTER TABLE interest_list CHANGE COLUMN full_name fullName VARCHAR(255) NOT NULL`);
    await db.execute(sql`ALTER TABLE interest_list CHANGE COLUMN referral_code referralCode VARCHAR(50)`);
    await db.execute(sql`ALTER TABLE interest_list CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL`);
    console.log("✅ interest_list table fields standardized");
    
    // Update referral_codes table
    await db.execute(sql`ALTER TABLE referral_codes CHANGE COLUMN created_by createdBy INT`);
    await db.execute(sql`ALTER TABLE referral_codes CHANGE COLUMN max_uses maxUses INT DEFAULT 1 NOT NULL`);
    await db.execute(sql`ALTER TABLE referral_codes CHANGE COLUMN current_uses currentUses INT DEFAULT 0 NOT NULL`);
    await db.execute(sql`ALTER TABLE referral_codes CHANGE COLUMN is_active isActive BOOLEAN DEFAULT TRUE NOT NULL`);
    await db.execute(sql`ALTER TABLE referral_codes CHANGE COLUMN created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL`);
    await db.execute(sql`ALTER TABLE referral_codes CHANGE COLUMN expires_at expiresAt TIMESTAMP`);
    console.log("✅ referral_codes table ID fields standardized");
    
    console.log("📋 Etapa 3: Atualizando constraints e foreign keys");
    
    // Drop and recreate foreign key constraints with new column names
    // Note: This is a simplified approach. In production, you'd want to be more careful about constraint names
    console.log("⚠️ Foreign key constraints will be automatically updated by MySQL");
    
    console.log("🎉 Migração de padronização do schema concluída com sucesso!");
    console.log("\n📋 Resumo das alterações:");
    console.log("✅ 'destination' → 'localidade' em todas as tabelas");
    console.log("✅ Todos os campos ID padronizados para camelCase");
    console.log("✅ Tabela 'destination_ratings' renomeada para 'localidade_ratings'");
    console.log("✅ Mantida compatibilidade com dados existentes");
    
  } catch (error: any) {
    console.error("❌ Erro durante a migração:", error);
    console.error("💡 A migração foi interrompida. Verifique os logs acima.");
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSchemaStandardizationMigration()
    .then(() => {
      console.log("✅ Migração concluída com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Falha na migração:", error);
      process.exit(1);
    });
}

export { runSchemaStandardizationMigration };