import { db } from './db.js';
import { sql } from 'drizzle-orm';

async function populateActivitiesAndDestinations() {
  try {
    console.log('🌍 Creating destinations and activities...');

    // 1. First create some destinations
    console.log('📍 Creating destinations...');
    
    await db.execute(sql`
      INSERT IGNORE INTO destinations (id, name, state, country, country_type, region, continent) VALUES
      (1, 'Rio de Janeiro', 'RJ', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'),
      (2, 'São Paulo', 'SP', 'Brasil', 'nacional', 'Sudeste', 'América do Sul'),
      (3, 'Paris', NULL, 'França', 'internacional', 'Europa', 'Europa'),
      (4, 'Londres', NULL, 'Reino Unido', 'internacional', 'Europa', 'Europa'),
      (5, 'Nova York', 'NY', 'Estados Unidos', 'internacional', 'América do Norte', 'América do Norte')
    `);

    console.log('✅ Destinations created');

    // 2. Check if activities table is empty and add some sample data
    const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM activities`);
    const activityCount = (countResult as any)[0][0].count;
    
    console.log(`📊 Current activities count: ${activityCount}`);

    if (activityCount === 0) {
      console.log('🎯 Adding sample activities...');
      
      await db.execute(sql`
        INSERT INTO activities (
          title, description, destination_id, category, price_type, price_amount, 
          duration, difficulty_level, min_participants, max_participants,
          cover_image, average_rating, total_ratings, is_active, created_by_id
        ) VALUES
        (
          'Cristo Redentor Tour',
          'Visit the iconic Christ the Redeemer statue with stunning views of Rio de Janeiro',
          1, 'pontos_turisticos', 'per_person', 120.00,
          '4 horas', 'easy', 1, 15,
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200&h=800&fit=crop&crop=center&q=85',
          4.8, 156, true, 1
        ),
        (
          'Pão de Açúcar Cable Car',
          'Take the famous cable car to Sugar Loaf Mountain for breathtaking panoramic views',
          1, 'adventure', 'per_person', 95.00,
          '3 horas', 'easy', 1, 20,
          'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&h=800&fit=crop&crop=center&q=85',
          4.7, 203, true, 1
        ),
        (
          'Museu do Louvre',
          'Explore the world''s largest art museum and historic monument in Paris',
          3, 'cultural', 'per_person', 89.00,
          '5 horas', 'easy', 1, 25,
          'https://images.unsplash.com/photo-1541950516757-052fbb2c2f9c?w=1200&h=800&fit=crop&crop=center&q=85',
          4.9, 347, true, 1
        ),
        (
          'Tower Bridge Experience',
          'Walk across the famous Tower Bridge glass floor and visit the Victorian engine rooms',
          4, 'pontos_turisticos', 'per_person', 75.00,
          '2 horas', 'easy', 1, 30,
          'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800&fit=crop&crop=center&q=85',
          4.6, 189, true, 1
        ),
        (
          'Central Park Walking Tour',
          'Discover the hidden gems and famous landmarks of Manhattan''s Central Park',
          5, 'hiking', 'per_person', 45.00,
          '3 horas', 'medium', 1, 12,
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop&crop=center&q=85',
          4.5, 98, true, 1
        )
      `);

      console.log('✅ Sample activities added');
    } else {
      console.log('ℹ️ Activities already exist, updating destination relationships...');
      
      // Update existing activities to have proper destination_id
      await db.execute(sql`
        UPDATE activities 
        SET destination_id = 1 
        WHERE destination_id IS NULL OR destination_id = 0
      `);
      
      console.log('✅ Activity destination relationships updated');
    }

    // 3. Verify the data
    const finalCheck = await db.execute(sql`
      SELECT a.id, a.title, a.description, d.name as destination_name 
      FROM activities a 
      JOIN destinations d ON a.destination_id = d.id 
      WHERE a.is_active = true 
      LIMIT 5
    `);
    
    console.log('🔍 Sample activities with destinations:', finalCheck);
    console.log('✅ Activities and destinations populated successfully!');

  } catch (error) {
    console.error('❌ Error populating data:', error);
    throw error;
  }
}

// Run the population
populateActivitiesAndDestinations().catch(console.error);