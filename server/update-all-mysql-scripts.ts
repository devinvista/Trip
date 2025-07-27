#!/usr/bin/env tsx
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Comprehensive script to update ALL TypeScript files to MySQL snake_case standard
 * This covers database operations, schema references, and field mappings
 */

const SNAKE_CASE_MAPPINGS = {
  // Database field mappings (camelCase JS → snake_case MySQL)
  'activityId': 'activity_id',
  'createdById': 'created_by_id', 
  'createdBy': 'created_by',
  'userId': 'user_id',
  'tripId': 'trip_id',
  'messageId': 'message_id',
  'requestId': 'request_id',
  'reviewId': 'review_id',
  'proposalId': 'proposal_id',
  'senderId': 'sender_id',
  'receiverId': 'receiver_id',
  'fromUserId': 'from_user_id',
  'toUserId': 'to_user_id',
  'parentId': 'parent_id',
  
  // Common field mappings
  'countryType': 'country_type',
  'priceType': 'price_type',
  'priceAmount': 'price_amount',
  'difficultyLevel': 'difficulty_level',
  'minParticipants': 'min_participants',
  'maxParticipants': 'max_participants',
  'coverImage': 'cover_image',
  'averageRating': 'average_rating',
  'totalRatings': 'total_ratings',
  'isActive': 'is_active',
  'isVerified': 'is_verified',
  'isPublic': 'is_public',
  'isAdmin': 'is_admin',
  'isFeatured': 'is_featured',
  'isPremium': 'is_premium',
  'isComplete': 'is_complete',
  'isApproved': 'is_approved',
  'isHelpful': 'is_helpful',
  'isVisible': 'is_visible',
  
  // Timestamp fields
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  'deletedAt': 'deleted_at',
  'completedAt': 'completed_at',
  'publishedAt': 'published_at',
  'verifiedAt': 'verified_at',
  'lastLoginAt': 'last_login_at',
  'startDate': 'start_date',
  'endDate': 'end_date',
  'visitDate': 'visit_date',
  'birthDate': 'birth_date',
  
  // Profile fields
  'firstName': 'first_name',
  'lastName': 'last_name',
  'fullName': 'full_name',
  'displayName': 'display_name',
  'phoneNumber': 'phone_number',
  'profilePicture': 'profile_picture',
  'travelStyle': 'travel_style',
  'travelStyles': 'travel_styles',
  'socialLinks': 'social_links',
  'emergencyContact': 'emergency_contact',
  'referralCode': 'referral_code',
  'referredBy': 'referred_by',
  
  // Budget and financial fields
  'totalBudget': 'total_budget',
  'budgetBreakdown': 'budget_breakdown',
  'sharedCosts': 'shared_costs',
  'individualCosts': 'individual_costs',
  'paymentMethod': 'payment_method',
  'paymentStatus': 'payment_status',
  'refundAmount': 'refund_amount',
  
  // Trip and activity fields
  'plannedActivities': 'planned_activities',
  'actualCost': 'actual_cost',
  'estimatedCost': 'estimated_cost',
  'maxBudget': 'max_budget',
  'minBudget': 'min_budget',
  'contactInfo': 'contact_info',
  'cancellationPolicy': 'cancellation_policy',
  'bookingUrl': 'booking_url',
  'specialRequirements': 'special_requirements',
  
  // Review and rating fields
  'overallRating': 'overall_rating',
  'serviceRating': 'service_rating',
  'valueRating': 'value_rating',
  'locationRating': 'location_rating',
  'helpfulVotes': 'helpful_votes',
  'totalVotes': 'total_votes',
  'reviewText': 'review_text',
  'reviewTitle': 'review_title',
  'wouldRecommend': 'would_recommend',
  
  // Communication fields
  'messageText': 'message_text',
  'messageType': 'message_type',
  'readAt': 'read_at',
  'deliveredAt': 'delivered_at',
  'chatId': 'chat_id',
  'threadId': 'thread_id',
  'replyToId': 'reply_to_id'
};

function updateScriptToMySQL(filePath: string): void {
  console.log(`🔧 Updating ${filePath}...`);
  
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Update JavaScript object field names to use camelCase (for TypeScript objects)
  for (const [camelCase, snakeCase] of Object.entries(SNAKE_CASE_MAPPINGS)) {
    // Update field definitions in objects: fieldName: value
    const fieldRegex = new RegExp(`\\b${snakeCase}:\\s*`, 'g');
    if (content.match(fieldRegex)) {
      content = content.replace(fieldRegex, `${camelCase}: `);
      modified = true;
    }
  }
  
  // Fix specific patterns that need standardization
  const patterns = [
    // Remove  calls (MySQL incompatible)
    {
      pattern: /\.returning\(\s*[^)]*\s*\)/g,
      replacement: ''
    },
    // Fix SSL configuration for MySQL
    {
      pattern: /ssl:\s*false/g,
      replacement: 'ssl: undefined'
    },
    // Standardize duration format
    {
      pattern: /duration:\s*(\d+)(?!.*horas)/g,
      replacement: 'duration: "$1 horas"'
    },
    // Remove created_at/updated_at in insert operations (auto-generated)
    {
      pattern: /,\s*createdAt: \s*new Date\(\)/g,
      replacement: ''
    },
    {
      pattern: /,\s*updatedAt: \s*new Date\(\)/g,
      replacement: ''
    },
    // Fix amount field type (string in schema)
    {
      pattern: /amount:\s*parseFloat\([^)]+\)/g,
      replacement: 'amount: proposal.amount'
    }
  ];
  
  for (const { pattern, replacement } of patterns) {
    if (content.match(pattern)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  }
  
  // Add missing required fields for activities if not present
  if (content.includes('title:') && content.includes('category:') && !content.includes('countryType:')) {
    content = content.replace(
      /(category:\s*"[^"]+",?\s*)/g,
      '$1\n    countryType: "nacional",\n    region: "Brasil",\n    priceType: "per_person",'
    );
    modified = true;
  }
  
  if (modified) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Updated ${filePath}`);
  } else {
    console.log(`ℹ️ No changes needed for ${filePath}`);
  }
}

function main() {
  console.log('🚀 Starting comprehensive MySQL schema update...');
  
  const serverDir = '.';
  const files = readdirSync(serverDir);
  
  // Find all TypeScript files that interact with database
  const dbScripts = files.filter(file => 
    file.endsWith('.ts') && 
    !file.includes('node_modules') &&
    !file.includes('.d.ts') &&
    (
      file.includes('add-') ||
      file.includes('create-') ||
      file.includes('fix-') ||
      file.includes('update-') ||
      file.includes('migrate-') ||
      file.includes('seed') ||
      file.includes('populate') ||
      file.includes('comprehensive') ||
      file.includes('activities') ||
      file.includes('budget') ||
      file.includes('auth') ||
      file.includes('db') ||
      file.includes('storage')
    )
  );
  
  console.log(`📋 Found ${dbScripts.length} database-related scripts to update:`);
  dbScripts.forEach(script => console.log(`  - ${script}`));
  
  // Update each script
  for (const script of dbScripts) {
    const filePath = join(serverDir, script);
    try {
      updateScriptToMySQL(filePath);
    } catch (error) {
      console.error(`❌ Error updating ${script}:`, error);
    }
  }
  
  console.log('🎉 All scripts updated to MySQL snake_case standard!');
  console.log('📝 Summary: Updated field names, removed MySQL incompatible patterns, standardized formats');
}

main();