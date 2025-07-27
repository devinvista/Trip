import { db } from '../db.js';
import { activities, activityBudgetProposals } from '../../shared/schema.js';

// TEMPLATE: Activity Import Script
// Use this template to create new activity import scripts
// Replace the data array with your specific activities

const TEMPLATE_ACTIVITIES = [
  {
    title: "Nome da Atividade",
    description: "Descrição completa e detalhada da atividade, incluindo o que esperar, duração, nível de dificuldade, público-alvo e experiências únicas que a atividade oferece.",
    location: "Cidade, Estado", // Ex: "Rio de Janeiro, RJ" ou "Bonito, MS"
    category: "category_name", // nature, water_sports, adventure, cultural, food_tours, hiking, pontos_turisticos, wildlife
    duration: 4, // Duração em horas
    difficulty: "easy", // easy, medium, hard
    priceRange: "R$ 100 - R$ 500", // Faixa de preço resumida
    coverImage: "https://images.unsplash.com/photo-id?w=800&q=80", // URL da imagem de capa
    proposals: [
      {
        title: "Econômico",
        description: "Descrição da opção econômica",
        price: 100, // Preço numérico
        inclusions: ["Item 1", "Item 2", "Item 3"] // Lista de inclusões
      },
      {
        title: "Completo",
        description: "Descrição da opção completa",
        price: 250,
        inclusions: ["Item 1", "Item 2", "Item 3", "Item 4"]
      },
      {
        title: "Premium",
        description: "Descrição da opção premium",
        price: 500,
        inclusions: ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"]
      }
    ]
  }
];

async function importActivities() {
  console.log('🚀 Iniciando importação de atividades...');
  
  try {
    for (const activityData of TEMPLATE_ACTIVITIES) {
      console.log(`📍 Adicionando atividade: ${activityData.title}`);
      
      // Insert activity
      const [activity] = await db.insert(activities).values({
        title: activityData.title,
        description: activityData.description,
        location: activityData.location,
        category: activityData.category,
        duration: activityData.duration,
        difficulty: activityData.difficulty,
        priceRange: activityData.priceRange,
        coverImage: activityData.coverImage,
        rating: "4.5", // Rating padrão
        reviewCount: 0, // Sem reviews iniciais
        isActive: true,
        createdById: 1 // User tom (admin)
      });
      
      console.log(`✅ Atividade criada com ID: ${activity.insertId}`);
      
      // Add budget proposals
      for (const proposal of activityData.proposals) {
        await db.insert(activityBudgetProposals).values({
          activityId: activity.insertId,
          createdBy: 1, // User tom
          title: proposal.title,
          description: proposal.description,
          amount: proposal.price.toString(), // IMPORTANTE: converter para string
          inclusions: JSON.stringify(proposal.inclusions), // IMPORTANTE: converter para JSON
          exclusions: JSON.stringify([]), // Array vazio como padrão
          votes: Math.floor(Math.random() * 60) + 20, // Votos aleatórios entre 20-80
          isActive: true
        });
        
        console.log(`💰 Proposta "${proposal.title}" criada: R$ ${proposal.price}`);
      }
      
      console.log(`✅ Atividade "${activityData.title}" completamente configurada!\n`);
    }
    
    console.log('🎉 Importação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a importação:', error);
  }
}

// Execute apenas se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  importActivities();
}

export { importActivities, TEMPLATE_ACTIVITIES };