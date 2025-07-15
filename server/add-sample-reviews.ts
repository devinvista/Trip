import { db } from "./db";
import { activityReviews, activities } from "../shared/schema";
import { eq } from "drizzle-orm";

async function addSampleReviews() {
  try {
    console.log('🔄 Adicionando avaliações de exemplo...');

    // Add sample reviews for activity 9 (Cristo Redentor)
    await db.insert(activityReviews).values([
      {
        activityId: 9,
        userId: 2,
        rating: 5,
        review: 'Vista incrível! Recomendo ir de manhã cedo para evitar multidões. O passeio de trem é uma experiência única!',
        photos: [],
        visitDate: new Date('2024-12-15'),
        helpfulVotes: 5,
        isVerified: true
      },
      {
        activityId: 9,
        userId: 3,
        rating: 4,
        review: 'Lugar lindo, mas estava muito cheio quando fui. Vale a pena pela vista panorâmica do Rio.',
        photos: [],
        visitDate: new Date('2024-11-20'),
        helpfulVotes: 2,
        isVerified: false
      }
    ]);

    // Add reviews for activity 11 (Tour pelas Praias)
    await db.insert(activityReviews).values([
      {
        activityId: 11,
        userId: 2,
        rating: 4,
        review: 'Praias lindas em Caraguatatuba! Água cristalina e paisagem deslumbrante. Recomendo!',
        photos: [],
        visitDate: new Date('2024-11-10'),
        helpfulVotes: 3,
        isVerified: true
      },
      {
        activityId: 11,
        userId: 3,
        rating: 5,
        review: 'Tour incrível pelas praias! Guia muito conhecedor da região. Vale cada centavo!',
        photos: [],
        visitDate: new Date('2024-10-25'),
        helpfulVotes: 6,
        isVerified: false
      }
    ]);

    // Update activity average ratings
    await db.update(activities)
      .set({
        averageRating: '4.50',
        totalRatings: 2
      })
      .where(eq(activities.id, 9));

    await db.update(activities)
      .set({
        averageRating: '4.50',
        totalRatings: 2
      })
      .where(eq(activities.id, 11));

    console.log('✅ Avaliações de exemplo adicionadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao adicionar avaliações:', error);
    process.exit(1);
  }
}

addSampleReviews();