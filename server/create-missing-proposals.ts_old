#!/usr/bin/env tsx
import { db } from './db.js';
import { activities, activityBudgetProposals } from '../shared/schema.js';
import { sql } from 'drizzle-orm';

/**
 * Create budget proposals for activities that don't have any
 */

async function createMissingProposals() {
  console.log('🔧 Creating missing budget proposals...');
  
  // Find activities without proposals
  const activitiesWithoutProposals = await db.select({
    id: activities.id,
    title: activities.title,
    location: activities.location,
    category: activities.category,
    countryType: activities.countryType
  }).from(activities)
  .leftJoin(activityBudgetProposals, sql`${activities.id} = ${activityBudgetProposals.activityId}`)
  .where(sql`${activityBudgetProposals.activityId} IS NULL`);
  
  console.log(`📊 Found ${activitiesWithoutProposals.length} activities without proposals`);
  
  for (const activity of activitiesWithoutProposals) {
    console.log(`💰 Creating proposals for: ${activity.title}`);
    
    // Determine currency and price range based on location
    let currency = 'BRL';
    let basePrice = 100;
    
    if (activity.countryType === 'internacional') {
      if (activity.location?.includes('Argentina')) {
        currency = 'USD';
        basePrice = 15;
      } else if (activity.location?.includes('EUA') || activity.location?.includes('Nova York')) {
        currency = 'USD';
        basePrice = 50;
      } else if (activity.location?.includes('Reino Unido') || activity.location?.includes('Londres')) {
        currency = 'GBP';
        basePrice = 25;
      } else if (activity.location?.includes('Itália') || activity.location?.includes('Roma')) {
        currency = 'EUR';
        basePrice = 30;
      } else if (activity.location?.includes('França') || activity.location?.includes('Paris')) {
        currency = 'EUR';
        basePrice = 35;
      }
    }
    
    // Adjust price based on category
    if (activity.category === 'adventure' || activity.category === 'water_sports') {
      basePrice *= 1.5;
    } else if (activity.category === 'cultural' || activity.category === 'sightseeing') {
      basePrice *= 0.8;
    } else if (activity.category === 'food_tours') {
      basePrice *= 1.2;
    }
    
    const proposals = [
      {
        title: 'Econômico',
        description: 'Opção básica com o essencial incluído',
        amount: basePrice.toFixed(2),
        currency,
        inclusions: JSON.stringify(['Guia local', 'Entrada básica', 'Seguro']),
        exclusions: JSON.stringify(['Alimentação', 'Transporte', 'Souvenirs']),
        activityId: activity.id,
        createdBy: 1,
        isActive: true
      },
      {
        title: 'Completo',
        description: 'Experiência completa com extras incluídos',
        amount: (basePrice * 1.5).toFixed(2),
        currency,
        inclusions: JSON.stringify(['Guia especializado', 'Entrada premium', 'Lanche', 'Fotos', 'Seguro']),
        exclusions: JSON.stringify(['Bebidas extras', 'Transporte', 'Souvenirs']),
        activityId: activity.id,
        createdBy: 1,
        isActive: true
      },
      {
        title: 'Premium',
        description: 'Experiência VIP com tudo incluído',
        amount: (basePrice * 2.5).toFixed(2),
        currency,
        inclusions: JSON.stringify(['Guia privado', 'Acesso VIP', 'Refeição completa', 'Transporte', 'Fotos profissionais', 'Brinde exclusivo']),
        exclusions: JSON.stringify(['Bebidas alcoólicas premium', 'Gorjetas']),
        activityId: activity.id,
        createdBy: 1,
        isActive: true
      }
    ];
    
    for (const proposal of proposals) {
      try {
        await db.insert(activityBudgetProposals).values(proposal);
        console.log(`  ✅ ${proposal.title}: ${proposal.currency} ${proposal.amount}`);
      } catch (error: any) {
        if (error.code !== 'ER_DUP_ENTRY') {
          console.error(`  ❌ Error creating ${proposal.title}:`, error.message);
        }
      }
    }
  }
  
  console.log('🎉 Missing proposals creation completed!');
}

createMissingProposals().catch(console.error);